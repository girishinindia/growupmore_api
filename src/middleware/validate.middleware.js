/**
 * ═══════════════════════════════════════════════════════════════
 * VALIDATION MIDDLEWARE (Zod)
 * ═══════════════════════════════════════════════════════════════
 * Generic middleware that takes a Zod schema and validates req.body,
 * req.query, or req.params. Returns formatted errors.
 *
 * Usage:
 *   router.post('/', validate(createUserSchema), controller.create);
 *   router.get('/', validate(listQuerySchema, 'query'), controller.list);
 * ═══════════════════════════════════════════════════════════════
 */

const { ValidationError } = require('../utils/errors');

/**
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {string} source - 'body' | 'query' | 'params' (default: 'body')
 */
const validate = (schema, source = 'body') => {
  return (req, _res, next) => {
    try {
      const result = schema.parse(req[source]);
      // Replace the source with parsed (and potentially transformed) data
      req[source] = result;
      next();
    } catch (err) {
      if (err.errors) {
        const details = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code,
        }));
        return next(new ValidationError('Validation failed.', details));
      }
      next(err);
    }
  };
};

module.exports = validate;
