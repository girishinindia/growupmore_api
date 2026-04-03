/**
 * ═══════════════════════════════════════════════════════════════
 * SPECIALIZATIONS CONTROLLER
 * ═══════════════════════════════════════════════════════════════
 */

const { successResponse, createdResponse, paginatedResponse } = require('../../../utils/response');
const specializationService = require('../../../services/specializations.service');

const list = async (req, res) => {
  const { page, limit } = req.pagination;
  const { data, totalCount } = await specializationService.list(page, limit);
  paginatedResponse(res, data, totalCount, page, limit, 'Specializations retrieved successfully');
};

const getById = async (req, res) => {
  const { id } = req.params;
  const data = await specializationService.getById(id);
  successResponse(res, data, 'Specialization retrieved successfully');
};

const create = async (req, res) => {
  const data = await specializationService.create(req.body);
  createdResponse(res, data, 'Specialization created successfully');
};

const update = async (req, res) => {
  const { id } = req.params;
  const data = await specializationService.update(id, req.body);
  successResponse(res, data, 'Specialization updated successfully');
};

const delete_specialization = async (req, res) => {
  const { id } = req.params;
  await specializationService.delete(id);
  successResponse(res, null, 'Specialization deleted successfully');
};

module.exports = {
  list,
  getById,
  create,
  update,
  delete: delete_specialization,
};
