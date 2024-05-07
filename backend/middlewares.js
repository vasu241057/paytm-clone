const jwt = require("jsonwebtoken");

const authMiddleWares = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.createError(401, "Unauthorized");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: "forbidden" });
  }
};

module.exports = {
  authMiddleWares,
};
