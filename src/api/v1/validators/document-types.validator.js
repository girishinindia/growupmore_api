/**
 * ═══════════════════════════════════════════════════════════════
 * DOCUMENT-TYPES VALIDATOR — Zod Schemas
 * ═══════════════════════════════════════════════════════════════
 */

const { z } = require('zod');

const createDocumentTypeSchema = z.object({
  name: z
    .string()
    .min(2, 'Document type name must be at least 2 characters.')
    .max(100, 'Document type name must not exceed 100 characters.')
    .trim(),
  is_active: z.boolean().default(true),
});

const updateDocumentTypeSchema = createDocumentTypeSchema.partial();

module.exports = {
  createDocumentTypeSchema,
  updateDocumentTypeSchema,
};
