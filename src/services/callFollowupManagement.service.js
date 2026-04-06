const callFollowupManagementRepository = require('../repositories/callFollowupManagement.repository');
const logger = require('../config/logger');
const { BadRequestError, NotFoundError } = require('../utils/errors');

class CallFollowupManagementService {
  // ═════════════════════════════════════════════════════════════
  //  CALL PURPOSES
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // LIST — Call Purposes
  // ─────────────────────────────────────────────────────────────

  /**
   * getCallPurposes
   * Fetches a list of call purposes with filtering and pagination
   * @param {Object} options
   * @returns {Array} call purposes with pagination metadata
   */
  async getCallPurposes(options = {}) {
    try {
      const {
        search = null,
        sortBy = 'display_order',
        sortDir = 'ASC',
        page = 1,
        limit = 25,
      } = options;

      const repoOptions = {
        search,
        sortBy,
        sortDir,
        pageIndex: page - 1,
        pageSize: limit,
      };

      return await callFollowupManagementRepository.getCallPurposes(repoOptions);
    } catch (error) {
      logger.error('Error fetching call purposes:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // READ — Single Call Purpose by ID
  // ─────────────────────────────────────────────────────────────

  /**
   * getCallPurposeById
   * Fetches a single call purpose by ID
   * @param {number} id
   * @returns {Object} call purpose
   */
  async getCallPurposeById(id) {
    try {
      if (!id) throw new BadRequestError('Call purpose ID is required');

      const result = await callFollowupManagementRepository.findCallPurposeById(id);
      if (!result) throw new NotFoundError('Call purpose not found');

      return result;
    } catch (error) {
      logger.error(`Error fetching call purpose ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // READ — Call Purposes JSON
  // ─────────────────────────────────────────────────────────────

  /**
   * getCallPurposesJSON
   * Fetches call purposes as JSONB
   * @returns {Object} JSONB array of call purposes
   */
  async getCallPurposesJSON() {
    try {
      return await callFollowupManagementRepository.getCallPurposesJSON();
    } catch (error) {
      logger.error('Error fetching call purposes JSON:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — New Call Purpose
  // ─────────────────────────────────────────────────────────────

  /**
   * createCallPurpose
   * Creates a new call purpose
   * @param {Object} purposeData
   * @param {number} actingUserId
   * @returns {Object} created call purpose
   */
  async createCallPurpose(purposeData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!purposeData.name) throw new BadRequestError('Name is required');

      const payload = {
        ...purposeData,
        createdBy: actingUserId,
      };

      const created = await callFollowupManagementRepository.createCallPurpose(payload);
      logger.info(`Call purpose created: ${created.id}`, { createdBy: actingUserId });

      return created;
    } catch (error) {
      logger.error('Error creating call purpose:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — New Call Purpose Translation
  // ─────────────────────────────────────────────────────────────

  /**
   * createCallPurposeTranslation
   * Creates a new call purpose translation
   * @param {number} callPurposeId
   * @param {Object} translationData
   * @param {number} actingUserId
   * @returns {void}
   */
  async createCallPurposeTranslation(callPurposeId, translationData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!callPurposeId) throw new BadRequestError('Call purpose ID is required');
      if (!translationData.languageId) throw new BadRequestError('Language ID is required');
      if (!translationData.name) throw new BadRequestError('Name is required');

      const existing = await callFollowupManagementRepository.findCallPurposeById(callPurposeId);
      if (!existing) throw new NotFoundError('Call purpose not found');

      const payload = {
        ...translationData,
        callPurposeId: Number(callPurposeId),
      };

      await callFollowupManagementRepository.createCallPurposeTranslation(payload);
      logger.info(`Call purpose translation created: purpose=${callPurposeId}, language=${translationData.languageId}`, { createdBy: actingUserId });
    } catch (error) {
      logger.error('Error creating call purpose translation:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — Existing Call Purpose
  // ─────────────────────────────────────────────────────────────

  /**
   * updateCallPurpose
   * Updates an existing call purpose
   * @param {number} id
   * @param {Object} updates
   * @param {number} actingUserId
   * @returns {Object} updated call purpose
   */
  async updateCallPurpose(id, updates, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Call purpose ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await callFollowupManagementRepository.findCallPurposeById(id);
      if (!existing) throw new NotFoundError('Call purpose not found');

      const payload = {
        ...updates,
        updatedBy: actingUserId,
      };

      const updated = await callFollowupManagementRepository.updateCallPurpose(id, payload);
      logger.info(`Call purpose updated: ${id}`, { updatedBy: actingUserId });

      return updated;
    } catch (error) {
      logger.error(`Error updating call purpose ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — Existing Call Purpose Translation
  // ─────────────────────────────────────────────────────────────

  /**
   * updateCallPurposeTranslation
   * Updates an existing call purpose translation
   * @param {number} id
   * @param {Object} updates
   * @param {number} actingUserId
   * @returns {void}
   */
  async updateCallPurposeTranslation(id, updates, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await callFollowupManagementRepository.updateCallPurposeTranslation(id, updates);
      logger.info(`Call purpose translation updated: ${id}`, { updatedBy: actingUserId });
    } catch (error) {
      logger.error(`Error updating call purpose translation ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — Single Call Purpose
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteCallPurpose
   * Soft deletes a single call purpose
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async deleteCallPurpose(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Call purpose ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await callFollowupManagementRepository.findCallPurposeById(id);
      if (!existing) throw new NotFoundError('Call purpose not found');

      await callFollowupManagementRepository.deleteCallPurpose(id);
      logger.info(`Call purpose deleted: ${id}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting call purpose ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BULK DELETE — Multiple Call Purposes
  // ─────────────────────────────────────────────────────────────

  /**
   * bulkDeleteCallPurposes
   * Soft deletes multiple call purposes in bulk
   * @param {Array<number>} ids
   * @param {number} actingUserId
   * @returns {void}
   */
  async bulkDeleteCallPurposes(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('At least one call purpose ID is required');
      }
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await callFollowupManagementRepository.deleteCallPurposes(ids);
      logger.info(`Call purposes bulk deleted: ${ids.length} purposes`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error('Error bulk deleting call purposes:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — Call Purpose Translation
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteCallPurposeTranslation
   * Soft deletes a call purpose translation
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async deleteCallPurposeTranslation(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await callFollowupManagementRepository.deleteCallPurposeTranslation(id);
      logger.info(`Call purpose translation deleted: ${id}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting call purpose translation ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — Single Call Purpose
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreCallPurpose
   * Restores a single deleted call purpose
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async restoreCallPurpose(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Call purpose ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await callFollowupManagementRepository.restoreCallPurpose(id);
      logger.info(`Call purpose restored: ${id}`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error(`Error restoring call purpose ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BULK RESTORE — Multiple Call Purposes
  // ─────────────────────────────────────────────────────────────

  /**
   * bulkRestoreCallPurposes
   * Restores multiple deleted call purposes in bulk
   * @param {Array<number>} ids
   * @param {number} actingUserId
   * @returns {void}
   */
  async bulkRestoreCallPurposes(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('At least one call purpose ID is required');
      }
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await callFollowupManagementRepository.restoreCallPurposes(ids);
      logger.info(`Call purposes bulk restored: ${ids.length} purposes`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error('Error bulk restoring call purposes:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — Call Purpose Translation
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreCallPurposeTranslation
   * Restores a call purpose translation
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async restoreCallPurposeTranslation(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await callFollowupManagementRepository.restoreCallPurposeTranslation(id);
      logger.info(`Call purpose translation restored: ${id}`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error(`Error restoring call purpose translation ${id}:`, error);
      throw error;
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  CALL LOGS
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // LIST — Call Logs
  // ─────────────────────────────────────────────────────────────

  /**
   * getCallLogs
   * Fetches a list of call logs with filtering and pagination
   * @param {Object} options
   * @returns {Array} call logs with pagination metadata
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
        page = 1,
        limit = 25,
      } = options;

      const repoOptions = {
        studentId,
        calledBy,
        purposeId,
        callType,
        callStatus,
        outcome,
        scheduledAfter,
        scheduledBefore,
        sortBy,
        sortDir,
        pageIndex: page - 1,
        pageSize: limit,
      };

      return await callFollowupManagementRepository.getCallLogs(repoOptions);
    } catch (error) {
      logger.error('Error fetching call logs:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // READ — Single Call Log by ID
  // ─────────────────────────────────────────────────────────────

  /**
   * getCallLogById
   * Fetches a single call log by ID
   * @param {number} id
   * @returns {Object} call log
   */
  async getCallLogById(id) {
    try {
      if (!id) throw new BadRequestError('Call log ID is required');

      const result = await callFollowupManagementRepository.findCallLogById(id);
      if (!result) throw new NotFoundError('Call log not found');

      return result;
    } catch (error) {
      logger.error(`Error fetching call log ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // READ — Call Logs JSON
  // ─────────────────────────────────────────────────────────────

  /**
   * getCallLogsJSON
   * Fetches call logs as JSONB
   * @param {number|null} studentId - optional student filter
   * @returns {Object} JSONB array of call logs
   */
  async getCallLogsJSON(studentId = null) {
    try {
      return await callFollowupManagementRepository.getCallLogsJSON(studentId);
    } catch (error) {
      logger.error('Error fetching call logs JSON:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — New Call Log
  // ─────────────────────────────────────────────────────────────

  /**
   * createCallLog
   * Creates a new call log
   * @param {Object} logData
   * @param {number} actingUserId
   * @returns {Object} created call log
   */
  async createCallLog(logData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!logData.studentId) throw new BadRequestError('Student ID is required');
      if (!logData.calledBy) throw new BadRequestError('Called by is required');

      const payload = {
        ...logData,
        createdBy: actingUserId,
      };

      const created = await callFollowupManagementRepository.createCallLog(payload);
      logger.info(`Call log created: ${created.id}`, { createdBy: actingUserId });

      return created;
    } catch (error) {
      logger.error('Error creating call log:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — New Call Log Translation
  // ─────────────────────────────────────────────────────────────

  /**
   * createCallLogTranslation
   * Creates a new call log translation
   * @param {number} callLogId
   * @param {Object} translationData
   * @param {number} actingUserId
   * @returns {void}
   */
  async createCallLogTranslation(callLogId, translationData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!callLogId) throw new BadRequestError('Call log ID is required');
      if (!translationData.languageId) throw new BadRequestError('Language ID is required');

      const existing = await callFollowupManagementRepository.findCallLogById(callLogId);
      if (!existing) throw new NotFoundError('Call log not found');

      const payload = {
        ...translationData,
        callLogId: Number(callLogId),
      };

      await callFollowupManagementRepository.createCallLogTranslation(payload);
      logger.info(`Call log translation created: log=${callLogId}, language=${translationData.languageId}`, { createdBy: actingUserId });
    } catch (error) {
      logger.error('Error creating call log translation:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — Existing Call Log
  // ─────────────────────────────────────────────────────────────

  /**
   * updateCallLog
   * Updates an existing call log
   * @param {number} id
   * @param {Object} updates
   * @param {number} actingUserId
   * @returns {Object} updated call log
   */
  async updateCallLog(id, updates, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Call log ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await callFollowupManagementRepository.findCallLogById(id);
      if (!existing) throw new NotFoundError('Call log not found');

      const payload = {
        ...updates,
        updatedBy: actingUserId,
      };

      const updated = await callFollowupManagementRepository.updateCallLog(id, payload);
      logger.info(`Call log updated: ${id}`, { updatedBy: actingUserId });

      return updated;
    } catch (error) {
      logger.error(`Error updating call log ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — Existing Call Log Translation
  // ─────────────────────────────────────────────────────────────

  /**
   * updateCallLogTranslation
   * Updates an existing call log translation
   * @param {number} id
   * @param {Object} updates
   * @param {number} actingUserId
   * @returns {void}
   */
  async updateCallLogTranslation(id, updates, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await callFollowupManagementRepository.updateCallLogTranslation(id, updates);
      logger.info(`Call log translation updated: ${id}`, { updatedBy: actingUserId });
    } catch (error) {
      logger.error(`Error updating call log translation ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — Single Call Log
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteCallLog
   * Soft deletes a single call log
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async deleteCallLog(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Call log ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await callFollowupManagementRepository.findCallLogById(id);
      if (!existing) throw new NotFoundError('Call log not found');

      await callFollowupManagementRepository.deleteCallLog(id);
      logger.info(`Call log deleted: ${id}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting call log ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BULK DELETE — Multiple Call Logs
  // ─────────────────────────────────────────────────────────────

  /**
   * bulkDeleteCallLogs
   * Soft deletes multiple call logs in bulk
   * @param {Array<number>} ids
   * @param {number} actingUserId
   * @returns {void}
   */
  async bulkDeleteCallLogs(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('At least one call log ID is required');
      }
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await callFollowupManagementRepository.deleteCallLogs(ids);
      logger.info(`Call logs bulk deleted: ${ids.length} logs`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error('Error bulk deleting call logs:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — Call Log Translation
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteCallLogTranslation
   * Soft deletes a call log translation
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async deleteCallLogTranslation(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await callFollowupManagementRepository.deleteCallLogTranslation(id);
      logger.info(`Call log translation deleted: ${id}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting call log translation ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — Single Call Log
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreCallLog
   * Restores a single deleted call log
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async restoreCallLog(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Call log ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await callFollowupManagementRepository.restoreCallLog(id);
      logger.info(`Call log restored: ${id}`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error(`Error restoring call log ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BULK RESTORE — Multiple Call Logs
  // ─────────────────────────────────────────────────────────────

  /**
   * bulkRestoreCallLogs
   * Restores multiple deleted call logs in bulk
   * @param {Array<number>} ids
   * @param {number} actingUserId
   * @returns {void}
   */
  async bulkRestoreCallLogs(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('At least one call log ID is required');
      }
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await callFollowupManagementRepository.restoreCallLogs(ids);
      logger.info(`Call logs bulk restored: ${ids.length} logs`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error('Error bulk restoring call logs:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — Call Log Translation
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreCallLogTranslation
   * Restores a call log translation
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async restoreCallLogTranslation(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await callFollowupManagementRepository.restoreCallLogTranslation(id);
      logger.info(`Call log translation restored: ${id}`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error(`Error restoring call log translation ${id}:`, error);
      throw error;
    }
  }
}

module.exports = new CallFollowupManagementService();
