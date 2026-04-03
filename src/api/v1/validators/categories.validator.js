/**
 * ═══════════════════════════════════════════════════════════════
 * CATEGORIES VALIDATOR — Zod Schemas
 * ═══════════════════════════════════════════════════════════════
 */

const { z } = require('zod');
const { createSlug } = require('../../../utils/helpers');

const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, 'Category name must be at least 2 characters.')
    .max(100, 'Category name must not exceed 100 characters.')
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

const updateCategorySchema = createCategorySchema.partial();

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};
