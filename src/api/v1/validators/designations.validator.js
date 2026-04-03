/**
 * ═══════════════════════════════════════════════════════════════
 * DESIGNATIONS VALIDATOR — Zod Schemas
 * ═══════════════════════════════════════════════════════════════
 */

const { z } = require('zod');

const createDesignationSchema = z.object({
  name: z
    .string()
    .min(2, 'Designation name must be at least 2 characters.')
    .max(100, 'Designation name must not exceed 100 characters.')
    .trim(),
  level: z
    .string()
    .min(1, 'Level is required.')
    .max(50, 'Level must not exceed 50 characters.')
    .trim(),
  level_band: z
    .string()
    .min(1, 'Level band is required.')
    .max(50, 'Level band must not exceed 50 characters.')
    .trim(),
  is_active: z.boolean().default(true),
});

const updateDesignationSchema = createDesignationSchema.partial();

module.exports = {
  createDesignationSchema,
  updateDesignationSchema,
};
