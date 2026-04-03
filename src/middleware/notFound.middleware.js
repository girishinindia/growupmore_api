/**
 * 404 — Route Not Found Middleware
 * Catches requests to undefined routes
 */

const { NotFoundError } = require('../utils/errors');

const notFound = (req, _res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl}`));
};

module.exports = notFound;
