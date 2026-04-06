/**
 * ═══════════════════════════════════════════════════════════════
 * SPECIAL SESSION MANAGEMENT REPOSITORY — Database Layer (Supabase RPC)
 * ═══════════════════════════════════════════════════════════════
 * Handles session request and scheduled session operations via stored procedures:
 *
 *   SESSION REQUESTS:
 *     udf_get_session_requests          — FUNCTION (read, search, filter, paginate)
 *     udfj_getsessionrequests           — FUNCTION (hierarchical JSON)
 *     sp_session_requests_insert         — FUNCTION (create, returns id)
 *     sp_session_request_translations_insert — FUNCTION (create translation, returns void)
 *     sp_session_requests_update         — FUNCTION (update, returns void)
 *     sp_session_request_translations_update — FUNCTION (update translation, returns void)
 *     sp_session_requests_delete         — FUNCTION (soft delete with cascade, returns void)
 *     sp_session_request_translations_delete — FUNCTION (soft delete, returns void)
 *     sp_session_requests_restore        — FUNCTION (restore with cascade, returns void)
 *     sp_session_request_translations_restore — FUNCTION (restore, returns void)
 *
 *   SCHEDULED SESSIONS:
 *     udf_get_scheduled_sessions         — FUNCTION (read, search, filter, paginate)
 *     udfj_getscheduledsessions          — FUNCTION (hierarchical JSON)
 *     sp_scheduled_sessions_insert       — FUNCTION (create, returns id)
 *     sp_scheduled_session_translations_insert — FUNCTION (create translation, returns void)
 *     sp_scheduled_sessions_update       — FUNCTION (update, returns void)
 *     sp_scheduled_session_translations_update — FUNCTION (update translation, returns void)
 *     sp_scheduled_sessions_delete       — FUNCTION (soft delete with cascade, returns void)
 *     sp_scheduled_session_translations_delete — FUNCTION (soft delete, returns void)
 *     sp_scheduled_sessions_restore      — FUNCTION (restore with cascade, returns void)
 *     sp_scheduled_session_translations_restore — FUNCTION (restore, returns void)
 * ═══════════════════════════════════════════════════════════════
 */

const { supabase } = require('../config/database');
const logger = require('../config/logger');

class SpecialSessionManagementRepository {
  // ═════════════════════════════════════════════════════════════
  //  SESSION REQUESTS
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // READ — via udf_get_session_requests
  // ─────────────────────────────────────────────────────────────

