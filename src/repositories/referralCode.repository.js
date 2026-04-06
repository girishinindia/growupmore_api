/**
 * ═══════════════════════════════════════════════════════════════
 * REFERRAL CODE REPOSITORY — Database Layer (Supabase RPC)
 * ═══════════════════════════════════════════════════════════════
 * Handles Referral Codes via:
 *
 *   REFERRAL CODES:
 *   - udf_get_referral_codes       — read, search, filter, paginate
 *   - sp_referral_codes_insert     — create, returns new id (BIGINT)
 *   - sp_referral_codes_update     — update, returns void
 *   - sp_referral_codes_delete     — soft delete, returns void
 *   - sp_referral_codes_restore    — restore, returns void
 * ═══════════════════════════════════════════════════════════════
 */

const { supabase } = require('../config/database');
const logger = require('../config/logger');

class ReferralCodeRepository {
  // ─────────────────────────────────────────────────────────────
  //  REFERRAL CODES — READ
  // ─────────────────────────────────────────────────────────────

  async findReferralCodeById(referralCodeId) {
    const { data, error } = await supabase.rpc('udf_get_referral_codes', {
      p_id: referralCodeId,
      p_student_id: null,
      p_is_active: null,
      p_referrer_reward_type: null,
      p_sort_column: 'created_at',
      p_sort_direction: 'DESC',
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'ReferralCodeRepository.findReferralCodeById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  async getReferralCodes(options = {}) {
    const { data, error } = await supabase.rpc('udf_get_referral_codes', {
      p_id: null,
      p_student_id: options.filterStudentId || null,
      p_is_active: options.filterIsActive !== undefined ? options.filterIsActive : null,
      p_referrer_reward_type: options.filterReferrerRewardType || null,
      p_sort_column: options.sortColumn || 'created_at',
      p_sort_direction: options.sortDirection || 'DESC',
      p_page_index: options.pageIndex || 1,
      p_page_size: options.pageSize || 20,
    });

    if (error) {
      logger.error({ error }, 'ReferralCodeRepository.getReferralCodes failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  REFERRAL CODES — WRITE
  // ─────────────────────────────────────────────────────────────

  async createReferralCode(referralCodeData) {
    const { data, error } = await supabase.rpc('sp_referral_codes_insert', {
      p_student_id: referralCodeData.studentId,
      p_referral_code: referralCodeData.referralCode,
      p_discount_percentage: referralCodeData.discountPercentage || 20.00,
      p_max_discount_amount: referralCodeData.maxDiscountAmount || null,
      p_referrer_reward_percentage: referralCodeData.referrerRewardPercentage || 10.00,
      p_referrer_reward_type: referralCodeData.referrerRewardType || 'wallet_credit',
      p_is_active: referralCodeData.isActive !== undefined ? referralCodeData.isActive : true,
      p_created_by: referralCodeData.createdBy,
    });

    if (error) {
      logger.error({ error }, 'ReferralCodeRepository.createReferralCode failed');
      throw error;
    }

    const newId = data;
    return this.findReferralCodeById(newId);
  }

  async updateReferralCode(referralCodeId, updates) {
    const { error } = await supabase.rpc('sp_referral_codes_update', {
      p_id: referralCodeId,
      p_discount_percentage: updates.discountPercentage !== undefined ? updates.discountPercentage : null,
      p_max_discount_amount: updates.maxDiscountAmount !== undefined ? updates.maxDiscountAmount : null,
      p_referrer_reward_percentage: updates.referrerRewardPercentage !== undefined ? updates.referrerRewardPercentage : null,
      p_referrer_reward_type: updates.referrerRewardType || null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
      p_updated_by: updates.updatedBy,
    });

    if (error) {
      logger.error({ error }, 'ReferralCodeRepository.updateReferralCode failed');
      throw error;
    }

    return this.findReferralCodeById(referralCodeId);
  }

  async deleteReferralCode(referralCodeId, deletedBy) {
    const { error } = await supabase.rpc('sp_referral_codes_delete', {
      p_id: referralCodeId,
      p_deleted_by: deletedBy,
    });

    if (error) {
      logger.error({ error }, 'ReferralCodeRepository.deleteReferralCode failed');
      throw error;
    }
  }

  async restoreReferralCode(referralCodeId, restoredBy) {
    const { error } = await supabase.rpc('sp_referral_codes_restore', {
      p_id: referralCodeId,
      p_restored_by: restoredBy,
    });

    if (error) {
      logger.error({ error }, 'ReferralCodeRepository.restoreReferralCode failed');
      throw error;
    }
  }
}

module.exports = new ReferralCodeRepository();
