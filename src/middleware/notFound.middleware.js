/**
 * ═══════════════════════════════════════════════════════════════
 * MIDDLEWARE — 404 Not Found Handler
 * ═══════════════════════════════════════════════════════════════
 */

const { NotFoundError } = require('../utils/errors');

const notFound = (req, _res, next) => {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
};

module.exports = notFound;
