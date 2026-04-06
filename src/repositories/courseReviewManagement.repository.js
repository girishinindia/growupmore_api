/**
 * ═══════════════════════════════════════════════════════════════
 * COURSE REVIEW MANAGEMENT REPOSITORY — Database Layer (Supabase RPC)
 * ═══════════════════════════════════════════════════════════════
 * Handles course review operations via stored procedures:
 *
 *   udf_get_course_reviews  — FUNCTION (read, search, filter, paginate)
 *   sp_course_reviews_insert   — FUNCTION (create review, returns new id)
 *   sp_course_reviews_update   — FUNCTION (update review, returns void)
 *   sp_course_reviews_delete   — FUNCTION (bulk soft delete, returns void)
 *   sp_course_reviews_delete_single   — FUNCTION (single soft delete, returns void)
 *   sp_course_reviews_restore   — FUNCTION (bulk restore, returns void)
 *   sp_course_reviews_restore_single   — FUNCTION (single restore, returns void)
 * ═══════════════════════════════════════════════════════════════
 */

const { supabase } = require('../config/database');
const logger = require('../config/logger');

class CourseReviewManagementRepository {
  // ─────────────────────────────────────────────────────────────
  // READ — via udf_get_course_reviews
  // ─────────────────────────────────────────────────────────────

