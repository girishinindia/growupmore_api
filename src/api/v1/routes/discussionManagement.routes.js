const { Router } = require('express');
const ctrl = require('../controllers/discussionManagement.controller');
const validate = require('../../../middleware/validate.middleware');
const authenticate = require('../../../middleware/auth.middleware');
const { authorize } = require('../../../middleware/authorize.middleware');

// Import validator schemas
const {
  idParamSchema,
  discussionIdParamSchema,
  restoreSchema,
  bulkIdsSchema,
  createDiscussionSchema,
  updateDiscussionSchema,
  discussionListQuerySchema,
  createDiscussionReplySchema,
  updateDiscussionReplySchema,
  discussionReplyListQuerySchema,
  createDiscussionVoteSchema,
  updateDiscussionVoteSchema,
  discussionVoteListQuerySchema,
} = require('../validators/discussionManagement.validator');

const router = Router();
router.use(authenticate);

// ============================================================================
// DISCUSSIONS (permission: discussion.*)
// ============================================================================

/**
 * GET /discussion-management/discussions
 * Retrieves list of discussions with filtering and pagination
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {number} courseId - Filter by course ID
 * @query {number} chapterId - Filter by chapter ID
 * @query {number} userId - Filter by user ID
 * @query {string} discussionType - Filter by type (question, discussion)
 * @query {boolean} isPinned - Filter by pinned status
 * @query {boolean} isResolved - Filter by resolved status
 * @query {boolean} isActive - Filter by active status
 * @query {string} searchTerm - Search in title, body, and user email
 * @query {string} sortBy - Sort column (default: created_at)
 * @query {string} sortDir - Sort direction (ASC or DESC, default: DESC)
 */
router.get(
  '/discussions',
  authorize('discussion.read'),
  validate(discussionListQuerySchema, 'query'),
  ctrl.getDiscussions,
);

/**
 * GET /discussion-management/discussions/thread
 * Retrieves hierarchical JSON structure with discussions and nested replies
 * @query {number} courseId - Filter by course ID (optional)
 */
router.get(
  '/discussions/thread',
  authorize('discussion.read'),
  ctrl.getDiscussionThread,
);

/**
 * POST /discussion-management/discussions/bulk-delete
 * Soft deletes multiple discussions in bulk (cascades to replies and votes)
 * @body {Array<number>} ids - Array of discussion IDs to delete
 */
router.post(
  '/discussions/bulk-delete',
  authorize('discussion.delete'),
  validate(bulkIdsSchema),
  ctrl.bulkDeleteDiscussions,
);

/**
 * POST /discussion-management/discussions/bulk-restore
 * Restores multiple deleted discussions in bulk (cascades to replies and votes)
 * @body {Array<number>} ids - Array of discussion IDs to restore
 */
router.post(
  '/discussions/bulk-restore',
  authorize('discussion.update'),
  validate(bulkIdsSchema),
  ctrl.bulkRestoreDiscussions,
);

/**
 * GET /discussion-management/discussions/:id
 * Retrieves a single discussion by ID
 * @param {number} id - Discussion ID
 */
router.get(
  '/discussions/:id',
  authorize('discussion.read'),
  validate(idParamSchema, 'params'),
  ctrl.getDiscussionById,
);

/**
 * POST /discussion-management/discussions
 * Creates a new discussion
 * @body {number} courseId - Course ID (required)
 * @body {number} chapterId - Chapter ID (optional, null = course-level)
 * @body {string} discussionType - Type: question or discussion (default: question)
 * @body {string} title - Discussion title (required)
 * @body {string} body - Discussion body (required)
 * @body {boolean} isPinned - Pin flag (default: false)
 * @body {boolean} isResolved - Resolved flag (default: false)
 */
router.post(
  '/discussions',
  authorize('discussion.create'),
  validate(createDiscussionSchema),
  ctrl.createDiscussion,
);

/**
 * PATCH /discussion-management/discussions/:id
 * Updates an existing discussion
 * @param {number} id - Discussion ID
 * @body {string} title - Discussion title (optional)
 * @body {string} body - Discussion body (optional)
 * @body {number} chapterId - Chapter ID (optional)
 * @body {string} discussionType - Type: question or discussion (optional)
 * @body {boolean} isPinned - Pin flag (optional)
 * @body {boolean} isResolved - Resolved flag (optional)
 * @body {number} upvoteCount - Upvote count (optional)
 * @body {number} replyCount - Reply count (optional)
 */
router.patch(
  '/discussions/:id',
  authorize('discussion.update'),
  validate(idParamSchema, 'params'),
  validate(updateDiscussionSchema),
  ctrl.updateDiscussion,
);

/**
 * DELETE /discussion-management/discussions/:id
 * Soft deletes a single discussion (cascades to replies and votes)
 * @param {number} id - Discussion ID
 */
