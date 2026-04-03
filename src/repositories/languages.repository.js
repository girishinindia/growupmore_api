/**
 * ═══════════════════════════════════════════════════════════════
 * LANGUAGES REPOSITORY
 * ═══════════════════════════════════════════════════════════════
 */

const BaseRepository = require('./base.repository');

class LanguagesRepository extends BaseRepository {
  async list(page = 1, limit = 20) {
    const pageIndex = page - 1;
    return this.callFunctionPaginated('udf_get_languages', {
      p_page_index: pageIndex,
      p_page_size: limit,
    });
  }

  async getById(id) {
    return this.callFunctionSingle(
      'udf_get_languages',
      { p_id: id },
      'Language'
    );
  }

  async create(payload) {
    return this.callProcedure('sp_languages_insert', {
      p_name: payload.name,
      p_native_name: payload.native_name,
      p_iso_code: payload.iso_code,
      p_is_active: payload.is_active !== false,
    });
  }

  async update(id, payload) {
    return this.callProcedure('sp_languages_update', {
      p_id: id,
      p_name: payload.name,
      p_native_name: payload.native_name,
      p_iso_code: payload.iso_code,
      p_is_active: payload.is_active,
    });
  }

  async delete(id) {
    return this.callProcedure('sp_languages_delete', { p_id: id });
  }
}

module.exports = new LanguagesRepository();
