/**
 * ═══════════════════════════════════════════════════════════════
 * REFERRAL CODE CONTROLLER — Referral Codes
 * ═══════════════════════════════════════════════════════════════
 */

const referralCodeService = require('../../../services/referralCode.service');
const { sendSuccess, sendCreated } = require('../../../utils/response');

class ReferralCodeController {
  // ==================== REFERRAL CODES ====================

  async getReferralCodes(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'created_at',
        sortDir = 'DESC',
        studentId,
        referrerRewardType,
        isActive,
      } = req.query;

      const filters = {};
      if (studentId !== undefined) filters.studentId = studentId;
      if (referrerRewardType !== undefined) filters.referrerRewardType = referrerRewardType;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await referralCodeService.getReferralCodes({
        filters,
        sort: { field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, { data, message: 'Referral Codes retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getReferralCodeById(req, res, next) {
    try {
      const data = await referralCodeService.getReferralCodeById(req.params.id);
      sendSuccess(res, { data, message: 'Referral Code retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createReferralCode(req, res, next) {
    try {
      const referralCodeData = {
        studentId: req.body.studentId,
        referralCode: req.body.referralCode,
        discountPercentage: req.body.discountPercentage !== undefined ? req.body.discountPercentage : 20.00,
        maxDiscountAmount: req.body.maxDiscountAmount || null,
        referrerRewardPercentage: req.body.referrerRewardPercentage !== undefined ? req.body.referrerRewardPercentage : 10.00,
        referrerRewardType: req.body.referrerRewardType || 'wallet_credit',
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      };

      const data = await referralCodeService.createReferralCode(referralCodeData, req.user.userId);
      sendCreated(res, { data, message: 'Referral Code created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateReferralCode(req, res, next) {
    try {
      const updates = {};

      if (req.body.discountPercentage !== undefined) updates.discountPercentage = req.body.discountPercentage;
      if (req.body.maxDiscountAmount !== undefined) updates.maxDiscountAmount = req.body.maxDiscountAmount;
      if (req.body.referrerRewardPercentage !== undefined) updates.referrerRewardPercentage = req.body.referrerRewardPercentage;
      if (req.body.referrerRewardType !== undefined) updates.referrerRewardType = req.body.referrerRewardType;
      if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;

      const data = await referralCodeService.updateReferralCode(req.params.id, updates, req.user.userId);
      sendSuccess(res, { data, message: 'Referral Code updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteReferralCode(req, res, next) {
    try {
      await referralCodeService.deleteReferralCode(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Referral Code deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreReferralCode(req, res, next) {
    try {
      const data = await referralCodeService.restoreReferralCode(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Referral Code restored successfully', data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReferralCodeController();
