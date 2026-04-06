/**
 * ═══════════════════════════════════════════════════════════════
 * WEBINAR MANAGEMENT CONTROLLER — Webinars
 * ═══════════════════════════════════════════════════════════════
 */

const webinarManagementService = require('../../../services/webinarManagement.service');
const { sendSuccess, sendCreated } = require('../../../utils/response');

class WebinarManagementController {
  // ==================== WEBINARS ====================

  async getWebinars(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        sortBy = 'webinar_scheduled_at',
        sortDir = 'DESC',
        webinarOwner,
        webinarStatus,
        meetingPlatform,
        courseId,
        chapterId,
        instructorId,
        isFree,
        isActive,
      } = req.query;

      const filters = {};
      if (webinarOwner !== undefined) filters.webinarOwner = webinarOwner;
      if (webinarStatus !== undefined) filters.webinarStatus = webinarStatus;
      if (meetingPlatform !== undefined) filters.meetingPlatform = meetingPlatform;
      if (courseId !== undefined) filters.courseId = courseId;
      if (chapterId !== undefined) filters.chapterId = chapterId;
      if (instructorId !== undefined) filters.instructorId = instructorId;
      if (isFree !== undefined) filters.isFree = isFree;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await webinarManagementService.getWebinars({
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

      sendSuccess(res, { data, message: 'Webinars retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getWebinarById(req, res, next) {
    try {
      const data = await webinarManagementService.getWebinarById(req.params.id);
      sendSuccess(res, { data, message: 'Webinar retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createWebinar(req, res, next) {
    try {
      const data = await webinarManagementService.createWebinar(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Webinar created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateWebinar(req, res, next) {
    try {
      const data = await webinarManagementService.updateWebinar(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Webinar updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteWebinar(req, res, next) {
    try {
      await webinarManagementService.deleteWebinar(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Webinar deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreWebinar(req, res, next) {
    try {
      const data = await webinarManagementService.restoreWebinar(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Webinar restored successfully', data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WebinarManagementController();
