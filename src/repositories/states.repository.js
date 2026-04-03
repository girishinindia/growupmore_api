/**
 * ═══════════════════════════════════════════════════════════════
 * STATES REPOSITORY
 * ═══════════════════════════════════════════════════════════════
 */

const BaseRepository = require('./base.repository');

class StatesRepository extends BaseRepository {
  async list(page = 1, limit = 20) {
    const pageIndex = page - 1;
    return this.callFunctionPaginated('udf_getstates', {
      p_page_index: pageIndex,
      p_page_size: limit,
    });
  }

  async getById(id) {
    return this.callFunctionSingle(
      'udf_getstates',
      { p_id: id },
      'State'
    );
  }

  async create(payload) {
    return this.callProcedure('sp_states_insert', {
      p_country_id: payload.country_id,
      p_name: payload.name,
      p_is_active: payload.is_active !== false,
    });
  }

  async update(id, payload) {
    return this.callProcedure('sp_states_update', {
      p_id: id,
      p_country_id: payload.country_id,
      p_name: payload.name,
      p_is_active: payload.is_active,
    });
  }

  async delete(id) {
    return this.callProcedure('sp_states_delete', { p_id: id });
  }
}

module.exports = new StatesRepository();
