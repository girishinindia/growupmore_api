/**
 * ═══════════════════════════════════════════════════════════════
 * LANGUAGES SERVICE
 * ═══════════════════════════════════════════════════════════════
 */

const languageRepository = require('../repositories/languages.repository');

const list = async (page, limit) => {
  return languageRepository.list(page, limit);
};

const getById = async (id) => {
  return languageRepository.getById(id);
};

const create = async (payload) => {
  return languageRepository.create(payload);
};

const update = async (id, payload) => {
  return languageRepository.update(id, payload);
};

const delete_language = async (id) => {
  return languageRepository.delete(id);
};

module.exports = {
  list,
  getById,
  create,
  update,
  delete: delete_language,
};