  /**
   * getSessionRequests
   * Fetches a list of session requests with filtering, sorting, and pagination
   * @param {Object} options
   * @returns {Array} session requests with pagination metadata (total_count)
   */
  async getSessionRequests(options = {}) {
    try {
      const {
        studentId = null,
        instructorId = null,
        courseId = null,
        requestType = null,
        requestStatus = null,
        isActive = null,
        searchTerm = null,
        sortColumn = 'created_at',
        sortDirection = 'DESC',
        pageIndex = 1,
        pageSize = 20,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_session_requests', {
        p_student_id: studentId,
        p_instructor_id: instructorId,
        p_course_id: courseId,
        p_request_type: requestType,
        p_request_status: requestStatus,
        p_is_active: isActive,
        p_search_term: searchTerm,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_page_index: pageIndex,
        p_page_size: pageSize,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching session requests: ${err.message}`);
      throw err;
    }
  }

  /**
   * findSessionRequestById
   * Fetches a single session request by ID
   * @param {number} id
   * @returns {Object|null} session request or null
   */
  async findSessionRequestById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_session_requests', {
        p_student_id: null,
        p_instructor_id: null,
        p_course_id: null,
        p_request_type: null,
        p_request_status: null,
        p_is_active: null,
        p_search_term: null,
        p_sort_column: 'id',
        p_sort_direction: 'ASC',
        p_page_index: 1,
        p_page_size: 10000,
      });

      if (error) throw error;

      const result = data?.find((r) => r.sr_id === Number(id));
      return result || null;
    } catch (err) {
      logger.error(`Error finding session request by ID: ${err.message}`);
      throw err;
    }
  }

  /**
   * getSessionRequestsJSON
   * Fetches hierarchical JSON structure with session requests
   * @param {number|null} courseId - optional course filter
   * @returns {Object} JSONB array of session requests
   */
  async getSessionRequestsJSON(courseId = null) {
    try {
      const { data, error } = await supabase.rpc('udfj_getsessionrequests', {
        p_course_id: courseId,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching session requests JSON: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — SESSION REQUEST
  // ─────────────────────────────────────────────────────────────

  /**
   * createSessionRequest
   * Creates a new session request
   * @param {Object} payload
   * @returns {number} created session request id
   */
  async createSessionRequest(payload) {
    try {
      const {
        studentId,
        instructorId = null,
        courseId = null,
        requestType = 'one_on_one',
        preferredDate = null,
        preferredTimeSlot = null,
        durationMinutes = 60,
        isFree = false,
        price = 0.00,
        createdBy = null,
      } = payload;

      const { data: newId, error } = await supabase.rpc('sp_session_requests_insert', {
        p_student_id: studentId,
        p_instructor_id: instructorId,
        p_course_id: courseId,
        p_request_type: requestType,
        p_preferred_date: preferredDate,
        p_preferred_time_slot: preferredTimeSlot,
        p_duration_minutes: durationMinutes,
        p_is_free: isFree,
        p_price: price,
        p_created_by: createdBy,
      });

      if (error) throw error;

      logger.info(`Session request created: id=${newId}, student=${studentId}`);

      const newRequest = await this.findSessionRequestById(newId);
      if (!newRequest) {
        throw new Error(`Session request created (id: ${newId}) but could not be fetched`);
      }

      return newRequest;
    } catch (err) {
      logger.error(`Error creating session request: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — SESSION REQUEST TRANSLATION
  // ─────────────────────────────────────────────────────────────

  /**
   * createSessionRequestTranslation
   * Creates a translation for a session request
   * @param {Object} payload
   * @returns {void}
   */
  async createSessionRequestTranslation(payload) {
    try {
      const {
        sessionRequestId,
        languageId,
        topic,
        description = null,
      } = payload;

      const { error } = await supabase.rpc('sp_session_request_translations_insert', {
        p_session_request_id: sessionRequestId,
        p_language_id: languageId,
        p_topic: topic,
        p_description: description,
      });

      if (error) throw error;

      logger.info(`Session request translation created: sessionRequest=${sessionRequestId}, language=${languageId}`);
    } catch (err) {
      logger.error(`Error creating session request translation: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — SESSION REQUEST
  // ─────────────────────────────────────────────────────────────

  /**
   * updateSessionRequest
   * Updates an existing session request
   * @param {number} id
   * @param {Object} payload
   * @returns {Object} updated session request record
   */
  async updateSessionRequest(id, payload) {
    try {
      const {
        instructorId = null,
        courseId = null,
        requestType = null,
        preferredDate = null,
        preferredTimeSlot = null,
        durationMinutes = null,
        isFree = null,
        price = null,
        requestStatus = null,
        rejectionReason = null,
        updatedBy = null,
      } = payload;

      const { error } = await supabase.rpc('sp_session_requests_update', {
        p_id: id,
        p_instructor_id: instructorId,
        p_course_id: courseId,
        p_request_type: requestType,
        p_preferred_date: preferredDate,
        p_preferred_time_slot: preferredTimeSlot,
        p_duration_minutes: durationMinutes,
        p_is_free: isFree,
        p_price: price,
        p_request_status: requestStatus,
        p_rejection_reason: rejectionReason,
      });

      if (error) throw error;

      logger.info(`Session request updated: id=${id}`);

      const updated = await this.findSessionRequestById(id);
      if (!updated) {
        throw new Error(`Session request updated but could not be fetched`);
      }

      return updated;
    } catch (err) {
      logger.error(`Error updating session request ${id}: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — SESSION REQUEST TRANSLATION
  // ─────────────────────────────────────────────────────────────

  /**
   * updateSessionRequestTranslation
   * Updates a session request translation
   * @param {number} id - translation id
   * @param {Object} payload
   * @returns {void}
   */
  async updateSessionRequestTranslation(id, payload) {
    try {
      const {
        topic = null,
        description = null,
      } = payload;

      const { error } = await supabase.rpc('sp_session_request_translations_update', {
        p_id: id,
        p_topic: topic,
        p_description: description,
      });

      if (error) throw error;

      logger.info(`Session request translation updated: id=${id}`);
    } catch (err) {
      logger.error(`Error updating session request translation ${id}: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — SESSION REQUEST
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteSessionRequest
   * Soft delete a single session request (cascades to translations)
   * @param {number} id
   * @returns {void}
   */
  async deleteSessionRequest(id) {
    try {
      const { error } = await supabase.rpc('sp_session_requests_delete', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Session request deleted: id=${id}`);
    } catch (err) {
      logger.error(`Error deleting session request ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteSessionRequests
   * Soft delete multiple session requests (bulk)
   * @param {Array<number>} ids
   * @returns {void}
   */
  async deleteSessionRequests(ids) {
    try {
      if (!ids || ids.length === 0) {
        throw new Error('No session request IDs provided for deletion');
      }

      for (const id of ids) {
        await this.deleteSessionRequest(id);
      }

      logger.info(`Session requests deleted (bulk): ${ids.length} requests deleted`);
    } catch (err) {
      logger.error(`Error deleting session requests: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — SESSION REQUEST TRANSLATION
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteSessionRequestTranslation
   * Soft delete a session request translation
   * @param {number} id
   * @returns {void}
   */
  async deleteSessionRequestTranslation(id) {
    try {
      const { error } = await supabase.rpc('sp_session_request_translations_delete', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Session request translation deleted: id=${id}`);
    } catch (err) {
      logger.error(`Error deleting session request translation ${id}: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — SESSION REQUEST
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreSessionRequest
   * Restore a single deleted session request (cascades to translations)
   * @param {number} id
   * @returns {void}
   */
  async restoreSessionRequest(id) {
    try {
      const { error } = await supabase.rpc('sp_session_requests_restore', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Session request restored: id=${id}`);
    } catch (err) {
      logger.error(`Error restoring session request ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreSessionRequests
   * Restore multiple deleted session requests (bulk)
   * @param {Array<number>} ids
   * @returns {void}
   */
  async restoreSessionRequests(ids) {
    try {
      if (!ids || ids.length === 0) {
        throw new Error('No session request IDs provided for restoration');
      }

      for (const id of ids) {
        await this.restoreSessionRequest(id);
      }

      logger.info(`Session requests restored (bulk): ${ids.length} requests restored`);
    } catch (err) {
      logger.error(`Error restoring session requests: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — SESSION REQUEST TRANSLATION
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreSessionRequestTranslation
   * Restore a deleted session request translation
   * @param {number} id
   * @returns {void}
   */
  async restoreSessionRequestTranslation(id) {
    try {
      const { error } = await supabase.rpc('sp_session_request_translations_restore', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Session request translation restored: id=${id}`);
    } catch (err) {
      logger.error(`Error restoring session request translation ${id}: ${err.message}`);
      throw err;
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  SCHEDULED SESSIONS
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // READ — via udf_get_scheduled_sessions
  // ─────────────────────────────────────────────────────────────

  /**
   * getScheduledSessions
   * Fetches a list of scheduled sessions with filtering, sorting, and pagination
   * @param {Object} options
   * @returns {Array} scheduled sessions with pagination metadata (total_count)
   */
  async getScheduledSessions(options = {}) {
    try {
      const {
        studentId = null,
        instructorId = null,
        sessionRequestId = null,
        sessionStatus = null,
        meetingPlatform = null,
        isActive = null,
        searchTerm = null,
        sortColumn = 'scheduled_at',
        sortDirection = 'DESC',
        pageIndex = 1,
        pageSize = 20,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_scheduled_sessions', {
        p_student_id: studentId,
        p_instructor_id: instructorId,
        p_session_request_id: sessionRequestId,
        p_session_status: sessionStatus,
        p_meeting_platform: meetingPlatform,
        p_is_active: isActive,
        p_search_term: searchTerm,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_page_index: pageIndex,
        p_page_size: pageSize,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching scheduled sessions: ${err.message}`);
      throw err;
    }
  }

  /**
   * findScheduledSessionById
   * Fetches a single scheduled session by ID
   * @param {number} id
   * @returns {Object|null} scheduled session or null
   */
  async findScheduledSessionById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_scheduled_sessions', {
        p_student_id: null,
        p_instructor_id: null,
        p_session_request_id: null,
        p_session_status: null,
        p_meeting_platform: null,
        p_is_active: null,
        p_search_term: null,
        p_sort_column: 'id',
        p_sort_direction: 'ASC',
        p_page_index: 1,
        p_page_size: 10000,
      });

      if (error) throw error;

      const result = data?.find((s) => s.ss_id === Number(id));
      return result || null;
    } catch (err) {
      logger.error(`Error finding scheduled session by ID: ${err.message}`);
      throw err;
    }
  }

  /**
   * getScheduledSessionsJSON
   * Fetches hierarchical JSON structure with scheduled sessions
   * @param {number|null} instructorId - optional instructor filter
   * @returns {Object} JSONB array of scheduled sessions
   */
  async getScheduledSessionsJSON(instructorId = null) {
    try {
      const { data, error } = await supabase.rpc('udfj_getscheduledsessions', {
        p_instructor_id: instructorId,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching scheduled sessions JSON: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — SCHEDULED SESSION
  // ─────────────────────────────────────────────────────────────

  /**
   * createScheduledSession
   * Creates a new scheduled session
   * @param {Object} payload
   * @returns {number} created scheduled session id
   */
  async createScheduledSession(payload) {
    try {
      const {
        studentId,
        instructorId,
        scheduledAt,
        sessionRequestId = null,
        orderId = null,
        durationMinutes = 60,
        meetingUrl = null,
        meetingPlatform = null,
        meetingId = null,
        meetingPassword = null,
        createdBy = null,
      } = payload;

      const { data: newId, error } = await supabase.rpc('sp_scheduled_sessions_insert', {
        p_student_id: studentId,
        p_instructor_id: instructorId,
        p_scheduled_at: scheduledAt,
        p_session_request_id: sessionRequestId,
        p_order_id: orderId,
        p_duration_minutes: durationMinutes,
        p_meeting_url: meetingUrl,
        p_meeting_platform: meetingPlatform,
        p_meeting_id: meetingId,
        p_meeting_password: meetingPassword,
        p_created_by: createdBy,
      });

      if (error) throw error;

      logger.info(`Scheduled session created: id=${newId}, student=${studentId}, instructor=${instructorId}`);

      const newSession = await this.findScheduledSessionById(newId);
      if (!newSession) {
        throw new Error(`Scheduled session created (id: ${newId}) but could not be fetched`);
      }

      return newSession;
    } catch (err) {
      logger.error(`Error creating scheduled session: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — SCHEDULED SESSION TRANSLATION
  // ─────────────────────────────────────────────────────────────

  /**
   * createScheduledSessionTranslation
   * Creates a translation for a scheduled session
   * @param {Object} payload
   * @returns {void}
   */
  async createScheduledSessionTranslation(payload) {
    try {
      const {
        scheduledSessionId,
        languageId,
        instructorNotes = null,
        studentFeedback = null,
      } = payload;

      const { error } = await supabase.rpc('sp_scheduled_session_translations_insert', {
        p_scheduled_session_id: scheduledSessionId,
        p_language_id: languageId,
        p_instructor_notes: instructorNotes,
        p_student_feedback: studentFeedback,
      });

      if (error) throw error;

      logger.info(`Scheduled session translation created: scheduledSession=${scheduledSessionId}, language=${languageId}`);
    } catch (err) {
      logger.error(`Error creating scheduled session translation: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — SCHEDULED SESSION
  // ─────────────────────────────────────────────────────────────

  /**
   * updateScheduledSession
   * Updates an existing scheduled session
   * @param {number} id
   * @param {Object} payload
   * @returns {Object} updated scheduled session record
   */
  async updateScheduledSession(id, payload) {
    try {
      const {
        scheduledAt = null,
        durationMinutes = null,
        endedAt = null,
        meetingUrl = null,
        meetingPlatform = null,
        meetingId = null,
        meetingPassword = null,
        sessionStatus = null,
        recordingUrl = null,
        rating = null,
        cancelledBy = null,
        cancellationReason = null,
        updatedBy = null,
      } = payload;

      const { error } = await supabase.rpc('sp_scheduled_sessions_update', {
        p_id: id,
        p_scheduled_at: scheduledAt,
        p_duration_minutes: durationMinutes,
        p_ended_at: endedAt,
        p_meeting_url: meetingUrl,
        p_meeting_platform: meetingPlatform,
        p_meeting_id: meetingId,
        p_meeting_password: meetingPassword,
        p_session_status: sessionStatus,
        p_recording_url: recordingUrl,
        p_rating: rating,
        p_cancelled_by: cancelledBy,
        p_cancellation_reason: cancellationReason,
      });

      if (error) throw error;

      logger.info(`Scheduled session updated: id=${id}`);

      const updated = await this.findScheduledSessionById(id);
      if (!updated) {
        throw new Error(`Scheduled session updated but could not be fetched`);
      }

      return updated;
    } catch (err) {
      logger.error(`Error updating scheduled session ${id}: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — SCHEDULED SESSION TRANSLATION
  // ─────────────────────────────────────────────────────────────

  /**
   * updateScheduledSessionTranslation
   * Updates a scheduled session translation
   * @param {number} id - translation id
   * @param {Object} payload
   * @returns {void}
   */
  async updateScheduledSessionTranslation(id, payload) {
    try {
      const {
        instructorNotes = null,
        studentFeedback = null,
      } = payload;

      const { error } = await supabase.rpc('sp_scheduled_session_translations_update', {
        p_id: id,
        p_instructor_notes: instructorNotes,
        p_student_feedback: studentFeedback,
      });

      if (error) throw error;

      logger.info(`Scheduled session translation updated: id=${id}`);
    } catch (err) {
      logger.error(`Error updating scheduled session translation ${id}: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — SCHEDULED SESSION
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteScheduledSession
   * Soft delete a single scheduled session (cascades to translations)
   * @param {number} id
   * @returns {void}
   */
  async deleteScheduledSession(id) {
    try {
      const { error } = await supabase.rpc('sp_scheduled_sessions_delete', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Scheduled session deleted: id=${id}`);
    } catch (err) {
      logger.error(`Error deleting scheduled session ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteScheduledSessions
   * Soft delete multiple scheduled sessions (bulk)
   * @param {Array<number>} ids
   * @returns {void}
   */
  async deleteScheduledSessions(ids) {
    try {
      if (!ids || ids.length === 0) {
        throw new Error('No scheduled session IDs provided for deletion');
      }

      for (const id of ids) {
        await this.deleteScheduledSession(id);
      }

      logger.info(`Scheduled sessions deleted (bulk): ${ids.length} sessions deleted`);
    } catch (err) {
      logger.error(`Error deleting scheduled sessions: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — SCHEDULED SESSION TRANSLATION
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteScheduledSessionTranslation
   * Soft delete a scheduled session translation
   * @param {number} id
   * @returns {void}
   */
  async deleteScheduledSessionTranslation(id) {
    try {
      const { error } = await supabase.rpc('sp_scheduled_session_translations_delete', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Scheduled session translation deleted: id=${id}`);
    } catch (err) {
      logger.error(`Error deleting scheduled session translation ${id}: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — SCHEDULED SESSION
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreScheduledSession
   * Restore a single deleted scheduled session (cascades to translations)
   * @param {number} id
   * @returns {void}
   */
  async restoreScheduledSession(id) {
    try {
      const { error } = await supabase.rpc('sp_scheduled_sessions_restore', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Scheduled session restored: id=${id}`);
    } catch (err) {
      logger.error(`Error restoring scheduled session ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreScheduledSessions
   * Restore multiple deleted scheduled sessions (bulk)
   * @param {Array<number>} ids
   * @returns {void}
   */
  async restoreScheduledSessions(ids) {
    try {
      if (!ids || ids.length === 0) {
        throw new Error('No scheduled session IDs provided for restoration');
      }

      for (const id of ids) {
        await this.restoreScheduledSession(id);
      }

      logger.info(`Scheduled sessions restored (bulk): ${ids.length} sessions restored`);
    } catch (err) {
      logger.error(`Error restoring scheduled sessions: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — SCHEDULED SESSION TRANSLATION
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreScheduledSessionTranslation
   * Restore a deleted scheduled session translation
   * @param {number} id
   * @returns {void}
   */
  async restoreScheduledSessionTranslation(id) {
    try {
      const { error } = await supabase.rpc('sp_scheduled_session_translations_restore', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Scheduled session translation restored: id=${id}`);
    } catch (err) {
      logger.error(`Error restoring scheduled session translation ${id}: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new SpecialSessionManagementRepository();
