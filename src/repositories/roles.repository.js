/**
 * ROLES REPOSITORY
 */

const BaseRepository = require('./base.repository');

class RolesRepository extends BaseRepository {
  async list({ page = 1, limit = 20, search = '', sort = 'display_order', order = 'ASC', isActive = null, level = null, parentRoleId = null, isSystemRole = null } = {}) {
    return this.callFunctionPaginated('udf_get_roles', {
      p_page_index: page - 1,
      p_page_size: limit,
      p_search_term: search || null,
      p_sort_column: sort,
      p_sort_direction: order,
      p_is_active: isActive,
      p_filter_level: level,
      p_filter_parent_role_id: parentRoleId,
      p_filter_is_system_role: isSystemRole,
    });
  }

  async getById(id) {
    return this.callFunctionSingle('udf_get_roles', { p_id: id }, 'Role');
  }

  async getByCode(code) {
    return this.callFunctionSingle('udf_get_roles', { p_code: code }, 'Role');
  }

  async create(payload) {
    return this.callProcedure('sp_roles_insert', {
      p_name: payload.name,
      p_code: payload.code,
      p_slug: payload.slug,
      p_description: payload.description || null,
      p_parent_role_id: payload.parent_role_id || null,
      p_level: payload.level,
      p_is_system_role: payload.is_system_role || false,
      p_display_order: payload.display_order || 0,
      p_icon: payload.icon || null,
      p_color: payload.color || null,
      p_is_active: payload.is_active !== false,
      p_created_by: payload.created_by || null,
    });
  }

  async update(id, payload) {
    return this.callProcedure('sp_roles_update', {
      p_id: id,
      p_name: payload.name,
      p_code: payload.code,
      p_slug: payload.slug,
      p_description: payload.description,
      p_parent_role_id: payload.parent_role_id,
      p_level: payload.level,
      p_display_order: payload.display_order,
      p_icon: payload.icon,
      p_color: payload.color,
      p_is_active: payload.is_active,
      p_updated_by: payload.updated_by || null,
    });
  }

  async delete(id, deletedBy = null) {
    return this.callProcedure('sp_roles_delete', { p_id: id, p_deleted_by: deletedBy });
  }

  async restore(id, restoredBy = null) {
    return this.callProcedure('sp_roles_restore', { p_id: id, p_restored_by: restoredBy });
  }
}

module.exports = new RolesRepository();
