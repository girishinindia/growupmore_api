/**
 * PERMISSIONS REPOSITORY (Phase 36)
 */

const BaseRepository = require('./base.repository');

class PermissionsRepository extends BaseRepository {
  async list({ page = 1, limit = 50, search = '', sort = 'display_order', order = 'ASC', isActive = null, moduleId = null, moduleCode = null, resource = null, action = null, scope = null } = {}) {
    return this.callFunctionPaginated('udf_get_permissions', {
      p_page_index: page - 1,
      p_page_size: limit,
      p_search_term: search || null,
      p_sort_column: sort,
      p_sort_direction: order,
      p_is_active: isActive,
      p_filter_module_id: moduleId,
      p_filter_module_code: moduleCode,
      p_filter_resource: resource,
      p_filter_action: action,
      p_filter_scope: scope,
    });
  }

  async getById(id) {
    return this.callFunctionSingle('udf_get_permissions', { p_id: id }, 'Permission');
  }

  async getByCode(code) {
    return this.callFunctionSingle('udf_get_permissions', { p_code: code }, 'Permission');
  }

  async create(payload) {
    return this.callProcedure('sp_permissions_insert', {
      p_module_id: payload.module_id,
      p_name: payload.name,
      p_code: payload.code,
      p_description: payload.description || null,
      p_resource: payload.resource,
      p_action: payload.action,
      p_scope: payload.scope || 'global',
      p_display_order: payload.display_order || 0,
      p_is_active: payload.is_active !== false,
      p_created_by: payload.created_by || null,
    });
  }

  async update(id, payload) {
    return this.callProcedure('sp_permissions_update', {
      p_id: id,
      p_module_id: payload.module_id,
      p_name: payload.name,
      p_code: payload.code,
      p_description: payload.description,
      p_resource: payload.resource,
      p_action: payload.action,
      p_scope: payload.scope,
      p_display_order: payload.display_order,
      p_is_active: payload.is_active,
      p_updated_by: payload.updated_by || null,
    });
  }

  async delete(id) {
    return this.callProcedure('sp_permissions_delete', { p_id: id });
  }

  async restore(id) {
    return this.callProcedure('sp_permissions_restore', { p_id: id });
  }
}

module.exports = new PermissionsRepository();
