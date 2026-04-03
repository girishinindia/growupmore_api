/**
 * ═══════════════════════════════════════════════════════════════
 * SUB-CATEGORIES CONTROLLER
 * ═══════════════════════════════════════════════════════════════
 */

const { successResponse, createdResponse, paginatedResponse } = require('../../../utils/response');
const subCategoryService = require('../../../services/sub-categories.service');

const list = async (req, res) => {
  const { page, limit } = req.pagination;
  const { data, totalCount } = await subCategoryService.list(page, limit);
  paginatedResponse(res, data, totalCount, page, limit, 'Sub-Categories retrieved successfully');
};

const getById = async (req, res) => {
  const { id } = req.params;
  const data = await subCategoryService.getById(id);
  successResponse(res, data, 'Sub-Category retrieved successfully');
};

const create = async (req, res) => {
  const data = await subCategoryService.create(req.body);
  createdResponse(res, data, 'Sub-Category created successfully');
};

const update = async (req, res) => {
  const { id } = req.params;
  const data = await subCategoryService.update(id, req.body);
  successResponse(res, data, 'Sub-Category updated successfully');
};

const delete_subcategory = async (req, res) => {
  const { id } = req.params;
  await subCategoryService.delete(id);
  successResponse(res, null, 'Sub-Category deleted successfully');
};

module.exports = {
  list,
  getById,
  create,
  update,
  delete: delete_subcategory,
};
