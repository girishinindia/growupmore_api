/**
 * MODULES REPOSITORY (Phase 36 — Platform Modules)
 */

const BaseRepository = require('./base.repository');

class ModulesRepository extends BaseRepository {
  async list({ page = 1, limit = 50, search = '', sort = 'display_order', order = 'ASC', isActive = null } = {}) {
    return this.callFunctionPaginated('udf_get_modules', {
      p_page_index: page - 1,
      p_page_size: limit,
      p_search_term: search || null,
      p_sort_column: sort,
      p_sort_direction: order,
      p_is_active: isActive,
    });
  }

  async getById(id) {
    return this.callFunctionSingle('udf_get_modules', { p_id: id }, 'Module');
  }

  async getByCode(code) {
    return this.callFunctionSingle('udf_get_modules', { p_code: code }, 'Module');
  }

  async create(payload) {
    return this.callProcedure('sp_modules_insert', {
      p_name: payload.name,
      p_code: payload.code,
      p_slug: payload.slug,
      p_description: payload.description || null,
      p_display_order: payload.display_order || 0,
      p_icon: payload.icon || null,
      p_color: payload.color || null,
      p_is_active: payload.is_active !== false,
      p_created_by: payload.created_by || null,
    });
  }

  async update(id, payload) {
    return this.callProcedure('sp_modules_update', {
      p_id: id,
      p_name: payload.name,
      p_code: payload.code,
      p_slug: payload.slug,
      p_description: payload.description,
      p_display_order: payload.display_order,
      p_icon: payload.icon,
      p_color: payload.color,
      p_is_active: payload.is_active,
      p_updated_by: payload.updated_by || null,
    });
  }

  async delete(id) {
    return this.callProcedure('sp_modules_delete', { p_id: id });
  }

  async restore(id) {
    return this.callProcedure('sp_modules_restore', { p_id: id });
  }
}

module.exports = new ModulesRepository();
