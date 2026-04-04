const rbacRepository = require('../repositories/rbac.repository');
const logger = require('../config/logger');
const { BadRequestError, ForbiddenError, NotFoundError, ConflictError } = require('../utils/errors');

/**
 * RBAC Service - Core service for Role-Based Access Control
 * Enforces hierarchy rules and manages roles, permissions, and user assignments
 */
class RbacService {
  /**
   * Role hierarchy levels (lower number = higher privilege)
   */
  static ROLE_LEVELS = {
    super_admin: 0,
    admin: 1,
    moderator: 2,
    content_manager: 2,
    finance_admin: 2,
    support_agent: 3,
    instructor: 4,
    student: 5
  };

  /**
   * System roles that cannot be deleted
   */
  static SYSTEM_ROLES = [
    'super_admin',
    'admin',
    'moderator',
    'content_manager',
    'finance_admin',
    'support_agent',
    'instructor',
    'student'
  ];

  // ========== ROLES ==========

  /**
   * Get list of roles with filtering, search, sorting, and pagination
   * Respects acting user's level to filter what they can see
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Roles with pagination metadata
   */
  async getRoles(options = {}) {
    try {
      const { filters, search, sort, pagination } = options;
      const roles = await rbacRepository.getRoles({
        filters,
        search,
        sort,
        pagination
      });
      return roles;
    } catch (error) {
      logger.error('Error fetching roles:', error);
      throw error;
    }
  }

