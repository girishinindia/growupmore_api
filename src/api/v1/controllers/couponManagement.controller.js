/**
 * ═══════════════════════════════════════════════════════════════
 * COUPON MANAGEMENT CONTROLLER — Coupons, Translations, Courses, Bundles, Batches, Webinars
 * ═══════════════════════════════════════════════════════════════
 */

const service = require('../../../services/couponManagement.service');
const { sendSuccess, sendCreated } = require('../../../utils/response');

class CouponManagementController {
  // ============================================================================
  // COUPONS
  // ============================================================================

  async getCoupons(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'id', sortDir = 'ASC', code, discountType, applicableTo, isActive } = req.query;

      const data = await service.getCoupons({
        code: code || null,
        isActive: isActive !== undefined ? isActive : null,
        discountType: discountType || null,
        applicableTo: applicableTo || null,
        searchTerm: search || null,
        sortColumn: sortBy,
        sortDirection: sortDir,
        page: Number(page),
        limit: Number(limit),
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, { data, message: 'Coupons retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getCouponById(req, res, next) {
    try {
      const data = await service.getCouponById(req.params.id);
      sendSuccess(res, { data, message: 'Coupon retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createCoupon(req, res, next) {
    try {
      const data = await service.createCoupon(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Coupon created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateCoupon(req, res, next) {
    try {
      const data = await service.updateCoupon(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Coupon updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCoupon(req, res, next) {
    try {
      await service.deleteCoupon(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Coupon deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreCoupon(req, res, next) {
    try {
      const data = await service.restoreCoupon(req.params.id, req.body.restoreTranslations, req.user.userId);
      sendSuccess(res, { data, message: 'Coupon restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // COUPON TRANSLATIONS
  // ============================================================================

  async createCouponTranslation(req, res, next) {
    try {
      const data = await service.createCouponTranslation(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Coupon translation created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateCouponTranslation(req, res, next) {
    try {
      const data = await service.updateCouponTranslation(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Coupon translation updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCouponTranslation(req, res, next) {
    try {
      await service.deleteCouponTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Coupon translation deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreCouponTranslation(req, res, next) {
    try {
      const data = await service.restoreCouponTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { data, message: 'Coupon translation restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // COUPON COURSES
  // ============================================================================

  async getCouponCourses(req, res, next) {
    try {
      const { page = 1, limit = 20, couponId, courseId, isActive, search, sortBy = 'display_order', sortDir = 'ASC' } = req.query;

      const data = await service.getCouponCourses({
        couponId: couponId || null,
        courseId: courseId || null,
        isActive: isActive !== undefined ? isActive : null,
        searchTerm: search || null,
        sortColumn: sortBy,
        sortDirection: sortDir,
        page: Number(page),
        limit: Number(limit),
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, { data, message: 'Coupon courses retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getCouponCourseById(req, res, next) {
    try {
      const data = await service.getCouponCourseById(req.params.id);
      sendSuccess(res, { data, message: 'Coupon course retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createCouponCourse(req, res, next) {
    try {
      const data = await service.createCouponCourse(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Coupon course created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateCouponCourse(req, res, next) {
    try {
      const data = await service.updateCouponCourse(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Coupon course updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCouponCourse(req, res, next) {
    try {
      await service.deleteCouponCourse(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Coupon course deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCouponCoursesBulk(req, res, next) {
    try {
      await service.deleteCouponCoursesBulk(req.body.ids, req.user.userId);
      sendSuccess(res, { message: 'Coupon courses deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreCouponCourse(req, res, next) {
    try {
      const data = await service.restoreCouponCourse(req.params.id, req.user.userId);
      sendSuccess(res, { data, message: 'Coupon course restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreCouponCoursesBulk(req, res, next) {
    try {
      const data = await service.restoreCouponCoursesBulk(req.body.ids, req.user.userId);
      sendSuccess(res, { data, message: 'Coupon courses restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // COUPON BUNDLES
  // ============================================================================

  async getCouponBundles(req, res, next) {
    try {
      const { page = 1, limit = 20, couponId, bundleId, isActive, search, sortBy = 'display_order', sortDir = 'ASC' } = req.query;

      const data = await service.getCouponBundles({
        couponId: couponId || null,
        bundleId: bundleId || null,
        isActive: isActive !== undefined ? isActive : null,
        searchTerm: search || null,
        sortColumn: sortBy,
        sortDirection: sortDir,
        page: Number(page),
        limit: Number(limit),
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, { data, message: 'Coupon bundles retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getCouponBundleById(req, res, next) {
    try {
      const data = await service.getCouponBundleById(req.params.id);
      sendSuccess(res, { data, message: 'Coupon bundle retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createCouponBundle(req, res, next) {
    try {
      const data = await service.createCouponBundle(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Coupon bundle created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateCouponBundle(req, res, next) {
    try {
      const data = await service.updateCouponBundle(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Coupon bundle updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCouponBundle(req, res, next) {
    try {
      await service.deleteCouponBundle(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Coupon bundle deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCouponBundlesBulk(req, res, next) {
    try {
      await service.deleteCouponBundlesBulk(req.body.ids, req.user.userId);
      sendSuccess(res, { message: 'Coupon bundles deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreCouponBundle(req, res, next) {
    try {
      const data = await service.restoreCouponBundle(req.params.id, req.user.userId);
      sendSuccess(res, { data, message: 'Coupon bundle restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreCouponBundlesBulk(req, res, next) {
    try {
      const data = await service.restoreCouponBundlesBulk(req.body.ids, req.user.userId);
      sendSuccess(res, { data, message: 'Coupon bundles restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // COUPON BATCHES
  // ============================================================================

  async getCouponBatches(req, res, next) {
    try {
      const { page = 1, limit = 20, couponId, batchId, isActive, search, sortBy = 'display_order', sortDir = 'ASC' } = req.query;

      const data = await service.getCouponBatches({
        couponId: couponId || null,
        batchId: batchId || null,
        isActive: isActive !== undefined ? isActive : null,
        searchTerm: search || null,
        sortColumn: sortBy,
        sortDirection: sortDir,
        page: Number(page),
        limit: Number(limit),
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, { data, message: 'Coupon batches retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getCouponBatchById(req, res, next) {
    try {
      const data = await service.getCouponBatchById(req.params.id);
      sendSuccess(res, { data, message: 'Coupon batch retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createCouponBatch(req, res, next) {
    try {
      const data = await service.createCouponBatch(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Coupon batch created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateCouponBatch(req, res, next) {
    try {
      const data = await service.updateCouponBatch(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Coupon batch updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCouponBatch(req, res, next) {
    try {
      await service.deleteCouponBatch(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Coupon batch deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCouponBatchesBulk(req, res, next) {
    try {
      await service.deleteCouponBatchesBulk(req.body.ids, req.user.userId);
      sendSuccess(res, { message: 'Coupon batches deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreCouponBatch(req, res, next) {
    try {
      const data = await service.restoreCouponBatch(req.params.id, req.user.userId);
      sendSuccess(res, { data, message: 'Coupon batch restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreCouponBatchesBulk(req, res, next) {
    try {
      const data = await service.restoreCouponBatchesBulk(req.body.ids, req.user.userId);
      sendSuccess(res, { data, message: 'Coupon batches restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============================================================================
  // COUPON WEBINARS
  // ============================================================================

  async getCouponWebinars(req, res, next) {
    try {
      const { page = 1, limit = 20, couponId, webinarId, isActive, search, sortBy = 'display_order', sortDir = 'ASC' } = req.query;

      const data = await service.getCouponWebinars({
        couponId: couponId || null,
        webinarId: webinarId || null,
        isActive: isActive !== undefined ? isActive : null,
        searchTerm: search || null,
        sortColumn: sortBy,
        sortDirection: sortDir,
        page: Number(page),
        limit: Number(limit),
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, { data, message: 'Coupon webinars retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getCouponWebinarById(req, res, next) {
    try {
      const data = await service.getCouponWebinarById(req.params.id);
      sendSuccess(res, { data, message: 'Coupon webinar retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createCouponWebinar(req, res, next) {
    try {
      const data = await service.createCouponWebinar(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Coupon webinar created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateCouponWebinar(req, res, next) {
    try {
      const data = await service.updateCouponWebinar(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Coupon webinar updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCouponWebinar(req, res, next) {
    try {
      await service.deleteCouponWebinar(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Coupon webinar deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCouponWebinarsBulk(req, res, next) {
    try {
      await service.deleteCouponWebinarsBulk(req.body.ids, req.user.userId);
      sendSuccess(res, { message: 'Coupon webinars deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreCouponWebinar(req, res, next) {
    try {
      const data = await service.restoreCouponWebinar(req.params.id, req.user.userId);
      sendSuccess(res, { data, message: 'Coupon webinar restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreCouponWebinarsBulk(req, res, next) {
    try {
      const data = await service.restoreCouponWebinarsBulk(req.body.ids, req.user.userId);
      sendSuccess(res, { data, message: 'Coupon webinars restored successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CouponManagementController();
