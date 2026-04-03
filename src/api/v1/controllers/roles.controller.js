/**
 * ROLES CONTROLLER — Roles, Role-Permissions, User-Role-Assignments
 */

const rolesService = require('../../../services/roles.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../../utils/response');

// ─── Roles ─────────────────────────────────────────────────

const listRoles = async (req, res) => {
  const { page, limit, sort, order, search } = req.pagination;
  const { is_active, level, parent_role_id, is_system_role } = req.query;
  const { data, totalCount } = await rolesService.listRoles({
    page, limit, search, sort, order,
    isActive: is_active !== undefined ? is_active === 'true' : null,
    level: level ? parseInt(level, 10) : null,
    parentRoleId: parent_role_id ? parseInt(parent_role_id, 10) : null,
    isSystemRole: is_system_role !== undefined ? is_system_role === 'true' : null,
  });
  paginatedResponse(res, data, totalCount, page, limit, 'Roles retrieved successfully');
};

const getRoleById = async (req, res) => {
  const data = await rolesService.getRoleById(parseInt(req.params.id, 10));
  successResponse(res, data, 'Role retrieved successfully');
};

const createRole = async (req, res) => {
  const data = await rolesService.createRole({ ...req.body, created_by: req.user.id });
  createdResponse(res, data, 'Role created successfully');
};

const updateRole = async (req, res) => {
  const data = await rolesService.updateRole(parseInt(req.params.id, 10), { ...req.body, updated_by: req.user.id });
  successResponse(res, data, 'Role updated successfully');
};

const deleteRole = async (req, res) => {
  await rolesService.deleteRole(parseInt(req.params.id, 10), req.user.id);
  successResponse(res, null, 'Role deleted successfully');
};

const restoreRole = async (req, res) => {
  await rolesService.restoreRole(parseInt(req.params.id, 10), req.user.id);
  successResponse(res, null, 'Role restored successfully');
};

// ─── Role Permissions ──────────────────────────────────────

const listRolePermissions = async (req, res) => {
  const { page, limit, sort, order, search } = req.pagination;
  const { role_id, role_code, module_code, action, scope } = req.query;
  const { data, totalCount } = await rolesService.listRolePermissions({
    page, limit, search, sort, order,
    roleId: role_id ? parseInt(role_id, 10) : null,
    roleCode: role_code || null,
    moduleCode: module_code || null,
    action: action || null,
    scope: scope || null,
  });
  paginatedResponse(res, data, totalCount, page, limit, 'Role permissions retrieved successfully');
};

const assignPermission = async (req, res) => {
  const data = await rolesService.assignPermission(req.body.role_id, req.body.permission_id, req.user.id);
  createdResponse(res, data, 'Permission assigned to role successfully');
};

const bulkAssignPermissions = async (req, res) => {
  const data = await rolesService.bulkAssignPermissions(req.body.role_id, req.body.permission_ids, req.user.id);
  createdResponse(res, data, 'Permissions assigned to role successfully');
};

const removePermission = async (req, res) => {
  await rolesService.removePermission(parseInt(req.body.role_id, 10), parseInt(req.body.permission_id, 10));
  successResponse(res, null, 'Permission removed from role successfully');
};

// ─── User Role Assignments ─────────────────────────────────

const listUserRoleAssignments = async (req, res) => {
  const { page, limit, sort, order, search } = req.pagination;
  const { user_id, role_id, role_code, context_type, context_id, is_valid } = req.query;
  const { data, totalCount } = await rolesService.listUserRoleAssignments({
    page, limit, search, sort, order,
    userId: user_id ? parseInt(user_id, 10) : null,
    roleId: role_id ? parseInt(role_id, 10) : null,
    roleCode: role_code || null,
    contextType: context_type || null,
    contextId: context_id ? parseInt(context_id, 10) : null,
    isValid: is_valid !== undefined ? is_valid === 'true' : null,
  });
  paginatedResponse(res, data, totalCount, page, limit, 'User role assignments retrieved successfully');
};

const assignRoleToUser = async (req, res) => {
  const data = await rolesService.assignRoleToUser({ ...req.body, assigned_by: req.user.id });
  createdResponse(res, data, 'Role assigned to user successfully');
};

const revokeUserRole = async (req, res) => {
  await rolesService.revokeUserRole(parseInt(req.params.id, 10), req.user.id);
  successResponse(res, null, 'User role revoked successfully');
};

const restoreUserRole = async (req, res) => {
  await rolesService.restoreUserRole(parseInt(req.params.id, 10), req.user.id);
  successResponse(res, null, 'User role restored successfully');
};

module.exports = {
  listRoles, getRoleById, createRole, updateRole, deleteRole, restoreRole,
  listRolePermissions, assignPermission, bulkAssignPermissions, removePermission,
  listUserRoleAssignments, assignRoleToUser, revokeUserRole, restoreUserRole,
};
