const amqp = require("amqplib");

const EXCHANGE = "order_events";
let channel = null;

async function connect() {
  const conn = await amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost");
  channel = await conn.createChannel();
  await channel.assertExchange(EXCHANGE, "topic", { durable: true });
  console.log("Order Service connected to RabbitMQ");
}

function publish(routingKey, payload) {
  if (!channel) throw new Error("RabbitMQ channel not initialized");
  channel.publish(EXCHANGE, routingKey, Buffer.from(JSON.stringify(payload)), {
    persistent: true,
  });
  console.log(`Published event: ${routingKey}`, payload);
}

module.exports = { connect, publish };
