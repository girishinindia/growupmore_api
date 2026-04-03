/**
 * ═══════════════════════════════════════════════════════════════
 * LEARNING-GOALS REPOSITORY
 * ═══════════════════════════════════════════════════════════════
 */

const BaseRepository = require('./base.repository');

class LearningGoalsRepository extends BaseRepository {
  async list(page = 1, limit = 20) {
    const pageIndex = page - 1;
    return this.callFunctionPaginated('udf_get_learning_goals', {
      p_page_index: pageIndex,
      p_page_size: limit,
    });
  }

  async getById(id) {
    return this.callFunctionSingle(
      'udf_get_learning_goals',
      { p_id: id },
      'Learning Goal'
    );
  }

  async create(payload) {
    return this.callProcedure('sp_learning_goals_insert', {
      p_name: payload.name,
      p_display_order: payload.display_order || 0,
      p_is_active: payload.is_active !== false,
    });
  }

  async update(id, payload) {
    return this.callProcedure('sp_learning_goals_update', {
      p_id: id,
      p_name: payload.name,
      p_display_order: payload.display_order,
      p_is_active: payload.is_active,
    });
  }

  async delete(id) {
    return this.callProcedure('sp_learning_goals_delete', { p_id: id });
  }
}

module.exports = new LearningGoalsRepository();
