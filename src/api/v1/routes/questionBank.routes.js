const { Router } = require('express');
const ctrl = require('../controllers/questionBank.controller');
const validate = require('../../../middleware/validate.middleware');
const authenticate = require('../../../middleware/auth.middleware');
const { authorize } = require('../../../middleware/authorize.middleware');
const { createUpload, handleUploadError } = require('../../../middleware/upload.middleware');

// Import all validator schemas
const {
  idParamSchema,
  restoreSchema,
  restoreMcqQuestionSchema,
  restoreMcqOptionSchema,
  createMcqQuestionSchema,
  updateMcqQuestionSchema,
  mcqQuestionListQuerySchema,
  createMcqQuestionTranslationSchema,
  updateMcqQuestionTranslationSchema,
  createMcqOptionSchema,
  updateMcqOptionSchema,
  createMcqOptionTranslationSchema,
  updateMcqOptionTranslationSchema,
  createOneWordQuestionSchema,
  updateOneWordQuestionSchema,
  oneWordQuestionListQuerySchema,
  createOneWordQuestionTranslationSchema,
  updateOneWordQuestionTranslationSchema,
  createOneWordSynonymSchema,
  createOneWordSynonymTranslationSchema,
  updateOneWordSynonymTranslationSchema,
  createDescriptiveQuestionSchema,
  updateDescriptiveQuestionSchema,
  descriptiveQuestionListQuerySchema,
  createDescriptiveQuestionTranslationSchema,
  updateDescriptiveQuestionTranslationSchema,
  createMatchingQuestionSchema,
  updateMatchingQuestionSchema,
  matchingQuestionListQuerySchema,
  createMatchingPairSchema,
  updateMatchingPairSchema,
  createOrderingQuestionSchema,
  updateOrderingQuestionSchema,
  orderingQuestionListQuerySchema,
  createOrderingItemSchema,
  updateOrderingItemSchema,
} = require('../validators/questionBank.validator');

const router = Router();
router.use(authenticate);

// ========================================
// Upload Middleware Definitions
// ========================================

// MCQ question translations: image1, image2
const uploadMcqQuestionTranslationImages = handleUploadError(
  createUpload().fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
  ])
);

// MCQ option translations: image
const uploadMcqOptionTranslationImage = handleUploadError(
  createUpload().fields([
    { name: 'image', maxCount: 1 },
  ])
);

// One-word question translations: image1, image2
const uploadOneWordTranslationImages = handleUploadError(
  createUpload().fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
  ])
);

// Descriptive question translations: 6 images
const uploadDescriptiveTranslationImages = handleUploadError(
  createUpload().fields([
    { name: 'questionImage1', maxCount: 1 },
    { name: 'questionImage2', maxCount: 1 },
    { name: 'questionImage3', maxCount: 1 },
    { name: 'answerImage1', maxCount: 1 },
    { name: 'answerImage2', maxCount: 1 },
    { name: 'answerImage3', maxCount: 1 },
  ])
);

// ========================================
// 1. MCQ QUESTIONS (6 routes)
// Permission: mcq_question.*
// ========================================

router.get(
  '/mcq-questions',
  authorize('mcq_question.read'),
  validate(mcqQuestionListQuerySchema, 'query'),
  ctrl.getMcqQuestions
);

router.get(
  '/mcq-questions/:id',
  authorize('mcq_question.read'),
  validate(idParamSchema, 'params'),
  ctrl.getMcqQuestionById
);

router.post(
  '/mcq-questions',
  authorize('mcq_question.create'),
  validate(createMcqQuestionSchema),
  ctrl.createMcqQuestion
);

router.patch(
  '/mcq-questions/:id',
  authorize('mcq_question.update'),
  validate(idParamSchema, 'params'),
  validate(updateMcqQuestionSchema),
  ctrl.updateMcqQuestion
);

