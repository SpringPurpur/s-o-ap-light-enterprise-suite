import { publishEvent } from "../events/eventPublisher";
import { db } from "../prisma/db";

export interface CreateOrderInput {
    customerId: number;
    lineItems: { productId: string; quantity: number }[];
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
                    quantity: item.quantity
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
    }
};