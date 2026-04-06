const { Router } = require('express');
const ctrl = require('../controllers/courseManagement.controller');
const validate = require('../../../middleware/validate.middleware');
const authenticate = require('../../../middleware/auth.middleware');
const { authorize } = require('../../../middleware/authorize.middleware');
const { createUpload, handleUploadError } = require('../../../middleware/upload.middleware');

// Import validator schemas
const {
  idParamSchema,
  restoreSchema,
  bulkIdsSchema,
  createCourseSchema,
  updateCourseSchema,
  courseListQuerySchema,
  createCourseTranslationSchema,
  updateCourseTranslationSchema,
  createCourseModuleSchema,
  updateCourseModuleSchema,
  courseModuleListQuerySchema,
  createCourseModuleTranslationSchema,
  updateCourseModuleTranslationSchema,
  createCourseModuleTopicSchema,
  updateCourseModuleTopicSchema,
  courseModuleTopicListQuerySchema,
  createCourseSubCategorySchema,
  updateCourseSubCategorySchema,
  createCourseSubjectSchema,
  updateCourseSubjectSchema,
  createCourseChapterSchema,
  updateCourseChapterSchema,
  createCourseInstructorSchema,
  updateCourseInstructorSchema,
  createBundleSchema,
  updateBundleSchema,
  bundleListQuerySchema,
  createBundleTranslationSchema,
  updateBundleTranslationSchema,
  createBundleCourseSchema,
  updateBundleCourseSchema,
  bundleCourseListQuerySchema,
} = require('../validators/courseManagement.validator');

const router = Router();
router.use(authenticate);

// ============================================================================
// Upload Middleware Instances
// ============================================================================

// For courses: trailerVideo, trailerThumbnail, video, brochure
const uploadCourseFiles = handleUploadError(
  createUpload().fields([
    { name: 'trailerVideo', maxCount: 1 },
    { name: 'trailerThumbnail', maxCount: 1 },
    { name: 'video', maxCount: 1 },
    { name: 'brochure', maxCount: 1 },
  ])
);

// For course translations: webThumbnail, webBanner, appThumbnail, appBanner, videoThumbnail
const uploadCourseTranslationImages = handleUploadError(
  createUpload().fields([
    { name: 'webThumbnail', maxCount: 1 },
    { name: 'webBanner', maxCount: 1 },
    { name: 'appThumbnail', maxCount: 1 },
    { name: 'appBanner', maxCount: 1 },
    { name: 'videoThumbnail', maxCount: 1 },
  ])
);

// For course module translations: icon, image
const uploadModuleTranslationImages = handleUploadError(
  createUpload().fields([
    { name: 'icon', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ])
);

// For bundle translations: thumbnail, banner
const uploadBundleTranslationImages = handleUploadError(
  createUpload().fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
  ])
);

// ============================================================================
// 1. COURSES (permission: course.*)
// ============================================================================

router.get(
  '/courses',
  authorize('course.read'),
  validate(courseListQuerySchema, 'query'),
  ctrl.getCourses
);

router.get(
  '/courses/:id',
  authorize('course.read'),
  validate(idParamSchema, 'params'),
  ctrl.getCourseById
);

router.post(
  '/courses',
  authorize('course.create'),
  uploadCourseFiles,
  validate(createCourseSchema),
  ctrl.createCourse
);

router.patch(
  '/courses/:id',
  authorize('course.update'),
  validate(idParamSchema, 'params'),
  uploadCourseFiles,
  validate(updateCourseSchema),
  ctrl.updateCourse
);

