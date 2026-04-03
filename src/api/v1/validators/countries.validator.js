/**
 * ═══════════════════════════════════════════════════════════════
 * COUNTRIES VALIDATOR — Zod Schemas
 * ═══════════════════════════════════════════════════════════════
 */

const { z } = require('zod');

const createCountrySchema = z.object({
  name: z
    .string()
    .min(2, 'Country name must be at least 2 characters.')
    .max(100, 'Country name must not exceed 100 characters.')
    .trim(),
  iso2: z
    .string()
    .length(2, 'ISO2 code must be exactly 2 characters.')
    .toUpperCase()
    .trim(),
  iso3: z
    .string()
    .length(3, 'ISO3 code must be exactly 3 characters.')
    .toUpperCase()
    .trim(),
  phone_code: z
    .string()
    .min(1, 'Phone code is required.')
    .max(10, 'Phone code must not exceed 10 characters.')
    .trim(),
  currency: z
    .string()
    .min(1, 'Currency is required.')
    .max(10, 'Currency must not exceed 10 characters.')
    .trim(),
  is_active: z.boolean().default(true),
});

const updateCountrySchema = createCountrySchema.partial();

module.exports = {
  createCountrySchema,
  updateCountrySchema,
};
