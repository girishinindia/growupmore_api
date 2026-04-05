/**
 * ═══════════════════════════════════════════════════════════════
 * MASTER DATA EXTENDED CONTROLLER — 10 Entities
 * Skills, Specializations, Learning Goals, Languages, Education Levels,
 * Document Types, Documents, Designations, Categories, Sub Categories
 * ═══════════════════════════════════════════════════════════════
 */

const masterDataExtendedService = require('../../../services/masterDataExtended.service');
const bunnyService = require('../../../services/bunny.service');
const { sendSuccess, sendCreated } = require('../../../utils/response');
const logger = require('../../../config/logger');

/** Bunny CDN folders for image uploads */
const CDN_FOLDERS = {
  SKILLS: 'master-data/skills/icons',
  SPECIALIZATIONS: 'master-data/specializations/icons',
  LEARNING_GOALS: 'master-data/learning-goals/icons',
  SOCIAL_MEDIAS: 'master-data/social-medias/icons',
  CATEGORIES_ICONS: 'master-data/categories/icons',
  CATEGORIES_IMAGES: 'master-data/categories/images',
  SUB_CATEGORIES_ICONS: 'master-data/sub-categories/icons',
  SUB_CATEGORIES_IMAGES: 'master-data/sub-categories/images',
};

class MasterDataExtendedController {
  // ==================== SKILLS ====================

  async getSkills(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'id', sortDir = 'asc', category, isActive } = req.query;

