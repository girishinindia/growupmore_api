const { supabase } = require('../config/database');
const logger = require('../config/logger');

class EnrollmentManagementRepository {
  // ENROLLMENTS
  async getEnrollments({
    filterStudentId = null,
    filterCourseId = null,
    filterStatus = null,
    filterSourceType = null,
    filterBundleId = null,
    filterBatchId = null,
    filterOrderId = null,
    filterIsActive = null,
    filterIsDeleted = false,
    searchTerm = null,
    sortColumn = 'enrolled_at',
    sortDirection = 'DESC',
    pageIndex = 1,
    pageSize = 20,
  }) {
    const { data, error } = await supabase.rpc('udf_get_enrollments', {
      p_filter_student_id: filterStudentId,
      p_filter_course_id: filterCourseId,
      p_filter_status: filterStatus,
      p_filter_source_type: filterSourceType,
      p_filter_bundle_id: filterBundleId,
      p_filter_batch_id: filterBatchId,
      p_filter_order_id: filterOrderId,
      p_filter_is_active: filterIsActive,
      p_filter_is_deleted: filterIsDeleted,
      p_search_term: searchTerm,
      p_sort_column: sortColumn,
      p_sort_direction: sortDirection,
      p_page_index: pageIndex,
      p_page_size: pageSize,
    });

    if (error) throw error;
    return data;
  }

  async createEnrollment(
    studentId,
    courseId,
    sourceType = 'direct',
    bundleId = null,
    batchId = null,
    orderId = null,
    orderItemId = null,
    enrollmentStatus = 'active',
    enrolledAt = null,
    expiresAt = null,
    accessStartsAt = null,
    accessEndsAt = null,
    createdBy = null
  ) {
    const { data, error } = await supabase.rpc('sp_enrollments_insert', {
      p_student_id: studentId,
      p_course_id: courseId,
      p_source_type: sourceType,
      p_bundle_id: bundleId,
      p_batch_id: batchId,
      p_order_id: orderId,
      p_order_item_id: orderItemId,
      p_enrollment_status: enrollmentStatus,
      p_enrolled_at: enrolledAt,
      p_expires_at: expiresAt,
      p_access_starts_at: accessStartsAt,
      p_access_ends_at: accessEndsAt,
      p_created_by: createdBy,
    });

    if (error) throw error;
    return data;
  }

  async updateEnrollment(
    id,
    enrollmentStatus = null,
    expiresAt = null,
    accessStartsAt = null,
    accessEndsAt = null,
    updatedBy = null
  ) {
    const { error } = await supabase.rpc('sp_enrollments_update', {
      p_id: id,
      p_enrollment_status: enrollmentStatus,
      p_expires_at: expiresAt,
      p_access_starts_at: accessStartsAt,
      p_access_ends_at: accessEndsAt,
      p_updated_by: updatedBy,
    });

    if (error) throw error;
  }

  async deleteEnrollment(id) {
    const { error } = await supabase.rpc('sp_enrollments_delete_single', {
      p_id: id,
    });

    if (error) throw error;
  }

  async bulkDeleteEnrollments(ids) {
    const { error } = await supabase.rpc('sp_enrollments_delete', {
      p_ids: ids,
    });

    if (error) throw error;
  }

  async restoreEnrollment(id) {
    const { error } = await supabase.rpc('sp_enrollments_restore_single', {
      p_id: id,
    });

    if (error) throw error;
  }

  async bulkRestoreEnrollments(ids) {
    const { error } = await supabase.rpc('sp_enrollments_restore', {
      p_ids: ids,
    });

    if (error) throw error;
  }

  // BATCH ENROLLMENTS
  async getBatchEnrollments({
    filterStudentId = null,
    filterBatchId = null,
    filterStatus = null,
    filterOrderId = null,
    filterIsActive = null,
    filterIsDeleted = false,
    searchTerm = null,
    sortColumn = 'enrolled_at',
    sortDirection = 'DESC',
    pageIndex = 1,
    pageSize = 20,
  }) {
    const { data, error } = await supabase.rpc('udf_get_batch_enrollments', {
      p_filter_student_id: filterStudentId,
      p_filter_batch_id: filterBatchId,
      p_filter_status: filterStatus,
      p_filter_order_id: filterOrderId,
      p_filter_is_active: filterIsActive,
      p_filter_is_deleted: filterIsDeleted,
      p_search_term: searchTerm,
      p_sort_column: sortColumn,
      p_sort_direction: sortDirection,
      p_page_index: pageIndex,
      p_page_size: pageSize,
    });

    if (error) throw error;
    return data;
  }

