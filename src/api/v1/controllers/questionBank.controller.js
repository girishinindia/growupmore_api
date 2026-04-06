const questionBankService = require('../../../services/questionBank.service');
const { sendSuccess, sendCreated } = require('../../../utils/response');

class QuestionBankController {
  // ============ MCQ QUESTIONS ============

  async getMcqQuestions(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'question_text', sortDir = 'asc', topicId, mcqType, difficultyLevel, isMandatory, mcqQuestionId, languageId, isActive, ...filterParams } = req.query;
      const filters = {};
      if (topicId) filters.topicId = topicId;
      if (mcqType) filters.mcqType = mcqType;
      if (difficultyLevel) filters.difficultyLevel = difficultyLevel;
      if (isMandatory !== undefined) filters.isMandatory = isMandatory;
      if (mcqQuestionId) filters.mcqQuestionId = mcqQuestionId;
      if (languageId) filters.languageId = languageId;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await questionBankService.getMcqQuestions({
        filters,
        search,
        sort: { table: 'translation', field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = { page: Number(page), limit: Number(limit), totalCount: Number(totalCount), totalPages: Math.ceil(Number(totalCount) / Number(limit)) };
      sendSuccess(res, { data, message: 'MCQ Questions retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getMcqQuestionById(req, res, next) {
    try {
      const data = await questionBankService.getMcqQuestionById(req.params.id);
      sendSuccess(res, { data, message: 'MCQ Question retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createMcqQuestion(req, res, next) {
    try {
      const data = await questionBankService.createMcqQuestion(req.body, req.user.userId);
      sendCreated(res, { data, message: 'MCQ Question created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateMcqQuestion(req, res, next) {
    try {
      const data = await questionBankService.updateMcqQuestion(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'MCQ Question updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteMcqQuestion(req, res, next) {
    try {
      await questionBankService.deleteMcqQuestion(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'MCQ Question deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreMcqQuestion(req, res, next) {
    try {
      const data = await questionBankService.restoreMcqQuestion(req.params.id, req.body.restoreTranslations, req.body.restoreOptions, req.user.userId);
      sendSuccess(res, { data, message: 'MCQ Question restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ MCQ QUESTION TRANSLATIONS ============

  async createMcqQuestionTranslation(req, res, next) {
    try {
      if (req.files?.image1?.[0]) req.body.image1File = req.files.image1[0];
      if (req.files?.image2?.[0]) req.body.image2File = req.files.image2[0];

      const data = await questionBankService.createMcqQuestionTranslation(req.body, req.user.userId);
      sendCreated(res, { data, message: 'MCQ Question Translation created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateMcqQuestionTranslation(req, res, next) {
    try {
      if (req.files?.image1?.[0]) req.body.image1File = req.files.image1[0];
      if (req.files?.image2?.[0]) req.body.image2File = req.files.image2[0];

      const data = await questionBankService.updateMcqQuestionTranslation(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'MCQ Question Translation updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteMcqQuestionTranslation(req, res, next) {
    try {
      await questionBankService.deleteMcqQuestionTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'MCQ Question Translation deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreMcqQuestionTranslation(req, res, next) {
    try {
      const data = await questionBankService.restoreMcqQuestionTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { data, message: 'MCQ Question Translation restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ MCQ OPTIONS ============

  async createMcqOption(req, res, next) {
    try {
      const data = await questionBankService.createMcqOption(req.body, req.user.userId);
      sendCreated(res, { data, message: 'MCQ Option created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateMcqOption(req, res, next) {
    try {
      const data = await questionBankService.updateMcqOption(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'MCQ Option updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteMcqOption(req, res, next) {
    try {
      await questionBankService.deleteMcqOption(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'MCQ Option deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreMcqOption(req, res, next) {
    try {
      const data = await questionBankService.restoreMcqOption(req.params.id, req.body.restoreTranslations, req.user.userId);
      sendSuccess(res, { data, message: 'MCQ Option restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ MCQ OPTION TRANSLATIONS ============

  async createMcqOptionTranslation(req, res, next) {
    try {
      if (req.files?.image?.[0]) req.body.imageFile = req.files.image[0];

      const data = await questionBankService.createMcqOptionTranslation(req.body, req.user.userId);
      sendCreated(res, { data, message: 'MCQ Option Translation created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateMcqOptionTranslation(req, res, next) {
    try {
      if (req.files?.image?.[0]) req.body.imageFile = req.files.image[0];

      const data = await questionBankService.updateMcqOptionTranslation(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'MCQ Option Translation updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteMcqOptionTranslation(req, res, next) {
    try {
      await questionBankService.deleteMcqOptionTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'MCQ Option Translation deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreMcqOptionTranslation(req, res, next) {
    try {
      const data = await questionBankService.restoreMcqOptionTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { data, message: 'MCQ Option Translation restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ ONE-WORD QUESTIONS ============

  async getOneWordQuestions(req, res, next) {
    try {
      const { page = 1, limit = 25, search, sortBy = 'created_at', sortDir = 'desc', topicId, questionType, difficultyLevel, isMandatory, isCaseSensitive, oneWordQuestionId, languageId, isActive, ...filterParams } = req.query;
      const filters = {};
      if (topicId) filters.topicId = topicId;
      if (questionType) filters.questionType = questionType;
      if (difficultyLevel) filters.difficultyLevel = difficultyLevel;
      if (isMandatory !== undefined) filters.isMandatory = isMandatory;
      if (isCaseSensitive !== undefined) filters.isCaseSensitive = isCaseSensitive;
      if (oneWordQuestionId) filters.oneWordQuestionId = oneWordQuestionId;
      if (languageId) filters.languageId = languageId;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await questionBankService.getOneWordQuestions({
        filters,
        search,
        sort: { table: 'translation', field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = { page: Number(page), limit: Number(limit), totalCount: Number(totalCount), totalPages: Math.ceil(Number(totalCount) / Number(limit)) };
      sendSuccess(res, { data, message: 'One-Word Questions retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getOneWordQuestionById(req, res, next) {
    try {
      const data = await questionBankService.getOneWordQuestionById(req.params.id);
      sendSuccess(res, { data, message: 'One-Word Question retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createOneWordQuestion(req, res, next) {
    try {
      const data = await questionBankService.createOneWordQuestion(req.body, req.user.userId);
      sendCreated(res, { data, message: 'One-Word Question created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateOneWordQuestion(req, res, next) {
    try {
      const data = await questionBankService.updateOneWordQuestion(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'One-Word Question updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteOneWordQuestion(req, res, next) {
    try {
      await questionBankService.deleteOneWordQuestion(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'One-Word Question deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreOneWordQuestion(req, res, next) {
    try {
      const data = await questionBankService.restoreOneWordQuestion(req.params.id, req.body.restoreTranslations, req.user.userId);
      sendSuccess(res, { data, message: 'One-Word Question restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ ONE-WORD QUESTION TRANSLATIONS ============

  async createOneWordQuestionTranslation(req, res, next) {
    try {
      if (req.files?.image1?.[0]) req.body.image1File = req.files.image1[0];
      if (req.files?.image2?.[0]) req.body.image2File = req.files.image2[0];

      const data = await questionBankService.createOneWordQuestionTranslation(req.body, req.user.userId);
      sendCreated(res, { data, message: 'One-Word Question Translation created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateOneWordQuestionTranslation(req, res, next) {
    try {
      if (req.files?.image1?.[0]) req.body.image1File = req.files.image1[0];
      if (req.files?.image2?.[0]) req.body.image2File = req.files.image2[0];

      const data = await questionBankService.updateOneWordQuestionTranslation(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'One-Word Question Translation updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteOneWordQuestionTranslation(req, res, next) {
    try {
      await questionBankService.deleteOneWordQuestionTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'One-Word Question Translation deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreOneWordQuestionTranslation(req, res, next) {
    try {
      const data = await questionBankService.restoreOneWordQuestionTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { data, message: 'One-Word Question Translation restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ ONE-WORD SYNONYMS ============

  async createOneWordSynonym(req, res, next) {
    try {
      const data = await questionBankService.createOneWordSynonym(req.body, req.user.userId);
      sendCreated(res, { data, message: 'One-Word Synonym created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteOneWordSynonym(req, res, next) {
    try {
      await questionBankService.deleteOneWordSynonym(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'One-Word Synonym deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreOneWordSynonym(req, res, next) {
    try {
      const data = await questionBankService.restoreOneWordSynonym(req.params.id, req.user.userId);
      sendSuccess(res, { data, message: 'One-Word Synonym restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ ONE-WORD SYNONYM TRANSLATIONS ============

  async createOneWordSynonymTranslation(req, res, next) {
    try {
      const data = await questionBankService.createOneWordSynonymTranslation(req.body, req.user.userId);
      sendCreated(res, { data, message: 'One-Word Synonym Translation created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateOneWordSynonymTranslation(req, res, next) {
    try {
      const data = await questionBankService.updateOneWordSynonymTranslation(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'One-Word Synonym Translation updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteOneWordSynonymTranslation(req, res, next) {
    try {
      await questionBankService.deleteOneWordSynonymTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'One-Word Synonym Translation deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreOneWordSynonymTranslation(req, res, next) {
    try {
      const data = await questionBankService.restoreOneWordSynonymTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { data, message: 'One-Word Synonym Translation restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ DESCRIPTIVE QUESTIONS ============

  async getDescriptiveQuestions(req, res, next) {
    try {
      const { page = 1, limit = 50, search, sortBy = 'dq_display_order', sortDir = 'asc', topicId, answerType, difficultyLevel, isMandatory, descriptiveQuestionId, languageId, isActive, ...filterParams } = req.query;
      const filters = {};
      if (topicId) filters.topicId = topicId;
      if (answerType) filters.answerType = answerType;
      if (difficultyLevel) filters.difficultyLevel = difficultyLevel;
      if (isMandatory !== undefined) filters.isMandatory = isMandatory;
      if (descriptiveQuestionId) filters.descriptiveQuestionId = descriptiveQuestionId;
      if (languageId) filters.languageId = languageId;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await questionBankService.getDescriptiveQuestions({
        filters,
        search,
        sort: { table: 'translation', field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = { page: Number(page), limit: Number(limit), totalCount: Number(totalCount), totalPages: Math.ceil(Number(totalCount) / Number(limit)) };
      sendSuccess(res, { data, message: 'Descriptive Questions retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getDescriptiveQuestionById(req, res, next) {
    try {
      const data = await questionBankService.getDescriptiveQuestionById(req.params.id);
      sendSuccess(res, { data, message: 'Descriptive Question retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createDescriptiveQuestion(req, res, next) {
    try {
      const data = await questionBankService.createDescriptiveQuestion(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Descriptive Question created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateDescriptiveQuestion(req, res, next) {
    try {
      const data = await questionBankService.updateDescriptiveQuestion(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Descriptive Question updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteDescriptiveQuestion(req, res, next) {
    try {
      await questionBankService.deleteDescriptiveQuestion(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Descriptive Question deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreDescriptiveQuestion(req, res, next) {
    try {
      const data = await questionBankService.restoreDescriptiveQuestion(req.params.id, req.body.restoreTranslations, req.user.userId);
      sendSuccess(res, { data, message: 'Descriptive Question restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ DESCRIPTIVE QUESTION TRANSLATIONS ============

  async createDescriptiveQuestionTranslation(req, res, next) {
    try {
      if (req.files?.questionImage1?.[0]) req.body.questionImage1File = req.files.questionImage1[0];
      if (req.files?.questionImage2?.[0]) req.body.questionImage2File = req.files.questionImage2[0];
      if (req.files?.questionImage3?.[0]) req.body.questionImage3File = req.files.questionImage3[0];
      if (req.files?.answerImage1?.[0]) req.body.answerImage1File = req.files.answerImage1[0];
      if (req.files?.answerImage2?.[0]) req.body.answerImage2File = req.files.answerImage2[0];
      if (req.files?.answerImage3?.[0]) req.body.answerImage3File = req.files.answerImage3[0];

      const data = await questionBankService.createDescriptiveQuestionTranslation(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Descriptive Question Translation created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateDescriptiveQuestionTranslation(req, res, next) {
    try {
      if (req.files?.questionImage1?.[0]) req.body.questionImage1File = req.files.questionImage1[0];
      if (req.files?.questionImage2?.[0]) req.body.questionImage2File = req.files.questionImage2[0];
      if (req.files?.questionImage3?.[0]) req.body.questionImage3File = req.files.questionImage3[0];
      if (req.files?.answerImage1?.[0]) req.body.answerImage1File = req.files.answerImage1[0];
      if (req.files?.answerImage2?.[0]) req.body.answerImage2File = req.files.answerImage2[0];
      if (req.files?.answerImage3?.[0]) req.body.answerImage3File = req.files.answerImage3[0];

      const data = await questionBankService.updateDescriptiveQuestionTranslation(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Descriptive Question Translation updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteDescriptiveQuestionTranslation(req, res, next) {
    try {
      await questionBankService.deleteDescriptiveQuestionTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Descriptive Question Translation deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreDescriptiveQuestionTranslation(req, res, next) {
    try {
      const data = await questionBankService.restoreDescriptiveQuestionTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { data, message: 'Descriptive Question Translation restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ MATCHING QUESTIONS ============

  async getMatchingQuestions(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'created_at', sortDir = 'desc', topicId, difficultyLevel, isMandatory, partialScoring, matchingQuestionId, languageId, isActive, ...filterParams } = req.query;
      const filters = {};
      if (topicId) filters.topicId = topicId;
      if (difficultyLevel) filters.difficultyLevel = difficultyLevel;
      if (isMandatory !== undefined) filters.isMandatory = isMandatory;
      if (partialScoring !== undefined) filters.partialScoring = partialScoring;
      if (matchingQuestionId) filters.matchingQuestionId = matchingQuestionId;
      if (languageId) filters.languageId = languageId;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await questionBankService.getMatchingQuestions({
        filters,
        search,
        sort: { table: 'question', field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = { page: Number(page), limit: Number(limit), totalCount: Number(totalCount), totalPages: Math.ceil(Number(totalCount) / Number(limit)) };
      sendSuccess(res, { data, message: 'Matching Questions retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getMatchingQuestionById(req, res, next) {
    try {
      const data = await questionBankService.getMatchingQuestionById(req.params.id);
      sendSuccess(res, { data, message: 'Matching Question retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createMatchingQuestion(req, res, next) {
    try {
      const data = await questionBankService.createMatchingQuestion(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Matching Question created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateMatchingQuestion(req, res, next) {
    try {
      const data = await questionBankService.updateMatchingQuestion(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Matching Question updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteMatchingQuestion(req, res, next) {
    try {
      await questionBankService.deleteMatchingQuestion(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Matching Question deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreMatchingQuestion(req, res, next) {
    try {
      const data = await questionBankService.restoreMatchingQuestion(req.params.id, req.body.restoreTranslations, req.user.userId);
      sendSuccess(res, { data, message: 'Matching Question restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ MATCHING PAIRS ============

  async createMatchingPair(req, res, next) {
    try {
      const data = await questionBankService.createMatchingPair(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Matching Pair created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateMatchingPair(req, res, next) {
    try {
      const data = await questionBankService.updateMatchingPair(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Matching Pair updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteMatchingPair(req, res, next) {
    try {
      await questionBankService.deleteMatchingPair(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Matching Pair deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreMatchingPair(req, res, next) {
    try {
      const data = await questionBankService.restoreMatchingPair(req.params.id, req.user.userId);
      sendSuccess(res, { data, message: 'Matching Pair restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ ORDERING QUESTIONS ============

  async getOrderingQuestions(req, res, next) {
    try {
      const { page = 1, limit = 10, search, sortBy = 'oq_id', sortDir = 'asc', topicId, difficultyLevel, isMandatory, partialScoring, orderingQuestionId, languageId, isActive, ...filterParams } = req.query;
      const filters = {};
      if (topicId) filters.topicId = topicId;
      if (difficultyLevel) filters.difficultyLevel = difficultyLevel;
      if (isMandatory !== undefined) filters.isMandatory = isMandatory;
      if (partialScoring !== undefined) filters.partialScoring = partialScoring;
      if (orderingQuestionId) filters.orderingQuestionId = orderingQuestionId;
      if (languageId) filters.languageId = languageId;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await questionBankService.getOrderingQuestions({
        filters,
        search,
        sort: { table: 'question', field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = { page: Number(page), limit: Number(limit), totalCount: Number(totalCount), totalPages: Math.ceil(Number(totalCount) / Number(limit)) };
      sendSuccess(res, { data, message: 'Ordering Questions retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getOrderingQuestionById(req, res, next) {
    try {
      const data = await questionBankService.getOrderingQuestionById(req.params.id);
      sendSuccess(res, { data, message: 'Ordering Question retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createOrderingQuestion(req, res, next) {
    try {
      const data = await questionBankService.createOrderingQuestion(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Ordering Question created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateOrderingQuestion(req, res, next) {
    try {
      const data = await questionBankService.updateOrderingQuestion(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Ordering Question updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteOrderingQuestion(req, res, next) {
    try {
      await questionBankService.deleteOrderingQuestion(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Ordering Question deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreOrderingQuestion(req, res, next) {
    try {
      const data = await questionBankService.restoreOrderingQuestion(req.params.id, req.body.restoreTranslations, req.user.userId);
      sendSuccess(res, { data, message: 'Ordering Question restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ ORDERING ITEMS ============

  async createOrderingItem(req, res, next) {
    try {
      const data = await questionBankService.createOrderingItem(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Ordering Item created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateOrderingItem(req, res, next) {
    try {
      const data = await questionBankService.updateOrderingItem(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Ordering Item updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteOrderingItem(req, res, next) {
    try {
      await questionBankService.deleteOrderingItem(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Ordering Item deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreOrderingItem(req, res, next) {
    try {
      const data = await questionBankService.restoreOrderingItem(req.params.id, req.user.userId);
      sendSuccess(res, { data, message: 'Ordering Item restored successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new QuestionBankController();
