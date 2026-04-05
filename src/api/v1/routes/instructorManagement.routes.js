/**
 * ═══════════════════════════════════════════════════════════════
 * INSTRUCTOR MANAGEMENT ROUTES — Instructor Profiles
 * ═══════════════════════════════════════════════════════════════
 */

const { Router } = require('express');
const ctrl = require('../controllers/instructorManagement.controller');
const validate = require('../../../middleware/validate.middleware');
const authenticate = require('../../../middleware/auth.middleware');
const { authorize } = require('../../../middleware/authorize.middleware');

const {
  idParamSchema,
  createInstructorProfileSchema,
  updateInstructorProfileSchema,
  instructorProfileListQuerySchema,
} = require('../validators/instructorManagement.validator');

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// ============================================================================
// INSTRUCTOR PROFILES ROUTES
// ============================================================================

router.get('/instructor-profiles', authorize('instructor_profile.read'), validate(instructorProfileListQuerySchema, 'query'), ctrl.getInstructorProfiles);
router.get('/instructor-profiles/:id', authorize('instructor_profile.read'), validate(idParamSchema, 'params'), ctrl.getInstructorProfileById);
router.post('/instructor-profiles', authorize('instructor_profile.create'), validate(createInstructorProfileSchema), ctrl.createInstructorProfile);
router.patch('/instructor-profiles/:id', authorize('instructor_profile.update'), validate(idParamSchema, 'params'), validate(updateInstructorProfileSchema), ctrl.updateInstructorProfile);
router.delete('/instructor-profiles/:id', authorize('instructor_profile.delete'), validate(idParamSchema, 'params'), ctrl.deleteInstructorProfile);
router.post('/instructor-profiles/:id/restore', authorize('instructor_profile.update'), validate(idParamSchema, 'params'), ctrl.restoreInstructorProfile);

module.exports = router;
