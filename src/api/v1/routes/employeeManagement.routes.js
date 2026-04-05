/**
 * ═══════════════════════════════════════════════════════════════
 * EMPLOYEE MANAGEMENT ROUTES — Employee Profiles
 * ═══════════════════════════════════════════════════════════════
 */

const { Router } = require('express');
const ctrl = require('../controllers/employeeManagement.controller');
const validate = require('../../../middleware/validate.middleware');
const authenticate = require('../../../middleware/auth.middleware');
const { authorize } = require('../../../middleware/authorize.middleware');

const {
  idParamSchema,
  createEmployeeProfileSchema,
  updateEmployeeProfileSchema,
  employeeProfileListQuerySchema,
} = require('../validators/employeeManagement.validator');

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// ============================================================================
// EMPLOYEE PROFILES ROUTES
// ============================================================================

router.get(
  '/employee-profiles',
  authorize('employee_profile.read'),
  validate(employeeProfileListQuerySchema, 'query'),
  ctrl.getEmployeeProfiles
);

router.get(
  '/employee-profiles/:id',
  authorize('employee_profile.read'),
  validate(idParamSchema, 'params'),
  ctrl.getEmployeeProfileById
);

router.post(
  '/employee-profiles',
  authorize('employee_profile.create'),
  validate(createEmployeeProfileSchema),
  ctrl.createEmployeeProfile
);

router.patch(
  '/employee-profiles/:id',
  authorize('employee_profile.update'),
  validate(idParamSchema, 'params'),
  validate(updateEmployeeProfileSchema),
  ctrl.updateEmployeeProfile
);

router.delete(
  '/employee-profiles/:id',
  authorize('employee_profile.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteEmployeeProfile
);

router.post('/employee-profiles/:id/restore', authorize('employee_profile.update'), validate(idParamSchema, 'params'), ctrl.restoreEmployeeProfile);

module.exports = router;
