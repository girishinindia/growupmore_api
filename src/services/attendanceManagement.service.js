/**
 * ═══════════════════════════════════════════════════════════════
 * ATTENDANCE MANAGEMENT SERVICE — Business Logic Layer
 * ═══════════════════════════════════════════════════════════════
 */

const attendanceManagementRepository = require('../repositories/attendanceManagement.repository');
const logger = require('../config/logger');
const { BadRequestError, NotFoundError } = require('../utils/errors');

class AttendanceManagementService {
  // ─────────────────────────────────────────────────────────────
  //  ATTENDANCE — READ
  // ─────────────────────────────────────────────────────────────

  async getAttendance(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;
      const repoOptions = {
        filterId: filters.id || null,
        filterStudentId: filters.studentId || null,
        filterAttendanceType: filters.attendanceType || null,
        filterBatchSessionId: filters.batchSessionId || null,
        filterWebinarId: filters.webinarId || null,
        filterStatus: filters.status || null,
        filterStartDate: filters.startDate || null,
        filterEndDate: filters.endDate || null,
        filterSearchTerm: search || null,
        sortColumn: sort?.field || 'created_at',
        sortDirection: sort?.direction || 'DESC',
        pageIndex: (pagination.page || 1) - 1,
        pageSize: pagination.limit || 20,
      };
      return await attendanceManagementRepository.getAttendance(repoOptions);
    } catch (error) {
      logger.error('Error fetching attendance records:', error);
      throw error;
    }
  }

  async getAttendanceById(attendanceId) {
    try {
      if (!attendanceId) throw new BadRequestError('Attendance ID is required');
      const result = await attendanceManagementRepository.findAttendanceById(attendanceId);
      if (!result) throw new NotFoundError('Attendance record not found');
      return result;
    } catch (error) {
      logger.error(`Error fetching attendance ${attendanceId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  ATTENDANCE — CREATE
  // ─────────────────────────────────────────────────────────────

  async createAttendance(attendanceData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!attendanceData.studentId) throw new BadRequestError('Student ID is required');
      if (!attendanceData.attendanceType) throw new BadRequestError('Attendance type is required');

      // Polymorphic validation: batch_session requires batchSessionId, webinar requires webinarId
      if (attendanceData.attendanceType === 'batch_session') {
        if (!attendanceData.batchSessionId) {
          throw new BadRequestError('Batch Session ID is required when attendanceType is "batch_session"');
        }
        if (attendanceData.webinarId) {
          throw new BadRequestError('Webinar ID must be null when attendanceType is "batch_session"');
        }
      } else if (attendanceData.attendanceType === 'webinar') {
        if (!attendanceData.webinarId) {
          throw new BadRequestError('Webinar ID is required when attendanceType is "webinar"');
        }
        if (attendanceData.batchSessionId) {
          throw new BadRequestError('Batch Session ID must be null when attendanceType is "webinar"');
        }
      }

      const payload = {
        ...attendanceData,
        createdBy: actingUserId,
      };

      const created = await attendanceManagementRepository.createAttendance(payload);
      logger.info(`Attendance record created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating attendance record:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  ATTENDANCE — UPDATE
  // ─────────────────────────────────────────────────────────────

  async updateAttendance(attendanceId, updates, actingUserId) {
    try {
      if (!attendanceId) throw new BadRequestError('Attendance ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await attendanceManagementRepository.findAttendanceById(attendanceId);
      if (!existing) throw new NotFoundError('Attendance record not found');

      const payload = { ...updates, updatedBy: actingUserId };
      const updated = await attendanceManagementRepository.updateAttendance(attendanceId, payload);
      logger.info(`Attendance record updated: ${attendanceId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating attendance ${attendanceId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  ATTENDANCE — DELETE
  // ─────────────────────────────────────────────────────────────

  async deleteAttendance(attendanceId, actingUserId) {
    try {
      if (!attendanceId) throw new BadRequestError('Attendance ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await attendanceManagementRepository.findAttendanceById(attendanceId);
      if (!existing) throw new NotFoundError('Attendance record not found');

      await attendanceManagementRepository.deleteAttendance(attendanceId);
      logger.info(`Attendance record deleted: ${attendanceId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting attendance ${attendanceId}:`, error);
      throw error;
    }
  }

  async bulkDeleteAttendance(ids, actingUserId) {
    try {
      if (!ids || ids.length === 0) throw new BadRequestError('At least one ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await attendanceManagementRepository.bulkDeleteAttendance(ids);
      logger.info(`Bulk deleted ${ids.length} attendance records`, { deletedBy: actingUserId, ids });
    } catch (error) {
      logger.error('Error bulk deleting attendance records:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  ATTENDANCE — RESTORE
  // ─────────────────────────────────────────────────────────────

  async restoreAttendance(attendanceId) {
    try {
      if (!attendanceId) throw new BadRequestError('Attendance ID is required');

      const restored = await attendanceManagementRepository.restoreAttendance(attendanceId);
      logger.info(`Attendance record restored: ${attendanceId}`);
      return restored;
    } catch (error) {
      logger.error(`Error restoring attendance ${attendanceId}:`, error);
      throw error;
    }
  }

  async bulkRestoreAttendance(ids) {
    try {
      if (!ids || ids.length === 0) throw new BadRequestError('At least one ID is required');

      await attendanceManagementRepository.bulkRestoreAttendance(ids);
      logger.info(`Bulk restored ${ids.length} attendance records`, { ids });
    } catch (error) {
      logger.error('Error bulk restoring attendance records:', error);
      throw error;
    }
  }
}

module.exports = new AttendanceManagementService();
