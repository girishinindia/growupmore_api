const batchManagementRepository = require('../repositories/batchManagement.repository');
const logger = require('../config/logger');
const { BadRequestError, NotFoundError } = require('../utils/errors');

class BatchManagementService {
  // ─────────────────────────────────────────────────────────────
  // 1. COURSE BATCHES - Main entity
  // ─────────────────────────────────────────────────────────────

  async getCourseBatches(options = {}) {
    try {
      const { filters = {}, pagination = {} } = options;
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      const repoOptions = {
        filterCourseId: filters.courseId || null,
        filterBatchOwner: filters.batchOwner || null,
        filterBatchStatus: filters.batchStatus || null,
        filterIsFree: filters.isFree || null,
        filterMeetingPlatform: filters.meetingPlatform || null,
        filterInstructorId: filters.instructorId || null,
        sortTable: 'cb',
        sortColumn: 'id',
        sortDirection: 'ASC',
        limit,
        offset,
      };
      return await batchManagementRepository.getCourseBatches(repoOptions);
    } catch (error) {
      logger.error('Error fetching course batches:', error);
      throw error;
    }
  }

  async getCourseBatchById(batchId) {
    try {
      if (!batchId) throw new BadRequestError('Batch ID is required');
      const result = await batchManagementRepository.findCourseBatchById(batchId);
      if (!result) throw new NotFoundError('Course batch not found');
      return result;
    } catch (error) {
      logger.error(`Error fetching course batch ${batchId}:`, error);
      throw error;
    }
  }

  async createCourseBatch(batchData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!batchData.courseId) throw new BadRequestError('Course ID is required');

