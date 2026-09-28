import { publishEvent } from "../events/eventPublisher";
import { db } from "../prisma/db";
import { orderRepository } from "../repositories/orderRepository";
import { OrderStatus } from "../types/orderStatus";

export interface CreateOrderInput {
    customerId: number;
    lineItems: { productId: string; quantity: number; unitPriceCents: number }[];
}

export const orderService = {
    async createOrder(input: CreateOrderInput) {
        const order = await db.transaction(async (tx) => {
            const order = await tx.orm.public.Order.create({
                customerId: input.customerId,
                status: 'Created'
            });

            for (const item of input.lineItems) {
                await tx.orm.public.OrderLineItem.create({
                    orderId: order.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPriceCents: item.unitPriceCents
                });
            }

            return order;
        });

        await publishEvent('order.created', 'OrderCreated', {
            orderId: order.id,
            customerId: order.customerId,
            lineItems: input.lineItems
        });

        return order;
    },

    async updateStatus(id: number, status: OrderStatus) {
        const existing = await orderRepository.getById(id);
        if (!existing) return null;
        if (existing.status === status) return existing;

        const updated = await orderRepository.updateStatus(id, status);

        await publishEvent('order.status-changed', 'OrderStatusChanged', {
            orderId: id,
            previousStatus: existing.status,
            newStatus: status
        });

        return updated;
    }
};