/**
 * ═══════════════════════════════════════════════════════════════
 * ATTENDANCE MANAGEMENT REPOSITORY — Database Layer (Supabase RPC)
 * ═══════════════════════════════════════════════════════════════
 * Handles Attendance Records via:
 *
 *   ATTENDANCE:
 *   - udf_get_attendance              — read, search, filter, paginate
 *   - sp_attendance_insert            — create, returns id (BIGINT)
 *   - sp_attendance_update            — update, returns void
 *   - sp_attendance_delete_single     — single soft delete, returns void
 *   - sp_attendance_delete            — bulk soft delete, returns void
 *   - sp_attendance_restore_single    — single restore, returns void
 *   - sp_attendance_restore           — bulk restore, returns void
 * ═══════════════════════════════════════════════════════════════
 */

const { supabase } = require('../config/database');
const logger = require('../config/logger');

class AttendanceManagementRepository {
  // ─────────────────────────────────────────────────────────────
  //  ATTENDANCE — READ
  // ─────────────────────────────────────────────────────────────

  async getAttendance(options = {}) {
    const { data, error } = await supabase.rpc('udf_get_attendance', {
      p_id: options.filterId || null,
      p_student_id: options.filterStudentId || null,
      p_attendance_type: options.filterAttendanceType || null,
      p_batch_session_id: options.filterBatchSessionId || null,
      p_webinar_id: options.filterWebinarId || null,
      p_status: options.filterStatus || null,
      p_start_date: options.filterStartDate || null,
      p_end_date: options.filterEndDate || null,
      p_search_term: options.filterSearchTerm || null,
      p_sort_column: options.sortColumn || 'created_at',
      p_sort_direction: options.sortDirection || 'DESC',
      p_page_index: options.pageIndex || 1,
      p_page_size: options.pageSize || 20,
    });

    if (error) {
      logger.error({ error }, 'AttendanceManagementRepository.getAttendance failed');
      throw error;
    }

    return data || [];
  }

  async findAttendanceById(id) {
    const { data, error } = await supabase.rpc('udf_get_attendance', {
      p_id: id,
      p_student_id: null,
      p_attendance_type: null,
      p_batch_session_id: null,
      p_webinar_id: null,
      p_status: null,
      p_start_date: null,
      p_end_date: null,
      p_search_term: null,
      p_sort_column: 'created_at',
      p_sort_direction: 'DESC',
      p_page_index: 1,
      p_page_size: 1000,
    });

    if (error) {
      logger.error({ error }, 'AttendanceManagementRepository.findAttendanceById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  // ─────────────────────────────────────────────────────────────
  //  ATTENDANCE — WRITE
  // ─────────────────────────────────────────────────────────────

  async createAttendance(attendanceData) {
    const { data, error } = await supabase.rpc('sp_attendance_insert', {
      p_student_id: attendanceData.studentId,
      p_attendance_type: attendanceData.attendanceType,
      p_batch_session_id: attendanceData.batchSessionId || null,
      p_webinar_id: attendanceData.webinarId || null,
      p_status: attendanceData.status || 'present',
      p_joined_at: attendanceData.joinedAt || null,
      p_left_at: attendanceData.leftAt || null,
      p_duration_attended_seconds: attendanceData.durationAttendedSeconds || null,
      p_created_by: attendanceData.createdBy,
    });

    if (error) {
      logger.error({ error }, 'AttendanceManagementRepository.createAttendance failed');
      throw error;
    }

    const newId = data;
    return this.findAttendanceById(newId);
  }

  async updateAttendance(attendanceId, updates) {
    const { error } = await supabase.rpc('sp_attendance_update', {
      p_id: attendanceId,
      p_status: updates.status !== undefined ? updates.status : null,
      p_joined_at: updates.joinedAt !== undefined ? updates.joinedAt : null,
      p_left_at: updates.leftAt !== undefined ? updates.leftAt : null,
      p_duration_attended_seconds: updates.durationAttendedSeconds !== undefined ? updates.durationAttendedSeconds : null,
      p_updated_by: updates.updatedBy,
    });

    if (error) {
      logger.error({ error }, 'AttendanceManagementRepository.updateAttendance failed');
      throw error;
    }

    return this.findAttendanceById(attendanceId);
  }

  async deleteAttendance(attendanceId) {
    const { error } = await supabase.rpc('sp_attendance_delete_single', {
      p_id: attendanceId,
    });

    if (error) {
      logger.error({ error }, 'AttendanceManagementRepository.deleteAttendance failed');
      throw error;
    }
  }

  async bulkDeleteAttendance(ids) {
    const { error } = await supabase.rpc('sp_attendance_delete', {
      p_ids: ids,
    });

    if (error) {
      logger.error({ error }, 'AttendanceManagementRepository.bulkDeleteAttendance failed');
      throw error;
    }
  }

  async restoreAttendance(attendanceId) {
    const { error } = await supabase.rpc('sp_attendance_restore_single', {
      p_id: attendanceId,
    });

    if (error) {
      logger.error({ error }, 'AttendanceManagementRepository.restoreAttendance failed');
      throw error;
    }

    return this.findAttendanceById(attendanceId);
  }

  async bulkRestoreAttendance(ids) {
    const { error } = await supabase.rpc('sp_attendance_restore', {
      p_ids: ids,
    });

    if (error) {
      logger.error({ error }, 'AttendanceManagementRepository.bulkRestoreAttendance failed');
      throw error;
    }
  }
}

module.exports = new AttendanceManagementRepository();
