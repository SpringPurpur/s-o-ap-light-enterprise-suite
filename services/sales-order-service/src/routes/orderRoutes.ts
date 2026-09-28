import { Router } from "express";
import { OrderStatus } from "../types/orderStatus";
import { orderRepository } from "../repositories/orderRepository";
import { customerRepository } from "../repositories/customerRepository";
import { orderService } from "../services/orderService";

export const orderRoutes = Router();

const ORDER_STATUSES: OrderStatus[] = ['Created', 'Fulfilled', 'Cancelled'];

orderRoutes.get('/', async (_req, res) => {
    res.json(await orderRepository.getAll());
});

orderRoutes.get('/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        res.status(400).json({ error: 'Invalid order id' });
        return;
    }
    const order = await orderRepository.getById(id);
    if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
    }
    res.json(order);
});

orderRoutes.post('/', async (req, res) => {
    const { customerId, lineItems } = req.body ?? {};

    if (!Number.isInteger(customerId)) {
        res.status(400).json({ error: 'Customer id must be an integer' });
        return;
    }

    if (!Array.isArray(lineItems) || lineItems.length === 0) {
        res.status(400).json({ error: 'Line items must be a non-empty array' });
        return;
    }
    const validItems = lineItems.every(
        (i) => typeof i?.productId === 'string' && Number.isInteger(i?.quantity) && i.quantity > 0
    );
    if (!validItems) {
        res.status(400).json({ error: 'Each line item needs a product id (string) and a positive integer quantity' });
        return;
    }

    const customer = await customerRepository.getById(customerId);
    if (!customer) {
        res.status(400).json({ error: `Customer ${customerId} does not exist` });
        return;
    }

    const order = await orderService.createOrder({ customerId, lineItems });
    res.status(201).json(order);
});

orderRoutes.patch('/:id/status', async (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body ?? {};

    if (!Number.isInteger(id)) {
        res.status(400).json({ error: 'Invalid order id' });
        return;
    }
    if (!ORDER_STATUSES.includes(status)) {
        res.status(400).json({ error: `Status must be one of: ${ORDER_STATUSES.join(', ')}`});
        return;
    }
    const updated = await orderRepository.updateStatus(id, status);
    res.json(updated);
});