/**
 * ═══════════════════════════════════════════════════════════════
 * CITIES VALIDATOR — Zod Schemas
 * ═══════════════════════════════════════════════════════════════
 */

const { z } = require('zod');

const createCitySchema = z.object({
  state_id: z
    .number()
    .int('State ID must be an integer.')
    .positive('State ID must be positive.'),
  name: z
    .string()
    .min(2, 'City name must be at least 2 characters.')
    .max(100, 'City name must not exceed 100 characters.')
    .trim(),
  is_active: z.boolean().default(true),
});

const updateCitySchema = createCitySchema.partial();

module.exports = {
  createCitySchema,
  updateCitySchema,
};
