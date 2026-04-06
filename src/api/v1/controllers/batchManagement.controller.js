const batchManagementService = require('../../../services/batchManagement.service');
const { sendSuccess, sendCreated } = require('../../../utils/response');

class BatchManagementController {
  // ============ COURSE BATCHES ============

  async getCourseBatches(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        courseId,
        batchOwner,
        batchStatus,
        isFree,
        meetingPlatform,
        instructorId,
      } = req.query;

      const filters = {};
      if (courseId) filters.courseId = courseId;
      if (batchOwner) filters.batchOwner = batchOwner;
      if (batchStatus) filters.batchStatus = batchStatus;
      if (isFree !== undefined) filters.isFree = isFree;
      if (meetingPlatform) filters.meetingPlatform = meetingPlatform;
      if (instructorId) filters.instructorId = instructorId;

      const data = await batchManagementService.getCourseBatches({
        filters,
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };
      sendSuccess(res, { data, message: 'Course batches retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getCourseBatchById(req, res, next) {
    try {
      const data = await batchManagementService.getCourseBatchById(req.params.id);
      sendSuccess(res, { data, message: 'Course batch retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createCourseBatch(req, res, next) {
    try {
      const data = await batchManagementService.createCourseBatch(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Course batch created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateCourseBatch(req, res, next) {
    try {
      const data = await batchManagementService.updateCourseBatch(
        req.params.id,
        req.body,
        req.user.userId
      );
      sendSuccess(res, { data, message: 'Course batch updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCourseBatch(req, res, next) {
    try {
      await batchManagementService.deleteCourseBatch(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Course batch deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreCourseBatch(req, res, next) {
    try {
      const data = await batchManagementService.restoreCourseBatch(req.params.id);
      sendSuccess(res, { data, message: 'Course batch restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ BATCH TRANSLATIONS ============

  async createBatchTranslation(req, res, next) {
    try {
      const data = await batchManagementService.createBatchTranslation(req.body, req.user.userId);
      sendCreated(res, { message: 'Batch translation created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateBatchTranslation(req, res, next) {
    try {
      const data = await batchManagementService.updateBatchTranslation(
        req.params.id,
        req.body,
        req.user.userId
      );
      sendSuccess(res, { message: 'Batch translation updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteBatchTranslation(req, res, next) {
    try {
      await batchManagementService.deleteBatchTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Batch translation deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreBatchTranslation(req, res, next) {
    try {
      await batchManagementService.restoreBatchTranslation(req.params.id);
      sendSuccess(res, { message: 'Batch translation restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ BATCH SESSIONS ============

  async getBatchSessions(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        batchId,
        sessionStatus,
      } = req.query;

      const filters = {};
      if (batchId) filters.batchId = batchId;
      if (sessionStatus) filters.sessionStatus = sessionStatus;

      const data = await batchManagementService.getBatchSessions({
        filters,
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };
      sendSuccess(res, { data, message: 'Batch sessions retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getBatchSessionById(req, res, next) {
    try {
      const data = await batchManagementService.getBatchSessionById(req.params.id);
      sendSuccess(res, { data, message: 'Batch session retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createBatchSession(req, res, next) {
    try {
      const data = await batchManagementService.createBatchSession(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Batch session created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateBatchSession(req, res, next) {
    try {
      const data = await batchManagementService.updateBatchSession(
        req.params.id,
        req.body,
        req.user.userId
      );
      sendSuccess(res, { data, message: 'Batch session updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteBatchSession(req, res, next) {
    try {
      await batchManagementService.deleteBatchSession(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Batch session deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreBatchSession(req, res, next) {
    try {
      const data = await batchManagementService.restoreBatchSession(req.params.id);
      sendSuccess(res, { data, message: 'Batch session restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ BATCH SESSION TRANSLATIONS ============

  async createBatchSessionTranslation(req, res, next) {
    try {
      const data = await batchManagementService.createBatchSessionTranslation(
        req.body,
        req.user.userId
      );
      sendCreated(res, { message: 'Batch session translation created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateBatchSessionTranslation(req, res, next) {
    try {
      const data = await batchManagementService.updateBatchSessionTranslation(
        req.params.id,
        req.body,
        req.user.userId
      );
      sendSuccess(res, { message: 'Batch session translation updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteBatchSessionTranslation(req, res, next) {
    try {
      await batchManagementService.deleteBatchSessionTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Batch session translation deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreBatchSessionTranslation(req, res, next) {
    try {
      await batchManagementService.restoreBatchSessionTranslation(req.params.id);
      sendSuccess(res, { message: 'Batch session translation restored successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BatchManagementController();
