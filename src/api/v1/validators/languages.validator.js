/**
 * ═══════════════════════════════════════════════════════════════
 * LANGUAGES VALIDATOR — Zod Schemas
 * ═══════════════════════════════════════════════════════════════
 */

const { z } = require('zod');

const createLanguageSchema = z.object({
  name: z
    .string()
    .min(2, 'Language name must be at least 2 characters.')
    .max(100, 'Language name must not exceed 100 characters.')
    .trim(),
  native_name: z
    .string()
    .min(1, 'Native name is required.')
    .max(100, 'Native name must not exceed 100 characters.')
    .trim(),
  iso_code: z
    .string()
    .min(2, 'ISO code must be at least 2 characters.')
    .max(5, 'ISO code must not exceed 5 characters.')
    .trim(),
  is_active: z.boolean().default(true),
});

const updateLanguageSchema = createLanguageSchema.partial();

module.exports = {
  createLanguageSchema,
  updateLanguageSchema,
};
