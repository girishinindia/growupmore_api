const courseReviewManagementRepository = require('../repositories/courseReviewManagement.repository');
const logger = require('../config/logger');
const { BadRequestError, NotFoundError } = require('../utils/errors');

class CourseReviewManagementService {
  // ─────────────────────────────────────────────────────────────
  // LIST — Course Reviews
  // ─────────────────────────────────────────────────────────────

  /**
   * getCourseReviews
   * Fetches a list of course reviews with filtering and pagination
   * @param {Object} options
   * @returns {Array} course reviews with pagination metadata
   */
  async getCourseReviews(options = {}) {
    try {
      const {
        studentId = null,
        courseId = null,
        enrollmentId = null,
        rating = null,
        minRating = null,
        maxRating = null,
        reviewStatus = null,
        isVerifiedPurchase = null,
        isActive = null,
        searchTerm = null,
        sortBy = 'reviewed_at',
        sortDir = 'ASC',
        page = 1,
        limit = 20,
      } = options;

      const repoOptions = {
        filterStudentId: studentId,
        filterCourseId: courseId,
        filterEnrollmentId: enrollmentId,
        filterRating: rating,
        filterMinRating: minRating,
        filterMaxRating: maxRating,
        filterReviewStatus: reviewStatus,
        filterIsVerifiedPurchase: isVerifiedPurchase,
        filterIsActive: isActive,
        filterIsDeleted: false,
        searchTerm,
        sortTable: 'review',
        sortColumn: sortBy,
        sortDirection: sortDir,
        pageIndex: page - 1,
        pageSize: limit,
      };

      return await courseReviewManagementRepository.getCourseReviews(repoOptions);
    } catch (error) {
      logger.error('Error fetching course reviews:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // READ — Single Review by ID
  // ─────────────────────────────────────────────────────────────

  /**
   * getCourseReviewById
   * Fetches a single course review by ID
   * @param {number} id
   * @returns {Object} course review
   */
  async getCourseReviewById(id) {
    try {
      if (!id) throw new BadRequestError('Review ID is required');

      const result = await courseReviewManagementRepository.findCourseReviewById(id);
      if (!result) throw new NotFoundError('Course review not found');

      return result;
    } catch (error) {
      logger.error(`Error fetching course review ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — New Course Review
  // ─────────────────────────────────────────────────────────────

  /**
   * createCourseReview
   * Creates a new course review
   * @param {Object} reviewData
   * @param {number} actingUserId
   * @returns {Object} created review
   */
  async createCourseReview(reviewData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!reviewData.studentId) throw new BadRequestError('Student ID is required');
      if (!reviewData.courseId) throw new BadRequestError('Course ID is required');
      if (!reviewData.enrollmentId) throw new BadRequestError('Enrollment ID is required');
      if (!reviewData.rating) throw new BadRequestError('Rating is required');

      const payload = {
        ...reviewData,
        createdBy: actingUserId,
      };

      const created = await courseReviewManagementRepository.createCourseReview(payload);
      logger.info(`Course review created: ${created.id}`, { createdBy: actingUserId });

      return created;
    } catch (error) {
      logger.error('Error creating course review:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — Existing Course Review
  // ─────────────────────────────────────────────────────────────

  /**
   * updateCourseReview
   * Updates an existing course review
   * @param {number} id
   * @param {Object} updates
   * @param {number} actingUserId
   * @returns {Object} updated review
   */
  async updateCourseReview(id, updates, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Review ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await courseReviewManagementRepository.findCourseReviewById(id);
      if (!existing) throw new NotFoundError('Course review not found');

      const payload = {
        ...updates,
        updatedBy: actingUserId,
      };

      const updated = await courseReviewManagementRepository.updateCourseReview(id, payload);
      logger.info(`Course review updated: ${id}`, { updatedBy: actingUserId });

      return updated;
    } catch (error) {
      logger.error(`Error updating course review ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — Single Course Review
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteCourseReview
   * Soft deletes a single course review
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async deleteCourseReview(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Review ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await courseReviewManagementRepository.findCourseReviewById(id);
      if (!existing) throw new NotFoundError('Course review not found');

      await courseReviewManagementRepository.deleteCourseReview(id);
      logger.info(`Course review deleted: ${id}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting course review ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BULK DELETE — Multiple Course Reviews
  // ─────────────────────────────────────────────────────────────

  /**
   * bulkDeleteCourseReviews
   * Soft deletes multiple course reviews in bulk
   * @param {Array<number>} ids
   * @param {number} actingUserId
   * @returns {void}
   */
  async bulkDeleteCourseReviews(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('At least one review ID is required');
      }
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await courseReviewManagementRepository.deleteCourseReviews(ids);
      logger.info(`Course reviews bulk deleted: ${ids.length} reviews`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error('Error bulk deleting course reviews:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — Single Course Review
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreCourseReview
   * Restores a single deleted course review
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async restoreCourseReview(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Review ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await courseReviewManagementRepository.restoreCourseReview(id);
      logger.info(`Course review restored: ${id}`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error(`Error restoring course review ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BULK RESTORE — Multiple Course Reviews
  // ─────────────────────────────────────────────────────────────

  /**
   * bulkRestoreCourseReviews
   * Restores multiple deleted course reviews in bulk
   * @param {Array<number>} ids
   * @param {number} actingUserId
   * @returns {void}
   */
  async bulkRestoreCourseReviews(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('At least one review ID is required');
      }
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await courseReviewManagementRepository.restoreCourseReviews(ids);
      logger.info(`Course reviews bulk restored: ${ids.length} reviews`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error('Error bulk restoring course reviews:', error);
      throw error;
    }
  }
}

module.exports = new CourseReviewManagementService();
