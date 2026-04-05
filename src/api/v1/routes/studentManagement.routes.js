/**
 * ═══════════════════════════════════════════════════════════════
 * STUDENT MANAGEMENT ROUTES — Student Profiles
 * ═══════════════════════════════════════════════════════════════
 */

const { Router } = require('express');
const ctrl = require('../controllers/studentManagement.controller');
const validate = require('../../../middleware/validate.middleware');
const authenticate = require('../../../middleware/auth.middleware');
const { authorize } = require('../../../middleware/authorize.middleware');
const { createUpload, handleUploadError } = require('../../../middleware/upload.middleware');

const {
  idParamSchema,
  createStudentProfileSchema,
  updateStudentProfileSchema,
  studentProfileListQuerySchema,
} = require('../validators/studentManagement.validator');

const router = Router();

// Create upload middleware for resume
const uploadResume = handleUploadError(
  createUpload({
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
  }).single('resume')
);

// Apply authentication middleware to all routes
router.use(authenticate);

// ============================================================================
// STUDENT PROFILES ROUTES
// ============================================================================

router.get('/student-profiles', authorize('student_profile.read'), validate(studentProfileListQuerySchema, 'query'), ctrl.getStudentProfiles);
router.get('/student-profiles/:id', authorize('student_profile.read'), validate(idParamSchema, 'params'), ctrl.getStudentProfileById);
router.post('/student-profiles', authorize('student_profile.create'), validate(createStudentProfileSchema), ctrl.createStudentProfile);
router.patch('/student-profiles/:id', authorize('student_profile.update'), validate(idParamSchema, 'params'), validate(updateStudentProfileSchema), ctrl.updateStudentProfile);
router.delete('/student-profiles/:id', authorize('student_profile.delete'), validate(idParamSchema, 'params'), ctrl.deleteStudentProfile);

// ============================================================================
// STUDENT PROFILES FILE UPLOAD ROUTES
// ============================================================================

router.post(
  '/student-profiles/:id/resume',
  authorize('student_profile.update'),
  validate(idParamSchema, 'params'),
  uploadResume,
  ctrl.uploadResume
);

module.exports = router;
