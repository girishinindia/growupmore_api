/**
 * ═══════════════════════════════════════════════════════════════
 * SKILLS SERVICE
 * ═══════════════════════════════════════════════════════════════
 */

const skillRepository = require('../repositories/skills.repository');

const list = async (page, limit) => {
  return skillRepository.list(page, limit);
};

const getById = async (id) => {
  return skillRepository.getById(id);
};

const create = async (payload) => {
  return skillRepository.create(payload);
};

const update = async (id, payload) => {
  return skillRepository.update(id, payload);
};

const delete_skill = async (id) => {
  return skillRepository.delete(id);
};

module.exports = {
  list,
  getById,
  create,
  update,
  delete: delete_skill,
};
