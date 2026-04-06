/**
 * ═══════════════════════════════════════════════════════════════
 * MASTER DATA EXTENDED VALIDATORS — Zod Schemas
 * ═══════════════════════════════════════════════════════════════
 * Skills, Languages, Education Levels, Document Types, Documents,
 * Designations, Specializations, Learning Goals, Social Medias,
 * Categories, and Sub Categories validation schemas
 * ═══════════════════════════════════════════════════════════════
 */

const { z } = require('zod');
const { coercePositiveInt } = require('./shared/coerce');

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
// HELPERS — Multipart Form-Data Compatible Coercers
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

// Helper: accept number OR numeric string (multipart form-data sends strings)
const coerceSmallInt = z.preprocess(
  (val) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string' && /^\d+$/.test(val)) return Number(val);
    return val;
  },
  z.number().int()
);

// ============================================================================
// SKILLS SCHEMAS
// ============================================================================

const SKILL_CATEGORIES = ['technical', 'soft_skill', 'tool', 'framework', 'language', 'domain', 'certification', 'other'];

const createSkillSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  category: z.enum(SKILL_CATEGORIES).optional().default('technical'),
  description: z.string().optional().nullable(),
  iconUrl: z.string().url().optional().nullable(),
  isActive: coerceBoolean.optional().default(true),
});

const updateSkillSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  category: z.enum(SKILL_CATEGORIES).optional(),
  description: z.string().optional().nullable(),
  iconUrl: z.string().url().optional().nullable(),
  isActive: coerceBoolean.optional(),
});

const skillListQuerySchema = listQuerySchema.extend({
  category: z.string().max(50).optional(),
});

// ============================================================================
// LANGUAGES SCHEMAS
// ============================================================================

const createLanguageSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  nativeName: z.string().max(200).optional().nullable(),
  isoCode: z.string().max(10).optional().nullable(),
  script: z.string().max(50).optional().nullable(),
  isActive: coerceBoolean.optional().default(true),
});

const updateLanguageSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  nativeName: z.string().max(200).optional().nullable(),
  isoCode: z.string().max(10).optional().nullable(),
  script: z.string().max(50).optional().nullable(),
  isActive: coerceBoolean.optional(),
});

const languageListQuerySchema = listQuerySchema.extend({
  script: z.string().max(50).optional(),
  isoCode: z.string().max(10).optional(),
});

// ============================================================================
// EDUCATION LEVELS SCHEMAS
// ============================================================================

const createEducationLevelSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  levelOrder: coercePositiveInt,
  levelCategory: z.string().optional().default('other'),
  abbreviation: z.string().max(20).optional().nullable(),
  description: z.string().optional().nullable(),
  typicalDuration: z.string().max(50).optional().nullable(),
  typicalAgeRange: z.string().max(50).optional().nullable(),
  isActive: coerceBoolean.optional().default(true),
});

const updateEducationLevelSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  levelOrder: coercePositiveInt.optional(),
  levelCategory: z.string().optional(),
  abbreviation: z.string().max(20).optional().nullable(),
  description: z.string().optional().nullable(),
  typicalDuration: z.string().max(50).optional().nullable(),
  typicalAgeRange: z.string().max(50).optional().nullable(),
  isActive: coerceBoolean.optional(),
});

const educationLevelListQuerySchema = listQuerySchema.extend({
  category: z.string().optional(),
});

// ============================================================================
// DOCUMENT TYPES SCHEMAS
// ============================================================================

const createDocumentTypeSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  description: z.string().optional().nullable(),
  isActive: coerceBoolean.optional().default(true),
});

const updateDocumentTypeSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  description: z.string().optional().nullable(),
  isActive: coerceBoolean.optional(),
});

const documentTypeListQuerySchema = listQuerySchema;

// ============================================================================
// DOCUMENTS SCHEMAS
// ============================================================================

const createDocumentSchema = z.object({
  documentTypeId: coercePositiveInt,
  name: z.string().min(1).max(200).trim(),
  description: z.string().optional().nullable(),
  isActive: coerceBoolean.optional().default(true),
});

const updateDocumentSchema = z.object({
  documentTypeId: coercePositiveInt.optional(),
  name: z.string().min(1).max(200).trim().optional(),
  description: z.string().optional().nullable(),
  isActive: coerceBoolean.optional(),
});

const documentListQuerySchema = listQuerySchema.extend({
  documentTypeId: z.string().regex(/^\d+$/).transform(Number).optional(),
});

// ============================================================================
// DESIGNATIONS SCHEMAS
// ============================================================================

const createDesignationSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  code: z.string().max(50).optional().nullable(),
  level: z.number().int().optional().default(1),
  levelBand: z.string().optional().default('entry'),
  description: z.string().optional().nullable(),
  isActive: coerceBoolean.optional().default(true),
});

const updateDesignationSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  code: z.string().max(50).optional().nullable(),
  level: z.number().int().optional(),
  levelBand: z.string().optional(),
  description: z.string().optional().nullable(),
  isActive: coerceBoolean.optional(),
});

const designationListQuerySchema = listQuerySchema.extend({
  levelBand: z.string().optional(),
});

// ============================================================================
// SPECIALIZATIONS SCHEMAS
// ============================================================================

const createSpecializationSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  category: z.string().max(50).optional().default('technology'),
  description: z.string().optional().nullable(),
  iconUrl: z.string().url().optional().nullable(),
  isActive: coerceBoolean.optional().default(true),
});

const updateSpecializationSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  category: z.string().max(50).optional(),
  description: z.string().optional().nullable(),
  iconUrl: z.string().url().optional().nullable(),
  isActive: coerceBoolean.optional(),
});

const specializationListQuerySchema = listQuerySchema.extend({
  category: z.string().max(50).optional(),
});

