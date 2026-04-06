/**
 * ═══════════════════════════════════════════════════════════════
 * ASSESSMENT MANAGEMENT REPOSITORY — Database Layer (Supabase RPC)
 * ═══════════════════════════════════════════════════════════════
 * Handles 6 assessment management entities via stored procedures:
 *
 *   1. ASSESSMENTS (has udf_get)
 *      - udf_get_assessments
 *      - sp_assessments_insert, update, delete, restore
 *
 *   2. ASSESSMENT TRANSLATIONS (no udf_get)
 *      - sp_assessment_translations_insert, update, delete, restore
 *
 *   3. ASSESSMENT ATTACHMENTS (has udf_get)
 *      - udf_get_assessment_attachments
 *      - sp_assessment_attachments_insert, update, delete, restore
 *
 *   4. ASSESSMENT ATTACHMENT TRANSLATIONS (no udf_get)
 *      - sp_assessment_attachment_translations_insert, update, delete, restore
 *
 *   5. ASSESSMENT SOLUTIONS (has udf_get)
 *      - udf_get_assessment_solutions
 *      - sp_assessment_solutions_insert, update, delete, restore
 *
 *   6. ASSESSMENT SOLUTION TRANSLATIONS (no udf_get)
 *      - sp_assessment_solution_translations_insert, update, delete, restore
 * ═══════════════════════════════════════════════════════════════
 */

const { supabase } = require('../config/database');
const logger = require('../config/logger');

class AssessmentManagementRepository {
  // ─────────────────────────────────────────────────────────────
  // 1. ASSESSMENTS
  // ─────────────────────────────────────────────────────────────

