/**
 * ═══════════════════════════════════════════════════════════════
 * MASTER DATA EXTENDED SERVICE — Business Logic Layer
 * ═══════════════════════════════════════════════════════════════
 * Handles Skills, Languages, Education Levels, Document Types,
 * Documents, Designations, Specializations, Learning Goals,
 * Social Medias, Categories, and Sub Categories business rules.
 * ═══════════════════════════════════════════════════════════════
 */

const masterDataExtendedRepository = require('../repositories/masterDataExtended.repository');
const logger = require('../config/logger');
const { BadRequestError, NotFoundError } = require('../utils/errors');

class MasterDataExtendedService {
  // ========== SKILLS ==========

  async getSkills(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;

      const repoOptions = {
        filterCategory: filters.category || null,
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        filterIsDeleted: filters.isDeleted !== undefined ? filters.isDeleted : false,
        searchTerm: search || null,
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };

      return await masterDataExtendedRepository.getSkills(repoOptions);
    } catch (error) {
      logger.error('Error fetching skills:', error);
      throw error;
    }
  }

  async getSkillById(skillId) {
    try {
      if (!skillId) throw new BadRequestError('Skill ID is required');

      const skill = await masterDataExtendedRepository.findSkillById(skillId);
      if (!skill) throw new NotFoundError(`Skill with ID ${skillId} not found`);

      return skill;
    } catch (error) {
      logger.error(`Error fetching skill ${skillId}:`, error);
      throw error;
    }
  }

  async createSkill(skillData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!skillData.name) throw new BadRequestError('Skill name is required');

      const created = await masterDataExtendedRepository.createSkill(skillData);
      logger.info(`Skill created: ${skillData.name}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating skill:', error);
      throw error;
    }
  }

  async updateSkill(skillId, updates, actingUserId) {
    try {
      if (!skillId) throw new BadRequestError('Skill ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await masterDataExtendedRepository.findSkillById(skillId);
      if (!existing) throw new NotFoundError(`Skill with ID ${skillId} not found`);

      const updated = await masterDataExtendedRepository.updateSkill(skillId, updates);
      logger.info(`Skill updated: ${skillId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating skill ${skillId}:`, error);
      throw error;
    }
  }

  async deleteSkill(skillId, actingUserId) {
    try {
      if (!skillId) throw new BadRequestError('Skill ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await masterDataExtendedRepository.findSkillById(skillId);
      if (!existing) throw new NotFoundError(`Skill with ID ${skillId} not found`);

      await masterDataExtendedRepository.deleteSkill(skillId);
      logger.info(`Skill deleted: ${skillId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting skill ${skillId}:`, error);
      throw error;
    }
  }

  // ========== LANGUAGES ==========

  async getLanguages(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;

      const repoOptions = {
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        filterIsDeleted: filters.isDeleted !== undefined ? filters.isDeleted : false,
        searchTerm: search || null,
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };

      return await masterDataExtendedRepository.getLanguages(repoOptions);
    } catch (error) {
      logger.error('Error fetching languages:', error);
      throw error;
    }
  }

  async getLanguageById(languageId) {
    try {
      if (!languageId) throw new BadRequestError('Language ID is required');

      const language = await masterDataExtendedRepository.findLanguageById(languageId);
      if (!language) throw new NotFoundError(`Language with ID ${languageId} not found`);

      return language;
    } catch (error) {
      logger.error(`Error fetching language ${languageId}:`, error);
      throw error;
    }
  }

  async createLanguage(languageData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!languageData.name) throw new BadRequestError('Language name is required');

      const created = await masterDataExtendedRepository.createLanguage(languageData);
      logger.info(`Language created: ${languageData.name}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating language:', error);
      throw error;
    }
  }

  async updateLanguage(languageId, updates, actingUserId) {
    try {
      if (!languageId) throw new BadRequestError('Language ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await masterDataExtendedRepository.findLanguageById(languageId);
      if (!existing) throw new NotFoundError(`Language with ID ${languageId} not found`);

      const updated = await masterDataExtendedRepository.updateLanguage(languageId, updates);
      logger.info(`Language updated: ${languageId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating language ${languageId}:`, error);
      throw error;
    }
  }

  async deleteLanguage(languageId, actingUserId) {
    try {
      if (!languageId) throw new BadRequestError('Language ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await masterDataExtendedRepository.findLanguageById(languageId);
      if (!existing) throw new NotFoundError(`Language with ID ${languageId} not found`);

      await masterDataExtendedRepository.deleteLanguage(languageId);
      logger.info(`Language deleted: ${languageId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting language ${languageId}:`, error);
      throw error;
    }
  }

  // ========== EDUCATION LEVELS ==========

  async getEducationLevels(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;

      const repoOptions = {
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        filterIsDeleted: filters.isDeleted !== undefined ? filters.isDeleted : false,
        searchTerm: search || null,
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };

      return await masterDataExtendedRepository.getEducationLevels(repoOptions);
    } catch (error) {
      logger.error('Error fetching education levels:', error);
      throw error;
    }
  }

  async getEducationLevelById(educationLevelId) {
    try {
      if (!educationLevelId) throw new BadRequestError('Education Level ID is required');

      const educationLevel = await masterDataExtendedRepository.findEducationLevelById(educationLevelId);
      if (!educationLevel) throw new NotFoundError(`Education Level with ID ${educationLevelId} not found`);

      return educationLevel;
    } catch (error) {
      logger.error(`Error fetching education level ${educationLevelId}:`, error);
      throw error;
    }
  }

  async createEducationLevel(educationLevelData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!educationLevelData.name) throw new BadRequestError('Education Level name is required');
      if (educationLevelData.levelOrder === undefined) throw new BadRequestError('Level order is required');

      const created = await masterDataExtendedRepository.createEducationLevel(educationLevelData);
      logger.info(`Education Level created: ${educationLevelData.name}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating education level:', error);
      throw error;
    }
  }

  async updateEducationLevel(educationLevelId, updates, actingUserId) {
    try {
      if (!educationLevelId) throw new BadRequestError('Education Level ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await masterDataExtendedRepository.findEducationLevelById(educationLevelId);
      if (!existing) throw new NotFoundError(`Education Level with ID ${educationLevelId} not found`);

      const updated = await masterDataExtendedRepository.updateEducationLevel(educationLevelId, updates);
      logger.info(`Education Level updated: ${educationLevelId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating education level ${educationLevelId}:`, error);
      throw error;
    }
  }

  async deleteEducationLevel(educationLevelId, actingUserId) {
    try {
      if (!educationLevelId) throw new BadRequestError('Education Level ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await masterDataExtendedRepository.findEducationLevelById(educationLevelId);
      if (!existing) throw new NotFoundError(`Education Level with ID ${educationLevelId} not found`);

      await masterDataExtendedRepository.deleteEducationLevel(educationLevelId);
      logger.info(`Education Level deleted: ${educationLevelId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting education level ${educationLevelId}:`, error);
      throw error;
    }
  }

  // ========== DOCUMENT TYPES ==========

  async getDocumentTypes(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;

      const repoOptions = {
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        filterIsDeleted: filters.isDeleted !== undefined ? filters.isDeleted : false,
        searchTerm: search || null,
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };

      return await masterDataExtendedRepository.getDocumentTypes(repoOptions);
    } catch (error) {
      logger.error('Error fetching document types:', error);
      throw error;
    }
  }

  async getDocumentTypeById(documentTypeId) {
    try {
      if (!documentTypeId) throw new BadRequestError('Document Type ID is required');

      const documentType = await masterDataExtendedRepository.findDocumentTypeById(documentTypeId);
      if (!documentType) throw new NotFoundError(`Document Type with ID ${documentTypeId} not found`);

      return documentType;
    } catch (error) {
      logger.error(`Error fetching document type ${documentTypeId}:`, error);
      throw error;
    }
  }

  async createDocumentType(documentTypeData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!documentTypeData.name) throw new BadRequestError('Document Type name is required');

      const created = await masterDataExtendedRepository.createDocumentType(documentTypeData);
      logger.info(`Document Type created: ${documentTypeData.name}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating document type:', error);
      throw error;
    }
  }

  async updateDocumentType(documentTypeId, updates, actingUserId) {
    try {
      if (!documentTypeId) throw new BadRequestError('Document Type ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await masterDataExtendedRepository.findDocumentTypeById(documentTypeId);
      if (!existing) throw new NotFoundError(`Document Type with ID ${documentTypeId} not found`);

      const updated = await masterDataExtendedRepository.updateDocumentType(documentTypeId, updates);
      logger.info(`Document Type updated: ${documentTypeId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating document type ${documentTypeId}:`, error);
      throw error;
    }
  }

  async deleteDocumentType(documentTypeId, actingUserId) {
    try {
      if (!documentTypeId) throw new BadRequestError('Document Type ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await masterDataExtendedRepository.findDocumentTypeById(documentTypeId);
      if (!existing) throw new NotFoundError(`Document Type with ID ${documentTypeId} not found`);

      await masterDataExtendedRepository.deleteDocumentType(documentTypeId);
      logger.info(`Document Type deleted: ${documentTypeId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting document type ${documentTypeId}:`, error);
      throw error;
    }
  }

  // ========== DOCUMENTS ==========

  async getDocuments(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;

      const repoOptions = {
        filterDocumentTypeId: filters.documentTypeId || null,
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        filterIsDeleted: filters.isDeleted !== undefined ? filters.isDeleted : false,
        searchTerm: search || null,
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };

      return await masterDataExtendedRepository.getDocuments(repoOptions);
    } catch (error) {
      logger.error('Error fetching documents:', error);
      throw error;
    }
  }

  async getDocumentById(documentId) {
    try {
      if (!documentId) throw new BadRequestError('Document ID is required');

      const document = await masterDataExtendedRepository.findDocumentById(documentId);
      if (!document) throw new NotFoundError(`Document with ID ${documentId} not found`);

      return document;
    } catch (error) {
      logger.error(`Error fetching document ${documentId}:`, error);
      throw error;
    }
  }

  async createDocument(documentData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!documentData.documentTypeId) throw new BadRequestError('Document Type ID is required');
      if (!documentData.name) throw new BadRequestError('Document name is required');

      // Validate document type exists
      const documentType = await masterDataExtendedRepository.findDocumentTypeById(documentData.documentTypeId);
      if (!documentType) throw new NotFoundError(`Document Type with ID ${documentData.documentTypeId} not found`);

      const created = await masterDataExtendedRepository.createDocument(documentData);
      logger.info(`Document created: ${documentData.name}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating document:', error);
      throw error;
    }
  }

  async updateDocument(documentId, updates, actingUserId) {
    try {
      if (!documentId) throw new BadRequestError('Document ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await masterDataExtendedRepository.findDocumentById(documentId);
      if (!existing) throw new NotFoundError(`Document with ID ${documentId} not found`);

      // If changing document type, validate it exists
      if (updates.documentTypeId) {
        const documentType = await masterDataExtendedRepository.findDocumentTypeById(updates.documentTypeId);
        if (!documentType) throw new NotFoundError(`Document Type with ID ${updates.documentTypeId} not found`);
      }

      const updated = await masterDataExtendedRepository.updateDocument(documentId, updates);
      logger.info(`Document updated: ${documentId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating document ${documentId}:`, error);
      throw error;
    }
  }

  async deleteDocument(documentId, actingUserId) {
    try {
      if (!documentId) throw new BadRequestError('Document ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await masterDataExtendedRepository.findDocumentById(documentId);
      if (!existing) throw new NotFoundError(`Document with ID ${documentId} not found`);

      await masterDataExtendedRepository.deleteDocument(documentId);
      logger.info(`Document deleted: ${documentId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting document ${documentId}:`, error);
      throw error;
    }
  }

  // ========== DESIGNATIONS ==========

  async getDesignations(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;

      const repoOptions = {
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        filterIsDeleted: filters.isDeleted !== undefined ? filters.isDeleted : false,
        searchTerm: search || null,
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };

      return await masterDataExtendedRepository.getDesignations(repoOptions);
    } catch (error) {
      logger.error('Error fetching designations:', error);
      throw error;
    }
  }

  async getDesignationById(designationId) {
    try {
      if (!designationId) throw new BadRequestError('Designation ID is required');

      const designation = await masterDataExtendedRepository.findDesignationById(designationId);
      if (!designation) throw new NotFoundError(`Designation with ID ${designationId} not found`);

      return designation;
    } catch (error) {
      logger.error(`Error fetching designation ${designationId}:`, error);
      throw error;
    }
  }

  async createDesignation(designationData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!designationData.name) throw new BadRequestError('Designation name is required');

      const created = await masterDataExtendedRepository.createDesignation(designationData);
      logger.info(`Designation created: ${designationData.name}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating designation:', error);
      throw error;
    }
  }

  async updateDesignation(designationId, updates, actingUserId) {
    try {
      if (!designationId) throw new BadRequestError('Designation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await masterDataExtendedRepository.findDesignationById(designationId);
      if (!existing) throw new NotFoundError(`Designation with ID ${designationId} not found`);

      const updated = await masterDataExtendedRepository.updateDesignation(designationId, updates);
      logger.info(`Designation updated: ${designationId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating designation ${designationId}:`, error);
      throw error;
    }
  }

  async deleteDesignation(designationId, actingUserId) {
    try {
      if (!designationId) throw new BadRequestError('Designation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await masterDataExtendedRepository.findDesignationById(designationId);
      if (!existing) throw new NotFoundError(`Designation with ID ${designationId} not found`);

      await masterDataExtendedRepository.deleteDesignation(designationId);
      logger.info(`Designation deleted: ${designationId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting designation ${designationId}:`, error);
      throw error;
    }
  }

  // ========== SPECIALIZATIONS ==========

  async getSpecializations(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;

      const repoOptions = {
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        filterIsDeleted: filters.isDeleted !== undefined ? filters.isDeleted : false,
        searchTerm: search || null,
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };

      return await masterDataExtendedRepository.getSpecializations(repoOptions);
    } catch (error) {
      logger.error('Error fetching specializations:', error);
      throw error;
    }
  }

  async getSpecializationById(specializationId) {
    try {
      if (!specializationId) throw new BadRequestError('Specialization ID is required');

      const specialization = await masterDataExtendedRepository.findSpecializationById(specializationId);
      if (!specialization) throw new NotFoundError(`Specialization with ID ${specializationId} not found`);

      return specialization;
    } catch (error) {
      logger.error(`Error fetching specialization ${specializationId}:`, error);
      throw error;
    }
  }

  async createSpecialization(specializationData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!specializationData.name) throw new BadRequestError('Specialization name is required');

      const created = await masterDataExtendedRepository.createSpecialization(specializationData);
      logger.info(`Specialization created: ${specializationData.name}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating specialization:', error);
      throw error;
    }
  }

  async updateSpecialization(specializationId, updates, actingUserId) {
    try {
      if (!specializationId) throw new BadRequestError('Specialization ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await masterDataExtendedRepository.findSpecializationById(specializationId);
      if (!existing) throw new NotFoundError(`Specialization with ID ${specializationId} not found`);

      const updated = await masterDataExtendedRepository.updateSpecialization(specializationId, updates);
      logger.info(`Specialization updated: ${specializationId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating specialization ${specializationId}:`, error);
      throw error;
    }
  }

  async deleteSpecialization(specializationId, actingUserId) {
    try {
      if (!specializationId) throw new BadRequestError('Specialization ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await masterDataExtendedRepository.findSpecializationById(specializationId);
      if (!existing) throw new NotFoundError(`Specialization with ID ${specializationId} not found`);

      await masterDataExtendedRepository.deleteSpecialization(specializationId);
      logger.info(`Specialization deleted: ${specializationId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting specialization ${specializationId}:`, error);
      throw error;
    }
  }

  // ========== LEARNING GOALS ==========

  async getLearningGoals(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;

      const repoOptions = {
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        filterIsDeleted: filters.isDeleted !== undefined ? filters.isDeleted : false,
        searchTerm: search || null,
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };

      return await masterDataExtendedRepository.getLearningGoals(repoOptions);
    } catch (error) {
      logger.error('Error fetching learning goals:', error);
      throw error;
    }
  }

  async getLearningGoalById(learningGoalId) {
    try {
      if (!learningGoalId) throw new BadRequestError('Learning Goal ID is required');

      const learningGoal = await masterDataExtendedRepository.findLearningGoalById(learningGoalId);
      if (!learningGoal) throw new NotFoundError(`Learning Goal with ID ${learningGoalId} not found`);

      return learningGoal;
    } catch (error) {
      logger.error(`Error fetching learning goal ${learningGoalId}:`, error);
      throw error;
    }
  }

  async createLearningGoal(learningGoalData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!learningGoalData.name) throw new BadRequestError('Learning Goal name is required');

      const created = await masterDataExtendedRepository.createLearningGoal(learningGoalData);
      logger.info(`Learning Goal created: ${learningGoalData.name}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating learning goal:', error);
      throw error;
    }
  }

  async updateLearningGoal(learningGoalId, updates, actingUserId) {
    try {
      if (!learningGoalId) throw new BadRequestError('Learning Goal ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await masterDataExtendedRepository.findLearningGoalById(learningGoalId);
      if (!existing) throw new NotFoundError(`Learning Goal with ID ${learningGoalId} not found`);

      const updated = await masterDataExtendedRepository.updateLearningGoal(learningGoalId, updates);
      logger.info(`Learning Goal updated: ${learningGoalId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating learning goal ${learningGoalId}:`, error);
      throw error;
    }
  }

  async deleteLearningGoal(learningGoalId, actingUserId) {
    try {
      if (!learningGoalId) throw new BadRequestError('Learning Goal ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await masterDataExtendedRepository.findLearningGoalById(learningGoalId);
      if (!existing) throw new NotFoundError(`Learning Goal with ID ${learningGoalId} not found`);

      await masterDataExtendedRepository.deleteLearningGoal(learningGoalId);
      logger.info(`Learning Goal deleted: ${learningGoalId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting learning goal ${learningGoalId}:`, error);
      throw error;
    }
  }

  // ========== SOCIAL MEDIAS ==========

  async getSocialMedias(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;

      const repoOptions = {
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        filterIsDeleted: filters.isDeleted !== undefined ? filters.isDeleted : false,
        searchTerm: search || null,
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };

      return await masterDataExtendedRepository.getSocialMedias(repoOptions);
    } catch (error) {
      logger.error('Error fetching social medias:', error);
      throw error;
    }
  }

  async getSocialMediaById(socialMediaId) {
    try {
      if (!socialMediaId) throw new BadRequestError('Social Media ID is required');

      const socialMedia = await masterDataExtendedRepository.findSocialMediaById(socialMediaId);
      if (!socialMedia) throw new NotFoundError(`Social Media with ID ${socialMediaId} not found`);

      return socialMedia;
    } catch (error) {
      logger.error(`Error fetching social media ${socialMediaId}:`, error);
      throw error;
    }
  }

  async createSocialMedia(socialMediaData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!socialMediaData.name) throw new BadRequestError('Social Media name is required');
      if (!socialMediaData.code) throw new BadRequestError('Social Media code is required');

      const created = await masterDataExtendedRepository.createSocialMedia(socialMediaData);
      logger.info(`Social Media created: ${socialMediaData.name}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating social media:', error);
      throw error;
    }
  }

  async updateSocialMedia(socialMediaId, updates, actingUserId) {
    try {
      if (!socialMediaId) throw new BadRequestError('Social Media ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await masterDataExtendedRepository.findSocialMediaById(socialMediaId);
      if (!existing) throw new NotFoundError(`Social Media with ID ${socialMediaId} not found`);

      const updated = await masterDataExtendedRepository.updateSocialMedia(socialMediaId, updates);
      logger.info(`Social Media updated: ${socialMediaId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating social media ${socialMediaId}:`, error);
      throw error;
    }
  }

  async deleteSocialMedia(socialMediaId, actingUserId) {
    try {
      if (!socialMediaId) throw new BadRequestError('Social Media ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await masterDataExtendedRepository.findSocialMediaById(socialMediaId);
      if (!existing) throw new NotFoundError(`Social Media with ID ${socialMediaId} not found`);

      await masterDataExtendedRepository.deleteSocialMedia(socialMediaId);
      logger.info(`Social Media deleted: ${socialMediaId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting social media ${socialMediaId}:`, error);
      throw error;
    }
  }

  // ========== CATEGORIES ==========

  async getCategories(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;

      const repoOptions = {
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        filterIsDeleted: filters.isDeleted !== undefined ? filters.isDeleted : false,
        searchTerm: search || null,
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };

      return await masterDataExtendedRepository.getCategories(repoOptions);
    } catch (error) {
      logger.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getCategoryById(categoryId) {
    try {
      if (!categoryId) throw new BadRequestError('Category ID is required');

      const category = await masterDataExtendedRepository.findCategoryById(categoryId);
      if (!category) throw new NotFoundError(`Category with ID ${categoryId} not found`);

      return category;
    } catch (error) {
      logger.error(`Error fetching category ${categoryId}:`, error);
      throw error;
    }
  }

  async createCategory(categoryData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!categoryData.code) throw new BadRequestError('Category code is required');

      const created = await masterDataExtendedRepository.createCategory(categoryData);
      logger.info(`Category created: ${categoryData.code}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating category:', error);
      throw error;
    }
  }

  async updateCategory(categoryId, updates, actingUserId) {
    try {
      if (!categoryId) throw new BadRequestError('Category ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await masterDataExtendedRepository.findCategoryById(categoryId);
      if (!existing) throw new NotFoundError(`Category with ID ${categoryId} not found`);

      const updated = await masterDataExtendedRepository.updateCategory(categoryId, updates);
      logger.info(`Category updated: ${categoryId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating category ${categoryId}:`, error);
      throw error;
    }
  }

  async deleteCategory(categoryId, actingUserId) {
    try {
      if (!categoryId) throw new BadRequestError('Category ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await masterDataExtendedRepository.findCategoryById(categoryId);
      if (!existing) throw new NotFoundError(`Category with ID ${categoryId} not found`);

      await masterDataExtendedRepository.deleteCategory(categoryId);
      logger.info(`Category deleted: ${categoryId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting category ${categoryId}:`, error);
      throw error;
    }
  }

  // ========== SUB CATEGORIES ==========

  async getSubCategories(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;

      const repoOptions = {
        filterCategoryId: filters.categoryId || null,
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        filterIsDeleted: filters.isDeleted !== undefined ? filters.isDeleted : false,
        searchTerm: search || null,
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };

      return await masterDataExtendedRepository.getSubCategories(repoOptions);
    } catch (error) {
      logger.error('Error fetching sub categories:', error);
      throw error;
    }
  }

  async getSubCategoryById(subCategoryId) {
    try {
      if (!subCategoryId) throw new BadRequestError('Sub Category ID is required');

      const subCategory = await masterDataExtendedRepository.findSubCategoryById(subCategoryId);
      if (!subCategory) throw new NotFoundError(`Sub Category with ID ${subCategoryId} not found`);

      return subCategory;
    } catch (error) {
      logger.error(`Error fetching sub category ${subCategoryId}:`, error);
      throw error;
    }
  }

  async createSubCategory(subCategoryData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!subCategoryData.categoryId) throw new BadRequestError('Category ID is required');
      if (!subCategoryData.code) throw new BadRequestError('Sub Category code is required');

      // Validate category exists
      const category = await masterDataExtendedRepository.findCategoryById(subCategoryData.categoryId);
      if (!category) throw new NotFoundError(`Category with ID ${subCategoryData.categoryId} not found`);

      const created = await masterDataExtendedRepository.createSubCategory(subCategoryData);
      logger.info(`Sub Category created: ${subCategoryData.code}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating sub category:', error);
      throw error;
    }
  }

  async updateSubCategory(subCategoryId, updates, actingUserId) {
    try {
      if (!subCategoryId) throw new BadRequestError('Sub Category ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await masterDataExtendedRepository.findSubCategoryById(subCategoryId);
      if (!existing) throw new NotFoundError(`Sub Category with ID ${subCategoryId} not found`);

      // If changing category, validate it exists
      if (updates.categoryId) {
        const category = await masterDataExtendedRepository.findCategoryById(updates.categoryId);
        if (!category) throw new NotFoundError(`Category with ID ${updates.categoryId} not found`);
      }

      const updated = await masterDataExtendedRepository.updateSubCategory(subCategoryId, updates);
      logger.info(`Sub Category updated: ${subCategoryId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating sub category ${subCategoryId}:`, error);
      throw error;
    }
  }

  async deleteSubCategory(subCategoryId, actingUserId) {
    try {
      if (!subCategoryId) throw new BadRequestError('Sub Category ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await masterDataExtendedRepository.findSubCategoryById(subCategoryId);
      if (!existing) throw new NotFoundError(`Sub Category with ID ${subCategoryId} not found`);

      await masterDataExtendedRepository.deleteSubCategory(subCategoryId);
      logger.info(`Sub Category deleted: ${subCategoryId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting sub category ${subCategoryId}:`, error);
      throw error;
    }
  }
}

module.exports = new MasterDataExtendedService();
