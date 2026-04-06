/**
 * ═══════════════════════════════════════════════════════════════
 * SUPPORT TICKET MANAGEMENT SERVICE — Business Logic Layer
 * ═══════════════════════════════════════════════════════════════
 * Handles Ticket Categories, Tickets, and Ticket Messages
 * business rules with existence checks and actingUserId
 * ═══════════════════════════════════════════════════════════════
 */

const supportTicketManagementRepository = require('../repositories/supportTicketManagement.repository');
const logger = require('../config/logger');
const { BadRequestError, NotFoundError } = require('../utils/errors');

class SupportTicketManagementService {
  // ========== TICKET CATEGORIES ==========

  async getTicketCategories(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;

      const repoOptions = {
        filterParentCategoryId: filters.parentCategoryId || null,
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        filterIsDeleted: filters.isDeleted !== undefined ? filters.isDeleted : false,
        searchTerm: search || null,
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };

      return await supportTicketManagementRepository.getTicketCategories(repoOptions);
    } catch (error) {
      logger.error('Error fetching ticket categories:', error);
      throw error;
    }
  }

  async getTicketCategoryById(categoryId) {
    try {
      if (!categoryId) throw new BadRequestError('Category ID is required');

      const category = await supportTicketManagementRepository.findTicketCategoryById(categoryId);
      if (!category) throw new NotFoundError(`Ticket Category with ID ${categoryId} not found`);

      return category;
    } catch (error) {
      logger.error(`Error fetching ticket category ${categoryId}:`, error);
      throw error;
    }
  }

  async createTicketCategory(categoryData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!categoryData.name) throw new BadRequestError('Category name is required');
      if (!categoryData.code) throw new BadRequestError('Category code is required');

      const created = await supportTicketManagementRepository.createTicketCategory(categoryData, actingUserId);
      logger.info(`Ticket Category created: ${categoryData.code}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating ticket category:', error);
      throw error;
    }
  }

  async updateTicketCategory(categoryId, updates, actingUserId) {
    try {
      if (!categoryId) throw new BadRequestError('Category ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await supportTicketManagementRepository.findTicketCategoryById(categoryId);
      if (!existing) throw new NotFoundError(`Ticket Category with ID ${categoryId} not found`);

      await supportTicketManagementRepository.updateTicketCategory(categoryId, updates, actingUserId);
      logger.info(`Ticket Category updated: ${categoryId}`, { updatedBy: actingUserId });
    } catch (error) {
      logger.error(`Error updating ticket category ${categoryId}:`, error);
      throw error;
    }
  }

  async deleteTicketCategory(categoryId, actingUserId) {
    try {
      if (!categoryId) throw new BadRequestError('Category ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await supportTicketManagementRepository.findTicketCategoryById(categoryId);
      if (!existing) throw new NotFoundError(`Ticket Category with ID ${categoryId} not found`);

      await supportTicketManagementRepository.deleteTicketCategory(categoryId);
      logger.info(`Ticket Category deleted: ${categoryId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting ticket category ${categoryId}:`, error);
      throw error;
    }
  }

  async restoreTicketCategory(categoryId, restoreTranslations = true) {
    try {
      if (!categoryId) throw new BadRequestError('Category ID is required');
      await supportTicketManagementRepository.restoreTicketCategory(categoryId, restoreTranslations);
      return { id: categoryId };
    } catch (error) {
      logger.error(`Error restoring ticket category ${categoryId}:`, error);
      throw error;
    }
  }

  // ========== TICKET CATEGORY TRANSLATIONS ==========

  async createTicketCategoryTranslation(translationData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!translationData.categoryId) throw new BadRequestError('Category ID is required');
      if (!translationData.languageId) throw new BadRequestError('Language ID is required');
      if (!translationData.name) throw new BadRequestError('Translation name is required');

      const category = await supportTicketManagementRepository.findTicketCategoryById(translationData.categoryId);
      if (!category) throw new NotFoundError(`Ticket Category with ID ${translationData.categoryId} not found`);

      await supportTicketManagementRepository.createTicketCategoryTranslation(translationData);
      logger.info(`Ticket Category Translation created for category ${translationData.categoryId}`, { createdBy: actingUserId });
    } catch (error) {
      logger.error('Error creating ticket category translation:', error);
      throw error;
    }
  }

  async updateTicketCategoryTranslation(translationId, updates, actingUserId) {
    try {
      if (!translationId) throw new BadRequestError('Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await supportTicketManagementRepository.updateTicketCategoryTranslation(translationId, updates, actingUserId);
      logger.info(`Ticket Category Translation updated: ${translationId}`, { updatedBy: actingUserId });
    } catch (error) {
      logger.error(`Error updating ticket category translation ${translationId}:`, error);
      throw error;
    }
  }

  async deleteTicketCategoryTranslation(translationId, actingUserId) {
    try {
      if (!translationId) throw new BadRequestError('Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await supportTicketManagementRepository.deleteTicketCategoryTranslation(translationId);
      logger.info(`Ticket Category Translation deleted: ${translationId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting ticket category translation ${translationId}:`, error);
      throw error;
    }
  }

  async restoreTicketCategoryTranslation(translationId) {
    try {
      if (!translationId) throw new BadRequestError('Translation ID is required');
      await supportTicketManagementRepository.restoreTicketCategoryTranslation(translationId);
      return { id: translationId };
    } catch (error) {
      logger.error(`Error restoring ticket category translation ${translationId}:`, error);
      throw error;
    }
  }

  // ========== TICKETS ==========

  async getTickets(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;

      const repoOptions = {
        filterRaisedBy: filters.raisedBy || null,
        filterAssignedTo: filters.assignedTo || null,
        filterCategoryId: filters.categoryId || null,
        filterTicketType: filters.ticketType || null,
        filterPriority: filters.priority || null,
        filterTicketStatus: filters.ticketStatus || null,
        filterCourseId: filters.courseId || null,
        filterBatchId: filters.batchId || null,
        filterWebinarId: filters.webinarId || null,
        filterOrderId: filters.orderId || null,
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        filterIsDeleted: filters.isDeleted !== undefined ? filters.isDeleted : false,
        searchTerm: search || null,
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };

      return await supportTicketManagementRepository.getTickets(repoOptions);
    } catch (error) {
      logger.error('Error fetching tickets:', error);
      throw error;
    }
  }

  async getTicketById(ticketId) {
    try {
      if (!ticketId) throw new BadRequestError('Ticket ID is required');

      const ticket = await supportTicketManagementRepository.findTicketById(ticketId);
      if (!ticket) throw new NotFoundError(`Ticket with ID ${ticketId} not found`);

      return ticket;
    } catch (error) {
      logger.error(`Error fetching ticket ${ticketId}:`, error);
      throw error;
    }
  }

  async createTicket(ticketData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!ticketData.raisedBy) throw new BadRequestError('Raised by user ID is required');
      if (!ticketData.subject) throw new BadRequestError('Subject is required');
      if (!ticketData.categoryId) throw new BadRequestError('Category ID is required');

      const category = await supportTicketManagementRepository.findTicketCategoryById(ticketData.categoryId);
      if (!category) throw new NotFoundError(`Ticket Category with ID ${ticketData.categoryId} not found`);

      const created = await supportTicketManagementRepository.createTicket(ticketData, actingUserId);
      logger.info(`Ticket created: ${ticketData.subject}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating ticket:', error);
      throw error;
    }
  }

  async updateTicket(ticketId, updates, actingUserId) {
    try {
      if (!ticketId) throw new BadRequestError('Ticket ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await supportTicketManagementRepository.findTicketById(ticketId);
      if (!existing) throw new NotFoundError(`Ticket with ID ${ticketId} not found`);

      if (updates.categoryId) {
        const category = await supportTicketManagementRepository.findTicketCategoryById(updates.categoryId);
        if (!category) throw new NotFoundError(`Ticket Category with ID ${updates.categoryId} not found`);
      }

      await supportTicketManagementRepository.updateTicket(ticketId, updates, actingUserId);
      logger.info(`Ticket updated: ${ticketId}`, { updatedBy: actingUserId });
    } catch (error) {
      logger.error(`Error updating ticket ${ticketId}:`, error);
      throw error;
    }
  }

  async deleteTicket(ticketId, actingUserId) {
    try {
      if (!ticketId) throw new BadRequestError('Ticket ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await supportTicketManagementRepository.findTicketById(ticketId);
      if (!existing) throw new NotFoundError(`Ticket with ID ${ticketId} not found`);

      await supportTicketManagementRepository.deleteTicket(ticketId);
      logger.info(`Ticket deleted: ${ticketId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting ticket ${ticketId}:`, error);
      throw error;
    }
  }

  async restoreTicket(ticketId, restoreTranslations = true) {
    try {
      if (!ticketId) throw new BadRequestError('Ticket ID is required');
      await supportTicketManagementRepository.restoreTicket(ticketId, restoreTranslations);
      return { id: ticketId };
    } catch (error) {
      logger.error(`Error restoring ticket ${ticketId}:`, error);
      throw error;
    }
  }

  // ========== TICKET TRANSLATIONS ==========

  async createTicketTranslation(translationData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!translationData.ticketId) throw new BadRequestError('Ticket ID is required');
      if (!translationData.languageId) throw new BadRequestError('Language ID is required');
      if (!translationData.description) throw new BadRequestError('Description is required');

      const ticket = await supportTicketManagementRepository.findTicketById(translationData.ticketId);
      if (!ticket) throw new NotFoundError(`Ticket with ID ${translationData.ticketId} not found`);

      await supportTicketManagementRepository.createTicketTranslation(translationData);
      logger.info(`Ticket Translation created for ticket ${translationData.ticketId}`, { createdBy: actingUserId });
    } catch (error) {
      logger.error('Error creating ticket translation:', error);
      throw error;
    }
  }

  async updateTicketTranslation(translationId, updates, actingUserId) {
    try {
      if (!translationId) throw new BadRequestError('Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await supportTicketManagementRepository.updateTicketTranslation(translationId, updates, actingUserId);
      logger.info(`Ticket Translation updated: ${translationId}`, { updatedBy: actingUserId });
    } catch (error) {
      logger.error(`Error updating ticket translation ${translationId}:`, error);
      throw error;
    }
  }

  async deleteTicketTranslation(translationId, actingUserId) {
    try {
      if (!translationId) throw new BadRequestError('Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await supportTicketManagementRepository.deleteTicketTranslation(translationId);
      logger.info(`Ticket Translation deleted: ${translationId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting ticket translation ${translationId}:`, error);
      throw error;
    }
  }

  async restoreTicketTranslation(translationId) {
    try {
      if (!translationId) throw new BadRequestError('Translation ID is required');
      await supportTicketManagementRepository.restoreTicketTranslation(translationId);
      return { id: translationId };
    } catch (error) {
      logger.error(`Error restoring ticket translation ${translationId}:`, error);
      throw error;
    }
  }

  // ========== TICKET MESSAGES ==========

  async getTicketMessages(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;

      const repoOptions = {
        filterTicketId: filters.ticketId || null,
        filterSenderId: filters.senderId || null,
        filterIsInternalNote: filters.isInternalNote !== undefined ? filters.isInternalNote : null,
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        filterIsDeleted: filters.isDeleted !== undefined ? filters.isDeleted : false,
        searchTerm: search || null,
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };

      return await supportTicketManagementRepository.getTicketMessages(repoOptions);
    } catch (error) {
      logger.error('Error fetching ticket messages:', error);
      throw error;
    }
  }

  async getTicketMessageById(messageId) {
    try {
      if (!messageId) throw new BadRequestError('Message ID is required');

      const message = await supportTicketManagementRepository.findTicketMessageById(messageId);
      if (!message) throw new NotFoundError(`Ticket Message with ID ${messageId} not found`);

      return message;
    } catch (error) {
      logger.error(`Error fetching ticket message ${messageId}:`, error);
      throw error;
    }
  }

  async createTicketMessage(messageData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!messageData.ticketId) throw new BadRequestError('Ticket ID is required');
      if (!messageData.senderId) throw new BadRequestError('Sender ID is required');
      if (!messageData.messageBody) throw new BadRequestError('Message body is required');

      const ticket = await supportTicketManagementRepository.findTicketById(messageData.ticketId);
      if (!ticket) throw new NotFoundError(`Ticket with ID ${messageData.ticketId} not found`);

      const created = await supportTicketManagementRepository.createTicketMessage(messageData, actingUserId);
      logger.info(`Ticket Message created for ticket ${messageData.ticketId}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating ticket message:', error);
      throw error;
    }
  }

  async updateTicketMessage(messageId, updates, actingUserId) {
    try {
      if (!messageId) throw new BadRequestError('Message ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await supportTicketManagementRepository.findTicketMessageById(messageId);
      if (!existing) throw new NotFoundError(`Ticket Message with ID ${messageId} not found`);

      await supportTicketManagementRepository.updateTicketMessage(messageId, updates, actingUserId);
      logger.info(`Ticket Message updated: ${messageId}`, { updatedBy: actingUserId });
    } catch (error) {
      logger.error(`Error updating ticket message ${messageId}:`, error);
      throw error;
    }
  }

  async deleteTicketMessage(messageId, actingUserId) {
    try {
      if (!messageId) throw new BadRequestError('Message ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await supportTicketManagementRepository.findTicketMessageById(messageId);
      if (!existing) throw new NotFoundError(`Ticket Message with ID ${messageId} not found`);

      await supportTicketManagementRepository.deleteTicketMessage(messageId);
      logger.info(`Ticket Message deleted: ${messageId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting ticket message ${messageId}:`, error);
      throw error;
    }
  }

  async restoreTicketMessage(messageId, restoreTranslations = true) {
    try {
      if (!messageId) throw new BadRequestError('Message ID is required');
      await supportTicketManagementRepository.restoreTicketMessage(messageId, restoreTranslations);
      return { id: messageId };
    } catch (error) {
      logger.error(`Error restoring ticket message ${messageId}:`, error);
      throw error;
    }
  }

  // ========== TICKET MESSAGE TRANSLATIONS ==========

  async createTicketMessageTranslation(translationData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!translationData.ticketMessageId) throw new BadRequestError('Ticket Message ID is required');
      if (!translationData.languageId) throw new BadRequestError('Language ID is required');
      if (!translationData.messageBody) throw new BadRequestError('Message body is required');

      const message = await supportTicketManagementRepository.findTicketMessageById(translationData.ticketMessageId);
      if (!message) throw new NotFoundError(`Ticket Message with ID ${translationData.ticketMessageId} not found`);

      await supportTicketManagementRepository.createTicketMessageTranslation(translationData);
      logger.info(`Ticket Message Translation created for message ${translationData.ticketMessageId}`, { createdBy: actingUserId });
    } catch (error) {
      logger.error('Error creating ticket message translation:', error);
      throw error;
    }
  }

  async updateTicketMessageTranslation(translationId, updates, actingUserId) {
    try {
      if (!translationId) throw new BadRequestError('Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await supportTicketManagementRepository.updateTicketMessageTranslation(translationId, updates, actingUserId);
      logger.info(`Ticket Message Translation updated: ${translationId}`, { updatedBy: actingUserId });
    } catch (error) {
      logger.error(`Error updating ticket message translation ${translationId}:`, error);
      throw error;
    }
  }

  async deleteTicketMessageTranslation(translationId, actingUserId) {
    try {
      if (!translationId) throw new BadRequestError('Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await supportTicketManagementRepository.deleteTicketMessageTranslation(translationId);
      logger.info(`Ticket Message Translation deleted: ${translationId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting ticket message translation ${translationId}:`, error);
      throw error;
    }
  }

  async restoreTicketMessageTranslation(translationId) {
    try {
      if (!translationId) throw new BadRequestError('Translation ID is required');
      await supportTicketManagementRepository.restoreTicketMessageTranslation(translationId);
      return { id: translationId };
    } catch (error) {
      logger.error(`Error restoring ticket message translation ${translationId}:`, error);
      throw error;
    }
  }
}

module.exports = new SupportTicketManagementService();
