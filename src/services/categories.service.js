/**
 * ═══════════════════════════════════════════════════════════════
 * CATEGORIES SERVICE
 * ═══════════════════════════════════════════════════════════════
 */

const categoryRepository = require('../repositories/categories.repository');

const list = async (page, limit) => {
  return categoryRepository.list(page, limit);
};

const getById = async (id) => {
  return categoryRepository.getById(id);
};

const create = async (payload) => {
  return categoryRepository.create(payload);
};

const update = async (id, payload) => {
  return categoryRepository.update(id, payload);
};

const delete_category = async (id) => {
  return categoryRepository.delete(id);
};

module.exports = {
  list,
  getById,
  create,
  update,
  delete: delete_category,
};
