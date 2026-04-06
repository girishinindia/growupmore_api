/**
 * ═══════════════════════════════════════════════════════════════
 * PROMOTION MANAGEMENT ROUTES
 * ═══════════════════════════════════════════════════════════════
 * Instructor Promotions, Translations, Courses
 * ═══════════════════════════════════════════════════════════════
 */

const { Router } = require('express');
const ctrl = require('../controllers/promotionManagement.controller');
const validate = require('../../../middleware/validate.middleware');
const authenticate = require('../../../middleware/auth.middleware');
const { authorize } = require('../../../middleware/authorize.middleware');

const {
  idParamSchema,
  createInstructorPromotionSchema,
  updateInstructorPromotionSchema,
  instructorPromotionListQuerySchema,
  createInstructorPromotionTranslationSchema,
  updateInstructorPromotionTranslationSchema,
  createInstructorPromotionCourseSchema,
  updateInstructorPromotionCourseSchema,
  promotionCourseListQuerySchema,
} = require('../validators/promotionManagement.validator');

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// ============================================================================
// INSTRUCTOR PROMOTIONS ROUTES
// ============================================================================

router.get(
  '/instructor-promotions',
  authorize('instructor_promotion.read'),
  validate(instructorPromotionListQuerySchema, 'query'),
  ctrl.getInstructorPromotions
);

router.get(
  '/instructor-promotions/:id',
  authorize('instructor_promotion.read'),
  validate(idParamSchema, 'params'),
  ctrl.getInstructorPromotionById
);

router.post(
  '/instructor-promotions',
  authorize('instructor_promotion.create'),
  validate(createInstructorPromotionSchema),
  ctrl.createInstructorPromotion
);

router.patch(
  '/instructor-promotions/:id',
  authorize('instructor_promotion.update'),
  validate(idParamSchema, 'params'),
  validate(updateInstructorPromotionSchema),
  ctrl.updateInstructorPromotion
);

router.delete(
  '/instructor-promotions/:id',
  authorize('instructor_promotion.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteInstructorPromotion
);

router.post(
  '/instructor-promotions/:id/restore',
  authorize('instructor_promotion.update'),
  validate(idParamSchema, 'params'),
  ctrl.restoreInstructorPromotion
);

// ============================================================================
// INSTRUCTOR PROMOTION TRANSLATIONS ROUTES
// ============================================================================

router.get(
  '/instructor-promotions/:promotionId/translations',
  authorize('instructor_promotion_translation.read'),
  validate(
    { promotionId: require('zod').z.string().regex(/^\d+$/).transform(Number) },
    'params'
  ),
  ctrl.getInstructorPromotionTranslations
);

router.get(
  '/instructor-promotion-translations/:id',
  authorize('instructor_promotion_translation.read'),
  validate(idParamSchema, 'params'),
  ctrl.getInstructorPromotionTranslationById
);

router.post(
  '/instructor-promotion-translations',
  authorize('instructor_promotion_translation.create'),
  validate(createInstructorPromotionTranslationSchema),
  ctrl.createInstructorPromotionTranslation
);

router.patch(
  '/instructor-promotion-translations/:id',
  authorize('instructor_promotion_translation.update'),
  validate(idParamSchema, 'params'),
  validate(updateInstructorPromotionTranslationSchema),
  ctrl.updateInstructorPromotionTranslation
);

router.delete(
  '/instructor-promotion-translations/:id',
  authorize('instructor_promotion_translation.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteInstructorPromotionTranslation
);

router.post(
  '/instructor-promotion-translations/:id/restore',
  authorize('instructor_promotion_translation.update'),
  validate(idParamSchema, 'params'),
  ctrl.restoreInstructorPromotionTranslation
);

// ============================================================================
// INSTRUCTOR PROMOTION COURSES ROUTES
// ============================================================================

router.get(
  '/instructor-promotion-courses',
  authorize('instructor_promotion_course.read'),
  validate(promotionCourseListQuerySchema, 'query'),
  ctrl.getInstructorPromotionCourses
);

router.get(
  '/instructor-promotion-courses/:id',
  authorize('instructor_promotion_course.read'),
  validate(idParamSchema, 'params'),
  ctrl.getInstructorPromotionCourseById
);

router.post(
  '/instructor-promotion-courses',
  authorize('instructor_promotion_course.create'),
  validate(createInstructorPromotionCourseSchema),
  ctrl.createInstructorPromotionCourse
);

router.patch(
  '/instructor-promotion-courses/:id',
  authorize('instructor_promotion_course.update'),
  validate(idParamSchema, 'params'),
  validate(updateInstructorPromotionCourseSchema),
  ctrl.updateInstructorPromotionCourse
);

router.delete(
  '/instructor-promotion-courses/:id',
  authorize('instructor_promotion_course.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteInstructorPromotionCourse
);

router.post(
  '/instructor-promotion-courses/:id/restore',
  authorize('instructor_promotion_course.update'),
  validate(idParamSchema, 'params'),
  ctrl.restoreInstructorPromotionCourse
);

module.exports = router;
