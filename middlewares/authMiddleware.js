const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    req.user = {};
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(500).send({ message: "Access forbidden" });
    }
    jwt.verify(token, "jwtsecrettoken", (err, decoded) => {
      if (err) {
        return res.status(400).send({ message: "Access forbidden" });
      }
      req.user.id = decoded.userId;
      req.user.email = decoded.email;
      next();
    });
  } catch (err) {
    res.status(500).send({ message: "Something went wrong" });
  }
};

module.exports = { authMiddleware };
