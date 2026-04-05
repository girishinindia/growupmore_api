/**
 * ═══════════════════════════════════════════════════════════════
 * MASTER DATA EXTENDED ROUTES — 11 Entities (55 CRUD Routes)
 * ═══════════════════════════════════════════════════════════════
 * Skills, Languages, Education Levels, Document Types, Documents,
 * Designations, Specializations, Learning Goals, Social Medias,
 * Categories, Sub Categories
 * ═══════════════════════════════════════════════════════════════
 */

const { Router } = require('express');
const ctrl = require('../controllers/masterDataExtended.controller');
const validate = require('../../../middleware/validate.middleware');
const authenticate = require('../../../middleware/auth.middleware');
const { authorize } = require('../../../middleware/authorize.middleware');
const { createUpload, handleUploadError } = require('../../../middleware/upload.middleware');

const {
  idParamSchema,
  createSkillSchema,
  updateSkillSchema,
  skillListQuerySchema,
  createLanguageSchema,
  updateLanguageSchema,
  languageListQuerySchema,
  createEducationLevelSchema,
  updateEducationLevelSchema,
  educationLevelListQuerySchema,
  createDocumentTypeSchema,
  updateDocumentTypeSchema,
  documentTypeListQuerySchema,
  createDocumentSchema,
  updateDocumentSchema,
  documentListQuerySchema,
  createDesignationSchema,
  updateDesignationSchema,
  designationListQuerySchema,
  createSpecializationSchema,
  updateSpecializationSchema,
  specializationListQuerySchema,
  createLearningGoalSchema,
  updateLearningGoalSchema,
  learningGoalListQuerySchema,
  createSocialMediaSchema,
  updateSocialMediaSchema,
  socialMediaListQuerySchema,
  createCategorySchema,
  updateCategorySchema,
  categoryListQuerySchema,
  createSubCategorySchema,
  updateSubCategorySchema,
  subCategoryListQuerySchema,
} = require('../validators/masterDataExtended.validator');

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// ─── Upload middleware instances ────────────────────────────────

