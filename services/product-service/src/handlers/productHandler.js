const Product = require("../models/Product");

async function CreateProduct(call, callback) {
  try {
    const { name, description, price, stock } = call.request;
    const product = await Product.create({ name, description, price, stock });
    callback(null, {
      id: product._id.toString(),
      name: product.name,
      price: product.price,
      stock: product.stock,
    });
  } catch (err) {
    callback({ code: 13, message: err.message });
  }
}

async function GetProduct(call, callback) {
  try {
    const product = await Product.findById(call.request.productId);
    if (!product) return callback({ code: 5, message: "Product not found" });
    callback(null, {
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
    });
  } catch (err) {
    callback({ code: 13, message: err.message });
  }
}

async function ListProducts(call, callback) {
  try {
    const products = await Product.find();
    callback(null, {
      products: products.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
      })),
    });
  } catch (err) {
    callback({ code: 13, message: err.message });
  }
}

async function CheckStock(call, callback) {
  try {
    const { productId, quantity } = call.request;
    const product = await Product.findById(productId);
    if (!product) return callback({ code: 5, message: "Product not found" });
    callback(null, {
      available: product.stock >= quantity,
      currentStock: product.stock,
    });
  } catch (err) {
    callback({ code: 13, message: err.message });
  }
}

async function DecrementStock(call, callback) {
  try {
    const { productId, quantity } = call.request;
    const product = await Product.findById(productId);
    if (!product || product.stock < quantity) {
      return callback({ code: 9, message: "Insufficient stock" });
    }
    product.stock -= quantity;
    await product.save();
    callback(null, { success: true, remainingStock: product.stock });
  } catch (err) {
    callback({ code: 13, message: err.message });
  }
}

module.exports = { CreateProduct, GetProduct, ListProducts, CheckStock, DecrementStock };
