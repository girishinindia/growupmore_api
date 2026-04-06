/**
 * ═══════════════════════════════════════════════════════════════
 * WEBINAR MANAGEMENT SERVICE — Business Logic Layer
 * ═══════════════════════════════════════════════════════════════
 * Handles Webinars business rules.
 * ═══════════════════════════════════════════════════════════════
 */

const webinarManagementRepository = require('../repositories/webinarManagement.repository');
const logger = require('../config/logger');
const { BadRequestError, NotFoundError } = require('../utils/errors');

class WebinarManagementService {
  // ========== WEBINARS ==========

  async getWebinars(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;

      // Convert page/limit to offset
      const page = pagination.page || 1;
      const limit = pagination.limit || 20;
      const offset = (page - 1) * limit;

      const repoOptions = {
        webinarId: filters.webinarId || null,
        languageId: filters.languageId || null,
        isActive: filters.isActive !== undefined ? filters.isActive : null,
        filterWebinarOwner: filters.webinarOwner || null,
        filterWebinarStatus: filters.webinarStatus || null,
        filterMeetingPlatform: filters.meetingPlatform || null,
        filterIsFree: filters.isFree !== undefined ? filters.isFree : null,
        filterCourseId: filters.courseId || null,
        filterChapterId: filters.chapterId || null,
        filterInstructorId: filters.instructorId || null,
        filterIsDeleted: filters.isDeleted !== undefined ? filters.isDeleted : false,
        searchQuery: search || null,
        sortColumn: sort?.field || 'webinar_scheduled_at',
        sortDirection: sort?.direction || 'DESC',
        limit,
        offset,
      };

      return await webinarManagementRepository.getWebinars(repoOptions);
    } catch (error) {
      logger.error('Error fetching webinars:', error);
      throw error;
    }
  }

  async getWebinarById(webinarId) {
    try {
      if (!webinarId) throw new BadRequestError('Webinar ID is required');

      const webinar = await webinarManagementRepository.findWebinarById(webinarId);
      if (!webinar) throw new NotFoundError(`Webinar with ID ${webinarId} not found`);

      return webinar;
    } catch (error) {
      logger.error(`Error fetching webinar ${webinarId}:`, error);
      throw error;
    }
  }

  async createWebinar(webinarData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const created = await webinarManagementRepository.createWebinar({
        ...webinarData,
        createdBy: actingUserId,
        updatedBy: actingUserId,
      });
      logger.info(`Webinar created`, { createdBy: actingUserId, webinarId: created.id });
      return created;
    } catch (error) {
      logger.error('Error creating webinar:', error);
      throw error;
    }
  }

  async updateWebinar(webinarId, updates, actingUserId) {
    try {
      if (!webinarId) throw new BadRequestError('Webinar ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await webinarManagementRepository.findWebinarById(webinarId);
      if (!existing) throw new NotFoundError(`Webinar with ID ${webinarId} not found`);

      const updated = await webinarManagementRepository.updateWebinar(webinarId, {
        ...updates,
        updatedBy: actingUserId,
      });
      logger.info(`Webinar updated: ${webinarId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating webinar ${webinarId}:`, error);
      throw error;
    }
  }

  async deleteWebinar(webinarId, actingUserId) {
    try {
      if (!webinarId) throw new BadRequestError('Webinar ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await webinarManagementRepository.findWebinarById(webinarId);
      if (!existing) throw new NotFoundError(`Webinar with ID ${webinarId} not found`);

      await webinarManagementRepository.deleteWebinar(webinarId);
      logger.info(`Webinar deleted: ${webinarId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting webinar ${webinarId}:`, error);
      throw error;
    }
  }

  async restoreWebinar(webinarId, actingUserId) {
    try {
      if (!webinarId) throw new BadRequestError('Webinar ID is required');

      await webinarManagementRepository.restoreWebinar(webinarId);
      logger.info(`Webinar restored: ${webinarId}`, { restoredBy: actingUserId });
      return { webinarId };
    } catch (error) {
      logger.error(`Error restoring webinar ${webinarId}:`, error);
      throw error;
    }
  }
}

module.exports = new WebinarManagementService();
