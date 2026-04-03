/**
 * ═══════════════════════════════════════════════════════════════
 * LANGUAGES CONTROLLER
 * ═══════════════════════════════════════════════════════════════
 */

const { successResponse, createdResponse, paginatedResponse } = require('../../../utils/response');
const languageService = require('../../../services/languages.service');

const list = async (req, res) => {
  const { page, limit } = req.pagination;
  const { data, totalCount } = await languageService.list(page, limit);
  paginatedResponse(res, data, totalCount, page, limit, 'Languages retrieved successfully');
};

const getById = async (req, res) => {
  const { id } = req.params;
  const data = await languageService.getById(id);
  successResponse(res, data, 'Language retrieved successfully');
};

const create = async (req, res) => {
  const data = await languageService.create(req.body);
  createdResponse(res, data, 'Language created successfully');
};

const update = async (req, res) => {
  const { id } = req.params;
  const data = await languageService.update(id, req.body);
  successResponse(res, data, 'Language updated successfully');
};

const delete_language = async (req, res) => {
  const { id } = req.params;
  await languageService.delete(id);
  successResponse(res, null, 'Language deleted successfully');
};

module.exports = {
  list,
  getById,
  create,
  update,
  delete: delete_language,
};
