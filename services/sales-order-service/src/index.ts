import 'dotenv/config';
import express from 'express';
import { orderRoutes } from './routes/orderRoutes';
import { customerRoutes } from './routes/customerRoutes';
import { closePublisher, connectPublisher } from './events/eventPublisher';
import { db } from './prisma/db';

const app = express();
app.use(express.json());

app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);

const PORT = Number(process.env.PORT ?? 3000);

async function start() {
    await connectPublisher();
    const server = app.listen(PORT, (err?: Error) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(`Sales service listening on port ${PORT}`)
    });

    async function shutdown() {
        server.close();
        await closePublisher();
        await db.close();
        process.exit(0);
    }
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}

start().catch((err) => {
    console.log(err);
    process.exit(1);
});