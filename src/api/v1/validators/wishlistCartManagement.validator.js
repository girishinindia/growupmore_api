/**
 * ═══════════════════════════════════════════════════════════════
 * WISHLIST & CART MANAGEMENT VALIDATORS — Zod Schemas
 * ═══════════════════════════════════════════════════════════════
 * Wishlists, Carts, and Cart Items validation schemas
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

const idsBodySchema = z.object({
  ids: z.array(coercePositiveInt).min(1, 'At least one ID is required'),
});

const listQuerySchema = z.object({
  page: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().regex(/^\d+$/).transform(Number).optional().default(1)),
  limit: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().regex(/^\d+$/).transform(Number).optional().default(20)),
  search: z.string().max(100).optional(),
  sortBy: z.string().max(50).optional(),
  sortDir: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional().default('DESC'),
});

// ============================================================================
// WISHLIST SCHEMAS
// ============================================================================

const createWishlistSchema = z.object({
  studentId: coercePositiveInt,
  itemType: z.enum(['course', 'bundle', 'batch', 'webinar'], { message: 'Item type must be one of: course, bundle, batch, webinar' }),
  courseId: coercePositiveInt.optional().nullable(),
  bundleId: coercePositiveInt.optional().nullable(),
  batchId: coercePositiveInt.optional().nullable(),
  webinarId: coercePositiveInt.optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

const updateWishlistSchema = z.object({
  isActive: z.boolean().optional(),
});

const wishlistListQuerySchema = listQuerySchema.extend({
  studentId: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().regex(/^\d+$/).transform(Number).optional()),
  itemType: z.enum(['course', 'bundle', 'batch', 'webinar']).optional(),
  courseId: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().regex(/^\d+$/).transform(Number).optional()),
  bundleId: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().regex(/^\d+$/).transform(Number).optional()),
  batchId: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().regex(/^\d+$/).transform(Number).optional()),
  webinarId: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().regex(/^\d+$/).transform(Number).optional()),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

// ============================================================================
// CART SCHEMAS
// ============================================================================

const createCartSchema = z.object({
  studentId: coercePositiveInt,
  currency: z.string().max(3).optional().default('INR'),
  expiresAt: z.string().datetime().optional().nullable(),
});

const updateCartSchema = z.object({
  couponId: coercePositiveInt.optional().nullable(),
  subtotal: z.number().positive().optional().nullable(),
  discountAmount: z.number().min(0).optional().nullable(),
  totalAmount: z.number().positive().optional().nullable(),
  cartStatus: z.string().max(50).optional().nullable(),
  convertedAt: z.string().datetime().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
});

const cartListQuerySchema = listQuerySchema.extend({
  studentId: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().regex(/^\d+$/).transform(Number).optional()),
  cartStatus: z.string().max(50).optional(),
  couponId: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().regex(/^\d+$/).transform(Number).optional()),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

// ============================================================================
// CART ITEM SCHEMAS
// ============================================================================

const createCartItemSchema = z.object({
  cartId: coercePositiveInt,
  itemType: z.enum(['course', 'bundle', 'batch', 'webinar'], { message: 'Item type must be one of: course, bundle, batch, webinar' }),
  courseId: coercePositiveInt.optional().nullable(),
  bundleId: coercePositiveInt.optional().nullable(),
  batchId: coercePositiveInt.optional().nullable(),
  webinarId: coercePositiveInt.optional().nullable(),
  displayOrder: z.number().int().min(0).optional().default(0),
});

const updateCartItemSchema = z.object({
  price: z.number().positive().optional().nullable(),
  displayOrder: z.number().int().min(0).optional(),
});

const cartItemListQuerySchema = listQuerySchema.extend({
  cartId: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().regex(/^\d+$/).transform(Number).optional()),
  itemType: z.enum(['course', 'bundle', 'batch', 'webinar']).optional(),
  courseId: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().regex(/^\d+$/).transform(Number).optional()),
  bundleId: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().regex(/^\d+$/).transform(Number).optional()),
  batchId: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().regex(/^\d+$/).transform(Number).optional()),
  webinarId: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().regex(/^\d+$/).transform(Number).optional()),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
}).omit({ sortDir: true }).extend({ sortDir: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional().default('ASC') });

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Shared
  idParamSchema,
  idsBodySchema,
  listQuerySchema,

  // Wishlists
  createWishlistSchema,
  updateWishlistSchema,
  wishlistListQuerySchema,

  // Carts
  createCartSchema,
  updateCartSchema,
  cartListQuerySchema,

  // Cart Items
  createCartItemSchema,
  updateCartItemSchema,
  cartItemListQuerySchema,
};
