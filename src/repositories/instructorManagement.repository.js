/**
 * ═══════════════════════════════════════════════════════════════
 * INSTRUCTOR MANAGEMENT REPOSITORY — Database Layer (Supabase RPC)
 * ═══════════════════════════════════════════════════════════════
 * Handles Instructor Profiles via:
 *
 *   INSTRUCTOR PROFILES:
 *   - udf_get_instructor_profiles    — read, search, filter, paginate
 *   - sp_instructor_profiles_insert   — create, returns new id (BIGINT)
 *   - sp_instructor_profiles_update   — update, returns void
 *   - sp_instructor_profiles_delete   — soft delete, returns void
 * ═══════════════════════════════════════════════════════════════
 */

const { supabase } = require('../config/database');
const logger = require('../config/logger');

class InstructorManagementRepository {
  // ─────────────────────────────────────────────────────────────
  //  INSTRUCTOR PROFILES — READ
  // ─────────────────────────────────────────────────────────────

  async findInstructorProfileById(instructorId) {
    const { data, error } = await supabase.rpc('udf_get_instructor_profiles', {
      p_id: instructorId,
      p_user_id: null,
      p_is_active: null,
      p_sort_table: 'inst',
      p_sort_column: 'id',
      p_sort_direction: 'ASC',
      p_filter_instructor_type: null,
      p_filter_teaching_mode: null,
      p_filter_approval_status: null,
      p_filter_payment_model: null,
      p_filter_badge: null,
      p_filter_is_available: null,
      p_filter_is_verified: null,
      p_filter_is_featured: null,
      p_filter_is_active: null,
      p_filter_is_deleted: false,
      p_filter_specialization_id: null,
      p_filter_secondary_specialization_id: null,
      p_filter_designation_id: null,
      p_filter_department_id: null,
      p_filter_branch_id: null,
      p_filter_user_role: null,
      p_filter_user_is_active: null,
      p_search_term: null,
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'InstructorManagementRepository.findInstructorProfileById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  async getInstructorProfiles(options = {}) {
    const { data, error } = await supabase.rpc('udf_get_instructor_profiles', {
      p_id: null,
      p_user_id: options.filterUserId || null,
      p_is_active: null,
      p_sort_table: options.sortTable || 'inst',
      p_sort_column: options.sortColumn || 'id',
      p_sort_direction: options.sortDirection || 'ASC',
      p_filter_instructor_type: options.filterInstructorType || null,
      p_filter_teaching_mode: options.filterTeachingMode || null,
      p_filter_approval_status: options.filterApprovalStatus || null,
      p_filter_payment_model: options.filterPaymentModel || null,
      p_filter_badge: options.filterBadge || null,
      p_filter_is_available: options.filterIsAvailable !== undefined ? options.filterIsAvailable : null,
      p_filter_is_verified: options.filterIsVerified !== undefined ? options.filterIsVerified : null,
      p_filter_is_featured: options.filterIsFeatured !== undefined ? options.filterIsFeatured : null,
      p_filter_is_active: options.filterIsActive !== undefined ? options.filterIsActive : null,
      p_filter_is_deleted: options.filterIsDeleted !== undefined ? options.filterIsDeleted : false,
      p_filter_specialization_id: options.filterSpecializationId || null,
      p_filter_secondary_specialization_id: options.filterSecondarySpecializationId || null,
      p_filter_designation_id: options.filterDesignationId || null,
      p_filter_department_id: options.filterDepartmentId || null,
      p_filter_branch_id: options.filterBranchId || null,
      p_filter_user_role: options.filterUserRole || null,
      p_filter_user_is_active: options.filterUserIsActive !== undefined ? options.filterUserIsActive : null,
      p_search_term: options.searchTerm || null,
      p_page_index: options.pageIndex || 1,
      p_page_size: options.pageSize || 20,
    });

    if (error) {
      logger.error({ error }, 'InstructorManagementRepository.getInstructorProfiles failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  INSTRUCTOR PROFILES — WRITE
  // ─────────────────────────────────────────────────────────────

  async createInstructorProfile(instructorData) {
    const { data, error } = await supabase.rpc('sp_instructor_profiles_insert', {
      p_user_id: instructorData.userId,
      p_instructor_code: instructorData.instructorCode,
      p_instructor_type: instructorData.instructorType || 'external',
      p_designation_id: instructorData.designationId || null,
      p_department_id: instructorData.departmentId || null,
      p_branch_id: instructorData.branchId || null,
      p_joining_date: instructorData.joiningDate || null,
      p_specialization_id: instructorData.specializationId || null,
      p_secondary_specialization_id: instructorData.secondarySpecializationId || null,
      p_teaching_experience_years: instructorData.teachingExperienceYears || null,
      p_industry_experience_years: instructorData.industryExperienceYears || null,
      p_total_experience_years: instructorData.totalExperienceYears || null,
      p_preferred_teaching_language_id: instructorData.preferredTeachingLanguageId || null,
      p_teaching_mode: instructorData.teachingMode || 'online',
      p_instructor_bio: instructorData.instructorBio || null,
      p_tagline: instructorData.tagline || null,
      p_demo_video_url: instructorData.demoVideoUrl || null,
      p_intro_video_duration_sec: instructorData.introVideoDurationSec || null,
      p_highest_qualification: instructorData.highestQualification || null,
      p_certifications_summary: instructorData.certificationsSummary || null,
      p_awards_and_recognition: instructorData.awardsAndRecognition || null,
      p_is_available: instructorData.isAvailable !== undefined ? instructorData.isAvailable : true,
      p_available_hours_per_week: instructorData.availableHoursPerWeek || null,
      p_available_from: instructorData.availableFrom || null,
      p_available_until: instructorData.availableUntil || null,
      p_preferred_time_slots: instructorData.preferredTimeSlots || null,
      p_max_concurrent_courses: instructorData.maxConcurrentCourses || 3,
      p_payment_model: instructorData.paymentModel || 'revenue_share',
      p_revenue_share_percentage: instructorData.revenueSharePercentage || null,
      p_fixed_rate_per_course: instructorData.fixedRatePerCourse || null,
      p_hourly_rate: instructorData.hourlyRate || null,
      p_payment_currency: instructorData.paymentCurrency || 'INR',
      p_is_active: instructorData.isActive !== undefined ? instructorData.isActive : true,
    });

    if (error) {
      logger.error({ error }, 'InstructorManagementRepository.createInstructorProfile failed');
      throw error;
    }

    const newId = data;
    return this.findInstructorProfileById(newId);
  }

  async updateInstructorProfile(instructorId, updates) {
    const { error } = await supabase.rpc('sp_instructor_profiles_update', {
      p_id: instructorId,
      p_instructor_code: updates.instructorCode || null,
      p_instructor_type: updates.instructorType || null,
      p_designation_id: updates.designationId !== undefined ? updates.designationId : null,
      p_department_id: updates.departmentId !== undefined ? updates.departmentId : null,
      p_branch_id: updates.branchId !== undefined ? updates.branchId : null,
      p_joining_date: updates.joiningDate !== undefined ? updates.joiningDate : null,
      p_specialization_id: updates.specializationId !== undefined ? updates.specializationId : null,
      p_secondary_specialization_id: updates.secondarySpecializationId !== undefined ? updates.secondarySpecializationId : null,
      p_teaching_experience_years: updates.teachingExperienceYears !== undefined ? updates.teachingExperienceYears : null,
      p_industry_experience_years: updates.industryExperienceYears !== undefined ? updates.industryExperienceYears : null,
      p_total_experience_years: updates.totalExperienceYears !== undefined ? updates.totalExperienceYears : null,
      p_preferred_teaching_language_id: updates.preferredTeachingLanguageId !== undefined ? updates.preferredTeachingLanguageId : null,
      p_teaching_mode: updates.teachingMode || null,
      p_instructor_bio: updates.instructorBio !== undefined ? updates.instructorBio : null,
      p_tagline: updates.tagline !== undefined ? updates.tagline : null,
      p_demo_video_url: updates.demoVideoUrl !== undefined ? updates.demoVideoUrl : null,
      p_intro_video_duration_sec: updates.introVideoDurationSec !== undefined ? updates.introVideoDurationSec : null,
      p_highest_qualification: updates.highestQualification !== undefined ? updates.highestQualification : null,
      p_certifications_summary: updates.certificationsSummary !== undefined ? updates.certificationsSummary : null,
      p_awards_and_recognition: updates.awardsAndRecognition !== undefined ? updates.awardsAndRecognition : null,
      p_publications_count: updates.publicationsCount !== undefined ? updates.publicationsCount : null,
      p_patents_count: updates.patentsCount !== undefined ? updates.patentsCount : null,
      p_total_courses_created: updates.totalCoursesCreated !== undefined ? updates.totalCoursesCreated : null,
      p_total_courses_published: updates.totalCoursesPublished !== undefined ? updates.totalCoursesPublished : null,
      p_total_students_taught: updates.totalStudentsTaught !== undefined ? updates.totalStudentsTaught : null,
      p_total_reviews_received: updates.totalReviewsReceived !== undefined ? updates.totalReviewsReceived : null,
      p_average_rating: updates.averageRating !== undefined ? updates.averageRating : null,
      p_total_teaching_hours: updates.totalTeachingHours !== undefined ? updates.totalTeachingHours : null,
      p_total_content_minutes: updates.totalContentMinutes !== undefined ? updates.totalContentMinutes : null,
      p_completion_rate: updates.completionRate !== undefined ? updates.completionRate : null,
      p_is_available: updates.isAvailable !== undefined ? updates.isAvailable : null,
      p_available_hours_per_week: updates.availableHoursPerWeek !== undefined ? updates.availableHoursPerWeek : null,
      p_available_from: updates.availableFrom !== undefined ? updates.availableFrom : null,
      p_available_until: updates.availableUntil !== undefined ? updates.availableUntil : null,
      p_preferred_time_slots: updates.preferredTimeSlots !== undefined ? updates.preferredTimeSlots : null,
      p_max_concurrent_courses: updates.maxConcurrentCourses !== undefined ? updates.maxConcurrentCourses : null,
      p_payment_model: updates.paymentModel || null,
      p_revenue_share_percentage: updates.revenueSharePercentage !== undefined ? updates.revenueSharePercentage : null,
      p_fixed_rate_per_course: updates.fixedRatePerCourse !== undefined ? updates.fixedRatePerCourse : null,
      p_hourly_rate: updates.hourlyRate !== undefined ? updates.hourlyRate : null,
      p_payment_currency: updates.paymentCurrency !== undefined ? updates.paymentCurrency : null,
      p_approval_status: updates.approvalStatus || null,
      p_approved_by: updates.approvedBy !== undefined ? updates.approvedBy : null,
      p_approved_at: updates.approvedAt !== undefined ? updates.approvedAt : null,
      p_rejection_reason: updates.rejectionReason !== undefined ? updates.rejectionReason : null,
      p_is_verified: updates.isVerified !== undefined ? updates.isVerified : null,
      p_is_featured: updates.isFeatured !== undefined ? updates.isFeatured : null,
      p_badge: updates.badge !== undefined ? updates.badge : null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
    });

    if (error) {
      logger.error({ error }, 'InstructorManagementRepository.updateInstructorProfile failed');
      throw error;
    }

    return this.findInstructorProfileById(instructorId);
  }

  async deleteInstructorProfile(instructorId) {
    const { error } = await supabase.rpc('sp_instructor_profiles_delete', {
      p_id: instructorId,
    });

    if (error) {
      logger.error({ error }, 'InstructorManagementRepository.deleteInstructorProfile failed');
      throw error;
    }
  }
}

module.exports = new InstructorManagementRepository();
