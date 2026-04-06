const courseManagementService = require('../../../services/courseManagement.service');
const { sendSuccess, sendCreated } = require('../../../utils/response');

class CourseManagementController {
  // ============ COURSES ============

  async getCourses(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'id', sortDir = 'asc', difficultyLevel, courseStatus, isFree, currency, isInstructorCourse, courseId, languageId, isActive, ...filterParams } = req.query;
      const filters = {};
      if (difficultyLevel) filters.difficultyLevel = difficultyLevel;
      if (courseStatus) filters.courseStatus = courseStatus;
      if (isFree !== undefined) filters.isFree = isFree;
      if (currency) filters.currency = currency;
      if (isInstructorCourse !== undefined) filters.isInstructorCourse = isInstructorCourse;
      if (courseId) filters.courseId = courseId;
      if (languageId) filters.languageId = languageId;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await courseManagementService.getCourses({
        filters,
        search,
        sort: { table: 'course', field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = { page: Number(page), limit: Number(limit), totalCount: Number(totalCount), totalPages: Math.ceil(Number(totalCount) / Number(limit)) };
      sendSuccess(res, { data, message: 'Courses retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getCourseById(req, res, next) {
    try {
      const data = await courseManagementService.getCourseById(req.params.id);
      sendSuccess(res, { data, message: 'Course retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createCourse(req, res, next) {
    try {
      if (req.files?.trailerVideo?.[0]) req.body.trailerVideoFile = req.files.trailerVideo[0];
      if (req.files?.trailerThumbnail?.[0]) req.body.trailerThumbnailFile = req.files.trailerThumbnail[0];
      if (req.files?.video?.[0]) req.body.videoFile = req.files.video[0];
      if (req.files?.brochure?.[0]) req.body.brochureFile = req.files.brochure[0];

      const data = await courseManagementService.createCourse(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Course created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateCourse(req, res, next) {
    try {
      if (req.files?.trailerVideo?.[0]) req.body.trailerVideoFile = req.files.trailerVideo[0];
      if (req.files?.trailerThumbnail?.[0]) req.body.trailerThumbnailFile = req.files.trailerThumbnail[0];
      if (req.files?.video?.[0]) req.body.videoFile = req.files.video[0];
      if (req.files?.brochure?.[0]) req.body.brochureFile = req.files.brochure[0];

      const data = await courseManagementService.updateCourse(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Course updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCourse(req, res, next) {
    try {
      await courseManagementService.deleteCourse(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Course deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreCourse(req, res, next) {
    try {
      const data = await courseManagementService.restoreCourse(req.params.id, req.body.restoreTranslations, req.user.userId);
      sendSuccess(res, { data, message: 'Course restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ COURSE TRANSLATIONS ============

  async createCourseTranslation(req, res, next) {
    try {
      if (req.files?.webThumbnail?.[0]) req.body.webThumbnailFile = req.files.webThumbnail[0];
      if (req.files?.webBanner?.[0]) req.body.webBannerFile = req.files.webBanner[0];
      if (req.files?.appThumbnail?.[0]) req.body.appThumbnailFile = req.files.appThumbnail[0];
      if (req.files?.appBanner?.[0]) req.body.appBannerFile = req.files.appBanner[0];
      if (req.files?.videoThumbnail?.[0]) req.body.videoThumbnailFile = req.files.videoThumbnail[0];

      const data = await courseManagementService.createCourseTranslation(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Course translation created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateCourseTranslation(req, res, next) {
    try {
      if (req.files?.webThumbnail?.[0]) req.body.webThumbnailFile = req.files.webThumbnail[0];
      if (req.files?.webBanner?.[0]) req.body.webBannerFile = req.files.webBanner[0];
      if (req.files?.appThumbnail?.[0]) req.body.appThumbnailFile = req.files.appThumbnail[0];
      if (req.files?.appBanner?.[0]) req.body.appBannerFile = req.files.appBanner[0];
      if (req.files?.videoThumbnail?.[0]) req.body.videoThumbnailFile = req.files.videoThumbnail[0];

      const data = await courseManagementService.updateCourseTranslation(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Course translation updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCourseTranslation(req, res, next) {
    try {
      await courseManagementService.deleteCourseTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Course translation deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreCourseTranslation(req, res, next) {
    try {
      const data = await courseManagementService.restoreCourseTranslation(req.params.id, req.body.restoreTranslations, req.user.userId);
      sendSuccess(res, { data, message: 'Course translation restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ COURSE MODULES ============

  async getCourseModules(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'display_order', sortDir = 'asc', courseId, courseModuleId, languageId, filterCourseId, isActive, ...filterParams } = req.query;
      const filters = {};
      if (courseId) filters.courseId = courseId;
      if (courseModuleId) filters.courseModuleId = courseModuleId;
      if (languageId) filters.languageId = languageId;
      if (filterCourseId) filters.filterCourseId = filterCourseId;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await courseManagementService.getCourseModules({
        filters,
        search,
        sort: { table: 'module', field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = { page: Number(page), limit: Number(limit), totalCount: Number(totalCount), totalPages: Math.ceil(Number(totalCount) / Number(limit)) };
      sendSuccess(res, { data, message: 'Course modules retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getCourseModuleById(req, res, next) {
    try {
      const data = await courseManagementService.getCourseModuleById(req.params.id);
      sendSuccess(res, { data, message: 'Course module retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createCourseModule(req, res, next) {
    try {
      const data = await courseManagementService.createCourseModule(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Course module created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateCourseModule(req, res, next) {
    try {
      const data = await courseManagementService.updateCourseModule(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Course module updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCourseModule(req, res, next) {
    try {
      await courseManagementService.deleteCourseModule(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Course module deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreCourseModule(req, res, next) {
    try {
      const data = await courseManagementService.restoreCourseModule(req.params.id, req.body.restoreTranslations, req.user.userId);
      sendSuccess(res, { data, message: 'Course module restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ COURSE MODULE TRANSLATIONS ============

  async createCourseModuleTranslation(req, res, next) {
    try {
      if (req.files?.icon?.[0]) req.body.iconFile = req.files.icon[0];
      if (req.files?.image?.[0]) req.body.imageFile = req.files.image[0];

      const data = await courseManagementService.createCourseModuleTranslation(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Course module translation created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateCourseModuleTranslation(req, res, next) {
    try {
      if (req.files?.icon?.[0]) req.body.iconFile = req.files.icon[0];
      if (req.files?.image?.[0]) req.body.imageFile = req.files.image[0];

      const data = await courseManagementService.updateCourseModuleTranslation(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Course module translation updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCourseModuleTranslation(req, res, next) {
    try {
      await courseManagementService.deleteCourseModuleTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Course module translation deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreCourseModuleTranslation(req, res, next) {
    try {
      const data = await courseManagementService.restoreCourseModuleTranslation(req.params.id, req.body.restoreTranslations, req.user.userId);
      sendSuccess(res, { data, message: 'Course module translation restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ COURSE MODULE TOPICS ============

  async getCourseModuleTopics(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'display_order', sortDir = 'asc', courseModuleId, topicId, filterCourseModuleId, isPreview, hasTopic, isActive, ...filterParams } = req.query;
      const filters = {};
      if (courseModuleId) filters.courseModuleId = courseModuleId;
      if (topicId) filters.topicId = topicId;
      if (filterCourseModuleId) filters.filterCourseModuleId = filterCourseModuleId;
      if (isPreview !== undefined) filters.isPreview = isPreview;
      if (hasTopic !== undefined) filters.hasTopic = hasTopic;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await courseManagementService.getCourseModuleTopics({
        filters,
        search,
        sort: { table: 'course_module_topic', field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = { page: Number(page), limit: Number(limit), totalCount: Number(totalCount), totalPages: Math.ceil(Number(totalCount) / Number(limit)) };
      sendSuccess(res, { data, message: 'Course module topics retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getCourseModuleTopicById(req, res, next) {
    try {
      const data = await courseManagementService.getCourseModuleTopicById(req.params.id);
      sendSuccess(res, { data, message: 'Course module topic retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createCourseModuleTopic(req, res, next) {
    try {
      const data = await courseManagementService.createCourseModuleTopic(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Course module topic created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateCourseModuleTopic(req, res, next) {
    try {
      const data = await courseManagementService.updateCourseModuleTopic(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Course module topic updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCourseModuleTopic(req, res, next) {
    try {
      await courseManagementService.deleteCourseModuleTopic(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Course module topic deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCourseModuleTopicsBulk(req, res, next) {
    try {
      await courseManagementService.deleteCourseModuleTopicsBulk(req.body.ids, req.user.userId);
      sendSuccess(res, { message: 'Course module topics deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreCourseModuleTopic(req, res, next) {
    try {
      const data = await courseManagementService.restoreCourseModuleTopic(req.params.id, req.body.restoreTranslations, req.user.userId);
      sendSuccess(res, { data, message: 'Course module topic restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreCourseModuleTopicsBulk(req, res, next) {
    try {
      const data = await courseManagementService.restoreCourseModuleTopicsBulk(req.body.ids, req.user.userId);
      sendSuccess(res, { data, message: 'Course module topics restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ COURSE SUB-CATEGORIES ============

  async createCourseSubCategory(req, res, next) {
    try {
      const data = await courseManagementService.createCourseSubCategory(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Course sub-category created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateCourseSubCategory(req, res, next) {
    try {
      const data = await courseManagementService.updateCourseSubCategory(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Course sub-category updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCourseSubCategory(req, res, next) {
    try {
      await courseManagementService.deleteCourseSubCategory(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Course sub-category deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreCourseSubCategory(req, res, next) {
    try {
      const data = await courseManagementService.restoreCourseSubCategory(req.params.id, req.body.restoreTranslations, req.user.userId);
      sendSuccess(res, { data, message: 'Course sub-category restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ COURSE SUBJECTS ============

  async createCourseSubject(req, res, next) {
    try {
      const data = await courseManagementService.createCourseSubject(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Course subject created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateCourseSubject(req, res, next) {
    try {
      const data = await courseManagementService.updateCourseSubject(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Course subject updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCourseSubject(req, res, next) {
    try {
      await courseManagementService.deleteCourseSubject(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Course subject deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreCourseSubject(req, res, next) {
    try {
      const data = await courseManagementService.restoreCourseSubject(req.params.id, req.body.restoreTranslations, req.user.userId);
      sendSuccess(res, { data, message: 'Course subject restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ COURSE CHAPTERS ============

  async createCourseChapter(req, res, next) {
    try {
      const data = await courseManagementService.createCourseChapter(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Course chapter created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateCourseChapter(req, res, next) {
    try {
      const data = await courseManagementService.updateCourseChapter(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Course chapter updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCourseChapter(req, res, next) {
    try {
      await courseManagementService.deleteCourseChapter(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Course chapter deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreCourseChapter(req, res, next) {
    try {
      const data = await courseManagementService.restoreCourseChapter(req.params.id, req.body.restoreTranslations, req.user.userId);
      sendSuccess(res, { data, message: 'Course chapter restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ COURSE INSTRUCTORS ============

  async createCourseInstructor(req, res, next) {
    try {
      const data = await courseManagementService.createCourseInstructor(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Course instructor created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateCourseInstructor(req, res, next) {
    try {
      const data = await courseManagementService.updateCourseInstructor(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Course instructor updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCourseInstructor(req, res, next) {
    try {
      await courseManagementService.deleteCourseInstructor(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Course instructor deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreCourseInstructor(req, res, next) {
    try {
      const data = await courseManagementService.restoreCourseInstructor(req.params.id, req.body.restoreTranslations, req.user.userId);
      sendSuccess(res, { data, message: 'Course instructor restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ BUNDLES ============

  async getBundles(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'id', sortDir = 'asc', bundleOwner, isFeatured, bundleId, languageId, isActive, ...filterParams } = req.query;
      const filters = {};
      if (bundleOwner) filters.bundleOwner = bundleOwner;
      if (isFeatured !== undefined) filters.isFeatured = isFeatured;
      if (bundleId) filters.bundleId = bundleId;
      if (languageId) filters.languageId = languageId;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await courseManagementService.getBundles({
        filters,
        search,
        sort: { table: 'bundle', field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = { page: Number(page), limit: Number(limit), totalCount: Number(totalCount), totalPages: Math.ceil(Number(totalCount) / Number(limit)) };
      sendSuccess(res, { data, message: 'Bundles retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getBundleById(req, res, next) {
    try {
      const data = await courseManagementService.getBundleById(req.params.id);
      sendSuccess(res, { data, message: 'Bundle retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createBundle(req, res, next) {
    try {
      const data = await courseManagementService.createBundle(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Bundle created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateBundle(req, res, next) {
    try {
      const data = await courseManagementService.updateBundle(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Bundle updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteBundle(req, res, next) {
    try {
      await courseManagementService.deleteBundle(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Bundle deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteBundleSingle(req, res, next) {
    try {
      await courseManagementService.deleteBundleSingle(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Bundle deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreBundle(req, res, next) {
    try {
      const data = await courseManagementService.restoreBundle(req.params.id, req.body.restoreTranslations, req.user.userId);
      sendSuccess(res, { data, message: 'Bundle restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreBundleSingle(req, res, next) {
    try {
      const data = await courseManagementService.restoreBundleSingle(req.params.id, req.body.restoreTranslations, req.user.userId);
      sendSuccess(res, { data, message: 'Bundle restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ BUNDLE TRANSLATIONS ============

  async createBundleTranslation(req, res, next) {
    try {
      if (req.files?.thumbnail?.[0]) req.body.thumbnailFile = req.files.thumbnail[0];
      if (req.files?.banner?.[0]) req.body.bannerFile = req.files.banner[0];

      const data = await courseManagementService.createBundleTranslation(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Bundle translation created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateBundleTranslation(req, res, next) {
    try {
      if (req.files?.thumbnail?.[0]) req.body.thumbnailFile = req.files.thumbnail[0];
      if (req.files?.banner?.[0]) req.body.bannerFile = req.files.banner[0];

      const data = await courseManagementService.updateBundleTranslation(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Bundle translation updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteBundleTranslationsBulk(req, res, next) {
    try {
      await courseManagementService.deleteBundleTranslationsBulk(req.body.ids, req.user.userId);
      sendSuccess(res, { message: 'Bundle translations deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreBundleTranslationsBulk(req, res, next) {
    try {
      const data = await courseManagementService.restoreBundleTranslationsBulk(req.body.ids, req.user.userId);
      sendSuccess(res, { data, message: 'Bundle translations restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ BUNDLE COURSES ============

  async getBundleCourses(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'display_order', sortDir = 'asc', bundleId, courseId, isActive, ...filterParams } = req.query;
      const filters = {};
      if (bundleId) filters.bundleId = bundleId;
      if (courseId) filters.courseId = courseId;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await courseManagementService.getBundleCourses({
        filters,
        search,
        sort: { table: 'bundle_course', field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = { page: Number(page), limit: Number(limit), totalCount: Number(totalCount), totalPages: Math.ceil(Number(totalCount) / Number(limit)) };
      sendSuccess(res, { data, message: 'Bundle courses retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getBundleCourseById(req, res, next) {
    try {
      const data = await courseManagementService.getBundleCourseById(req.params.id);
      sendSuccess(res, { data, message: 'Bundle course retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createBundleCourse(req, res, next) {
    try {
      const data = await courseManagementService.createBundleCourse(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Bundle course created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateBundleCourse(req, res, next) {
    try {
      const data = await courseManagementService.updateBundleCourse(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Bundle course updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteBundleCourse(req, res, next) {
    try {
      await courseManagementService.deleteBundleCourse(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Bundle course deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteBundleCoursesBulk(req, res, next) {
    try {
      await courseManagementService.deleteBundleCoursesBulk(req.body.ids, req.user.userId);
      sendSuccess(res, { message: 'Bundle courses deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreBundleCourse(req, res, next) {
    try {
      const data = await courseManagementService.restoreBundleCourse(req.params.id, req.body.restoreTranslations, req.user.userId);
      sendSuccess(res, { data, message: 'Bundle course restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreBundleCoursesBulk(req, res, next) {
    try {
      const data = await courseManagementService.restoreBundleCoursesBulk(req.body.ids, req.user.userId);
      sendSuccess(res, { data, message: 'Bundle courses restored successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CourseManagementController();
