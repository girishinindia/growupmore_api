const couponManagementRepository = require('../repositories/couponManagement.repository');
const logger = require('../config/logger');
const { BadRequestError, NotFoundError } = require('../utils/errors');

class CouponManagementService {
  // ============================================================================
  // 1. COUPONS
  // ============================================================================

  async getCoupons(options = {}) {
    try {
      const {
        code = null,
        isActive = null,
        discountType = null,
        applicableTo = null,
        searchTerm = null,
        sortColumn = null,
        sortDirection = null,
        page = 1,
        limit = 20,
      } = options;

      const repoOptions = {
        code,
        isActive,
        discountType,
        applicableTo,
        searchTerm,
        sortColumn,
        sortDirection,
        pageIndex: page - 1,
        pageSize: limit,
      };

      return await couponManagementRepository.getCoupons(repoOptions);
    } catch (error) {
      logger.error('getCoupons error:', error);
      throw error;
    }
  }

  async getCouponById(id) {
    try {
      if (!id) {
        throw new BadRequestError('Coupon ID is required');
      }

      const coupon = await couponManagementRepository.findCouponById(id);
      if (!coupon) {
        throw new NotFoundError('Coupon not found');
      }

      return coupon;
    } catch (error) {
      logger.error('getCouponById error:', error);
      throw error;
    }
  }

  async createCoupon(couponData, actingUserId) {
    try {
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      const { code, discountType, discountValue } = couponData;

      if (!code) {
        throw new BadRequestError('Coupon code is required');
      }
      if (!discountType) {
        throw new BadRequestError('Discount type is required');
      }
      if (discountValue === null || discountValue === undefined) {
        throw new BadRequestError('Discount value is required');
      }

      const data = {
        ...couponData,
        createdBy: actingUserId,
      };

      return await couponManagementRepository.createCoupon(data);
    } catch (error) {
      logger.error('createCoupon error:', error);
      throw error;
    }
  }

  async updateCoupon(id, updates, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('Coupon ID is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      const existingCoupon = await couponManagementRepository.findCouponById(id);
      if (!existingCoupon) {
        throw new NotFoundError('Coupon not found');
      }

      const data = {
        ...updates,
        updatedBy: actingUserId,
      };

      return await couponManagementRepository.updateCoupon(id, data);
    } catch (error) {
      logger.error('updateCoupon error:', error);
      throw error;
    }
  }

  async deleteCoupon(id, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('Coupon ID is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      const existingCoupon = await couponManagementRepository.findCouponById(id);
      if (!existingCoupon) {
        throw new NotFoundError('Coupon not found');
      }

      await couponManagementRepository.deleteCoupon(id);
    } catch (error) {
      logger.error('deleteCoupon error:', error);
      throw error;
    }
  }

  async restoreCoupon(id, restoreTranslations, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('Coupon ID is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      await couponManagementRepository.restoreCoupon(id, restoreTranslations);
      logger.info(`Coupon ${id} restored by user ${actingUserId}`);

      return { id };
    } catch (error) {
      logger.error('restoreCoupon error:', error);
      throw error;
    }
  }

  // ============================================================================
  // 2. COUPON TRANSLATIONS
  // ============================================================================

  async createCouponTranslation(data, actingUserId) {
    try {
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      const { couponId, languageId, title } = data;

      if (!couponId) {
        throw new BadRequestError('Coupon ID is required');
      }
      if (!languageId) {
        throw new BadRequestError('Language ID is required');
      }
      if (!title) {
        throw new BadRequestError('Title is required');
      }

      const coupon = await couponManagementRepository.findCouponById(couponId);
      if (!coupon) {
        throw new NotFoundError('Coupon not found');
      }

      await couponManagementRepository.createCouponTranslation(data);

      return { couponId };
    } catch (error) {
      logger.error('createCouponTranslation error:', error);
      throw error;
    }
  }

  async updateCouponTranslation(id, updates, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('Translation ID is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      await couponManagementRepository.updateCouponTranslation(id, updates);

      return { id };
    } catch (error) {
      logger.error('updateCouponTranslation error:', error);
      throw error;
    }
  }

  async deleteCouponTranslation(id, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('Translation ID is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      await couponManagementRepository.deleteCouponTranslation(id);
    } catch (error) {
      logger.error('deleteCouponTranslation error:', error);
      throw error;
    }
  }

  async restoreCouponTranslation(id, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('Translation ID is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      await couponManagementRepository.restoreCouponTranslation(id);

      return { id };
    } catch (error) {
      logger.error('restoreCouponTranslation error:', error);
      throw error;
    }
  }

  // ============================================================================
  // 3. COUPON COURSES
  // ============================================================================

