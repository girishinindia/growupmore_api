/**
 * ═══════════════════════════════════════════════════════════════
 * QUESTION BANK REPOSITORY — Database Layer (Supabase RPC)
 * ═══════════════════════════════════════════════════════════════
 * Handles 14 question bank entities via stored procedures:
 *
 *   1. MCQ QUESTIONS (has udf_get)
 *      - udf_get_mcq_questions
 *      - sp_mcq_questions_insert, update, delete, restore
 *
 *   2. MCQ QUESTION TRANSLATIONS (no udf_get)
 *      - sp_mcq_question_translations_insert, update, delete, restore
 *
 *   3. MCQ OPTIONS (no udf_get)
 *      - sp_mcq_options_insert, update, delete, restore
 *
 *   4. MCQ OPTION TRANSLATIONS (no udf_get)
 *      - sp_mcq_option_translations_insert, update, delete, restore
 *
 *   5. ONE-WORD QUESTIONS (has udf_get)
 *      - udf_get_one_word_questions
 *      - sp_one_word_questions_insert, update, delete, restore
 *
 *   6. ONE-WORD QUESTION TRANSLATIONS (no udf_get)
 *      - sp_one_word_question_translations_insert, update, delete, restore
 *
 *   7. ONE-WORD SYNONYMS (no udf_get)
 *      - sp_one_word_synonyms_insert, delete, restore
 *
 *   8. ONE-WORD SYNONYM TRANSLATIONS (no udf_get)
 *      - sp_one_word_synonym_translations_insert, update, delete, restore
 *
 *   9. DESCRIPTIVE QUESTIONS (has udf_get)
 *      - udf_get_descriptive_questions
 *      - sp_descriptive_questions_insert, update, delete, restore
 *
 *   10. DESCRIPTIVE QUESTION TRANSLATIONS (no udf_get)
 *       - sp_descriptive_question_translations_insert, update, delete, restore
 *
 *   11. MATCHING QUESTIONS (has udf_get)
 *       - udf_get_matching_questions
 *       - sp_matching_questions_insert, update, delete, restore
 *
 *   12. MATCHING PAIRS (no udf_get)
 *       - sp_matching_pairs_insert, update, delete, restore
 *
 *   13. ORDERING QUESTIONS (has udf_get)
 *       - udf_get_ordering_questions
 *       - sp_ordering_questions_insert, update, delete, restore
 *
 *   14. ORDERING ITEMS (no udf_get)
 *       - sp_ordering_items_insert, update, delete, restore
 * ═══════════════════════════════════════════════════════════════
 */

const { supabase } = require('../config/database');
const logger = require('../config/logger');

