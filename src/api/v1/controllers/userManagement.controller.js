const userManagementService = require('../../../services/userManagement.service');
const bunnyService = require('../../../services/bunny.service');
const { sendSuccess, sendCreated } = require('../../../utils/response');
const logger = require('../../../config/logger');

const CDN_FOLDERS = {
  PROFILE_PHOTOS: 'users/profiles/photos',
  COVER_PHOTOS: 'users/profiles/covers',
  EDUCATION_CERTIFICATES: 'users/education/certificates',
  SKILL_CERTIFICATES: 'users/skills/certificates',
  DOCUMENT_FILES: 'users/documents/files',
  PROJECT_THUMBNAILS: 'users/projects/thumbnails',
};

class UserManagementController {
  // ============ USERS ============
  async getUsers(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'id', sortDir = 'asc', role, countryId, isActive, isEmailVerified, isMobileVerified } = req.query;
      const filters = {};
      if (role !== undefined) filters.role = role;
      if (countryId !== undefined) filters.countryId = countryId;
      if (isActive !== undefined) filters.isActive = isActive;
      if (isEmailVerified !== undefined) filters.isEmailVerified = isEmailVerified;
      if (isMobileVerified !== undefined) filters.isMobileVerified = isMobileVerified;

      const data = await userManagementService.getUsers({
        filters,
        search,
        sort: { field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });
      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = { page: Number(page), limit: Number(limit), totalCount: Number(totalCount), totalPages: Math.ceil(Number(totalCount) / Number(limit)) };
      sendSuccess(res, { data, message: 'Users retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await userManagementService.getUserById(id);
      sendSuccess(res, { data, message: 'User retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createUser(req, res, next) {
    try {
      const userData = { ...req.body };
      const data = await userManagementService.createUser(userData, req.user.userId);
      sendCreated(res, { data, message: 'User created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const userData = { ...req.body };
      const data = await userManagementService.updateUser(id, userData, req.user.userId);
      sendSuccess(res, { data, message: 'User updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      await userManagementService.deleteUser(id, req.user.userId, req.user.role);
      sendSuccess(res, { data: null, message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ USER PROFILES ============
  async getUserProfiles(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'id', sortDir = 'asc', userId, gender, bloodGroup, maritalStatus, nationality, isProfileComplete, countryId, stateId, cityId, isActive } = req.query;
      const filters = {};
      if (userId !== undefined) filters.userId = userId;
      if (gender !== undefined) filters.gender = gender;
      if (bloodGroup !== undefined) filters.bloodGroup = bloodGroup;
      if (maritalStatus !== undefined) filters.maritalStatus = maritalStatus;
      if (nationality !== undefined) filters.nationality = nationality;
      if (isProfileComplete !== undefined) filters.isProfileComplete = isProfileComplete;
      if (countryId !== undefined) filters.countryId = countryId;
      if (stateId !== undefined) filters.stateId = stateId;
      if (cityId !== undefined) filters.cityId = cityId;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await userManagementService.getUserProfiles({
        filters,
        search,
        sort: { field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });
      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = { page: Number(page), limit: Number(limit), totalCount: Number(totalCount), totalPages: Math.ceil(Number(totalCount) / Number(limit)) };
      sendSuccess(res, { data, message: 'User Profiles retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getUserProfileById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await userManagementService.getUserProfileById(id);
      sendSuccess(res, { data, message: 'User Profile retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createUserProfile(req, res, next) {
    try {
      const profileData = { ...req.body };

      // Handle profile photo upload
      if (req.files?.profilePhoto?.[0]) {
        const uploadResult = await bunnyService.uploadFile(req.files.profilePhoto[0].buffer, CDN_FOLDERS.PROFILE_PHOTOS, req.files.profilePhoto[0].originalname);
        profileData.profilePhotoUrl = uploadResult.cdnUrl;
      }

      // Handle cover photo upload
      if (req.files?.coverPhoto?.[0]) {
        const uploadResult = await bunnyService.uploadFile(req.files.coverPhoto[0].buffer, CDN_FOLDERS.COVER_PHOTOS, req.files.coverPhoto[0].originalname);
        profileData.coverPhotoUrl = uploadResult.cdnUrl;
      }

      const data = await userManagementService.createUserProfile(profileData, req.user.userId);
      sendCreated(res, { data, message: 'User Profile created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateUserProfile(req, res, next) {
    try {
      const { id } = req.params;
      const profileData = { ...req.body };

      // Get existing record for CDN cleanup
      const existing = await userManagementService.getUserProfileById(id);

      // Handle profile photo upload
      if (req.files?.profilePhoto?.[0]) {
        if (existing.profile_photo_url) {
          bunnyService.deleteFileByUrl(existing.profile_photo_url).catch(err => logger.warn('CDN cleanup failed for profile photo:', err));
        }
        const uploadResult = await bunnyService.uploadFile(req.files.profilePhoto[0].buffer, CDN_FOLDERS.PROFILE_PHOTOS, req.files.profilePhoto[0].originalname);
        profileData.profilePhotoUrl = uploadResult.cdnUrl;
      }

      // Handle cover photo upload
      if (req.files?.coverPhoto?.[0]) {
        if (existing.cover_photo_url) {
          bunnyService.deleteFileByUrl(existing.cover_photo_url).catch(err => logger.warn('CDN cleanup failed for cover photo:', err));
        }
        const uploadResult = await bunnyService.uploadFile(req.files.coverPhoto[0].buffer, CDN_FOLDERS.COVER_PHOTOS, req.files.coverPhoto[0].originalname);
        profileData.coverPhotoUrl = uploadResult.cdnUrl;
      }

      const data = await userManagementService.updateUserProfile(id, profileData, req.user.userId);
      sendSuccess(res, { data, message: 'User Profile updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteUserProfile(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await userManagementService.getUserProfileById(id);

      // Clean up CDN files (fire-and-forget)
      if (existing.profile_photo_url) {
        bunnyService.deleteFileByUrl(existing.profile_photo_url).catch(err => logger.warn('CDN cleanup failed for profile photo:', err));
      }
      if (existing.cover_photo_url) {
        bunnyService.deleteFileByUrl(existing.cover_photo_url).catch(err => logger.warn('CDN cleanup failed for cover photo:', err));
      }

      await userManagementService.deleteUserProfile(id, req.user.userId);
      sendSuccess(res, { data: null, message: 'User Profile deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ USER EDUCATION ============
  async getUserEducations(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'id', sortDir = 'asc', userId, educationLevelId, levelCategory, gradeType, isCurrentlyStudying, isActive } = req.query;
      const filters = {};
      if (userId !== undefined) filters.userId = userId;
      if (educationLevelId !== undefined) filters.educationLevelId = educationLevelId;
      if (levelCategory !== undefined) filters.levelCategory = levelCategory;
      if (gradeType !== undefined) filters.gradeType = gradeType;
      if (isCurrentlyStudying !== undefined) filters.isCurrentlyStudying = isCurrentlyStudying;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await userManagementService.getUserEducations({
        filters,
        search,
        sort: { field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });
      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = { page: Number(page), limit: Number(limit), totalCount: Number(totalCount), totalPages: Math.ceil(Number(totalCount) / Number(limit)) };
      sendSuccess(res, { data, message: 'User Educations retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getUserEducationById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await userManagementService.getUserEducationById(id);
      sendSuccess(res, { data, message: 'User Education retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createUserEducation(req, res, next) {
    try {
      const educationData = { ...req.body };

      // Handle certificate upload
      if (req.file) {
        const uploadResult = await bunnyService.uploadFile(req.file.buffer, CDN_FOLDERS.EDUCATION_CERTIFICATES, req.file.originalname);
        educationData.certificateUrl = uploadResult.cdnUrl;
      }

      const data = await userManagementService.createUserEducation(educationData, req.user.userId);
      sendCreated(res, { data, message: 'User Education created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateUserEducation(req, res, next) {
    try {
      const { id } = req.params;
      const educationData = { ...req.body };

      // Get existing record for CDN cleanup
      const existing = await userManagementService.getUserEducationById(id);

      // Handle certificate upload
      if (req.file) {
        if (existing.certificate_url) {
          bunnyService.deleteFileByUrl(existing.certificate_url).catch(err => logger.warn('CDN cleanup failed for education certificate:', err));
        }
        const uploadResult = await bunnyService.uploadFile(req.file.buffer, CDN_FOLDERS.EDUCATION_CERTIFICATES, req.file.originalname);
        educationData.certificateUrl = uploadResult.cdnUrl;
      }

      const data = await userManagementService.updateUserEducation(id, educationData, req.user.userId);
      sendSuccess(res, { data, message: 'User Education updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteUserEducation(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await userManagementService.getUserEducationById(id);

      // Clean up CDN file (fire-and-forget)
      if (existing.certificate_url) {
        bunnyService.deleteFileByUrl(existing.certificate_url).catch(err => logger.warn('CDN cleanup failed for education certificate:', err));
      }

      await userManagementService.deleteUserEducation(id, req.user.userId);
      sendSuccess(res, { data: null, message: 'User Education deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ USER EXPERIENCE ============
  async getUserExperiences(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'id', sortDir = 'asc', userId, designationId, employmentType, workMode, isCurrentJob, isActive } = req.query;
      const filters = {};
      if (userId !== undefined) filters.userId = userId;
      if (designationId !== undefined) filters.designationId = designationId;
      if (employmentType !== undefined) filters.employmentType = employmentType;
      if (workMode !== undefined) filters.workMode = workMode;
      if (isCurrentJob !== undefined) filters.isCurrentJob = isCurrentJob;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await userManagementService.getUserExperiences({
        filters,
        search,
        sort: { field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });
      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = { page: Number(page), limit: Number(limit), totalCount: Number(totalCount), totalPages: Math.ceil(Number(totalCount) / Number(limit)) };
      sendSuccess(res, { data, message: 'User Experiences retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getUserExperienceById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await userManagementService.getUserExperienceById(id);
      sendSuccess(res, { data, message: 'User Experience retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createUserExperience(req, res, next) {
    try {
      const experienceData = { ...req.body };
      const data = await userManagementService.createUserExperience(experienceData, req.user.userId);
      sendCreated(res, { data, message: 'User Experience created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateUserExperience(req, res, next) {
    try {
      const { id } = req.params;
      const experienceData = { ...req.body };
      const data = await userManagementService.updateUserExperience(id, experienceData, req.user.userId);
      sendSuccess(res, { data, message: 'User Experience updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteUserExperience(req, res, next) {
    try {
      const { id } = req.params;
      await userManagementService.deleteUserExperience(id, req.user.userId);
      sendSuccess(res, { data: null, message: 'User Experience deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ USER SOCIAL MEDIAS ============
  async getUserSocialMedias(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'id', sortDir = 'asc', userId, socialMediaId, platformType, isPrimary, isActive } = req.query;
      const filters = {};
      if (userId !== undefined) filters.userId = userId;
      if (socialMediaId !== undefined) filters.socialMediaId = socialMediaId;
      if (platformType !== undefined) filters.platformType = platformType;
      if (isPrimary !== undefined) filters.isPrimary = isPrimary;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await userManagementService.getUserSocialMedias({
        filters,
        search,
        sort: { field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });
      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = { page: Number(page), limit: Number(limit), totalCount: Number(totalCount), totalPages: Math.ceil(Number(totalCount) / Number(limit)) };
      sendSuccess(res, { data, message: 'User Social Medias retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getUserSocialMediaById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await userManagementService.getUserSocialMediaById(id);
      sendSuccess(res, { data, message: 'User Social Media retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createUserSocialMedia(req, res, next) {
    try {
      const socialMediaData = { ...req.body };
      const data = await userManagementService.createUserSocialMedia(socialMediaData, req.user.userId);
      sendCreated(res, { data, message: 'User Social Media created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateUserSocialMedia(req, res, next) {
    try {
      const { id } = req.params;
      const socialMediaData = { ...req.body };
      const data = await userManagementService.updateUserSocialMedia(id, socialMediaData, req.user.userId);
      sendSuccess(res, { data, message: 'User Social Media updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteUserSocialMedia(req, res, next) {
    try {
      const { id } = req.params;
      await userManagementService.deleteUserSocialMedia(id, req.user.userId);
      sendSuccess(res, { data: null, message: 'User Social Media deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ USER SKILLS ============
  async getUserSkills(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'id', sortDir = 'asc', userId, skillId, proficiencyLevel, skillCategory, isPrimary, isActive } = req.query;
      const filters = {};
      if (userId !== undefined) filters.userId = userId;
      if (skillId !== undefined) filters.skillId = skillId;
      if (proficiencyLevel !== undefined) filters.proficiencyLevel = proficiencyLevel;
      if (skillCategory !== undefined) filters.skillCategory = skillCategory;
      if (isPrimary !== undefined) filters.isPrimary = isPrimary;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await userManagementService.getUserSkills({
        filters,
        search,
        sort: { field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });
      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = { page: Number(page), limit: Number(limit), totalCount: Number(totalCount), totalPages: Math.ceil(Number(totalCount) / Number(limit)) };
      sendSuccess(res, { data, message: 'User Skills retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getUserSkillById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await userManagementService.getUserSkillById(id);
      sendSuccess(res, { data, message: 'User Skill retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createUserSkill(req, res, next) {
    try {
      const skillData = { ...req.body };

      // Handle certificate upload
      if (req.file) {
        const uploadResult = await bunnyService.uploadFile(req.file.buffer, CDN_FOLDERS.SKILL_CERTIFICATES, req.file.originalname);
        skillData.certificateUrl = uploadResult.cdnUrl;
      }

      const data = await userManagementService.createUserSkill(skillData, req.user.userId);
      sendCreated(res, { data, message: 'User Skill created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateUserSkill(req, res, next) {
    try {
      const { id } = req.params;
      const skillData = { ...req.body };

      // Get existing record for CDN cleanup
      const existing = await userManagementService.getUserSkillById(id);

      // Handle certificate upload
      if (req.file) {
        if (existing.certificate_url) {
          bunnyService.deleteFileByUrl(existing.certificate_url).catch(err => logger.warn('CDN cleanup failed for skill certificate:', err));
        }
        const uploadResult = await bunnyService.uploadFile(req.file.buffer, CDN_FOLDERS.SKILL_CERTIFICATES, req.file.originalname);
        skillData.certificateUrl = uploadResult.cdnUrl;
      }

      const data = await userManagementService.updateUserSkill(id, skillData, req.user.userId);
      sendSuccess(res, { data, message: 'User Skill updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteUserSkill(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await userManagementService.getUserSkillById(id);

      // Clean up CDN file (fire-and-forget)
      if (existing.certificate_url) {
        bunnyService.deleteFileByUrl(existing.certificate_url).catch(err => logger.warn('CDN cleanup failed for skill certificate:', err));
      }

      await userManagementService.deleteUserSkill(id, req.user.userId);
      sendSuccess(res, { data: null, message: 'User Skill deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ USER LANGUAGES ============
  async getUserLanguages(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'id', sortDir = 'asc', userId, languageId, proficiencyLevel, isPrimary, isNative, isActive } = req.query;
      const filters = {};
      if (userId !== undefined) filters.userId = userId;
      if (languageId !== undefined) filters.languageId = languageId;
      if (proficiencyLevel !== undefined) filters.proficiencyLevel = proficiencyLevel;
      if (isPrimary !== undefined) filters.isPrimary = isPrimary;
      if (isNative !== undefined) filters.isNative = isNative;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await userManagementService.getUserLanguages({
        filters,
        search,
        sort: { field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });
      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = { page: Number(page), limit: Number(limit), totalCount: Number(totalCount), totalPages: Math.ceil(Number(totalCount) / Number(limit)) };
      sendSuccess(res, { data, message: 'User Languages retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getUserLanguageById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await userManagementService.getUserLanguageById(id);
      sendSuccess(res, { data, message: 'User Language retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createUserLanguage(req, res, next) {
    try {
      const languageData = { ...req.body };
      const data = await userManagementService.createUserLanguage(languageData, req.user.userId);
      sendCreated(res, { data, message: 'User Language created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateUserLanguage(req, res, next) {
    try {
      const { id } = req.params;
      const languageData = { ...req.body };
      const data = await userManagementService.updateUserLanguage(id, languageData, req.user.userId);
      sendSuccess(res, { data, message: 'User Language updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteUserLanguage(req, res, next) {
    try {
      const { id } = req.params;
      await userManagementService.deleteUserLanguage(id, req.user.userId);
      sendSuccess(res, { data: null, message: 'User Language deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ USER DOCUMENTS ============
  async getUserDocuments(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'id', sortDir = 'asc', userId, documentTypeId, verificationStatus, fileFormat, isActive } = req.query;
      const filters = {};
      if (userId !== undefined) filters.userId = userId;
      if (documentTypeId !== undefined) filters.documentTypeId = documentTypeId;
      if (verificationStatus !== undefined) filters.verificationStatus = verificationStatus;
      if (fileFormat !== undefined) filters.fileFormat = fileFormat;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await userManagementService.getUserDocuments({
        filters,
        search,
        sort: { field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });
      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = { page: Number(page), limit: Number(limit), totalCount: Number(totalCount), totalPages: Math.ceil(Number(totalCount) / Number(limit)) };
      sendSuccess(res, { data, message: 'User Documents retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getUserDocumentById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await userManagementService.getUserDocumentById(id);
      sendSuccess(res, { data, message: 'User Document retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createUserDocument(req, res, next) {
    try {
      const documentData = { ...req.body };

      // Handle document file upload
      if (req.file) {
        const uploadResult = await bunnyService.uploadFile(req.file.buffer, CDN_FOLDERS.DOCUMENT_FILES, req.file.originalname);
        documentData.documentFileUrl = uploadResult.cdnUrl;
      }

      const data = await userManagementService.createUserDocument(documentData, req.user.userId);
      sendCreated(res, { data, message: 'User Document created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateUserDocument(req, res, next) {
    try {
      const { id } = req.params;
      const documentData = { ...req.body };

      // Get existing record for CDN cleanup
      const existing = await userManagementService.getUserDocumentById(id);

      // Handle document file upload
      if (req.file) {
        if (existing.file_url) {
          bunnyService.deleteFileByUrl(existing.file_url).catch(err => logger.warn('CDN cleanup failed for document file:', err));
        }
        const uploadResult = await bunnyService.uploadFile(req.file.buffer, CDN_FOLDERS.DOCUMENT_FILES, req.file.originalname);
        documentData.documentFileUrl = uploadResult.cdnUrl;
      }

      const data = await userManagementService.updateUserDocument(id, documentData, req.user.userId);
      sendSuccess(res, { data, message: 'User Document updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteUserDocument(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await userManagementService.getUserDocumentById(id);

      // Clean up CDN file (fire-and-forget)
      if (existing.file_url) {
        bunnyService.deleteFileByUrl(existing.file_url).catch(err => logger.warn('CDN cleanup failed for document file:', err));
      }

      await userManagementService.deleteUserDocument(id, req.user.userId);
      sendSuccess(res, { data: null, message: 'User Document deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ USER PROJECTS ============
  async getUserProjects(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'id', sortDir = 'asc', userId, projectType, projectStatus, platform, isOngoing, isFeatured, isActive } = req.query;
      const filters = {};
      if (userId !== undefined) filters.userId = userId;
      if (projectType !== undefined) filters.projectType = projectType;
      if (projectStatus !== undefined) filters.projectStatus = projectStatus;
      if (platform !== undefined) filters.platform = platform;
      if (isOngoing !== undefined) filters.isOngoing = isOngoing;
      if (isFeatured !== undefined) filters.isFeatured = isFeatured;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await userManagementService.getUserProjects({
        filters,
        search,
        sort: { field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });
      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = { page: Number(page), limit: Number(limit), totalCount: Number(totalCount), totalPages: Math.ceil(Number(totalCount) / Number(limit)) };
      sendSuccess(res, { data, message: 'User Projects retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getUserProjectById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await userManagementService.getUserProjectById(id);
      sendSuccess(res, { data, message: 'User Project retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createUserProject(req, res, next) {
    try {
      const projectData = { ...req.body };

      // Handle thumbnail upload
      if (req.file) {
        const uploadResult = await bunnyService.uploadFile(req.file.buffer, CDN_FOLDERS.PROJECT_THUMBNAILS, req.file.originalname);
        projectData.thumbnailUrl = uploadResult.cdnUrl;
      }

      const data = await userManagementService.createUserProject(projectData, req.user.userId);
      sendCreated(res, { data, message: 'User Project created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateUserProject(req, res, next) {
    try {
      const { id } = req.params;
      const projectData = { ...req.body };

      // Get existing record for CDN cleanup
      const existing = await userManagementService.getUserProjectById(id);

      // Handle thumbnail upload
      if (req.file) {
        if (existing.thumbnail_url) {
          bunnyService.deleteFileByUrl(existing.thumbnail_url).catch(err => logger.warn('CDN cleanup failed for project thumbnail:', err));
        }
        const uploadResult = await bunnyService.uploadFile(req.file.buffer, CDN_FOLDERS.PROJECT_THUMBNAILS, req.file.originalname);
        projectData.thumbnailUrl = uploadResult.cdnUrl;
      }

      const data = await userManagementService.updateUserProject(id, projectData, req.user.userId);
      sendSuccess(res, { data, message: 'User Project updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteUserProject(req, res, next) {
    try {
      const { id } = req.params;
      const existing = await userManagementService.getUserProjectById(id);

      // Clean up CDN file (fire-and-forget)
      if (existing.thumbnail_url) {
        bunnyService.deleteFileByUrl(existing.thumbnail_url).catch(err => logger.warn('CDN cleanup failed for project thumbnail:', err));
      }

      await userManagementService.deleteUserProject(id, req.user.userId);
      sendSuccess(res, { data: null, message: 'User Project deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserManagementController();
