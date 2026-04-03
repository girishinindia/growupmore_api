/**
 * PERMISSIONS CONTROLLER — Permissions & Modules
 */

const permissionsService = require('../../../services/permissions.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../../utils/response');

// ─── Permissions ───────────────────────────────────────────

const listPermissions = async (req, res) => {
  const { page, limit, sort, order, search } = req.pagination;
  const { module_id, module_code, resource, action, scope, is_active } = req.query;
  const { data, totalCount } = await permissionsService.listPermissions({
    page, limit, search, sort, order,
    isActive: is_active !== undefined ? is_active === 'true' : null,
    moduleId: module_id ? parseInt(module_id, 10) : null,
    moduleCode: module_code || null,
    resource: resource || null,
    action: action || null,
    scope: scope || null,
  });
  paginatedResponse(res, data, totalCount, page, limit, 'Permissions retrieved successfully');
};

const getPermissionById = async (req, res) => {
  const data = await permissionsService.getPermissionById(parseInt(req.params.id, 10));
  successResponse(res, data, 'Permission retrieved successfully');
};

const createPermission = async (req, res) => {
  const data = await permissionsService.createPermission({ ...req.body, created_by: req.user.id });
  createdResponse(res, data, 'Permission created successfully');
};

const updatePermission = async (req, res) => {
  const data = await permissionsService.updatePermission(parseInt(req.params.id, 10), { ...req.body, updated_by: req.user.id });
  successResponse(res, data, 'Permission updated successfully');
};

const deletePermission = async (req, res) => {
  await permissionsService.deletePermission(parseInt(req.params.id, 10));
  successResponse(res, null, 'Permission deleted successfully');
};

// ─── Modules ───────────────────────────────────────────────

const listModules = async (req, res) => {
  const { page, limit, sort, order, search } = req.pagination;
  const { data, totalCount } = await permissionsService.listModules({ page, limit, search, sort, order });
  paginatedResponse(res, data, totalCount, page, limit, 'Modules retrieved successfully');
};

const getModuleById = async (req, res) => {
  const data = await permissionsService.getModuleById(parseInt(req.params.id, 10));
  successResponse(res, data, 'Module retrieved successfully');
};

const createModule = async (req, res) => {
  const data = await permissionsService.createModule({ ...req.body, created_by: req.user.id });
  createdResponse(res, data, 'Module created successfully');
};

const updateModule = async (req, res) => {
  const data = await permissionsService.updateModule(parseInt(req.params.id, 10), { ...req.body, updated_by: req.user.id });
  successResponse(res, data, 'Module updated successfully');
};

const deleteModule = async (req, res) => {
  await permissionsService.deleteModule(parseInt(req.params.id, 10));
  successResponse(res, null, 'Module deleted successfully');
};

module.exports = {
  listPermissions, getPermissionById, createPermission, updatePermission, deletePermission,
  listModules, getModuleById, createModule, updateModule, deleteModule,
};