router.delete(
  '/mcq-questions/:id',
  authorize('mcq_question.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteMcqQuestion
);

router.post(
  '/mcq-questions/:id/restore',
  authorize('mcq_question.update'),
  validate(idParamSchema, 'params'),
  validate(restoreMcqQuestionSchema),
  ctrl.restoreMcqQuestion
);

// ========================================
// 2. MCQ QUESTION TRANSLATIONS (4 routes)
// Permission: mcq_question_translation.*
// ========================================

router.post(
  '/mcq-question-translations',
  authorize('mcq_question_translation.create'),
  uploadMcqQuestionTranslationImages,
  validate(createMcqQuestionTranslationSchema),
  ctrl.createMcqQuestionTranslation
);

router.patch(
  '/mcq-question-translations/:id',
  authorize('mcq_question_translation.update'),
  validate(idParamSchema, 'params'),
  uploadMcqQuestionTranslationImages,
  validate(updateMcqQuestionTranslationSchema),
  ctrl.updateMcqQuestionTranslation
);

router.delete(
  '/mcq-question-translations/:id',
  authorize('mcq_question_translation.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteMcqQuestionTranslation
);

router.post(
  '/mcq-question-translations/:id/restore',
  authorize('mcq_question_translation.update'),
  validate(idParamSchema, 'params'),
  ctrl.restoreMcqQuestionTranslation
);

// ========================================
// 3. MCQ OPTIONS (4 routes)
// Permission: mcq_option.*
// ========================================

router.post(
  '/mcq-options',
  authorize('mcq_option.create'),
  validate(createMcqOptionSchema),
  ctrl.createMcqOption
);

router.patch(
  '/mcq-options/:id',
  authorize('mcq_option.update'),
  validate(idParamSchema, 'params'),
  validate(updateMcqOptionSchema),
  ctrl.updateMcqOption
);

router.delete(
  '/mcq-options/:id',
  authorize('mcq_option.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteMcqOption
);

router.post(
  '/mcq-options/:id/restore',
  authorize('mcq_option.update'),
  validate(idParamSchema, 'params'),
  validate(restoreMcqOptionSchema),
  ctrl.restoreMcqOption
);

// ========================================
// 4. MCQ OPTION TRANSLATIONS (4 routes)
// Permission: mcq_option_translation.*
// ========================================

router.post(
  '/mcq-option-translations',
  authorize('mcq_option_translation.create'),
  uploadMcqOptionTranslationImage,
  validate(createMcqOptionTranslationSchema),
  ctrl.createMcqOptionTranslation
);

router.patch(
  '/mcq-option-translations/:id',
  authorize('mcq_option_translation.update'),
  validate(idParamSchema, 'params'),
  uploadMcqOptionTranslationImage,
  validate(updateMcqOptionTranslationSchema),
  ctrl.updateMcqOptionTranslation
);

router.delete(
  '/mcq-option-translations/:id',
  authorize('mcq_option_translation.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteMcqOptionTranslation
);

router.post(
  '/mcq-option-translations/:id/restore',
  authorize('mcq_option_translation.update'),
  validate(idParamSchema, 'params'),
  ctrl.restoreMcqOptionTranslation
);

// ========================================
// 5. ONE-WORD QUESTIONS (6 routes)
// Permission: one_word_question.*
// ========================================

router.get(
  '/one-word-questions',
  authorize('one_word_question.read'),
  validate(oneWordQuestionListQuerySchema, 'query'),
  ctrl.getOneWordQuestions
);

router.get(
  '/one-word-questions/:id',
  authorize('one_word_question.read'),
  validate(idParamSchema, 'params'),
  ctrl.getOneWordQuestionById
);

router.post(
  '/one-word-questions',
  authorize('one_word_question.create'),
  validate(createOneWordQuestionSchema),
  ctrl.createOneWordQuestion
);

router.patch(
  '/one-word-questions/:id',
  authorize('one_word_question.update'),
  validate(idParamSchema, 'params'),
  validate(updateOneWordQuestionSchema),
  ctrl.updateOneWordQuestion
);

router.delete(
  '/one-word-questions/:id',
  authorize('one_word_question.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteOneWordQuestion
);

router.post(
  '/one-word-questions/:id/restore',
  authorize('one_word_question.update'),
  validate(idParamSchema, 'params'),
  ctrl.restoreOneWordQuestion
);

// ========================================
// 6. ONE-WORD QUESTION TRANSLATIONS (4 routes)
// Permission: one_word_question_translation.*
// ========================================

router.post(
  '/one-word-question-translations',
  authorize('one_word_question_translation.create'),
  uploadOneWordTranslationImages,
  validate(createOneWordQuestionTranslationSchema),
  ctrl.createOneWordQuestionTranslation
);

router.patch(
  '/one-word-question-translations/:id',
  authorize('one_word_question_translation.update'),
  validate(idParamSchema, 'params'),
  uploadOneWordTranslationImages,
  validate(updateOneWordQuestionTranslationSchema),
  ctrl.updateOneWordQuestionTranslation
);

router.delete(
  '/one-word-question-translations/:id',
  authorize('one_word_question_translation.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteOneWordQuestionTranslation
);

router.post(
  '/one-word-question-translations/:id/restore',
  authorize('one_word_question_translation.update'),
  validate(idParamSchema, 'params'),
  ctrl.restoreOneWordQuestionTranslation
);

// ========================================
// 7. ONE-WORD SYNONYMS (3 routes)
// Permission: one_word_synonym.*
// ========================================

router.post(
  '/one-word-synonyms',
  authorize('one_word_synonym.create'),
  validate(createOneWordSynonymSchema),
  ctrl.createOneWordSynonym
);

router.delete(
  '/one-word-synonyms/:id',
  authorize('one_word_synonym.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteOneWordSynonym
);

router.post(
  '/one-word-synonyms/:id/restore',
  authorize('one_word_synonym.update'),
  validate(idParamSchema, 'params'),
  ctrl.restoreOneWordSynonym
);

// ========================================
// 8. ONE-WORD SYNONYM TRANSLATIONS (4 routes)
// Permission: one_word_synonym_translation.*
// ========================================

router.post(
  '/one-word-synonym-translations',
  authorize('one_word_synonym_translation.create'),
  validate(createOneWordSynonymTranslationSchema),
  ctrl.createOneWordSynonymTranslation
);

router.patch(
  '/one-word-synonym-translations/:id',
  authorize('one_word_synonym_translation.update'),
  validate(idParamSchema, 'params'),
  validate(updateOneWordSynonymTranslationSchema),
  ctrl.updateOneWordSynonymTranslation
);

router.delete(
  '/one-word-synonym-translations/:id',
  authorize('one_word_synonym_translation.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteOneWordSynonymTranslation
);

router.post(
  '/one-word-synonym-translations/:id/restore',
  authorize('one_word_synonym_translation.update'),
  validate(idParamSchema, 'params'),
  ctrl.restoreOneWordSynonymTranslation
);

// ========================================
// 9. DESCRIPTIVE QUESTIONS (6 routes)
// Permission: descriptive_question.*
// ========================================

router.get(
  '/descriptive-questions',
  authorize('descriptive_question.read'),
  validate(descriptiveQuestionListQuerySchema, 'query'),
  ctrl.getDescriptiveQuestions
);

router.get(
  '/descriptive-questions/:id',
  authorize('descriptive_question.read'),
  validate(idParamSchema, 'params'),
  ctrl.getDescriptiveQuestionById
);

router.post(
  '/descriptive-questions',
  authorize('descriptive_question.create'),
  validate(createDescriptiveQuestionSchema),
  ctrl.createDescriptiveQuestion
);

router.patch(
  '/descriptive-questions/:id',
  authorize('descriptive_question.update'),
  validate(idParamSchema, 'params'),
  validate(updateDescriptiveQuestionSchema),
  ctrl.updateDescriptiveQuestion
);

router.delete(
  '/descriptive-questions/:id',
  authorize('descriptive_question.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteDescriptiveQuestion
);

router.post(
  '/descriptive-questions/:id/restore',
  authorize('descriptive_question.update'),
  validate(idParamSchema, 'params'),
  ctrl.restoreDescriptiveQuestion
);

// ========================================
// 10. DESCRIPTIVE QUESTION TRANSLATIONS (4 routes)
// Permission: descriptive_question_translation.*
// ========================================

router.post(
  '/descriptive-question-translations',
  authorize('descriptive_question_translation.create'),
  uploadDescriptiveTranslationImages,
  validate(createDescriptiveQuestionTranslationSchema),
  ctrl.createDescriptiveQuestionTranslation
);

router.patch(
  '/descriptive-question-translations/:id',
  authorize('descriptive_question_translation.update'),
  validate(idParamSchema, 'params'),
  uploadDescriptiveTranslationImages,
  validate(updateDescriptiveQuestionTranslationSchema),
  ctrl.updateDescriptiveQuestionTranslation
);

router.delete(
  '/descriptive-question-translations/:id',
  authorize('descriptive_question_translation.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteDescriptiveQuestionTranslation
);

router.post(
  '/descriptive-question-translations/:id/restore',
  authorize('descriptive_question_translation.update'),
  validate(idParamSchema, 'params'),
  ctrl.restoreDescriptiveQuestionTranslation
);

// ========================================
// 11. MATCHING QUESTIONS (6 routes)
// Permission: matching_question.*
// ========================================

router.get(
  '/matching-questions',
  authorize('matching_question.read'),
  validate(matchingQuestionListQuerySchema, 'query'),
  ctrl.getMatchingQuestions
);

router.get(
  '/matching-questions/:id',
  authorize('matching_question.read'),
  validate(idParamSchema, 'params'),
  ctrl.getMatchingQuestionById
);

router.post(
  '/matching-questions',
  authorize('matching_question.create'),
  validate(createMatchingQuestionSchema),
  ctrl.createMatchingQuestion
);

router.patch(
  '/matching-questions/:id',
  authorize('matching_question.update'),
  validate(idParamSchema, 'params'),
  validate(updateMatchingQuestionSchema),
  ctrl.updateMatchingQuestion
);

router.delete(
  '/matching-questions/:id',
  authorize('matching_question.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteMatchingQuestion
);

router.post(
  '/matching-questions/:id/restore',
  authorize('matching_question.update'),
  validate(idParamSchema, 'params'),
  ctrl.restoreMatchingQuestion
);

// ========================================
// 12. MATCHING PAIRS (4 routes)
// Permission: matching_pair.*
// ========================================

router.post(
  '/matching-pairs',
  authorize('matching_pair.create'),
  validate(createMatchingPairSchema),
  ctrl.createMatchingPair
);

router.patch(
  '/matching-pairs/:id',
  authorize('matching_pair.update'),
  validate(idParamSchema, 'params'),
  validate(updateMatchingPairSchema),
  ctrl.updateMatchingPair
);

router.delete(
  '/matching-pairs/:id',
  authorize('matching_pair.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteMatchingPair
);

router.post(
  '/matching-pairs/:id/restore',
  authorize('matching_pair.update'),
  validate(idParamSchema, 'params'),
  ctrl.restoreMatchingPair
);

// ========================================
// 13. ORDERING QUESTIONS (6 routes)
// Permission: ordering_question.*
// ========================================

router.get(
  '/ordering-questions',
  authorize('ordering_question.read'),
  validate(orderingQuestionListQuerySchema, 'query'),
  ctrl.getOrderingQuestions
);

router.get(
  '/ordering-questions/:id',
  authorize('ordering_question.read'),
  validate(idParamSchema, 'params'),
  ctrl.getOrderingQuestionById
);

router.post(
  '/ordering-questions',
  authorize('ordering_question.create'),
  validate(createOrderingQuestionSchema),
  ctrl.createOrderingQuestion
);

router.patch(
  '/ordering-questions/:id',
  authorize('ordering_question.update'),
  validate(idParamSchema, 'params'),
  validate(updateOrderingQuestionSchema),
  ctrl.updateOrderingQuestion
);

router.delete(
  '/ordering-questions/:id',
  authorize('ordering_question.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteOrderingQuestion
);

router.post(
  '/ordering-questions/:id/restore',
  authorize('ordering_question.update'),
  validate(idParamSchema, 'params'),
  ctrl.restoreOrderingQuestion
);

// ========================================
// 14. ORDERING ITEMS (4 routes)
// Permission: ordering_item.*
// ========================================

router.post(
  '/ordering-items',
  authorize('ordering_item.create'),
  validate(createOrderingItemSchema),
  ctrl.createOrderingItem
);

router.patch(
  '/ordering-items/:id',
  authorize('ordering_item.update'),
  validate(idParamSchema, 'params'),
  validate(updateOrderingItemSchema),
  ctrl.updateOrderingItem
);

router.delete(
  '/ordering-items/:id',
  authorize('ordering_item.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteOrderingItem
);

router.post(
  '/ordering-items/:id/restore',
  authorize('ordering_item.update'),
  validate(idParamSchema, 'params'),
  ctrl.restoreOrderingItem
);

module.exports = router;
