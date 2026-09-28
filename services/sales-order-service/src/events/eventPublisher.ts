import amqp, { ChannelModel, ConfirmChannel } from "amqplib";
import { randomUUID } from "node:crypto";

let connection: ChannelModel | undefined;
let channel: ConfirmChannel | undefined;
let connecting: Promise<void> | undefined;

const EXCHANGE = 'enterprise.events';
const RABBITMQ_URL = process.env.RABBITMQ_URL ?? 'amqp://enterprise:enterprise_dev_pw@localhost:5672';

export async function connectPublisher(): Promise<void> {
    connecting ??= (async () => {
        connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createConfirmChannel();
        await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    })().catch((err) => {
        connecting = undefined;
        throw err;
    });
    return connecting;
}

export async function publishEvent(routingKey: string, eventType: string, payload: object) {
    await connectPublisher();

    const message = {
        eventId: randomUUID(),
        eventType,
        occurredAt: new Date().toISOString(),
        payload
    };

    channel!.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(message)));
    await channel!.waitForConfirms();
}

export async function closePublisher() {
    await channel?.close();
    await connection?.close();
    channel = undefined;
    connection = undefined;
    connecting = undefined;
}