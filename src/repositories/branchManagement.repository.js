/**
 * ═══════════════════════════════════════════════════════════════
 * BRANCH MANAGEMENT REPOSITORY — Database Layer (Supabase RPC)
 * ═══════════════════════════════════════════════════════════════
 * Handles Branches, Departments, Branch Departments via:
 *
 *   BRANCHES:
 *   - udf_get_branches            — read, search, filter, paginate
 *   - sp_branches_insert          — create, returns new id (BIGINT)
 *   - sp_branches_update          — update, returns void
 *   - sp_branches_delete          — soft delete, returns void
 *
 *   DEPARTMENTS:
 *   - udf_get_departments         — read, search, filter, paginate
 *   - sp_departments_insert       — create, returns new id (BIGINT)
 *   - sp_departments_update       — update, returns void
 *   - sp_departments_delete       — soft delete, returns void
 *
 *   BRANCH DEPARTMENTS:
 *   - udf_get_branch_departments  — read, search, filter, paginate
 *   - sp_branch_departments_insert — create, returns new id (BIGINT)
 *   - sp_branch_departments_update — update, returns void
 *   - sp_branch_departments_delete — soft delete, returns void
 * ═══════════════════════════════════════════════════════════════
 */

const { supabase } = require('../config/database');
const logger = require('../config/logger');

class BranchManagementRepository {
  // ─────────────────────────────────────────────────────────────
  //  BRANCHES — READ
  // ─────────────────────────────────────────────────────────────

