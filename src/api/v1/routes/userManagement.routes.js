const { Router } = require('express');
const ctrl = require('../controllers/userManagement.controller');
const validate = require('../../../middleware/validate.middleware');
const authenticate = require('../../../middleware/auth.middleware');
const { authorize } = require('../../../middleware/authorize.middleware');
const { createUpload, handleUploadError } = require('../../../middleware/upload.middleware');

// Import all validator schemas
const {
  userListQuerySchema,
  createUserSchema,
  updateUserSchema,
  idParamSchema,
  userProfileListQuerySchema,
  createUserProfileSchema,
  updateUserProfileSchema,
  userEducationListQuerySchema,
  createUserEducationSchema,
  updateUserEducationSchema,
  userExperienceListQuerySchema,
  createUserExperienceSchema,
  updateUserExperienceSchema,
  userSocialMediaListQuerySchema,
  createUserSocialMediaSchema,
  updateUserSocialMediaSchema,
  userSkillListQuerySchema,
  createUserSkillSchema,
  updateUserSkillSchema,
  userLanguageListQuerySchema,
  createUserLanguageSchema,
  updateUserLanguageSchema,
  userDocumentListQuerySchema,
  createUserDocumentSchema,
  updateUserDocumentSchema,
  userProjectListQuerySchema,
  createUserProjectSchema,
  updateUserProjectSchema,
} = require('../validators/userManagement.validator');

const router = Router();
router.use(authenticate);

// Upload middleware instances
const uploadProfileImages = handleUploadError(
  createUpload().fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'coverPhoto', maxCount: 1 },
  ])
);
const uploadCertificate = handleUploadError(createUpload().single('certificate'));
const uploadDocumentFile = handleUploadError(createUpload().single('documentFile'));
const uploadThumbnail = handleUploadError(createUpload().single('thumbnail'));

// ============================================================================
// USERS (5 routes)
// ============================================================================
router.get(
  '/users',
  authorize('user.read'),
  validate(userListQuerySchema, 'query'),
  ctrl.getUsers
);

router.get(
  '/users/:id',
  authorize('user.read'),
  validate(idParamSchema, 'params'),
  ctrl.getUserById
);

router.post(
  '/users',
  authorize('user.create'),
  validate(createUserSchema),
  ctrl.createUser
);

router.patch(
  '/users/:id',
  authorize('user.update'),
  validate(idParamSchema, 'params'),
  validate(updateUserSchema),
  ctrl.updateUser
);

