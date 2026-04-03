/**
 * ═══════════════════════════════════════════════════════════════
 * DOCUMENT-TYPES CONTROLLER
 * ═══════════════════════════════════════════════════════════════
 */

const { successResponse, createdResponse, paginatedResponse } = require('../../../utils/response');
const documentTypeService = require('../../../services/document-types.service');

const list = async (req, res) => {
  const { page, limit } = req.pagination;
  const { data, totalCount } = await documentTypeService.list(page, limit);
  paginatedResponse(res, data, totalCount, page, limit, 'Document Types retrieved successfully');
};

const getById = async (req, res) => {
  const { id } = req.params;
  const data = await documentTypeService.getById(id);
  successResponse(res, data, 'Document Type retrieved successfully');
};

const create = async (req, res) => {
  const data = await documentTypeService.create(req.body);
  createdResponse(res, data, 'Document Type created successfully');
};

const update = async (req, res) => {
  const { id } = req.params;
  const data = await documentTypeService.update(id, req.body);
  successResponse(res, data, 'Document Type updated successfully');
};

const delete_documenttype = async (req, res) => {
  const { id } = req.params;
  await documentTypeService.delete(id);
  successResponse(res, null, 'Document Type deleted successfully');
};

module.exports = {
  list,
  getById,
  create,
  update,
  delete: delete_documenttype,
};
