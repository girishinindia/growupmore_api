/**
 * ═══════════════════════════════════════════════════════════════
 * SKILLS REPOSITORY
 * ═══════════════════════════════════════════════════════════════
 */

const BaseRepository = require('./base.repository');

class SkillsRepository extends BaseRepository {
  async list(page = 1, limit = 20) {
    const pageIndex = page - 1;
    return this.callFunctionPaginated('udf_get_skills', {
      p_page_index: pageIndex,
      p_page_size: limit,
    });
  }

  async getById(id) {
    return this.callFunctionSingle(
      'udf_get_skills',
      { p_id: id },
      'Skill'
    );
  }

  async create(payload) {
    return this.callProcedure('sp_skills_insert', {
      p_name: payload.name,
      p_category: payload.category,
      p_description: payload.description || null,
      p_is_active: payload.is_active !== false,
    });
  }

  async update(id, payload) {
    return this.callProcedure('sp_skills_update', {
      p_id: id,
      p_name: payload.name,
      p_category: payload.category,
      p_description: payload.description,
      p_is_active: payload.is_active,
    });
  }

  async delete(id) {
    return this.callProcedure('sp_skills_delete', { p_id: id });
  }
}

module.exports = new SkillsRepository();
