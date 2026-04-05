/**
 * ═══════════════════════════════════════════════════════════════
 * INSTRUCTOR MANAGEMENT CONTROLLER — Instructor Profiles
 * ═══════════════════════════════════════════════════════════════
 */

const instructorManagementService = require('../../../services/instructorManagement.service');
const { sendSuccess, sendCreated } = require('../../../utils/response');

class InstructorManagementController {
  // ==================== INSTRUCTOR PROFILES ====================

  async getInstructorProfiles(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        sortBy = 'id',
        sortDir = 'asc',
        userId,
        instructorType,
        teachingMode,
        approvalStatus,
        paymentModel,
        badge,
        specializationId,
        designationId,
        departmentId,
        branchId,
        isAvailable,
        isVerified,
        isFeatured,
        isActive,
      } = req.query;

      const filters = {};
      if (userId !== undefined) filters.userId = userId;
      if (instructorType !== undefined) filters.instructorType = instructorType;
      if (teachingMode !== undefined) filters.teachingMode = teachingMode;
      if (approvalStatus !== undefined) filters.approvalStatus = approvalStatus;
      if (paymentModel !== undefined) filters.paymentModel = paymentModel;
      if (badge !== undefined) filters.badge = badge;
      if (specializationId !== undefined) filters.specializationId = specializationId;
      if (designationId !== undefined) filters.designationId = designationId;
      if (departmentId !== undefined) filters.departmentId = departmentId;
      if (branchId !== undefined) filters.branchId = branchId;
      if (isAvailable !== undefined) filters.isAvailable = isAvailable;
      if (isVerified !== undefined) filters.isVerified = isVerified;
      if (isFeatured !== undefined) filters.isFeatured = isFeatured;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await instructorManagementService.getInstructorProfiles({
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

      sendSuccess(res, { data, message: 'Instructor Profiles retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getInstructorProfileById(req, res, next) {
    try {
      const data = await instructorManagementService.getInstructorProfileById(req.params.id);
      sendSuccess(res, { data, message: 'Instructor Profile retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createInstructorProfile(req, res, next) {
    try {
      const data = await instructorManagementService.createInstructorProfile(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Instructor Profile created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateInstructorProfile(req, res, next) {
    try {
      const data = await instructorManagementService.updateInstructorProfile(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Instructor Profile updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteInstructorProfile(req, res, next) {
    try {
      await instructorManagementService.deleteInstructorProfile(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Instructor Profile deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreInstructorProfile(req, res, next) {
    try {
      const data = await instructorManagementService.restoreInstructorProfile(req.params.id);
      sendSuccess(res, { message: 'Instructor profile restored successfully', data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InstructorManagementController();
