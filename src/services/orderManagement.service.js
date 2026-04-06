/**
 * ═══════════════════════════════════════════════════════════════
 * ORDER MANAGEMENT SERVICE — Business Logic Layer
 * ═══════════════════════════════════════════════════════════════
 * Handles Orders and Order Items business rules.
 * ═══════════════════════════════════════════════════════════════
 */

const orderManagementRepository = require('../repositories/orderManagement.repository');
const logger = require('../config/logger');
const { BadRequestError, NotFoundError } = require('../utils/errors');

class OrderManagementService {
  // ========== ORDERS ==========

  async getOrders(options = {}) {
    try {
      const repoOptions = {
        filterStudentId: options.filterStudentId || null,
        filterOrderStatus: options.filterOrderStatus || null,
        filterPaymentMethod: options.filterPaymentMethod || null,
        filterPaymentGateway: options.filterPaymentGateway || null,
        filterCouponId: options.filterCouponId || null,
        filterDateFrom: options.filterDateFrom || null,
        filterDateTo: options.filterDateTo || null,
        filterIsActive: options.filterIsActive !== undefined ? options.filterIsActive : null,
        filterIsDeleted: options.filterIsDeleted !== undefined ? options.filterIsDeleted : null,
        searchTerm: options.searchTerm || null,
        sortTable: options.sortTable || 'order',
        sortColumn: options.sortColumn || 'created_at',
        sortDirection: options.sortDirection || 'DESC',
        page: options.page || 1,
        limit: options.limit || 20,
      };

      return await orderManagementRepository.getOrders(repoOptions);
    } catch (error) {
      logger.error('Error fetching orders:', error);
      throw error;
    }
  }

  async getOrderById(orderId) {
    try {
      if (!orderId) throw new BadRequestError('Order ID is required');

      const order = await orderManagementRepository.findOrderById(orderId);
      if (!order) throw new NotFoundError(`Order with ID ${orderId} not found`);

      return order;
    } catch (error) {
      logger.error(`Error fetching order ${orderId}:`, error);
      throw error;
    }
  }

  async createOrder(orderData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!orderData.studentId) throw new BadRequestError('Student ID is required');

      const created = await orderManagementRepository.createOrder({
        ...orderData,
        createdBy: actingUserId,
      });
      logger.info(`Order created: ${orderData.orderNumber || 'auto-generated'}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating order:', error);
      throw error;
    }
  }

  async updateOrder(orderId, updates, actingUserId) {
    try {
      if (!orderId) throw new BadRequestError('Order ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await orderManagementRepository.findOrderById(orderId);
      if (!existing) throw new NotFoundError(`Order with ID ${orderId} not found`);

      const updated = await orderManagementRepository.updateOrder(orderId, {
        ...updates,
        updatedBy: actingUserId,
      });
      logger.info(`Order updated: ${orderId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating order ${orderId}:`, error);
      throw error;
    }
  }

  async deleteOrder(orderId, actingUserId) {
    try {
      if (!orderId) throw new BadRequestError('Order ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await orderManagementRepository.findOrderById(orderId);
      if (!existing) throw new NotFoundError(`Order with ID ${orderId} not found`);

      await orderManagementRepository.deleteOrder(orderId, actingUserId);
      logger.info(`Order deleted: ${orderId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting order ${orderId}:`, error);
      throw error;
    }
  }

  async restoreOrder(orderId, restoreItems = false, actingUserId) {
    try {
      if (!orderId) throw new BadRequestError('Order ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await orderManagementRepository.findOrderById(orderId);
      if (!existing) throw new NotFoundError(`Order with ID ${orderId} not found`);

      await orderManagementRepository.restoreOrder(orderId, restoreItems);
      logger.info(`Order restored: ${orderId}`, { restoreItems, restoredBy: actingUserId });
      return { id: orderId };
    } catch (error) {
      logger.error(`Error restoring order ${orderId}:`, error);
      throw error;
    }
  }

  // ========== ORDER ITEMS ==========

  async getOrderItemById(orderItemId) {
    try {
      if (!orderItemId) throw new BadRequestError('Order Item ID is required');

      const orderItem = await orderManagementRepository.findOrderItemById(orderItemId);
      if (!orderItem) throw new NotFoundError(`Order Item with ID ${orderItemId} not found`);

      return orderItem;
    } catch (error) {
      logger.error(`Error fetching order item ${orderItemId}:`, error);
      throw error;
    }
  }

  async createOrderItem(orderItemData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!orderItemData.orderId) throw new BadRequestError('Order ID is required');
      if (!orderItemData.itemType) throw new BadRequestError('Item Type is required');

      const order = await orderManagementRepository.findOrderById(orderItemData.orderId);
      if (!order) throw new NotFoundError(`Order with ID ${orderItemData.orderId} not found`);

      const created = await orderManagementRepository.createOrderItem(orderItemData);
      logger.info(`Order Item created for Order ${orderItemData.orderId}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating order item:', error);
      throw error;
    }
  }

  async updateOrderItem(orderItemId, updates, actingUserId) {
    try {
      if (!orderItemId) throw new BadRequestError('Order Item ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await orderManagementRepository.findOrderItemById(orderItemId);
      if (!existing) throw new NotFoundError(`Order Item with ID ${orderItemId} not found`);

      const updated = await orderManagementRepository.updateOrderItem(orderItemId, updates);
      logger.info(`Order Item updated: ${orderItemId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating order item ${orderItemId}:`, error);
      throw error;
    }
  }

  async deleteOrderItem(orderItemId, actingUserId) {
    try {
      if (!orderItemId) throw new BadRequestError('Order Item ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await orderManagementRepository.findOrderItemById(orderItemId);
      if (!existing) throw new NotFoundError(`Order Item with ID ${orderItemId} not found`);

      await orderManagementRepository.deleteOrderItem(orderItemId);
      logger.info(`Order Item deleted: ${orderItemId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting order item ${orderItemId}:`, error);
      throw error;
    }
  }

  async restoreOrderItem(orderItemId, actingUserId) {
    try {
      if (!orderItemId) throw new BadRequestError('Order Item ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await orderManagementRepository.findOrderItemById(orderItemId);
      if (!existing) throw new NotFoundError(`Order Item with ID ${orderItemId} not found`);

      await orderManagementRepository.restoreOrderItem(orderItemId);
      logger.info(`Order Item restored: ${orderItemId}`, { restoredBy: actingUserId });
      return { id: orderItemId };
    } catch (error) {
      logger.error(`Error restoring order item ${orderItemId}:`, error);
      throw error;
    }
  }
}

module.exports = new OrderManagementService();
