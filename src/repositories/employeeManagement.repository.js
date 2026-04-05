/**
 * ═══════════════════════════════════════════════════════════════
 * EMPLOYEE MANAGEMENT REPOSITORY — Database Layer (Supabase RPC)
 * ═══════════════════════════════════════════════════════════════
 * Handles Employee Profiles via:
 *
 *   EMPLOYEE PROFILES:
 *   - udf_get_employee_profiles         — read, search, filter, paginate
 *   - sp_employee_profiles_insert       — create, returns new id (BIGINT)
 *   - sp_employee_profiles_update       — update, returns void
 *   - sp_employee_profiles_delete       — soft delete, returns void
 * ═══════════════════════════════════════════════════════════════
 */

const { supabase } = require('../config/database');
const logger = require('../config/logger');

class EmployeeManagementRepository {
  // ─────────────────────────────────────────────────────────────
  //  EMPLOYEE PROFILES — READ
  // ─────────────────────────────────────────────────────────────

  async findEmployeeProfileById(employeeProfileId) {
    const { data, error } = await supabase.rpc('udf_get_employee_profiles', {
      p_id: employeeProfileId,
      p_user_id: null,
      p_is_active: null,
      p_sort_table: 'emp',
      p_sort_column: 'id',
      p_sort_direction: 'ASC',
      p_filter_employee_type: null,
      p_filter_work_mode: null,
      p_filter_shift_type: null,
      p_filter_pay_grade: null,
      p_filter_tax_regime: null,
      p_filter_exit_type: null,
      p_filter_payment_mode: null,
      p_filter_has_system_access: null,
      p_filter_has_vpn_access: null,
      p_filter_is_active: null,
      p_filter_is_deleted: false,
      p_filter_designation_id: null,
      p_filter_department_id: null,
      p_filter_branch_id: null,
      p_filter_reporting_manager_id: null,
      p_filter_user_role: null,
      p_filter_user_is_active: null,
      p_search_term: null,
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'EmployeeManagementRepository.findEmployeeProfileById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  async getEmployeeProfiles(options = {}) {
    const { data, error } = await supabase.rpc('udf_get_employee_profiles', {
      p_id: null,
      p_user_id: options.userId || null,
      p_is_active: null,
      p_sort_table: options.sortTable || 'emp',
      p_sort_column: options.sortColumn || 'id',
      p_sort_direction: options.sortDirection || 'ASC',
      p_filter_employee_type: options.filterEmployeeType || null,
      p_filter_work_mode: options.filterWorkMode || null,
      p_filter_shift_type: options.filterShiftType || null,
      p_filter_pay_grade: options.filterPayGrade || null,
      p_filter_tax_regime: options.filterTaxRegime || null,
      p_filter_exit_type: options.filterExitType || null,
      p_filter_payment_mode: options.filterPaymentMode || null,
      p_filter_has_system_access: options.filterHasSystemAccess !== undefined ? options.filterHasSystemAccess : null,
      p_filter_has_vpn_access: options.filterHasVpnAccess !== undefined ? options.filterHasVpnAccess : null,
      p_filter_is_active: options.filterIsActive !== undefined ? options.filterIsActive : null,
      p_filter_is_deleted: options.filterIsDeleted !== undefined ? options.filterIsDeleted : false,
      p_filter_designation_id: options.filterDesignationId || null,
      p_filter_department_id: options.filterDepartmentId || null,
      p_filter_branch_id: options.filterBranchId || null,
      p_filter_reporting_manager_id: options.filterReportingManagerId || null,
      p_filter_user_role: options.filterUserRole || null,
      p_filter_user_is_active: options.filterUserIsActive !== undefined ? options.filterUserIsActive : null,
      p_search_term: options.searchTerm || null,
      p_page_index: options.pageIndex || 1,
      p_page_size: options.pageSize || 20,
    });

    if (error) {
      logger.error({ error }, 'EmployeeManagementRepository.getEmployeeProfiles failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  EMPLOYEE PROFILES — WRITE
  // ─────────────────────────────────────────────────────────────

  async createEmployeeProfile(employeeData) {
    const { data, error } = await supabase.rpc('sp_employee_profiles_insert', {
      p_user_id: employeeData.userId,
      p_employee_code: employeeData.employeeCode,
      p_designation_id: employeeData.designationId,
      p_department_id: employeeData.departmentId,
      p_branch_id: employeeData.branchId,
      p_joining_date: employeeData.joiningDate,
      p_employee_type: employeeData.employeeType || 'full_time',
      p_reporting_manager_id: employeeData.reportingManagerId || null,
      p_confirmation_date: employeeData.confirmationDate || null,
      p_probation_end_date: employeeData.probationEndDate || null,
      p_contract_end_date: employeeData.contractEndDate || null,
      p_work_mode: employeeData.workMode || 'on_site',
      p_shift_type: employeeData.shiftType || 'general',
      p_shift_branch_id: employeeData.shiftBranchId || null,
      p_work_location: employeeData.workLocation || null,
      p_weekly_off_days: employeeData.weeklyOffDays || 'saturday,sunday',
      p_pay_grade: employeeData.payGrade || null,
      p_salary_currency: employeeData.salaryCurrency || 'INR',
      p_ctc_annual: employeeData.ctcAnnual || null,
      p_basic_salary_monthly: employeeData.basicSalaryMonthly || null,
      p_payment_mode: employeeData.paymentMode || 'bank_transfer',
      p_pf_number: employeeData.pfNumber || null,
      p_esi_number: employeeData.esiNumber || null,
      p_uan_number: employeeData.uanNumber || null,
      p_professional_tax_number: employeeData.professionalTaxNumber || null,
      p_tax_regime: employeeData.taxRegime || 'new',
      p_leave_balance_casual: employeeData.leaveBalanceCasual || 0,
      p_leave_balance_sick: employeeData.leaveBalanceSick || 0,
      p_leave_balance_earned: employeeData.leaveBalanceEarned || 0,
      p_leave_balance_compensatory: employeeData.leaveBalanceCompensatory || 0,
      p_total_experience_years: employeeData.totalExperienceYears || null,
      p_experience_at_joining: employeeData.experienceAtJoining || null,
      p_has_system_access: employeeData.hasSystemAccess !== undefined ? employeeData.hasSystemAccess : true,
      p_has_email_access: employeeData.hasEmailAccess !== undefined ? employeeData.hasEmailAccess : true,
      p_has_vpn_access: employeeData.hasVpnAccess !== undefined ? employeeData.hasVpnAccess : false,
      p_access_card_number: employeeData.accessCardNumber || null,
      p_laptop_asset_id: employeeData.laptopAssetId || null,
      p_notice_period_days: employeeData.noticePeriodDays || 30,
      p_is_active: employeeData.isActive !== undefined ? employeeData.isActive : true,
    });

    if (error) {
      logger.error({ error }, 'EmployeeManagementRepository.createEmployeeProfile failed');
      throw error;
    }

    const newId = data;
    return this.findEmployeeProfileById(newId);
  }

  async updateEmployeeProfile(employeeProfileId, updates) {
    const { error } = await supabase.rpc('sp_employee_profiles_update', {
      p_id: employeeProfileId,
      p_employee_code: updates.employeeCode || null,
      p_employee_type: updates.employeeType || null,
      p_designation_id: updates.designationId !== undefined ? updates.designationId : null,
      p_department_id: updates.departmentId !== undefined ? updates.departmentId : null,
      p_branch_id: updates.branchId !== undefined ? updates.branchId : null,
      p_reporting_manager_id: updates.reportingManagerId !== undefined ? updates.reportingManagerId : null,
      p_joining_date: updates.joiningDate || null,
      p_confirmation_date: updates.confirmationDate !== undefined ? updates.confirmationDate : null,
      p_probation_end_date: updates.probationEndDate !== undefined ? updates.probationEndDate : null,
      p_contract_end_date: updates.contractEndDate !== undefined ? updates.contractEndDate : null,
      p_resignation_date: updates.resignationDate !== undefined ? updates.resignationDate : null,
      p_last_working_date: updates.lastWorkingDate !== undefined ? updates.lastWorkingDate : null,
      p_relieving_date: updates.relievingDate !== undefined ? updates.relievingDate : null,
      p_work_mode: updates.workMode || null,
      p_shift_type: updates.shiftType || null,
      p_shift_branch_id: updates.shiftBranchId !== undefined ? updates.shiftBranchId : null,
      p_work_location: updates.workLocation !== undefined ? updates.workLocation : null,
      p_weekly_off_days: updates.weeklyOffDays !== undefined ? updates.weeklyOffDays : null,
      p_pay_grade: updates.payGrade !== undefined ? updates.payGrade : null,
      p_salary_currency: updates.salaryCurrency !== undefined ? updates.salaryCurrency : null,
      p_ctc_annual: updates.ctcAnnual !== undefined ? updates.ctcAnnual : null,
      p_basic_salary_monthly: updates.basicSalaryMonthly !== undefined ? updates.basicSalaryMonthly : null,
      p_payment_mode: updates.paymentMode !== undefined ? updates.paymentMode : null,
      p_pf_number: updates.pfNumber !== undefined ? updates.pfNumber : null,
      p_esi_number: updates.esiNumber !== undefined ? updates.esiNumber : null,
      p_uan_number: updates.uanNumber !== undefined ? updates.uanNumber : null,
      p_professional_tax_number: updates.professionalTaxNumber !== undefined ? updates.professionalTaxNumber : null,
      p_tax_regime: updates.taxRegime !== undefined ? updates.taxRegime : null,
      p_leave_balance_casual: updates.leaveBalanceCasual !== undefined ? updates.leaveBalanceCasual : null,
      p_leave_balance_sick: updates.leaveBalanceSick !== undefined ? updates.leaveBalanceSick : null,
      p_leave_balance_earned: updates.leaveBalanceEarned !== undefined ? updates.leaveBalanceEarned : null,
      p_leave_balance_compensatory: updates.leaveBalanceCompensatory !== undefined ? updates.leaveBalanceCompensatory : null,
      p_total_experience_years: updates.totalExperienceYears !== undefined ? updates.totalExperienceYears : null,
      p_experience_at_joining: updates.experienceAtJoining !== undefined ? updates.experienceAtJoining : null,
      p_has_system_access: updates.hasSystemAccess !== undefined ? updates.hasSystemAccess : null,
      p_has_email_access: updates.hasEmailAccess !== undefined ? updates.hasEmailAccess : null,
      p_has_vpn_access: updates.hasVpnAccess !== undefined ? updates.hasVpnAccess : null,
      p_access_card_number: updates.accessCardNumber !== undefined ? updates.accessCardNumber : null,
      p_laptop_asset_id: updates.laptopAssetId !== undefined ? updates.laptopAssetId : null,
      p_exit_type: updates.exitType !== undefined ? updates.exitType : null,
      p_exit_reason: updates.exitReason !== undefined ? updates.exitReason : null,
      p_exit_interview_done: updates.exitInterviewDone !== undefined ? updates.exitInterviewDone : null,
      p_full_and_final_done: updates.fullAndFinalDone !== undefined ? updates.fullAndFinalDone : null,
      p_notice_period_days: updates.noticePeriodDays !== undefined ? updates.noticePeriodDays : null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
    });

    if (error) {
      logger.error({ error }, 'EmployeeManagementRepository.updateEmployeeProfile failed');
      throw error;
    }

    return this.findEmployeeProfileById(employeeProfileId);
  }

  async deleteEmployeeProfile(employeeProfileId) {
    const { error } = await supabase.rpc('sp_employee_profiles_delete', {
      p_id: employeeProfileId,
    });

    if (error) {
      logger.error({ error }, 'EmployeeManagementRepository.deleteEmployeeProfile failed');
      throw error;
    }
  }
}

module.exports = new EmployeeManagementRepository();
