const { Router } = require('express');
const ctrl = require('../controllers/batchManagement.controller');
const validate = require('../../../middleware/validate.middleware');
const authenticate = require('../../../middleware/auth.middleware');
const { authorize } = require('../../../middleware/authorize.middleware');

// Import validator schemas
const {
  idParamSchema,
  restoreSchema,
  createCourseBatchSchema,
  updateCourseBatchSchema,
  courseBatchListQuerySchema,
  createBatchTranslationSchema,
  updateBatchTranslationSchema,
  createBatchSessionSchema,
  updateBatchSessionSchema,
  batchSessionListQuerySchema,
  createBatchSessionTranslationSchema,
  updateBatchSessionTranslationSchema,
} = require('../validators/batchManagement.validator');

const router = Router();
router.use(authenticate);

// ============================================================================
// 1. COURSE BATCHES (permission: course_batch.*)
// ============================================================================

router.get(
  '/course-batches',
  authorize('course_batch.read'),
  validate(courseBatchListQuerySchema, 'query'),
  ctrl.getCourseBatches
);

router.get(
  '/course-batches/:id',
  authorize('course_batch.read'),
  validate(idParamSchema, 'params'),
  ctrl.getCourseBatchById
);

router.post(
  '/course-batches',
  authorize('course_batch.create'),
  validate(createCourseBatchSchema),
  ctrl.createCourseBatch
);

router.patch(
  '/course-batches/:id',
  authorize('course_batch.update'),
  validate(idParamSchema, 'params'),
  validate(updateCourseBatchSchema),
  ctrl.updateCourseBatch
);

router.delete(
  '/course-batches/:id',
  authorize('course_batch.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteCourseBatch
);

router.post(
  '/course-batches/:id/restore',
  authorize('course_batch.update'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreCourseBatch
);

// ============================================================================
// 2. BATCH TRANSLATIONS (permission: batch_translation.*)
// ============================================================================

router.post(
  '/batch-translations',
  authorize('batch_translation.create'),
  validate(createBatchTranslationSchema),
  ctrl.createBatchTranslation
);

router.patch(
  '/batch-translations/:id',
  authorize('batch_translation.update'),
  validate(idParamSchema, 'params'),
  validate(updateBatchTranslationSchema),
  ctrl.updateBatchTranslation
);

router.delete(
  '/batch-translations/:id',
  authorize('batch_translation.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteBatchTranslation
);

router.post(
  '/batch-translations/:id/restore',
  authorize('batch_translation.update'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreBatchTranslation
);

// ============================================================================
// 3. BATCH SESSIONS (permission: batch_session.*)
// ============================================================================

router.get(
  '/batch-sessions',
  authorize('batch_session.read'),
  validate(batchSessionListQuerySchema, 'query'),
  ctrl.getBatchSessions
);

router.get(
  '/batch-sessions/:id',
  authorize('batch_session.read'),
  validate(idParamSchema, 'params'),
  ctrl.getBatchSessionById
);

router.post(
  '/batch-sessions',
  authorize('batch_session.create'),
  validate(createBatchSessionSchema),
  ctrl.createBatchSession
);

router.patch(
  '/batch-sessions/:id',
  authorize('batch_session.update'),
  validate(idParamSchema, 'params'),
  validate(updateBatchSessionSchema),
  ctrl.updateBatchSession
);

router.delete(
  '/batch-sessions/:id',
  authorize('batch_session.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteBatchSession
);

router.post(
  '/batch-sessions/:id/restore',
  authorize('batch_session.update'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreBatchSession
);

// ============================================================================
// 4. BATCH SESSION TRANSLATIONS (permission: batch_session_translation.*)
// ============================================================================

router.post(
  '/batch-session-translations',
  authorize('batch_session_translation.create'),
  validate(createBatchSessionTranslationSchema),
  ctrl.createBatchSessionTranslation
);

router.patch(
  '/batch-session-translations/:id',
  authorize('batch_session_translation.update'),
  validate(idParamSchema, 'params'),
  validate(updateBatchSessionTranslationSchema),
  ctrl.updateBatchSessionTranslation
);

router.delete(
  '/batch-session-translations/:id',
  authorize('batch_session_translation.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteBatchSessionTranslation
);

router.post(
  '/batch-session-translations/:id/restore',
  authorize('batch_session_translation.update'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreBatchSessionTranslation
);

module.exports = router;
