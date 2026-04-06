/**
 * ═══════════════════════════════════════════════════════════════
 * PROMOTION MANAGEMENT VALIDATORS — Zod Schemas
 * ═══════════════════════════════════════════════════════════════
 * Instructor Promotions, Translations, Courses validation schemas
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
});

// ============================================================================
// INSTRUCTOR PROMOTION SCHEMAS
// ============================================================================

const createInstructorPromotionSchema = z.object({
  instructorId: coercePositiveInt,
  discountType: z.enum(['percentage', 'fixed_amount']),
  discountValue: z.number().positive('Discount value must be positive'),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime(),
  promoCode: z.string().max(50).optional().nullable(),
  maxDiscountAmount: z.number().positive().optional().nullable(),
  minPurchaseAmount: z.number().positive().optional().nullable(),
  applicableTo: z.string().max(50).optional().default('all_my_courses'),
  usageLimit: coercePositiveInt.optional().nullable(),
  usagePerUser: coercePositiveInt.optional().default(1),
  promotionStatus: z.enum(['draft', 'pending_approval', 'approved', 'rejected', 'active', 'inactive']).optional().default('draft'),
  requiresApproval: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true),
});

const updateInstructorPromotionSchema = z.object({
  discountType: z.enum(['percentage', 'fixed_amount']).optional(),
  discountValue: z.number().positive().optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
  promoCode: z.string().max(50).optional().nullable(),
  maxDiscountAmount: z.number().positive().optional().nullable(),
  minPurchaseAmount: z.number().positive().optional().nullable(),
  applicableTo: z.string().max(50).optional().nullable(),
  usageLimit: coercePositiveInt.optional().nullable(),
  usagePerUser: coercePositiveInt.optional().nullable(),
  promotionStatus: z.enum(['draft', 'pending_approval', 'approved', 'rejected', 'active', 'inactive']).optional(),
  requiresApproval: z.boolean().optional(),
  approvedBy: coercePositiveInt.optional().nullable(),
  approvedAt: z.string().datetime().optional().nullable(),
  rejectionReason: z.string().max(1000).optional().nullable(),
  isActive: z.boolean().optional(),
});

const instructorPromotionListQuerySchema = listQuerySchema.extend({
  instructorId: z.string().regex(/^\d+$/).transform(Number).optional(),
  promotionStatus: z.string().max(50).optional(),
  discountType: z.enum(['percentage', 'fixed_amount']).optional(),
  applicableTo: z.string().max(50).optional(),
  promoCode: z.string().max(50).optional(),
  validFromStart: z.string().datetime().optional(),
  validFromEnd: z.string().datetime().optional(),
  validUntilStart: z.string().datetime().optional(),
  validUntilEnd: z.string().datetime().optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

// ============================================================================
// INSTRUCTOR PROMOTION TRANSLATION SCHEMAS
// ============================================================================

const createInstructorPromotionTranslationSchema = z.object({
  promotionId: coercePositiveInt,
  languageId: coercePositiveInt,
  promotionName: z.string().min(1).max(500).trim(),
  description: z.string().max(2000).optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

const updateInstructorPromotionTranslationSchema = z.object({
  promotionName: z.string().min(1).max(500).trim().optional(),
  description: z.string().max(2000).optional().nullable(),
  isActive: z.boolean().optional(),
});

// ============================================================================
// INSTRUCTOR PROMOTION COURSE SCHEMAS
// ============================================================================

const createInstructorPromotionCourseSchema = z.object({
  promotionId: coercePositiveInt,
  courseId: coercePositiveInt,
  displayOrder: z.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

const updateInstructorPromotionCourseSchema = z.object({
  displayOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

const promotionCourseListQuerySchema = listQuerySchema.extend({
  promotionId: z.string().regex(/^\d+$/).transform(Number).optional(),
  courseId: z.string().regex(/^\d+$/).transform(Number).optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Shared
  idParamSchema,
  listQuerySchema,

  // Instructor Promotions
  createInstructorPromotionSchema,
  updateInstructorPromotionSchema,
  instructorPromotionListQuerySchema,

  // Instructor Promotion Translations
  createInstructorPromotionTranslationSchema,
  updateInstructorPromotionTranslationSchema,

  // Instructor Promotion Courses
  createInstructorPromotionCourseSchema,
  updateInstructorPromotionCourseSchema,
  promotionCourseListQuerySchema,
};
