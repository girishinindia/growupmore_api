/**
 * ═══════════════════════════════════════════════════════════════
 * SKILLS CONTROLLER
 * ═══════════════════════════════════════════════════════════════
 */

const { successResponse, createdResponse, paginatedResponse } = require('../../../utils/response');
const skillService = require('../../../services/skills.service');

const list = async (req, res) => {
  const { page, limit } = req.pagination;
  const { data, totalCount } = await skillService.list(page, limit);
  paginatedResponse(res, data, totalCount, page, limit, 'Skills retrieved successfully');
};

const getById = async (req, res) => {
  const { id } = req.params;
  const data = await skillService.getById(id);
  successResponse(res, data, 'Skill retrieved successfully');
};

const create = async (req, res) => {
  const data = await skillService.create(req.body);
  createdResponse(res, data, 'Skill created successfully');
};

const update = async (req, res) => {
  const { id } = req.params;
  const data = await skillService.update(id, req.body);
  successResponse(res, data, 'Skill updated successfully');
};

const delete_skill = async (req, res) => {
  const { id } = req.params;
  await skillService.delete(id);
  successResponse(res, null, 'Skill deleted successfully');
};

module.exports = {
  list,
  getById,
  create,
  update,
  delete: delete_skill,
};
