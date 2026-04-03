/**
 * ═══════════════════════════════════════════════════════════════
 * CATEGORIES REPOSITORY
 * ═══════════════════════════════════════════════════════════════
 */

const BaseRepository = require('./base.repository');

class CategoriesRepository extends BaseRepository {
  async list(page = 1, limit = 20) {
    const pageIndex = page - 1;
    return this.callFunctionPaginated('udf_get_categories', {
      p_page_index: pageIndex,
      p_page_size: limit,
    });
  }

  async getById(id) {
    return this.callFunctionSingle(
      'udf_get_categories',
      { p_id: id },
      'Category'
    );
  }

  async create(payload) {
    return this.callProcedure('sp_categories_insert', {
      p_name: payload.name,
      p_code: payload.code,
      p_slug: payload.slug,
      p_display_order: payload.display_order || 0,
      p_is_active: payload.is_active !== false,
    });
  }

  async update(id, payload) {
    return this.callProcedure('sp_categories_update', {
      p_id: id,
      p_name: payload.name,
      p_code: payload.code,
      p_slug: payload.slug,
      p_display_order: payload.display_order,
      p_is_active: payload.is_active,
    });
  }

  async delete(id) {
    return this.callProcedure('sp_categories_delete', { p_id: id });
  }
}

module.exports = new CategoriesRepository();