  async createBatchEnrollment(
    batchId,
    studentId,
    orderId = null,
    enrollmentStatus = 'active',
    enrolledAt = null,
    completedAt = null,
    createdBy = null
  ) {
    const { data, error } = await supabase.rpc('sp_batch_enrollments_insert', {
      p_batch_id: batchId,
      p_student_id: studentId,
      p_order_id: orderId,
      p_enrollment_status: enrollmentStatus,
      p_enrolled_at: enrolledAt,
      p_completed_at: completedAt,
      p_created_by: createdBy,
    });

    if (error) throw error;
    return data;
  }

  async updateBatchEnrollment(
    id,
    enrollmentStatus = null,
    completedAt = null,
    updatedBy = null
  ) {
    const { error } = await supabase.rpc('sp_batch_enrollments_update', {
      p_id: id,
      p_enrollment_status: enrollmentStatus,
      p_completed_at: completedAt,
      p_updated_by: updatedBy,
    });

    if (error) throw error;
  }

  async deleteBatchEnrollment(id) {
    const { error } = await supabase.rpc('sp_batch_enrollments_delete_single', {
      p_id: id,
    });

    if (error) throw error;
  }

  async bulkDeleteBatchEnrollments(ids) {
    const { error } = await supabase.rpc('sp_batch_enrollments_delete', {
      p_ids: ids,
    });

    if (error) throw error;
  }

  async restoreBatchEnrollment(id) {
    const { error } = await supabase.rpc('sp_batch_enrollments_restore_single', {
      p_id: id,
    });

    if (error) throw error;
  }

  async bulkRestoreBatchEnrollments(ids) {
    const { error } = await supabase.rpc('sp_batch_enrollments_restore', {
      p_ids: ids,
    });

    if (error) throw error;
  }

  // WEBINAR REGISTRATIONS
  async getWebinarRegistrations({
    filterStudentId = null,
    filterWebinarId = null,
    filterStatus = null,
    filterOrderId = null,
    filterIsActive = null,
    filterIsDeleted = false,
    searchTerm = null,
    sortColumn = 'registered_at',
    sortDirection = 'DESC',
    pageIndex = 1,
    pageSize = 20,
  }) {
    const { data, error } = await supabase.rpc('udf_get_webinar_registrations', {
      p_filter_student_id: filterStudentId,
      p_filter_webinar_id: filterWebinarId,
      p_filter_status: filterStatus,
      p_filter_order_id: filterOrderId,
      p_filter_is_active: filterIsActive,
      p_filter_is_deleted: filterIsDeleted,
      p_search_term: searchTerm,
      p_sort_column: sortColumn,
      p_sort_direction: sortDirection,
      p_page_index: pageIndex,
      p_page_size: pageSize,
    });

    if (error) throw error;
    return data;
  }

  async createWebinarRegistration(
    webinarId,
    studentId,
    orderId = null,
    registrationStatus = 'registered',
    registeredAt = null,
    attendedAt = null,
    createdBy = null
  ) {
    const { data, error } = await supabase.rpc('sp_webinar_registrations_insert', {
      p_webinar_id: webinarId,
      p_student_id: studentId,
      p_order_id: orderId,
      p_registration_status: registrationStatus,
      p_registered_at: registeredAt,
      p_attended_at: attendedAt,
      p_created_by: createdBy,
    });

    if (error) throw error;
    return data;
  }

  async updateWebinarRegistration(
    id,
    registrationStatus = null,
    attendedAt = null,
    updatedBy = null
  ) {
    const { error } = await supabase.rpc('sp_webinar_registrations_update', {
      p_id: id,
      p_registration_status: registrationStatus,
      p_attended_at: attendedAt,
      p_updated_by: updatedBy,
    });

    if (error) throw error;
  }

  async deleteWebinarRegistration(id) {
    const { error } = await supabase.rpc('sp_webinar_registrations_delete_single', {
      p_id: id,
    });

    if (error) throw error;
  }

  async bulkDeleteWebinarRegistrations(ids) {
    const { error } = await supabase.rpc('sp_webinar_registrations_delete', {
      p_ids: ids,
    });

    if (error) throw error;
  }

  async restoreWebinarRegistration(id) {
    const { error } = await supabase.rpc('sp_webinar_registrations_restore_single', {
      p_id: id,
    });

    if (error) throw error;
  }

  async bulkRestoreWebinarRegistrations(ids) {
    const { error } = await supabase.rpc('sp_webinar_registrations_restore', {
      p_ids: ids,
    });

    if (error) throw error;
  }
}

module.exports = new EnrollmentManagementRepository();
