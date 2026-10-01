import { db } from "../prisma/db.js"
import type { Models } from "../prisma/contract.js";

export const orderRepository = {
    async getAll() {
        return db.orm.public.Order.include('lineItems').all();
    },

    async getById(id: number) {
        return db.orm.public.Order
            .where({ id })
            .include('lineItems')
            .first();
    },
    
    async updateStatus(id: number, status: Models.public_Order['status']) {
        return db.orm.public.Order.where({ id }).update({ status });
    }
}