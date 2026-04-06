/**
 * ═══════════════════════════════════════════════════════════════
 * SUPPORT TICKET MANAGEMENT CONTROLLER
 * ═══════════════════════════════════════════════════════════════
 * Handles requests for Ticket Categories, Tickets, and Messages
 * ═══════════════════════════════════════════════════════════════
 */

const supportTicketManagementService = require('../../../services/supportTicketManagement.service');
const { sendSuccess, sendCreated } = require('../../../utils/response');

class SupportTicketManagementController {
  // ==================== TICKET CATEGORIES ====================

  async getTicketCategories(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        sortBy = 'id',
        sortDir = 'asc',
        parentCategoryId,
        isActive,
      } = req.query;

      const filters = {};
      if (parentCategoryId !== undefined) filters.parentCategoryId = parentCategoryId;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await supportTicketManagementService.getTicketCategories({
        filters,
        search,
        sort: { field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, { data, message: 'Ticket Categories retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getTicketCategoryById(req, res, next) {
    try {
      const data = await supportTicketManagementService.getTicketCategoryById(req.params.id);
      sendSuccess(res, { data, message: 'Ticket Category retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createTicketCategory(req, res, next) {
    try {
      const data = await supportTicketManagementService.createTicketCategory(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Ticket Category created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateTicketCategory(req, res, next) {
    try {
      await supportTicketManagementService.updateTicketCategory(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { message: 'Ticket Category updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteTicketCategory(req, res, next) {
    try {
      await supportTicketManagementService.deleteTicketCategory(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Ticket Category deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreTicketCategory(req, res, next) {
    try {
      const { restoreTranslations } = req.body;
      const result = await supportTicketManagementService.restoreTicketCategory(req.params.id, restoreTranslations !== false);
      sendSuccess(res, { data: result, message: 'Ticket Category restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ==================== TICKET CATEGORY TRANSLATIONS ====================

  async createTicketCategoryTranslation(req, res, next) {
    try {
      await supportTicketManagementService.createTicketCategoryTranslation(req.body, req.user.userId);
      sendCreated(res, { message: 'Ticket Category Translation created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateTicketCategoryTranslation(req, res, next) {
    try {
      await supportTicketManagementService.updateTicketCategoryTranslation(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { message: 'Ticket Category Translation updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteTicketCategoryTranslation(req, res, next) {
    try {
      await supportTicketManagementService.deleteTicketCategoryTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Ticket Category Translation deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreTicketCategoryTranslation(req, res, next) {
    try {
      const result = await supportTicketManagementService.restoreTicketCategoryTranslation(req.params.id);
      sendSuccess(res, { data: result, message: 'Ticket Category Translation restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ==================== TICKETS ====================

  async getTickets(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        sortBy = 'id',
        sortDir = 'asc',
        raisedBy,
        assignedTo,
        categoryId,
        ticketType,
        priority,
        ticketStatus,
        courseId,
        batchId,
        webinarId,
        orderId,
        isActive,
      } = req.query;

      const filters = {};
      if (raisedBy !== undefined) filters.raisedBy = raisedBy;
      if (assignedTo !== undefined) filters.assignedTo = assignedTo;
      if (categoryId !== undefined) filters.categoryId = categoryId;
      if (ticketType !== undefined) filters.ticketType = ticketType;
      if (priority !== undefined) filters.priority = priority;
      if (ticketStatus !== undefined) filters.ticketStatus = ticketStatus;
      if (courseId !== undefined) filters.courseId = courseId;
      if (batchId !== undefined) filters.batchId = batchId;
      if (webinarId !== undefined) filters.webinarId = webinarId;
      if (orderId !== undefined) filters.orderId = orderId;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await supportTicketManagementService.getTickets({
        filters,
        search,
        sort: { field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, { data, message: 'Tickets retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getTicketById(req, res, next) {
    try {
      const data = await supportTicketManagementService.getTicketById(req.params.ticketId);
      sendSuccess(res, { data, message: 'Ticket retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createTicket(req, res, next) {
    try {
      const data = await supportTicketManagementService.createTicket(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Ticket created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateTicket(req, res, next) {
    try {
      await supportTicketManagementService.updateTicket(req.params.ticketId, req.body, req.user.userId);
      sendSuccess(res, { message: 'Ticket updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteTicket(req, res, next) {
    try {
      await supportTicketManagementService.deleteTicket(req.params.ticketId, req.user.userId);
      sendSuccess(res, { message: 'Ticket deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreTicket(req, res, next) {
    try {
      const { restoreTranslations } = req.body;
      const result = await supportTicketManagementService.restoreTicket(req.params.ticketId, restoreTranslations !== false);
      sendSuccess(res, { data: result, message: 'Ticket restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ==================== TICKET TRANSLATIONS ====================

  async createTicketTranslation(req, res, next) {
    try {
      await supportTicketManagementService.createTicketTranslation(req.body, req.user.userId);
      sendCreated(res, { message: 'Ticket Translation created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateTicketTranslation(req, res, next) {
    try {
      await supportTicketManagementService.updateTicketTranslation(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { message: 'Ticket Translation updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteTicketTranslation(req, res, next) {
    try {
      await supportTicketManagementService.deleteTicketTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Ticket Translation deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreTicketTranslation(req, res, next) {
    try {
      const result = await supportTicketManagementService.restoreTicketTranslation(req.params.id);
      sendSuccess(res, { data: result, message: 'Ticket Translation restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ==================== TICKET MESSAGES ====================

  async getTicketMessages(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        sortBy = 'id',
        sortDir = 'asc',
        ticketId,
        senderId,
        isInternalNote,
        isActive,
      } = req.query;

      const filters = {};
      if (ticketId !== undefined) filters.ticketId = ticketId;
      if (senderId !== undefined) filters.senderId = senderId;
      if (isInternalNote !== undefined) filters.isInternalNote = isInternalNote;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await supportTicketManagementService.getTicketMessages({
        filters,
        search,
        sort: { field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, { data, message: 'Ticket Messages retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getTicketMessageById(req, res, next) {
    try {
      const data = await supportTicketManagementService.getTicketMessageById(req.params.messageId);
      sendSuccess(res, { data, message: 'Ticket Message retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createTicketMessage(req, res, next) {
    try {
      const data = await supportTicketManagementService.createTicketMessage(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Ticket Message created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateTicketMessage(req, res, next) {
    try {
      await supportTicketManagementService.updateTicketMessage(req.params.messageId, req.body, req.user.userId);
      sendSuccess(res, { message: 'Ticket Message updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteTicketMessage(req, res, next) {
    try {
      await supportTicketManagementService.deleteTicketMessage(req.params.messageId, req.user.userId);
      sendSuccess(res, { message: 'Ticket Message deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreTicketMessage(req, res, next) {
    try {
      const { restoreTranslations } = req.body;
      const result = await supportTicketManagementService.restoreTicketMessage(req.params.messageId, restoreTranslations !== false);
      sendSuccess(res, { data: result, message: 'Ticket Message restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ==================== TICKET MESSAGE TRANSLATIONS ====================

  async createTicketMessageTranslation(req, res, next) {
    try {
      await supportTicketManagementService.createTicketMessageTranslation(req.body, req.user.userId);
      sendCreated(res, { message: 'Ticket Message Translation created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateTicketMessageTranslation(req, res, next) {
    try {
      await supportTicketManagementService.updateTicketMessageTranslation(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { message: 'Ticket Message Translation updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteTicketMessageTranslation(req, res, next) {
    try {
      await supportTicketManagementService.deleteTicketMessageTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Ticket Message Translation deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreTicketMessageTranslation(req, res, next) {
    try {
      const result = await supportTicketManagementService.restoreTicketMessageTranslation(req.params.id);
      sendSuccess(res, { data: result, message: 'Ticket Message Translation restored successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SupportTicketManagementController();
