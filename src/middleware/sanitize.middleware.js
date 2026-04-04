/**
 * ═══════════════════════════════════════════════════════════════
 * MIDDLEWARE — Input Sanitization (XSS Cleanup)
 * ═══════════════════════════════════════════════════════════════
 */

const sanitizeHtml = require('sanitize-html');

/**
 * Recursively sanitize all string values in an object
 */
const sanitizeObject = (obj) => {
  if (typeof obj === 'string') {
    return sanitizeHtml(obj, {
      allowedTags: [],
      allowedAttributes: {},
    }).trim();
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
};

const sanitize = (req, _res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
};

module.exports = sanitize;
