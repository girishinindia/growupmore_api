/**
 * ═══════════════════════════════════════════════════════════════
 * COUNTRIES REPOSITORY
 * ═══════════════════════════════════════════════════════════════
 */

const BaseRepository = require('./base.repository');

class CountriesRepository extends BaseRepository {
  async list(page = 1, limit = 20) {
    const pageIndex = page - 1;
    return this.callFunctionPaginated('udf_get_countries', {
      p_page_index: pageIndex,
      p_page_size: limit,
    });
  }

  async getById(id) {
    return this.callFunctionSingle(
      'udf_get_countries',
      { p_id: id },
      'Country'
    );
  }

  async create(payload) {
    return this.callProcedure('sp_countries_insert', {
      p_name: payload.name,
      p_iso2: payload.iso2,
      p_iso3: payload.iso3,
      p_phone_code: payload.phone_code,
      p_currency: payload.currency,
      p_is_active: payload.is_active !== false,
    });
  }

  async update(id, payload) {
    return this.callProcedure('sp_countries_update', {
      p_id: id,
      p_name: payload.name,
      p_iso2: payload.iso2,
      p_iso3: payload.iso3,
      p_phone_code: payload.phone_code,
      p_currency: payload.currency,
      p_is_active: payload.is_active,
    });
  }

  async delete(id) {
    return this.callProcedure('sp_countries_delete', { p_id: id });
  }
}

module.exports = new CountriesRepository();
