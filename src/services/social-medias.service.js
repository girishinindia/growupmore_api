/**
 * ═══════════════════════════════════════════════════════════════
 * SOCIAL-MEDIAS SERVICE
 * ═══════════════════════════════════════════════════════════════
 */

const socialMediaRepository = require('../repositories/social-medias.repository');

const list = async (page, limit) => {
  return socialMediaRepository.list(page, limit);
};

const getById = async (id) => {
  return socialMediaRepository.getById(id);
};

const create = async (payload) => {
  return socialMediaRepository.create(payload);
};

const update = async (id, payload) => {
  return socialMediaRepository.update(id, payload);
};

const delete_socialmedia = async (id) => {
  return socialMediaRepository.delete(id);
};

module.exports = {
  list,
  getById,
  create,
  update,
  delete: delete_socialmedia,
};
