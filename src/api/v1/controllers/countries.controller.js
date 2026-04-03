/**
 * ═══════════════════════════════════════════════════════════════
 * COUNTRIES CONTROLLER
 * ═══════════════════════════════════════════════════════════════
 */

const { successResponse, createdResponse, paginatedResponse } = require('../../../utils/response');
const countryService = require('../../../services/countries.service');

const list = async (req, res) => {
  const { page, limit } = req.pagination;
  const { data, totalCount } = await countryService.list(page, limit);
  paginatedResponse(res, data, totalCount, page, limit, 'Countries retrieved successfully');
};

const getById = async (req, res) => {
  const { id } = req.params;
  const data = await countryService.getById(id);
  successResponse(res, data, 'Country retrieved successfully');
};

const create = async (req, res) => {
  const data = await countryService.create(req.body);
  createdResponse(res, data, 'Country created successfully');
};

const update = async (req, res) => {
  const { id } = req.params;
  const data = await countryService.update(id, req.body);
  successResponse(res, data, 'Country updated successfully');
};

const delete_country = async (req, res) => {
  const { id } = req.params;
  await countryService.delete(id);
  successResponse(res, null, 'Country deleted successfully');
};

module.exports = {
  list,
  getById,
  create,
  update,
  delete: delete_country,
};
