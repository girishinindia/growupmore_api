/**
 * ═══════════════════════════════════════════════════════════════
 * CITIES CONTROLLER
 * ═══════════════════════════════════════════════════════════════
 */

const { successResponse, createdResponse, paginatedResponse } = require('../../../utils/response');
const cityService = require('../../../services/cities.service');

const list = async (req, res) => {
  const { page, limit } = req.pagination;
  const { data, totalCount } = await cityService.list(page, limit);
  paginatedResponse(res, data, totalCount, page, limit, 'Cities retrieved successfully');
};

const getById = async (req, res) => {
  const { id } = req.params;
  const data = await cityService.getById(id);
  successResponse(res, data, 'City retrieved successfully');
};

const create = async (req, res) => {
  const data = await cityService.create(req.body);
  createdResponse(res, data, 'City created successfully');
};

const update = async (req, res) => {
  const { id } = req.params;
  const data = await cityService.update(id, req.body);
  successResponse(res, data, 'City updated successfully');
};

const delete_city = async (req, res) => {
  const { id } = req.params;
  await cityService.delete(id);
  successResponse(res, null, 'City deleted successfully');
};

module.exports = {
  list,
  getById,
  create,
  update,
  delete: delete_city,
};
