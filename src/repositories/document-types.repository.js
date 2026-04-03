/**
 * ═══════════════════════════════════════════════════════════════
 * DOCUMENT-TYPES REPOSITORY
 * ═══════════════════════════════════════════════════════════════
 */

const BaseRepository = require('./base.repository');

class DocumentTypesRepository extends BaseRepository {
  async list(page = 1, limit = 20) {
    const pageIndex = page - 1;
    return this.callFunctionPaginated('udf_get_document_types', {
      p_page_index: pageIndex,
      p_page_size: limit,
    });
  }

  async getById(id) {
    return this.callFunctionSingle(
      'udf_get_document_types',
      { p_id: id },
      'Document Type'
    );
  }

  async create(payload) {
    return this.callProcedure('sp_document_types_insert', {
      p_name: payload.name,
      p_is_active: payload.is_active !== false,
    });
  }

  async update(id, payload) {
    return this.callProcedure('sp_document_types_update', {
      p_id: id,
      p_name: payload.name,
      p_is_active: payload.is_active,
    });
  }

  async delete(id) {
    return this.callProcedure('sp_document_types_delete', { p_id: id });
  }
}

module.exports = new DocumentTypesRepository();