// ============================================================================
// LEARNING GOALS SCHEMAS
// ============================================================================

const createLearningGoalSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  description: z.string().optional().nullable(),
  iconUrl: z.string().url().optional().nullable(),
  displayOrder: coerceSmallInt.optional().default(0),
  isActive: coerceBoolean.optional().default(true),
});

const updateLearningGoalSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  description: z.string().optional().nullable(),
  iconUrl: z.string().url().optional().nullable(),
  displayOrder: coerceSmallInt.optional(),
  isActive: coerceBoolean.optional(),
});

const learningGoalListQuerySchema = listQuerySchema;

// ============================================================================
// SOCIAL MEDIAS SCHEMAS
// ============================================================================

const createSocialMediaSchema = z.object({
  name: z.string().min(1).max(200).trim(),
  code: z.string().min(2).max(50).trim(),
  baseUrl: z.string().url().optional().nullable(),
  iconUrl: z.string().url().optional().nullable(),
  placeholder: z.string().max(200).optional().nullable(),
  platformType: z.string().optional().default('social'),
  displayOrder: coerceSmallInt.optional().default(0),
  isActive: coerceBoolean.optional().default(true),
});

const updateSocialMediaSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  code: z.string().min(2).max(50).trim().optional(),
  baseUrl: z.string().url().optional().nullable(),
  iconUrl: z.string().url().optional().nullable(),
  placeholder: z.string().max(200).optional().nullable(),
  platformType: z.string().optional(),
  displayOrder: coerceSmallInt.optional(),
  isActive: coerceBoolean.optional(),
});

const socialMediaListQuerySchema = listQuerySchema.extend({
  platformType: z.string().optional(),
  code: z.string().optional(),
});

// ============================================================================
// CATEGORIES SCHEMAS
// ============================================================================

const createCategorySchema = z.object({
  code: z.string().min(2).max(100).trim(),
  slug: z.string().optional().nullable(),
  displayOrder: coerceSmallInt.optional().default(0),
  iconUrl: z.string().url().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  isNew: coerceBoolean.optional().default(false),
  newUntil: z.string().optional().nullable(),
  isActive: coerceBoolean.optional().default(true),
});

const updateCategorySchema = z.object({
  code: z.string().min(2).max(100).trim().optional(),
  slug: z.string().optional().nullable(),
  displayOrder: coerceSmallInt.optional(),
  iconUrl: z.string().url().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  isNew: coerceBoolean.optional(),
  newUntil: z.string().optional().nullable(),
  isActive: coerceBoolean.optional(),
});

const categoryListQuerySchema = listQuerySchema.extend({
  isNew: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

const restoreCategorySchema = z
  .preprocess((val) => (val === undefined || val === null ? {} : val), z.object({
    restoreTranslations: z.boolean().optional().default(false),
  }));

// ============================================================================
// SUB CATEGORIES SCHEMAS
// ============================================================================

const createSubCategorySchema = z.object({
  categoryId: z.preprocess(
    (val) => {
      if (typeof val === 'number') return val;
      if (typeof val === 'string' && /^\d+$/.test(val)) return Number(val);
      return val;
    },
    coercePositiveInt
  ),
  code: z.string().min(2).max(100).trim(),
  slug: z.string().optional().nullable(),
  displayOrder: coerceSmallInt.optional().default(0),
  isActive: coerceBoolean.optional().default(true),
});

const updateSubCategorySchema = z.object({
  categoryId: z.preprocess(
    (val) => {
      if (typeof val === 'number') return val;
      if (typeof val === 'string' && /^\d+$/.test(val)) return Number(val);
      return val;
    },
    coercePositiveInt
  ).optional(),
  code: z.string().min(2).max(100).trim().optional(),
  slug: z.string().optional().nullable(),
  displayOrder: coerceSmallInt.optional(),
  iconUrl: z.string().url().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  isNew: coerceBoolean.optional(),
  newUntil: z.string().optional().nullable(),
  isActive: coerceBoolean.optional(),
});

const subCategoryListQuerySchema = listQuerySchema.extend({
  categoryId: z.string().regex(/^\d+$/).transform(Number).optional(),
  isNew: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

const restoreSubCategorySchema = z.preprocess(
  (val) => (val === undefined || val === null ? {} : val),
  z.object({
    restoreTranslations: z.boolean().optional().default(false),
  })
);

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Shared
  idParamSchema,
  listQuerySchema,

  // Skills
  createSkillSchema,
  updateSkillSchema,
  skillListQuerySchema,

  // Languages
  createLanguageSchema,
  updateLanguageSchema,
  languageListQuerySchema,

  // Education Levels
  createEducationLevelSchema,
  updateEducationLevelSchema,
  educationLevelListQuerySchema,

  // Document Types
  createDocumentTypeSchema,
  updateDocumentTypeSchema,
  documentTypeListQuerySchema,

  // Documents
  createDocumentSchema,
  updateDocumentSchema,
  documentListQuerySchema,

  // Designations
  createDesignationSchema,
  updateDesignationSchema,
  designationListQuerySchema,

  // Specializations
  createSpecializationSchema,
  updateSpecializationSchema,
  specializationListQuerySchema,

  // Learning Goals
  createLearningGoalSchema,
  updateLearningGoalSchema,
  learningGoalListQuerySchema,

  // Social Medias
  createSocialMediaSchema,
  updateSocialMediaSchema,
  socialMediaListQuerySchema,

  // Categories
  createCategorySchema,
  updateCategorySchema,
  categoryListQuerySchema,
  restoreCategorySchema,

  // Sub Categories
  createSubCategorySchema,
  updateSubCategorySchema,
  subCategoryListQuerySchema,
  restoreSubCategorySchema,
};