  /**
   * findAssessmentById
   * Fetches a single assessment by ID
   */
  async findAssessmentById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_assessments', {
        p_id: id,
        p_assessment_id: null,
        p_language_id: null,
        p_is_active: null,
        p_filter_assessment_type: null,
        p_filter_assessment_scope: null,
        p_filter_content_type: null,
        p_filter_difficulty_level: null,
        p_filter_chapter_id: null,
        p_filter_module_id: null,
        p_filter_course_id: null,
        p_filter_is_mandatory: null,
        p_filter_is_active: null,
        p_filter_is_deleted: false,
        p_search_query: null,
        p_sort_table: 'assessment',
        p_sort_column: 'display_order',
        p_sort_direction: 'ASC',
        p_page_index: 0,
        p_page_size: 1,
      });

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (err) {
      logger.error(`Error finding assessment by ID: ${err.message}`);
      throw err;
    }
  }

  /**
   * getAssessments
   * Fetches a list of assessments with optional filtering, sorting, and pagination
   */
  async getAssessments(options = {}) {
    try {
      const {
        assessmentId = null,
        languageId = null,
        filterAssessmentType = null,
        filterAssessmentScope = null,
        filterContentType = null,
        filterDifficultyLevel = null,
        filterChapterId = null,
        filterModuleId = null,
        filterCourseId = null,
        filterIsMandatory = null,
        filterIsActive = null,
        filterIsDeleted = false,
        searchQuery = null,
        sortTable = 'assessment',
        sortColumn = 'display_order',
        sortDirection = 'ASC',
        pageIndex = 0,
        pageSize = 20,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_assessments', {
        p_id: null,
        p_assessment_id: assessmentId,
        p_language_id: languageId,
        p_is_active: null,
        p_filter_assessment_type: filterAssessmentType,
        p_filter_assessment_scope: filterAssessmentScope,
        p_filter_content_type: filterContentType,
        p_filter_difficulty_level: filterDifficultyLevel,
        p_filter_chapter_id: filterChapterId,
        p_filter_module_id: filterModuleId,
        p_filter_course_id: filterCourseId,
        p_filter_is_mandatory: filterIsMandatory,
        p_filter_is_active: filterIsActive,
        p_filter_is_deleted: filterIsDeleted,
        p_search_query: searchQuery,
        p_sort_table: sortTable,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_page_index: pageIndex,
        p_page_size: pageSize,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching assessments: ${err.message}`);
      throw err;
    }
  }

  /**
   * createAssessment
   * Inserts a new assessment via stored procedure
   */
  async createAssessment(data) {
    try {
      const {
        assessmentType = 'assignment',
        assessmentScope = 'chapter',
        chapterId,
        moduleId,
        courseId,
        contentType = 'coding',
        code = null,
        points,
        difficultyLevel = 'medium',
        dueDays,
        estimatedHours,
        isMandatory = true,
        displayOrder,
        isActive,
        createdBy,
      } = data;

      const { data: result, error } = await supabase.rpc('sp_assessments_insert', {
        p_assessment_type: assessmentType,
        p_assessment_scope: assessmentScope,
        p_chapter_id: chapterId || null,
        p_module_id: moduleId || null,
        p_course_id: courseId || null,
        p_content_type: contentType,
        p_code: code,
        p_points: points,
        p_difficulty_level: difficultyLevel,
        p_due_days: dueDays || null,
        p_estimated_hours: estimatedHours || null,
        p_is_mandatory: isMandatory,
        p_display_order: displayOrder,
        p_is_active: isActive,
        p_created_by: createdBy,
      });

      if (error) throw error;
      return { id: result };
    } catch (err) {
      logger.error('Error creating assessment:', err);
      throw err;
    }
  }

  /**
   * updateAssessment
   * Updates an existing assessment via stored procedure
   */
  async updateAssessment(assessmentId, data) {
    try {
      const {
        assessmentType,
        contentType,
        code,
        points,
        difficultyLevel,
        dueDays,
        estimatedHours,
        isMandatory,
        displayOrder,
        isActive,
        updatedBy,
      } = data;

      const { error } = await supabase.rpc('sp_assessments_update', {
        p_assessment_id: assessmentId,
        p_assessment_type: assessmentType || null,
        p_content_type: contentType || null,
        p_code: code || null,
        p_points: points || null,
        p_difficulty_level: difficultyLevel || null,
        p_due_days: dueDays || null,
        p_estimated_hours: estimatedHours || null,
        p_is_mandatory: isMandatory !== undefined ? isMandatory : null,
        p_display_order: displayOrder !== undefined ? displayOrder : null,
        p_is_active: isActive !== undefined ? isActive : null,
        p_updated_by: updatedBy,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error updating assessment ${assessmentId}:`, err);
      throw err;
    }
  }

  /**
   * deleteAssessment
   * Soft deletes an assessment via stored procedure
   */
  async deleteAssessment(assessmentId, deletedBy) {
    try {
      const { error } = await supabase.rpc('sp_assessments_delete', {
        p_assessment_id: assessmentId,
        p_deleted_by: deletedBy,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting assessment ${assessmentId}:`, err);
      throw err;
    }
  }

  /**
   * restoreAssessment
   * Restores a soft-deleted assessment via stored procedure
   */
  async restoreAssessment(assessmentId, restoreTranslations = false, restoredBy) {
    try {
      const { error } = await supabase.rpc('sp_assessments_restore', {
        p_assessment_id: assessmentId,
        p_restore_translations: restoreTranslations,
        p_restored_by: restoredBy,
      });

      if (error) throw error;
      return { id: assessmentId };
    } catch (err) {
      logger.error(`Error restoring assessment ${assessmentId}:`, err);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. ASSESSMENT TRANSLATIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * findAssessmentTranslationById
   * Fetches a single assessment translation by ID
   */
  async findAssessmentTranslationById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_assessments', {
        p_id: null,
        p_assessment_id: null,
        p_language_id: null,
        p_is_active: null,
        p_filter_assessment_type: null,
        p_filter_assessment_scope: null,
        p_filter_content_type: null,
        p_filter_difficulty_level: null,
        p_filter_chapter_id: null,
        p_filter_module_id: null,
        p_filter_course_id: null,
        p_filter_is_mandatory: null,
        p_filter_is_active: null,
        p_filter_is_deleted: false,
        p_search_query: null,
        p_sort_table: 'translation',
        p_sort_column: 'title',
        p_sort_direction: 'ASC',
        p_page_index: 0,
        p_page_size: 50,
      });

      if (error) throw error;
      return data && data.length > 0 ? data.find(d => d.assessment_translation_id === id) : null;
    } catch (err) {
      logger.error(`Error finding assessment translation by ID: ${err.message}`);
      throw err;
    }
  }

  /**
   * createAssessmentTranslation
   * Inserts a new assessment translation via stored procedure
   */
  async createAssessmentTranslation(data) {
    try {
      const {
        assessmentId,
        languageId,
        title,
        description,
        instructions,
        techStack,
        learningOutcomes,
        image1,
        image2,
        tags,
        metaTitle,
        metaDescription,
        metaKeywords,
        canonicalUrl,
        ogSiteName,
        ogTitle,
        ogDescription,
        ogType,
        ogImage,
        ogUrl,
        twitterSite,
        twitterTitle,
        twitterDescription,
        twitterImage,
        twitterCard,
        robotsDirective,
        focusKeyword,
        structuredData,
        isActive,
      } = data;

      const { error } = await supabase.rpc('sp_assessment_translations_insert', {
        p_assessment_id: assessmentId,
        p_language_id: languageId,
        p_title: title,
        p_description: description || null,
        p_instructions: instructions || null,
        p_tech_stack: techStack || null,
        p_learning_outcomes: learningOutcomes || null,
        p_image_1: image1 || null,
        p_image_2: image2 || null,
        p_tags: tags || null,
        p_meta_title: metaTitle || null,
        p_meta_description: metaDescription || null,
        p_meta_keywords: metaKeywords || null,
        p_canonical_url: canonicalUrl || null,
        p_og_site_name: ogSiteName || null,
        p_og_title: ogTitle || null,
        p_og_description: ogDescription || null,
        p_og_type: ogType || null,
        p_og_image: ogImage || null,
        p_og_url: ogUrl || null,
        p_twitter_site: twitterSite || null,
        p_twitter_title: twitterTitle || null,
        p_twitter_description: twitterDescription || null,
        p_twitter_image: twitterImage || null,
        p_twitter_card: twitterCard || null,
        p_robots_directive: robotsDirective || null,
        p_focus_keyword: focusKeyword || null,
        p_structured_data: structuredData || null,
        p_is_active: isActive,
      });

      if (error) throw error;
    } catch (err) {
      logger.error('Error creating assessment translation:', err);
      throw err;
    }
  }

  /**
   * updateAssessmentTranslation
   * Updates an existing assessment translation via stored procedure
   */
  async updateAssessmentTranslation(translationId, data) {
    try {
      const {
        title,
        description,
        instructions,
        techStack,
        learningOutcomes,
        image1,
        image2,
        tags,
        metaTitle,
        metaDescription,
        metaKeywords,
        canonicalUrl,
        ogSiteName,
        ogTitle,
        ogDescription,
        ogType,
        ogImage,
        ogUrl,
        twitterSite,
        twitterTitle,
        twitterDescription,
        twitterImage,
        twitterCard,
        robotsDirective,
        focusKeyword,
        structuredData,
        isActive,
      } = data;

      const { error } = await supabase.rpc('sp_assessment_translations_update', {
        p_translation_id: translationId,
        p_title: title || null,
        p_description: description || null,
        p_instructions: instructions || null,
        p_tech_stack: techStack || null,
        p_learning_outcomes: learningOutcomes || null,
        p_image_1: image1 || null,
        p_image_2: image2 || null,
        p_tags: tags || null,
        p_meta_title: metaTitle || null,
        p_meta_description: metaDescription || null,
        p_meta_keywords: metaKeywords || null,
        p_canonical_url: canonicalUrl || null,
        p_og_site_name: ogSiteName || null,
        p_og_title: ogTitle || null,
        p_og_description: ogDescription || null,
        p_og_type: ogType || null,
        p_og_image: ogImage || null,
        p_og_url: ogUrl || null,
        p_twitter_site: twitterSite || null,
        p_twitter_title: twitterTitle || null,
        p_twitter_description: twitterDescription || null,
        p_twitter_image: twitterImage || null,
        p_twitter_card: twitterCard || null,
        p_robots_directive: robotsDirective || null,
        p_focus_keyword: focusKeyword || null,
        p_structured_data: structuredData || null,
        p_is_active: isActive !== undefined ? isActive : null,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error updating assessment translation ${translationId}:`, err);
      throw err;
    }
  }

  /**
   * deleteAssessmentTranslation
   * Soft deletes an assessment translation via stored procedure
   */
  async deleteAssessmentTranslation(translationId) {
    try {
      const { error } = await supabase.rpc('sp_assessment_translations_delete', {
        p_translation_id: translationId,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting assessment translation ${translationId}:`, err);
      throw err;
    }
  }

  /**
   * restoreAssessmentTranslation
   * Restores a soft-deleted assessment translation via stored procedure
   */
  async restoreAssessmentTranslation(translationId) {
    try {
      const { error } = await supabase.rpc('sp_assessment_translations_restore', {
        p_translation_id: translationId,
      });

      if (error) throw error;
      return { id: translationId };
    } catch (err) {
      logger.error(`Error restoring assessment translation ${translationId}:`, err);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. ASSESSMENT ATTACHMENTS
  // ─────────────────────────────────────────────────────────────

  /**
   * findAssessmentAttachmentById
   * Fetches a single assessment attachment by ID
   */
  async findAssessmentAttachmentById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_assessment_attachments', {
        p_id: id,
        p_assessment_id: null,
        p_language_id: null,
        p_filter_attachment_type: null,
        p_filter_is_active: null,
        p_filter_is_deleted: false,
        p_search: null,
      });

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (err) {
      logger.error(`Error finding assessment attachment by ID: ${err.message}`);
      throw err;
    }
  }

  /**
   * getAssessmentAttachments
   * Fetches a list of assessment attachments with optional filtering
   */
  async getAssessmentAttachments(options = {}) {
    try {
      const {
        assessmentId = null,
        languageId = null,
        filterAttachmentType = null,
        filterIsActive = null,
        filterIsDeleted = false,
        search = null,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_assessment_attachments', {
        p_id: null,
        p_assessment_id: assessmentId,
        p_language_id: languageId,
        p_filter_attachment_type: filterAttachmentType,
        p_filter_is_active: filterIsActive,
        p_filter_is_deleted: filterIsDeleted,
        p_search: search,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching assessment attachments: ${err.message}`);
      throw err;
    }
  }

  /**
   * createAssessmentAttachment
   * Inserts a new assessment attachment via stored procedure
   */
  async createAssessmentAttachment(data) {
    try {
      const {
        assessmentId,
        attachmentType,
        fileUrl,
        githubUrl,
        fileName,
        fileSizeBytes,
        mimeType,
        displayOrder,
        isActive,
        createdBy,
      } = data;

      const { data: result, error } = await supabase.rpc('sp_assessment_attachments_insert', {
        p_assessment_id: assessmentId,
        p_attachment_type: attachmentType,
        p_file_url: fileUrl || null,
        p_github_url: githubUrl || null,
        p_file_name: fileName || null,
        p_file_size_bytes: fileSizeBytes || null,
        p_mime_type: mimeType || null,
        p_display_order: displayOrder,
        p_is_active: isActive,
        p_created_by: createdBy,
      });

      if (error) throw error;
      return { id: result };
    } catch (err) {
      logger.error('Error creating assessment attachment:', err);
      throw err;
    }
  }

  /**
   * updateAssessmentAttachment
   * Updates an existing assessment attachment via stored procedure
   */
  async updateAssessmentAttachment(attachmentId, data) {
    try {
      const {
        attachmentType,
        fileUrl,
        githubUrl,
        fileName,
        fileSizeBytes,
        mimeType,
        displayOrder,
        isActive,
        updatedBy,
      } = data;

      const { error } = await supabase.rpc('sp_assessment_attachments_update', {
        p_attachment_id: attachmentId,
        p_attachment_type: attachmentType || null,
        p_file_url: fileUrl || null,
        p_github_url: githubUrl || null,
        p_file_name: fileName || null,
        p_file_size_bytes: fileSizeBytes || null,
        p_mime_type: mimeType || null,
        p_display_order: displayOrder !== undefined ? displayOrder : null,
        p_is_active: isActive !== undefined ? isActive : null,
        p_updated_by: updatedBy,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error updating assessment attachment ${attachmentId}:`, err);
      throw err;
    }
  }

  /**
   * deleteAssessmentAttachment
   * Soft deletes an assessment attachment via stored procedure
   */
  async deleteAssessmentAttachment(attachmentId) {
    try {
      const { error } = await supabase.rpc('sp_assessment_attachments_delete', {
        p_attachment_id: attachmentId,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting assessment attachment ${attachmentId}:`, err);
      throw err;
    }
  }

  /**
   * restoreAssessmentAttachment
   * Restores a soft-deleted assessment attachment via stored procedure
   */
  async restoreAssessmentAttachment(attachmentId, restoreTranslations = false) {
    try {
      const { error } = await supabase.rpc('sp_assessment_attachments_restore', {
        p_attachment_id: attachmentId,
        p_restore_translations: restoreTranslations,
      });

      if (error) throw error;
      return { id: attachmentId };
    } catch (err) {
      logger.error(`Error restoring assessment attachment ${attachmentId}:`, err);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 4. ASSESSMENT ATTACHMENT TRANSLATIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * findAssessmentAttachmentTranslationById
   * Fetches a single assessment attachment translation by ID
   */
  async findAssessmentAttachmentTranslationById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_assessment_attachments', {
        p_id: null,
        p_assessment_id: null,
        p_language_id: null,
        p_filter_attachment_type: null,
        p_filter_is_active: null,
        p_filter_is_deleted: false,
        p_search: null,
      });

      if (error) throw error;
      return data && data.length > 0 ? data.find(d => d.assessment_attachment_translation_id === id) : null;
    } catch (err) {
      logger.error(`Error finding assessment attachment translation by ID: ${err.message}`);
      throw err;
    }
  }

  /**
   * createAssessmentAttachmentTranslation
   * Inserts a new assessment attachment translation via stored procedure
   */
  async createAssessmentAttachmentTranslation(data) {
    try {
      const {
        assessmentAttachmentId,
        languageId,
        title,
        description,
        isActive,
      } = data;

      const { error } = await supabase.rpc('sp_assessment_attachment_translations_insert', {
        p_assessment_attachment_id: assessmentAttachmentId,
        p_language_id: languageId,
        p_title: title || null,
        p_description: description || null,
        p_is_active: isActive,
      });

      if (error) throw error;
    } catch (err) {
      logger.error('Error creating assessment attachment translation:', err);
      throw err;
    }
  }

  /**
   * updateAssessmentAttachmentTranslation
   * Updates an existing assessment attachment translation via stored procedure
   */
  async updateAssessmentAttachmentTranslation(translationId, data) {
    try {
      const {
        title,
        description,
        isActive,
      } = data;

      const { error } = await supabase.rpc('sp_assessment_attachment_translations_update', {
        p_translation_id: translationId,
        p_title: title || null,
        p_description: description || null,
        p_is_active: isActive !== undefined ? isActive : null,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error updating assessment attachment translation ${translationId}:`, err);
      throw err;
    }
  }

  /**
   * deleteAssessmentAttachmentTranslation
   * Soft deletes an assessment attachment translation via stored procedure
   */
  async deleteAssessmentAttachmentTranslation(translationId) {
    try {
      const { error } = await supabase.rpc('sp_assessment_attachment_translations_delete', {
        p_translation_id: translationId,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting assessment attachment translation ${translationId}:`, err);
      throw err;
    }
  }

  /**
   * restoreAssessmentAttachmentTranslation
   * Restores a soft-deleted assessment attachment translation via stored procedure
   */
  async restoreAssessmentAttachmentTranslation(translationId) {
    try {
      const { error } = await supabase.rpc('sp_assessment_attachment_translations_restore', {
        p_translation_id: translationId,
      });

      if (error) throw error;
      return { id: translationId };
    } catch (err) {
      logger.error(`Error restoring assessment attachment translation ${translationId}:`, err);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 5. ASSESSMENT SOLUTIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * findAssessmentSolutionById
   * Fetches a single assessment solution by ID
   */
  async findAssessmentSolutionById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_assessment_solutions', {
        p_id: id,
        p_assessment_id: null,
        p_language_id: null,
        p_filter_solution_type: null,
        p_filter_is_active: null,
        p_filter_is_deleted: false,
        p_search: null,
      });

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (err) {
      logger.error(`Error finding assessment solution by ID: ${err.message}`);
      throw err;
    }
  }

  /**
   * getAssessmentSolutions
   * Fetches a list of assessment solutions with optional filtering
   */
  async getAssessmentSolutions(options = {}) {
    try {
      const {
        assessmentId = null,
        languageId = null,
        filterSolutionType = null,
        filterIsActive = null,
        filterIsDeleted = false,
        search = null,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_assessment_solutions', {
        p_id: null,
        p_assessment_id: assessmentId,
        p_language_id: languageId,
        p_filter_solution_type: filterSolutionType,
        p_filter_is_active: filterIsActive,
        p_filter_is_deleted: filterIsDeleted,
        p_search: search,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching assessment solutions: ${err.message}`);
      throw err;
    }
  }

  /**
   * createAssessmentSolution
   * Inserts a new assessment solution via stored procedure
   */
  async createAssessmentSolution(data) {
    try {
      const {
        assessmentId,
        solutionType,
        fileUrl,
        githubUrl,
        videoUrl,
        fileName,
        fileSizeBytes,
        mimeType,
        videoDurationSeconds,
        displayOrder,
        isActive,
        createdBy,
      } = data;

      const { data: result, error } = await supabase.rpc('sp_assessment_solutions_insert', {
        p_assessment_id: assessmentId,
        p_solution_type: solutionType,
        p_file_url: fileUrl || null,
        p_github_url: githubUrl || null,
        p_video_url: videoUrl || null,
        p_file_name: fileName || null,
        p_file_size_bytes: fileSizeBytes || null,
        p_mime_type: mimeType || null,
        p_video_duration_seconds: videoDurationSeconds || null,
        p_display_order: displayOrder,
        p_is_active: isActive,
        p_created_by: createdBy,
      });

      if (error) throw error;
      return { id: result };
    } catch (err) {
      logger.error('Error creating assessment solution:', err);
      throw err;
    }
  }

  /**
   * updateAssessmentSolution
   * Updates an existing assessment solution via stored procedure
   */
  async updateAssessmentSolution(solutionId, data) {
    try {
      const {
        solutionType,
        fileUrl,
        githubUrl,
        videoUrl,
        fileName,
        fileSizeBytes,
        mimeType,
        videoDurationSeconds,
        displayOrder,
        isActive,
        updatedBy,
      } = data;

      const { error } = await supabase.rpc('sp_assessment_solutions_update', {
        p_solution_id: solutionId,
        p_solution_type: solutionType || null,
        p_file_url: fileUrl || null,
        p_github_url: githubUrl || null,
        p_video_url: videoUrl || null,
        p_file_name: fileName || null,
        p_file_size_bytes: fileSizeBytes || null,
        p_mime_type: mimeType || null,
        p_video_duration_seconds: videoDurationSeconds || null,
        p_display_order: displayOrder !== undefined ? displayOrder : null,
        p_is_active: isActive !== undefined ? isActive : null,
        p_updated_by: updatedBy,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error updating assessment solution ${solutionId}:`, err);
      throw err;
    }
  }

  /**
   * deleteAssessmentSolution
   * Soft deletes an assessment solution via stored procedure
   */
  async deleteAssessmentSolution(solutionId) {
    try {
      const { error } = await supabase.rpc('sp_assessment_solutions_delete', {
        p_solution_id: solutionId,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting assessment solution ${solutionId}:`, err);
      throw err;
    }
  }

  /**
   * restoreAssessmentSolution
   * Restores a soft-deleted assessment solution via stored procedure
   */
  async restoreAssessmentSolution(solutionId, restoreTranslations = false) {
    try {
      const { error } = await supabase.rpc('sp_assessment_solutions_restore', {
        p_solution_id: solutionId,
        p_restore_translations: restoreTranslations,
      });

      if (error) throw error;
      return { id: solutionId };
    } catch (err) {
      logger.error(`Error restoring assessment solution ${solutionId}:`, err);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 6. ASSESSMENT SOLUTION TRANSLATIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * findAssessmentSolutionTranslationById
   * Fetches a single assessment solution translation by ID
   */
  async findAssessmentSolutionTranslationById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_assessment_solutions', {
        p_id: null,
        p_assessment_id: null,
        p_language_id: null,
        p_filter_solution_type: null,
        p_filter_is_active: null,
        p_filter_is_deleted: false,
        p_search: null,
      });

      if (error) throw error;
      return data && data.length > 0 ? data.find(d => d.assessment_solution_translation_id === id) : null;
    } catch (err) {
      logger.error(`Error finding assessment solution translation by ID: ${err.message}`);
      throw err;
    }
  }

  /**
   * createAssessmentSolutionTranslation
   * Inserts a new assessment solution translation via stored procedure
   */
  async createAssessmentSolutionTranslation(data) {
    try {
      const {
        assessmentSolutionId,
        languageId,
        title,
        description,
        videoTitle,
        videoDescription,
        videoThumbnail,
        isActive,
      } = data;

      const { error } = await supabase.rpc('sp_assessment_solution_translations_insert', {
        p_assessment_solution_id: assessmentSolutionId,
        p_language_id: languageId,
        p_title: title || null,
        p_description: description || null,
        p_video_title: videoTitle || null,
        p_video_description: videoDescription || null,
        p_video_thumbnail: videoThumbnail || null,
        p_is_active: isActive,
      });

      if (error) throw error;
    } catch (err) {
      logger.error('Error creating assessment solution translation:', err);
      throw err;
    }
  }

  /**
   * updateAssessmentSolutionTranslation
   * Updates an existing assessment solution translation via stored procedure
   */
  async updateAssessmentSolutionTranslation(translationId, data) {
    try {
      const {
        title,
        description,
        videoTitle,
        videoDescription,
        videoThumbnail,
        isActive,
      } = data;

      const { error } = await supabase.rpc('sp_assessment_solution_translations_update', {
        p_translation_id: translationId,
        p_title: title || null,
        p_description: description || null,
        p_video_title: videoTitle || null,
        p_video_description: videoDescription || null,
        p_video_thumbnail: videoThumbnail || null,
        p_is_active: isActive !== undefined ? isActive : null,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error updating assessment solution translation ${translationId}:`, err);
      throw err;
    }
  }

  /**
   * deleteAssessmentSolutionTranslation
   * Soft deletes an assessment solution translation via stored procedure
   */
  async deleteAssessmentSolutionTranslation(translationId) {
    try {
      const { error } = await supabase.rpc('sp_assessment_solution_translations_delete', {
        p_translation_id: translationId,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting assessment solution translation ${translationId}:`, err);
      throw err;
    }
  }

  /**
   * restoreAssessmentSolutionTranslation
   * Restores a soft-deleted assessment solution translation via stored procedure
   */
  async restoreAssessmentSolutionTranslation(translationId) {
    try {
      const { error } = await supabase.rpc('sp_assessment_solution_translations_restore', {
        p_translation_id: translationId,
      });

      if (error) throw error;
      return { id: translationId };
    } catch (err) {
      logger.error(`Error restoring assessment solution translation ${translationId}:`, err);
      throw err;
    }
  }
}

module.exports = new AssessmentManagementRepository();
