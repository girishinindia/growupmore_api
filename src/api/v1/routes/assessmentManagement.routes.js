const { Router } = require('express');
const ctrl = require('../controllers/assessmentManagement.controller');
const validate = require('../../../middleware/validate.middleware');
const authenticate = require('../../../middleware/auth.middleware');
const { authorize } = require('../../../middleware/authorize.middleware');
const { createUpload, handleUploadError } = require('../../../middleware/upload.middleware');

// Import all validator schemas
const {
  idParamSchema,
  restoreSchema,
  createAssessmentSchema,
  updateAssessmentSchema,
  assessmentListQuerySchema,
  createAssessmentTranslationSchema,
  updateAssessmentTranslationSchema,
  createAssessmentAttachmentSchema,
  updateAssessmentAttachmentSchema,
  assessmentAttachmentListQuerySchema,
  createAssessmentAttachmentTranslationSchema,
  updateAssessmentAttachmentTranslationSchema,
  createAssessmentSolutionSchema,
  updateAssessmentSolutionSchema,
  assessmentSolutionListQuerySchema,
  createAssessmentSolutionTranslationSchema,
  updateAssessmentSolutionTranslationSchema,
} = require('../validators/assessmentManagement.validator');

const router = Router();
router.use(authenticate);

// ========================================
// Upload Middleware Definitions
// ========================================

// Assessment translations: image1, image2
const uploadAssessmentTranslationImages = handleUploadError(
  createUpload().fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
  ])
);

// Assessment attachments: file
const uploadAssessmentAttachmentFile = handleUploadError(
  createUpload().fields([
    { name: 'file', maxCount: 1 },
  ])
);

// Assessment solutions: file, video
const uploadAssessmentSolutionFiles = handleUploadError(
  createUpload().fields([
    { name: 'file', maxCount: 1 },
    { name: 'video', maxCount: 1 },
  ])
);

// Assessment solution translations: videoThumbnail
const uploadAssessmentSolutionThumbnail = handleUploadError(
  createUpload().fields([
    { name: 'videoThumbnail', maxCount: 1 },
  ])
);

// ========================================
// 1. ASSESSMENTS (6 routes)
// Permission: assessment.*
// ========================================

router.get(
  '/assessments',
  authorize('assessment.read'),
  validate(assessmentListQuerySchema, 'query'),
  ctrl.getAssessments
);

router.get(
  '/assessments/:id',
  authorize('assessment.read'),
  validate(idParamSchema, 'params'),
  ctrl.getAssessmentById
);

router.post(
  '/assessments',
  authorize('assessment.create'),
  validate(createAssessmentSchema),
  ctrl.createAssessment
);

router.patch(
  '/assessments/:id',
  authorize('assessment.update'),
  validate(idParamSchema, 'params'),
  validate(updateAssessmentSchema),
  ctrl.updateAssessment
);

