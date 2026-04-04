const rbacService = require('../../../services/rbac.service');
const { sendSuccess, sendCreated } = require('../../../utils/response');
const { StatusCodes } = require('http-status-codes');

class RbacController {
  // ==================== ROLES ====================

  async getRoles(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'name', sortDir = 'asc', level, isSystemRole, parentRoleId, isActive } = req.query;

      const filters = {};
      if (level !== undefined) filters.level = level;
      if (isSystemRole !== undefined) filters.isSystemRole = isSystemRole === 'true';
      if (parentRoleId !== undefined) filters.parentRoleId = parentRoleId;
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const data = await rbacService.getRoles({
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

      sendSuccess(res, data, 'Roles retrieved successfully', meta);
    } catch (error) {
      next(error);
    }
  }

  async getRoleById(req, res, next) {
    try {
      const data = await rbacService.getRoleById(req.params.id);
      sendSuccess(res, data, 'Role retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createRole(req, res, next) {
    try {
      const data = await rbacService.createRole(req.body, req.user.userId);
      sendCreated(res, data, 'Role created successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateRole(req, res, next) {
    try {
      const data = await rbacService.updateRole(req.params.id, req.body, req.user.userId);
      sendSuccess(res, data, 'Role updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteRole(req, res, next) {
    try {
      const data = await rbacService.deleteRole(req.params.id, req.user.userId);
      sendSuccess(res, data, 'Role deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  async restoreRole(req, res, next) {
    try {
      const data = await rbacService.restoreRole(req.params.id, req.body.restorePermissions, req.user.userId);
      sendSuccess(res, data, 'Role restored successfully');
    } catch (error) {
      next(error);
    }
  }

  // ==================== ROLE PERMISSIONS ====================

  async getRolePermissions(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'name', sortDir = 'asc' } = req.query;

      const data = await rbacService.getRolePermissions(req.params.roleId, {
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

      sendSuccess(res, data, 'Role permissions retrieved successfully', meta);
    } catch (error) {
      next(error);
    }
  }

  async assignPermission(req, res, next) {
    try {
      const data = await rbacService.assignPermissionToRole(req.params.roleId, req.body.permissionId, req.user.userId);
      sendCreated(res, data, 'Permission assigned to role successfully');
    } catch (error) {
      next(error);
    }
  }

  async bulkAssignPermissions(req, res, next) {
    try {
      const data = await rbacService.assignPermissionsToRole(req.params.roleId, req.body.permissionIds, req.user.userId);
      sendCreated(res, data, 'Permissions assigned to role successfully');
    } catch (error) {
      next(error);
    }
  }

  async removePermission(req, res, next) {
    try {
      const data = await rbacService.removePermissionFromRole(req.params.roleId, req.params.permissionId, req.user.userId);
      sendSuccess(res, data, 'Permission removed from role successfully');
    } catch (error) {
      next(error);
    }
  }

  async removeAllPermissions(req, res, next) {
    try {
      const data = await rbacService.removeAllPermissionsFromRole(req.params.roleId, req.user.userId);
      sendSuccess(res, data, 'All permissions removed from role successfully');
    } catch (error) {
      next(error);
    }
  }

  // ==================== USER ROLE ASSIGNMENTS ====================

  async getUserRoleAssignments(req, res, next) {
    try {
      const { page = 1, limit = 20, search, userId, roleId, roleCode, contextType, sortBy = 'createdAt', sortDir = 'desc' } = req.query;

      const filters = {};
      if (userId !== undefined) filters.userId = userId;
      if (roleId !== undefined) filters.roleId = roleId;
      if (roleCode !== undefined) filters.roleCode = roleCode;
      if (contextType !== undefined) filters.contextType = contextType;

      const data = await rbacService.getUserRoleAssignments({
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

      sendSuccess(res, data, 'User role assignments retrieved successfully', meta);
    } catch (error) {
      next(error);
    }
  }

  async assignRoleToUser(req, res, next) {
    try {
      const data = await rbacService.assignRoleToUser(req.body, req.user.userId);
      sendCreated(res, data, 'Role assigned to user successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateAssignment(req, res, next) {
    try {
      const data = await rbacService.updateUserRoleAssignment(req.params.id, req.body, req.user.userId);
      sendSuccess(res, data, 'User role assignment updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async revokeAssignment(req, res, next) {
    try {
      const data = await rbacService.revokeUserRoleAssignment(req.params.id, req.user.userId);
      sendSuccess(res, data, 'User role assignment revoked successfully');
    } catch (error) {
      next(error);
    }
  }

  async restoreAssignment(req, res, next) {
    try {
      const data = await rbacService.restoreUserRoleAssignment(req.params.id, req.user.userId);
      sendSuccess(res, data, 'User role assignment restored successfully');
    } catch (error) {
      next(error);
    }
  }

  // ==================== PERMISSIONS (READ-ONLY) ====================

  async getPermissions(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'name', sortDir = 'asc' } = req.query;

      const data = await rbacService.getPermissions({
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

      sendSuccess(res, data, 'Permissions retrieved successfully', meta);
    } catch (error) {
      next(error);
    }
  }

  async getPermissionById(req, res, next) {
    try {
      const data = await rbacService.getPermissionById(req.params.id);
      sendSuccess(res, data, 'Permission retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // ==================== MODULES (READ-ONLY) ====================

  async getModules(req, res, next) {
    try {
      const data = await rbacService.getModules();
      sendSuccess(res, data, 'Modules retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // ==================== USER PERMISSIONS ====================

  async getMyPermissions(req, res, next) {
    try {
      const data = await rbacService.getUserPermissions(req.user.userId);
      sendSuccess(res, data, 'Your permissions retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getUserPermissions(req, res, next) {
    try {
      const data = await rbacService.getUserPermissions(req.params.userId);
      sendSuccess(res, data, 'User permissions retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RbacController();
