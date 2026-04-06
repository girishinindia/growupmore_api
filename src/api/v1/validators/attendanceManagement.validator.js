/**
 * ═══════════════════════════════════════════════════════════════
 * ATTENDANCE MANAGEMENT VALIDATORS — Zod Schemas
 * ═══════════════════════════════════════════════════════════════
 * Attendance Tracking validation schemas
 * ═══════════════════════════════════════════════════════════════
 */

const { z } = require('zod');

// ============================================================================
// SHARED SCHEMAS
// ============================================================================

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a positive integer').transform(Number),
});

const restoreSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1, 'At least one ID is required'),
});

const bulkIdsSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1, 'At least one ID is required'),
});

const listQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
  sortBy: z.string().max(50).optional(),
  sortDir: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional().default('ASC'),
});

// ============================================================================
// ATTENDANCE SCHEMAS
// ============================================================================

const createAttendanceSchema = z.object({
  studentId: z.number().int().positive('Student ID is required'),
  attendanceType: z.enum(['batch_session', 'webinar'], {
    errorMap: () => ({ message: 'Attendance type must be either "batch_session" or "webinar"' }),
  }),
  batchSessionId: z.number().int().positive().optional().nullable(),
  webinarId: z.number().int().positive().optional().nullable(),
  status: z.enum(['present', 'absent', 'late', 'excused']).optional().default('present'),
  joinedAt: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid datetime format').optional().nullable(),
  leftAt: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid datetime format').optional().nullable(),
  durationAttendedSeconds: z.number().int().nonnegative().optional().nullable(),
}).strict().refine(
  (data) => {
    if (data.attendanceType === 'batch_session') {
      return data.batchSessionId !== null && data.batchSessionId !== undefined && data.webinarId === null;
    }
    if (data.attendanceType === 'webinar') {
      return data.webinarId !== null && data.webinarId !== undefined && data.batchSessionId === null;
    }
    return false;
  },
  {
    message: 'When attendanceType is "batch_session", batchSessionId is required and webinarId must be null. When attendanceType is "webinar", webinarId is required and batchSessionId must be null.',
    path: ['batchSessionId'],
  }
);

const updateAttendanceSchema = z.object({
  status: z.enum(['present', 'absent', 'late', 'excused']).optional(),
  joinedAt: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid datetime format').optional().nullable(),
  leftAt: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid datetime format').optional().nullable(),
  durationAttendedSeconds: z.number().int().nonnegative().optional().nullable(),
}).strict();

const attendanceListQuerySchema = listQuerySchema.extend({
  studentId: z.string().regex(/^\d+$/).transform(Number).optional(),
  attendanceType: z.enum(['batch_session', 'webinar']).optional(),
  batchSessionId: z.string().regex(/^\d+$/).transform(Number).optional(),
  webinarId: z.string().regex(/^\d+$/).transform(Number).optional(),
  status: z.enum(['present', 'absent', 'late', 'excused']).optional(),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date format').optional(),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date format').optional(),
  searchTerm: z.string().max(100).optional(),
  sortBy: z.string().max(50).optional().default('created_at'),
  sortDir: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional().default('ASC'),
});

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  idParamSchema,
  restoreSchema,
  bulkIdsSchema,
  listQuerySchema,
  createAttendanceSchema,
  updateAttendanceSchema,
  attendanceListQuerySchema,
};
