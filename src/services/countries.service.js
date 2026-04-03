/**
 * ═══════════════════════════════════════════════════════════════
 * COUNTRIES SERVICE
 * ═══════════════════════════════════════════════════════════════
 */

const countryRepository = require('../repositories/countries.repository');

const list = async (page, limit) => {
  return countryRepository.list(page, limit);
};

const getById = async (id) => {
  return countryRepository.getById(id);
};

const create = async (payload) => {
  return countryRepository.create(payload);
};

const update = async (id, payload) => {
  return countryRepository.update(id, payload);
};

const delete_country = async (id) => {
  return countryRepository.delete(id);
};

module.exports = {
  list,
  getById,
  create,
  update,
  delete: delete_country,
};