      const payload = { ...batchData, createdBy: actingUserId };
      const created = await batchManagementRepository.createCourseBatch(payload);
      logger.info(`Course batch created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating course batch:', error);
      throw error;
    }
  }

  async updateCourseBatch(batchId, updates, actingUserId) {
    try {
      if (!batchId) throw new BadRequestError('Batch ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await batchManagementRepository.findCourseBatchById(batchId);
      if (!existing) throw new NotFoundError('Course batch not found');

      const payload = { ...updates, updatedBy: actingUserId };
      const updated = await batchManagementRepository.updateCourseBatch(batchId, payload);
      logger.info(`Course batch updated: ${batchId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating course batch ${batchId}:`, error);
      throw error;
    }
  }

  async deleteCourseBatch(batchId, actingUserId) {
    try {
      if (!batchId) throw new BadRequestError('Batch ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await batchManagementRepository.findCourseBatchById(batchId);
      if (!existing) throw new NotFoundError('Course batch not found');

      await batchManagementRepository.deleteCourseBatch(batchId, actingUserId);
      logger.info(`Course batch deleted: ${batchId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting course batch ${batchId}:`, error);
      throw error;
    }
  }

  async restoreCourseBatch(batchId) {
    try {
      if (!batchId) throw new BadRequestError('Batch ID is required');

      const restored = await batchManagementRepository.restoreCourseBatch(batchId);
      logger.info(`Course batch restored: ${batchId}`);
      return restored;
    } catch (error) {
      logger.error(`Error restoring course batch ${batchId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. BATCH TRANSLATIONS - Child of COURSE BATCHES
  // ─────────────────────────────────────────────────────────────

  async createBatchTranslation(translationData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!translationData.batchId) throw new BadRequestError('Batch ID is required');
      if (!translationData.languageId) throw new BadRequestError('Language ID is required');
      if (!translationData.title) throw new BadRequestError('Title is required');

      // Verify batch exists
      const batch = await batchManagementRepository.findCourseBatchById(translationData.batchId);
      if (!batch) throw new NotFoundError('Course batch not found');

      const payload = translationData;
      await batchManagementRepository.createBatchTranslation(payload);
      logger.info(`Batch translation created for batch ${translationData.batchId}`, { createdBy: actingUserId });
      return { batchId: translationData.batchId };
    } catch (error) {
      logger.error('Error creating batch translation:', error);
      throw error;
    }
  }

  async updateBatchTranslation(translationId, updates, actingUserId) {
    try {
      if (!translationId) throw new BadRequestError('Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const payload = updates;
      await batchManagementRepository.updateBatchTranslation(translationId, payload);
      logger.info(`Batch translation updated: ${translationId}`, { updatedBy: actingUserId });
      return { id: translationId };
    } catch (error) {
      logger.error(`Error updating batch translation ${translationId}:`, error);
      throw error;
    }
  }

  async deleteBatchTranslation(translationId, actingUserId) {
    try {
      if (!translationId) throw new BadRequestError('Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await batchManagementRepository.deleteBatchTranslation(translationId, actingUserId);
      logger.info(`Batch translation deleted: ${translationId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting batch translation ${translationId}:`, error);
      throw error;
    }
  }

  async restoreBatchTranslation(translationId) {
    try {
      if (!translationId) throw new BadRequestError('Translation ID is required');

      await batchManagementRepository.restoreBatchTranslation(translationId);
      logger.info(`Batch translation restored: ${translationId}`);
      return { id: translationId };
    } catch (error) {
      logger.error(`Error restoring batch translation ${translationId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. BATCH SESSIONS - Child of COURSE BATCHES
  // ─────────────────────────────────────────────────────────────

  async getBatchSessions(options = {}) {
    try {
      const { filters = {}, pagination = {} } = options;
      const { page = 1, limit = 20 } = pagination;
      const offset = (page - 1) * limit;

      const repoOptions = {
        filterBatchId: filters.batchId || null,
        filterSessionStatus: filters.sessionStatus || null,
        sortTable: 'bs',
        sortColumn: 'session_number',
        sortDirection: 'ASC',
        limit,
        offset,
      };
      return await batchManagementRepository.getBatchSessions(repoOptions);
    } catch (error) {
      logger.error('Error fetching batch sessions:', error);
      throw error;
    }
  }

  async getBatchSessionById(sessionId) {
    try {
      if (!sessionId) throw new BadRequestError('Session ID is required');
      const result = await batchManagementRepository.findBatchSessionById(sessionId);
      if (!result) throw new NotFoundError('Batch session not found');
      return result;
    } catch (error) {
      logger.error(`Error fetching batch session ${sessionId}:`, error);
      throw error;
    }
  }

  async createBatchSession(sessionData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!sessionData.batchId) throw new BadRequestError('Batch ID is required');
      if (!sessionData.sessionNumber) throw new BadRequestError('Session number is required');

      // Verify batch exists
      const batch = await batchManagementRepository.findCourseBatchById(sessionData.batchId);
      if (!batch) throw new NotFoundError('Course batch not found');

      const payload = { ...sessionData, createdBy: actingUserId };
      const created = await batchManagementRepository.createBatchSession(payload);
      logger.info(`Batch session created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating batch session:', error);
      throw error;
    }
  }

  async updateBatchSession(sessionId, updates, actingUserId) {
    try {
      if (!sessionId) throw new BadRequestError('Session ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await batchManagementRepository.findBatchSessionById(sessionId);
      if (!existing) throw new NotFoundError('Batch session not found');

      const payload = { ...updates, updatedBy: actingUserId };
      const updated = await batchManagementRepository.updateBatchSession(sessionId, payload);
      logger.info(`Batch session updated: ${sessionId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating batch session ${sessionId}:`, error);
      throw error;
    }
  }

  async deleteBatchSession(sessionId, actingUserId) {
    try {
      if (!sessionId) throw new BadRequestError('Session ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await batchManagementRepository.findBatchSessionById(sessionId);
      if (!existing) throw new NotFoundError('Batch session not found');

      await batchManagementRepository.deleteBatchSession(sessionId, actingUserId);
      logger.info(`Batch session deleted: ${sessionId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting batch session ${sessionId}:`, error);
      throw error;
    }
  }

  async restoreBatchSession(sessionId) {
    try {
      if (!sessionId) throw new BadRequestError('Session ID is required');

      const restored = await batchManagementRepository.restoreBatchSession(sessionId);
      logger.info(`Batch session restored: ${sessionId}`);
      return restored;
    } catch (error) {
      logger.error(`Error restoring batch session ${sessionId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 4. BATCH SESSION TRANSLATIONS - Child of BATCH SESSIONS
  // ─────────────────────────────────────────────────────────────

  async createBatchSessionTranslation(translationData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!translationData.batchSessionId) throw new BadRequestError('Batch session ID is required');
      if (!translationData.languageId) throw new BadRequestError('Language ID is required');
      if (!translationData.title) throw new BadRequestError('Title is required');

      // Verify session exists
      const session = await batchManagementRepository.findBatchSessionById(translationData.batchSessionId);
      if (!session) throw new NotFoundError('Batch session not found');

      const payload = translationData;
      await batchManagementRepository.createBatchSessionTranslation(payload);
      logger.info(`Batch session translation created for session ${translationData.batchSessionId}`, { createdBy: actingUserId });
      return { batchSessionId: translationData.batchSessionId };
    } catch (error) {
      logger.error('Error creating batch session translation:', error);
      throw error;
    }
  }

  async updateBatchSessionTranslation(translationId, updates, actingUserId) {
    try {
      if (!translationId) throw new BadRequestError('Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const payload = updates;
      await batchManagementRepository.updateBatchSessionTranslation(translationId, payload);
      logger.info(`Batch session translation updated: ${translationId}`, { updatedBy: actingUserId });
      return { id: translationId };
    } catch (error) {
      logger.error(`Error updating batch session translation ${translationId}:`, error);
      throw error;
    }
  }

  async deleteBatchSessionTranslation(translationId, actingUserId) {
    try {
      if (!translationId) throw new BadRequestError('Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await batchManagementRepository.deleteBatchSessionTranslation(translationId, actingUserId);
      logger.info(`Batch session translation deleted: ${translationId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting batch session translation ${translationId}:`, error);
      throw error;
    }
  }

  async restoreBatchSessionTranslation(translationId) {
    try {
      if (!translationId) throw new BadRequestError('Translation ID is required');

      await batchManagementRepository.restoreBatchSessionTranslation(translationId);
      logger.info(`Batch session translation restored: ${translationId}`);
      return { id: translationId };
    } catch (error) {
      logger.error(`Error restoring batch session translation ${translationId}:`, error);
      throw error;
    }
  }
}

module.exports = new BatchManagementService();
