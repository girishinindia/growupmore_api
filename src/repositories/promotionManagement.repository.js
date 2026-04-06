/**
 * ═══════════════════════════════════════════════════════════════
 * PROMOTION MANAGEMENT REPOSITORY — Database Layer (Supabase RPC)
 * ═══════════════════════════════════════════════════════════════
 * Handles Instructor Promotions, Translations, and Courses via:
 *
 *   INSTRUCTOR PROMOTIONS:
 *   - udf_get_instructor_promotions       — read, search, filter, paginate
 *   - sp_instructor_promotions_insert     — create, returns new id (BIGINT)
 *   - sp_instructor_promotions_update     — update, returns void
 *   - sp_instructor_promotions_delete     — soft delete, returns void
 *   - sp_instructor_promotions_restore    — restore, returns void
 *
 *   INSTRUCTOR PROMOTION TRANSLATIONS:
 *   - sp_instructor_promotion_translations_insert  — create, returns void
 *   - sp_instructor_promotion_translations_update  — update, returns void
 *   - sp_instructor_promotion_translations_delete  — soft delete, returns void
 *   - sp_instructor_promotion_translations_restore — restore, returns void
 *
 *   INSTRUCTOR PROMOTION COURSES:
 *   - udf_get_instructor_promotion_courses       — read, search, filter, paginate
 *   - sp_instructor_promotion_courses_insert     — create, returns new id (BIGINT)
 *   - sp_instructor_promotion_courses_update     — update, returns void
 *   - sp_instructor_promotion_courses_delete     — soft delete, returns void
 *   - sp_instructor_promotion_courses_restore    — restore, returns void
 * ═══════════════════════════════════════════════════════════════
 */

const { supabase } = require('../config/database');
const logger = require('../config/logger');

class PromotionManagementRepository {
  // ─────────────────────────────────────────────────────────────
  //  INSTRUCTOR PROMOTIONS — READ
  // ─────────────────────────────────────────────────────────────

