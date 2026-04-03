/**
 * ═══════════════════════════════════════════════════════════════
 * LEARNING-GOALS CONTROLLER
 * ═══════════════════════════════════════════════════════════════
 */

const { successResponse, createdResponse, paginatedResponse } = require('../../../utils/response');
const learningGoalService = require('../../../services/learning-goals.service');

const list = async (req, res) => {
  const { page, limit } = req.pagination;
  const { data, totalCount } = await learningGoalService.list(page, limit);
  paginatedResponse(res, data, totalCount, page, limit, 'Learning Goals retrieved successfully');
};

const getById = async (req, res) => {
  const { id } = req.params;
  const data = await learningGoalService.getById(id);
  successResponse(res, data, 'Learning Goal retrieved successfully');
};

const create = async (req, res) => {
  const data = await learningGoalService.create(req.body);
  createdResponse(res, data, 'Learning Goal created successfully');
};

const update = async (req, res) => {
  const { id } = req.params;
  const data = await learningGoalService.update(id, req.body);
  successResponse(res, data, 'Learning Goal updated successfully');
};

const delete_learninggoal = async (req, res) => {
  const { id } = req.params;
  await learningGoalService.delete(id);
  successResponse(res, null, 'Learning Goal deleted successfully');
};

module.exports = {
  list,
  getById,
  create,
  update,
  delete: delete_learninggoal,
};