  async getCouponCourses(options = {}) {
    try {
      const {
        couponId = null,
        courseId = null,
        isActive = null,
        searchTerm = null,
        sortColumn = null,
        sortDirection = null,
        page = 1,
        limit = 20,
      } = options;

      const repoOptions = {
        couponId,
        courseId,
        isActive,
        searchTerm,
        sortColumn,
        sortDirection,
        pageIndex: page - 1,
        pageSize: limit,
      };

      return await couponManagementRepository.getCouponCourses(repoOptions);
    } catch (error) {
      logger.error('getCouponCourses error:', error);
      throw error;
    }
  }

  async getCouponCourseById(id) {
    try {
      if (!id) {
        throw new BadRequestError('Coupon course ID is required');
      }

      const couponCourse = await couponManagementRepository.findCouponCourseById(id);
      if (!couponCourse) {
        throw new NotFoundError('Coupon course not found');
      }

      return couponCourse;
    } catch (error) {
      logger.error('getCouponCourseById error:', error);
      throw error;
    }
  }

  async createCouponCourse(data, actingUserId) {
    try {
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      const { couponId, courseId } = data;

      if (!couponId) {
        throw new BadRequestError('Coupon ID is required');
      }
      if (!courseId) {
        throw new BadRequestError('Course ID is required');
      }

      const coupon = await couponManagementRepository.findCouponById(couponId);
      if (!coupon) {
        throw new NotFoundError('Coupon not found');
      }

      const couponCourseData = {
        ...data,
        createdBy: actingUserId,
      };

      return await couponManagementRepository.createCouponCourse(couponCourseData);
    } catch (error) {
      logger.error('createCouponCourse error:', error);
      throw error;
    }
  }

  async updateCouponCourse(id, updates, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('Coupon course ID is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      const existingCouponCourse = await couponManagementRepository.findCouponCourseById(id);
      if (!existingCouponCourse) {
        throw new NotFoundError('Coupon course not found');
      }

      const updateData = {
        ...updates,
        updatedBy: actingUserId,
      };

      return await couponManagementRepository.updateCouponCourse(id, updateData);
    } catch (error) {
      logger.error('updateCouponCourse error:', error);
      throw error;
    }
  }

  async deleteCouponCourse(id, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('Coupon course ID is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      const existingCouponCourse = await couponManagementRepository.findCouponCourseById(id);
      if (!existingCouponCourse) {
        throw new NotFoundError('Coupon course not found');
      }

      await couponManagementRepository.deleteCouponCourse(id);
    } catch (error) {
      logger.error('deleteCouponCourse error:', error);
      throw error;
    }
  }

  async deleteCouponCoursesBulk(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('Valid coupon course IDs array is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      await couponManagementRepository.deleteCouponCoursesBulk(ids);
    } catch (error) {
      logger.error('deleteCouponCoursesBulk error:', error);
      throw error;
    }
  }

  async restoreCouponCourse(id, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('Coupon course ID is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      await couponManagementRepository.restoreCouponCourse(id);

      return { id };
    } catch (error) {
      logger.error('restoreCouponCourse error:', error);
      throw error;
    }
  }

  async restoreCouponCoursesBulk(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('Valid coupon course IDs array is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      await couponManagementRepository.restoreCouponCoursesBulk(ids);

      return { ids };
    } catch (error) {
      logger.error('restoreCouponCoursesBulk error:', error);
      throw error;
    }
  }

  // ============================================================================
  // 4. COUPON BUNDLES
  // ============================================================================

  async getCouponBundles(options = {}) {
    try {
      const {
        couponId = null,
        bundleId = null,
        isActive = null,
        searchTerm = null,
        sortColumn = null,
        sortDirection = null,
        page = 1,
        limit = 20,
      } = options;

      const repoOptions = {
        couponId,
        bundleId,
        isActive,
        searchTerm,
        sortColumn,
        sortDirection,
        pageIndex: page - 1,
        pageSize: limit,
      };

      return await couponManagementRepository.getCouponBundles(repoOptions);
    } catch (error) {
      logger.error('getCouponBundles error:', error);
      throw error;
    }
  }

  async getCouponBundleById(id) {
    try {
      if (!id) {
        throw new BadRequestError('Coupon bundle ID is required');
      }

      const couponBundle = await couponManagementRepository.findCouponBundleById(id);
      if (!couponBundle) {
        throw new NotFoundError('Coupon bundle not found');
      }

      return couponBundle;
    } catch (error) {
      logger.error('getCouponBundleById error:', error);
      throw error;
    }
  }

