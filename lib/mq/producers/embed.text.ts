import { Channel } from "amqplib";
import { RabbitMQ } from "@/lib/mq/rabbitmq.connection";
import { RabbitMQConfig } from "@/lib/config";
import { config } from "dotenv";
config();


export async function publishEmbedTextFile(fileObjectKey: string): Promise<void> {
    const ingestExchange = RabbitMQConfig.embedText.exchangeName;
    const textEmbedQueue = RabbitMQConfig.embedText.queueName;

    const routingKey = RabbitMQConfig.embedText.routingKey;

    try {
        let channel: Channel;
        channel = await RabbitMQ.getInstance().getChannel();
        await channel.assertExchange(ingestExchange, 'topic', { durable: true });

        await channel.assertQueue(textEmbedQueue, {
            durable: true,
            // deadLetterExchange: 'dlx_exchange',
            // messageTtl: 60000 // TTL of 60 seconds for the queue
            maxPriority: 10 // Set the maximum priority for the queue
        });

        await channel.bindQueue(textEmbedQueue, ingestExchange, routingKey);

        // Publish the message with a per-message TTL of 60 seconds
        channel.publish(ingestExchange, routingKey, Buffer.from(JSON.stringify({ fileObjectKey })), {
            // expiration: '60000', // TTL of 60 seconds for message
            // priority: 10 // Set the priority of the message
        });
        console.log(`Published message to embed text file: ${fileObjectKey}`);

    } catch (error) {
        console.log('Error sending message', error);
    }
}