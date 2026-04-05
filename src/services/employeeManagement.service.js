/**
 * ═══════════════════════════════════════════════════════════════
 * EMPLOYEE MANAGEMENT SERVICE — Business Logic Layer
 * ═══════════════════════════════════════════════════════════════
 * Handles Employee Profiles business rules.
 * ═══════════════════════════════════════════════════════════════
 */

const employeeManagementRepository = require('../repositories/employeeManagement.repository');
const logger = require('../config/logger');
const { BadRequestError, NotFoundError } = require('../utils/errors');

class EmployeeManagementService {
  // ========== EMPLOYEE PROFILES ==========

  async getEmployeeProfiles(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;

      const repoOptions = {
        userId: filters.userId || null,
        filterEmployeeType: filters.employeeType || null,
        filterWorkMode: filters.workMode || null,
        filterShiftType: filters.shiftType || null,
        filterPayGrade: filters.payGrade || null,
        filterTaxRegime: filters.taxRegime || null,
        filterExitType: filters.exitType || null,
        filterPaymentMode: filters.paymentMode || null,
        filterHasSystemAccess: filters.hasSystemAccess !== undefined ? filters.hasSystemAccess : null,
        filterHasVpnAccess: filters.hasVpnAccess !== undefined ? filters.hasVpnAccess : null,
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        filterIsDeleted: filters.isDeleted !== undefined ? filters.isDeleted : false,
        filterDesignationId: filters.designationId || null,
        filterDepartmentId: filters.departmentId || null,
        filterBranchId: filters.branchId || null,
        filterReportingManagerId: filters.reportingManagerId || null,
        filterUserRole: filters.userRole || null,
        filterUserIsActive: filters.userIsActive !== undefined ? filters.userIsActive : null,
        searchTerm: search || null,
        sortTable: sort?.table || 'emp',
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };

      return await employeeManagementRepository.getEmployeeProfiles(repoOptions);
    } catch (error) {
      logger.error('Error fetching employee profiles:', error);
      throw error;
    }
  }

  async getEmployeeProfileById(employeeProfileId) {
    try {
      if (!employeeProfileId) throw new BadRequestError('Employee Profile ID is required');

      const employeeProfile = await employeeManagementRepository.findEmployeeProfileById(employeeProfileId);
      if (!employeeProfile) throw new NotFoundError(`Employee Profile with ID ${employeeProfileId} not found`);

      return employeeProfile;
    } catch (error) {
      logger.error(`Error fetching employee profile ${employeeProfileId}:`, error);
      throw error;
    }
  }

  async createEmployeeProfile(employeeData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!employeeData.userId) throw new BadRequestError('User ID is required');
      if (!employeeData.employeeCode) throw new BadRequestError('Employee code is required');
      if (!employeeData.designationId) throw new BadRequestError('Designation ID is required');
      if (!employeeData.departmentId) throw new BadRequestError('Department ID is required');
      if (!employeeData.branchId) throw new BadRequestError('Branch ID is required');
      if (!employeeData.joiningDate) throw new BadRequestError('Joining date is required');

      const created = await employeeManagementRepository.createEmployeeProfile(employeeData);
      logger.info(`Employee Profile created: ${employeeData.employeeCode}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating employee profile:', error);
      throw error;
    }
  }

  async updateEmployeeProfile(employeeProfileId, updates, actingUserId) {
    try {
      if (!employeeProfileId) throw new BadRequestError('Employee Profile ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await employeeManagementRepository.findEmployeeProfileById(employeeProfileId);
      if (!existing) throw new NotFoundError(`Employee Profile with ID ${employeeProfileId} not found`);

      const updated = await employeeManagementRepository.updateEmployeeProfile(employeeProfileId, updates);
      logger.info(`Employee Profile updated: ${employeeProfileId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating employee profile ${employeeProfileId}:`, error);
      throw error;
    }
  }

  async deleteEmployeeProfile(employeeProfileId, actingUserId) {
    try {
      if (!employeeProfileId) throw new BadRequestError('Employee Profile ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await employeeManagementRepository.findEmployeeProfileById(employeeProfileId);
      if (!existing) throw new NotFoundError(`Employee Profile with ID ${employeeProfileId} not found`);

      await employeeManagementRepository.deleteEmployeeProfile(employeeProfileId);
      logger.info(`Employee Profile deleted: ${employeeProfileId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting employee profile ${employeeProfileId}:`, error);
      throw error;
    }
  }

  async restoreEmployeeProfile(id) {
    if (!id) throw new BadRequestError('Employee Profile ID is required');
    await employeeManagementRepository.restoreEmployeeProfile(id);
    return { id };
  }
}

module.exports = new EmployeeManagementService();
