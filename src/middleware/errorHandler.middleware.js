/**
 * ═══════════════════════════════════════════════════════════════
 * MIDDLEWARE — Global Error Handler
 * ═══════════════════════════════════════════════════════════════
 */

const { StatusCodes } = require('http-status-codes');
const { AppError } = require('../utils/errors');
const { sendError } = require('../utils/response');
const logger = require('../config/logger');
const config = require('../config');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  // Log the error
  logger.error({
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });

  // Operational error (expected) — send to client
  if (err instanceof AppError) {
    return sendError(res, {
      statusCode: err.statusCode,
      message: err.message,
      details: err.details,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, {
      statusCode: StatusCodes.UNAUTHORIZED,
      message: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, {
      statusCode: StatusCodes.UNAUTHORIZED,
      message: 'Token expired',
    });
  }

  // Zod validation error (if it somehow escapes middleware)
  if (err.name === 'ZodError') {
    return sendError(res, {
      statusCode: StatusCodes.UNPROCESSABLE_ENTITY,
      message: 'Validation failed',
      details: err.issues,
    });
  }

  // Unknown / programming error — hide details in production
  return sendError(res, {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    message: config.isProd ? 'Something went wrong' : err.message,
    details: config.isProd ? null : err.stack,
  });
};

module.exports = errorHandler;
