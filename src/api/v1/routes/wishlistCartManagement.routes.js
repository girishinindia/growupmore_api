/**
 * ═══════════════════════════════════════════════════════════════
 * WISHLIST & CART MANAGEMENT ROUTES
 * ═══════════════════════════════════════════════════════════════
 * Wishlists, Carts, and Cart Items endpoints
 * ═══════════════════════════════════════════════════════════════
 */

const { Router } = require('express');
const ctrl = require('../controllers/wishlistCartManagement.controller');
const validate = require('../../../middleware/validate.middleware');
const authenticate = require('../../../middleware/auth.middleware');
const { authorize } = require('../../../middleware/authorize.middleware');

const {
  idParamSchema,
  idsBodySchema,
  createWishlistSchema,
  updateWishlistSchema,
  wishlistListQuerySchema,
  createCartSchema,
  updateCartSchema,
  cartListQuerySchema,
  createCartItemSchema,
  updateCartItemSchema,
  cartItemListQuerySchema,
} = require('../validators/wishlistCartManagement.validator');

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// ============================================================================
// WISHLISTS ROUTES
// ============================================================================

router.get('/wishlists', authorize('wishlist.read'), validate(wishlistListQuerySchema, 'query'), ctrl.getWishlists);
router.post('/wishlists/bulk-delete', authorize('wishlist.delete'), validate(idsBodySchema), ctrl.deleteWishlistsBulk);
router.post('/wishlists/bulk-restore', authorize('wishlist.update'), validate(idsBodySchema), ctrl.restoreWishlistsBulk);
router.get('/wishlists/:id', authorize('wishlist.read'), validate(idParamSchema, 'params'), ctrl.getWishlistById);
router.post('/wishlists', authorize('wishlist.create'), validate(createWishlistSchema), ctrl.createWishlist);
router.patch('/wishlists/:id', authorize('wishlist.update'), validate(idParamSchema, 'params'), validate(updateWishlistSchema), ctrl.updateWishlist);
router.delete('/wishlists/:id', authorize('wishlist.delete'), validate(idParamSchema, 'params'), ctrl.deleteWishlist);
router.post('/wishlists/:id/restore', authorize('wishlist.update'), validate(idParamSchema, 'params'), ctrl.restoreWishlist);

// ============================================================================
// CARTS ROUTES
// ============================================================================

router.get('/carts', authorize('cart.read'), validate(cartListQuerySchema, 'query'), ctrl.getCarts);
router.get('/carts/:id', authorize('cart.read'), validate(idParamSchema, 'params'), ctrl.getCartById);
router.post('/carts', authorize('cart.create'), validate(createCartSchema), ctrl.createCart);
router.patch('/carts/:id', authorize('cart.update'), validate(idParamSchema, 'params'), validate(updateCartSchema), ctrl.updateCart);
router.delete('/carts/:id', authorize('cart.delete'), validate(idParamSchema, 'params'), ctrl.deleteCart);
router.post('/carts/:id/restore', authorize('cart.update'), validate(idParamSchema, 'params'), ctrl.restoreCart);

// ============================================================================
// CART ITEMS ROUTES
// ============================================================================

router.get('/cart-items', authorize('cart_item.read'), validate(cartItemListQuerySchema, 'query'), ctrl.getCartItems);
router.get('/cart-items/:id', authorize('cart_item.read'), validate(idParamSchema, 'params'), ctrl.getCartItemById);
router.post('/cart-items', authorize('cart_item.create'), validate(createCartItemSchema), ctrl.createCartItem);
router.patch('/cart-items/:id', authorize('cart_item.update'), validate(idParamSchema, 'params'), validate(updateCartItemSchema), ctrl.updateCartItem);
router.delete('/cart-items/:id', authorize('cart_item.delete'), validate(idParamSchema, 'params'), ctrl.deleteCartItem);
router.post('/cart-items/:id/restore', authorize('cart_item.update'), validate(idParamSchema, 'params'), ctrl.restoreCartItem);

module.exports = router;
