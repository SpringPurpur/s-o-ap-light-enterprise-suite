import { Router } from "express";
import { customerRepository } from "../repositories/customerRepository.js";

export const customerRoutes = Router();

customerRoutes.get('/', async (_req, res) => {
    res.json(await customerRepository.getAll());
});

customerRoutes.get('/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        res.status(400).json({ error: 'Invalid customer id' });
        return;
    }
    const customer = await customerRepository.getById(id);
    if (!customer) {
        res.status(404).json({ error: 'Customer not found' });
        return;
    }
    res.json(customer);
});

customerRoutes.post('/', async (req, res) => {
    const { name, contactInfo } = req.body ?? {};
    if (typeof name !== 'string' || name.trim() === '') {
        res.status(400).json({ error: 'Name is required' });
        return;
    }
    const customer = await customerRepository.create(name, contactInfo);
    res.status(201).json(customer);
})