  async findInstructorPromotionById(id) {
    const { data, error } = await supabase.rpc('udf_get_instructor_promotions', {
      p_instructor_id: null,
      p_promotion_status: null,
      p_discount_type: null,
      p_applicable_to: null,
      p_promo_code: null,
      p_valid_from_start: null,
      p_valid_from_end: null,
      p_valid_until_start: null,
      p_valid_until_end: null,
      p_is_active: null,
      p_search_term: null,
      p_sort_column: 'id',
      p_sort_direction: 'ASC',
      p_page_index: 1,
      p_page_size: 1,
      p_id: id,
    });

    if (error) {
      logger.error({ error }, 'PromotionManagementRepository.findInstructorPromotionById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  async getInstructorPromotions(options = {}) {
    const { data, error } = await supabase.rpc('udf_get_instructor_promotions', {
      p_instructor_id: options.filterInstructorId || null,
      p_promotion_status: options.filterPromotionStatus || null,
      p_discount_type: options.filterDiscountType || null,
      p_applicable_to: options.filterApplicableTo || null,
      p_promo_code: options.filterPromoCode || null,
      p_valid_from_start: options.filterValidFromStart || null,
      p_valid_from_end: options.filterValidFromEnd || null,
      p_valid_until_start: options.filterValidUntilStart || null,
      p_valid_until_end: options.filterValidUntilEnd || null,
      p_is_active: options.filterIsActive !== undefined ? options.filterIsActive : null,
      p_search_term: options.searchTerm || null,
      p_sort_column: options.sortColumn || 'id',
      p_sort_direction: options.sortDirection || 'ASC',
      p_page_index: options.pageIndex || 1,
      p_page_size: options.pageSize || 20,
      p_id: null,
    });

    if (error) {
      logger.error({ error }, 'PromotionManagementRepository.getInstructorPromotions failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  INSTRUCTOR PROMOTIONS — WRITE
  // ─────────────────────────────────────────────────────────────

  async createInstructorPromotion(promotionData) {
    const { data, error } = await supabase.rpc('sp_instructor_promotions_insert', {
      p_instructor_id: promotionData.instructorId,
      p_discount_type: promotionData.discountType,
      p_discount_value: promotionData.discountValue,
      p_valid_from: promotionData.validFrom,
      p_valid_until: promotionData.validUntil,
      p_promo_code: promotionData.promoCode,
      p_max_discount_amount: promotionData.maxDiscountAmount || null,
      p_min_purchase_amount: promotionData.minPurchaseAmount || null,
      p_applicable_to: promotionData.applicableTo || 'all_my_courses',
      p_usage_limit: promotionData.usageLimit || null,
      p_usage_per_user: promotionData.usagePerUser || 1,
      p_promotion_status: promotionData.promotionStatus || 'draft',
      p_requires_approval: promotionData.requiresApproval !== undefined ? promotionData.requiresApproval : true,
      p_is_active: promotionData.isActive !== undefined ? promotionData.isActive : true,
      p_created_by: promotionData.createdBy,
    });

    if (error) {
      logger.error({ error }, 'PromotionManagementRepository.createInstructorPromotion failed');
      throw error;
    }

    const newId = data;
    return this.findInstructorPromotionById(newId);
  }

  async updateInstructorPromotion(id, updates) {
    const { error } = await supabase.rpc('sp_instructor_promotions_update', {
      p_id: id,
      p_promo_code: updates.promoCode !== undefined ? updates.promoCode : null,
      p_discount_type: updates.discountType || null,
      p_discount_value: updates.discountValue !== undefined ? updates.discountValue : null,
      p_max_discount_amount: updates.maxDiscountAmount !== undefined ? updates.maxDiscountAmount : null,
      p_min_purchase_amount: updates.minPurchaseAmount !== undefined ? updates.minPurchaseAmount : null,
      p_applicable_to: updates.applicableTo || null,
      p_valid_from: updates.validFrom !== undefined ? updates.validFrom : null,
      p_valid_until: updates.validUntil !== undefined ? updates.validUntil : null,
      p_usage_limit: updates.usageLimit !== undefined ? updates.usageLimit : null,
      p_usage_per_user: updates.usagePerUser !== undefined ? updates.usagePerUser : null,
      p_promotion_status: updates.promotionStatus || null,
      p_requires_approval: updates.requiresApproval !== undefined ? updates.requiresApproval : null,
      p_approved_by: updates.approvedBy !== undefined ? updates.approvedBy : null,
      p_approved_at: updates.approvedAt !== undefined ? updates.approvedAt : null,
      p_rejection_reason: updates.rejectionReason !== undefined ? updates.rejectionReason : null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
      p_updated_by: updates.updatedBy || null,
    });

    if (error) {
      logger.error({ error }, 'PromotionManagementRepository.updateInstructorPromotion failed');
      throw error;
    }

    return this.findInstructorPromotionById(id);
  }

  async deleteInstructorPromotion(id) {
    const { error } = await supabase.rpc('sp_instructor_promotions_delete', {
      p_id: id,
    });

    if (error) {
      logger.error({ error }, 'PromotionManagementRepository.deleteInstructorPromotion failed');
      throw error;
    }
  }

  async restoreInstructorPromotion(id) {
    const { error } = await supabase.rpc('sp_instructor_promotions_restore', {
      p_id: id,
    });

    if (error) {
      logger.error({ error }, 'PromotionManagementRepository.restoreInstructorPromotion failed');
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  INSTRUCTOR PROMOTION TRANSLATIONS — READ
  // ─────────────────────────────────────────────────────────────

  async findInstructorPromotionTranslationById(id) {
    // Direct find by ID from table (no UDF)
    const { data, error } = await supabase
      .from('instructor_promotion_translations')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error({ error }, 'PromotionManagementRepository.findInstructorPromotionTranslationById failed');
      throw error;
    }

    return data || null;
  }

  async getInstructorPromotionTranslations(promotionId) {
    const { data, error } = await supabase
      .from('instructor_promotion_translations')
      .select('*')
      .eq('promotion_id', promotionId)
      .order('id', { ascending: true });

    if (error) {
      logger.error({ error }, 'PromotionManagementRepository.getInstructorPromotionTranslations failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  INSTRUCTOR PROMOTION TRANSLATIONS — WRITE
  // ─────────────────────────────────────────────────────────────

  async createInstructorPromotionTranslation(translationData) {
    const { data, error } = await supabase.rpc('sp_instructor_promotion_translations_insert', {
      p_promotion_id: translationData.promotionId,
      p_language_id: translationData.languageId,
      p_promotion_name: translationData.promotionName,
      p_description: translationData.description || null,
      p_is_active: translationData.isActive !== undefined ? translationData.isActive : true,
    });

    if (error) {
      logger.error({ error }, 'PromotionManagementRepository.createInstructorPromotionTranslation failed');
      throw error;
    }

    return data;
  }

  async updateInstructorPromotionTranslation(id, updates) {
    const { error } = await supabase.rpc('sp_instructor_promotion_translations_update', {
      p_id: id,
      p_promotion_name: updates.promotionName || null,
      p_description: updates.description !== undefined ? updates.description : null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
    });

    if (error) {
      logger.error({ error }, 'PromotionManagementRepository.updateInstructorPromotionTranslation failed');
      throw error;
    }

    return this.findInstructorPromotionTranslationById(id);
  }

  async deleteInstructorPromotionTranslation(id) {
    const { error } = await supabase.rpc('sp_instructor_promotion_translations_delete', {
      p_id: id,
    });

    if (error) {
      logger.error({ error }, 'PromotionManagementRepository.deleteInstructorPromotionTranslation failed');
      throw error;
    }
  }

  async restoreInstructorPromotionTranslation(id) {
    const { error } = await supabase.rpc('sp_instructor_promotion_translations_restore', {
      p_id: id,
    });

    if (error) {
      logger.error({ error }, 'PromotionManagementRepository.restoreInstructorPromotionTranslation failed');
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  INSTRUCTOR PROMOTION COURSES — READ
  // ─────────────────────────────────────────────────────────────

  async findInstructorPromotionCourseById(id) {
    const { data, error } = await supabase.rpc('udf_get_instructor_promotion_courses', {
      p_promotion_id: null,
      p_course_id: null,
      p_is_active: null,
      p_sort_column: 'display_order',
      p_sort_direction: 'ASC',
      p_page_index: 1,
      p_page_size: 1,
      p_id: id,
    });

    if (error) {
      logger.error({ error }, 'PromotionManagementRepository.findInstructorPromotionCourseById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  async getInstructorPromotionCourses(options = {}) {
    const { data, error } = await supabase.rpc('udf_get_instructor_promotion_courses', {
      p_promotion_id: options.filterPromotionId || null,
      p_course_id: options.filterCourseId || null,
      p_is_active: options.filterIsActive !== undefined ? options.filterIsActive : null,
      p_sort_column: options.sortColumn || 'display_order',
      p_sort_direction: options.sortDirection || 'ASC',
      p_page_index: options.pageIndex || 1,
      p_page_size: options.pageSize || 20,
      p_id: null,
    });

    if (error) {
      logger.error({ error }, 'PromotionManagementRepository.getInstructorPromotionCourses failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  INSTRUCTOR PROMOTION COURSES — WRITE
  // ─────────────────────────────────────────────────────────────

  async createInstructorPromotionCourse(courseData) {
    const { data, error } = await supabase.rpc('sp_instructor_promotion_courses_insert', {
      p_promotion_id: courseData.promotionId,
      p_course_id: courseData.courseId,
      p_display_order: courseData.displayOrder || 0,
      p_is_active: courseData.isActive !== undefined ? courseData.isActive : true,
      p_created_by: courseData.createdBy,
    });

    if (error) {
      logger.error({ error }, 'PromotionManagementRepository.createInstructorPromotionCourse failed');
      throw error;
    }

    const newId = data;
    return this.findInstructorPromotionCourseById(newId);
  }

  async updateInstructorPromotionCourse(id, updates) {
    const { error } = await supabase.rpc('sp_instructor_promotion_courses_update', {
      p_id: id,
      p_display_order: updates.displayOrder !== undefined ? updates.displayOrder : null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
      p_updated_by: updates.updatedBy || null,
    });

    if (error) {
      logger.error({ error }, 'PromotionManagementRepository.updateInstructorPromotionCourse failed');
      throw error;
    }

    return this.findInstructorPromotionCourseById(id);
  }

  async deleteInstructorPromotionCourse(id) {
    const { error } = await supabase.rpc('sp_instructor_promotion_courses_delete', {
      p_id: id,
    });

    if (error) {
      logger.error({ error }, 'PromotionManagementRepository.deleteInstructorPromotionCourse failed');
      throw error;
    }
  }

  async restoreInstructorPromotionCourse(id) {
    const { error } = await supabase.rpc('sp_instructor_promotion_courses_restore', {
      p_id: id,
    });

    if (error) {
      logger.error({ error }, 'PromotionManagementRepository.restoreInstructorPromotionCourse failed');
      throw error;
    }
  }
}

module.exports = new PromotionManagementRepository();
