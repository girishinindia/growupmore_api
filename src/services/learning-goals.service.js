/**
 * ═══════════════════════════════════════════════════════════════
 * LEARNING-GOALS SERVICE
 * ═══════════════════════════════════════════════════════════════
 */

const learningGoalRepository = require('../repositories/learning-goals.repository');

const list = async (page, limit) => {
  return learningGoalRepository.list(page, limit);
};

const getById = async (id) => {
  return learningGoalRepository.getById(id);
};

const create = async (payload) => {
  return learningGoalRepository.create(payload);
};

const update = async (id, payload) => {
  return learningGoalRepository.update(id, payload);
};

const delete_learninggoal = async (id) => {
  return learningGoalRepository.delete(id);
};

module.exports = {
  list,
  getById,
  create,
  update,
  delete: delete_learninggoal,
};
