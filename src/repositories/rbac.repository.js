/**
 * ═══════════════════════════════════════════════════════════════
 * RBAC REPOSITORY — Database Layer (Supabase RPC)
 * ═══════════════════════════════════════════════════════════════
 * All database operations use ONLY the functions defined in the
 * SQL phase 36:
 *
 *   ROLES:
 *   - udf_get_roles           — read, search, filter, paginate
 *   - sp_roles_insert         — create role, returns new id
 *   - sp_roles_update         — update role, returns void
 *   - sp_roles_delete         — soft delete role, returns void
 *   - sp_roles_restore        — restore deleted role, returns void
 *
 *   PERMISSIONS:
 *   - udf_get_permissions     — read, search, filter, paginate
 *
 *   ROLE PERMISSIONS:
 *   - udf_get_role_permissions      — read role permissions
 *   - sp_role_permissions_insert    — assign permission to role
 *   - sp_role_permissions_bulk_insert — assign multiple permissions
 *   - sp_role_permissions_delete    — remove permission from role
 *   - sp_role_permissions_bulk_delete — remove all permissions
 *
 *   USER ROLE ASSIGNMENTS:
 *   - udf_get_user_role_assignments      — read assignments
 *   - sp_user_role_assignments_insert    — assign role to user
 *   - sp_user_role_assignments_update    — update assignment
 *   - sp_user_role_assignments_delete    — soft delete assignment
 *   - sp_user_role_assignments_restore   — restore assignment
 *
 *   PERMISSION HELPERS:
 *   - fn_user_has_permission  — check if user has permission
 *   - fn_user_permissions     — get all user permissions
 *
 *   MODULES:
 *   - udf_get_modules         — read modules
 *
 * IMPORTANT:
 *   - sp_ functions returning BIGINT or INT: data is scalar value
 *   - sp_ functions returning void: data is null
 *   - udf_ functions: data is array of rows
 *   - fn_ functions: data is the return value (bool/table)
 * ═══════════════════════════════════════════════════════════════
 */

const { supabase } = require('../config/database');
const logger = require('../config/logger');

class RbacRepository {
  // ─────────────────────────────────────────────────────────────
  //  ROLES — READ
  // ─────────────────────────────────────────────────────────────

