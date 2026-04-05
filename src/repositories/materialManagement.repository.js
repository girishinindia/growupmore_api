/**
 * ═══════════════════════════════════════════════════════════════
 * MATERIAL MANAGEMENT REPOSITORY — Database Layer (Supabase RPC)
 * ═══════════════════════════════════════════════════════════════
 * Handles Subjects, Chapters, Topics, Sub-Topics via:
 *
 *   SUBJECTS:
 *   - udf_get_subjects              — read, search, filter, paginate
 *   - sp_subjects_insert            — create, returns new id (BIGINT)
 *   - sp_subjects_update            — update, returns void
 *   - sp_subjects_delete            — soft delete, returns void
 *
 *   CHAPTERS:
 *   - udf_get_chapters              — read, search, filter, paginate
 *   - sp_chapters_insert            — create, returns new id (BIGINT)
 *   - sp_chapters_update            — update, returns void
 *   - sp_chapters_delete            — soft delete, returns void
 *
 *   TOPICS:
 *   - udf_get_topics                — read, search, filter, paginate
 *   - sp_topics_insert              — create, returns new id (BIGINT)
 *   - sp_topics_update              — update, returns void
 *   - sp_topics_delete              — soft delete, returns void
 *
 *   SUB-TOPICS:
 *   - udf_get_sub_topics            — read, search, filter, paginate
 *   - sp_sub_topics_insert          — create, returns new id (BIGINT)
 *   - sp_sub_topics_update          — update, returns void
 *   - sp_sub_topics_delete          — soft delete, returns void
 * ═══════════════════════════════════════════════════════════════
 */

const { supabase } = require('../config/database');
const logger = require('../config/logger');

class MaterialManagementRepository {
  // ─────────────────────────────────────────────────────────────
  // SUBJECTS
  // ─────────────────────────────────────────────────────────────

