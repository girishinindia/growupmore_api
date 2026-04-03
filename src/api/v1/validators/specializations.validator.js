/**
 * ═══════════════════════════════════════════════════════════════
 * SPECIALIZATIONS VALIDATOR — Zod Schemas
 * ═══════════════════════════════════════════════════════════════
 */

const { z } = require('zod');

const createSpecializationSchema = z.object({
  name: z
    .string()
    .min(2, 'Specialization name must be at least 2 characters.')
    .max(100, 'Specialization name must not exceed 100 characters.')
    .trim(),
  category: z
    .enum(['engineering', 'management', 'healthcare', 'finance', 'education', 'other'], {
      errorMap: () => ({ message: 'Category must be one of: engineering, management, healthcare, finance, education, other' }),
    }),
  is_active: z.boolean().default(true),
});

const updateSpecializationSchema = createSpecializationSchema.partial();

module.exports = {
  createSpecializationSchema,
  updateSpecializationSchema,
};
