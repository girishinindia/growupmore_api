/**
 * ═══════════════════════════════════════════════════════════════
 * WISHLIST & CART MANAGEMENT REPOSITORY — Database Layer (Supabase RPC)
 * ═══════════════════════════════════════════════════════════════
 * Handles Wishlists, Carts, and Cart Items via:
 *
 *   WISHLISTS:
 *   - udf_get_wishlists          — read, search, filter, paginate
 *   - sp_wishlists_insert        — create, returns new id (BIGINT)
 *   - sp_wishlists_update        — update, returns void
 *   - sp_wishlists_delete        — soft delete single, returns void
 *   - sp_wishlists_delete_single — soft delete single, returns void
 *   - sp_wishlists_restore       — bulk restore, returns void
 *   - sp_wishlists_restore_single— restore single, returns void
 *
 *   CARTS:
 *   - udf_get_carts              — read, search, filter, paginate
 *   - sp_carts_insert            — create, returns new id (BIGINT)
 *   - sp_carts_update            — update, returns void
 *   - sp_carts_delete            — soft delete single, returns void
 *   - sp_carts_restore           — restore single, returns void
 *   - sp_carts_delete_multiple   — bulk soft delete, returns void
 *
 *   CART ITEMS:
 *   - udf_get_cart_items         — read, search, filter, paginate
 *   - sp_cart_items_insert       — create, returns new id (BIGINT)
 *   - sp_cart_items_update       — update, returns void
 *   - sp_cart_items_delete       — soft delete, returns void
 *   - sp_cart_items_restore      — restore, returns void
 * ═══════════════════════════════════════════════════════════════
 */

const { supabase } = require('../config/database');
const logger = require('../config/logger');

class WishlistCartManagementRepository {
  // ─────────────────────────────────────────────────────────────
  //  WISHLISTS — READ
  // ─────────────────────────────────────────────────────────────

