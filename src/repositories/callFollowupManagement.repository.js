/**
 * ═══════════════════════════════════════════════════════════════
 * CALL FOLLOWUP MANAGEMENT REPOSITORY — Database Layer (Supabase RPC)
 * ═══════════════════════════════════════════════════════════════
 * Handles call purposes and call logs via stored procedures:
 *
 *   CALL PURPOSES:
 *     udf_get_call_purposes           — FUNCTION (read, search, filter, paginate)
 *     udfj_getcallpurposes            — FUNCTION (JSONB)
 *     sp_call_purposes_insert         — FUNCTION (create, returns new id)
 *     sp_call_purpose_translations_insert — FUNCTION (create translation, returns void)
 *     sp_call_purposes_update         — FUNCTION (update, returns void)
 *     sp_call_purpose_translations_update — FUNCTION (update translation, returns void)
 *     sp_call_purposes_delete         — FUNCTION (soft delete, returns void)
 *     sp_call_purpose_translations_delete — FUNCTION (soft delete, returns void)
 *     sp_call_purposes_restore        — FUNCTION (restore, returns void)
 *     sp_call_purpose_translations_restore — FUNCTION (restore, returns void)
 *
 *   CALL LOGS:
 *     udf_get_call_logs               — FUNCTION (read, filter, paginate)
 *     udfj_getcalllogs                — FUNCTION (JSONB)
 *     sp_call_logs_insert             — FUNCTION (create, returns new id)
 *     sp_call_log_translations_insert — FUNCTION (create translation, returns void)
 *     sp_call_logs_update             — FUNCTION (update, returns void)
 *     sp_call_log_translations_update — FUNCTION (update translation, returns void)
 *     sp_call_logs_delete             — FUNCTION (soft delete, returns void)
 *     sp_call_log_translations_delete — FUNCTION (soft delete, returns void)
 *     sp_call_logs_restore            — FUNCTION (restore, returns void)
 *     sp_call_log_translations_restore — FUNCTION (restore, returns void)
 * ═══════════════════════════════════════════════════════════════
 */

const { supabase } = require('../config/database');
const logger = require('../config/logger');

class CallFollowupManagementRepository {
  // ═════════════════════════════════════════════════════════════
  //  CALL PURPOSES
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // READ — via udf_get_call_purposes
  // ─────────────────────────────────────────────────────────────

