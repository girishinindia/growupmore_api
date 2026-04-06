/**
 * ═══════════════════════════════════════════════════════════════
 * BATCH MANAGEMENT REPOSITORY — Database Layer (Supabase RPC)
 * ═══════════════════════════════════════════════════════════════
 * Handles 4 batch management entities via stored procedures:
 *
 *   1. COURSE BATCHES (has udf_get)
 *      - udf_get_course_batches
 *      - sp_course_batches_insert, update, delete, restore
 *
 *   2. BATCH TRANSLATIONS (no udf_get)
 *      - sp_batch_translations_insert, update, delete, restore
 *
 *   3. BATCH SESSIONS (has udf_get)
 *      - udf_get_batch_sessions
 *      - sp_batch_sessions_insert, update, delete, restore
 *
 *   4. BATCH SESSION TRANSLATIONS (no udf_get)
 *      - sp_batch_session_translations_insert, update, delete, restore
 * ═══════════════════════════════════════════════════════════════
 */

const { supabase } = require('../config/database');
const logger = require('../config/logger');

class BatchManagementRepository {
  // ─────────────────────────────────────────────────────────────
  // 1. COURSE BATCHES
  // ─────────────────────────────────────────────────────────────

  /**
   * findCourseBatchById
   * Fetches a single course batch by ID
   */
  async findCourseBatchById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_course_batches', {
        p_filter_course_id: null,
        p_filter_batch_owner: null,
        p_filter_batch_status: null,
        p_filter_is_free: null,
        p_filter_meeting_platform: null,
        p_filter_instructor_id: null,
        p_sort_table: 'cb',
        p_sort_column: 'id',
        p_sort_direction: 'ASC',
        p_limit: 10000,
        p_offset: 0,
      });

      if (error) throw error;

      // Filter in code since udf_get doesn't support direct ID filter
      const result = data?.find(batch => batch.id === Number(id));
      return result || null;
    } catch (err) {
      logger.error(`Error finding course batch by ID: ${err.message}`);
      throw err;
    }
  }

  /**
   * getCourseBatches
   * Fetches a list of course batches with optional filtering, sorting, and pagination
   */
  async getCourseBatches(options = {}) {
    try {
      const {
        filterCourseId = null,
        filterBatchOwner = null,
        filterBatchStatus = null,
        filterIsFree = null,
        filterMeetingPlatform = null,
        filterInstructorId = null,
        sortTable = 'cb',
        sortColumn = 'id',
        sortDirection = 'ASC',
        limit = 50,
        offset = 0,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_course_batches', {
        p_filter_course_id: filterCourseId,
        p_filter_batch_owner: filterBatchOwner,
        p_filter_batch_status: filterBatchStatus,
        p_filter_is_free: filterIsFree,
        p_filter_meeting_platform: filterMeetingPlatform,
        p_filter_instructor_id: filterInstructorId,
        p_sort_table: sortTable,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_limit: limit,
        p_offset: offset,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching course batches: ${err.message}`);
      throw err;
    }
  }

  /**
   * createCourseBatch
   * Creates a new course batch and returns the full record
   */
  async createCourseBatch(payload) {
    try {
      const {
        courseId,
        batchOwner = 'system',
        instructorId = null,
        code = null,
        isFree = false,
        price = 0.00,
        includesCourseAccess = false,
        maxStudents = null,
        startsAt = null,
        endsAt = null,
        schedule = null,
        meetingPlatform = 'zoom',
        batchStatus = 'upcoming',
        displayOrder = 0,
        createdBy = null,
      } = payload;

      const { data: newId, error: insertError } = await supabase.rpc(
        'sp_course_batches_insert',
        {
          p_course_id: courseId,
          p_batch_owner: batchOwner,
          p_instructor_id: instructorId,
          p_code: code,
          p_is_free: isFree,
          p_price: price,
          p_includes_course_access: includesCourseAccess,
          p_max_students: maxStudents,
          p_starts_at: startsAt,
          p_ends_at: endsAt,
          p_schedule: schedule,
          p_meeting_platform: meetingPlatform,
          p_batch_status: batchStatus,
          p_display_order: displayOrder,
          p_created_by: createdBy,
        }
      );

      if (insertError) throw insertError;

      return await this.findCourseBatchById(newId);
    } catch (err) {
      logger.error(`Error creating course batch: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateCourseBatch
   * Updates an existing course batch and returns the updated record
   */
  async updateCourseBatch(id, payload) {
    try {
      const {
        code,
        isFree,
        price,
        includesCourseAccess,
        maxStudents,
        startsAt,
        endsAt,
        schedule,
        meetingPlatform,
        batchStatus,
        displayOrder,
        updatedBy = null,
      } = payload;

      const { error } = await supabase.rpc('sp_course_batches_update', {
        p_batch_id: id,
        p_code: code,
        p_is_free: isFree,
        p_price: price,
        p_includes_course_access: includesCourseAccess,
        p_max_students: maxStudents,
        p_starts_at: startsAt,
        p_ends_at: endsAt,
        p_schedule: schedule,
        p_meeting_platform: meetingPlatform,
        p_batch_status: batchStatus,
        p_display_order: displayOrder,
        p_updated_by: updatedBy,
      });

      if (error) throw error;

      return await this.findCourseBatchById(id);
    } catch (err) {
      logger.error(`Error updating course batch: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteCourseBatch
   * Soft deletes a course batch (returns void)
   */
  async deleteCourseBatch(id, deletedBy = null) {
    try {
      const { error } = await supabase.rpc('sp_course_batches_delete', {
        p_batch_id: id,
        p_deleted_by: deletedBy,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting course batch: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreCourseBatch
   * Restores a soft-deleted course batch and returns the restored record
   */
  async restoreCourseBatch(id) {
    try {
      const { error } = await supabase.rpc('sp_course_batches_restore', {
        p_batch_id: id,
      });

      if (error) throw error;

      return await this.findCourseBatchById(id);
    } catch (err) {
      logger.error(`Error restoring course batch: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. BATCH TRANSLATIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * createBatchTranslation
   * Creates a new batch translation
   */
  async createBatchTranslation(payload) {
    try {
      const {
        batchId,
        languageId,
        title,
        description = null,
        shortDescription = null,
      } = payload;

      const { error } = await supabase.rpc(
        'sp_batch_translations_insert',
        {
          p_batch_id: batchId,
          p_language_id: languageId,
          p_title: title,
          p_description: description,
          p_short_description: shortDescription,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error creating batch translation: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateBatchTranslation
   * Updates an existing batch translation
   */
  async updateBatchTranslation(id, payload) {
    try {
      const {
        title,
        description,
        shortDescription,
        tags,
        metaTitle,
        metaDescription,
        metaKeywords,
        canonicalUrl,
        ogSiteName,
        ogTitle,
        ogDescription,
        ogType,
        ogImage,
        ogUrl,
        twitterSite,
        twitterTitle,
        twitterDescription,
        twitterImage,
        twitterCard,
        robotsDirective,
        focusKeyword,
        structuredData,
        isActive,
      } = payload;

      const { error } = await supabase.rpc(
        'sp_batch_translations_update',
        {
          p_translation_id: id,
          p_title: title,
          p_description: description,
          p_short_description: shortDescription,
          p_tags: tags,
          p_meta_title: metaTitle,
          p_meta_description: metaDescription,
          p_meta_keywords: metaKeywords,
          p_canonical_url: canonicalUrl,
          p_og_site_name: ogSiteName,
          p_og_title: ogTitle,
          p_og_description: ogDescription,
          p_og_type: ogType,
          p_og_image: ogImage,
          p_og_url: ogUrl,
          p_twitter_site: twitterSite,
          p_twitter_title: twitterTitle,
          p_twitter_description: twitterDescription,
          p_twitter_image: twitterImage,
          p_twitter_card: twitterCard,
          p_robots_directive: robotsDirective,
          p_focus_keyword: focusKeyword,
          p_structured_data: structuredData,
          p_is_active: isActive,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error updating batch translation: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteBatchTranslation
   * Soft deletes a batch translation (returns void)
   */
  async deleteBatchTranslation(id, deletedBy = null) {
    try {
      const { error } = await supabase.rpc('sp_batch_translations_delete', {
        p_translation_id: id,
        p_deleted_by: deletedBy,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting batch translation: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreBatchTranslation
   * Restores a soft-deleted batch translation
   */
  async restoreBatchTranslation(id) {
    try {
      const { error } = await supabase.rpc('sp_batch_translations_restore', {
        p_translation_id: id,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error restoring batch translation: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. BATCH SESSIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * findBatchSessionById
   * Fetches a single batch session by ID
   */
  async findBatchSessionById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_batch_sessions', {
        p_filter_batch_id: null,
        p_filter_session_status: null,
        p_sort_table: 'bs',
        p_sort_column: 'session_number',
        p_sort_direction: 'ASC',
        p_limit: 10000,
        p_offset: 0,
      });

      if (error) throw error;

      // Filter in code since udf_get doesn't support direct ID filter
      const result = data?.find(session => session.id === Number(id));
      return result || null;
    } catch (err) {
      logger.error(`Error finding batch session by ID: ${err.message}`);
      throw err;
    }
  }

  /**
   * getBatchSessions
   * Fetches a list of batch sessions with optional filtering, sorting, and pagination
   */
  async getBatchSessions(options = {}) {
    try {
      const {
        filterBatchId = null,
        filterSessionStatus = null,
        sortTable = 'bs',
        sortColumn = 'session_number',
        sortDirection = 'ASC',
        limit = 50,
        offset = 0,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_batch_sessions', {
        p_filter_batch_id: filterBatchId,
        p_filter_session_status: filterSessionStatus,
        p_sort_table: sortTable,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_limit: limit,
        p_offset: offset,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching batch sessions: ${err.message}`);
      throw err;
    }
  }

  /**
   * createBatchSession
   * Creates a new batch session and returns the full record
   */
  async createBatchSession(payload) {
    try {
      const {
        batchId,
        sessionNumber,
        sessionDate = null,
        scheduledAt = null,
        durationMinutes = null,
        meetingUrl = null,
        meetingId = null,
        recordingUrl = null,
        sessionStatus = 'scheduled',
        displayOrder = 0,
        createdBy = null,
      } = payload;

      const { data: newId, error: insertError } = await supabase.rpc(
        'sp_batch_sessions_insert',
        {
          p_batch_id: batchId,
          p_session_number: sessionNumber,
          p_session_date: sessionDate,
          p_scheduled_at: scheduledAt,
          p_duration_minutes: durationMinutes,
          p_meeting_url: meetingUrl,
          p_meeting_id: meetingId,
          p_recording_url: recordingUrl,
          p_session_status: sessionStatus,
          p_display_order: displayOrder,
          p_created_by: createdBy,
        }
      );

      if (insertError) throw insertError;

      return await this.findBatchSessionById(newId);
    } catch (err) {
      logger.error(`Error creating batch session: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateBatchSession
   * Updates an existing batch session and returns the updated record
   */
  async updateBatchSession(id, payload) {
    try {
      const {
        sessionDate,
        scheduledAt,
        durationMinutes,
        meetingUrl,
        meetingId,
        recordingUrl,
        sessionStatus,
        displayOrder,
        updatedBy = null,
      } = payload;

      const { error } = await supabase.rpc('sp_batch_sessions_update', {
        p_session_id: id,
        p_session_date: sessionDate,
        p_scheduled_at: scheduledAt,
        p_duration_minutes: durationMinutes,
        p_meeting_url: meetingUrl,
        p_meeting_id: meetingId,
        p_recording_url: recordingUrl,
        p_session_status: sessionStatus,
        p_display_order: displayOrder,
        p_updated_by: updatedBy,
      });

      if (error) throw error;

      return await this.findBatchSessionById(id);
    } catch (err) {
      logger.error(`Error updating batch session: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteBatchSession
   * Soft deletes a batch session (returns void)
   */
  async deleteBatchSession(id, deletedBy = null) {
    try {
      const { error } = await supabase.rpc('sp_batch_sessions_delete', {
        p_session_id: id,
        p_deleted_by: deletedBy,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting batch session: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreBatchSession
   * Restores a soft-deleted batch session and returns the restored record
   */
  async restoreBatchSession(id) {
    try {
      const { error } = await supabase.rpc('sp_batch_sessions_restore', {
        p_session_id: id,
      });

      if (error) throw error;

      return await this.findBatchSessionById(id);
    } catch (err) {
      logger.error(`Error restoring batch session: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 4. BATCH SESSION TRANSLATIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * createBatchSessionTranslation
   * Creates a new batch session translation
   */
  async createBatchSessionTranslation(payload) {
    try {
      const {
        batchSessionId,
        languageId,
        title,
        description = null,
      } = payload;

      const { error } = await supabase.rpc(
        'sp_batch_session_translations_insert',
        {
          p_batch_session_id: batchSessionId,
          p_language_id: languageId,
          p_title: title,
          p_description: description,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error creating batch session translation: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateBatchSessionTranslation
   * Updates an existing batch session translation
   */
  async updateBatchSessionTranslation(id, payload) {
    try {
      const {
        title,
        description,
        isActive,
      } = payload;

      const { error } = await supabase.rpc(
        'sp_batch_session_translations_update',
        {
          p_translation_id: id,
          p_title: title,
          p_description: description,
          p_is_active: isActive,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error updating batch session translation: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteBatchSessionTranslation
   * Soft deletes a batch session translation (returns void)
   */
  async deleteBatchSessionTranslation(id, deletedBy = null) {
    try {
      const { error } = await supabase.rpc('sp_batch_session_translations_delete', {
        p_translation_id: id,
        p_deleted_by: deletedBy,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting batch session translation: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreBatchSessionTranslation
   * Restores a soft-deleted batch session translation
   */
  async restoreBatchSessionTranslation(id) {
    try {
      const { error } = await supabase.rpc('sp_batch_session_translations_restore', {
        p_translation_id: id,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error restoring batch session translation: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new BatchManagementRepository();
