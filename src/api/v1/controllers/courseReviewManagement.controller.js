const courseReviewManagementService = require('../../../services/courseReviewManagement.service');
const { sendSuccess, sendCreated } = require('../../../utils/response');

class CourseReviewManagementController {
  // ============ COURSE REVIEWS ============

  /**
   * getCourseReviews
   * Retrieves a list of course reviews with filtering and pagination
   */
  async getCourseReviews(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        studentId,
        courseId,
        enrollmentId,
        rating,
        minRating,
        maxRating,
        reviewStatus,
        isVerifiedPurchase,
        isActive,
        searchTerm,
        sortBy,
        sortDir,
      } = req.query;

      const data = await courseReviewManagementService.getCourseReviews({
        studentId: studentId || null,
        courseId: courseId || null,
        enrollmentId: enrollmentId || null,
        rating: rating || null,
        minRating: minRating || null,
        maxRating: maxRating || null,
        reviewStatus: reviewStatus || null,
        isVerifiedPurchase: isVerifiedPurchase || null,
        isActive: isActive || null,
        searchTerm: searchTerm || null,
        sortBy: sortBy || 'reviewed_at',
        sortDir: sortDir || 'ASC',
        page: Number(page),
        limit: Number(limit),
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, { data, message: 'Course reviews retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  /**
   * getCourseReviewById
   * Retrieves a single course review by ID
   */
  async getCourseReviewById(req, res, next) {
    try {
      const data = await courseReviewManagementService.getCourseReviewById(req.params.id);
      sendSuccess(res, { data, message: 'Course review retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * createCourseReview
   * Creates a new course review
   */
  async createCourseReview(req, res, next) {
    try {
      const data = await courseReviewManagementService.createCourseReview(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Course review created successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * updateCourseReview
   * Updates an existing course review
   */
  async updateCourseReview(req, res, next) {
    try {
      const data = await courseReviewManagementService.updateCourseReview(
        req.params.id,
        req.body,
        req.user.userId
      );
      sendSuccess(res, { data, message: 'Course review updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * deleteCourseReview
   * Soft deletes a single course review
   */
  async deleteCourseReview(req, res, next) {
    try {
      await courseReviewManagementService.deleteCourseReview(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Course review deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * bulkDeleteCourseReviews
   * Soft deletes multiple course reviews in bulk
   */
  async bulkDeleteCourseReviews(req, res, next) {
    try {
      const { ids } = req.body;
      await courseReviewManagementService.bulkDeleteCourseReviews(ids, req.user.userId);
      sendSuccess(res, { message: 'Course reviews deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * restoreCourseReview
   * Restores a single deleted course review
   */
  async restoreCourseReview(req, res, next) {
    try {
      await courseReviewManagementService.restoreCourseReview(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Course review restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * bulkRestoreCourseReviews
   * Restores multiple deleted course reviews in bulk
   */
  async bulkRestoreCourseReviews(req, res, next) {
    try {
      const { ids } = req.body;
      await courseReviewManagementService.bulkRestoreCourseReviews(ids, req.user.userId);
      sendSuccess(res, { message: 'Course reviews restored successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CourseReviewManagementController();
