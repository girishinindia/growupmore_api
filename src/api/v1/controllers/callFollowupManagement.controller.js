const callFollowupManagementService = require('../../../services/callFollowupManagement.service');
const { sendSuccess, sendCreated } = require('../../../utils/response');

class CallFollowupManagementController {
  // ═════════════════════════════════════════════════════════════
  //  CALL PURPOSES
  // ═════════════════════════════════════════════════════════════

  /**
   * getCallPurposes
   * Retrieves a list of call purposes with filtering and pagination
   */
  async getCallPurposes(req, res, next) {
    try {
      const {
        page = 1,
        limit = 25,
        search,
        sortBy,
        sortDir,
      } = req.query;

      const data = await callFollowupManagementService.getCallPurposes({
        search: search || null,
        sortBy: sortBy || 'display_order',
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

      sendSuccess(res, { data, message: 'Call purposes retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  /**
   * getCallPurposesJSON
   * Retrieves call purposes as JSONB
   */
  async getCallPurposesJSON(req, res, next) {
    try {
      const data = await callFollowupManagementService.getCallPurposesJSON();
      sendSuccess(res, { data, message: 'Call purposes JSON retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * getCallPurposeById
   * Retrieves a single call purpose by ID
   */
  async getCallPurposeById(req, res, next) {
    try {
      const data = await callFollowupManagementService.getCallPurposeById(req.params.id);
      sendSuccess(res, { data, message: 'Call purpose retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * createCallPurpose
   * Creates a new call purpose
   */
  async createCallPurpose(req, res, next) {
    try {
      const data = await callFollowupManagementService.createCallPurpose(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Call purpose created successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * updateCallPurpose
   * Updates an existing call purpose
   */
  async updateCallPurpose(req, res, next) {
    try {
      const data = await callFollowupManagementService.updateCallPurpose(
        req.params.id,
        req.body,
        req.user.userId,
      );
      sendSuccess(res, { data, message: 'Call purpose updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * deleteCallPurpose
   * Soft deletes a single call purpose
   */
  async deleteCallPurpose(req, res, next) {
    try {
      await callFollowupManagementService.deleteCallPurpose(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Call purpose deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * bulkDeleteCallPurposes
   * Soft deletes multiple call purposes in bulk
   */
  async bulkDeleteCallPurposes(req, res, next) {
    try {
      const { ids } = req.body;
      await callFollowupManagementService.bulkDeleteCallPurposes(ids, req.user.userId);
      sendSuccess(res, { message: 'Call purposes deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * restoreCallPurpose
   * Restores a single deleted call purpose
   */
  async restoreCallPurpose(req, res, next) {
    try {
      await callFollowupManagementService.restoreCallPurpose(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Call purpose restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * bulkRestoreCallPurposes
   * Restores multiple deleted call purposes in bulk
   */
  async bulkRestoreCallPurposes(req, res, next) {
    try {
      const { ids } = req.body;
      await callFollowupManagementService.bulkRestoreCallPurposes(ids, req.user.userId);
      sendSuccess(res, { message: 'Call purposes restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  CALL PURPOSE TRANSLATIONS
  // ═════════════════════════════════════════════════════════════

  /**
   * createCallPurposeTranslation
   * Creates a new call purpose translation
   */
  async createCallPurposeTranslation(req, res, next) {
    try {
      await callFollowupManagementService.createCallPurposeTranslation(
        req.params.callPurposeId,
        req.body,
        req.user.userId,
      );
      sendCreated(res, { message: 'Call purpose translation created successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * updateCallPurposeTranslation
   * Updates an existing call purpose translation
   */
  async updateCallPurposeTranslation(req, res, next) {
    try {
      await callFollowupManagementService.updateCallPurposeTranslation(
        req.params.id,
        req.body,
        req.user.userId,
      );
      sendSuccess(res, { message: 'Call purpose translation updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * deleteCallPurposeTranslation
   * Soft deletes a call purpose translation
   */
  async deleteCallPurposeTranslation(req, res, next) {
    try {
      await callFollowupManagementService.deleteCallPurposeTranslation(
        req.params.id,
        req.user.userId,
      );
      sendSuccess(res, { message: 'Call purpose translation deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * restoreCallPurposeTranslation
   * Restores a deleted call purpose translation
   */
  async restoreCallPurposeTranslation(req, res, next) {
    try {
      await callFollowupManagementService.restoreCallPurposeTranslation(
        req.params.id,
        req.user.userId,
      );
      sendSuccess(res, { message: 'Call purpose translation restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  CALL LOGS
  // ═════════════════════════════════════════════════════════════

  /**
   * getCallLogs
   * Retrieves a list of call logs with filtering and pagination
   */
  async getCallLogs(req, res, next) {
    try {
      const {
        page = 1,
        limit = 25,
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
      } = req.query;

      const data = await callFollowupManagementService.getCallLogs({
        studentId: studentId || null,
        calledBy: calledBy || null,
        purposeId: purposeId || null,
        callType: callType || null,
        callStatus: callStatus || null,
        outcome: outcome || null,
        scheduledAfter: scheduledAfter || null,
        scheduledBefore: scheduledBefore || null,
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

      sendSuccess(res, { data, message: 'Call logs retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  /**
   * getCallLogsJSON
   * Retrieves call logs as JSONB
   */
  async getCallLogsJSON(req, res, next) {
    try {
      const studentId = req.query.studentId || null;
      const data = await callFollowupManagementService.getCallLogsJSON(studentId);
      sendSuccess(res, { data, message: 'Call logs JSON retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * getCallLogById
   * Retrieves a single call log by ID
   */
  async getCallLogById(req, res, next) {
    try {
      const data = await callFollowupManagementService.getCallLogById(req.params.id);
      sendSuccess(res, { data, message: 'Call log retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * createCallLog
   * Creates a new call log
   */
  async createCallLog(req, res, next) {
    try {
      const data = await callFollowupManagementService.createCallLog(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Call log created successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * updateCallLog
   * Updates an existing call log
   */
  async updateCallLog(req, res, next) {
    try {
      const data = await callFollowupManagementService.updateCallLog(
        req.params.id,
        req.body,
        req.user.userId,
      );
      sendSuccess(res, { data, message: 'Call log updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * deleteCallLog
   * Soft deletes a single call log
   */
  async deleteCallLog(req, res, next) {
    try {
      await callFollowupManagementService.deleteCallLog(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Call log deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * bulkDeleteCallLogs
   * Soft deletes multiple call logs in bulk
   */
  async bulkDeleteCallLogs(req, res, next) {
    try {
      const { ids } = req.body;
      await callFollowupManagementService.bulkDeleteCallLogs(ids, req.user.userId);
      sendSuccess(res, { message: 'Call logs deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * restoreCallLog
   * Restores a single deleted call log
   */
  async restoreCallLog(req, res, next) {
    try {
      await callFollowupManagementService.restoreCallLog(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Call log restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * bulkRestoreCallLogs
   * Restores multiple deleted call logs in bulk
   */
  async bulkRestoreCallLogs(req, res, next) {
    try {
      const { ids } = req.body;
      await callFollowupManagementService.bulkRestoreCallLogs(ids, req.user.userId);
      sendSuccess(res, { message: 'Call logs restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  CALL LOG TRANSLATIONS
  // ═════════════════════════════════════════════════════════════

  /**
   * createCallLogTranslation
   * Creates a new call log translation
   */
  async createCallLogTranslation(req, res, next) {
    try {
      await callFollowupManagementService.createCallLogTranslation(
        req.params.callLogId,
        req.body,
        req.user.userId,
      );
      sendCreated(res, { message: 'Call log translation created successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * updateCallLogTranslation
   * Updates an existing call log translation
   */
  async updateCallLogTranslation(req, res, next) {
    try {
      await callFollowupManagementService.updateCallLogTranslation(
        req.params.id,
        req.body,
        req.user.userId,
      );
      sendSuccess(res, { message: 'Call log translation updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * deleteCallLogTranslation
   * Soft deletes a call log translation
   */
  async deleteCallLogTranslation(req, res, next) {
    try {
      await callFollowupManagementService.deleteCallLogTranslation(
        req.params.id,
        req.user.userId,
      );
      sendSuccess(res, { message: 'Call log translation deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * restoreCallLogTranslation
   * Restores a deleted call log translation
   */
  async restoreCallLogTranslation(req, res, next) {
    try {
      await callFollowupManagementService.restoreCallLogTranslation(
        req.params.id,
        req.user.userId,
      );
      sendSuccess(res, { message: 'Call log translation restored successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CallFollowupManagementController();
