const referralManagementRepository = require('../repositories/referralManagement.repository');

class ReferralManagementService {
  /**
   * Get referrals with optional filtering and pagination
   */
  async getReferrals({
    id = null,
    referralCodeId = null,
    referredStudentId = null,
    referralStatus = null,
    referrerRewardStatus = null,
    sortColumn = 'created_at',
    sortDirection = 'DESC',
    page = 1,
    limit = 20,
  }) {
    return referralManagementRepository.getReferrals({
      id,
      referralCodeId,
      referredStudentId,
      referralStatus,
      referrerRewardStatus,
      sortColumn,
      sortDirection,
      pageIndex: page,
      pageSize: limit,
    });
  }

  /**
   * Get referral by ID
   */
  async getReferralById(id) {
    const referrals = await referralManagementRepository.getReferrals({
      id,
    });
    return referrals.length > 0 ? referrals[0] : null;
  }

  /**
   * Create a new referral
   */
  async createReferral(referralCodeId, referredStudentId, referralStatus = 'pending', orderId = null, actingUserId = null) {
    return referralManagementRepository.insertReferral(
      referralCodeId,
      referredStudentId,
      referralStatus,
      orderId,
      actingUserId
    );
  }

  /**
   * Update a referral
   */
  async updateReferral(id, updates, actingUserId = null) {
    const {
      referralStatus = null,
      discountAmount = null,
      referrerRewardAmount = null,
      referrerRewardStatus = null,
      completedAt = null,
      isActive = null,
    } = updates;

    await referralManagementRepository.updateReferral(
      id,
      referralStatus,
      discountAmount,
      referrerRewardAmount,
      referrerRewardStatus,
      completedAt,
      isActive,
      actingUserId
    );
  }

  /**
   * Delete a referral (soft delete)
   */
  async deleteReferral(id, actingUserId = null) {
    await referralManagementRepository.deleteReferral(id, actingUserId);
  }

  /**
   * Restore a deleted referral
   */
  async restoreReferral(id, actingUserId = null) {
    await referralManagementRepository.restoreReferral(id, actingUserId);
  }

  /**
   * Get referral rewards with optional filtering and pagination
   */
  async getReferralRewards({
    id = null,
    referralId = null,
    studentId = null,
    rewardType = null,
    rewardStatus = null,
    sortColumn = 'created_at',
    sortDirection = 'DESC',
    page = 1,
    limit = 20,
  }) {
    return referralManagementRepository.getReferralRewards({
      id,
      referralId,
      studentId,
      rewardType,
      rewardStatus,
      sortColumn,
      sortDirection,
      pageIndex: page,
      pageSize: limit,
    });
  }

  /**
   * Get referral reward by ID
   */
  async getReferralRewardById(id) {
    const rewards = await referralManagementRepository.getReferralRewards({
      id,
    });
    return rewards.length > 0 ? rewards[0] : null;
  }

  /**
   * Create a new referral reward
   */
  async createReferralReward(referralId, studentId, rewardAmount, rewardType = 'wallet_credit', discountCode = null, expiresAt = null, actingUserId = null) {
    return referralManagementRepository.insertReferralReward(
      referralId,
      studentId,
      rewardAmount,
      rewardType,
      discountCode,
      expiresAt,
      actingUserId
    );
  }

  /**
   * Update a referral reward
   */
  async updateReferralReward(id, updates, actingUserId = null) {
    const {
      rewardType = null,
      rewardAmount = null,
      discountCode = null,
      rewardStatus = null,
      creditedAt = null,
      redeemedAt = null,
      isActive = null,
    } = updates;

    await referralManagementRepository.updateReferralReward(
      id,
      rewardType,
      rewardAmount,
      discountCode,
      rewardStatus,
      creditedAt,
      redeemedAt,
      isActive,
      actingUserId
    );
  }

  /**
   * Delete a referral reward (soft delete)
   */
  async deleteReferralReward(id, actingUserId = null) {
    await referralManagementRepository.deleteReferralReward(id, actingUserId);
  }

  /**
   * Restore a deleted referral reward
   */
  async restoreReferralReward(id, actingUserId = null) {
    await referralManagementRepository.restoreReferralReward(id, actingUserId);
  }
}

module.exports = new ReferralManagementService();
