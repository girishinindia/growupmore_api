/**
 * ═══════════════════════════════════════════════════════════════
 * MASTER DATA EXTENDED REPOSITORY — Database Layer (Supabase RPC)
 * ═══════════════════════════════════════════════════════════════
 * Handles Skills, Languages, Education Levels, Document Types, Documents,
 * Designations, Specializations, Learning Goals, Social Medias, Categories,
 * and Sub Categories via Supabase RPC functions.
 * ═══════════════════════════════════════════════════════════════
 */

const { supabase } = require('../config/database');
const logger = require('../config/logger');

class MasterDataExtendedRepository {
  // ─────────────────────────────────────────────────────────────
  //  SKILLS — READ
  // ─────────────────────────────────────────────────────────────

  async findSkillById(skillId) {
    const { data, error } = await supabase.rpc('udf_get_skills', {
      p_id: skillId,
      p_is_active: null,
      p_sort_column: 'id',
      p_sort_direction: 'ASC',
      p_filter_category: null,
      p_filter_is_active: null,
      p_filter_is_deleted: false,
      p_search_term: null,
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.findSkillById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  async getSkills(options = {}) {
    const { data, error } = await supabase.rpc('udf_get_skills', {
      p_id: null,
      p_is_active: null,
      p_sort_column: options.sortColumn || 'id',
      p_sort_direction: options.sortDirection || 'ASC',
      p_filter_category: options.filterCategory || null,
      p_filter_is_active: options.filterIsActive !== undefined ? options.filterIsActive : null,
      p_filter_is_deleted: options.filterIsDeleted !== undefined ? options.filterIsDeleted : false,
      p_search_term: options.searchTerm || null,
      p_page_index: options.pageIndex || 1,
      p_page_size: options.pageSize || 20,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.getSkills failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  SKILLS — WRITE
  // ─────────────────────────────────────────────────────────────

  async createSkill(skillData) {
    const { data, error } = await supabase.rpc('sp_skills_insert', {
      p_name: skillData.name,
      p_category: skillData.category || 'technical',
      p_description: skillData.description || null,
      p_icon_url: skillData.iconUrl || null,
      p_is_active: skillData.isActive !== undefined ? skillData.isActive : true,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.createSkill failed');
      throw error;
    }

    const newId = data;
    return this.findSkillById(newId);
  }

  async updateSkill(skillId, updates) {
    const { error } = await supabase.rpc('sp_skills_update', {
      p_id: skillId,
      p_name: updates.name || null,
      p_category: updates.category !== undefined ? updates.category : null,
      p_description: updates.description !== undefined ? updates.description : null,
      p_icon_url: updates.iconUrl !== undefined ? updates.iconUrl : null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.updateSkill failed');
      throw error;
    }

    return this.findSkillById(skillId);
  }

  async deleteSkill(skillId) {
    const { error } = await supabase.rpc('sp_skills_delete', {
      p_id: skillId,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.deleteSkill failed');
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  LANGUAGES — READ
  // ─────────────────────────────────────────────────────────────

  async findLanguageById(languageId) {
    const { data, error } = await supabase.rpc('udf_get_languages', {
      p_id: languageId,
      p_is_active: null,
      p_sort_column: 'id',
      p_sort_direction: 'ASC',
      p_filter_script: null,
      p_filter_iso_code: null,
      p_filter_is_active: null,
      p_filter_is_deleted: false,
      p_search_term: null,
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.findLanguageById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  async getLanguages(options = {}) {
    const { data, error } = await supabase.rpc('udf_get_languages', {
      p_id: null,
      p_is_active: null,
      p_sort_column: options.sortColumn || 'id',
      p_sort_direction: options.sortDirection || 'ASC',
      p_filter_script: options.filterScript || null,
      p_filter_iso_code: options.filterIsoCode || null,
      p_filter_is_active: options.filterIsActive !== undefined ? options.filterIsActive : null,
      p_filter_is_deleted: options.filterIsDeleted !== undefined ? options.filterIsDeleted : false,
      p_search_term: options.searchTerm || null,
      p_page_index: options.pageIndex || 1,
      p_page_size: options.pageSize || 20,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.getLanguages failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  LANGUAGES — WRITE
  // ─────────────────────────────────────────────────────────────

  async createLanguage(languageData) {
    const { data, error } = await supabase.rpc('sp_languages_insert', {
      p_name: languageData.name,
      p_native_name: languageData.nativeName || null,
      p_iso_code: languageData.isoCode || null,
      p_script: languageData.script || null,
      p_is_active: languageData.isActive !== undefined ? languageData.isActive : true,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.createLanguage failed');
      throw error;
    }

    const newId = data;
    return this.findLanguageById(newId);
  }

  async updateLanguage(languageId, updates) {
    const { error } = await supabase.rpc('sp_languages_update', {
      p_id: languageId,
      p_name: updates.name || null,
      p_native_name: updates.nativeName !== undefined ? updates.nativeName : null,
      p_iso_code: updates.isoCode !== undefined ? updates.isoCode : null,
      p_script: updates.script !== undefined ? updates.script : null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.updateLanguage failed');
      throw error;
    }

    return this.findLanguageById(languageId);
  }

  async deleteLanguage(languageId) {
    const { error } = await supabase.rpc('sp_languages_delete', {
      p_id: languageId,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.deleteLanguage failed');
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  EDUCATION LEVELS — READ
  // ─────────────────────────────────────────────────────────────

  async findEducationLevelById(educationLevelId) {
    const { data, error } = await supabase.rpc('udf_get_education_levels', {
      p_id: educationLevelId,
      p_is_active: null,
      p_sort_column: 'level_order',
      p_sort_direction: 'ASC',
      p_filter_category: null,
      p_filter_is_active: null,
      p_filter_is_deleted: false,
      p_search_term: null,
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.findEducationLevelById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  async getEducationLevels(options = {}) {
    const { data, error } = await supabase.rpc('udf_get_education_levels', {
      p_id: null,
      p_is_active: null,
      p_sort_column: options.sortColumn || 'level_order',
      p_sort_direction: options.sortDirection || 'ASC',
      p_filter_category: options.filterCategory || null,
      p_filter_is_active: options.filterIsActive !== undefined ? options.filterIsActive : null,
      p_filter_is_deleted: options.filterIsDeleted !== undefined ? options.filterIsDeleted : false,
      p_search_term: options.searchTerm || null,
      p_page_index: options.pageIndex || 1,
      p_page_size: options.pageSize || 20,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.getEducationLevels failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  EDUCATION LEVELS — WRITE
  // ─────────────────────────────────────────────────────────────

  async createEducationLevel(educationLevelData) {
    const { data, error } = await supabase.rpc('sp_education_levels_insert', {
      p_name: educationLevelData.name,
      p_level_order: educationLevelData.levelOrder,
      p_level_category: educationLevelData.levelCategory || 'other',
      p_abbreviation: educationLevelData.abbreviation || null,
      p_description: educationLevelData.description || null,
      p_typical_duration: educationLevelData.typicalDuration || null,
      p_typical_age_range: educationLevelData.typicalAgeRange || null,
      p_is_active: educationLevelData.isActive !== undefined ? educationLevelData.isActive : true,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.createEducationLevel failed');
      throw error;
    }

    const newId = data;
    return this.findEducationLevelById(newId);
  }

  async updateEducationLevel(educationLevelId, updates) {
    const { error } = await supabase.rpc('sp_education_levels_update', {
      p_id: educationLevelId,
      p_name: updates.name || null,
      p_abbreviation: updates.abbreviation !== undefined ? updates.abbreviation : null,
      p_level_order: updates.levelOrder !== undefined ? updates.levelOrder : null,
      p_level_category: updates.levelCategory !== undefined ? updates.levelCategory : null,
      p_description: updates.description !== undefined ? updates.description : null,
      p_typical_duration: updates.typicalDuration !== undefined ? updates.typicalDuration : null,
      p_typical_age_range: updates.typicalAgeRange !== undefined ? updates.typicalAgeRange : null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.updateEducationLevel failed');
      throw error;
    }

    return this.findEducationLevelById(educationLevelId);
  }

  async deleteEducationLevel(educationLevelId) {
    const { error } = await supabase.rpc('sp_education_levels_delete', {
      p_id: educationLevelId,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.deleteEducationLevel failed');
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  DOCUMENT TYPES — READ
  // ─────────────────────────────────────────────────────────────

  async findDocumentTypeById(documentTypeId) {
    const { data, error } = await supabase.rpc('udf_get_document_types', {
      p_id: documentTypeId,
      p_is_active: null,
      p_sort_column: 'id',
      p_sort_direction: 'ASC',
      p_filter_is_active: null,
      p_filter_is_deleted: false,
      p_search_term: null,
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.findDocumentTypeById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  async getDocumentTypes(options = {}) {
    const { data, error } = await supabase.rpc('udf_get_document_types', {
      p_id: null,
      p_is_active: null,
      p_sort_column: options.sortColumn || 'id',
      p_sort_direction: options.sortDirection || 'ASC',
      p_filter_is_active: options.filterIsActive !== undefined ? options.filterIsActive : null,
      p_filter_is_deleted: options.filterIsDeleted !== undefined ? options.filterIsDeleted : false,
      p_search_term: options.searchTerm || null,
      p_page_index: options.pageIndex || 1,
      p_page_size: options.pageSize || 20,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.getDocumentTypes failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  DOCUMENT TYPES — WRITE
  // ─────────────────────────────────────────────────────────────

  async createDocumentType(documentTypeData) {
    const { data, error } = await supabase.rpc('sp_document_types_insert', {
      p_name: documentTypeData.name,
      p_description: documentTypeData.description || null,
      p_is_active: documentTypeData.isActive !== undefined ? documentTypeData.isActive : true,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.createDocumentType failed');
      throw error;
    }

    const newId = data;
    return this.findDocumentTypeById(newId);
  }

  async updateDocumentType(documentTypeId, updates) {
    const { error } = await supabase.rpc('sp_document_types_update', {
      p_id: documentTypeId,
      p_name: updates.name || null,
      p_description: updates.description !== undefined ? updates.description : null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.updateDocumentType failed');
      throw error;
    }

    return this.findDocumentTypeById(documentTypeId);
  }

  async deleteDocumentType(documentTypeId) {
    const { error } = await supabase.rpc('sp_document_types_delete', {
      p_id: documentTypeId,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.deleteDocumentType failed');
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  DOCUMENTS — READ
  // ─────────────────────────────────────────────────────────────

  async findDocumentById(documentId) {
    const { data, error } = await supabase.rpc('udf_get_documents', {
      p_id: documentId,
      p_document_type_is_active: null,
      p_document_is_active: null,
      p_sort_table: 'document',
      p_sort_column: 'id',
      p_sort_direction: 'ASC',
      p_filter_document_type_id: null,
      p_filter_document_type_name: null,
      p_filter_document_type_is_active: null,
      p_filter_document_type_is_deleted: false,
      p_filter_document_is_active: null,
      p_filter_document_is_deleted: false,
      p_search_term: null,
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.findDocumentById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  async getDocuments(options = {}) {
    const { data, error } = await supabase.rpc('udf_get_documents', {
      p_id: null,
      p_document_type_is_active: null,
      p_document_is_active: null,
      p_sort_table: options.sortTable || 'document',
      p_sort_column: options.sortColumn || 'id',
      p_sort_direction: options.sortDirection || 'ASC',
      p_filter_document_type_id: options.filterDocumentTypeId || null,
      p_filter_document_type_name: options.filterDocumentTypeName || null,
      p_filter_document_type_is_active: options.filterDocumentTypeIsActive !== undefined ? options.filterDocumentTypeIsActive : null,
      p_filter_document_type_is_deleted: options.filterDocumentTypeIsDeleted !== undefined ? options.filterDocumentTypeIsDeleted : false,
      p_filter_document_is_active: options.filterDocumentIsActive !== undefined ? options.filterDocumentIsActive : null,
      p_filter_document_is_deleted: options.filterDocumentIsDeleted !== undefined ? options.filterDocumentIsDeleted : false,
      p_search_term: options.searchTerm || null,
      p_page_index: options.pageIndex || 1,
      p_page_size: options.pageSize || 20,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.getDocuments failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  DOCUMENTS — WRITE
  // ─────────────────────────────────────────────────────────────

  async createDocument(documentData) {
    const { data, error } = await supabase.rpc('sp_documents_insert', {
      p_document_type_id: documentData.documentTypeId,
      p_name: documentData.name,
      p_description: documentData.description || null,
      p_is_active: documentData.isActive !== undefined ? documentData.isActive : true,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.createDocument failed');
      throw error;
    }

    const newId = data;
    return this.findDocumentById(newId);
  }

  async updateDocument(documentId, updates) {
    const { error } = await supabase.rpc('sp_documents_update', {
      p_id: documentId,
      p_document_type_id: updates.documentTypeId !== undefined ? updates.documentTypeId : null,
      p_name: updates.name || null,
      p_description: updates.description !== undefined ? updates.description : null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.updateDocument failed');
      throw error;
    }

    return this.findDocumentById(documentId);
  }

  async deleteDocument(documentId) {
    const { error } = await supabase.rpc('sp_documents_delete', {
      p_id: documentId,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.deleteDocument failed');
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  DESIGNATIONS — READ
  // ─────────────────────────────────────────────────────────────

  async findDesignationById(designationId) {
    const { data, error } = await supabase.rpc('udf_get_designations', {
      p_id: designationId,
      p_is_active: null,
      p_sort_column: 'level',
      p_sort_direction: 'ASC',
      p_filter_level_band: null,
      p_filter_is_active: null,
      p_filter_is_deleted: false,
      p_search_term: null,
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.findDesignationById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  async getDesignations(options = {}) {
    const { data, error } = await supabase.rpc('udf_get_designations', {
      p_id: null,
      p_is_active: null,
      p_sort_column: options.sortColumn || 'level',
      p_sort_direction: options.sortDirection || 'ASC',
      p_filter_level_band: options.filterLevelBand || null,
      p_filter_is_active: options.filterIsActive !== undefined ? options.filterIsActive : null,
      p_filter_is_deleted: options.filterIsDeleted !== undefined ? options.filterIsDeleted : false,
      p_search_term: options.searchTerm || null,
      p_page_index: options.pageIndex || 1,
      p_page_size: options.pageSize || 20,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.getDesignations failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  DESIGNATIONS — WRITE
  // ─────────────────────────────────────────────────────────────

  async createDesignation(designationData) {
    const { data, error } = await supabase.rpc('sp_designations_insert', {
      p_name: designationData.name,
      p_code: designationData.code || null,
      p_level: designationData.level || 1,
      p_level_band: designationData.levelBand || 'entry',
      p_description: designationData.description || null,
      p_is_active: designationData.isActive !== undefined ? designationData.isActive : true,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.createDesignation failed');
      throw error;
    }

    const newId = data;
    return this.findDesignationById(newId);
  }

  async updateDesignation(designationId, updates) {
    const { error } = await supabase.rpc('sp_designations_update', {
      p_id: designationId,
      p_name: updates.name || null,
      p_code: updates.code !== undefined ? updates.code : null,
      p_level: updates.level !== undefined ? updates.level : null,
      p_level_band: updates.levelBand !== undefined ? updates.levelBand : null,
      p_description: updates.description !== undefined ? updates.description : null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.updateDesignation failed');
      throw error;
    }

    return this.findDesignationById(designationId);
  }

  async deleteDesignation(designationId) {
    const { error } = await supabase.rpc('sp_designations_delete', {
      p_id: designationId,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.deleteDesignation failed');
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  SPECIALIZATIONS — READ
  // ─────────────────────────────────────────────────────────────

  async findSpecializationById(specializationId) {
    const { data, error } = await supabase.rpc('udf_get_specializations', {
      p_id: specializationId,
      p_is_active: null,
      p_sort_column: 'id',
      p_sort_direction: 'ASC',
      p_filter_category: null,
      p_filter_is_active: null,
      p_filter_is_deleted: false,
      p_search_term: null,
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.findSpecializationById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  async getSpecializations(options = {}) {
    const { data, error } = await supabase.rpc('udf_get_specializations', {
      p_id: null,
      p_is_active: null,
      p_sort_column: options.sortColumn || 'id',
      p_sort_direction: options.sortDirection || 'ASC',
      p_filter_category: options.filterCategory || null,
      p_filter_is_active: options.filterIsActive !== undefined ? options.filterIsActive : null,
      p_filter_is_deleted: options.filterIsDeleted !== undefined ? options.filterIsDeleted : false,
      p_search_term: options.searchTerm || null,
      p_page_index: options.pageIndex || 1,
      p_page_size: options.pageSize || 20,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.getSpecializations failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  SPECIALIZATIONS — WRITE
  // ─────────────────────────────────────────────────────────────

  async createSpecialization(specializationData) {
    const { data, error } = await supabase.rpc('sp_specializations_insert', {
      p_name: specializationData.name,
      p_category: specializationData.category || 'technology',
      p_description: specializationData.description || null,
      p_icon_url: specializationData.iconUrl || null,
      p_is_active: specializationData.isActive !== undefined ? specializationData.isActive : true,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.createSpecialization failed');
      throw error;
    }

    const newId = data;
    return this.findSpecializationById(newId);
  }

  async updateSpecialization(specializationId, updates) {
    const { error } = await supabase.rpc('sp_specializations_update', {
      p_id: specializationId,
      p_name: updates.name || null,
      p_category: updates.category !== undefined ? updates.category : null,
      p_description: updates.description !== undefined ? updates.description : null,
      p_icon_url: updates.iconUrl !== undefined ? updates.iconUrl : null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.updateSpecialization failed');
      throw error;
    }

    return this.findSpecializationById(specializationId);
  }

  async deleteSpecialization(specializationId) {
    const { error } = await supabase.rpc('sp_specializations_delete', {
      p_id: specializationId,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.deleteSpecialization failed');
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  LEARNING GOALS — READ
  // ─────────────────────────────────────────────────────────────

  async findLearningGoalById(learningGoalId) {
    const { data, error } = await supabase.rpc('udf_get_learning_goals', {
      p_id: learningGoalId,
      p_is_active: null,
      p_sort_column: 'display_order',
      p_sort_direction: 'ASC',
      p_filter_is_active: null,
      p_filter_is_deleted: false,
      p_search_term: null,
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.findLearningGoalById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  async getLearningGoals(options = {}) {
    const { data, error } = await supabase.rpc('udf_get_learning_goals', {
      p_id: null,
      p_is_active: null,
      p_sort_column: options.sortColumn || 'display_order',
      p_sort_direction: options.sortDirection || 'ASC',
      p_filter_is_active: options.filterIsActive !== undefined ? options.filterIsActive : null,
      p_filter_is_deleted: options.filterIsDeleted !== undefined ? options.filterIsDeleted : false,
      p_search_term: options.searchTerm || null,
      p_page_index: options.pageIndex || 1,
      p_page_size: options.pageSize || 20,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.getLearningGoals failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  LEARNING GOALS — WRITE
  // ─────────────────────────────────────────────────────────────

  async createLearningGoal(learningGoalData) {
    const { data, error } = await supabase.rpc('sp_learning_goals_insert', {
      p_name: learningGoalData.name,
      p_description: learningGoalData.description || null,
      p_icon_url: learningGoalData.iconUrl || null,
      p_display_order: learningGoalData.displayOrder || 0,
      p_is_active: learningGoalData.isActive !== undefined ? learningGoalData.isActive : true,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.createLearningGoal failed');
      throw error;
    }

    const newId = data;
    return this.findLearningGoalById(newId);
  }

  async updateLearningGoal(learningGoalId, updates) {
    const { error } = await supabase.rpc('sp_learning_goals_update', {
      p_id: learningGoalId,
      p_name: updates.name || null,
      p_description: updates.description !== undefined ? updates.description : null,
      p_icon_url: updates.iconUrl !== undefined ? updates.iconUrl : null,
      p_display_order: updates.displayOrder !== undefined ? updates.displayOrder : null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.updateLearningGoal failed');
      throw error;
    }

    return this.findLearningGoalById(learningGoalId);
  }

  async deleteLearningGoal(learningGoalId) {
    const { error } = await supabase.rpc('sp_learning_goals_delete', {
      p_id: learningGoalId,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.deleteLearningGoal failed');
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  SOCIAL MEDIAS — READ
  // ─────────────────────────────────────────────────────────────

  async findSocialMediaById(socialMediaId) {
    const { data, error } = await supabase.rpc('udf_get_social_medias', {
      p_id: socialMediaId,
      p_is_active: null,
      p_sort_column: 'display_order',
      p_sort_direction: 'ASC',
      p_filter_platform_type: null,
      p_filter_code: null,
      p_filter_is_active: null,
      p_filter_is_deleted: false,
      p_search_term: null,
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.findSocialMediaById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  async getSocialMedias(options = {}) {
    const { data, error } = await supabase.rpc('udf_get_social_medias', {
      p_id: null,
      p_is_active: null,
      p_sort_column: options.sortColumn || 'display_order',
      p_sort_direction: options.sortDirection || 'ASC',
      p_filter_platform_type: options.filterPlatformType || null,
      p_filter_code: options.filterCode || null,
      p_filter_is_active: options.filterIsActive !== undefined ? options.filterIsActive : null,
      p_filter_is_deleted: options.filterIsDeleted !== undefined ? options.filterIsDeleted : false,
      p_search_term: options.searchTerm || null,
      p_page_index: options.pageIndex || 1,
      p_page_size: options.pageSize || 20,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.getSocialMedias failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  SOCIAL MEDIAS — WRITE
  // ─────────────────────────────────────────────────────────────

  async createSocialMedia(socialMediaData) {
    const { data, error } = await supabase.rpc('sp_social_medias_insert', {
      p_name: socialMediaData.name,
      p_code: socialMediaData.code || null,
      p_base_url: socialMediaData.baseUrl || null,
      p_icon_url: socialMediaData.iconUrl || null,
      p_placeholder: socialMediaData.placeholder || null,
      p_platform_type: socialMediaData.platformType || 'social',
      p_display_order: socialMediaData.displayOrder || 0,
      p_is_active: socialMediaData.isActive !== undefined ? socialMediaData.isActive : true,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.createSocialMedia failed');
      throw error;
    }

    const newId = data;
    return this.findSocialMediaById(newId);
  }

  async updateSocialMedia(socialMediaId, updates) {
    const { error } = await supabase.rpc('sp_social_medias_update', {
      p_id: socialMediaId,
      p_name: updates.name || null,
      p_code: updates.code !== undefined ? updates.code : null,
      p_base_url: updates.baseUrl !== undefined ? updates.baseUrl : null,
      p_icon_url: updates.iconUrl !== undefined ? updates.iconUrl : null,
      p_placeholder: updates.placeholder !== undefined ? updates.placeholder : null,
      p_platform_type: updates.platformType !== undefined ? updates.platformType : null,
      p_display_order: updates.displayOrder !== undefined ? updates.displayOrder : null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.updateSocialMedia failed');
      throw error;
    }

    return this.findSocialMediaById(socialMediaId);
  }

  async deleteSocialMedia(socialMediaId) {
    const { error } = await supabase.rpc('sp_social_medias_delete', {
      p_id: socialMediaId,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.deleteSocialMedia failed');
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  CATEGORIES — READ
  // ─────────────────────────────────────────────────────────────

  async findCategoryById(categoryId) {
    const { data, error } = await supabase.rpc('udf_get_categories', {
      p_id: categoryId,
      p_is_active: null,
      p_sort_column: 'display_order',
      p_sort_direction: 'ASC',
      p_filter_is_new: null,
      p_filter_is_active: null,
      p_filter_is_deleted: false,
      p_search_term: null,
      p_page_index: 0,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.findCategoryById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  async getCategories(options = {}) {
    const { data, error } = await supabase.rpc('udf_get_categories', {
      p_id: null,
      p_is_active: null,
      p_sort_column: options.sortColumn || 'display_order',
      p_sort_direction: options.sortDirection || 'ASC',
      p_filter_is_new: options.filterIsNew !== undefined ? options.filterIsNew : null,
      p_filter_is_active: options.filterIsActive !== undefined ? options.filterIsActive : null,
      p_filter_is_deleted: options.filterIsDeleted !== undefined ? options.filterIsDeleted : false,
      p_search_term: options.searchTerm || null,
      p_page_index: options.pageIndex || 0,
      p_page_size: options.pageSize || 50,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.getCategories failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  CATEGORIES — WRITE
  // ─────────────────────────────────────────────────────────────

  async createCategory(categoryData) {
    const { data, error } = await supabase.rpc('sp_categories_insert', {
      p_code: categoryData.code,
      p_slug: categoryData.slug,
      p_display_order: categoryData.displayOrder || 0,
      p_icon_url: categoryData.iconUrl || null,
      p_image_url: categoryData.imageUrl || null,
      p_is_new: categoryData.isNew || false,
      p_new_until: categoryData.newUntil || null,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.createCategory failed');
      throw error;
    }

    const newId = data;
    return this.findCategoryById(newId);
  }

  async updateCategory(categoryId, updates) {
    const { error } = await supabase.rpc('sp_categories_update', {
      p_id: categoryId,
      p_code: updates.code !== undefined ? updates.code : null,
      p_slug: updates.slug !== undefined ? updates.slug : null,
      p_display_order: updates.displayOrder !== undefined ? updates.displayOrder : null,
      p_icon_url: updates.iconUrl !== undefined ? updates.iconUrl : null,
      p_image_url: updates.imageUrl !== undefined ? updates.imageUrl : null,
      p_is_new: updates.isNew !== undefined ? updates.isNew : null,
      p_new_until: updates.newUntil !== undefined ? updates.newUntil : null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.updateCategory failed');
      throw error;
    }

    return this.findCategoryById(categoryId);
  }

  async deleteCategory(categoryId) {
    const { error } = await supabase.rpc('sp_categories_delete', {
      p_id: categoryId,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.deleteCategory failed');
      throw error;
    }
  }

  async restoreCategory(categoryId, restoreTranslations = false) {
    const { error } = await supabase.rpc('sp_categories_restore', {
      p_id: categoryId,
      p_restore_translations: restoreTranslations,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.restoreCategory failed');
      throw error;
    }

    return this.findCategoryById(categoryId);
  }

  // ─────────────────────────────────────────────────────────────
  //  SUB CATEGORIES — READ
  // ─────────────────────────────────────────────────────────────

  async findSubCategoryById(subCategoryId) {
    const { data, error } = await supabase.rpc('udf_get_sub_categories', {
      p_id: subCategoryId,
      p_is_active: null,
      p_category_is_active: null,
      p_filter_category_id: null,
      p_filter_is_new: null,
      p_filter_is_active: null,
      p_filter_is_deleted: false,
      p_search_term: null,
      p_sort_table: 'sub_category',
      p_sort_column: 'display_order',
      p_sort_direction: 'ASC',
      p_page_index: 0,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.findSubCategoryById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  async getSubCategories(options = {}) {
    const { data, error } = await supabase.rpc('udf_get_sub_categories', {
      p_id: null,
      p_is_active: null,
      p_category_is_active: null,
      p_filter_category_id: options.filterCategoryId || null,
      p_filter_is_new: options.filterIsNew !== undefined ? options.filterIsNew : null,
      p_filter_is_active: options.filterIsActive !== undefined ? options.filterIsActive : null,
      p_filter_is_deleted: options.filterIsDeleted !== undefined ? options.filterIsDeleted : false,
      p_search_term: options.searchTerm || null,
      p_sort_table: options.sortTable || 'sub_category',
      p_sort_column: options.sortColumn || 'display_order',
      p_sort_direction: options.sortDirection || 'ASC',
      p_page_index: options.pageIndex || 0,
      p_page_size: options.pageSize || 50,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.getSubCategories failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  SUB CATEGORIES — WRITE
  // ─────────────────────────────────────────────────────────────

  async createSubCategory(subCategoryData) {
    const { data, error } = await supabase.rpc('sp_sub_categories_insert', {
      p_category_id: subCategoryData.categoryId,
      p_code: subCategoryData.code,
      p_slug: subCategoryData.slug,
      p_display_order: subCategoryData.displayOrder || 0,
      p_is_active: subCategoryData.isActive !== undefined ? subCategoryData.isActive : true,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.createSubCategory failed');
      throw error;
    }

    const newId = data;
    return this.findSubCategoryById(newId);
  }

  async updateSubCategory(subCategoryId, updates) {
    const { error } = await supabase.rpc('sp_sub_categories_update', {
      p_id: subCategoryId,
      p_category_id: updates.categoryId !== undefined ? updates.categoryId : null,
      p_code: updates.code !== undefined ? updates.code : null,
      p_slug: updates.slug !== undefined ? updates.slug : null,
      p_display_order: updates.displayOrder !== undefined ? updates.displayOrder : null,
      p_icon_url: updates.iconUrl !== undefined ? updates.iconUrl : null,
      p_image_url: updates.imageUrl !== undefined ? updates.imageUrl : null,
      p_is_new: updates.isNew !== undefined ? updates.isNew : null,
      p_new_until: updates.newUntil !== undefined ? updates.newUntil : null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.updateSubCategory failed');
      throw error;
    }

    return this.findSubCategoryById(subCategoryId);
  }

  async deleteSubCategory(subCategoryId) {
    const { error } = await supabase.rpc('sp_sub_categories_delete', {
      p_id: subCategoryId,
    });

    if (error) {
      logger.error({ error }, 'MasterDataExtendedRepository.deleteSubCategory failed');
      throw error;
    }
  }
}

module.exports = new MasterDataExtendedRepository();
