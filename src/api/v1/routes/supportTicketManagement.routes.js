/**
 * ═══════════════════════════════════════════════════════════════
 * SUPPORT TICKET MANAGEMENT ROUTES
 * ═══════════════════════════════════════════════════════════════
 * Routes for Ticket Categories, Tickets, and Messages
 * ═══════════════════════════════════════════════════════════════
 */

const { Router } = require('express');
const ctrl = require('../controllers/supportTicketManagement.controller');
const validate = require('../../../middleware/validate.middleware');
const authenticate = require('../../../middleware/auth.middleware');
const { authorize } = require('../../../middleware/authorize.middleware');

const {
  idParamSchema,
  categoryIdParamSchema,
  ticketIdParamSchema,
  messageIdParamSchema,
  restoreSchema,
  // Categories
  createTicketCategorySchema,
  updateTicketCategorySchema,
  ticketCategoryListQuerySchema,
  // Category Translations
  createTicketCategoryTranslationSchema,
  updateTicketCategoryTranslationSchema,
  // Tickets
  createTicketSchema,
  updateTicketSchema,
  ticketListQuerySchema,
  // Ticket Translations
  createTicketTranslationSchema,
  updateTicketTranslationSchema,
  // Messages
  createTicketMessageSchema,
  updateTicketMessageSchema,
  ticketMessageListQuerySchema,
  // Message Translations
  createTicketMessageTranslationSchema,
  updateTicketMessageTranslationSchema,
} = require('../validators/supportTicketManagement.validator');

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// ============================================================================
// TICKET CATEGORIES ROUTES
// ============================================================================

router.get(
  '/ticket-categories',
  authorize('ticket_category.read'),
  validate(ticketCategoryListQuerySchema, 'query'),
  ctrl.getTicketCategories
);

router.get(
  '/ticket-categories/:id',
  authorize('ticket_category.read'),
  validate(idParamSchema, 'params'),
  ctrl.getTicketCategoryById
);

router.post(
  '/ticket-categories',
  authorize('ticket_category.create'),
  validate(createTicketCategorySchema),
  ctrl.createTicketCategory
);

router.patch(
  '/ticket-categories/:id',
  authorize('ticket_category.update'),
  validate(idParamSchema, 'params'),
  validate(updateTicketCategorySchema),
  ctrl.updateTicketCategory
);

