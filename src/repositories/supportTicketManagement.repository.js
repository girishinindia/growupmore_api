/**
 * ═══════════════════════════════════════════════════════════════
 * SUPPORT TICKET MANAGEMENT REPOSITORY — Database Layer (Supabase RPC)
 * ═══════════════════════════════════════════════════════════════
 * Handles:
 *   • Ticket Categories (CRUD + translations)
 *   • Tickets (CRUD + translations)
 *   • Ticket Messages (CRUD + translations)
 * ═══════════════════════════════════════════════════════════════
 */

const { supabase } = require('../config/database');
const logger = require('../config/logger');

class SupportTicketManagementRepository {
  // ─────────────────────────────────────────────────────────────
  //  TICKET CATEGORIES — READ
  // ─────────────────────────────────────────────────────────────

  async findTicketCategoryById(categoryId) {
    const { data, error } = await supabase.rpc('udf_get_ticket_categories', {
      p_id: categoryId,
      p_filter_parent_category_id: null,
      p_filter_is_active: null,
      p_filter_is_deleted: false,
      p_search_term: null,
      p_sort_column: 'id',
      p_sort_direction: 'ASC',
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'SupportTicketManagementRepository.findTicketCategoryById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  async getTicketCategories(options = {}) {
    const { data, error } = await supabase.rpc('udf_get_ticket_categories', {
      p_id: null,
      p_filter_parent_category_id: options.filterParentCategoryId || null,
      p_filter_is_active: options.filterIsActive !== undefined ? options.filterIsActive : null,
      p_filter_is_deleted: options.filterIsDeleted !== undefined ? options.filterIsDeleted : false,
      p_search_term: options.searchTerm || null,
      p_sort_column: options.sortColumn || 'id',
      p_sort_direction: options.sortDirection || 'ASC',
      p_page_index: options.pageIndex || 1,
      p_page_size: options.pageSize || 20,
    });

    if (error) {
      logger.error({ error }, 'SupportTicketManagementRepository.getTicketCategories failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  TICKET CATEGORIES — WRITE
  // ─────────────────────────────────────────────────────────────

  async createTicketCategory(categoryData, createdBy) {
    const { data, error } = await supabase.rpc('sp_ticket_categories_insert', {
      p_name: categoryData.name,
      p_code: categoryData.code,
      p_parent_category_id: categoryData.parentCategoryId || null,
      p_display_order: categoryData.displayOrder || 0,
      p_icon: categoryData.icon || null,
      p_is_active: categoryData.isActive !== undefined ? categoryData.isActive : true,
      p_created_by: createdBy,
    });

    if (error) {
      logger.error({ error }, 'SupportTicketManagementRepository.createTicketCategory failed');
      throw error;
    }

    return data;
  }

  async updateTicketCategory(categoryId, updates, updatedBy) {
    const { error } = await supabase.rpc('sp_ticket_categories_update', {
      p_id: categoryId,
      p_name: updates.name || null,
      p_code: updates.code || null,
      p_parent_category_id: updates.parentCategoryId !== undefined ? updates.parentCategoryId : null,
      p_display_order: updates.displayOrder !== undefined ? updates.displayOrder : null,
      p_icon: updates.icon !== undefined ? updates.icon : null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
      p_updated_by: updatedBy,
    });

    if (error) {
      logger.error({ error }, 'SupportTicketManagementRepository.updateTicketCategory failed');
      throw error;
    }
  }

  async deleteTicketCategory(categoryId) {
    const { error } = await supabase.rpc('sp_ticket_categories_delete', {
      p_id: categoryId,
    });

    if (error) {
      logger.error({ error }, 'SupportTicketManagementRepository.deleteTicketCategory failed');
      throw error;
    }
  }

  async restoreTicketCategory(categoryId, restoreTranslations = true) {
    const { error } = await supabase.rpc('sp_ticket_categories_restore', {
      p_id: categoryId,
      p_restore_translations: restoreTranslations,
    });

    if (error) {
      logger.error({ error }, 'SupportTicketManagementRepository.restoreTicketCategory failed');
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  TICKET CATEGORY TRANSLATIONS — WRITE
  // ─────────────────────────────────────────────────────────────

  async createTicketCategoryTranslation(translationData) {
    const { error } = await supabase.rpc('sp_ticket_category_translations_insert', {
      p_category_id: translationData.categoryId,
      p_language_id: translationData.languageId,
      p_name: translationData.name,
      p_description: translationData.description || null,
      p_is_active: translationData.isActive !== undefined ? translationData.isActive : true,
    });

    if (error) {
      logger.error({ error }, 'SupportTicketManagementRepository.createTicketCategoryTranslation failed');
      throw error;
    }
  }

  async updateTicketCategoryTranslation(translationId, updates, updatedBy) {
    const { error } = await supabase.rpc('sp_ticket_category_translations_update', {
      p_id: translationId,
      p_name: updates.name || null,
      p_description: updates.description !== undefined ? updates.description : null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
    });

    if (error) {
      logger.error({ error }, 'SupportTicketManagementRepository.updateTicketCategoryTranslation failed');
      throw error;
    }
  }

  async deleteTicketCategoryTranslation(translationId) {
    const { error } = await supabase.rpc('sp_ticket_category_translations_delete', {
      p_id: translationId,
    });

    if (error) {
      logger.error({ error }, 'SupportTicketManagementRepository.deleteTicketCategoryTranslation failed');
      throw error;
    }
  }

  async restoreTicketCategoryTranslation(translationId) {
    const { error } = await supabase.rpc('sp_ticket_category_translations_restore', {
      p_id: translationId,
    });

    if (error) {
      logger.error({ error }, 'SupportTicketManagementRepository.restoreTicketCategoryTranslation failed');
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  TICKETS — READ
  // ─────────────────────────────────────────────────────────────

  async findTicketById(ticketId) {
    const { data, error } = await supabase.rpc('udf_get_tickets', {
      p_id: ticketId,
      p_filter_raised_by: null,
      p_filter_assigned_to: null,
      p_filter_category_id: null,
      p_filter_ticket_type: null,
      p_filter_priority: null,
      p_filter_ticket_status: null,
      p_filter_course_id: null,
      p_filter_batch_id: null,
      p_filter_webinar_id: null,
      p_filter_order_id: null,
      p_filter_is_active: null,
      p_filter_is_deleted: false,
      p_search_term: null,
      p_sort_column: 'id',
      p_sort_direction: 'ASC',
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'SupportTicketManagementRepository.findTicketById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  async getTickets(options = {}) {
    const { data, error } = await supabase.rpc('udf_get_tickets', {
      p_id: null,
      p_filter_raised_by: options.filterRaisedBy || null,
      p_filter_assigned_to: options.filterAssignedTo || null,
      p_filter_category_id: options.filterCategoryId || null,
      p_filter_ticket_type: options.filterTicketType || null,
      p_filter_priority: options.filterPriority || null,
      p_filter_ticket_status: options.filterTicketStatus || null,
      p_filter_course_id: options.filterCourseId || null,
      p_filter_batch_id: options.filterBatchId || null,
      p_filter_webinar_id: options.filterWebinarId || null,
      p_filter_order_id: options.filterOrderId || null,
      p_filter_is_active: options.filterIsActive !== undefined ? options.filterIsActive : null,
      p_filter_is_deleted: options.filterIsDeleted !== undefined ? options.filterIsDeleted : false,
      p_search_term: options.searchTerm || null,
      p_sort_column: options.sortColumn || 'id',
      p_sort_direction: options.sortDirection || 'ASC',
      p_page_index: options.pageIndex || 1,
      p_page_size: options.pageSize || 20,
    });

    if (error) {
      logger.error({ error }, 'SupportTicketManagementRepository.getTickets failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  TICKETS — WRITE
  // ─────────────────────────────────────────────────────────────

  async createTicket(ticketData, createdBy) {
    const { data, error } = await supabase.rpc('sp_tickets_insert', {
      p_raised_by: ticketData.raisedBy,
      p_subject: ticketData.subject,
      p_category_id: ticketData.categoryId,
      p_assigned_to: ticketData.assignedTo || null,
      p_ticket_type: ticketData.ticketType || 'complaint',
      p_priority: ticketData.priority || 'medium',
      p_ticket_status: ticketData.ticketStatus || 'open',
      p_course_id: ticketData.courseId || null,
      p_batch_id: ticketData.batchId || null,
      p_webinar_id: ticketData.webinarId || null,
      p_order_id: ticketData.orderId || null,
      p_created_by: createdBy,
    });

    if (error) {
      logger.error({ error }, 'SupportTicketManagementRepository.createTicket failed');
      throw error;
    }

    return data;
  }

  async updateTicket(ticketId, updates, updatedBy) {
    const { error } = await supabase.rpc('sp_tickets_update', {
      p_id: ticketId,
      p_subject: updates.subject || null,
      p_priority: updates.priority || null,
      p_ticket_status: updates.ticketStatus || null,
      p_assigned_to: updates.assignedTo !== undefined ? updates.assignedTo : null,
      p_category_id: updates.categoryId || null,
      p_ticket_type: updates.ticketType || null,
      p_course_id: updates.courseId !== undefined ? updates.courseId : null,
      p_batch_id: updates.batchId !== undefined ? updates.batchId : null,
      p_webinar_id: updates.webinarId !== undefined ? updates.webinarId : null,
      p_order_id: updates.orderId !== undefined ? updates.orderId : null,
      p_first_response_at: updates.firstResponseAt !== undefined ? updates.firstResponseAt : null,
      p_resolved_at: updates.resolvedAt !== undefined ? updates.resolvedAt : null,
      p_closed_at: updates.closedAt !== undefined ? updates.closedAt : null,
      p_satisfaction_rating: updates.satisfactionRating !== undefined ? updates.satisfactionRating : null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
      p_updated_by: updatedBy,
    });

    if (error) {
      logger.error({ error }, 'SupportTicketManagementRepository.updateTicket failed');
      throw error;
    }
  }

  async deleteTicket(ticketId) {
    const { error } = await supabase.rpc('sp_tickets_delete', {
      p_id: ticketId,
    });

    if (error) {
      logger.error({ error }, 'SupportTicketManagementRepository.deleteTicket failed');
      throw error;
    }
  }

  async restoreTicket(ticketId, restoreTranslations = true) {
    const { error } = await supabase.rpc('sp_tickets_restore', {
      p_id: ticketId,
      p_restore_translations: restoreTranslations,
    });

    if (error) {
      logger.error({ error }, 'SupportTicketManagementRepository.restoreTicket failed');
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  TICKET TRANSLATIONS — WRITE
  // ─────────────────────────────────────────────────────────────

  async createTicketTranslation(translationData) {
    const { error } = await supabase.rpc('sp_ticket_translations_insert', {
      p_ticket_id: translationData.ticketId,
      p_language_id: translationData.languageId,
      p_description: translationData.description,
      p_resolution_notes: translationData.resolutionNotes || null,
      p_is_active: translationData.isActive !== undefined ? translationData.isActive : true,
    });

    if (error) {
      logger.error({ error }, 'SupportTicketManagementRepository.createTicketTranslation failed');
      throw error;
    }
  }

  async updateTicketTranslation(translationId, updates, updatedBy) {
    const { error } = await supabase.rpc('sp_ticket_translations_update', {
      p_id: translationId,
      p_description: updates.description || null,
      p_resolution_notes: updates.resolutionNotes !== undefined ? updates.resolutionNotes : null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
    });

    if (error) {
      logger.error({ error }, 'SupportTicketManagementRepository.updateTicketTranslation failed');
      throw error;
    }
  }

  async deleteTicketTranslation(translationId) {
    const { error } = await supabase.rpc('sp_ticket_translations_delete', {
      p_id: translationId,
    });

    if (error) {
      logger.error({ error }, 'SupportTicketManagementRepository.deleteTicketTranslation failed');
      throw error;
    }
  }

  async restoreTicketTranslation(translationId) {
    const { error } = await supabase.rpc('sp_ticket_translations_restore', {
      p_id: translationId,
    });

    if (error) {
      logger.error({ error }, 'SupportTicketManagementRepository.restoreTicketTranslation failed');
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  TICKET MESSAGES — READ
  // ─────────────────────────────────────────────────────────────

  async findTicketMessageById(messageId) {
    const { data, error } = await supabase.rpc('udf_get_ticket_messages', {
      p_id: messageId,
      p_filter_ticket_id: null,
      p_filter_sender_id: null,
      p_filter_is_internal_note: null,
      p_filter_is_active: null,
      p_filter_is_deleted: false,
      p_search_term: null,
      p_sort_column: 'id',
      p_sort_direction: 'ASC',
      p_page_index: 1,
      p_page_size: 1,
    });

    if (error) {
      logger.error({ error }, 'SupportTicketManagementRepository.findTicketMessageById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  async getTicketMessages(options = {}) {
    const { data, error } = await supabase.rpc('udf_get_ticket_messages', {
      p_id: null,
      p_filter_ticket_id: options.filterTicketId || null,
      p_filter_sender_id: options.filterSenderId || null,
      p_filter_is_internal_note: options.filterIsInternalNote !== undefined ? options.filterIsInternalNote : null,
      p_filter_is_active: options.filterIsActive !== undefined ? options.filterIsActive : null,
      p_filter_is_deleted: options.filterIsDeleted !== undefined ? options.filterIsDeleted : false,
      p_search_term: options.searchTerm || null,
      p_sort_column: options.sortColumn || 'id',
      p_sort_direction: options.sortDirection || 'ASC',
      p_page_index: options.pageIndex || 1,
      p_page_size: options.pageSize || 20,
    });

    if (error) {
      logger.error({ error }, 'SupportTicketManagementRepository.getTicketMessages failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  TICKET MESSAGES — WRITE
  // ─────────────────────────────────────────────────────────────

  async createTicketMessage(messageData, createdBy) {
    const { data, error } = await supabase.rpc('sp_ticket_messages_insert', {
      p_ticket_id: messageData.ticketId,
      p_sender_id: messageData.senderId,
      p_message_body: messageData.messageBody,
      p_attachment_url: messageData.attachmentUrl || null,
      p_attachment_type: messageData.attachmentType || null,
      p_is_internal_note: messageData.isInternalNote !== undefined ? messageData.isInternalNote : false,
      p_is_active: true,
      p_created_by: createdBy,
    });

    if (error) {
      logger.error({ error }, 'SupportTicketManagementRepository.createTicketMessage failed');
      throw error;
    }

    return data;
  }

  async updateTicketMessage(messageId, updates, updatedBy) {
    const { error } = await supabase.rpc('sp_ticket_messages_update', {
      p_id: messageId,
      p_message_body: updates.messageBody || null,
      p_attachment_url: updates.attachmentUrl !== undefined ? updates.attachmentUrl : null,
      p_attachment_type: updates.attachmentType !== undefined ? updates.attachmentType : null,
      p_is_internal_note: updates.isInternalNote !== undefined ? updates.isInternalNote : null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
      p_updated_by: updatedBy,
    });

    if (error) {
      logger.error({ error }, 'SupportTicketManagementRepository.updateTicketMessage failed');
      throw error;
    }
  }

  async deleteTicketMessage(messageId) {
    const { error } = await supabase.rpc('sp_ticket_messages_delete', {
      p_id: messageId,
    });

    if (error) {
      logger.error({ error }, 'SupportTicketManagementRepository.deleteTicketMessage failed');
      throw error;
    }
  }

  async restoreTicketMessage(messageId, restoreTranslations = true) {
    const { error } = await supabase.rpc('sp_ticket_messages_restore', {
      p_id: messageId,
      p_restore_translations: restoreTranslations,
    });

    if (error) {
      logger.error({ error }, 'SupportTicketManagementRepository.restoreTicketMessage failed');
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  TICKET MESSAGE TRANSLATIONS — WRITE
  // ─────────────────────────────────────────────────────────────

  async createTicketMessageTranslation(translationData) {
    const { error } = await supabase.rpc('sp_ticket_message_translations_insert', {
      p_ticket_message_id: translationData.ticketMessageId,
      p_language_id: translationData.languageId,
      p_message_body: translationData.messageBody,
      p_is_active: translationData.isActive !== undefined ? translationData.isActive : true,
    });

    if (error) {
      logger.error({ error }, 'SupportTicketManagementRepository.createTicketMessageTranslation failed');
      throw error;
    }
  }

  async updateTicketMessageTranslation(translationId, updates, updatedBy) {
    const { error } = await supabase.rpc('sp_ticket_message_translations_update', {
      p_id: translationId,
      p_message_body: updates.messageBody || null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
    });

    if (error) {
      logger.error({ error }, 'SupportTicketManagementRepository.updateTicketMessageTranslation failed');
      throw error;
    }
  }

  async deleteTicketMessageTranslation(translationId) {
    const { error } = await supabase.rpc('sp_ticket_message_translations_delete', {
      p_id: translationId,
    });

    if (error) {
      logger.error({ error }, 'SupportTicketManagementRepository.deleteTicketMessageTranslation failed');
      throw error;
    }
  }

  async restoreTicketMessageTranslation(translationId) {
    const { error } = await supabase.rpc('sp_ticket_message_translations_restore', {
      p_id: translationId,
    });

    if (error) {
      logger.error({ error }, 'SupportTicketManagementRepository.restoreTicketMessageTranslation failed');
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  UDFs — READ (JSONB)
  // ─────────────────────────────────────────────────────────────

  async getTicketCategoriesJsonb(languageId, topLevelOnly = false) {
    const { data, error } = await supabase.rpc('udfj_getticketcategories', {
      p_language_id: languageId,
      p_top_level_only: topLevelOnly,
    });

    if (error) {
      logger.error({ error }, 'SupportTicketManagementRepository.getTicketCategoriesJsonb failed');
      throw error;
    }

    return data || null;
  }

  async getTicketsJsonb(languageId, status = null) {
    const { data, error } = await supabase.rpc('udfj_gettickets', {
      p_language_id: languageId,
      p_status: status,
    });

    if (error) {
      logger.error({ error }, 'SupportTicketManagementRepository.getTicketsJsonb failed');
      throw error;
    }

    return data || null;
  }
}

module.exports = new SupportTicketManagementRepository();
