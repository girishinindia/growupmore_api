const express = require('express');
const validate = require('../../../middleware/validate.middleware');
const authenticate = require('../../../middleware/auth.middleware');
const { authorize } = require('../../../middleware/authorize.middleware');
const {
  idParamSchema,
  restoreSchema,
  bulkIdsSchema,
  createCouponSchema,
  updateCouponSchema,
  couponListQuerySchema,
  createCouponTranslationSchema,
  updateCouponTranslationSchema,
  createCouponCourseSchema,
  updateCouponCourseSchema,
  couponCourseListQuerySchema,
  createCouponBundleSchema,
  updateCouponBundleSchema,
  couponBundleListQuerySchema,
  createCouponBatchSchema,
  updateCouponBatchSchema,
  couponBatchListQuerySchema,
  createCouponWebinarSchema,
  updateCouponWebinarSchema,
  couponWebinarListQuerySchema,
} = require('../validators/couponManagement.validator');
const controller = require('../controllers/couponManagement.controller');

const router = express.Router();

// Apply authentication globally
router.use(authenticate);

// ============================================================================
// COUPONS
// ============================================================================

router.get(
  '/coupons',
  authorize('coupon.read'),
  validate(couponListQuerySchema, 'query'),
  controller.getCoupons
);

router.get(
  '/coupons/:id',
  authorize('coupon.read'),
  validate(idParamSchema, 'params'),
  controller.getCouponById
);

router.post(
  '/coupons',
  authorize('coupon.create'),
  validate(createCouponSchema),
  controller.createCoupon
);

router.patch(
  '/coupons/:id',
  authorize('coupon.update'),
  validate(idParamSchema, 'params'),
  validate(updateCouponSchema),
  controller.updateCoupon
);

router.delete(
  '/coupons/:id',
  authorize('coupon.delete'),
  validate(idParamSchema, 'params'),
  controller.deleteCoupon
);

