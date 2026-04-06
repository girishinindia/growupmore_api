/**
 * ═══════════════════════════════════════════════════════════════
 * ATTENDANCE MANAGEMENT ROUTES
 * ═══════════════════════════════════════════════════════════════
 * Attendance Records
 * ═══════════════════════════════════════════════════════════════
 */

const { Router } = require('express');
const ctrl = require('../controllers/attendanceManagement.controller');
const validate = require('../../../middleware/validate.middleware');
const authenticate = require('../../../middleware/auth.middleware');
const { authorize } = require('../../../middleware/authorize.middleware');

const {
  idParamSchema,
  bulkIdsSchema,
  createAttendanceSchema,
  updateAttendanceSchema,
  attendanceListQuerySchema,
} = require('../validators/attendanceManagement.validator');

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// ============================================================================
// ATTENDANCE ROUTES
// ============================================================================

// GET /attendance - List all attendance records
router.get(
  '/',
  authorize('attendance.read'),
  validate(attendanceListQuerySchema, 'query'),
  ctrl.getAttendance
);

// POST /attendance - Create attendance record
router.post(
  '/',
  authorize('attendance.create'),
  validate(createAttendanceSchema),
  ctrl.createAttendance
);

// POST /attendance/bulk-delete - Bulk soft delete attendance records (BEFORE :id)
router.post(
  '/bulk-delete',
  authorize('attendance.delete'),
  validate(bulkIdsSchema),
  ctrl.bulkDeleteAttendance
);

// POST /attendance/bulk-restore - Bulk restore attendance records (BEFORE :id)
router.post(
  '/bulk-restore',
  authorize('attendance.update'),
  validate(bulkIdsSchema),
  ctrl.bulkRestoreAttendance
);

// GET /attendance/:id - Get attendance record by ID
router.get(
  '/:id',
  authorize('attendance.read'),
  validate(idParamSchema, 'params'),
  ctrl.getAttendanceById
);

// PATCH /attendance/:id - Update attendance record
router.patch(
  '/:id',
  authorize('attendance.update'),
  validate(idParamSchema, 'params'),
  validate(updateAttendanceSchema),
  ctrl.updateAttendance
);

// DELETE /attendance/:id - Delete attendance record
router.delete(
  '/:id',
  authorize('attendance.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteAttendance
);

// POST /attendance/:id/restore - Restore attendance record
router.post(
  '/:id/restore',
  authorize('attendance.update'),
  validate(idParamSchema, 'params'),
  ctrl.restoreAttendance
);

module.exports = router;
