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
  '/',
  authorize('employee_profile.read'),
  validate(employeeProfileListQuerySchema, 'query'),
  ctrl.getEmployeeProfiles
);

router.get(
  '/:id',
  authorize('employee_profile.read'),
  validate(idParamSchema, 'params'),
  ctrl.getEmployeeProfileById
);

router.post(
  '/',
  authorize('employee_profile.create'),
  validate(createEmployeeProfileSchema),
  ctrl.createEmployeeProfile
);

router.patch(
  '/:id',
  authorize('employee_profile.update'),
  validate(idParamSchema, 'params'),
  validate(updateEmployeeProfileSchema),
  ctrl.updateEmployeeProfile
);

router.delete(
  '/:id',
  authorize('employee_profile.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteEmployeeProfile
);

module.exports = router;
