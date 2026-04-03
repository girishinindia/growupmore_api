/**
 * ═══════════════════════════════════════════════════════════════
 * LEARNING-GOALS VALIDATOR — Zod Schemas
 * ═══════════════════════════════════════════════════════════════
 */

const { z } = require('zod');

const createLearningGoalSchema = z.object({
  name: z
    .string()
    .min(2, 'Learning goal name must be at least 2 characters.')
    .max(100, 'Learning goal name must not exceed 100 characters.')
    .trim(),
  display_order: z
    .number()
    .int('Display order must be an integer.')
    .nonnegative('Display order must be non-negative.')
    .default(0),
  is_active: z.boolean().default(true),
});

const updateLearningGoalSchema = createLearningGoalSchema.partial();

module.exports = {
  createLearningGoalSchema,
  updateLearningGoalSchema,
};
