const { z } = require('zod');

const getReferralsSchema = z.object({
  query: z.object({
    id: z.preprocess(
      (val) => (val !== undefined ? BigInt(val) : undefined),
      z.bigint().optional()
    ),
    referralCodeId: z.preprocess(
      (val) => (val !== undefined ? BigInt(val) : undefined),
      z.bigint().optional()
    ),
    referredStudentId: z.preprocess(
      (val) => (val !== undefined ? BigInt(val) : undefined),
      z.bigint().optional()
    ),
    referralStatus: z.string().optional(),
    referrerRewardStatus: z.string().optional(),
    sortBy: z.string().optional().default('created_at'),
    sortDir: z.enum(['ASC', 'DESC']).optional().default('DESC'),
    page: z.preprocess(
      (val) => (val !== undefined ? String(val) : undefined),
      z.string().regex(/^\d+$/).transform(Number).optional().default(1)
    ),
    limit: z.preprocess(
      (val) => (val !== undefined ? String(val) : undefined),
      z.string().regex(/^\d+$/).transform(Number).optional().default(20)
    ),
  }),
});

const createReferralSchema = z.object({
  body: z.object({
    referralCodeId: z.bigint({ message: 'referralCodeId must be a valid BigInt' }),
    referredStudentId: z.bigint({ message: 'referredStudentId must be a valid BigInt' }),
    referralStatus: z.string().optional().default('pending'),
    orderId: z.preprocess(
      (val) => (val !== undefined && val !== null ? BigInt(val) : null),
      z.bigint().nullable().optional()
    ),
  }),
});

const updateReferralSchema = z.object({
  params: z.object({
    id: z.preprocess((val) => BigInt(val), z.bigint()),
  }),
  body: z.object({
    referralStatus: z.string().optional(),
    discountAmount: z.number().optional(),
    referrerRewardAmount: z.number().optional(),
    referrerRewardStatus: z.string().optional(),
    completedAt: z.string().datetime().optional(),
    isActive: z.boolean().optional(),
  }).strict(),
});

const deleteReferralSchema = z.object({
  params: z.object({
    id: z.preprocess((val) => BigInt(val), z.bigint()),
  }),
});

const restoreReferralSchema = z.object({
  params: z.object({
    id: z.preprocess((val) => BigInt(val), z.bigint()),
  }),
});

const getReferralRewardsSchema = z.object({
  query: z.object({
    id: z.preprocess(
      (val) => (val !== undefined ? BigInt(val) : undefined),
      z.bigint().optional()
    ),
    referralId: z.preprocess(
      (val) => (val !== undefined ? BigInt(val) : undefined),
      z.bigint().optional()
    ),
    studentId: z.preprocess(
      (val) => (val !== undefined ? BigInt(val) : undefined),
      z.bigint().optional()
    ),
    rewardType: z.string().optional(),
    rewardStatus: z.string().optional(),
    sortBy: z.string().optional().default('created_at'),
    sortDir: z.enum(['ASC', 'DESC']).optional().default('DESC'),
    page: z.preprocess(
      (val) => (val !== undefined ? String(val) : undefined),
      z.string().regex(/^\d+$/).transform(Number).optional().default(1)
    ),
    limit: z.preprocess(
      (val) => (val !== undefined ? String(val) : undefined),
      z.string().regex(/^\d+$/).transform(Number).optional().default(20)
    ),
  }),
});

const createReferralRewardSchema = z.object({
  body: z.object({
    referralId: z.bigint({ message: 'referralId must be a valid BigInt' }),
    studentId: z.bigint({ message: 'studentId must be a valid BigInt' }),
    rewardAmount: z.number({ message: 'rewardAmount must be a valid number' }),
    rewardType: z.string().optional().default('wallet_credit'),
    discountCode: z.string().optional(),
    expiresAt: z.string().datetime().optional(),
  }),
});

const updateReferralRewardSchema = z.object({
  params: z.object({
    id: z.preprocess((val) => BigInt(val), z.bigint()),
  }),
  body: z.object({
    rewardType: z.string().optional(),
    rewardAmount: z.number().optional(),
    discountCode: z.string().optional(),
    rewardStatus: z.string().optional(),
    creditedAt: z.string().datetime().optional(),
    redeemedAt: z.string().datetime().optional(),
    isActive: z.boolean().optional(),
  }).strict(),
});

const deleteReferralRewardSchema = z.object({
  params: z.object({
    id: z.preprocess((val) => BigInt(val), z.bigint()),
  }),
});

const restoreReferralRewardSchema = z.object({
  params: z.object({
    id: z.preprocess((val) => BigInt(val), z.bigint()),
  }),
});

module.exports = {
  getReferralsSchema,
  createReferralSchema,
  updateReferralSchema,
  deleteReferralSchema,
  restoreReferralSchema,
  getReferralRewardsSchema,
  createReferralRewardSchema,
  updateReferralRewardSchema,
  deleteReferralRewardSchema,
  restoreReferralRewardSchema,
};
