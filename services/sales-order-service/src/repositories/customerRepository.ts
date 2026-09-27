import { db } from "../prisma/db"

export const customerRepository = {
    async getAll() {
        return db.orm.public.Customer.all();
    },

    async getById(id: number) {
        return db.orm.public.Customer.first({ id });
    },

    async create(name: string, contactInfo?: string) {
        return db.orm.public.Customer.create({ name, contactInfo });
    }
}