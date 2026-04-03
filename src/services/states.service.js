/**
 * ═══════════════════════════════════════════════════════════════
 * STATES SERVICE
 * ═══════════════════════════════════════════════════════════════
 */

const stateRepository = require('../repositories/states.repository');

const list = async (page, limit) => {
  return stateRepository.list(page, limit);
};

const getById = async (id) => {
  return stateRepository.getById(id);
};

const create = async (payload) => {
  return stateRepository.create(payload);
};

const update = async (id, payload) => {
  return stateRepository.update(id, payload);
};

const delete_state = async (id) => {
  return stateRepository.delete(id);
};

module.exports = {
  list,
  getById,
  create,
  update,
  delete: delete_state,
};
