const assessmentManagementRepository = require('../repositories/assessmentManagement.repository');
const bunnyService = require('./bunny.service');
const logger = require('../config/logger');
const { BadRequestError, NotFoundError } = require('../utils/errors');

class AssessmentManagementService {
  // ─────────────────────────────────────────────────────────────
  // 1. ASSESSMENTS
  // ─────────────────────────────────────────────────────────────

  async getAssessments(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;
      const repoOptions = {
        assessmentId: filters.assessmentId || null,
        languageId: filters.languageId || null,
        filterAssessmentType: filters.assessmentType || null,
        filterAssessmentScope: filters.assessmentScope || null,
        filterContentType: filters.contentType || null,
        filterDifficultyLevel: filters.difficultyLevel || null,
        filterChapterId: filters.chapterId || null,
        filterModuleId: filters.moduleId || null,
        filterCourseId: filters.courseId || null,
        filterIsMandatory: filters.isMandatory || null,
        filterIsActive: filters.isActive || null,
        filterIsDeleted: filters.isDeleted || false,
        searchQuery: search || null,
        sortTable: sort?.table || 'assessment',
        sortColumn: sort?.column || 'display_order',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: (pagination.pageIndex || pagination.page || 1) - 1,
        pageSize: pagination.pageSize || pagination.limit || 20,
      };
      return await assessmentManagementRepository.getAssessments(repoOptions);
    } catch (error) {
      logger.error('Error fetching assessments:', error);
      throw error;
    }
  }

  async getAssessmentById(assessmentId) {
    try {
      if (!assessmentId) throw new BadRequestError('Assessment ID is required');
      const result = await assessmentManagementRepository.findAssessmentById(assessmentId);
      if (!result) throw new NotFoundError('Assessment not found');
      return result;
    } catch (error) {
      logger.error(`Error fetching assessment ${assessmentId}:`, error);
      throw error;
    }
  }

  async createAssessment(assessmentData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const created = await assessmentManagementRepository.createAssessment({
        ...assessmentData,
        createdBy: actingUserId,
      });
      logger.info(`Assessment created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating assessment:', error);
      throw error;
    }
  }

  async updateAssessment(assessmentId, updates, actingUserId) {
    try {
      if (!assessmentId) throw new BadRequestError('Assessment ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await assessmentManagementRepository.findAssessmentById(assessmentId);
      if (!existing) throw new NotFoundError('Assessment not found');
      await assessmentManagementRepository.updateAssessment(assessmentId, {
        ...updates,
        updatedBy: actingUserId,
      });
      logger.info(`Assessment updated: ${assessmentId}`, { updatedBy: actingUserId });
    } catch (error) {
      logger.error(`Error updating assessment ${assessmentId}:`, error);
      throw error;
    }
  }

  async deleteAssessment(assessmentId, actingUserId) {
    try {
      if (!assessmentId) throw new BadRequestError('Assessment ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await assessmentManagementRepository.findAssessmentById(assessmentId);
      if (!existing) throw new NotFoundError('Assessment not found');
      await assessmentManagementRepository.deleteAssessment(assessmentId, actingUserId);
      logger.info(`Assessment deleted: ${assessmentId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting assessment ${assessmentId}:`, error);
      throw error;
    }
  }

  async restoreAssessment(assessmentId, restoreTranslations = false, actingUserId) {
    try {
      if (!assessmentId) throw new BadRequestError('Assessment ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const restored = await assessmentManagementRepository.restoreAssessment(assessmentId, restoreTranslations, actingUserId);
      logger.info(`Assessment restored: ${assessmentId}`, { restoredBy: actingUserId });
      return restored;
    } catch (error) {
      logger.error(`Error restoring assessment ${assessmentId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. ASSESSMENT TRANSLATIONS
  // ─────────────────────────────────────────────────────────────

  async createAssessmentTranslation(translationData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!translationData.assessmentId) throw new BadRequestError('Assessment ID is required');
      if (!translationData.languageId) throw new BadRequestError('Language ID is required');
      if (!translationData.title) throw new BadRequestError('Title is required');

      const payload = { ...translationData };

      if (payload.image1File) {
        const path = `assessments/translations/${Date.now()}_${payload.image1File.originalname}`;
        const result = await bunnyService.uploadFile(payload.image1File.buffer, path);
        payload.image1 = result.cdnUrl;
      }

      if (payload.image2File) {
        const path = `assessments/translations/${Date.now()}_${payload.image2File.originalname}`;
        const result = await bunnyService.uploadFile(payload.image2File.buffer, path);
        payload.image2 = result.cdnUrl;
      }

      await assessmentManagementRepository.createAssessmentTranslation(payload);
      logger.info(`Assessment Translation created for assessment ${translationData.assessmentId}`, { createdBy: actingUserId });
    } catch (error) {
      logger.error('Error creating assessment translation:', error);
      throw error;
    }
  }

  async updateAssessmentTranslation(translationId, updates, actingUserId) {
    try {
      if (!translationId) throw new BadRequestError('Assessment Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await assessmentManagementRepository.findAssessmentTranslationById(translationId);
      if (!existing) throw new NotFoundError('Assessment Translation not found');

      const payload = { ...updates };

      if (payload.image1File) {
        if (existing.at_image_1) {
          const oldPath = existing.at_image_1.replace('https://cdn.growupmore.com/', '');
          await bunnyService.deleteFile(oldPath).catch(err => logger.warn('Failed to delete old image_1', err));
        }
        const path = `assessments/translations/${Date.now()}_${payload.image1File.originalname}`;
        const result = await bunnyService.uploadFile(payload.image1File.buffer, path);
        payload.image1 = result.cdnUrl;
      }

      if (payload.image2File) {
        if (existing.at_image_2) {
          const oldPath = existing.at_image_2.replace('https://cdn.growupmore.com/', '');
          await bunnyService.deleteFile(oldPath).catch(err => logger.warn('Failed to delete old image_2', err));
        }
        const path = `assessments/translations/${Date.now()}_${payload.image2File.originalname}`;
        const result = await bunnyService.uploadFile(payload.image2File.buffer, path);
        payload.image2 = result.cdnUrl;
      }

      await assessmentManagementRepository.updateAssessmentTranslation(translationId, payload);
      logger.info(`Assessment Translation updated: ${translationId}`, { updatedBy: actingUserId });
    } catch (error) {
      logger.error(`Error updating assessment translation ${translationId}:`, error);
      throw error;
    }
  }

  async deleteAssessmentTranslation(translationId, actingUserId) {
    try {
      if (!translationId) throw new BadRequestError('Assessment Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await assessmentManagementRepository.findAssessmentTranslationById(translationId);
      if (!existing) throw new NotFoundError('Assessment Translation not found');
      await assessmentManagementRepository.deleteAssessmentTranslation(translationId);
      logger.info(`Assessment Translation deleted: ${translationId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting assessment translation ${translationId}:`, error);
      throw error;
    }
  }

  async restoreAssessmentTranslation(translationId, actingUserId) {
    try {
      if (!translationId) throw new BadRequestError('Assessment Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const restored = await assessmentManagementRepository.restoreAssessmentTranslation(translationId);
      logger.info(`Assessment Translation restored: ${translationId}`, { restoredBy: actingUserId });
      return restored;
    } catch (error) {
      logger.error(`Error restoring assessment translation ${translationId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. ASSESSMENT ATTACHMENTS
  // ─────────────────────────────────────────────────────────────

  async getAssessmentAttachments(options = {}) {
    try {
      const { filters = {}, search } = options;
      const repoOptions = {
        assessmentId: filters.assessmentId || null,
        languageId: filters.languageId || null,
        filterAttachmentType: filters.attachmentType || null,
        filterIsActive: filters.isActive || null,
        filterIsDeleted: filters.isDeleted || false,
        search: search || null,
      };
      return await assessmentManagementRepository.getAssessmentAttachments(repoOptions);
    } catch (error) {
      logger.error('Error fetching assessment attachments:', error);
      throw error;
    }
  }

  async getAssessmentAttachmentById(attachmentId) {
    try {
      if (!attachmentId) throw new BadRequestError('Assessment Attachment ID is required');
      const result = await assessmentManagementRepository.findAssessmentAttachmentById(attachmentId);
      if (!result) throw new NotFoundError('Assessment Attachment not found');
      return result;
    } catch (error) {
      logger.error(`Error fetching assessment attachment ${attachmentId}:`, error);
      throw error;
    }
  }

  async createAssessmentAttachment(attachmentData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!attachmentData.assessmentId) throw new BadRequestError('Assessment ID is required');
      if (!attachmentData.attachmentType) throw new BadRequestError('Attachment type is required');

      const payload = { ...attachmentData };

      if (payload.fileData) {
        const path = `assessments/attachments/${Date.now()}_${payload.fileData.originalname}`;
        const result = await bunnyService.uploadFile(payload.fileData.buffer, path);
        payload.fileUrl = result.cdnUrl;
        payload.fileName = payload.fileData.originalname;
        payload.fileSizeBytes = payload.fileData.size;
        payload.mimeType = payload.fileData.mimetype;
      }

      const created = await assessmentManagementRepository.createAssessmentAttachment({
        ...payload,
        createdBy: actingUserId,
      });
      logger.info(`Assessment Attachment created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating assessment attachment:', error);
      throw error;
    }
  }

  async updateAssessmentAttachment(attachmentId, updates, actingUserId) {
    try {
      if (!attachmentId) throw new BadRequestError('Assessment Attachment ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await assessmentManagementRepository.findAssessmentAttachmentById(attachmentId);
      if (!existing) throw new NotFoundError('Assessment Attachment not found');

      const payload = { ...updates };

      if (payload.fileData) {
        if (existing.aa_file_url) {
          const oldPath = existing.aa_file_url.replace('https://cdn.growupmore.com/', '');
          await bunnyService.deleteFile(oldPath).catch(err => logger.warn('Failed to delete old file', err));
        }
        const path = `assessments/attachments/${Date.now()}_${payload.fileData.originalname}`;
        const result = await bunnyService.uploadFile(payload.fileData.buffer, path);
        payload.fileUrl = result.cdnUrl;
        payload.fileName = payload.fileData.originalname;
        payload.fileSizeBytes = payload.fileData.size;
        payload.mimeType = payload.fileData.mimetype;
      }

      await assessmentManagementRepository.updateAssessmentAttachment(attachmentId, {
        ...payload,
        updatedBy: actingUserId,
      });
      logger.info(`Assessment Attachment updated: ${attachmentId}`, { updatedBy: actingUserId });
    } catch (error) {
      logger.error(`Error updating assessment attachment ${attachmentId}:`, error);
      throw error;
    }
  }

  async deleteAssessmentAttachment(attachmentId, actingUserId) {
    try {
      if (!attachmentId) throw new BadRequestError('Assessment Attachment ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await assessmentManagementRepository.findAssessmentAttachmentById(attachmentId);
      if (!existing) throw new NotFoundError('Assessment Attachment not found');
      await assessmentManagementRepository.deleteAssessmentAttachment(attachmentId);
      logger.info(`Assessment Attachment deleted: ${attachmentId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting assessment attachment ${attachmentId}:`, error);
      throw error;
    }
  }

  async restoreAssessmentAttachment(attachmentId, restoreTranslations = false, actingUserId) {
    try {
      if (!attachmentId) throw new BadRequestError('Assessment Attachment ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const restored = await assessmentManagementRepository.restoreAssessmentAttachment(attachmentId, restoreTranslations);
      logger.info(`Assessment Attachment restored: ${attachmentId}`, { restoredBy: actingUserId });
      return restored;
    } catch (error) {
      logger.error(`Error restoring assessment attachment ${attachmentId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 4. ASSESSMENT ATTACHMENT TRANSLATIONS
  // ─────────────────────────────────────────────────────────────

  async createAssessmentAttachmentTranslation(translationData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!translationData.assessmentAttachmentId) throw new BadRequestError('Assessment Attachment ID is required');
      if (!translationData.languageId) throw new BadRequestError('Language ID is required');

      await assessmentManagementRepository.createAssessmentAttachmentTranslation(translationData);
      logger.info(`Assessment Attachment Translation created for attachment ${translationData.assessmentAttachmentId}`, { createdBy: actingUserId });
    } catch (error) {
      logger.error('Error creating assessment attachment translation:', error);
      throw error;
    }
  }

  async updateAssessmentAttachmentTranslation(translationId, updates, actingUserId) {
    try {
      if (!translationId) throw new BadRequestError('Assessment Attachment Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await assessmentManagementRepository.findAssessmentAttachmentTranslationById(translationId);
      if (!existing) throw new NotFoundError('Assessment Attachment Translation not found');
      await assessmentManagementRepository.updateAssessmentAttachmentTranslation(translationId, updates);
      logger.info(`Assessment Attachment Translation updated: ${translationId}`, { updatedBy: actingUserId });
    } catch (error) {
      logger.error(`Error updating assessment attachment translation ${translationId}:`, error);
      throw error;
    }
  }

  async deleteAssessmentAttachmentTranslation(translationId, actingUserId) {
    try {
      if (!translationId) throw new BadRequestError('Assessment Attachment Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await assessmentManagementRepository.findAssessmentAttachmentTranslationById(translationId);
      if (!existing) throw new NotFoundError('Assessment Attachment Translation not found');
      await assessmentManagementRepository.deleteAssessmentAttachmentTranslation(translationId);
      logger.info(`Assessment Attachment Translation deleted: ${translationId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting assessment attachment translation ${translationId}:`, error);
      throw error;
    }
  }

  async restoreAssessmentAttachmentTranslation(translationId, actingUserId) {
    try {
      if (!translationId) throw new BadRequestError('Assessment Attachment Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const restored = await assessmentManagementRepository.restoreAssessmentAttachmentTranslation(translationId);
      logger.info(`Assessment Attachment Translation restored: ${translationId}`, { restoredBy: actingUserId });
      return restored;
    } catch (error) {
      logger.error(`Error restoring assessment attachment translation ${translationId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 5. ASSESSMENT SOLUTIONS
  // ─────────────────────────────────────────────────────────────

  async getAssessmentSolutions(options = {}) {
    try {
      const { filters = {}, search } = options;
      const repoOptions = {
        assessmentId: filters.assessmentId || null,
        languageId: filters.languageId || null,
        filterSolutionType: filters.solutionType || null,
        filterIsActive: filters.isActive || null,
        filterIsDeleted: filters.isDeleted || false,
        search: search || null,
      };
      return await assessmentManagementRepository.getAssessmentSolutions(repoOptions);
    } catch (error) {
      logger.error('Error fetching assessment solutions:', error);
      throw error;
    }
  }

  async getAssessmentSolutionById(solutionId) {
    try {
      if (!solutionId) throw new BadRequestError('Assessment Solution ID is required');
      const result = await assessmentManagementRepository.findAssessmentSolutionById(solutionId);
      if (!result) throw new NotFoundError('Assessment Solution not found');
      return result;
    } catch (error) {
      logger.error(`Error fetching assessment solution ${solutionId}:`, error);
      throw error;
    }
  }

  async createAssessmentSolution(solutionData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!solutionData.assessmentId) throw new BadRequestError('Assessment ID is required');
      if (!solutionData.solutionType) throw new BadRequestError('Solution type is required');

      const payload = { ...solutionData };

      if (payload.fileData) {
        const path = `assessments/solutions/${Date.now()}_${payload.fileData.originalname}`;
        const result = await bunnyService.uploadFile(payload.fileData.buffer, path);
        payload.fileUrl = result.cdnUrl;
        payload.fileName = payload.fileData.originalname;
        payload.fileSizeBytes = payload.fileData.size;
        payload.mimeType = payload.fileData.mimetype;
      }

      if (payload.videoData) {
        const path = `assessments/solutions/${Date.now()}_${payload.videoData.originalname}`;
        const result = await bunnyService.uploadFile(payload.videoData.buffer, path);
        payload.videoUrl = result.cdnUrl;
      }

      const created = await assessmentManagementRepository.createAssessmentSolution({
        ...payload,
        createdBy: actingUserId,
      });
      logger.info(`Assessment Solution created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating assessment solution:', error);
      throw error;
    }
  }

  async updateAssessmentSolution(solutionId, updates, actingUserId) {
    try {
      if (!solutionId) throw new BadRequestError('Assessment Solution ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await assessmentManagementRepository.findAssessmentSolutionById(solutionId);
      if (!existing) throw new NotFoundError('Assessment Solution not found');

      const payload = { ...updates };

      if (payload.fileData) {
        if (existing.as_file_url) {
          const oldPath = existing.as_file_url.replace('https://cdn.growupmore.com/', '');
          await bunnyService.deleteFile(oldPath).catch(err => logger.warn('Failed to delete old file', err));
        }
        const path = `assessments/solutions/${Date.now()}_${payload.fileData.originalname}`;
        const result = await bunnyService.uploadFile(payload.fileData.buffer, path);
        payload.fileUrl = result.cdnUrl;
        payload.fileName = payload.fileData.originalname;
        payload.fileSizeBytes = payload.fileData.size;
        payload.mimeType = payload.fileData.mimetype;
      }

      if (payload.videoData) {
        if (existing.as_video_url) {
          const oldPath = existing.as_video_url.replace('https://cdn.growupmore.com/', '');
          await bunnyService.deleteFile(oldPath).catch(err => logger.warn('Failed to delete old video', err));
        }
        const path = `assessments/solutions/${Date.now()}_${payload.videoData.originalname}`;
        const result = await bunnyService.uploadFile(payload.videoData.buffer, path);
        payload.videoUrl = result.cdnUrl;
      }

      await assessmentManagementRepository.updateAssessmentSolution(solutionId, {
        ...payload,
        updatedBy: actingUserId,
      });
      logger.info(`Assessment Solution updated: ${solutionId}`, { updatedBy: actingUserId });
    } catch (error) {
      logger.error(`Error updating assessment solution ${solutionId}:`, error);
      throw error;
    }
  }

  async deleteAssessmentSolution(solutionId, actingUserId) {
    try {
      if (!solutionId) throw new BadRequestError('Assessment Solution ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await assessmentManagementRepository.findAssessmentSolutionById(solutionId);
      if (!existing) throw new NotFoundError('Assessment Solution not found');
      await assessmentManagementRepository.deleteAssessmentSolution(solutionId);
      logger.info(`Assessment Solution deleted: ${solutionId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting assessment solution ${solutionId}:`, error);
      throw error;
    }
  }

  async restoreAssessmentSolution(solutionId, restoreTranslations = false, actingUserId) {
    try {
      if (!solutionId) throw new BadRequestError('Assessment Solution ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const restored = await assessmentManagementRepository.restoreAssessmentSolution(solutionId, restoreTranslations);
      logger.info(`Assessment Solution restored: ${solutionId}`, { restoredBy: actingUserId });
      return restored;
    } catch (error) {
      logger.error(`Error restoring assessment solution ${solutionId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 6. ASSESSMENT SOLUTION TRANSLATIONS
  // ─────────────────────────────────────────────────────────────

  async createAssessmentSolutionTranslation(translationData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!translationData.assessmentSolutionId) throw new BadRequestError('Assessment Solution ID is required');
      if (!translationData.languageId) throw new BadRequestError('Language ID is required');

      const payload = { ...translationData };

      if (payload.videoThumbnailFile) {
        const path = `assessments/solutions/thumbnails/${Date.now()}_${payload.videoThumbnailFile.originalname}`;
        const result = await bunnyService.uploadFile(payload.videoThumbnailFile.buffer, path);
        payload.videoThumbnail = result.cdnUrl;
      }

      await assessmentManagementRepository.createAssessmentSolutionTranslation(payload);
      logger.info(`Assessment Solution Translation created for solution ${translationData.assessmentSolutionId}`, { createdBy: actingUserId });
    } catch (error) {
      logger.error('Error creating assessment solution translation:', error);
      throw error;
    }
  }

  async updateAssessmentSolutionTranslation(translationId, updates, actingUserId) {
    try {
      if (!translationId) throw new BadRequestError('Assessment Solution Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await assessmentManagementRepository.findAssessmentSolutionTranslationById(translationId);
      if (!existing) throw new NotFoundError('Assessment Solution Translation not found');

      const payload = { ...updates };

      if (payload.videoThumbnailFile) {
        if (existing.ast_video_thumbnail) {
          const oldPath = existing.ast_video_thumbnail.replace('https://cdn.growupmore.com/', '');
          await bunnyService.deleteFile(oldPath).catch(err => logger.warn('Failed to delete old thumbnail', err));
        }
        const path = `assessments/solutions/thumbnails/${Date.now()}_${payload.videoThumbnailFile.originalname}`;
        const result = await bunnyService.uploadFile(payload.videoThumbnailFile.buffer, path);
        payload.videoThumbnail = result.cdnUrl;
      }

      await assessmentManagementRepository.updateAssessmentSolutionTranslation(translationId, payload);
      logger.info(`Assessment Solution Translation updated: ${translationId}`, { updatedBy: actingUserId });
    } catch (error) {
      logger.error(`Error updating assessment solution translation ${translationId}:`, error);
      throw error;
    }
  }

  async deleteAssessmentSolutionTranslation(translationId, actingUserId) {
    try {
      if (!translationId) throw new BadRequestError('Assessment Solution Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await assessmentManagementRepository.findAssessmentSolutionTranslationById(translationId);
      if (!existing) throw new NotFoundError('Assessment Solution Translation not found');
      await assessmentManagementRepository.deleteAssessmentSolutionTranslation(translationId);
      logger.info(`Assessment Solution Translation deleted: ${translationId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting assessment solution translation ${translationId}:`, error);
      throw error;
    }
  }

  async restoreAssessmentSolutionTranslation(translationId, actingUserId) {
    try {
      if (!translationId) throw new BadRequestError('Assessment Solution Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const restored = await assessmentManagementRepository.restoreAssessmentSolutionTranslation(translationId);
      logger.info(`Assessment Solution Translation restored: ${translationId}`, { restoredBy: actingUserId });
      return restored;
    } catch (error) {
      logger.error(`Error restoring assessment solution translation ${translationId}:`, error);
      throw error;
    }
  }
}

module.exports = new AssessmentManagementService();
