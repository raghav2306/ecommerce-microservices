require("dotenv").config();
const { startConsumer } = require("./rabbitmq/consumer");

async function main() {
  await startConsumer();
  console.log("Notification Service started");
}

main().catch(console.error);
