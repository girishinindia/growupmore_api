/**
 * ═══════════════════════════════════════════════════════════════
 * RESPONSE — Standardised API Response Helpers
 * ═══════════════════════════════════════════════════════════════
 * Every API response follows:
 * { success: Boolean, message: String, data: Any, meta?: Object }
 * ═══════════════════════════════════════════════════════════════
 */

const { StatusCodes } = require('http-status-codes');

/**
 * Send a success response
 */
const sendSuccess = (res, { statusCode = StatusCodes.OK, message = 'Success', data = null, meta = null } = {}) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send a created response (201)
 */
const sendCreated = (res, { message = 'Created successfully', data = null } = {}) => {
  return sendSuccess(res, { statusCode: StatusCodes.CREATED, message, data });
};

/**
 * Send an error response
 */
const sendError = (res, { statusCode = StatusCodes.INTERNAL_SERVER_ERROR, message = 'Something went wrong', details = null } = {}) => {
  const response = {
    success: false,
    message,
  };

  if (details) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendCreated,
  sendError,
};
