/**
 * Request Logger Middleware
 * Morgan + Winston combo for HTTP request logging
 */

const morgan = require('morgan');
const logger = require('../config/logger');

// Custom Morgan token for request ID
morgan.token('request-id', (req) => req.id || '-');
morgan.token('user-id', (req) => (req.user ? req.user.id : 'anonymous'));

// Custom format: [requestId] method url status responseTime userId
const format = ':request-id :method :url :status :response-time ms - :user-id';

const requestLogger = morgan(format, {
  stream: logger.stream,
  skip: (req) => {
    // Skip health check logs in production
    return req.url === '/api/health' || req.url === '/favicon.ico';
  },
});

module.exports = requestLogger;
