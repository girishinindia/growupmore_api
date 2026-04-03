/**
 * ═══════════════════════════════════════════════════════════════
 * STANDARDIZED API RESPONSES
 * ═══════════════════════════════════════════════════════════════
 * Every controller uses these. Consistent format for React,
 * Flutter, and any future client.
 *
 * Success: { success: true, statusCode, message, data, meta }
 * Error:   { success: false, statusCode, message, error, details }
 * ═══════════════════════════════════════════════════════════════
 */

const { StatusCodes } = require('http-status-codes');

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {*} data - Response payload
 * @param {string} message - Human-readable message
 * @param {number} statusCode - HTTP status code (default 200)
 * @param {Object} meta - Pagination/extra metadata
 */
const successResponse = (res, data = null, message = 'Success', statusCode = StatusCodes.OK, meta = null) => {
  const response = {
    success: true,
    statusCode,
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
const createdResponse = (res, data = null, message = 'Created successfully') => {
  return successResponse(res, data, message, StatusCodes.CREATED);
};

/**
 * Send a paginated response with meta
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {number} totalCount - Total matching records
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {string} message - Human-readable message
 */
const paginatedResponse = (res, data = [], totalCount = 0, page = 1, limit = 20, message = 'Success') => {
  const totalPages = Math.ceil(totalCount / limit);

  return successResponse(res, data, message, StatusCodes.OK, {
    pagination: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalRecords: totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {*} details - Validation errors or additional info
 */
const errorResponse = (res, message = 'Something went wrong.', statusCode = StatusCodes.INTERNAL_SERVER_ERROR, details = null) => {
  const response = {
    success: false,
    statusCode,
    message,
    error: message,
  };

  if (details) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send a no-content response (204)
 */
const noContentResponse = (res) => {
  return res.status(StatusCodes.NO_CONTENT).send();
};

module.exports = {
  successResponse,
  createdResponse,
  paginatedResponse,
  errorResponse,
  noContentResponse,
};
