/**
 * ═══════════════════════════════════════════════════════════════
 * STATES VALIDATOR — Zod Schemas
 * ═══════════════════════════════════════════════════════════════
 */

const { z } = require('zod');

const createStateSchema = z.object({
  country_id: z
    .number()
    .int('Country ID must be an integer.')
    .positive('Country ID must be positive.'),
  name: z
    .string()
    .min(2, 'State name must be at least 2 characters.')
    .max(100, 'State name must not exceed 100 characters.')
    .trim(),
  is_active: z.boolean().default(true),
});

const updateStateSchema = createStateSchema.partial();

module.exports = {
  createStateSchema,
  updateStateSchema,
};
