const { userClient } = require("../clients/grpcClients");

function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  userClient.ValidateToken({ token }, (err, response) => {
    if (err || !response.valid) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.user = { userId: response.userId, email: response.email };
    next();
  });
}

module.exports = { authenticate };
