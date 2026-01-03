import amqp, { Channel, Connection } from "amqplib";
import { rabbitMQConnectionURL } from "../config";
import { config } from "dotenv";
config();

export class RabbitMQ {
    private static instance: RabbitMQ;

    private connection: Connection | null = null;
    private channel: Channel | null = null;

    // Private constructor ensures it can't be instantiated outside
    private constructor() { }

    // Get the singleton instance
    public static getInstance(): RabbitMQ {
        if (!RabbitMQ.instance) {
            RabbitMQ.instance = new RabbitMQ();
        }
        return RabbitMQ.instance;
    }

    // Connect to RabbitMQ
    public async connect(): Promise<{ connection: Connection; channel: Channel }> {
        if (this.connection && this.channel) {
            console.log("Already connected to RabbitMQ");
            return { connection: this.connection, channel: this.channel };
        }

        try {
            this.connection = await amqp.connect(rabbitMQConnectionURL());
            this.channel = await this.connection.createChannel();
            console.log("Connected to RabbitMQ successfully");

            return { connection: this.connection, channel: this.channel };
        } catch (error) {
            console.error("Failed to connect to RabbitMQ:", error);
            process.exit(1);
        }

        throw new Error("Unreachable: failed to connect to RabbitMQ");
    }

    // Get the channel
    public async getChannel(): Promise<Channel> {
        if (!this.channel) {
            await this.connect();
        }
        return this.channel!;
    }

    // Close connection
    public async close(): Promise<void> {
        try {
            if (this.channel) {
                await this.channel.close();
                this.channel = null;
                console.log("RabbitMQ channel closed");
            }
            if (this.connection) {
                await this.connection.close();
                this.connection = null;
                console.log("RabbitMQ connection closed");
            }
        } catch (error) {
            console.error("Error closing RabbitMQ connection:", error);
        }
    }
}

// Handle process shutdown
process.on("SIGINT", async () => {
    await RabbitMQ.getInstance().close();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    await RabbitMQ.getInstance().close();
    process.exit(0);
});

export default RabbitMQ;
