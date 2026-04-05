const { Router } = require('express');
const ctrl = require('../controllers/materialManagement.controller');
const validate = require('../../../middleware/validate.middleware');
const authenticate = require('../../../middleware/auth.middleware');
const { authorize } = require('../../../middleware/authorize.middleware');

const {
  idParamSchema,
  createSubjectSchema, updateSubjectSchema, subjectListQuerySchema,
  createChapterSchema, updateChapterSchema, chapterListQuerySchema,
  createTopicSchema, updateTopicSchema, topicListQuerySchema,
  createSubTopicSchema, updateSubTopicSchema, subTopicListQuerySchema,
  restoreSchema,
} = require('../validators/materialManagement.validator');

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// ============================================================================
// SUBJECTS ROUTES (/subjects)
// ============================================================================

// GET /subjects — List all subjects with filters and pagination
router.get(
  '/subjects',
  authorize('subject.read'),
  validate(subjectListQuerySchema, 'query'),
  ctrl.getSubjects
);

// GET /subjects/:id — Get subject by ID
router.get(
  '/subjects/:id',
  authorize('subject.read'),
  validate(idParamSchema, 'params'),
  ctrl.getSubjectById
);

// POST /subjects — Create new subject
router.post(
  '/subjects',
  authorize('subject.create'),
  validate(createSubjectSchema),
  ctrl.createSubject
);

// PUT /subjects/:id — Update subject
router.patch(
  '/subjects/:id',
  authorize('subject.update'),
  validate(idParamSchema, 'params'),
  validate(updateSubjectSchema),
  ctrl.updateSubject
);

// DELETE /subjects/:id — Delete subject
router.delete(
  '/subjects/:id',
  authorize('subject.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteSubject
);

// POST /subjects/:id/restore — Restore subject
router.post(
  '/subjects/:id/restore',
  authorize('subject.update'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreSubject
);

// ============================================================================
// CHAPTERS ROUTES (/chapters)
// ============================================================================

// GET /chapters — List all chapters with filters and pagination
router.get(
  '/chapters',
  authorize('chapter.read'),
  validate(chapterListQuerySchema, 'query'),
  ctrl.getChapters
);

// GET /chapters/:id — Get chapter by ID
router.get(
  '/chapters/:id',
  authorize('chapter.read'),
  validate(idParamSchema, 'params'),
  ctrl.getChapterById
);

// POST /chapters — Create new chapter
router.post(
  '/chapters',
  authorize('chapter.create'),
  validate(createChapterSchema),
  ctrl.createChapter
);

// PUT /chapters/:id — Update chapter
router.patch(
  '/chapters/:id',
  authorize('chapter.update'),
  validate(idParamSchema, 'params'),
  validate(updateChapterSchema),
  ctrl.updateChapter
);

// DELETE /chapters/:id — Delete chapter
router.delete(
  '/chapters/:id',
  authorize('chapter.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteChapter
);

// POST /chapters/:id/restore — Restore chapter
router.post(
  '/chapters/:id/restore',
  authorize('chapter.update'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreChapter
);

// ============================================================================
// TOPICS ROUTES (/topics)
// ============================================================================

// GET /topics — List all topics with filters and pagination
router.get(
  '/topics',
  authorize('topic.read'),
  validate(topicListQuerySchema, 'query'),
  ctrl.getTopics
);

// GET /topics/:id — Get topic by ID
router.get(
  '/topics/:id',
  authorize('topic.read'),
  validate(idParamSchema, 'params'),
  ctrl.getTopicById
);

// POST /topics — Create new topic
router.post(
  '/topics',
  authorize('topic.create'),
  validate(createTopicSchema),
  ctrl.createTopic
);

// PUT /topics/:id — Update topic
router.patch(
  '/topics/:id',
  authorize('topic.update'),
  validate(idParamSchema, 'params'),
  validate(updateTopicSchema),
  ctrl.updateTopic
);

// DELETE /topics/:id — Delete topic
router.delete(
  '/topics/:id',
  authorize('topic.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteTopic
);

// POST /topics/:id/restore — Restore topic
router.post(
  '/topics/:id/restore',
  authorize('topic.update'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreTopic
);

// ============================================================================
// SUB-TOPICS ROUTES (/sub-topics)
// ============================================================================

// GET /sub-topics — List all sub-topics with filters and pagination
router.get(
  '/sub-topics',
  authorize('sub_topic.read'),
  validate(subTopicListQuerySchema, 'query'),
  ctrl.getSubTopics
);

// GET /sub-topics/:id — Get sub-topic by ID
router.get(
  '/sub-topics/:id',
  authorize('sub_topic.read'),
  validate(idParamSchema, 'params'),
  ctrl.getSubTopicById
);

// POST /sub-topics — Create new sub-topic
router.post(
  '/sub-topics',
  authorize('sub_topic.create'),
  validate(createSubTopicSchema),
  ctrl.createSubTopic
);

// PUT /sub-topics/:id — Update sub-topic
router.patch(
  '/sub-topics/:id',
  authorize('sub_topic.update'),
  validate(idParamSchema, 'params'),
  validate(updateSubTopicSchema),
  ctrl.updateSubTopic
);

// DELETE /sub-topics/:id — Delete sub-topic
router.delete(
  '/sub-topics/:id',
  authorize('sub_topic.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteSubTopic
);

// POST /sub-topics/:id/restore — Restore sub-topic
router.post(
  '/sub-topics/:id/restore',
  authorize('sub_topic.update'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreSubTopic
);

module.exports = router;
