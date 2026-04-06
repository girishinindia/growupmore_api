/**
 * ═══════════════════════════════════════════════════════════════
 * WISHLIST & CART MANAGEMENT SERVICE — Business Logic Layer
 * ═══════════════════════════════════════════════════════════════
 * Handles Wishlists, Carts, and Cart Items business rules.
 * ═══════════════════════════════════════════════════════════════
 */

const wishlistCartManagementRepository = require('../repositories/wishlistCartManagement.repository');
const logger = require('../config/logger');
const { BadRequestError, NotFoundError } = require('../utils/errors');

class WishlistCartManagementService {
  // ==================== WISHLISTS ====================

  async getWishlists(options = {}) {
    try {
      const repoOptions = {
        id: options.id || null,
        studentId: options.studentId || null,
        isActive: options.isActive !== undefined ? options.isActive : null,
        itemType: options.itemType || null,
        courseId: options.courseId || null,
        bundleId: options.bundleId || null,
        batchId: options.batchId || null,
        webinarId: options.webinarId || null,
        sortColumn: options.sortColumn || 'created_at',
        sortDirection: options.sortDirection || 'DESC',
        filterIsActive: options.filterIsActive !== undefined ? options.filterIsActive : null,
        filterIsDeleted: options.filterIsDeleted !== undefined ? options.filterIsDeleted : false,
        searchTerm: options.searchTerm || null,
        pageIndex: (options.page || 1) - 1,
        pageSize: options.limit || 20,
      };

      return await wishlistCartManagementRepository.getWishlists(repoOptions);
    } catch (error) {
      logger.error('Error fetching wishlists:', error);
      throw error;
    }
  }

  async getWishlistById(wishlistId) {
    try {
      if (!wishlistId) throw new BadRequestError('Wishlist ID is required');

      const wishlist = await wishlistCartManagementRepository.findWishlistById(wishlistId);
      if (!wishlist) throw new NotFoundError(`Wishlist with ID ${wishlistId} not found`);

      return wishlist;
    } catch (error) {
      logger.error(`Error fetching wishlist ${wishlistId}:`, error);
      throw error;
    }
  }

  async createWishlist(wishlistData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!wishlistData.studentId) throw new BadRequestError('Student ID is required');
      if (!wishlistData.itemType) throw new BadRequestError('Item type is required');

      const validItemTypes = ['course', 'bundle', 'batch', 'webinar'];
      if (!validItemTypes.includes(wishlistData.itemType)) {
        throw new BadRequestError(`Item type must be one of: ${validItemTypes.join(', ')}`);
      }

      const dataToCreate = {
        studentId: wishlistData.studentId,
        itemType: wishlistData.itemType,
        courseId: wishlistData.courseId || null,
        bundleId: wishlistData.bundleId || null,
        batchId: wishlistData.batchId || null,
        webinarId: wishlistData.webinarId || null,
        isActive: wishlistData.isActive !== undefined ? wishlistData.isActive : true,
        createdBy: actingUserId,
      };

