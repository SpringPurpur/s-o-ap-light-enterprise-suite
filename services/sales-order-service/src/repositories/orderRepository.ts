import { db } from "../prisma/db"
import type { Models } from "../prisma/contract";

export const orderRepository = {
    async getAll() {
        return db.orm.public.Order.all();
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