  /**
   * getCallPurposes
   * Fetches a list of call purposes with filtering, sorting, and pagination
   * @param {Object} options
   * @returns {Array} call purposes with pagination metadata (total_count)
   */
  async getCallPurposes(options = {}) {
    try {
      const {
        search = null,
        sortBy = 'display_order',
        sortDir = 'ASC',
        pageIndex = 1,
        pageSize = 25,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_call_purposes', {
        p_search: search,
        p_sort_by: sortBy,
        p_sort_direction: sortDir,
        p_page: pageIndex,
        p_page_size: pageSize,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching call purposes: ${err.message}`);
      throw err;
    }
  }

  /**
   * findCallPurposeById
   * Fetches a single call purpose by ID
   * @param {number} id
   * @returns {Object|null} call purpose or null
   */
  async findCallPurposeById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_call_purposes', {
        p_search: null,
        p_sort_by: 'id',
        p_sort_direction: 'ASC',
        p_page: 1,
        p_page_size: 10000,
      });

      if (error) throw error;

      const result = data?.find((cp) => cp.id === Number(id));
      return result || null;
    } catch (err) {
      logger.error(`Error finding call purpose by ID: ${err.message}`);
      throw err;
    }
  }

  /**
   * getCallPurposesJSON
   * Fetches call purposes as JSONB
   * @returns {Object} JSONB array of call purposes
   */
  async getCallPurposesJSON() {
    try {
      const { data, error } = await supabase.rpc('udfj_getcallpurposes');

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching call purposes JSON: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — via sp_call_purposes_insert
  // ─────────────────────────────────────────────────────────────

  /**
   * createCallPurpose
   * Creates a new call purpose
   * @param {Object} payload
   * @returns {Object} created call purpose
   */
  async createCallPurpose(payload) {
    try {
      const {
        name,
        code = null,
        displayOrder = 0,
        createdBy = null,
      } = payload;

      const { data: newId, error } = await supabase.rpc('sp_call_purposes_insert', {
        p_name: name,
        p_code: code,
        p_display_order: displayOrder,
        p_created_by: createdBy,
      });

      if (error) throw error;

      logger.info(`Call purpose created: id=${newId}, name=${name}`);

      const newPurpose = await this.findCallPurposeById(newId);
      if (!newPurpose) {
        throw new Error(`Call purpose created (id: ${newId}) but could not be fetched`);
      }

      return newPurpose;
    } catch (err) {
      logger.error(`Error creating call purpose: ${err.message}`);
      throw err;
    }
  }

  /**
   * createCallPurposeTranslation
   * Creates a new call purpose translation
   * @param {Object} payload
   * @returns {void}
   */
  async createCallPurposeTranslation(payload) {
    try {
      const {
        callPurposeId,
        languageId,
        name,
        description = null,
      } = payload;

      const { error } = await supabase.rpc('sp_call_purpose_translations_insert', {
        p_call_purpose_id: callPurposeId,
        p_language_id: languageId,
        p_name: name,
        p_description: description,
      });

      if (error) throw error;

      logger.info(`Call purpose translation created: purpose=${callPurposeId}, language=${languageId}`);
    } catch (err) {
      logger.error(`Error creating call purpose translation: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — via sp_call_purposes_update
  // ─────────────────────────────────────────────────────────────

  /**
   * updateCallPurpose
   * Updates an existing call purpose
   * @param {number} id
   * @param {Object} payload
   * @returns {Object} updated call purpose
   */
  async updateCallPurpose(id, payload) {
    try {
      const {
        name = null,
        code = null,
        displayOrder = null,
        isActive = null,
        updatedBy = null,
      } = payload;

      const { error } = await supabase.rpc('sp_call_purposes_update', {
        p_id: id,
        p_name: name,
        p_code: code,
        p_display_order: displayOrder,
        p_is_active: isActive,
        p_updated_by: updatedBy,
      });

      if (error) throw error;

      logger.info(`Call purpose updated: id=${id}`);

      const updated = await this.findCallPurposeById(id);
      if (!updated) {
        throw new Error(`Call purpose updated but could not be fetched`);
      }

      return updated;
    } catch (err) {
      logger.error(`Error updating call purpose ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateCallPurposeTranslation
   * Updates an existing call purpose translation
   * @param {number} id
   * @param {Object} payload
   * @returns {void}
   */
  async updateCallPurposeTranslation(id, payload) {
    try {
      const {
        name = null,
        description = null,
      } = payload;

      const { error } = await supabase.rpc('sp_call_purpose_translations_update', {
        p_id: id,
        p_name: name,
        p_description: description,
      });

      if (error) throw error;

      logger.info(`Call purpose translation updated: id=${id}`);
    } catch (err) {
      logger.error(`Error updating call purpose translation ${id}: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — via sp_call_purposes_delete (cascading)
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteCallPurpose
   * Soft delete a single call purpose
   * @param {number} id
   * @returns {void}
   */
  async deleteCallPurpose(id) {
    try {
      const { error } = await supabase.rpc('sp_call_purposes_delete', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Call purpose deleted: id=${id}`);
    } catch (err) {
      logger.error(`Error deleting call purpose ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteCallPurposes
   * Soft delete multiple call purposes (bulk)
   * @param {Array<number>} ids
   * @returns {void}
   */
  async deleteCallPurposes(ids) {
    try {
      if (!ids || ids.length === 0) {
        throw new Error('No call purpose IDs provided for deletion');
      }

      for (const id of ids) {
        await this.deleteCallPurpose(id);
      }

      logger.info(`Call purposes deleted (bulk): ${ids.length} purposes deleted`);
    } catch (err) {
      logger.error(`Error deleting call purposes: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteCallPurposeTranslation
   * Soft delete a single call purpose translation
   * @param {number} id
   * @returns {void}
   */
  async deleteCallPurposeTranslation(id) {
    try {
      const { error } = await supabase.rpc('sp_call_purpose_translations_delete', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Call purpose translation deleted: id=${id}`);
    } catch (err) {
      logger.error(`Error deleting call purpose translation ${id}: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — via sp_call_purposes_restore (cascading)
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreCallPurpose
   * Restore a single deleted call purpose
   * @param {number} id
   * @returns {void}
   */
  async restoreCallPurpose(id) {
    try {
      const { error } = await supabase.rpc('sp_call_purposes_restore', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Call purpose restored: id=${id}`);
    } catch (err) {
      logger.error(`Error restoring call purpose ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreCallPurposes
   * Restore multiple deleted call purposes (bulk)
   * @param {Array<number>} ids
   * @returns {void}
   */
  async restoreCallPurposes(ids) {
    try {
      if (!ids || ids.length === 0) {
        throw new Error('No call purpose IDs provided for restoration');
      }

      for (const id of ids) {
        await this.restoreCallPurpose(id);
      }

      logger.info(`Call purposes restored (bulk): ${ids.length} purposes restored`);
    } catch (err) {
      logger.error(`Error restoring call purposes: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreCallPurposeTranslation
   * Restore a single deleted call purpose translation
   * @param {number} id
   * @returns {void}
   */
  async restoreCallPurposeTranslation(id) {
    try {
      const { error } = await supabase.rpc('sp_call_purpose_translations_restore', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Call purpose translation restored: id=${id}`);
    } catch (err) {
      logger.error(`Error restoring call purpose translation ${id}: ${err.message}`);
      throw err;
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  CALL LOGS
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // READ — via udf_get_call_logs
  // ─────────────────────────────────────────────────────────────

  /**
   * getCallLogs
   * Fetches a list of call logs with filtering, sorting, and pagination
   * @param {Object} options
   * @returns {Array} call logs with pagination metadata (total_count)
   */
  async getCallLogs(options = {}) {
    try {
      const {
        studentId = null,
        calledBy = null,
        purposeId = null,
        callType = null,
        callStatus = null,
        outcome = null,
        scheduledAfter = null,
        scheduledBefore = null,
        sortBy = 'created_at',
        sortDir = 'DESC',
        pageIndex = 1,
        pageSize = 25,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_call_logs', {
        p_student_id: studentId,
        p_called_by: calledBy,
        p_purpose_id: purposeId,
        p_call_type: callType,
        p_call_status: callStatus,
        p_outcome: outcome,
        p_scheduled_after: scheduledAfter,
        p_scheduled_before: scheduledBefore,
        p_sort_by: sortBy,
        p_sort_direction: sortDir,
        p_page: pageIndex,
        p_page_size: pageSize,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching call logs: ${err.message}`);
      throw err;
    }
  }

  /**
   * findCallLogById
   * Fetches a single call log by ID
   * @param {number} id
   * @returns {Object|null} call log or null
   */
  async findCallLogById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_call_logs', {
        p_student_id: null,
        p_called_by: null,
        p_purpose_id: null,
        p_call_type: null,
        p_call_status: null,
        p_outcome: null,
        p_scheduled_after: null,
        p_scheduled_before: null,
        p_sort_by: 'id',
        p_sort_direction: 'ASC',
        p_page: 1,
        p_page_size: 10000,
      });

      if (error) throw error;

      const result = data?.find((cl) => cl.id === Number(id));
      return result || null;
    } catch (err) {
      logger.error(`Error finding call log by ID: ${err.message}`);
      throw err;
    }
  }

  /**
   * getCallLogsJSON
   * Fetches call logs as JSONB
   * @param {number|null} studentId - optional student filter
   * @returns {Object} JSONB array of call logs
   */
  async getCallLogsJSON(studentId = null) {
    try {
      const { data, error } = await supabase.rpc('udfj_getcalllogs', {
        p_student_id: studentId,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching call logs JSON: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — via sp_call_logs_insert
  // ─────────────────────────────────────────────────────────────

  /**
   * createCallLog
   * Creates a new call log
   * @param {Object} payload
   * @returns {Object} created call log
   */
  async createCallLog(payload) {
    try {
      const {
        studentId,
        calledBy,
        purposeId = null,
        previousCallId = null,
        followUpNumber = 1,
        callType = 'outbound',
        callStatus = 'scheduled',
        scheduledAt = null,
        calledAt = null,
        durationSeconds = null,
        phoneNumberUsed = null,
        courseId = null,
        batchId = null,
        orderId = null,
        ticketId = null,
        outcome = null,
        nextFollowUpDate = null,
        nextAction = null,
        createdBy = null,
      } = payload;

      const { data: newId, error } = await supabase.rpc('sp_call_logs_insert', {
        p_student_id: studentId,
        p_called_by: calledBy,
        p_purpose_id: purposeId,
        p_previous_call_id: previousCallId,
        p_follow_up_number: followUpNumber,
        p_call_type: callType,
        p_call_status: callStatus,
        p_scheduled_at: scheduledAt,
        p_called_at: calledAt,
        p_duration_seconds: durationSeconds,
        p_phone_number_used: phoneNumberUsed,
        p_course_id: courseId,
        p_batch_id: batchId,
        p_order_id: orderId,
        p_ticket_id: ticketId,
        p_outcome: outcome,
        p_next_follow_up_date: nextFollowUpDate,
        p_next_action: nextAction,
        p_created_by: createdBy,
      });

      if (error) throw error;

      logger.info(`Call log created: id=${newId}, student=${studentId}, called_by=${calledBy}`);

      const newLog = await this.findCallLogById(newId);
      if (!newLog) {
        throw new Error(`Call log created (id: ${newId}) but could not be fetched`);
      }

      return newLog;
    } catch (err) {
      logger.error(`Error creating call log: ${err.message}`);
      throw err;
    }
  }

  /**
   * createCallLogTranslation
   * Creates a new call log translation
   * @param {Object} payload
   * @returns {void}
   */
  async createCallLogTranslation(payload) {
    try {
      const {
        callLogId,
        languageId,
        summary = null,
        studentResponse = null,
        internalNotes = null,
      } = payload;

      const { error } = await supabase.rpc('sp_call_log_translations_insert', {
        p_call_log_id: callLogId,
        p_language_id: languageId,
        p_summary: summary,
        p_student_response: studentResponse,
        p_internal_notes: internalNotes,
      });

      if (error) throw error;

      logger.info(`Call log translation created: log=${callLogId}, language=${languageId}`);
    } catch (err) {
      logger.error(`Error creating call log translation: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — via sp_call_logs_update
  // ─────────────────────────────────────────────────────────────

  /**
   * updateCallLog
   * Updates an existing call log
   * @param {number} id
   * @param {Object} payload
   * @returns {Object} updated call log
   */
  async updateCallLog(id, payload) {
    try {
      const {
        purposeId = null,
        previousCallId = null,
        followUpNumber = null,
        callType = null,
        callStatus = null,
        scheduledAt = null,
        calledAt = null,
        durationSeconds = null,
        phoneNumberUsed = null,
        outcome = null,
        nextFollowUpDate = null,
        nextAction = null,
        isActive = null,
        updatedBy = null,
      } = payload;

      const { error } = await supabase.rpc('sp_call_logs_update', {
        p_id: id,
        p_purpose_id: purposeId,
        p_previous_call_id: previousCallId,
        p_follow_up_number: followUpNumber,
        p_call_type: callType,
        p_call_status: callStatus,
        p_scheduled_at: scheduledAt,
        p_called_at: calledAt,
        p_duration_seconds: durationSeconds,
        p_phone_number_used: phoneNumberUsed,
        p_outcome: outcome,
        p_next_follow_up_date: nextFollowUpDate,
        p_next_action: nextAction,
        p_is_active: isActive,
        p_updated_by: updatedBy,
      });

      if (error) throw error;

      logger.info(`Call log updated: id=${id}`);

      const updated = await this.findCallLogById(id);
      if (!updated) {
        throw new Error(`Call log updated but could not be fetched`);
      }

      return updated;
    } catch (err) {
      logger.error(`Error updating call log ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateCallLogTranslation
   * Updates an existing call log translation
   * @param {number} id
   * @param {Object} payload
   * @returns {void}
   */
  async updateCallLogTranslation(id, payload) {
    try {
      const {
        summary = null,
        studentResponse = null,
        internalNotes = null,
      } = payload;

      const { error } = await supabase.rpc('sp_call_log_translations_update', {
        p_id: id,
        p_summary: summary,
        p_student_response: studentResponse,
        p_internal_notes: internalNotes,
      });

      if (error) throw error;

      logger.info(`Call log translation updated: id=${id}`);
    } catch (err) {
      logger.error(`Error updating call log translation ${id}: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — via sp_call_logs_delete (cascading)
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteCallLog
   * Soft delete a single call log
   * @param {number} id
   * @returns {void}
   */
  async deleteCallLog(id) {
    try {
      const { error } = await supabase.rpc('sp_call_logs_delete', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Call log deleted: id=${id}`);
    } catch (err) {
      logger.error(`Error deleting call log ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteCallLogs
   * Soft delete multiple call logs (bulk)
   * @param {Array<number>} ids
   * @returns {void}
   */
  async deleteCallLogs(ids) {
    try {
      if (!ids || ids.length === 0) {
        throw new Error('No call log IDs provided for deletion');
      }

      for (const id of ids) {
        await this.deleteCallLog(id);
      }

      logger.info(`Call logs deleted (bulk): ${ids.length} logs deleted`);
    } catch (err) {
      logger.error(`Error deleting call logs: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteCallLogTranslation
   * Soft delete a single call log translation
   * @param {number} id
   * @returns {void}
   */
  async deleteCallLogTranslation(id) {
    try {
      const { error } = await supabase.rpc('sp_call_log_translations_delete', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Call log translation deleted: id=${id}`);
    } catch (err) {
      logger.error(`Error deleting call log translation ${id}: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — via sp_call_logs_restore (cascading)
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreCallLog
   * Restore a single deleted call log
   * @param {number} id
   * @returns {void}
   */
  async restoreCallLog(id) {
    try {
      const { error } = await supabase.rpc('sp_call_logs_restore', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Call log restored: id=${id}`);
    } catch (err) {
      logger.error(`Error restoring call log ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreCallLogs
   * Restore multiple deleted call logs (bulk)
   * @param {Array<number>} ids
   * @returns {void}
   */
  async restoreCallLogs(ids) {
    try {
      if (!ids || ids.length === 0) {
        throw new Error('No call log IDs provided for restoration');
      }

      for (const id of ids) {
        await this.restoreCallLog(id);
      }

      logger.info(`Call logs restored (bulk): ${ids.length} logs restored`);
    } catch (err) {
      logger.error(`Error restoring call logs: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreCallLogTranslation
   * Restore a single deleted call log translation
   * @param {number} id
   * @returns {void}
   */
  async restoreCallLogTranslation(id) {
    try {
      const { error } = await supabase.rpc('sp_call_log_translations_restore', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Call log translation restored: id=${id}`);
    } catch (err) {
      logger.error(`Error restoring call log translation ${id}: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new CallFollowupManagementRepository();
