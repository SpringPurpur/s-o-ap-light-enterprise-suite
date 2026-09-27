import amqp, { Channel, ChannelModel } from "amqplib";
import { randomUUID } from "node:crypto";

let connection: ChannelModel;
let channel: Channel;

const EXCHANGE = 'enterprise.events';
const RABBITMQ_URL = process.env.RABBITMQ_URL ?? 'amqp://enterprise:enterprise_dev_pw@localhost:5672';

export async function connectPublisher() {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
}

export async function publishEvent(routingKey: string, eventType: string, payload: object) {
    if (!channel) {
        await connectPublisher();
    }
    const message = {
        eventId: randomUUID(),
        eventType,
        occurredAt: new Date().toISOString(),
        payload
    };

    channel.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(message)));
}