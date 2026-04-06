/**
 * ═══════════════════════════════════════════════════════════════
 * ATTENDANCE MANAGEMENT CONTROLLER — HTTP Request Handlers
 * ═══════════════════════════════════════════════════════════════
 */

const attendanceManagementService = require('../../../services/attendanceManagement.service');
const { sendSuccess, sendCreated } = require('../../../utils/response');

class AttendanceManagementController {
  // ==================== ATTENDANCE RECORDS ====================

  async getAttendance(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        studentId,
        attendanceType,
        batchSessionId,
        webinarId,
        status,
        startDate,
        endDate,
        searchTerm,
        sortBy = 'created_at',
        sortDir = 'ASC',
      } = req.query;

      const filters = {};
      if (studentId !== undefined) filters.studentId = studentId;
      if (attendanceType !== undefined) filters.attendanceType = attendanceType;
      if (batchSessionId !== undefined) filters.batchSessionId = batchSessionId;
      if (webinarId !== undefined) filters.webinarId = webinarId;
      if (status !== undefined) filters.status = status;
      if (startDate !== undefined) filters.startDate = startDate;
      if (endDate !== undefined) filters.endDate = endDate;

      const data = await attendanceManagementService.getAttendance({
        filters,
        search: searchTerm,
        sort: { field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, { data, message: 'Attendance records retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getAttendanceById(req, res, next) {
    try {
      const data = await attendanceManagementService.getAttendanceById(req.params.id);
      sendSuccess(res, { data, message: 'Attendance record retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createAttendance(req, res, next) {
    try {
      const attendanceData = {
        studentId: req.body.studentId,
        attendanceType: req.body.attendanceType,
        batchSessionId: req.body.batchSessionId || null,
        webinarId: req.body.webinarId || null,
        status: req.body.status || 'present',
        joinedAt: req.body.joinedAt || null,
        leftAt: req.body.leftAt || null,
        durationAttendedSeconds: req.body.durationAttendedSeconds || null,
      };

      const data = await attendanceManagementService.createAttendance(attendanceData, req.user.userId);
      sendCreated(res, { data, message: 'Attendance record created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateAttendance(req, res, next) {
    try {
      const updates = {};

      if (req.body.status !== undefined) updates.status = req.body.status;
      if (req.body.joinedAt !== undefined) updates.joinedAt = req.body.joinedAt;
      if (req.body.leftAt !== undefined) updates.leftAt = req.body.leftAt;
      if (req.body.durationAttendedSeconds !== undefined) updates.durationAttendedSeconds = req.body.durationAttendedSeconds;

      const data = await attendanceManagementService.updateAttendance(req.params.id, updates, req.user.userId);
      sendSuccess(res, { data, message: 'Attendance record updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteAttendance(req, res, next) {
    try {
      await attendanceManagementService.deleteAttendance(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Attendance record deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async bulkDeleteAttendance(req, res, next) {
    try {
      const { ids } = req.body;
      await attendanceManagementService.bulkDeleteAttendance(ids, req.user.userId);
      sendSuccess(res, { message: `${ids.length} attendance record(s) deleted successfully` });
    } catch (error) {
      next(error);
    }
  }

  async restoreAttendance(req, res, next) {
    try {
      const data = await attendanceManagementService.restoreAttendance(req.params.id);
      sendSuccess(res, { data, message: 'Attendance record restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  async bulkRestoreAttendance(req, res, next) {
    try {
      const { ids } = req.body;
      await attendanceManagementService.bulkRestoreAttendance(ids);
      sendSuccess(res, { message: `${ids.length} attendance record(s) restored successfully` });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AttendanceManagementController();