  async findWishlistById(wishlistId) {
    const { data, error } = await supabase.rpc('udf_get_wishlists', {
      p_id: wishlistId,
      p_student_id: null,
      p_is_active: null,
      p_item_type: null,
      p_course_id: null,
      p_bundle_id: null,
      p_batch_id: null,
      p_webinar_id: null,
      p_sort_column: 'created_at',
      p_sort_direction: 'DESC',
      p_filter_is_active: null,
      p_filter_is_deleted: null,
      p_search_term: null,
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'WishlistCartManagementRepository.findWishlistById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  async getWishlists(options = {}) {
    const { data, error } = await supabase.rpc('udf_get_wishlists', {
      p_id: options.id || null,
      p_student_id: options.studentId || null,
      p_is_active: options.isActive !== undefined ? options.isActive : null,
      p_item_type: options.itemType || null,
      p_course_id: options.courseId || null,
      p_bundle_id: options.bundleId || null,
      p_batch_id: options.batchId || null,
      p_webinar_id: options.webinarId || null,
      p_sort_column: options.sortColumn || 'created_at',
      p_sort_direction: options.sortDirection || 'DESC',
      p_filter_is_active: options.filterIsActive !== undefined ? options.filterIsActive : null,
      p_filter_is_deleted: options.filterIsDeleted !== undefined ? options.filterIsDeleted : false,
      p_search_term: options.searchTerm || null,
      p_page_index: options.pageIndex || 1,
      p_page_size: options.pageSize || 20,
    });

    if (error) {
      logger.error({ error }, 'WishlistCartManagementRepository.getWishlists failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  WISHLISTS — WRITE
  // ─────────────────────────────────────────────────────────────

  async createWishlist(wishlistData) {
    const { data, error } = await supabase.rpc('sp_wishlists_insert', {
      p_student_id: wishlistData.studentId,
      p_item_type: wishlistData.itemType,
      p_course_id: wishlistData.courseId || null,
      p_bundle_id: wishlistData.bundleId || null,
      p_batch_id: wishlistData.batchId || null,
      p_webinar_id: wishlistData.webinarId || null,
      p_is_active: wishlistData.isActive !== undefined ? wishlistData.isActive : true,
      p_created_by: wishlistData.createdBy,
    });

    if (error) {
      logger.error({ error }, 'WishlistCartManagementRepository.createWishlist failed');
      throw error;
    }

    const newId = data;
    return this.findWishlistById(newId);
  }

  async updateWishlist(wishlistId, updates) {
    const { error } = await supabase.rpc('sp_wishlists_update', {
      p_id: wishlistId,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
      p_updated_by: updates.updatedBy,
    });

    if (error) {
      logger.error({ error }, 'WishlistCartManagementRepository.updateWishlist failed');
      throw error;
    }

    return this.findWishlistById(wishlistId);
  }

  async deleteWishlist(wishlistId) {
    const { error } = await supabase.rpc('sp_wishlists_delete_single', {
      p_id: wishlistId,
    });

    if (error) {
      logger.error({ error }, 'WishlistCartManagementRepository.deleteWishlist failed');
      throw error;
    }
  }

  async deleteWishlistsBulk(wishlistIds) {
    const { error } = await supabase.rpc('sp_wishlists_delete', {
      p_ids: wishlistIds,
    });

    if (error) {
      logger.error({ error }, 'WishlistCartManagementRepository.deleteWishlistsBulk failed');
      throw error;
    }
  }

  async restoreWishlist(wishlistId) {
    const { error } = await supabase.rpc('sp_wishlists_restore_single', {
      p_id: wishlistId,
    });

    if (error) {
      logger.error({ error }, 'WishlistCartManagementRepository.restoreWishlist failed');
      throw error;
    }

    return this.findWishlistById(wishlistId);
  }

  async restoreWishlistsBulk(wishlistIds) {
    const { error } = await supabase.rpc('sp_wishlists_restore', {
      p_ids: wishlistIds,
    });

    if (error) {
      logger.error({ error }, 'WishlistCartManagementRepository.restoreWishlistsBulk failed');
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  CARTS — READ
  // ─────────────────────────────────────────────────────────────

  async findCartById(cartId) {
    const { data, error } = await supabase.rpc('udf_get_carts', {
      p_id: cartId,
      p_student_id: null,
      p_is_active: null,
      p_cart_status: null,
      p_coupon_id: null,
      p_sort_column: 'created_at',
      p_sort_direction: 'DESC',
      p_filter_is_active: null,
      p_filter_is_deleted: null,
      p_search_term: null,
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'WishlistCartManagementRepository.findCartById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  async getCarts(options = {}) {
    const { data, error } = await supabase.rpc('udf_get_carts', {
      p_id: options.id || null,
      p_student_id: options.studentId || null,
      p_is_active: options.isActive !== undefined ? options.isActive : null,
      p_cart_status: options.cartStatus || null,
      p_coupon_id: options.couponId || null,
      p_sort_column: options.sortColumn || 'created_at',
      p_sort_direction: options.sortDirection || 'DESC',
      p_filter_is_active: options.filterIsActive !== undefined ? options.filterIsActive : null,
      p_filter_is_deleted: options.filterIsDeleted !== undefined ? options.filterIsDeleted : false,
      p_search_term: options.searchTerm || null,
      p_page_index: options.pageIndex || 1,
      p_page_size: options.pageSize || 20,
    });

    if (error) {
      logger.error({ error }, 'WishlistCartManagementRepository.getCarts failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  CARTS — WRITE
  // ─────────────────────────────────────────────────────────────

  async createCart(cartData) {
    const { data, error } = await supabase.rpc('sp_carts_insert', {
      p_student_id: cartData.studentId,
      p_currency: cartData.currency || 'INR',
      p_expires_at: cartData.expiresAt || null,
      p_created_by: cartData.createdBy,
    });

    if (error) {
      logger.error({ error }, 'WishlistCartManagementRepository.createCart failed');
      throw error;
    }

    const newId = data;
    return this.findCartById(newId);
  }

  async updateCart(cartId, updates) {
    const { error } = await supabase.rpc('sp_carts_update', {
      p_id: cartId,
      p_coupon_id: updates.couponId !== undefined ? updates.couponId : null,
      p_subtotal: updates.subtotal !== undefined ? updates.subtotal : null,
      p_discount_amount: updates.discountAmount !== undefined ? updates.discountAmount : null,
      p_total_amount: updates.totalAmount !== undefined ? updates.totalAmount : null,
      p_cart_status: updates.cartStatus || null,
      p_converted_at: updates.convertedAt !== undefined ? updates.convertedAt : null,
      p_expires_at: updates.expiresAt !== undefined ? updates.expiresAt : null,
      p_updated_by: updates.updatedBy,
    });

    if (error) {
      logger.error({ error }, 'WishlistCartManagementRepository.updateCart failed');
      throw error;
    }

    return this.findCartById(cartId);
  }

  async deleteCart(cartId) {
    const { error } = await supabase.rpc('sp_carts_delete', {
      p_id: cartId,
    });

    if (error) {
      logger.error({ error }, 'WishlistCartManagementRepository.deleteCart failed');
      throw error;
    }
  }

  async deleteCartsBulk(cartIds) {
    const { error } = await supabase.rpc('sp_carts_delete_multiple', {
      p_ids: cartIds,
    });

    if (error) {
      logger.error({ error }, 'WishlistCartManagementRepository.deleteCartsBulk failed');
      throw error;
    }
  }

  async restoreCart(cartId) {
    const { error } = await supabase.rpc('sp_carts_restore', {
      p_id: cartId,
    });

    if (error) {
      logger.error({ error }, 'WishlistCartManagementRepository.restoreCart failed');
      throw error;
    }

    return this.findCartById(cartId);
  }

  // ─────────────────────────────────────────────────────────────
  //  CART ITEMS — READ
  // ─────────────────────────────────────────────────────────────

  async findCartItemById(cartItemId) {
    const { data, error } = await supabase.rpc('udf_get_cart_items', {
      p_id: cartItemId,
      p_cart_id: null,
      p_is_active: null,
      p_item_type: null,
      p_course_id: null,
      p_bundle_id: null,
      p_batch_id: null,
      p_webinar_id: null,
      p_sort_column: 'display_order',
      p_sort_direction: 'ASC',
      p_filter_is_active: null,
      p_filter_is_deleted: null,
      p_search_term: null,
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'WishlistCartManagementRepository.findCartItemById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  async getCartItems(options = {}) {
    const { data, error } = await supabase.rpc('udf_get_cart_items', {
      p_id: options.id || null,
      p_cart_id: options.cartId || null,
      p_is_active: options.isActive !== undefined ? options.isActive : null,
      p_item_type: options.itemType || null,
      p_course_id: options.courseId || null,
      p_bundle_id: options.bundleId || null,
      p_batch_id: options.batchId || null,
      p_webinar_id: options.webinarId || null,
      p_sort_column: options.sortColumn || 'display_order',
      p_sort_direction: options.sortDirection || 'ASC',
      p_filter_is_active: options.filterIsActive !== undefined ? options.filterIsActive : null,
      p_filter_is_deleted: options.filterIsDeleted !== undefined ? options.filterIsDeleted : false,
      p_search_term: options.searchTerm || null,
      p_page_index: options.pageIndex || 1,
      p_page_size: options.pageSize || 20,
    });

    if (error) {
      logger.error({ error }, 'WishlistCartManagementRepository.getCartItems failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  CART ITEMS — WRITE
  // ─────────────────────────────────────────────────────────────

  async createCartItem(cartItemData) {
    const { data, error } = await supabase.rpc('sp_cart_items_insert', {
      p_cart_id: cartItemData.cartId,
      p_item_type: cartItemData.itemType,
      p_course_id: cartItemData.courseId || null,
      p_bundle_id: cartItemData.bundleId || null,
      p_batch_id: cartItemData.batchId || null,
      p_webinar_id: cartItemData.webinarId || null,
      p_display_order: cartItemData.displayOrder || 0,
      p_created_by: cartItemData.createdBy,
    });

    if (error) {
      logger.error({ error }, 'WishlistCartManagementRepository.createCartItem failed');
      throw error;
    }

    const newId = data;
    return this.findCartItemById(newId);
  }

  async updateCartItem(cartItemId, updates) {
    const { error } = await supabase.rpc('sp_cart_items_update', {
      p_id: cartItemId,
      p_price: updates.price !== undefined ? updates.price : null,
      p_display_order: updates.displayOrder !== undefined ? updates.displayOrder : null,
      p_updated_by: updates.updatedBy,
    });

    if (error) {
      logger.error({ error }, 'WishlistCartManagementRepository.updateCartItem failed');
      throw error;
    }

    return this.findCartItemById(cartItemId);
  }

  async deleteCartItem(cartItemId) {
    const { error } = await supabase.rpc('sp_cart_items_delete', {
      p_id: cartItemId,
    });

    if (error) {
      logger.error({ error }, 'WishlistCartManagementRepository.deleteCartItem failed');
      throw error;
    }
  }

  async restoreCartItem(cartItemId) {
    const { error } = await supabase.rpc('sp_cart_items_restore', {
      p_id: cartItemId,
    });

    if (error) {
      logger.error({ error }, 'WishlistCartManagementRepository.restoreCartItem failed');
      throw error;
    }

    return this.findCartItemById(cartItemId);
  }
}

module.exports = new WishlistCartManagementRepository();
