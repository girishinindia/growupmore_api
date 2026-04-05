/**
 * Material Management Validators
 * Validates request data for Phase 08 Material Management entities:
 * - Subjects
 * - Chapters
 * - Topics
 * - Sub-Topics
 *
 * All validation is JSON-based with no file upload fields.
 * Uses Zod for schema validation and transformation.
 *
 * @module validators/materialManagement
 */

const { z } = require('zod');

// ============================================================================
// SHARED SCHEMAS
// ============================================================================

/**
 * ID parameter schema for path parameters
 * Validates and converts string IDs to positive integers
 */
const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a positive integer').transform(Number),
});

/**
 * Base list query schema for pagination and sorting
 * Supports pagination, searching, and sorting
 */
const listQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
  search: z.string().max(100).optional(),
  sortBy: z.string().max(50).optional(),
  sortDir: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional().default('ASC'),
});

// ============================================================================
// SUBJECTS SCHEMAS
// ============================================================================

/**
 * Schema for creating a new subject
 * Requires: code
 * Optional: difficultyLevel, estimatedHours, displayOrder, note, isActive
 */
const createSubjectSchema = z.object({
  code: z.string().min(1).max(100).trim(),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional().default('beginner'),
  estimatedHours: z.number().positive().nullable().optional(),
  displayOrder: z.number().int().nonnegative().optional().default(0),
  note: z.string().max(1000).nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

/**
 * Schema for updating a subject
 * All fields are optional, no default values applied
 */
const updateSubjectSchema = z.object({
  code: z.string().min(1).max(100).trim().optional(),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  estimatedHours: z.number().positive().nullable().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
  note: z.string().max(1000).nullable().optional(),
  isActive: z.boolean().optional(),
}).strict();

/**
 * Schema for listing subjects with filtering and sorting
 * Extends base listQuerySchema with subject-specific filters
 */
const subjectListQuerySchema = listQuerySchema.extend({
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  subjectId: z.string().regex(/^\d+$/).transform(Number).optional(),
  languageId: z.string().regex(/^\d+$/).transform(Number).optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

// ============================================================================
// CHAPTERS SCHEMAS
// ============================================================================

/**
 * Schema for creating a new chapter
 * Requires: subjectId
 * Optional: displayOrder, difficultyLevel, estimatedMinutes, note, isActive
 */
const createChapterSchema = z.object({
  subjectId: z.number().int().positive(),
  displayOrder: z.number().int().nonnegative().optional().default(0),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional().default('beginner'),
  estimatedMinutes: z.number().int().positive().nullable().optional(),
  note: z.string().max(1000).nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

/**
 * Schema for updating a chapter
 * All fields are optional, no default values applied
 * subjectId can be changed during update
 */
const updateChapterSchema = z.object({
  subjectId: z.number().int().positive().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  estimatedMinutes: z.number().int().positive().nullable().optional(),
  note: z.string().max(1000).nullable().optional(),
  isActive: z.boolean().optional(),
}).strict();

/**
 * Schema for listing chapters with filtering and sorting
 * Extends base listQuerySchema with chapter-specific filters
 */
const chapterListQuerySchema = listQuerySchema.extend({
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  subjectCode: z.string().optional(),
  chapterId: z.string().regex(/^\d+$/).transform(Number).optional(),
  subjectId: z.string().regex(/^\d+$/).transform(Number).optional(),
  languageId: z.string().regex(/^\d+$/).transform(Number).optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

// ============================================================================
// TOPICS SCHEMAS
// ============================================================================

/**
 * Schema for creating a new topic
 * Optional: chapterId (can be standalone or nested under chapter)
 * Optional: displayOrder, difficultyLevel, estimatedMinutes, note, isActive
 */
const createTopicSchema = z.object({
  chapterId: z.number().int().positive().nullable().optional(),
  displayOrder: z.number().int().nonnegative().optional().default(0),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional().default('beginner'),
  estimatedMinutes: z.number().int().positive().nullable().optional(),
  note: z.string().max(1000).nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

/**
 * Schema for updating a topic
 * All fields are optional, no default values applied
 * chapterId can be changed, removed, or added during update
 */
const updateTopicSchema = z.object({
  chapterId: z.number().int().positive().nullable().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  estimatedMinutes: z.number().int().positive().nullable().optional(),
  note: z.string().max(1000).nullable().optional(),
  isActive: z.boolean().optional(),
}).strict();

/**
 * Schema for listing topics with filtering and sorting
 * Extends base listQuerySchema with topic-specific filters
 * Supports filtering by standalone status
 */
const topicListQuerySchema = listQuerySchema.extend({
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  isStandalone: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  topicId: z.string().regex(/^\d+$/).transform(Number).optional(),
  chapterId: z.string().regex(/^\d+$/).transform(Number).optional(),
  subjectId: z.string().regex(/^\d+$/).transform(Number).optional(),
  languageId: z.string().regex(/^\d+$/).transform(Number).optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

// ============================================================================
// SUB-TOPICS SCHEMAS
// ============================================================================

/**
 * Schema for creating a new sub-topic
 * Requires: topicId
 * Optional: displayOrder, difficultyLevel, estimatedMinutes, note, isActive
 */
const createSubTopicSchema = z.object({
  topicId: z.number().int().positive(),
  displayOrder: z.number().int().nonnegative().optional().default(0),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional().default('beginner'),
  estimatedMinutes: z.number().int().positive().nullable().optional(),
  note: z.string().max(1000).nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

/**
 * Schema for updating a sub-topic
 * All fields are optional, no default values applied
 * topicId can be changed during update
 */
const updateSubTopicSchema = z.object({
  topicId: z.number().int().positive().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  estimatedMinutes: z.number().int().positive().nullable().optional(),
  note: z.string().max(1000).nullable().optional(),
  isActive: z.boolean().optional(),
}).strict();

/**
 * Schema for listing sub-topics with filtering and sorting
 * Extends base listQuerySchema with sub-topic-specific filters
 */
const subTopicListQuerySchema = listQuerySchema.extend({
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  subTopicId: z.string().regex(/^\d+$/).transform(Number).optional(),
  topicId: z.string().regex(/^\d+$/).transform(Number).optional(),
  chapterId: z.string().regex(/^\d+$/).transform(Number).optional(),
  languageId: z.string().regex(/^\d+$/).transform(Number).optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Shared
  idParamSchema,
  listQuerySchema,
  // Subjects
  createSubjectSchema,
  updateSubjectSchema,
  subjectListQuerySchema,
  // Chapters
  createChapterSchema,
  updateChapterSchema,
  chapterListQuerySchema,
  // Topics
  createTopicSchema,
  updateTopicSchema,
  topicListQuerySchema,
  // Sub-Topics
  createSubTopicSchema,
  updateSubTopicSchema,
  subTopicListQuerySchema,
};