  /**
   * getCourseReviews
   * Fetches a list of course reviews with filtering, sorting, and pagination
   * @param {Object} options
   * @returns {Array} course reviews with pagination metadata (total_count)
   */
  async getCourseReviews(options = {}) {
    try {
      const {
        filterStudentId = null,
        filterCourseId = null,
        filterEnrollmentId = null,
        filterRating = null,
        filterMinRating = null,
        filterMaxRating = null,
        filterReviewStatus = null,
        filterIsVerifiedPurchase = null,
        filterIsActive = null,
        filterIsDeleted = false,
        searchTerm = null,
        sortTable = 'review',
        sortColumn = 'reviewed_at',
        sortDirection = 'ASC',
        pageIndex = 1,
        pageSize = 20,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_course_reviews', {
        p_filter_student_id: filterStudentId,
        p_filter_course_id: filterCourseId,
        p_filter_enrollment_id: filterEnrollmentId,
        p_filter_rating: filterRating,
        p_filter_min_rating: filterMinRating,
        p_filter_max_rating: filterMaxRating,
        p_filter_review_status: filterReviewStatus,
        p_filter_is_verified_purchase: filterIsVerifiedPurchase,
        p_filter_is_active: filterIsActive,
        p_filter_is_deleted: filterIsDeleted,
        p_search_term: searchTerm,
        p_sort_table: sortTable,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_page_index: pageIndex,
        p_page_size: pageSize,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching course reviews: ${err.message}`);
      throw err;
    }
  }

  /**
   * findCourseReviewById
   * Fetches a single course review by ID
   * @param {number} id
   * @returns {Object|null} course review or null
   */
  async findCourseReviewById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_course_reviews', {
        p_filter_student_id: null,
        p_filter_course_id: null,
        p_filter_enrollment_id: null,
        p_filter_rating: null,
        p_filter_min_rating: null,
        p_filter_max_rating: null,
        p_filter_review_status: null,
        p_filter_is_verified_purchase: null,
        p_filter_is_active: null,
        p_filter_is_deleted: false,
        p_search_term: null,
        p_sort_table: 'review',
        p_sort_column: 'id',
        p_sort_direction: 'ASC',
        p_page_index: 1,
        p_page_size: 10000,
      });

      if (error) throw error;

      const result = data?.find(review => review.id === Number(id));
      return result || null;
    } catch (err) {
      logger.error(`Error finding course review by ID: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — via sp_course_reviews_insert
  // ─────────────────────────────────────────────────────────────

  /**
   * createCourseReview
   * Creates a new course review
   * @param {Object} payload
   * @returns {number} new review ID
   */
  async createCourseReview(payload) {
    try {
      const {
        studentId,
        courseId,
        enrollmentId,
        rating,
        title = null,
        reviewText = null,
        isVerifiedPurchase = true,
        createdBy = null,
      } = payload;

      const { data: newId, error } = await supabase.rpc('sp_course_reviews_insert', {
        p_student_id: studentId,
        p_course_id: courseId,
        p_enrollment_id: enrollmentId,
        p_rating: rating,
        p_title: title,
        p_review_text: reviewText,
        p_is_verified_purchase: isVerifiedPurchase,
        p_created_by: createdBy,
      });

      if (error) throw error;

      logger.info(`Course review created: id=${newId}, course=${courseId}, student=${studentId}`);

      // Fetch and return full review record
      const newReview = await this.findCourseReviewById(newId);
      if (!newReview) {
        throw new Error(`Course review created (id: ${newId}) but could not be fetched`);
      }

      return newReview;
    } catch (err) {
      logger.error(`Error creating course review: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — via sp_course_reviews_update
  // ─────────────────────────────────────────────────────────────

  /**
   * updateCourseReview
   * Updates an existing course review
   * @param {number} id
   * @param {Object} payload
   * @returns {Object} updated review record
   */
  async updateCourseReview(id, payload) {
    try {
      const {
        rating = null,
        title = null,
        reviewText = null,
        reviewStatus = null,
        isVerifiedPurchase = null,
        helpfulCount = null,
        reportedCount = null,
        approvedBy = null,
        approvedAt = null,
        updatedBy = null,
      } = payload;

      const { error } = await supabase.rpc('sp_course_reviews_update', {
        p_id: id,
        p_rating: rating,
        p_title: title,
        p_review_text: reviewText,
        p_review_status: reviewStatus,
        p_is_verified_purchase: isVerifiedPurchase,
        p_helpful_count: helpfulCount,
        p_reported_count: reportedCount,
        p_approved_by: approvedBy,
        p_approved_at: approvedAt,
        p_updated_by: updatedBy,
      });

      if (error) throw error;

      logger.info(`Course review updated: id=${id}`);

      // Fetch and return updated review record
      const updated = await this.findCourseReviewById(id);
      if (!updated) {
        throw new Error(`Course review updated but could not be fetched`);
      }

      return updated;
    } catch (err) {
      logger.error(`Error updating course review ${id}: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — via sp_course_reviews_delete (bulk)
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteCourseReviews
   * Soft delete multiple course reviews (bulk)
   * @param {Array<number>} ids
   * @returns {void}
   */
  async deleteCourseReviews(ids) {
    try {
      if (!ids || ids.length === 0) {
        throw new Error('No review IDs provided for deletion');
      }

      const { error } = await supabase.rpc('sp_course_reviews_delete', {
        p_ids: ids,
      });

      if (error) throw error;

      logger.info(`Course reviews deleted (bulk): ${ids.length} reviews deleted`);
    } catch (err) {
      logger.error(`Error deleting course reviews: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteCourseReview
   * Soft delete a single course review
   * @param {number} id
   * @returns {void}
   */
  async deleteCourseReview(id) {
    try {
      const { error } = await supabase.rpc('sp_course_reviews_delete_single', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Course review deleted: id=${id}`);
    } catch (err) {
      logger.error(`Error deleting course review ${id}: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — via sp_course_reviews_restore (bulk/single)
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreCourseReviews
   * Restore multiple deleted course reviews (bulk)
   * @param {Array<number>} ids
   * @returns {void}
   */
  async restoreCourseReviews(ids) {
    try {
      if (!ids || ids.length === 0) {
        throw new Error('No review IDs provided for restoration');
      }

      const { error } = await supabase.rpc('sp_course_reviews_restore', {
        p_ids: ids,
      });

      if (error) throw error;

      logger.info(`Course reviews restored (bulk): ${ids.length} reviews restored`);
    } catch (err) {
      logger.error(`Error restoring course reviews: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreCourseReview
   * Restore a single deleted course review
   * @param {number} id
   * @returns {void}
   */
  async restoreCourseReview(id) {
    try {
      const { error } = await supabase.rpc('sp_course_reviews_restore_single', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Course review restored: id=${id}`);
    } catch (err) {
      logger.error(`Error restoring course review ${id}: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new CourseReviewManagementRepository();
