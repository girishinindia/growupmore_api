const { z } = require('zod');
const { coercePositiveInt } = require('./shared/coerce');

// ============================================================================
// SHARED SCHEMAS
// ============================================================================

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a positive integer').transform(Number),
});

const restoreSchema = z.object({}).strict();

const listQuerySchema = z.object({
  page: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().regex(/^\d+$/).transform(Number).optional().default(1)),
  limit: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().regex(/^\d+$/).transform(Number).optional().default(20)),
});

// ============================================================================
// 1. COURSE BATCHES SCHEMAS
// ============================================================================

const createCourseBatchSchema = z.object({
  courseId: coercePositiveInt,
  batchOwner: z.string().max(255).optional().default('system'),
  instructorId: coercePositiveInt.optional().nullable(),
  code: z.string().max(255).trim().optional().nullable(),
  isFree: z.boolean().optional().default(false),
  price: z.number().nonnegative().optional().default(0),
  includesCourseAccess: z.boolean().optional().default(false),
  maxStudents: coercePositiveInt.optional().nullable(),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
  schedule: z.any().optional().nullable(),
  meetingPlatform: z.string().max(100).optional().default('zoom'),
  batchStatus: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).optional().default('upcoming'),
  displayOrder: z.number().int().nonnegative().optional().default(0),
}).strict();

const updateCourseBatchSchema = z.object({
  code: z.string().max(255).trim().optional().nullable(),
  isFree: z.boolean().optional(),
  price: z.number().nonnegative().optional(),
  includesCourseAccess: z.boolean().optional(),
  maxStudents: coercePositiveInt.optional().nullable(),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
  schedule: z.any().optional().nullable(),
  meetingPlatform: z.string().max(100).optional(),
  batchStatus: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).optional(),
  displayOrder: z.number().int().nonnegative().optional(),
}).strict();

const courseBatchListQuerySchema = listQuerySchema.extend({
  courseId: z.string().regex(/^\d+$/).transform(Number).optional(),
  batchOwner: z.string().max(100).optional(),
  batchStatus: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).optional(),
  isFree: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  meetingPlatform: z.string().max(100).optional(),
  instructorId: z.string().regex(/^\d+$/).transform(Number).optional(),
});

// ============================================================================
// 2. BATCH TRANSLATIONS SCHEMAS
// ============================================================================

const createBatchTranslationSchema = z.object({
  batchId: coercePositiveInt,
  languageId: coercePositiveInt,
  title: z.string().min(1).max(500).trim(),
  description: z.string().max(5000).optional().nullable(),
  shortDescription: z.string().max(1000).optional().nullable(),
}).strict();

const updateBatchTranslationSchema = z.object({
  title: z.string().min(1).max(500).trim().optional(),
  description: z.string().max(5000).optional().nullable(),
  shortDescription: z.string().max(1000).optional().nullable(),
  tags: z.array(z.any()).optional().nullable(),
  metaTitle: z.string().max(500).optional().nullable(),
  metaDescription: z.string().max(1000).optional().nullable(),
  metaKeywords: z.string().max(500).optional().nullable(),
  canonicalUrl: z.string().url().optional().nullable(),
  ogSiteName: z.string().max(200).optional().nullable(),
  ogTitle: z.string().max(500).optional().nullable(),
  ogDescription: z.string().max(1000).optional().nullable(),
  ogType: z.string().max(50).optional().nullable(),
  ogImage: z.string().optional().nullable(),
  ogUrl: z.string().url().optional().nullable(),
  twitterSite: z.string().max(200).optional().nullable(),
  twitterTitle: z.string().max(500).optional().nullable(),
  twitterDescription: z.string().max(1000).optional().nullable(),
  twitterImage: z.string().optional().nullable(),
  twitterCard: z.string().max(50).optional().default('summary_large_image'),
  robotsDirective: z.string().max(100).optional().default('index,follow'),
  focusKeyword: z.string().max(200).optional().nullable(),
  structuredData: z.any().optional().nullable(),
  isActive: z.boolean().optional(),
}).strict();

// ============================================================================
// 3. BATCH SESSIONS SCHEMAS
// ============================================================================

const createBatchSessionSchema = z.object({
  batchId: coercePositiveInt,
  sessionNumber: coercePositiveInt,
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  scheduledAt: z.string().datetime().optional().nullable(),
  durationMinutes: coercePositiveInt.optional().nullable(),
  meetingUrl: z.string().url().optional().nullable(),
  meetingId: z.string().max(255).optional().nullable(),
  recordingUrl: z.string().url().optional().nullable(),
  sessionStatus: z.enum(['scheduled', 'ongoing', 'completed', 'cancelled']).optional().default('scheduled'),
  displayOrder: z.number().int().nonnegative().optional().default(0),
}).strict();

const updateBatchSessionSchema = z.object({
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  scheduledAt: z.string().datetime().optional().nullable(),
  durationMinutes: coercePositiveInt.optional().nullable(),
  meetingUrl: z.string().url().optional().nullable(),
  meetingId: z.string().max(255).optional().nullable(),
  recordingUrl: z.string().url().optional().nullable(),
  sessionStatus: z.enum(['scheduled', 'ongoing', 'completed', 'cancelled']).optional(),
  displayOrder: z.number().int().nonnegative().optional(),
}).strict();

const batchSessionListQuerySchema = listQuerySchema.extend({
  batchId: z.string().regex(/^\d+$/).transform(Number).optional(),
  sessionStatus: z.enum(['scheduled', 'ongoing', 'completed', 'cancelled']).optional(),
});

// ============================================================================
// 4. BATCH SESSION TRANSLATIONS SCHEMAS
// ============================================================================

const createBatchSessionTranslationSchema = z.object({
  batchSessionId: coercePositiveInt,
  languageId: coercePositiveInt,
  title: z.string().min(1).max(500).trim(),
  description: z.string().max(5000).optional().nullable(),
}).strict();

const updateBatchSessionTranslationSchema = z.object({
  title: z.string().min(1).max(500).trim().optional(),
  description: z.string().max(5000).optional().nullable(),
  isActive: z.boolean().optional(),
}).strict();

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  idParamSchema,
  restoreSchema,
  listQuerySchema,
  createCourseBatchSchema,
  updateCourseBatchSchema,
  courseBatchListQuerySchema,
  createBatchTranslationSchema,
  updateBatchTranslationSchema,
  createBatchSessionSchema,
  updateBatchSessionSchema,
  batchSessionListQuerySchema,
  createBatchSessionTranslationSchema,
  updateBatchSessionTranslationSchema,
};
