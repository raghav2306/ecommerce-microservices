const amqp = require("amqplib");
const {
  sendOrderConfirmation,
  sendOrderCancellation,
  sendOrderShipped,
} = require("../handlers/emailHandler");

const EXCHANGE = "order_events";

async function startConsumer() {
  const conn = await amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost");
  const channel = await conn.createChannel();

  await channel.assertExchange(EXCHANGE, "topic", { durable: true });

  const q = await channel.assertQueue("notification_service_queue", { durable: true });
  await channel.bindQueue(q.queue, EXCHANGE, "order.created");
  await channel.bindQueue(q.queue, EXCHANGE, "order.cancelled");
  await channel.bindQueue(q.queue, EXCHANGE, "order.shipped");

  console.log("Notification Service listening for order events...");

  channel.consume(q.queue, async (msg) => {
    if (!msg) return;

    const event = JSON.parse(msg.content.toString());
    const routingKey = msg.fields.routingKey;

    try {
      if (routingKey === "order.created") await sendOrderConfirmation(event);
      if (routingKey === "order.cancelled") await sendOrderCancellation(event);
      if (routingKey === "order.shipped") await sendOrderShipped(event);
      channel.ack(msg);
    } catch (err) {
      console.error(`Failed to process event ${routingKey}:`, err.message);
      channel.nack(msg, false, true); // requeue on failure
    }
  });
}

module.exports = { startConsumer };
