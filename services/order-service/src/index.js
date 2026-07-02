require("dotenv").config();
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const mongoose = require("mongoose");
const path = require("path");
const handlers = require("./handlers/orderHandler");
const { connect: connectRabbitMQ } = require("./rabbitmq/publisher");

const PROTO_PATH = path.join(__dirname, "../../../proto/order.proto");

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const orderProto = grpc.loadPackageDefinition(packageDef).order;

async function main() {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/orders");
  console.log("Connected to MongoDB");

  await connectRabbitMQ();

  const server = new grpc.Server();
  server.addService(orderProto.OrderService.service, handlers);

  const PORT = process.env.GRPC_PORT || 50053;
  server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`Order Service gRPC running on port ${PORT}`);
  });
}

main().catch(console.error);
