/**
 * ROLES SERVICE — Business logic for Roles, Role-Permissions, User-Role-Assignments
 */

const rolesRepository = require('../repositories/roles.repository');
const rolePermissionsRepository = require('../repositories/role-permissions.repository');
const userRoleAssignmentsRepository = require('../repositories/user-role-assignments.repository');
const logger = require('../config/logger');

class RolesService {
  // ─── Roles CRUD ──────────────────────────────────────────

  async listRoles(params) {
    return rolesRepository.list(params);
  }

  async getRoleById(id) {
    return rolesRepository.getById(id);
  }

  async getRoleByCode(code) {
    return rolesRepository.getByCode(code);
  }

  async createRole(payload) {
    return rolesRepository.create(payload);
  }

  async updateRole(id, payload) {
    return rolesRepository.update(id, payload);
  }

  async deleteRole(id, deletedBy) {
    return rolesRepository.delete(id, deletedBy);
  }

  async restoreRole(id, restoredBy) {
    return rolesRepository.restore(id, restoredBy);
  }

  // ─── Role Permissions ────────────────────────────────────

  async listRolePermissions(params) {
    return rolePermissionsRepository.list(params);
  }

  async assignPermission(roleId, permissionId, createdBy) {
    return rolePermissionsRepository.assign(roleId, permissionId, createdBy);
  }

  async bulkAssignPermissions(roleId, permissionIds, createdBy) {
    return rolePermissionsRepository.bulkAssign(roleId, permissionIds, createdBy);
  }

  async removePermission(roleId, permissionId) {
    return rolePermissionsRepository.remove(roleId, permissionId);
  }

  async removeAllPermissions(roleId) {
    return rolePermissionsRepository.removeAll(roleId);
  }

  // ─── User Role Assignments ───────────────────────────────

  async listUserRoleAssignments(params) {
    return userRoleAssignmentsRepository.list(params);
  }

  async getUserRoleAssignment(id) {
    return userRoleAssignmentsRepository.getById(id);
  }

  async assignRoleToUser(payload) {
    return userRoleAssignmentsRepository.assign(payload);
  }

  async updateUserRoleAssignment(id, payload) {
    return userRoleAssignmentsRepository.update(id, payload);
  }

  async revokeUserRole(id, revokedBy) {
    return userRoleAssignmentsRepository.revoke(id, revokedBy);
  }

  async restoreUserRole(id, restoredBy) {
    return userRoleAssignmentsRepository.restore(id, restoredBy);
  }
}

module.exports = new RolesService();
