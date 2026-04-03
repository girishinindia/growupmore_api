/**
 * Request ID Middleware
 * Attaches a unique UUID to every incoming request.
 * Used for: logging, error tracking, debugging
 */

const { v4: uuidv4 } = require('uuid');

const requestId = (req, _res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  next();
};

module.exports = requestId;
