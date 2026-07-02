const amqp = require("amqplib");
const Product = require("../models/Product");

const EXCHANGE = "order_events";

async function startConsumer() {
  const conn = await amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost");
  const channel = await conn.createChannel();

  await channel.assertExchange(EXCHANGE, "topic", { durable: true });

  const q = await channel.assertQueue("product_service_queue", { durable: true });
  await channel.bindQueue(q.queue, EXCHANGE, "order.created");
  await channel.bindQueue(q.queue, EXCHANGE, "order.cancelled");

  console.log("Product Service listening for order events...");

  channel.consume(q.queue, async (msg) => {
    if (!msg) return;

    const event = JSON.parse(msg.content.toString());
    const routingKey = msg.fields.routingKey;

    if (routingKey === "order.created") {
      for (const item of event.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
        console.log(`Decremented stock for product ${item.productId} by ${item.quantity}`);
      }
    }

    if (routingKey === "order.cancelled") {
      for (const item of event.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
        console.log(`Restored stock for product ${item.productId} by ${item.quantity}`);
      }
    }

    channel.ack(msg);
  });
}

module.exports = { startConsumer };