router.delete(
  '/ticket-categories/:id',
  authorize('ticket_category.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteTicketCategory
);

router.post(
  '/ticket-categories/:id/restore',
  authorize('ticket_category.update'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreTicketCategory
);

// ============================================================================
// TICKET CATEGORY TRANSLATIONS NESTED ROUTES
// ============================================================================

router.post(
  '/ticket-categories/:categoryId/translations',
  authorize('ticket_category.create'),
  validate(categoryIdParamSchema, 'params'),
  validate(createTicketCategoryTranslationSchema),
  ctrl.createTicketCategoryTranslation
);

// ============================================================================
// TICKET CATEGORY TRANSLATIONS FLAT ROUTES
// ============================================================================

router.patch(
  '/ticket-category-translations/:id',
  authorize('ticket_category.update'),
  validate(idParamSchema, 'params'),
  validate(updateTicketCategoryTranslationSchema),
  ctrl.updateTicketCategoryTranslation
);

router.delete(
  '/ticket-category-translations/:id',
  authorize('ticket_category.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteTicketCategoryTranslation
);

router.post(
  '/ticket-category-translations/:id/restore',
  authorize('ticket_category.update'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreTicketCategoryTranslation
);

// ============================================================================
// TICKETS ROUTES
// ============================================================================

router.get(
  '/tickets',
  authorize('ticket.read'),
  validate(ticketListQuerySchema, 'query'),
  ctrl.getTickets
);

router.get(
  '/tickets/:ticketId',
  authorize('ticket.read'),
  validate(ticketIdParamSchema, 'params'),
  ctrl.getTicketById
);

router.post(
  '/tickets',
  authorize('ticket.create'),
  validate(createTicketSchema),
  ctrl.createTicket
);

router.patch(
  '/tickets/:ticketId',
  authorize('ticket.update'),
  validate(ticketIdParamSchema, 'params'),
  validate(updateTicketSchema),
  ctrl.updateTicket
);

router.delete(
  '/tickets/:ticketId',
  authorize('ticket.delete'),
  validate(ticketIdParamSchema, 'params'),
  ctrl.deleteTicket
);

router.post(
  '/tickets/:ticketId/restore',
  authorize('ticket.update'),
  validate(ticketIdParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreTicket
);

// ============================================================================
// TICKET TRANSLATIONS NESTED ROUTES
// ============================================================================

router.post(
  '/tickets/:ticketId/translations',
  authorize('ticket.create'),
  validate(ticketIdParamSchema, 'params'),
  validate(createTicketTranslationSchema),
  ctrl.createTicketTranslation
);

// ============================================================================
// TICKET TRANSLATIONS FLAT ROUTES
// ============================================================================

router.patch(
  '/ticket-translations/:id',
  authorize('ticket.update'),
  validate(idParamSchema, 'params'),
  validate(updateTicketTranslationSchema),
  ctrl.updateTicketTranslation
);

router.delete(
  '/ticket-translations/:id',
  authorize('ticket.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteTicketTranslation
);

router.post(
  '/ticket-translations/:id/restore',
  authorize('ticket.update'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreTicketTranslation
);

// ============================================================================
// TICKET MESSAGES ROUTES (NESTED UNDER TICKETS)
// ============================================================================

router.get(
  '/tickets/:ticketId/messages',
  authorize('ticket_message.read'),
  validate(ticketIdParamSchema, 'params'),
  validate(ticketMessageListQuerySchema, 'query'),
  ctrl.getTicketMessages
);

router.post(
  '/tickets/:ticketId/messages',
  authorize('ticket_message.create'),
  validate(ticketIdParamSchema, 'params'),
  validate(createTicketMessageSchema),
  ctrl.createTicketMessage
);

// ============================================================================
// TICKET MESSAGES FLAT ROUTES
// ============================================================================

router.get(
  '/ticket-messages/:messageId',
  authorize('ticket_message.read'),
  validate(messageIdParamSchema, 'params'),
  ctrl.getTicketMessageById
);

router.patch(
  '/ticket-messages/:messageId',
  authorize('ticket_message.update'),
  validate(messageIdParamSchema, 'params'),
  validate(updateTicketMessageSchema),
  ctrl.updateTicketMessage
);

router.delete(
  '/ticket-messages/:messageId',
  authorize('ticket_message.delete'),
  validate(messageIdParamSchema, 'params'),
  ctrl.deleteTicketMessage
);

router.post(
  '/ticket-messages/:messageId/restore',
  authorize('ticket_message.update'),
  validate(messageIdParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreTicketMessage
);

// ============================================================================
// TICKET MESSAGE TRANSLATIONS NESTED ROUTES
// ============================================================================

router.post(
  '/ticket-messages/:messageId/translations',
  authorize('ticket_message.create'),
  validate(messageIdParamSchema, 'params'),
  validate(createTicketMessageTranslationSchema),
  ctrl.createTicketMessageTranslation
);

// ============================================================================
// TICKET MESSAGE TRANSLATIONS FLAT ROUTES
// ============================================================================

router.patch(
  '/ticket-message-translations/:id',
  authorize('ticket_message.update'),
  validate(idParamSchema, 'params'),
  validate(updateTicketMessageTranslationSchema),
  ctrl.updateTicketMessageTranslation
);

router.delete(
  '/ticket-message-translations/:id',
  authorize('ticket_message.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteTicketMessageTranslation
);

router.post(
  '/ticket-message-translations/:id/restore',
  authorize('ticket_message.update'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreTicketMessageTranslation
);

module.exports = router;
