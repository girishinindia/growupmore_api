const { supabase } = require('../config/database');
const logger = require('../config/logger');

class CouponManagementRepository {
  // ============================================================================
  // 1. COUPONS
  // ============================================================================

  async findCouponById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_coupons', {
        p_id: id,
        p_code: null,
        p_is_active: null,
        p_discount_type: null,
        p_applicable_to: null,
        p_search_term: null,
        p_sort_column: null,
        p_sort_direction: null,
        p_page_index: null,
        p_page_size: 1,
      });

      if (error) {
        logger.error('findCouponById error:', error);
        throw error;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      logger.error('findCouponById exception:', error);
      throw error;
    }
  }

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
        pageIndex = null,
        pageSize = null,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_coupons', {
        p_id: null,
        p_code: code,
        p_is_active: isActive,
        p_discount_type: discountType,
        p_applicable_to: applicableTo,
        p_search_term: searchTerm,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_page_index: pageIndex,
        p_page_size: pageSize,
      });

      if (error) {
        logger.error('getCoupons error:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('getCoupons exception:', error);
      throw error;
    }
  }

  async createCoupon(data) {
    try {
      const {
        code,
        discountType,
        discountValue,
        minPurchaseAmount = null,
        maxDiscountAmount = null,
        applicableTo,
        usageLimit = null,
        usagePerUser = null,
        validFrom = null,
        validUntil = null,
        isActive = true,
        createdBy,
      } = data;

      const { data: newId, error } = await supabase.rpc('sp_coupons_insert', {
        p_code: code,
        p_discount_type: discountType,
        p_discount_value: discountValue,
        p_min_purchase_amount: minPurchaseAmount,
        p_max_discount_amount: maxDiscountAmount,
        p_applicable_to: applicableTo,
        p_usage_limit: usageLimit,
        p_usage_per_user: usagePerUser,
        p_valid_from: validFrom,
        p_valid_until: validUntil,
        p_is_active: isActive,
        p_created_by: createdBy,
      });

      if (error) {
        logger.error('createCoupon error:', error);
        throw error;
      }

      return await this.findCouponById(newId);
    } catch (error) {
      logger.error('createCoupon exception:', error);
      throw error;
    }
  }

  async updateCoupon(id, data) {
    try {
      const {
        discountValue = null,
        minPurchaseAmount = null,
        maxDiscountAmount = null,
        usageLimit = null,
        usagePerUser = null,
        validFrom = null,
        validUntil = null,
        isActive = null,
        updatedBy,
      } = data;

      const { error } = await supabase.rpc('sp_coupons_update', {
        p_id: id,
        p_discount_value: discountValue,
        p_min_purchase_amount: minPurchaseAmount,
        p_max_discount_amount: maxDiscountAmount,
        p_usage_limit: usageLimit,
        p_usage_per_user: usagePerUser,
        p_valid_from: validFrom,
        p_valid_until: validUntil,
        p_is_active: isActive,
        p_updated_by: updatedBy,
      });

      if (error) {
        logger.error('updateCoupon error:', error);
        throw error;
      }

      return await this.findCouponById(id);
    } catch (error) {
      logger.error('updateCoupon exception:', error);
      throw error;
    }
  }

  async deleteCoupon(id) {
    try {
      const { error } = await supabase.rpc('sp_coupons_delete', {
        p_id: id,
      });

      if (error) {
        logger.error('deleteCoupon error:', error);
        throw error;
      }
    } catch (error) {
      logger.error('deleteCoupon exception:', error);
      throw error;
    }
  }

  async restoreCoupon(id, restoreTranslations) {
    try {
      const { error } = await supabase.rpc('sp_coupons_restore', {
        p_id: id,
        p_restore_translations: restoreTranslations,
      });

      if (error) {
        logger.error('restoreCoupon error:', error);
        throw error;
      }
    } catch (error) {
      logger.error('restoreCoupon exception:', error);
      throw error;
    }
  }

  // ============================================================================
  // 2. COUPON TRANSLATIONS
  // ============================================================================

  async createCouponTranslation(data) {
    try {
      const { couponId, languageId, title, description = null, isActive = true } = data;

      const { error } = await supabase.rpc('sp_coupon_translations_insert', {
        p_coupon_id: couponId,
        p_language_id: languageId,
        p_title: title,
        p_description: description,
        p_is_active: isActive,
      });

      if (error) {
        logger.error('createCouponTranslation error:', error);
        throw error;
      }
    } catch (error) {
      logger.error('createCouponTranslation exception:', error);
      throw error;
    }
  }

  async updateCouponTranslation(id, data) {
    try {
      const { title = null, description = null, isActive = null } = data;

      const { error } = await supabase.rpc('sp_coupon_translations_update', {
        p_id: id,
        p_title: title,
        p_description: description,
        p_is_active: isActive,
      });

      if (error) {
        logger.error('updateCouponTranslation error:', error);
        throw error;
      }
    } catch (error) {
      logger.error('updateCouponTranslation exception:', error);
      throw error;
    }
  }

  async deleteCouponTranslation(id) {
    try {
      const { error } = await supabase.rpc('sp_coupon_translations_delete', {
        p_id: id,
      });

      if (error) {
        logger.error('deleteCouponTranslation error:', error);
        throw error;
      }
    } catch (error) {
      logger.error('deleteCouponTranslation exception:', error);
      throw error;
    }
  }

  async restoreCouponTranslation(id) {
    try {
      const { error } = await supabase.rpc('sp_coupon_translations_restore', {
        p_id: id,
      });

      if (error) {
        logger.error('restoreCouponTranslation error:', error);
        throw error;
      }
    } catch (error) {
      logger.error('restoreCouponTranslation exception:', error);
      throw error;
    }
  }

  // ============================================================================
  // 3. COUPON COURSES
  // ============================================================================

  async findCouponCourseById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_coupon_courses', {
        p_id: id,
        p_coupon_id: null,
        p_course_id: null,
        p_is_active: null,
        p_search_term: null,
        p_sort_column: null,
        p_sort_direction: null,
        p_page_index: null,
        p_page_size: 1,
      });

      if (error) {
        logger.error('findCouponCourseById error:', error);
        throw error;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      logger.error('findCouponCourseById exception:', error);
      throw error;
    }
  }

  async getCouponCourses(options = {}) {
    try {
      const {
        couponId = null,
        courseId = null,
        isActive = null,
        searchTerm = null,
        sortColumn = null,
        sortDirection = null,
        pageIndex = null,
        pageSize = null,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_coupon_courses', {
        p_id: null,
        p_coupon_id: couponId,
        p_course_id: courseId,
        p_is_active: isActive,
        p_search_term: searchTerm,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_page_index: pageIndex,
        p_page_size: pageSize,
      });

      if (error) {
        logger.error('getCouponCourses error:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('getCouponCourses exception:', error);
      throw error;
    }
  }

  async createCouponCourse(data) {
    try {
      const { couponId, courseId, displayOrder = null, isActive = true, createdBy } = data;

      const { data: newId, error } = await supabase.rpc('sp_coupon_courses_insert', {
        p_coupon_id: couponId,
        p_course_id: courseId,
        p_display_order: displayOrder,
        p_is_active: isActive,
        p_created_by: createdBy,
      });

      if (error) {
        logger.error('createCouponCourse error:', error);
        throw error;
      }

      return await this.findCouponCourseById(newId);
    } catch (error) {
      logger.error('createCouponCourse exception:', error);
      throw error;
    }
  }

  async updateCouponCourse(id, data) {
    try {
      const { displayOrder = null, isActive = null, updatedBy } = data;

      const { error } = await supabase.rpc('sp_coupon_courses_update', {
        p_id: id,
        p_display_order: displayOrder,
        p_is_active: isActive,
        p_updated_by: updatedBy,
      });

      if (error) {
        logger.error('updateCouponCourse error:', error);
        throw error;
      }

      return await this.findCouponCourseById(id);
    } catch (error) {
      logger.error('updateCouponCourse exception:', error);
      throw error;
    }
  }

  async deleteCouponCourse(id) {
    try {
      const { error } = await supabase.rpc('sp_coupon_courses_delete_single', {
        p_id: id,
      });

      if (error) {
        logger.error('deleteCouponCourse error:', error);
        throw error;
      }
    } catch (error) {
      logger.error('deleteCouponCourse exception:', error);
      throw error;
    }
  }

  async deleteCouponCoursesBulk(ids) {
    try {
      const { error } = await supabase.rpc('sp_coupon_courses_delete', {
        p_ids: ids,
      });

      if (error) {
        logger.error('deleteCouponCoursesBulk error:', error);
        throw error;
      }
    } catch (error) {
      logger.error('deleteCouponCoursesBulk exception:', error);
      throw error;
    }
  }

  async restoreCouponCourse(id) {
    try {
      const { error } = await supabase.rpc('sp_coupon_courses_restore_single', {
        p_id: id,
      });

      if (error) {
        logger.error('restoreCouponCourse error:', error);
        throw error;
      }
    } catch (error) {
      logger.error('restoreCouponCourse exception:', error);
      throw error;
    }
  }

  async restoreCouponCoursesBulk(ids) {
    try {
      const { error } = await supabase.rpc('sp_coupon_courses_restore', {
        p_ids: ids,
      });

      if (error) {
        logger.error('restoreCouponCoursesBulk error:', error);
        throw error;
      }
    } catch (error) {
      logger.error('restoreCouponCoursesBulk exception:', error);
      throw error;
    }
  }

  // ============================================================================
  // 4. COUPON BUNDLES
  // ============================================================================

  async findCouponBundleById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_coupon_bundles', {
        p_id: id,
        p_coupon_id: null,
        p_bundle_id: null,
        p_is_active: null,
        p_search_term: null,
        p_sort_column: null,
        p_sort_direction: null,
        p_page_index: null,
        p_page_size: 1,
      });

      if (error) {
        logger.error('findCouponBundleById error:', error);
        throw error;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      logger.error('findCouponBundleById exception:', error);
      throw error;
    }
  }

  async getCouponBundles(options = {}) {
    try {
      const {
        couponId = null,
        bundleId = null,
        isActive = null,
        searchTerm = null,
        sortColumn = null,
        sortDirection = null,
        pageIndex = null,
        pageSize = null,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_coupon_bundles', {
        p_id: null,
        p_coupon_id: couponId,
        p_bundle_id: bundleId,
        p_is_active: isActive,
        p_search_term: searchTerm,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_page_index: pageIndex,
        p_page_size: pageSize,
      });

      if (error) {
        logger.error('getCouponBundles error:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('getCouponBundles exception:', error);
      throw error;
    }
  }

  async createCouponBundle(data) {
    try {
      const { couponId, bundleId, displayOrder = null, isActive = true, createdBy } = data;

      const { data: newId, error } = await supabase.rpc('sp_coupon_bundles_insert', {
        p_coupon_id: couponId,
        p_bundle_id: bundleId,
        p_display_order: displayOrder,
        p_is_active: isActive,
        p_created_by: createdBy,
      });

      if (error) {
        logger.error('createCouponBundle error:', error);
        throw error;
      }

      return await this.findCouponBundleById(newId);
    } catch (error) {
      logger.error('createCouponBundle exception:', error);
      throw error;
    }
  }

  async updateCouponBundle(id, data) {
    try {
      const { displayOrder = null, isActive = null, updatedBy } = data;

      const { error } = await supabase.rpc('sp_coupon_bundles_update', {
        p_id: id,
        p_display_order: displayOrder,
        p_is_active: isActive,
        p_updated_by: updatedBy,
      });

      if (error) {
        logger.error('updateCouponBundle error:', error);
        throw error;
      }

      return await this.findCouponBundleById(id);
    } catch (error) {
      logger.error('updateCouponBundle exception:', error);
      throw error;
    }
  }

  async deleteCouponBundle(id) {
    try {
      const { error } = await supabase.rpc('sp_coupon_bundles_delete_single', {
        p_id: id,
      });

      if (error) {
        logger.error('deleteCouponBundle error:', error);
        throw error;
      }
    } catch (error) {
      logger.error('deleteCouponBundle exception:', error);
      throw error;
    }
  }

  async deleteCouponBundlesBulk(ids) {
    try {
      const { error } = await supabase.rpc('sp_coupon_bundles_delete', {
        p_ids: ids,
      });

      if (error) {
        logger.error('deleteCouponBundlesBulk error:', error);
        throw error;
      }
    } catch (error) {
      logger.error('deleteCouponBundlesBulk exception:', error);
      throw error;
    }
  }

  async restoreCouponBundle(id) {
    try {
      const { error } = await supabase.rpc('sp_coupon_bundles_restore_single', {
        p_id: id,
      });

      if (error) {
        logger.error('restoreCouponBundle error:', error);
        throw error;
      }
    } catch (error) {
      logger.error('restoreCouponBundle exception:', error);
      throw error;
    }
  }

  async restoreCouponBundlesBulk(ids) {
    try {
      const { error } = await supabase.rpc('sp_coupon_bundles_restore', {
        p_ids: ids,
      });

      if (error) {
        logger.error('restoreCouponBundlesBulk error:', error);
        throw error;
      }
    } catch (error) {
      logger.error('restoreCouponBundlesBulk exception:', error);
      throw error;
    }
  }

  // ============================================================================
  // 5. COUPON BATCHES
  // ============================================================================

  async findCouponBatchById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_coupon_batches', {
        p_id: id,
        p_coupon_id: null,
        p_batch_id: null,
        p_is_active: null,
        p_search_term: null,
        p_sort_column: null,
        p_sort_direction: null,
        p_page_index: null,
        p_page_size: 1,
      });

      if (error) {
        logger.error('findCouponBatchById error:', error);
        throw error;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      logger.error('findCouponBatchById exception:', error);
      throw error;
    }
  }

  async getCouponBatches(options = {}) {
    try {
      const {
        couponId = null,
        batchId = null,
        isActive = null,
        searchTerm = null,
        sortColumn = null,
        sortDirection = null,
        pageIndex = null,
        pageSize = null,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_coupon_batches', {
        p_id: null,
        p_coupon_id: couponId,
        p_batch_id: batchId,
        p_is_active: isActive,
        p_search_term: searchTerm,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_page_index: pageIndex,
        p_page_size: pageSize,
      });

      if (error) {
        logger.error('getCouponBatches error:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('getCouponBatches exception:', error);
      throw error;
    }
  }

  async createCouponBatch(data) {
    try {
      const { couponId, batchId, displayOrder = null, isActive = true, createdBy } = data;

      const { data: newId, error } = await supabase.rpc('sp_coupon_batches_insert', {
        p_coupon_id: couponId,
        p_batch_id: batchId,
        p_display_order: displayOrder,
        p_is_active: isActive,
        p_created_by: createdBy,
      });

      if (error) {
        logger.error('createCouponBatch error:', error);
        throw error;
      }

      return await this.findCouponBatchById(newId);
    } catch (error) {
      logger.error('createCouponBatch exception:', error);
      throw error;
    }
  }

  async updateCouponBatch(id, data) {
    try {
      const { displayOrder = null, isActive = null, updatedBy } = data;

      const { error } = await supabase.rpc('sp_coupon_batches_update', {
        p_id: id,
        p_display_order: displayOrder,
        p_is_active: isActive,
        p_updated_by: updatedBy,
      });

      if (error) {
        logger.error('updateCouponBatch error:', error);
        throw error;
      }

      return await this.findCouponBatchById(id);
    } catch (error) {
      logger.error('updateCouponBatch exception:', error);
      throw error;
    }
  }

  async deleteCouponBatch(id) {
    try {
      const { error } = await supabase.rpc('sp_coupon_batches_delete_single', {
        p_id: id,
      });

      if (error) {
        logger.error('deleteCouponBatch error:', error);
        throw error;
      }
    } catch (error) {
      logger.error('deleteCouponBatch exception:', error);
      throw error;
    }
  }

  async deleteCouponBatchesBulk(ids) {
    try {
      const { error } = await supabase.rpc('sp_coupon_batches_delete', {
        p_ids: ids,
      });

      if (error) {
        logger.error('deleteCouponBatchesBulk error:', error);
        throw error;
      }
    } catch (error) {
      logger.error('deleteCouponBatchesBulk exception:', error);
      throw error;
    }
  }

  async restoreCouponBatch(id) {
    try {
      const { error } = await supabase.rpc('sp_coupon_batches_restore_single', {
        p_id: id,
      });

      if (error) {
        logger.error('restoreCouponBatch error:', error);
        throw error;
      }
    } catch (error) {
      logger.error('restoreCouponBatch exception:', error);
      throw error;
    }
  }

  async restoreCouponBatchesBulk(ids) {
    try {
      const { error } = await supabase.rpc('sp_coupon_batches_restore', {
        p_ids: ids,
      });

      if (error) {
        logger.error('restoreCouponBatchesBulk error:', error);
        throw error;
      }
    } catch (error) {
      logger.error('restoreCouponBatchesBulk exception:', error);
      throw error;
    }
  }

  // ============================================================================
  // 6. COUPON WEBINARS
  // ============================================================================

  async findCouponWebinarById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_coupon_webinars', {
        p_id: id,
        p_coupon_id: null,
        p_webinar_id: null,
        p_is_active: null,
        p_search_term: null,
        p_sort_column: null,
        p_sort_direction: null,
        p_page_index: null,
        p_page_size: 1,
      });

      if (error) {
        logger.error('findCouponWebinarById error:', error);
        throw error;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      logger.error('findCouponWebinarById exception:', error);
      throw error;
    }
  }

  async getCouponWebinars(options = {}) {
    try {
      const {
        couponId = null,
        webinarId = null,
        isActive = null,
        searchTerm = null,
        sortColumn = null,
        sortDirection = null,
        pageIndex = null,
        pageSize = null,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_coupon_webinars', {
        p_id: null,
        p_coupon_id: couponId,
        p_webinar_id: webinarId,
        p_is_active: isActive,
        p_search_term: searchTerm,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_page_index: pageIndex,
        p_page_size: pageSize,
      });

      if (error) {
        logger.error('getCouponWebinars error:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('getCouponWebinars exception:', error);
      throw error;
    }
  }

  async createCouponWebinar(data) {
    try {
      const { couponId, webinarId, displayOrder = null, isActive = true, createdBy } = data;

      const { data: newId, error } = await supabase.rpc('sp_coupon_webinars_insert', {
        p_coupon_id: couponId,
        p_webinar_id: webinarId,
        p_display_order: displayOrder,
        p_is_active: isActive,
        p_created_by: createdBy,
      });

      if (error) {
        logger.error('createCouponWebinar error:', error);
        throw error;
      }

      return await this.findCouponWebinarById(newId);
    } catch (error) {
      logger.error('createCouponWebinar exception:', error);
      throw error;
    }
  }

  async updateCouponWebinar(id, data) {
    try {
      const { displayOrder = null, isActive = null, updatedBy } = data;

      const { error } = await supabase.rpc('sp_coupon_webinars_update', {
        p_id: id,
        p_display_order: displayOrder,
        p_is_active: isActive,
        p_updated_by: updatedBy,
      });

      if (error) {
        logger.error('updateCouponWebinar error:', error);
        throw error;
      }

      return await this.findCouponWebinarById(id);
    } catch (error) {
      logger.error('updateCouponWebinar exception:', error);
      throw error;
    }
  }

  async deleteCouponWebinar(id) {
    try {
      const { error } = await supabase.rpc('sp_coupon_webinars_delete_single', {
        p_id: id,
      });

      if (error) {
        logger.error('deleteCouponWebinar error:', error);
        throw error;
      }
    } catch (error) {
      logger.error('deleteCouponWebinar exception:', error);
      throw error;
    }
  }

  async deleteCouponWebinarsBulk(ids) {
    try {
      const { error } = await supabase.rpc('sp_coupon_webinars_delete', {
        p_ids: ids,
      });

      if (error) {
        logger.error('deleteCouponWebinarsBulk error:', error);
        throw error;
      }
    } catch (error) {
      logger.error('deleteCouponWebinarsBulk exception:', error);
      throw error;
    }
  }

  async restoreCouponWebinar(id) {
    try {
      const { error } = await supabase.rpc('sp_coupon_webinars_restore_single', {
        p_id: id,
      });

      if (error) {
        logger.error('restoreCouponWebinar error:', error);
        throw error;
      }
    } catch (error) {
      logger.error('restoreCouponWebinar exception:', error);
      throw error;
    }
  }

  async restoreCouponWebinarsBulk(ids) {
    try {
      const { error } = await supabase.rpc('sp_coupon_webinars_restore', {
        p_ids: ids,
      });

      if (error) {
        logger.error('restoreCouponWebinarsBulk error:', error);
        throw error;
      }
    } catch (error) {
      logger.error('restoreCouponWebinarsBulk exception:', error);
      throw error;
    }
  }
}

module.exports = new CouponManagementRepository();
