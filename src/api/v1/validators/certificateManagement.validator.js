const { z } = require('zod');

// ============================================================================
// SHARED SCHEMAS
// ============================================================================

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a positive integer').transform(Number),
});

const templateIdParamSchema = z.object({
  templateId: z.string().regex(/^\d+$/, 'Template ID must be a positive integer').transform(Number),
});

const restoreSchema = z.object({}).strict();

const bulkIdsSchema = z.object({
  ids: z.array(z.string().regex(/^\d+$/).transform(Number)).min(1, 'At least one ID is required'),
}).strict();

const listQuerySchema = z.object({
  page: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().regex(/^\d+$/).transform(Number).optional().default(1)),
  limit: z.preprocess((val) => (val !== undefined ? String(val) : undefined), z.string().regex(/^\d+$/).transform(Number).optional().default(20)),
});

// ============================================================================
// CERTIFICATE TEMPLATES SCHEMAS
// ============================================================================

const createCertificateTemplateSchema = z.object({
  code: z.string().min(1, 'Code is required').max(100).trim(),
  templateType: z.enum(['completion', 'excellence', 'participation']).optional().default('completion'),
  templateFileUrl: z.string().max(2000).trim().optional().nullable(),
  isDefault: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
}).strict();

const updateCertificateTemplateSchema = z.object({
  code: z.string().min(1).max(100).trim().optional().nullable(),
  templateType: z.enum(['completion', 'excellence', 'participation']).optional().nullable(),
  templateFileUrl: z.string().max(2000).trim().optional().nullable(),
  isDefault: z.boolean().optional().nullable(),
  isActive: z.boolean().optional().nullable(),
}).strict();

const certificateTemplateListQuerySchema = listQuerySchema.extend({
  certificateTemplateId: z.string().regex(/^\d+$/).transform(Number).optional(),
  languageId: z.string().regex(/^\d+$/).transform(Number).optional(),
  templateType: z.enum(['completion', 'excellence', 'participation']).optional(),
  isDefault: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  searchTerm: z.string().max(500).optional(),
  sortTable: z.string().max(100).optional().default('template'),
  sortBy: z.string().max(100).optional().default('code'),
  sortDir: z.enum(['ASC', 'DESC']).optional().default('ASC'),
});

// ============================================================================
// CERTIFICATE TEMPLATE TRANSLATIONS SCHEMAS
// ============================================================================

const createTemplateTranslationSchema = z.object({
  certificateTemplateId: z.number().int().positive(),
  languageId: z.number().int().positive(),
  title: z.string().min(1, 'Title is required').max(500).trim(),
  description: z.string().max(2000).trim().optional().nullable(),
  congratulationsText: z.string().max(2000).trim().optional().nullable(),
  footerText: z.string().max(2000).trim().optional().nullable(),
  isActive: z.boolean().optional().default(true),
}).strict();

const updateTemplateTranslationSchema = z.object({
  title: z.string().min(1).max(500).trim().optional().nullable(),
  description: z.string().max(2000).trim().optional().nullable(),
  congratulationsText: z.string().max(2000).trim().optional().nullable(),
  footerText: z.string().max(2000).trim().optional().nullable(),
  isActive: z.boolean().optional().nullable(),
}).strict();

// ============================================================================
// CERTIFICATES SCHEMAS
// ============================================================================

const createCertificateSchema = z.object({
  studentId: z.number().int().positive(),
  courseId: z.number().int().positive(),
  enrollmentId: z.number().int().positive(),
  certificateTemplateId: z.number().int().positive(),
  certificateNumber: z.string().max(100).trim().optional().nullable(),
  studentNameSnapshot: z.string().max(500).trim().optional().nullable(),
  courseTitleSnapshot: z.string().max(500).trim().optional().nullable(),
  verificationUrl: z.string().max(2000).trim().optional().nullable(),
  pdfUrl: z.string().max(2000).trim().optional().nullable(),
  issuedAt: z.string().datetime().optional().nullable(),
}).strict();

const updateCertificateSchema = z.object({
  verificationUrl: z.string().max(2000).trim().optional().nullable(),
  pdfUrl: z.string().max(2000).trim().optional().nullable(),
  issuedAt: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional().nullable(),
}).strict();

const certificateListQuerySchema = listQuerySchema.extend({
  studentId: z.string().regex(/^\d+$/).transform(Number).optional(),
  courseId: z.string().regex(/^\d+$/).transform(Number).optional(),
  certificateNumber: z.string().max(100).optional(),
  templateId: z.string().regex(/^\d+$/).transform(Number).optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  issuedAfter: z.string().optional(),
  issuedBefore: z.string().optional(),
  searchTerm: z.string().max(500).optional(),
  sortBy: z.string().max(100).optional().default('issued_at'),
  sortDir: z.enum(['ASC', 'DESC']).optional().default('DESC'),
});

// ============================================================================
// VALIDATORS EXPORT
// ============================================================================

module.exports = {
  // Shared
  idParamSchema,
  templateIdParamSchema,
  restoreSchema,
  bulkIdsSchema,
  listQuerySchema,

  // Certificate Templates
  createCertificateTemplateSchema,
  updateCertificateTemplateSchema,
  certificateTemplateListQuerySchema,

  // Template Translations
  createTemplateTranslationSchema,
  updateTemplateTranslationSchema,

  // Certificates
  createCertificateSchema,
  updateCertificateSchema,
  certificateListQuerySchema,
};
