const { z } = require('zod');

// ============================================================================
// SHARED SCHEMAS
// ============================================================================

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a positive integer').transform(Number),
});

const discussionIdParamSchema = z.object({
  discussionId: z.string().regex(/^\d+$/, 'Discussion ID must be a positive integer').transform(Number),
});

const restoreSchema = z.object({}).strict();

const bulkIdsSchema = z
  .object({
    ids: z
      .array(z.string().regex(/^\d+$/).transform(Number))
      .min(1, 'At least one ID is required'),
  })
  .strict();

const listQuerySchema = z.object({
  page: z.preprocess(
    (val) => (val !== undefined ? String(val) : undefined),
    z.string().regex(/^\d+$/).transform(Number).optional().default(1),
  ),
  limit: z.preprocess(
    (val) => (val !== undefined ? String(val) : undefined),
    z.string().regex(/^\d+$/).transform(Number).optional().default(20),
  ),
});

// ============================================================================
// DISCUSSIONS SCHEMAS
// ============================================================================

const createDiscussionSchema = z
  .object({
    courseId: z.number().int().positive(),
    chapterId: z.number().int().positive().optional().nullable(),
    discussionType: z.enum(['question', 'discussion']).optional().default('question'),
    title: z.string().min(1, 'Title is required').max(1000).trim(),
    body: z.string().min(1, 'Body is required').max(50000).trim(),
    isPinned: z.boolean().optional().default(false),
    isResolved: z.boolean().optional().default(false),
  })
  .strict();

const updateDiscussionSchema = z
  .object({
    title: z.string().min(1).max(1000).trim().optional().nullable(),
    body: z.string().min(1).max(50000).trim().optional().nullable(),
    chapterId: z.number().int().positive().optional().nullable(),
    discussionType: z.enum(['question', 'discussion']).optional().nullable(),
    isPinned: z.boolean().optional().nullable(),
    isResolved: z.boolean().optional().nullable(),
    upvoteCount: z.number().int().nonnegative().optional().nullable(),
    replyCount: z.number().int().nonnegative().optional().nullable(),
  })
  .strict();

const discussionListQuerySchema = listQuerySchema.extend({
  courseId: z.string().regex(/^\d+$/).transform(Number).optional(),
  chapterId: z.string().regex(/^\d+$/).transform(Number).optional(),
  userId: z.string().regex(/^\d+$/).transform(Number).optional(),
  discussionType: z.enum(['question', 'discussion']).optional(),
  isPinned: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  isResolved: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  searchTerm: z.string().max(500).optional(),
  sortBy: z.string().max(100).optional().default('created_at'),
  sortDir: z.enum(['ASC', 'DESC']).optional().default('DESC'),
});

// ============================================================================
// DISCUSSION REPLIES SCHEMAS
// ============================================================================

const createDiscussionReplySchema = z
  .object({
    body: z.string().min(1, 'Body is required').max(50000).trim(),
    parentReplyId: z.number().int().positive().optional().nullable(),
    isAcceptedAnswer: z.boolean().optional().default(false),
  })
  .strict();

const updateDiscussionReplySchema = z
  .object({
    body: z.string().min(1).max(50000).trim().optional().nullable(),
    parentReplyId: z.number().int().positive().optional().nullable(),
    isAcceptedAnswer: z.boolean().optional().nullable(),
    upvoteCount: z.number().int().nonnegative().optional().nullable(),
  })
  .strict();

const discussionReplyListQuerySchema = listQuerySchema.extend({
  parentReplyId: z.string().regex(/^\d+$/).transform(Number).optional(),
  userId: z.string().regex(/^\d+$/).transform(Number).optional(),
  isAcceptedAnswer: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  searchTerm: z.string().max(500).optional(),
  sortBy: z.string().max(100).optional().default('created_at'),
  sortDir: z.enum(['ASC', 'DESC']).optional().default('ASC'),
});

// ============================================================================
// DISCUSSION VOTES SCHEMAS
// ============================================================================

const createDiscussionVoteSchema = z
  .object({
    voteableType: z.enum(['discussion', 'reply']),
    voteType: z.enum(['upvote', 'downvote']),
    discussionId: z.number().int().positive().optional().nullable(),
    replyId: z.number().int().positive().optional().nullable(),
  })
  .strict()
  .refine(
    (data) => {
      if (data.voteableType === 'discussion') return data.discussionId != null;
      if (data.voteableType === 'reply') return data.replyId != null;
      return false;
    },
    {
      message: 'discussionId is required when voteableType is discussion, replyId is required when voteableType is reply',
    },
  );

const updateDiscussionVoteSchema = z
  .object({
    voteType: z.enum(['upvote', 'downvote']).optional(),
  })
  .strict();

const discussionVoteListQuerySchema = listQuerySchema.extend({
  userId: z.string().regex(/^\d+$/).transform(Number).optional(),
  voteableType: z.enum(['discussion', 'reply']).optional(),
  discussionId: z.string().regex(/^\d+$/).transform(Number).optional(),
  replyId: z.string().regex(/^\d+$/).transform(Number).optional(),
  voteType: z.enum(['upvote', 'downvote']).optional(),
  sortBy: z.string().max(100).optional().default('created_at'),
  sortDir: z.enum(['ASC', 'DESC']).optional().default('DESC'),
});

// ============================================================================
// VALIDATORS EXPORT
// ============================================================================

module.exports = {
  // Shared
  idParamSchema,
  discussionIdParamSchema,
  restoreSchema,
  bulkIdsSchema,
  listQuerySchema,

  // Discussions
  createDiscussionSchema,
  updateDiscussionSchema,
  discussionListQuerySchema,

  // Discussion Replies
  createDiscussionReplySchema,
  updateDiscussionReplySchema,
  discussionReplyListQuerySchema,

  // Discussion Votes
  createDiscussionVoteSchema,
  updateDiscussionVoteSchema,
  discussionVoteListQuerySchema,
};
