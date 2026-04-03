/**
 * ROLE-PERMISSIONS REPOSITORY (Phase 36 — Junction Table)
 */

const BaseRepository = require('./base.repository');

class RolePermissionsRepository extends BaseRepository {
  async list({ roleId = null, roleCode = null, permissionId = null, moduleCode = null, action = null, scope = null, search = '', sort = 'created_at', order = 'DESC', page = 1, limit = 50 } = {}) {
    return this.callFunctionPaginated('udf_get_role_permissions', {
      p_role_id: roleId,
      p_role_code: roleCode,
      p_permission_id: permissionId,
      p_filter_module_code: moduleCode,
      p_filter_action: action,
      p_filter_scope: scope,
      p_search_term: search || null,
      p_sort_column: sort,
      p_sort_direction: order,
      p_page_index: page - 1,
      p_page_size: limit,
    });
  }

  async assign(roleId, permissionId, createdBy = null) {
    return this.callProcedure('sp_role_permissions_insert', {
      p_role_id: roleId,
      p_permission_id: permissionId,
      p_created_by: createdBy,
    });
  }

  async bulkAssign(roleId, permissionIds, createdBy = null) {
    return this.callProcedure('sp_role_permissions_bulk_insert', {
      p_role_id: roleId,
      p_permission_ids: permissionIds,
      p_created_by: createdBy,
    });
  }

  async remove(roleId, permissionId) {
    return this.callProcedure('sp_role_permissions_delete', {
      p_role_id: roleId,
      p_permission_id: permissionId,
    });
  }

  async removeAll(roleId) {
    return this.callProcedure('sp_role_permissions_bulk_delete', {
      p_role_id: roleId,
    });
  }
}

module.exports = new RolePermissionsRepository();