const upload = createUpload();
const uploadIcon = handleUploadError(upload.single('iconImage'));
const uploadCategoryImages = handleUploadError(upload.fields([
  { name: 'iconImage', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
]));

// ============================================================================
// SKILLS ROUTES (with icon upload)
// ============================================================================

router.get('/skills', authorize('skill.read'), validate(skillListQuerySchema, 'query'), ctrl.getSkills);
router.get('/skills/:id', authorize('skill.read'), validate(idParamSchema, 'params'), ctrl.getSkillById);
router.post('/skills', authorize('skill.create'), uploadIcon, validate(createSkillSchema), ctrl.createSkill);
router.put('/skills/:id', authorize('skill.update'), validate(idParamSchema, 'params'), uploadIcon, validate(updateSkillSchema), ctrl.updateSkill);
router.delete('/skills/:id', authorize('skill.delete'), validate(idParamSchema, 'params'), ctrl.deleteSkill);

// ============================================================================
// LANGUAGES ROUTES (NO upload)
// ============================================================================

router.get('/languages', authorize('language.read'), validate(languageListQuerySchema, 'query'), ctrl.getLanguages);
router.get('/languages/:id', authorize('language.read'), validate(idParamSchema, 'params'), ctrl.getLanguageById);
router.post('/languages', authorize('language.create'), validate(createLanguageSchema), ctrl.createLanguage);
router.put('/languages/:id', authorize('language.update'), validate(idParamSchema, 'params'), validate(updateLanguageSchema), ctrl.updateLanguage);
router.delete('/languages/:id', authorize('language.delete'), validate(idParamSchema, 'params'), ctrl.deleteLanguage);

// ============================================================================
// EDUCATION LEVELS ROUTES (NO upload)
// ============================================================================

router.get('/education-levels', authorize('education_level.read'), validate(educationLevelListQuerySchema, 'query'), ctrl.getEducationLevels);
router.get('/education-levels/:id', authorize('education_level.read'), validate(idParamSchema, 'params'), ctrl.getEducationLevelById);
router.post('/education-levels', authorize('education_level.create'), validate(createEducationLevelSchema), ctrl.createEducationLevel);
router.put('/education-levels/:id', authorize('education_level.update'), validate(idParamSchema, 'params'), validate(updateEducationLevelSchema), ctrl.updateEducationLevel);
router.delete('/education-levels/:id', authorize('education_level.delete'), validate(idParamSchema, 'params'), ctrl.deleteEducationLevel);

// ============================================================================
// DOCUMENT TYPES ROUTES (NO upload)
// ============================================================================

router.get('/document-types', authorize('document_type.read'), validate(documentTypeListQuerySchema, 'query'), ctrl.getDocumentTypes);
router.get('/document-types/:id', authorize('document_type.read'), validate(idParamSchema, 'params'), ctrl.getDocumentTypeById);
router.post('/document-types', authorize('document_type.create'), validate(createDocumentTypeSchema), ctrl.createDocumentType);
router.put('/document-types/:id', authorize('document_type.update'), validate(idParamSchema, 'params'), validate(updateDocumentTypeSchema), ctrl.updateDocumentType);
router.delete('/document-types/:id', authorize('document_type.delete'), validate(idParamSchema, 'params'), ctrl.deleteDocumentType);

// ============================================================================
// DOCUMENTS ROUTES (NO upload)
// ============================================================================

router.get('/documents', authorize('document.read'), validate(documentListQuerySchema, 'query'), ctrl.getDocuments);
router.get('/documents/:id', authorize('document.read'), validate(idParamSchema, 'params'), ctrl.getDocumentById);
router.post('/documents', authorize('document.create'), validate(createDocumentSchema), ctrl.createDocument);
router.put('/documents/:id', authorize('document.update'), validate(idParamSchema, 'params'), validate(updateDocumentSchema), ctrl.updateDocument);
router.delete('/documents/:id', authorize('document.delete'), validate(idParamSchema, 'params'), ctrl.deleteDocument);

// ============================================================================
// DESIGNATIONS ROUTES (NO upload)
// ============================================================================

router.get('/designations', authorize('designation.read'), validate(designationListQuerySchema, 'query'), ctrl.getDesignations);
router.get('/designations/:id', authorize('designation.read'), validate(idParamSchema, 'params'), ctrl.getDesignationById);
router.post('/designations', authorize('designation.create'), validate(createDesignationSchema), ctrl.createDesignation);
router.put('/designations/:id', authorize('designation.update'), validate(idParamSchema, 'params'), validate(updateDesignationSchema), ctrl.updateDesignation);
router.delete('/designations/:id', authorize('designation.delete'), validate(idParamSchema, 'params'), ctrl.deleteDesignation);

// ============================================================================
// SPECIALIZATIONS ROUTES (with icon upload)
// ============================================================================

router.get('/specializations', authorize('specialization.read'), validate(specializationListQuerySchema, 'query'), ctrl.getSpecializations);
router.get('/specializations/:id', authorize('specialization.read'), validate(idParamSchema, 'params'), ctrl.getSpecializationById);
router.post('/specializations', authorize('specialization.create'), uploadIcon, validate(createSpecializationSchema), ctrl.createSpecialization);
router.put('/specializations/:id', authorize('specialization.update'), validate(idParamSchema, 'params'), uploadIcon, validate(updateSpecializationSchema), ctrl.updateSpecialization);
router.delete('/specializations/:id', authorize('specialization.delete'), validate(idParamSchema, 'params'), ctrl.deleteSpecialization);

// ============================================================================
// LEARNING GOALS ROUTES (with icon upload)
// ============================================================================

router.get('/learning-goals', authorize('learning_goal.read'), validate(learningGoalListQuerySchema, 'query'), ctrl.getLearningGoals);
router.get('/learning-goals/:id', authorize('learning_goal.read'), validate(idParamSchema, 'params'), ctrl.getLearningGoalById);
router.post('/learning-goals', authorize('learning_goal.create'), uploadIcon, validate(createLearningGoalSchema), ctrl.createLearningGoal);
router.put('/learning-goals/:id', authorize('learning_goal.update'), validate(idParamSchema, 'params'), uploadIcon, validate(updateLearningGoalSchema), ctrl.updateLearningGoal);
router.delete('/learning-goals/:id', authorize('learning_goal.delete'), validate(idParamSchema, 'params'), ctrl.deleteLearningGoal);

// ============================================================================
// SOCIAL MEDIAS ROUTES (with icon upload)
// ============================================================================

router.get('/social-medias', authorize('social_media.read'), validate(socialMediaListQuerySchema, 'query'), ctrl.getSocialMedias);
router.get('/social-medias/:id', authorize('social_media.read'), validate(idParamSchema, 'params'), ctrl.getSocialMediaById);
router.post('/social-medias', authorize('social_media.create'), uploadIcon, validate(createSocialMediaSchema), ctrl.createSocialMedia);
router.put('/social-medias/:id', authorize('social_media.update'), validate(idParamSchema, 'params'), uploadIcon, validate(updateSocialMediaSchema), ctrl.updateSocialMedia);
router.delete('/social-medias/:id', authorize('social_media.delete'), validate(idParamSchema, 'params'), ctrl.deleteSocialMedia);

// ============================================================================
// CATEGORIES ROUTES (with icon + cover image upload)
// ============================================================================

router.get('/categories', authorize('category.read'), validate(categoryListQuerySchema, 'query'), ctrl.getCategories);
router.get('/categories/:id', authorize('category.read'), validate(idParamSchema, 'params'), ctrl.getCategoryById);
router.post('/categories', authorize('category.create'), uploadCategoryImages, validate(createCategorySchema), ctrl.createCategory);
router.put('/categories/:id', authorize('category.update'), validate(idParamSchema, 'params'), uploadCategoryImages, validate(updateCategorySchema), ctrl.updateCategory);
router.delete('/categories/:id', authorize('category.delete'), validate(idParamSchema, 'params'), ctrl.deleteCategory);

// ============================================================================
// SUB CATEGORIES ROUTES (with icon + cover image upload)
// ============================================================================

router.get('/sub-categories', authorize('sub_category.read'), validate(subCategoryListQuerySchema, 'query'), ctrl.getSubCategories);
router.get('/sub-categories/:id', authorize('sub_category.read'), validate(idParamSchema, 'params'), ctrl.getSubCategoryById);
router.post('/sub-categories', authorize('sub_category.create'), uploadCategoryImages, validate(createSubCategorySchema), ctrl.createSubCategory);
router.put('/sub-categories/:id', authorize('sub_category.update'), validate(idParamSchema, 'params'), uploadCategoryImages, validate(updateSubCategorySchema), ctrl.updateSubCategory);
router.delete('/sub-categories/:id', authorize('sub_category.delete'), validate(idParamSchema, 'params'), ctrl.deleteSubCategory);

module.exports = router;
