const Order = require("../models/Order");
const { publish } = require("../rabbitmq/publisher");

async function CreateOrder(call, callback) {
  try {
    const { userId, items } = call.request;
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({ userId, items, totalAmount, status: "pending" });

    publish("order.created", {
      orderId: order._id.toString(),
      userId,
      items,
      totalAmount,
    });

    callback(null, {
      orderId: order._id.toString(),
      status: order.status,
      totalAmount: order.totalAmount,
    });
  } catch (err) {
    callback({ code: 13, message: err.message });
  }
}

async function GetOrder(call, callback) {
  try {
    const order = await Order.findById(call.request.orderId);
    if (!order) return callback({ code: 5, message: "Order not found" });
    callback(null, {
      orderId: order._id.toString(),
      userId: order.userId,
      items: order.items,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt.toISOString(),
    });
  } catch (err) {
    callback({ code: 13, message: err.message });
  }
}

async function ListUserOrders(call, callback) {
  try {
    const orders = await Order.find({ userId: call.request.userId });
    callback(null, {
      orders: orders.map((o) => ({
        orderId: o._id.toString(),
        userId: o.userId,
        items: o.items,
        status: o.status,
        totalAmount: o.totalAmount,
        createdAt: o.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    callback({ code: 13, message: err.message });
  }
}

async function CancelOrder(call, callback) {
  try {
    const { orderId, userId } = call.request;
    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) return callback({ code: 5, message: "Order not found" });
    if (order.status === "cancelled") {
      return callback({ code: 9, message: "Order already cancelled" });
    }
    if (["shipped", "delivered"].includes(order.status)) {
      return callback({ code: 9, message: "Cannot cancel order in current status" });
    }

    order.status = "cancelled";
    await order.save();

    publish("order.cancelled", {
      orderId: order._id.toString(),
      userId,
      items: order.items,
    });

    callback(null, { success: true, message: "Order cancelled successfully" });
  } catch (err) {
    callback({ code: 13, message: err.message });
  }
}

async function UpdateOrderStatus(call, callback) {
  try {
    const { orderId, status } = call.request;
    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) return callback({ code: 5, message: "Order not found" });

    if (status === "shipped") {
      publish("order.shipped", {
        orderId: order._id.toString(),
        userId: order.userId,
        items: order.items,
      });
    }

    callback(null, { success: true, status: order.status });
  } catch (err) {
    callback({ code: 13, message: err.message });
  }
}

module.exports = { CreateOrder, GetOrder, ListUserOrders, CancelOrder, UpdateOrderStatus };
