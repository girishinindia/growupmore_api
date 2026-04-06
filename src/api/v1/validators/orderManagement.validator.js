/**
 * ═══════════════════════════════════════════════════════════════
 * ORDER MANAGEMENT VALIDATORS — Zod Schemas
 * ═══════════════════════════════════════════════════════════════
 * Orders and Order Items validation schemas
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
  page: z.preprocess(
    (val) => (val !== undefined ? String(val) : undefined),
    z.string().regex(/^\d+$/).transform(Number).optional().default('1')
  ),
  limit: z.preprocess(
    (val) => (val !== undefined ? String(val) : undefined),
    z.string().regex(/^\d+$/).transform(Number).optional().default('20')
  ),
  sortBy: z.string().max(50).optional().default('created_at'),
  sortDir: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional().default('DESC'),
});

// ============================================================================
// ORDER SCHEMAS
// ============================================================================

const createOrderSchema = z.object({
  studentId: coercePositiveInt,
  orderNumber: z.string().max(100).optional().nullable(),
  cartId: z.number().int().optional().nullable(),
  orderStatus: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded']).optional().default('pending'),
  subtotal: z.number().min(0).optional().default(0.00),
  discountAmount: z.number().min(0).optional().default(0.00),
  taxAmount: z.number().min(0).optional().default(0.00),
  totalAmount: z.number().min(0).optional().default(0.00),
  currency: z.string().length(3).optional().default('INR'),
  couponId: z.number().int().optional().nullable(),
  couponCode: z.string().max(100).optional().nullable(),
  paymentMethod: z.string().max(50).optional().nullable(),
  paymentGateway: z.string().max(50).optional().nullable(),
  gatewayTransactionId: z.string().max(255).optional().nullable(),
  gatewayResponse: z.record(z.any()).optional().nullable(),
  paidAt: z.string().datetime().optional().nullable(),
  refundedAt: z.string().datetime().optional().nullable(),
  refundAmount: z.number().min(0).optional().nullable(),
  refundReason: z.string().max(500).optional().nullable(),
  billingName: z.string().max(255).optional().nullable(),
  billingEmail: z.string().email().optional().nullable(),
  billingPhone: z.string().max(20).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

const updateOrderSchema = z.object({
  orderStatus: z.enum(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded']).optional(),
  subtotal: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  taxAmount: z.number().min(0).optional(),
  totalAmount: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  couponId: z.number().int().optional().nullable(),
  couponCode: z.string().max(100).optional().nullable(),
  paymentMethod: z.string().max(50).optional().nullable(),
  paymentGateway: z.string().max(50).optional().nullable(),
  gatewayTransactionId: z.string().max(255).optional().nullable(),
  gatewayResponse: z.record(z.any()).optional().nullable(),
  paidAt: z.string().datetime().optional().nullable(),
  refundedAt: z.string().datetime().optional().nullable(),
  refundAmount: z.number().min(0).optional().nullable(),
  refundReason: z.string().max(500).optional().nullable(),
  billingName: z.string().max(255).optional().nullable(),
  billingEmail: z.string().email().optional().nullable(),
  billingPhone: z.string().max(20).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  isActive: z.boolean().optional(),
});

const restoreOrderSchema = z.object({
  restoreItems: z.boolean().optional().default(false),
});

const orderListQuerySchema = listQuerySchema.extend({
  studentId: z.string().regex(/^\d+$/).transform(Number).optional(),
  orderStatus: z.string().max(50).optional(),
  paymentMethod: z.string().max(50).optional(),
  paymentGateway: z.string().max(50).optional(),
  couponId: z.string().regex(/^\d+$/).transform(Number).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  searchTerm: z.string().max(255).optional(),
});

// ============================================================================
// ORDER ITEM SCHEMAS
// ============================================================================

const createOrderItemSchema = z.object({
  orderId: coercePositiveInt,
  itemType: z.enum(['course', 'bundle', 'batch', 'webinar']),
  courseId: z.number().int().optional().nullable(),
  bundleId: z.number().int().optional().nullable(),
  batchId: z.number().int().optional().nullable(),
  webinarId: z.number().int().optional().nullable(),
  price: z.number().min(0).optional().default(0.00),
  discountAmount: z.number().min(0).optional().default(0.00),
  finalPrice: z.number().min(0).optional().default(0.00),
  isActive: z.boolean().optional().default(true),
});

const updateOrderItemSchema = z.object({
  price: z.number().min(0).optional(),
  discountAmount: z.number().min(0).optional(),
  finalPrice: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Shared
  idParamSchema,
  listQuerySchema,

  // Orders
  createOrderSchema,
  updateOrderSchema,
  restoreOrderSchema,
  orderListQuerySchema,

  // Order Items
  createOrderItemSchema,
  updateOrderItemSchema,
};
