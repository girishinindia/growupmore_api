const userManagementRepository = require('../repositories/userManagement.repository');
const logger = require('../config/logger');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/errors');

class UserManagementService {
  // ============================================================================
  // USERS ENTITY
  // ============================================================================

  async getUsers(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;
      const repoOptions = {
        filterRole: filters.role || null,
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        filterIsDeleted: filters.isDeleted !== undefined ? filters.isDeleted : false,
        filterIsEmailVerified: filters.isEmailVerified !== undefined ? filters.isEmailVerified : null,
        filterIsMobileVerified: filters.isMobileVerified !== undefined ? filters.isMobileVerified : null,
        filterCountryId: filters.countryId || null,
        filterCountryIso2: filters.countryIso2 || null,
        filterCountryNationality: filters.countryNationality || null,
        searchTerm: search || null,
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };
      return await userManagementRepository.getUsers(repoOptions);
    } catch (error) {
      logger.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUserById(id) {
    try {
      if (!id) {
        throw new BadRequestError('User ID is required');
      }
      const user = await userManagementRepository.findUserById(id);
      if (!user) {
        throw new NotFoundError('User not found');
      }
      return user;
    } catch (error) {
      logger.error(`Error fetching user with ID ${id}:`, error);
      throw error;
    }
  }

  async createUser(data, actingUserId) {
    try {
      // Validate required fields
      const requiredFields = ['countryId', 'firstName', 'lastName', 'password'];
      for (const field of requiredFields) {
        if (!data[field]) {
          throw new BadRequestError(`${field} is required`);
        }
      }

      const userData = {
        countryId: data.countryId,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        email: data.email || null,
        mobileNumber: data.mobileNumber || null,
        role: data.role || 'USER',
        isActive: data.isActive !== undefined ? data.isActive : true,
        isDeleted: data.isDeleted !== undefined ? data.isDeleted : false,
        isEmailVerified: data.isEmailVerified !== undefined ? data.isEmailVerified : false,
        isMobileVerified: data.isMobileVerified !== undefined ? data.isMobileVerified : false,
        createdBy: actingUserId,
      };

      return await userManagementRepository.createUser(userData);
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id, data, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('User ID is required');
      }

      // Verify entity exists first
      const existingUser = await userManagementRepository.findUserById(id);
      if (!existingUser) {
        throw new NotFoundError('User not found');
      }

      const updateData = {
        countryId: data.countryId !== undefined ? data.countryId : existingUser.countryId,
        firstName: data.firstName !== undefined ? data.firstName : existingUser.firstName,
        lastName: data.lastName !== undefined ? data.lastName : existingUser.lastName,
        email: data.email !== undefined ? data.email : existingUser.email,
        mobileNumber: data.mobileNumber !== undefined ? data.mobileNumber : existingUser.mobileNumber,
        role: data.role !== undefined ? data.role : existingUser.role,
        isActive: data.isActive !== undefined ? data.isActive : existingUser.isActive,
        isDeleted: data.isDeleted !== undefined ? data.isDeleted : existingUser.isDeleted,
        isEmailVerified: data.isEmailVerified !== undefined ? data.isEmailVerified : existingUser.isEmailVerified,
        isMobileVerified: data.isMobileVerified !== undefined ? data.isMobileVerified : existingUser.isMobileVerified,
        updatedBy: actingUserId,
      };

      return await userManagementRepository.updateUser(id, updateData);
    } catch (error) {
      logger.error(`Error updating user with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteUser(id, actingUserId, actingUserRole) {
    try {
      if (!id) {
        throw new BadRequestError('User ID is required');
      }

      // Verify entity exists first
      const existingUser = await userManagementRepository.findUserById(id);
      if (!existingUser) {
        throw new NotFoundError('User not found');
      }

      // ── Super-admin protection ──────────────────────────────────
      // 1. No one can delete a super_admin user (they can only be deactivated)
      // 2. A super_admin cannot delete themselves either
      const targetRole = existingUser.user_role;

      if (targetRole === 'super_admin') {
        throw new ForbiddenError(
          'Super admin users cannot be deleted. Use update to activate/deactivate instead.'
        );
      }

      // 3. No user can delete themselves (self-deletion prevention)
      if (Number(id) === Number(actingUserId)) {
        throw new ForbiddenError(
          'You cannot delete your own account. Contact another admin to deactivate your account.'
        );
      }

      // 4. Admin users can only be deleted by super_admin
      if (targetRole === 'admin' && actingUserRole !== 'super_admin') {
        throw new ForbiddenError(
          'Only super admin can delete admin users.'
        );
      }
      // ────────────────────────────────────────────────────────────

      return await userManagementRepository.deleteUser(id, actingUserId);
    } catch (error) {
      logger.error(`Error deleting user with ID ${id}:`, error);
      throw error;
    }
  }

  async restoreUser(id) {
    if (!id) throw new BadRequestError('User ID is required');
    await userManagementRepository.restoreUser(id);
    return { id };
  }

  // ============================================================================
  // USER PROFILES ENTITY
  // ============================================================================

  async getUserProfiles(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;
      const repoOptions = {
        filterGender: filters.gender || null,
        filterBloodGroup: filters.bloodGroup || null,
        filterMaritalStatus: filters.maritalStatus || null,
        filterNationality: filters.nationality || null,
        filterIsProfileComplete: filters.isProfileComplete !== undefined ? filters.isProfileComplete : null,
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        filterIsDeleted: filters.isDeleted !== undefined ? filters.isDeleted : false,
        filterUserRole: filters.userRole || null,
        filterCountryId: filters.countryId || null,
        filterStateId: filters.stateId || null,
        filterCityId: filters.cityId || null,
        filterPreferredLanguageId: filters.preferredLanguageId || null,
        filterThemePreference: filters.themePreference || null,
        searchTerm: search || null,
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };
      return await userManagementRepository.getUserProfiles(repoOptions);
    } catch (error) {
      logger.error('Error fetching user profiles:', error);
      throw error;
    }
  }

  async getUserProfileById(id) {
    try {
      if (!id) {
        throw new BadRequestError('User Profile ID is required');
      }
      const userProfile = await userManagementRepository.findUserProfileById(id);
      if (!userProfile) {
        throw new NotFoundError('User Profile not found');
      }
      return userProfile;
    } catch (error) {
      logger.error(`Error fetching user profile with ID ${id}:`, error);
      throw error;
    }
  }

  async createUserProfile(data, actingUserId) {
    try {
      // Validate required fields
      const requiredFields = ['userId'];
      for (const field of requiredFields) {
        if (!data[field]) {
          throw new BadRequestError(`${field} is required`);
        }
      }

      const userProfileData = {
        userId: data.userId,
        gender: data.gender || null,
        bloodGroup: data.bloodGroup || null,
        maritalStatus: data.maritalStatus || null,
        nationality: data.nationality || null,
        dateOfBirth: data.dateOfBirth || null,
        profileImageUrl: data.profileImageUrl || null,
        isProfileComplete: data.isProfileComplete !== undefined ? data.isProfileComplete : false,
        isActive: data.isActive !== undefined ? data.isActive : true,
        isDeleted: data.isDeleted !== undefined ? data.isDeleted : false,
        countryId: data.countryId || null,
        stateId: data.stateId || null,
        cityId: data.cityId || null,
        preferredLanguageId: data.preferredLanguageId || null,
        themePreference: data.themePreference || 'LIGHT',
        createdBy: actingUserId,
      };

      return await userManagementRepository.createUserProfile(userProfileData);
    } catch (error) {
      logger.error('Error creating user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(id, data, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('User Profile ID is required');
      }

      // Verify entity exists first
      const existingUserProfile = await userManagementRepository.findUserProfileById(id);
      if (!existingUserProfile) {
        throw new NotFoundError('User Profile not found');
      }

      const updateData = {
        userId: data.userId !== undefined ? data.userId : existingUserProfile.userId,
        gender: data.gender !== undefined ? data.gender : existingUserProfile.gender,
        bloodGroup: data.bloodGroup !== undefined ? data.bloodGroup : existingUserProfile.bloodGroup,
        maritalStatus: data.maritalStatus !== undefined ? data.maritalStatus : existingUserProfile.maritalStatus,
        nationality: data.nationality !== undefined ? data.nationality : existingUserProfile.nationality,
        dateOfBirth: data.dateOfBirth !== undefined ? data.dateOfBirth : existingUserProfile.dateOfBirth,
        profileImageUrl: data.profileImageUrl !== undefined ? data.profileImageUrl : existingUserProfile.profileImageUrl,
        isProfileComplete: data.isProfileComplete !== undefined ? data.isProfileComplete : existingUserProfile.isProfileComplete,
        isActive: data.isActive !== undefined ? data.isActive : existingUserProfile.isActive,
        isDeleted: data.isDeleted !== undefined ? data.isDeleted : existingUserProfile.isDeleted,
        countryId: data.countryId !== undefined ? data.countryId : existingUserProfile.countryId,
        stateId: data.stateId !== undefined ? data.stateId : existingUserProfile.stateId,
        cityId: data.cityId !== undefined ? data.cityId : existingUserProfile.cityId,
        preferredLanguageId: data.preferredLanguageId !== undefined ? data.preferredLanguageId : existingUserProfile.preferredLanguageId,
        themePreference: data.themePreference !== undefined ? data.themePreference : existingUserProfile.themePreference,
        updatedBy: actingUserId,
      };

      return await userManagementRepository.updateUserProfile(id, updateData);
    } catch (error) {
      logger.error(`Error updating user profile with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteUserProfile(id, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('User Profile ID is required');
      }

      // Verify entity exists first
      const existingUserProfile = await userManagementRepository.findUserProfileById(id);
      if (!existingUserProfile) {
        throw new NotFoundError('User Profile not found');
      }

      return await userManagementRepository.deleteUserProfile(id, actingUserId);
    } catch (error) {
      logger.error(`Error deleting user profile with ID ${id}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // USER EDUCATION ENTITY
  // ============================================================================

  async getUserEducations(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;
      const repoOptions = {
        filterEducationLevelId: filters.educationLevelId || null,
        filterLevelCategory: filters.levelCategory || null,
        filterGradeType: filters.gradeType || null,
        filterIsCurrentlyStudying: filters.isCurrentlyStudying !== undefined ? filters.isCurrentlyStudying : null,
        filterIsHighest: filters.isHighest !== undefined ? filters.isHighest : null,
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        filterIsDeleted: filters.isDeleted !== undefined ? filters.isDeleted : false,
        filterUserRole: filters.userRole || null,
        searchTerm: search || null,
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };
      return await userManagementRepository.getUserEducation(repoOptions);
    } catch (error) {
      logger.error('Error fetching user education:', error);
      throw error;
    }
  }

  async getUserEducationById(id) {
    try {
      if (!id) {
        throw new BadRequestError('User Education ID is required');
      }
      const userEducation = await userManagementRepository.findUserEducationById(id);
      if (!userEducation) {
        throw new NotFoundError('User Education not found');
      }
      return userEducation;
    } catch (error) {
      logger.error(`Error fetching user education with ID ${id}:`, error);
      throw error;
    }
  }

  async createUserEducation(data, actingUserId) {
    try {
      // Validate required fields
      const requiredFields = ['userId', 'educationLevelId', 'institutionName'];
      for (const field of requiredFields) {
        if (!data[field]) {
          throw new BadRequestError(`${field} is required`);
        }
      }

      const userEducationData = {
        userId: data.userId,
        educationLevelId: data.educationLevelId,
        institutionName: data.institutionName,
        fieldOfStudy: data.fieldOfStudy || null,
        grade: data.grade || null,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        description: data.description || null,
        documentUrl: data.documentUrl || null,
        isCurrentlyStudying: data.isCurrentlyStudying !== undefined ? data.isCurrentlyStudying : false,
        isHighest: data.isHighest !== undefined ? data.isHighest : false,
        isActive: data.isActive !== undefined ? data.isActive : true,
        isDeleted: data.isDeleted !== undefined ? data.isDeleted : false,
        createdBy: actingUserId,
      };

      return await userManagementRepository.createUserEducation(userEducationData);
    } catch (error) {
      logger.error('Error creating user education:', error);
      throw error;
    }
  }

  async updateUserEducation(id, data, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('User Education ID is required');
      }

      // Verify entity exists first
      const existingUserEducation = await userManagementRepository.findUserEducationById(id);
      if (!existingUserEducation) {
        throw new NotFoundError('User Education not found');
      }

      const updateData = {
        userId: data.userId !== undefined ? data.userId : existingUserEducation.userId,
        educationLevelId: data.educationLevelId !== undefined ? data.educationLevelId : existingUserEducation.educationLevelId,
        institutionName: data.institutionName !== undefined ? data.institutionName : existingUserEducation.institutionName,
        fieldOfStudy: data.fieldOfStudy !== undefined ? data.fieldOfStudy : existingUserEducation.fieldOfStudy,
        grade: data.grade !== undefined ? data.grade : existingUserEducation.grade,
        startDate: data.startDate !== undefined ? data.startDate : existingUserEducation.startDate,
        endDate: data.endDate !== undefined ? data.endDate : existingUserEducation.endDate,
        description: data.description !== undefined ? data.description : existingUserEducation.description,
        documentUrl: data.documentUrl !== undefined ? data.documentUrl : existingUserEducation.documentUrl,
        isCurrentlyStudying: data.isCurrentlyStudying !== undefined ? data.isCurrentlyStudying : existingUserEducation.isCurrentlyStudying,
        isHighest: data.isHighest !== undefined ? data.isHighest : existingUserEducation.isHighest,
        isActive: data.isActive !== undefined ? data.isActive : existingUserEducation.isActive,
        isDeleted: data.isDeleted !== undefined ? data.isDeleted : existingUserEducation.isDeleted,
        updatedBy: actingUserId,
      };

      return await userManagementRepository.updateUserEducation(id, updateData);
    } catch (error) {
      logger.error(`Error updating user education with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteUserEducation(id, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('User Education ID is required');
      }

      // Verify entity exists first
      const existingUserEducation = await userManagementRepository.findUserEducationById(id);
      if (!existingUserEducation) {
        throw new NotFoundError('User Education not found');
      }

      return await userManagementRepository.deleteUserEducation(id, actingUserId);
    } catch (error) {
      logger.error(`Error deleting user education with ID ${id}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // USER EXPERIENCE ENTITY
  // ============================================================================

  async getUserExperiences(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;
      const repoOptions = {
        filterDesignationId: filters.designationId || null,
        filterEmploymentType: filters.employmentType || null,
        filterWorkMode: filters.workMode || null,
        filterLevelBand: filters.levelBand || null,
        filterIsCurrentJob: filters.isCurrentJob !== undefined ? filters.isCurrentJob : null,
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        filterIsDeleted: filters.isDeleted !== undefined ? filters.isDeleted : false,
        filterUserRole: filters.userRole || null,
        searchTerm: search || null,
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };
      return await userManagementRepository.getUserExperience(repoOptions);
    } catch (error) {
      logger.error('Error fetching user experience:', error);
      throw error;
    }
  }

  async getUserExperienceById(id) {
    try {
      if (!id) {
        throw new BadRequestError('User Experience ID is required');
      }
      const userExperience = await userManagementRepository.findUserExperienceById(id);
      if (!userExperience) {
        throw new NotFoundError('User Experience not found');
      }
      return userExperience;
    } catch (error) {
      logger.error(`Error fetching user experience with ID ${id}:`, error);
      throw error;
    }
  }

  async createUserExperience(data, actingUserId) {
    try {
      // Validate required fields
      const requiredFields = ['userId', 'companyName', 'jobTitle', 'startDate'];
      for (const field of requiredFields) {
        if (!data[field]) {
          throw new BadRequestError(`${field} is required`);
        }
      }

      const userExperienceData = {
        userId: data.userId,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        startDate: data.startDate,
        endDate: data.endDate || null,
        designationId: data.designationId || null,
        employmentType: data.employmentType || null,
        workMode: data.workMode || null,
        levelBand: data.levelBand || null,
        description: data.description || null,
        isCurrentJob: data.isCurrentJob !== undefined ? data.isCurrentJob : false,
        isActive: data.isActive !== undefined ? data.isActive : true,
        isDeleted: data.isDeleted !== undefined ? data.isDeleted : false,
        createdBy: actingUserId,
      };

      return await userManagementRepository.createUserExperience(userExperienceData);
    } catch (error) {
      logger.error('Error creating user experience:', error);
      throw error;
    }
  }

  async updateUserExperience(id, data, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('User Experience ID is required');
      }

      // Verify entity exists first
      const existingUserExperience = await userManagementRepository.findUserExperienceById(id);
      if (!existingUserExperience) {
        throw new NotFoundError('User Experience not found');
      }

      const updateData = {
        userId: data.userId !== undefined ? data.userId : existingUserExperience.userId,
        companyName: data.companyName !== undefined ? data.companyName : existingUserExperience.companyName,
        jobTitle: data.jobTitle !== undefined ? data.jobTitle : existingUserExperience.jobTitle,
        startDate: data.startDate !== undefined ? data.startDate : existingUserExperience.startDate,
        endDate: data.endDate !== undefined ? data.endDate : existingUserExperience.endDate,
        designationId: data.designationId !== undefined ? data.designationId : existingUserExperience.designationId,
        employmentType: data.employmentType !== undefined ? data.employmentType : existingUserExperience.employmentType,
        workMode: data.workMode !== undefined ? data.workMode : existingUserExperience.workMode,
        levelBand: data.levelBand !== undefined ? data.levelBand : existingUserExperience.levelBand,
        description: data.description !== undefined ? data.description : existingUserExperience.description,
        isCurrentJob: data.isCurrentJob !== undefined ? data.isCurrentJob : existingUserExperience.isCurrentJob,
        isActive: data.isActive !== undefined ? data.isActive : existingUserExperience.isActive,
        isDeleted: data.isDeleted !== undefined ? data.isDeleted : existingUserExperience.isDeleted,
        updatedBy: actingUserId,
      };

      return await userManagementRepository.updateUserExperience(id, updateData);
    } catch (error) {
      logger.error(`Error updating user experience with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteUserExperience(id, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('User Experience ID is required');
      }

      // Verify entity exists first
      const existingUserExperience = await userManagementRepository.findUserExperienceById(id);
      if (!existingUserExperience) {
        throw new NotFoundError('User Experience not found');
      }

      return await userManagementRepository.deleteUserExperience(id, actingUserId);
    } catch (error) {
      logger.error(`Error deleting user experience with ID ${id}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // USER SOCIAL MEDIAS ENTITY
  // ============================================================================

  async getUserSocialMedias(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;
      const repoOptions = {
        filterSocialMediaId: filters.socialMediaId || null,
        filterPlatformType: filters.platformType || null,
        filterIsPrimary: filters.isPrimary !== undefined ? filters.isPrimary : null,
        filterIsVerified: filters.isVerified !== undefined ? filters.isVerified : null,
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        filterIsDeleted: filters.isDeleted !== undefined ? filters.isDeleted : false,
        filterUserRole: filters.userRole || null,
        searchTerm: search || null,
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };
      return await userManagementRepository.getUserSocialMedias(repoOptions);
    } catch (error) {
      logger.error('Error fetching user social medias:', error);
      throw error;
    }
  }

  async getUserSocialMediaById(id) {
    try {
      if (!id) {
        throw new BadRequestError('User Social Media ID is required');
      }
      const userSocialMedia = await userManagementRepository.findUserSocialMediaById(id);
      if (!userSocialMedia) {
        throw new NotFoundError('User Social Media not found');
      }
      return userSocialMedia;
    } catch (error) {
      logger.error(`Error fetching user social media with ID ${id}:`, error);
      throw error;
    }
  }

  async createUserSocialMedia(data, actingUserId) {
    try {
      // Validate required fields
      const requiredFields = ['userId', 'socialMediaId', 'profileUrl'];
      for (const field of requiredFields) {
        if (!data[field]) {
          throw new BadRequestError(`${field} is required`);
        }
      }

      const userSocialMediaData = {
        userId: data.userId,
        socialMediaId: data.socialMediaId,
        profileUrl: data.profileUrl,
        platformType: data.platformType || null,
        username: data.username || null,
        followers: data.followers || null,
        isPrimary: data.isPrimary !== undefined ? data.isPrimary : false,
        isVerified: data.isVerified !== undefined ? data.isVerified : false,
        isActive: data.isActive !== undefined ? data.isActive : true,
        isDeleted: data.isDeleted !== undefined ? data.isDeleted : false,
        createdBy: actingUserId,
      };

      return await userManagementRepository.createUserSocialMedia(userSocialMediaData);
    } catch (error) {
      logger.error('Error creating user social media:', error);
      throw error;
    }
  }

  async updateUserSocialMedia(id, data, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('User Social Media ID is required');
      }

      // Verify entity exists first
      const existingUserSocialMedia = await userManagementRepository.findUserSocialMediaById(id);
      if (!existingUserSocialMedia) {
        throw new NotFoundError('User Social Media not found');
      }

      const updateData = {
        userId: data.userId !== undefined ? data.userId : existingUserSocialMedia.userId,
        socialMediaId: data.socialMediaId !== undefined ? data.socialMediaId : existingUserSocialMedia.socialMediaId,
        profileUrl: data.profileUrl !== undefined ? data.profileUrl : existingUserSocialMedia.profileUrl,
        platformType: data.platformType !== undefined ? data.platformType : existingUserSocialMedia.platformType,
        username: data.username !== undefined ? data.username : existingUserSocialMedia.username,
        followers: data.followers !== undefined ? data.followers : existingUserSocialMedia.followers,
        isPrimary: data.isPrimary !== undefined ? data.isPrimary : existingUserSocialMedia.isPrimary,
        isVerified: data.isVerified !== undefined ? data.isVerified : existingUserSocialMedia.isVerified,
        isActive: data.isActive !== undefined ? data.isActive : existingUserSocialMedia.isActive,
        isDeleted: data.isDeleted !== undefined ? data.isDeleted : existingUserSocialMedia.isDeleted,
        updatedBy: actingUserId,
      };

      return await userManagementRepository.updateUserSocialMedia(id, updateData);
    } catch (error) {
      logger.error(`Error updating user social media with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteUserSocialMedia(id, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('User Social Media ID is required');
      }

      // Verify entity exists first
      const existingUserSocialMedia = await userManagementRepository.findUserSocialMediaById(id);
      if (!existingUserSocialMedia) {
        throw new NotFoundError('User Social Media not found');
      }

      return await userManagementRepository.deleteUserSocialMedia(id, actingUserId);
    } catch (error) {
      logger.error(`Error deleting user social media with ID ${id}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // USER SKILLS ENTITY
  // ============================================================================

  async getUserSkills(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;
      const repoOptions = {
        filterSkillId: filters.skillId || null,
        filterProficiencyLevel: filters.proficiencyLevel || null,
        filterSkillCategory: filters.skillCategory || null,
        filterIsPrimary: filters.isPrimary !== undefined ? filters.isPrimary : null,
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        filterIsDeleted: filters.isDeleted !== undefined ? filters.isDeleted : false,
        filterMinExperience: filters.minExperience || null,
        filterUserRole: filters.userRole || null,
        searchTerm: search || null,
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };
      return await userManagementRepository.getUserSkills(repoOptions);
    } catch (error) {
      logger.error('Error fetching user skills:', error);
      throw error;
    }
  }

  async getUserSkillById(id) {
    try {
      if (!id) {
        throw new BadRequestError('User Skill ID is required');
      }
      const userSkill = await userManagementRepository.findUserSkillById(id);
      if (!userSkill) {
        throw new NotFoundError('User Skill not found');
      }
      return userSkill;
    } catch (error) {
      logger.error(`Error fetching user skill with ID ${id}:`, error);
      throw error;
    }
  }

  async createUserSkill(data, actingUserId) {
    try {
      // Validate required fields
      const requiredFields = ['userId', 'skillId'];
      for (const field of requiredFields) {
        if (!data[field]) {
          throw new BadRequestError(`${field} is required`);
        }
      }

      const userSkillData = {
        userId: data.userId,
        skillId: data.skillId,
        proficiencyLevel: data.proficiencyLevel || 'BEGINNER',
        skillCategory: data.skillCategory || null,
        yearsOfExperience: data.yearsOfExperience || 0,
        endorsementCount: data.endorsementCount || 0,
        isPrimary: data.isPrimary !== undefined ? data.isPrimary : false,
        isActive: data.isActive !== undefined ? data.isActive : true,
        isDeleted: data.isDeleted !== undefined ? data.isDeleted : false,
        createdBy: actingUserId,
      };

      return await userManagementRepository.createUserSkill(userSkillData);
    } catch (error) {
      logger.error('Error creating user skill:', error);
      throw error;
    }
  }

  async updateUserSkill(id, data, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('User Skill ID is required');
      }

      // Verify entity exists first
      const existingUserSkill = await userManagementRepository.findUserSkillById(id);
      if (!existingUserSkill) {
        throw new NotFoundError('User Skill not found');
      }

      const updateData = {
        userId: data.userId !== undefined ? data.userId : existingUserSkill.userId,
        skillId: data.skillId !== undefined ? data.skillId : existingUserSkill.skillId,
        proficiencyLevel: data.proficiencyLevel !== undefined ? data.proficiencyLevel : existingUserSkill.proficiencyLevel,
        skillCategory: data.skillCategory !== undefined ? data.skillCategory : existingUserSkill.skillCategory,
        yearsOfExperience: data.yearsOfExperience !== undefined ? data.yearsOfExperience : existingUserSkill.yearsOfExperience,
        endorsementCount: data.endorsementCount !== undefined ? data.endorsementCount : existingUserSkill.endorsementCount,
        isPrimary: data.isPrimary !== undefined ? data.isPrimary : existingUserSkill.isPrimary,
        isActive: data.isActive !== undefined ? data.isActive : existingUserSkill.isActive,
        isDeleted: data.isDeleted !== undefined ? data.isDeleted : existingUserSkill.isDeleted,
        updatedBy: actingUserId,
      };

      return await userManagementRepository.updateUserSkill(id, updateData);
    } catch (error) {
      logger.error(`Error updating user skill with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteUserSkill(id, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('User Skill ID is required');
      }

      // Verify entity exists first
      const existingUserSkill = await userManagementRepository.findUserSkillById(id);
      if (!existingUserSkill) {
        throw new NotFoundError('User Skill not found');
      }

      return await userManagementRepository.deleteUserSkill(id, actingUserId);
    } catch (error) {
      logger.error(`Error deleting user skill with ID ${id}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // USER LANGUAGES ENTITY
  // ============================================================================

  async getUserLanguages(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;
      const repoOptions = {
        filterLanguageId: filters.languageId || null,
        filterProficiencyLevel: filters.proficiencyLevel || null,
        filterScript: filters.script || null,
        filterIsPrimary: filters.isPrimary !== undefined ? filters.isPrimary : null,
        filterIsNative: filters.isNative !== undefined ? filters.isNative : null,
        filterCanRead: filters.canRead !== undefined ? filters.canRead : null,
        filterCanWrite: filters.canWrite !== undefined ? filters.canWrite : null,
        filterCanSpeak: filters.canSpeak !== undefined ? filters.canSpeak : null,
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        filterIsDeleted: filters.isDeleted !== undefined ? filters.isDeleted : false,
        filterUserRole: filters.userRole || null,
        searchTerm: search || null,
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };
      return await userManagementRepository.getUserLanguages(repoOptions);
    } catch (error) {
      logger.error('Error fetching user languages:', error);
      throw error;
    }
  }

  async getUserLanguageById(id) {
    try {
      if (!id) {
        throw new BadRequestError('User Language ID is required');
      }
      const userLanguage = await userManagementRepository.findUserLanguageById(id);
      if (!userLanguage) {
        throw new NotFoundError('User Language not found');
      }
      return userLanguage;
    } catch (error) {
      logger.error(`Error fetching user language with ID ${id}:`, error);
      throw error;
    }
  }

  async createUserLanguage(data, actingUserId) {
    try {
      // Validate required fields
      const requiredFields = ['userId', 'languageId'];
      for (const field of requiredFields) {
        if (!data[field]) {
          throw new BadRequestError(`${field} is required`);
        }
      }

      const userLanguageData = {
        userId: data.userId,
        languageId: data.languageId,
        proficiencyLevel: data.proficiencyLevel || 'BEGINNER',
        script: data.script || null,
        isPrimary: data.isPrimary !== undefined ? data.isPrimary : false,
        isNative: data.isNative !== undefined ? data.isNative : false,
        canRead: data.canRead !== undefined ? data.canRead : false,
        canWrite: data.canWrite !== undefined ? data.canWrite : false,
        canSpeak: data.canSpeak !== undefined ? data.canSpeak : false,
        isActive: data.isActive !== undefined ? data.isActive : true,
        isDeleted: data.isDeleted !== undefined ? data.isDeleted : false,
        createdBy: actingUserId,
      };

      return await userManagementRepository.createUserLanguage(userLanguageData);
    } catch (error) {
      logger.error('Error creating user language:', error);
      throw error;
    }
  }

  async updateUserLanguage(id, data, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('User Language ID is required');
      }

      // Verify entity exists first
      const existingUserLanguage = await userManagementRepository.findUserLanguageById(id);
      if (!existingUserLanguage) {
        throw new NotFoundError('User Language not found');
      }

      const updateData = {
        userId: data.userId !== undefined ? data.userId : existingUserLanguage.userId,
        languageId: data.languageId !== undefined ? data.languageId : existingUserLanguage.languageId,
        proficiencyLevel: data.proficiencyLevel !== undefined ? data.proficiencyLevel : existingUserLanguage.proficiencyLevel,
        script: data.script !== undefined ? data.script : existingUserLanguage.script,
        isPrimary: data.isPrimary !== undefined ? data.isPrimary : existingUserLanguage.isPrimary,
        isNative: data.isNative !== undefined ? data.isNative : existingUserLanguage.isNative,
        canRead: data.canRead !== undefined ? data.canRead : existingUserLanguage.canRead,
        canWrite: data.canWrite !== undefined ? data.canWrite : existingUserLanguage.canWrite,
        canSpeak: data.canSpeak !== undefined ? data.canSpeak : existingUserLanguage.canSpeak,
        isActive: data.isActive !== undefined ? data.isActive : existingUserLanguage.isActive,
        isDeleted: data.isDeleted !== undefined ? data.isDeleted : existingUserLanguage.isDeleted,
        updatedBy: actingUserId,
      };

      return await userManagementRepository.updateUserLanguage(id, updateData);
    } catch (error) {
      logger.error(`Error updating user language with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteUserLanguage(id, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('User Language ID is required');
      }

      // Verify entity exists first
      const existingUserLanguage = await userManagementRepository.findUserLanguageById(id);
      if (!existingUserLanguage) {
        throw new NotFoundError('User Language not found');
      }

      return await userManagementRepository.deleteUserLanguage(id, actingUserId);
    } catch (error) {
      logger.error(`Error deleting user language with ID ${id}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // USER DOCUMENTS ENTITY
  // ============================================================================

  async getUserDocuments(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;
      const repoOptions = {
        filterDocumentId: filters.documentId || null,
        filterDocumentTypeId: filters.documentTypeId || null,
        filterVerificationStatus: filters.verificationStatus || null,
        filterFileFormat: filters.fileFormat || null,
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        filterIsDeleted: filters.isDeleted !== undefined ? filters.isDeleted : false,
        filterUserRole: filters.userRole || null,
        searchTerm: search || null,
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };
      return await userManagementRepository.getUserDocuments(repoOptions);
    } catch (error) {
      logger.error('Error fetching user documents:', error);
      throw error;
    }
  }

  async getUserDocumentById(id) {
    try {
      if (!id) {
        throw new BadRequestError('User Document ID is required');
      }
      const userDocument = await userManagementRepository.findUserDocumentById(id);
      if (!userDocument) {
        throw new NotFoundError('User Document not found');
      }
      return userDocument;
    } catch (error) {
      logger.error(`Error fetching user document with ID ${id}:`, error);
      throw error;
    }
  }

  async createUserDocument(data, actingUserId) {
    try {
      // Validate required fields
      const requiredFields = ['userId', 'documentTypeId', 'documentId', 'fileUrl'];
      for (const field of requiredFields) {
        if (!data[field]) {
          throw new BadRequestError(`${field} is required`);
        }
      }

      const userDocumentData = {
        userId: data.userId,
        documentTypeId: data.documentTypeId,
        documentId: data.documentId,
        fileUrl: data.fileUrl,
        fileName: data.fileName || null,
        fileFormat: data.fileFormat || null,
        fileSize: data.fileSize || null,
        verificationStatus: data.verificationStatus || 'PENDING',
        expiryDate: data.expiryDate || null,
        uploadedDate: data.uploadedDate || new Date(),
        isActive: data.isActive !== undefined ? data.isActive : true,
        isDeleted: data.isDeleted !== undefined ? data.isDeleted : false,
        createdBy: actingUserId,
      };

      return await userManagementRepository.createUserDocument(userDocumentData);
    } catch (error) {
      logger.error('Error creating user document:', error);
      throw error;
    }
  }

  async updateUserDocument(id, data, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('User Document ID is required');
      }

      // Verify entity exists first
      const existingUserDocument = await userManagementRepository.findUserDocumentById(id);
      if (!existingUserDocument) {
        throw new NotFoundError('User Document not found');
      }

      const updateData = {
        userId: data.userId !== undefined ? data.userId : existingUserDocument.userId,
        documentTypeId: data.documentTypeId !== undefined ? data.documentTypeId : existingUserDocument.documentTypeId,
        documentId: data.documentId !== undefined ? data.documentId : existingUserDocument.documentId,
        fileUrl: data.fileUrl !== undefined ? data.fileUrl : existingUserDocument.fileUrl,
        fileName: data.fileName !== undefined ? data.fileName : existingUserDocument.fileName,
        fileFormat: data.fileFormat !== undefined ? data.fileFormat : existingUserDocument.fileFormat,
        fileSize: data.fileSize !== undefined ? data.fileSize : existingUserDocument.fileSize,
        verificationStatus: data.verificationStatus !== undefined ? data.verificationStatus : existingUserDocument.verificationStatus,
        expiryDate: data.expiryDate !== undefined ? data.expiryDate : existingUserDocument.expiryDate,
        uploadedDate: data.uploadedDate !== undefined ? data.uploadedDate : existingUserDocument.uploadedDate,
        isActive: data.isActive !== undefined ? data.isActive : existingUserDocument.isActive,
        isDeleted: data.isDeleted !== undefined ? data.isDeleted : existingUserDocument.isDeleted,
        updatedBy: actingUserId,
      };

      return await userManagementRepository.updateUserDocument(id, updateData);
    } catch (error) {
      logger.error(`Error updating user document with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteUserDocument(id, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('User Document ID is required');
      }

      // Verify entity exists first
      const existingUserDocument = await userManagementRepository.findUserDocumentById(id);
      if (!existingUserDocument) {
        throw new NotFoundError('User Document not found');
      }

      return await userManagementRepository.deleteUserDocument(id, actingUserId);
    } catch (error) {
      logger.error(`Error deleting user document with ID ${id}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // USER PROJECTS ENTITY
  // ============================================================================

  async getUserProjects(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;
      const repoOptions = {
        filterProjectType: filters.projectType || null,
        filterProjectStatus: filters.projectStatus || null,
        filterPlatform: filters.platform || null,
        filterIsOngoing: filters.isOngoing !== undefined ? filters.isOngoing : null,
        filterIsFeatured: filters.isFeatured !== undefined ? filters.isFeatured : null,
        filterIsPublished: filters.isPublished !== undefined ? filters.isPublished : null,
        filterIsSoloProject: filters.isSoloProject !== undefined ? filters.isSoloProject : null,
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        filterIsDeleted: filters.isDeleted !== undefined ? filters.isDeleted : false,
        filterUserRole: filters.userRole || null,
        searchTerm: search || null,
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };
      return await userManagementRepository.getUserProjects(repoOptions);
    } catch (error) {
      logger.error('Error fetching user projects:', error);
      throw error;
    }
  }

  async getUserProjectById(id) {
    try {
      if (!id) {
        throw new BadRequestError('User Project ID is required');
      }
      const userProject = await userManagementRepository.findUserProjectById(id);
      if (!userProject) {
        throw new NotFoundError('User Project not found');
      }
      return userProject;
    } catch (error) {
      logger.error(`Error fetching user project with ID ${id}:`, error);
      throw error;
    }
  }

  async createUserProject(data, actingUserId) {
    try {
      // Validate required fields
      const requiredFields = ['userId', 'projectTitle', 'startDate'];
      for (const field of requiredFields) {
        if (!data[field]) {
          throw new BadRequestError(`${field} is required`);
        }
      }

      const userProjectData = {
        userId: data.userId,
        projectTitle: data.projectTitle,
        startDate: data.startDate,
        endDate: data.endDate || null,
        description: data.description || null,
        projectType: data.projectType || null,
        projectStatus: data.projectStatus || 'IN_PROGRESS',
        platform: data.platform || null,
        technologies: data.technologies || null,
        projectUrl: data.projectUrl || null,
        repositoryUrl: data.repositoryUrl || null,
        teamSize: data.teamSize || 1,
        isOngoing: data.isOngoing !== undefined ? data.isOngoing : true,
        isFeatured: data.isFeatured !== undefined ? data.isFeatured : false,
        isPublished: data.isPublished !== undefined ? data.isPublished : false,
        isSoloProject: data.isSoloProject !== undefined ? data.isSoloProject : true,
        isActive: data.isActive !== undefined ? data.isActive : true,
        isDeleted: data.isDeleted !== undefined ? data.isDeleted : false,
        createdBy: actingUserId,
      };

      return await userManagementRepository.createUserProject(userProjectData);
    } catch (error) {
      logger.error('Error creating user project:', error);
      throw error;
    }
  }

  async updateUserProject(id, data, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('User Project ID is required');
      }

      // Verify entity exists first
      const existingUserProject = await userManagementRepository.findUserProjectById(id);
      if (!existingUserProject) {
        throw new NotFoundError('User Project not found');
      }

      const updateData = {
        userId: data.userId !== undefined ? data.userId : existingUserProject.userId,
        projectTitle: data.projectTitle !== undefined ? data.projectTitle : existingUserProject.projectTitle,
        startDate: data.startDate !== undefined ? data.startDate : existingUserProject.startDate,
        endDate: data.endDate !== undefined ? data.endDate : existingUserProject.endDate,
        description: data.description !== undefined ? data.description : existingUserProject.description,
        projectType: data.projectType !== undefined ? data.projectType : existingUserProject.projectType,
        projectStatus: data.projectStatus !== undefined ? data.projectStatus : existingUserProject.projectStatus,
        platform: data.platform !== undefined ? data.platform : existingUserProject.platform,
        technologies: data.technologies !== undefined ? data.technologies : existingUserProject.technologies,
        projectUrl: data.projectUrl !== undefined ? data.projectUrl : existingUserProject.projectUrl,
        repositoryUrl: data.repositoryUrl !== undefined ? data.repositoryUrl : existingUserProject.repositoryUrl,
        teamSize: data.teamSize !== undefined ? data.teamSize : existingUserProject.teamSize,
        isOngoing: data.isOngoing !== undefined ? data.isOngoing : existingUserProject.isOngoing,
        isFeatured: data.isFeatured !== undefined ? data.isFeatured : existingUserProject.isFeatured,
        isPublished: data.isPublished !== undefined ? data.isPublished : existingUserProject.isPublished,
        isSoloProject: data.isSoloProject !== undefined ? data.isSoloProject : existingUserProject.isSoloProject,
        isActive: data.isActive !== undefined ? data.isActive : existingUserProject.isActive,
        isDeleted: data.isDeleted !== undefined ? data.isDeleted : existingUserProject.isDeleted,
        updatedBy: actingUserId,
      };

      return await userManagementRepository.updateUserProject(id, updateData);
    } catch (error) {
      logger.error(`Error updating user project with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteUserProject(id, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('User Project ID is required');
      }

      // Verify entity exists first
      const existingUserProject = await userManagementRepository.findUserProjectById(id);
      if (!existingUserProject) {
        throw new NotFoundError('User Project not found');
      }

      return await userManagementRepository.deleteUserProject(id, actingUserId);
    } catch (error) {
      logger.error(`Error deleting user project with ID ${id}:`, error);
      throw error;
    }
  }
}

module.exports = new UserManagementService();
