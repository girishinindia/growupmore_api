/**
 * ═══════════════════════════════════════════════════════════════
 * STATES CONTROLLER
 * ═══════════════════════════════════════════════════════════════
 */

const { successResponse, createdResponse, paginatedResponse } = require('../../../utils/response');
const stateService = require('../../../services/states.service');

const list = async (req, res) => {
  const { page, limit } = req.pagination;
  const { data, totalCount } = await stateService.list(page, limit);
  paginatedResponse(res, data, totalCount, page, limit, 'States retrieved successfully');
};

const getById = async (req, res) => {
  const { id } = req.params;
  const data = await stateService.getById(id);
  successResponse(res, data, 'State retrieved successfully');
};

const create = async (req, res) => {
  const data = await stateService.create(req.body);
  createdResponse(res, data, 'State created successfully');
};

const update = async (req, res) => {
  const { id } = req.params;
  const data = await stateService.update(id, req.body);
  successResponse(res, data, 'State updated successfully');
};

const delete_state = async (req, res) => {
  const { id } = req.params;
  await stateService.delete(id);
  successResponse(res, null, 'State deleted successfully');
};

module.exports = {
  list,
  getById,
  create,
  update,
  delete: delete_state,
};
