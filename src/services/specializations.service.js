/**
 * ═══════════════════════════════════════════════════════════════
 * SPECIALIZATIONS SERVICE
 * ═══════════════════════════════════════════════════════════════
 */

const specializationRepository = require('../repositories/specializations.repository');

const list = async (page, limit) => {
  return specializationRepository.list(page, limit);
};

const getById = async (id) => {
  return specializationRepository.getById(id);
};

const create = async (payload) => {
  return specializationRepository.create(payload);
};

const update = async (id, payload) => {
  return specializationRepository.update(id, payload);
};

const delete_specialization = async (id) => {
  return specializationRepository.delete(id);
};

module.exports = {
  list,
  getById,
  create,
  update,
  delete: delete_specialization,
};
