/**
 * ═══════════════════════════════════════════════════════════════
 * COURSE MANAGEMENT REPOSITORY — Database Layer (Supabase RPC)
 * ═══════════════════════════════════════════════════════════════
 * Handles Courses, Translations, Modules, Topics, Sub-Categories,
 * Subjects, Chapters, Instructors, Bundles, and Bundle Courses via:
 *
 *   COURSES:
 *   - udf_get_courses                — read, search, filter, paginate
 *   - sp_courses_insert              — create, returns new id (BIGINT)
 *   - sp_courses_update              — update, returns void
 *   - sp_courses_delete              — soft delete, returns void
 *   - sp_courses_restore             — restore, returns void
 *
 *   COURSE TRANSLATIONS:
 *   - sp_course_translations_insert  — create, returns void
 *   - sp_course_translations_update  — update, returns void
 *   - sp_course_translations_delete  — soft delete, returns void
 *   - sp_course_translations_restore — restore, returns void
 *
 *   COURSE MODULES:
 *   - udf_get_course_modules         — read, search, filter, paginate
 *   - sp_course_modules_insert       — create, returns new id (BIGINT)
 *   - sp_course_modules_update       — update, returns void
 *   - sp_course_modules_delete       — soft delete, returns void
 *   - sp_course_modules_restore      — restore, returns void
 *
 *   COURSE MODULE TRANSLATIONS:
 *   - sp_course_module_translations_insert  — create, returns void
 *   - sp_course_module_translations_update  — update, returns void
 *   - sp_course_module_translations_delete  — soft delete, returns void
 *   - sp_course_module_translations_restore — restore, returns void
 *
 *   COURSE MODULE TOPICS:
 *   - udf_get_course_module_topics   — read, search, filter, paginate
 *   - sp_course_module_topics_insert — create, returns new id (BIGINT)
 *   - sp_course_module_topics_update — update, returns void
 *   - sp_course_module_topics_delete/delete_single — soft delete, returns void
 *   - sp_course_module_topics_restore/restore_single — restore, returns void
 *
 *   COURSE SUB-CATEGORIES (junction, no udf_get):
 *   - sp_course_sub_categories_insert  — create, returns void
 *   - sp_course_sub_categories_update  — update, returns void
 *   - sp_course_sub_categories_delete  — soft delete, returns void
 *   - sp_course_sub_categories_restore — restore, returns void
 *
 *   COURSE SUBJECTS (junction, no udf_get):
 *   - sp_course_subjects_insert  — create, returns void
 *   - sp_course_subjects_update  — update, returns void
 *   - sp_course_subjects_delete  — soft delete, returns void
 *   - sp_course_subjects_restore — restore, returns void
 *
 *   COURSE CHAPTERS (junction, no udf_get):
 *   - sp_course_chapters_insert  — create, returns void
 *   - sp_course_chapters_update  — update, returns void
 *   - sp_course_chapters_delete  — soft delete, returns void
 *   - sp_course_chapters_restore — restore, returns void
 *
 *   COURSE INSTRUCTORS (junction, no udf_get):
 *   - sp_course_instructors_insert  — create, returns void
 *   - sp_course_instructors_update  — update, returns void
 *   - sp_course_instructors_delete  — soft delete, returns void
 *   - sp_course_instructors_restore — restore, returns void
 *
 *   BUNDLES:
 *   - udf_get_bundles                — read, search, filter, paginate
 *   - sp_bundles_insert              — create, returns new id (BIGINT)
 *   - sp_bundles_update              — update, returns void
 *   - sp_bundles_delete_cascade/delete_single — soft delete, returns void
 *   - sp_bundles_restore_cascade/restore_single — restore, returns void
 *
 *   BUNDLE TRANSLATIONS:
 *   - sp_bundle_translations_insert  — create, returns void
 *   - sp_bundle_translations_update  — update, returns void
 *   - sp_bundle_translations_delete  — soft delete (p_ids array), returns void
 *   - sp_bundle_translations_restore — restore (p_ids array), returns void
 *
 *   BUNDLE COURSES:
 *   - udf_get_bundle_courses         — read, search, filter, paginate
 *   - sp_bundle_courses_insert       — create, returns new id (BIGINT)
 *   - sp_bundle_courses_update       — update, returns void
 *   - sp_bundle_courses_delete/delete_single — soft delete, returns void
 *   - sp_bundle_courses_restore/restore_single — restore, returns void
 * ═══════════════════════════════════════════════════════════════
 */

const { supabase } = require('../config/database');
const logger = require('../config/logger');

class CourseManagementRepository {
  // ─────────────────────────────────────────────────────────────
  // COURSES
  // ─────────────────────────────────────────────────────────────

