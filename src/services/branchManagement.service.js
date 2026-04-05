/**
 * ═══════════════════════════════════════════════════════════════
 * BRANCH MANAGEMENT SERVICE — Business Logic Layer
 * ═══════════════════════════════════════════════════════════════
 * Handles Branches, Departments, and Branch Departments business rules.
 * ═══════════════════════════════════════════════════════════════
 */

const branchManagementRepository = require('../repositories/branchManagement.repository');
const logger = require('../config/logger');
const { BadRequestError, NotFoundError } = require('../utils/errors');

class BranchManagementService {
  // ========== BRANCHES ==========

  async getBranches(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;

      const repoOptions = {
        filterCountryId: filters.countryId || null,
        filterStateId: filters.stateId || null,
        filterCityId: filters.cityId || null,
        filterBranchType: filters.branchType || null,
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        filterIsDeleted: filters.isDeleted !== undefined ? filters.isDeleted : false,
        searchTerm: search || null,
        sortTable: sort?.table || 'branch',
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };

      return await branchManagementRepository.getBranches(repoOptions);
    } catch (error) {
      logger.error('Error fetching branches:', error);
      throw error;
    }
  }

  async getBranchById(branchId) {
    try {
      if (!branchId) throw new BadRequestError('Branch ID is required');

      const branch = await branchManagementRepository.findBranchById(branchId);
      if (!branch) throw new NotFoundError(`Branch with ID ${branchId} not found`);

      return branch;
    } catch (error) {
      logger.error(`Error fetching branch ${branchId}:`, error);
      throw error;
    }
  }

  async createBranch(branchData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!branchData.countryId) throw new BadRequestError('Country ID is required');
      if (!branchData.stateId) throw new BadRequestError('State ID is required');
      if (!branchData.cityId) throw new BadRequestError('City ID is required');
      if (!branchData.name) throw new BadRequestError('Branch name is required');

      const created = await branchManagementRepository.createBranch(branchData);
      logger.info(`Branch created: ${branchData.name}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating branch:', error);
      throw error;
    }
  }

  async updateBranch(branchId, updates, actingUserId) {
    try {
      if (!branchId) throw new BadRequestError('Branch ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await branchManagementRepository.findBranchById(branchId);
      if (!existing) throw new NotFoundError(`Branch with ID ${branchId} not found`);

      const updated = await branchManagementRepository.updateBranch(branchId, updates);
      logger.info(`Branch updated: ${branchId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating branch ${branchId}:`, error);
      throw error;
    }
  }

  async deleteBranch(branchId, actingUserId) {
    try {
      if (!branchId) throw new BadRequestError('Branch ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await branchManagementRepository.findBranchById(branchId);
      if (!existing) throw new NotFoundError(`Branch with ID ${branchId} not found`);

      await branchManagementRepository.deleteBranch(branchId);
      logger.info(`Branch deleted: ${branchId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting branch ${branchId}:`, error);
      throw error;
    }
  }

  // ========== DEPARTMENTS ==========

  async getDepartments(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;

      const repoOptions = {
        filterParentDepartmentId: filters.parentDepartmentId || null,
        filterTopLevelOnly: filters.topLevelOnly !== undefined ? filters.topLevelOnly : false,
        filterCode: filters.code || null,
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        filterIsDeleted: filters.isDeleted !== undefined ? filters.isDeleted : false,
        searchTerm: search || null,
        sortTable: sort?.table || 'department',
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };

      return await branchManagementRepository.getDepartments(repoOptions);
    } catch (error) {
      logger.error('Error fetching departments:', error);
      throw error;
    }
  }

  async getDepartmentById(departmentId) {
    try {
      if (!departmentId) throw new BadRequestError('Department ID is required');

      const department = await branchManagementRepository.findDepartmentById(departmentId);
      if (!department) throw new NotFoundError(`Department with ID ${departmentId} not found`);

      return department;
    } catch (error) {
      logger.error(`Error fetching department ${departmentId}:`, error);
      throw error;
    }
  }

  async createDepartment(departmentData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!departmentData.name) throw new BadRequestError('Department name is required');

      const created = await branchManagementRepository.createDepartment(departmentData);
      logger.info(`Department created: ${departmentData.name}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating department:', error);
      throw error;
    }
  }

  async updateDepartment(departmentId, updates, actingUserId) {
    try {
      if (!departmentId) throw new BadRequestError('Department ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await branchManagementRepository.findDepartmentById(departmentId);
      if (!existing) throw new NotFoundError(`Department with ID ${departmentId} not found`);

      // If changing parent department, validate it exists
      if (updates.parentDepartmentId) {
        const parentDepartment = await branchManagementRepository.findDepartmentById(updates.parentDepartmentId);
        if (!parentDepartment) throw new NotFoundError(`Parent Department with ID ${updates.parentDepartmentId} not found`);
      }

      const updated = await branchManagementRepository.updateDepartment(departmentId, updates);
      logger.info(`Department updated: ${departmentId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating department ${departmentId}:`, error);
      throw error;
    }
  }

  async deleteDepartment(departmentId, actingUserId) {
    try {
      if (!departmentId) throw new BadRequestError('Department ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await branchManagementRepository.findDepartmentById(departmentId);
      if (!existing) throw new NotFoundError(`Department with ID ${departmentId} not found`);

      await branchManagementRepository.deleteDepartment(departmentId);
      logger.info(`Department deleted: ${departmentId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting department ${departmentId}:`, error);
      throw error;
    }
  }

  // ========== BRANCH DEPARTMENTS ==========

  async getBranchDepartments(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;

      const repoOptions = {
        filterBranchId: filters.branchId || null,
        filterDepartmentId: filters.departmentId || null,
        filterBranchType: filters.branchType || null,
        filterBranchName: filters.branchName || null,
        filterDepartmentName: filters.departmentName || null,
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        filterIsDeleted: filters.isDeleted !== undefined ? filters.isDeleted : false,
        searchTerm: search || null,
        sortTable: sort?.table || 'branch_department',
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };

      return await branchManagementRepository.getBranchDepartments(repoOptions);
    } catch (error) {
      logger.error('Error fetching branch departments:', error);
      throw error;
    }
  }

  async getBranchDepartmentById(id) {
    try {
      if (!id) throw new BadRequestError('Branch Department ID is required');

      const branchDepartment = await branchManagementRepository.findBranchDepartmentById(id);
      if (!branchDepartment) throw new NotFoundError(`Branch Department with ID ${id} not found`);

      return branchDepartment;
    } catch (error) {
      logger.error(`Error fetching branch department ${id}:`, error);
      throw error;
    }
  }

  async createBranchDepartment(branchDepartmentData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!branchDepartmentData.branchId) throw new BadRequestError('Branch ID is required');
      if (!branchDepartmentData.departmentId) throw new BadRequestError('Department ID is required');

      // Validate branch exists
      const branch = await branchManagementRepository.findBranchById(branchDepartmentData.branchId);
      if (!branch) throw new NotFoundError(`Branch with ID ${branchDepartmentData.branchId} not found`);

      // Validate department exists
      const department = await branchManagementRepository.findDepartmentById(branchDepartmentData.departmentId);
      if (!department) throw new NotFoundError(`Department with ID ${branchDepartmentData.departmentId} not found`);

      const created = await branchManagementRepository.createBranchDepartment(branchDepartmentData);
      logger.info(`Branch Department created for branch ${branchDepartmentData.branchId} and department ${branchDepartmentData.departmentId}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating branch department:', error);
      throw error;
    }
  }

  async updateBranchDepartment(id, updates, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Branch Department ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await branchManagementRepository.findBranchDepartmentById(id);
      if (!existing) throw new NotFoundError(`Branch Department with ID ${id} not found`);

      // If changing branch, validate it exists
      if (updates.branchId) {
        const branch = await branchManagementRepository.findBranchById(updates.branchId);
        if (!branch) throw new NotFoundError(`Branch with ID ${updates.branchId} not found`);
      }

      // If changing department, validate it exists
      if (updates.departmentId) {
        const department = await branchManagementRepository.findDepartmentById(updates.departmentId);
        if (!department) throw new NotFoundError(`Department with ID ${updates.departmentId} not found`);
      }

      const updated = await branchManagementRepository.updateBranchDepartment(id, updates);
      logger.info(`Branch Department updated: ${id}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating branch department ${id}:`, error);
      throw error;
    }
  }

  async deleteBranchDepartment(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Branch Department ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await branchManagementRepository.findBranchDepartmentById(id);
      if (!existing) throw new NotFoundError(`Branch Department with ID ${id} not found`);

      await branchManagementRepository.deleteBranchDepartment(id);
      logger.info(`Branch Department deleted: ${id}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting branch department ${id}:`, error);
      throw error;
    }
  }

  async restoreBranch(id) {
    if (!id) throw new BadRequestError('Branch ID is required');
    await branchManagementRepository.restoreBranch(id);
    return { id };
  }

  async restoreDepartment(id) {
    if (!id) throw new BadRequestError('Department ID is required');
    await branchManagementRepository.restoreDepartment(id);
    return { id };
  }
}

module.exports = new BranchManagementService();