  /**
   * Get role by ID via udf_get_roles
   * @param {number} roleId
   * @returns {Object|null} Role object or null if not found
   */
  async findRoleById(roleId) {
    const { data, error } = await supabase.rpc('udf_get_roles', {
      p_id: roleId,
      p_code: null,
      p_is_active: null,
      p_filter_level: null,
      p_filter_parent_role_id: null,
      p_filter_is_system_role: null,
      p_search_term: null,
      p_sort_column: 'display_order',
      p_sort_direction: 'ASC',
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'RbacRepository.findRoleById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  /**
   * Get role by code via udf_get_roles
   * @param {string} roleCode
   * @returns {Object|null} Role object or null if not found
   */
  async findRoleByCode(roleCode) {
    const { data, error } = await supabase.rpc('udf_get_roles', {
      p_id: null,
      p_code: roleCode,
      p_is_active: null,
      p_filter_level: null,
      p_filter_parent_role_id: null,
      p_filter_is_system_role: null,
      p_search_term: null,
      p_sort_column: 'display_order',
      p_sort_direction: 'ASC',
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'RbacRepository.findRoleByCode failed');
      throw error;
    }

    if (data && data.length > 0) {
      const match = data.find((r) => r.role_code === roleCode);
      return match || null;
    }

    return null;
  }

  /**
   * Get all active roles with optional filtering
   * @param {Object} options
   * @param {boolean} options.isActive
   * @param {number} options.filterLevel
   * @param {number} options.filterParentRoleId
   * @param {boolean} options.filterIsSystemRole
   * @param {string} options.sortColumn
   * @param {string} options.sortDirection
   * @param {number} options.pageIndex
   * @param {number} options.pageSize
   * @returns {Array} Array of roles
   */
  async getRoles({
    isActive = true,
    filterLevel = null,
    filterParentRoleId = null,
    filterIsSystemRole = null,
    sortColumn = 'role_name',
    sortDirection = 'ASC',
    pageIndex = 1,
    pageSize = 50,
  } = {}) {
    const { data, error } = await supabase.rpc('udf_get_roles', {
      p_id: null,
      p_code: null,
      p_is_active: isActive,
      p_filter_level: filterLevel,
      p_filter_parent_role_id: filterParentRoleId,
      p_filter_is_system_role: filterIsSystemRole,
      p_search_term: null,
      p_sort_column: sortColumn,
      p_sort_direction: sortDirection,
      p_page_index: pageIndex,
      p_page_size: pageSize,
    });

    if (error) {
      logger.error({ error }, 'RbacRepository.getRoles failed');
      throw error;
    }

    return data || [];
  }

  /**
   * Search roles via udf_get_roles
   * @param {string} searchTerm
   * @param {Object} options
   * @returns {Array} Matching roles
   */
  async searchRoles(searchTerm, options = {}) {
    const {
      isActive = true,
      sortColumn = 'role_name',
      sortDirection = 'ASC',
      pageIndex = 1,
      pageSize = 50,
    } = options;

    const { data, error } = await supabase.rpc('udf_get_roles', {
      p_id: null,
      p_code: null,
      p_is_active: isActive,
      p_filter_level: null,
      p_filter_parent_role_id: null,
      p_filter_is_system_role: null,
      p_search_term: searchTerm,
      p_sort_column: sortColumn,
      p_sort_direction: sortDirection,
      p_page_index: pageIndex,
      p_page_size: pageSize,
    });

    if (error) {
      logger.error({ error }, 'RbacRepository.searchRoles failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  ROLES — CREATE
  // ─────────────────────────────────────────────────────────────

  /**
   * Create a new role via sp_roles_insert
   * @param {Object} params
   * @param {string} params.name
   * @param {string} params.code
   * @param {string} params.description
   * @param {number} params.parentRoleId (optional)
   * @param {number} params.level
   * @param {boolean} params.isSystemRole
   * @param {number} params.displayOrder
   * @param {string} params.icon (optional)
   * @param {string} params.color (optional)
   * @param {boolean} params.isActive
   * @param {number} params.createdBy
   * @returns {Object} Full role object from udf_get_roles
   */
  async createRole({
    name,
    code,
    description,
    parentRoleId = null,
    level,
    isSystemRole,
    displayOrder,
    icon = null,
    color = null,
    isActive = true,
    createdBy,
  }) {
    const { data: newId, error } = await supabase.rpc('sp_roles_insert', {
      p_name: name,
      p_code: code,
      p_description: description,
      p_parent_role_id: parentRoleId,
      p_level: level,
      p_is_system_role: isSystemRole,
      p_display_order: displayOrder,
      p_icon: icon,
      p_color: color,
      p_is_active: isActive,
      p_created_by: createdBy,
    });

    if (error) {
      logger.error({ error }, 'RbacRepository.createRole (sp_roles_insert) failed');
      throw error;
    }

    const newRole = await this.findRoleById(newId);
    if (!newRole) {
      throw new Error(`Role created (id: ${newId}) but could not be fetched via udf_get_roles`);
    }

    logger.info(`Role created via sp_roles_insert: id=${newId}, code=${code}`);
    return newRole;
  }

  // ─────────────────────────────────────────────────────────────
  //  ROLES — UPDATE
  // ─────────────────────────────────────────────────────────────

  /**
   * Update role via sp_roles_update
   * @param {number} roleId
   * @param {Object} params
   * @returns {Object} Updated role object
   */
  async updateRole(roleId, {
    name = null,
    code = null,
    description = null,
    parentRoleId = null,
    level = null,
    displayOrder = null,
    icon = null,
    color = null,
    isActive = null,
    updatedBy,
  }) {
    const { error } = await supabase.rpc('sp_roles_update', {
      p_id: roleId,
      p_name: name,
      p_code: code,
      p_description: description,
      p_parent_role_id: parentRoleId,
      p_level: level,
      p_display_order: displayOrder,
      p_icon: icon,
      p_color: color,
      p_is_active: isActive,
      p_updated_by: updatedBy,
    });

    if (error) {
      logger.error({ error }, 'RbacRepository.updateRole (sp_roles_update) failed');
      throw error;
    }

    const updated = await this.findRoleById(roleId);
    logger.info(`Role updated via sp_roles_update: id=${roleId}`);
    return updated;
  }

  // ─────────────────────────────────────────────────────────────
  //  ROLES — DELETE & RESTORE
  // ─────────────────────────────────────────────────────────────

  /**
   * Soft delete role via sp_roles_delete
   * @param {number} roleId
   */
  async deleteRole(roleId) {
    const { error } = await supabase.rpc('sp_roles_delete', {
      p_id: roleId,
    });

    if (error) {
      logger.error({ error }, 'RbacRepository.deleteRole (sp_roles_delete) failed');
      throw error;
    }

    logger.info(`Role deleted via sp_roles_delete: id=${roleId}`);
    return { id: roleId };
  }

  /**
   * Restore deleted role via sp_roles_restore
   * @param {number} roleId
   * @param {boolean} restorePermissions
   */
  async restoreRole(roleId, restorePermissions = false) {
    const { error } = await supabase.rpc('sp_roles_restore', {
      p_id: roleId,
      p_restore_permissions: restorePermissions,
    });

    if (error) {
      logger.error({ error }, 'RbacRepository.restoreRole (sp_roles_restore) failed');
      throw error;
    }

    const restored = await this.findRoleById(roleId);
    logger.info(`Role restored via sp_roles_restore: id=${roleId}`);
    return restored;
  }

  // ─────────────────────────────────────────────────────────────
  //  PERMISSIONS — READ
  // ─────────────────────────────────────────────────────────────

  /**
   * Get permission by ID via udf_get_permissions
   * @param {number} permissionId
   * @returns {Object|null} Permission object or null if not found
   */
  async findPermissionById(permissionId) {
    const { data, error } = await supabase.rpc('udf_get_permissions', {
      p_id: permissionId,
      p_code: null,
      p_is_active: null,
      p_filter_module_id: null,
      p_filter_module_code: null,
      p_filter_resource: null,
      p_filter_action: null,
      p_filter_scope: null,
      p_search_term: null,
      p_sort_column: 'display_order',
      p_sort_direction: 'ASC',
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'RbacRepository.findPermissionById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  /**
   * Get permission by code via udf_get_permissions
   * @param {string} permissionCode
   * @returns {Object|null} Permission object or null if not found
   */
  async findPermissionByCode(permissionCode) {
    const { data, error } = await supabase.rpc('udf_get_permissions', {
      p_id: null,
      p_code: permissionCode,
      p_is_active: null,
      p_filter_module_id: null,
      p_filter_module_code: null,
      p_filter_resource: null,
      p_filter_action: null,
      p_filter_scope: null,
      p_search_term: null,
      p_sort_column: 'display_order',
      p_sort_direction: 'ASC',
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'RbacRepository.findPermissionByCode failed');
      throw error;
    }

    if (data && data.length > 0) {
      const match = data.find((p) => p.perm_code === permissionCode);
      return match || null;
    }

    return null;
  }

  /**
   * Get all active permissions with optional filtering
   * @param {Object} options
   * @param {boolean} options.isActive
   * @param {number} options.filterModuleId
   * @param {string} options.filterModuleCode
   * @param {string} options.filterResource
   * @param {string} options.filterAction
   * @param {string} options.filterScope
   * @param {string} options.sortColumn
   * @param {string} options.sortDirection
   * @param {number} options.pageIndex
   * @param {number} options.pageSize
   * @returns {Array} Array of permissions
   */
  async getPermissions({
    isActive = true,
    filterModuleId = null,
    filterModuleCode = null,
    filterResource = null,
    filterAction = null,
    filterScope = null,
    sortColumn = 'perm_name',
    sortDirection = 'ASC',
    pageIndex = 1,
    pageSize = 50,
  } = {}) {
    const { data, error } = await supabase.rpc('udf_get_permissions', {
      p_id: null,
      p_code: null,
      p_is_active: isActive,
      p_filter_module_id: filterModuleId,
      p_filter_module_code: filterModuleCode,
      p_filter_resource: filterResource,
      p_filter_action: filterAction,
      p_filter_scope: filterScope,
      p_search_term: null,
      p_sort_column: sortColumn,
      p_sort_direction: sortDirection,
      p_page_index: pageIndex,
      p_page_size: pageSize,
    });

    if (error) {
      logger.error({ error }, 'RbacRepository.getPermissions failed');
      throw error;
    }

    return data || [];
  }

  /**
   * Search permissions via udf_get_permissions
   * @param {string} searchTerm
   * @param {Object} options
   * @returns {Array} Matching permissions
   */
  async searchPermissions(searchTerm, options = {}) {
    const {
      isActive = true,
      filterModuleCode = null,
      sortColumn = 'perm_name',
      sortDirection = 'ASC',
      pageIndex = 1,
      pageSize = 50,
    } = options;

    const { data, error } = await supabase.rpc('udf_get_permissions', {
      p_id: null,
      p_code: null,
      p_is_active: isActive,
      p_filter_module_id: null,
      p_filter_module_code: filterModuleCode,
      p_filter_resource: null,
      p_filter_action: null,
      p_filter_scope: null,
      p_search_term: searchTerm,
      p_sort_column: sortColumn,
      p_sort_direction: sortDirection,
      p_page_index: pageIndex,
      p_page_size: pageSize,
    });

    if (error) {
      logger.error({ error }, 'RbacRepository.searchPermissions failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  ROLE PERMISSIONS — READ
  // ─────────────────────────────────────────────────────────────

  /**
   * Get all permissions assigned to a role via udf_get_role_permissions
   * @param {number} roleId
   * @param {Object} options
   * @returns {Array} Array of role-permission assignments
   */
  async getRolePermissions(roleId, options = {}) {
    const {
      filterModuleCode = null,
      filterAction = null,
      filterScope = null,
      sortColumn = 'perm_name',
      sortDirection = 'ASC',
      pageIndex = 1,
      pageSize = 50,
    } = options;

    const { data, error } = await supabase.rpc('udf_get_role_permissions', {
      p_role_id: roleId,
      p_role_code: null,
      p_permission_id: null,
      p_filter_module_code: filterModuleCode,
      p_filter_action: filterAction,
      p_filter_scope: filterScope,
      p_search_term: null,
      p_sort_column: sortColumn,
      p_sort_direction: sortDirection,
      p_page_index: pageIndex,
      p_page_size: pageSize,
    });

    if (error) {
      logger.error({ error }, 'RbacRepository.getRolePermissions failed');
      throw error;
    }

    return data || [];
  }

  /**
   * Search role permissions via udf_get_role_permissions
   * @param {number} roleId
   * @param {string} searchTerm
   * @param {Object} options
   * @returns {Array} Matching role permissions
   */
  async searchRolePermissions(roleId, searchTerm, options = {}) {
    const {
      sortColumn = 'perm_name',
      sortDirection = 'ASC',
      pageIndex = 1,
      pageSize = 50,
    } = options;

    const { data, error } = await supabase.rpc('udf_get_role_permissions', {
      p_role_id: roleId,
      p_role_code: null,
      p_permission_id: null,
      p_filter_module_code: null,
      p_filter_action: null,
      p_filter_scope: null,
      p_search_term: searchTerm,
      p_sort_column: sortColumn,
      p_sort_direction: sortDirection,
      p_page_index: pageIndex,
      p_page_size: pageSize,
    });

    if (error) {
      logger.error({ error }, 'RbacRepository.searchRolePermissions failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  ROLE PERMISSIONS — CREATE
  // ─────────────────────────────────────────────────────────────

  /**
   * Assign a single permission to a role via sp_role_permissions_insert
   * @param {number} roleId
   * @param {number} permissionId
   * @param {number} createdBy
   * @returns {number} New assignment ID
   */
  async assignPermissionToRole(roleId, permissionId, createdBy) {
    const { data: newId, error } = await supabase.rpc('sp_role_permissions_insert', {
      p_role_id: roleId,
      p_permission_id: permissionId,
      p_created_by: createdBy,
    });

    if (error) {
      logger.error({ error }, 'RbacRepository.assignPermissionToRole (sp_role_permissions_insert) failed');
      throw error;
    }

    logger.info(`Permission assigned to role via sp_role_permissions_insert: roleId=${roleId}, permissionId=${permissionId}`);
    return newId;
  }

  /**
   * Assign multiple permissions to a role via sp_role_permissions_bulk_insert
   * @param {number} roleId
   * @param {Array<number>} permissionIds
   * @param {number} createdBy
   * @returns {number} Count of inserted assignments
   */
  async assignPermissionsToRole(roleId, permissionIds, createdBy) {
    const { data: count, error } = await supabase.rpc('sp_role_permissions_bulk_insert', {
      p_role_id: roleId,
      p_permission_ids: permissionIds,
      p_created_by: createdBy,
    });

    if (error) {
      logger.error({ error }, 'RbacRepository.assignPermissionsToRole (sp_role_permissions_bulk_insert) failed');
      throw error;
    }

    logger.info(`Permissions assigned to role via sp_role_permissions_bulk_insert: roleId=${roleId}, count=${count}`);
    return count;
  }

  // ─────────────────────────────────────────────────────────────
  //  ROLE PERMISSIONS — DELETE
  // ─────────────────────────────────────────────────────────────

  /**
   * Remove a permission from a role via sp_role_permissions_delete
   * @param {number} roleId
   * @param {number} permissionId
   */
  async removePermissionFromRole(roleId, permissionId) {
    const { error } = await supabase.rpc('sp_role_permissions_delete', {
      p_role_id: roleId,
      p_permission_id: permissionId,
    });

    if (error) {
      logger.error({ error }, 'RbacRepository.removePermissionFromRole (sp_role_permissions_delete) failed');
      throw error;
    }

    logger.info(`Permission removed from role via sp_role_permissions_delete: roleId=${roleId}, permissionId=${permissionId}`);
    return { roleId, permissionId };
  }

  /**
   * Remove all permissions from a role via sp_role_permissions_bulk_delete
   * @param {number} roleId
   * @returns {number} Count of deleted assignments
   */
  async removeAllPermissionsFromRole(roleId) {
    const { data: count, error } = await supabase.rpc('sp_role_permissions_bulk_delete', {
      p_role_id: roleId,
    });

    if (error) {
      logger.error({ error }, 'RbacRepository.removeAllPermissionsFromRole (sp_role_permissions_bulk_delete) failed');
      throw error;
    }

    logger.info(`All permissions removed from role via sp_role_permissions_bulk_delete: roleId=${roleId}, count=${count}`);
    return count;
  }

  // ─────────────────────────────────────────────────────────────
  //  USER ROLE ASSIGNMENTS — READ
  // ─────────────────────────────────────────────────────────────

  /**
   * Get assignment by ID via udf_get_user_role_assignments
   * @param {number} assignmentId
   * @returns {Object|null} Assignment object or null if not found
   */
  async findUserRoleAssignmentById(assignmentId) {
    /**
     * DB signature: udf_get_user_role_assignments(
     *   p_id, p_user_id, p_role_id, p_role_code,
     *   p_filter_context_type, p_filter_context_id, p_filter_is_valid,
     *   p_search_term, p_sort_column, p_sort_direction, p_page_index, p_page_size
     * )
     */
    const { data, error } = await supabase.rpc('udf_get_user_role_assignments', {
      p_id: assignmentId,
      p_user_id: null,
      p_role_id: null,
      p_role_code: null,
      p_filter_context_type: null,
      p_filter_context_id: null,
      p_filter_is_valid: null,
      p_search_term: null,
      p_sort_column: 'assigned_at',
      p_sort_direction: 'DESC',
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'RbacRepository.findUserRoleAssignmentById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  /**
   * Get all role assignments for a user via udf_get_user_role_assignments
   * @param {number} userId
   * @param {Object} options
   * @returns {Array} Array of user role assignments
   */
  async getUserRoleAssignments(userId, options = {}) {
    const {
      filterContextType = null,
      filterContextId = null,
      filterRoleCode = null,
      filterIsValid = null,
      sortColumn = 'assigned_at',
      sortDirection = 'DESC',
      pageIndex = 1,
      pageSize = 50,
    } = options;

    const { data, error } = await supabase.rpc('udf_get_user_role_assignments', {
      p_id: null,
      p_user_id: userId,
      p_role_id: null,
      p_role_code: filterRoleCode,
      p_filter_context_type: filterContextType,
      p_filter_context_id: filterContextId,
      p_filter_is_valid: filterIsValid,
      p_search_term: null,
      p_sort_column: sortColumn,
      p_sort_direction: sortDirection,
      p_page_index: pageIndex,
      p_page_size: pageSize,
    });

    if (error) {
      logger.error({ error }, 'RbacRepository.getUserRoleAssignments failed');
      throw error;
    }

    return data || [];
  }

  /**
   * Get all assignments for a specific role via udf_get_user_role_assignments
   * @param {number} roleId
   * @param {Object} options
   * @returns {Array} Array of user role assignments
   */
  async getRoleAssignments(roleId, options = {}) {
    const {
      filterContextType = null,
      filterContextId = null,
      filterIsValid = null,
      sortColumn = 'assigned_at',
      sortDirection = 'DESC',
      pageIndex = 1,
      pageSize = 50,
    } = options;

    const { data, error } = await supabase.rpc('udf_get_user_role_assignments', {
      p_id: null,
      p_user_id: null,
      p_role_id: roleId,
      p_role_code: null,
      p_filter_context_type: filterContextType,
      p_filter_context_id: filterContextId,
      p_filter_is_valid: filterIsValid,
      p_search_term: null,
      p_sort_column: sortColumn,
      p_sort_direction: sortDirection,
      p_page_index: pageIndex,
      p_page_size: pageSize,
    });

    if (error) {
      logger.error({ error }, 'RbacRepository.getRoleAssignments failed');
      throw error;
    }

    return data || [];
  }

  /**
   * Search user role assignments via udf_get_user_role_assignments
   * @param {string} searchTerm
   * @param {Object} options
   * @returns {Array} Matching assignments
   */
  async searchUserRoleAssignments(searchTerm, options = {}) {
    const {
      filterIsValid = null,
      sortColumn = 'assigned_at',
      sortDirection = 'DESC',
      pageIndex = 1,
      pageSize = 50,
    } = options;

    const { data, error } = await supabase.rpc('udf_get_user_role_assignments', {
      p_id: null,
      p_user_id: null,
      p_role_id: null,
      p_role_code: null,
      p_filter_context_type: null,
      p_filter_context_id: null,
      p_filter_is_valid: filterIsValid,
      p_search_term: searchTerm,
      p_sort_column: sortColumn,
      p_sort_direction: sortDirection,
      p_page_index: pageIndex,
      p_page_size: pageSize,
    });

    if (error) {
      logger.error({ error }, 'RbacRepository.searchUserRoleAssignments failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  USER ROLE ASSIGNMENTS — CREATE
  // ─────────────────────────────────────────────────────────────

  /**
   * Assign a role to a user via sp_user_role_assignments_insert
   * @param {Object} params
   * @param {number} params.userId
   * @param {number} params.roleId
   * @param {string} params.contextType (optional, e.g., 'organization', 'project')
   * @param {number} params.contextId (optional)
   * @param {Date} params.expiresAt (optional)
   * @param {string} params.reason (optional)
   * @param {number} params.assignedBy
   * @returns {Object} Full assignment object
   */
  async assignRoleToUser({
    userId,
    roleId,
    contextType = null,
    contextId = null,
    expiresAt = null,
    reason = null,
    assignedBy,
  }) {
    const { data: newId, error } = await supabase.rpc('sp_user_role_assignments_insert', {
      p_user_id: userId,
      p_role_id: roleId,
      p_context_type: contextType,
      p_context_id: contextId,
      p_expires_at: expiresAt,
      p_reason: reason,
      p_assigned_by: assignedBy,
    });

    if (error) {
      logger.error({ error }, 'RbacRepository.assignRoleToUser (sp_user_role_assignments_insert) failed');
      throw error;
    }

    const newAssignment = await this.findUserRoleAssignmentById(newId);
    if (!newAssignment) {
      throw new Error(`Assignment created (id: ${newId}) but could not be fetched via udf_get_user_role_assignments`);
    }

    logger.info(`Role assigned to user via sp_user_role_assignments_insert: userId=${userId}, roleId=${roleId}, assignmentId=${newId}`);
    return newAssignment;
  }

  // ─────────────────────────────────────────────────────────────
  //  USER ROLE ASSIGNMENTS — UPDATE
  // ─────────────────────────────────────────────────────────────

  /**
   * Update a user role assignment via sp_user_role_assignments_update
   * @param {number} assignmentId
   * @param {Object} params
   * @param {Date} params.expiresAt (optional)
   * @param {string} params.reason (optional)
   * @param {boolean} params.isActive (optional)
   * @param {number} params.updatedBy
   * @returns {Object} Updated assignment object
   */
  async updateUserRoleAssignment(assignmentId, {
    expiresAt = null,
    reason = null,
    isActive = null,
    updatedBy,
  }) {
    const { error } = await supabase.rpc('sp_user_role_assignments_update', {
      p_id: assignmentId,
      p_expires_at: expiresAt,
      p_reason: reason,
      p_is_active: isActive,
      p_updated_by: updatedBy,
    });

    if (error) {
      logger.error({ error }, 'RbacRepository.updateUserRoleAssignment (sp_user_role_assignments_update) failed');
      throw error;
    }

    const updated = await this.findUserRoleAssignmentById(assignmentId);
    logger.info(`Assignment updated via sp_user_role_assignments_update: assignmentId=${assignmentId}`);
    return updated;
  }

  // ─────────────────────────────────────────────────────────────
  //  USER ROLE ASSIGNMENTS — DELETE & RESTORE
  // ─────────────────────────────────────────────────────────────

  /**
   * Soft delete a user role assignment via sp_user_role_assignments_delete
   * @param {number} assignmentId
   */
  async deleteUserRoleAssignment(assignmentId) {
    const { error } = await supabase.rpc('sp_user_role_assignments_delete', {
      p_id: assignmentId,
    });

    if (error) {
      logger.error({ error }, 'RbacRepository.deleteUserRoleAssignment (sp_user_role_assignments_delete) failed');
      throw error;
    }

    logger.info(`Assignment deleted via sp_user_role_assignments_delete: assignmentId=${assignmentId}`);
    return { id: assignmentId };
  }

  /**
   * Restore a deleted user role assignment via sp_user_role_assignments_restore
   * @param {number} assignmentId
   */
  async restoreUserRoleAssignment(assignmentId) {
    const { error } = await supabase.rpc('sp_user_role_assignments_restore', {
      p_id: assignmentId,
    });

    if (error) {
      logger.error({ error }, 'RbacRepository.restoreUserRoleAssignment (sp_user_role_assignments_restore) failed');
      throw error;
    }

    const restored = await this.findUserRoleAssignmentById(assignmentId);
    logger.info(`Assignment restored via sp_user_role_assignments_restore: assignmentId=${assignmentId}`);
    return restored;
  }

  // ─────────────────────────────────────────────────────────────
  //  PERMISSION HELPERS
  // ─────────────────────────────────────────────────────────────

  /**
   * Check if user has a specific permission via fn_user_has_permission
   * @param {number} userId
   * @param {string} permissionCode
   * @returns {boolean} True if user has permission, false otherwise
   */
  async userHasPermission(userId, permissionCode) {
    const { data, error } = await supabase.rpc('fn_user_has_permission', {
      p_user_id: userId,
      p_permission_code: permissionCode,
    });

    if (error) {
      logger.error({ error }, 'RbacRepository.userHasPermission failed');
      throw error;
    }

    return data === true;
  }

  /**
   * Get all permissions for a user via fn_user_permissions
   * Returns array of { permission_code, permission_name, module_code, role_code, scope }
   * @param {number} userId
   * @returns {Array} Array of user permissions
   */
  async getUserPermissions(userId) {
    const { data, error } = await supabase.rpc('fn_user_permissions', {
      p_user_id: userId,
    });

    if (error) {
      logger.error({ error }, 'RbacRepository.getUserPermissions failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  MODULES — READ
  // ─────────────────────────────────────────────────────────────

  /**
   * Get module by ID via udf_get_modules
   * @param {number} moduleId
   * @returns {Object|null} Module object or null if not found
   */
  async findModuleById(moduleId) {
    const { data, error } = await supabase.rpc('udf_get_modules', {
      p_id: moduleId,
      p_code: null,
      p_is_active: null,
      p_search_term: null,
      p_sort_column: 'display_order',
      p_sort_direction: 'ASC',
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'RbacRepository.findModuleById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  /**
   * Get module by code via udf_get_modules
   * @param {string} moduleCode
   * @returns {Object|null} Module object or null if not found
   */
  async findModuleByCode(moduleCode) {
    const { data, error } = await supabase.rpc('udf_get_modules', {
      p_id: null,
      p_code: moduleCode,
      p_is_active: null,
      p_search_term: null,
      p_sort_column: 'display_order',
      p_sort_direction: 'ASC',
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'RbacRepository.findModuleByCode failed');
      throw error;
    }

    if (data && data.length > 0) {
      const match = data.find((m) => m.module_code === moduleCode);
      return match || null;
    }

    return null;
  }

  /**
   * Get all active modules with optional filtering
   * @param {Object} options
   * @param {boolean} options.isActive
   * @param {string} options.sortColumn
   * @param {string} options.sortDirection
   * @param {number} options.pageIndex
   * @param {number} options.pageSize
   * @returns {Array} Array of modules
   */
  async getModules({
    isActive = true,
    sortColumn = 'module_name',
    sortDirection = 'ASC',
    pageIndex = 1,
    pageSize = 50,
  } = {}) {
    const { data, error } = await supabase.rpc('udf_get_modules', {
      p_id: null,
      p_code: null,
      p_is_active: isActive,
      p_search_term: null,
      p_sort_column: sortColumn,
      p_sort_direction: sortDirection,
      p_page_index: pageIndex,
      p_page_size: pageSize,
    });

    if (error) {
      logger.error({ error }, 'RbacRepository.getModules failed');
      throw error;
    }

    return data || [];
  }

  /**
   * Search modules via udf_get_modules
   * @param {string} searchTerm
   * @param {Object} options
   * @returns {Array} Matching modules
   */
  async searchModules(searchTerm, options = {}) {
    const {
      isActive = true,
      sortColumn = 'module_name',
      sortDirection = 'ASC',
      pageIndex = 1,
      pageSize = 50,
    } = options;

    const { data, error } = await supabase.rpc('udf_get_modules', {
      p_id: null,
      p_code: null,
      p_is_active: isActive,
      p_search_term: searchTerm,
      p_sort_column: sortColumn,
      p_sort_direction: sortDirection,
      p_page_index: pageIndex,
      p_page_size: pageSize,
    });

    if (error) {
      logger.error({ error }, 'RbacRepository.searchModules failed');
      throw error;
    }

    return data || [];
  }
}

module.exports = new RbacRepository();
