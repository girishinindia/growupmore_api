/**
 * ═══════════════════════════════════════════════════════════════
 * DESIGNATIONS REPOSITORY
 * ═══════════════════════════════════════════════════════════════
 */

const BaseRepository = require('./base.repository');

class DesignationsRepository extends BaseRepository {
  async list(page = 1, limit = 20) {
    const pageIndex = page - 1;
    return this.callFunctionPaginated('udf_get_designations', {
      p_page_index: pageIndex,
      p_page_size: limit,
    });
  }

  async getById(id) {
    return this.callFunctionSingle(
      'udf_get_designations',
      { p_id: id },
      'Designation'
    );
  }

  async create(payload) {
    return this.callProcedure('sp_designations_insert', {
      p_name: payload.name,
      p_level: payload.level,
      p_level_band: payload.level_band,
      p_is_active: payload.is_active !== false,
    });
  }

  async update(id, payload) {
    return this.callProcedure('sp_designations_update', {
      p_id: id,
      p_name: payload.name,
      p_level: payload.level,
      p_level_band: payload.level_band,
      p_is_active: payload.is_active,
    });
  }

  async delete(id) {
    return this.callProcedure('sp_designations_delete', { p_id: id });
  }
}

module.exports = new DesignationsRepository();