  async findBranchById(branchId) {
    const { data, error } = await supabase.rpc('udf_get_branches', {
      p_id: branchId,
      p_branch_is_active: null,
      p_city_is_active: null,
      p_state_is_active: null,
      p_country_is_active: null,
      p_sort_table: 'branch',
      p_sort_column: 'id',
      p_sort_direction: 'ASC',
      p_filter_country_id: null,
      p_filter_state_id: null,
      p_filter_city_id: null,
      p_filter_branch_type: null,
      p_filter_branch_is_active: null,
      p_filter_branch_is_deleted: false,
      p_search_term: null,
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'BranchManagementRepository.findBranchById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  async getBranches(options = {}) {
    const { data, error } = await supabase.rpc('udf_get_branches', {
      p_id: null,
      p_branch_is_active: null,
      p_city_is_active: null,
      p_state_is_active: null,
      p_country_is_active: null,
      p_sort_table: options.sortTable || 'branch',
      p_sort_column: options.sortColumn || 'id',
      p_sort_direction: options.sortDirection || 'ASC',
      p_filter_country_id: options.filterCountryId || null,
      p_filter_state_id: options.filterStateId || null,
      p_filter_city_id: options.filterCityId || null,
      p_filter_branch_type: options.filterBranchType || null,
      p_filter_branch_is_active: options.filterBranchIsActive !== undefined ? options.filterBranchIsActive : null,
      p_filter_branch_is_deleted: options.filterBranchIsDeleted !== undefined ? options.filterBranchIsDeleted : false,
      p_search_term: options.searchTerm || null,
      p_page_index: options.pageIndex || 1,
      p_page_size: options.pageSize || 20,
    });

    if (error) {
      logger.error({ error }, 'BranchManagementRepository.getBranches failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  BRANCHES — WRITE
  // ─────────────────────────────────────────────────────────────

  async createBranch(branchData) {
    const { data, error } = await supabase.rpc('sp_branches_insert', {
      p_country_id: branchData.countryId,
      p_state_id: branchData.stateId,
      p_city_id: branchData.cityId,
      p_name: branchData.name,
      p_code: branchData.code,
      p_branch_type: branchData.branchType || 'office',
      p_address_line_1: branchData.addressLine1 || null,
      p_address_line_2: branchData.addressLine2 || null,
      p_pincode: branchData.pincode || null,
      p_phone: branchData.phone || null,
      p_email: branchData.email || null,
      p_website: branchData.website || null,
      p_google_maps_url: branchData.googleMapsUrl || null,
      p_timezone: branchData.timezone || 'Asia/Kolkata',
      p_is_active: branchData.isActive !== undefined ? branchData.isActive : true,
    });

    if (error) {
      logger.error({ error }, 'BranchManagementRepository.createBranch failed');
      throw error;
    }

    const newId = data;
    return this.findBranchById(newId);
  }

  async updateBranch(branchId, updates) {
    const { error } = await supabase.rpc('sp_branches_update', {
      p_id: branchId,
      p_country_id: updates.countryId !== undefined ? updates.countryId : null,
      p_state_id: updates.stateId !== undefined ? updates.stateId : null,
      p_city_id: updates.cityId !== undefined ? updates.cityId : null,
      p_branch_manager_id: updates.branchManagerId !== undefined ? updates.branchManagerId : null,
      p_name: updates.name || null,
      p_code: updates.code || null,
      p_branch_type: updates.branchType || null,
      p_address_line_1: updates.addressLine1 !== undefined ? updates.addressLine1 : null,
      p_address_line_2: updates.addressLine2 !== undefined ? updates.addressLine2 : null,
      p_pincode: updates.pincode !== undefined ? updates.pincode : null,
      p_phone: updates.phone !== undefined ? updates.phone : null,
      p_email: updates.email !== undefined ? updates.email : null,
      p_website: updates.website !== undefined ? updates.website : null,
      p_google_maps_url: updates.googleMapsUrl !== undefined ? updates.googleMapsUrl : null,
      p_timezone: updates.timezone !== undefined ? updates.timezone : null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
    });

    if (error) {
      logger.error({ error }, 'BranchManagementRepository.updateBranch failed');
      throw error;
    }

    return this.findBranchById(branchId);
  }

  async deleteBranch(branchId) {
    const { error } = await supabase.rpc('sp_branches_delete', {
      p_id: branchId,
    });

    if (error) {
      logger.error({ error }, 'BranchManagementRepository.deleteBranch failed');
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  DEPARTMENTS — READ
  // ─────────────────────────────────────────────────────────────

  async findDepartmentById(departmentId) {
    const { data, error } = await supabase.rpc('udf_get_departments', {
      p_id: departmentId,
      p_department_is_active: null,
      p_sort_column: 'id',
      p_sort_direction: 'ASC',
      p_filter_parent_department_id: null,
      p_filter_top_level_only: null,
      p_filter_code: null,
      p_filter_department_is_active: null,
      p_filter_department_is_deleted: false,
      p_search_term: null,
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'BranchManagementRepository.findDepartmentById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  async getDepartments(options = {}) {
    const { data, error } = await supabase.rpc('udf_get_departments', {
      p_id: null,
      p_department_is_active: null,
      p_sort_column: options.sortColumn || 'id',
      p_sort_direction: options.sortDirection || 'ASC',
      p_filter_parent_department_id: options.filterParentDepartmentId || null,
      p_filter_top_level_only: options.filterTopLevelOnly !== undefined ? options.filterTopLevelOnly : null,
      p_filter_code: options.filterCode || null,
      p_filter_department_is_active: options.filterDepartmentIsActive !== undefined ? options.filterDepartmentIsActive : null,
      p_filter_department_is_deleted: options.filterDepartmentIsDeleted !== undefined ? options.filterDepartmentIsDeleted : false,
      p_search_term: options.searchTerm || null,
      p_page_index: options.pageIndex || 1,
      p_page_size: options.pageSize || 20,
    });

    if (error) {
      logger.error({ error }, 'BranchManagementRepository.getDepartments failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  DEPARTMENTS — WRITE
  // ─────────────────────────────────────────────────────────────

  async createDepartment(departmentData) {
    const { data, error } = await supabase.rpc('sp_departments_insert', {
      p_name: departmentData.name,
      p_code: departmentData.code,
      p_description: departmentData.description || null,
      p_parent_department_id: departmentData.parentDepartmentId || null,
      p_is_active: departmentData.isActive !== undefined ? departmentData.isActive : true,
    });

    if (error) {
      logger.error({ error }, 'BranchManagementRepository.createDepartment failed');
      throw error;
    }

    const newId = data;
    return this.findDepartmentById(newId);
  }

  async updateDepartment(departmentId, updates) {
    const { error } = await supabase.rpc('sp_departments_update', {
      p_id: departmentId,
      p_name: updates.name || null,
      p_code: updates.code || null,
      p_description: updates.description !== undefined ? updates.description : null,
      p_parent_department_id: updates.parentDepartmentId !== undefined ? updates.parentDepartmentId : null,
      p_head_user_id: updates.headUserId !== undefined ? updates.headUserId : null,
      p_updated_by: updates.updatedBy !== undefined ? updates.updatedBy : null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
    });

    if (error) {
      logger.error({ error }, 'BranchManagementRepository.updateDepartment failed');
      throw error;
    }

    return this.findDepartmentById(departmentId);
  }

  async deleteDepartment(departmentId) {
    const { error } = await supabase.rpc('sp_departments_delete', {
      p_id: departmentId,
    });

    if (error) {
      logger.error({ error }, 'BranchManagementRepository.deleteDepartment failed');
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  BRANCH DEPARTMENTS — READ
  // ─────────────────────────────────────────────────────────────

  async findBranchDepartmentById(branchDepartmentId) {
    const { data, error } = await supabase.rpc('udf_get_branch_departments', {
      p_id: branchDepartmentId,
      p_bd_is_active: null,
      p_sort_table: 'bd',
      p_sort_column: 'id',
      p_sort_direction: 'ASC',
      p_filter_branch_id: null,
      p_filter_department_id: null,
      p_filter_branch_type: null,
      p_filter_branch_name: null,
      p_filter_department_name: null,
      p_filter_bd_is_active: null,
      p_filter_bd_is_deleted: false,
      p_search_term: null,
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'BranchManagementRepository.findBranchDepartmentById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  async getBranchDepartments(options = {}) {
    const { data, error } = await supabase.rpc('udf_get_branch_departments', {
      p_id: null,
      p_bd_is_active: null,
      p_sort_table: options.sortTable || 'bd',
      p_sort_column: options.sortColumn || 'id',
      p_sort_direction: options.sortDirection || 'ASC',
      p_filter_branch_id: options.filterBranchId || null,
      p_filter_department_id: options.filterDepartmentId || null,
      p_filter_branch_type: options.filterBranchType || null,
      p_filter_branch_name: options.filterBranchName || null,
      p_filter_department_name: options.filterDepartmentName || null,
      p_filter_bd_is_active: options.filterBdIsActive !== undefined ? options.filterBdIsActive : null,
      p_filter_bd_is_deleted: options.filterBdIsDeleted !== undefined ? options.filterBdIsDeleted : false,
      p_search_term: options.searchTerm || null,
      p_page_index: options.pageIndex || 1,
      p_page_size: options.pageSize || 20,
    });

    if (error) {
      logger.error({ error }, 'BranchManagementRepository.getBranchDepartments failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  BRANCH DEPARTMENTS — WRITE
  // ─────────────────────────────────────────────────────────────

  async createBranchDepartment(branchDepartmentData) {
    const { data, error } = await supabase.rpc('sp_branch_departments_insert', {
      p_branch_id: branchDepartmentData.branchId,
      p_department_id: branchDepartmentData.departmentId,
      p_local_head_user_id: branchDepartmentData.localHeadUserId || null,
      p_employee_capacity: branchDepartmentData.employeeCapacity || null,
      p_floor_or_wing: branchDepartmentData.floorOrWing || null,
      p_extension_number: branchDepartmentData.extensionNumber || null,
      p_address_line_1: branchDepartmentData.addressLine1 || null,
      p_address_line_2: branchDepartmentData.addressLine2 || null,
      p_pincode: branchDepartmentData.pincode || null,
      p_country_id: branchDepartmentData.countryId || null,
      p_state_id: branchDepartmentData.stateId || null,
      p_city_id: branchDepartmentData.cityId || null,
      p_phone: branchDepartmentData.phone || null,
      p_google_maps_url: branchDepartmentData.googleMapsUrl || null,
      p_is_active: branchDepartmentData.isActive !== undefined ? branchDepartmentData.isActive : true,
    });

    if (error) {
      logger.error({ error }, 'BranchManagementRepository.createBranchDepartment failed');
      throw error;
    }

    const newId = data;
    return this.findBranchDepartmentById(newId);
  }

  async updateBranchDepartment(branchDepartmentId, updates) {
    const { error } = await supabase.rpc('sp_branch_departments_update', {
      p_id: branchDepartmentId,
      p_branch_id: updates.branchId !== undefined ? updates.branchId : null,
      p_department_id: updates.departmentId !== undefined ? updates.departmentId : null,
      p_local_head_user_id: updates.localHeadUserId !== undefined ? updates.localHeadUserId : null,
      p_employee_capacity: updates.employeeCapacity !== undefined ? updates.employeeCapacity : null,
      p_floor_or_wing: updates.floorOrWing !== undefined ? updates.floorOrWing : null,
      p_extension_number: updates.extensionNumber !== undefined ? updates.extensionNumber : null,
      p_address_line_1: updates.addressLine1 !== undefined ? updates.addressLine1 : null,
      p_address_line_2: updates.addressLine2 !== undefined ? updates.addressLine2 : null,
      p_pincode: updates.pincode !== undefined ? updates.pincode : null,
      p_country_id: updates.countryId !== undefined ? updates.countryId : null,
      p_state_id: updates.stateId !== undefined ? updates.stateId : null,
      p_city_id: updates.cityId !== undefined ? updates.cityId : null,
      p_phone: updates.phone !== undefined ? updates.phone : null,
      p_google_maps_url: updates.googleMapsUrl !== undefined ? updates.googleMapsUrl : null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
    });

    if (error) {
      logger.error({ error }, 'BranchManagementRepository.updateBranchDepartment failed');
      throw error;
    }

    return this.findBranchDepartmentById(branchDepartmentId);
  }

  async deleteBranchDepartment(branchDepartmentId) {
    const { error } = await supabase.rpc('sp_branch_departments_delete', {
      p_id: branchDepartmentId,
    });

    if (error) {
      logger.error({ error }, 'BranchManagementRepository.deleteBranchDepartment failed');
      throw error;
    }
  }
}

module.exports = new BranchManagementRepository();
