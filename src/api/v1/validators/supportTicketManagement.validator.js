/**
 * ═══════════════════════════════════════════════════════════════
 * SUPPORT TICKET MANAGEMENT VALIDATORS — Zod Schemas
 * ═══════════════════════════════════════════════════════════════
 * Ticket Categories, Tickets, Ticket Messages validation schemas
 * ═══════════════════════════════════════════════════════════════
 */

const { z } = require('zod');
const { coercePositiveInt } = require('./shared/coerce');

// ============================================================================
// SHARED SCHEMAS
// ============================================================================

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a positive integer').transform(Number),
});

const categoryIdParamSchema = z.object({
  categoryId: z.string().regex(/^\d+$/, 'Category ID must be a positive integer').transform(Number),
});

const ticketIdParamSchema = z.object({
  ticketId: z.string().regex(/^\d+$/, 'Ticket ID must be a positive integer').transform(Number),
});

const messageIdParamSchema = z.object({
  messageId: z.string().regex(/^\d+$/, 'Message ID must be a positive integer').transform(Number),
});

const restoreSchema = z.object({
  restoreTranslations: z.boolean().optional().default(true),
});

const bulkIdsSchema = z.object({
  ids: z.array(coercePositiveInt).min(1, 'At least one ID is required'),
});

const listQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
  search: z.string().max(100).optional(),
  sortBy: z.string().max(50).optional(),
  sortDir: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional().default('ASC'),
});

// ============================================================================
// TICKET CATEGORY SCHEMAS
// ============================================================================

const createTicketCategorySchema = z.object({
  name: z.string().min(1).max(255).trim(),
  code: z.string().min(1).max(100).trim(),
  parentCategoryId: coercePositiveInt.optional().nullable(),
  displayOrder: z.number().int().nonnegative().optional().default(0),
  icon: z.string().max(100).optional().nullable(),
  isActive: z.boolean().optional().default(true),
}).strict();

const updateTicketCategorySchema = z.object({
  name: z.string().min(1).max(255).trim().optional(),
  code: z.string().min(1).max(100).trim().optional(),
  parentCategoryId: coercePositiveInt.optional().nullable(),
  displayOrder: z.number().int().nonnegative().optional(),
  icon: z.string().max(100).optional().nullable(),
  isActive: z.boolean().optional(),
}).strict();

