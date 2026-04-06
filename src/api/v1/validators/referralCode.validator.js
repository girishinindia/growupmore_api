/**
 * ═══════════════════════════════════════════════════════════════
 * REFERRAL CODE VALIDATORS — Zod Schemas
 * ═══════════════════════════════════════════════════════════════
 * Referral Codes validation schemas
 * ═══════════════════════════════════════════════════════════════
 */

const { z } = require('zod');

// ============================================================================
// SHARED SCHEMAS
// ============================================================================

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a positive integer').transform(Number),
});

const listQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
  sortBy: z.string().max(50).optional().default('created_at'),
  sortDir: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional().default('DESC'),
});

// ============================================================================
// REFERRAL CODE SCHEMAS
// ============================================================================

const createReferralCodeSchema = z.object({
  studentId: z.number().int().positive('Student ID is required'),
  referralCode: z.string().min(1).max(100).trim(),
  discountPercentage: z.number().min(0).max(100).optional().default(20.00),
  maxDiscountAmount: z.number().positive().optional().nullable(),
  referrerRewardPercentage: z.number().min(0).max(100).optional().default(10.00),
  referrerRewardType: z.enum(['wallet_credit', 'cash_bonus', 'discount_code', 'other']).optional().default('wallet_credit'),
  isActive: z.boolean().optional().default(true),
});

const updateReferralCodeSchema = z.object({
  discountPercentage: z.number().min(0).max(100).optional(),
  maxDiscountAmount: z.number().positive().optional().nullable(),
  referrerRewardPercentage: z.number().min(0).max(100).optional(),
  referrerRewardType: z.enum(['wallet_credit', 'cash_bonus', 'discount_code', 'other']).optional().nullable(),
  isActive: z.boolean().optional(),
});

const referralCodeListQuerySchema = listQuerySchema.extend({
  studentId: z.string().regex(/^\d+$/).transform(Number).optional(),
  referrerRewardType: z.enum(['wallet_credit', 'cash_bonus', 'discount_code', 'other']).optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Shared
  idParamSchema,
  listQuerySchema,

  // Referral Codes
  createReferralCodeSchema,
  updateReferralCodeSchema,
  referralCodeListQuerySchema,
};
