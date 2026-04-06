const { z } = require('zod');
const { coercePositiveInt } = require('./shared/coerce');

// ============================================================================
// SHARED SCHEMAS
// ============================================================================

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a positive integer').transform(Number),
});

const restoreSchema = z.object({}).strict();

const bulkIdsSchema = z.object({
  ids: z.array(z.string().regex(/^\d+$/).transform(Number)).min(1, 'At least one ID is required'),
}).strict();

const listQuerySchema = z.object({
  page: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().regex(/^\d+$/).transform(Number).optional().default(1)),
  limit: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().regex(/^\d+$/).transform(Number).optional().default(20)),
});

// ============================================================================
// COURSE REVIEWS SCHEMAS
// ============================================================================

const createCourseReviewSchema = z.object({
  studentId: coercePositiveInt,
  courseId: coercePositiveInt,
  enrollmentId: coercePositiveInt,
  rating: z.number().int().min(1).max(5),
  title: z.string().max(500).trim().optional().nullable(),
  reviewText: z.string().max(5000).optional().nullable(),
  isVerifiedPurchase: z.boolean().optional().default(true),
}).strict();

const updateCourseReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(500).trim().optional().nullable(),
  reviewText: z.string().max(5000).optional().nullable(),
  reviewStatus: z.enum(['pending', 'approved', 'rejected']).optional().nullable(),
  isVerifiedPurchase: z.boolean().optional(),
  helpfulCount: z.number().int().nonnegative().optional().nullable(),
  reportedCount: z.number().int().nonnegative().optional().nullable(),
  approvedBy: coercePositiveInt.optional().nullable(),
  approvedAt: z.string().datetime().optional().nullable(),
}).strict();

const courseReviewListQuerySchema = listQuerySchema.extend({
  studentId: z.string().regex(/^\d+$/).transform(Number).optional(),
  courseId: z.string().regex(/^\d+$/).transform(Number).optional(),
  enrollmentId: z.string().regex(/^\d+$/).transform(Number).optional(),
  rating: z.string().regex(/^[1-5]$/).transform(Number).optional(),
  minRating: z.string().regex(/^[1-5]$/).transform(Number).optional(),
  maxRating: z.string().regex(/^[1-5]$/).transform(Number).optional(),
  reviewStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
  isVerifiedPurchase: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  searchTerm: z.string().max(500).optional(),
  sortBy: z.string().max(100).optional().default('reviewed_at'),
  sortDir: z.enum(['ASC', 'DESC']).optional().default('ASC'),
});

// ============================================================================
// VALIDATORS EXPORT
// ============================================================================

module.exports = {
  idParamSchema,
  restoreSchema,
  bulkIdsSchema,
  listQuerySchema,
  createCourseReviewSchema,
  updateCourseReviewSchema,
  courseReviewListQuerySchema,
};
