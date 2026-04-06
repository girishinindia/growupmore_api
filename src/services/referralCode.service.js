/**
 * ═══════════════════════════════════════════════════════════════
 * REFERRAL CODE SERVICE — Business Logic Layer
 * ═══════════════════════════════════════════════════════════════
 * Handles Referral Codes business rules.
 * ═══════════════════════════════════════════════════════════════
 */

const referralCodeRepository = require('../repositories/referralCode.repository');
const logger = require('../config/logger');
const { BadRequestError, NotFoundError } = require('../utils/errors');

class ReferralCodeService {
  // ========== REFERRAL CODES ==========

  async getReferralCodes(options = {}) {
    try {
      const { filters = {}, sort, pagination = {} } = options;

      const repoOptions = {
        filterStudentId: filters.studentId || null,
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        filterReferrerRewardType: filters.referrerRewardType || null,
        sortColumn: sort?.field || 'created_at',
        sortDirection: sort?.direction || 'DESC',
        pageIndex: (pagination.page || 1) - 1,
        pageSize: pagination.limit || 20,
      };

      return await referralCodeRepository.getReferralCodes(repoOptions);
    } catch (error) {
      logger.error('Error fetching referral codes:', error);
      throw error;
    }
  }

  async getReferralCodeById(referralCodeId) {
    try {
      if (!referralCodeId) throw new BadRequestError('Referral Code ID is required');

      const referralCode = await referralCodeRepository.findReferralCodeById(referralCodeId);
      if (!referralCode) throw new NotFoundError(`Referral Code with ID ${referralCodeId} not found`);

      return referralCode;
    } catch (error) {
      logger.error(`Error fetching referral code ${referralCodeId}:`, error);
      throw error;
    }
  }

  async createReferralCode(referralCodeData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!referralCodeData.studentId) throw new BadRequestError('Student ID is required');
      if (!referralCodeData.referralCode) throw new BadRequestError('Referral Code is required');

      const created = await referralCodeRepository.createReferralCode({
        ...referralCodeData,
        createdBy: actingUserId,
      });
      logger.info(`Referral Code created: ${referralCodeData.referralCode}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating referral code:', error);
      throw error;
    }
  }

  async updateReferralCode(referralCodeId, updates, actingUserId) {
    try {
      if (!referralCodeId) throw new BadRequestError('Referral Code ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await referralCodeRepository.findReferralCodeById(referralCodeId);
      if (!existing) throw new NotFoundError(`Referral Code with ID ${referralCodeId} not found`);

      const updated = await referralCodeRepository.updateReferralCode(referralCodeId, {
        ...updates,
        updatedBy: actingUserId,
      });
      logger.info(`Referral Code updated: ${referralCodeId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating referral code ${referralCodeId}:`, error);
      throw error;
    }
  }

  async deleteReferralCode(referralCodeId, actingUserId) {
    try {
      if (!referralCodeId) throw new BadRequestError('Referral Code ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await referralCodeRepository.findReferralCodeById(referralCodeId);
      if (!existing) throw new NotFoundError(`Referral Code with ID ${referralCodeId} not found`);

      await referralCodeRepository.deleteReferralCode(referralCodeId, actingUserId);
      logger.info(`Referral Code deleted: ${referralCodeId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting referral code ${referralCodeId}:`, error);
      throw error;
    }
  }

  async restoreReferralCode(referralCodeId, actingUserId) {
    try {
      if (!referralCodeId) throw new BadRequestError('Referral Code ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await referralCodeRepository.findReferralCodeById(referralCodeId);
      if (!existing) throw new NotFoundError(`Referral Code with ID ${referralCodeId} not found`);

      await referralCodeRepository.restoreReferralCode(referralCodeId, actingUserId);
      logger.info(`Referral Code restored: ${referralCodeId}`, { restoredBy: actingUserId });
      return { id: referralCodeId };
    } catch (error) {
      logger.error(`Error restoring referral code ${referralCodeId}:`, error);
      throw error;
    }
  }
}

module.exports = new ReferralCodeService();
