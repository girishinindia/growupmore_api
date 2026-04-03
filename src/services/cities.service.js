/**
 * ═══════════════════════════════════════════════════════════════
 * CITIES SERVICE
 * ═══════════════════════════════════════════════════════════════
 */

const cityRepository = require('../repositories/cities.repository');

const list = async (page, limit) => {
  return cityRepository.list(page, limit);
};

const getById = async (id) => {
  return cityRepository.getById(id);
};

const create = async (payload) => {
  return cityRepository.create(payload);
};

const update = async (id, payload) => {
  return cityRepository.update(id, payload);
};

const delete_city = async (id) => {
  return cityRepository.delete(id);
};

module.exports = {
  list,
  getById,
  create,
  update,
  delete: delete_city,
};
