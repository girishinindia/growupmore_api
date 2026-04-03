/**
 * USER-ROLE-ASSIGNMENTS REPOSITORY (Phase 36)
 */

const BaseRepository = require('./base.repository');

class UserRoleAssignmentsRepository extends BaseRepository {
  async list({ userId = null, roleId = null, roleCode = null, contextType = null, contextId = null, isValid = null, search = '', sort = 'created_at', order = 'DESC', page = 1, limit = 20 } = {}) {
    return this.callFunctionPaginated('udf_get_user_role_assignments', {
      p_user_id: userId,
      p_role_id: roleId,
      p_role_code: roleCode,
      p_filter_context_type: contextType,
      p_filter_context_id: contextId,
      p_filter_is_valid: isValid,
      p_search_term: search || null,
      p_sort_column: sort,
      p_sort_direction: order,
      p_page_index: page - 1,
      p_page_size: limit,
    });
  }

  async getById(id) {
    return this.callFunctionSingle('udf_get_user_role_assignments', { p_id: id }, 'User Role Assignment');
  }

  async assign(payload) {
    return this.callProcedure('sp_user_role_assignments_insert', {
      p_user_id: payload.user_id,
      p_role_id: payload.role_id,
      p_context_type: payload.context_type || null,
      p_context_id: payload.context_id || null,
      p_expires_at: payload.expires_at || null,
      p_reason: payload.reason || null,
      p_assigned_by: payload.assigned_by || null,
    });
  }

  async update(id, payload) {
    return this.callProcedure('sp_user_role_assignments_update', {
      p_id: id,
      p_expires_at: payload.expires_at,
      p_reason: payload.reason,
      p_is_active: payload.is_active,
    });
  }

  async revoke(id, revokedBy = null) {
    return this.callProcedure('sp_user_role_assignments_delete', {
      p_id: id,
      p_deleted_by: revokedBy,
    });
  }

  async restore(id, restoredBy = null) {
    return this.callProcedure('sp_user_role_assignments_restore', {
      p_id: id,
      p_restored_by: restoredBy,
    });
  }
}

module.exports = new UserRoleAssignmentsRepository();
