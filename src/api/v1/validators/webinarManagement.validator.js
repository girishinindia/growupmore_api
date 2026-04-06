/**
 * ═══════════════════════════════════════════════════════════════
 * WEBINAR MANAGEMENT VALIDATORS — Zod Schemas
 * ═══════════════════════════════════════════════════════════════
 * Webinars validation schemas
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
  page: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().regex(/^\d+$/).transform(Number).optional().default(1)),
  limit: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().regex(/^\d+$/).transform(Number).optional().default(20)),
  search: z.string().max(500).optional(),
  sortBy: z.string().max(50).optional().default('webinar_scheduled_at'),
  sortDir: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional().default('DESC'),
});

// ============================================================================
// WEBINAR SCHEMAS
// ============================================================================

const createWebinarSchema = z.object({
  webinarOwner: z.string().max(100).optional().default('system'),
  instructorId: coercePositiveInt.optional().nullable(),
  courseId: coercePositiveInt.optional().nullable(),
  chapterId: coercePositiveInt.optional().nullable(),
  code: z.string().min(1).max(100).trim().optional().nullable(),
  slug: z.string().min(1).max(200).trim().optional().nullable(),
  isFree: z.boolean().optional().default(false),
  price: z.number().nonnegative().optional().default(0.00),
  scheduledAt: z.string().datetime().optional().nullable(),
  durationMinutes: z.number().int().nonnegative().optional().nullable(),
  maxAttendees: coercePositiveInt.optional().nullable(),
  registeredCount: z.number().int().nonnegative().optional().default(0),
  meetingPlatform: z.string().max(50).optional().default('zoom'),
  meetingUrl: z.string().max(500).url().optional().nullable(),
  meetingId: z.string().max(200).optional().nullable(),
  meetingPassword: z.string().max(100).optional().nullable(),
  recordingUrl: z.string().max(500).url().optional().nullable(),
  webinarStatus: z.enum(['scheduled', 'live', 'completed', 'cancelled', 'postponed']).optional().default('scheduled'),
  displayOrder: z.number().int().nonnegative().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

const updateWebinarSchema = z.object({
  webinarOwner: z.string().max(100).optional(),
  instructorId: coercePositiveInt.optional().nullable(),
  courseId: coercePositiveInt.optional().nullable(),
  chapterId: coercePositiveInt.optional().nullable(),
  code: z.string().min(1).max(100).trim().optional().nullable(),
  slug: z.string().min(1).max(200).trim().optional().nullable(),
  isFree: z.boolean().optional(),
  price: z.number().nonnegative().optional(),
  scheduledAt: z.string().datetime().optional().nullable(),
  durationMinutes: z.number().int().nonnegative().optional().nullable(),
  maxAttendees: coercePositiveInt.optional().nullable(),
  registeredCount: z.number().int().nonnegative().optional(),
  meetingPlatform: z.string().max(50).optional(),
  meetingUrl: z.string().max(500).url().optional().nullable(),
  meetingId: z.string().max(200).optional().nullable(),
  meetingPassword: z.string().max(100).optional().nullable(),
  recordingUrl: z.string().max(500).url().optional().nullable(),
  webinarStatus: z.enum(['scheduled', 'live', 'completed', 'cancelled', 'postponed']).optional(),
  displayOrder: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

const webinarListQuerySchema = listQuerySchema.extend({
  webinarOwner: z.string().max(100).optional(),
  webinarStatus: z.string().max(50).optional(),
  meetingPlatform: z.string().max(50).optional(),
  courseId: z.string().regex(/^\d+$/).transform(Number).optional(),
  chapterId: z.string().regex(/^\d+$/).transform(Number).optional(),
  instructorId: z.string().regex(/^\d+$/).transform(Number).optional(),
  isFree: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Shared
  idParamSchema,
  listQuerySchema,

  // Webinars
  createWebinarSchema,
  updateWebinarSchema,
  webinarListQuerySchema,
};
