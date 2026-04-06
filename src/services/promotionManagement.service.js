/**
 * ═══════════════════════════════════════════════════════════════
 * PROMOTION MANAGEMENT SERVICE — Business Logic Layer
 * ═══════════════════════════════════════════════════════════════
 * Handles Instructor Promotions, Translations, and Courses business rules.
 * ═══════════════════════════════════════════════════════════════
 */

const promotionManagementRepository = require('../repositories/promotionManagement.repository');
const logger = require('../config/logger');
const { BadRequestError, NotFoundError } = require('../utils/errors');

class PromotionManagementService {
  // ========== INSTRUCTOR PROMOTIONS ==========

  async getInstructorPromotions(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;

      const repoOptions = {
        filterInstructorId: filters.instructorId || null,
        filterPromotionStatus: filters.promotionStatus || null,
        filterDiscountType: filters.discountType || null,
        filterApplicableTo: filters.applicableTo || null,
        filterPromoCode: filters.promoCode || null,
        filterValidFromStart: filters.validFromStart || null,
        filterValidFromEnd: filters.validFromEnd || null,
        filterValidUntilStart: filters.validUntilStart || null,
        filterValidUntilEnd: filters.validUntilEnd || null,
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        searchTerm: search || null,
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: (pagination.page || 1) - 1,
        pageSize: pagination.limit || 20,
      };

      return await promotionManagementRepository.getInstructorPromotions(repoOptions);
    } catch (error) {
      logger.error('Error fetching instructor promotions:', error);
      throw error;
    }
  }

  async getInstructorPromotionById(id) {
    try {
      if (!id) throw new BadRequestError('Promotion ID is required');

      const promotion = await promotionManagementRepository.findInstructorPromotionById(id);
      if (!promotion) throw new NotFoundError(`Promotion with ID ${id} not found`);

      return promotion;
    } catch (error) {
      logger.error(`Error fetching promotion ${id}:`, error);
      throw error;
    }
  }

  async createInstructorPromotion(promotionData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!promotionData.instructorId) throw new BadRequestError('Instructor ID is required');
      if (!promotionData.discountType) throw new BadRequestError('Discount type is required');
      if (promotionData.discountValue === undefined || promotionData.discountValue === null) {
        throw new BadRequestError('Discount value is required');
      }
      if (!promotionData.validFrom) throw new BadRequestError('Valid from date is required');
      if (!promotionData.validUntil) throw new BadRequestError('Valid until date is required');

      const created = await promotionManagementRepository.createInstructorPromotion({
        ...promotionData,
        createdBy: actingUserId,
      });

      logger.info(`Instructor promotion created: ID ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating instructor promotion:', error);
      throw error;
    }
  }

  async updateInstructorPromotion(id, updates, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Promotion ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await promotionManagementRepository.findInstructorPromotionById(id);
      if (!existing) throw new NotFoundError(`Promotion with ID ${id} not found`);

      const updated = await promotionManagementRepository.updateInstructorPromotion(id, {
        ...updates,
        updatedBy: actingUserId,
      });

      logger.info(`Promotion updated: ${id}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating promotion ${id}:`, error);
      throw error;
    }
  }

  async deleteInstructorPromotion(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Promotion ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await promotionManagementRepository.findInstructorPromotionById(id);
      if (!existing) throw new NotFoundError(`Promotion with ID ${id} not found`);

      await promotionManagementRepository.deleteInstructorPromotion(id);
      logger.info(`Promotion deleted: ${id}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting promotion ${id}:`, error);
      throw error;
    }
  }

  async restoreInstructorPromotion(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Promotion ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await promotionManagementRepository.restoreInstructorPromotion(id);
      logger.info(`Promotion restored: ${id}`, { restoredBy: actingUserId });
      return { id };
    } catch (error) {
      logger.error(`Error restoring promotion ${id}:`, error);
      throw error;
    }
  }

  // ========== INSTRUCTOR PROMOTION TRANSLATIONS ==========

  async getInstructorPromotionTranslations(promotionId) {
    try {
      if (!promotionId) throw new BadRequestError('Promotion ID is required');

      const promotion = await promotionManagementRepository.findInstructorPromotionById(promotionId);
      if (!promotion) throw new NotFoundError(`Promotion with ID ${promotionId} not found`);

      return await promotionManagementRepository.getInstructorPromotionTranslations(promotionId);
    } catch (error) {
      logger.error(`Error fetching translations for promotion ${promotionId}:`, error);
      throw error;
    }
  }

  async getInstructorPromotionTranslationById(id) {
    try {
      if (!id) throw new BadRequestError('Translation ID is required');

      const translation = await promotionManagementRepository.findInstructorPromotionTranslationById(id);
      if (!translation) throw new NotFoundError(`Translation with ID ${id} not found`);

      return translation;
    } catch (error) {
      logger.error(`Error fetching translation ${id}:`, error);
      throw error;
    }
  }

  async createInstructorPromotionTranslation(translationData, actingUserId) {
    try {
      if (!translationData.promotionId) throw new BadRequestError('Promotion ID is required');
      if (!translationData.languageId) throw new BadRequestError('Language ID is required');
      if (!translationData.promotionName) throw new BadRequestError('Promotion name is required');

      const promotion = await promotionManagementRepository.findInstructorPromotionById(translationData.promotionId);
      if (!promotion) throw new NotFoundError(`Promotion with ID ${translationData.promotionId} not found`);

      await promotionManagementRepository.createInstructorPromotionTranslation(translationData);
      logger.info(`Promotion translation created for promotion ${translationData.promotionId}`);

      const translations = await promotionManagementRepository.getInstructorPromotionTranslations(translationData.promotionId);
      return translations;
    } catch (error) {
      logger.error('Error creating promotion translation:', error);
      throw error;
    }
  }

  async updateInstructorPromotionTranslation(id, updates, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Translation ID is required');

      const existing = await promotionManagementRepository.findInstructorPromotionTranslationById(id);
      if (!existing) throw new NotFoundError(`Translation with ID ${id} not found`);

      const updated = await promotionManagementRepository.updateInstructorPromotionTranslation(id, updates);
      logger.info(`Promotion translation updated: ${id}`);
      return updated;
    } catch (error) {
      logger.error(`Error updating translation ${id}:`, error);
      throw error;
    }
  }

  async deleteInstructorPromotionTranslation(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Translation ID is required');

      const existing = await promotionManagementRepository.findInstructorPromotionTranslationById(id);
      if (!existing) throw new NotFoundError(`Translation with ID ${id} not found`);

      await promotionManagementRepository.deleteInstructorPromotionTranslation(id);
      logger.info(`Promotion translation deleted: ${id}`);
    } catch (error) {
      logger.error(`Error deleting translation ${id}:`, error);
      throw error;
    }
  }

  async restoreInstructorPromotionTranslation(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await promotionManagementRepository.restoreInstructorPromotionTranslation(id);
      logger.info(`Promotion translation restored: ${id}`, { restoredBy: actingUserId });
      return { id };
    } catch (error) {
      logger.error(`Error restoring translation ${id}:`, error);
      throw error;
    }
  }

  // ========== INSTRUCTOR PROMOTION COURSES ==========

  async getInstructorPromotionCourses(options = {}) {
    try {
      const { filters = {}, sort, pagination = {} } = options;

      const repoOptions = {
        filterPromotionId: filters.promotionId || null,
        filterCourseId: filters.courseId || null,
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        sortColumn: sort?.field || 'display_order',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: (pagination.page || 1) - 1,
        pageSize: pagination.limit || 20,
      };

      return await promotionManagementRepository.getInstructorPromotionCourses(repoOptions);
    } catch (error) {
      logger.error('Error fetching promotion courses:', error);
      throw error;
    }
  }

  async getInstructorPromotionCourseById(id) {
    try {
      if (!id) throw new BadRequestError('Promotion Course ID is required');

      const course = await promotionManagementRepository.findInstructorPromotionCourseById(id);
      if (!course) throw new NotFoundError(`Promotion Course with ID ${id} not found`);

      return course;
    } catch (error) {
      logger.error(`Error fetching promotion course ${id}:`, error);
      throw error;
    }
  }

  async createInstructorPromotionCourse(courseData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!courseData.promotionId) throw new BadRequestError('Promotion ID is required');
      if (!courseData.courseId) throw new BadRequestError('Course ID is required');

      const promotion = await promotionManagementRepository.findInstructorPromotionById(courseData.promotionId);
      if (!promotion) throw new NotFoundError(`Promotion with ID ${courseData.promotionId} not found`);

      const created = await promotionManagementRepository.createInstructorPromotionCourse({
        ...courseData,
        createdBy: actingUserId,
      });

      logger.info(`Promotion course created: ID ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating promotion course:', error);
      throw error;
    }
  }

  async updateInstructorPromotionCourse(id, updates, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Promotion Course ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await promotionManagementRepository.findInstructorPromotionCourseById(id);
      if (!existing) throw new NotFoundError(`Promotion Course with ID ${id} not found`);

      const updated = await promotionManagementRepository.updateInstructorPromotionCourse(id, {
        ...updates,
        updatedBy: actingUserId,
      });

      logger.info(`Promotion course updated: ${id}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating promotion course ${id}:`, error);
      throw error;
    }
  }

  async deleteInstructorPromotionCourse(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Promotion Course ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await promotionManagementRepository.findInstructorPromotionCourseById(id);
      if (!existing) throw new NotFoundError(`Promotion Course with ID ${id} not found`);

      await promotionManagementRepository.deleteInstructorPromotionCourse(id);
      logger.info(`Promotion course deleted: ${id}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting promotion course ${id}:`, error);
      throw error;
    }
  }

  async restoreInstructorPromotionCourse(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Promotion Course ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await promotionManagementRepository.restoreInstructorPromotionCourse(id);
      logger.info(`Promotion course restored: ${id}`, { restoredBy: actingUserId });
      return { id };
    } catch (error) {
      logger.error(`Error restoring promotion course ${id}:`, error);
      throw error;
    }
  }
}

module.exports = new PromotionManagementService();
