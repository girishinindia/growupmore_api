const { supabase } = require('../config/database');
const logger = require('../config/logger');

class UserManagementRepository {
  // ============================================================================
  // USERS
  // ============================================================================

  async findUserById(id) {
    const { data, error } = await supabase.rpc('udf_get_users', {
      p_id: id,
      p_is_active: null,
      p_sort_column: 'id',
      p_sort_direction: 'ASC',
      p_filter_role: null,
      p_filter_is_active: null,
      p_filter_is_deleted: false,
      p_filter_is_email_verified: null,
      p_filter_is_mobile_verified: null,
      p_filter_country_id: null,
      p_filter_country_iso2: null,
      p_filter_country_nationality: null,
      p_search_term: null,
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.findUserById failed');
      throw error;
    }

    return data?.[0] || null;
  }

  async getUsers(options = {}) {
    const {
      sortColumn = 'id',
      sortDirection = 'ASC',
      filterRole = null,
      filterIsActive = null,
      filterIsEmailVerified = null,
      filterIsMobileVerified = null,
      filterCountryId = null,
      filterCountryIso2 = null,
      filterCountryNationality = null,
      searchTerm = null,
      pageIndex = 1,
      pageSize = null,
    } = options;

    const { data, error } = await supabase.rpc('udf_get_users', {
      p_id: null,
      p_is_active: null,
      p_sort_column: sortColumn,
      p_sort_direction: sortDirection,
      p_filter_role: filterRole || null,
      p_filter_is_active: filterIsActive || null,
      p_filter_is_deleted: false,
      p_filter_is_email_verified: filterIsEmailVerified || null,
      p_filter_is_mobile_verified: filterIsMobileVerified || null,
      p_filter_country_id: filterCountryId || null,
      p_filter_country_iso2: filterCountryIso2 || null,
      p_filter_country_nationality: filterCountryNationality || null,
      p_search_term: searchTerm || null,
      p_page_index: pageIndex,
      p_page_size: pageSize || null,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.getUsers failed');
      throw error;
    }

    return data || [];
  }

  async createUser(data) {
    const {
      countryId,
      firstName,
      lastName,
      password,
      email = null,
      mobile = null,
      role = 'student',
      isActive = true,
      isEmailVerified = false,
      isMobileVerified = false,
    } = data;

    const { data: result, error } = await supabase.rpc('sp_users_insert', {
      p_country_id: countryId,
      p_first_name: firstName,
      p_last_name: lastName,
      p_password: password,
      p_email: email || null,
      p_mobile: mobile || null,
      p_role: role,
      p_is_active: isActive,
      p_is_email_verified: isEmailVerified,
      p_is_mobile_verified: isMobileVerified,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.createUser failed');
      throw error;
    }

    return result;
  }

  async updateUser(id, data) {
    const {
      countryId = null,
      firstName = null,
      lastName = null,
      email = null,
      mobile = null,
      mobileNumber = null,
      password = null,
      role = null,
      isActive = null,
      isEmailVerified = null,
      isMobileVerified = null,
    } = data;

    const { error } = await supabase.rpc('sp_users_update', {
      p_id: id,
      p_country_id: countryId || null,
      p_first_name: firstName || null,
      p_last_name: lastName || null,
      p_email: email || null,
      p_mobile: mobile || mobileNumber || null,
      p_password: password || null,
      p_role: role || null,
      p_is_active: isActive !== null && isActive !== undefined ? isActive : null,
      p_is_email_verified: isEmailVerified !== null && isEmailVerified !== undefined ? isEmailVerified : null,
      p_is_mobile_verified: isMobileVerified !== null && isMobileVerified !== undefined ? isMobileVerified : null,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.updateUser failed');
      throw error;
    }
  }

  async deleteUser(id) {
    const { error } = await supabase.rpc('sp_users_delete', {
      p_id: id,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.deleteUser failed');
      throw error;
    }
  }

  async restoreUser(userId) {
    const { error } = await supabase.rpc('sp_users_restore', { p_id: userId });
    if (error) {
      logger.error({ error }, 'UserManagementRepository.restoreUser failed');
      throw error;
    }
  }

  // ============================================================================
  // USER PROFILES
  // ============================================================================

  async findUserProfileById(id) {
    const { data, error } = await supabase.rpc('udf_get_user_profiles', {
      p_id: id,
      p_user_id: null,
      p_is_active: null,
      p_sort_column: 'profile_id',
      p_sort_direction: 'ASC',
      p_filter_gender: null,
      p_filter_blood_group: null,
      p_filter_marital_status: null,
      p_filter_nationality: null,
      p_filter_is_profile_complete: null,
      p_filter_is_active: null,
      p_filter_is_deleted: false,
      p_filter_user_role: null,
      p_filter_user_is_active: null,
      p_filter_country_id: null,
      p_filter_state_id: null,
      p_filter_city_id: null,
      p_filter_preferred_language_id: null,
      p_filter_theme_preference: null,
      p_search_term: null,
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.findUserProfileById failed');
      throw error;
    }

    return data?.[0] || null;
  }

  async getUserProfiles(options = {}) {
    const {
      userId = null,
      sortColumn = 'profile_id',
      sortDirection = 'ASC',
      filterGender = null,
      filterBloodGroup = null,
      filterMaritalStatus = null,
      filterNationality = null,
      filterIsProfileComplete = null,
      filterIsActive = null,
      filterUserRole = null,
      filterUserIsActive = null,
      filterCountryId = null,
      filterStateId = null,
      filterCityId = null,
      filterPreferredLanguageId = null,
      filterThemePreference = null,
      searchTerm = null,
      pageIndex = 1,
      pageSize = null,
    } = options;

    const { data, error } = await supabase.rpc('udf_get_user_profiles', {
      p_id: null,
      p_user_id: userId || null,
      p_is_active: null,
      p_sort_column: sortColumn,
      p_sort_direction: sortDirection,
      p_filter_gender: filterGender || null,
      p_filter_blood_group: filterBloodGroup || null,
      p_filter_marital_status: filterMaritalStatus || null,
      p_filter_nationality: filterNationality || null,
      p_filter_is_profile_complete: filterIsProfileComplete || null,
      p_filter_is_active: filterIsActive || null,
      p_filter_is_deleted: false,
      p_filter_user_role: filterUserRole || null,
      p_filter_user_is_active: filterUserIsActive || null,
      p_filter_country_id: filterCountryId || null,
      p_filter_state_id: filterStateId || null,
      p_filter_city_id: filterCityId || null,
      p_filter_preferred_language_id: filterPreferredLanguageId || null,
      p_filter_theme_preference: filterThemePreference || null,
      p_search_term: searchTerm || null,
      p_page_index: pageIndex,
      p_page_size: pageSize || null,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.getUserProfiles failed');
      throw error;
    }

    return data || [];
  }

  async createUserProfile(data) {
    const {
      userId,
      dateOfBirth = null,
      gender = null,
      bloodGroup = null,
      maritalStatus = null,
      nationality = null,
      about = null,
      headline = null,
      profilePhotoUrl = null,
      coverPhotoUrl = null,
      addressLine1 = null,
      addressLine2 = null,
      landmark = null,
      countryId = null,
      stateId = null,
      cityId = null,
      pincode = null,
      currentAddressLine1 = null,
      currentAddressLine2 = null,
      currentLandmark = null,
      currentCountryId = null,
      currentStateId = null,
      currentCityId = null,
      currentPincode = null,
      isSameAsPermanent = false,
      alternateEmail = null,
      alternateMobile = null,
      whatsappNumber = null,
      emergencyContactName = null,
      emergencyContactPhone = null,
      emergencyContactRelation = null,
      aadharNumber = null,
      panNumber = null,
      passportNumber = null,
      bankName = null,
      bankAccountNumber = null,
      bankIfscCode = null,
      bankBranch = null,
      bankAccountType = 'savings',
      upiId = null,
      gstNumber = null,
      preferredLanguageId = null,
      timezone = 'Asia/Kolkata',
      themePreference = 'system',
      emailNotifications = true,
      smsNotifications = false,
      pushNotifications = true,
      isActive = true,
    } = data;

    const { data: result, error } = await supabase.rpc('sp_user_profiles_insert', {
      p_user_id: userId,
      p_date_of_birth: dateOfBirth || null,
      p_gender: gender || null,
      p_blood_group: bloodGroup || null,
      p_marital_status: maritalStatus || null,
      p_nationality: nationality || null,
      p_about: about || null,
      p_headline: headline || null,
      p_profile_photo_url: profilePhotoUrl || null,
      p_cover_photo_url: coverPhotoUrl || null,
      p_address_line_1: addressLine1 || null,
      p_address_line_2: addressLine2 || null,
      p_landmark: landmark || null,
      p_country_id: countryId || null,
      p_state_id: stateId || null,
      p_city_id: cityId || null,
      p_pincode: pincode || null,
      p_current_address_line_1: currentAddressLine1 || null,
      p_current_address_line_2: currentAddressLine2 || null,
      p_current_landmark: currentLandmark || null,
      p_current_country_id: currentCountryId || null,
      p_current_state_id: currentStateId || null,
      p_current_city_id: currentCityId || null,
      p_current_pincode: currentPincode || null,
      p_is_same_as_permanent: isSameAsPermanent,
      p_alternate_email: alternateEmail || null,
      p_alternate_mobile: alternateMobile || null,
      p_whatsapp_number: whatsappNumber || null,
      p_emergency_contact_name: emergencyContactName || null,
      p_emergency_contact_phone: emergencyContactPhone || null,
      p_emergency_contact_relation: emergencyContactRelation || null,
      p_aadhar_number: aadharNumber || null,
      p_pan_number: panNumber || null,
      p_passport_number: passportNumber || null,
      p_bank_name: bankName || null,
      p_bank_account_number: bankAccountNumber || null,
      p_bank_ifsc_code: bankIfscCode || null,
      p_bank_branch: bankBranch || null,
      p_bank_account_type: bankAccountType,
      p_upi_id: upiId || null,
      p_gst_number: gstNumber || null,
      p_preferred_language_id: preferredLanguageId || null,
      p_timezone: timezone,
      p_theme_preference: themePreference,
      p_email_notifications: emailNotifications,
      p_sms_notifications: smsNotifications,
      p_push_notifications: pushNotifications,
      p_is_active: isActive,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.createUserProfile failed');
      throw error;
    }

    return result;
  }

  async updateUserProfile(id, data) {
    const {
      dateOfBirth = null,
      gender = null,
      bloodGroup = null,
      maritalStatus = null,
      nationality = null,
      about = null,
      headline = null,
      profilePhotoUrl = null,
      coverPhotoUrl = null,
      addressLine1 = null,
      addressLine2 = null,
      landmark = null,
      countryId = null,
      stateId = null,
      cityId = null,
      pincode = null,
      currentAddressLine1 = null,
      currentAddressLine2 = null,
      currentLandmark = null,
      currentCountryId = null,
      currentStateId = null,
      currentCityId = null,
      currentPincode = null,
      isSameAsPermanent = null,
      alternateEmail = null,
      alternateMobile = null,
      whatsappNumber = null,
      emergencyContactName = null,
      emergencyContactPhone = null,
      emergencyContactRelation = null,
      aadharNumber = null,
      panNumber = null,
      passportNumber = null,
      bankName = null,
      bankAccountNumber = null,
      bankIfscCode = null,
      bankBranch = null,
      bankAccountType = null,
      upiId = null,
      gstNumber = null,
      preferredLanguageId = null,
      timezone = null,
      themePreference = null,
      emailNotifications = null,
      smsNotifications = null,
      pushNotifications = null,
      profileCompletion = null,
      isProfileComplete = null,
      isActive = null,
    } = data;

    const { error } = await supabase.rpc('sp_user_profiles_update', {
      p_id: id,
      p_date_of_birth: dateOfBirth || null,
      p_gender: gender || null,
      p_blood_group: bloodGroup || null,
      p_marital_status: maritalStatus || null,
      p_nationality: nationality || null,
      p_about: about || null,
      p_headline: headline || null,
      p_profile_photo_url: profilePhotoUrl || null,
      p_cover_photo_url: coverPhotoUrl || null,
      p_address_line_1: addressLine1 || null,
      p_address_line_2: addressLine2 || null,
      p_landmark: landmark || null,
      p_country_id: countryId || null,
      p_state_id: stateId || null,
      p_city_id: cityId || null,
      p_pincode: pincode || null,
      p_current_address_line_1: currentAddressLine1 || null,
      p_current_address_line_2: currentAddressLine2 || null,
      p_current_landmark: currentLandmark || null,
      p_current_country_id: currentCountryId || null,
      p_current_state_id: currentStateId || null,
      p_current_city_id: currentCityId || null,
      p_current_pincode: currentPincode || null,
      p_is_same_as_permanent: isSameAsPermanent || null,
      p_alternate_email: alternateEmail || null,
      p_alternate_mobile: alternateMobile || null,
      p_whatsapp_number: whatsappNumber || null,
      p_emergency_contact_name: emergencyContactName || null,
      p_emergency_contact_phone: emergencyContactPhone || null,
      p_emergency_contact_relation: emergencyContactRelation || null,
      p_aadhar_number: aadharNumber || null,
      p_pan_number: panNumber || null,
      p_passport_number: passportNumber || null,
      p_bank_name: bankName || null,
      p_bank_account_number: bankAccountNumber || null,
      p_bank_ifsc_code: bankIfscCode || null,
      p_bank_branch: bankBranch || null,
      p_bank_account_type: bankAccountType || null,
      p_upi_id: upiId || null,
      p_gst_number: gstNumber || null,
      p_preferred_language_id: preferredLanguageId || null,
      p_timezone: timezone || null,
      p_theme_preference: themePreference || null,
      p_email_notifications: emailNotifications || null,
      p_sms_notifications: smsNotifications || null,
      p_push_notifications: pushNotifications || null,
      p_profile_completion: profileCompletion || null,
      p_is_profile_complete: isProfileComplete || null,
      p_is_active: isActive || null,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.updateUserProfile failed');
      throw error;
    }
  }

  async deleteUserProfile(id) {
    const { error } = await supabase.rpc('sp_user_profiles_delete', {
      p_id: id,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.deleteUserProfile failed');
      throw error;
    }
  }

  async restoreUserProfile(id) {
    const { error } = await supabase.rpc('sp_user_profiles_restore', { p_id: id });
    if (error) {
      logger.error({ error }, 'UserManagementRepository.restoreUserProfile failed');
      throw error;
    }
  }

  // ============================================================================
  // USER EDUCATION
  // ============================================================================

  async findUserEducationById(id) {
    const { data, error } = await supabase.rpc('udf_get_user_education', {
      p_id: id,
      p_user_id: null,
      p_is_active: null,
      p_sort_table: 'edu',
      p_sort_column: 'id',
      p_sort_direction: 'ASC',
      p_filter_education_level_id: null,
      p_filter_level_category: null,
      p_filter_grade_type: null,
      p_filter_is_currently_studying: null,
      p_filter_is_highest: null,
      p_filter_is_active: null,
      p_filter_is_deleted: false,
      p_filter_user_role: null,
      p_filter_user_is_active: null,
      p_search_term: null,
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.findUserEducationById failed');
      throw error;
    }

    return data?.[0] || null;
  }

  async getUserEducation(options = {}) {
    const {
      userId = null,
      sortTable = 'edu',
      sortColumn = 'id',
      sortDirection = 'ASC',
      filterEducationLevelId = null,
      filterLevelCategory = null,
      filterGradeType = null,
      filterIsCurrentlyStudying = null,
      filterIsHighest = null,
      filterIsActive = null,
      filterUserRole = null,
      filterUserIsActive = null,
      searchTerm = null,
      pageIndex = 1,
      pageSize = null,
    } = options;

    const { data, error } = await supabase.rpc('udf_get_user_education', {
      p_id: null,
      p_user_id: userId || null,
      p_is_active: null,
      p_sort_table: sortTable,
      p_sort_column: sortColumn,
      p_sort_direction: sortDirection,
      p_filter_education_level_id: filterEducationLevelId || null,
      p_filter_level_category: filterLevelCategory || null,
      p_filter_grade_type: filterGradeType || null,
      p_filter_is_currently_studying: filterIsCurrentlyStudying || null,
      p_filter_is_highest: filterIsHighest || null,
      p_filter_is_active: filterIsActive || null,
      p_filter_is_deleted: false,
      p_filter_user_role: filterUserRole || null,
      p_filter_user_is_active: filterUserIsActive || null,
      p_search_term: searchTerm || null,
      p_page_index: pageIndex,
      p_page_size: pageSize || null,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.getUserEducation failed');
      throw error;
    }

    return data || [];
  }

  async createUserEducation(data) {
    const {
      userId,
      educationLevelId,
      institutionName,
      boardOrUniversity = null,
      fieldOfStudy = null,
      specialization = null,
      gradeOrPercentage = null,
      gradeType = null,
      startDate = null,
      endDate = null,
      isCurrentlyStudying = false,
      isHighestQualification = false,
      certificateUrl = null,
      description = null,
      isActive = true,
    } = data;

    const { data: result, error } = await supabase.rpc('sp_user_education_insert', {
      p_user_id: userId,
      p_education_level_id: educationLevelId,
      p_institution_name: institutionName,
      p_board_or_university: boardOrUniversity || null,
      p_field_of_study: fieldOfStudy || null,
      p_specialization: specialization || null,
      p_grade_or_percentage: gradeOrPercentage || null,
      p_grade_type: gradeType || null,
      p_start_date: startDate || null,
      p_end_date: endDate || null,
      p_is_currently_studying: isCurrentlyStudying,
      p_is_highest_qualification: isHighestQualification,
      p_certificate_url: certificateUrl || null,
      p_description: description || null,
      p_is_active: isActive,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.createUserEducation failed');
      throw error;
    }

    return result;
  }

  async updateUserEducation(id, data) {
    const {
      educationLevelId = null,
      institutionName = null,
      boardOrUniversity = null,
      fieldOfStudy = null,
      specialization = null,
      gradeOrPercentage = null,
      gradeType = null,
      startDate = null,
      endDate = null,
      isCurrentlyStudying = null,
      isHighestQualification = null,
      certificateUrl = null,
      description = null,
      isActive = null,
    } = data;

    const { error } = await supabase.rpc('sp_user_education_update', {
      p_id: id,
      p_education_level_id: educationLevelId || null,
      p_institution_name: institutionName || null,
      p_board_or_university: boardOrUniversity || null,
      p_field_of_study: fieldOfStudy || null,
      p_specialization: specialization || null,
      p_grade_or_percentage: gradeOrPercentage || null,
      p_grade_type: gradeType || null,
      p_start_date: startDate || null,
      p_end_date: endDate || null,
      p_is_currently_studying: isCurrentlyStudying || null,
      p_is_highest_qualification: isHighestQualification || null,
      p_certificate_url: certificateUrl || null,
      p_description: description || null,
      p_is_active: isActive || null,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.updateUserEducation failed');
      throw error;
    }
  }

  async deleteUserEducation(id) {
    const { error } = await supabase.rpc('sp_user_education_delete', {
      p_id: id,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.deleteUserEducation failed');
      throw error;
    }
  }

  async restoreUserEducation(id) {
    const { error } = await supabase.rpc('sp_user_education_restore', { p_id: id });
    if (error) {
      logger.error({ error }, 'UserManagementRepository.restoreUserEducation failed');
      throw error;
    }
  }

  // ============================================================================
  // USER EXPERIENCE
  // ============================================================================

  async findUserExperienceById(id) {
    const { data, error } = await supabase.rpc('udf_get_user_experience', {
      p_id: id,
      p_user_id: null,
      p_is_active: null,
      p_sort_table: 'exp',
      p_sort_column: 'id',
      p_sort_direction: 'ASC',
      p_filter_designation_id: null,
      p_filter_employment_type: null,
      p_filter_work_mode: null,
      p_filter_level_band: null,
      p_filter_is_current_job: null,
      p_filter_is_active: null,
      p_filter_is_deleted: false,
      p_filter_user_role: null,
      p_filter_user_is_active: null,
      p_search_term: null,
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.findUserExperienceById failed');
      throw error;
    }

    return data?.[0] || null;
  }

  async getUserExperience(options = {}) {
    const {
      userId = null,
      sortTable = 'exp',
      sortColumn = 'id',
      sortDirection = 'ASC',
      filterDesignationId = null,
      filterEmploymentType = null,
      filterWorkMode = null,
      filterLevelBand = null,
      filterIsCurrentJob = null,
      filterIsActive = null,
      filterUserRole = null,
      filterUserIsActive = null,
      searchTerm = null,
      pageIndex = 1,
      pageSize = null,
    } = options;

    const { data, error } = await supabase.rpc('udf_get_user_experience', {
      p_id: null,
      p_user_id: userId || null,
      p_is_active: null,
      p_sort_table: sortTable,
      p_sort_column: sortColumn,
      p_sort_direction: sortDirection,
      p_filter_designation_id: filterDesignationId || null,
      p_filter_employment_type: filterEmploymentType || null,
      p_filter_work_mode: filterWorkMode || null,
      p_filter_level_band: filterLevelBand || null,
      p_filter_is_current_job: filterIsCurrentJob || null,
      p_filter_is_active: filterIsActive || null,
      p_filter_is_deleted: false,
      p_filter_user_role: filterUserRole || null,
      p_filter_user_is_active: filterUserIsActive || null,
      p_search_term: searchTerm || null,
      p_page_index: pageIndex,
      p_page_size: pageSize || null,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.getUserExperience failed');
      throw error;
    }

    return data || [];
  }

  async createUserExperience(data) {
    const {
      userId,
      companyName,
      jobTitle,
      startDate,
      designationId = null,
      employmentType = 'full_time',
      department = null,
      location = null,
      workMode = 'on_site',
      endDate = null,
      isCurrentJob = false,
      description = null,
      keyAchievements = null,
      skillsUsed = null,
      salaryRange = null,
      referenceName = null,
      referencePhone = null,
      referenceEmail = null,
      isActive = true,
    } = data;

    const { data: result, error } = await supabase.rpc('sp_user_experience_insert', {
      p_user_id: userId,
      p_company_name: companyName,
      p_job_title: jobTitle,
      p_start_date: startDate,
      p_designation_id: designationId || null,
      p_employment_type: employmentType,
      p_department: department || null,
      p_location: location || null,
      p_work_mode: workMode,
      p_end_date: endDate || null,
      p_is_current_job: isCurrentJob,
      p_description: description || null,
      p_key_achievements: keyAchievements || null,
      p_skills_used: skillsUsed || null,
      p_salary_range: salaryRange || null,
      p_reference_name: referenceName || null,
      p_reference_phone: referencePhone || null,
      p_reference_email: referenceEmail || null,
      p_is_active: isActive,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.createUserExperience failed');
      throw error;
    }

    return result;
  }

  async updateUserExperience(id, data) {
    const {
      designationId = null,
      companyName = null,
      jobTitle = null,
      employmentType = null,
      department = null,
      location = null,
      workMode = null,
      startDate = null,
      endDate = null,
      isCurrentJob = null,
      description = null,
      keyAchievements = null,
      skillsUsed = null,
      salaryRange = null,
      referenceName = null,
      referencePhone = null,
      referenceEmail = null,
      isActive = null,
    } = data;

    const { error } = await supabase.rpc('sp_user_experience_update', {
      p_id: id,
      p_designation_id: designationId || null,
      p_company_name: companyName || null,
      p_job_title: jobTitle || null,
      p_employment_type: employmentType || null,
      p_department: department || null,
      p_location: location || null,
      p_work_mode: workMode || null,
      p_start_date: startDate || null,
      p_end_date: endDate || null,
      p_is_current_job: isCurrentJob || null,
      p_description: description || null,
      p_key_achievements: keyAchievements || null,
      p_skills_used: skillsUsed || null,
      p_salary_range: salaryRange || null,
      p_reference_name: referenceName || null,
      p_reference_phone: referencePhone || null,
      p_reference_email: referenceEmail || null,
      p_is_active: isActive || null,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.updateUserExperience failed');
      throw error;
    }
  }

  async deleteUserExperience(id) {
    const { error } = await supabase.rpc('sp_user_experience_delete', {
      p_id: id,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.deleteUserExperience failed');
      throw error;
    }
  }

  async restoreUserExperience(id) {
    const { error } = await supabase.rpc('sp_user_experience_restore', { p_id: id });
    if (error) {
      logger.error({ error }, 'UserManagementRepository.restoreUserExperience failed');
      throw error;
    }
  }

  // ============================================================================
  // USER SOCIAL MEDIAS
  // ============================================================================

  async findUserSocialMediaById(id) {
    const { data, error } = await supabase.rpc('udf_get_user_social_medias', {
      p_id: id,
      p_user_id: null,
      p_is_active: null,
      p_sort_table: 'usm',
      p_sort_column: 'id',
      p_sort_direction: 'ASC',
      p_filter_social_media_id: null,
      p_filter_platform_type: null,
      p_filter_is_primary: null,
      p_filter_is_verified: null,
      p_filter_is_active: null,
      p_filter_is_deleted: false,
      p_filter_user_role: null,
      p_filter_user_is_active: null,
      p_search_term: null,
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.findUserSocialMediaById failed');
      throw error;
    }

    return data?.[0] || null;
  }

  async getUserSocialMedias(options = {}) {
    const {
      userId = null,
      sortTable = 'usm',
      sortColumn = 'id',
      sortDirection = 'ASC',
      filterSocialMediaId = null,
      filterPlatformType = null,
      filterIsPrimary = null,
      filterIsVerified = null,
      filterIsActive = null,
      filterUserRole = null,
      filterUserIsActive = null,
      searchTerm = null,
      pageIndex = 1,
      pageSize = null,
    } = options;

    const { data, error } = await supabase.rpc('udf_get_user_social_medias', {
      p_id: null,
      p_user_id: userId || null,
      p_is_active: null,
      p_sort_table: sortTable,
      p_sort_column: sortColumn,
      p_sort_direction: sortDirection,
      p_filter_social_media_id: filterSocialMediaId || null,
      p_filter_platform_type: filterPlatformType || null,
      p_filter_is_primary: filterIsPrimary || null,
      p_filter_is_verified: filterIsVerified || null,
      p_filter_is_active: filterIsActive || null,
      p_filter_is_deleted: false,
      p_filter_user_role: filterUserRole || null,
      p_filter_user_is_active: filterUserIsActive || null,
      p_search_term: searchTerm || null,
      p_page_index: pageIndex,
      p_page_size: pageSize || null,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.getUserSocialMedias failed');
      throw error;
    }

    return data || [];
  }

  async createUserSocialMedia(data) {
    const {
      userId,
      socialMediaId,
      profileUrl,
      username = null,
      isPrimary = false,
      isVerified = false,
      isActive = true,
      userIdInsert = null,
    } = data;

    const { data: result, error } = await supabase.rpc('sp_user_social_medias_insert', {
      p_user_id: userId,
      p_social_media_id: socialMediaId,
      p_profile_url: profileUrl,
      p_username: username || null,
      p_is_primary: isPrimary,
      p_is_verified: isVerified,
      p_is_active: isActive,
      p_user_id_insert: userIdInsert || null,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.createUserSocialMedia failed');
      throw error;
    }

    return result;
  }

  async updateUserSocialMedia(id, data) {
    const {
      socialMediaId = null,
      profileUrl = null,
      username = null,
      isPrimary = null,
      isVerified = null,
      isActive = null,
    } = data;

    const { error } = await supabase.rpc('sp_user_social_medias_update', {
      p_id: id,
      p_social_media_id: socialMediaId || null,
      p_profile_url: profileUrl || null,
      p_username: username || null,
      p_is_primary: isPrimary || null,
      p_is_verified: isVerified || null,
      p_is_active: isActive || null,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.updateUserSocialMedia failed');
      throw error;
    }
  }

  async deleteUserSocialMedia(id) {
    const { error } = await supabase.rpc('sp_user_social_medias_delete', {
      p_id: id,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.deleteUserSocialMedia failed');
      throw error;
    }
  }

  async restoreUserSocialMedia(id) {
    const { error } = await supabase.rpc('sp_user_social_medias_restore', { p_id: id });
    if (error) {
      logger.error({ error }, 'UserManagementRepository.restoreUserSocialMedia failed');
      throw error;
    }
  }

  // ============================================================================
  // USER SKILLS
  // ============================================================================

  async findUserSkillById(id) {
    const { data, error } = await supabase.rpc('udf_get_user_skills', {
      p_id: id,
      p_user_id: null,
      p_is_active: null,
      p_sort_table: 'uskill',
      p_sort_column: 'id',
      p_sort_direction: 'ASC',
      p_filter_skill_id: null,
      p_filter_proficiency_level: null,
      p_filter_skill_category: null,
      p_filter_is_primary: null,
      p_filter_is_active: null,
      p_filter_is_deleted: false,
      p_filter_min_experience: null,
      p_filter_user_role: null,
      p_filter_user_is_active: null,
      p_search_term: null,
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.findUserSkillById failed');
      throw error;
    }

    return data?.[0] || null;
  }

  async getUserSkills(options = {}) {
    const {
      userId = null,
      sortTable = 'uskill',
      sortColumn = 'id',
      sortDirection = 'ASC',
      filterSkillId = null,
      filterProficiencyLevel = null,
      filterSkillCategory = null,
      filterIsPrimary = null,
      filterIsActive = null,
      filterMinExperience = null,
      filterUserRole = null,
      filterUserIsActive = null,
      searchTerm = null,
      pageIndex = 1,
      pageSize = null,
    } = options;

    const { data, error } = await supabase.rpc('udf_get_user_skills', {
      p_id: null,
      p_user_id: userId || null,
      p_is_active: null,
      p_sort_table: sortTable,
      p_sort_column: sortColumn,
      p_sort_direction: sortDirection,
      p_filter_skill_id: filterSkillId || null,
      p_filter_proficiency_level: filterProficiencyLevel || null,
      p_filter_skill_category: filterSkillCategory || null,
      p_filter_is_primary: filterIsPrimary || null,
      p_filter_is_active: filterIsActive || null,
      p_filter_is_deleted: false,
      p_filter_min_experience: filterMinExperience || null,
      p_filter_user_role: filterUserRole || null,
      p_filter_user_is_active: filterUserIsActive || null,
      p_search_term: searchTerm || null,
      p_page_index: pageIndex,
      p_page_size: pageSize || null,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.getUserSkills failed');
      throw error;
    }

    return data || [];
  }

  async createUserSkill(data) {
    const {
      userId,
      skillId,
      proficiencyLevel = 'beginner',
      yearsOfExperience = null,
      isPrimary = false,
      certificateUrl = null,
      endorsementCount = 0,
      isActive = true,
      userIdInsert = null,
    } = data;

    const { data: result, error } = await supabase.rpc('sp_user_skills_insert', {
      p_user_id: userId,
      p_skill_id: skillId,
      p_proficiency_level: proficiencyLevel,
      p_years_of_experience: yearsOfExperience || null,
      p_is_primary: isPrimary,
      p_certificate_url: certificateUrl || null,
      p_endorsement_count: endorsementCount,
      p_is_active: isActive,
      p_user_id_insert: userIdInsert || null,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.createUserSkill failed');
      throw error;
    }

    return result;
  }

  async updateUserSkill(id, data) {
    const {
      skillId = null,
      proficiencyLevel = null,
      yearsOfExperience = null,
      isPrimary = null,
      certificateUrl = null,
      endorsementCount = null,
      isActive = null,
    } = data;

    const { error } = await supabase.rpc('sp_user_skills_update', {
      p_id: id,
      p_skill_id: skillId || null,
      p_proficiency_level: proficiencyLevel || null,
      p_years_of_experience: yearsOfExperience || null,
      p_is_primary: isPrimary || null,
      p_certificate_url: certificateUrl || null,
      p_endorsement_count: endorsementCount || null,
      p_is_active: isActive || null,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.updateUserSkill failed');
      throw error;
    }
  }

  async deleteUserSkill(id) {
    const { error } = await supabase.rpc('sp_user_skills_delete', {
      p_id: id,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.deleteUserSkill failed');
      throw error;
    }
  }

  async restoreUserSkill(id) {
    const { error } = await supabase.rpc('sp_user_skills_restore', { p_id: id });
    if (error) {
      logger.error({ error }, 'UserManagementRepository.restoreUserSkill failed');
      throw error;
    }
  }

  // ============================================================================
  // USER LANGUAGES
  // ============================================================================

  async findUserLanguageById(id) {
    const { data, error } = await supabase.rpc('udf_get_user_languages', {
      p_id: id,
      p_user_id: null,
      p_is_active: null,
      p_sort_table: 'ulang',
      p_sort_column: 'id',
      p_sort_direction: 'ASC',
      p_filter_language_id: null,
      p_filter_proficiency_level: null,
      p_filter_script: null,
      p_filter_is_primary: null,
      p_filter_is_native: null,
      p_filter_can_read: null,
      p_filter_can_write: null,
      p_filter_can_speak: null,
      p_filter_is_active: null,
      p_filter_is_deleted: false,
      p_filter_user_role: null,
      p_filter_user_is_active: null,
      p_search_term: null,
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.findUserLanguageById failed');
      throw error;
    }

    return data?.[0] || null;
  }

  async getUserLanguages(options = {}) {
    const {
      userId = null,
      sortTable = 'ulang',
      sortColumn = 'id',
      sortDirection = 'ASC',
      filterLanguageId = null,
      filterProficiencyLevel = null,
      filterScript = null,
      filterIsPrimary = null,
      filterIsNative = null,
      filterCanRead = null,
      filterCanWrite = null,
      filterCanSpeak = null,
      filterIsActive = null,
      filterUserRole = null,
      filterUserIsActive = null,
      searchTerm = null,
      pageIndex = 1,
      pageSize = null,
    } = options;

    const { data, error } = await supabase.rpc('udf_get_user_languages', {
      p_id: null,
      p_user_id: userId || null,
      p_is_active: null,
      p_sort_table: sortTable,
      p_sort_column: sortColumn,
      p_sort_direction: sortDirection,
      p_filter_language_id: filterLanguageId || null,
      p_filter_proficiency_level: filterProficiencyLevel || null,
      p_filter_script: filterScript || null,
      p_filter_is_primary: filterIsPrimary || null,
      p_filter_is_native: filterIsNative || null,
      p_filter_can_read: filterCanRead || null,
      p_filter_can_write: filterCanWrite || null,
      p_filter_can_speak: filterCanSpeak || null,
      p_filter_is_active: filterIsActive || null,
      p_filter_is_deleted: false,
      p_filter_user_role: filterUserRole || null,
      p_filter_user_is_active: filterUserIsActive || null,
      p_search_term: searchTerm || null,
      p_page_index: pageIndex,
      p_page_size: pageSize || null,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.getUserLanguages failed');
      throw error;
    }

    return data || [];
  }

  async createUserLanguage(data) {
    const {
      userId,
      languageId,
      proficiencyLevel = 'basic',
      canRead = false,
      canWrite = false,
      canSpeak = false,
      isPrimary = false,
      isNative = false,
      isActive = true,
      userIdInsert = null,
    } = data;

    const { data: result, error } = await supabase.rpc('sp_user_languages_insert', {
      p_user_id: userId,
      p_language_id: languageId,
      p_proficiency_level: proficiencyLevel,
      p_can_read: canRead,
      p_can_write: canWrite,
      p_can_speak: canSpeak,
      p_is_primary: isPrimary,
      p_is_native: isNative,
      p_is_active: isActive,
      p_user_id_insert: userIdInsert || null,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.createUserLanguage failed');
      throw error;
    }

    return result;
  }

  async updateUserLanguage(id, data) {
    const {
      languageId = null,
      proficiencyLevel = null,
      canRead = null,
      canWrite = null,
      canSpeak = null,
      isPrimary = null,
      isNative = null,
      isActive = null,
    } = data;

    const { error } = await supabase.rpc('sp_user_languages_update', {
      p_id: id,
      p_language_id: languageId || null,
      p_proficiency_level: proficiencyLevel || null,
      p_can_read: canRead || null,
      p_can_write: canWrite || null,
      p_can_speak: canSpeak || null,
      p_is_primary: isPrimary || null,
      p_is_native: isNative || null,
      p_is_active: isActive || null,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.updateUserLanguage failed');
      throw error;
    }
  }

  async deleteUserLanguage(id) {
    const { error } = await supabase.rpc('sp_user_languages_delete', {
      p_id: id,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.deleteUserLanguage failed');
      throw error;
    }
  }

  async restoreUserLanguage(id) {
    const { error } = await supabase.rpc('sp_user_languages_restore', { p_id: id });
    if (error) {
      logger.error({ error }, 'UserManagementRepository.restoreUserLanguage failed');
      throw error;
    }
  }

  // ============================================================================
  // USER DOCUMENTS
  // ============================================================================

  async findUserDocumentById(id) {
    const { data, error } = await supabase.rpc('udf_get_user_documents', {
      p_id: id,
      p_user_id: null,
      p_is_active: null,
      p_sort_table: 'udoc',
      p_sort_column: 'id',
      p_sort_direction: 'ASC',
      p_filter_document_id: null,
      p_filter_document_type_id: null,
      p_filter_verification_status: null,
      p_filter_file_format: null,
      p_filter_is_active: null,
      p_filter_is_deleted: false,
      p_filter_user_role: null,
      p_filter_user_is_active: null,
      p_search_term: null,
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.findUserDocumentById failed');
      throw error;
    }

    return data?.[0] || null;
  }

  async getUserDocuments(options = {}) {
    const {
      userId = null,
      sortTable = 'udoc',
      sortColumn = 'id',
      sortDirection = 'ASC',
      filterDocumentId = null,
      filterDocumentTypeId = null,
      filterVerificationStatus = null,
      filterFileFormat = null,
      filterIsActive = null,
      filterUserRole = null,
      filterUserIsActive = null,
      searchTerm = null,
      pageIndex = 1,
      pageSize = null,
    } = options;

    const { data, error } = await supabase.rpc('udf_get_user_documents', {
      p_id: null,
      p_user_id: userId || null,
      p_is_active: null,
      p_sort_table: sortTable,
      p_sort_column: sortColumn,
      p_sort_direction: sortDirection,
      p_filter_document_id: filterDocumentId || null,
      p_filter_document_type_id: filterDocumentTypeId || null,
      p_filter_verification_status: filterVerificationStatus || null,
      p_filter_file_format: filterFileFormat || null,
      p_filter_is_active: filterIsActive || null,
      p_filter_is_deleted: false,
      p_filter_user_role: filterUserRole || null,
      p_filter_user_is_active: filterUserIsActive || null,
      p_search_term: searchTerm || null,
      p_page_index: pageIndex,
      p_page_size: pageSize || null,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.getUserDocuments failed');
      throw error;
    }

    return data || [];
  }

  async createUserDocument(data) {
    const {
      userId,
      documentTypeId,
      documentId,
      fileUrl,
      documentNumber = null,
      fileName = null,
      fileSizeKb = null,
      fileFormat = null,
      issueDate = null,
      expiryDate = null,
      issuingAuthority = null,
      verificationStatus = 'pending',
      isActive = true,
      userIdInsert = null,
    } = data;

    const { data: result, error } = await supabase.rpc('sp_user_documents_insert', {
      p_user_id: userId,
      p_document_type_id: documentTypeId,
      p_document_id: documentId,
      p_file_url: fileUrl,
      p_document_number: documentNumber || null,
      p_file_name: fileName || null,
      p_file_size_kb: fileSizeKb || null,
      p_file_format: fileFormat || null,
      p_issue_date: issueDate || null,
      p_expiry_date: expiryDate || null,
      p_issuing_authority: issuingAuthority || null,
      p_verification_status: verificationStatus,
      p_is_active: isActive,
      p_user_id_insert: userIdInsert || null,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.createUserDocument failed');
      throw error;
    }

    return result;
  }

  async updateUserDocument(id, data) {
    const {
      documentTypeId = null,
      documentId = null,
      documentNumber = null,
      fileUrl = null,
      fileName = null,
      fileSizeKb = null,
      fileFormat = null,
      issueDate = null,
      expiryDate = null,
      issuingAuthority = null,
      verificationStatus = null,
      verifiedBy = null,
      verifiedAt = null,
      rejectionReason = null,
      adminNotes = null,
      isActive = null,
    } = data;

    const { error } = await supabase.rpc('sp_user_documents_update', {
      p_id: id,
      p_document_type_id: documentTypeId || null,
      p_document_id: documentId || null,
      p_document_number: documentNumber || null,
      p_file_url: fileUrl || null,
      p_file_name: fileName || null,
      p_file_size_kb: fileSizeKb || null,
      p_file_format: fileFormat || null,
      p_issue_date: issueDate || null,
      p_expiry_date: expiryDate || null,
      p_issuing_authority: issuingAuthority || null,
      p_verification_status: verificationStatus || null,
      p_verified_by: verifiedBy || null,
      p_verified_at: verifiedAt || null,
      p_rejection_reason: rejectionReason || null,
      p_admin_notes: adminNotes || null,
      p_is_active: isActive || null,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.updateUserDocument failed');
      throw error;
    }
  }

  async deleteUserDocument(id) {
    const { error } = await supabase.rpc('sp_user_documents_delete', {
      p_id: id,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.deleteUserDocument failed');
      throw error;
    }
  }

  async restoreUserDocument(id) {
    const { error } = await supabase.rpc('sp_user_documents_restore', { p_id: id });
    if (error) {
      logger.error({ error }, 'UserManagementRepository.restoreUserDocument failed');
      throw error;
    }
  }

  // ============================================================================
  // USER PROJECTS
  // ============================================================================

  async findUserProjectById(id) {
    const { data, error } = await supabase.rpc('udf_get_user_projects', {
      p_id: id,
      p_user_id: null,
      p_is_active: null,
      p_sort_table: 'proj',
      p_sort_column: 'id',
      p_sort_direction: 'ASC',
      p_filter_project_type: null,
      p_filter_project_status: null,
      p_filter_platform: null,
      p_filter_is_ongoing: null,
      p_filter_is_featured: null,
      p_filter_is_published: null,
      p_filter_is_solo_project: null,
      p_filter_is_active: null,
      p_filter_is_deleted: false,
      p_filter_user_role: null,
      p_filter_user_is_active: null,
      p_search_term: null,
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.findUserProjectById failed');
      throw error;
    }

    return data?.[0] || null;
  }

  async getUserProjects(options = {}) {
    const {
      userId = null,
      sortTable = 'proj',
      sortColumn = 'id',
      sortDirection = 'ASC',
      filterProjectType = null,
      filterProjectStatus = null,
      filterPlatform = null,
      filterIsOngoing = null,
      filterIsFeatured = null,
      filterIsPublished = null,
      filterIsSoloProject = null,
      filterIsActive = null,
      filterUserRole = null,
      filterUserIsActive = null,
      searchTerm = null,
      pageIndex = 1,
      pageSize = null,
    } = options;

    const { data, error } = await supabase.rpc('udf_get_user_projects', {
      p_id: null,
      p_user_id: userId || null,
      p_is_active: null,
      p_sort_table: sortTable,
      p_sort_column: sortColumn,
      p_sort_direction: sortDirection,
      p_filter_project_type: filterProjectType || null,
      p_filter_project_status: filterProjectStatus || null,
      p_filter_platform: filterPlatform || null,
      p_filter_is_ongoing: filterIsOngoing || null,
      p_filter_is_featured: filterIsFeatured || null,
      p_filter_is_published: filterIsPublished || null,
      p_filter_is_solo_project: filterIsSoloProject || null,
      p_filter_is_active: filterIsActive || null,
      p_filter_is_deleted: false,
      p_filter_user_role: filterUserRole || null,
      p_filter_user_is_active: filterUserIsActive || null,
      p_search_term: searchTerm || null,
      p_page_index: pageIndex,
      p_page_size: pageSize || null,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.getUserProjects failed');
      throw error;
    }

    return data || [];
  }

  async createUserProject(data) {
    const {
      userId,
      projectTitle,
      startDate,
      projectCode = null,
      projectType = 'personal',
      description = null,
      objectives = null,
      roleInProject = null,
      responsibilities = null,
      teamSize = null,
      isSoloProject = false,
      organizationName = null,
      clientName = null,
      industry = null,
      technologiesUsed = null,
      toolsUsed = null,
      programmingLanguages = null,
      frameworks = null,
      databasesUsed = null,
      platform = null,
      endDate = null,
      isOngoing = false,
      durationMonths = null,
      projectStatus = 'completed',
      keyAchievements = null,
      challengesFaced = null,
      lessonsLearned = null,
      impactSummary = null,
      usersServed = null,
      projectUrl = null,
      repositoryUrl = null,
      demoUrl = null,
      documentationUrl = null,
      thumbnailUrl = null,
      caseStudyUrl = null,
      isFeatured = false,
      isPublished = false,
      awards = null,
      certifications = null,
      referenceName = null,
      referenceEmail = null,
      referencePhone = null,
      displayOrder = 0,
      isActive = true,
      userIdInsert = null,
    } = data;

    const { data: result, error } = await supabase.rpc('sp_user_projects_insert', {
      p_user_id: userId,
      p_project_title: projectTitle,
      p_start_date: startDate,
      p_project_code: projectCode || null,
      p_project_type: projectType,
      p_description: description || null,
      p_objectives: objectives || null,
      p_role_in_project: roleInProject || null,
      p_responsibilities: responsibilities || null,
      p_team_size: teamSize || null,
      p_is_solo_project: isSoloProject,
      p_organization_name: organizationName || null,
      p_client_name: clientName || null,
      p_industry: industry || null,
      p_technologies_used: technologiesUsed || null,
      p_tools_used: toolsUsed || null,
      p_programming_languages: programmingLanguages || null,
      p_frameworks: frameworks || null,
      p_databases_used: databasesUsed || null,
      p_platform: platform || null,
      p_end_date: endDate || null,
      p_is_ongoing: isOngoing,
      p_duration_months: durationMonths || null,
      p_project_status: projectStatus,
      p_key_achievements: keyAchievements || null,
      p_challenges_faced: challengesFaced || null,
      p_lessons_learned: lessonsLearned || null,
      p_impact_summary: impactSummary || null,
      p_users_served: usersServed || null,
      p_project_url: projectUrl || null,
      p_repository_url: repositoryUrl || null,
      p_demo_url: demoUrl || null,
      p_documentation_url: documentationUrl || null,
      p_thumbnail_url: thumbnailUrl || null,
      p_case_study_url: caseStudyUrl || null,
      p_is_featured: isFeatured,
      p_is_published: isPublished,
      p_awards: awards || null,
      p_certifications: certifications || null,
      p_reference_name: referenceName || null,
      p_reference_email: referenceEmail || null,
      p_reference_phone: referencePhone || null,
      p_display_order: displayOrder,
      p_is_active: isActive,
      p_user_id_insert: userIdInsert || null,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.createUserProject failed');
      throw error;
    }

    return result;
  }

  async updateUserProject(id, data) {
    const {
      projectTitle = null,
      projectCode = null,
      projectType = null,
      description = null,
      objectives = null,
      roleInProject = null,
      responsibilities = null,
      teamSize = null,
      isSoloProject = null,
      organizationName = null,
      clientName = null,
      industry = null,
      technologiesUsed = null,
      toolsUsed = null,
      programmingLanguages = null,
      frameworks = null,
      databasesUsed = null,
      platform = null,
      startDate = null,
      endDate = null,
      isOngoing = null,
      durationMonths = null,
      projectStatus = null,
      keyAchievements = null,
      challengesFaced = null,
      lessonsLearned = null,
      impactSummary = null,
      usersServed = null,
      projectUrl = null,
      repositoryUrl = null,
      demoUrl = null,
      documentationUrl = null,
      thumbnailUrl = null,
      caseStudyUrl = null,
      isFeatured = null,
      isPublished = null,
      awards = null,
      certifications = null,
      referenceName = null,
      referenceEmail = null,
      referencePhone = null,
      displayOrder = null,
      isActive = null,
    } = data;

    const { error } = await supabase.rpc('sp_user_projects_update', {
      p_id: id,
      p_project_title: projectTitle || null,
      p_project_code: projectCode || null,
      p_project_type: projectType || null,
      p_description: description || null,
      p_objectives: objectives || null,
      p_role_in_project: roleInProject || null,
      p_responsibilities: responsibilities || null,
      p_team_size: teamSize || null,
      p_is_solo_project: isSoloProject || null,
      p_organization_name: organizationName || null,
      p_client_name: clientName || null,
      p_industry: industry || null,
      p_technologies_used: technologiesUsed || null,
      p_tools_used: toolsUsed || null,
      p_programming_languages: programmingLanguages || null,
      p_frameworks: frameworks || null,
      p_databases_used: databasesUsed || null,
      p_platform: platform || null,
      p_start_date: startDate || null,
      p_end_date: endDate || null,
      p_is_ongoing: isOngoing || null,
      p_duration_months: durationMonths || null,
      p_project_status: projectStatus || null,
      p_key_achievements: keyAchievements || null,
      p_challenges_faced: challengesFaced || null,
      p_lessons_learned: lessonsLearned || null,
      p_impact_summary: impactSummary || null,
      p_users_served: usersServed || null,
      p_project_url: projectUrl || null,
      p_repository_url: repositoryUrl || null,
      p_demo_url: demoUrl || null,
      p_documentation_url: documentationUrl || null,
      p_thumbnail_url: thumbnailUrl || null,
      p_case_study_url: caseStudyUrl || null,
      p_is_featured: isFeatured || null,
      p_is_published: isPublished || null,
      p_awards: awards || null,
      p_certifications: certifications || null,
      p_reference_name: referenceName || null,
      p_reference_email: referenceEmail || null,
      p_reference_phone: referencePhone || null,
      p_display_order: displayOrder || null,
      p_is_active: isActive || null,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.updateUserProject failed');
      throw error;
    }
  }

  async deleteUserProject(id) {
    const { error } = await supabase.rpc('sp_user_projects_delete', {
      p_id: id,
    });

    if (error) {
      logger.error({ error }, 'UserManagementRepository.deleteUserProject failed');
      throw error;
    }
  }

  async restoreUserProject(id) {
    const { error } = await supabase.rpc('sp_user_projects_restore', { p_id: id });
    if (error) {
      logger.error({ error }, 'UserManagementRepository.restoreUserProject failed');
      throw error;
    }
  }
}

module.exports = new UserManagementRepository();
