/**
 * USERS CONTROLLER — User Management (Admin)
 */

const usersService = require('../../../services/users.service');
const { successResponse, createdResponse, paginatedResponse } = require('../../../utils/response');

const list = async (req, res) => {
  const { page, limit, sort, order, search } = req.pagination;
  const { role, is_active } = req.query;
  const { data, totalCount } = await usersService.list({
    page, limit, search, sort, order,
    role: role || null,
    isActive: is_active !== undefined ? is_active === 'true' : null,
  });
  paginatedResponse(res, data, totalCount, page, limit, 'Users retrieved successfully');
};

const getById = async (req, res) => {
  const data = await usersService.getById(parseInt(req.params.id, 10));
  const { password, ...user } = data;
  successResponse(res, user, 'User retrieved successfully');
};

const create = async (req, res) => {
  const data = await usersService.create(req.body, req.user.id, req.user.role);
  createdResponse(res, data, 'User created successfully');
};

const update = async (req, res) => {
  const data = await usersService.updateProfile(parseInt(req.params.id, 10), req.body, req.user.id, req.user.role);
  successResponse(res, data, 'User updated successfully');
};

const updateRole = async (req, res) => {
  const data = await usersService.updateRole(parseInt(req.params.id, 10), req.body.role, req.user.id, req.user.role);
  successResponse(res, data, 'User role updated successfully');
};

const setActive = async (req, res) => {
  const data = await usersService.setActive(parseInt(req.params.id, 10), req.body.is_active, req.user.id, req.user.role);
  successResponse(res, data, `User ${req.body.is_active ? 'activated' : 'deactivated'} successfully`);
};

const deleteUser = async (req, res) => {
  await usersService.softDelete(parseInt(req.params.id, 10), req.user.id, req.user.role);
  successResponse(res, null, 'User deleted successfully');
};

const restoreUser = async (req, res) => {
  await usersService.restore(parseInt(req.params.id, 10), req.user.id, req.user.role);
  successResponse(res, null, 'User restored successfully');
};

module.exports = { list, getById, create, update, updateRole, setActive, delete: deleteUser, restore: restoreUser };
