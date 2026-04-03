/**
 * ═══════════════════════════════════════════════════════════════
 * CUSTOM ERROR CLASSES
 * ═══════════════════════════════════════════════════════════════
 * All errors extend AppError. The global errorHandler middleware
 * catches these and formats them using response.js
 * ═══════════════════════════════════════════════════════════════
 */

const { StatusCodes, ReasonPhrases } = require('http-status-codes');

/**
 * Base application error — all custom errors extend this
 */
class AppError extends Error {
  constructor(message, statusCode = StatusCodes.INTERNAL_SERVER_ERROR, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // Distinguishes from programmer errors
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 — Bad Request / Validation Error
 */
class ValidationError extends AppError {
  constructor(message = 'Validation failed.', details = null) {
    super(message, StatusCodes.BAD_REQUEST, details);
  }
}

/**
 * 401 — Authentication Required
 */
class AuthenticationError extends AppError {
  constructor(message = 'Authentication required.') {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}

/**
 * 403 — Forbidden / Insufficient Permissions
 */
class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action.') {
    super(message, StatusCodes.FORBIDDEN);
  }
}

/**
 * 404 — Resource Not Found
 */
class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found.`, StatusCodes.NOT_FOUND);
    this.resource = resource;
  }
}

/**
 * 409 — Conflict / Duplicate Entry
 */
class ConflictError extends AppError {
  constructor(message = 'Resource already exists.') {
    super(message, StatusCodes.CONFLICT);
  }
}

/**
 * 429 — Too Many Requests
 */
class RateLimitError extends AppError {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message, StatusCodes.TOO_MANY_REQUESTS);
  }
}

/**
 * 422 — Unprocessable Entity (valid syntax, invalid semantics)
 */
class UnprocessableError extends AppError {
  constructor(message = 'Unable to process the request.', details = null) {
    super(message, StatusCodes.UNPROCESSABLE_ENTITY, details);
  }
}

/**
 * 503 — Service Unavailable (external service down)
 */
class ServiceUnavailableError extends AppError {
  constructor(service = 'External service') {
    super(`${service} is currently unavailable. Please try again later.`, StatusCodes.SERVICE_UNAVAILABLE);
    this.service = service;
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  UnprocessableError,
  ServiceUnavailableError,
};
