const discussionManagementService = require('../../../services/discussionManagement.service');
const { sendSuccess, sendCreated } = require('../../../utils/response');

class DiscussionManagementController {
  // ═════════════════════════════════════════════════════════════
  //  DISCUSSIONS
  // ═════════════════════════════════════════════════════════════

  /**
   * getDiscussions
   * Retrieves a list of discussions with filtering and pagination
   */
  async getDiscussions(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        courseId,
        chapterId,
        userId,
        discussionType,
        isPinned,
        isResolved,
        isActive,
        searchTerm,
        sortBy,
        sortDir,
      } = req.query;

      const data = await discussionManagementService.getDiscussions({
        courseId: courseId || null,
        chapterId: chapterId || null,
        userId: userId || null,
        discussionType: discussionType || null,
        isPinned: isPinned != null ? isPinned : null,
        isResolved: isResolved != null ? isResolved : null,
        isActive: isActive != null ? isActive : null,
        searchTerm: searchTerm || null,
        sortBy: sortBy || 'created_at',
        sortDir: sortDir || 'DESC',
        page: Number(page),
        limit: Number(limit),
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, { data, message: 'Discussions retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  /**
   * getDiscussionById
   * Retrieves a single discussion by ID
   */
  async getDiscussionById(req, res, next) {
    try {
      const data = await discussionManagementService.getDiscussionById(req.params.id);
      sendSuccess(res, { data, message: 'Discussion retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * getDiscussionThread
   * Retrieves hierarchical JSON structure with discussions and nested replies
   */
  async getDiscussionThread(req, res, next) {
    try {
      const courseId = req.query.courseId || null;
      const data = await discussionManagementService.getDiscussionThread(courseId);
      sendSuccess(res, { data, message: 'Discussion thread retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * createDiscussion
   * Creates a new discussion
   */
  async createDiscussion(req, res, next) {
    try {
      const data = await discussionManagementService.createDiscussion(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Discussion created successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * updateDiscussion
   * Updates an existing discussion
   */
  async updateDiscussion(req, res, next) {
    try {
      const data = await discussionManagementService.updateDiscussion(
        req.params.id,
        req.body,
        req.user.userId,
      );
      sendSuccess(res, { data, message: 'Discussion updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * deleteDiscussion
   * Soft deletes a single discussion (cascades to replies and votes)
   */
  async deleteDiscussion(req, res, next) {
    try {
      await discussionManagementService.deleteDiscussion(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Discussion deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * bulkDeleteDiscussions
   * Soft deletes multiple discussions in bulk
   */
  async bulkDeleteDiscussions(req, res, next) {
    try {
      const { ids } = req.body;
      await discussionManagementService.bulkDeleteDiscussions(ids, req.user.userId);
      sendSuccess(res, { message: 'Discussions deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * restoreDiscussion
   * Restores a single deleted discussion (cascades to replies and votes)
   */
  async restoreDiscussion(req, res, next) {
    try {
      await discussionManagementService.restoreDiscussion(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Discussion restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * bulkRestoreDiscussions
   * Restores multiple deleted discussions in bulk
   */
  async bulkRestoreDiscussions(req, res, next) {
    try {
      const { ids } = req.body;
      await discussionManagementService.bulkRestoreDiscussions(ids, req.user.userId);
      sendSuccess(res, { message: 'Discussions restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  DISCUSSION REPLIES
  // ═════════════════════════════════════════════════════════════

  /**
   * getDiscussionReplies
   * Retrieves a list of replies for a discussion with filtering and pagination
   */
  async getDiscussionReplies(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        parentReplyId,
        userId,
        isAcceptedAnswer,
        searchTerm,
        sortBy,
        sortDir,
      } = req.query;

      const data = await discussionManagementService.getDiscussionReplies(
        req.params.discussionId,
        {
          parentReplyId: parentReplyId || null,
          userId: userId || null,
          isAcceptedAnswer: isAcceptedAnswer != null ? isAcceptedAnswer : null,
          searchTerm: searchTerm || null,
          sortBy: sortBy || 'created_at',
          sortDir: sortDir || 'ASC',
          page: Number(page),
          limit: Number(limit),
        },
      );

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, { data, message: 'Discussion replies retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  /**
   * getDiscussionReplyById
   * Retrieves a single reply by ID
   */
  async getDiscussionReplyById(req, res, next) {
    try {
      const data = await discussionManagementService.getDiscussionReplyById(req.params.id);
      sendSuccess(res, { data, message: 'Discussion reply retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * createDiscussionReply
   * Creates a new reply to a discussion
   */
  async createDiscussionReply(req, res, next) {
    try {
      const data = await discussionManagementService.createDiscussionReply(
        req.params.discussionId,
        req.body,
        req.user.userId,
      );
      sendCreated(res, { data, message: 'Discussion reply created successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * updateDiscussionReply
   * Updates an existing discussion reply
   */
  async updateDiscussionReply(req, res, next) {
    try {
      const data = await discussionManagementService.updateDiscussionReply(
        req.params.id,
        req.body,
        req.user.userId,
      );
      sendSuccess(res, { data, message: 'Discussion reply updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * deleteDiscussionReply
   * Soft deletes a single discussion reply
   */
  async deleteDiscussionReply(req, res, next) {
    try {
      await discussionManagementService.deleteDiscussionReply(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Discussion reply deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * bulkDeleteDiscussionReplies
   * Soft deletes multiple discussion replies in bulk
   */
  async bulkDeleteDiscussionReplies(req, res, next) {
    try {
      const { ids } = req.body;
      await discussionManagementService.bulkDeleteDiscussionReplies(ids, req.user.userId);
      sendSuccess(res, { message: 'Discussion replies deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * restoreDiscussionReply
   * Restores a single deleted discussion reply
   */
  async restoreDiscussionReply(req, res, next) {
    try {
      await discussionManagementService.restoreDiscussionReply(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Discussion reply restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * bulkRestoreDiscussionReplies
   * Restores multiple deleted discussion replies in bulk
   */
  async bulkRestoreDiscussionReplies(req, res, next) {
    try {
      const { ids } = req.body;
      await discussionManagementService.bulkRestoreDiscussionReplies(ids, req.user.userId);
      sendSuccess(res, { message: 'Discussion replies restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  DISCUSSION VOTES
  // ═════════════════════════════════════════════════════════════

  /**
   * getDiscussionVotes
   * Retrieves a list of votes with filtering and pagination
   */
  async getDiscussionVotes(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        userId,
        voteableType,
        discussionId,
        replyId,
        voteType,
        sortBy,
        sortDir,
      } = req.query;

      const data = await discussionManagementService.getDiscussionVotes({
        userId: userId || null,
        voteableType: voteableType || null,
        discussionId: discussionId || null,
        replyId: replyId || null,
        voteType: voteType || null,
        sortBy: sortBy || 'created_at',
        sortDir: sortDir || 'DESC',
        page: Number(page),
        limit: Number(limit),
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, { data, message: 'Discussion votes retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  /**
   * getDiscussionVoteById
   * Retrieves a single vote by ID
   */
  async getDiscussionVoteById(req, res, next) {
    try {
      const data = await discussionManagementService.getDiscussionVoteById(req.params.id);
      sendSuccess(res, { data, message: 'Discussion vote retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * createDiscussionVote
   * Creates a new vote on a discussion or reply
   */
  async createDiscussionVote(req, res, next) {
    try {
      const data = await discussionManagementService.createDiscussionVote(
        req.body,
        req.user.userId,
      );
      sendCreated(res, { data, message: 'Discussion vote created successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * updateDiscussionVote
   * Updates an existing vote (toggle vote type)
   */
  async updateDiscussionVote(req, res, next) {
    try {
      const data = await discussionManagementService.updateDiscussionVote(
        req.params.id,
        req.body,
        req.user.userId,
      );
      sendSuccess(res, { data, message: 'Discussion vote updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * deleteDiscussionVote
   * Soft deletes a single discussion vote
   */
  async deleteDiscussionVote(req, res, next) {
    try {
      await discussionManagementService.deleteDiscussionVote(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Discussion vote deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * restoreDiscussionVote
   * Restores a single deleted discussion vote
   */
  async restoreDiscussionVote(req, res, next) {
    try {
      await discussionManagementService.restoreDiscussionVote(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Discussion vote restored successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DiscussionManagementController();