const ticketCategoryListQuerySchema = listQuerySchema.extend({
  parentCategoryId: z.string().regex(/^\d+$/).transform(Number).optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

// ============================================================================
// TICKET CATEGORY TRANSLATION SCHEMAS
// ============================================================================

const createTicketCategoryTranslationSchema = z.object({
  categoryId: coercePositiveInt,
  languageId: coercePositiveInt,
  name: z.string().min(1).max(255).trim(),
  description: z.string().max(2000).optional().nullable(),
  isActive: z.boolean().optional().default(true),
}).strict();

const updateTicketCategoryTranslationSchema = z.object({
  name: z.string().min(1).max(255).trim().optional(),
  description: z.string().max(2000).optional().nullable(),
  isActive: z.boolean().optional(),
}).strict();

// ============================================================================
// TICKET SCHEMAS
// ============================================================================

const createTicketSchema = z.object({
  raisedBy: coercePositiveInt,
  subject: z.string().min(1).max(500).trim(),
  categoryId: coercePositiveInt,
  assignedTo: coercePositiveInt.optional().nullable(),
  ticketType: z.enum(['complaint', 'request', 'suggestion', 'feedback']).optional().default('complaint'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
  ticketStatus: z.enum(['open', 'in_progress', 'awaiting_response', 'resolved', 'closed', 'reopened']).optional().default('open'),
  courseId: coercePositiveInt.optional().nullable(),
  batchId: coercePositiveInt.optional().nullable(),
  webinarId: coercePositiveInt.optional().nullable(),
  orderId: coercePositiveInt.optional().nullable(),
}).strict();

const updateTicketSchema = z.object({
  subject: z.string().min(1).max(500).trim().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  ticketStatus: z.enum(['open', 'in_progress', 'awaiting_response', 'resolved', 'closed', 'reopened']).optional(),
  assignedTo: coercePositiveInt.optional().nullable(),
  categoryId: coercePositiveInt.optional(),
  ticketType: z.enum(['complaint', 'request', 'suggestion', 'feedback']).optional(),
  courseId: coercePositiveInt.optional().nullable(),
  batchId: coercePositiveInt.optional().nullable(),
  webinarId: coercePositiveInt.optional().nullable(),
  orderId: coercePositiveInt.optional().nullable(),
  firstResponseAt: z.string().datetime().optional().nullable(),
  resolvedAt: z.string().datetime().optional().nullable(),
  closedAt: z.string().datetime().optional().nullable(),
  satisfactionRating: z.number().int().min(1).max(5).optional().nullable(),
  isActive: z.boolean().optional(),
}).strict();

const ticketListQuerySchema = listQuerySchema.extend({
  raisedBy: z.string().regex(/^\d+$/).transform(Number).optional(),
  assignedTo: z.string().regex(/^\d+$/).transform(Number).optional(),
  categoryId: z.string().regex(/^\d+$/).transform(Number).optional(),
  ticketType: z.enum(['complaint', 'request', 'suggestion', 'feedback']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  ticketStatus: z.enum(['open', 'in_progress', 'awaiting_response', 'resolved', 'closed', 'reopened']).optional(),
  courseId: z.string().regex(/^\d+$/).transform(Number).optional(),
  batchId: z.string().regex(/^\d+$/).transform(Number).optional(),
  webinarId: z.string().regex(/^\d+$/).transform(Number).optional(),
  orderId: z.string().regex(/^\d+$/).transform(Number).optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

// ============================================================================
// TICKET TRANSLATION SCHEMAS
// ============================================================================

const createTicketTranslationSchema = z.object({
  ticketId: coercePositiveInt,
  languageId: coercePositiveInt,
  description: z.string().min(1).max(5000).trim(),
  resolutionNotes: z.string().max(5000).optional().nullable(),
  isActive: z.boolean().optional().default(true),
}).strict();

const updateTicketTranslationSchema = z.object({
  description: z.string().min(1).max(5000).trim().optional(),
  resolutionNotes: z.string().max(5000).optional().nullable(),
  isActive: z.boolean().optional(),
}).strict();

// ============================================================================
// TICKET MESSAGE SCHEMAS
// ============================================================================

const createTicketMessageSchema = z.object({
  ticketId: coercePositiveInt,
  senderId: coercePositiveInt,
  messageBody: z.string().min(1).max(5000).trim(),
  attachmentUrl: z.string().max(2000).optional().nullable(),
  attachmentType: z.enum(['image', 'pdf', 'document', 'video', 'other']).optional().nullable(),
  isInternalNote: z.boolean().optional().default(false),
}).strict();

const updateTicketMessageSchema = z.object({
  messageBody: z.string().min(1).max(5000).trim().optional(),
  attachmentUrl: z.string().max(2000).optional().nullable(),
  attachmentType: z.enum(['image', 'pdf', 'document', 'video', 'other']).optional().nullable(),
  isInternalNote: z.boolean().optional(),
  isActive: z.boolean().optional(),
}).strict();

const ticketMessageListQuerySchema = listQuerySchema.extend({
  ticketId: z.string().regex(/^\d+$/).transform(Number).optional(),
  senderId: z.string().regex(/^\d+$/).transform(Number).optional(),
  isInternalNote: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

// ============================================================================
// TICKET MESSAGE TRANSLATION SCHEMAS
// ============================================================================

const createTicketMessageTranslationSchema = z.object({
  ticketMessageId: coercePositiveInt,
  languageId: coercePositiveInt,
  messageBody: z.string().min(1).max(5000).trim(),
  isActive: z.boolean().optional().default(true),
}).strict();

const updateTicketMessageTranslationSchema = z.object({
  messageBody: z.string().min(1).max(5000).trim().optional(),
  isActive: z.boolean().optional(),
}).strict();

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  idParamSchema,
  categoryIdParamSchema,
  ticketIdParamSchema,
  messageIdParamSchema,
  restoreSchema,
  bulkIdsSchema,
  listQuerySchema,
  // Category
  createTicketCategorySchema,
  updateTicketCategorySchema,
  ticketCategoryListQuerySchema,
  // Category Translation
  createTicketCategoryTranslationSchema,
  updateTicketCategoryTranslationSchema,
  // Ticket
  createTicketSchema,
  updateTicketSchema,
  ticketListQuerySchema,
  // Ticket Translation
  createTicketTranslationSchema,
  updateTicketTranslationSchema,
  // Message
  createTicketMessageSchema,
  updateTicketMessageSchema,
  ticketMessageListQuerySchema,
  // Message Translation
  createTicketMessageTranslationSchema,
  updateTicketMessageTranslationSchema,
};
