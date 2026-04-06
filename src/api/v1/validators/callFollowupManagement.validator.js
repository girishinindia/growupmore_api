const { z } = require('zod');
const { coercePositiveInt } = require('./shared/coerce');

// ============================================================================
// SHARED SCHEMAS
// ============================================================================

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a positive integer').transform(Number),
});

const callPurposeIdParamSchema = z.object({
  callPurposeId: z.string().regex(/^\d+$/, 'Call purpose ID must be a positive integer').transform(Number),
});

const callLogIdParamSchema = z.object({
  callLogId: z.string().regex(/^\d+$/, 'Call log ID must be a positive integer').transform(Number),
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
    z.string().regex(/^\d+$/).transform(Number).optional().default(25),
  ),
});

// ============================================================================
// CALL PURPOSES SCHEMAS
// ============================================================================

const createCallPurposeSchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(500).trim(),
    code: z.string().min(1).max(100).trim().optional().nullable(),
    displayOrder: z.number().int().nonnegative().optional().default(0),
  })
  .strict();

const updateCallPurposeSchema = z
  .object({
    name: z.string().min(1).max(500).trim().optional().nullable(),
    code: z.string().min(1).max(100).trim().optional().nullable(),
    displayOrder: z.number().int().nonnegative().optional().nullable(),
    isActive: z.boolean().optional().nullable(),
  })
  .strict();

const callPurposeListQuerySchema = listQuerySchema.extend({
  search: z.string().max(500).optional(),
  sortBy: z.string().max(100).optional().default('display_order'),
  sortDir: z.enum(['ASC', 'DESC']).optional().default('ASC'),
});

// ============================================================================
// CALL PURPOSE TRANSLATIONS SCHEMAS
// ============================================================================

const createCallPurposeTranslationSchema = z
  .object({
    languageId: coercePositiveInt,
    name: z.string().min(1, 'Name is required').max(500).trim(),
    description: z.string().max(2000).trim().optional().nullable(),
  })
  .strict();

const updateCallPurposeTranslationSchema = z
  .object({
    name: z.string().min(1).max(500).trim().optional().nullable(),
    description: z.string().max(2000).trim().optional().nullable(),
  })
  .strict();

// ============================================================================
// CALL LOGS SCHEMAS
// ============================================================================

const createCallLogSchema = z
  .object({
    studentId: coercePositiveInt,
    calledBy: coercePositiveInt,
    purposeId: coercePositiveInt.optional().nullable(),
    previousCallId: coercePositiveInt.optional().nullable(),
    followUpNumber: coercePositiveInt.optional().default(1),
    callType: z.enum(['outbound', 'inbound']).optional().default('outbound'),
    callStatus: z
      .enum(['scheduled', 'attempted', 'connected', 'no_answer', 'busy', 'voicemail', 'completed'])
      .optional()
      .default('scheduled'),
    scheduledAt: z.string().datetime().optional().nullable(),
    calledAt: z.string().datetime().optional().nullable(),
    durationSeconds: z.number().int().nonnegative().optional().nullable(),
    phoneNumberUsed: z.string().max(20).optional().nullable(),
    courseId: coercePositiveInt.optional().nullable(),
    batchId: coercePositiveInt.optional().nullable(),
    orderId: coercePositiveInt.optional().nullable(),
    ticketId: coercePositiveInt.optional().nullable(),
    outcome: z
      .enum(['interested', 'not_interested', 'callback_requested', 'enrolled', 'issue_resolved', 'escalated', 'wrong_number', 'unreachable'])
      .optional()
      .nullable(),
    nextFollowUpDate: z.string().date().optional().nullable(),
    nextAction: z.string().max(2000).optional().nullable(),
  })
  .strict();

const updateCallLogSchema = z
  .object({
    purposeId: coercePositiveInt.optional().nullable(),
    previousCallId: coercePositiveInt.optional().nullable(),
    followUpNumber: coercePositiveInt.optional().nullable(),
    callType: z.enum(['outbound', 'inbound']).optional().nullable(),
    callStatus: z
      .enum(['scheduled', 'attempted', 'connected', 'no_answer', 'busy', 'voicemail', 'completed'])
      .optional()
      .nullable(),
    scheduledAt: z.string().datetime().optional().nullable(),
    calledAt: z.string().datetime().optional().nullable(),
    durationSeconds: z.number().int().nonnegative().optional().nullable(),
    phoneNumberUsed: z.string().max(20).optional().nullable(),
    outcome: z
      .enum(['interested', 'not_interested', 'callback_requested', 'enrolled', 'issue_resolved', 'escalated', 'wrong_number', 'unreachable'])
      .optional()
      .nullable(),
    nextFollowUpDate: z.string().date().optional().nullable(),
    nextAction: z.string().max(2000).optional().nullable(),
    isActive: z.boolean().optional().nullable(),
  })
  .strict();

const callLogListQuerySchema = listQuerySchema.extend({
  studentId: z.string().regex(/^\d+$/).transform(Number).optional(),
  calledBy: z.string().regex(/^\d+$/).transform(Number).optional(),
  purposeId: z.string().regex(/^\d+$/).transform(Number).optional(),
  callType: z.enum(['outbound', 'inbound']).optional(),
  callStatus: z
    .enum(['scheduled', 'attempted', 'connected', 'no_answer', 'busy', 'voicemail', 'completed'])
    .optional(),
  outcome: z
    .enum(['interested', 'not_interested', 'callback_requested', 'enrolled', 'issue_resolved', 'escalated', 'wrong_number', 'unreachable'])
    .optional(),
  scheduledAfter: z.string().date().optional(),
  scheduledBefore: z.string().date().optional(),
  sortBy: z.string().max(100).optional().default('created_at'),
  sortDir: z.enum(['ASC', 'DESC']).optional().default('DESC'),
});

// ============================================================================
// CALL LOG TRANSLATIONS SCHEMAS
// ============================================================================

const createCallLogTranslationSchema = z
  .object({
    languageId: coercePositiveInt,
    summary: z.string().max(2000).optional().nullable(),
    studentResponse: z.string().max(2000).optional().nullable(),
    internalNotes: z.string().max(5000).optional().nullable(),
  })
  .strict();

const updateCallLogTranslationSchema = z
  .object({
    summary: z.string().max(2000).optional().nullable(),
    studentResponse: z.string().max(2000).optional().nullable(),
    internalNotes: z.string().max(5000).optional().nullable(),
  })
  .strict();

// ============================================================================
// VALIDATORS EXPORT
// ============================================================================

module.exports = {
  // Shared
  idParamSchema,
  callPurposeIdParamSchema,
  callLogIdParamSchema,
  restoreSchema,
  bulkIdsSchema,
  listQuerySchema,

  // Call Purposes
  createCallPurposeSchema,
  updateCallPurposeSchema,
  callPurposeListQuerySchema,

  // Call Purpose Translations
  createCallPurposeTranslationSchema,
  updateCallPurposeTranslationSchema,

  // Call Logs
  createCallLogSchema,
  updateCallLogSchema,
  callLogListQuerySchema,

  // Call Log Translations
  createCallLogTranslationSchema,
  updateCallLogTranslationSchema,
};
