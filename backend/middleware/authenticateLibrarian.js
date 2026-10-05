const jwt = require("jsonwebtoken");

module.exports = function authenticateLibrarian(req, res, next) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const error = new Error("Authentication is not configured on the server");
    error.statusCode = 500;
    return next(error);
  }

  const authorization = req.get("authorization");
  const match = authorization && authorization.match(/^Bearer\s+(\S+)$/i);
  if (!match) {
    return res.status(401).json({ error: "Bearer token is required" });
  }

  try {
    const payload = jwt.verify(match[1], secret);
    if (!payload || typeof payload !== "object" || payload.role !== "librarian") {
      return res.status(403).json({ error: "Librarian access is required" });
    }

    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    next(error);
  }
};
