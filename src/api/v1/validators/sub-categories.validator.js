/**
 * ═══════════════════════════════════════════════════════════════
 * SUB-CATEGORIES VALIDATOR — Zod Schemas
 * ═══════════════════════════════════════════════════════════════
 */

const { z } = require('zod');

const createSubCategorySchema = z.object({
  category_id: z
    .number()
    .int('Category ID must be an integer.')
    .positive('Category ID must be positive.'),
  name: z
    .string()
    .min(2, 'Sub-category name must be at least 2 characters.')
    .max(100, 'Sub-category name must not exceed 100 characters.')
    .trim(),
  code: z
    .string()
    .min(1, 'Code is required.')
    .max(50, 'Code must not exceed 50 characters.')
    .trim(),
  slug: z
    .string()
    .min(1, 'Slug is required.')
    .max(100, 'Slug must not exceed 100 characters.')
    .trim(),
  display_order: z
    .number()
    .int('Display order must be an integer.')
    .nonnegative('Display order must be non-negative.')
    .default(0),
  is_active: z.boolean().default(true),
});

const updateSubCategorySchema = createSubCategorySchema.partial();

module.exports = {
  createSubCategorySchema,
  updateSubCategorySchema,
};
