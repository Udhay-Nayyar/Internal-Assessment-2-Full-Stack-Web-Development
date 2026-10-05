module.exports = function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  console.error(err);

  let status = err.statusCode || err.status || 500;
  let message = status >= 500 ? "Internal server error" : err.message;

  if (err.name === "ValidationError" || err.name === "CastError" || err.type === "entity.parse.failed") {
    status = 400;
    message = err.message;
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || {})[0];
    message = field ? `${field} already exists` : "A record with this value already exists";
  }

  res.status(status).json({ error: message });
};
