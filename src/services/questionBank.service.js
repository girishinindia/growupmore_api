const questionBankRepository = require('../repositories/questionBank.repository');
const bunnyService = require('./bunny.service');
const logger = require('../config/logger');
const { BadRequestError, NotFoundError } = require('../utils/errors');

class QuestionBankService {
  // ─────────────────────────────────────────────────────────────
  // MCQ QUESTIONS (1/14)
  // ─────────────────────────────────────────────────────────────

  async getMcqQuestions(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;
      const repoOptions = {
        topicId: filters.topicId || null,
        mcqType: filters.mcqType || null,
        difficultyLevel: filters.difficultyLevel || null,
        isMandatory: filters.isMandatory || null,
        isActive: filters.isActive || null,
        isDeleted: filters.isDeleted || null,
        mcqQuestionId: filters.mcqQuestionId || null,
        languageId: filters.languageId || null,
        searchText: search || null,
        searchFields: search ? (options.searchFields || ['question_text']) : null,
        sortTable: sort?.table || 'translation',
        sortColumn: sort?.column || 'question_text',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.pageIndex || 0,
        pageSize: pagination.pageSize || 20,
      };
      return await questionBankRepository.getMcqQuestions(repoOptions);
    } catch (error) {
      logger.error('Error fetching MCQ questions:', error);
      throw error;
    }
  }

  async getMcqQuestionById(mcqQuestionId) {
    try {
      if (!mcqQuestionId) throw new BadRequestError('MCQ Question ID is required');
      const result = await questionBankRepository.findMcqQuestionById(mcqQuestionId);
      if (!result) throw new NotFoundError('MCQ Question not found');
      return result;
    } catch (error) {
      logger.error(`Error fetching MCQ question ${mcqQuestionId}:`, error);
      throw error;
    }
  }

  async createMcqQuestion(mcqQuestionData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const payload = { ...mcqQuestionData };
      const created = await questionBankRepository.createMcqQuestion(payload);
      logger.info(`MCQ Question created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating MCQ question:', error);
      throw error;
    }
  }

  async updateMcqQuestion(mcqQuestionId, updates, actingUserId) {
    try {
      if (!mcqQuestionId) throw new BadRequestError('MCQ Question ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await questionBankRepository.findMcqQuestionById(mcqQuestionId);
      if (!existing) throw new NotFoundError('MCQ Question not found');
      const updated = await questionBankRepository.updateMcqQuestion(mcqQuestionId, updates);
      logger.info(`MCQ Question updated: ${mcqQuestionId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating MCQ question ${mcqQuestionId}:`, error);
      throw error;
    }
  }

  async deleteMcqQuestion(mcqQuestionId, actingUserId) {
    try {
      if (!mcqQuestionId) throw new BadRequestError('MCQ Question ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await questionBankRepository.findMcqQuestionById(mcqQuestionId);
      if (!existing) throw new NotFoundError('MCQ Question not found');
      await questionBankRepository.deleteMcqQuestion(mcqQuestionId);
      logger.info(`MCQ Question deleted: ${mcqQuestionId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting MCQ question ${mcqQuestionId}:`, error);
      throw error;
    }
  }

  async restoreMcqQuestion(mcqQuestionId, restoreTranslations = true, restoreOptions = true, actingUserId) {
    try {
      if (!mcqQuestionId) throw new BadRequestError('MCQ Question ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const restored = await questionBankRepository.restoreMcqQuestion(mcqQuestionId, restoreTranslations, restoreOptions);
      logger.info(`MCQ Question restored: ${mcqQuestionId}`, { restoredBy: actingUserId });
      return { id: restored.id };
    } catch (error) {
      logger.error(`Error restoring MCQ question ${mcqQuestionId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // MCQ QUESTION TRANSLATIONS (2/14)
  // ─────────────────────────────────────────────────────────────

  async createMcqQuestionTranslation(translationData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!translationData.mcqQuestionId) throw new BadRequestError('MCQ Question ID is required');
      if (!translationData.languageId) throw new BadRequestError('Language ID is required');
      if (!translationData.questionText) throw new BadRequestError('Question text is required');

      const payload = { ...translationData };

      // Handle image_1 upload
      if (payload.image1File) {
        const path = `questions/mcq/translations/${Date.now()}_${payload.image1File.originalname}`;
        const result = await bunnyService.uploadFile(payload.image1File.buffer, path);
        payload.image1 = result.cdnUrl;
      }

      // Handle image_2 upload
      if (payload.image2File) {
        const path = `questions/mcq/translations/${Date.now()}_${payload.image2File.originalname}`;
        const result = await bunnyService.uploadFile(payload.image2File.buffer, path);
        payload.image2 = result.cdnUrl;
      }

      const created = await questionBankRepository.createMcqQuestionTranslation(payload);
      logger.info(`MCQ Question Translation created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating MCQ question translation:', error);
      throw error;
    }
  }

  async updateMcqQuestionTranslation(mcqQuestionTranslationId, updates, actingUserId) {
    try {
      if (!mcqQuestionTranslationId) throw new BadRequestError('MCQ Question Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await questionBankRepository.findMcqQuestionTranslationById(mcqQuestionTranslationId);
      if (!existing) throw new NotFoundError('MCQ Question Translation not found');

      const payload = { ...updates };

      // Handle image_1 upload and delete old
      if (payload.image1File) {
        if (existing.mcq_qt_image_1) {
          const oldPath = existing.mcq_qt_image_1.replace('https://cdn.growupmore.com/', '');
          await bunnyService.deleteFile(oldPath).catch(err => logger.warn('Failed to delete old image_1', err));
        }
        const path = `questions/mcq/translations/${Date.now()}_${payload.image1File.originalname}`;
        const result = await bunnyService.uploadFile(payload.image1File.buffer, path);
        payload.image1 = result.cdnUrl;
      }

      // Handle image_2 upload and delete old
      if (payload.image2File) {
        if (existing.mcq_qt_image_2) {
          const oldPath = existing.mcq_qt_image_2.replace('https://cdn.growupmore.com/', '');
          await bunnyService.deleteFile(oldPath).catch(err => logger.warn('Failed to delete old image_2', err));
        }
        const path = `questions/mcq/translations/${Date.now()}_${payload.image2File.originalname}`;
        const result = await bunnyService.uploadFile(payload.image2File.buffer, path);
        payload.image2 = result.cdnUrl;
      }

      const updated = await questionBankRepository.updateMcqQuestionTranslation(mcqQuestionTranslationId, payload);
      logger.info(`MCQ Question Translation updated: ${mcqQuestionTranslationId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating MCQ question translation ${mcqQuestionTranslationId}:`, error);
      throw error;
    }
  }

  async deleteMcqQuestionTranslation(mcqQuestionTranslationId, actingUserId) {
    try {
      if (!mcqQuestionTranslationId) throw new BadRequestError('MCQ Question Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await questionBankRepository.findMcqQuestionTranslationById(mcqQuestionTranslationId);
      if (!existing) throw new NotFoundError('MCQ Question Translation not found');
      await questionBankRepository.deleteMcqQuestionTranslation(mcqQuestionTranslationId);
      logger.info(`MCQ Question Translation deleted: ${mcqQuestionTranslationId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting MCQ question translation ${mcqQuestionTranslationId}:`, error);
      throw error;
    }
  }

  async restoreMcqQuestionTranslation(mcqQuestionTranslationId, actingUserId) {
    try {
      if (!mcqQuestionTranslationId) throw new BadRequestError('MCQ Question Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const restored = await questionBankRepository.restoreMcqQuestionTranslation(mcqQuestionTranslationId);
      logger.info(`MCQ Question Translation restored: ${mcqQuestionTranslationId}`, { restoredBy: actingUserId });
      return { id: restored.id };
    } catch (error) {
      logger.error(`Error restoring MCQ question translation ${mcqQuestionTranslationId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // MCQ OPTIONS (3/14)
  // ─────────────────────────────────────────────────────────────

  async createMcqOption(mcqOptionData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!mcqOptionData.mcqQuestionId) throw new BadRequestError('MCQ Question ID is required');
      const payload = { ...mcqOptionData };
      const created = await questionBankRepository.createMcqOption(payload);
      logger.info(`MCQ Option created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating MCQ option:', error);
      throw error;
    }
  }

  async updateMcqOption(mcqOptionId, updates, actingUserId) {
    try {
      if (!mcqOptionId) throw new BadRequestError('MCQ Option ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await questionBankRepository.findMcqOptionById(mcqOptionId);
      if (!existing) throw new NotFoundError('MCQ Option not found');
      const updated = await questionBankRepository.updateMcqOption(mcqOptionId, updates);
      logger.info(`MCQ Option updated: ${mcqOptionId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating MCQ option ${mcqOptionId}:`, error);
      throw error;
    }
  }

  async deleteMcqOption(mcqOptionId, actingUserId) {
    try {
      if (!mcqOptionId) throw new BadRequestError('MCQ Option ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await questionBankRepository.findMcqOptionById(mcqOptionId);
      if (!existing) throw new NotFoundError('MCQ Option not found');
      await questionBankRepository.deleteMcqOption(mcqOptionId);
      logger.info(`MCQ Option deleted: ${mcqOptionId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting MCQ option ${mcqOptionId}:`, error);
      throw error;
    }
  }

  async restoreMcqOption(mcqOptionId, restoreTranslations = true, actingUserId) {
    try {
      if (!mcqOptionId) throw new BadRequestError('MCQ Option ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const restored = await questionBankRepository.restoreMcqOption(mcqOptionId, restoreTranslations);
      logger.info(`MCQ Option restored: ${mcqOptionId}`, { restoredBy: actingUserId });
      return { id: restored.id };
    } catch (error) {
      logger.error(`Error restoring MCQ option ${mcqOptionId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // MCQ OPTION TRANSLATIONS (4/14)
  // ─────────────────────────────────────────────────────────────

  async createMcqOptionTranslation(translationData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!translationData.mcqOptionId) throw new BadRequestError('MCQ Option ID is required');
      if (!translationData.languageId) throw new BadRequestError('Language ID is required');
      if (!translationData.optionText) throw new BadRequestError('Option text is required');

      const payload = { ...translationData };

      // Handle image upload
      if (payload.imageFile) {
        const path = `questions/mcq/options/${Date.now()}_${payload.imageFile.originalname}`;
        const result = await bunnyService.uploadFile(payload.imageFile.buffer, path);
        payload.image = result.cdnUrl;
      }

      const created = await questionBankRepository.createMcqOptionTranslation(payload);
      logger.info(`MCQ Option Translation created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating MCQ option translation:', error);
      throw error;
    }
  }

  async updateMcqOptionTranslation(mcqOptionTranslationId, updates, actingUserId) {
    try {
      if (!mcqOptionTranslationId) throw new BadRequestError('MCQ Option Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await questionBankRepository.findMcqOptionTranslationById(mcqOptionTranslationId);
      if (!existing) throw new NotFoundError('MCQ Option Translation not found');

      const payload = { ...updates };

      // Handle image upload and delete old
      if (payload.imageFile) {
        if (existing.mcq_ot_image) {
          const oldPath = existing.mcq_ot_image.replace('https://cdn.growupmore.com/', '');
          await bunnyService.deleteFile(oldPath).catch(err => logger.warn('Failed to delete old image', err));
        }
        const path = `questions/mcq/options/${Date.now()}_${payload.imageFile.originalname}`;
        const result = await bunnyService.uploadFile(payload.imageFile.buffer, path);
        payload.image = result.cdnUrl;
      }

      const updated = await questionBankRepository.updateMcqOptionTranslation(mcqOptionTranslationId, payload);
      logger.info(`MCQ Option Translation updated: ${mcqOptionTranslationId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating MCQ option translation ${mcqOptionTranslationId}:`, error);
      throw error;
    }
  }

  async deleteMcqOptionTranslation(mcqOptionTranslationId, actingUserId) {
    try {
      if (!mcqOptionTranslationId) throw new BadRequestError('MCQ Option Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await questionBankRepository.findMcqOptionTranslationById(mcqOptionTranslationId);
      if (!existing) throw new NotFoundError('MCQ Option Translation not found');
      await questionBankRepository.deleteMcqOptionTranslation(mcqOptionTranslationId);
      logger.info(`MCQ Option Translation deleted: ${mcqOptionTranslationId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting MCQ option translation ${mcqOptionTranslationId}:`, error);
      throw error;
    }
  }

  async restoreMcqOptionTranslation(mcqOptionTranslationId, actingUserId) {
    try {
      if (!mcqOptionTranslationId) throw new BadRequestError('MCQ Option Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const restored = await questionBankRepository.restoreMcqOptionTranslation(mcqOptionTranslationId);
      logger.info(`MCQ Option Translation restored: ${mcqOptionTranslationId}`, { restoredBy: actingUserId });
      return { id: restored.id };
    } catch (error) {
      logger.error(`Error restoring MCQ option translation ${mcqOptionTranslationId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // ONE-WORD QUESTIONS (5/14)
  // ─────────────────────────────────────────────────────────────

  async getOneWordQuestions(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;
      const repoOptions = {
        topicId: filters.topicId || null,
        questionType: filters.questionType || null,
        difficultyLevel: filters.difficultyLevel || null,
        isMandatory: filters.isMandatory || null,
        isCaseSensitive: filters.isCaseSensitive || null,
        isActive: filters.isActive || null,
        isDeleted: filters.isDeleted || null,
        oneWordQuestionId: filters.oneWordQuestionId || null,
        languageId: filters.languageId || null,
        searchText: search || null,
        searchFields: search ? (options.searchFields || ['question_text']) : null,
        sortTable: sort?.table || 'translation',
        sortColumn: sort?.column || 'created_at',
        sortOrder: sort?.order || 'DESC',
        pageIndex: pagination.pageIndex || 0,
        pageSize: pagination.pageSize || 25,
      };
      return await questionBankRepository.getOneWordQuestions(repoOptions);
    } catch (error) {
      logger.error('Error fetching one-word questions:', error);
      throw error;
    }
  }

  async getOneWordQuestionById(oneWordQuestionId) {
    try {
      if (!oneWordQuestionId) throw new BadRequestError('One-Word Question ID is required');
      const result = await questionBankRepository.findOneWordQuestionById(oneWordQuestionId);
      if (!result) throw new NotFoundError('One-Word Question not found');
      return result;
    } catch (error) {
      logger.error(`Error fetching one-word question ${oneWordQuestionId}:`, error);
      throw error;
    }
  }

  async createOneWordQuestion(oneWordQuestionData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const payload = { ...oneWordQuestionData };
      const created = await questionBankRepository.createOneWordQuestion(payload);
      logger.info(`One-Word Question created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating one-word question:', error);
      throw error;
    }
  }

  async updateOneWordQuestion(oneWordQuestionId, updates, actingUserId) {
    try {
      if (!oneWordQuestionId) throw new BadRequestError('One-Word Question ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await questionBankRepository.findOneWordQuestionById(oneWordQuestionId);
      if (!existing) throw new NotFoundError('One-Word Question not found');
      const updated = await questionBankRepository.updateOneWordQuestion(oneWordQuestionId, updates);
      logger.info(`One-Word Question updated: ${oneWordQuestionId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating one-word question ${oneWordQuestionId}:`, error);
      throw error;
    }
  }

  async deleteOneWordQuestion(oneWordQuestionId, actingUserId) {
    try {
      if (!oneWordQuestionId) throw new BadRequestError('One-Word Question ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await questionBankRepository.findOneWordQuestionById(oneWordQuestionId);
      if (!existing) throw new NotFoundError('One-Word Question not found');
      await questionBankRepository.deleteOneWordQuestion(oneWordQuestionId);
      logger.info(`One-Word Question deleted: ${oneWordQuestionId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting one-word question ${oneWordQuestionId}:`, error);
      throw error;
    }
  }

  async restoreOneWordQuestion(oneWordQuestionId, restoreTranslations = true, actingUserId) {
    try {
      if (!oneWordQuestionId) throw new BadRequestError('One-Word Question ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const restored = await questionBankRepository.restoreOneWordQuestion(oneWordQuestionId, restoreTranslations);
      logger.info(`One-Word Question restored: ${oneWordQuestionId}`, { restoredBy: actingUserId });
      return { id: restored.id };
    } catch (error) {
      logger.error(`Error restoring one-word question ${oneWordQuestionId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // ONE-WORD QUESTION TRANSLATIONS (6/14)
  // ─────────────────────────────────────────────────────────────

  async createOneWordQuestionTranslation(translationData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!translationData.oneWordQuestionId) throw new BadRequestError('One-Word Question ID is required');
      if (!translationData.languageId) throw new BadRequestError('Language ID is required');
      if (!translationData.questionText) throw new BadRequestError('Question text is required');
      if (!translationData.correctAnswer) throw new BadRequestError('Correct answer is required');

      const payload = { ...translationData };

      // Handle image_1 upload
      if (payload.image1File) {
        const path = `questions/one-word/translations/${Date.now()}_${payload.image1File.originalname}`;
        const result = await bunnyService.uploadFile(payload.image1File.buffer, path);
        payload.image1 = result.cdnUrl;
      }

      // Handle image_2 upload
      if (payload.image2File) {
        const path = `questions/one-word/translations/${Date.now()}_${payload.image2File.originalname}`;
        const result = await bunnyService.uploadFile(payload.image2File.buffer, path);
        payload.image2 = result.cdnUrl;
      }

      const created = await questionBankRepository.createOneWordQuestionTranslation(payload);
      logger.info(`One-Word Question Translation created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating one-word question translation:', error);
      throw error;
    }
  }

  async updateOneWordQuestionTranslation(oneWordQuestionTranslationId, updates, actingUserId) {
    try {
      if (!oneWordQuestionTranslationId) throw new BadRequestError('One-Word Question Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await questionBankRepository.findOneWordQuestionTranslationById(oneWordQuestionTranslationId);
      if (!existing) throw new NotFoundError('One-Word Question Translation not found');

      const payload = { ...updates };

      // Handle image_1 upload and delete old
      if (payload.image1File) {
        if (existing.owq_t_image_1) {
          const oldPath = existing.owq_t_image_1.replace('https://cdn.growupmore.com/', '');
          await bunnyService.deleteFile(oldPath).catch(err => logger.warn('Failed to delete old image_1', err));
        }
        const path = `questions/one-word/translations/${Date.now()}_${payload.image1File.originalname}`;
        const result = await bunnyService.uploadFile(payload.image1File.buffer, path);
        payload.image1 = result.cdnUrl;
      }

      // Handle image_2 upload and delete old
      if (payload.image2File) {
        if (existing.owq_t_image_2) {
          const oldPath = existing.owq_t_image_2.replace('https://cdn.growupmore.com/', '');
          await bunnyService.deleteFile(oldPath).catch(err => logger.warn('Failed to delete old image_2', err));
        }
        const path = `questions/one-word/translations/${Date.now()}_${payload.image2File.originalname}`;
        const result = await bunnyService.uploadFile(payload.image2File.buffer, path);
        payload.image2 = result.cdnUrl;
      }

      // Handle clearing images
      if (payload.allowClearImage1) {
        if (existing.owq_t_image_1) {
          const oldPath = existing.owq_t_image_1.replace('https://cdn.growupmore.com/', '');
          await bunnyService.deleteFile(oldPath).catch(err => logger.warn('Failed to delete image_1', err));
        }
        payload.image1 = null;
      }

      if (payload.allowClearImage2) {
        if (existing.owq_t_image_2) {
          const oldPath = existing.owq_t_image_2.replace('https://cdn.growupmore.com/', '');
          await bunnyService.deleteFile(oldPath).catch(err => logger.warn('Failed to delete image_2', err));
        }
        payload.image2 = null;
      }

      if (payload.allowClearExplanation) {
        payload.explanation = null;
      }

      if (payload.allowClearHint) {
        payload.hint = null;
      }

      const updated = await questionBankRepository.updateOneWordQuestionTranslation(oneWordQuestionTranslationId, payload);
      logger.info(`One-Word Question Translation updated: ${oneWordQuestionTranslationId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating one-word question translation ${oneWordQuestionTranslationId}:`, error);
      throw error;
    }
  }

  async deleteOneWordQuestionTranslation(oneWordQuestionTranslationId, actingUserId) {
    try {
      if (!oneWordQuestionTranslationId) throw new BadRequestError('One-Word Question Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await questionBankRepository.findOneWordQuestionTranslationById(oneWordQuestionTranslationId);
      if (!existing) throw new NotFoundError('One-Word Question Translation not found');
      await questionBankRepository.deleteOneWordQuestionTranslation(oneWordQuestionTranslationId);
      logger.info(`One-Word Question Translation deleted: ${oneWordQuestionTranslationId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting one-word question translation ${oneWordQuestionTranslationId}:`, error);
      throw error;
    }
  }

  async restoreOneWordQuestionTranslation(oneWordQuestionTranslationId, actingUserId) {
    try {
      if (!oneWordQuestionTranslationId) throw new BadRequestError('One-Word Question Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const restored = await questionBankRepository.restoreOneWordQuestionTranslation(oneWordQuestionTranslationId);
      logger.info(`One-Word Question Translation restored: ${oneWordQuestionTranslationId}`, { restoredBy: actingUserId });
      return { id: restored.id };
    } catch (error) {
      logger.error(`Error restoring one-word question translation ${oneWordQuestionTranslationId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // ONE-WORD SYNONYMS (7/14)
  // ─────────────────────────────────────────────────────────────

  async createOneWordSynonym(synonymData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!synonymData.oneWordQuestionId) throw new BadRequestError('One-Word Question ID is required');
      const payload = { ...synonymData };
      const created = await questionBankRepository.createOneWordSynonym(payload);
      logger.info(`One-Word Synonym created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating one-word synonym:', error);
      throw error;
    }
  }

  async deleteOneWordSynonym(oneWordSynonymId, actingUserId) {
    try {
      if (!oneWordSynonymId) throw new BadRequestError('One-Word Synonym ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await questionBankRepository.findOneWordSynonymById(oneWordSynonymId);
      if (!existing) throw new NotFoundError('One-Word Synonym not found');
      await questionBankRepository.deleteOneWordSynonym(oneWordSynonymId);
      logger.info(`One-Word Synonym deleted: ${oneWordSynonymId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting one-word synonym ${oneWordSynonymId}:`, error);
      throw error;
    }
  }

  async restoreOneWordSynonym(oneWordSynonymId, actingUserId) {
    try {
      if (!oneWordSynonymId) throw new BadRequestError('One-Word Synonym ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const restored = await questionBankRepository.restoreOneWordSynonym(oneWordSynonymId);
      logger.info(`One-Word Synonym restored: ${oneWordSynonymId}`, { restoredBy: actingUserId });
      return { id: restored.id };
    } catch (error) {
      logger.error(`Error restoring one-word synonym ${oneWordSynonymId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // ONE-WORD SYNONYM TRANSLATIONS (8/14)
  // ─────────────────────────────────────────────────────────────

  async createOneWordSynonymTranslation(translationData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!translationData.oneWordSynonymId) throw new BadRequestError('One-Word Synonym ID is required');
      if (!translationData.languageId) throw new BadRequestError('Language ID is required');
      if (!translationData.synonymText) throw new BadRequestError('Synonym text is required');

      const payload = { ...translationData };
      const created = await questionBankRepository.createOneWordSynonymTranslation(payload);
      logger.info(`One-Word Synonym Translation created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating one-word synonym translation:', error);
      throw error;
    }
  }

  async updateOneWordSynonymTranslation(oneWordSynonymTranslationId, updates, actingUserId) {
    try {
      if (!oneWordSynonymTranslationId) throw new BadRequestError('One-Word Synonym Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await questionBankRepository.findOneWordSynonymTranslationById(oneWordSynonymTranslationId);
      if (!existing) throw new NotFoundError('One-Word Synonym Translation not found');

      const payload = { ...updates };
      const updated = await questionBankRepository.updateOneWordSynonymTranslation(oneWordSynonymTranslationId, payload);
      logger.info(`One-Word Synonym Translation updated: ${oneWordSynonymTranslationId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating one-word synonym translation ${oneWordSynonymTranslationId}:`, error);
      throw error;
    }
  }

  async deleteOneWordSynonymTranslation(oneWordSynonymTranslationId, actingUserId) {
    try {
      if (!oneWordSynonymTranslationId) throw new BadRequestError('One-Word Synonym Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await questionBankRepository.findOneWordSynonymTranslationById(oneWordSynonymTranslationId);
      if (!existing) throw new NotFoundError('One-Word Synonym Translation not found');
      await questionBankRepository.deleteOneWordSynonymTranslation(oneWordSynonymTranslationId);
      logger.info(`One-Word Synonym Translation deleted: ${oneWordSynonymTranslationId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting one-word synonym translation ${oneWordSynonymTranslationId}:`, error);
      throw error;
    }
  }

  async restoreOneWordSynonymTranslation(oneWordSynonymTranslationId, actingUserId) {
    try {
      if (!oneWordSynonymTranslationId) throw new BadRequestError('One-Word Synonym Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const restored = await questionBankRepository.restoreOneWordSynonymTranslation(oneWordSynonymTranslationId);
      logger.info(`One-Word Synonym Translation restored: ${oneWordSynonymTranslationId}`, { restoredBy: actingUserId });
      return { id: restored.id };
    } catch (error) {
      logger.error(`Error restoring one-word synonym translation ${oneWordSynonymTranslationId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DESCRIPTIVE QUESTIONS (9/14)
  // ─────────────────────────────────────────────────────────────

  async getDescriptiveQuestions(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;
      const repoOptions = {
        topicId: filters.topicId || null,
        answerType: filters.answerType || null,
        difficultyLevel: filters.difficultyLevel || null,
        isMandatory: filters.isMandatory || null,
        isActive: filters.isActive || null,
        isDeleted: filters.isDeleted || null,
        descriptiveQuestionId: filters.descriptiveQuestionId || null,
        languageId: filters.languageId || null,
        searchText: search || null,
        sortTable: sort?.table || 'translation',
        sortColumn: sort?.column || 'dq_display_order',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.pageIndex || 1,
        pageSize: pagination.pageSize || 50,
      };
      return await questionBankRepository.getDescriptiveQuestions(repoOptions);
    } catch (error) {
      logger.error('Error fetching descriptive questions:', error);
      throw error;
    }
  }

  async getDescriptiveQuestionById(descriptiveQuestionId) {
    try {
      if (!descriptiveQuestionId) throw new BadRequestError('Descriptive Question ID is required');
      const result = await questionBankRepository.findDescriptiveQuestionById(descriptiveQuestionId);
      if (!result) throw new NotFoundError('Descriptive Question not found');
      return result;
    } catch (error) {
      logger.error(`Error fetching descriptive question ${descriptiveQuestionId}:`, error);
      throw error;
    }
  }

  async createDescriptiveQuestion(descriptiveQuestionData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const payload = { ...descriptiveQuestionData };
      const created = await questionBankRepository.createDescriptiveQuestion(payload);
      logger.info(`Descriptive Question created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating descriptive question:', error);
      throw error;
    }
  }

  async updateDescriptiveQuestion(descriptiveQuestionId, updates, actingUserId) {
    try {
      if (!descriptiveQuestionId) throw new BadRequestError('Descriptive Question ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await questionBankRepository.findDescriptiveQuestionById(descriptiveQuestionId);
      if (!existing) throw new NotFoundError('Descriptive Question not found');
      const updated = await questionBankRepository.updateDescriptiveQuestion(descriptiveQuestionId, updates);
      logger.info(`Descriptive Question updated: ${descriptiveQuestionId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating descriptive question ${descriptiveQuestionId}:`, error);
      throw error;
    }
  }

  async deleteDescriptiveQuestion(descriptiveQuestionId, actingUserId) {
    try {
      if (!descriptiveQuestionId) throw new BadRequestError('Descriptive Question ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await questionBankRepository.findDescriptiveQuestionById(descriptiveQuestionId);
      if (!existing) throw new NotFoundError('Descriptive Question not found');
      await questionBankRepository.deleteDescriptiveQuestion(descriptiveQuestionId);
      logger.info(`Descriptive Question deleted: ${descriptiveQuestionId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting descriptive question ${descriptiveQuestionId}:`, error);
      throw error;
    }
  }

  async restoreDescriptiveQuestion(descriptiveQuestionId, restoreTranslations = true, actingUserId) {
    try {
      if (!descriptiveQuestionId) throw new BadRequestError('Descriptive Question ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const restored = await questionBankRepository.restoreDescriptiveQuestion(descriptiveQuestionId, restoreTranslations);
      logger.info(`Descriptive Question restored: ${descriptiveQuestionId}`, { restoredBy: actingUserId });
      return { id: restored.id };
    } catch (error) {
      logger.error(`Error restoring descriptive question ${descriptiveQuestionId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DESCRIPTIVE QUESTION TRANSLATIONS (10/14)
  // ─────────────────────────────────────────────────────────────

  async createDescriptiveQuestionTranslation(translationData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!translationData.descriptiveQuestionId) throw new BadRequestError('Descriptive Question ID is required');
      if (!translationData.languageId) throw new BadRequestError('Language ID is required');
      if (!translationData.questionText) throw new BadRequestError('Question text is required');

      const payload = { ...translationData };

      // Handle 6 question and answer images
      for (let i = 1; i <= 3; i++) {
        if (payload[`questionImage${i}File`]) {
          const path = `questions/descriptive/translations/${Date.now()}_${payload[`questionImage${i}File`].originalname}`;
          const result = await bunnyService.uploadFile(payload[`questionImage${i}File`].buffer, path);
          payload[`questionImage${i}`] = result.cdnUrl;
        }
      }

      for (let i = 1; i <= 3; i++) {
        if (payload[`answerImage${i}File`]) {
          const path = `questions/descriptive/translations/${Date.now()}_${payload[`answerImage${i}File`].originalname}`;
          const result = await bunnyService.uploadFile(payload[`answerImage${i}File`].buffer, path);
          payload[`answerImage${i}`] = result.cdnUrl;
        }
      }

      const created = await questionBankRepository.createDescriptiveQuestionTranslation(payload);
      logger.info(`Descriptive Question Translation created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating descriptive question translation:', error);
      throw error;
    }
  }

  async updateDescriptiveQuestionTranslation(descriptiveQuestionTranslationId, updates, actingUserId) {
    try {
      if (!descriptiveQuestionTranslationId) throw new BadRequestError('Descriptive Question Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await questionBankRepository.findDescriptiveQuestionTranslationById(descriptiveQuestionTranslationId);
      if (!existing) throw new NotFoundError('Descriptive Question Translation not found');

      const payload = { ...updates };

      // Handle 6 question and answer images - upload and delete old
      for (let i = 1; i <= 3; i++) {
        const fileKey = `questionImage${i}File`;
        const urlKey = `questionImage${i}`;
        const existingKey = `dq_t_question_image_${i}`;

        if (payload[fileKey]) {
          if (existing[existingKey]) {
            const oldPath = existing[existingKey].replace('https://cdn.growupmore.com/', '');
            await bunnyService.deleteFile(oldPath).catch(err => logger.warn(`Failed to delete old question_image_${i}`, err));
          }
          const path = `questions/descriptive/translations/${Date.now()}_${payload[fileKey].originalname}`;
          const result = await bunnyService.uploadFile(payload[fileKey].buffer, path);
          payload[urlKey] = result.cdnUrl;
        }
      }

      for (let i = 1; i <= 3; i++) {
        const fileKey = `answerImage${i}File`;
        const urlKey = `answerImage${i}`;
        const existingKey = `dq_t_answer_image_${i}`;

        if (payload[fileKey]) {
          if (existing[existingKey]) {
            const oldPath = existing[existingKey].replace('https://cdn.growupmore.com/', '');
            await bunnyService.deleteFile(oldPath).catch(err => logger.warn(`Failed to delete old answer_image_${i}`, err));
          }
          const path = `questions/descriptive/translations/${Date.now()}_${payload[fileKey].originalname}`;
          const result = await bunnyService.uploadFile(payload[fileKey].buffer, path);
          payload[urlKey] = result.cdnUrl;
        }
      }

      const updated = await questionBankRepository.updateDescriptiveQuestionTranslation(descriptiveQuestionTranslationId, payload);
      logger.info(`Descriptive Question Translation updated: ${descriptiveQuestionTranslationId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating descriptive question translation ${descriptiveQuestionTranslationId}:`, error);
      throw error;
    }
  }

  async deleteDescriptiveQuestionTranslation(descriptiveQuestionTranslationId, actingUserId) {
    try {
      if (!descriptiveQuestionTranslationId) throw new BadRequestError('Descriptive Question Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await questionBankRepository.findDescriptiveQuestionTranslationById(descriptiveQuestionTranslationId);
      if (!existing) throw new NotFoundError('Descriptive Question Translation not found');
      await questionBankRepository.deleteDescriptiveQuestionTranslation(descriptiveQuestionTranslationId);
      logger.info(`Descriptive Question Translation deleted: ${descriptiveQuestionTranslationId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting descriptive question translation ${descriptiveQuestionTranslationId}:`, error);
      throw error;
    }
  }

  async restoreDescriptiveQuestionTranslation(descriptiveQuestionTranslationId, actingUserId) {
    try {
      if (!descriptiveQuestionTranslationId) throw new BadRequestError('Descriptive Question Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const restored = await questionBankRepository.restoreDescriptiveQuestionTranslation(descriptiveQuestionTranslationId);
      logger.info(`Descriptive Question Translation restored: ${descriptiveQuestionTranslationId}`, { restoredBy: actingUserId });
      return { id: restored.id };
    } catch (error) {
      logger.error(`Error restoring descriptive question translation ${descriptiveQuestionTranslationId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // MATCHING QUESTIONS (11/14)
  // ─────────────────────────────────────────────────────────────

  async getMatchingQuestions(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;
      const repoOptions = {
        topicId: filters.topicId || null,
        difficultyLevel: filters.difficultyLevel || null,
        isMandatory: filters.isMandatory || null,
        partialScoring: filters.partialScoring || null,
        isDeleted: filters.isDeleted || null,
        matchingQuestionId: filters.matchingQuestionId || null,
        languageId: filters.languageId || null,
        searchText: search || null,
        sortTable: sort?.table || 'question',
        sortColumn: sort?.column || 'created_at',
        sortDirection: sort?.direction || 'DESC',
        pageIndex: pagination.pageIndex || 1,
        pageSize: pagination.pageSize || 20,
      };
      return await questionBankRepository.getMatchingQuestions(repoOptions);
    } catch (error) {
      logger.error('Error fetching matching questions:', error);
      throw error;
    }
  }

  async getMatchingQuestionById(matchingQuestionId) {
    try {
      if (!matchingQuestionId) throw new BadRequestError('Matching Question ID is required');
      const result = await questionBankRepository.findMatchingQuestionById(matchingQuestionId);
      if (!result) throw new NotFoundError('Matching Question not found');
      return result;
    } catch (error) {
      logger.error(`Error fetching matching question ${matchingQuestionId}:`, error);
      throw error;
    }
  }

  async createMatchingQuestion(matchingQuestionData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const payload = { ...matchingQuestionData };
      const created = await questionBankRepository.createMatchingQuestion(payload);
      logger.info(`Matching Question created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating matching question:', error);
      throw error;
    }
  }

  async updateMatchingQuestion(matchingQuestionId, updates, actingUserId) {
    try {
      if (!matchingQuestionId) throw new BadRequestError('Matching Question ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await questionBankRepository.findMatchingQuestionById(matchingQuestionId);
      if (!existing) throw new NotFoundError('Matching Question not found');
      const updated = await questionBankRepository.updateMatchingQuestion(matchingQuestionId, updates);
      logger.info(`Matching Question updated: ${matchingQuestionId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating matching question ${matchingQuestionId}:`, error);
      throw error;
    }
  }

  async deleteMatchingQuestion(matchingQuestionId, actingUserId) {
    try {
      if (!matchingQuestionId) throw new BadRequestError('Matching Question ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await questionBankRepository.findMatchingQuestionById(matchingQuestionId);
      if (!existing) throw new NotFoundError('Matching Question not found');
      await questionBankRepository.deleteMatchingQuestion(matchingQuestionId);
      logger.info(`Matching Question deleted: ${matchingQuestionId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting matching question ${matchingQuestionId}:`, error);
      throw error;
    }
  }

  async restoreMatchingQuestion(matchingQuestionId, restoreTranslations = true, actingUserId) {
    try {
      if (!matchingQuestionId) throw new BadRequestError('Matching Question ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const restored = await questionBankRepository.restoreMatchingQuestion(matchingQuestionId, restoreTranslations);
      logger.info(`Matching Question restored: ${matchingQuestionId}`, { restoredBy: actingUserId });
      return { id: restored.id };
    } catch (error) {
      logger.error(`Error restoring matching question ${matchingQuestionId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // MATCHING PAIRS (12/14)
  // ─────────────────────────────────────────────────────────────

  async createMatchingPair(pairData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!pairData.matchingQuestionId) throw new BadRequestError('Matching Question ID is required');
      if (!pairData.correctPosition) throw new BadRequestError('Correct position is required');

      const payload = { ...pairData };
      const created = await questionBankRepository.createMatchingPair(payload);
      logger.info(`Matching Pair created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating matching pair:', error);
      throw error;
    }
  }

  async updateMatchingPair(matchingPairId, updates, actingUserId) {
    try {
      if (!matchingPairId) throw new BadRequestError('Matching Pair ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await questionBankRepository.findMatchingPairById(matchingPairId);
      if (!existing) throw new NotFoundError('Matching Pair not found');
      const updated = await questionBankRepository.updateMatchingPair(matchingPairId, updates);
      logger.info(`Matching Pair updated: ${matchingPairId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating matching pair ${matchingPairId}:`, error);
      throw error;
    }
  }

  async deleteMatchingPair(matchingPairId, actingUserId) {
    try {
      if (!matchingPairId) throw new BadRequestError('Matching Pair ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await questionBankRepository.findMatchingPairById(matchingPairId);
      if (!existing) throw new NotFoundError('Matching Pair not found');
      await questionBankRepository.deleteMatchingPair(matchingPairId);
      logger.info(`Matching Pair deleted: ${matchingPairId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting matching pair ${matchingPairId}:`, error);
      throw error;
    }
  }

  async restoreMatchingPair(matchingPairId, actingUserId) {
    try {
      if (!matchingPairId) throw new BadRequestError('Matching Pair ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const restored = await questionBankRepository.restoreMatchingPair(matchingPairId);
      logger.info(`Matching Pair restored: ${matchingPairId}`, { restoredBy: actingUserId });
      return { id: restored.id };
    } catch (error) {
      logger.error(`Error restoring matching pair ${matchingPairId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // ORDERING QUESTIONS (13/14)
  // ─────────────────────────────────────────────────────────────

  async getOrderingQuestions(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;
      const repoOptions = {
        topicId: filters.topicId || null,
        difficultyLevel: filters.difficultyLevel || null,
        isMandatory: filters.isMandatory || null,
        partialScoring: filters.partialScoring || null,
        isDeleted: filters.isDeleted || null,
        orderingQuestionId: filters.orderingQuestionId || null,
        languageId: filters.languageId || null,
        searchQuery: search || null,
        sortTable: sort?.table || 'question',
        sortColumn: sort?.column || 'oq_id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.pageIndex || 1,
        pageSize: pagination.pageSize || 10,
      };
      return await questionBankRepository.getOrderingQuestions(repoOptions);
    } catch (error) {
      logger.error('Error fetching ordering questions:', error);
      throw error;
    }
  }

  async getOrderingQuestionById(orderingQuestionId) {
    try {
      if (!orderingQuestionId) throw new BadRequestError('Ordering Question ID is required');
      const result = await questionBankRepository.findOrderingQuestionById(orderingQuestionId);
      if (!result) throw new NotFoundError('Ordering Question not found');
      return result;
    } catch (error) {
      logger.error(`Error fetching ordering question ${orderingQuestionId}:`, error);
      throw error;
    }
  }

  async createOrderingQuestion(orderingQuestionData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const payload = { ...orderingQuestionData };
      const created = await questionBankRepository.createOrderingQuestion(payload);
      logger.info(`Ordering Question created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating ordering question:', error);
      throw error;
    }
  }

  async updateOrderingQuestion(orderingQuestionId, updates, actingUserId) {
    try {
      if (!orderingQuestionId) throw new BadRequestError('Ordering Question ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await questionBankRepository.findOrderingQuestionById(orderingQuestionId);
      if (!existing) throw new NotFoundError('Ordering Question not found');
      const updated = await questionBankRepository.updateOrderingQuestion(orderingQuestionId, updates);
      logger.info(`Ordering Question updated: ${orderingQuestionId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating ordering question ${orderingQuestionId}:`, error);
      throw error;
    }
  }

  async deleteOrderingQuestion(orderingQuestionId, actingUserId) {
    try {
      if (!orderingQuestionId) throw new BadRequestError('Ordering Question ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await questionBankRepository.findOrderingQuestionById(orderingQuestionId);
      if (!existing) throw new NotFoundError('Ordering Question not found');
      await questionBankRepository.deleteOrderingQuestion(orderingQuestionId);
      logger.info(`Ordering Question deleted: ${orderingQuestionId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting ordering question ${orderingQuestionId}:`, error);
      throw error;
    }
  }

  async restoreOrderingQuestion(orderingQuestionId, restoreTranslations = true, actingUserId) {
    try {
      if (!orderingQuestionId) throw new BadRequestError('Ordering Question ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const restored = await questionBankRepository.restoreOrderingQuestion(orderingQuestionId, restoreTranslations);
      logger.info(`Ordering Question restored: ${orderingQuestionId}`, { restoredBy: actingUserId });
      return { id: restored.id };
    } catch (error) {
      logger.error(`Error restoring ordering question ${orderingQuestionId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // ORDERING ITEMS (14/14)
  // ─────────────────────────────────────────────────────────────

  async createOrderingItem(itemData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!itemData.orderingQuestionId) throw new BadRequestError('Ordering Question ID is required');
      if (!itemData.correctPosition) throw new BadRequestError('Correct position is required');

      const payload = { ...itemData };
      const created = await questionBankRepository.createOrderingItem(payload);
      logger.info(`Ordering Item created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating ordering item:', error);
      throw error;
    }
  }

  async updateOrderingItem(orderingItemId, updates, actingUserId) {
    try {
      if (!orderingItemId) throw new BadRequestError('Ordering Item ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await questionBankRepository.findOrderingItemById(orderingItemId);
      if (!existing) throw new NotFoundError('Ordering Item not found');
      const updated = await questionBankRepository.updateOrderingItem(orderingItemId, updates);
      logger.info(`Ordering Item updated: ${orderingItemId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating ordering item ${orderingItemId}:`, error);
      throw error;
    }
  }

  async deleteOrderingItem(orderingItemId, actingUserId) {
    try {
      if (!orderingItemId) throw new BadRequestError('Ordering Item ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await questionBankRepository.findOrderingItemById(orderingItemId);
      if (!existing) throw new NotFoundError('Ordering Item not found');
      await questionBankRepository.deleteOrderingItem(orderingItemId);
      logger.info(`Ordering Item deleted: ${orderingItemId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting ordering item ${orderingItemId}:`, error);
      throw error;
    }
  }

  async restoreOrderingItem(orderingItemId, actingUserId) {
    try {
      if (!orderingItemId) throw new BadRequestError('Ordering Item ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const restored = await questionBankRepository.restoreOrderingItem(orderingItemId);
      logger.info(`Ordering Item restored: ${orderingItemId}`, { restoredBy: actingUserId });
      return { id: restored.id };
    } catch (error) {
      logger.error(`Error restoring ordering item ${orderingItemId}:`, error);
      throw error;
    }
  }
}

module.exports = new QuestionBankService();
