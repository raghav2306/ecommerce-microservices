const express = require("express");
const { orderClient, productClient } = require("../clients/grpcClients");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.post("/", authenticate, (req, res) => {
  const { items } = req.body;

  // Check stock for all items before creating order
  const stockChecks = items.map(
    (item) =>
      new Promise((resolve, reject) => {
        productClient.CheckStock(
          { productId: item.productId, quantity: item.quantity },
          (err, response) => {
            if (err) return reject(err);
            if (!response.available)
              return reject(new Error(`Insufficient stock for product ${item.productId}`));
            resolve(response);
          }
        );
      })
  );

  Promise.all(stockChecks)
    .then(() => {
      orderClient.CreateOrder(
        { userId: req.user.userId, items },
        (err, response) => {
          if (err) return res.status(400).json({ error: err.message });
          res.status(201).json(response);
        }
      );
    })
    .catch((err) => res.status(400).json({ error: err.message }));
});

router.get("/", authenticate, (req, res) => {
  orderClient.ListUserOrders({ userId: req.user.userId }, (err, response) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(response.orders);
  });
});

router.get("/:id", authenticate, (req, res) => {
  orderClient.GetOrder({ orderId: req.params.id }, (err, response) => {
    if (err) return res.status(404).json({ error: err.message });
    res.json(response);
  });
});

router.delete("/:id", authenticate, (req, res) => {
  orderClient.CancelOrder(
    { orderId: req.params.id, userId: req.user.userId },
    (err, response) => {
      if (err) return res.status(400).json({ error: err.message });
      res.json(response);
    }
  );
});

module.exports = router;
