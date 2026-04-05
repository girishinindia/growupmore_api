const materialManagementRepository = require('../repositories/materialManagement.repository');
const logger = require('../config/logger');
const { BadRequestError, NotFoundError } = require('../utils/errors');

class MaterialManagementService {
  // SUBJECTS - No parent entity, JSON only
  async getSubjects(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;
      const repoOptions = {
        difficultyLevel: filters.difficultyLevel || null,
        isActive: filters.isActive || null,
        isDeleted: filters.isDeleted || null,
        subjectId: filters.subjectId || null,
        languageId: filters.languageId || null,
        searchTerm: search || null,
        sortTable: sort?.table || 'subject',
        sortColumn: sort?.field || 'display_order',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };
      return await materialManagementRepository.getSubjects(repoOptions);
    } catch (error) {
      logger.error('Error fetching subjects:', error);
      throw error;
    }
  }

  async getSubjectById(subjectId) {
    try {
      if (!subjectId) throw new BadRequestError('Subject ID is required');
      const result = await materialManagementRepository.findSubjectById(subjectId);
      if (!result) throw new NotFoundError('Subject not found');
      return result;
    } catch (error) {
      logger.error(`Error fetching subject ${subjectId}:`, error);
      throw error;
    }
  }

  async createSubject(subjectData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!subjectData.code) throw new BadRequestError('Subject code is required');
      const created = await materialManagementRepository.createSubject(subjectData);
      logger.info(`Subject created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating subject:', error);
      throw error;
    }
  }

  async updateSubject(subjectId, updates, actingUserId) {
    try {
      if (!subjectId) throw new BadRequestError('Subject ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await materialManagementRepository.findSubjectById(subjectId);
      if (!existing) throw new NotFoundError('Subject not found');
      const updated = await materialManagementRepository.updateSubject(subjectId, updates);
      logger.info(`Subject updated: ${subjectId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating subject ${subjectId}:`, error);
      throw error;
    }
  }

  async deleteSubject(subjectId, actingUserId) {
    try {
      if (!subjectId) throw new BadRequestError('Subject ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await materialManagementRepository.findSubjectById(subjectId);
      if (!existing) throw new NotFoundError('Subject not found');
      await materialManagementRepository.deleteSubject(subjectId);
      logger.info(`Subject deleted: ${subjectId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting subject ${subjectId}:`, error);
      throw error;
    }
  }

  // CHAPTERS - Parent: Subject
  async getChapters(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;
      const repoOptions = {
        difficultyLevel: filters.difficultyLevel || null,
        subjectCode: filters.subjectCode || null,
        isActive: filters.isActive || null,
        isDeleted: filters.isDeleted || null,
        chapterId: filters.chapterId || null,
        subjectId: filters.subjectId || null,
        languageId: filters.languageId || null,
        searchTerm: search || null,
        sortTable: sort?.table || 'chapter',
        sortColumn: sort?.field || 'display_order',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };
      return await materialManagementRepository.getChapters(repoOptions);
    } catch (error) {
      logger.error('Error fetching chapters:', error);
      throw error;
    }
  }

  async getChapterById(chapterId) {
    try {
      if (!chapterId) throw new BadRequestError('Chapter ID is required');
      const result = await materialManagementRepository.findChapterById(chapterId);
      if (!result) throw new NotFoundError('Chapter not found');
      return result;
    } catch (error) {
      logger.error(`Error fetching chapter ${chapterId}:`, error);
      throw error;
    }
  }

  async createChapter(chapterData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!chapterData.subjectId) throw new BadRequestError('Subject ID is required');
      const created = await materialManagementRepository.createChapter(chapterData);
      logger.info(`Chapter created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating chapter:', error);
      throw error;
    }
  }

  async updateChapter(chapterId, updates, actingUserId) {
    try {
      if (!chapterId) throw new BadRequestError('Chapter ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await materialManagementRepository.findChapterById(chapterId);
      if (!existing) throw new NotFoundError('Chapter not found');
      const updated = await materialManagementRepository.updateChapter(chapterId, updates);
      logger.info(`Chapter updated: ${chapterId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating chapter ${chapterId}:`, error);
      throw error;
    }
  }

  async deleteChapter(chapterId, actingUserId) {
    try {
      if (!chapterId) throw new BadRequestError('Chapter ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await materialManagementRepository.findChapterById(chapterId);
      if (!existing) throw new NotFoundError('Chapter not found');
      await materialManagementRepository.deleteChapter(chapterId);
      logger.info(`Chapter deleted: ${chapterId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting chapter ${chapterId}:`, error);
      throw error;
    }
  }

  // TOPICS - Parent: Chapter (can be standalone)
  async getTopics(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;
      const repoOptions = {
        difficultyLevel: filters.difficultyLevel || null,
        isStandalone: filters.isStandalone || null,
        isActive: filters.isActive || null,
        isDeleted: filters.isDeleted || null,
        topicId: filters.topicId || null,
        chapterId: filters.chapterId || null,
        subjectId: filters.subjectId || null,
        languageId: filters.languageId || null,
        searchTerm: search || null,
        sortTable: sort?.table || 'topic',
        sortColumn: sort?.field || 'display_order',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };
      return await materialManagementRepository.getTopics(repoOptions);
    } catch (error) {
      logger.error('Error fetching topics:', error);
      throw error;
    }
  }

  async getTopicById(topicId) {
    try {
      if (!topicId) throw new BadRequestError('Topic ID is required');
      const result = await materialManagementRepository.findTopicById(topicId);
      if (!result) throw new NotFoundError('Topic not found');
      return result;
    } catch (error) {
      logger.error(`Error fetching topic ${topicId}:`, error);
      throw error;
    }
  }

  async createTopic(topicData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const created = await materialManagementRepository.createTopic(topicData);
      logger.info(`Topic created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating topic:', error);
      throw error;
    }
  }

  async updateTopic(topicId, updates, actingUserId) {
    try {
      if (!topicId) throw new BadRequestError('Topic ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await materialManagementRepository.findTopicById(topicId);
      if (!existing) throw new NotFoundError('Topic not found');
      const updated = await materialManagementRepository.updateTopic(topicId, updates);
      logger.info(`Topic updated: ${topicId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating topic ${topicId}:`, error);
      throw error;
    }
  }

  async deleteTopic(topicId, actingUserId) {
    try {
      if (!topicId) throw new BadRequestError('Topic ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await materialManagementRepository.findTopicById(topicId);
      if (!existing) throw new NotFoundError('Topic not found');
      await materialManagementRepository.deleteTopic(topicId);
      logger.info(`Topic deleted: ${topicId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting topic ${topicId}:`, error);
      throw error;
    }
  }

  // SUB-TOPICS - Parent: Topic
  async getSubTopics(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;
      const repoOptions = {
        difficultyLevel: filters.difficultyLevel || null,
        isActive: filters.isActive || null,
        isDeleted: filters.isDeleted || null,
        subTopicId: filters.subTopicId || null,
        topicId: filters.topicId || null,
        chapterId: filters.chapterId || null,
        languageId: filters.languageId || null,
        searchTerm: search || null,
        sortTable: sort?.table || 'sub_topic',
        sortColumn: sort?.field || 'display_order',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };
      return await materialManagementRepository.getSubTopics(repoOptions);
    } catch (error) {
      logger.error('Error fetching sub-topics:', error);
      throw error;
    }
  }

  async getSubTopicById(subTopicId) {
    try {
      if (!subTopicId) throw new BadRequestError('Sub-Topic ID is required');
      const result = await materialManagementRepository.findSubTopicById(subTopicId);
      if (!result) throw new NotFoundError('Sub-Topic not found');
      return result;
    } catch (error) {
      logger.error(`Error fetching sub-topic ${subTopicId}:`, error);
      throw error;
    }
  }

  async createSubTopic(subTopicData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!subTopicData.topicId) throw new BadRequestError('Topic ID is required');
      const created = await materialManagementRepository.createSubTopic(subTopicData);
      logger.info(`Sub-Topic created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating sub-topic:', error);
      throw error;
    }
  }

  async updateSubTopic(subTopicId, updates, actingUserId) {
    try {
      if (!subTopicId) throw new BadRequestError('Sub-Topic ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await materialManagementRepository.findSubTopicById(subTopicId);
      if (!existing) throw new NotFoundError('Sub-Topic not found');
      const updated = await materialManagementRepository.updateSubTopic(subTopicId, updates);
      logger.info(`Sub-Topic updated: ${subTopicId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating sub-topic ${subTopicId}:`, error);
      throw error;
    }
  }

  async deleteSubTopic(subTopicId, actingUserId) {
    try {
      if (!subTopicId) throw new BadRequestError('Sub-Topic ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await materialManagementRepository.findSubTopicById(subTopicId);
      if (!existing) throw new NotFoundError('Sub-Topic not found');
      await materialManagementRepository.deleteSubTopic(subTopicId);
      logger.info(`Sub-Topic deleted: ${subTopicId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting sub-topic ${subTopicId}:`, error);
      throw error;
    }
  }
}

module.exports = new MaterialManagementService();
