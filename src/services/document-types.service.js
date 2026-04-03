/**
 * ═══════════════════════════════════════════════════════════════
 * DOCUMENT-TYPES SERVICE
 * ═══════════════════════════════════════════════════════════════
 */

const documentTypeRepository = require('../repositories/document-types.repository');

const list = async (page, limit) => {
  return documentTypeRepository.list(page, limit);
};

const getById = async (id) => {
  return documentTypeRepository.getById(id);
};

const create = async (payload) => {
  return documentTypeRepository.create(payload);
};

const update = async (id, payload) => {
  return documentTypeRepository.update(id, payload);
};

const delete_documenttype = async (id) => {
  return documentTypeRepository.delete(id);
};

module.exports = {
  list,
  getById,
  create,
  update,
  delete: delete_documenttype,
};
