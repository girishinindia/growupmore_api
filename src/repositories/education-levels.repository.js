/**
 * ═══════════════════════════════════════════════════════════════
 * EDUCATION-LEVELS REPOSITORY
 * ═══════════════════════════════════════════════════════════════
 */

const BaseRepository = require('./base.repository');

class EducationLevelsRepository extends BaseRepository {
  async list(page = 1, limit = 20) {
    const pageIndex = page - 1;
    return this.callFunctionPaginated('udf_get_education_levels', {
      p_page_index: pageIndex,
      p_page_size: limit,
    });
  }

  async getById(id) {
    return this.callFunctionSingle(
      'udf_get_education_levels',
      { p_id: id },
      'Education Level'
    );
  }

  async create(payload) {
    return this.callProcedure('sp_education_levels_insert', {
      p_name: payload.name,
      p_level_order: payload.level_order,
      p_level_category: payload.level_category,
      p_is_active: payload.is_active !== false,
    });
  }

  async update(id, payload) {
    return this.callProcedure('sp_education_levels_update', {
      p_id: id,
      p_name: payload.name,
      p_level_order: payload.level_order,
      p_level_category: payload.level_category,
      p_is_active: payload.is_active,
    });
  }

  async delete(id) {
    return this.callProcedure('sp_education_levels_delete', { p_id: id });
  }
}

module.exports = new EducationLevelsRepository();
