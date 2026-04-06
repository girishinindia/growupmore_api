const specialSessionManagementRepository = require('../repositories/specialSessionManagement.repository');
const logger = require('../config/logger');
const { BadRequestError, NotFoundError } = require('../utils/errors');

class SpecialSessionManagementService {
  // ═════════════════════════════════════════════════════════════
  //  SESSION REQUESTS
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // LIST — Session Requests
  // ─────────────────────────────────────────────────────────────

  /**
   * getSessionRequests
   * Fetches a list of session requests with filtering and pagination
   * @param {Object} options
   * @returns {Array} session requests with pagination metadata
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
        sortBy = 'created_at',
        sortDir = 'DESC',
        page = 1,
        limit = 20,
      } = options;

      const repoOptions = {
        studentId,
        instructorId,
        courseId,
        requestType,
        requestStatus,
        isActive,
        searchTerm,
        sortColumn: sortBy,
        sortDirection: sortDir,
        pageIndex: page - 1,
        pageSize: limit,
      };

      return await specialSessionManagementRepository.getSessionRequests(repoOptions);
    } catch (error) {
      logger.error('Error fetching session requests:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // READ — Single Session Request by ID
  // ─────────────────────────────────────────────────────────────

  /**
   * getSessionRequestById
   * Fetches a single session request by ID
   * @param {number} id
   * @returns {Object} session request
   */
  async getSessionRequestById(id) {
    try {
      if (!id) throw new BadRequestError('Session request ID is required');

      const result = await specialSessionManagementRepository.findSessionRequestById(id);
      if (!result) throw new NotFoundError('Session request not found');

      return result;
    } catch (error) {
      logger.error(`Error fetching session request ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // READ — Session Requests JSON
  // ─────────────────────────────────────────────────────────────

  /**
   * getSessionRequestsJSON
   * Fetches hierarchical JSON structure with session requests
   * @param {number|null} courseId
   * @returns {Object} JSONB array of session requests
   */
  async getSessionRequestsJSON(courseId = null) {
    try {
      return await specialSessionManagementRepository.getSessionRequestsJSON(courseId);
    } catch (error) {
      logger.error('Error fetching session requests JSON:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — New Session Request
  // ─────────────────────────────────────────────────────────────

  /**
   * createSessionRequest
   * Creates a new session request
   * @param {Object} requestData
   * @param {number} actingUserId
   * @returns {Object} created session request
   */
  async createSessionRequest(requestData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!requestData.studentId) throw new BadRequestError('Student ID is required');

      const payload = {
        ...requestData,
        createdBy: actingUserId,
      };

      const created = await specialSessionManagementRepository.createSessionRequest(payload);
      logger.info(`Session request created: ${created.sr_id}`, { createdBy: actingUserId });

      return created;
    } catch (error) {
      logger.error('Error creating session request:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — Session Request Translation
  // ─────────────────────────────────────────────────────────────

  /**
   * createSessionRequestTranslation
   * Creates a translation for a session request
   * @param {number} sessionRequestId
   * @param {Object} translationData
   * @param {number} actingUserId
   * @returns {void}
   */
  async createSessionRequestTranslation(sessionRequestId, translationData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!sessionRequestId) throw new BadRequestError('Session request ID is required');
      if (!translationData.languageId) throw new BadRequestError('Language ID is required');
      if (!translationData.topic) throw new BadRequestError('Topic is required');

      // Verify session request exists
      const request = await specialSessionManagementRepository.findSessionRequestById(sessionRequestId);
      if (!request) throw new NotFoundError('Session request not found');

      const payload = {
        ...translationData,
        sessionRequestId: Number(sessionRequestId),
      };

      await specialSessionManagementRepository.createSessionRequestTranslation(payload);
      logger.info(`Session request translation created: request=${sessionRequestId}, language=${translationData.languageId}`, { createdBy: actingUserId });
    } catch (error) {
      logger.error('Error creating session request translation:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — Existing Session Request
  // ─────────────────────────────────────────────────────────────

  /**
   * updateSessionRequest
   * Updates an existing session request
   * @param {number} id
   * @param {Object} updates
   * @param {number} actingUserId
   * @returns {Object} updated session request
   */
  async updateSessionRequest(id, updates, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Session request ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await specialSessionManagementRepository.findSessionRequestById(id);
      if (!existing) throw new NotFoundError('Session request not found');

      const payload = {
        ...updates,
        updatedBy: actingUserId,
      };

      const updated = await specialSessionManagementRepository.updateSessionRequest(id, payload);
      logger.info(`Session request updated: ${id}`, { updatedBy: actingUserId });

      return updated;
    } catch (error) {
      logger.error(`Error updating session request ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — Session Request Translation
  // ─────────────────────────────────────────────────────────────

  /**
   * updateSessionRequestTranslation
   * Updates a session request translation
   * @param {number} id
   * @param {Object} updates
   * @param {number} actingUserId
   * @returns {void}
   */
  async updateSessionRequestTranslation(id, updates, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const payload = {
        ...updates,
        updatedBy: actingUserId,
      };

      await specialSessionManagementRepository.updateSessionRequestTranslation(id, payload);
      logger.info(`Session request translation updated: ${id}`, { updatedBy: actingUserId });
    } catch (error) {
      logger.error(`Error updating session request translation ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — Single Session Request
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteSessionRequest
   * Soft deletes a single session request
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async deleteSessionRequest(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Session request ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await specialSessionManagementRepository.findSessionRequestById(id);
      if (!existing) throw new NotFoundError('Session request not found');

      await specialSessionManagementRepository.deleteSessionRequest(id);
      logger.info(`Session request deleted: ${id}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting session request ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BULK DELETE — Multiple Session Requests
  // ─────────────────────────────────────────────────────────────

  /**
   * bulkDeleteSessionRequests
   * Soft deletes multiple session requests in bulk
   * @param {Array<number>} ids
   * @param {number} actingUserId
   * @returns {void}
   */
  async bulkDeleteSessionRequests(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('At least one session request ID is required');
      }
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await specialSessionManagementRepository.deleteSessionRequests(ids);
      logger.info(`Session requests bulk deleted: ${ids.length} requests`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error('Error bulk deleting session requests:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — Single Session Request Translation
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteSessionRequestTranslation
   * Soft deletes a session request translation
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async deleteSessionRequestTranslation(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await specialSessionManagementRepository.deleteSessionRequestTranslation(id);
      logger.info(`Session request translation deleted: ${id}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting session request translation ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — Single Session Request
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreSessionRequest
   * Restores a single deleted session request
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async restoreSessionRequest(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Session request ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await specialSessionManagementRepository.restoreSessionRequest(id);
      logger.info(`Session request restored: ${id}`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error(`Error restoring session request ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BULK RESTORE — Multiple Session Requests
  // ─────────────────────────────────────────────────────────────

  /**
   * bulkRestoreSessionRequests
   * Restores multiple deleted session requests in bulk
   * @param {Array<number>} ids
   * @param {number} actingUserId
   * @returns {void}
   */
  async bulkRestoreSessionRequests(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('At least one session request ID is required');
      }
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await specialSessionManagementRepository.restoreSessionRequests(ids);
      logger.info(`Session requests bulk restored: ${ids.length} requests`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error('Error bulk restoring session requests:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — Single Session Request Translation
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreSessionRequestTranslation
   * Restores a deleted session request translation
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async restoreSessionRequestTranslation(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await specialSessionManagementRepository.restoreSessionRequestTranslation(id);
      logger.info(`Session request translation restored: ${id}`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error(`Error restoring session request translation ${id}:`, error);
      throw error;
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  SCHEDULED SESSIONS
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // LIST — Scheduled Sessions
  // ─────────────────────────────────────────────────────────────

  /**
   * getScheduledSessions
   * Fetches a list of scheduled sessions with filtering and pagination
   * @param {Object} options
   * @returns {Array} scheduled sessions with pagination metadata
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
        sortBy = 'scheduled_at',
        sortDir = 'DESC',
        page = 1,
        limit = 20,
      } = options;

      const repoOptions = {
        studentId,
        instructorId,
        sessionRequestId,
        sessionStatus,
        meetingPlatform,
        isActive,
        searchTerm,
        sortColumn: sortBy,
        sortDirection: sortDir,
        pageIndex: page - 1,
        pageSize: limit,
      };

      return await specialSessionManagementRepository.getScheduledSessions(repoOptions);
    } catch (error) {
      logger.error('Error fetching scheduled sessions:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // READ — Single Scheduled Session by ID
  // ─────────────────────────────────────────────────────────────

  /**
   * getScheduledSessionById
   * Fetches a single scheduled session by ID
   * @param {number} id
   * @returns {Object} scheduled session
   */
  async getScheduledSessionById(id) {
    try {
      if (!id) throw new BadRequestError('Scheduled session ID is required');

      const result = await specialSessionManagementRepository.findScheduledSessionById(id);
      if (!result) throw new NotFoundError('Scheduled session not found');

      return result;
    } catch (error) {
      logger.error(`Error fetching scheduled session ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // READ — Scheduled Sessions JSON
  // ─────────────────────────────────────────────────────────────

  /**
   * getScheduledSessionsJSON
   * Fetches hierarchical JSON structure with scheduled sessions
   * @param {number|null} instructorId
   * @returns {Object} JSONB array of scheduled sessions
   */
  async getScheduledSessionsJSON(instructorId = null) {
    try {
      return await specialSessionManagementRepository.getScheduledSessionsJSON(instructorId);
    } catch (error) {
      logger.error('Error fetching scheduled sessions JSON:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — New Scheduled Session
  // ─────────────────────────────────────────────────────────────

  /**
   * createScheduledSession
   * Creates a new scheduled session
   * @param {Object} sessionData
   * @param {number} actingUserId
   * @returns {Object} created scheduled session
   */
  async createScheduledSession(sessionData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!sessionData.studentId) throw new BadRequestError('Student ID is required');
      if (!sessionData.instructorId) throw new BadRequestError('Instructor ID is required');
      if (!sessionData.scheduledAt) throw new BadRequestError('Scheduled at is required');

      const payload = {
        ...sessionData,
        createdBy: actingUserId,
      };

      const created = await specialSessionManagementRepository.createScheduledSession(payload);
      logger.info(`Scheduled session created: ${created.ss_id}`, { createdBy: actingUserId });

      return created;
    } catch (error) {
      logger.error('Error creating scheduled session:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — Scheduled Session Translation
  // ─────────────────────────────────────────────────────────────

  /**
   * createScheduledSessionTranslation
   * Creates a translation for a scheduled session
   * @param {number} scheduledSessionId
   * @param {Object} translationData
   * @param {number} actingUserId
   * @returns {void}
   */
  async createScheduledSessionTranslation(scheduledSessionId, translationData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!scheduledSessionId) throw new BadRequestError('Scheduled session ID is required');
      if (!translationData.languageId) throw new BadRequestError('Language ID is required');

      // Verify scheduled session exists
      const session = await specialSessionManagementRepository.findScheduledSessionById(scheduledSessionId);
      if (!session) throw new NotFoundError('Scheduled session not found');

      const payload = {
        ...translationData,
        scheduledSessionId: Number(scheduledSessionId),
      };

      await specialSessionManagementRepository.createScheduledSessionTranslation(payload);
      logger.info(`Scheduled session translation created: session=${scheduledSessionId}, language=${translationData.languageId}`, { createdBy: actingUserId });
    } catch (error) {
      logger.error('Error creating scheduled session translation:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — Existing Scheduled Session
  // ─────────────────────────────────────────────────────────────

  /**
   * updateScheduledSession
   * Updates an existing scheduled session
   * @param {number} id
   * @param {Object} updates
   * @param {number} actingUserId
   * @returns {Object} updated scheduled session
   */
  async updateScheduledSession(id, updates, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Scheduled session ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await specialSessionManagementRepository.findScheduledSessionById(id);
      if (!existing) throw new NotFoundError('Scheduled session not found');

      const payload = {
        ...updates,
        updatedBy: actingUserId,
      };

      const updated = await specialSessionManagementRepository.updateScheduledSession(id, payload);
      logger.info(`Scheduled session updated: ${id}`, { updatedBy: actingUserId });

      return updated;
    } catch (error) {
      logger.error(`Error updating scheduled session ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — Scheduled Session Translation
  // ─────────────────────────────────────────────────────────────

  /**
   * updateScheduledSessionTranslation
   * Updates a scheduled session translation
   * @param {number} id
   * @param {Object} updates
   * @param {number} actingUserId
   * @returns {void}
   */
  async updateScheduledSessionTranslation(id, updates, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const payload = {
        ...updates,
        updatedBy: actingUserId,
      };

      await specialSessionManagementRepository.updateScheduledSessionTranslation(id, payload);
      logger.info(`Scheduled session translation updated: ${id}`, { updatedBy: actingUserId });
    } catch (error) {
      logger.error(`Error updating scheduled session translation ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — Single Scheduled Session
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteScheduledSession
   * Soft deletes a single scheduled session
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async deleteScheduledSession(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Scheduled session ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await specialSessionManagementRepository.findScheduledSessionById(id);
      if (!existing) throw new NotFoundError('Scheduled session not found');

      await specialSessionManagementRepository.deleteScheduledSession(id);
      logger.info(`Scheduled session deleted: ${id}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting scheduled session ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BULK DELETE — Multiple Scheduled Sessions
  // ─────────────────────────────────────────────────────────────

  /**
   * bulkDeleteScheduledSessions
   * Soft deletes multiple scheduled sessions in bulk
   * @param {Array<number>} ids
   * @param {number} actingUserId
   * @returns {void}
   */
  async bulkDeleteScheduledSessions(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('At least one scheduled session ID is required');
      }
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await specialSessionManagementRepository.deleteScheduledSessions(ids);
      logger.info(`Scheduled sessions bulk deleted: ${ids.length} sessions`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error('Error bulk deleting scheduled sessions:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — Single Scheduled Session Translation
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteScheduledSessionTranslation
   * Soft deletes a scheduled session translation
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async deleteScheduledSessionTranslation(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await specialSessionManagementRepository.deleteScheduledSessionTranslation(id);
      logger.info(`Scheduled session translation deleted: ${id}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting scheduled session translation ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — Single Scheduled Session
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreScheduledSession
   * Restores a single deleted scheduled session
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async restoreScheduledSession(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Scheduled session ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await specialSessionManagementRepository.restoreScheduledSession(id);
      logger.info(`Scheduled session restored: ${id}`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error(`Error restoring scheduled session ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BULK RESTORE — Multiple Scheduled Sessions
  // ─────────────────────────────────────────────────────────────

  /**
   * bulkRestoreScheduledSessions
   * Restores multiple deleted scheduled sessions in bulk
   * @param {Array<number>} ids
   * @param {number} actingUserId
   * @returns {void}
   */
  async bulkRestoreScheduledSessions(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('At least one scheduled session ID is required');
      }
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await specialSessionManagementRepository.restoreScheduledSessions(ids);
      logger.info(`Scheduled sessions bulk restored: ${ids.length} sessions`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error('Error bulk restoring scheduled sessions:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — Single Scheduled Session Translation
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreScheduledSessionTranslation
   * Restores a deleted scheduled session translation
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async restoreScheduledSessionTranslation(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await specialSessionManagementRepository.restoreScheduledSessionTranslation(id);
      logger.info(`Scheduled session translation restored: ${id}`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error(`Error restoring scheduled session translation ${id}:`, error);
      throw error;
    }
  }
}

module.exports = new SpecialSessionManagementService();