  /**
   * findSubjectById
   * Fetches a single subject by ID
   */
  async findSubjectById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_subjects', {
        p_id: id,
        p_subject_id: null,
        p_language_id: null,
        p_is_active: null,
        p_sort_table: 'subject',
        p_sort_column: 'display_order',
        p_sort_direction: 'ASC',
        p_filter_difficulty_level: null,
        p_filter_is_active: null,
        p_filter_is_deleted: null,
        p_search_term: null,
        p_page_index: 1,
        p_page_size: 1,
      });

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (err) {
      logger.error(`Error finding subject by ID: ${err.message}`);
      throw err;
    }
  }

  /**
   * getSubjects
   * Fetches a list of subjects with optional filtering, sorting, and pagination
   */
  async getSubjects(options = {}) {
    try {
      const {
        subjectId = null,
        languageId = null,
        sortTable = 'subject',
        sortColumn = 'display_order',
        sortDirection = 'ASC',
        filterDifficultyLevel = null,
        filterIsActive = null,
        filterIsDeleted = null,
        searchTerm = null,
        pageIndex = 1,
        pageSize = 10,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_subjects', {
        p_id: null,
        p_subject_id: subjectId,
        p_language_id: languageId,
        p_is_active: null,
        p_sort_table: sortTable,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_filter_difficulty_level: filterDifficultyLevel,
        p_filter_is_active: filterIsActive,
        p_filter_is_deleted: filterIsDeleted,
        p_search_term: searchTerm,
        p_page_index: pageIndex,
        p_page_size: pageSize,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching subjects: ${err.message}`);
      throw err;
    }
  }

  /**
   * createSubject
   * Creates a new subject and returns the full record
   */
  async createSubject(payload) {
    try {
      const {
        code,
        difficultyLevel = 'beginner',
        estimatedHours,
        displayOrder = 0,
        note,
        isActive = true,
        createdBy,
      } = payload;

      const { data: newId, error: insertError } = await supabase.rpc(
        'sp_subjects_insert',
        {
          p_code: code,
          p_difficulty_level: difficultyLevel,
          p_estimated_hours: estimatedHours,
          p_display_order: displayOrder,
          p_note: note,
          p_is_active: isActive,
          p_created_by: createdBy,
        }
      );

      if (insertError) throw insertError;

      return await this.findSubjectById(newId);
    } catch (err) {
      logger.error(`Error creating subject: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateSubject
   * Updates an existing subject and returns the updated record
   */
  async updateSubject(id, payload) {
    try {
      const {
        code,
        difficultyLevel,
        estimatedHours,
        displayOrder,
        note,
        isActive,
      } = payload;

      const { error } = await supabase.rpc('sp_subjects_update', {
        p_id: id,
        p_code: code,
        p_difficulty_level: difficultyLevel,
        p_estimated_hours: estimatedHours,
        p_display_order: displayOrder,
        p_note: note,
        p_is_active: isActive,
      });

      if (error) throw error;

      return await this.findSubjectById(id);
    } catch (err) {
      logger.error(`Error updating subject: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteSubject
   * Soft deletes a subject (returns void)
   */
  async deleteSubject(id) {
    try {
      const { error } = await supabase.rpc('sp_subjects_delete', {
        p_id: id,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting subject: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CHAPTERS
  // ─────────────────────────────────────────────────────────────

  /**
   * findChapterById
   * Fetches a single chapter by ID
   */
  async findChapterById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_chapters', {
        p_id: id,
        p_chapter_id: null,
        p_subject_id: null,
        p_language_id: null,
        p_is_active: null,
        p_sort_table: 'chapter',
        p_sort_column: 'display_order',
        p_sort_direction: 'ASC',
        p_filter_difficulty_level: null,
        p_filter_subject_code: null,
        p_filter_is_active: null,
        p_filter_is_deleted: null,
        p_search_term: null,
        p_page_index: 1,
        p_page_size: 1,
      });

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (err) {
      logger.error(`Error finding chapter by ID: ${err.message}`);
      throw err;
    }
  }

  /**
   * getChapters
   * Fetches a list of chapters with optional filtering, sorting, and pagination
   */
  async getChapters(options = {}) {
    try {
      const {
        chapterId = null,
        subjectId = null,
        languageId = null,
        sortTable = 'chapter',
        sortColumn = 'display_order',
        sortDirection = 'ASC',
        filterDifficultyLevel = null,
        filterSubjectCode = null,
        filterIsActive = null,
        filterIsDeleted = null,
        searchTerm = null,
        pageIndex = 1,
        pageSize = 10,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_chapters', {
        p_id: null,
        p_chapter_id: chapterId,
        p_subject_id: subjectId,
        p_language_id: languageId,
        p_is_active: null,
        p_sort_table: sortTable,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_filter_difficulty_level: filterDifficultyLevel,
        p_filter_subject_code: filterSubjectCode,
        p_filter_is_active: filterIsActive,
        p_filter_is_deleted: filterIsDeleted,
        p_search_term: searchTerm,
        p_page_index: pageIndex,
        p_page_size: pageSize,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching chapters: ${err.message}`);
      throw err;
    }
  }

  /**
   * createChapter
   * Creates a new chapter and returns the full record
   */
  async createChapter(payload) {
    try {
      const {
        subjectId,
        displayOrder = 0,
        difficultyLevel = 'beginner',
        estimatedMinutes,
        note,
        isActive = true,
        createdBy,
      } = payload;

      const { data: newId, error: insertError } = await supabase.rpc(
        'sp_chapters_insert',
        {
          p_subject_id: subjectId,
          p_display_order: displayOrder,
          p_difficulty_level: difficultyLevel,
          p_estimated_minutes: estimatedMinutes,
          p_note: note,
          p_is_active: isActive,
          p_created_by: createdBy,
        }
      );

      if (insertError) throw insertError;

      return await this.findChapterById(newId);
    } catch (err) {
      logger.error(`Error creating chapter: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateChapter
   * Updates an existing chapter and returns the updated record
   */
  async updateChapter(id, payload) {
    try {
      const {
        subjectId,
        displayOrder,
        difficultyLevel,
        estimatedMinutes,
        note,
        isActive,
      } = payload;

      const { error } = await supabase.rpc('sp_chapters_update', {
        p_id: id,
        p_subject_id: subjectId,
        p_display_order: displayOrder,
        p_difficulty_level: difficultyLevel,
        p_estimated_minutes: estimatedMinutes,
        p_note: note,
        p_is_active: isActive,
      });

      if (error) throw error;

      return await this.findChapterById(id);
    } catch (err) {
      logger.error(`Error updating chapter: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteChapter
   * Soft deletes a chapter (returns void)
   */
  async deleteChapter(id) {
    try {
      const { error } = await supabase.rpc('sp_chapters_delete', {
        p_id: id,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting chapter: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // TOPICS
  // ─────────────────────────────────────────────────────────────

  /**
   * findTopicById
   * Fetches a single topic by ID
   */
  async findTopicById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_topics', {
        p_id: id,
        p_topic_id: null,
        p_chapter_id: null,
        p_subject_id: null,
        p_language_id: null,
        p_is_active: null,
        p_sort_table: 'topic',
        p_sort_column: 'display_order',
        p_sort_direction: 'ASC',
        p_filter_difficulty_level: null,
        p_filter_is_standalone: null,
        p_filter_is_active: null,
        p_filter_is_deleted: null,
        p_search_term: null,
        p_page_index: 1,
        p_page_size: 1,
      });

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (err) {
      logger.error(`Error finding topic by ID: ${err.message}`);
      throw err;
    }
  }

  /**
   * getTopics
   * Fetches a list of topics with optional filtering, sorting, and pagination
   */
  async getTopics(options = {}) {
    try {
      const {
        topicId = null,
        chapterId = null,
        subjectId = null,
        languageId = null,
        sortTable = 'topic',
        sortColumn = 'display_order',
        sortDirection = 'ASC',
        filterDifficultyLevel = null,
        filterIsStandalone = null,
        filterIsActive = null,
        filterIsDeleted = null,
        searchTerm = null,
        pageIndex = 1,
        pageSize = 10,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_topics', {
        p_id: null,
        p_topic_id: topicId,
        p_chapter_id: chapterId,
        p_subject_id: subjectId,
        p_language_id: languageId,
        p_is_active: null,
        p_sort_table: sortTable,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_filter_difficulty_level: filterDifficultyLevel,
        p_filter_is_standalone: filterIsStandalone,
        p_filter_is_active: filterIsActive,
        p_filter_is_deleted: filterIsDeleted,
        p_search_term: searchTerm,
        p_page_index: pageIndex,
        p_page_size: pageSize,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching topics: ${err.message}`);
      throw err;
    }
  }

  /**
   * createTopic
   * Creates a new topic and returns the full record
   */
  async createTopic(payload) {
    try {
      const {
        chapterId,
        displayOrder = 0,
        difficultyLevel = 'beginner',
        estimatedMinutes,
        note,
        isActive = true,
        createdBy,
      } = payload;

      const { data: newId, error: insertError } = await supabase.rpc(
        'sp_topics_insert',
        {
          p_chapter_id: chapterId,
          p_display_order: displayOrder,
          p_difficulty_level: difficultyLevel,
          p_estimated_minutes: estimatedMinutes,
          p_note: note,
          p_is_active: isActive,
          p_created_by: createdBy,
        }
      );

      if (insertError) throw insertError;

      return await this.findTopicById(newId);
    } catch (err) {
      logger.error(`Error creating topic: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateTopic
   * Updates an existing topic and returns the updated record
   */
  async updateTopic(id, payload) {
    try {
      const {
        chapterId,
        displayOrder,
        difficultyLevel,
        estimatedMinutes,
        note,
        isActive,
      } = payload;

      const { error } = await supabase.rpc('sp_topics_update', {
        p_id: id,
        p_chapter_id: chapterId,
        p_display_order: displayOrder,
        p_difficulty_level: difficultyLevel,
        p_estimated_minutes: estimatedMinutes,
        p_note: note,
        p_is_active: isActive,
      });

      if (error) throw error;

      return await this.findTopicById(id);
    } catch (err) {
      logger.error(`Error updating topic: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteTopic
   * Soft deletes a topic (returns void)
   */
  async deleteTopic(id) {
    try {
      const { error } = await supabase.rpc('sp_topics_delete', {
        p_id: id,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting topic: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // SUB-TOPICS
  // ─────────────────────────────────────────────────────────────

  /**
   * findSubTopicById
   * Fetches a single sub-topic by ID
   */
  async findSubTopicById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_sub_topics', {
        p_id: id,
        p_sub_topic_id: null,
        p_topic_id: null,
        p_chapter_id: null,
        p_language_id: null,
        p_is_active: null,
        p_sort_table: 'sub_topic',
        p_sort_column: 'display_order',
        p_sort_direction: 'ASC',
        p_filter_difficulty_level: null,
        p_filter_is_active: null,
        p_filter_is_deleted: null,
        p_search_term: null,
        p_page_index: 1,
        p_page_size: 1,
      });

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (err) {
      logger.error(`Error finding sub-topic by ID: ${err.message}`);
      throw err;
    }
  }

  /**
   * getSubTopics
   * Fetches a list of sub-topics with optional filtering, sorting, and pagination
   */
  async getSubTopics(options = {}) {
    try {
      const {
        subTopicId = null,
        topicId = null,
        chapterId = null,
        languageId = null,
        sortTable = 'sub_topic',
        sortColumn = 'display_order',
        sortDirection = 'ASC',
        filterDifficultyLevel = null,
        filterIsActive = null,
        filterIsDeleted = null,
        searchTerm = null,
        pageIndex = 1,
        pageSize = 10,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_sub_topics', {
        p_id: null,
        p_sub_topic_id: subTopicId,
        p_topic_id: topicId,
        p_chapter_id: chapterId,
        p_language_id: languageId,
        p_is_active: null,
        p_sort_table: sortTable,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_filter_difficulty_level: filterDifficultyLevel,
        p_filter_is_active: filterIsActive,
        p_filter_is_deleted: filterIsDeleted,
        p_search_term: searchTerm,
        p_page_index: pageIndex,
        p_page_size: pageSize,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching sub-topics: ${err.message}`);
      throw err;
    }
  }

  /**
   * createSubTopic
   * Creates a new sub-topic and returns the full record
   */
  async createSubTopic(payload) {
    try {
      const {
        topicId,
        displayOrder = 0,
        difficultyLevel = 'beginner',
        estimatedMinutes,
        note,
        isActive = true,
        createdBy,
      } = payload;

      const { data: newId, error: insertError } = await supabase.rpc(
        'sp_sub_topics_insert',
        {
          p_topic_id: topicId,
          p_display_order: displayOrder,
          p_difficulty_level: difficultyLevel,
          p_estimated_minutes: estimatedMinutes,
          p_note: note,
          p_is_active: isActive,
          p_created_by: createdBy,
        }
      );

      if (insertError) throw insertError;

      return await this.findSubTopicById(newId);
    } catch (err) {
      logger.error(`Error creating sub-topic: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateSubTopic
   * Updates an existing sub-topic and returns the updated record
   */
  async updateSubTopic(id, payload) {
    try {
      const {
        topicId,
        displayOrder,
        difficultyLevel,
        estimatedMinutes,
        note,
        isActive,
      } = payload;

      const { error } = await supabase.rpc('sp_sub_topics_update', {
        p_id: id,
        p_topic_id: topicId,
        p_display_order: displayOrder,
        p_difficulty_level: difficultyLevel,
        p_estimated_minutes: estimatedMinutes,
        p_note: note,
        p_is_active: isActive,
      });

      if (error) throw error;

      return await this.findSubTopicById(id);
    } catch (err) {
      logger.error(`Error updating sub-topic: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteSubTopic
   * Soft deletes a sub-topic (returns void)
   */
  async deleteSubTopic(id) {
    try {
      const { error } = await supabase.rpc('sp_sub_topics_delete', {
        p_id: id,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting sub-topic: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE METHODS
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreSubject
   * Restores a soft-deleted subject and returns the restored record
   */
  async restoreSubject(subjectId, restoreTranslations = false) {
    try {
      const { error } = await supabase.rpc('sp_subjects_restore', {
        p_id: subjectId,
        p_restore_translations: restoreTranslations,
      });

      if (error) throw error;

      return await this.findSubjectById(subjectId);
    } catch (err) {
      logger.error(`Error restoring subject: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreChapter
   * Restores a soft-deleted chapter and returns the restored record
   */
  async restoreChapter(chapterId, restoreTranslations = false) {
    try {
      const { error } = await supabase.rpc('sp_chapters_restore', {
        p_id: chapterId,
        p_restore_translations: restoreTranslations,
      });

      if (error) throw error;

      return await this.findChapterById(chapterId);
    } catch (err) {
      logger.error(`Error restoring chapter: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreTopic
   * Restores a soft-deleted topic and returns the restored record
   */
  async restoreTopic(topicId, restoreTranslations = false) {
    try {
      const { error } = await supabase.rpc('sp_topics_restore', {
        p_id: topicId,
        p_restore_translations: restoreTranslations,
      });

      if (error) throw error;

      return await this.findTopicById(topicId);
    } catch (err) {
      logger.error(`Error restoring topic: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreSubTopic
   * Restores a soft-deleted sub-topic and returns the restored record
   */
  async restoreSubTopic(subTopicId, restoreTranslations = false) {
    try {
      const { error } = await supabase.rpc('sp_sub_topics_restore', {
        p_id: subTopicId,
        p_restore_translations: restoreTranslations,
      });

      if (error) throw error;

      return await this.findSubTopicById(subTopicId);
    } catch (err) {
      logger.error(`Error restoring sub-topic: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new MaterialManagementRepository();
