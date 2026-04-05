/**
 * ═══════════════════════════════════════════════════════════════
 * STUDENT MANAGEMENT REPOSITORY — Database Layer (Supabase RPC)
 * ═══════════════════════════════════════════════════════════════
 * Handles Student Profiles via:
 *
 *   STUDENT PROFILES:
 *   - udf_get_student_profiles   — read, search, filter, paginate
 *   - sp_student_profiles_insert — create, returns new id (BIGINT)
 *   - sp_student_profiles_update — update, returns void
 *   - sp_student_profiles_delete — soft delete, returns void
 * ═══════════════════════════════════════════════════════════════
 */

const { supabase } = require('../config/database');
const logger = require('../config/logger');

class StudentManagementRepository {
  // ─────────────────────────────────────────────────────────────
  //  STUDENT PROFILES — READ
  // ─────────────────────────────────────────────────────────────

  async findStudentProfileById(studentProfileId) {
    const { data, error } = await supabase.rpc('udf_get_student_profiles', {
      p_id: studentProfileId,
      p_user_id: null,
      p_is_active: null,
      p_sort_table: 'stu',
      p_sort_column: 'id',
      p_sort_direction: 'ASC',
      p_filter_enrollment_type: null,
      p_filter_preferred_learning_mode: null,
      p_filter_preferred_content_type: null,
      p_filter_difficulty_preference: null,
      p_filter_subscription_plan: null,
      p_filter_has_active_subscription: null,
      p_filter_is_currently_studying: null,
      p_filter_is_seeking_job: null,
      p_filter_is_open_to_internship: null,
      p_filter_is_open_to_freelance: null,
      p_filter_is_active: null,
      p_filter_is_deleted: false,
      p_filter_education_level_id: null,
      p_filter_learning_goal_id: null,
      p_filter_specialization_id: null,
      p_filter_preferred_learning_language_id: null,
      p_filter_user_role: null,
      p_filter_user_is_active: null,
      p_search_term: null,
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'StudentManagementRepository.findStudentProfileById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  async getStudentProfiles(options = {}) {
    const { data, error } = await supabase.rpc('udf_get_student_profiles', {
      p_id: null,
      p_user_id: options.filterUserId || null,
      p_is_active: null,
      p_sort_table: options.sortTable || 'stu',
      p_sort_column: options.sortColumn || 'id',
      p_sort_direction: options.sortDirection || 'ASC',
      p_filter_enrollment_type: options.filterEnrollmentType || null,
      p_filter_preferred_learning_mode: options.filterPreferredLearningMode || null,
      p_filter_preferred_content_type: options.filterPreferredContentType || null,
      p_filter_difficulty_preference: options.filterDifficultyPreference || null,
      p_filter_subscription_plan: options.filterSubscriptionPlan || null,
      p_filter_has_active_subscription: options.filterHasActiveSubscription !== undefined ? options.filterHasActiveSubscription : null,
      p_filter_is_currently_studying: options.filterIsCurrentlyStudying !== undefined ? options.filterIsCurrentlyStudying : null,
      p_filter_is_seeking_job: options.filterIsSeekingJob !== undefined ? options.filterIsSeekingJob : null,
      p_filter_is_open_to_internship: options.filterIsOpenToInternship !== undefined ? options.filterIsOpenToInternship : null,
      p_filter_is_open_to_freelance: options.filterIsOpenToFreelance !== undefined ? options.filterIsOpenToFreelance : null,
      p_filter_is_active: options.filterIsActive !== undefined ? options.filterIsActive : null,
      p_filter_is_deleted: options.filterIsDeleted !== undefined ? options.filterIsDeleted : false,
      p_filter_education_level_id: options.filterEducationLevelId || null,
      p_filter_learning_goal_id: options.filterLearningGoalId || null,
      p_filter_specialization_id: options.filterSpecializationId || null,
      p_filter_preferred_learning_language_id: options.filterPreferredLearningLanguageId || null,
      p_filter_user_role: options.filterUserRole || null,
      p_filter_user_is_active: options.filterUserIsActive !== undefined ? options.filterUserIsActive : null,
      p_search_term: options.searchTerm || null,
      p_page_index: options.pageIndex || 1,
      p_page_size: options.pageSize || 20,
    });

    if (error) {
      logger.error({ error }, 'StudentManagementRepository.getStudentProfiles failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  STUDENT PROFILES — WRITE
  // ─────────────────────────────────────────────────────────────

  async createStudentProfile(studentProfileData) {
    const { data, error } = await supabase.rpc('sp_student_profiles_insert', {
      p_user_id: studentProfileData.userId,
      p_enrollment_number: studentProfileData.enrollmentNumber,
      p_enrollment_date: studentProfileData.enrollmentDate || null,
      p_enrollment_type: studentProfileData.enrollmentType || 'self',
      p_education_level_id: studentProfileData.educationLevelId || null,
      p_current_institution: studentProfileData.currentInstitution || null,
      p_current_field_of_study: studentProfileData.currentFieldOfStudy || null,
      p_current_semester_or_year: studentProfileData.currentSemesterOrYear || null,
      p_expected_graduation_date: studentProfileData.expectedGraduationDate || null,
      p_is_currently_studying: studentProfileData.isCurrentlyStudying !== undefined ? studentProfileData.isCurrentlyStudying : false,
      p_learning_goal_id: studentProfileData.learningGoalId || null,
      p_specialization_id: studentProfileData.specializationId || null,
      p_preferred_learning_mode: studentProfileData.preferredLearningMode || 'self_paced',
      p_preferred_learning_language_id: studentProfileData.preferredLearningLanguageId || null,
      p_preferred_content_type: studentProfileData.preferredContentType || 'video',
      p_daily_learning_hours: studentProfileData.dailyLearningHours || null,
      p_weekly_available_days: studentProfileData.weeklyAvailableDays || 5,
      p_difficulty_preference: studentProfileData.difficultyPreference || 'intermediate',
      p_parent_guardian_name: studentProfileData.parentGuardianName || null,
      p_parent_guardian_phone: studentProfileData.parentGuardianPhone || null,
      p_parent_guardian_email: studentProfileData.parentGuardianEmail || null,
      p_parent_guardian_relation: studentProfileData.parentGuardianRelation || null,
      p_subscription_plan: studentProfileData.subscriptionPlan || 'free',
      p_referred_by_user_id: studentProfileData.referredByUserId || null,
      p_referral_code: studentProfileData.referralCode || null,
      p_is_seeking_job: studentProfileData.isSeekingJob !== undefined ? studentProfileData.isSeekingJob : false,
      p_preferred_job_roles: studentProfileData.preferredJobRoles || null,
      p_preferred_locations: studentProfileData.preferredLocations || null,
      p_expected_salary_range: studentProfileData.expectedSalaryRange || null,
      p_resume_url: studentProfileData.resumeUrl || null,
      p_portfolio_url: studentProfileData.portfolioUrl || null,
      p_is_open_to_internship: studentProfileData.isOpenToInternship !== undefined ? studentProfileData.isOpenToInternship : false,
      p_is_open_to_freelance: studentProfileData.isOpenToFreelance !== undefined ? studentProfileData.isOpenToFreelance : false,
      p_is_active: studentProfileData.isActive !== undefined ? studentProfileData.isActive : true,
    });

    if (error) {
      logger.error({ error }, 'StudentManagementRepository.createStudentProfile failed');
      throw error;
    }

    const newId = data;
    return this.findStudentProfileById(newId);
  }

  async updateStudentProfile(studentProfileId, updates) {
    const { error } = await supabase.rpc('sp_student_profiles_update', {
      p_id: studentProfileId,
      p_enrollment_number: updates.enrollmentNumber || null,
      p_enrollment_date: updates.enrollmentDate !== undefined ? updates.enrollmentDate : null,
      p_enrollment_type: updates.enrollmentType || null,
      p_education_level_id: updates.educationLevelId !== undefined ? updates.educationLevelId : null,
      p_current_institution: updates.currentInstitution !== undefined ? updates.currentInstitution : null,
      p_current_field_of_study: updates.currentFieldOfStudy !== undefined ? updates.currentFieldOfStudy : null,
      p_current_semester_or_year: updates.currentSemesterOrYear !== undefined ? updates.currentSemesterOrYear : null,
      p_expected_graduation_date: updates.expectedGraduationDate !== undefined ? updates.expectedGraduationDate : null,
      p_is_currently_studying: updates.isCurrentlyStudying !== undefined ? updates.isCurrentlyStudying : null,
      p_learning_goal_id: updates.learningGoalId !== undefined ? updates.learningGoalId : null,
      p_specialization_id: updates.specializationId !== undefined ? updates.specializationId : null,
      p_preferred_learning_mode: updates.preferredLearningMode || null,
      p_preferred_learning_language_id: updates.preferredLearningLanguageId !== undefined ? updates.preferredLearningLanguageId : null,
      p_preferred_content_type: updates.preferredContentType || null,
      p_daily_learning_hours: updates.dailyLearningHours !== undefined ? updates.dailyLearningHours : null,
      p_weekly_available_days: updates.weeklyAvailableDays !== undefined ? updates.weeklyAvailableDays : null,
      p_difficulty_preference: updates.difficultyPreference || null,
      p_parent_guardian_name: updates.parentGuardianName !== undefined ? updates.parentGuardianName : null,
      p_parent_guardian_phone: updates.parentGuardianPhone !== undefined ? updates.parentGuardianPhone : null,
      p_parent_guardian_email: updates.parentGuardianEmail !== undefined ? updates.parentGuardianEmail : null,
      p_parent_guardian_relation: updates.parentGuardianRelation !== undefined ? updates.parentGuardianRelation : null,
      p_courses_enrolled: updates.coursesEnrolled !== undefined ? updates.coursesEnrolled : null,
      p_courses_completed: updates.coursesCompleted !== undefined ? updates.coursesCompleted : null,
      p_courses_in_progress: updates.coursesInProgress !== undefined ? updates.coursesInProgress : null,
      p_certificates_earned: updates.certificatesEarned !== undefined ? updates.certificatesEarned : null,
      p_total_learning_hours: updates.totalLearningHours !== undefined ? updates.totalLearningHours : null,
      p_average_score: updates.averageScore !== undefined ? updates.averageScore : null,
      p_current_streak_days: updates.currentStreakDays !== undefined ? updates.currentStreakDays : null,
      p_longest_streak_days: updates.longestStreakDays !== undefined ? updates.longestStreakDays : null,
      p_xp_points: updates.xpPoints !== undefined ? updates.xpPoints : null,
      p_level: updates.level !== undefined ? updates.level : null,
      p_subscription_plan: updates.subscriptionPlan || null,
      p_subscription_start_date: updates.subscriptionStartDate !== undefined ? updates.subscriptionStartDate : null,
      p_subscription_end_date: updates.subscriptionEndDate !== undefined ? updates.subscriptionEndDate : null,
      p_total_amount_paid: updates.totalAmountPaid !== undefined ? updates.totalAmountPaid : null,
      p_has_active_subscription: updates.hasActiveSubscription !== undefined ? updates.hasActiveSubscription : null,
      p_referred_by_user_id: updates.referredByUserId !== undefined ? updates.referredByUserId : null,
      p_referral_code: updates.referralCode !== undefined ? updates.referralCode : null,
      p_is_seeking_job: updates.isSeekingJob !== undefined ? updates.isSeekingJob : null,
      p_preferred_job_roles: updates.preferredJobRoles !== undefined ? updates.preferredJobRoles : null,
      p_preferred_locations: updates.preferredLocations !== undefined ? updates.preferredLocations : null,
      p_expected_salary_range: updates.expectedSalaryRange !== undefined ? updates.expectedSalaryRange : null,
      p_resume_url: updates.resumeUrl !== undefined ? updates.resumeUrl : null,
      p_portfolio_url: updates.portfolioUrl !== undefined ? updates.portfolioUrl : null,
      p_is_open_to_internship: updates.isOpenToInternship !== undefined ? updates.isOpenToInternship : null,
      p_is_open_to_freelance: updates.isOpenToFreelance !== undefined ? updates.isOpenToFreelance : null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
    });

    if (error) {
      logger.error({ error }, 'StudentManagementRepository.updateStudentProfile failed');
      throw error;
    }

    return this.findStudentProfileById(studentProfileId);
  }

  async deleteStudentProfile(studentProfileId) {
    const { error } = await supabase.rpc('sp_student_profiles_delete', {
      p_id: studentProfileId,
    });

    if (error) {
      logger.error({ error }, 'StudentManagementRepository.deleteStudentProfile failed');
      throw error;
    }
  }

  async restoreStudentProfile(id) {
    const { error } = await supabase.rpc('sp_student_profiles_restore', { p_id: id });
    if (error) {
      logger.error({ error }, 'StudentManagementRepository.restoreStudentProfile failed');
      throw error;
    }
  }
}

module.exports = new StudentManagementRepository();