      const filters = {};
      if (category !== undefined) filters.category = category;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await masterDataExtendedService.getSkills({
        filters,
        search,
        sort: { field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, { data, message: 'Skills retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getSkillById(req, res, next) {
    try {
      const data = await masterDataExtendedService.getSkillById(req.params.id);
      sendSuccess(res, { data, message: 'Skill retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createSkill(req, res, next) {
    try {
      const skillData = { ...req.body };

      // If an icon image file was uploaded, upload it to Bunny CDN
      if (req.file) {
        const uploadResult = await bunnyService.uploadFile(
          req.file.buffer,
          CDN_FOLDERS.SKILLS,
          req.file.originalname
        );
        skillData.iconUrl = uploadResult.cdnUrl;
        logger.info(`Skill icon uploaded to: ${uploadResult.cdnUrl}`);
      }

      const data = await masterDataExtendedService.createSkill(skillData, req.user.userId);
      sendCreated(res, { data, message: 'Skill created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateSkill(req, res, next) {
    try {
      const skillData = { ...req.body };

      // If a new icon image file was uploaded, upload it to Bunny CDN
      if (req.file) {
        try {
          const existing = await masterDataExtendedService.getSkillById(req.params.id);
          if (existing && existing.icon_url) {
            // Delete old icon from Bunny (fire-and-forget)
            bunnyService.deleteFileByUrl(existing.icon_url).then((deleted) => {
              if (deleted) {
                bunnyService.purgeCache(existing.icon_url);
                logger.info(`Old skill icon deleted: ${existing.icon_url}`);
              }
            }).catch((err) => {
              logger.warn(`Failed to delete old skill icon: ${err.message}`);
            });
          }
        } catch (err) {
          logger.warn(`Could not fetch existing skill for icon cleanup: ${err.message}`);
        }

        const uploadResult = await bunnyService.uploadFile(
          req.file.buffer,
          CDN_FOLDERS.SKILLS,
          req.file.originalname
        );
        skillData.iconUrl = uploadResult.cdnUrl;
        logger.info(`Skill icon updated to: ${uploadResult.cdnUrl}`);
      }

      const data = await masterDataExtendedService.updateSkill(req.params.id, skillData, req.user.userId);
      sendSuccess(res, { data, message: 'Skill updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteSkill(req, res, next) {
    try {
      try {
        const existing = await masterDataExtendedService.getSkillById(req.params.id);
        if (existing && existing.icon_url) {
          bunnyService.deleteFileByUrl(existing.icon_url).then((deleted) => {
            if (deleted) {
              bunnyService.purgeCache(existing.icon_url);
              logger.info(`Skill icon cleaned up on delete: ${existing.icon_url}`);
            }
          }).catch((err) => {
            logger.warn(`Failed to clean up skill icon on delete: ${err.message}`);
          });
        }
      } catch (err) {
        logger.warn(`Could not fetch skill for icon cleanup on delete: ${err.message}`);
      }

      await masterDataExtendedService.deleteSkill(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Skill deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ==================== SPECIALIZATIONS ====================

  async getSpecializations(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'id', sortDir = 'asc', category, isActive } = req.query;

      const filters = {};
      if (category !== undefined) filters.category = category;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await masterDataExtendedService.getSpecializations({
        filters,
        search,
        sort: { field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, { data, message: 'Specializations retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getSpecializationById(req, res, next) {
    try {
      const data = await masterDataExtendedService.getSpecializationById(req.params.id);
      sendSuccess(res, { data, message: 'Specialization retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createSpecialization(req, res, next) {
    try {
      const specializationData = { ...req.body };

      if (req.file) {
        const uploadResult = await bunnyService.uploadFile(
          req.file.buffer,
          CDN_FOLDERS.SPECIALIZATIONS,
          req.file.originalname
        );
        specializationData.iconUrl = uploadResult.cdnUrl;
        logger.info(`Specialization icon uploaded to: ${uploadResult.cdnUrl}`);
      }

      const data = await masterDataExtendedService.createSpecialization(specializationData, req.user.userId);
      sendCreated(res, { data, message: 'Specialization created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateSpecialization(req, res, next) {
    try {
      const specializationData = { ...req.body };

      if (req.file) {
        try {
          const existing = await masterDataExtendedService.getSpecializationById(req.params.id);
          if (existing && existing.icon_url) {
            bunnyService.deleteFileByUrl(existing.icon_url).then((deleted) => {
              if (deleted) {
                bunnyService.purgeCache(existing.icon_url);
                logger.info(`Old specialization icon deleted: ${existing.icon_url}`);
              }
            }).catch((err) => {
              logger.warn(`Failed to delete old specialization icon: ${err.message}`);
            });
          }
        } catch (err) {
          logger.warn(`Could not fetch existing specialization for icon cleanup: ${err.message}`);
        }

        const uploadResult = await bunnyService.uploadFile(
          req.file.buffer,
          CDN_FOLDERS.SPECIALIZATIONS,
          req.file.originalname
        );
        specializationData.iconUrl = uploadResult.cdnUrl;
        logger.info(`Specialization icon updated to: ${uploadResult.cdnUrl}`);
      }

      const data = await masterDataExtendedService.updateSpecialization(req.params.id, specializationData, req.user.userId);
      sendSuccess(res, { data, message: 'Specialization updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteSpecialization(req, res, next) {
    try {
      try {
        const existing = await masterDataExtendedService.getSpecializationById(req.params.id);
        if (existing && existing.icon_url) {
          bunnyService.deleteFileByUrl(existing.icon_url).then((deleted) => {
            if (deleted) {
              bunnyService.purgeCache(existing.icon_url);
              logger.info(`Specialization icon cleaned up on delete: ${existing.icon_url}`);
            }
          }).catch((err) => {
            logger.warn(`Failed to clean up specialization icon on delete: ${err.message}`);
          });
        }
      } catch (err) {
        logger.warn(`Could not fetch specialization for icon cleanup on delete: ${err.message}`);
      }

      await masterDataExtendedService.deleteSpecialization(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Specialization deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ==================== LEARNING GOALS ====================

  async getLearningGoals(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'id', sortDir = 'asc', category, isActive } = req.query;

      const filters = {};
      if (category !== undefined) filters.category = category;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await masterDataExtendedService.getLearningGoals({
        filters,
        search,
        sort: { field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, { data, message: 'Learning goals retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getLearningGoalById(req, res, next) {
    try {
      const data = await masterDataExtendedService.getLearningGoalById(req.params.id);
      sendSuccess(res, { data, message: 'Learning goal retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createLearningGoal(req, res, next) {
    try {
      const learningGoalData = { ...req.body };

      if (req.file) {
        const uploadResult = await bunnyService.uploadFile(
          req.file.buffer,
          CDN_FOLDERS.LEARNING_GOALS,
          req.file.originalname
        );
        learningGoalData.iconUrl = uploadResult.cdnUrl;
        logger.info(`Learning goal icon uploaded to: ${uploadResult.cdnUrl}`);
      }

      const data = await masterDataExtendedService.createLearningGoal(learningGoalData, req.user.userId);
      sendCreated(res, { data, message: 'Learning goal created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateLearningGoal(req, res, next) {
    try {
      const learningGoalData = { ...req.body };

      if (req.file) {
        try {
          const existing = await masterDataExtendedService.getLearningGoalById(req.params.id);
          if (existing && existing.icon_url) {
            bunnyService.deleteFileByUrl(existing.icon_url).then((deleted) => {
              if (deleted) {
                bunnyService.purgeCache(existing.icon_url);
                logger.info(`Old learning goal icon deleted: ${existing.icon_url}`);
              }
            }).catch((err) => {
              logger.warn(`Failed to delete old learning goal icon: ${err.message}`);
            });
          }
        } catch (err) {
          logger.warn(`Could not fetch existing learning goal for icon cleanup: ${err.message}`);
        }

        const uploadResult = await bunnyService.uploadFile(
          req.file.buffer,
          CDN_FOLDERS.LEARNING_GOALS,
          req.file.originalname
        );
        learningGoalData.iconUrl = uploadResult.cdnUrl;
        logger.info(`Learning goal icon updated to: ${uploadResult.cdnUrl}`);
      }

      const data = await masterDataExtendedService.updateLearningGoal(req.params.id, learningGoalData, req.user.userId);
      sendSuccess(res, { data, message: 'Learning goal updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteLearningGoal(req, res, next) {
    try {
      try {
        const existing = await masterDataExtendedService.getLearningGoalById(req.params.id);
        if (existing && existing.icon_url) {
          bunnyService.deleteFileByUrl(existing.icon_url).then((deleted) => {
            if (deleted) {
              bunnyService.purgeCache(existing.icon_url);
              logger.info(`Learning goal icon cleaned up on delete: ${existing.icon_url}`);
            }
          }).catch((err) => {
            logger.warn(`Failed to clean up learning goal icon on delete: ${err.message}`);
          });
        }
      } catch (err) {
        logger.warn(`Could not fetch learning goal for icon cleanup on delete: ${err.message}`);
      }

      await masterDataExtendedService.deleteLearningGoal(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Learning goal deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ==================== SOCIAL MEDIAS ====================

  async getSocialMedias(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'id', sortDir = 'asc', isActive } = req.query;

      const filters = {};
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await masterDataExtendedService.getSocialMedias({
        filters,
        search,
        sort: { field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, { data, message: 'Social medias retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getSocialMediaById(req, res, next) {
    try {
      const data = await masterDataExtendedService.getSocialMediaById(req.params.id);
      sendSuccess(res, { data, message: 'Social media retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createSocialMedia(req, res, next) {
    try {
      const socialMediaData = { ...req.body };

      if (req.file) {
        const uploadResult = await bunnyService.uploadFile(
          req.file.buffer,
          CDN_FOLDERS.SOCIAL_MEDIAS,
          req.file.originalname
        );
        socialMediaData.iconUrl = uploadResult.cdnUrl;
        logger.info(`Social media icon uploaded to: ${uploadResult.cdnUrl}`);
      }

      const data = await masterDataExtendedService.createSocialMedia(socialMediaData, req.user.userId);
      sendCreated(res, { data, message: 'Social media created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateSocialMedia(req, res, next) {
    try {
      const socialMediaData = { ...req.body };

      if (req.file) {
        try {
          const existing = await masterDataExtendedService.getSocialMediaById(req.params.id);
          if (existing && existing.icon_url) {
            bunnyService.deleteFileByUrl(existing.icon_url).then((deleted) => {
              if (deleted) {
                bunnyService.purgeCache(existing.icon_url);
                logger.info(`Old social media icon deleted: ${existing.icon_url}`);
              }
            }).catch((err) => {
              logger.warn(`Failed to delete old social media icon: ${err.message}`);
            });
          }
        } catch (err) {
          logger.warn(`Could not fetch existing social media for icon cleanup: ${err.message}`);
        }

        const uploadResult = await bunnyService.uploadFile(
          req.file.buffer,
          CDN_FOLDERS.SOCIAL_MEDIAS,
          req.file.originalname
        );
        socialMediaData.iconUrl = uploadResult.cdnUrl;
        logger.info(`Social media icon updated to: ${uploadResult.cdnUrl}`);
      }

      const data = await masterDataExtendedService.updateSocialMedia(req.params.id, socialMediaData, req.user.userId);
      sendSuccess(res, { data, message: 'Social media updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteSocialMedia(req, res, next) {
    try {
      try {
        const existing = await masterDataExtendedService.getSocialMediaById(req.params.id);
        if (existing && existing.icon_url) {
          bunnyService.deleteFileByUrl(existing.icon_url).then((deleted) => {
            if (deleted) {
              bunnyService.purgeCache(existing.icon_url);
              logger.info(`Social media icon cleaned up on delete: ${existing.icon_url}`);
            }
          }).catch((err) => {
            logger.warn(`Failed to clean up social media icon on delete: ${err.message}`);
          });
        }
      } catch (err) {
        logger.warn(`Could not fetch social media for icon cleanup on delete: ${err.message}`);
      }

      await masterDataExtendedService.deleteSocialMedia(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Social media deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ==================== CATEGORIES ====================

  async getCategories(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'id', sortDir = 'asc', isActive } = req.query;

      const filters = {};
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await masterDataExtendedService.getCategories({
        filters,
        search,
        sort: { field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, { data, message: 'Categories retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req, res, next) {
    try {
      const data = await masterDataExtendedService.getCategoryById(req.params.id);
      sendSuccess(res, { data, message: 'Category retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req, res, next) {
    try {
      const categoryData = { ...req.body };

      // Handle both icon and image uploads
      if (req.files) {
        if (req.files.iconImage) {
          const uploadResult = await bunnyService.uploadFile(
            req.files.iconImage[0].buffer,
            CDN_FOLDERS.CATEGORIES_ICONS,
            req.files.iconImage[0].originalname
          );
          categoryData.iconUrl = uploadResult.cdnUrl;
          logger.info(`Category icon uploaded to: ${uploadResult.cdnUrl}`);
        }

        if (req.files.coverImage) {
          const uploadResult = await bunnyService.uploadFile(
            req.files.coverImage[0].buffer,
            CDN_FOLDERS.CATEGORIES_IMAGES,
            req.files.coverImage[0].originalname
          );
          categoryData.imageUrl = uploadResult.cdnUrl;
          logger.info(`Category cover image uploaded to: ${uploadResult.cdnUrl}`);
        }
      }

      const data = await masterDataExtendedService.createCategory(categoryData, req.user.userId);
      sendCreated(res, { data, message: 'Category created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const categoryData = { ...req.body };

      if (req.files) {
        try {
          const existing = await masterDataExtendedService.getCategoryById(req.params.id);

          if (req.files.iconImage && existing && existing.icon_url) {
            bunnyService.deleteFileByUrl(existing.icon_url).then((deleted) => {
              if (deleted) {
                bunnyService.purgeCache(existing.icon_url);
                logger.info(`Old category icon deleted: ${existing.icon_url}`);
              }
            }).catch((err) => {
              logger.warn(`Failed to delete old category icon: ${err.message}`);
            });
          }

          if (req.files.coverImage && existing && existing.image_url) {
            bunnyService.deleteFileByUrl(existing.image_url).then((deleted) => {
              if (deleted) {
                bunnyService.purgeCache(existing.image_url);
                logger.info(`Old category image deleted: ${existing.image_url}`);
              }
            }).catch((err) => {
              logger.warn(`Failed to delete old category image: ${err.message}`);
            });
          }
        } catch (err) {
          logger.warn(`Could not fetch existing category for image cleanup: ${err.message}`);
        }

        if (req.files.iconImage) {
          const uploadResult = await bunnyService.uploadFile(
            req.files.iconImage[0].buffer,
            CDN_FOLDERS.CATEGORIES_ICONS,
            req.files.iconImage[0].originalname
          );
          categoryData.iconUrl = uploadResult.cdnUrl;
          logger.info(`Category icon updated to: ${uploadResult.cdnUrl}`);
        }

        if (req.files.coverImage) {
          const uploadResult = await bunnyService.uploadFile(
            req.files.coverImage[0].buffer,
            CDN_FOLDERS.CATEGORIES_IMAGES,
            req.files.coverImage[0].originalname
          );
          categoryData.imageUrl = uploadResult.cdnUrl;
          logger.info(`Category cover image updated to: ${uploadResult.cdnUrl}`);
        }
      }

      const data = await masterDataExtendedService.updateCategory(req.params.id, categoryData, req.user.userId);
      sendSuccess(res, { data, message: 'Category updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      try {
        const existing = await masterDataExtendedService.getCategoryById(req.params.id);
        if (existing && existing.icon_url) {
          bunnyService.deleteFileByUrl(existing.icon_url).then((deleted) => {
            if (deleted) {
              bunnyService.purgeCache(existing.icon_url);
              logger.info(`Category icon cleaned up on delete: ${existing.icon_url}`);
            }
          }).catch((err) => {
            logger.warn(`Failed to clean up category icon on delete: ${err.message}`);
          });
        }
        if (existing && existing.image_url) {
          bunnyService.deleteFileByUrl(existing.image_url).then((deleted) => {
            if (deleted) {
              bunnyService.purgeCache(existing.image_url);
              logger.info(`Category image cleaned up on delete: ${existing.image_url}`);
            }
          }).catch((err) => {
            logger.warn(`Failed to clean up category image on delete: ${err.message}`);
          });
        }
      } catch (err) {
        logger.warn(`Could not fetch category for image cleanup on delete: ${err.message}`);
      }

      await masterDataExtendedService.deleteCategory(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Category deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ==================== SUB CATEGORIES ====================

  async getSubCategories(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'id', sortDir = 'asc', categoryId, isActive } = req.query;

      const filters = {};
      if (categoryId !== undefined) filters.categoryId = categoryId;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await masterDataExtendedService.getSubCategories({
        filters,
        search,
        sort: { field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, { data, message: 'Sub categories retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getSubCategoryById(req, res, next) {
    try {
      const data = await masterDataExtendedService.getSubCategoryById(req.params.id);
      sendSuccess(res, { data, message: 'Sub category retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createSubCategory(req, res, next) {
    try {
      const subCategoryData = { ...req.body };

      if (req.files) {
        if (req.files.iconImage) {
          const uploadResult = await bunnyService.uploadFile(
            req.files.iconImage[0].buffer,
            CDN_FOLDERS.SUB_CATEGORIES_ICONS,
            req.files.iconImage[0].originalname
          );
          subCategoryData.iconUrl = uploadResult.cdnUrl;
          logger.info(`Sub category icon uploaded to: ${uploadResult.cdnUrl}`);
        }

        if (req.files.coverImage) {
          const uploadResult = await bunnyService.uploadFile(
            req.files.coverImage[0].buffer,
            CDN_FOLDERS.SUB_CATEGORIES_IMAGES,
            req.files.coverImage[0].originalname
          );
          subCategoryData.imageUrl = uploadResult.cdnUrl;
          logger.info(`Sub category cover image uploaded to: ${uploadResult.cdnUrl}`);
        }
      }

      const data = await masterDataExtendedService.createSubCategory(subCategoryData, req.user.userId);
      sendCreated(res, { data, message: 'Sub category created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateSubCategory(req, res, next) {
    try {
      const subCategoryData = { ...req.body };

      if (req.files) {
        try {
          const existing = await masterDataExtendedService.getSubCategoryById(req.params.id);

          if (req.files.iconImage && existing && existing.icon_url) {
            bunnyService.deleteFileByUrl(existing.icon_url).then((deleted) => {
              if (deleted) {
                bunnyService.purgeCache(existing.icon_url);
                logger.info(`Old sub category icon deleted: ${existing.icon_url}`);
              }
            }).catch((err) => {
              logger.warn(`Failed to delete old sub category icon: ${err.message}`);
            });
          }

          if (req.files.coverImage && existing && existing.image_url) {
            bunnyService.deleteFileByUrl(existing.image_url).then((deleted) => {
              if (deleted) {
                bunnyService.purgeCache(existing.image_url);
                logger.info(`Old sub category image deleted: ${existing.image_url}`);
              }
            }).catch((err) => {
              logger.warn(`Failed to delete old sub category image: ${err.message}`);
            });
          }
        } catch (err) {
          logger.warn(`Could not fetch existing sub category for image cleanup: ${err.message}`);
        }

        if (req.files.iconImage) {
          const uploadResult = await bunnyService.uploadFile(
            req.files.iconImage[0].buffer,
            CDN_FOLDERS.SUB_CATEGORIES_ICONS,
            req.files.iconImage[0].originalname
          );
          subCategoryData.iconUrl = uploadResult.cdnUrl;
          logger.info(`Sub category icon updated to: ${uploadResult.cdnUrl}`);
        }

        if (req.files.coverImage) {
          const uploadResult = await bunnyService.uploadFile(
            req.files.coverImage[0].buffer,
            CDN_FOLDERS.SUB_CATEGORIES_IMAGES,
            req.files.coverImage[0].originalname
          );
          subCategoryData.imageUrl = uploadResult.cdnUrl;
          logger.info(`Sub category cover image updated to: ${uploadResult.cdnUrl}`);
        }
      }

      const data = await masterDataExtendedService.updateSubCategory(req.params.id, subCategoryData, req.user.userId);
      sendSuccess(res, { data, message: 'Sub category updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteSubCategory(req, res, next) {
    try {
      try {
        const existing = await masterDataExtendedService.getSubCategoryById(req.params.id);
        if (existing && existing.icon_url) {
          bunnyService.deleteFileByUrl(existing.icon_url).then((deleted) => {
            if (deleted) {
              bunnyService.purgeCache(existing.icon_url);
              logger.info(`Sub category icon cleaned up on delete: ${existing.icon_url}`);
            }
          }).catch((err) => {
            logger.warn(`Failed to clean up sub category icon on delete: ${err.message}`);
          });
        }
        if (existing && existing.image_url) {
          bunnyService.deleteFileByUrl(existing.image_url).then((deleted) => {
            if (deleted) {
              bunnyService.purgeCache(existing.image_url);
              logger.info(`Sub category image cleaned up on delete: ${existing.image_url}`);
            }
          }).catch((err) => {
            logger.warn(`Failed to clean up sub category image on delete: ${err.message}`);
          });
        }
      } catch (err) {
        logger.warn(`Could not fetch sub category for image cleanup on delete: ${err.message}`);
      }

      await masterDataExtendedService.deleteSubCategory(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Sub category deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ==================== LANGUAGES ====================

  async getLanguages(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'id', sortDir = 'asc', isActive } = req.query;

      const filters = {};
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await masterDataExtendedService.getLanguages({
        filters,
        search,
        sort: { field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, { data, message: 'Languages retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getLanguageById(req, res, next) {
    try {
      const data = await masterDataExtendedService.getLanguageById(req.params.id);
      sendSuccess(res, { data, message: 'Language retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createLanguage(req, res, next) {
    try {
      const data = await masterDataExtendedService.createLanguage(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Language created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateLanguage(req, res, next) {
    try {
      const data = await masterDataExtendedService.updateLanguage(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Language updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteLanguage(req, res, next) {
    try {
      await masterDataExtendedService.deleteLanguage(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Language deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ==================== EDUCATION LEVELS ====================

  async getEducationLevels(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'id', sortDir = 'asc', isActive } = req.query;

      const filters = {};
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await masterDataExtendedService.getEducationLevels({
        filters,
        search,
        sort: { field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, { data, message: 'Education levels retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getEducationLevelById(req, res, next) {
    try {
      const data = await masterDataExtendedService.getEducationLevelById(req.params.id);
      sendSuccess(res, { data, message: 'Education level retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createEducationLevel(req, res, next) {
    try {
      const data = await masterDataExtendedService.createEducationLevel(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Education level created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateEducationLevel(req, res, next) {
    try {
      const data = await masterDataExtendedService.updateEducationLevel(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Education level updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteEducationLevel(req, res, next) {
    try {
      await masterDataExtendedService.deleteEducationLevel(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Education level deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ==================== DOCUMENT TYPES ====================

  async getDocumentTypes(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'id', sortDir = 'asc', isActive } = req.query;

      const filters = {};
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await masterDataExtendedService.getDocumentTypes({
        filters,
        search,
        sort: { field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, { data, message: 'Document types retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getDocumentTypeById(req, res, next) {
    try {
      const data = await masterDataExtendedService.getDocumentTypeById(req.params.id);
      sendSuccess(res, { data, message: 'Document type retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createDocumentType(req, res, next) {
    try {
      const data = await masterDataExtendedService.createDocumentType(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Document type created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateDocumentType(req, res, next) {
    try {
      const data = await masterDataExtendedService.updateDocumentType(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Document type updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteDocumentType(req, res, next) {
    try {
      await masterDataExtendedService.deleteDocumentType(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Document type deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ==================== DOCUMENTS ====================

  async getDocuments(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'id', sortDir = 'asc', documentTypeId, isActive } = req.query;

      const filters = {};
      if (documentTypeId !== undefined) filters.documentTypeId = documentTypeId;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await masterDataExtendedService.getDocuments({
        filters,
        search,
        sort: { field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, { data, message: 'Documents retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getDocumentById(req, res, next) {
    try {
      const data = await masterDataExtendedService.getDocumentById(req.params.id);
      sendSuccess(res, { data, message: 'Document retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createDocument(req, res, next) {
    try {
      const data = await masterDataExtendedService.createDocument(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Document created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateDocument(req, res, next) {
    try {
      const data = await masterDataExtendedService.updateDocument(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Document updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteDocument(req, res, next) {
    try {
      await masterDataExtendedService.deleteDocument(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Document deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ==================== DESIGNATIONS ====================

  async getDesignations(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'id', sortDir = 'asc', isActive } = req.query;

      const filters = {};
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await masterDataExtendedService.getDesignations({
        filters,
        search,
        sort: { field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, { data, message: 'Designations retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getDesignationById(req, res, next) {
    try {
      const data = await masterDataExtendedService.getDesignationById(req.params.id);
      sendSuccess(res, { data, message: 'Designation retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createDesignation(req, res, next) {
    try {
      const data = await masterDataExtendedService.createDesignation(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Designation created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateDesignation(req, res, next) {
    try {
      const data = await masterDataExtendedService.updateDesignation(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Designation updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteDesignation(req, res, next) {
    try {
      await masterDataExtendedService.deleteDesignation(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Designation deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MasterDataExtendedController();