router.delete(
  '/discussions/:id',
  authorize('discussion.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteDiscussion,
);

/**
 * POST /discussion-management/discussions/:id/restore
 * Restores a single deleted discussion (cascades to replies and votes)
 * @param {number} id - Discussion ID
 */
router.post(
  '/discussions/:id/restore',
  authorize('discussion.update'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreDiscussion,
);

// ============================================================================
// DISCUSSION REPLIES (permission: discussion_reply.*)
// ============================================================================

/**
 * POST /discussion-management/replies/bulk-delete
 * Soft deletes multiple discussion replies in bulk
 * @body {Array<number>} ids - Array of reply IDs to delete
 */
router.post(
  '/replies/bulk-delete',
  authorize('discussion_reply.delete'),
  validate(bulkIdsSchema),
  ctrl.bulkDeleteDiscussionReplies,
);

/**
 * POST /discussion-management/replies/bulk-restore
 * Restores multiple deleted discussion replies in bulk
 * @body {Array<number>} ids - Array of reply IDs to restore
 */
router.post(
  '/replies/bulk-restore',
  authorize('discussion_reply.update'),
  validate(bulkIdsSchema),
  ctrl.bulkRestoreDiscussionReplies,
);

/**
 * GET /discussion-management/discussions/:discussionId/replies
 * Retrieves list of replies for a specific discussion
 * @param {number} discussionId - Discussion ID
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {number} parentReplyId - Filter by parent reply ID (nested replies)
 * @query {number} userId - Filter by user ID
 * @query {boolean} isAcceptedAnswer - Filter by accepted answer status
 * @query {string} searchTerm - Search in reply body and user email
 * @query {string} sortBy - Sort column (default: created_at)
 * @query {string} sortDir - Sort direction (ASC or DESC, default: ASC)
 */
router.get(
  '/discussions/:discussionId/replies',
  authorize('discussion_reply.read'),
  validate(discussionIdParamSchema, 'params'),
  validate(discussionReplyListQuerySchema, 'query'),
  ctrl.getDiscussionReplies,
);

/**
 * POST /discussion-management/discussions/:discussionId/replies
 * Creates a new reply to a discussion
 * @param {number} discussionId - Discussion ID
 * @body {string} body - Reply body (required)
 * @body {number} parentReplyId - Parent reply ID for nested replies (optional)
 * @body {boolean} isAcceptedAnswer - Accepted answer flag (default: false)
 */
router.post(
  '/discussions/:discussionId/replies',
  authorize('discussion_reply.create'),
  validate(discussionIdParamSchema, 'params'),
  validate(createDiscussionReplySchema),
  ctrl.createDiscussionReply,
);

/**
 * GET /discussion-management/replies/:id
 * Retrieves a single reply by ID
 * @param {number} id - Reply ID
 */
router.get(
  '/replies/:id',
  authorize('discussion_reply.read'),
  validate(idParamSchema, 'params'),
  ctrl.getDiscussionReplyById,
);

/**
 * PATCH /discussion-management/replies/:id
 * Updates an existing discussion reply
 * @param {number} id - Reply ID
 * @body {string} body - Reply body (optional)
 * @body {number} parentReplyId - Parent reply ID (optional)
 * @body {boolean} isAcceptedAnswer - Accepted answer flag (optional)
 * @body {number} upvoteCount - Upvote count (optional)
 */
router.patch(
  '/replies/:id',
  authorize('discussion_reply.update'),
  validate(idParamSchema, 'params'),
  validate(updateDiscussionReplySchema),
  ctrl.updateDiscussionReply,
);

/**
 * DELETE /discussion-management/replies/:id
 * Soft deletes a single discussion reply
 * @param {number} id - Reply ID
 */
router.delete(
  '/replies/:id',
  authorize('discussion_reply.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteDiscussionReply,
);

/**
 * POST /discussion-management/replies/:id/restore
 * Restores a single deleted discussion reply
 * @param {number} id - Reply ID
 */
router.post(
  '/replies/:id/restore',
  authorize('discussion_reply.update'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreDiscussionReply,
);

// ============================================================================
// DISCUSSION VOTES (permission: discussion_vote.*)
// ============================================================================

/**
 * GET /discussion-management/votes
 * Retrieves list of votes with filtering and pagination
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {number} userId - Filter by user ID
 * @query {string} voteableType - Filter by voteable type (discussion, reply)
 * @query {number} discussionId - Filter by discussion ID
 * @query {number} replyId - Filter by reply ID
 * @query {string} voteType - Filter by vote type (upvote, downvote)
 * @query {string} sortBy - Sort column (default: created_at)
 * @query {string} sortDir - Sort direction (ASC or DESC, default: DESC)
 */
router.get(
  '/votes',
  authorize('discussion_vote.read'),
  validate(discussionVoteListQuerySchema, 'query'),
  ctrl.getDiscussionVotes,
);

/**
 * GET /discussion-management/votes/:id
 * Retrieves a single vote by ID
 * @param {number} id - Vote ID
 */
router.get(
  '/votes/:id',
  authorize('discussion_vote.read'),
  validate(idParamSchema, 'params'),
  ctrl.getDiscussionVoteById,
);

/**
 * POST /discussion-management/votes
 * Creates a new vote on a discussion or reply
 * @body {string} voteableType - Target type: discussion or reply (required)
 * @body {string} voteType - Vote type: upvote or downvote (required)
 * @body {number} discussionId - Discussion ID (required when voteableType=discussion)
 * @body {number} replyId - Reply ID (required when voteableType=reply)
 */
router.post(
  '/votes',
  authorize('discussion_vote.create'),
  validate(createDiscussionVoteSchema),
  ctrl.createDiscussionVote,
);

/**
 * PATCH /discussion-management/votes/:id
 * Updates an existing vote (toggle vote type)
 * @param {number} id - Vote ID
 * @body {string} voteType - New vote type: upvote or downvote (optional)
 */
router.patch(
  '/votes/:id',
  authorize('discussion_vote.update'),
  validate(idParamSchema, 'params'),
  validate(updateDiscussionVoteSchema),
  ctrl.updateDiscussionVote,
);

/**
 * DELETE /discussion-management/votes/:id
 * Soft deletes a single discussion vote
 * @param {number} id - Vote ID
 */
router.delete(
  '/votes/:id',
  authorize('discussion_vote.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteDiscussionVote,
);

/**
 * POST /discussion-management/votes/:id/restore
 * Restores a single deleted discussion vote
 * @param {number} id - Vote ID
 */
router.post(
  '/votes/:id/restore',
  authorize('discussion_vote.update'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreDiscussionVote,
);

module.exports = router;