  async createCouponBundle(data, actingUserId) {
    try {
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      const { couponId, bundleId } = data;

      if (!couponId) {
        throw new BadRequestError('Coupon ID is required');
      }
      if (!bundleId) {
        throw new BadRequestError('Bundle ID is required');
      }

      const coupon = await couponManagementRepository.findCouponById(couponId);
      if (!coupon) {
        throw new NotFoundError('Coupon not found');
      }

      const couponBundleData = {
        ...data,
        createdBy: actingUserId,
      };

      return await couponManagementRepository.createCouponBundle(couponBundleData);
    } catch (error) {
      logger.error('createCouponBundle error:', error);
      throw error;
    }
  }

  async updateCouponBundle(id, updates, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('Coupon bundle ID is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      const existingCouponBundle = await couponManagementRepository.findCouponBundleById(id);
      if (!existingCouponBundle) {
        throw new NotFoundError('Coupon bundle not found');
      }

      const updateData = {
        ...updates,
        updatedBy: actingUserId,
      };

      return await couponManagementRepository.updateCouponBundle(id, updateData);
    } catch (error) {
      logger.error('updateCouponBundle error:', error);
      throw error;
    }
  }

  async deleteCouponBundle(id, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('Coupon bundle ID is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      const existingCouponBundle = await couponManagementRepository.findCouponBundleById(id);
      if (!existingCouponBundle) {
        throw new NotFoundError('Coupon bundle not found');
      }

      await couponManagementRepository.deleteCouponBundle(id);
    } catch (error) {
      logger.error('deleteCouponBundle error:', error);
      throw error;
    }
  }

  async deleteCouponBundlesBulk(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('Valid coupon bundle IDs array is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      await couponManagementRepository.deleteCouponBundlesBulk(ids);
    } catch (error) {
      logger.error('deleteCouponBundlesBulk error:', error);
      throw error;
    }
  }

  async restoreCouponBundle(id, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('Coupon bundle ID is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      await couponManagementRepository.restoreCouponBundle(id);

      return { id };
    } catch (error) {
      logger.error('restoreCouponBundle error:', error);
      throw error;
    }
  }

  async restoreCouponBundlesBulk(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('Valid coupon bundle IDs array is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      await couponManagementRepository.restoreCouponBundlesBulk(ids);

      return { ids };
    } catch (error) {
      logger.error('restoreCouponBundlesBulk error:', error);
      throw error;
    }
  }

  // ============================================================================
  // 5. COUPON BATCHES
  // ============================================================================

  async getCouponBatches(options = {}) {
    try {
      const {
        couponId = null,
        batchId = null,
        isActive = null,
        searchTerm = null,
        sortColumn = null,
        sortDirection = null,
        page = 1,
        limit = 20,
      } = options;

      const repoOptions = {
        couponId,
        batchId,
        isActive,
        searchTerm,
        sortColumn,
        sortDirection,
        pageIndex: page - 1,
        pageSize: limit,
      };

      return await couponManagementRepository.getCouponBatches(repoOptions);
    } catch (error) {
      logger.error('getCouponBatches error:', error);
      throw error;
    }
  }

  async getCouponBatchById(id) {
    try {
      if (!id) {
        throw new BadRequestError('Coupon batch ID is required');
      }

      const couponBatch = await couponManagementRepository.findCouponBatchById(id);
      if (!couponBatch) {
        throw new NotFoundError('Coupon batch not found');
      }

      return couponBatch;
    } catch (error) {
      logger.error('getCouponBatchById error:', error);
      throw error;
    }
  }

  async createCouponBatch(data, actingUserId) {
    try {
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      const { couponId, batchId } = data;

      if (!couponId) {
        throw new BadRequestError('Coupon ID is required');
      }
      if (!batchId) {
        throw new BadRequestError('Batch ID is required');
      }

      const coupon = await couponManagementRepository.findCouponById(couponId);
      if (!coupon) {
        throw new NotFoundError('Coupon not found');
      }

      const couponBatchData = {
        ...data,
        createdBy: actingUserId,
      };

      return await couponManagementRepository.createCouponBatch(couponBatchData);
    } catch (error) {
      logger.error('createCouponBatch error:', error);
      throw error;
    }
  }

  async updateCouponBatch(id, updates, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('Coupon batch ID is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      const existingCouponBatch = await couponManagementRepository.findCouponBatchById(id);
      if (!existingCouponBatch) {
        throw new NotFoundError('Coupon batch not found');
      }

      const updateData = {
        ...updates,
        updatedBy: actingUserId,
      };

      return await couponManagementRepository.updateCouponBatch(id, updateData);
    } catch (error) {
      logger.error('updateCouponBatch error:', error);
      throw error;
    }
  }

  async deleteCouponBatch(id, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('Coupon batch ID is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      const existingCouponBatch = await couponManagementRepository.findCouponBatchById(id);
      if (!existingCouponBatch) {
        throw new NotFoundError('Coupon batch not found');
      }

      await couponManagementRepository.deleteCouponBatch(id);
    } catch (error) {
      logger.error('deleteCouponBatch error:', error);
      throw error;
    }
  }

