/**
 * ═══════════════════════════════════════════════════════════════
 * CITIES REPOSITORY
 * ═══════════════════════════════════════════════════════════════
 */

const BaseRepository = require('./base.repository');

class CitiesRepository extends BaseRepository {
  async list(page = 1, limit = 20) {
    const pageIndex = page - 1;
    return this.callFunctionPaginated('udf_getcities', {
      p_page_index: pageIndex,
      p_page_size: limit,
    });
  }

  async getById(id) {
    return this.callFunctionSingle(
      'udf_getcities',
      { p_id: id },
      'City'
    );
  }

  async create(payload) {
    return this.callProcedure('sp_cities_insert', {
      p_state_id: payload.state_id,
      p_name: payload.name,
      p_is_active: payload.is_active !== false,
    });
  }

  async update(id, payload) {
    return this.callProcedure('sp_cities_update', {
      p_id: id,
      p_state_id: payload.state_id,
      p_name: payload.name,
      p_is_active: payload.is_active,
    });
  }

  async delete(id) {
    return this.callProcedure('sp_cities_delete', { p_id: id });
  }
}

module.exports = new CitiesRepository();
