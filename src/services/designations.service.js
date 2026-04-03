/**
 * ═══════════════════════════════════════════════════════════════
 * DESIGNATIONS SERVICE
 * ═══════════════════════════════════════════════════════════════
 */

const designationRepository = require('../repositories/designations.repository');

const list = async (page, limit) => {
  return designationRepository.list(page, limit);
};

const getById = async (id) => {
  return designationRepository.getById(id);
};

const create = async (payload) => {
  return designationRepository.create(payload);
};

const update = async (id, payload) => {
  return designationRepository.update(id, payload);
};

const delete_designation = async (id) => {
  return designationRepository.delete(id);
};

module.exports = {
  list,
  getById,
  create,
  update,
  delete: delete_designation,
};
