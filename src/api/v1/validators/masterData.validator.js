/**
 * ═══════════════════════════════════════════════════════════════
 * MASTER DATA VALIDATORS — Zod Schemas
 * ═══════════════════════════════════════════════════════════════
 * Countries, States, Cities validation schemas
 * ═══════════════════════════════════════════════════════════════
 */

const { z } = require('zod');

// ============================================================================
// SHARED SCHEMAS
// ============================================================================

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a positive integer').transform(Number),
});

const listQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
  search: z.string().max(100).optional(),
  sortBy: z.string().max(50).optional(),
  sortDir: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional().default('ASC'),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

// ============================================================================
// COUNTRY SCHEMAS
// ============================================================================

// Helper: accept boolean OR string 'true'/'false' (multipart form-data sends strings)
const coerceBoolean = z.preprocess(
  (val) => {
    if (typeof val === 'boolean') return val;
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  },
  z.boolean()
);

// Helper: accept array OR JSON-stringified array (multipart form-data sends strings)
const coerceStringArray = z.preprocess(
  (val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return val; }
    }
    return val;
  },
  z.array(z.string())
);

const createCountrySchema = z.object({
  name: z.string().min(1).max(200).trim(),
  iso2: z.string().length(2).trim().toUpperCase(),
  iso3: z.string().length(3).trim().toUpperCase(),
  phoneCode: z.string().max(10).optional().nullable(),
  currency: z.string().max(10).optional().nullable(),
  currencyName: z.string().max(100).optional().nullable(),
  currencySymbol: z.string().max(10).optional().nullable(),
  nationalLanguage: z.string().max(100).optional().nullable(),
  nationality: z.string().max(100).optional().nullable(),
  languages: coerceStringArray.optional().default([]),
  tld: z.string().max(10).optional().nullable(),
  flagImage: z.string().max(500).url().optional().nullable(),
  isActive: coerceBoolean.optional().default(false),
});

const updateCountrySchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  iso2: z.string().length(2).trim().toUpperCase().optional(),
  iso3: z.string().length(3).trim().toUpperCase().optional(),
  phoneCode: z.string().max(10).optional().nullable(),
  currency: z.string().max(10).optional().nullable(),
  currencyName: z.string().max(100).optional().nullable(),
  currencySymbol: z.string().max(10).optional().nullable(),
  nationalLanguage: z.string().max(100).optional().nullable(),
  nationality: z.string().max(100).optional().nullable(),
  languages: coerceStringArray.optional().nullable(),
  tld: z.string().max(10).optional().nullable(),
  flagImage: z.string().max(500).url().optional().nullable(),
  isActive: coerceBoolean.optional(),
});

const countryListQuerySchema = listQuerySchema.extend({
  iso2: z.string().max(2).optional(),
  iso3: z.string().max(3).optional(),
  phoneCode: z.string().max(10).optional(),
  currency: z.string().max(10).optional(),
  nationality: z.string().max(100).optional(),
  nationalLanguage: z.string().max(100).optional(),
});

// ============================================================================
// STATE SCHEMAS
// ============================================================================

const createStateSchema = z.object({
  countryId: z.number().int().positive('Country ID is required'),
  name: z.string().min(1).max(200).trim(),
  languages: z.array(z.string()).optional().default([]),
  website: z.string().max(500).url().optional().nullable(),
  isActive: z.boolean().optional().default(false),
});

const updateStateSchema = z.object({
  countryId: z.number().int().positive().optional(),
  name: z.string().min(1).max(200).trim().optional(),
  languages: z.array(z.string()).optional().nullable(),
  website: z.string().max(500).url().optional().nullable(),
  isActive: z.boolean().optional(),
});

const stateListQuerySchema = listQuerySchema.extend({
  countryIso3: z.string().max(3).optional(),
  stateIsActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

// ============================================================================
// CITY SCHEMAS
// ============================================================================

const createCitySchema = z.object({
  stateId: z.number().int().positive('State ID is required'),
  name: z.string().min(1).max(200).trim(),
  phonecode: z.string().max(10).optional().nullable(),
  timezone: z.string().max(100).optional().nullable(),
  website: z.string().max(500).url().optional().nullable(),
  isActive: z.boolean().optional().default(false),
});

const updateCitySchema = z.object({
  stateId: z.number().int().positive().optional(),
  name: z.string().min(1).max(200).trim().optional(),
  phonecode: z.string().max(10).optional().nullable(),
  timezone: z.string().max(100).optional().nullable(),
  website: z.string().max(500).url().optional().nullable(),
  isActive: z.boolean().optional(),
});

const cityListQuerySchema = listQuerySchema.extend({
  countryIso3: z.string().max(3).optional(),
  cityTimezone: z.string().max(100).optional(),
  cityIsActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Shared
  idParamSchema,
  listQuerySchema,

  // Countries
  createCountrySchema,
  updateCountrySchema,
  countryListQuerySchema,

  // States
  createStateSchema,
  updateStateSchema,
  stateListQuerySchema,

  // Cities
  createCitySchema,
  updateCitySchema,
  cityListQuerySchema,
};
