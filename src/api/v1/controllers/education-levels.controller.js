/**
 * ═══════════════════════════════════════════════════════════════
 * EDUCATION-LEVELS CONTROLLER
 * ═══════════════════════════════════════════════════════════════
 */

const { successResponse, createdResponse, paginatedResponse } = require('../../../utils/response');
const educationLevelService = require('../../../services/education-levels.service');

const list = async (req, res) => {
  const { page, limit } = req.pagination;
  const { data, totalCount } = await educationLevelService.list(page, limit);
  paginatedResponse(res, data, totalCount, page, limit, 'Education Levels retrieved successfully');
};

const getById = async (req, res) => {
  const { id } = req.params;
  const data = await educationLevelService.getById(id);
  successResponse(res, data, 'Education Level retrieved successfully');
};

const create = async (req, res) => {
  const data = await educationLevelService.create(req.body);
  createdResponse(res, data, 'Education Level created successfully');
};

const update = async (req, res) => {
  const { id } = req.params;
  const data = await educationLevelService.update(id, req.body);
  successResponse(res, data, 'Education Level updated successfully');
};

const delete_educationlevel = async (req, res) => {
  const { id } = req.params;
  await educationLevelService.delete(id);
  successResponse(res, null, 'Education Level deleted successfully');
};

module.exports = {
  list,
  getById,
  create,
  update,
  delete: delete_educationlevel,
};
