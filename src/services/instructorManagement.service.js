/**
 * ═══════════════════════════════════════════════════════════════
 * INSTRUCTOR MANAGEMENT SERVICE — Business Logic Layer
 * ═══════════════════════════════════════════════════════════════
 * Handles Instructor Profiles business rules.
 * ═══════════════════════════════════════════════════════════════
 */

const instructorManagementRepository = require('../repositories/instructorManagement.repository');
const logger = require('../config/logger');
const { BadRequestError, NotFoundError } = require('../utils/errors');

class InstructorManagementService {
  // ========== INSTRUCTOR PROFILES ==========

  async getInstructorProfiles(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;

      const repoOptions = {
        filterUserId: filters.userId || null,
        filterInstructorType: filters.instructorType || null,
        filterTeachingMode: filters.teachingMode || null,
        filterApprovalStatus: filters.approvalStatus || null,
        filterPaymentModel: filters.paymentModel || null,
        filterBadge: filters.badge || null,
        filterIsAvailable: filters.isAvailable !== undefined ? filters.isAvailable : null,
        filterIsVerified: filters.isVerified !== undefined ? filters.isVerified : null,
        filterIsFeatured: filters.isFeatured !== undefined ? filters.isFeatured : null,
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        filterIsDeleted: filters.isDeleted !== undefined ? filters.isDeleted : false,
        filterSpecializationId: filters.specializationId || null,
        filterSecondarySpecializationId: filters.secondarySpecializationId || null,
        filterDesignationId: filters.designationId || null,
        filterDepartmentId: filters.departmentId || null,
        filterBranchId: filters.branchId || null,
        filterUserRole: filters.userRole || null,
        filterUserIsActive: filters.userIsActive !== undefined ? filters.userIsActive : null,
        searchTerm: search || null,
        sortTable: sort?.table || 'inst',
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: (pagination.page || 1) - 1,
        pageSize: pagination.limit || 20,
      };

      return await instructorManagementRepository.getInstructorProfiles(repoOptions);
    } catch (error) {
      logger.error('Error fetching instructor profiles:', error);
      throw error;
    }
  }

  async getInstructorProfileById(instructorId) {
    try {
      if (!instructorId) throw new BadRequestError('Instructor Profile ID is required');

      const instructorProfile = await instructorManagementRepository.findInstructorProfileById(instructorId);
      if (!instructorProfile) throw new NotFoundError(`Instructor Profile with ID ${instructorId} not found`);

      return instructorProfile;
    } catch (error) {
      logger.error(`Error fetching instructor profile ${instructorId}:`, error);
      throw error;
    }
  }

  async createInstructorProfile(instructorData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!instructorData.userId) throw new BadRequestError('User ID is required');
      if (!instructorData.instructorCode) throw new BadRequestError('Instructor code is required');

      const created = await instructorManagementRepository.createInstructorProfile(instructorData);
      logger.info(`Instructor Profile created: ${instructorData.instructorCode}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating instructor profile:', error);
      throw error;
    }
  }

  async updateInstructorProfile(instructorId, updates, actingUserId) {
    try {
      if (!instructorId) throw new BadRequestError('Instructor Profile ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await instructorManagementRepository.findInstructorProfileById(instructorId);
      if (!existing) throw new NotFoundError(`Instructor Profile with ID ${instructorId} not found`);

      const updated = await instructorManagementRepository.updateInstructorProfile(instructorId, updates);
      logger.info(`Instructor Profile updated: ${instructorId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating instructor profile ${instructorId}:`, error);
      throw error;
    }
  }

  async deleteInstructorProfile(instructorId, actingUserId) {
    try {
      if (!instructorId) throw new BadRequestError('Instructor Profile ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await instructorManagementRepository.findInstructorProfileById(instructorId);
      if (!existing) throw new NotFoundError(`Instructor Profile with ID ${instructorId} not found`);

      await instructorManagementRepository.deleteInstructorProfile(instructorId);
      logger.info(`Instructor Profile deleted: ${instructorId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting instructor profile ${instructorId}:`, error);
      throw error;
    }
  }

  async restoreInstructorProfile(id) {
    if (!id) throw new BadRequestError('Instructor Profile ID is required');
    await instructorManagementRepository.restoreInstructorProfile(id);
    return { id };
  }
}

module.exports = new InstructorManagementService();
