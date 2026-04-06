/**
 * ═══════════════════════════════════════════════════════════════
 * WISHLIST & CART MANAGEMENT CONTROLLER
 * ═══════════════════════════════════════════════════════════════
 * Wishlists, Carts, and Cart Items endpoints
 * ═══════════════════════════════════════════════════════════════
 */

const wishlistCartManagementService = require('../../../services/wishlistCartManagement.service');
const { sendSuccess, sendCreated } = require('../../../utils/response');

class WishlistCartManagementController {
  // ==================== WISHLISTS ====================

  async getWishlists(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'created_at', sortDir = 'DESC', studentId, itemType, courseId, bundleId, batchId, webinarId, isActive } = req.query;

      const data = await wishlistCartManagementService.getWishlists({
        studentId: studentId ? Number(studentId) : undefined,
        itemType,
        courseId: courseId ? Number(courseId) : undefined,
        bundleId: bundleId ? Number(bundleId) : undefined,
        batchId: batchId ? Number(batchId) : undefined,
        webinarId: webinarId ? Number(webinarId) : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        searchTerm: search,
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

      sendSuccess(res, { data, message: 'Wishlists retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getWishlistById(req, res, next) {
    try {
      const data = await wishlistCartManagementService.getWishlistById(req.params.id);
      sendSuccess(res, { data, message: 'Wishlist retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createWishlist(req, res, next) {
    try {
      const data = await wishlistCartManagementService.createWishlist(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Wishlist created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateWishlist(req, res, next) {
    try {
      const data = await wishlistCartManagementService.updateWishlist(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Wishlist updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteWishlist(req, res, next) {
    try {
      await wishlistCartManagementService.deleteWishlist(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Wishlist deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteWishlistsBulk(req, res, next) {
    try {
      await wishlistCartManagementService.deleteWishlistsBulk(req.body.ids, req.user.userId);
      sendSuccess(res, { message: 'Wishlists deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreWishlist(req, res, next) {
    try {
      const data = await wishlistCartManagementService.restoreWishlist(req.params.id, req.user.userId);
      sendSuccess(res, { data, message: 'Wishlist restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreWishlistsBulk(req, res, next) {
    try {
      await wishlistCartManagementService.restoreWishlistsBulk(req.body.ids, req.user.userId);
      sendSuccess(res, { message: 'Wishlists restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ==================== CARTS ====================

  async getCarts(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'created_at', sortDir = 'DESC', studentId, cartStatus, couponId, isActive } = req.query;

      const data = await wishlistCartManagementService.getCarts({
        studentId: studentId ? Number(studentId) : undefined,
        cartStatus,
        couponId: couponId ? Number(couponId) : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        searchTerm: search,
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

      sendSuccess(res, { data, message: 'Carts retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getCartById(req, res, next) {
    try {
      const data = await wishlistCartManagementService.getCartById(req.params.id);
      sendSuccess(res, { data, message: 'Cart retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createCart(req, res, next) {
    try {
      const data = await wishlistCartManagementService.createCart(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Cart created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateCart(req, res, next) {
    try {
      const data = await wishlistCartManagementService.updateCart(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Cart updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCart(req, res, next) {
    try {
      await wishlistCartManagementService.deleteCart(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Cart deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreCart(req, res, next) {
    try {
      const data = await wishlistCartManagementService.restoreCart(req.params.id, req.user.userId);
      sendSuccess(res, { data, message: 'Cart restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ==================== CART ITEMS ====================

  async getCartItems(req, res, next) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'display_order', sortDir = 'ASC', cartId, itemType, courseId, bundleId, batchId, webinarId, isActive } = req.query;

      const data = await wishlistCartManagementService.getCartItems({
        cartId: cartId ? Number(cartId) : undefined,
        itemType,
        courseId: courseId ? Number(courseId) : undefined,
        bundleId: bundleId ? Number(bundleId) : undefined,
        batchId: batchId ? Number(batchId) : undefined,
        webinarId: webinarId ? Number(webinarId) : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        searchTerm: search,
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

      sendSuccess(res, { data, message: 'Cart items retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getCartItemById(req, res, next) {
    try {
      const data = await wishlistCartManagementService.getCartItemById(req.params.id);
      sendSuccess(res, { data, message: 'Cart item retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createCartItem(req, res, next) {
    try {
      const data = await wishlistCartManagementService.createCartItem(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Cart item created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateCartItem(req, res, next) {
    try {
      const data = await wishlistCartManagementService.updateCartItem(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { data, message: 'Cart item updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCartItem(req, res, next) {
    try {
      await wishlistCartManagementService.deleteCartItem(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Cart item deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreCartItem(req, res, next) {
    try {
      const data = await wishlistCartManagementService.restoreCartItem(req.params.id, req.user.userId);
      sendSuccess(res, { data, message: 'Cart item restored successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WishlistCartManagementController();