      const created = await wishlistCartManagementRepository.createWishlist(dataToCreate);
      logger.info(`Wishlist created for student ${wishlistData.studentId}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating wishlist:', error);
      throw error;
    }
  }

  async updateWishlist(wishlistId, updates, actingUserId) {
    try {
      if (!wishlistId) throw new BadRequestError('Wishlist ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await wishlistCartManagementRepository.findWishlistById(wishlistId);
      if (!existing) throw new NotFoundError(`Wishlist with ID ${wishlistId} not found`);

      const dataToUpdate = {
        isActive: updates.isActive !== undefined ? updates.isActive : null,
        updatedBy: actingUserId,
      };

      const updated = await wishlistCartManagementRepository.updateWishlist(wishlistId, dataToUpdate);
      logger.info(`Wishlist updated: ${wishlistId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating wishlist ${wishlistId}:`, error);
      throw error;
    }
  }

  async deleteWishlist(wishlistId, actingUserId) {
    try {
      if (!wishlistId) throw new BadRequestError('Wishlist ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await wishlistCartManagementRepository.findWishlistById(wishlistId);
      if (!existing) throw new NotFoundError(`Wishlist with ID ${wishlistId} not found`);

      await wishlistCartManagementRepository.deleteWishlist(wishlistId);
      logger.info(`Wishlist deleted: ${wishlistId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting wishlist ${wishlistId}:`, error);
      throw error;
    }
  }

  async deleteWishlistsBulk(wishlistIds, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!wishlistIds || wishlistIds.length === 0) throw new BadRequestError('At least one wishlist ID is required');

      await wishlistCartManagementRepository.deleteWishlistsBulk(wishlistIds);
      logger.info(`Bulk deleted ${wishlistIds.length} wishlists`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error('Error bulk deleting wishlists:', error);
      throw error;
    }
  }

  async restoreWishlist(wishlistId, actingUserId) {
    try {
      if (!wishlistId) throw new BadRequestError('Wishlist ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const restored = await wishlistCartManagementRepository.restoreWishlist(wishlistId);
      logger.info(`Wishlist restored: ${wishlistId}`, { restoredBy: actingUserId });
      return restored;
    } catch (error) {
      logger.error(`Error restoring wishlist ${wishlistId}:`, error);
      throw error;
    }
  }

  async restoreWishlistsBulk(wishlistIds, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!wishlistIds || wishlistIds.length === 0) throw new BadRequestError('At least one wishlist ID is required');

      await wishlistCartManagementRepository.restoreWishlistsBulk(wishlistIds);
      logger.info(`Bulk restored ${wishlistIds.length} wishlists`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error('Error bulk restoring wishlists:', error);
      throw error;
    }
  }

  // ==================== CARTS ====================

  async getCarts(options = {}) {
    try {
      const repoOptions = {
        id: options.id || null,
        studentId: options.studentId || null,
        isActive: options.isActive !== undefined ? options.isActive : null,
        cartStatus: options.cartStatus || null,
        couponId: options.couponId || null,
        sortColumn: options.sortColumn || 'created_at',
        sortDirection: options.sortDirection || 'DESC',
        filterIsActive: options.filterIsActive !== undefined ? options.filterIsActive : null,
        filterIsDeleted: options.filterIsDeleted !== undefined ? options.filterIsDeleted : false,
        searchTerm: options.searchTerm || null,
        pageIndex: (options.page || 1) - 1,
        pageSize: options.limit || 20,
      };

      return await wishlistCartManagementRepository.getCarts(repoOptions);
    } catch (error) {
      logger.error('Error fetching carts:', error);
      throw error;
    }
  }

  async getCartById(cartId) {
    try {
      if (!cartId) throw new BadRequestError('Cart ID is required');

      const cart = await wishlistCartManagementRepository.findCartById(cartId);
      if (!cart) throw new NotFoundError(`Cart with ID ${cartId} not found`);

      return cart;
    } catch (error) {
      logger.error(`Error fetching cart ${cartId}:`, error);
      throw error;
    }
  }

  async createCart(cartData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!cartData.studentId) throw new BadRequestError('Student ID is required');

      const dataToCreate = {
        studentId: cartData.studentId,
        currency: cartData.currency || 'INR',
        expiresAt: cartData.expiresAt || null,
        createdBy: actingUserId,
      };

      const created = await wishlistCartManagementRepository.createCart(dataToCreate);
      logger.info(`Cart created for student ${cartData.studentId}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating cart:', error);
      throw error;
    }
  }

  async updateCart(cartId, updates, actingUserId) {
    try {
      if (!cartId) throw new BadRequestError('Cart ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await wishlistCartManagementRepository.findCartById(cartId);
      if (!existing) throw new NotFoundError(`Cart with ID ${cartId} not found`);

      const dataToUpdate = {
        couponId: updates.couponId !== undefined ? updates.couponId : null,
        subtotal: updates.subtotal !== undefined ? updates.subtotal : null,
        discountAmount: updates.discountAmount !== undefined ? updates.discountAmount : null,
        totalAmount: updates.totalAmount !== undefined ? updates.totalAmount : null,
        cartStatus: updates.cartStatus || null,
        convertedAt: updates.convertedAt !== undefined ? updates.convertedAt : null,
        expiresAt: updates.expiresAt !== undefined ? updates.expiresAt : null,
        updatedBy: actingUserId,
      };

      const updated = await wishlistCartManagementRepository.updateCart(cartId, dataToUpdate);
      logger.info(`Cart updated: ${cartId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating cart ${cartId}:`, error);
      throw error;
    }
  }

  async deleteCart(cartId, actingUserId) {
    try {
      if (!cartId) throw new BadRequestError('Cart ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await wishlistCartManagementRepository.findCartById(cartId);
      if (!existing) throw new NotFoundError(`Cart with ID ${cartId} not found`);

      await wishlistCartManagementRepository.deleteCart(cartId);
      logger.info(`Cart deleted: ${cartId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting cart ${cartId}:`, error);
      throw error;
    }
  }

  async deleteCartsBulk(cartIds, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!cartIds || cartIds.length === 0) throw new BadRequestError('At least one cart ID is required');

      await wishlistCartManagementRepository.deleteCartsBulk(cartIds);
      logger.info(`Bulk deleted ${cartIds.length} carts`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error('Error bulk deleting carts:', error);
      throw error;
    }
  }

  async restoreCart(cartId, actingUserId) {
    try {
      if (!cartId) throw new BadRequestError('Cart ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const restored = await wishlistCartManagementRepository.restoreCart(cartId);
      logger.info(`Cart restored: ${cartId}`, { restoredBy: actingUserId });
      return restored;
    } catch (error) {
      logger.error(`Error restoring cart ${cartId}:`, error);
      throw error;
    }
  }

  // ==================== CART ITEMS ====================

  async getCartItems(options = {}) {
    try {
      const repoOptions = {
        id: options.id || null,
        cartId: options.cartId || null,
        isActive: options.isActive !== undefined ? options.isActive : null,
        itemType: options.itemType || null,
        courseId: options.courseId || null,
        bundleId: options.bundleId || null,
        batchId: options.batchId || null,
        webinarId: options.webinarId || null,
        sortColumn: options.sortColumn || 'display_order',
        sortDirection: options.sortDirection || 'ASC',
        filterIsActive: options.filterIsActive !== undefined ? options.filterIsActive : null,
        filterIsDeleted: options.filterIsDeleted !== undefined ? options.filterIsDeleted : false,
        searchTerm: options.searchTerm || null,
        pageIndex: (options.page || 1) - 1,
        pageSize: options.limit || 20,
      };

      return await wishlistCartManagementRepository.getCartItems(repoOptions);
    } catch (error) {
      logger.error('Error fetching cart items:', error);
      throw error;
    }
  }

  async getCartItemById(cartItemId) {
    try {
      if (!cartItemId) throw new BadRequestError('Cart Item ID is required');

      const cartItem = await wishlistCartManagementRepository.findCartItemById(cartItemId);
      if (!cartItem) throw new NotFoundError(`Cart Item with ID ${cartItemId} not found`);

      return cartItem;
    } catch (error) {
      logger.error(`Error fetching cart item ${cartItemId}:`, error);
      throw error;
    }
  }

  async createCartItem(cartItemData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!cartItemData.cartId) throw new BadRequestError('Cart ID is required');
      if (!cartItemData.itemType) throw new BadRequestError('Item type is required');

      const validItemTypes = ['course', 'bundle', 'batch', 'webinar'];
      if (!validItemTypes.includes(cartItemData.itemType)) {
        throw new BadRequestError(`Item type must be one of: ${validItemTypes.join(', ')}`);
      }

      const dataToCreate = {
        cartId: cartItemData.cartId,
        itemType: cartItemData.itemType,
        courseId: cartItemData.courseId || null,
        bundleId: cartItemData.bundleId || null,
        batchId: cartItemData.batchId || null,
        webinarId: cartItemData.webinarId || null,
        displayOrder: cartItemData.displayOrder || 0,
        createdBy: actingUserId,
      };

      const created = await wishlistCartManagementRepository.createCartItem(dataToCreate);
      logger.info(`Cart item created in cart ${cartItemData.cartId}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating cart item:', error);
      throw error;
    }
  }

  async updateCartItem(cartItemId, updates, actingUserId) {
    try {
      if (!cartItemId) throw new BadRequestError('Cart Item ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await wishlistCartManagementRepository.findCartItemById(cartItemId);
      if (!existing) throw new NotFoundError(`Cart Item with ID ${cartItemId} not found`);

      const dataToUpdate = {
        price: updates.price !== undefined ? updates.price : null,
        displayOrder: updates.displayOrder !== undefined ? updates.displayOrder : null,
        updatedBy: actingUserId,
      };

      const updated = await wishlistCartManagementRepository.updateCartItem(cartItemId, dataToUpdate);
      logger.info(`Cart item updated: ${cartItemId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating cart item ${cartItemId}:`, error);
      throw error;
    }
  }

  async deleteCartItem(cartItemId, actingUserId) {
    try {
      if (!cartItemId) throw new BadRequestError('Cart Item ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await wishlistCartManagementRepository.findCartItemById(cartItemId);
      if (!existing) throw new NotFoundError(`Cart Item with ID ${cartItemId} not found`);

      await wishlistCartManagementRepository.deleteCartItem(cartItemId);
      logger.info(`Cart item deleted: ${cartItemId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting cart item ${cartItemId}:`, error);
      throw error;
    }
  }

  async restoreCartItem(cartItemId, actingUserId) {
    try {
      if (!cartItemId) throw new BadRequestError('Cart Item ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const restored = await wishlistCartManagementRepository.restoreCartItem(cartItemId);
      logger.info(`Cart item restored: ${cartItemId}`, { restoredBy: actingUserId });
      return restored;
    } catch (error) {
      logger.error(`Error restoring cart item ${cartItemId}:`, error);
      throw error;
    }
  }
}

module.exports = new WishlistCartManagementService();