  async deleteCouponBatchesBulk(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('Valid coupon batch IDs array is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      await couponManagementRepository.deleteCouponBatchesBulk(ids);
    } catch (error) {
      logger.error('deleteCouponBatchesBulk error:', error);
      throw error;
    }
  }

  async restoreCouponBatch(id, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('Coupon batch ID is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      await couponManagementRepository.restoreCouponBatch(id);

      return { id };
    } catch (error) {
      logger.error('restoreCouponBatch error:', error);
      throw error;
    }
  }

  async restoreCouponBatchesBulk(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('Valid coupon batch IDs array is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      await couponManagementRepository.restoreCouponBatchesBulk(ids);

      return { ids };
    } catch (error) {
      logger.error('restoreCouponBatchesBulk error:', error);
      throw error;
    }
  }

  // ============================================================================
  // 6. COUPON WEBINARS
  // ============================================================================

  async getCouponWebinars(options = {}) {
    try {
      const {
        couponId = null,
        webinarId = null,
        isActive = null,
        searchTerm = null,
        sortColumn = null,
        sortDirection = null,
        page = 1,
        limit = 20,
      } = options;

      const repoOptions = {
        couponId,
        webinarId,
        isActive,
        searchTerm,
        sortColumn,
        sortDirection,
        pageIndex: page - 1,
        pageSize: limit,
      };

      return await couponManagementRepository.getCouponWebinars(repoOptions);
    } catch (error) {
      logger.error('getCouponWebinars error:', error);
      throw error;
    }
  }

  async getCouponWebinarById(id) {
    try {
      if (!id) {
        throw new BadRequestError('Coupon webinar ID is required');
      }

      const couponWebinar = await couponManagementRepository.findCouponWebinarById(id);
      if (!couponWebinar) {
        throw new NotFoundError('Coupon webinar not found');
      }

      return couponWebinar;
    } catch (error) {
      logger.error('getCouponWebinarById error:', error);
      throw error;
    }
  }

  async createCouponWebinar(data, actingUserId) {
    try {
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      const { couponId, webinarId } = data;

      if (!couponId) {
        throw new BadRequestError('Coupon ID is required');
      }
      if (!webinarId) {
        throw new BadRequestError('Webinar ID is required');
      }

      const coupon = await couponManagementRepository.findCouponById(couponId);
      if (!coupon) {
        throw new NotFoundError('Coupon not found');
      }

      const couponWebinarData = {
        ...data,
        createdBy: actingUserId,
      };

      return await couponManagementRepository.createCouponWebinar(couponWebinarData);
    } catch (error) {
      logger.error('createCouponWebinar error:', error);
      throw error;
    }
  }

  async updateCouponWebinar(id, updates, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('Coupon webinar ID is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      const existingCouponWebinar = await couponManagementRepository.findCouponWebinarById(id);
      if (!existingCouponWebinar) {
        throw new NotFoundError('Coupon webinar not found');
      }

      const updateData = {
        ...updates,
        updatedBy: actingUserId,
      };

      return await couponManagementRepository.updateCouponWebinar(id, updateData);
    } catch (error) {
      logger.error('updateCouponWebinar error:', error);
      throw error;
    }
  }

  async deleteCouponWebinar(id, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('Coupon webinar ID is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      const existingCouponWebinar = await couponManagementRepository.findCouponWebinarById(id);
      if (!existingCouponWebinar) {
        throw new NotFoundError('Coupon webinar not found');
      }

      await couponManagementRepository.deleteCouponWebinar(id);
    } catch (error) {
      logger.error('deleteCouponWebinar error:', error);
      throw error;
    }
  }

  async deleteCouponWebinarsBulk(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('Valid coupon webinar IDs array is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      await couponManagementRepository.deleteCouponWebinarsBulk(ids);
    } catch (error) {
      logger.error('deleteCouponWebinarsBulk error:', error);
      throw error;
    }
  }

  async restoreCouponWebinar(id, actingUserId) {
    try {
      if (!id) {
        throw new BadRequestError('Coupon webinar ID is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      await couponManagementRepository.restoreCouponWebinar(id);

      return { id };
    } catch (error) {
      logger.error('restoreCouponWebinar error:', error);
      throw error;
    }
  }

  async restoreCouponWebinarsBulk(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('Valid coupon webinar IDs array is required');
      }
      if (!actingUserId) {
        throw new BadRequestError('Acting user ID is required');
      }

      await couponManagementRepository.restoreCouponWebinarsBulk(ids);

      return { ids };
    } catch (error) {
      logger.error('restoreCouponWebinarsBulk error:', error);
      throw error;
    }
  }
}

module.exports = new CouponManagementService();
