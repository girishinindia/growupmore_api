const discussionManagementRepository = require('../repositories/discussionManagement.repository');
const logger = require('../config/logger');
const { BadRequestError, NotFoundError } = require('../utils/errors');

class DiscussionManagementService {
  // ═════════════════════════════════════════════════════════════
  //  DISCUSSIONS
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // LIST — Discussions
  // ─────────────────────────────────────────────────────────────

  /**
   * getDiscussions
   * Fetches a list of discussions with filtering and pagination
   * @param {Object} options
   * @returns {Array} discussions with pagination metadata
   */
  async getDiscussions(options = {}) {
    try {
      const {
        courseId = null,
        chapterId = null,
        userId = null,
        discussionType = null,
        isPinned = null,
        isResolved = null,
        isActive = null,
        searchTerm = null,
        sortBy = 'created_at',
        sortDir = 'DESC',
        page = 1,
        limit = 20,
      } = options;

      const repoOptions = {
        courseId,
        chapterId,
        userId,
        discussionType,
        isPinned,
        isResolved,
        isActive,
        searchTerm,
        sortColumn: sortBy,
        sortDirection: sortDir,
        pageIndex: page - 1,
        pageSize: limit,
      };

      return await discussionManagementRepository.getDiscussions(repoOptions);
    } catch (error) {
      logger.error('Error fetching discussions:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // READ — Single Discussion by ID
  // ─────────────────────────────────────────────────────────────

  /**
   * getDiscussionById
   * Fetches a single discussion by ID
   * @param {number} id
   * @returns {Object} discussion
   */
  async getDiscussionById(id) {
    try {
      if (!id) throw new BadRequestError('Discussion ID is required');

      const result = await discussionManagementRepository.findDiscussionById(id);
      if (!result) throw new NotFoundError('Discussion not found');

      return result;
    } catch (error) {
      logger.error(`Error fetching discussion ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // READ — Discussion Thread (hierarchical JSON)
  // ─────────────────────────────────────────────────────────────

  /**
   * getDiscussionThread
   * Fetches hierarchical JSON structure with discussions and nested replies
   * @param {number|null} courseId
   * @returns {Object} JSONB array of discussions with nested replies
   */
  async getDiscussionThread(courseId = null) {
    try {
      return await discussionManagementRepository.getDiscussionThread(courseId);
    } catch (error) {
      logger.error('Error fetching discussion thread:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — New Discussion
  // ─────────────────────────────────────────────────────────────

  /**
   * createDiscussion
   * Creates a new discussion
   * @param {Object} discussionData
   * @param {number} actingUserId
   * @returns {Object} created discussion
   */
  async createDiscussion(discussionData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!discussionData.courseId) throw new BadRequestError('Course ID is required');
      if (!discussionData.title) throw new BadRequestError('Title is required');
      if (!discussionData.body) throw new BadRequestError('Body is required');

      const payload = {
        ...discussionData,
        userId: actingUserId,
        createdBy: actingUserId,
      };

      const created = await discussionManagementRepository.createDiscussion(payload);
      logger.info(`Discussion created: ${created.d_id}`, { createdBy: actingUserId });

      return created;
    } catch (error) {
      logger.error('Error creating discussion:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — Existing Discussion
  // ─────────────────────────────────────────────────────────────

  /**
   * updateDiscussion
   * Updates an existing discussion
   * @param {number} id
   * @param {Object} updates
   * @param {number} actingUserId
   * @returns {Object} updated discussion
   */
  async updateDiscussion(id, updates, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Discussion ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await discussionManagementRepository.findDiscussionById(id);
      if (!existing) throw new NotFoundError('Discussion not found');

      const payload = {
        ...updates,
        updatedBy: actingUserId,
      };

      const updated = await discussionManagementRepository.updateDiscussion(id, payload);
      logger.info(`Discussion updated: ${id}`, { updatedBy: actingUserId });

      return updated;
    } catch (error) {
      logger.error(`Error updating discussion ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — Single Discussion
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteDiscussion
   * Soft deletes a single discussion (cascades to replies and votes)
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async deleteDiscussion(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Discussion ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await discussionManagementRepository.findDiscussionById(id);
      if (!existing) throw new NotFoundError('Discussion not found');

      await discussionManagementRepository.deleteDiscussion(id);
      logger.info(`Discussion deleted: ${id}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting discussion ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BULK DELETE — Multiple Discussions
  // ─────────────────────────────────────────────────────────────

  /**
   * bulkDeleteDiscussions
   * Soft deletes multiple discussions in bulk
   * @param {Array<number>} ids
   * @param {number} actingUserId
   * @returns {void}
   */
  async bulkDeleteDiscussions(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('At least one discussion ID is required');
      }
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await discussionManagementRepository.deleteDiscussions(ids);
      logger.info(`Discussions bulk deleted: ${ids.length} discussions`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error('Error bulk deleting discussions:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — Single Discussion
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreDiscussion
   * Restores a single deleted discussion (cascades to replies and votes)
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async restoreDiscussion(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Discussion ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await discussionManagementRepository.restoreDiscussion(id);
      logger.info(`Discussion restored: ${id}`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error(`Error restoring discussion ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BULK RESTORE — Multiple Discussions
  // ─────────────────────────────────────────────────────────────

  /**
   * bulkRestoreDiscussions
   * Restores multiple deleted discussions in bulk
   * @param {Array<number>} ids
   * @param {number} actingUserId
   * @returns {void}
   */
  async bulkRestoreDiscussions(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('At least one discussion ID is required');
      }
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await discussionManagementRepository.restoreDiscussions(ids);
      logger.info(`Discussions bulk restored: ${ids.length} discussions`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error('Error bulk restoring discussions:', error);
      throw error;
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  DISCUSSION REPLIES
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // LIST — Discussion Replies
  // ─────────────────────────────────────────────────────────────

  /**
   * getDiscussionReplies
   * Fetches a list of replies for a discussion with filtering and pagination
   * @param {number} discussionId
   * @param {Object} options
   * @returns {Array} replies with pagination metadata
   */
  async getDiscussionReplies(discussionId, options = {}) {
    try {
      const {
        parentReplyId = null,
        userId = null,
        isAcceptedAnswer = null,
        searchTerm = null,
        sortBy = 'created_at',
        sortDir = 'ASC',
        page = 1,
        limit = 20,
      } = options;

      const repoOptions = {
        discussionId,
        parentReplyId,
        userId,
        isAcceptedAnswer,
        searchTerm,
        sortColumn: sortBy,
        sortDirection: sortDir,
        pageIndex: page - 1,
        pageSize: limit,
      };

      return await discussionManagementRepository.getDiscussionReplies(repoOptions);
    } catch (error) {
      logger.error('Error fetching discussion replies:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // READ — Single Reply by ID
  // ─────────────────────────────────────────────────────────────

  /**
   * getDiscussionReplyById
   * Fetches a single reply by ID
   * @param {number} id
   * @returns {Object} reply
   */
  async getDiscussionReplyById(id) {
    try {
      if (!id) throw new BadRequestError('Reply ID is required');

      const result = await discussionManagementRepository.findDiscussionReplyById(id);
      if (!result) throw new NotFoundError('Discussion reply not found');

      return result;
    } catch (error) {
      logger.error(`Error fetching discussion reply ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — New Reply
  // ─────────────────────────────────────────────────────────────

  /**
   * createDiscussionReply
   * Creates a new discussion reply
   * @param {number} discussionId
   * @param {Object} replyData
   * @param {number} actingUserId
   * @returns {Object} created reply
   */
  async createDiscussionReply(discussionId, replyData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!discussionId) throw new BadRequestError('Discussion ID is required');
      if (!replyData.body) throw new BadRequestError('Body is required');

      // Validate discussion exists
      const discussion = await discussionManagementRepository.findDiscussionById(discussionId);
      if (!discussion) throw new NotFoundError('Discussion not found');

      const payload = {
        ...replyData,
        discussionId: Number(discussionId),
        userId: actingUserId,
        createdBy: actingUserId,
      };

      const created = await discussionManagementRepository.createDiscussionReply(payload);
      logger.info(`Discussion reply created: ${created.dr_id}`, { createdBy: actingUserId });

      return created;
    } catch (error) {
      logger.error('Error creating discussion reply:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — Existing Reply
  // ─────────────────────────────────────────────────────────────

  /**
   * updateDiscussionReply
   * Updates an existing discussion reply
   * @param {number} id
   * @param {Object} updates
   * @param {number} actingUserId
   * @returns {Object} updated reply
   */
  async updateDiscussionReply(id, updates, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Reply ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await discussionManagementRepository.findDiscussionReplyById(id);
      if (!existing) throw new NotFoundError('Discussion reply not found');

      const payload = {
        ...updates,
        updatedBy: actingUserId,
      };

      const updated = await discussionManagementRepository.updateDiscussionReply(id, payload);
      logger.info(`Discussion reply updated: ${id}`, { updatedBy: actingUserId });

      return updated;
    } catch (error) {
      logger.error(`Error updating discussion reply ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — Single Reply
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteDiscussionReply
   * Soft deletes a single discussion reply
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async deleteDiscussionReply(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Reply ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await discussionManagementRepository.findDiscussionReplyById(id);
      if (!existing) throw new NotFoundError('Discussion reply not found');

      await discussionManagementRepository.deleteDiscussionReply(id);
      logger.info(`Discussion reply deleted: ${id}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting discussion reply ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BULK DELETE — Multiple Replies
  // ─────────────────────────────────────────────────────────────

  /**
   * bulkDeleteDiscussionReplies
   * Soft deletes multiple discussion replies in bulk
   * @param {Array<number>} ids
   * @param {number} actingUserId
   * @returns {void}
   */
  async bulkDeleteDiscussionReplies(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('At least one reply ID is required');
      }
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await discussionManagementRepository.deleteDiscussionReplies(ids);
      logger.info(`Discussion replies bulk deleted: ${ids.length} replies`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error('Error bulk deleting discussion replies:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — Single Reply
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreDiscussionReply
   * Restores a single deleted discussion reply
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async restoreDiscussionReply(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Reply ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await discussionManagementRepository.restoreDiscussionReply(id);
      logger.info(`Discussion reply restored: ${id}`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error(`Error restoring discussion reply ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BULK RESTORE — Multiple Replies
  // ─────────────────────────────────────────────────────────────

  /**
   * bulkRestoreDiscussionReplies
   * Restores multiple deleted discussion replies in bulk
   * @param {Array<number>} ids
   * @param {number} actingUserId
   * @returns {void}
   */
  async bulkRestoreDiscussionReplies(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('At least one reply ID is required');
      }
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await discussionManagementRepository.restoreDiscussionReplies(ids);
      logger.info(`Discussion replies bulk restored: ${ids.length} replies`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error('Error bulk restoring discussion replies:', error);
      throw error;
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  DISCUSSION VOTES
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // LIST — Discussion Votes
  // ─────────────────────────────────────────────────────────────

  /**
   * getDiscussionVotes
   * Fetches a list of votes with filtering and pagination
   * @param {Object} options
   * @returns {Array} votes with pagination metadata
   */
  async getDiscussionVotes(options = {}) {
    try {
      const {
        userId = null,
        voteableType = null,
        discussionId = null,
        replyId = null,
        voteType = null,
        sortBy = 'created_at',
        sortDir = 'DESC',
        page = 1,
        limit = 20,
      } = options;

      const repoOptions = {
        userId,
        voteableType,
        discussionId,
        replyId,
        voteType,
        sortColumn: sortBy,
        sortDirection: sortDir,
        pageIndex: page - 1,
        pageSize: limit,
      };

      return await discussionManagementRepository.getDiscussionVotes(repoOptions);
    } catch (error) {
      logger.error('Error fetching discussion votes:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // READ — Single Vote by ID
  // ─────────────────────────────────────────────────────────────

  /**
   * getDiscussionVoteById
   * Fetches a single vote by ID
   * @param {number} id
   * @returns {Object} vote
   */
  async getDiscussionVoteById(id) {
    try {
      if (!id) throw new BadRequestError('Vote ID is required');

      const result = await discussionManagementRepository.findDiscussionVoteById(id);
      if (!result) throw new NotFoundError('Discussion vote not found');

      return result;
    } catch (error) {
      logger.error(`Error fetching discussion vote ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — New Vote
  // ─────────────────────────────────────────────────────────────

  /**
   * createDiscussionVote
   * Creates a new discussion vote
   * @param {Object} voteData
   * @param {number} actingUserId
   * @returns {Object} created vote
   */
  async createDiscussionVote(voteData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!voteData.voteableType) throw new BadRequestError('Voteable type is required');
      if (!voteData.voteType) throw new BadRequestError('Vote type is required');

      const payload = {
        ...voteData,
        userId: actingUserId,
        createdBy: actingUserId,
      };

      const created = await discussionManagementRepository.createDiscussionVote(payload);
      logger.info(`Discussion vote created: ${created.dv_id}`, { createdBy: actingUserId });

      return created;
    } catch (error) {
      logger.error('Error creating discussion vote:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — Existing Vote (toggle)
  // ─────────────────────────────────────────────────────────────

  /**
   * updateDiscussionVote
   * Updates an existing discussion vote (toggle vote type)
   * @param {number} id
   * @param {Object} updates
   * @param {number} actingUserId
   * @returns {Object} updated vote
   */
  async updateDiscussionVote(id, updates, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Vote ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await discussionManagementRepository.findDiscussionVoteById(id);
      if (!existing) throw new NotFoundError('Discussion vote not found');

      const payload = {
        ...updates,
        updatedBy: actingUserId,
      };

      const updated = await discussionManagementRepository.updateDiscussionVote(id, payload);
      logger.info(`Discussion vote updated: ${id}`, { updatedBy: actingUserId });

      return updated;
    } catch (error) {
      logger.error(`Error updating discussion vote ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — Single Vote
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteDiscussionVote
   * Soft deletes a single discussion vote
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async deleteDiscussionVote(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Vote ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await discussionManagementRepository.findDiscussionVoteById(id);
      if (!existing) throw new NotFoundError('Discussion vote not found');

      await discussionManagementRepository.deleteDiscussionVote(id);
      logger.info(`Discussion vote deleted: ${id}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting discussion vote ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — Single Vote
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreDiscussionVote
   * Restores a single deleted discussion vote
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async restoreDiscussionVote(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Vote ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await discussionManagementRepository.restoreDiscussionVote(id);
      logger.info(`Discussion vote restored: ${id}`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error(`Error restoring discussion vote ${id}:`, error);
      throw error;
    }
  }
}

module.exports = new DiscussionManagementService();
