const { z } = require('zod');
const { coercePositiveInt } = require('./shared/coerce');

// ============================================================================
// SHARED SCHEMAS
// ============================================================================

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a positive integer').transform(Number),
});

const restoreSchema = z.object({
  restoreTranslations: z.boolean().optional().default(false),
}).strict();

const bulkIdsSchema = z.object({
  ids: z.array(coercePositiveInt).min(1),
}).strict();

// ============================================================================
// COUPON SCHEMAS
// ============================================================================

const createCouponSchema = z.object({
  code: z.string().min(1).max(100).trim(),
  discountType: z.enum(['percentage', 'fixed_amount']),
  discountValue: z.number().nonnegative(),
  minPurchaseAmount: z.number().nonnegative().nullable().optional(),
  maxDiscountAmount: z.number().nonnegative().nullable().optional(),
  applicableTo: z.enum(['all', 'course', 'bundle', 'batch', 'webinar']).default('all'),
  usageLimit: coercePositiveInt.nullable().optional(),
  usagePerUser: coercePositiveInt.optional().default(1),
  validFrom: z.string().datetime().nullable().optional(),
  validUntil: z.string().datetime().nullable().optional(),
  isActive: z.boolean().optional().default(true),
}).strict();

const updateCouponSchema = z.object({
  discountValue: z.number().nonnegative().optional(),
  minPurchaseAmount: z.number().nonnegative().nullable().optional(),
  maxDiscountAmount: z.number().nonnegative().nullable().optional(),
  usageLimit: coercePositiveInt.nullable().optional(),
  usagePerUser: coercePositiveInt.optional(),
  validFrom: z.string().datetime().nullable().optional(),
  validUntil: z.string().datetime().nullable().optional(),
  isActive: z.boolean().optional(),
}).strict();

const couponListQuerySchema = z.object({
  page: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().regex(/^\d+$/).transform(Number).optional().default(1)),
  limit: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().regex(/^\d+$/).transform(Number).optional().default(20)),
  search: z.string().max(500).optional(),
  sortBy: z.string().max(50).optional().default('id'),
  sortDir: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional().default('ASC'),
  code: z.string().optional(),
  discountType: z.string().optional(),
  applicableTo: z.string().optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

// ============================================================================
// COUPON TRANSLATION SCHEMAS
// ============================================================================

const createCouponTranslationSchema = z.object({
  couponId: coercePositiveInt,
  languageId: coercePositiveInt,
  title: z.string().min(1).max(500).trim(),
  description: z.string().max(5000).nullable().optional(),
  isActive: z.boolean().optional().default(true),
}).strict();

const updateCouponTranslationSchema = z.object({
  title: z.string().min(1).max(500).trim().optional(),
  description: z.string().max(5000).nullable().optional(),
  isActive: z.boolean().optional(),
}).strict();

// ============================================================================
// COUPON COURSE SCHEMAS
// ============================================================================

const createCouponCourseSchema = z.object({
  couponId: coercePositiveInt,
  courseId: coercePositiveInt,
  displayOrder: z.number().int().nonnegative().optional().default(0),
  isActive: z.boolean().optional().default(true),
}).strict();

const updateCouponCourseSchema = z.object({
  displayOrder: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
}).strict();

const couponCourseListQuerySchema = z.object({
  page: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().regex(/^\d+$/).transform(Number).optional().default(1)),
  limit: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().regex(/^\d+$/).transform(Number).optional().default(20)),
  couponId: z.string().regex(/^\d+$/).transform(Number).optional(),
  courseId: z.string().regex(/^\d+$/).transform(Number).optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  search: z.string().max(500).optional(),
  sortBy: z.string().max(50).optional().default('display_order'),
  sortDir: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional().default('ASC'),
});

// ============================================================================
// COUPON BUNDLE SCHEMAS
// ============================================================================

const createCouponBundleSchema = z.object({
  couponId: coercePositiveInt,
  bundleId: coercePositiveInt,
  displayOrder: z.number().int().nonnegative().optional().default(0),
  isActive: z.boolean().optional().default(true),
}).strict();

const updateCouponBundleSchema = z.object({
  displayOrder: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
}).strict();

const couponBundleListQuerySchema = z.object({
  page: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().regex(/^\d+$/).transform(Number).optional().default(1)),
  limit: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().regex(/^\d+$/).transform(Number).optional().default(20)),
  couponId: z.string().regex(/^\d+$/).transform(Number).optional(),
  bundleId: z.string().regex(/^\d+$/).transform(Number).optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  search: z.string().max(500).optional(),
  sortBy: z.string().max(50).optional().default('display_order'),
  sortDir: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional().default('ASC'),
});

// ============================================================================
// COUPON BATCH SCHEMAS
// ============================================================================

const createCouponBatchSchema = z.object({
  couponId: coercePositiveInt,
  batchId: coercePositiveInt,
  displayOrder: z.number().int().nonnegative().optional().default(0),
  isActive: z.boolean().optional().default(true),
}).strict();

const updateCouponBatchSchema = z.object({
  displayOrder: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
}).strict();

const couponBatchListQuerySchema = z.object({
  page: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().regex(/^\d+$/).transform(Number).optional().default(1)),
  limit: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().regex(/^\d+$/).transform(Number).optional().default(20)),
  couponId: z.string().regex(/^\d+$/).transform(Number).optional(),
  batchId: z.string().regex(/^\d+$/).transform(Number).optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  search: z.string().max(500).optional(),
  sortBy: z.string().max(50).optional().default('display_order'),
  sortDir: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional().default('ASC'),
});

// ============================================================================
// COUPON WEBINAR SCHEMAS
// ============================================================================

const createCouponWebinarSchema = z.object({
  couponId: coercePositiveInt,
  webinarId: coercePositiveInt,
  displayOrder: z.number().int().nonnegative().optional().default(0),
  isActive: z.boolean().optional().default(true),
}).strict();

const updateCouponWebinarSchema = z.object({
  displayOrder: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
}).strict();

const couponWebinarListQuerySchema = z.object({
  page: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().regex(/^\d+$/).transform(Number).optional().default(1)),
  limit: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().regex(/^\d+$/).transform(Number).optional().default(20)),
  couponId: z.string().regex(/^\d+$/).transform(Number).optional(),
  webinarId: z.string().regex(/^\d+$/).transform(Number).optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  search: z.string().max(500).optional(),
  sortBy: z.string().max(50).optional().default('display_order'),
  sortDir: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional().default('ASC'),
});

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Shared
  idParamSchema,
  restoreSchema,
  bulkIdsSchema,
  // Coupons
  createCouponSchema,
  updateCouponSchema,
  couponListQuerySchema,
  // Coupon Translations
  createCouponTranslationSchema,
  updateCouponTranslationSchema,
  // Coupon Courses
  createCouponCourseSchema,
  updateCouponCourseSchema,
  couponCourseListQuerySchema,
  // Coupon Bundles
  createCouponBundleSchema,
  updateCouponBundleSchema,
  couponBundleListQuerySchema,
  // Coupon Batches
  createCouponBatchSchema,
  updateCouponBatchSchema,
  couponBatchListQuerySchema,
  // Coupon Webinars
  createCouponWebinarSchema,
  updateCouponWebinarSchema,
  couponWebinarListQuerySchema,
};