router.delete(
  '/assessments/:id',
  authorize('assessment.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteAssessment
);

router.post(
  '/assessments/:id/restore',
  authorize('assessment.update'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreAssessment
);

// ========================================
// 2. ASSESSMENT TRANSLATIONS (4 routes)
// Permission: assessment_translation.*
// ========================================

router.post(
  '/assessment-translations',
  authorize('assessment_translation.create'),
  uploadAssessmentTranslationImages,
  validate(createAssessmentTranslationSchema),
  ctrl.createAssessmentTranslation
);

router.patch(
  '/assessment-translations/:id',
  authorize('assessment_translation.update'),
  validate(idParamSchema, 'params'),
  uploadAssessmentTranslationImages,
  validate(updateAssessmentTranslationSchema),
  ctrl.updateAssessmentTranslation
);

router.delete(
  '/assessment-translations/:id',
  authorize('assessment_translation.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteAssessmentTranslation
);

router.post(
  '/assessment-translations/:id/restore',
  authorize('assessment_translation.update'),
  validate(idParamSchema, 'params'),
  ctrl.restoreAssessmentTranslation
);

// ========================================
// 3. ASSESSMENT ATTACHMENTS (6 routes)
// Permission: assessment_attachment.*
// ========================================

router.get(
  '/assessment-attachments',
  authorize('assessment_attachment.read'),
  validate(assessmentAttachmentListQuerySchema, 'query'),
  ctrl.getAssessmentAttachments
);

router.get(
  '/assessment-attachments/:id',
  authorize('assessment_attachment.read'),
  validate(idParamSchema, 'params'),
  ctrl.getAssessmentAttachmentById
);

router.post(
  '/assessment-attachments',
  authorize('assessment_attachment.create'),
  uploadAssessmentAttachmentFile,
  validate(createAssessmentAttachmentSchema),
  ctrl.createAssessmentAttachment
);

router.patch(
  '/assessment-attachments/:id',
  authorize('assessment_attachment.update'),
  validate(idParamSchema, 'params'),
  uploadAssessmentAttachmentFile,
  validate(updateAssessmentAttachmentSchema),
  ctrl.updateAssessmentAttachment
);

router.delete(
  '/assessment-attachments/:id',
  authorize('assessment_attachment.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteAssessmentAttachment
);

router.post(
  '/assessment-attachments/:id/restore',
  authorize('assessment_attachment.update'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreAssessmentAttachment
);

// ========================================
// 4. ASSESSMENT ATTACHMENT TRANSLATIONS (4 routes)
// Permission: assessment_attachment_translation.*
// ========================================

router.post(
  '/assessment-attachment-translations',
  authorize('assessment_attachment_translation.create'),
  validate(createAssessmentAttachmentTranslationSchema),
  ctrl.createAssessmentAttachmentTranslation
);

router.patch(
  '/assessment-attachment-translations/:id',
  authorize('assessment_attachment_translation.update'),
  validate(idParamSchema, 'params'),
  validate(updateAssessmentAttachmentTranslationSchema),
  ctrl.updateAssessmentAttachmentTranslation
);

router.delete(
  '/assessment-attachment-translations/:id',
  authorize('assessment_attachment_translation.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteAssessmentAttachmentTranslation
);

router.post(
  '/assessment-attachment-translations/:id/restore',
  authorize('assessment_attachment_translation.update'),
  validate(idParamSchema, 'params'),
  ctrl.restoreAssessmentAttachmentTranslation
);

// ========================================
// 5. ASSESSMENT SOLUTIONS (6 routes)
// Permission: assessment_solution.*
// ========================================

router.get(
  '/assessment-solutions',
  authorize('assessment_solution.read'),
  validate(assessmentSolutionListQuerySchema, 'query'),
  ctrl.getAssessmentSolutions
);

router.get(
  '/assessment-solutions/:id',
  authorize('assessment_solution.read'),
  validate(idParamSchema, 'params'),
  ctrl.getAssessmentSolutionById
);

router.post(
  '/assessment-solutions',
  authorize('assessment_solution.create'),
  uploadAssessmentSolutionFiles,
  validate(createAssessmentSolutionSchema),
  ctrl.createAssessmentSolution
);

router.patch(
  '/assessment-solutions/:id',
  authorize('assessment_solution.update'),
  validate(idParamSchema, 'params'),
  uploadAssessmentSolutionFiles,
  validate(updateAssessmentSolutionSchema),
  ctrl.updateAssessmentSolution
);

router.delete(
  '/assessment-solutions/:id',
  authorize('assessment_solution.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteAssessmentSolution
);

router.post(
  '/assessment-solutions/:id/restore',
  authorize('assessment_solution.update'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreAssessmentSolution
);

// ========================================
// 6. ASSESSMENT SOLUTION TRANSLATIONS (4 routes)
// Permission: assessment_solution_translation.*
// ========================================

router.post(
  '/assessment-solution-translations',
  authorize('assessment_solution_translation.create'),
  uploadAssessmentSolutionThumbnail,
  validate(createAssessmentSolutionTranslationSchema),
  ctrl.createAssessmentSolutionTranslation
);

router.patch(
  '/assessment-solution-translations/:id',
  authorize('assessment_solution_translation.update'),
  validate(idParamSchema, 'params'),
  uploadAssessmentSolutionThumbnail,
  validate(updateAssessmentSolutionTranslationSchema),
  ctrl.updateAssessmentSolutionTranslation
);

router.delete(
  '/assessment-solution-translations/:id',
  authorize('assessment_solution_translation.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteAssessmentSolutionTranslation
);

router.post(
  '/assessment-solution-translations/:id/restore',
  authorize('assessment_solution_translation.update'),
  validate(idParamSchema, 'params'),
  ctrl.restoreAssessmentSolutionTranslation
);

module.exports = router;
