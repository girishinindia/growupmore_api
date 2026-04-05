/**
 * ═══════════════════════════════════════════════════════════════
 * BRANCH MANAGEMENT CONTROLLER — Branches, Departments, Branch Departments
 * ═══════════════════════════════════════════════════════════════
 */

const branchManagementService = require('../../../services/branchManagement.service');
const { sendSuccess, sendCreated } = require('../../../utils/response');

class BranchManagementController {
  // ==================== BRANCHES ====================

  async getBranches(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'id', sortDir = 'asc', countryId, stateId, cityId, branchType, isActive } = req.query;

      const filters = {};
      if (countryId !== undefined) filters.countryId = countryId;
      if (stateId !== undefined) filters.stateId = stateId;
      if (cityId !== undefined) filters.cityId = cityId;
      if (branchType !== undefined) filters.branchType = branchType;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await branchManagementService.getBranches({
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

      sendSuccess(res, { data, message: 'Branches retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getBranchById(req, res, next) {
    try {
      const data = await branchManagementService.getBranchById(req.params.id);
      sendSuccess(res, { data, message: 'Branch retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createBranch(req, res, next) {
    try {
      const data = await branchManagementService.createBranch(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Branch created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateBranch(req, res, next) {
    try {
      const data = await branchManagementService.updateBranch(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Branch updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteBranch(req, res, next) {
    try {
      await branchManagementService.deleteBranch(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Branch deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ==================== DEPARTMENTS ====================

  async getDepartments(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'id', sortDir = 'asc', parentDepartmentId, topLevelOnly, code, isActive } = req.query;

      const filters = {};
      if (parentDepartmentId !== undefined) filters.parentDepartmentId = parentDepartmentId;
      if (topLevelOnly !== undefined) filters.topLevelOnly = topLevelOnly;
      if (code !== undefined) filters.code = code;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await branchManagementService.getDepartments({
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

      sendSuccess(res, { data, message: 'Departments retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentById(req, res, next) {
    try {
      const data = await branchManagementService.getDepartmentById(req.params.id);
      sendSuccess(res, { data, message: 'Department retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createDepartment(req, res, next) {
    try {
      const data = await branchManagementService.createDepartment(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Department created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateDepartment(req, res, next) {
    try {
      const data = await branchManagementService.updateDepartment(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Department updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteDepartment(req, res, next) {
    try {
      await branchManagementService.deleteDepartment(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Department deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ==================== BRANCH DEPARTMENTS ====================

  async getBranchDepartments(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'id', sortDir = 'asc', branchId, departmentId, branchType, isActive } = req.query;

      const filters = {};
      if (branchId !== undefined) filters.branchId = branchId;
      if (departmentId !== undefined) filters.departmentId = departmentId;
      if (branchType !== undefined) filters.branchType = branchType;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await branchManagementService.getBranchDepartments({
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

      sendSuccess(res, { data, message: 'Branch Departments retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getBranchDepartmentById(req, res, next) {
    try {
      const data = await branchManagementService.getBranchDepartmentById(req.params.id);
      sendSuccess(res, { data, message: 'Branch Department retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createBranchDepartment(req, res, next) {
    try {
      const data = await branchManagementService.createBranchDepartment(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Branch Department created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateBranchDepartment(req, res, next) {
    try {
      const data = await branchManagementService.updateBranchDepartment(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Branch Department updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteBranchDepartment(req, res, next) {
    try {
      await branchManagementService.deleteBranchDepartment(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Branch Department deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreBranch(req, res, next) {
    try {
      const data = await branchManagementService.restoreBranch(req.params.id);
      sendSuccess(res, { message: 'Branch restored successfully', data });
    } catch (error) {
      next(error);
    }
  }

  async restoreDepartment(req, res, next) {
    try {
      const data = await branchManagementService.restoreDepartment(req.params.id);
      sendSuccess(res, { message: 'Department restored successfully', data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BranchManagementController();
