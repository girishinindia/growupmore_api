const { Router } = require('express');
const ctrl = require('../controllers/courseReviewManagement.controller');
const validate = require('../../../middleware/validate.middleware');
const authenticate = require('../../../middleware/auth.middleware');
const { authorize } = require('../../../middleware/authorize.middleware');

// Import validator schemas
const {
  idParamSchema,
  restoreSchema,
  bulkIdsSchema,
  createCourseReviewSchema,
  updateCourseReviewSchema,
  courseReviewListQuerySchema,
} = require('../validators/courseReviewManagement.validator');

const router = Router();
router.use(authenticate);

// ============================================================================
// COURSE REVIEWS (permission: course_review.*)
// ============================================================================

/**
 * GET /course-review-management/course-reviews
 * Retrieves list of course reviews with filtering and pagination
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {number} studentId - Filter by student ID
 * @query {number} courseId - Filter by course ID
 * @query {number} enrollmentId - Filter by enrollment ID
 * @query {number} rating - Filter by exact rating
 * @query {number} minRating - Filter by minimum rating
 * @query {number} maxRating - Filter by maximum rating
 * @query {string} reviewStatus - Filter by review status (pending, approved, rejected)
 * @query {boolean} isVerifiedPurchase - Filter by verified purchase
 * @query {boolean} isActive - Filter by active status
 * @query {string} searchTerm - Search in title and review text
 * @query {string} sortBy - Sort column (default: reviewed_at)
 * @query {string} sortDir - Sort direction (ASC or DESC, default: ASC)
 */
router.get(
  '/course-reviews',
  authorize('course_review.read'),
  validate(courseReviewListQuerySchema, 'query'),
  ctrl.getCourseReviews
);

/**
 * GET /course-review-management/course-reviews/bulk-delete
 * Note: Bulk operations should be DELETE, but we handle via POST for payload
 * This is handled via POST /course-reviews/bulk-delete
 */

/**
 * POST /course-review-management/course-reviews/bulk-delete
 * Soft deletes multiple course reviews in bulk
 * @body {Array<number>} ids - Array of review IDs to delete
 */
router.post(
  '/course-reviews/bulk-delete',
  authorize('course_review.delete'),
  validate(bulkIdsSchema),
  ctrl.bulkDeleteCourseReviews
);

/**
 * POST /course-review-management/course-reviews/bulk-restore
 * Restores multiple deleted course reviews in bulk
 * @body {Array<number>} ids - Array of review IDs to restore
 */
router.post(
  '/course-reviews/bulk-restore',
  authorize('course_review.update'),
  validate(bulkIdsSchema),
  ctrl.bulkRestoreCourseReviews
);

/**
 * GET /course-review-management/course-reviews/:id
 * Retrieves a single course review by ID
 * @param {number} id - Review ID
 */
router.get(
  '/course-reviews/:id',
  authorize('course_review.read'),
  validate(idParamSchema, 'params'),
  ctrl.getCourseReviewById
);

/**
 * POST /course-review-management/course-reviews
 * Creates a new course review
 * @body {number} studentId - Student ID (required)
 * @body {number} courseId - Course ID (required)
 * @body {number} enrollmentId - Enrollment ID (required)
 * @body {number} rating - Rating 1-5 (required)
 * @body {string} title - Review title (optional)
 * @body {string} reviewText - Review text (optional)
 * @body {boolean} isVerifiedPurchase - Is verified purchase (default: true)
 */
router.post(
  '/course-reviews',
  authorize('course_review.create'),
  validate(createCourseReviewSchema),
  ctrl.createCourseReview
);

/**
 * PATCH /course-review-management/course-reviews/:id
 * Updates an existing course review
 * @param {number} id - Review ID
 * @body {number} rating - Rating 1-5 (optional)
 * @body {string} title - Review title (optional)
 * @body {string} reviewText - Review text (optional)
 * @body {string} reviewStatus - Review status (pending, approved, rejected)
 * @body {boolean} isVerifiedPurchase - Is verified purchase (optional)
 * @body {number} helpfulCount - Helpful count (optional)
 * @body {number} reportedCount - Reported count (optional)
 * @body {number} approvedBy - User ID of approver (optional)
 * @body {string} approvedAt - Approval timestamp (optional)
 */
router.patch(
  '/course-reviews/:id',
  authorize('course_review.update'),
  validate(idParamSchema, 'params'),
  validate(updateCourseReviewSchema),
  ctrl.updateCourseReview
);

/**
 * DELETE /course-review-management/course-reviews/:id
 * Soft deletes a single course review
 * @param {number} id - Review ID
 */
router.delete(
  '/course-reviews/:id',
  authorize('course_review.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteCourseReview
);

/**
 * POST /course-review-management/course-reviews/:id/restore
 * Restores a single deleted course review
 * @param {number} id - Review ID
 */
router.post(
  '/course-reviews/:id/restore',
  authorize('course_review.update'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreCourseReview
);

module.exports = router;