  /**
   * findCourseById
   * Fetches a single course by ID
   */
  async findCourseById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_courses', {
        p_id: id,
        p_course_id: null,
        p_language_id: null,
        p_is_active: null,
        p_filter_difficulty_level: null,
        p_filter_course_status: null,
        p_filter_is_free: null,
        p_filter_currency: null,
        p_filter_is_instructor_course: null,
        p_filter_is_deleted: false,
        p_search_term: null,
        p_sort_table: 'course',
        p_sort_column: 'id',
        p_sort_direction: 'ASC',
        p_page_index: 1,
        p_page_size: 1,
      });

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (err) {
      logger.error(`Error finding course by ID: ${err.message}`);
      throw err;
    }
  }

  /**
   * getCourses
   * Fetches a list of courses with optional filtering, sorting, and pagination
   */
  async getCourses(options = {}) {
    try {
      const {
        courseId = null,
        languageId = null,
        isActive = null,
        filterDifficultyLevel = null,
        filterCourseStatus = null,
        filterIsFree = null,
        filterCurrency = null,
        filterIsInstructorCourse = null,
        filterIsDeleted = false,
        searchTerm = null,
        sortTable = 'course',
        sortColumn = 'id',
        sortDirection = 'ASC',
        pageIndex = 1,
        pageSize = 20,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_courses', {
        p_id: null,
        p_course_id: courseId,
        p_language_id: languageId,
        p_is_active: isActive,
        p_filter_difficulty_level: filterDifficultyLevel,
        p_filter_course_status: filterCourseStatus,
        p_filter_is_free: filterIsFree,
        p_filter_currency: filterCurrency,
        p_filter_is_instructor_course: filterIsInstructorCourse,
        p_filter_is_deleted: filterIsDeleted,
        p_search_term: searchTerm,
        p_sort_table: sortTable,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_page_index: pageIndex,
        p_page_size: pageSize,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching courses: ${err.message}`);
      throw err;
    }
  }

  /**
   * createCourse
   * Creates a new course and returns the full record
   */
  async createCourse(payload) {
    try {
      const {
        instructorId = null,
        courseLanguageId = null,
        isInstructorCourse = false,
        code = null,
        slug = null,
        difficultyLevel = 'beginner',
        courseStatus = 'draft',
        durationHours = null,
        price = 0.00,
        originalPrice = null,
        discountPercentage = null,
        currency = 'INR',
        isFree = false,
        trailerVideoUrl = null,
        trailerThumbnailUrl = null,
        videoUrl = null,
        brochureUrl = null,
        isNew = false,
        newUntil = null,
        isFeatured = false,
        isBestseller = false,
        hasPlacementAssistance = false,
        hasCertificate = true,
        maxStudents = null,
        refundDays = 0,
        enrollmentCount = 0,
        ratingAverage = 0.00,
        ratingCount = 0,
        viewCount = 0,
        totalLessons = 0,
        totalProjects = 0,
        createdBy = null,
        updatedBy = null,
        isActive = true,
        publishedAt = null,
        contentUpdatedAt = null,
      } = payload;

      const { data: newId, error: insertError } = await supabase.rpc(
        'sp_courses_insert',
        {
          p_instructor_id: instructorId,
          p_course_language_id: courseLanguageId,
          p_is_instructor_course: isInstructorCourse,
          p_code: code,
          p_slug: slug,
          p_difficulty_level: difficultyLevel,
          p_course_status: courseStatus,
          p_duration_hours: durationHours,
          p_price: price,
          p_original_price: originalPrice,
          p_discount_percentage: discountPercentage,
          p_currency: currency,
          p_is_free: isFree,
          p_trailer_video_url: trailerVideoUrl,
          p_trailer_thumbnail_url: trailerThumbnailUrl,
          p_video_url: videoUrl,
          p_brochure_url: brochureUrl,
          p_is_new: isNew,
          p_new_until: newUntil,
          p_is_featured: isFeatured,
          p_is_bestseller: isBestseller,
          p_has_placement_assistance: hasPlacementAssistance,
          p_has_certificate: hasCertificate,
          p_max_students: maxStudents,
          p_refund_days: refundDays,
          p_enrollment_count: enrollmentCount,
          p_rating_average: ratingAverage,
          p_rating_count: ratingCount,
          p_view_count: viewCount,
          p_total_lessons: totalLessons,
          p_total_projects: totalProjects,
          p_created_by: createdBy,
          p_updated_by: updatedBy,
          p_is_active: isActive,
          p_published_at: publishedAt,
          p_content_updated_at: contentUpdatedAt,
        }
      );

      if (insertError) throw insertError;

      return await this.findCourseById(newId);
    } catch (err) {
      logger.error(`Error creating course: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateCourse
   * Updates an existing course and returns the updated record
   */
  async updateCourse(id, payload) {
    try {
      const {
        instructorId,
        courseLanguageId,
        isInstructorCourse,
        code,
        slug,
        difficultyLevel,
        courseStatus,
        durationHours,
        price,
        originalPrice,
        discountPercentage,
        currency,
        isFree,
        trailerVideoUrl,
        trailerThumbnailUrl,
        videoUrl,
        brochureUrl,
        isNew,
        newUntil,
        isFeatured,
        isBestseller,
        hasPlacementAssistance,
        hasCertificate,
        maxStudents,
        refundDays,
        enrollmentCount,
        ratingAverage,
        ratingCount,
        viewCount,
        totalLessons,
        totalProjects,
        updatedBy,
        isActive,
        publishedAt,
        contentUpdatedAt,
      } = payload;

      const { error } = await supabase.rpc('sp_courses_update', {
        p_id: id,
        p_instructor_id: instructorId,
        p_course_language_id: courseLanguageId,
        p_is_instructor_course: isInstructorCourse,
        p_code: code,
        p_slug: slug,
        p_difficulty_level: difficultyLevel,
        p_course_status: courseStatus,
        p_duration_hours: durationHours,
        p_price: price,
        p_original_price: originalPrice,
        p_discount_percentage: discountPercentage,
        p_currency: currency,
        p_is_free: isFree,
        p_trailer_video_url: trailerVideoUrl,
        p_trailer_thumbnail_url: trailerThumbnailUrl,
        p_video_url: videoUrl,
        p_brochure_url: brochureUrl,
        p_is_new: isNew,
        p_new_until: newUntil,
        p_is_featured: isFeatured,
        p_is_bestseller: isBestseller,
        p_has_placement_assistance: hasPlacementAssistance,
        p_has_certificate: hasCertificate,
        p_max_students: maxStudents,
        p_refund_days: refundDays,
        p_enrollment_count: enrollmentCount,
        p_rating_average: ratingAverage,
        p_rating_count: ratingCount,
        p_view_count: viewCount,
        p_total_lessons: totalLessons,
        p_total_projects: totalProjects,
        p_updated_by: updatedBy,
        p_is_active: isActive,
        p_published_at: publishedAt,
        p_content_updated_at: contentUpdatedAt,
      });

      if (error) throw error;

      return await this.findCourseById(id);
    } catch (err) {
      logger.error(`Error updating course: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteCourse
   * Soft deletes a course (returns void)
   */
  async deleteCourse(id) {
    try {
      const { error } = await supabase.rpc('sp_courses_delete', {
        p_id: id,
      });

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting course: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreCourse
   * Restores a soft-deleted course
   */
  async restoreCourse(id, restoreTranslations = true) {
    try {
      const { error } = await supabase.rpc('sp_courses_restore', {
        p_id: id,
        p_restore_translations: restoreTranslations,
      });

      if (error) throw error;

      return await this.findCourseById(id);
    } catch (err) {
      logger.error(`Error restoring course: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // COURSE TRANSLATIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * createCourseTranslation
   * Creates a new course translation (returns void)
   */
  async createCourseTranslation(payload) {
    try {
      const {
        courseId,
        languageId,
        title,
        shortIntro = null,
        longIntro = null,
        tagline = null,
        webThumbnail = null,
        webBanner = null,
        appThumbnail = null,
        appBanner = null,
        videoTitle = null,
        videoDescription = null,
        videoThumbnail = null,
        videoDurationMinutes = null,
        tags = null,
        isNewTitle = null,
        prerequisites = null,
        skillsGain = null,
        whatYouWillLearn = null,
        courseIncludes = null,
        courseIsFor = null,
        applyForDesignations = null,
        demandInCountries = null,
        salaryStandard = null,
        futureCourses = null,
        metaTitle = null,
        metaDescription = null,
        metaKeywords = null,
        canonicalUrl = null,
        ogSiteName = null,
        ogTitle = null,
        ogDescription = null,
        ogType = null,
        ogImage = null,
        ogUrl = null,
        twitterSite = null,
        twitterTitle = null,
        twitterDescription = null,
        twitterImage = null,
        twitterCard = 'summary_large_image',
        robotsDirective = 'index,follow',
        focusKeyword = null,
        structuredData = null,
        isActive = true,
      } = payload;

      const { error } = await supabase.rpc(
        'sp_course_translations_insert',
        {
          p_course_id: courseId,
          p_language_id: languageId,
          p_title: title,
          p_short_intro: shortIntro,
          p_long_intro: longIntro,
          p_tagline: tagline,
          p_web_thumbnail: webThumbnail,
          p_web_banner: webBanner,
          p_app_thumbnail: appThumbnail,
          p_app_banner: appBanner,
          p_video_title: videoTitle,
          p_video_description: videoDescription,
          p_video_thumbnail: videoThumbnail,
          p_video_duration_minutes: videoDurationMinutes,
          p_tags: tags,
          p_is_new_title: isNewTitle,
          p_prerequisites: prerequisites,
          p_skills_gain: skillsGain,
          p_what_you_will_learn: whatYouWillLearn,
          p_course_includes: courseIncludes,
          p_course_is_for: courseIsFor,
          p_apply_for_designations: applyForDesignations,
          p_demand_in_countries: demandInCountries,
          p_salary_standard: salaryStandard,
          p_future_courses: futureCourses,
          p_meta_title: metaTitle,
          p_meta_description: metaDescription,
          p_meta_keywords: metaKeywords,
          p_canonical_url: canonicalUrl,
          p_og_site_name: ogSiteName,
          p_og_title: ogTitle,
          p_og_description: ogDescription,
          p_og_type: ogType,
          p_og_image: ogImage,
          p_og_url: ogUrl,
          p_twitter_site: twitterSite,
          p_twitter_title: twitterTitle,
          p_twitter_description: twitterDescription,
          p_twitter_image: twitterImage,
          p_twitter_card: twitterCard,
          p_robots_directive: robotsDirective,
          p_focus_keyword: focusKeyword,
          p_structured_data: structuredData,
          p_is_active: isActive,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error creating course translation: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateCourseTranslation
   * Updates an existing course translation
   */
  async updateCourseTranslation(id, payload) {
    try {
      const {
        title,
        shortIntro,
        longIntro,
        tagline,
        webThumbnail,
        webBanner,
        appThumbnail,
        appBanner,
        videoTitle,
        videoDescription,
        videoThumbnail,
        videoDurationMinutes,
        tags,
        isNewTitle,
        prerequisites,
        skillsGain,
        whatYouWillLearn,
        courseIncludes,
        courseIsFor,
        applyForDesignations,
        demandInCountries,
        salaryStandard,
        futureCourses,
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
      } = payload;

      const { error } = await supabase.rpc(
        'sp_course_translations_update',
        {
          p_id: id,
          p_title: title,
          p_short_intro: shortIntro,
          p_long_intro: longIntro,
          p_tagline: tagline,
          p_web_thumbnail: webThumbnail,
          p_web_banner: webBanner,
          p_app_thumbnail: appThumbnail,
          p_app_banner: appBanner,
          p_video_title: videoTitle,
          p_video_description: videoDescription,
          p_video_thumbnail: videoThumbnail,
          p_video_duration_minutes: videoDurationMinutes,
          p_tags: tags,
          p_is_new_title: isNewTitle,
          p_prerequisites: prerequisites,
          p_skills_gain: skillsGain,
          p_what_you_will_learn: whatYouWillLearn,
          p_course_includes: courseIncludes,
          p_course_is_for: courseIsFor,
          p_apply_for_designations: applyForDesignations,
          p_demand_in_countries: demandInCountries,
          p_salary_standard: salaryStandard,
          p_future_courses: futureCourses,
          p_meta_title: metaTitle,
          p_meta_description: metaDescription,
          p_meta_keywords: metaKeywords,
          p_canonical_url: canonicalUrl,
          p_og_site_name: ogSiteName,
          p_og_title: ogTitle,
          p_og_description: ogDescription,
          p_og_type: ogType,
          p_og_image: ogImage,
          p_og_url: ogUrl,
          p_twitter_site: twitterSite,
          p_twitter_title: twitterTitle,
          p_twitter_description: twitterDescription,
          p_twitter_image: twitterImage,
          p_twitter_card: twitterCard,
          p_robots_directive: robotsDirective,
          p_focus_keyword: focusKeyword,
          p_structured_data: structuredData,
          p_is_active: isActive,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error updating course translation: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteCourseTranslation
   * Soft deletes a course translation
   */
  async deleteCourseTranslation(id) {
    try {
      const { error } = await supabase.rpc(
        'sp_course_translations_delete',
        {
          p_id: id,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting course translation: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreCourseTranslation
   * Restores a soft-deleted course translation
   */
  async restoreCourseTranslation(id) {
    try {
      const { error } = await supabase.rpc(
        'sp_course_translations_restore',
        {
          p_id: id,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error restoring course translation: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // COURSE MODULES
  // ─────────────────────────────────────────────────────────────

  /**
   * findCourseModuleById
   * Fetches a single course module by ID
   */
  async findCourseModuleById(id) {
    try {
      const { data, error } = await supabase.rpc(
        'udf_get_course_modules',
        {
          p_search: null,
          p_filter_course_id: null,
          p_filter_is_active: null,
          p_filter_is_deleted: false,
          p_id: id,
          p_course_module_id: null,
          p_course_id: null,
          p_language_id: null,
          p_sort_table: 'module',
          p_sort_column: 'display_order',
          p_sort_direction: 'ASC',
          p_page_index: 1,
          p_page_size: 1,
        }
      );

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (err) {
      logger.error(`Error finding course module by ID: ${err.message}`);
      throw err;
    }
  }

  /**
   * getCourseModules
   * Fetches a list of course modules with optional filtering
   */
  async getCourseModules(options = {}) {
    try {
      const {
        search = null,
        filterCourseId = null,
        filterIsActive = null,
        filterIsDeleted = false,
        courseModuleId = null,
        courseId = null,
        languageId = null,
        sortTable = 'module',
        sortColumn = 'display_order',
        sortDirection = 'ASC',
        pageIndex = 1,
        pageSize = 10,
      } = options;

      const { data, error } = await supabase.rpc(
        'udf_get_course_modules',
        {
          p_search: search,
          p_filter_course_id: filterCourseId,
          p_filter_is_active: filterIsActive,
          p_filter_is_deleted: filterIsDeleted,
          p_id: null,
          p_course_module_id: courseModuleId,
          p_course_id: courseId,
          p_language_id: languageId,
          p_sort_table: sortTable,
          p_sort_column: sortColumn,
          p_sort_direction: sortDirection,
          p_page_index: pageIndex,
          p_page_size: pageSize,
        }
      );

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching course modules: ${err.message}`);
      throw err;
    }
  }

  /**
   * createCourseModule
   * Creates a new course module and returns the full record
   */
  async createCourseModule(payload) {
    try {
      const {
        courseId,
        slug = null,
        displayOrder = 0,
        estimatedMinutes = null,
        isActive = true,
        createdBy = null,
      } = payload;

      const { data: newId, error: insertError } = await supabase.rpc(
        'sp_course_modules_insert',
        {
          p_course_id: courseId,
          p_slug: slug,
          p_display_order: displayOrder,
          p_estimated_minutes: estimatedMinutes,
          p_is_active: isActive,
          p_created_by: createdBy,
        }
      );

      if (insertError) throw insertError;

      return await this.findCourseModuleById(newId);
    } catch (err) {
      logger.error(`Error creating course module: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateCourseModule
   * Updates an existing course module and returns the updated record
   */
  async updateCourseModule(id, payload) {
    try {
      const {
        slug,
        displayOrder,
        estimatedMinutes,
        isActive,
        updatedBy,
      } = payload;

      const { error } = await supabase.rpc(
        'sp_course_modules_update',
        {
          p_module_id: id,
          p_slug: slug,
          p_display_order: displayOrder,
          p_estimated_minutes: estimatedMinutes,
          p_is_active: isActive,
          p_updated_by: updatedBy,
        }
      );

      if (error) throw error;

      return await this.findCourseModuleById(id);
    } catch (err) {
      logger.error(`Error updating course module: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteCourseModule
   * Soft deletes a course module
   */
  async deleteCourseModule(id) {
    try {
      const { error } = await supabase.rpc(
        'sp_course_modules_delete',
        {
          p_module_id: id,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting course module: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreCourseModule
   * Restores a soft-deleted course module
   */
  async restoreCourseModule(id, restoreTranslations = true) {
    try {
      const { error } = await supabase.rpc(
        'sp_course_modules_restore',
        {
          p_module_id: id,
          p_restore_translations: restoreTranslations,
        }
      );

      if (error) throw error;

      return await this.findCourseModuleById(id);
    } catch (err) {
      logger.error(`Error restoring course module: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // COURSE MODULE TRANSLATIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * createCourseModuleTranslation
   * Creates a new course module translation
   */
  async createCourseModuleTranslation(payload) {
    try {
      const {
        courseModuleId,
        languageId,
        name,
        shortIntro = null,
        description = null,
        icon = null,
        image = null,
        tags = [],
        metaTitle = null,
        metaDescription = null,
        metaKeywords = null,
        canonicalUrl = null,
        ogSiteName = null,
        ogTitle = null,
        ogDescription = null,
        ogType = null,
        ogImage = null,
        ogUrl = null,
        twitterSite = null,
        twitterTitle = null,
        twitterDescription = null,
        twitterImage = null,
        twitterCard = 'summary_large_image',
        robotsDirective = 'index,follow',
        focusKeyword = null,
        structuredData = [],
        isActive = true,
      } = payload;

      const { error } = await supabase.rpc(
        'sp_course_module_translations_insert',
        {
          p_course_module_id: courseModuleId,
          p_language_id: languageId,
          p_name: name,
          p_short_intro: shortIntro,
          p_description: description,
          p_icon: icon,
          p_image: image,
          p_tags: tags,
          p_meta_title: metaTitle,
          p_meta_description: metaDescription,
          p_meta_keywords: metaKeywords,
          p_canonical_url: canonicalUrl,
          p_og_site_name: ogSiteName,
          p_og_title: ogTitle,
          p_og_description: ogDescription,
          p_og_type: ogType,
          p_og_image: ogImage,
          p_og_url: ogUrl,
          p_twitter_site: twitterSite,
          p_twitter_title: twitterTitle,
          p_twitter_description: twitterDescription,
          p_twitter_image: twitterImage,
          p_twitter_card: twitterCard,
          p_robots_directive: robotsDirective,
          p_focus_keyword: focusKeyword,
          p_structured_data: structuredData,
          p_is_active: isActive,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error creating course module translation: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateCourseModuleTranslation
   * Updates an existing course module translation
   */
  async updateCourseModuleTranslation(id, payload) {
    try {
      const {
        name,
        shortIntro,
        description,
        icon,
        image,
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
      } = payload;

      const { error } = await supabase.rpc(
        'sp_course_module_translations_update',
        {
          p_translation_id: id,
          p_name: name,
          p_short_intro: shortIntro,
          p_description: description,
          p_icon: icon,
          p_image: image,
          p_tags: tags,
          p_meta_title: metaTitle,
          p_meta_description: metaDescription,
          p_meta_keywords: metaKeywords,
          p_canonical_url: canonicalUrl,
          p_og_site_name: ogSiteName,
          p_og_title: ogTitle,
          p_og_description: ogDescription,
          p_og_type: ogType,
          p_og_image: ogImage,
          p_og_url: ogUrl,
          p_twitter_site: twitterSite,
          p_twitter_title: twitterTitle,
          p_twitter_description: twitterDescription,
          p_twitter_image: twitterImage,
          p_twitter_card: twitterCard,
          p_robots_directive: robotsDirective,
          p_focus_keyword: focusKeyword,
          p_structured_data: structuredData,
          p_is_active: isActive,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error updating course module translation: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteCourseModuleTranslation
   * Soft deletes a course module translation
   */
  async deleteCourseModuleTranslation(id) {
    try {
      const { error } = await supabase.rpc(
        'sp_course_module_translations_delete',
        {
          p_translation_id: id,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting course module translation: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreCourseModuleTranslation
   * Restores a soft-deleted course module translation
   */
  async restoreCourseModuleTranslation(id) {
    try {
      const { error } = await supabase.rpc(
        'sp_course_module_translations_restore',
        {
          p_translation_id: id,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error restoring course module translation: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // COURSE MODULE TOPICS
  // ─────────────────────────────────────────────────────────────

  /**
   * findCourseModuleTopicById
   * Fetches a single course module topic by ID
   */
  async findCourseModuleTopicById(id) {
    try {
      const { data, error } = await supabase.rpc(
        'udf_get_course_module_topics',
        {
          p_id: id,
          p_course_module_id: null,
          p_topic_id: null,
          p_is_active: null,
          p_filter_course_module_id: null,
          p_filter_is_preview: null,
          p_filter_is_active: null,
          p_filter_is_deleted: false,
          p_filter_has_topic: null,
          p_search_term: null,
          p_sort_column: 'display_order',
          p_sort_direction: 'ASC',
          p_page_index: 1,
          p_page_size: 1,
        }
      );

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (err) {
      logger.error(`Error finding course module topic by ID: ${err.message}`);
      throw err;
    }
  }

  /**
   * getCourseModuleTopics
   * Fetches a list of course module topics with optional filtering
   */
  async getCourseModuleTopics(options = {}) {
    try {
      const {
        courseModuleId = null,
        topicId = null,
        isActive = null,
        filterCourseModuleId = null,
        filterIsPreview = null,
        filterIsActive = null,
        filterIsDeleted = false,
        filterHasTopic = null,
        searchTerm = null,
        sortColumn = 'display_order',
        sortDirection = 'ASC',
        pageIndex = 1,
        pageSize = 20,
      } = options;

      const { data, error } = await supabase.rpc(
        'udf_get_course_module_topics',
        {
          p_id: null,
          p_course_module_id: courseModuleId,
          p_topic_id: topicId,
          p_is_active: isActive,
          p_filter_course_module_id: filterCourseModuleId,
          p_filter_is_preview: filterIsPreview,
          p_filter_is_active: filterIsActive,
          p_filter_is_deleted: filterIsDeleted,
          p_filter_has_topic: filterHasTopic,
          p_search_term: searchTerm,
          p_sort_column: sortColumn,
          p_sort_direction: sortDirection,
          p_page_index: pageIndex,
          p_page_size: pageSize,
        }
      );

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching course module topics: ${err.message}`);
      throw err;
    }
  }

  /**
   * createCourseModuleTopic
   * Creates a new course module topic and returns the full record
   */
  async createCourseModuleTopic(payload) {
    try {
      const {
        courseModuleId,
        topicId = null,
        displayOrder = 0,
        customTitle = null,
        customDescription = null,
        estimatedMinutes = null,
        isPreview = false,
        note = null,
        isActive = true,
        createdBy = null,
      } = payload;

      const { data: newId, error: insertError } = await supabase.rpc(
        'sp_course_module_topics_insert',
        {
          p_course_module_id: courseModuleId,
          p_topic_id: topicId,
          p_display_order: displayOrder,
          p_custom_title: customTitle,
          p_custom_description: customDescription,
          p_estimated_minutes: estimatedMinutes,
          p_is_preview: isPreview,
          p_note: note,
          p_is_active: isActive,
          p_created_by: createdBy,
        }
      );

      if (insertError) throw insertError;

      return await this.findCourseModuleTopicById(newId);
    } catch (err) {
      logger.error(`Error creating course module topic: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateCourseModuleTopic
   * Updates an existing course module topic and returns the updated record
   */
  async updateCourseModuleTopic(id, payload) {
    try {
      const {
        courseModuleId,
        topicId,
        displayOrder,
        customTitle,
        customDescription,
        estimatedMinutes,
        isPreview,
        note,
        isActive,
        updatedBy,
      } = payload;

      const { error } = await supabase.rpc(
        'sp_course_module_topics_update',
        {
          p_id: id,
          p_course_module_id: courseModuleId,
          p_topic_id: topicId,
          p_display_order: displayOrder,
          p_custom_title: customTitle,
          p_custom_description: customDescription,
          p_estimated_minutes: estimatedMinutes,
          p_is_preview: isPreview,
          p_note: note,
          p_is_active: isActive,
          p_updated_by: updatedBy,
        }
      );

      if (error) throw error;

      return await this.findCourseModuleTopicById(id);
    } catch (err) {
      logger.error(`Error updating course module topic: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteCourseModuleTopics
   * Soft deletes multiple course module topics (bulk)
   */
  async deleteCourseModuleTopics(ids) {
    try {
      const { error } = await supabase.rpc(
        'sp_course_module_topics_delete',
        {
          p_ids: ids,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting course module topics: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteCourseModuleTopicSingle
   * Soft deletes a single course module topic
   */
  async deleteCourseModuleTopicSingle(id) {
    try {
      const { error } = await supabase.rpc(
        'sp_course_module_topics_delete_single',
        {
          p_id: id,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting course module topic: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreCourseModuleTopics
   * Restores multiple soft-deleted course module topics (bulk)
   */
  async restoreCourseModuleTopics(ids) {
    try {
      const { error } = await supabase.rpc(
        'sp_course_module_topics_restore',
        {
          p_ids: ids,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error restoring course module topics: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreCourseModuleTopicSingle
   * Restores a soft-deleted course module topic
   */
  async restoreCourseModuleTopicSingle(id) {
    try {
      const { error } = await supabase.rpc(
        'sp_course_module_topics_restore_single',
        {
          p_id: id,
        }
      );

      if (error) throw error;

      return await this.findCourseModuleTopicById(id);
    } catch (err) {
      logger.error(`Error restoring course module topic: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // COURSE SUB-CATEGORIES (JUNCTION)
  // ─────────────────────────────────────────────────────────────

  /**
   * createCourseSubCategory
   * Creates a new course sub-category assignment
   */
  async createCourseSubCategory(payload) {
    try {
      const {
        courseId,
        subCategoryId,
        isPrimary = false,
        displayOrder = 0,
        isActive = true,
        createdBy = null,
      } = payload;

      const { error } = await supabase.rpc(
        'sp_course_sub_categories_insert',
        {
          p_course_id: courseId,
          p_sub_category_id: subCategoryId,
          p_is_primary: isPrimary,
          p_display_order: displayOrder,
          p_is_active: isActive,
          p_created_by: createdBy,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error creating course sub-category: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateCourseSubCategory
   * Updates an existing course sub-category assignment
   */
  async updateCourseSubCategory(id, payload) {
    try {
      const {
        isPrimary,
        displayOrder,
        isActive,
        updatedBy,
      } = payload;

      const { error } = await supabase.rpc(
        'sp_course_sub_categories_update',
        {
          p_id: id,
          p_is_primary: isPrimary,
          p_display_order: displayOrder,
          p_is_active: isActive,
          p_updated_by: updatedBy,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error updating course sub-category: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteCourseSubCategory
   * Soft deletes a course sub-category assignment
   */
  async deleteCourseSubCategory(id) {
    try {
      const { error } = await supabase.rpc(
        'sp_course_sub_categories_delete',
        {
          p_id: id,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting course sub-category: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreCourseSubCategory
   * Restores a soft-deleted course sub-category assignment
   */
  async restoreCourseSubCategory(id) {
    try {
      const { error } = await supabase.rpc(
        'sp_course_sub_categories_restore',
        {
          p_id: id,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error restoring course sub-category: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // COURSE SUBJECTS (JUNCTION)
  // ─────────────────────────────────────────────────────────────

  /**
   * createCourseSubject
   * Creates a new course subject assignment
   */
  async createCourseSubject(payload) {
    try {
      const {
        courseId,
        moduleId,
        subjectId,
        displayOrder = 0,
        note = null,
        isActive = true,
        createdBy = null,
      } = payload;

      const { error } = await supabase.rpc(
        'sp_course_subjects_insert',
        {
          p_course_id: courseId,
          p_module_id: moduleId,
          p_subject_id: subjectId,
          p_display_order: displayOrder,
          p_note: note,
          p_is_active: isActive,
          p_created_by: createdBy,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error creating course subject: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateCourseSubject
   * Updates an existing course subject assignment
   */
  async updateCourseSubject(id, payload) {
    try {
      const {
        displayOrder,
        note,
        isActive,
        updatedBy,
      } = payload;

      const { error } = await supabase.rpc(
        'sp_course_subjects_update',
        {
          p_id: id,
          p_display_order: displayOrder,
          p_note: note,
          p_is_active: isActive,
          p_updated_by: updatedBy,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error updating course subject: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteCourseSubject
   * Soft deletes a course subject assignment
   */
  async deleteCourseSubject(id, deletedBy = null) {
    try {
      const { error } = await supabase.rpc(
        'sp_course_subjects_delete',
        {
          p_id: id,
          p_deleted_by: deletedBy,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting course subject: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreCourseSubject
   * Restores a soft-deleted course subject assignment
   */
  async restoreCourseSubject(id, restoredBy = null) {
    try {
      const { error } = await supabase.rpc(
        'sp_course_subjects_restore',
        {
          p_id: id,
          p_restored_by: restoredBy,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error restoring course subject: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // COURSE CHAPTERS (JUNCTION)
  // ─────────────────────────────────────────────────────────────

  /**
   * createCourseChapter
   * Creates a new course chapter assignment
   */
  async createCourseChapter(payload) {
    try {
      const {
        courseSubjectId,
        chapterId,
        displayOrder = 0,
        isFreeTrial = false,
        note = null,
        isActive = true,
        createdBy = null,
      } = payload;

      const { error } = await supabase.rpc(
        'sp_course_chapters_insert',
        {
          p_course_subject_id: courseSubjectId,
          p_chapter_id: chapterId,
          p_display_order: displayOrder,
          p_is_free_trial: isFreeTrial,
          p_note: note,
          p_is_active: isActive,
          p_created_by: createdBy,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error creating course chapter: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateCourseChapter
   * Updates an existing course chapter assignment
   */
  async updateCourseChapter(id, payload) {
    try {
      const {
        displayOrder,
        isFreeTrial,
        note,
        isActive,
        updatedBy,
      } = payload;

      const { error } = await supabase.rpc(
        'sp_course_chapters_update',
        {
          p_id: id,
          p_display_order: displayOrder,
          p_is_free_trial: isFreeTrial,
          p_note: note,
          p_is_active: isActive,
          p_updated_by: updatedBy,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error updating course chapter: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteCourseChapter
   * Soft deletes a course chapter assignment
   */
  async deleteCourseChapter(id, deletedBy = null) {
    try {
      const { error } = await supabase.rpc(
        'sp_course_chapters_delete',
        {
          p_id: id,
          p_deleted_by: deletedBy,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting course chapter: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreCourseChapter
   * Restores a soft-deleted course chapter assignment
   */
  async restoreCourseChapter(id, restoredBy = null) {
    try {
      const { error } = await supabase.rpc(
        'sp_course_chapters_restore',
        {
          p_id: id,
          p_restored_by: restoredBy,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error restoring course chapter: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // COURSE INSTRUCTORS (JUNCTION)
  // ─────────────────────────────────────────────────────────────

  /**
   * createCourseInstructor
   * Creates a new course instructor assignment
   */
  async createCourseInstructor(payload) {
    try {
      const {
        courseId,
        instructorId,
        instructorRole = 'co_instructor',
        contribution = null,
        revenueSharePct = null,
        joinDate = null,
        leaveDate = null,
        displayOrder = 0,
        isVisible = true,
        isActive = true,
        createdBy = null,
      } = payload;

      const { error } = await supabase.rpc(
        'sp_course_instructors_insert',
        {
          p_course_id: courseId,
          p_instructor_id: instructorId,
          p_instructor_role: instructorRole,
          p_contribution: contribution,
          p_revenue_share_pct: revenueSharePct,
          p_join_date: joinDate,
          p_leave_date: leaveDate,
          p_display_order: displayOrder,
          p_is_visible: isVisible,
          p_is_active: isActive,
          p_created_by: createdBy,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error creating course instructor: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateCourseInstructor
   * Updates an existing course instructor assignment
   */
  async updateCourseInstructor(id, payload) {
    try {
      const {
        instructorRole,
        contribution,
        revenueSharePct,
        joinDate,
        leaveDate,
        displayOrder,
        isVisible,
        isActive,
        updatedBy,
      } = payload;

      const { error } = await supabase.rpc(
        'sp_course_instructors_update',
        {
          p_id: id,
          p_instructor_role: instructorRole,
          p_contribution: contribution,
          p_revenue_share_pct: revenueSharePct,
          p_join_date: joinDate,
          p_leave_date: leaveDate,
          p_display_order: displayOrder,
          p_is_visible: isVisible,
          p_is_active: isActive,
          p_updated_by: updatedBy,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error updating course instructor: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteCourseInstructor
   * Soft deletes a course instructor assignment
   */
  async deleteCourseInstructor(id, deletedBy = null) {
    try {
      const { error } = await supabase.rpc(
        'sp_course_instructors_delete',
        {
          p_id: id,
          p_deleted_by: deletedBy,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting course instructor: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreCourseInstructor
   * Restores a soft-deleted course instructor assignment
   */
  async restoreCourseInstructor(id, restoredBy = null) {
    try {
      const { error } = await supabase.rpc(
        'sp_course_instructors_restore',
        {
          p_id: id,
          p_restored_by: restoredBy,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error restoring course instructor: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BUNDLES
  // ─────────────────────────────────────────────────────────────

  /**
   * findBundleById
   * Fetches a single bundle by ID
   */
  async findBundleById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_bundles', {
        p_id: id,
        p_bundle_id: null,
        p_language_id: null,
        p_is_active: null,
        p_filter_bundle_owner: null,
        p_filter_is_featured: null,
        p_filter_is_active: null,
        p_search_term: null,
        p_sort_table: 'bundle',
        p_sort_column: 'id',
        p_sort_direction: 'ASC',
        p_page_index: 1,
        p_page_size: 1,
      });

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (err) {
      logger.error(`Error finding bundle by ID: ${err.message}`);
      throw err;
    }
  }

  /**
   * getBundles
   * Fetches a list of bundles with optional filtering, sorting, and pagination
   */
  async getBundles(options = {}) {
    try {
      const {
        bundleId = null,
        languageId = null,
        isActive = null,
        filterBundleOwner = null,
        filterIsFeatured = null,
        filterIsActive = null,
        searchTerm = null,
        sortTable = 'bundle',
        sortColumn = 'id',
        sortDirection = 'ASC',
        pageIndex = 1,
        pageSize = 20,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_bundles', {
        p_id: null,
        p_bundle_id: bundleId,
        p_language_id: languageId,
        p_is_active: isActive,
        p_filter_bundle_owner: filterBundleOwner,
        p_filter_is_featured: filterIsFeatured,
        p_filter_is_active: filterIsActive,
        p_search_term: searchTerm,
        p_sort_table: sortTable,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_page_index: pageIndex,
        p_page_size: pageSize,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching bundles: ${err.message}`);
      throw err;
    }
  }

  /**
   * createBundle
   * Creates a new bundle and returns the full record
   */
  async createBundle(payload) {
    try {
      const {
        bundleOwner = 'system',
        instructorId = null,
        code = null,
        slug = null,
        price = 0.00,
        originalPrice = null,
        discountPercentage = null,
        validityDays = null,
        startsAt = null,
        expiresAt = null,
        isFeatured = false,
        displayOrder = 0,
        isActive = true,
        createdBy = null,
      } = payload;

      const { data: newId, error: insertError } = await supabase.rpc(
        'sp_bundles_insert',
        {
          p_bundle_owner: bundleOwner,
          p_instructor_id: instructorId,
          p_code: code,
          p_slug: slug,
          p_price: price,
          p_original_price: originalPrice,
          p_discount_percentage: discountPercentage,
          p_validity_days: validityDays,
          p_starts_at: startsAt,
          p_expires_at: expiresAt,
          p_is_featured: isFeatured,
          p_display_order: displayOrder,
          p_is_active: isActive,
          p_created_by: createdBy,
        }
      );

      if (insertError) throw insertError;

      return await this.findBundleById(newId);
    } catch (err) {
      logger.error(`Error creating bundle: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateBundle
   * Updates an existing bundle and returns the updated record
   */
  async updateBundle(id, payload) {
    try {
      const {
        bundleOwner,
        instructorId,
        code,
        slug,
        price,
        originalPrice,
        discountPercentage,
        validityDays,
        startsAt,
        expiresAt,
        isFeatured,
        displayOrder,
        isActive,
        updatedBy,
      } = payload;

      const { error } = await supabase.rpc('sp_bundles_update', {
        p_id: id,
        p_bundle_owner: bundleOwner,
        p_instructor_id: instructorId,
        p_code: code,
        p_slug: slug,
        p_price: price,
        p_original_price: originalPrice,
        p_discount_percentage: discountPercentage,
        p_validity_days: validityDays,
        p_starts_at: startsAt,
        p_expires_at: expiresAt,
        p_is_featured: isFeatured,
        p_display_order: displayOrder,
        p_is_active: isActive,
        p_updated_by: updatedBy,
      });

      if (error) throw error;

      return await this.findBundleById(id);
    } catch (err) {
      logger.error(`Error updating bundle: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteBundleCascade
   * Soft deletes a bundle and its related entities
   */
  async deleteBundleCascade(id) {
    try {
      const { error } = await supabase.rpc(
        'sp_bundles_delete_cascade',
        {
          p_bundle_id: id,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting bundle (cascade): ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteBundleSingle
   * Soft deletes a bundle only (no cascade)
   */
  async deleteBundleSingle(id) {
    try {
      const { error } = await supabase.rpc(
        'sp_bundles_delete_single',
        {
          p_bundle_id: id,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting bundle (single): ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreBundleCascade
   * Restores a soft-deleted bundle and its related entities
   */
  async restoreBundleCascade(id) {
    try {
      const { error } = await supabase.rpc(
        'sp_bundles_restore_cascade',
        {
          p_bundle_id: id,
        }
      );

      if (error) throw error;

      return await this.findBundleById(id);
    } catch (err) {
      logger.error(`Error restoring bundle (cascade): ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreBundleSingle
   * Restores a soft-deleted bundle only (no cascade)
   */
  async restoreBundleSingle(id) {
    try {
      const { error } = await supabase.rpc(
        'sp_bundles_restore_single',
        {
          p_bundle_id: id,
        }
      );

      if (error) throw error;

      return await this.findBundleById(id);
    } catch (err) {
      logger.error(`Error restoring bundle (single): ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BUNDLE TRANSLATIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * createBundleTranslation
   * Creates a new bundle translation
   */
  async createBundleTranslation(payload) {
    try {
      const {
        bundleId,
        languageId,
        title,
        description = null,
        shortDescription = null,
        highlights = null,
        thumbnailUrl = null,
        bannerUrl = null,
        tags = null,
        metaTitle = null,
        metaDescription = null,
        metaKeywords = null,
        canonicalUrl = null,
        ogSiteName = null,
        ogTitle = null,
        ogDescription = null,
        ogType = null,
        ogImage = null,
        ogUrl = null,
        twitterSite = null,
        twitterTitle = null,
        twitterDescription = null,
        twitterImage = null,
        twitterCard = 'summary_large_image',
        robotsDirective = 'index,follow',
        focusKeyword = null,
        structuredData = null,
        isActive = true,
      } = payload;

      const { error } = await supabase.rpc(
        'sp_bundle_translations_insert',
        {
          p_bundle_id: bundleId,
          p_language_id: languageId,
          p_title: title,
          p_description: description,
          p_short_description: shortDescription,
          p_highlights: highlights,
          p_thumbnail_url: thumbnailUrl,
          p_banner_url: bannerUrl,
          p_tags: tags,
          p_meta_title: metaTitle,
          p_meta_description: metaDescription,
          p_meta_keywords: metaKeywords,
          p_canonical_url: canonicalUrl,
          p_og_site_name: ogSiteName,
          p_og_title: ogTitle,
          p_og_description: ogDescription,
          p_og_type: ogType,
          p_og_image: ogImage,
          p_og_url: ogUrl,
          p_twitter_site: twitterSite,
          p_twitter_title: twitterTitle,
          p_twitter_description: twitterDescription,
          p_twitter_image: twitterImage,
          p_twitter_card: twitterCard,
          p_robots_directive: robotsDirective,
          p_focus_keyword: focusKeyword,
          p_structured_data: structuredData,
          p_is_active: isActive,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error creating bundle translation: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateBundleTranslation
   * Updates an existing bundle translation
   */
  async updateBundleTranslation(id, payload) {
    try {
      const {
        title,
        description,
        shortDescription,
        highlights,
        thumbnailUrl,
        bannerUrl,
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
      } = payload;

      const { error } = await supabase.rpc(
        'sp_bundle_translations_update',
        {
          p_id: id,
          p_title: title,
          p_description: description,
          p_short_description: shortDescription,
          p_highlights: highlights,
          p_thumbnail_url: thumbnailUrl,
          p_banner_url: bannerUrl,
          p_tags: tags,
          p_meta_title: metaTitle,
          p_meta_description: metaDescription,
          p_meta_keywords: metaKeywords,
          p_canonical_url: canonicalUrl,
          p_og_site_name: ogSiteName,
          p_og_title: ogTitle,
          p_og_description: ogDescription,
          p_og_type: ogType,
          p_og_image: ogImage,
          p_og_url: ogUrl,
          p_twitter_site: twitterSite,
          p_twitter_title: twitterTitle,
          p_twitter_description: twitterDescription,
          p_twitter_image: twitterImage,
          p_twitter_card: twitterCard,
          p_robots_directive: robotsDirective,
          p_focus_keyword: focusKeyword,
          p_structured_data: structuredData,
          p_is_active: isActive,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error updating bundle translation: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteBundleTranslations
   * Soft deletes multiple bundle translations (bulk)
   */
  async deleteBundleTranslations(ids) {
    try {
      const { error } = await supabase.rpc(
        'sp_bundle_translations_delete',
        {
          p_ids: ids,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting bundle translations: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreBundleTranslations
   * Restores multiple soft-deleted bundle translations (bulk)
   */
  async restoreBundleTranslations(ids) {
    try {
      const { error } = await supabase.rpc(
        'sp_bundle_translations_restore',
        {
          p_ids: ids,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error restoring bundle translations: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BUNDLE COURSES
  // ─────────────────────────────────────────────────────────────

  /**
   * findBundleCourseById
   * Fetches a single bundle course by ID
   */
  async findBundleCourseById(id) {
    try {
      const { data, error } = await supabase.rpc(
        'udf_get_bundle_courses',
        {
          p_id: id,
          p_bundle_id: null,
          p_course_id: null,
          p_is_active: null,
          p_search_term: null,
          p_sort_column: 'display_order',
          p_sort_direction: 'ASC',
          p_page_index: 1,
          p_page_size: 1,
        }
      );

      if (error) throw error;
      return data && data.length > 0 ? data[0] : null;
    } catch (err) {
      logger.error(`Error finding bundle course by ID: ${err.message}`);
      throw err;
    }
  }

  /**
   * getBundleCourses
   * Fetches a list of bundle courses with optional filtering
   */
  async getBundleCourses(options = {}) {
    try {
      const {
        bundleId = null,
        courseId = null,
        isActive = null,
        searchTerm = null,
        sortColumn = 'display_order',
        sortDirection = 'ASC',
        pageIndex = 1,
        pageSize = 20,
      } = options;

      const { data, error } = await supabase.rpc(
        'udf_get_bundle_courses',
        {
          p_id: null,
          p_bundle_id: bundleId,
          p_course_id: courseId,
          p_is_active: isActive,
          p_search_term: searchTerm,
          p_sort_column: sortColumn,
          p_sort_direction: sortDirection,
          p_page_index: pageIndex,
          p_page_size: pageSize,
        }
      );

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching bundle courses: ${err.message}`);
      throw err;
    }
  }

  /**
   * createBundleCourse
   * Creates a new bundle course and returns the full record
   */
  async createBundleCourse(payload) {
    try {
      const {
        bundleId,
        courseId,
        displayOrder = 0,
        isActive = true,
        createdBy = null,
      } = payload;

      const { data: newId, error: insertError } = await supabase.rpc(
        'sp_bundle_courses_insert',
        {
          p_bundle_id: bundleId,
          p_course_id: courseId,
          p_display_order: displayOrder,
          p_is_active: isActive,
          p_created_by: createdBy,
        }
      );

      if (insertError) throw insertError;

      return await this.findBundleCourseById(newId);
    } catch (err) {
      logger.error(`Error creating bundle course: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateBundleCourse
   * Updates an existing bundle course and returns the updated record
   */
  async updateBundleCourse(id, payload) {
    try {
      const {
        displayOrder,
        isActive,
        updatedBy,
      } = payload;

      const { error } = await supabase.rpc(
        'sp_bundle_courses_update',
        {
          p_id: id,
          p_display_order: displayOrder,
          p_is_active: isActive,
          p_updated_by: updatedBy,
        }
      );

      if (error) throw error;

      return await this.findBundleCourseById(id);
    } catch (err) {
      logger.error(`Error updating bundle course: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteBundleCourses
   * Soft deletes multiple bundle courses (bulk)
   */
  async deleteBundleCourses(ids) {
    try {
      const { error } = await supabase.rpc(
        'sp_bundle_courses_delete',
        {
          p_ids: ids,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting bundle courses: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteBundleCourseSingle
   * Soft deletes a single bundle course
   */
  async deleteBundleCourseSingle(id) {
    try {
      const { error } = await supabase.rpc(
        'sp_bundle_courses_delete_single',
        {
          p_id: id,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error deleting bundle course: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreBundleCourses
   * Restores multiple soft-deleted bundle courses (bulk)
   */
  async restoreBundleCourses(ids) {
    try {
      const { error } = await supabase.rpc(
        'sp_bundle_courses_restore',
        {
          p_ids: ids,
        }
      );

      if (error) throw error;
    } catch (err) {
      logger.error(`Error restoring bundle courses: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreBundleCourseSingle
   * Restores a soft-deleted bundle course
   */
  async restoreBundleCourseSingle(id) {
    try {
      const { error } = await supabase.rpc(
        'sp_bundle_courses_restore_single',
        {
          p_id: id,
        }
      );

      if (error) throw error;

      return await this.findBundleCourseById(id);
    } catch (err) {
      logger.error(`Error restoring bundle course: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new CourseManagementRepository();
