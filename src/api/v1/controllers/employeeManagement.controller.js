/**
 * ═══════════════════════════════════════════════════════════════
 * EMPLOYEE MANAGEMENT CONTROLLER — Employee Profiles
 * ═══════════════════════════════════════════════════════════════
 */

const employeeManagementService = require('../../../services/employeeManagement.service');
const { sendSuccess, sendCreated } = require('../../../utils/response');

class EmployeeManagementController {
  // ==================== EMPLOYEE PROFILES ====================

  async getEmployeeProfiles(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        sortBy = 'id',
        sortDir = 'asc',
        userId,
        employeeType,
        workMode,
        shiftType,
        payGrade,
        designationId,
        departmentId,
        branchId,
        reportingManagerId,
        isActive,
      } = req.query;

      const filters = {};
      if (userId !== undefined) filters.userId = userId;
      if (employeeType !== undefined) filters.employeeType = employeeType;
      if (workMode !== undefined) filters.workMode = workMode;
      if (shiftType !== undefined) filters.shiftType = shiftType;
      if (payGrade !== undefined) filters.payGrade = payGrade;
      if (designationId !== undefined) filters.designationId = designationId;
      if (departmentId !== undefined) filters.departmentId = departmentId;
      if (branchId !== undefined) filters.branchId = branchId;
      if (reportingManagerId !== undefined) filters.reportingManagerId = reportingManagerId;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await employeeManagementService.getEmployeeProfiles({
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

      sendSuccess(res, { data, message: 'Employee Profiles retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeProfileById(req, res, next) {
    try {
      const data = await employeeManagementService.getEmployeeProfileById(req.params.id);
      sendSuccess(res, { data, message: 'Employee Profile retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createEmployeeProfile(req, res, next) {
    try {
      const data = await employeeManagementService.createEmployeeProfile(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Employee Profile created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateEmployeeProfile(req, res, next) {
    try {
      const data = await employeeManagementService.updateEmployeeProfile(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Employee Profile updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteEmployeeProfile(req, res, next) {
    try {
      await employeeManagementService.deleteEmployeeProfile(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Employee Profile deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreEmployeeProfile(req, res, next) {
    try {
      const data = await employeeManagementService.restoreEmployeeProfile(req.params.id);
      sendSuccess(res, { message: 'Employee profile restored successfully', data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EmployeeManagementController();
