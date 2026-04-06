const express = require('express');
const validate = require('../../../middleware/validate.middleware');
const authenticate = require('../../../middleware/auth.middleware');
const { authorize } = require('../../../middleware/authorize.middleware');
const referralManagementController = require('../controllers/referralManagement.controller');
const {
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
} = require('../validators/referralManagement.validator');

const router = express.Router();

router.use(authenticate);

/**
 * Referrals Routes
 */

/**
 * GET /referral-management/referrals
 * Get all referrals with optional filtering and pagination
 */
router.get(
  '/referrals',
  validate(getReferralsSchema),
  authorize('referral.read'),
  referralManagementController.getReferrals
);

/**
 * POST /referral-management/referrals
 * Create a new referral
 */
router.post(
  '/referrals',
  validate(createReferralSchema),
  authorize('referral.create'),
  referralManagementController.createReferral
);

/**
 * PATCH /referral-management/referrals/:id
 * Update a referral
 */
router.patch(
  '/referrals/:id',
  validate(updateReferralSchema),
  authorize('referral.update'),
  referralManagementController.updateReferral
);

/**
 * DELETE /referral-management/referrals/:id
 * Delete a referral (soft delete)
 */
router.delete(
  '/referrals/:id',
  validate(deleteReferralSchema),
  authorize('referral.delete'),
  referralManagementController.deleteReferral
);

/**
 * POST /referral-management/referrals/:id/restore
 * Restore a deleted referral
 */
router.post(
  '/referrals/:id/restore',
  validate(restoreReferralSchema),
  authorize('referral.delete'),
  referralManagementController.restoreReferral
);

/**
 * Referral Rewards Routes
 */

/**
 * GET /referral-management/referral-rewards
 * Get all referral rewards with optional filtering and pagination
 */
router.get(
  '/referral-rewards',
  validate(getReferralRewardsSchema),
  authorize('referral_reward.read'),
  referralManagementController.getReferralRewards
);

/**
 * POST /referral-management/referral-rewards
 * Create a new referral reward
 */
router.post(
  '/referral-rewards',
  validate(createReferralRewardSchema),
  authorize('referral_reward.create'),
  referralManagementController.createReferralReward
);

/**
 * PATCH /referral-management/referral-rewards/:id
 * Update a referral reward
 */
router.patch(
  '/referral-rewards/:id',
  validate(updateReferralRewardSchema),
  authorize('referral_reward.update'),
  referralManagementController.updateReferralReward
);

/**
 * DELETE /referral-management/referral-rewards/:id
 * Delete a referral reward (soft delete)
 */
router.delete(
  '/referral-rewards/:id',
  validate(deleteReferralRewardSchema),
  authorize('referral_reward.delete'),
  referralManagementController.deleteReferralReward
);

/**
 * POST /referral-management/referral-rewards/:id/restore
 * Restore a deleted referral reward
 */
router.post(
  '/referral-rewards/:id/restore',
  validate(restoreReferralRewardSchema),
  authorize('referral_reward.delete'),
  referralManagementController.restoreReferralReward
);

module.exports = router;
