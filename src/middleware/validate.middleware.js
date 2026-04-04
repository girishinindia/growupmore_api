/**
 * ═══════════════════════════════════════════════════════════════
 * MIDDLEWARE — Zod Validation
 * ═══════════════════════════════════════════════════════════════
 * Validates req.body / req.query / req.params against Zod schema.
 * Returns 422 with structured errors on failure.
 * ═══════════════════════════════════════════════════════════════
 */

const { ValidationError } = require('../utils/errors');

/**
 * @param {import('zod').ZodSchema} schema
 * @param {'body' | 'query' | 'params'} source
 */
const validate = (schema, source = 'body') => {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      return next(new ValidationError('Validation failed', errors));
    }

    // Replace source data with parsed (cleaned) data
    req[source] = result.data;
    next();
  };
};

module.exports = validate;
