const courseManagementRepository = require('../repositories/courseManagement.repository');
const bunnyService = require('./bunny.service');
const logger = require('../config/logger');
const { BadRequestError, NotFoundError } = require('../utils/errors');

class CourseManagementService {
  // ─────────────────────────────────────────────────────────────
  // 1. COURSES - Main entity with file uploads
  // ─────────────────────────────────────────────────────────────

  async getCourses(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;
      const repoOptions = {
        difficultyLevel: filters.difficultyLevel || null,
        courseStatus: filters.courseStatus || null,
        isFree: filters.isFree || null,
        currency: filters.currency || null,
        isInstructorCourse: filters.isInstructorCourse || null,
        courseId: filters.courseId || null,
        languageId: filters.languageId || null,
        isDeleted: filters.isDeleted || null,
        searchTerm: search || null,
        sortTable: sort?.table || 'course',
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: (pagination.page || 1) - 1,
        pageSize: pagination.limit || 20,
      };
      return await courseManagementRepository.getCourses(repoOptions);
    } catch (error) {
      logger.error('Error fetching courses:', error);
      throw error;
    }
  }

  async getCourseById(courseId) {
    try {
      if (!courseId) throw new BadRequestError('Course ID is required');
      const result = await courseManagementRepository.findCourseById(courseId);
      if (!result) throw new NotFoundError('Course not found');
      return result;
    } catch (error) {
      logger.error(`Error fetching course ${courseId}:`, error);
      throw error;
    }
  }

  async createCourse(courseData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const payload = { ...courseData };

      // Handle trailer video upload
      if (payload.trailerVideoFile) {
        const path = `courses/${Date.now()}_${payload.trailerVideoFile.originalname}`;
        const result = await bunnyService.uploadFile(payload.trailerVideoFile.buffer, path);
        payload.trailerVideoUrl = result.cdnUrl;
        delete payload.trailerVideoFile;
      }

      // Handle trailer thumbnail upload
      if (payload.trailerThumbnailFile) {
        const path = `courses/${Date.now()}_${payload.trailerThumbnailFile.originalname}`;
        const result = await bunnyService.uploadFile(payload.trailerThumbnailFile.buffer, path);
        payload.trailerThumbnailUrl = result.cdnUrl;
        delete payload.trailerThumbnailFile;
      }

      // Handle video upload
      if (payload.videoFile) {
        const path = `courses/${Date.now()}_${payload.videoFile.originalname}`;
        const result = await bunnyService.uploadFile(payload.videoFile.buffer, path);
        payload.videoUrl = result.cdnUrl;
        delete payload.videoFile;
      }

      // Handle brochure upload
      if (payload.brochureFile) {
        const path = `courses/${Date.now()}_${payload.brochureFile.originalname}`;
        const result = await bunnyService.uploadFile(payload.brochureFile.buffer, path);
        payload.brochureUrl = result.cdnUrl;
        delete payload.brochureFile;
      }

      const created = await courseManagementRepository.createCourse(payload);
      logger.info(`Course created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating course:', error);
      throw error;
    }
  }

  async updateCourse(courseId, updates, actingUserId) {
    try {
      if (!courseId) throw new BadRequestError('Course ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await courseManagementRepository.findCourseById(courseId);
      if (!existing) throw new NotFoundError('Course not found');

      const payload = { ...updates };

      // Handle trailer video upload
      if (payload.trailerVideoFile) {
        const path = `courses/${Date.now()}_${payload.trailerVideoFile.originalname}`;
        const result = await bunnyService.uploadFile(payload.trailerVideoFile.buffer, path);
        payload.trailerVideoUrl = result.cdnUrl;
        delete payload.trailerVideoFile;

        // Delete old file if exists
        if (existing.trailer_video_url) {
          const oldPath = existing.trailer_video_url.replace('https://cdn.growupmore.com/', '');
          await bunnyService.deleteFile(oldPath).catch(err => logger.warn('Failed to delete old trailer video', err));
        }
      }

      // Handle trailer thumbnail upload
      if (payload.trailerThumbnailFile) {
        const path = `courses/${Date.now()}_${payload.trailerThumbnailFile.originalname}`;
        const result = await bunnyService.uploadFile(payload.trailerThumbnailFile.buffer, path);
        payload.trailerThumbnailUrl = result.cdnUrl;
        delete payload.trailerThumbnailFile;

        // Delete old file if exists
        if (existing.trailer_thumbnail_url) {
          const oldPath = existing.trailer_thumbnail_url.replace('https://cdn.growupmore.com/', '');
          await bunnyService.deleteFile(oldPath).catch(err => logger.warn('Failed to delete old trailer thumbnail', err));
        }
      }

      // Handle video upload
      if (payload.videoFile) {
        const path = `courses/${Date.now()}_${payload.videoFile.originalname}`;
        const result = await bunnyService.uploadFile(payload.videoFile.buffer, path);
        payload.videoUrl = result.cdnUrl;
        delete payload.videoFile;

        // Delete old file if exists
        if (existing.video_url) {
          const oldPath = existing.video_url.replace('https://cdn.growupmore.com/', '');
          await bunnyService.deleteFile(oldPath).catch(err => logger.warn('Failed to delete old video', err));
        }
      }

      // Handle brochure upload
      if (payload.brochureFile) {
        const path = `courses/${Date.now()}_${payload.brochureFile.originalname}`;
        const result = await bunnyService.uploadFile(payload.brochureFile.buffer, path);
        payload.brochureUrl = result.cdnUrl;
        delete payload.brochureFile;

        // Delete old file if exists
        if (existing.brochure_url) {
          const oldPath = existing.brochure_url.replace('https://cdn.growupmore.com/', '');
          await bunnyService.deleteFile(oldPath).catch(err => logger.warn('Failed to delete old brochure', err));
        }
      }

      const updated = await courseManagementRepository.updateCourse(courseId, payload);
      logger.info(`Course updated: ${courseId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating course ${courseId}:`, error);
      throw error;
    }
  }

  async deleteCourse(courseId, actingUserId) {
    try {
      if (!courseId) throw new BadRequestError('Course ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await courseManagementRepository.findCourseById(courseId);
      if (!existing) throw new NotFoundError('Course not found');
      await courseManagementRepository.deleteCourse(courseId);
      logger.info(`Course deleted: ${courseId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting course ${courseId}:`, error);
      throw error;
    }
  }

  async restoreCourse(courseId, restoreTranslations = true) {
    try {
      if (!courseId) throw new BadRequestError('Course ID is required');
      const restored = await courseManagementRepository.restoreCourse(courseId, restoreTranslations);
      logger.info(`Course restored: ${courseId}`);
      return restored;
    } catch (error) {
      logger.error(`Error restoring course ${courseId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 2. COURSE TRANSLATIONS - Child of COURSES with file uploads
  // ─────────────────────────────────────────────────────────────

  async createCourseTranslation(translationData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!translationData.courseId) throw new BadRequestError('Course ID is required');
      if (!translationData.languageId) throw new BadRequestError('Language ID is required');
      if (!translationData.title) throw new BadRequestError('Title is required');

      const payload = { ...translationData };

      // Handle web thumbnail upload
      if (payload.webThumbnailFile) {
        const path = `courses/translations/${Date.now()}_${payload.webThumbnailFile.originalname}`;
        const result = await bunnyService.uploadFile(payload.webThumbnailFile.buffer, path);
        payload.webThumbnailUrl = result.cdnUrl;
        delete payload.webThumbnailFile;
      }

      // Handle web banner upload
      if (payload.webBannerFile) {
        const path = `courses/translations/${Date.now()}_${payload.webBannerFile.originalname}`;
        const result = await bunnyService.uploadFile(payload.webBannerFile.buffer, path);
        payload.webBannerUrl = result.cdnUrl;
        delete payload.webBannerFile;
      }

      // Handle app thumbnail upload
      if (payload.appThumbnailFile) {
        const path = `courses/translations/${Date.now()}_${payload.appThumbnailFile.originalname}`;
        const result = await bunnyService.uploadFile(payload.appThumbnailFile.buffer, path);
        payload.appThumbnailUrl = result.cdnUrl;
        delete payload.appThumbnailFile;
      }

      // Handle app banner upload
      if (payload.appBannerFile) {
        const path = `courses/translations/${Date.now()}_${payload.appBannerFile.originalname}`;
        const result = await bunnyService.uploadFile(payload.appBannerFile.buffer, path);
        payload.appBannerUrl = result.cdnUrl;
        delete payload.appBannerFile;
      }

      // Handle video thumbnail upload
      if (payload.videoThumbnailFile) {
        const path = `courses/translations/${Date.now()}_${payload.videoThumbnailFile.originalname}`;
        const result = await bunnyService.uploadFile(payload.videoThumbnailFile.buffer, path);
        payload.videoThumbnailUrl = result.cdnUrl;
        delete payload.videoThumbnailFile;
      }

      const created = await courseManagementRepository.createCourseTranslation(payload);
      logger.info(`Course translation created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating course translation:', error);
      throw error;
    }
  }

  async updateCourseTranslation(translationId, updates, actingUserId) {
    try {
      if (!translationId) throw new BadRequestError('Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await courseManagementRepository.findCourseTranslationById(translationId);
      if (!existing) throw new NotFoundError('Course translation not found');

      const payload = { ...updates };

      // Handle web thumbnail upload
      if (payload.webThumbnailFile) {
        const path = `courses/translations/${Date.now()}_${payload.webThumbnailFile.originalname}`;
        const result = await bunnyService.uploadFile(payload.webThumbnailFile.buffer, path);
        payload.webThumbnailUrl = result.cdnUrl;
        delete payload.webThumbnailFile;

        if (existing.web_thumbnail_url) {
          const oldPath = existing.web_thumbnail_url.replace('https://cdn.growupmore.com/', '');
          await bunnyService.deleteFile(oldPath).catch(err => logger.warn('Failed to delete old web thumbnail', err));
        }
      }

      // Handle web banner upload
      if (payload.webBannerFile) {
        const path = `courses/translations/${Date.now()}_${payload.webBannerFile.originalname}`;
        const result = await bunnyService.uploadFile(payload.webBannerFile.buffer, path);
        payload.webBannerUrl = result.cdnUrl;
        delete payload.webBannerFile;

        if (existing.web_banner_url) {
          const oldPath = existing.web_banner_url.replace('https://cdn.growupmore.com/', '');
          await bunnyService.deleteFile(oldPath).catch(err => logger.warn('Failed to delete old web banner', err));
        }
      }

      // Handle app thumbnail upload
      if (payload.appThumbnailFile) {
        const path = `courses/translations/${Date.now()}_${payload.appThumbnailFile.originalname}`;
        const result = await bunnyService.uploadFile(payload.appThumbnailFile.buffer, path);
        payload.appThumbnailUrl = result.cdnUrl;
        delete payload.appThumbnailFile;

        if (existing.app_thumbnail_url) {
          const oldPath = existing.app_thumbnail_url.replace('https://cdn.growupmore.com/', '');
          await bunnyService.deleteFile(oldPath).catch(err => logger.warn('Failed to delete old app thumbnail', err));
        }
      }

      // Handle app banner upload
      if (payload.appBannerFile) {
        const path = `courses/translations/${Date.now()}_${payload.appBannerFile.originalname}`;
        const result = await bunnyService.uploadFile(payload.appBannerFile.buffer, path);
        payload.appBannerUrl = result.cdnUrl;
        delete payload.appBannerFile;

        if (existing.app_banner_url) {
          const oldPath = existing.app_banner_url.replace('https://cdn.growupmore.com/', '');
          await bunnyService.deleteFile(oldPath).catch(err => logger.warn('Failed to delete old app banner', err));
        }
      }

      // Handle video thumbnail upload
      if (payload.videoThumbnailFile) {
        const path = `courses/translations/${Date.now()}_${payload.videoThumbnailFile.originalname}`;
        const result = await bunnyService.uploadFile(payload.videoThumbnailFile.buffer, path);
        payload.videoThumbnailUrl = result.cdnUrl;
        delete payload.videoThumbnailFile;

        if (existing.video_thumbnail_url) {
          const oldPath = existing.video_thumbnail_url.replace('https://cdn.growupmore.com/', '');
          await bunnyService.deleteFile(oldPath).catch(err => logger.warn('Failed to delete old video thumbnail', err));
        }
      }

      const updated = await courseManagementRepository.updateCourseTranslation(translationId, payload);
      logger.info(`Course translation updated: ${translationId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating course translation ${translationId}:`, error);
      throw error;
    }
  }

  async deleteCourseTranslation(translationId, actingUserId) {
    try {
      if (!translationId) throw new BadRequestError('Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await courseManagementRepository.findCourseTranslationById(translationId);
      if (!existing) throw new NotFoundError('Course translation not found');
      await courseManagementRepository.deleteCourseTranslation(translationId);
      logger.info(`Course translation deleted: ${translationId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting course translation ${translationId}:`, error);
      throw error;
    }
  }

  async restoreCourseTranslation(translationId) {
    try {
      if (!translationId) throw new BadRequestError('Translation ID is required');
      const restored = await courseManagementRepository.restoreCourseTranslation(translationId);
      logger.info(`Course translation restored: ${translationId}`);
      return restored;
    } catch (error) {
      logger.error(`Error restoring course translation ${translationId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 3. COURSE MODULES - Child of COURSES
  // ─────────────────────────────────────────────────────────────

  async getCourseModules(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;
      const repoOptions = {
        courseId: filters.courseId || null,
        filterCourseId: filters.filterCourseId || null,
        isActive: filters.isActive || null,
        isDeleted: filters.isDeleted || null,
        courseModuleId: filters.courseModuleId || null,
        languageId: filters.languageId || null,
        searchTerm: search || null,
        sortTable: sort?.table || 'module',
        sortColumn: sort?.field || 'display_order',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: (pagination.page || 1) - 1,
        pageSize: pagination.limit || 20,
      };
      return await courseManagementRepository.getCourseModules(repoOptions);
    } catch (error) {
      logger.error('Error fetching course modules:', error);
      throw error;
    }
  }

  async getCourseModuleById(moduleId) {
    try {
      if (!moduleId) throw new BadRequestError('Module ID is required');
      const result = await courseManagementRepository.findCourseModuleById(moduleId);
      if (!result) throw new NotFoundError('Course module not found');
      return result;
    } catch (error) {
      logger.error(`Error fetching course module ${moduleId}:`, error);
      throw error;
    }
  }

  async createCourseModule(moduleData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!moduleData.courseId) throw new BadRequestError('Course ID is required');
      const created = await courseManagementRepository.createCourseModule(moduleData);
      logger.info(`Course module created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating course module:', error);
      throw error;
    }
  }

  async updateCourseModule(moduleId, updates, actingUserId) {
    try {
      if (!moduleId) throw new BadRequestError('Module ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await courseManagementRepository.findCourseModuleById(moduleId);
      if (!existing) throw new NotFoundError('Course module not found');
      const updated = await courseManagementRepository.updateCourseModule(moduleId, updates);
      logger.info(`Course module updated: ${moduleId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating course module ${moduleId}:`, error);
      throw error;
    }
  }

  async deleteCourseModule(moduleId, actingUserId) {
    try {
      if (!moduleId) throw new BadRequestError('Module ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await courseManagementRepository.findCourseModuleById(moduleId);
      if (!existing) throw new NotFoundError('Course module not found');
      await courseManagementRepository.deleteCourseModule(moduleId);
      logger.info(`Course module deleted: ${moduleId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting course module ${moduleId}:`, error);
      throw error;
    }
  }

  async restoreCourseModule(moduleId, restoreTranslations = true) {
    try {
      if (!moduleId) throw new BadRequestError('Module ID is required');
      const restored = await courseManagementRepository.restoreCourseModule(moduleId, restoreTranslations);
      logger.info(`Course module restored: ${moduleId}`);
      return restored;
    } catch (error) {
      logger.error(`Error restoring course module ${moduleId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 4. COURSE MODULE TRANSLATIONS - Child of COURSE MODULES
  // ─────────────────────────────────────────────────────────────

  async createCourseModuleTranslation(translationData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const payload = { ...translationData };

      // Handle icon upload
      if (payload.iconFile) {
        const path = `courses/modules/translations/${Date.now()}_${payload.iconFile.originalname}`;
        const result = await bunnyService.uploadFile(payload.iconFile.buffer, path);
        payload.iconUrl = result.cdnUrl;
        delete payload.iconFile;
      }

      // Handle image upload
      if (payload.imageFile) {
        const path = `courses/modules/translations/${Date.now()}_${payload.imageFile.originalname}`;
        const result = await bunnyService.uploadFile(payload.imageFile.buffer, path);
        payload.imageUrl = result.cdnUrl;
        delete payload.imageFile;
      }

      const created = await courseManagementRepository.createCourseModuleTranslation(payload);
      logger.info(`Course module translation created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating course module translation:', error);
      throw error;
    }
  }

  async updateCourseModuleTranslation(translationId, updates, actingUserId) {
    try {
      if (!translationId) throw new BadRequestError('Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await courseManagementRepository.findCourseModuleTranslationById(translationId);
      if (!existing) throw new NotFoundError('Course module translation not found');

      const payload = { ...updates };

      // Handle icon upload
      if (payload.iconFile) {
        const path = `courses/modules/translations/${Date.now()}_${payload.iconFile.originalname}`;
        const result = await bunnyService.uploadFile(payload.iconFile.buffer, path);
        payload.iconUrl = result.cdnUrl;
        delete payload.iconFile;

        if (existing.icon_url) {
          const oldPath = existing.icon_url.replace('https://cdn.growupmore.com/', '');
          await bunnyService.deleteFile(oldPath).catch(err => logger.warn('Failed to delete old icon', err));
        }
      }

      // Handle image upload
      if (payload.imageFile) {
        const path = `courses/modules/translations/${Date.now()}_${payload.imageFile.originalname}`;
        const result = await bunnyService.uploadFile(payload.imageFile.buffer, path);
        payload.imageUrl = result.cdnUrl;
        delete payload.imageFile;

        if (existing.image_url) {
          const oldPath = existing.image_url.replace('https://cdn.growupmore.com/', '');
          await bunnyService.deleteFile(oldPath).catch(err => logger.warn('Failed to delete old image', err));
        }
      }

      const updated = await courseManagementRepository.updateCourseModuleTranslation(translationId, payload);
      logger.info(`Course module translation updated: ${translationId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating course module translation ${translationId}:`, error);
      throw error;
    }
  }

  async deleteCourseModuleTranslation(translationId, actingUserId) {
    try {
      if (!translationId) throw new BadRequestError('Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await courseManagementRepository.findCourseModuleTranslationById(translationId);
      if (!existing) throw new NotFoundError('Course module translation not found');
      await courseManagementRepository.deleteCourseModuleTranslation(translationId);
      logger.info(`Course module translation deleted: ${translationId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting course module translation ${translationId}:`, error);
      throw error;
    }
  }

  async restoreCourseModuleTranslation(translationId) {
    try {
      if (!translationId) throw new BadRequestError('Translation ID is required');
      const restored = await courseManagementRepository.restoreCourseModuleTranslation(translationId);
      logger.info(`Course module translation restored: ${translationId}`);
      return restored;
    } catch (error) {
      logger.error(`Error restoring course module translation ${translationId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 5. COURSE MODULE TOPICS - Child of COURSE MODULES
  // ─────────────────────────────────────────────────────────────

  async getCourseModuleTopics(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;
      const repoOptions = {
        courseModuleId: filters.courseModuleId || null,
        topicId: filters.topicId || null,
        filterCourseModuleId: filters.filterCourseModuleId || null,
        isPreview: filters.isPreview || null,
        isActive: filters.isActive || null,
        isDeleted: filters.isDeleted || null,
        hasTopic: filters.hasTopic || null,
        searchTerm: search || null,
        sortTable: sort?.table || 'topic',
        sortColumn: sort?.field || 'display_order',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: (pagination.page || 1) - 1,
        pageSize: pagination.limit || 20,
      };
      return await courseManagementRepository.getCourseModuleTopics(repoOptions);
    } catch (error) {
      logger.error('Error fetching course module topics:', error);
      throw error;
    }
  }

  async getCourseModuleTopicById(topicId) {
    try {
      if (!topicId) throw new BadRequestError('Topic ID is required');
      const result = await courseManagementRepository.findCourseModuleTopicById(topicId);
      if (!result) throw new NotFoundError('Course module topic not found');
      return result;
    } catch (error) {
      logger.error(`Error fetching course module topic ${topicId}:`, error);
      throw error;
    }
  }

  async createCourseModuleTopic(topicData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const created = await courseManagementRepository.createCourseModuleTopic(topicData);
      logger.info(`Course module topic created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating course module topic:', error);
      throw error;
    }
  }

  async updateCourseModuleTopic(topicId, updates, actingUserId) {
    try {
      if (!topicId) throw new BadRequestError('Topic ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await courseManagementRepository.findCourseModuleTopicById(topicId);
      if (!existing) throw new NotFoundError('Course module topic not found');
      const updated = await courseManagementRepository.updateCourseModuleTopic(topicId, updates);
      logger.info(`Course module topic updated: ${topicId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating course module topic ${topicId}:`, error);
      throw error;
    }
  }

  async deleteCourseModuleTopic(topicId, actingUserId) {
    try {
      if (!topicId) throw new BadRequestError('Topic ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await courseManagementRepository.findCourseModuleTopicById(topicId);
      if (!existing) throw new NotFoundError('Course module topic not found');
      await courseManagementRepository.deleteCourseModuleTopic(topicId);
      logger.info(`Course module topic deleted: ${topicId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting course module topic ${topicId}:`, error);
      throw error;
    }
  }

  async deleteCourseModuleTopicsBulk(topicIds, actingUserId) {
    try {
      if (!topicIds || !Array.isArray(topicIds)) throw new BadRequestError('Topic IDs array is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      await courseManagementRepository.deleteCourseModuleTopicsBulk(topicIds);
      logger.info(`Course module topics deleted in bulk: ${topicIds.length} items`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error('Error deleting course module topics in bulk:', error);
      throw error;
    }
  }

  async restoreCourseModuleTopic(topicId) {
    try {
      if (!topicId) throw new BadRequestError('Topic ID is required');
      const restored = await courseManagementRepository.restoreCourseModuleTopic(topicId);
      logger.info(`Course module topic restored: ${topicId}`);
      return restored;
    } catch (error) {
      logger.error(`Error restoring course module topic ${topicId}:`, error);
      throw error;
    }
  }

  async restoreCourseModuleTopicsBulk(topicIds) {
    try {
      if (!topicIds || !Array.isArray(topicIds)) throw new BadRequestError('Topic IDs array is required');
      await courseManagementRepository.restoreCourseModuleTopicsBulk(topicIds);
      logger.info(`Course module topics restored in bulk: ${topicIds.length} items`);
    } catch (error) {
      logger.error('Error restoring course module topics in bulk:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 6. COURSE SUB-CATEGORIES - Junction entity
  // ─────────────────────────────────────────────────────────────

  async createCourseSubCategory(relationData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!relationData.courseId) throw new BadRequestError('Course ID is required');
      if (!relationData.subCategoryId) throw new BadRequestError('Sub-Category ID is required');
      const created = await courseManagementRepository.createCourseSubCategory(relationData);
      logger.info(`Course sub-category relation created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating course sub-category relation:', error);
      throw error;
    }
  }

  async updateCourseSubCategory(relationId, updates, actingUserId) {
    try {
      if (!relationId) throw new BadRequestError('Relation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await courseManagementRepository.findCourseSubCategoryById(relationId);
      if (!existing) throw new NotFoundError('Course sub-category relation not found');
      const updated = await courseManagementRepository.updateCourseSubCategory(relationId, updates);
      logger.info(`Course sub-category relation updated: ${relationId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating course sub-category relation ${relationId}:`, error);
      throw error;
    }
  }

  async deleteCourseSubCategory(relationId, actingUserId) {
    try {
      if (!relationId) throw new BadRequestError('Relation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await courseManagementRepository.findCourseSubCategoryById(relationId);
      if (!existing) throw new NotFoundError('Course sub-category relation not found');
      await courseManagementRepository.deleteCourseSubCategory(relationId);
      logger.info(`Course sub-category relation deleted: ${relationId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting course sub-category relation ${relationId}:`, error);
      throw error;
    }
  }

  async restoreCourseSubCategory(relationId) {
    try {
      if (!relationId) throw new BadRequestError('Relation ID is required');
      const restored = await courseManagementRepository.restoreCourseSubCategory(relationId);
      logger.info(`Course sub-category relation restored: ${relationId}`);
      return restored;
    } catch (error) {
      logger.error(`Error restoring course sub-category relation ${relationId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 7. COURSE SUBJECTS - Junction entity
  // ─────────────────────────────────────────────────────────────

  async createCourseSubject(relationData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!relationData.courseId) throw new BadRequestError('Course ID is required');
      if (!relationData.moduleId) throw new BadRequestError('Module ID is required');
      if (!relationData.subjectId) throw new BadRequestError('Subject ID is required');
      const created = await courseManagementRepository.createCourseSubject(relationData);
      logger.info(`Course subject relation created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating course subject relation:', error);
      throw error;
    }
  }

  async updateCourseSubject(relationId, updates, actingUserId) {
    try {
      if (!relationId) throw new BadRequestError('Relation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await courseManagementRepository.findCourseSubjectById(relationId);
      if (!existing) throw new NotFoundError('Course subject relation not found');
      const updated = await courseManagementRepository.updateCourseSubject(relationId, updates);
      logger.info(`Course subject relation updated: ${relationId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating course subject relation ${relationId}:`, error);
      throw error;
    }
  }

  async deleteCourseSubject(relationId, deletedBy) {
    try {
      if (!relationId) throw new BadRequestError('Relation ID is required');
      if (!deletedBy) throw new BadRequestError('Deleted by is required');
      const existing = await courseManagementRepository.findCourseSubjectById(relationId);
      if (!existing) throw new NotFoundError('Course subject relation not found');
      await courseManagementRepository.deleteCourseSubject(relationId);
      logger.info(`Course subject relation deleted: ${relationId}`, { deletedBy });
    } catch (error) {
      logger.error(`Error deleting course subject relation ${relationId}:`, error);
      throw error;
    }
  }

  async restoreCourseSubject(relationId, restoredBy) {
    try {
      if (!relationId) throw new BadRequestError('Relation ID is required');
      if (!restoredBy) throw new BadRequestError('Restored by is required');
      const restored = await courseManagementRepository.restoreCourseSubject(relationId);
      logger.info(`Course subject relation restored: ${relationId}`, { restoredBy });
      return restored;
    } catch (error) {
      logger.error(`Error restoring course subject relation ${relationId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 8. COURSE CHAPTERS - Junction entity
  // ─────────────────────────────────────────────────────────────

  async createCourseChapter(relationData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!relationData.courseSubjectId) throw new BadRequestError('Course Subject ID is required');
      if (!relationData.chapterId) throw new BadRequestError('Chapter ID is required');
      const created = await courseManagementRepository.createCourseChapter(relationData);
      logger.info(`Course chapter relation created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating course chapter relation:', error);
      throw error;
    }
  }

  async updateCourseChapter(relationId, updates, actingUserId) {
    try {
      if (!relationId) throw new BadRequestError('Relation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await courseManagementRepository.findCourseChapterById(relationId);
      if (!existing) throw new NotFoundError('Course chapter relation not found');
      const updated = await courseManagementRepository.updateCourseChapter(relationId, updates);
      logger.info(`Course chapter relation updated: ${relationId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating course chapter relation ${relationId}:`, error);
      throw error;
    }
  }

  async deleteCourseChapter(relationId, deletedBy) {
    try {
      if (!relationId) throw new BadRequestError('Relation ID is required');
      if (!deletedBy) throw new BadRequestError('Deleted by is required');
      const existing = await courseManagementRepository.findCourseChapterById(relationId);
      if (!existing) throw new NotFoundError('Course chapter relation not found');
      await courseManagementRepository.deleteCourseChapter(relationId);
      logger.info(`Course chapter relation deleted: ${relationId}`, { deletedBy });
    } catch (error) {
      logger.error(`Error deleting course chapter relation ${relationId}:`, error);
      throw error;
    }
  }

  async restoreCourseChapter(relationId, restoredBy) {
    try {
      if (!relationId) throw new BadRequestError('Relation ID is required');
      if (!restoredBy) throw new BadRequestError('Restored by is required');
      const restored = await courseManagementRepository.restoreCourseChapter(relationId);
      logger.info(`Course chapter relation restored: ${relationId}`, { restoredBy });
      return restored;
    } catch (error) {
      logger.error(`Error restoring course chapter relation ${relationId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 9. COURSE INSTRUCTORS - Junction entity
  // ─────────────────────────────────────────────────────────────

  async createCourseInstructor(relationData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!relationData.courseId) throw new BadRequestError('Course ID is required');
      if (!relationData.instructorId) throw new BadRequestError('Instructor ID is required');
      const created = await courseManagementRepository.createCourseInstructor(relationData);
      logger.info(`Course instructor relation created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating course instructor relation:', error);
      throw error;
    }
  }

  async updateCourseInstructor(relationId, updates, actingUserId) {
    try {
      if (!relationId) throw new BadRequestError('Relation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await courseManagementRepository.findCourseInstructorById(relationId);
      if (!existing) throw new NotFoundError('Course instructor relation not found');
      const updated = await courseManagementRepository.updateCourseInstructor(relationId, updates);
      logger.info(`Course instructor relation updated: ${relationId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating course instructor relation ${relationId}:`, error);
      throw error;
    }
  }

  async deleteCourseInstructor(relationId, actingUserId) {
    try {
      if (!relationId) throw new BadRequestError('Relation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await courseManagementRepository.findCourseInstructorById(relationId);
      if (!existing) throw new NotFoundError('Course instructor relation not found');
      await courseManagementRepository.deleteCourseInstructor(relationId);
      logger.info(`Course instructor relation deleted: ${relationId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting course instructor relation ${relationId}:`, error);
      throw error;
    }
  }

  async restoreCourseInstructor(relationId) {
    try {
      if (!relationId) throw new BadRequestError('Relation ID is required');
      const restored = await courseManagementRepository.restoreCourseInstructor(relationId);
      logger.info(`Course instructor relation restored: ${relationId}`);
      return restored;
    } catch (error) {
      logger.error(`Error restoring course instructor relation ${relationId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 10. BUNDLES - Main entity
  // ─────────────────────────────────────────────────────────────

  async getBundles(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;
      const repoOptions = {
        bundleOwner: filters.bundleOwner || null,
        isFeatured: filters.isFeatured || null,
        isActive: filters.isActive || null,
        bundleId: filters.bundleId || null,
        languageId: filters.languageId || null,
        searchTerm: search || null,
        sortTable: sort?.table || 'bundle',
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: (pagination.page || 1) - 1,
        pageSize: pagination.limit || 20,
      };
      return await courseManagementRepository.getBundles(repoOptions);
    } catch (error) {
      logger.error('Error fetching bundles:', error);
      throw error;
    }
  }

  async getBundleById(bundleId) {
    try {
      if (!bundleId) throw new BadRequestError('Bundle ID is required');
      const result = await courseManagementRepository.findBundleById(bundleId);
      if (!result) throw new NotFoundError('Bundle not found');
      return result;
    } catch (error) {
      logger.error(`Error fetching bundle ${bundleId}:`, error);
      throw error;
    }
  }

  async createBundle(bundleData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const created = await courseManagementRepository.createBundle(bundleData);
      logger.info(`Bundle created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating bundle:', error);
      throw error;
    }
  }

  async updateBundle(bundleId, updates, actingUserId) {
    try {
      if (!bundleId) throw new BadRequestError('Bundle ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await courseManagementRepository.findBundleById(bundleId);
      if (!existing) throw new NotFoundError('Bundle not found');
      const updated = await courseManagementRepository.updateBundle(bundleId, updates);
      logger.info(`Bundle updated: ${bundleId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating bundle ${bundleId}:`, error);
      throw error;
    }
  }

  async deleteBundle(bundleId, actingUserId) {
    try {
      if (!bundleId) throw new BadRequestError('Bundle ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await courseManagementRepository.findBundleById(bundleId);
      if (!existing) throw new NotFoundError('Bundle not found');
      await courseManagementRepository.deleteBundle(bundleId);
      logger.info(`Bundle deleted (cascade): ${bundleId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting bundle ${bundleId}:`, error);
      throw error;
    }
  }

  async deleteBundleSingle(bundleId, actingUserId) {
    try {
      if (!bundleId) throw new BadRequestError('Bundle ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await courseManagementRepository.findBundleById(bundleId);
      if (!existing) throw new NotFoundError('Bundle not found');
      await courseManagementRepository.deleteBundleSingle(bundleId);
      logger.info(`Bundle deleted (single): ${bundleId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting bundle single ${bundleId}:`, error);
      throw error;
    }
  }

  async restoreBundle(bundleId) {
    try {
      if (!bundleId) throw new BadRequestError('Bundle ID is required');
      const restored = await courseManagementRepository.restoreBundle(bundleId);
      logger.info(`Bundle restored (cascade): ${bundleId}`);
      return restored;
    } catch (error) {
      logger.error(`Error restoring bundle ${bundleId}:`, error);
      throw error;
    }
  }

  async restoreBundleSingle(bundleId) {
    try {
      if (!bundleId) throw new BadRequestError('Bundle ID is required');
      const restored = await courseManagementRepository.restoreBundleSingle(bundleId);
      logger.info(`Bundle restored (single): ${bundleId}`);
      return restored;
    } catch (error) {
      logger.error(`Error restoring bundle single ${bundleId}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 11. BUNDLE TRANSLATIONS - Child of BUNDLES with file uploads
  // ─────────────────────────────────────────────────────────────

  async createBundleTranslation(translationData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const payload = { ...translationData };

      // Handle thumbnail upload
      if (payload.thumbnailFile) {
        const path = `bundles/translations/${Date.now()}_${payload.thumbnailFile.originalname}`;
        const result = await bunnyService.uploadFile(payload.thumbnailFile.buffer, path);
        payload.thumbnailUrl = result.cdnUrl;
        delete payload.thumbnailFile;
      }

      // Handle banner upload
      if (payload.bannerFile) {
        const path = `bundles/translations/${Date.now()}_${payload.bannerFile.originalname}`;
        const result = await bunnyService.uploadFile(payload.bannerFile.buffer, path);
        payload.bannerUrl = result.cdnUrl;
        delete payload.bannerFile;
      }

      const created = await courseManagementRepository.createBundleTranslation(payload);
      logger.info(`Bundle translation created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating bundle translation:', error);
      throw error;
    }
  }

  async updateBundleTranslation(translationId, updates, actingUserId) {
    try {
      if (!translationId) throw new BadRequestError('Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await courseManagementRepository.findBundleTranslationById(translationId);
      if (!existing) throw new NotFoundError('Bundle translation not found');

      const payload = { ...updates };

      // Handle thumbnail upload
      if (payload.thumbnailFile) {
        const path = `bundles/translations/${Date.now()}_${payload.thumbnailFile.originalname}`;
        const result = await bunnyService.uploadFile(payload.thumbnailFile.buffer, path);
        payload.thumbnailUrl = result.cdnUrl;
        delete payload.thumbnailFile;

        if (existing.thumbnail_url) {
          const oldPath = existing.thumbnail_url.replace('https://cdn.growupmore.com/', '');
          await bunnyService.deleteFile(oldPath).catch(err => logger.warn('Failed to delete old thumbnail', err));
        }
      }

      // Handle banner upload
      if (payload.bannerFile) {
        const path = `bundles/translations/${Date.now()}_${payload.bannerFile.originalname}`;
        const result = await bunnyService.uploadFile(payload.bannerFile.buffer, path);
        payload.bannerUrl = result.cdnUrl;
        delete payload.bannerFile;

        if (existing.banner_url) {
          const oldPath = existing.banner_url.replace('https://cdn.growupmore.com/', '');
          await bunnyService.deleteFile(oldPath).catch(err => logger.warn('Failed to delete old banner', err));
        }
      }

      const updated = await courseManagementRepository.updateBundleTranslation(translationId, payload);
      logger.info(`Bundle translation updated: ${translationId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating bundle translation ${translationId}:`, error);
      throw error;
    }
  }

  async deleteBundleTranslationsBulk(translationIds, actingUserId) {
    try {
      if (!translationIds || !Array.isArray(translationIds)) throw new BadRequestError('Translation IDs array is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      await courseManagementRepository.deleteBundleTranslationsBulk(translationIds);
      logger.info(`Bundle translations deleted in bulk: ${translationIds.length} items`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error('Error deleting bundle translations in bulk:', error);
      throw error;
    }
  }

  async restoreBundleTranslationsBulk(translationIds) {
    try {
      if (!translationIds || !Array.isArray(translationIds)) throw new BadRequestError('Translation IDs array is required');
      await courseManagementRepository.restoreBundleTranslationsBulk(translationIds);
      logger.info(`Bundle translations restored in bulk: ${translationIds.length} items`);
    } catch (error) {
      logger.error('Error restoring bundle translations in bulk:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 12. BUNDLE COURSES - Junction entity
  // ─────────────────────────────────────────────────────────────

  async getBundleCourses(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;
      const repoOptions = {
        bundleCourseId: filters.bundleCourseId || null,
        bundleId: filters.bundleId || null,
        courseId: filters.courseId || null,
        searchTerm: search || null,
        sortTable: sort?.table || 'bundle_course',
        sortColumn: sort?.field || 'display_order',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: (pagination.page || 1) - 1,
        pageSize: pagination.limit || 20,
      };
      return await courseManagementRepository.getBundleCourses(repoOptions);
    } catch (error) {
      logger.error('Error fetching bundle courses:', error);
      throw error;
    }
  }

  async getBundleCourseById(relationId) {
    try {
      if (!relationId) throw new BadRequestError('Bundle Course ID is required');
      const result = await courseManagementRepository.findBundleCourseById(relationId);
      if (!result) throw new NotFoundError('Bundle course relation not found');
      return result;
    } catch (error) {
      logger.error(`Error fetching bundle course ${relationId}:`, error);
      throw error;
    }
  }

  async createBundleCourse(relationData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const created = await courseManagementRepository.createBundleCourse(relationData);
      logger.info(`Bundle course relation created: ${created.id}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating bundle course relation:', error);
      throw error;
    }
  }

  async updateBundleCourse(relationId, updates, actingUserId) {
    try {
      if (!relationId) throw new BadRequestError('Relation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await courseManagementRepository.findBundleCourseById(relationId);
      if (!existing) throw new NotFoundError('Bundle course relation not found');
      const updated = await courseManagementRepository.updateBundleCourse(relationId, updates);
      logger.info(`Bundle course relation updated: ${relationId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating bundle course relation ${relationId}:`, error);
      throw error;
    }
  }

  async deleteBundleCourse(relationId, actingUserId) {
    try {
      if (!relationId) throw new BadRequestError('Relation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      const existing = await courseManagementRepository.findBundleCourseById(relationId);
      if (!existing) throw new NotFoundError('Bundle course relation not found');
      await courseManagementRepository.deleteBundleCourse(relationId);
      logger.info(`Bundle course relation deleted: ${relationId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting bundle course relation ${relationId}:`, error);
      throw error;
    }
  }

  async deleteBundleCoursesBulk(relationIds, actingUserId) {
    try {
      if (!relationIds || !Array.isArray(relationIds)) throw new BadRequestError('Relation IDs array is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      await courseManagementRepository.deleteBundleCoursesBulk(relationIds);
      logger.info(`Bundle courses deleted in bulk: ${relationIds.length} items`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error('Error deleting bundle courses in bulk:', error);
      throw error;
    }
  }

  async restoreBundleCourse(relationId) {
    try {
      if (!relationId) throw new BadRequestError('Relation ID is required');
      const restored = await courseManagementRepository.restoreBundleCourse(relationId);
      logger.info(`Bundle course relation restored: ${relationId}`);
      return restored;
    } catch (error) {
      logger.error(`Error restoring bundle course relation ${relationId}:`, error);
      throw error;
    }
  }

  async restoreBundleCoursesBulk(relationIds) {
    try {
      if (!relationIds || !Array.isArray(relationIds)) throw new BadRequestError('Relation IDs array is required');
      await courseManagementRepository.restoreBundleCoursesBulk(relationIds);
      logger.info(`Bundle courses restored in bulk: ${relationIds.length} items`);
    } catch (error) {
      logger.error('Error restoring bundle courses in bulk:', error);
      throw error;
    }
  }
}

module.exports = new CourseManagementService();