router.delete(
  '/courses/:id',
  authorize('course.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteCourse
);

router.post(
  '/courses/:id/restore',
  authorize('course.update'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreCourse
);

// ============================================================================
// 2. COURSE TRANSLATIONS (permission: course_translation.*)
// ============================================================================

router.post(
  '/course-translations',
  authorize('course_translation.create'),
  uploadCourseTranslationImages,
  validate(createCourseTranslationSchema),
  ctrl.createCourseTranslation
);

router.patch(
  '/course-translations/:id',
  authorize('course_translation.update'),
  validate(idParamSchema, 'params'),
  uploadCourseTranslationImages,
  validate(updateCourseTranslationSchema),
  ctrl.updateCourseTranslation
);

router.delete(
  '/course-translations/:id',
  authorize('course_translation.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteCourseTranslation
);

router.post(
  '/course-translations/:id/restore',
  authorize('course_translation.update'),
  validate(idParamSchema, 'params'),
  ctrl.restoreCourseTranslation
);

// ============================================================================
// 3. COURSE MODULES (permission: course_module.*)
// ============================================================================

router.get(
  '/course-modules',
  authorize('course_module.read'),
  validate(courseModuleListQuerySchema, 'query'),
  ctrl.getCourseModules
);

router.get(
  '/course-modules/:id',
  authorize('course_module.read'),
  validate(idParamSchema, 'params'),
  ctrl.getCourseModuleById
);

router.post(
  '/course-modules',
  authorize('course_module.create'),
  validate(createCourseModuleSchema),
  ctrl.createCourseModule
);

router.patch(
  '/course-modules/:id',
  authorize('course_module.update'),
  validate(idParamSchema, 'params'),
  validate(updateCourseModuleSchema),
  ctrl.updateCourseModule
);

router.delete(
  '/course-modules/:id',
  authorize('course_module.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteCourseModule
);

router.post(
  '/course-modules/:id/restore',
  authorize('course_module.update'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreCourseModule
);

// ============================================================================
// 4. COURSE MODULE TRANSLATIONS (permission: course_module_translation.*)
// ============================================================================

router.post(
  '/course-module-translations',
  authorize('course_module_translation.create'),
  uploadModuleTranslationImages,
  validate(createCourseModuleTranslationSchema),
  ctrl.createCourseModuleTranslation
);

router.patch(
  '/course-module-translations/:id',
  authorize('course_module_translation.update'),
  validate(idParamSchema, 'params'),
  uploadModuleTranslationImages,
  validate(updateCourseModuleTranslationSchema),
  ctrl.updateCourseModuleTranslation
);

router.delete(
  '/course-module-translations/:id',
  authorize('course_module_translation.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteCourseModuleTranslation
);

router.post(
  '/course-module-translations/:id/restore',
  authorize('course_module_translation.update'),
  validate(idParamSchema, 'params'),
  ctrl.restoreCourseModuleTranslation
);

// ============================================================================
// 5. COURSE MODULE TOPICS (permission: course_module_topic.*)
// ============================================================================

router.get(
  '/course-module-topics',
  authorize('course_module_topic.read'),
  validate(courseModuleTopicListQuerySchema, 'query'),
  ctrl.getCourseModuleTopics
);

router.get(
  '/course-module-topics/:id',
  authorize('course_module_topic.read'),
  validate(idParamSchema, 'params'),
  ctrl.getCourseModuleTopicById
);

router.post(
  '/course-module-topics',
  authorize('course_module_topic.create'),
  validate(createCourseModuleTopicSchema),
  ctrl.createCourseModuleTopic
);

router.patch(
  '/course-module-topics/:id',
  authorize('course_module_topic.update'),
  validate(idParamSchema, 'params'),
  validate(updateCourseModuleTopicSchema),
  ctrl.updateCourseModuleTopic
);

router.delete(
  '/course-module-topics/:id',
  authorize('course_module_topic.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteCourseModuleTopic
);

router.post(
  '/course-module-topics/bulk-delete',
  authorize('course_module_topic.delete'),
  validate(bulkIdsSchema),
  ctrl.deleteCourseModuleTopicsBulk
);

router.post(
  '/course-module-topics/:id/restore',
  authorize('course_module_topic.update'),
  validate(idParamSchema, 'params'),
  ctrl.restoreCourseModuleTopic
);

router.post(
  '/course-module-topics/bulk-restore',
  authorize('course_module_topic.update'),
  validate(bulkIdsSchema),
  ctrl.restoreCourseModuleTopicsBulk
);

// ============================================================================
// 6. COURSE SUB-CATEGORIES (permission: course_sub_category.*)
// ============================================================================

router.post(
  '/course-sub-categories',
  authorize('course_sub_category.create'),
  validate(createCourseSubCategorySchema),
  ctrl.createCourseSubCategory
);

router.patch(
  '/course-sub-categories/:id',
  authorize('course_sub_category.update'),
  validate(idParamSchema, 'params'),
  validate(updateCourseSubCategorySchema),
  ctrl.updateCourseSubCategory
);

router.delete(
  '/course-sub-categories/:id',
  authorize('course_sub_category.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteCourseSubCategory
);

router.post(
  '/course-sub-categories/:id/restore',
  authorize('course_sub_category.update'),
  validate(idParamSchema, 'params'),
  ctrl.restoreCourseSubCategory
);

// ============================================================================
// 7. COURSE SUBJECTS (permission: course_subject.*)
// ============================================================================

router.post(
  '/course-subjects',
  authorize('course_subject.create'),
  validate(createCourseSubjectSchema),
  ctrl.createCourseSubject
);

router.patch(
  '/course-subjects/:id',
  authorize('course_subject.update'),
  validate(idParamSchema, 'params'),
  validate(updateCourseSubjectSchema),
  ctrl.updateCourseSubject
);

router.delete(
  '/course-subjects/:id',
  authorize('course_subject.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteCourseSubject
);

router.post(
  '/course-subjects/:id/restore',
  authorize('course_subject.update'),
  validate(idParamSchema, 'params'),
  ctrl.restoreCourseSubject
);

// ============================================================================
// 8. COURSE CHAPTERS (permission: course_chapter.*)
// ============================================================================

router.post(
  '/course-chapters',
  authorize('course_chapter.create'),
  validate(createCourseChapterSchema),
  ctrl.createCourseChapter
);

router.patch(
  '/course-chapters/:id',
  authorize('course_chapter.update'),
  validate(idParamSchema, 'params'),
  validate(updateCourseChapterSchema),
  ctrl.updateCourseChapter
);

router.delete(
  '/course-chapters/:id',
  authorize('course_chapter.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteCourseChapter
);

router.post(
  '/course-chapters/:id/restore',
  authorize('course_chapter.update'),
  validate(idParamSchema, 'params'),
  ctrl.restoreCourseChapter
);

// ============================================================================
// 9. COURSE INSTRUCTORS (permission: course_instructor.*)
// ============================================================================

router.post(
  '/course-instructors',
  authorize('course_instructor.create'),
  validate(createCourseInstructorSchema),
  ctrl.createCourseInstructor
);

router.patch(
  '/course-instructors/:id',
  authorize('course_instructor.update'),
  validate(idParamSchema, 'params'),
  validate(updateCourseInstructorSchema),
  ctrl.updateCourseInstructor
);

router.delete(
  '/course-instructors/:id',
  authorize('course_instructor.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteCourseInstructor
);

router.post(
  '/course-instructors/:id/restore',
  authorize('course_instructor.update'),
  validate(idParamSchema, 'params'),
  ctrl.restoreCourseInstructor
);

// ============================================================================
// 10. BUNDLES (permission: bundle.*)
// ============================================================================

router.get(
  '/bundles',
  authorize('bundle.read'),
  validate(bundleListQuerySchema, 'query'),
  ctrl.getBundles
);

router.get(
  '/bundles/:id',
  authorize('bundle.read'),
  validate(idParamSchema, 'params'),
  ctrl.getBundleById
);

router.post(
  '/bundles',
  authorize('bundle.create'),
  validate(createBundleSchema),
  ctrl.createBundle
);

router.patch(
  '/bundles/:id',
  authorize('bundle.update'),
  validate(idParamSchema, 'params'),
  validate(updateBundleSchema),
  ctrl.updateBundle
);

router.delete(
  '/bundles/:id',
  authorize('bundle.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteBundle
);

router.delete(
  '/bundles/:id/single',
  authorize('bundle.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteBundleSingle
);

router.post(
  '/bundles/:id/restore',
  authorize('bundle.update'),
  validate(idParamSchema, 'params'),
  ctrl.restoreBundle
);

router.post(
  '/bundles/:id/restore-single',
  authorize('bundle.update'),
  validate(idParamSchema, 'params'),
  ctrl.restoreBundleSingle
);

// ============================================================================
// 11. BUNDLE TRANSLATIONS (permission: bundle_translation.*)
// ============================================================================

router.post(
  '/bundle-translations',
  authorize('bundle_translation.create'),
  uploadBundleTranslationImages,
  validate(createBundleTranslationSchema),
  ctrl.createBundleTranslation
);

router.patch(
  '/bundle-translations/:id',
  authorize('bundle_translation.update'),
  validate(idParamSchema, 'params'),
  uploadBundleTranslationImages,
  validate(updateBundleTranslationSchema),
  ctrl.updateBundleTranslation
);

router.post(
  '/bundle-translations/bulk-delete',
  authorize('bundle_translation.delete'),
  validate(bulkIdsSchema),
  ctrl.deleteBundleTranslationsBulk
);

router.post(
  '/bundle-translations/bulk-restore',
  authorize('bundle_translation.update'),
  validate(bulkIdsSchema),
  ctrl.restoreBundleTranslationsBulk
);

// ============================================================================
// 12. BUNDLE COURSES (permission: bundle_course.*)
// ============================================================================

router.get(
  '/bundle-courses',
  authorize('bundle_course.read'),
  validate(bundleCourseListQuerySchema, 'query'),
  ctrl.getBundleCourses
);

router.get(
  '/bundle-courses/:id',
  authorize('bundle_course.read'),
  validate(idParamSchema, 'params'),
  ctrl.getBundleCourseById
);

router.post(
  '/bundle-courses',
  authorize('bundle_course.create'),
  validate(createBundleCourseSchema),
  ctrl.createBundleCourse
);

router.patch(
  '/bundle-courses/:id',
  authorize('bundle_course.update'),
  validate(idParamSchema, 'params'),
  validate(updateBundleCourseSchema),
  ctrl.updateBundleCourse
);

router.delete(
  '/bundle-courses/:id',
  authorize('bundle_course.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteBundleCourse
);

router.post(
  '/bundle-courses/bulk-delete',
  authorize('bundle_course.delete'),
  validate(bulkIdsSchema),
  ctrl.deleteBundleCoursesBulk
);

router.post(
  '/bundle-courses/:id/restore',
  authorize('bundle_course.update'),
  validate(idParamSchema, 'params'),
  ctrl.restoreBundleCourse
);

router.post(
  '/bundle-courses/bulk-restore',
  authorize('bundle_course.update'),
  validate(bulkIdsSchema),
  ctrl.restoreBundleCoursesBulk
);

module.exports = router;
