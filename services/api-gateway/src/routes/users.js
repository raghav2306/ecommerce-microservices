const express = require("express");
const { userClient } = require("../clients/grpcClients");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  userClient.Register({ name, email, password }, (err, response) => {
    if (err) return res.status(400).json({ error: err.message });
    res.status(201).json(response);
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  userClient.Login({ email, password }, (err, response) => {
    if (err) return res.status(401).json({ error: err.message });
    res.json(response);
  });
});

router.get("/me", authenticate, (req, res) => {
  userClient.GetUser({ userId: req.user.userId }, (err, response) => {
    if (err) return res.status(404).json({ error: err.message });
    res.json(response);
  });
});

module.exports = router;