router.post(
  '/coupons/:id/restore',
  authorize('coupon.update'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  controller.restoreCoupon
);

// ============================================================================
// COUPON TRANSLATIONS
// ============================================================================

router.post(
  '/coupon-translations',
  authorize('coupon_translation.create'),
  validate(createCouponTranslationSchema),
  controller.createCouponTranslation
);

router.patch(
  '/coupon-translations/:id',
  authorize('coupon_translation.update'),
  validate(idParamSchema, 'params'),
  validate(updateCouponTranslationSchema),
  controller.updateCouponTranslation
);

router.delete(
  '/coupon-translations/:id',
  authorize('coupon_translation.delete'),
  validate(idParamSchema, 'params'),
  controller.deleteCouponTranslation
);

router.post(
  '/coupon-translations/:id/restore',
  authorize('coupon_translation.update'),
  validate(idParamSchema, 'params'),
  controller.restoreCouponTranslation
);

// ============================================================================
// COUPON COURSES
// ============================================================================

router.get(
  '/coupon-courses',
  authorize('coupon_course.read'),
  validate(couponCourseListQuerySchema, 'query'),
  controller.getCouponCourses
);

router.post(
  '/coupon-courses/bulk-delete',
  authorize('coupon_course.delete'),
  validate(bulkIdsSchema),
  controller.deleteCouponCoursesBulk
);

router.post(
  '/coupon-courses/bulk-restore',
  authorize('coupon_course.update'),
  validate(bulkIdsSchema),
  controller.restoreCouponCoursesBulk
);

router.get(
  '/coupon-courses/:id',
  authorize('coupon_course.read'),
  validate(idParamSchema, 'params'),
  controller.getCouponCourseById
);

router.post(
  '/coupon-courses',
  authorize('coupon_course.create'),
  validate(createCouponCourseSchema),
  controller.createCouponCourse
);

router.patch(
  '/coupon-courses/:id',
  authorize('coupon_course.update'),
  validate(idParamSchema, 'params'),
  validate(updateCouponCourseSchema),
  controller.updateCouponCourse
);

router.delete(
  '/coupon-courses/:id',
  authorize('coupon_course.delete'),
  validate(idParamSchema, 'params'),
  controller.deleteCouponCourse
);

router.post(
  '/coupon-courses/:id/restore',
  authorize('coupon_course.update'),
  validate(idParamSchema, 'params'),
  controller.restoreCouponCourse
);

// ============================================================================
// COUPON BUNDLES
// ============================================================================

router.get(
  '/coupon-bundles',
  authorize('coupon_bundle.read'),
  validate(couponBundleListQuerySchema, 'query'),
  controller.getCouponBundles
);

router.post(
  '/coupon-bundles/bulk-delete',
  authorize('coupon_bundle.delete'),
  validate(bulkIdsSchema),
  controller.deleteCouponBundlesBulk
);

router.post(
  '/coupon-bundles/bulk-restore',
  authorize('coupon_bundle.update'),
  validate(bulkIdsSchema),
  controller.restoreCouponBundlesBulk
);

router.get(
  '/coupon-bundles/:id',
  authorize('coupon_bundle.read'),
  validate(idParamSchema, 'params'),
  controller.getCouponBundleById
);

router.post(
  '/coupon-bundles',
  authorize('coupon_bundle.create'),
  validate(createCouponBundleSchema),
  controller.createCouponBundle
);

router.patch(
  '/coupon-bundles/:id',
  authorize('coupon_bundle.update'),
  validate(idParamSchema, 'params'),
  validate(updateCouponBundleSchema),
  controller.updateCouponBundle
);

router.delete(
  '/coupon-bundles/:id',
  authorize('coupon_bundle.delete'),
  validate(idParamSchema, 'params'),
  controller.deleteCouponBundle
);

router.post(
  '/coupon-bundles/:id/restore',
  authorize('coupon_bundle.update'),
  validate(idParamSchema, 'params'),
  controller.restoreCouponBundle
);

// ============================================================================
// COUPON BATCHES
// ============================================================================

router.get(
  '/coupon-batches',
  authorize('coupon_batch.read'),
  validate(couponBatchListQuerySchema, 'query'),
  controller.getCouponBatches
);

router.post(
  '/coupon-batches/bulk-delete',
  authorize('coupon_batch.delete'),
  validate(bulkIdsSchema),
  controller.deleteCouponBatchesBulk
);

router.post(
  '/coupon-batches/bulk-restore',
  authorize('coupon_batch.update'),
  validate(bulkIdsSchema),
  controller.restoreCouponBatchesBulk
);

router.get(
  '/coupon-batches/:id',
  authorize('coupon_batch.read'),
  validate(idParamSchema, 'params'),
  controller.getCouponBatchById
);

router.post(
  '/coupon-batches',
  authorize('coupon_batch.create'),
  validate(createCouponBatchSchema),
  controller.createCouponBatch
);

router.patch(
  '/coupon-batches/:id',
  authorize('coupon_batch.update'),
  validate(idParamSchema, 'params'),
  validate(updateCouponBatchSchema),
  controller.updateCouponBatch
);

router.delete(
  '/coupon-batches/:id',
  authorize('coupon_batch.delete'),
  validate(idParamSchema, 'params'),
  controller.deleteCouponBatch
);

router.post(
  '/coupon-batches/:id/restore',
  authorize('coupon_batch.update'),
  validate(idParamSchema, 'params'),
  controller.restoreCouponBatch
);

// ============================================================================
// COUPON WEBINARS
// ============================================================================

router.get(
  '/coupon-webinars',
  authorize('coupon_webinar.read'),
  validate(couponWebinarListQuerySchema, 'query'),
  controller.getCouponWebinars
);

router.post(
  '/coupon-webinars/bulk-delete',
  authorize('coupon_webinar.delete'),
  validate(bulkIdsSchema),
  controller.deleteCouponWebinarsBulk
);

router.post(
  '/coupon-webinars/bulk-restore',
  authorize('coupon_webinar.update'),
  validate(bulkIdsSchema),
  controller.restoreCouponWebinarsBulk
);

router.get(
  '/coupon-webinars/:id',
  authorize('coupon_webinar.read'),
  validate(idParamSchema, 'params'),
  controller.getCouponWebinarById
);

router.post(
  '/coupon-webinars',
  authorize('coupon_webinar.create'),
  validate(createCouponWebinarSchema),
  controller.createCouponWebinar
);

router.patch(
  '/coupon-webinars/:id',
  authorize('coupon_webinar.update'),
  validate(idParamSchema, 'params'),
  validate(updateCouponWebinarSchema),
  controller.updateCouponWebinar
);

router.delete(
  '/coupon-webinars/:id',
  authorize('coupon_webinar.delete'),
  validate(idParamSchema, 'params'),
  controller.deleteCouponWebinar
);

router.post(
  '/coupon-webinars/:id/restore',
  authorize('coupon_webinar.update'),
  validate(idParamSchema, 'params'),
  controller.restoreCouponWebinar
);

module.exports = router;
