/**
 * Question Bank Validators
 * Validates request data for Phase 09 Question Bank entities:
 * - MCQ Questions
 * - MCQ Question Translations
 * - MCQ Options
 * - MCQ Option Translations
 * - One-Word Questions
 * - One-Word Question Translations
 * - One-Word Synonyms
 * - One-Word Synonym Translations
 * - Descriptive Questions
 * - Descriptive Question Translations
 * - Matching Questions
 * - Matching Pairs
 * - Ordering Questions
 * - Ordering Items
 *
 * All validation is JSON-based with no file upload fields.
 * Uses Zod for schema validation and transformation.
 *
 * @module validators/questionBank
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
// MCQ QUESTIONS SCHEMAS
// ============================================================================

/**
 * Schema for creating a new MCQ question
 * Requires: topicId
 * Optional: mcqType, code, points, displayOrder, difficultyLevel, isMandatory, isActive
 */
const createMcqQuestionSchema = z.object({
  topicId: z.number().int().positive(),
  mcqType: z.enum(['single', 'multiple']).optional().default('single'),
  code: z.string().max(100).trim().nullable().optional(),
  points: z.number().positive().optional().default(1),
  displayOrder: z.number().int().nonnegative().optional().default(0),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional().default('medium'),
  isMandatory: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true),
});

/**
 * Schema for updating an MCQ question
 * All fields are optional, no default values applied
 */
const updateMcqQuestionSchema = z.object({
  topicId: z.number().int().positive().optional(),
  mcqType: z.enum(['single', 'multiple']).optional(),
  code: z.string().max(100).trim().nullable().optional(),
  points: z.number().positive().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional(),
  isMandatory: z.boolean().optional(),
  isActive: z.boolean().optional(),
}).strict();

/**
 * Schema for listing MCQ questions with filtering and sorting
 * Extends base listQuerySchema with MCQ question-specific filters
 */
const mcqQuestionListQuerySchema = listQuerySchema.extend({
  topicId: z.string().regex(/^\d+$/).transform(Number).optional(),
  mcqQuestionId: z.string().regex(/^\d+$/).transform(Number).optional(),
  languageId: z.string().regex(/^\d+$/).transform(Number).optional(),
  mcqType: z.enum(['single', 'multiple']).optional(),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional(),
  isMandatory: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  searchFields: z.string().optional(),
});

// ============================================================================
// MCQ QUESTION TRANSLATIONS SCHEMAS
// ============================================================================

/**
 * Schema for creating a new MCQ question translation
 * Requires: mcqQuestionId, languageId, questionText
 * Optional: explanation, hint, isActive
 */
