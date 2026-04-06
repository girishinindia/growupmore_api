const { z } = require('zod');
const { coercePositiveInt } = require('./shared/coerce');

// ============================================================================
// SHARED SCHEMAS
// ============================================================================

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a positive integer').transform(Number),
});

const sessionRequestIdParamSchema = z.object({
  sessionRequestId: z.string().regex(/^\d+$/, 'Session request ID must be a positive integer').transform(Number),
});

const scheduledSessionIdParamSchema = z.object({
  scheduledSessionId: z.string().regex(/^\d+$/, 'Scheduled session ID must be a positive integer').transform(Number),
});

const restoreSchema = z.object({}).strict();

const bulkIdsSchema = z
  .object({
    ids: z
      .array(z.string().regex(/^\d+$/).transform(Number))
      .min(1, 'At least one ID is required'),
  })
  .strict();

const listQuerySchema = z.object({
  page: z.preprocess(
    (val) => (val !== undefined ? String(val) : undefined),
    z.string().regex(/^\d+$/).transform(Number).optional().default(1),
  ),
  limit: z.preprocess(
    (val) => (val !== undefined ? String(val) : undefined),
    z.string().regex(/^\d+$/).transform(Number).optional().default(20),
  ),
});

// ============================================================================
// SESSION REQUESTS SCHEMAS
// ============================================================================

const createSessionRequestSchema = z
  .object({
    studentId: coercePositiveInt,
    instructorId: coercePositiveInt.optional().nullable(),
    courseId: coercePositiveInt.optional().nullable(),
    requestType: z.enum(['one_on_one', 'group', 'doubt_clearing', 'mentoring', 'career_guidance']).optional().default('one_on_one'),
    preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
    preferredTimeSlot: z.string().max(100).optional().nullable(),
    durationMinutes: coercePositiveInt.optional().default(60),
    isFree: z.boolean().optional().default(false),
    price: z.number().nonnegative().optional().default(0.00),
  })
  .strict();

const updateSessionRequestSchema = z
  .object({
    instructorId: coercePositiveInt.optional().nullable(),
    courseId: coercePositiveInt.optional().nullable(),
    requestType: z.enum(['one_on_one', 'group', 'doubt_clearing', 'mentoring', 'career_guidance']).optional().nullable(),
    preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
    preferredTimeSlot: z.string().max(100).optional().nullable(),
    durationMinutes: coercePositiveInt.optional().nullable(),
    isFree: z.boolean().optional().nullable(),
    price: z.number().nonnegative().optional().nullable(),
    requestStatus: z.enum(['pending', 'approved', 'scheduled', 'completed', 'rejected', 'cancelled']).optional().nullable(),
    rejectionReason: z.string().max(1000).optional().nullable(),
  })
  .strict();

const sessionRequestListQuerySchema = listQuerySchema.extend({
  studentId: z.string().regex(/^\d+$/).transform(Number).optional(),
  instructorId: z.string().regex(/^\d+$/).transform(Number).optional(),
  courseId: z.string().regex(/^\d+$/).transform(Number).optional(),
  requestType: z.enum(['one_on_one', 'group', 'doubt_clearing', 'mentoring', 'career_guidance']).optional(),
  requestStatus: z.enum(['pending', 'approved', 'scheduled', 'completed', 'rejected', 'cancelled']).optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  searchTerm: z.string().max(500).optional(),
  sortBy: z.string().max(100).optional().default('created_at'),
  sortDir: z.enum(['ASC', 'DESC']).optional().default('DESC'),
});

// ============================================================================
// SESSION REQUEST TRANSLATIONS SCHEMAS
// ============================================================================

const createSessionRequestTranslationSchema = z
  .object({
    languageId: coercePositiveInt,
    topic: z.string().min(1, 'Topic is required').max(1000).trim(),
    description: z.string().max(5000).optional().nullable(),
  })
  .strict();

const updateSessionRequestTranslationSchema = z
  .object({
    topic: z.string().min(1).max(1000).trim().optional().nullable(),
    description: z.string().max(5000).optional().nullable(),
  })
  .strict();

// ============================================================================
// SCHEDULED SESSIONS SCHEMAS
// ============================================================================

const createScheduledSessionSchema = z
  .object({
    studentId: coercePositiveInt,
    instructorId: coercePositiveInt,
    scheduledAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
    sessionRequestId: coercePositiveInt.optional().nullable(),
    orderId: coercePositiveInt.optional().nullable(),
    durationMinutes: coercePositiveInt.optional().default(60),
    meetingUrl: z.string().url().optional().nullable(),
    meetingPlatform: z.enum(['zoom', 'google_meet', 'teams', 'custom']).optional().nullable(),
    meetingId: z.string().max(500).optional().nullable(),
    meetingPassword: z.string().max(500).optional().nullable(),
  })
  .strict();

const updateScheduledSessionSchema = z
  .object({
    scheduledAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/).optional().nullable(),
    durationMinutes: coercePositiveInt.optional().nullable(),
    endedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/).optional().nullable(),
    meetingUrl: z.string().url().optional().nullable(),
    meetingPlatform: z.enum(['zoom', 'google_meet', 'teams', 'custom']).optional().nullable(),
    meetingId: z.string().max(500).optional().nullable(),
    meetingPassword: z.string().max(500).optional().nullable(),
    sessionStatus: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show']).optional().nullable(),
    recordingUrl: z.string().url().optional().nullable(),
    rating: z.number().int().min(1).max(5).optional().nullable(),
    cancelledBy: coercePositiveInt.optional().nullable(),
    cancellationReason: z.string().max(1000).optional().nullable(),
  })
  .strict();

const scheduledSessionListQuerySchema = listQuerySchema.extend({
  studentId: z.string().regex(/^\d+$/).transform(Number).optional(),
  instructorId: z.string().regex(/^\d+$/).transform(Number).optional(),
  sessionRequestId: z.string().regex(/^\d+$/).transform(Number).optional(),
  sessionStatus: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show']).optional(),
  meetingPlatform: z.enum(['zoom', 'google_meet', 'teams', 'custom']).optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  searchTerm: z.string().max(500).optional(),
  sortBy: z.string().max(100).optional().default('scheduled_at'),
  sortDir: z.enum(['ASC', 'DESC']).optional().default('DESC'),
});

// ============================================================================
// SCHEDULED SESSION TRANSLATIONS SCHEMAS
// ============================================================================

const createScheduledSessionTranslationSchema = z
  .object({
    languageId: coercePositiveInt,
    instructorNotes: z.string().max(5000).optional().nullable(),
    studentFeedback: z.string().max(5000).optional().nullable(),
  })
  .strict();

const updateScheduledSessionTranslationSchema = z
  .object({
    instructorNotes: z.string().max(5000).optional().nullable(),
    studentFeedback: z.string().max(5000).optional().nullable(),
  })
  .strict();

// ============================================================================
// VALIDATORS EXPORT
// ============================================================================

module.exports = {
  // Shared
  idParamSchema,
  sessionRequestIdParamSchema,
  scheduledSessionIdParamSchema,
  restoreSchema,
  bulkIdsSchema,
  listQuerySchema,

  // Session Requests
  createSessionRequestSchema,
  updateSessionRequestSchema,
  sessionRequestListQuerySchema,

  // Session Request Translations
  createSessionRequestTranslationSchema,
  updateSessionRequestTranslationSchema,

  // Scheduled Sessions
  createScheduledSessionSchema,
  updateScheduledSessionSchema,
  scheduledSessionListQuerySchema,

  // Scheduled Session Translations
  createScheduledSessionTranslationSchema,
  updateScheduledSessionTranslationSchema,
};
