/**
 * ═══════════════════════════════════════════════════════════════
 * ORDER MANAGEMENT REPOSITORY — Database Layer (Supabase RPC)
 * ═══════════════════════════════════════════════════════════════
 * Handles Orders and Order Items via:
 *
 *   ORDERS:
 *   - udf_get_orders                 — read, search, filter, paginate
 *   - sp_orders_insert               — create, returns new id (BIGINT)
 *   - sp_orders_update               — update, returns void
 *   - sp_orders_delete               — soft delete, returns void
 *   - sp_orders_restore              — restore with optional item restore
 *
 *   ORDER ITEMS:
 *   - sp_order_items_insert          — create, returns new id (BIGINT)
 *   - sp_order_items_update          — update, returns void
 *   - sp_order_items_delete          — soft delete, returns void
 *   - sp_order_items_restore         — restore, returns void
 * ═══════════════════════════════════════════════════════════════
 */

const { supabase } = require('../config/database');
const logger = require('../config/logger');

class OrderManagementRepository {
  // ─────────────────────────────────────────────────────────────
  //  ORDERS — READ
  // ─────────────────────────────────────────────────────────────

  async findOrderById(orderId) {
    const { data, error } = await supabase.rpc('udf_get_orders', {
      p_id: orderId,
      p_filter_student_id: null,
      p_filter_order_status: null,
      p_filter_payment_method: null,
      p_filter_payment_gateway: null,
      p_filter_coupon_id: null,
      p_filter_date_from: null,
      p_filter_date_to: null,
      p_filter_is_active: null,
      p_filter_is_deleted: null,
      p_search_term: null,
      p_sort_table: 'order',
      p_sort_column: 'created_at',
      p_sort_direction: 'DESC',
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'OrderManagementRepository.findOrderById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  async getOrders(options = {}) {
    const { data, error } = await supabase.rpc('udf_get_orders', {
      p_id: null,
      p_filter_student_id: options.filterStudentId || null,
      p_filter_order_status: options.filterOrderStatus || null,
      p_filter_payment_method: options.filterPaymentMethod || null,
      p_filter_payment_gateway: options.filterPaymentGateway || null,
      p_filter_coupon_id: options.filterCouponId || null,
      p_filter_date_from: options.filterDateFrom || null,
      p_filter_date_to: options.filterDateTo || null,
      p_filter_is_active: options.filterIsActive !== undefined ? options.filterIsActive : null,
      p_filter_is_deleted: options.filterIsDeleted !== undefined ? options.filterIsDeleted : null,
      p_search_term: options.searchTerm || null,
      p_sort_table: options.sortTable || 'order',
      p_sort_column: options.sortColumn || 'created_at',
      p_sort_direction: options.sortDirection || 'DESC',
      p_page_index: options.page || 1,
      p_page_size: options.limit || 20,
    });

    if (error) {
      logger.error({ error }, 'OrderManagementRepository.getOrders failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  ORDERS — WRITE
  // ─────────────────────────────────────────────────────────────

  async createOrder(orderData) {
    const { data, error } = await supabase.rpc('sp_orders_insert', {
      p_student_id: orderData.studentId,
      p_order_number: orderData.orderNumber || null,
      p_cart_id: orderData.cartId || null,
      p_order_status: orderData.orderStatus || 'pending',
      p_subtotal: orderData.subtotal || 0.00,
      p_discount_amount: orderData.discountAmount || 0.00,
      p_tax_amount: orderData.taxAmount || 0.00,
      p_total_amount: orderData.totalAmount || 0.00,
      p_currency: orderData.currency || 'INR',
      p_coupon_id: orderData.couponId || null,
      p_coupon_code: orderData.couponCode || null,
      p_payment_method: orderData.paymentMethod || null,
      p_payment_gateway: orderData.paymentGateway || null,
      p_gateway_transaction_id: orderData.gatewayTransactionId || null,
      p_gateway_response: orderData.gatewayResponse || null,
      p_paid_at: orderData.paidAt || null,
      p_refunded_at: orderData.refundedAt || null,
      p_refund_amount: orderData.refundAmount || null,
      p_refund_reason: orderData.refundReason || null,
      p_billing_name: orderData.billingName || null,
      p_billing_email: orderData.billingEmail || null,
      p_billing_phone: orderData.billingPhone || null,
      p_notes: orderData.notes || null,
      p_is_active: orderData.isActive !== undefined ? orderData.isActive : true,
      p_created_by: orderData.createdBy,
    });

    if (error) {
      logger.error({ error }, 'OrderManagementRepository.createOrder failed');
      throw error;
    }

    const newId = data;
    return this.findOrderById(newId);
  }

  async updateOrder(orderId, updates) {
    const { error } = await supabase.rpc('sp_orders_update', {
      p_id: orderId,
      p_order_status: updates.orderStatus !== undefined ? updates.orderStatus : null,
      p_subtotal: updates.subtotal !== undefined ? updates.subtotal : null,
      p_discount_amount: updates.discountAmount !== undefined ? updates.discountAmount : null,
      p_tax_amount: updates.taxAmount !== undefined ? updates.taxAmount : null,
      p_total_amount: updates.totalAmount !== undefined ? updates.totalAmount : null,
      p_currency: updates.currency !== undefined ? updates.currency : null,
      p_coupon_id: updates.couponId !== undefined ? updates.couponId : null,
      p_coupon_code: updates.couponCode !== undefined ? updates.couponCode : null,
      p_payment_method: updates.paymentMethod !== undefined ? updates.paymentMethod : null,
      p_payment_gateway: updates.paymentGateway !== undefined ? updates.paymentGateway : null,
      p_gateway_transaction_id: updates.gatewayTransactionId !== undefined ? updates.gatewayTransactionId : null,
      p_gateway_response: updates.gatewayResponse !== undefined ? updates.gatewayResponse : null,
      p_paid_at: updates.paidAt !== undefined ? updates.paidAt : null,
      p_refunded_at: updates.refundedAt !== undefined ? updates.refundedAt : null,
      p_refund_amount: updates.refundAmount !== undefined ? updates.refundAmount : null,
      p_refund_reason: updates.refundReason !== undefined ? updates.refundReason : null,
      p_billing_name: updates.billingName !== undefined ? updates.billingName : null,
      p_billing_email: updates.billingEmail !== undefined ? updates.billingEmail : null,
      p_billing_phone: updates.billingPhone !== undefined ? updates.billingPhone : null,
      p_notes: updates.notes !== undefined ? updates.notes : null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
      p_updated_by: updates.updatedBy,
    });

    if (error) {
      logger.error({ error }, 'OrderManagementRepository.updateOrder failed');
      throw error;
    }

    return this.findOrderById(orderId);
  }

  async deleteOrder(orderId, deletedBy) {
    const { error } = await supabase.rpc('sp_orders_delete', {
      p_id: orderId,
    });

    if (error) {
      logger.error({ error }, 'OrderManagementRepository.deleteOrder failed');
      throw error;
    }
  }

  async restoreOrder(orderId, restoreItems = false) {
    const { error } = await supabase.rpc('sp_orders_restore', {
      p_id: orderId,
      p_restore_items: restoreItems,
    });

    if (error) {
      logger.error({ error }, 'OrderManagementRepository.restoreOrder failed');
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  ORDER ITEMS — READ
  // ─────────────────────────────────────────────────────────────

  async findOrderItemById(orderItemId, orderId = null) {
    if (orderId) {
      const order = await this.findOrderById(orderId);
      if (!order || !order.items) return null;
      return order.items.find(item => item.id === orderItemId) || null;
    }

    const orders = await this.getOrders({
      page: 1,
      limit: 1000,
      filterIsDeleted: false,
    });

    for (const order of orders) {
      if (order.items) {
        const item = order.items.find(i => i.id === orderItemId);
        if (item) return item;
      }
    }

    return null;
  }

  // ─────────────────────────────────────────────────────────────
  //  ORDER ITEMS — WRITE
  // ─────────────────────────────────────────────────────────────

  async createOrderItem(orderItemData) {
    const { data, error } = await supabase.rpc('sp_order_items_insert', {
      p_order_id: orderItemData.orderId,
      p_item_type: orderItemData.itemType,
      p_course_id: orderItemData.courseId || null,
      p_bundle_id: orderItemData.bundleId || null,
      p_batch_id: orderItemData.batchId || null,
      p_webinar_id: orderItemData.webinarId || null,
      p_price: orderItemData.price || 0.00,
      p_discount_amount: orderItemData.discountAmount || 0.00,
      p_final_price: orderItemData.finalPrice || 0.00,
      p_is_active: orderItemData.isActive !== undefined ? orderItemData.isActive : true,
    });

    if (error) {
      logger.error({ error }, 'OrderManagementRepository.createOrderItem failed');
      throw error;
    }

    const newId = data;
    return this.findOrderItemById(newId, orderItemData.orderId);
  }

  async updateOrderItem(orderItemId, updates) {
    const { error } = await supabase.rpc('sp_order_items_update', {
      p_id: orderItemId,
      p_price: updates.price !== undefined ? updates.price : null,
      p_discount_amount: updates.discountAmount !== undefined ? updates.discountAmount : null,
      p_final_price: updates.finalPrice !== undefined ? updates.finalPrice : null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
    });

    if (error) {
      logger.error({ error }, 'OrderManagementRepository.updateOrderItem failed');
      throw error;
    }

    return this.findOrderItemById(orderItemId);
  }

  async deleteOrderItem(orderItemId) {
    const { error } = await supabase.rpc('sp_order_items_delete', {
      p_id: orderItemId,
    });

    if (error) {
      logger.error({ error }, 'OrderManagementRepository.deleteOrderItem failed');
      throw error;
    }
  }

  async restoreOrderItem(orderItemId) {
    const { error } = await supabase.rpc('sp_order_items_restore', {
      p_id: orderItemId,
    });

    if (error) {
      logger.error({ error }, 'OrderManagementRepository.restoreOrderItem failed');
      throw error;
    }
  }
}

module.exports = new OrderManagementRepository();
