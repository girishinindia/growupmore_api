/**
 * ═══════════════════════════════════════════════════════════════
 * SUB-CATEGORIES SERVICE
 * ═══════════════════════════════════════════════════════════════
 */

const subCategoryRepository = require('../repositories/sub-categories.repository');

const list = async (page, limit) => {
  return subCategoryRepository.list(page, limit);
};

const getById = async (id) => {
  return subCategoryRepository.getById(id);
};

const create = async (payload) => {
  return subCategoryRepository.create(payload);
};

const update = async (id, payload) => {
  return subCategoryRepository.update(id, payload);
};

const delete_subcategory = async (id) => {
  return subCategoryRepository.delete(id);
};

module.exports = {
  list,
  getById,
  create,
  update,
  delete: delete_subcategory,
};
