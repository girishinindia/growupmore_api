/**
 * ═══════════════════════════════════════════════════════════════
 * SPECIALIZATIONS REPOSITORY
 * ═══════════════════════════════════════════════════════════════
 */

const BaseRepository = require('./base.repository');

class SpecializationsRepository extends BaseRepository {
  async list(page = 1, limit = 20) {
    const pageIndex = page - 1;
    return this.callFunctionPaginated('udf_get_specializations', {
      p_page_index: pageIndex,
      p_page_size: limit,
    });
  }

  async getById(id) {
    return this.callFunctionSingle(
      'udf_get_specializations',
      { p_id: id },
      'Specialization'
    );
  }

  async create(payload) {
    return this.callProcedure('sp_specializations_insert', {
      p_name: payload.name,
      p_category: payload.category,
      p_is_active: payload.is_active !== false,
    });
  }

  async update(id, payload) {
    return this.callProcedure('sp_specializations_update', {
      p_id: id,
      p_name: payload.name,
      p_category: payload.category,
      p_is_active: payload.is_active,
    });
  }

  async delete(id) {
    return this.callProcedure('sp_specializations_delete', { p_id: id });
  }
}

module.exports = new SpecializationsRepository();
