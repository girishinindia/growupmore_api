const { sendSuccess, sendCreated } = require('../../../utils/response');
const referralManagementService = require('../../../services/referralManagement.service');

class ReferralManagementController {
  /**
   * Get all referrals with optional filtering and pagination
   */
  async getReferrals(req, res, next) {
    try {
      const {
        id,
        referralCodeId,
        referredStudentId,
        referralStatus,
        referrerRewardStatus,
        sortBy = 'created_at',
        sortDir = 'DESC',
        page = 1,
        limit = 20,
      } = req.query;

      const data = await referralManagementService.getReferrals({
        id: id || null,
        referralCodeId: referralCodeId || null,
        referredStudentId: referredStudentId || null,
        referralStatus: referralStatus || null,
        referrerRewardStatus: referrerRewardStatus || null,
        sortColumn: sortBy,
        sortDirection: sortDir,
        page: Number(page),
        limit: Number(limit),
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, { data, message: 'Referrals retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new referral
   */
  async createReferral(req, res, next) {
    try {
      const { referralCodeId, referredStudentId, referralStatus, orderId } = req.body;
      const actingUserId = req.user.userId;

      const referralId = await referralManagementService.createReferral(
        referralCodeId,
        referredStudentId,
        referralStatus,
        orderId || null,
        actingUserId
      );

      sendCreated(res, { data: { id: referralId }, message: 'Referral created successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a referral
   */
  async updateReferral(req, res, next) {
    try {
      const { id } = req.params;
      const actingUserId = req.user.userId;

      await referralManagementService.updateReferral(id, req.body, actingUserId);

      sendSuccess(res, { message: 'Referral updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a referral (soft delete)
   */
  async deleteReferral(req, res, next) {
    try {
      const { id } = req.params;
      const actingUserId = req.user.userId;

      await referralManagementService.deleteReferral(id, actingUserId);

      sendSuccess(res, { message: 'Referral deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Restore a deleted referral
   */
  async restoreReferral(req, res, next) {
    try {
      const { id } = req.params;
      const actingUserId = req.user.userId;

      await referralManagementService.restoreReferral(id, actingUserId);

      sendSuccess(res, { message: 'Referral restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all referral rewards with optional filtering and pagination
   */
  async getReferralRewards(req, res, next) {
    try {
      const {
        id,
        referralId,
        studentId,
        rewardType,
        rewardStatus,
        sortBy = 'created_at',
        sortDir = 'DESC',
        page = 1,
        limit = 20,
      } = req.query;

      const data = await referralManagementService.getReferralRewards({
        id: id || null,
        referralId: referralId || null,
        studentId: studentId || null,
        rewardType: rewardType || null,
        rewardStatus: rewardStatus || null,
        sortColumn: sortBy,
        sortDirection: sortDir,
        page: Number(page),
        limit: Number(limit),
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, { data, message: 'Referral rewards retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new referral reward
   */
  async createReferralReward(req, res, next) {
    try {
      const { referralId, studentId, rewardAmount, rewardType, discountCode, expiresAt } = req.body;
      const actingUserId = req.user.userId;

      const rewardId = await referralManagementService.createReferralReward(
        referralId,
        studentId,
        rewardAmount,
        rewardType,
        discountCode || null,
        expiresAt || null,
        actingUserId
      );

      sendCreated(res, { data: { id: rewardId }, message: 'Referral reward created successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a referral reward
   */
  async updateReferralReward(req, res, next) {
    try {
      const { id } = req.params;
      const actingUserId = req.user.userId;

      await referralManagementService.updateReferralReward(id, req.body, actingUserId);

      sendSuccess(res, { message: 'Referral reward updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a referral reward (soft delete)
   */
  async deleteReferralReward(req, res, next) {
    try {
      const { id } = req.params;
      const actingUserId = req.user.userId;

      await referralManagementService.deleteReferralReward(id, actingUserId);

      sendSuccess(res, { message: 'Referral reward deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Restore a deleted referral reward
   */
  async restoreReferralReward(req, res, next) {
    try {
      const { id } = req.params;
      const actingUserId = req.user.userId;

      await referralManagementService.restoreReferralReward(id, actingUserId);

      sendSuccess(res, { message: 'Referral reward restored successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReferralManagementController();
