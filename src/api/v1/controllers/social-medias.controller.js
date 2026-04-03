/**
 * ═══════════════════════════════════════════════════════════════
 * SOCIAL-MEDIAS CONTROLLER
 * ═══════════════════════════════════════════════════════════════
 */

const { successResponse, createdResponse, paginatedResponse } = require('../../../utils/response');
const socialMediaService = require('../../../services/social-medias.service');

const list = async (req, res) => {
  const { page, limit } = req.pagination;
  const { data, totalCount } = await socialMediaService.list(page, limit);
  paginatedResponse(res, data, totalCount, page, limit, 'Social Medias retrieved successfully');
};

const getById = async (req, res) => {
  const { id } = req.params;
  const data = await socialMediaService.getById(id);
  successResponse(res, data, 'Social Media retrieved successfully');
};

const create = async (req, res) => {
  const data = await socialMediaService.create(req.body);
  createdResponse(res, data, 'Social Media created successfully');
};

const update = async (req, res) => {
  const { id } = req.params;
  const data = await socialMediaService.update(id, req.body);
  successResponse(res, data, 'Social Media updated successfully');
};

const delete_socialmedia = async (req, res) => {
  const { id } = req.params;
  await socialMediaService.delete(id);
  successResponse(res, null, 'Social Media deleted successfully');
};

module.exports = {
  list,
  getById,
  create,
  update,
  delete: delete_socialmedia,
};