router.delete(
  '/users/:id',
  authorize('user.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteUser
);

router.post(
  '/users/:id/restore',
  authorize('user.update'),
  validate(idParamSchema, 'params'),
  ctrl.restoreUser
);

// ============================================================================
// USER PROFILES (5 routes - with image upload middleware)
// ============================================================================
router.get(
  '/user-profiles',
  authorize('user_profile.read'),
  validate(userProfileListQuerySchema, 'query'),
  ctrl.getUserProfiles
);

router.get(
  '/user-profiles/:id',
  authorize('user_profile.read'),
  validate(idParamSchema, 'params'),
  ctrl.getUserProfileById
);

router.post(
  '/user-profiles',
  authorize('user_profile.create'),
  uploadProfileImages,
  validate(createUserProfileSchema),
  ctrl.createUserProfile
);

router.patch(
  '/user-profiles/:id',
  authorize('user_profile.update'),
  validate(idParamSchema, 'params'),
  uploadProfileImages,
  validate(updateUserProfileSchema),
  ctrl.updateUserProfile
);

router.delete(
  '/user-profiles/:id',
  authorize('user_profile.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteUserProfile
);

// ============================================================================
// USER EDUCATION (5 routes - with certificate upload)
// ============================================================================
router.get(
  '/user-education',
  authorize('user_education.read'),
  validate(userEducationListQuerySchema, 'query'),
  ctrl.getUserEducations
);

router.get(
  '/user-education/:id',
  authorize('user_education.read'),
  validate(idParamSchema, 'params'),
  ctrl.getUserEducationById
);

router.post(
  '/user-education',
  authorize('user_education.create'),
  uploadCertificate,
  validate(createUserEducationSchema),
  ctrl.createUserEducation
);

router.patch(
  '/user-education/:id',
  authorize('user_education.update'),
  validate(idParamSchema, 'params'),
  uploadCertificate,
  validate(updateUserEducationSchema),
  ctrl.updateUserEducation
);

router.delete(
  '/user-education/:id',
  authorize('user_education.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteUserEducation
);

// ============================================================================
// USER EXPERIENCE (5 routes - no file upload)
// ============================================================================
router.get(
  '/user-experience',
  authorize('user_experience.read'),
  validate(userExperienceListQuerySchema, 'query'),
  ctrl.getUserExperiences
);

router.get(
  '/user-experience/:id',
  authorize('user_experience.read'),
  validate(idParamSchema, 'params'),
  ctrl.getUserExperienceById
);

router.post(
  '/user-experience',
  authorize('user_experience.create'),
  validate(createUserExperienceSchema),
  ctrl.createUserExperience
);

router.patch(
  '/user-experience/:id',
  authorize('user_experience.update'),
  validate(idParamSchema, 'params'),
  validate(updateUserExperienceSchema),
  ctrl.updateUserExperience
);

router.delete(
  '/user-experience/:id',
  authorize('user_experience.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteUserExperience
);

// ============================================================================
// USER SOCIAL MEDIAS (5 routes - no file upload)
// ============================================================================
router.get(
  '/user-social-medias',
  authorize('user_social_media.read'),
  validate(userSocialMediaListQuerySchema, 'query'),
  ctrl.getUserSocialMedias
);

router.get(
  '/user-social-medias/:id',
  authorize('user_social_media.read'),
  validate(idParamSchema, 'params'),
  ctrl.getUserSocialMediaById
);

router.post(
  '/user-social-medias',
  authorize('user_social_media.create'),
  validate(createUserSocialMediaSchema),
  ctrl.createUserSocialMedia
);

router.patch(
  '/user-social-medias/:id',
  authorize('user_social_media.update'),
  validate(idParamSchema, 'params'),
  validate(updateUserSocialMediaSchema),
  ctrl.updateUserSocialMedia
);

router.delete(
  '/user-social-medias/:id',
  authorize('user_social_media.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteUserSocialMedia
);

// ============================================================================
// USER SKILLS (5 routes - with certificate upload)
// ============================================================================
router.get(
  '/user-skills',
  authorize('user_skill.read'),
  validate(userSkillListQuerySchema, 'query'),
  ctrl.getUserSkills
);

router.get(
  '/user-skills/:id',
  authorize('user_skill.read'),
  validate(idParamSchema, 'params'),
  ctrl.getUserSkillById
);

router.post(
  '/user-skills',
  authorize('user_skill.create'),
  uploadCertificate,
  validate(createUserSkillSchema),
  ctrl.createUserSkill
);

router.patch(
  '/user-skills/:id',
  authorize('user_skill.update'),
  validate(idParamSchema, 'params'),
  uploadCertificate,
  validate(updateUserSkillSchema),
  ctrl.updateUserSkill
);

router.delete(
  '/user-skills/:id',
  authorize('user_skill.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteUserSkill
);

// ============================================================================
// USER LANGUAGES (5 routes - no file upload)
// ============================================================================
router.get(
  '/user-languages',
  authorize('user_language.read'),
  validate(userLanguageListQuerySchema, 'query'),
  ctrl.getUserLanguages
);

router.get(
  '/user-languages/:id',
  authorize('user_language.read'),
  validate(idParamSchema, 'params'),
  ctrl.getUserLanguageById
);

router.post(
  '/user-languages',
  authorize('user_language.create'),
  validate(createUserLanguageSchema),
  ctrl.createUserLanguage
);

router.patch(
  '/user-languages/:id',
  authorize('user_language.update'),
  validate(idParamSchema, 'params'),
  validate(updateUserLanguageSchema),
  ctrl.updateUserLanguage
);

router.delete(
  '/user-languages/:id',
  authorize('user_language.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteUserLanguage
);

// ============================================================================
// USER DOCUMENTS (5 routes - with document file upload)
// ============================================================================
router.get(
  '/user-documents',
  authorize('user_document.read'),
  validate(userDocumentListQuerySchema, 'query'),
  ctrl.getUserDocuments
);

router.get(
  '/user-documents/:id',
  authorize('user_document.read'),
  validate(idParamSchema, 'params'),
  ctrl.getUserDocumentById
);

router.post(
  '/user-documents',
  authorize('user_document.create'),
  uploadDocumentFile,
  validate(createUserDocumentSchema),
  ctrl.createUserDocument
);

router.patch(
  '/user-documents/:id',
  authorize('user_document.update'),
  validate(idParamSchema, 'params'),
  uploadDocumentFile,
  validate(updateUserDocumentSchema),
  ctrl.updateUserDocument
);

router.delete(
  '/user-documents/:id',
  authorize('user_document.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteUserDocument
);

// ============================================================================
// USER PROJECTS (5 routes - with thumbnail upload)
// ============================================================================
router.get(
  '/user-projects',
  authorize('user_project.read'),
  validate(userProjectListQuerySchema, 'query'),
  ctrl.getUserProjects
);

router.get(
  '/user-projects/:id',
  authorize('user_project.read'),
  validate(idParamSchema, 'params'),
  ctrl.getUserProjectById
);

router.post(
  '/user-projects',
  authorize('user_project.create'),
  uploadThumbnail,
  validate(createUserProjectSchema),
  ctrl.createUserProject
);

router.patch(
  '/user-projects/:id',
  authorize('user_project.update'),
  validate(idParamSchema, 'params'),
  uploadThumbnail,
  validate(updateUserProjectSchema),
  ctrl.updateUserProject
);

router.delete(
  '/user-projects/:id',
  authorize('user_project.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteUserProject
);

module.exports = router;
