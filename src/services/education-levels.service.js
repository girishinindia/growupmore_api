/**
 * ═══════════════════════════════════════════════════════════════
 * EDUCATION-LEVELS SERVICE
 * ═══════════════════════════════════════════════════════════════
 */

const educationLevelRepository = require('../repositories/education-levels.repository');

const list = async (page, limit) => {
  return educationLevelRepository.list(page, limit);
};

const getById = async (id) => {
  return educationLevelRepository.getById(id);
};

const create = async (payload) => {
  return educationLevelRepository.create(payload);
};

const update = async (id, payload) => {
  return educationLevelRepository.update(id, payload);
};

const delete_educationlevel = async (id) => {
  return educationLevelRepository.delete(id);
};

module.exports = {
  list,
  getById,
  create,
  update,
  delete: delete_educationlevel,
};
