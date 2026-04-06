/**
 * ═══════════════════════════════════════════════════════════════
 * ORDER MANAGEMENT ROUTES — Orders & Order Items
 * ═══════════════════════════════════════════════════════════════
 */

const { Router } = require('express');
const ctrl = require('../controllers/orderManagement.controller');
const validate = require('../../../middleware/validate.middleware');
const authenticate = require('../../../middleware/auth.middleware');
const { authorize } = require('../../../middleware/authorize.middleware');

const {
  idParamSchema,
  createOrderSchema,
  updateOrderSchema,
  restoreOrderSchema,
  orderListQuerySchema,
  createOrderItemSchema,
  updateOrderItemSchema,
} = require('../validators/orderManagement.validator');

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// ============================================================================
// ORDERS ROUTES
// ============================================================================

router.get('/orders', authorize('order.read'), validate(orderListQuerySchema, 'query'), ctrl.getOrders);
router.get('/orders/:id', authorize('order.read'), validate(idParamSchema, 'params'), ctrl.getOrderById);
router.post('/orders', authorize('order.create'), validate(createOrderSchema), ctrl.createOrder);
router.patch('/orders/:id', authorize('order.update'), validate(idParamSchema, 'params'), validate(updateOrderSchema), ctrl.updateOrder);
router.delete('/orders/:id', authorize('order.delete'), validate(idParamSchema, 'params'), ctrl.deleteOrder);
router.post('/orders/:id/restore', authorize('order.update'), validate(idParamSchema, 'params'), validate(restoreOrderSchema), ctrl.restoreOrder);

// ============================================================================
// ORDER ITEMS ROUTES
// ============================================================================

router.get('/order-items/:id', authorize('order_item.read'), validate(idParamSchema, 'params'), ctrl.getOrderItemById);
router.post('/order-items', authorize('order_item.create'), validate(createOrderItemSchema), ctrl.createOrderItem);
router.patch('/order-items/:id', authorize('order_item.update'), validate(idParamSchema, 'params'), validate(updateOrderItemSchema), ctrl.updateOrderItem);
router.delete('/order-items/:id', authorize('order_item.delete'), validate(idParamSchema, 'params'), ctrl.deleteOrderItem);
router.post('/order-items/:id/restore', authorize('order_item.update'), validate(idParamSchema, 'params'), ctrl.restoreOrderItem);

module.exports = router;