  /**
   * Get a single role by ID
   * @param {string} roleId - Role ID
   * @returns {Promise<Object>} Role object
   */
  async getRoleById(roleId) {
    try {
      if (!roleId) {
        throw new BadRequestError('Role ID is required');
      }
      const role = await rbacRepository.findRoleById(roleId);
      if (!role) {
        throw new NotFoundError(`Role with ID ${roleId} not found`);
      }
      return role;
    } catch (error) {
      logger.error(`Error fetching role ${roleId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new role (only super_admin)
   * @param {Object} roleData - Role data
   * @param {string} actingUserId - User ID performing the action
   * @returns {Promise<Object>} Created role
   */
  async createRole(roleData, actingUserId) {
    try {
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }
      if (!roleData.code) {
        throw new BadRequestError('Role code is required');
      }
      if (!roleData.name) {
        throw new BadRequestError('Role name is required');
      }

      // Only super_admin can create roles
      await this._enforceHierarchy(actingUserId, null, 'CREATE_ROLE', 'super_admin');

      // Check if role code already exists
      const existingRole = await rbacRepository.findRoleByCode(roleData.code);
      if (existingRole) {
        throw new ConflictError(`Role with code ${roleData.code} already exists`);
      }

      // Validate level if provided
      if (roleData.level !== undefined && roleData.level !== null) {
        if (typeof roleData.level !== 'number' || roleData.level < 0) {
          throw new BadRequestError('Role level must be a non-negative number');
        }
      }

      const createdRole = await rbacRepository.createRole({
        ...roleData,
        createdBy: actingUserId
      });

      logger.info(`Role created: ${createdRole.code}`, { createdBy: actingUserId });
      return createdRole;
    } catch (error) {
      logger.error('Error creating role:', error);
      throw error;
    }
  }

  /**
   * Update a role (only super_admin)
   * @param {string} roleId - Role ID
   * @param {Object} updates - Fields to update
   * @param {string} actingUserId - User ID performing the action
   * @returns {Promise<Object>} Updated role
   */
  async updateRole(roleId, updates, actingUserId) {
    try {
      if (!roleId) {
        throw new BadRequestError('Role ID is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      // Only super_admin can update roles
      await this._enforceHierarchy(actingUserId, null, 'UPDATE_ROLE', 'super_admin');

      const role = await rbacRepository.findRoleById(roleId);
      if (!role) {
        throw new NotFoundError(`Role with ID ${roleId} not found`);
      }

      // Cannot change code of system roles
      if (updates.code && updates.code !== role.code && RbacService.SYSTEM_ROLES.includes(role.code)) {
        throw new ForbiddenError('Cannot modify system role code');
      }

      // Validate level if being updated
      if (updates.level !== undefined && updates.level !== null) {
        if (typeof updates.level !== 'number' || updates.level < 0) {
          throw new BadRequestError('Role level must be a non-negative number');
        }
      }

      const updatedRole = await rbacRepository.updateRole(roleId, {
        ...updates,
        updatedBy: actingUserId
      });

      logger.info(`Role updated: ${roleId}`, { updatedBy: actingUserId });
      return updatedRole;
    } catch (error) {
      logger.error(`Error updating role ${roleId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a role (only super_admin)
   * Cannot delete system roles
   * @param {string} roleId - Role ID
   * @param {string} actingUserId - User ID performing the action
   * @returns {Promise<void>}
   */
  async deleteRole(roleId, actingUserId) {
    try {
      if (!roleId) {
        throw new BadRequestError('Role ID is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      // Only super_admin can delete roles
      await this._enforceHierarchy(actingUserId, null, 'DELETE_ROLE', 'super_admin');

      const role = await rbacRepository.findRoleById(roleId);
      if (!role) {
        throw new NotFoundError(`Role with ID ${roleId} not found`);
      }

      // Cannot delete system roles
      if (RbacService.SYSTEM_ROLES.includes(role.code)) {
        throw new ForbiddenError('Cannot delete system roles');
      }

      await rbacRepository.deleteRole(roleId);
      logger.info(`Role deleted: ${roleId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting role ${roleId}:`, error);
      throw error;
    }
  }

  /**
   * Restore a deleted role (only super_admin)
   * @param {string} roleId - Role ID
   * @param {boolean} restorePermissions - Whether to restore associated permissions
   * @param {string} actingUserId - User ID performing the action
   * @returns {Promise<Object>} Restored role
   */
  async restoreRole(roleId, restorePermissions = false, actingUserId) {
    try {
      if (!roleId) {
        throw new BadRequestError('Role ID is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      // Only super_admin can restore roles
      await this._enforceHierarchy(actingUserId, null, 'RESTORE_ROLE', 'super_admin');

      const restoredRole = await rbacRepository.restoreRole(roleId, restorePermissions);
      logger.info(`Role restored: ${roleId}`, { restoredBy: actingUserId, restorePermissions });
      return restoredRole;
    } catch (error) {
      logger.error(`Error restoring role ${roleId}:`, error);
      throw error;
    }
  }

  // ========== ROLE PERMISSIONS ==========

  /**
   * Get permissions assigned to a role
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Permissions with pagination metadata
   */
  async getRolePermissions(options = {}) {
    try {
      const { roleId, roleCode, filters, search, pagination } = options;

      if (!roleId && !roleCode) {
        throw new BadRequestError('Either roleId or roleCode is required');
      }

      let role;
      if (roleId) {
        role = await rbacRepository.findRoleById(roleId);
        if (!role) {
          throw new NotFoundError(`Role with ID ${roleId} not found`);
        }
      } else {
        role = await rbacRepository.findRoleByCode(roleCode);
        if (!role) {
          throw new NotFoundError(`Role with code ${roleCode} not found`);
        }
      }

      const permissions = await rbacRepository.getRolePermissions({
        roleId: role.id,
        filters,
        search,
        pagination
      });

      return permissions;
    } catch (error) {
      logger.error('Error fetching role permissions:', error);
      throw error;
    }
  }

  /**
   * Assign a permission to a role (only super_admin)
   * @param {string} roleId - Role ID
   * @param {string} permissionId - Permission ID
   * @param {string} actingUserId - User ID performing the action
   * @returns {Promise<Object>} Assignment result
   */
  async assignPermissionToRole(roleId, permissionId, actingUserId) {
    try {
      if (!roleId) {
        throw new BadRequestError('Role ID is required');
      }
      if (!permissionId) {
        throw new BadRequestError('Permission ID is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      // Only super_admin can assign permissions to roles
      await this._enforceHierarchy(actingUserId, null, 'ASSIGN_PERMISSION', 'super_admin');

      const role = await rbacRepository.findRoleById(roleId);
      if (!role) {
        throw new NotFoundError(`Role with ID ${roleId} not found`);
      }

      const permission = await rbacRepository.findPermissionById(permissionId);
      if (!permission) {
        throw new NotFoundError(`Permission with ID ${permissionId} not found`);
      }

      const result = await rbacRepository.assignPermissionToRole(roleId, permissionId, actingUserId);
      logger.info(`Permission assigned to role`, { roleId, permissionId, assignedBy: actingUserId });
      return result;
    } catch (error) {
      logger.error('Error assigning permission to role:', error);
      throw error;
    }
  }

  /**
   * Assign multiple permissions to a role in bulk (only super_admin)
   * @param {string} roleId - Role ID
   * @param {string[]} permissionIds - Array of permission IDs
   * @param {string} actingUserId - User ID performing the action
   * @returns {Promise<Object>} Bulk assignment result
   */
  async assignPermissionsToRole(roleId, permissionIds, actingUserId) {
    try {
      if (!roleId) {
        throw new BadRequestError('Role ID is required');
      }
      if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
        throw new BadRequestError('At least one permission ID is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      // Only super_admin can assign permissions to roles
      await this._enforceHierarchy(actingUserId, null, 'ASSIGN_PERMISSION', 'super_admin');

      const role = await rbacRepository.findRoleById(roleId);
      if (!role) {
        throw new NotFoundError(`Role with ID ${roleId} not found`);
      }

      // Validate all permissions exist
      for (const permissionId of permissionIds) {
        const permission = await rbacRepository.findPermissionById(permissionId);
        if (!permission) {
          throw new NotFoundError(`Permission with ID ${permissionId} not found`);
        }
      }

      const result = await rbacRepository.assignPermissionsToRole(roleId, permissionIds, actingUserId);
      logger.info(`Permissions bulk assigned to role`, {
        roleId,
        count: permissionIds.length,
        assignedBy: actingUserId
      });
      return result;
    } catch (error) {
      logger.error('Error bulk assigning permissions to role:', error);
      throw error;
    }
  }

  /**
   * Remove a permission from a role (only super_admin)
   * @param {string} roleId - Role ID
   * @param {string} permissionId - Permission ID
   * @param {string} actingUserId - User ID performing the action
   * @returns {Promise<void>}
   */
  async removePermissionFromRole(roleId, permissionId, actingUserId) {
    try {
      if (!roleId) {
        throw new BadRequestError('Role ID is required');
      }
      if (!permissionId) {
        throw new BadRequestError('Permission ID is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      // Only super_admin can remove permissions from roles
      await this._enforceHierarchy(actingUserId, null, 'REMOVE_PERMISSION', 'super_admin');

      const role = await rbacRepository.findRoleById(roleId);
      if (!role) {
        throw new NotFoundError(`Role with ID ${roleId} not found`);
      }

      const permission = await rbacRepository.findPermissionById(permissionId);
      if (!permission) {
        throw new NotFoundError(`Permission with ID ${permissionId} not found`);
      }

      await rbacRepository.removePermissionFromRole(roleId, permissionId);
      logger.info(`Permission removed from role`, { roleId, permissionId, removedBy: actingUserId });
    } catch (error) {
      logger.error('Error removing permission from role:', error);
      throw error;
    }
  }

  /**
   * Remove all permissions from a role (only super_admin)
   * @param {string} roleId - Role ID
   * @param {string} actingUserId - User ID performing the action
   * @returns {Promise<void>}
   */
  async removeAllPermissionsFromRole(roleId, actingUserId) {
    try {
      if (!roleId) {
        throw new BadRequestError('Role ID is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      // Only super_admin can remove permissions from roles
      await this._enforceHierarchy(actingUserId, null, 'REMOVE_PERMISSION', 'super_admin');

      const role = await rbacRepository.findRoleById(roleId);
      if (!role) {
        throw new NotFoundError(`Role with ID ${roleId} not found`);
      }

      await rbacRepository.removeAllPermissionsFromRole(roleId);
      logger.info(`All permissions removed from role`, { roleId, removedBy: actingUserId });
    } catch (error) {
      logger.error('Error removing all permissions from role:', error);
      throw error;
    }
  }

  // ========== USER ROLE ASSIGNMENTS ==========

  /**
   * Get role assignments for a user or a role
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Assignments with pagination metadata
   */
  async getUserRoleAssignments(options = {}) {
    try {
      const { userId, roleId, filters, search, pagination } = options;

      if (!userId && !roleId) {
        throw new BadRequestError('Either userId or roleId is required');
      }

      const assignments = await rbacRepository.getUserRoleAssignments({
        userId,
        roleId,
        filters,
        search,
        pagination
      });

      return assignments;
    } catch (error) {
      logger.error('Error fetching user role assignments:', error);
      throw error;
    }
  }

  /**
   * Assign a role to a user (WITH HIERARCHY CHECK)
   * A user can only assign roles to users whose role level is HIGHER (numerically greater) than their own
   * @param {Object} assignmentData - Assignment data
   * @param {string} assignmentData.userId - Target user ID
   * @param {string} assignmentData.roleId - Role ID to assign
   * @param {string} assignmentData.contextType - Context type (optional)
   * @param {string} assignmentData.contextId - Context ID (optional)
   * @param {Date} assignmentData.expiresAt - Expiration date (optional)
   * @param {string} assignmentData.reason - Reason for assignment (optional)
   * @param {string} actingUserId - User ID performing the action
   * @returns {Promise<Object>} Created assignment
   */
  async assignRoleToUser(assignmentData, actingUserId) {
    try {
      if (!assignmentData.userId) {
        throw new BadRequestError('Target user ID is required');
      }
      if (!assignmentData.roleId) {
        throw new BadRequestError('Role ID is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      // Get target role
      const targetRole = await rbacRepository.findRoleById(assignmentData.roleId);
      if (!targetRole) {
        throw new NotFoundError(`Role with ID ${assignmentData.roleId} not found`);
      }

      // Enforce hierarchy
      await this._enforceHierarchy(actingUserId, assignmentData.roleId, 'ASSIGN_ROLE');

      const result = await rbacRepository.assignRoleToUser({
        ...assignmentData,
        createdBy: actingUserId
      });

      logger.info(`Role assigned to user`, {
        userId: assignmentData.userId,
        roleId: assignmentData.roleId,
        assignedBy: actingUserId
      });
      return result;
    } catch (error) {
      logger.error('Error assigning role to user:', error);
      throw error;
    }
  }

  /**
   * Update a user's role assignment (WITH HIERARCHY CHECK)
   * @param {string} assignmentId - Assignment ID
   * @param {Object} updates - Fields to update
   * @param {string} actingUserId - User ID performing the action
   * @returns {Promise<Object>} Updated assignment
   */
  async updateUserRoleAssignment(assignmentId, updates, actingUserId) {
    try {
      if (!assignmentId) {
        throw new BadRequestError('Assignment ID is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      const assignment = await rbacRepository.getUserRoleAssignments({
        assignmentId,
        pagination: { limit: 1 }
      });

      if (!assignment || assignment.data.length === 0) {
        throw new NotFoundError(`Assignment with ID ${assignmentId} not found`);
      }

      const currentAssignment = assignment.data[0];

      // If changing the role, enforce hierarchy on the new role
      if (updates.roleId && updates.roleId !== currentAssignment.roleId) {
        await this._enforceHierarchy(actingUserId, updates.roleId, 'ASSIGN_ROLE');
      } else {
        // Even if not changing role, still check hierarchy on current role
        await this._enforceHierarchy(actingUserId, currentAssignment.roleId, 'ASSIGN_ROLE');
      }

      const updatedAssignment = await rbacRepository.updateUserRoleAssignment(assignmentId, {
        ...updates,
        updatedBy: actingUserId
      });

      logger.info(`User role assignment updated: ${assignmentId}`, { updatedBy: actingUserId });
      return updatedAssignment;
    } catch (error) {
      logger.error(`Error updating role assignment ${assignmentId}:`, error);
      throw error;
    }
  }

  /**
   * Revoke a user's role assignment (WITH HIERARCHY CHECK)
   * @param {string} assignmentId - Assignment ID
   * @param {string} actingUserId - User ID performing the action
   * @returns {Promise<void>}
   */
  async revokeUserRoleAssignment(assignmentId, actingUserId) {
    try {
      if (!assignmentId) {
        throw new BadRequestError('Assignment ID is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      const assignment = await rbacRepository.getUserRoleAssignments({
        assignmentId,
        pagination: { limit: 1 }
      });

      if (!assignment || assignment.data.length === 0) {
        throw new NotFoundError(`Assignment with ID ${assignmentId} not found`);
      }

      const currentAssignment = assignment.data[0];

      // Enforce hierarchy on the role being revoked
      await this._enforceHierarchy(actingUserId, currentAssignment.roleId, 'ASSIGN_ROLE');

      await rbacRepository.deleteUserRoleAssignment(assignmentId);
      logger.info(`User role assignment revoked: ${assignmentId}`, { revokedBy: actingUserId });
    } catch (error) {
      logger.error(`Error revoking role assignment ${assignmentId}:`, error);
      throw error;
    }
  }

  /**
   * Restore a revoked role assignment
   * @param {string} assignmentId - Assignment ID
   * @param {string} actingUserId - User ID performing the action
   * @returns {Promise<Object>} Restored assignment
   */
  async restoreUserRoleAssignment(assignmentId, actingUserId) {
    try {
      if (!assignmentId) {
        throw new BadRequestError('Assignment ID is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      const restoredAssignment = await rbacRepository.restoreUserRoleAssignment(assignmentId);
      logger.info(`User role assignment restored: ${assignmentId}`, { restoredBy: actingUserId });
      return restoredAssignment;
    } catch (error) {
      logger.error(`Error restoring role assignment ${assignmentId}:`, error);
      throw error;
    }
  }

  // ========== PERMISSIONS (read-only) ==========

  /**
   * Get list of all permissions
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Permissions with pagination metadata
   */
  async getPermissions(options = {}) {
    try {
      const { filters, search, pagination } = options;
      const permissions = await rbacRepository.getPermissions({
        filters,
        search,
        pagination
      });
      return permissions;
    } catch (error) {
      logger.error('Error fetching permissions:', error);
      throw error;
    }
  }

  /**
   * Get a single permission by ID
   * @param {string} permissionId - Permission ID
   * @returns {Promise<Object>} Permission object
   */
  async getPermissionById(permissionId) {
    try {
      if (!permissionId) {
        throw new BadRequestError('Permission ID is required');
      }
      const permission = await rbacRepository.findPermissionById(permissionId);
      if (!permission) {
        throw new NotFoundError(`Permission with ID ${permissionId} not found`);
      }
      return permission;
    } catch (error) {
      logger.error(`Error fetching permission ${permissionId}:`, error);
      throw error;
    }
  }

  // ========== MODULES (read-only) ==========

  /**
   * Get list of all modules
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Modules with pagination metadata
   */
  async getModules(options = {}) {
    try {
      const { filters, search, pagination } = options;
      const modules = await rbacRepository.getModules({
        filters,
        search,
        pagination
      });
      return modules;
    } catch (error) {
      logger.error('Error fetching modules:', error);
      throw error;
    }
  }

  // ========== USER PERMISSIONS (helpers) ==========

  /**
   * Get all permissions for a user
   * Combines permissions from all their role assignments
   * @param {string} userId - User ID
   * @returns {Promise<Object[]>} Array of permission objects
   */
  async getUserPermissions(userId) {
    try {
      if (!userId) {
        throw new BadRequestError('User ID is required');
      }
      const permissions = await rbacRepository.getUserPermissions(userId);
      return permissions;
    } catch (error) {
      logger.error(`Error fetching user permissions for ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Check if a user has a specific permission
   * @param {string} userId - User ID
   * @param {string} permissionCode - Permission code
   * @returns {Promise<boolean>} True if user has permission
   */
  async checkUserPermission(userId, permissionCode) {
    try {
      if (!userId) {
        throw new BadRequestError('User ID is required');
      }
      if (!permissionCode) {
        throw new BadRequestError('Permission code is required');
      }
      const hasPermission = await rbacRepository.userHasPermission(userId, permissionCode);
      return hasPermission;
    } catch (error) {
      logger.error(`Error checking user permission ${permissionCode} for ${userId}:`, error);
      throw error;
    }
  }

  // ========== PRIVATE HELPERS ==========

  /**
   * Get the highest role (lowest level number) for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} { roleCode, roleLevel }
   * @private
   */
  async _getActingUserHighestRole(userId) {
    try {
      const assignments = await rbacRepository.getUserRoleAssignments({
        userId,
        pagination: { limit: 1000 }
      });

      if (!assignments || assignments.data.length === 0) {
        return null;
      }

      // Find the role with the lowest level number (highest privilege)
      let highestRole = null;
      let lowestLevel = Number.MAX_SAFE_INTEGER;

      for (const assignment of assignments.data) {
        const roleLevel = RbacService.ROLE_LEVELS[assignment.role?.code];
        if (roleLevel !== undefined && roleLevel < lowestLevel) {
          lowestLevel = roleLevel;
          highestRole = {
            roleCode: assignment.role?.code,
            roleLevel: roleLevel,
            roleId: assignment.roleId
          };
        }
      }

      return highestRole;
    } catch (error) {
      logger.error(`Error getting highest role for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Check if an acting user's level allows them to manage a target role
   * @param {number} actingLevel - Acting user's role level
   * @param {string} targetRoleCode - Target role code
   * @returns {boolean} True if acting user can manage target role
   * @private
   */
  _canActOnRole(actingLevel, targetRoleCode) {
    const targetLevel = RbacService.ROLE_LEVELS[targetRoleCode];

    if (targetLevel === undefined) {
      return false;
    }

    // Acting user can only manage users with higher level numbers (lower privilege)
    // Level 0 (super_admin) can manage level 1-5
    // Level 1 (admin) can manage level 2-5
    // Level 2 (moderator/content_manager) can manage level 3-5, etc.
    return actingLevel < targetLevel;
  }

  /**
   * Main hierarchy enforcement function
   * Validates if acting user can perform the action on the target role
   * @param {string} actingUserId - User ID performing the action
   * @param {string} targetRoleId - Target role ID (null for role-level operations)
   * @param {string} action - Action being performed (for logging)
   * @param {string} requiredRole - Specific role required (e.g., 'super_admin')
   * @throws {ForbiddenError} If user lacks permission
   * @private
   */
  async _enforceHierarchy(actingUserId, targetRoleId, action, requiredRole = null) {
    try {
      // Get acting user's highest role
      const actingUserRole = await this._getActingUserHighestRole(actingUserId);

      if (!actingUserRole) {
        throw new ForbiddenError('User has no roles assigned');
      }

      // If specific role is required, check it
      if (requiredRole) {
        if (actingUserRole.roleCode !== requiredRole) {
          throw new ForbiddenError(
            `This action requires ${requiredRole} role. User has ${actingUserRole.roleCode} role`
          );
        }
        return;
      }

      // If no target role specified, only super_admin can act (for role creation, etc.)
      if (!targetRoleId) {
        if (actingUserRole.roleCode !== 'super_admin') {
          throw new ForbiddenError('Only super_admin can perform this action');
        }
        return;
      }

      // Get target role
      const targetRole = await rbacRepository.findRoleById(targetRoleId);
      if (!targetRole) {
        throw new NotFoundError(`Target role with ID ${targetRoleId} not found`);
      }

      // Special rules for super_admin
      if (actingUserRole.roleCode === 'super_admin') {
        // Super admin can do anything except delete another super_admin
        if (action === 'DELETE_ROLE' || action === 'REVOKE_ROLE') {
          if (targetRole.code === 'super_admin') {
            throw new ForbiddenError('Super admin cannot delete/revoke another super_admin');
          }
        }
        return;
      }

      // Special rules for admin
      if (actingUserRole.roleCode === 'admin') {
        // Admin cannot create or act on super_admin or other admins
        if (targetRole.code === 'super_admin' || targetRole.code === 'admin') {
          throw new ForbiddenError(
            `Admin cannot manage ${targetRole.code} roles`
          );
        }
        // Admin can manage moderator and below
        if (!this._canActOnRole(RbacService.ROLE_LEVELS.admin, targetRole.code)) {
          throw new ForbiddenError(
            `Admin can only manage roles with level ${RbacService.ROLE_LEVELS.admin} or higher`
          );
        }
        return;
      }

      // General hierarchy rule: can only manage users with higher level (numerically)
      if (!this._canActOnRole(actingUserRole.roleLevel, RbacService.ROLE_LEVELS[targetRole.code])) {
        throw new ForbiddenError(
          `User cannot manage role with level ${RbacService.ROLE_LEVELS[targetRole.code]}`
        );
      }
    } catch (error) {
      if (error instanceof ForbiddenError || error instanceof NotFoundError) {
        throw error;
      }
      logger.error('Error enforcing hierarchy:', error);
      throw new ForbiddenError('Hierarchy enforcement failed');
    }
  }
}

module.exports = new RbacService();
