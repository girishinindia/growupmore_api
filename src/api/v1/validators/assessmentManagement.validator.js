/**
 * Assessment Management Validators
 * Validates request data for Phase 11 Assessment Management entities:
 * - Assessments
 * - Assessment Translations
 * - Assessment Attachments
 * - Assessment Attachment Translations
 * - Assessment Solutions
 * - Assessment Solution Translations
 *
 * Uses Zod for schema validation and transformation.
 *
 * @module validators/assessmentManagement
 */

const { z } = require('zod');

// ============================================================================
// SHARED SCHEMAS
// ============================================================================

/**
 * ID parameter schema for path parameters
 */
const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a positive integer').transform(Number),
});

/**
 * Base list query schema for pagination and filtering
 */
const listQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
  search: z.string().max(100).optional(),
  sortBy: z.string().max(50).optional(),
  sortDir: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional().default('ASC'),
});

/**
 * Restore schema for soft-deleted resources
 */
const restoreSchema = z.object({
  restoreTranslations: z.boolean().optional().default(false),
});

// ============================================================================
// ASSESSMENTS SCHEMAS
// ============================================================================

/**
 * Schema for creating a new assessment
 * Requires: at minimum assessment type, scope, and content type
 * Optional: chapter, module, course IDs, code, points, difficulty level, etc.
 */
const createAssessmentSchema = z.object({
  assessmentType: z.enum(['assignment', 'quiz', 'project', 'exam']).optional().default('assignment'),
  assessmentScope: z.enum(['chapter', 'module', 'course']).optional().default('chapter'),
  chapterId: z.number().int().positive().optional(),
  moduleId: z.number().int().positive().optional(),
  courseId: z.number().int().positive().optional(),
  contentType: z.enum(['coding', 'text', 'multiple_choice', 'mixed']).optional().default('coding'),
  code: z.string().max(100).trim().nullable().optional(),
  points: z.number().positive().optional(),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional().default('medium'),
  dueDays: z.number().int().positive().optional(),
  estimatedHours: z.number().positive().optional(),
  isMandatory: z.boolean().optional().default(true),
  displayOrder: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional().default(true),
});

/**
 * Schema for updating an assessment
 * All fields are optional
 */
const updateAssessmentSchema = z.object({
  assessmentType: z.enum(['assignment', 'quiz', 'project', 'exam']).optional(),
  assessmentScope: z.enum(['chapter', 'module', 'course']).optional(),
  contentType: z.enum(['coding', 'text', 'multiple_choice', 'mixed']).optional(),
  code: z.string().max(100).trim().nullable().optional(),
  points: z.number().positive().optional(),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional(),
  dueDays: z.number().int().positive().optional(),
  estimatedHours: z.number().positive().optional(),
  isMandatory: z.boolean().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
}).strict();

/**
 * Schema for listing assessments with filtering and sorting
 */