class QuestionBankRepository {
  // ─────────────────────────────────────────────────────────────
  // 1. MCQ QUESTIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * findMcqQuestionById
   * Fetches a single MCQ question by ID
   */
  async findMcqQuestionById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_mcq_questions', {
        p_id: id,
        p_mcq_question_id: null,
        p_language_id: null,
        p_is_active: null,
        p_filter_topic_id: null,
        p_filter_mcq_type: null,
        p_filter_difficulty_level: null,
        p_filter_is_mandatory: null,
        p_filter_is_active: null,
        p_filter_is_deleted: false,
        p_search_text: null,
        p_search_fields: 'question_text,explanation,hint,code,slug',
        p_sort_table: 'translation',
        p_sort_column: 'question_text',
        p_sort_direction: 'ASC',
        p_page_index: 0,
        p_page_size: 1,
      });

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (err) {
      logger.error(`Error finding MCQ question by ID: ${err.message}`);
      throw err;
    }
  }

  /**
   * getMcqQuestions
   * Fetches a list of MCQ questions with optional filtering, sorting, and pagination
   */
  async getMcqQuestions(options = {}) {
    try {
      const {
        mcqQuestionId = null,
        languageId = null,
        filterTopicId = null,
        filterMcqType = null,
        filterDifficultyLevel = null,
        filterIsMandatory = null,
        filterIsActive = null,
        filterIsDeleted = false,
        searchText = null,
        searchFields = 'question_text,explanation,hint,code,slug',
        sortTable = 'translation',
        sortColumn = 'question_text',
        sortDirection = 'ASC',
        pageIndex = 0,
        pageSize = 20,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_mcq_questions', {
        p_id: null,
        p_mcq_question_id: mcqQuestionId,
        p_language_id: languageId,
        p_is_active: null,
        p_filter_topic_id: filterTopicId,
        p_filter_mcq_type: filterMcqType,
        p_filter_difficulty_level: filterDifficultyLevel,
        p_filter_is_mandatory: filterIsMandatory,
        p_filter_is_active: filterIsActive,
        p_filter_is_deleted: filterIsDeleted,
        p_search_text: searchText,
        p_search_fields: searchFields,
        p_sort_table: sortTable,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_page_index: pageIndex,
        p_page_size: pageSize,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching MCQ questions: ${err.message}`);
      throw err;
    }
  }

  /**
   * createMcqQuestion
   * Creates a new MCQ question and returns the full record
   */
  async createMcqQuestion(payload) {
    try {
      const {
        topicId,
        mcqType = 'single',
        code = null,
        points = 1.0,
        displayOrder = 0,
        difficultyLevel = 'medium',
        isMandatory = true,
        isActive = true,
        createdBy = null,
      } = payload;

      const { data: newId, error: insertError } = await supabase.rpc(
        'sp_mcq_questions_insert',
        {
          p_topic_id: topicId,
          p_mcq_type: mcqType,
          p_code: code,
          p_points: points,
          p_display_order: displayOrder,
          p_difficulty_level: difficultyLevel,
          p_is_mandatory: isMandatory,
          p_is_active: isActive,
          p_created_by: createdBy,
        }
      );

      if (insertError) throw insertError;

      return await this.findMcqQuestionById(newId);
    } catch (err) {
      logger.error(`Error creating MCQ question: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateMcqQuestion
   * Updates an existing MCQ question and returns the updated record
   */
  async updateMcqQuestion(id, payload) {
    try {
      const {
        topicId,
        mcqType,
        code,
        points,
        displayOrder,
        difficultyLevel,
        isMandatory,
        isActive,
        updatedBy = null,
      } = payload;

      const { error } = await supabase.rpc('sp_mcq_questions_update', {
        p_id: id,
        p_topic_id: topicId,
        p_mcq_type: mcqType,
        p_code: code,
        p_points: points,
        p_display_order: displayOrder,
        p_difficulty_level: difficultyLevel,
        p_is_mandatory: isMandatory,
        p_is_active: isActive,
        p_updated_by: updatedBy,
      });

      if (error) throw error;

      return await this.findMcqQuestionById(id);
    } catch (err) {
      logger.error(`Error updating MCQ question: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteMcqQuestion
   * Soft deletes an MCQ question (returns void)
   */
  async deleteMcqQuestion(id) {
    try {
      const { error } = await supabase.rpc('sp_mcq_questions_delete', {
        p_id: id,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting MCQ question: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreMcqQuestion
   * Restores a soft-deleted MCQ question and returns the restored record
   */
  async restoreMcqQuestion(
    id,
    restoreTranslations = true,
    restoreOptions = true
  ) {
    try {
      const { error } = await supabase.rpc('sp_mcq_questions_restore', {
        p_id: id,
        p_restore_translations: restoreTranslations,
        p_restore_options: restoreOptions,
      });

      if (error) throw error;

      return await this.findMcqQuestionById(id);
    } catch (err) {
      logger.error(`Error restoring MCQ question: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. MCQ QUESTION TRANSLATIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * createMcqQuestionTranslation
   * Creates a new MCQ question translation
   */
  async createMcqQuestionTranslation(payload) {
    try {
      const {
        mcqQuestionId,
        languageId,
        questionText,
        explanation = null,
        hint = null,
        image1 = null,
        image2 = null,
        isActive = true,
      } = payload;

      const { error } = await supabase.rpc(
        'sp_mcq_question_translations_insert',
        {
          p_mcq_question_id: mcqQuestionId,
          p_language_id: languageId,
          p_question_text: questionText,
          p_explanation: explanation,
          p_hint: hint,
          p_image_1: image1,
          p_image_2: image2,
          p_is_active: isActive,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(
        `Error creating MCQ question translation: ${err.message}`
      );
      throw err;
    }
  }

  /**
   * updateMcqQuestionTranslation
   * Updates an existing MCQ question translation
   */
  async updateMcqQuestionTranslation(id, payload) {
    try {
      const {
        questionText,
        explanation,
        hint,
        image1,
        image2,
        isActive,
      } = payload;

      const { error } = await supabase.rpc(
        'sp_mcq_question_translations_update',
        {
          p_id: id,
          p_question_text: questionText,
          p_explanation: explanation,
          p_hint: hint,
          p_image_1: image1,
          p_image_2: image2,
          p_is_active: isActive,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(
        `Error updating MCQ question translation: ${err.message}`
      );
      throw err;
    }
  }

  /**
   * deleteMcqQuestionTranslation
   * Soft deletes an MCQ question translation
   */
  async deleteMcqQuestionTranslation(id) {
    try {
      const { error } = await supabase.rpc(
        'sp_mcq_question_translations_delete',
        {
          p_id: id,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(
        `Error deleting MCQ question translation: ${err.message}`
      );
      throw err;
    }
  }

  /**
   * restoreMcqQuestionTranslation
   * Restores a soft-deleted MCQ question translation
   */
  async restoreMcqQuestionTranslation(id) {
    try {
      const { error } = await supabase.rpc(
        'sp_mcq_question_translations_restore',
        {
          p_id: id,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(
        `Error restoring MCQ question translation: ${err.message}`
      );
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. MCQ OPTIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * createMcqOption
   * Creates a new MCQ option and returns the full record
   */
  async createMcqOption(payload) {
    try {
      const {
        mcqQuestionId,
        isCorrect = false,
        displayOrder = 0,
        isActive = true,
        createdBy = null,
      } = payload;

      const { data: newId, error: insertError } = await supabase.rpc(
        'sp_mcq_options_insert',
        {
          p_mcq_question_id: mcqQuestionId,
          p_is_correct: isCorrect,
          p_display_order: displayOrder,
          p_is_active: isActive,
          p_created_by: createdBy,
        }
      );

      if (insertError) throw insertError;

      return { id: newId };
    } catch (err) {
      logger.error(`Error creating MCQ option: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateMcqOption
   * Updates an existing MCQ option
   */
  async updateMcqOption(id, payload) {
    try {
      const { isCorrect, displayOrder, isActive } = payload;

      const { error } = await supabase.rpc('sp_mcq_options_update', {
        p_id: id,
        p_is_correct: isCorrect,
        p_display_order: displayOrder,
        p_is_active: isActive,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error updating MCQ option: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteMcqOption
   * Soft deletes an MCQ option
   */
  async deleteMcqOption(id) {
    try {
      const { error } = await supabase.rpc('sp_mcq_options_delete', {
        p_id: id,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting MCQ option: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreMcqOption
   * Restores a soft-deleted MCQ option
   */
  async restoreMcqOption(id, restoreTranslations = true) {
    try {
      const { error } = await supabase.rpc('sp_mcq_options_restore', {
        p_id: id,
        p_restore_translations: restoreTranslations,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error restoring MCQ option: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 4. MCQ OPTION TRANSLATIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * createMcqOptionTranslation
   * Creates a new MCQ option translation
   */
  async createMcqOptionTranslation(payload) {
    try {
      const {
        mcqOptionId,
        languageId,
        optionText,
        image = null,
        isActive = true,
      } = payload;

      const { error } = await supabase.rpc(
        'sp_mcq_option_translations_insert',
        {
          p_mcq_option_id: mcqOptionId,
          p_language_id: languageId,
          p_option_text: optionText,
          p_image: image,
          p_is_active: isActive,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error creating MCQ option translation: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateMcqOptionTranslation
   * Updates an existing MCQ option translation
   */
  async updateMcqOptionTranslation(id, payload) {
    try {
      const { optionText, image, isActive } = payload;

      const { error } = await supabase.rpc(
        'sp_mcq_option_translations_update',
        {
          p_id: id,
          p_option_text: optionText,
          p_image: image,
          p_is_active: isActive,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error updating MCQ option translation: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteMcqOptionTranslation
   * Soft deletes an MCQ option translation
   */
  async deleteMcqOptionTranslation(id) {
    try {
      const { error } = await supabase.rpc(
        'sp_mcq_option_translations_delete',
        {
          p_id: id,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting MCQ option translation: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreMcqOptionTranslation
   * Restores a soft-deleted MCQ option translation
   */
  async restoreMcqOptionTranslation(id) {
    try {
      const { error } = await supabase.rpc(
        'sp_mcq_option_translations_restore',
        {
          p_id: id,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error restoring MCQ option translation: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 5. ONE-WORD QUESTIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * findOneWordQuestionById
   * Fetches a single one-word question by ID
   */
  async findOneWordQuestionById(id) {
    try {
      const { data, error } = await supabase.rpc(
        'udf_get_one_word_questions',
        {
          p_id: id,
          p_one_word_question_id: null,
          p_language_id: null,
          p_is_active: null,
          p_filter_topic_id: null,
          p_filter_question_type: null,
          p_filter_difficulty_level: null,
          p_filter_is_mandatory: null,
          p_filter_is_case_sensitive: null,
          p_filter_is_active: null,
          p_filter_is_deleted: false,
          p_search_text: null,
          p_search_fields: 'question_text,explanation,hint,correct_answer,code,slug',
          p_sort_table: 'translation',
          p_sort_column: 'created_at',
          p_sort_order: 'DESC',
          p_page_index: 0,
          p_page_size: 1,
        }
      );

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (err) {
      logger.error(`Error finding one-word question by ID: ${err.message}`);
      throw err;
    }
  }

  /**
   * getOneWordQuestions
   * Fetches a list of one-word questions with optional filtering, sorting, and pagination
   */
  async getOneWordQuestions(options = {}) {
    try {
      const {
        oneWordQuestionId = null,
        languageId = null,
        filterTopicId = null,
        filterQuestionType = null,
        filterDifficultyLevel = null,
        filterIsMandatory = null,
        filterIsCaseSensitive = null,
        filterIsActive = null,
        filterIsDeleted = false,
        searchText = null,
        searchFields = 'question_text,explanation,hint,correct_answer,code,slug',
        sortTable = 'translation',
        sortColumn = 'created_at',
        sortOrder = 'DESC',
        pageIndex = 0,
        pageSize = 25,
      } = options;

      const { data, error } = await supabase.rpc(
        'udf_get_one_word_questions',
        {
          p_id: null,
          p_one_word_question_id: oneWordQuestionId,
          p_language_id: languageId,
          p_is_active: null,
          p_filter_topic_id: filterTopicId,
          p_filter_question_type: filterQuestionType,
          p_filter_difficulty_level: filterDifficultyLevel,
          p_filter_is_mandatory: filterIsMandatory,
          p_filter_is_case_sensitive: filterIsCaseSensitive,
          p_filter_is_active: filterIsActive,
          p_filter_is_deleted: filterIsDeleted,
          p_search_text: searchText,
          p_search_fields: searchFields,
          p_sort_table: sortTable,
          p_sort_column: sortColumn,
          p_sort_order: sortOrder,
          p_page_index: pageIndex,
          p_page_size: pageSize,
        }
      );

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching one-word questions: ${err.message}`);
      throw err;
    }
  }

  /**
   * createOneWordQuestion
   * Creates a new one-word question and returns the full record
   */
  async createOneWordQuestion(payload) {
    try {
      const {
        topicId,
        questionType = 'one_word',
        code = null,
        points = 1.0,
        isCaseSensitive = false,
        isTrimWhitespace = true,
        displayOrder = 0,
        difficultyLevel = 'medium',
        isMandatory = true,
        isActive = true,
        createdBy = null,
      } = payload;

      const { data: newId, error: insertError } = await supabase.rpc(
        'sp_one_word_questions_insert',
        {
          p_topic_id: topicId,
          p_question_type: questionType,
          p_code: code,
          p_points: points,
          p_is_case_sensitive: isCaseSensitive,
          p_is_trim_whitespace: isTrimWhitespace,
          p_display_order: displayOrder,
          p_difficulty_level: difficultyLevel,
          p_is_mandatory: isMandatory,
          p_is_active: isActive,
          p_created_by: createdBy,
        }
      );

      if (insertError) throw insertError;

      return await this.findOneWordQuestionById(newId);
    } catch (err) {
      logger.error(`Error creating one-word question: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateOneWordQuestion
   * Updates an existing one-word question and returns the updated record
   */
  async updateOneWordQuestion(id, payload) {
    try {
      const {
        topicId,
        questionType,
        code,
        points,
        isCaseSensitive,
        isTrimWhitespace,
        displayOrder,
        difficultyLevel,
        isMandatory,
        isActive,
        updatedBy = null,
      } = payload;

      const { error } = await supabase.rpc('sp_one_word_questions_update', {
        p_id: id,
        p_topic_id: topicId,
        p_question_type: questionType,
        p_code: code,
        p_points: points,
        p_is_case_sensitive: isCaseSensitive,
        p_is_trim_whitespace: isTrimWhitespace,
        p_display_order: displayOrder,
        p_difficulty_level: difficultyLevel,
        p_is_mandatory: isMandatory,
        p_is_active: isActive,
        p_updated_by: updatedBy,
      });

      if (error) throw error;

      return await this.findOneWordQuestionById(id);
    } catch (err) {
      logger.error(`Error updating one-word question: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteOneWordQuestion
   * Soft deletes a one-word question
   */
  async deleteOneWordQuestion(id) {
    try {
      const { error } = await supabase.rpc('sp_one_word_questions_delete', {
        p_id: id,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting one-word question: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreOneWordQuestion
   * Restores a soft-deleted one-word question and returns the restored record
   */
  async restoreOneWordQuestion(id) {
    try {
      const { error } = await supabase.rpc('sp_one_word_questions_restore', {
        p_id: id,
      });

      if (error) throw error;

      return await this.findOneWordQuestionById(id);
    } catch (err) {
      logger.error(`Error restoring one-word question: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 6. ONE-WORD QUESTION TRANSLATIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * createOneWordQuestionTranslation
   * Creates a new one-word question translation
   */
  async createOneWordQuestionTranslation(payload) {
    try {
      const {
        oneWordQuestionId,
        languageId,
        questionText,
        correctAnswer,
        explanation = null,
        hint = null,
        image1 = null,
        image2 = null,
        isActive = true,
      } = payload;

      const { error } = await supabase.rpc(
        'sp_one_word_question_translations_insert',
        {
          p_one_word_question_id: oneWordQuestionId,
          p_language_id: languageId,
          p_question_text: questionText,
          p_correct_answer: correctAnswer,
          p_explanation: explanation,
          p_hint: hint,
          p_image_1: image1,
          p_image_2: image2,
          p_is_active: isActive,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(
        `Error creating one-word question translation: ${err.message}`
      );
      throw err;
    }
  }

  /**
   * updateOneWordQuestionTranslation
   * Updates an existing one-word question translation
   */
  async updateOneWordQuestionTranslation(id, payload) {
    try {
      const {
        questionText,
        explanation,
        hint,
        correctAnswer,
        image1,
        image2,
        isActive,
        allowClearExplanation = true,
        allowClearHint = true,
        allowClearImage1 = true,
        allowClearImage2 = true,
      } = payload;

      const { error } = await supabase.rpc(
        'sp_one_word_question_translations_update',
        {
          p_id: id,
          p_question_text: questionText,
          p_explanation: explanation,
          p_hint: hint,
          p_correct_answer: correctAnswer,
          p_image_1: image1,
          p_image_2: image2,
          p_is_active: isActive,
          p_allow_clear_explanation: allowClearExplanation,
          p_allow_clear_hint: allowClearHint,
          p_allow_clear_image_1: allowClearImage1,
          p_allow_clear_image_2: allowClearImage2,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(
        `Error updating one-word question translation: ${err.message}`
      );
      throw err;
    }
  }

  /**
   * deleteOneWordQuestionTranslation
   * Soft deletes a one-word question translation
   */
  async deleteOneWordQuestionTranslation(id) {
    try {
      const { error } = await supabase.rpc(
        'sp_one_word_question_translations_delete',
        {
          p_id: id,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(
        `Error deleting one-word question translation: ${err.message}`
      );
      throw err;
    }
  }

  /**
   * restoreOneWordQuestionTranslation
   * Restores a soft-deleted one-word question translation
   */
  async restoreOneWordQuestionTranslation(id) {
    try {
      const { error } = await supabase.rpc(
        'sp_one_word_question_translations_restore',
        {
          p_id: id,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(
        `Error restoring one-word question translation: ${err.message}`
      );
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 7. ONE-WORD SYNONYMS
  // ─────────────────────────────────────────────────────────────

  /**
   * createOneWordSynonym
   * Creates a new one-word synonym and returns the full record
   */
  async createOneWordSynonym(payload) {
    try {
      const {
        oneWordQuestionId,
        displayOrder = 0,
        isActive = true,
        createdBy = null,
      } = payload;

      const { data: newId, error: insertError } = await supabase.rpc(
        'sp_one_word_synonyms_insert',
        {
          p_one_word_question_id: oneWordQuestionId,
          p_display_order: displayOrder,
          p_is_active: isActive,
          p_created_by: createdBy,
        }
      );

      if (insertError) throw insertError;

      return { id: newId };
    } catch (err) {
      logger.error(`Error creating one-word synonym: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteOneWordSynonym
   * Soft deletes a one-word synonym
   */
  async deleteOneWordSynonym(id) {
    try {
      const { error } = await supabase.rpc('sp_one_word_synonyms_delete', {
        p_id: id,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting one-word synonym: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreOneWordSynonym
   * Restores a soft-deleted one-word synonym
   */
  async restoreOneWordSynonym(id) {
    try {
      const { error } = await supabase.rpc('sp_one_word_synonyms_restore', {
        p_id: id,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error restoring one-word synonym: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 8. ONE-WORD SYNONYM TRANSLATIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * createOneWordSynonymTranslation
   * Creates a new one-word synonym translation
   */
  async createOneWordSynonymTranslation(payload) {
    try {
      const {
        oneWordSynonymId,
        languageId,
        synonymText,
        isActive = true,
      } = payload;

      const { error } = await supabase.rpc(
        'sp_one_word_synonym_translations_insert',
        {
          p_one_word_synonym_id: oneWordSynonymId,
          p_language_id: languageId,
          p_synonym_text: synonymText,
          p_is_active: isActive,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(
        `Error creating one-word synonym translation: ${err.message}`
      );
      throw err;
    }
  }

  /**
   * updateOneWordSynonymTranslation
   * Updates an existing one-word synonym translation
   */
  async updateOneWordSynonymTranslation(id, payload) {
    try {
      const { synonymText, isActive } = payload;

      const { error } = await supabase.rpc(
        'sp_one_word_synonym_translations_update',
        {
          p_id: id,
          p_synonym_text: synonymText,
          p_is_active: isActive,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(
        `Error updating one-word synonym translation: ${err.message}`
      );
      throw err;
    }
  }

  /**
   * deleteOneWordSynonymTranslation
   * Soft deletes a one-word synonym translation
   */
  async deleteOneWordSynonymTranslation(id) {
    try {
      const { error } = await supabase.rpc(
        'sp_one_word_synonym_translations_delete',
        {
          p_id: id,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(
        `Error deleting one-word synonym translation: ${err.message}`
      );
      throw err;
    }
  }

  /**
   * restoreOneWordSynonymTranslation
   * Restores a soft-deleted one-word synonym translation
   */
  async restoreOneWordSynonymTranslation(id) {
    try {
      const { error } = await supabase.rpc(
        'sp_one_word_synonym_translations_restore',
        {
          p_id: id,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(
        `Error restoring one-word synonym translation: ${err.message}`
      );
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 9. DESCRIPTIVE QUESTIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * findDescriptiveQuestionById
   * Fetches a single descriptive question by ID
   */
  async findDescriptiveQuestionById(id) {
    try {
      const { data, error } = await supabase.rpc(
        'udf_get_descriptive_questions',
        {
          p_id: id,
          p_descriptive_question_id: null,
          p_language_id: null,
          p_is_active: null,
          p_filter_topic_id: null,
          p_filter_answer_type: null,
          p_filter_difficulty_level: null,
          p_filter_is_mandatory: null,
          p_filter_is_active: null,
          p_filter_is_deleted: false,
          p_search_text: null,
          p_sort_table: 'translation',
          p_sort_column: 'dq_display_order',
          p_sort_direction: 'ASC',
          p_page_index: 1,
          p_page_size: 1,
        }
      );

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (err) {
      logger.error(
        `Error finding descriptive question by ID: ${err.message}`
      );
      throw err;
    }
  }

  /**
   * getDescriptiveQuestions
   * Fetches a list of descriptive questions with optional filtering, sorting, and pagination
   */
  async getDescriptiveQuestions(options = {}) {
    try {
      const {
        descriptiveQuestionId = null,
        languageId = null,
        filterTopicId = null,
        filterAnswerType = null,
        filterDifficultyLevel = null,
        filterIsMandatory = null,
        filterIsActive = null,
        filterIsDeleted = false,
        searchText = null,
        sortTable = 'translation',
        sortColumn = 'dq_display_order',
        sortDirection = 'ASC',
        pageIndex = 1,
        pageSize = 50,
      } = options;

      const { data, error } = await supabase.rpc(
        'udf_get_descriptive_questions',
        {
          p_id: null,
          p_descriptive_question_id: descriptiveQuestionId,
          p_language_id: languageId,
          p_is_active: null,
          p_filter_topic_id: filterTopicId,
          p_filter_answer_type: filterAnswerType,
          p_filter_difficulty_level: filterDifficultyLevel,
          p_filter_is_mandatory: filterIsMandatory,
          p_filter_is_active: filterIsActive,
          p_filter_is_deleted: filterIsDeleted,
          p_search_text: searchText,
          p_sort_table: sortTable,
          p_sort_column: sortColumn,
          p_sort_direction: sortDirection,
          p_page_index: pageIndex,
          p_page_size: pageSize,
        }
      );

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching descriptive questions: ${err.message}`);
      throw err;
    }
  }

  /**
   * createDescriptiveQuestion
   * Creates a new descriptive question and returns the full record
   */
  async createDescriptiveQuestion(payload) {
    try {
      const {
        topicId,
        answerType = 'short_answer',
        code = null,
        points = 1.0,
        minWords = null,
        maxWords = null,
        displayOrder = 0,
        difficultyLevel = 'medium',
        isMandatory = true,
        isActive = true,
        createdBy = null,
      } = payload;

      const { data: newId, error: insertError } = await supabase.rpc(
        'sp_descriptive_questions_insert',
        {
          p_topic_id: topicId,
          p_answer_type: answerType,
          p_code: code,
          p_points: points,
          p_min_words: minWords,
          p_max_words: maxWords,
          p_display_order: displayOrder,
          p_difficulty_level: difficultyLevel,
          p_is_mandatory: isMandatory,
          p_is_active: isActive,
          p_created_by: createdBy,
        }
      );

      if (insertError) throw insertError;

      return await this.findDescriptiveQuestionById(newId);
    } catch (err) {
      logger.error(`Error creating descriptive question: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateDescriptiveQuestion
   * Updates an existing descriptive question and returns the updated record
   */
  async updateDescriptiveQuestion(id, payload) {
    try {
      const {
        answerType,
        code,
        points,
        minWords,
        maxWords,
        displayOrder,
        difficultyLevel,
        isMandatory,
        isActive,
        updatedBy = null,
      } = payload;

      const { error } = await supabase.rpc(
        'sp_descriptive_questions_update',
        {
          p_id: id,
          p_answer_type: answerType,
          p_code: code,
          p_points: points,
          p_min_words: minWords,
          p_max_words: maxWords,
          p_display_order: displayOrder,
          p_difficulty_level: difficultyLevel,
          p_is_mandatory: isMandatory,
          p_is_active: isActive,
          p_updated_by: updatedBy,
        }
      );

      if (error) throw error;

      return await this.findDescriptiveQuestionById(id);
    } catch (err) {
      logger.error(`Error updating descriptive question: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteDescriptiveQuestion
   * Soft deletes a descriptive question
   */
  async deleteDescriptiveQuestion(id) {
    try {
      const { error } = await supabase.rpc(
        'sp_descriptive_questions_delete',
        {
          p_id: id,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting descriptive question: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreDescriptiveQuestion
   * Restores a soft-deleted descriptive question and returns the restored record
   */
  async restoreDescriptiveQuestion(id) {
    try {
      const { error } = await supabase.rpc(
        'sp_descriptive_questions_restore',
        {
          p_id: id,
        }
      );

      if (error) throw error;

      return await this.findDescriptiveQuestionById(id);
    } catch (err) {
      logger.error(`Error restoring descriptive question: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 10. DESCRIPTIVE QUESTION TRANSLATIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * createDescriptiveQuestionTranslation
   * Creates a new descriptive question translation
   */
  async createDescriptiveQuestionTranslation(payload) {
    try {
      const {
        descriptiveQuestionId,
        languageId,
        questionText,
        explanation = null,
        hint = null,
        modelAnswer = null,
        questionImage1 = null,
        questionImage2 = null,
        questionImage3 = null,
        answerImage1 = null,
        answerImage2 = null,
        answerImage3 = null,
        isActive = true,
      } = payload;

      const { error } = await supabase.rpc(
        'sp_descriptive_question_translations_insert',
        {
          p_descriptive_question_id: descriptiveQuestionId,
          p_language_id: languageId,
          p_question_text: questionText,
          p_explanation: explanation,
          p_hint: hint,
          p_model_answer: modelAnswer,
          p_question_image_1: questionImage1,
          p_question_image_2: questionImage2,
          p_question_image_3: questionImage3,
          p_answer_image_1: answerImage1,
          p_answer_image_2: answerImage2,
          p_answer_image_3: answerImage3,
          p_is_active: isActive,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(
        `Error creating descriptive question translation: ${err.message}`
      );
      throw err;
    }
  }

  /**
   * updateDescriptiveQuestionTranslation
   * Updates an existing descriptive question translation
   */
  async updateDescriptiveQuestionTranslation(id, payload) {
    try {
      const {
        questionText,
        explanation,
        hint,
        modelAnswer,
        questionImage1,
        questionImage2,
        questionImage3,
        answerImage1,
        answerImage2,
        answerImage3,
        isActive,
      } = payload;

      const { error } = await supabase.rpc(
        'sp_descriptive_question_translations_update',
        {
          p_id: id,
          p_question_text: questionText,
          p_explanation: explanation,
          p_hint: hint,
          p_model_answer: modelAnswer,
          p_question_image_1: questionImage1,
          p_question_image_2: questionImage2,
          p_question_image_3: questionImage3,
          p_answer_image_1: answerImage1,
          p_answer_image_2: answerImage2,
          p_answer_image_3: answerImage3,
          p_is_active: isActive,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(
        `Error updating descriptive question translation: ${err.message}`
      );
      throw err;
    }
  }

  /**
   * deleteDescriptiveQuestionTranslation
   * Soft deletes a descriptive question translation
   */
  async deleteDescriptiveQuestionTranslation(id) {
    try {
      const { error } = await supabase.rpc(
        'sp_descriptive_question_translations_delete',
        {
          p_id: id,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(
        `Error deleting descriptive question translation: ${err.message}`
      );
      throw err;
    }
  }

  /**
   * restoreDescriptiveQuestionTranslation
   * Restores a soft-deleted descriptive question translation
   */
  async restoreDescriptiveQuestionTranslation(id) {
    try {
      const { error } = await supabase.rpc(
        'sp_descriptive_question_translations_restore',
        {
          p_id: id,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(
        `Error restoring descriptive question translation: ${err.message}`
      );
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 11. MATCHING QUESTIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * findMatchingQuestionById
   * Fetches a single matching question by ID
   */
  async findMatchingQuestionById(id) {
    try {
      const { data, error } = await supabase.rpc(
        'udf_get_matching_questions',
        {
          p_id: id,
          p_matching_question_id: null,
          p_language_id: null,
          p_is_active: null,
          p_filter_topic_id: null,
          p_filter_difficulty_level: null,
          p_filter_is_mandatory: null,
          p_filter_partial_scoring: null,
          p_filter_is_deleted: false,
          p_search_text: null,
          p_sort_table: 'question',
          p_sort_column: 'created_at',
          p_sort_direction: 'DESC',
          p_page_index: 1,
          p_page_size: 1,
        }
      );

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (err) {
      logger.error(`Error finding matching question by ID: ${err.message}`);
      throw err;
    }
  }

  /**
   * getMatchingQuestions
   * Fetches a list of matching questions with optional filtering, sorting, and pagination
   */
  async getMatchingQuestions(options = {}) {
    try {
      const {
        matchingQuestionId = null,
        languageId = null,
        filterTopicId = null,
        filterDifficultyLevel = null,
        filterIsMandatory = null,
        filterPartialScoring = null,
        filterIsDeleted = false,
        searchText = null,
        sortTable = 'question',
        sortColumn = 'created_at',
        sortDirection = 'DESC',
        pageIndex = 1,
        pageSize = 20,
      } = options;

      const { data, error } = await supabase.rpc(
        'udf_get_matching_questions',
        {
          p_id: null,
          p_matching_question_id: matchingQuestionId,
          p_language_id: languageId,
          p_is_active: null,
          p_filter_topic_id: filterTopicId,
          p_filter_difficulty_level: filterDifficultyLevel,
          p_filter_is_mandatory: filterIsMandatory,
          p_filter_partial_scoring: filterPartialScoring,
          p_filter_is_deleted: filterIsDeleted,
          p_search_text: searchText,
          p_sort_table: sortTable,
          p_sort_column: sortColumn,
          p_sort_direction: sortDirection,
          p_page_index: pageIndex,
          p_page_size: pageSize,
        }
      );

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching matching questions: ${err.message}`);
      throw err;
    }
  }

  /**
   * createMatchingQuestion
   * Creates a new matching question and returns the full record
   */
  async createMatchingQuestion(payload) {
    try {
      const {
        topicId,
        code = null,
        points = 1.0,
        partialScoring = false,
        displayOrder = 0,
        difficultyLevel = 'medium',
        isMandatory = true,
        isActive = true,
        createdBy = null,
      } = payload;

      const { data: newId, error: insertError } = await supabase.rpc(
        'sp_matching_questions_insert',
        {
          p_topic_id: topicId,
          p_code: code,
          p_points: points,
          p_partial_scoring: partialScoring,
          p_display_order: displayOrder,
          p_difficulty_level: difficultyLevel,
          p_is_mandatory: isMandatory,
          p_is_active: isActive,
          p_created_by: createdBy,
        }
      );

      if (insertError) throw insertError;

      return await this.findMatchingQuestionById(newId);
    } catch (err) {
      logger.error(`Error creating matching question: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateMatchingQuestion
   * Updates an existing matching question and returns the updated record
   */
  async updateMatchingQuestion(questionId, payload) {
    try {
      const {
        code,
        points,
        partialScoring,
        displayOrder,
        difficultyLevel,
        isMandatory,
        isActive,
        updatedBy = null,
      } = payload;

      const { error } = await supabase.rpc('sp_matching_questions_update', {
        p_question_id: questionId,
        p_code: code,
        p_points: points,
        p_partial_scoring: partialScoring,
        p_display_order: displayOrder,
        p_difficulty_level: difficultyLevel,
        p_is_mandatory: isMandatory,
        p_is_active: isActive,
        p_updated_by: updatedBy,
      });

      if (error) throw error;

      return await this.findMatchingQuestionById(questionId);
    } catch (err) {
      logger.error(`Error updating matching question: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteMatchingQuestion
   * Soft deletes a matching question
   */
  async deleteMatchingQuestion(id) {
    try {
      const { error } = await supabase.rpc('sp_matching_questions_delete', {
        p_id: id,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting matching question: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreMatchingQuestion
   * Restores a soft-deleted matching question and returns the restored record
   */
  async restoreMatchingQuestion(id) {
    try {
      const { error } = await supabase.rpc('sp_matching_questions_restore', {
        p_id: id,
      });

      if (error) throw error;

      return await this.findMatchingQuestionById(id);
    } catch (err) {
      logger.error(`Error restoring matching question: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 12. MATCHING PAIRS
  // ─────────────────────────────────────────────────────────────

  /**
   * createMatchingPair
   * Creates a new matching pair and returns the full record
   */
  async createMatchingPair(payload) {
    try {
      const {
        matchingQuestionId,
        correctPosition,
        isActive = true,
        createdBy = null,
      } = payload;

      const { data: newId, error: insertError } = await supabase.rpc(
        'sp_matching_pairs_insert',
        {
          p_matching_question_id: matchingQuestionId,
          p_correct_position: correctPosition,
          p_is_active: isActive,
          p_created_by: createdBy,
        }
      );

      if (insertError) throw insertError;

      return { id: newId };
    } catch (err) {
      logger.error(`Error creating matching pair: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateMatchingPair
   * Updates an existing matching pair
   */
  async updateMatchingPair(pairId, payload) {
    try {
      const { correctPosition, isActive } = payload;

      const { error } = await supabase.rpc('sp_matching_pairs_update', {
        p_pair_id: pairId,
        p_correct_position: correctPosition,
        p_is_active: isActive,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error updating matching pair: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteMatchingPair
   * Soft deletes a matching pair
   */
  async deleteMatchingPair(id) {
    try {
      const { error } = await supabase.rpc('sp_matching_pairs_delete', {
        p_id: id,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting matching pair: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreMatchingPair
   * Restores a soft-deleted matching pair
   */
  async restoreMatchingPair(id) {
    try {
      const { error } = await supabase.rpc('sp_matching_pairs_restore', {
        p_id: id,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error restoring matching pair: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 13. ORDERING QUESTIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * findOrderingQuestionById
   * Fetches a single ordering question by ID
   */
  async findOrderingQuestionById(id) {
    try {
      const { data, error } = await supabase.rpc(
        'udf_get_ordering_questions',
        {
          p_id: id,
          p_ordering_question_id: null,
          p_language_id: null,
          p_is_active: null,
          p_filter_topic_id: null,
          p_filter_difficulty_level: null,
          p_filter_is_mandatory: null,
          p_filter_partial_scoring: null,
          p_filter_is_deleted: false,
          p_search_query: null,
          p_sort_table: 'question',
          p_sort_column: 'oq_id',
          p_sort_direction: 'ASC',
          p_page_index: 1,
          p_page_size: 1,
        }
      );

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (err) {
      logger.error(`Error finding ordering question by ID: ${err.message}`);
      throw err;
    }
  }

  /**
   * getOrderingQuestions
   * Fetches a list of ordering questions with optional filtering, sorting, and pagination
   */
  async getOrderingQuestions(options = {}) {
    try {
      const {
        orderingQuestionId = null,
        languageId = null,
        filterTopicId = null,
        filterDifficultyLevel = null,
        filterIsMandatory = null,
        filterPartialScoring = null,
        filterIsDeleted = false,
        searchQuery = null,
        sortTable = 'question',
        sortColumn = 'oq_id',
        sortDirection = 'ASC',
        pageIndex = 1,
        pageSize = 10,
      } = options;

      const { data, error } = await supabase.rpc(
        'udf_get_ordering_questions',
        {
          p_id: null,
          p_ordering_question_id: orderingQuestionId,
          p_language_id: languageId,
          p_is_active: null,
          p_filter_topic_id: filterTopicId,
          p_filter_difficulty_level: filterDifficultyLevel,
          p_filter_is_mandatory: filterIsMandatory,
          p_filter_partial_scoring: filterPartialScoring,
          p_filter_is_deleted: filterIsDeleted,
          p_search_query: searchQuery,
          p_sort_table: sortTable,
          p_sort_column: sortColumn,
          p_sort_direction: sortDirection,
          p_page_index: pageIndex,
          p_page_size: pageSize,
        }
      );

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching ordering questions: ${err.message}`);
      throw err;
    }
  }

  /**
   * createOrderingQuestion
   * Creates a new ordering question and returns the full record
   */
  async createOrderingQuestion(payload) {
    try {
      const {
        topicId,
        code = null,
        points = null,
        partialScoring = null,
        displayOrder = null,
        difficultyLevel = null,
        isMandatory = null,
        isActive = null,
        createdBy = null,
      } = payload;

      const { data: newId, error: insertError } = await supabase.rpc(
        'sp_ordering_questions_insert',
        {
          p_topic_id: topicId,
          p_code: code,
          p_points: points,
          p_partial_scoring: partialScoring,
          p_display_order: displayOrder,
          p_difficulty_level: difficultyLevel,
          p_is_mandatory: isMandatory,
          p_is_active: isActive,
          p_created_by: createdBy,
        }
      );

      if (insertError) throw insertError;

      return await this.findOrderingQuestionById(newId);
    } catch (err) {
      logger.error(`Error creating ordering question: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateOrderingQuestion
   * Updates an existing ordering question and returns the updated record
   */
  async updateOrderingQuestion(questionId, payload) {
    try {
      const {
        code,
        points,
        partialScoring,
        displayOrder,
        difficultyLevel,
        isMandatory,
        isActive,
        updatedBy = null,
      } = payload;

      const { error } = await supabase.rpc('sp_ordering_questions_update', {
        p_question_id: questionId,
        p_code: code,
        p_points: points,
        p_partial_scoring: partialScoring,
        p_display_order: displayOrder,
        p_difficulty_level: difficultyLevel,
        p_is_mandatory: isMandatory,
        p_is_active: isActive,
        p_updated_by: updatedBy,
      });

      if (error) throw error;

      return await this.findOrderingQuestionById(questionId);
    } catch (err) {
      logger.error(`Error updating ordering question: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteOrderingQuestion
   * Soft deletes an ordering question
   */
  async deleteOrderingQuestion(questionId) {
    try {
      const { error } = await supabase.rpc('sp_ordering_questions_delete', {
        p_question_id: questionId,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting ordering question: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreOrderingQuestion
   * Restores a soft-deleted ordering question and returns the restored record
   */
  async restoreOrderingQuestion(questionId) {
    try {
      const { error } = await supabase.rpc('sp_ordering_questions_restore', {
        p_question_id: questionId,
      });

      if (error) throw error;

      return await this.findOrderingQuestionById(questionId);
    } catch (err) {
      logger.error(`Error restoring ordering question: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 14. ORDERING ITEMS
  // ─────────────────────────────────────────────────────────────

  /**
   * createOrderingItem
   * Creates a new ordering item and returns the full record
   */
  async createOrderingItem(payload) {
    try {
      const {
        orderingQuestionId,
        correctPosition,
        isActive = true,
        createdBy = null,
      } = payload;

      const { data: newId, error: insertError } = await supabase.rpc(
        'sp_ordering_items_insert',
        {
          p_ordering_question_id: orderingQuestionId,
          p_correct_position: correctPosition,
          p_is_active: isActive,
          p_created_by: createdBy,
        }
      );

      if (insertError) throw insertError;

      return { id: newId };
    } catch (err) {
      logger.error(`Error creating ordering item: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateOrderingItem
   * Updates an existing ordering item
   */
  async updateOrderingItem(itemId, payload) {
    try {
      const { correctPosition, isActive, updatedBy = null } = payload;

      const { error } = await supabase.rpc('sp_ordering_items_update', {
        p_item_id: itemId,
        p_correct_position: correctPosition,
        p_is_active: isActive,
        p_updated_by: updatedBy,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error updating ordering item: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteOrderingItem
   * Soft deletes an ordering item
   */
  async deleteOrderingItem(itemId) {
    try {
      const { error } = await supabase.rpc('sp_ordering_items_delete', {
        p_item_id: itemId,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting ordering item: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreOrderingItem
   * Restores a soft-deleted ordering item
   */
  async restoreOrderingItem(itemId) {
    try {
      const { error } = await supabase.rpc('sp_ordering_items_restore', {
        p_item_id: itemId,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error restoring ordering item: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new QuestionBankRepository();