const createMcqQuestionTranslationSchema = z.object({
  mcqQuestionId: z.number().int().positive(),
  languageId: z.number().int().positive(),
  questionText: z.string().min(1).trim(),
  explanation: z.string().nullable().optional(),
  hint: z.string().nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

/**
 * Schema for updating an MCQ question translation
 * All fields are optional, no default values applied
 */
const updateMcqQuestionTranslationSchema = z.object({
  mcqQuestionId: z.number().int().positive().optional(),
  languageId: z.number().int().positive().optional(),
  questionText: z.string().min(1).trim().optional(),
  explanation: z.string().nullable().optional(),
  hint: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
}).strict();

// ============================================================================
// MCQ OPTIONS SCHEMAS
// ============================================================================

/**
 * Schema for creating a new MCQ option
 * Requires: mcqQuestionId
 * Optional: isCorrect, displayOrder, isActive
 */
const createMcqOptionSchema = z.object({
  mcqQuestionId: z.number().int().positive(),
  isCorrect: z.boolean().optional().default(false),
  displayOrder: z.number().int().nonnegative().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

/**
 * Schema for updating an MCQ option
 * All fields are optional, no default values applied
 */
const updateMcqOptionSchema = z.object({
  mcqQuestionId: z.number().int().positive().optional(),
  isCorrect: z.boolean().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
}).strict();

// ============================================================================
// MCQ OPTION TRANSLATIONS SCHEMAS
// ============================================================================

/**
 * Schema for creating a new MCQ option translation
 * Requires: mcqOptionId, languageId, optionText
 * Optional: isActive
 */
const createMcqOptionTranslationSchema = z.object({
  mcqOptionId: z.number().int().positive(),
  languageId: z.number().int().positive(),
  optionText: z.string().min(1).trim(),
  isActive: z.boolean().optional().default(true),
});

/**
 * Schema for updating an MCQ option translation
 * All fields are optional, no default values applied
 */
const updateMcqOptionTranslationSchema = z.object({
  mcqOptionId: z.number().int().positive().optional(),
  languageId: z.number().int().positive().optional(),
  optionText: z.string().min(1).trim().optional(),
  isActive: z.boolean().optional(),
}).strict();

// ============================================================================
// ONE-WORD QUESTIONS SCHEMAS
// ============================================================================

/**
 * Schema for creating a new one-word question
 * Requires: topicId
 * Optional: questionType, code, points, isCaseSensitive, isTrimWhitespace, displayOrder, difficultyLevel, isMandatory, isActive
 */
const createOneWordQuestionSchema = z.object({
  topicId: z.number().int().positive(),
  questionType: z.enum(['one_word', 'number', 'date']).optional().default('one_word'),
  code: z.string().max(100).trim().nullable().optional(),
  points: z.number().positive().optional().default(1),
  isCaseSensitive: z.boolean().optional().default(false),
  isTrimWhitespace: z.boolean().optional().default(true),
  displayOrder: z.number().int().nonnegative().optional().default(0),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional().default('medium'),
  isMandatory: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true),
});

/**
 * Schema for updating a one-word question
 * All fields are optional, no default values applied
 */
const updateOneWordQuestionSchema = z.object({
  topicId: z.number().int().positive().optional(),
  questionType: z.enum(['one_word', 'number', 'date']).optional(),
  code: z.string().max(100).trim().nullable().optional(),
  points: z.number().positive().optional(),
  isCaseSensitive: z.boolean().optional(),
  isTrimWhitespace: z.boolean().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional(),
  isMandatory: z.boolean().optional(),
  isActive: z.boolean().optional(),
}).strict();

/**
 * Schema for listing one-word questions with filtering and sorting
 * Extends base listQuerySchema with one-word question-specific filters
 */
const oneWordQuestionListQuerySchema = listQuerySchema.extend({
  topicId: z.string().regex(/^\d+$/).transform(Number).optional(),
  oneWordQuestionId: z.string().regex(/^\d+$/).transform(Number).optional(),
  languageId: z.string().regex(/^\d+$/).transform(Number).optional(),
  questionType: z.enum(['one_word', 'number', 'date']).optional(),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional(),
  isMandatory: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  isCaseSensitive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  searchFields: z.string().optional(),
});

// ============================================================================
// ONE-WORD QUESTION TRANSLATIONS SCHEMAS
// ============================================================================

/**
 * Schema for creating a new one-word question translation
 * Requires: oneWordQuestionId, languageId, questionText, correctAnswer
 * Optional: explanation, hint, isActive
 */
const createOneWordQuestionTranslationSchema = z.object({
  oneWordQuestionId: z.number().int().positive(),
  languageId: z.number().int().positive(),
  questionText: z.string().min(1).trim(),
  correctAnswer: z.string().min(1).trim(),
  explanation: z.string().nullable().optional(),
  hint: z.string().nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

/**
 * Schema for updating a one-word question translation
 * All fields are optional, no default values applied
 * Includes allow clear flags for nullable fields
 */
const updateOneWordQuestionTranslationSchema = z.object({
  oneWordQuestionId: z.number().int().positive().optional(),
  languageId: z.number().int().positive().optional(),
  questionText: z.string().min(1).trim().optional(),
  correctAnswer: z.string().min(1).trim().optional(),
  explanation: z.string().nullable().optional(),
  hint: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  allowClearExplanation: z.boolean().optional(),
  allowClearHint: z.boolean().optional(),
  allowClearImage1: z.boolean().optional(),
  allowClearImage2: z.boolean().optional(),
}).strict();

// ============================================================================
// ONE-WORD SYNONYMS SCHEMAS
// ============================================================================

/**
 * Schema for creating a new one-word synonym
 * Requires: oneWordQuestionId
 * Optional: displayOrder, isActive
 */
const createOneWordSynonymSchema = z.object({
  oneWordQuestionId: z.number().int().positive(),
  displayOrder: z.number().int().nonnegative().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

// ============================================================================
// ONE-WORD SYNONYM TRANSLATIONS SCHEMAS
// ============================================================================

/**
 * Schema for creating a new one-word synonym translation
 * Requires: oneWordSynonymId, languageId, synonymText
 * Optional: isActive
 */
const createOneWordSynonymTranslationSchema = z.object({
  oneWordSynonymId: z.number().int().positive(),
  languageId: z.number().int().positive(),
  synonymText: z.string().min(1).trim(),
  isActive: z.boolean().optional().default(true),
});

/**
 * Schema for updating a one-word synonym translation
 * All fields are optional, no default values applied
 */
const updateOneWordSynonymTranslationSchema = z.object({
  oneWordSynonymId: z.number().int().positive().optional(),
  languageId: z.number().int().positive().optional(),
  synonymText: z.string().min(1).trim().optional(),
  isActive: z.boolean().optional(),
}).strict();

// ============================================================================
// DESCRIPTIVE QUESTIONS SCHEMAS
// ============================================================================

/**
 * Schema for creating a new descriptive question
 * Requires: topicId
 * Optional: answerType, code, points, minWords, maxWords, displayOrder, difficultyLevel, isMandatory, isActive
 */
const createDescriptiveQuestionSchema = z.object({
  topicId: z.number().int().positive(),
  answerType: z.enum(['short_answer', 'long_answer', 'essay']).optional().default('short_answer'),
  code: z.string().max(100).trim().nullable().optional(),
  points: z.number().positive().optional().default(1),
  minWords: z.number().int().nonnegative().nullable().optional(),
  maxWords: z.number().int().positive().nullable().optional(),
  displayOrder: z.number().int().nonnegative().optional().default(0),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional().default('medium'),
  isMandatory: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true),
});

/**
 * Schema for updating a descriptive question
 * All fields are optional, no default values applied
 */
const updateDescriptiveQuestionSchema = z.object({
  topicId: z.number().int().positive().optional(),
  answerType: z.enum(['short_answer', 'long_answer', 'essay']).optional(),
  code: z.string().max(100).trim().nullable().optional(),
  points: z.number().positive().optional(),
  minWords: z.number().int().nonnegative().nullable().optional(),
  maxWords: z.number().int().positive().nullable().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional(),
  isMandatory: z.boolean().optional(),
  isActive: z.boolean().optional(),
}).strict();

/**
 * Schema for listing descriptive questions with filtering and sorting
 * Extends base listQuerySchema with descriptive question-specific filters
 */
const descriptiveQuestionListQuerySchema = listQuerySchema.extend({
  topicId: z.string().regex(/^\d+$/).transform(Number).optional(),
  descriptiveQuestionId: z.string().regex(/^\d+$/).transform(Number).optional(),
  languageId: z.string().regex(/^\d+$/).transform(Number).optional(),
  answerType: z.enum(['short_answer', 'long_answer', 'essay']).optional(),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional(),
  isMandatory: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

// ============================================================================
// DESCRIPTIVE QUESTION TRANSLATIONS SCHEMAS
// ============================================================================

/**
 * Schema for creating a new descriptive question translation
 * Requires: descriptiveQuestionId, languageId, questionText
 * Optional: explanation, hint, modelAnswer, isActive
 */
const createDescriptiveQuestionTranslationSchema = z.object({
  descriptiveQuestionId: z.number().int().positive(),
  languageId: z.number().int().positive(),
  questionText: z.string().min(1).trim(),
  explanation: z.string().nullable().optional(),
  hint: z.string().nullable().optional(),
  modelAnswer: z.string().nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

/**
 * Schema for updating a descriptive question translation
 * All fields are optional, no default values applied
 */
const updateDescriptiveQuestionTranslationSchema = z.object({
  descriptiveQuestionId: z.number().int().positive().optional(),
  languageId: z.number().int().positive().optional(),
  questionText: z.string().min(1).trim().optional(),
  explanation: z.string().nullable().optional(),
  hint: z.string().nullable().optional(),
  modelAnswer: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
}).strict();

// ============================================================================
// MATCHING QUESTIONS SCHEMAS
// ============================================================================

/**
 * Schema for creating a new matching question
 * Requires: topicId
 * Optional: code, points, partialScoring, displayOrder, difficultyLevel, isMandatory, isActive
 */
const createMatchingQuestionSchema = z.object({
  topicId: z.number().int().positive(),
  code: z.string().max(100).trim().nullable().optional(),
  points: z.number().positive().optional().default(1),
  partialScoring: z.boolean().optional().default(false),
  displayOrder: z.number().int().nonnegative().optional().default(0),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional().default('medium'),
  isMandatory: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true),
});

/**
 * Schema for updating a matching question
 * All fields are optional, no default values applied
 */
const updateMatchingQuestionSchema = z.object({
  topicId: z.number().int().positive().optional(),
  code: z.string().max(100).trim().nullable().optional(),
  points: z.number().positive().optional(),
  partialScoring: z.boolean().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional(),
  isMandatory: z.boolean().optional(),
  isActive: z.boolean().optional(),
}).strict();

/**
 * Schema for listing matching questions with filtering and sorting
 * Extends base listQuerySchema with matching question-specific filters
 */
const matchingQuestionListQuerySchema = listQuerySchema.extend({
  topicId: z.string().regex(/^\d+$/).transform(Number).optional(),
  matchingQuestionId: z.string().regex(/^\d+$/).transform(Number).optional(),
  languageId: z.string().regex(/^\d+$/).transform(Number).optional(),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional(),
  isMandatory: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  partialScoring: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

// ============================================================================
// MATCHING PAIRS SCHEMAS
// ============================================================================

/**
 * Schema for creating a new matching pair
 * Requires: matchingQuestionId, correctPosition
 * Optional: isActive
 */
const createMatchingPairSchema = z.object({
  matchingQuestionId: z.number().int().positive(),
  correctPosition: z.number().int().nonnegative(),
  isActive: z.boolean().optional().default(true),
});

/**
 * Schema for updating a matching pair
 * All fields are optional, no default values applied
 */
const updateMatchingPairSchema = z.object({
  matchingQuestionId: z.number().int().positive().optional(),
  correctPosition: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
}).strict();

// ============================================================================
// ORDERING QUESTIONS SCHEMAS
// ============================================================================

/**
 * Schema for creating a new ordering question
 * Requires: topicId
 * Optional: code, points, partialScoring, displayOrder, difficultyLevel, isMandatory, isActive
 */
const createOrderingQuestionSchema = z.object({
  topicId: z.number().int().positive(),
  code: z.string().max(100).trim().nullable().optional(),
  points: z.number().positive().nullable().optional(),
  partialScoring: z.boolean().nullable().optional(),
  displayOrder: z.number().int().nonnegative().nullable().optional(),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).nullable().optional(),
  isMandatory: z.boolean().nullable().optional(),
  isActive: z.boolean().nullable().optional(),
});

/**
 * Schema for updating an ordering question
 * All fields are optional, no default values applied
 */
const updateOrderingQuestionSchema = z.object({
  topicId: z.number().int().positive().optional(),
  code: z.string().max(100).trim().nullable().optional(),
  points: z.number().positive().nullable().optional(),
  partialScoring: z.boolean().nullable().optional(),
  displayOrder: z.number().int().nonnegative().nullable().optional(),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).nullable().optional(),
  isMandatory: z.boolean().nullable().optional(),
  isActive: z.boolean().nullable().optional(),
}).strict();

/**
 * Schema for listing ordering questions with filtering and sorting
 * Extends base listQuerySchema with ordering question-specific filters
 */
const orderingQuestionListQuerySchema = listQuerySchema.extend({
  topicId: z.string().regex(/^\d+$/).transform(Number).optional(),
  orderingQuestionId: z.string().regex(/^\d+$/).transform(Number).optional(),
  languageId: z.string().regex(/^\d+$/).transform(Number).optional(),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional(),
  isMandatory: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  partialScoring: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

// ============================================================================
// ORDERING ITEMS SCHEMAS
// ============================================================================

/**
 * Schema for creating a new ordering item
 * Requires: orderingQuestionId, correctPosition
 * Optional: isActive
 */
const createOrderingItemSchema = z.object({
  orderingQuestionId: z.number().int().positive(),
  correctPosition: z.number().int().nonnegative(),
  isActive: z.boolean().optional().default(true),
});

/**
 * Schema for updating an ordering item
 * All fields are optional, no default values applied
 */
const updateOrderingItemSchema = z.object({
  orderingQuestionId: z.number().int().positive().optional(),
  correctPosition: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
}).strict();

// ============================================================================
// RESTORE SCHEMAS
// ============================================================================

/**
 * Schema for restoring soft-deleted entities
 * restoreTranslations: optional flag to restore translations as well
 */
const restoreSchema = z
  .preprocess((val) => (val === undefined || val === null ? {} : val), z.object({
    restoreTranslations: z.boolean().optional().default(false),
  }));

/**
 * Schema for restoring soft-deleted MCQ questions
 * restoreTranslations: optional flag to restore translations
 * restoreOptions: optional flag to restore options
 */
const restoreMcqQuestionSchema = z
  .preprocess((val) => (val === undefined || val === null ? {} : val), z.object({
    restoreTranslations: z.boolean().optional().default(true),
    restoreOptions: z.boolean().optional().default(true),
  }));

/**
 * Schema for restoring soft-deleted MCQ options
 * restoreTranslations: optional flag to restore translations
 */
const restoreMcqOptionSchema = z
  .preprocess((val) => (val === undefined || val === null ? {} : val), z.object({
    restoreTranslations: z.boolean().optional().default(true),
  }));

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Shared
  idParamSchema,
  listQuerySchema,
  // MCQ Questions
  createMcqQuestionSchema,
  updateMcqQuestionSchema,
  mcqQuestionListQuerySchema,
  // MCQ Question Translations
  createMcqQuestionTranslationSchema,
  updateMcqQuestionTranslationSchema,
  // MCQ Options
  createMcqOptionSchema,
  updateMcqOptionSchema,
  // MCQ Option Translations
  createMcqOptionTranslationSchema,
  updateMcqOptionTranslationSchema,
  // One-Word Questions
  createOneWordQuestionSchema,
  updateOneWordQuestionSchema,
  oneWordQuestionListQuerySchema,
  // One-Word Question Translations
  createOneWordQuestionTranslationSchema,
  updateOneWordQuestionTranslationSchema,
  // One-Word Synonyms
  createOneWordSynonymSchema,
  // One-Word Synonym Translations
  createOneWordSynonymTranslationSchema,
  updateOneWordSynonymTranslationSchema,
  // Descriptive Questions
  createDescriptiveQuestionSchema,
  updateDescriptiveQuestionSchema,
  descriptiveQuestionListQuerySchema,
  // Descriptive Question Translations
  createDescriptiveQuestionTranslationSchema,
  updateDescriptiveQuestionTranslationSchema,
  // Matching Questions
  createMatchingQuestionSchema,
  updateMatchingQuestionSchema,
  matchingQuestionListQuerySchema,
  // Matching Pairs
  createMatchingPairSchema,
  updateMatchingPairSchema,
  // Ordering Questions
  createOrderingQuestionSchema,
  updateOrderingQuestionSchema,
  orderingQuestionListQuerySchema,
  // Ordering Items
  createOrderingItemSchema,
  updateOrderingItemSchema,
  // Restore
  restoreSchema,
  restoreMcqQuestionSchema,
  restoreMcqOptionSchema,
};
