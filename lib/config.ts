export const isOTPEnabled = (): boolean => {
  return process.env.ENABLE_OTP === 'true';
};

export const RabbitMQConfig = {
  embedText: {
    exchangeName: "ingest_exchange",
    routingKey: "ingest.embed.text",
    queueName: "embed_text_queue"
  },
  embedPDF: {
    exchangeName: "ingest_exchange",
    routingKey: "ingest.embed.pdf",
    queueName: "embed_pdf_queue"
  },

}

export const rabbitMQConnectionURL = (): string => {
  return `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`;
}