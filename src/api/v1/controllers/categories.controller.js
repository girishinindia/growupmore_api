/**
 * ═══════════════════════════════════════════════════════════════
 * CATEGORIES CONTROLLER
 * ═══════════════════════════════════════════════════════════════
 */

const { successResponse, createdResponse, paginatedResponse } = require('../../../utils/response');
const categoryService = require('../../../services/categories.service');

const list = async (req, res) => {
  const { page, limit } = req.pagination;
  const { data, totalCount } = await categoryService.list(page, limit);
  paginatedResponse(res, data, totalCount, page, limit, 'Categories retrieved successfully');
};

const getById = async (req, res) => {
  const { id } = req.params;
  const data = await categoryService.getById(id);
  successResponse(res, data, 'Category retrieved successfully');
};

const create = async (req, res) => {
  const data = await categoryService.create(req.body);
  createdResponse(res, data, 'Category created successfully');
};

const update = async (req, res) => {
  const { id } = req.params;
  const data = await categoryService.update(id, req.body);
  successResponse(res, data, 'Category updated successfully');
};

const delete_category = async (req, res) => {
  const { id } = req.params;
  await categoryService.delete(id);
  successResponse(res, null, 'Category deleted successfully');
};

module.exports = {
  list,
  getById,
  create,
  update,
  delete: delete_category,
};
