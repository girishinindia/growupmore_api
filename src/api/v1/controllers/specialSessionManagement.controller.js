const specialSessionManagementService = require('../../../services/specialSessionManagement.service');
const { sendSuccess, sendCreated } = require('../../../utils/response');

class SpecialSessionManagementController {
  // ═════════════════════════════════════════════════════════════
  //  SESSION REQUESTS
  // ═════════════════════════════════════════════════════════════

  /**
   * getSessionRequests
   * Retrieves a list of session requests with filtering and pagination
   */
  async getSessionRequests(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        studentId,
        instructorId,
        courseId,
        requestType,
        requestStatus,
        isActive,
        searchTerm,
        sortBy,
        sortDir,
      } = req.query;

      const data = await specialSessionManagementService.getSessionRequests({
        studentId: studentId || null,
        instructorId: instructorId || null,
        courseId: courseId || null,
        requestType: requestType || null,
        requestStatus: requestStatus || null,
        isActive: isActive != null ? isActive : null,
        searchTerm: searchTerm || null,
        sortBy: sortBy || 'created_at',
        sortDir: sortDir || 'DESC',
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

      sendSuccess(res, { data, message: 'Session requests retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  /**
   * getSessionRequestsJSON
   * Retrieves hierarchical JSON structure with session requests
   */
  async getSessionRequestsJSON(req, res, next) {
    try {
      const courseId = req.query.courseId || null;
      const data = await specialSessionManagementService.getSessionRequestsJSON(courseId);
      sendSuccess(res, { data, message: 'Session requests JSON retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * getSessionRequestById
   * Retrieves a single session request by ID
   */
  async getSessionRequestById(req, res, next) {
    try {
      const data = await specialSessionManagementService.getSessionRequestById(req.params.id);
      sendSuccess(res, { data, message: 'Session request retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * createSessionRequest
   * Creates a new session request
   */
  async createSessionRequest(req, res, next) {
    try {
      const data = await specialSessionManagementService.createSessionRequest(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Session request created successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * updateSessionRequest
   * Updates an existing session request
   */
  async updateSessionRequest(req, res, next) {
    try {
      const data = await specialSessionManagementService.updateSessionRequest(
        req.params.id,
        req.body,
        req.user.userId,
      );
      sendSuccess(res, { data, message: 'Session request updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * deleteSessionRequest
   * Soft deletes a single session request
   */
  async deleteSessionRequest(req, res, next) {
    try {
      await specialSessionManagementService.deleteSessionRequest(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Session request deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * bulkDeleteSessionRequests
   * Soft deletes multiple session requests in bulk
   */
  async bulkDeleteSessionRequests(req, res, next) {
    try {
      const { ids } = req.body;
      await specialSessionManagementService.bulkDeleteSessionRequests(ids, req.user.userId);
      sendSuccess(res, { message: 'Session requests deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * restoreSessionRequest
   * Restores a single deleted session request
   */
  async restoreSessionRequest(req, res, next) {
    try {
      await specialSessionManagementService.restoreSessionRequest(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Session request restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * bulkRestoreSessionRequests
   * Restores multiple deleted session requests in bulk
   */
  async bulkRestoreSessionRequests(req, res, next) {
    try {
      const { ids } = req.body;
      await specialSessionManagementService.bulkRestoreSessionRequests(ids, req.user.userId);
      sendSuccess(res, { message: 'Session requests restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  SESSION REQUEST TRANSLATIONS
  // ═════════════════════════════════════════════════════════════

  /**
   * createSessionRequestTranslation
   * Creates a translation for a session request
   */
  async createSessionRequestTranslation(req, res, next) {
    try {
      await specialSessionManagementService.createSessionRequestTranslation(
        req.params.sessionRequestId,
        req.body,
        req.user.userId,
      );
      sendCreated(res, { message: 'Session request translation created successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * updateSessionRequestTranslation
   * Updates a session request translation
   */
  async updateSessionRequestTranslation(req, res, next) {
    try {
      await specialSessionManagementService.updateSessionRequestTranslation(
        req.params.id,
        req.body,
        req.user.userId,
      );
      sendSuccess(res, { message: 'Session request translation updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * deleteSessionRequestTranslation
   * Soft deletes a session request translation
   */
  async deleteSessionRequestTranslation(req, res, next) {
    try {
      await specialSessionManagementService.deleteSessionRequestTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Session request translation deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * restoreSessionRequestTranslation
   * Restores a deleted session request translation
   */
  async restoreSessionRequestTranslation(req, res, next) {
    try {
      await specialSessionManagementService.restoreSessionRequestTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Session request translation restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  SCHEDULED SESSIONS
  // ═════════════════════════════════════════════════════════════

  /**
   * getScheduledSessions
   * Retrieves a list of scheduled sessions with filtering and pagination
   */
  async getScheduledSessions(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        studentId,
        instructorId,
        sessionRequestId,
        sessionStatus,
        meetingPlatform,
        isActive,
        searchTerm,
        sortBy,
        sortDir,
      } = req.query;

      const data = await specialSessionManagementService.getScheduledSessions({
        studentId: studentId || null,
        instructorId: instructorId || null,
        sessionRequestId: sessionRequestId || null,
        sessionStatus: sessionStatus || null,
        meetingPlatform: meetingPlatform || null,
        isActive: isActive != null ? isActive : null,
        searchTerm: searchTerm || null,
        sortBy: sortBy || 'scheduled_at',
        sortDir: sortDir || 'DESC',
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

      sendSuccess(res, { data, message: 'Scheduled sessions retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  /**
   * getScheduledSessionsJSON
   * Retrieves hierarchical JSON structure with scheduled sessions
   */
  async getScheduledSessionsJSON(req, res, next) {
    try {
      const instructorId = req.query.instructorId || null;
      const data = await specialSessionManagementService.getScheduledSessionsJSON(instructorId);
      sendSuccess(res, { data, message: 'Scheduled sessions JSON retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * getScheduledSessionById
   * Retrieves a single scheduled session by ID
   */
  async getScheduledSessionById(req, res, next) {
    try {
      const data = await specialSessionManagementService.getScheduledSessionById(req.params.id);
      sendSuccess(res, { data, message: 'Scheduled session retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * createScheduledSession
   * Creates a new scheduled session
   */
  async createScheduledSession(req, res, next) {
    try {
      const data = await specialSessionManagementService.createScheduledSession(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Scheduled session created successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * updateScheduledSession
   * Updates an existing scheduled session
   */
  async updateScheduledSession(req, res, next) {
    try {
      const data = await specialSessionManagementService.updateScheduledSession(
        req.params.id,
        req.body,
        req.user.userId,
      );
      sendSuccess(res, { data, message: 'Scheduled session updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * deleteScheduledSession
   * Soft deletes a single scheduled session
   */
  async deleteScheduledSession(req, res, next) {
    try {
      await specialSessionManagementService.deleteScheduledSession(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Scheduled session deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * bulkDeleteScheduledSessions
   * Soft deletes multiple scheduled sessions in bulk
   */
  async bulkDeleteScheduledSessions(req, res, next) {
    try {
      const { ids } = req.body;
      await specialSessionManagementService.bulkDeleteScheduledSessions(ids, req.user.userId);
      sendSuccess(res, { message: 'Scheduled sessions deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * restoreScheduledSession
   * Restores a single deleted scheduled session
   */
  async restoreScheduledSession(req, res, next) {
    try {
      await specialSessionManagementService.restoreScheduledSession(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Scheduled session restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * bulkRestoreScheduledSessions
   * Restores multiple deleted scheduled sessions in bulk
   */
  async bulkRestoreScheduledSessions(req, res, next) {
    try {
      const { ids } = req.body;
      await specialSessionManagementService.bulkRestoreScheduledSessions(ids, req.user.userId);
      sendSuccess(res, { message: 'Scheduled sessions restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  SCHEDULED SESSION TRANSLATIONS
  // ═════════════════════════════════════════════════════════════

  /**
   * createScheduledSessionTranslation
   * Creates a translation for a scheduled session
   */
  async createScheduledSessionTranslation(req, res, next) {
    try {
      await specialSessionManagementService.createScheduledSessionTranslation(
        req.params.scheduledSessionId,
        req.body,
        req.user.userId,
      );
      sendCreated(res, { message: 'Scheduled session translation created successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * updateScheduledSessionTranslation
   * Updates a scheduled session translation
   */
  async updateScheduledSessionTranslation(req, res, next) {
    try {
      await specialSessionManagementService.updateScheduledSessionTranslation(
        req.params.id,
        req.body,
        req.user.userId,
      );
      sendSuccess(res, { message: 'Scheduled session translation updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * deleteScheduledSessionTranslation
   * Soft deletes a scheduled session translation
   */
  async deleteScheduledSessionTranslation(req, res, next) {
    try {
      await specialSessionManagementService.deleteScheduledSessionTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Scheduled session translation deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * restoreScheduledSessionTranslation
   * Restores a deleted scheduled session translation
   */
  async restoreScheduledSessionTranslation(req, res, next) {
    try {
      await specialSessionManagementService.restoreScheduledSessionTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Scheduled session translation restored successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SpecialSessionManagementController();
