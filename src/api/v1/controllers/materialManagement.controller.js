const materialManagementService = require('../../../services/materialManagement.service');
const { sendSuccess, sendCreated } = require('../../../utils/response');

class MaterialManagementController {
  // ============ SUBJECTS ============

  async getSubjects(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'display_order', sortDir = 'asc', difficultyLevel, subjectId, languageId, isActive, ...filterParams } = req.query;
      const filters = {};
      if (difficultyLevel) filters.difficultyLevel = difficultyLevel;
      if (subjectId) filters.subjectId = subjectId;
      if (languageId) filters.languageId = languageId;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await materialManagementService.getSubjects({
        filters,
        search,
        sort: { table: 'subject', field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = { page: Number(page), limit: Number(limit), totalCount: Number(totalCount), totalPages: Math.ceil(Number(totalCount) / Number(limit)) };
      sendSuccess(res, { data, message: 'Subjects retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getSubjectById(req, res, next) {
    try {
      const data = await materialManagementService.getSubjectById(req.params.id);
      sendSuccess(res, { data, message: 'Subject retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createSubject(req, res, next) {
    try {
      const data = await materialManagementService.createSubject(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Subject created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateSubject(req, res, next) {
    try {
      const data = await materialManagementService.updateSubject(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Subject updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteSubject(req, res, next) {
    try {
      await materialManagementService.deleteSubject(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Subject deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ CHAPTERS ============

  async getChapters(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'display_order', sortDir = 'asc', difficultyLevel, subjectCode, chapterId, subjectId, languageId, isActive, ...filterParams } = req.query;
      const filters = {};
      if (difficultyLevel) filters.difficultyLevel = difficultyLevel;
      if (subjectCode) filters.subjectCode = subjectCode;
      if (chapterId) filters.chapterId = chapterId;
      if (subjectId) filters.subjectId = subjectId;
      if (languageId) filters.languageId = languageId;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await materialManagementService.getChapters({
        filters,
        search,
        sort: { table: 'chapter', field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = { page: Number(page), limit: Number(limit), totalCount: Number(totalCount), totalPages: Math.ceil(Number(totalCount) / Number(limit)) };
      sendSuccess(res, { data, message: 'Chapters retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getChapterById(req, res, next) {
    try {
      const data = await materialManagementService.getChapterById(req.params.id);
      sendSuccess(res, { data, message: 'Chapter retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createChapter(req, res, next) {
    try {
      const data = await materialManagementService.createChapter(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Chapter created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateChapter(req, res, next) {
    try {
      const data = await materialManagementService.updateChapter(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Chapter updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteChapter(req, res, next) {
    try {
      await materialManagementService.deleteChapter(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Chapter deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ TOPICS ============

  async getTopics(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'display_order', sortDir = 'asc', difficultyLevel, isStandalone, topicId, chapterId, subjectId, languageId, isActive, ...filterParams } = req.query;
      const filters = {};
      if (difficultyLevel) filters.difficultyLevel = difficultyLevel;
      if (isStandalone !== undefined) filters.isStandalone = isStandalone;
      if (topicId) filters.topicId = topicId;
      if (chapterId) filters.chapterId = chapterId;
      if (subjectId) filters.subjectId = subjectId;
      if (languageId) filters.languageId = languageId;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await materialManagementService.getTopics({
        filters,
        search,
        sort: { table: 'topic', field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = { page: Number(page), limit: Number(limit), totalCount: Number(totalCount), totalPages: Math.ceil(Number(totalCount) / Number(limit)) };
      sendSuccess(res, { data, message: 'Topics retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getTopicById(req, res, next) {
    try {
      const data = await materialManagementService.getTopicById(req.params.id);
      sendSuccess(res, { data, message: 'Topic retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createTopic(req, res, next) {
    try {
      const data = await materialManagementService.createTopic(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Topic created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateTopic(req, res, next) {
    try {
      const data = await materialManagementService.updateTopic(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Topic updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteTopic(req, res, next) {
    try {
      await materialManagementService.deleteTopic(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Topic deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ SUB-TOPICS ============

  async getSubTopics(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'display_order', sortDir = 'asc', difficultyLevel, subTopicId, topicId, chapterId, languageId, isActive, ...filterParams } = req.query;
      const filters = {};
      if (difficultyLevel) filters.difficultyLevel = difficultyLevel;
      if (subTopicId) filters.subTopicId = subTopicId;
      if (topicId) filters.topicId = topicId;
      if (chapterId) filters.chapterId = chapterId;
      if (languageId) filters.languageId = languageId;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await materialManagementService.getSubTopics({
        filters,
        search,
        sort: { table: 'sub_topic', field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = { page: Number(page), limit: Number(limit), totalCount: Number(totalCount), totalPages: Math.ceil(Number(totalCount) / Number(limit)) };
      sendSuccess(res, { data, message: 'Sub-Topics retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getSubTopicById(req, res, next) {
    try {
      const data = await materialManagementService.getSubTopicById(req.params.id);
      sendSuccess(res, { data, message: 'Sub-Topic retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createSubTopic(req, res, next) {
    try {
      const data = await materialManagementService.createSubTopic(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Sub-Topic created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateSubTopic(req, res, next) {
    try {
      const data = await materialManagementService.updateSubTopic(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Sub-Topic updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteSubTopic(req, res, next) {
    try {
      await materialManagementService.deleteSubTopic(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Sub-Topic deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ RESTORE METHODS ============

  async restoreSubject(req, res, next) {
    try {
      const data = await materialManagementService.restoreSubject(req.params.id, req.body.restoreTranslations, req.user.userId);
      sendSuccess(res, { data, message: 'Subject restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreChapter(req, res, next) {
    try {
      const data = await materialManagementService.restoreChapter(req.params.id, req.body.restoreTranslations, req.user.userId);
      sendSuccess(res, { data, message: 'Chapter restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreTopic(req, res, next) {
    try {
      const data = await materialManagementService.restoreTopic(req.params.id, req.body.restoreTranslations, req.user.userId);
      sendSuccess(res, { data, message: 'Topic restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreSubTopic(req, res, next) {
    try {
      const data = await materialManagementService.restoreSubTopic(req.params.id, req.body.restoreTranslations, req.user.userId);
      sendSuccess(res, { data, message: 'Sub-Topic restored successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MaterialManagementController();
