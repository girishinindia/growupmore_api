/**
 * ═══════════════════════════════════════════════════════════════
 * PROMOTION MANAGEMENT CONTROLLER
 * ═══════════════════════════════════════════════════════════════
 * Instructor Promotions, Translations, Courses API Endpoints
 * ═══════════════════════════════════════════════════════════════
 */

const promotionManagementService = require('../../../services/promotionManagement.service');
const { sendSuccess, sendCreated } = require('../../../utils/response');

class PromotionManagementController {
  // ==================== INSTRUCTOR PROMOTIONS ====================

  async getInstructorPromotions(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        sortBy = 'id',
        sortDir = 'asc',
        instructorId,
        promotionStatus,
        discountType,
        applicableTo,
        promoCode,
        validFromStart,
        validFromEnd,
        validUntilStart,
        validUntilEnd,
        isActive,
      } = req.query;

      const filters = {};
      if (instructorId !== undefined) filters.instructorId = instructorId;
      if (promotionStatus !== undefined) filters.promotionStatus = promotionStatus;
      if (discountType !== undefined) filters.discountType = discountType;
      if (applicableTo !== undefined) filters.applicableTo = applicableTo;
      if (promoCode !== undefined) filters.promoCode = promoCode;
      if (validFromStart !== undefined) filters.validFromStart = validFromStart;
      if (validFromEnd !== undefined) filters.validFromEnd = validFromEnd;
      if (validUntilStart !== undefined) filters.validUntilStart = validUntilStart;
      if (validUntilEnd !== undefined) filters.validUntilEnd = validUntilEnd;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await promotionManagementService.getInstructorPromotions({
        filters,
        search,
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

      sendSuccess(res, { data, message: 'Instructor promotions retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getInstructorPromotionById(req, res, next) {
    try {
      const data = await promotionManagementService.getInstructorPromotionById(req.params.id);
      sendSuccess(res, { data, message: 'Instructor promotion retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createInstructorPromotion(req, res, next) {
    try {
      const data = await promotionManagementService.createInstructorPromotion(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Instructor promotion created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateInstructorPromotion(req, res, next) {
    try {
      const data = await promotionManagementService.updateInstructorPromotion(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Instructor promotion updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteInstructorPromotion(req, res, next) {
    try {
      await promotionManagementService.deleteInstructorPromotion(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Instructor promotion deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreInstructorPromotion(req, res, next) {
    try {
      const data = await promotionManagementService.restoreInstructorPromotion(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Instructor promotion restored successfully', data });
    } catch (error) {
      next(error);
    }
  }

  // ==================== INSTRUCTOR PROMOTION TRANSLATIONS ====================

  async getInstructorPromotionTranslations(req, res, next) {
    try {
      const data = await promotionManagementService.getInstructorPromotionTranslations(req.params.promotionId);
      sendSuccess(res, { data, message: 'Instructor promotion translations retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getInstructorPromotionTranslationById(req, res, next) {
    try {
      const data = await promotionManagementService.getInstructorPromotionTranslationById(req.params.id);
      sendSuccess(res, { data, message: 'Instructor promotion translation retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createInstructorPromotionTranslation(req, res, next) {
    try {
      const data = await promotionManagementService.createInstructorPromotionTranslation(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Instructor promotion translation created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateInstructorPromotionTranslation(req, res, next) {
    try {
      const data = await promotionManagementService.updateInstructorPromotionTranslation(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Instructor promotion translation updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteInstructorPromotionTranslation(req, res, next) {
    try {
      await promotionManagementService.deleteInstructorPromotionTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Instructor promotion translation deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreInstructorPromotionTranslation(req, res, next) {
    try {
      const data = await promotionManagementService.restoreInstructorPromotionTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Instructor promotion translation restored successfully', data });
    } catch (error) {
      next(error);
    }
  }

  // ==================== INSTRUCTOR PROMOTION COURSES ====================

  async getInstructorPromotionCourses(req, res, next) {
    try {
      const { page = 1, limit = 20, sortBy = 'display_order', sortDir = 'asc', promotionId, courseId, isActive } = req.query;

      const filters = {};
      if (promotionId !== undefined) filters.promotionId = promotionId;
      if (courseId !== undefined) filters.courseId = courseId;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await promotionManagementService.getInstructorPromotionCourses({
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

      sendSuccess(res, { data, message: 'Instructor promotion courses retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getInstructorPromotionCourseById(req, res, next) {
    try {
      const data = await promotionManagementService.getInstructorPromotionCourseById(req.params.id);
      sendSuccess(res, { data, message: 'Instructor promotion course retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createInstructorPromotionCourse(req, res, next) {
    try {
      const data = await promotionManagementService.createInstructorPromotionCourse(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Instructor promotion course created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateInstructorPromotionCourse(req, res, next) {
    try {
      const data = await promotionManagementService.updateInstructorPromotionCourse(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Instructor promotion course updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteInstructorPromotionCourse(req, res, next) {
    try {
      await promotionManagementService.deleteInstructorPromotionCourse(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Instructor promotion course deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreInstructorPromotionCourse(req, res, next) {
    try {
      const data = await promotionManagementService.restoreInstructorPromotionCourse(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Instructor promotion course restored successfully', data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PromotionManagementController();