const assessmentListQuerySchema = listQuerySchema.extend({
  assessmentId: z.string().regex(/^\d+$/).transform(Number).optional(),
  languageId: z.string().regex(/^\d+$/).transform(Number).optional(),
  assessmentType: z.enum(['assignment', 'quiz', 'project', 'exam']).optional(),
  assessmentScope: z.enum(['chapter', 'module', 'course']).optional(),
  contentType: z.enum(['coding', 'text', 'multiple_choice', 'mixed']).optional(),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional(),
  chapterId: z.string().regex(/^\d+$/).transform(Number).optional(),
  moduleId: z.string().regex(/^\d+$/).transform(Number).optional(),
  courseId: z.string().regex(/^\d+$/).transform(Number).optional(),
  isMandatory: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

// ============================================================================
// ASSESSMENT TRANSLATIONS SCHEMAS
// ============================================================================

/**
 * Schema for creating assessment translation
 * Requires: assessmentId, languageId, title
 * Optional: description, instructions, tech stack, learning outcomes, images, SEO fields
 */
const createAssessmentTranslationSchema = z.object({
  assessmentId: z.number().int().positive(),
  languageId: z.number().int().positive(),
  title: z.string().min(1).trim(),
  description: z.string().nullable().optional(),
  instructions: z.string().nullable().optional(),
  techStack: z.record(z.any()).nullable().optional(),
  learningOutcomes: z.array(z.string()).nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  metaTitle: z.string().max(60).nullable().optional(),
  metaDescription: z.string().max(160).nullable().optional(),
  metaKeywords: z.string().nullable().optional(),
  canonicalUrl: z.string().url().nullable().optional(),
  ogSiteName: z.string().nullable().optional(),
  ogTitle: z.string().nullable().optional(),
  ogDescription: z.string().nullable().optional(),
  ogType: z.string().nullable().optional(),
  ogImage: z.string().url().nullable().optional(),
  ogUrl: z.string().url().nullable().optional(),
  twitterSite: z.string().nullable().optional(),
  twitterTitle: z.string().nullable().optional(),
  twitterDescription: z.string().nullable().optional(),
  twitterImage: z.string().url().nullable().optional(),
  twitterCard: z.string().nullable().optional(),
  robotsDirective: z.string().nullable().optional(),
  focusKeyword: z.string().nullable().optional(),
  structuredData: z.record(z.any()).nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

/**
 * Schema for updating assessment translation
 * All fields are optional
 */
const updateAssessmentTranslationSchema = z.object({
  assessmentId: z.number().int().positive().optional(),
  languageId: z.number().int().positive().optional(),
  title: z.string().min(1).trim().optional(),
  description: z.string().nullable().optional(),
  instructions: z.string().nullable().optional(),
  techStack: z.record(z.any()).nullable().optional(),
  learningOutcomes: z.array(z.string()).nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  metaTitle: z.string().max(60).nullable().optional(),
  metaDescription: z.string().max(160).nullable().optional(),
  metaKeywords: z.string().nullable().optional(),
  canonicalUrl: z.string().url().nullable().optional(),
  ogSiteName: z.string().nullable().optional(),
  ogTitle: z.string().nullable().optional(),
  ogDescription: z.string().nullable().optional(),
  ogType: z.string().nullable().optional(),
  ogImage: z.string().url().nullable().optional(),
  ogUrl: z.string().url().nullable().optional(),
  twitterSite: z.string().nullable().optional(),
  twitterTitle: z.string().nullable().optional(),
  twitterDescription: z.string().nullable().optional(),
  twitterImage: z.string().url().nullable().optional(),
  twitterCard: z.string().nullable().optional(),
  robotsDirective: z.string().nullable().optional(),
  focusKeyword: z.string().nullable().optional(),
  structuredData: z.record(z.any()).nullable().optional(),
  isActive: z.boolean().optional(),
}).strict();

// ============================================================================
// ASSESSMENT ATTACHMENTS SCHEMAS
// ============================================================================

/**
 * Schema for creating assessment attachment
 * Requires: assessmentId, attachmentType, displayOrder, isActive
 * Optional: fileUrl, githubUrl, fileName, fileSizeBytes, mimeType
 */
const createAssessmentAttachmentSchema = z.object({
  assessmentId: z.number().int().positive(),
  attachmentType: z.enum(['document', 'resource', 'reference', 'example']),
  fileUrl: z.string().url().nullable().optional(),
  githubUrl: z.string().url().nullable().optional(),
  fileName: z.string().nullable().optional(),
  fileSizeBytes: z.number().int().nonnegative().nullable().optional(),
  mimeType: z.string().nullable().optional(),
  displayOrder: z.number().int().nonnegative().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

/**
 * Schema for updating assessment attachment
 * All fields are optional
 */
const updateAssessmentAttachmentSchema = z.object({
  assessmentId: z.number().int().positive().optional(),
  attachmentType: z.enum(['document', 'resource', 'reference', 'example']).optional(),
  fileUrl: z.string().url().nullable().optional(),
  githubUrl: z.string().url().nullable().optional(),
  fileName: z.string().nullable().optional(),
  fileSizeBytes: z.number().int().nonnegative().nullable().optional(),
  mimeType: z.string().nullable().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
}).strict();

/**
 * Schema for listing assessment attachments
 */
const assessmentAttachmentListQuerySchema = listQuerySchema.extend({
  assessmentId: z.string().regex(/^\d+$/).transform(Number).optional(),
  languageId: z.string().regex(/^\d+$/).transform(Number).optional(),
  attachmentType: z.enum(['document', 'resource', 'reference', 'example']).optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

// ============================================================================
// ASSESSMENT ATTACHMENT TRANSLATIONS SCHEMAS
// ============================================================================

/**
 * Schema for creating assessment attachment translation
 * Requires: assessmentAttachmentId, languageId
 * Optional: title, description, isActive
 */
const createAssessmentAttachmentTranslationSchema = z.object({
  assessmentAttachmentId: z.number().int().positive(),
  languageId: z.number().int().positive(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

/**
 * Schema for updating assessment attachment translation
 * All fields are optional
 */
const updateAssessmentAttachmentTranslationSchema = z.object({
  assessmentAttachmentId: z.number().int().positive().optional(),
  languageId: z.number().int().positive().optional(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
}).strict();

// ============================================================================
// ASSESSMENT SOLUTIONS SCHEMAS
// ============================================================================

/**
 * Schema for creating assessment solution
 * Requires: assessmentId, solutionType, displayOrder, isActive
 * Optional: fileUrl, githubUrl, videoUrl, fileName, fileSizeBytes, mimeType, videoDurationSeconds
 */
const createAssessmentSolutionSchema = z.object({
  assessmentId: z.number().int().positive(),
  solutionType: z.enum(['file', 'github', 'video', 'text']),
  fileUrl: z.string().url().nullable().optional(),
  githubUrl: z.string().url().nullable().optional(),
  videoUrl: z.string().url().nullable().optional(),
  fileName: z.string().nullable().optional(),
  fileSizeBytes: z.number().int().nonnegative().nullable().optional(),
  mimeType: z.string().nullable().optional(),
  videoDurationSeconds: z.number().int().positive().nullable().optional(),
  displayOrder: z.number().int().nonnegative().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

/**
 * Schema for updating assessment solution
 * All fields are optional
 */
const updateAssessmentSolutionSchema = z.object({
  assessmentId: z.number().int().positive().optional(),
  solutionType: z.enum(['file', 'github', 'video', 'text']).optional(),
  fileUrl: z.string().url().nullable().optional(),
  githubUrl: z.string().url().nullable().optional(),
  videoUrl: z.string().url().nullable().optional(),
  fileName: z.string().nullable().optional(),
  fileSizeBytes: z.number().int().nonnegative().nullable().optional(),
  mimeType: z.string().nullable().optional(),
  videoDurationSeconds: z.number().int().positive().nullable().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
}).strict();

/**
 * Schema for listing assessment solutions
 */
const assessmentSolutionListQuerySchema = listQuerySchema.extend({
  assessmentId: z.string().regex(/^\d+$/).transform(Number).optional(),
  languageId: z.string().regex(/^\d+$/).transform(Number).optional(),
  solutionType: z.enum(['file', 'github', 'video', 'text']).optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

// ============================================================================
// ASSESSMENT SOLUTION TRANSLATIONS SCHEMAS
// ============================================================================

/**
 * Schema for creating assessment solution translation
 * Requires: assessmentSolutionId, languageId
 * Optional: title, description, videoTitle, videoDescription, videoThumbnail, isActive
 */
const createAssessmentSolutionTranslationSchema = z.object({
  assessmentSolutionId: z.number().int().positive(),
  languageId: z.number().int().positive(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  videoTitle: z.string().nullable().optional(),
  videoDescription: z.string().nullable().optional(),
  videoThumbnail: z.string().url().nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

/**
 * Schema for updating assessment solution translation
 * All fields are optional
 */
const updateAssessmentSolutionTranslationSchema = z.object({
  assessmentSolutionId: z.number().int().positive().optional(),
  languageId: z.number().int().positive().optional(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  videoTitle: z.string().nullable().optional(),
  videoDescription: z.string().nullable().optional(),
  videoThumbnail: z.string().url().nullable().optional(),
  isActive: z.boolean().optional(),
}).strict();

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  idParamSchema,
  restoreSchema,
  listQuerySchema,
  createAssessmentSchema,
  updateAssessmentSchema,
  assessmentListQuerySchema,
  createAssessmentTranslationSchema,
  updateAssessmentTranslationSchema,
  createAssessmentAttachmentSchema,
  updateAssessmentAttachmentSchema,
  assessmentAttachmentListQuerySchema,
  createAssessmentAttachmentTranslationSchema,
  updateAssessmentAttachmentTranslationSchema,
  createAssessmentSolutionSchema,
  updateAssessmentSolutionSchema,
  assessmentSolutionListQuerySchema,
  createAssessmentSolutionTranslationSchema,
  updateAssessmentSolutionTranslationSchema,
};
