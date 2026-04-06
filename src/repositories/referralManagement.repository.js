const { supabase } = require('../config/database');
const logger = require('../config/logger');

class ReferralManagementRepository {
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
    pageIndex = 1,
    pageSize = null,
  }) {
    const { data, error } = await supabase.rpc('udf_get_referrals', {
      p_id: id,
      p_referral_code_id: referralCodeId,
      p_referred_student_id: referredStudentId,
      p_referral_status: referralStatus,
      p_referrer_reward_status: referrerRewardStatus,
      p_sort_column: sortColumn,
      p_sort_direction: sortDirection,
      p_page_index: pageIndex,
      p_page_size: pageSize,
    });

    if (error) throw new Error(`Failed to get referrals: ${error.message}`);
    return data || [];
  }

  /**
   * Insert a new referral
   */
  async insertReferral(referralCodeId, referredStudentId, referralStatus = 'pending', orderId = null, createdBy = null) {
    const { data, error } = await supabase.rpc('sp_referrals_insert', {
      p_referral_code_id: referralCodeId,
      p_referred_student_id: referredStudentId,
      p_referral_status: referralStatus,
      p_order_id: orderId,
      p_created_by: createdBy,
    });

    if (error) throw new Error(`Failed to insert referral: ${error.message}`);
    return data;
  }

  /**
   * Update a referral
   */
  async updateReferral(
    id,
    referralStatus = null,
    discountAmount = null,
    referrerRewardAmount = null,
    referrerRewardStatus = null,
    completedAt = null,
    isActive = null,
    updatedBy = null
  ) {
    const { error } = await supabase.rpc('sp_referrals_update', {
      p_id: id,
      p_referral_status: referralStatus,
      p_discount_amount: discountAmount,
      p_referrer_reward_amount: referrerRewardAmount,
      p_referrer_reward_status: referrerRewardStatus,
      p_completed_at: completedAt,
      p_is_active: isActive,
      p_updated_by: updatedBy,
    });

    if (error) throw new Error(`Failed to update referral: ${error.message}`);
  }

  /**
   * Delete a referral (soft delete)
   */
  async deleteReferral(id, deletedBy = null) {
    const { error } = await supabase.rpc('sp_referrals_delete', {
      p_id: id,
      p_deleted_by: deletedBy,
    });

    if (error) throw new Error(`Failed to delete referral: ${error.message}`);
  }

  /**
   * Restore a deleted referral
   */
  async restoreReferral(id, restoredBy = null) {
    const { error } = await supabase.rpc('sp_referrals_restore', {
      p_id: id,
      p_restored_by: restoredBy,
    });

    if (error) throw new Error(`Failed to restore referral: ${error.message}`);
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
    pageIndex = 1,
    pageSize = null,
  }) {
    const { data, error } = await supabase.rpc('udf_get_referral_rewards', {
      p_id: id,
      p_referral_id: referralId,
      p_student_id: studentId,
      p_reward_type: rewardType,
      p_reward_status: rewardStatus,
      p_sort_column: sortColumn,
      p_sort_direction: sortDirection,
      p_page_index: pageIndex,
      p_page_size: pageSize,
    });

    if (error) throw new Error(`Failed to get referral rewards: ${error.message}`);
    return data || [];
  }

  /**
   * Insert a new referral reward
   */
  async insertReferralReward(referralId, studentId, rewardAmount, rewardType = 'wallet_credit', discountCode = null, expiresAt = null, createdBy = null) {
    const { data, error } = await supabase.rpc('sp_referral_rewards_insert', {
      p_referral_id: referralId,
      p_student_id: studentId,
      p_reward_amount: rewardAmount,
      p_reward_type: rewardType,
      p_discount_code: discountCode,
      p_expires_at: expiresAt,
      p_created_by: createdBy,
    });

    if (error) throw new Error(`Failed to insert referral reward: ${error.message}`);
    return data;
  }

  /**
   * Update a referral reward
   */
  async updateReferralReward(
    id,
    rewardType = null,
    rewardAmount = null,
    discountCode = null,
    rewardStatus = null,
    creditedAt = null,
    redeemedAt = null,
    isActive = null,
    updatedBy = null
  ) {
    const { error } = await supabase.rpc('sp_referral_rewards_update', {
      p_id: id,
      p_reward_type: rewardType,
      p_reward_amount: rewardAmount,
      p_discount_code: discountCode,
      p_reward_status: rewardStatus,
      p_credited_at: creditedAt,
      p_redeemed_at: redeemedAt,
      p_is_active: isActive,
      p_updated_by: updatedBy,
    });

    if (error) throw new Error(`Failed to update referral reward: ${error.message}`);
  }

  /**
   * Delete a referral reward (soft delete)
   */
  async deleteReferralReward(id, deletedBy = null) {
    const { error } = await supabase.rpc('sp_referral_rewards_delete', {
      p_id: id,
      p_deleted_by: deletedBy,
    });

    if (error) throw new Error(`Failed to delete referral reward: ${error.message}`);
  }

  /**
   * Restore a deleted referral reward
   */
  async restoreReferralReward(id, restoredBy = null) {
    const { error } = await supabase.rpc('sp_referral_rewards_restore', {
      p_id: id,
      p_restored_by: restoredBy,
    });

    if (error) throw new Error(`Failed to restore referral reward: ${error.message}`);
  }
}

module.exports = new ReferralManagementRepository();
