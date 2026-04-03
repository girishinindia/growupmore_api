/**
 * ═══════════════════════════════════════════════════════════════
 * EDUCATION-LEVELS VALIDATOR — Zod Schemas
 * ═══════════════════════════════════════════════════════════════
 */

const { z } = require('zod');

const createEducationLevelSchema = z.object({
  name: z
    .string()
    .min(2, 'Education level name must be at least 2 characters.')
    .max(100, 'Education level name must not exceed 100 characters.')
    .trim(),
  level_order: z
    .number()
    .int('Level order must be an integer.')
    .positive('Level order must be positive.'),
  level_category: z
    .string()
    .min(1, 'Level category is required.')
    .max(50, 'Level category must not exceed 50 characters.')
    .trim(),
  is_active: z.boolean().default(true),
});

const updateEducationLevelSchema = createEducationLevelSchema.partial();

module.exports = {
  createEducationLevelSchema,
  updateEducationLevelSchema,
};
