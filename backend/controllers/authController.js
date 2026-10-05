const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");

function hashCredential(value) {
  return crypto.createHash("sha256").update(value).digest();
}

exports.login = (req, res, next) => {
  const { LIBRARIAN_USERNAME, LIBRARIAN_PASSWORD, JWT_SECRET } = process.env;
  if (!LIBRARIAN_USERNAME || !LIBRARIAN_PASSWORD || !JWT_SECRET) {
    const error = new Error("Authentication is not configured on the server");
    error.statusCode = 500;
    return next(error);
  }

  const { username, password } = req.body || {};
  if (typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "username and password are required" });
  }

  const usernameMatches = crypto.timingSafeEqual(
    hashCredential(username),
    hashCredential(LIBRARIAN_USERNAME)
  );
  const passwordMatches = crypto.timingSafeEqual(
    hashCredential(password),
    hashCredential(LIBRARIAN_PASSWORD)
  );

  if (!usernameMatches || !passwordMatches) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const token = jwt.sign(
    { username: LIBRARIAN_USERNAME, role: "librarian" },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token, tokenType: "Bearer", expiresIn: 3600 });
};
