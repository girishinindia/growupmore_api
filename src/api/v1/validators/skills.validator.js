/**
 * ═══════════════════════════════════════════════════════════════
 * SKILLS VALIDATOR — Zod Schemas
 * ═══════════════════════════════════════════════════════════════
 */

const { z } = require('zod');

const createSkillSchema = z.object({
  name: z
    .string()
    .min(2, 'Skill name must be at least 2 characters.')
    .max(100, 'Skill name must not exceed 100 characters.')
    .trim(),
  category: z
    .enum(['technical', 'soft', 'professional', 'other'], {
      errorMap: () => ({ message: 'Category must be one of: technical, soft, professional, other' }),
    }),
  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters.')
    .trim()
    .optional(),
  is_active: z.boolean().default(true),
});

const updateSkillSchema = createSkillSchema.partial();

module.exports = {
  createSkillSchema,
  updateSkillSchema,
};
