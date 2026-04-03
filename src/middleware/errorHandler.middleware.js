/**
 * ═══════════════════════════════════════════════════════════════
 * GLOBAL ERROR HANDLER MIDDLEWARE
 * ═══════════════════════════════════════════════════════════════
 * Catches ALL errors, formats using response.js
 * Must be the LAST middleware in the chain
 * ═══════════════════════════════════════════════════════════════
 */

const { StatusCodes } = require('http-status-codes');
const { AppError } = require('../utils/errors');
const { errorResponse } = require('../utils/response');
const logger = require('../config/logger');
const config = require('../config/index');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  // Default values
  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal server error.';
  let details = err.details || null;

  // ─── Zod Validation Errors ──────────────────────────────
  if (err.name === 'ZodError') {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Validation failed.';
    details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code,
    }));
  }

  // ─── JSON Parse Errors ──────────────────────────────────
  if (err.type === 'entity.parse.failed') {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Invalid JSON in request body.';
  }

  // ─── Payload Too Large ──────────────────────────────────
  if (err.type === 'entity.too.large') {
    statusCode = StatusCodes.REQUEST_TOO_LONG;
    message = 'Request body is too large.';
  }

  // ─── Multer File Upload Errors ──────────────────────────
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = StatusCodes.BAD_REQUEST;
    message = `File size exceeds the ${config.upload.maxFileSizeMB}MB limit.`;
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Unexpected file field.';
  }

  // ─── JWT Errors ─────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Invalid token.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Token has expired.';
  }

  // ─── Supabase / PostgreSQL Errors ───────────────────────
  if (err.code && typeof err.code === 'string' && err.code.length === 5) {
    // PostgreSQL error codes are 5 chars
    statusCode = StatusCodes.BAD_REQUEST;
    if (err.code === '23505') {
      message = 'Duplicate entry. This record already exists.';
    } else if (err.code === '23503') {
      message = 'Referenced record not found.';
    } else if (err.code === '23502') {
      message = 'Required field is missing.';
    } else {
      message = 'Database operation failed.';
    }
  }

  // ─── Log the error ─────────────────────────────────────
  const isOperational = err instanceof AppError && err.isOperational;

  if (!isOperational || statusCode >= 500) {
    logger.error({
      err: {
        name: err.name,
        message: err.message,
        stack: err.stack,
        statusCode,
      },
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userId: req.user?.id,
    });
  } else {
    logger.warn({
      message: err.message,
      statusCode,
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
    });
  }

  // ─── Send response ─────────────────────────────────────
  // In production, don't leak error details for 5xx errors
  if (config.isProd && statusCode >= 500) {
    return errorResponse(res, 'Something went wrong. Please try again later.', statusCode);
  }

  return errorResponse(res, message, statusCode, details);
};

module.exports = errorHandler;
