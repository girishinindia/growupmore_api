/**
 * ═══════════════════════════════════════════════════════════════
 * DESIGNATIONS CONTROLLER
 * ═══════════════════════════════════════════════════════════════
 */

const { successResponse, createdResponse, paginatedResponse } = require('../../../utils/response');
const designationService = require('../../../services/designations.service');

const list = async (req, res) => {
  const { page, limit } = req.pagination;
  const { data, totalCount } = await designationService.list(page, limit);
  paginatedResponse(res, data, totalCount, page, limit, 'Designations retrieved successfully');
};

const getById = async (req, res) => {
  const { id } = req.params;
  const data = await designationService.getById(id);
  successResponse(res, data, 'Designation retrieved successfully');
};

const create = async (req, res) => {
  const data = await designationService.create(req.body);
  createdResponse(res, data, 'Designation created successfully');
};

const update = async (req, res) => {
  const { id } = req.params;
  const data = await designationService.update(id, req.body);
  successResponse(res, data, 'Designation updated successfully');
};

const delete_designation = async (req, res) => {
  const { id } = req.params;
  await designationService.delete(id);
  successResponse(res, null, 'Designation deleted successfully');
};

module.exports = {
  list,
  getById,
  create,
  update,
  delete: delete_designation,
};
