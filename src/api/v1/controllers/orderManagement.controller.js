/**
 * ═══════════════════════════════════════════════════════════════
 * ORDER MANAGEMENT CONTROLLER — Orders & Order Items
 * ═══════════════════════════════════════════════════════════════
 */

const orderManagementService = require('../../../services/orderManagement.service');
const { sendSuccess, sendCreated } = require('../../../utils/response');

class OrderManagementController {
  // ==================== ORDERS ====================

  async getOrders(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'created_at',
        sortDir = 'DESC',
        studentId,
        orderStatus,
        paymentMethod,
        paymentGateway,
        couponId,
        dateFrom,
        dateTo,
        isActive,
        searchTerm,
      } = req.query;

      const data = await orderManagementService.getOrders({
        filterStudentId: studentId || null,
        filterOrderStatus: orderStatus || null,
        filterPaymentMethod: paymentMethod || null,
        filterPaymentGateway: paymentGateway || null,
        filterCouponId: couponId || null,
        filterDateFrom: dateFrom || null,
        filterDateTo: dateTo || null,
        filterIsActive: isActive !== undefined ? isActive : null,
        searchTerm: searchTerm || null,
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

      sendSuccess(res, { data, message: 'Orders retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req, res, next) {
    try {
      const data = await orderManagementService.getOrderById(req.params.id);
      sendSuccess(res, { data, message: 'Order retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createOrder(req, res, next) {
    try {
      const orderData = {
        studentId: req.body.studentId,
        orderNumber: req.body.orderNumber || null,
        cartId: req.body.cartId || null,
        orderStatus: req.body.orderStatus || 'pending',
        subtotal: req.body.subtotal !== undefined ? req.body.subtotal : 0.00,
        discountAmount: req.body.discountAmount !== undefined ? req.body.discountAmount : 0.00,
        taxAmount: req.body.taxAmount !== undefined ? req.body.taxAmount : 0.00,
        totalAmount: req.body.totalAmount !== undefined ? req.body.totalAmount : 0.00,
        currency: req.body.currency || 'INR',
        couponId: req.body.couponId || null,
        couponCode: req.body.couponCode || null,
        paymentMethod: req.body.paymentMethod || null,
        paymentGateway: req.body.paymentGateway || null,
        gatewayTransactionId: req.body.gatewayTransactionId || null,
        gatewayResponse: req.body.gatewayResponse || null,
        paidAt: req.body.paidAt || null,
        refundedAt: req.body.refundedAt || null,
        refundAmount: req.body.refundAmount || null,
        refundReason: req.body.refundReason || null,
        billingName: req.body.billingName || null,
        billingEmail: req.body.billingEmail || null,
        billingPhone: req.body.billingPhone || null,
        notes: req.body.notes || null,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      };

      const data = await orderManagementService.createOrder(orderData, req.user.userId);
      sendCreated(res, { data, message: 'Order created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateOrder(req, res, next) {
    try {
      const updates = {};

      if (req.body.orderStatus !== undefined) updates.orderStatus = req.body.orderStatus;
      if (req.body.subtotal !== undefined) updates.subtotal = req.body.subtotal;
      if (req.body.discountAmount !== undefined) updates.discountAmount = req.body.discountAmount;
      if (req.body.taxAmount !== undefined) updates.taxAmount = req.body.taxAmount;
      if (req.body.totalAmount !== undefined) updates.totalAmount = req.body.totalAmount;
      if (req.body.currency !== undefined) updates.currency = req.body.currency;
      if (req.body.couponId !== undefined) updates.couponId = req.body.couponId;
      if (req.body.couponCode !== undefined) updates.couponCode = req.body.couponCode;
      if (req.body.paymentMethod !== undefined) updates.paymentMethod = req.body.paymentMethod;
      if (req.body.paymentGateway !== undefined) updates.paymentGateway = req.body.paymentGateway;
      if (req.body.gatewayTransactionId !== undefined) updates.gatewayTransactionId = req.body.gatewayTransactionId;
      if (req.body.gatewayResponse !== undefined) updates.gatewayResponse = req.body.gatewayResponse;
      if (req.body.paidAt !== undefined) updates.paidAt = req.body.paidAt;
      if (req.body.refundedAt !== undefined) updates.refundedAt = req.body.refundedAt;
      if (req.body.refundAmount !== undefined) updates.refundAmount = req.body.refundAmount;
      if (req.body.refundReason !== undefined) updates.refundReason = req.body.refundReason;
      if (req.body.billingName !== undefined) updates.billingName = req.body.billingName;
      if (req.body.billingEmail !== undefined) updates.billingEmail = req.body.billingEmail;
      if (req.body.billingPhone !== undefined) updates.billingPhone = req.body.billingPhone;
      if (req.body.notes !== undefined) updates.notes = req.body.notes;
      if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;

      const data = await orderManagementService.updateOrder(req.params.id, updates, req.user.userId);
      sendSuccess(res, { data, message: 'Order updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteOrder(req, res, next) {
    try {
      await orderManagementService.deleteOrder(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Order deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreOrder(req, res, next) {
    try {
      const restoreItems = req.body.restoreItems !== undefined ? req.body.restoreItems : false;
      const data = await orderManagementService.restoreOrder(req.params.id, restoreItems, req.user.userId);
      sendSuccess(res, { data, message: 'Order restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ==================== ORDER ITEMS ====================

  async getOrderItemById(req, res, next) {
    try {
      const data = await orderManagementService.getOrderItemById(req.params.id);
      sendSuccess(res, { data, message: 'Order Item retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createOrderItem(req, res, next) {
    try {
      const orderItemData = {
        orderId: req.body.orderId,
        itemType: req.body.itemType,
        courseId: req.body.courseId || null,
        bundleId: req.body.bundleId || null,
        batchId: req.body.batchId || null,
        webinarId: req.body.webinarId || null,
        price: req.body.price !== undefined ? req.body.price : 0.00,
        discountAmount: req.body.discountAmount !== undefined ? req.body.discountAmount : 0.00,
        finalPrice: req.body.finalPrice !== undefined ? req.body.finalPrice : 0.00,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      };

      const data = await orderManagementService.createOrderItem(orderItemData, req.user.userId);
      sendCreated(res, { data, message: 'Order Item created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateOrderItem(req, res, next) {
    try {
      const updates = {};

      if (req.body.price !== undefined) updates.price = req.body.price;
      if (req.body.discountAmount !== undefined) updates.discountAmount = req.body.discountAmount;
      if (req.body.finalPrice !== undefined) updates.finalPrice = req.body.finalPrice;
      if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;

      const data = await orderManagementService.updateOrderItem(req.params.id, updates, req.user.userId);
      sendSuccess(res, { data, message: 'Order Item updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteOrderItem(req, res, next) {
    try {
      await orderManagementService.deleteOrderItem(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Order Item deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreOrderItem(req, res, next) {
    try {
      const data = await orderManagementService.restoreOrderItem(req.params.id, req.user.userId);
      sendSuccess(res, { data, message: 'Order Item restored successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderManagementController();
