/**
 * ═══════════════════════════════════════════════════════════════
 * DISCUSSION MANAGEMENT REPOSITORY — Database Layer (Supabase RPC)
 * ═══════════════════════════════════════════════════════════════
 * Handles discussion, reply, and vote operations via stored procedures:
 *
 *   DISCUSSIONS:
 *     udf_get_discussions           — FUNCTION (read, search, filter, paginate)
 *     udfj_getdiscussions           — FUNCTION (hierarchical JSON with nested replies)
 *     sp_discussions_insert          — FUNCTION (create discussion, returns new id)
 *     sp_discussions_update          — FUNCTION (update discussion, returns void)
 *     sp_discussions_delete          — FUNCTION (soft delete with cascade, returns void)
 *     sp_discussions_restore         — FUNCTION (restore with cascade, returns void)
 *
 *   DISCUSSION REPLIES:
 *     udf_get_discussion_replies    — FUNCTION (read, search, filter, paginate)
 *     sp_discussion_replies_insert   — FUNCTION (create reply, returns new id)
 *     sp_discussion_replies_update   — FUNCTION (update reply, returns void)
 *     sp_discussion_replies_delete   — FUNCTION (soft delete, returns void)
 *     sp_discussion_replies_restore  — FUNCTION (restore, returns void)
 *
 *   DISCUSSION VOTES:
 *     udf_get_discussion_votes      — FUNCTION (read, filter, paginate)
 *     sp_discussion_votes_insert     — FUNCTION (create vote, returns new id)
 *     sp_discussion_votes_update     — FUNCTION (update vote type, returns void)
 *     sp_discussion_votes_delete     — FUNCTION (soft delete, returns void)
 *     sp_discussion_votes_restore    — FUNCTION (restore, returns void)
 * ═══════════════════════════════════════════════════════════════
 */

const { supabase } = require('../config/database');
const logger = require('../config/logger');

class DiscussionManagementRepository {
  // ═════════════════════════════════════════════════════════════
  //  DISCUSSIONS
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // READ — via udf_get_discussions
  // ─────────────────────────────────────────────────────────────

  /**
   * getDiscussions
   * Fetches a list of discussions with filtering, sorting, and pagination
   * @param {Object} options
   * @returns {Array} discussions with pagination metadata (total_count)
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
        sortColumn = 'created_at',
        sortDirection = 'DESC',
        pageIndex = 1,
        pageSize = 20,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_discussions', {
        p_course_id: courseId,
        p_chapter_id: chapterId,
        p_user_id: userId,
        p_discussion_type: discussionType,
        p_is_pinned: isPinned,
        p_is_resolved: isResolved,
        p_status: isActive,
        p_search_term: searchTerm,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_page_index: pageIndex,
        p_page_size: pageSize,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching discussions: ${err.message}`);
      throw err;
    }
  }

  /**
   * findDiscussionById
   * Fetches a single discussion by ID
   * @param {number} id
   * @returns {Object|null} discussion or null
   */
  async findDiscussionById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_discussions', {
        p_course_id: null,
        p_chapter_id: null,
        p_user_id: null,
        p_discussion_type: null,
        p_is_pinned: null,
        p_is_resolved: null,
        p_status: null,
        p_search_term: null,
        p_sort_column: 'id',
        p_sort_direction: 'ASC',
        p_page_index: 1,
        p_page_size: 10000,
      });

      if (error) throw error;

      const result = data?.find((d) => d.d_id === Number(id));
      return result || null;
    } catch (err) {
      logger.error(`Error finding discussion by ID: ${err.message}`);
      throw err;
    }
  }

  /**
   * getDiscussionThread
   * Fetches hierarchical JSON structure with discussions and nested replies
   * @param {number|null} courseId - optional course filter
   * @returns {Object} JSONB array of discussions with nested replies
   */
  async getDiscussionThread(courseId = null) {
    try {
      const { data, error } = await supabase.rpc('udfj_getdiscussions', {
        p_course_id: courseId,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching discussion thread: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — via sp_discussions_insert
  // ─────────────────────────────────────────────────────────────

  /**
   * createDiscussion
   * Creates a new discussion
   * @param {Object} payload
   * @returns {Object} created discussion
   */
  async createDiscussion(payload) {
    try {
      const {
        courseId,
        userId,
        title,
        body,
        chapterId = null,
        discussionType = 'question',
        isPinned = false,
        isResolved = false,
        createdBy = null,
      } = payload;

      const { data: newId, error } = await supabase.rpc('sp_discussions_insert', {
        p_course_id: courseId,
        p_user_id: userId,
        p_title: title,
        p_body: body,
        p_chapter_id: chapterId,
        p_discussion_type: discussionType,
        p_is_pinned: isPinned,
        p_is_resolved: isResolved,
        p_created_by: createdBy,
      });

      if (error) throw error;

      logger.info(`Discussion created: id=${newId}, course=${courseId}, user=${userId}`);

      const newDiscussion = await this.findDiscussionById(newId);
      if (!newDiscussion) {
        throw new Error(`Discussion created (id: ${newId}) but could not be fetched`);
      }

      return newDiscussion;
    } catch (err) {
      logger.error(`Error creating discussion: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — via sp_discussions_update
  // ─────────────────────────────────────────────────────────────

  /**
   * updateDiscussion
   * Updates an existing discussion
   * @param {number} id
   * @param {Object} payload
   * @returns {Object} updated discussion record
   */
  async updateDiscussion(id, payload) {
    try {
      const {
        title = null,
        body = null,
        chapterId = null,
        discussionType = null,
        isPinned = null,
        isResolved = null,
        upvoteCount = null,
        replyCount = null,
        updatedBy = null,
      } = payload;

      const { error } = await supabase.rpc('sp_discussions_update', {
        p_id: id,
        p_title: title,
        p_body: body,
        p_chapter_id: chapterId,
        p_discussion_type: discussionType,
        p_is_pinned: isPinned,
        p_is_resolved: isResolved,
        p_upvote_count: upvoteCount,
        p_reply_count: replyCount,
        p_updated_by: updatedBy,
      });

      if (error) throw error;

      logger.info(`Discussion updated: id=${id}`);

      const updated = await this.findDiscussionById(id);
      if (!updated) {
        throw new Error(`Discussion updated but could not be fetched`);
      }

      return updated;
    } catch (err) {
      logger.error(`Error updating discussion ${id}: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — via sp_discussions_delete (cascading)
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteDiscussion
   * Soft delete a single discussion (cascades to replies and votes)
   * @param {number} id
   * @returns {void}
   */
  async deleteDiscussion(id) {
    try {
      const { error } = await supabase.rpc('sp_discussions_delete', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Discussion deleted: id=${id}`);
    } catch (err) {
      logger.error(`Error deleting discussion ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteDiscussions
   * Soft delete multiple discussions (bulk)
   * @param {Array<number>} ids
   * @returns {void}
   */
  async deleteDiscussions(ids) {
    try {
      if (!ids || ids.length === 0) {
        throw new Error('No discussion IDs provided for deletion');
      }

      for (const id of ids) {
        await this.deleteDiscussion(id);
      }

      logger.info(`Discussions deleted (bulk): ${ids.length} discussions deleted`);
    } catch (err) {
      logger.error(`Error deleting discussions: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — via sp_discussions_restore (cascading)
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreDiscussion
   * Restore a single deleted discussion (cascades to replies and votes)
   * @param {number} id
   * @returns {void}
   */
  async restoreDiscussion(id) {
    try {
      const { error } = await supabase.rpc('sp_discussions_restore', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Discussion restored: id=${id}`);
    } catch (err) {
      logger.error(`Error restoring discussion ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreDiscussions
   * Restore multiple deleted discussions (bulk)
   * @param {Array<number>} ids
   * @returns {void}
   */
  async restoreDiscussions(ids) {
    try {
      if (!ids || ids.length === 0) {
        throw new Error('No discussion IDs provided for restoration');
      }

      for (const id of ids) {
        await this.restoreDiscussion(id);
      }

      logger.info(`Discussions restored (bulk): ${ids.length} discussions restored`);
    } catch (err) {
      logger.error(`Error restoring discussions: ${err.message}`);
      throw err;
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  DISCUSSION REPLIES
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // READ — via udf_get_discussion_replies
  // ─────────────────────────────────────────────────────────────

  /**
   * getDiscussionReplies
   * Fetches a list of replies with filtering, sorting, and pagination
   * @param {Object} options
   * @returns {Array} replies with pagination metadata (total_count)
   */
  async getDiscussionReplies(options = {}) {
    try {
      const {
        discussionId = null,
        parentReplyId = null,
        userId = null,
        isAcceptedAnswer = null,
        searchTerm = null,
        sortColumn = 'created_at',
        sortDirection = 'ASC',
        pageIndex = 1,
        pageSize = 20,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_discussion_replies', {
        p_discussion_id: discussionId,
        p_parent_reply_id: parentReplyId,
        p_user_id: userId,
        p_is_accepted_answer: isAcceptedAnswer,
        p_search_term: searchTerm,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_page_index: pageIndex,
        p_page_size: pageSize,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching discussion replies: ${err.message}`);
      throw err;
    }
  }

  /**
   * findDiscussionReplyById
   * Fetches a single reply by ID
   * @param {number} id
   * @returns {Object|null} reply or null
   */
  async findDiscussionReplyById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_discussion_replies', {
        p_discussion_id: null,
        p_parent_reply_id: null,
        p_user_id: null,
        p_is_accepted_answer: null,
        p_search_term: null,
        p_sort_column: 'id',
        p_sort_direction: 'ASC',
        p_page_index: 1,
        p_page_size: 10000,
      });

      if (error) throw error;

      const result = data?.find((r) => r.dr_id === Number(id));
      return result || null;
    } catch (err) {
      logger.error(`Error finding discussion reply by ID: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — via sp_discussion_replies_insert
  // ─────────────────────────────────────────────────────────────

  /**
   * createDiscussionReply
   * Creates a new discussion reply
   * @param {Object} payload
   * @returns {Object} created reply
   */
  async createDiscussionReply(payload) {
    try {
      const {
        discussionId,
        userId,
        body,
        parentReplyId = null,
        isAcceptedAnswer = false,
        createdBy = null,
      } = payload;

      const { data: newId, error } = await supabase.rpc('sp_discussion_replies_insert', {
        p_discussion_id: discussionId,
        p_user_id: userId,
        p_body: body,
        p_parent_reply_id: parentReplyId,
        p_is_accepted_answer: isAcceptedAnswer,
        p_created_by: createdBy,
      });

      if (error) throw error;

      logger.info(`Discussion reply created: id=${newId}, discussion=${discussionId}, user=${userId}`);

      const newReply = await this.findDiscussionReplyById(newId);
      if (!newReply) {
        throw new Error(`Discussion reply created (id: ${newId}) but could not be fetched`);
      }

      return newReply;
    } catch (err) {
      logger.error(`Error creating discussion reply: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — via sp_discussion_replies_update
  // ─────────────────────────────────────────────────────────────

  /**
   * updateDiscussionReply
   * Updates an existing discussion reply
   * @param {number} id
   * @param {Object} payload
   * @returns {Object} updated reply record
   */
  async updateDiscussionReply(id, payload) {
    try {
      const {
        body = null,
        parentReplyId = null,
        isAcceptedAnswer = null,
        upvoteCount = null,
        updatedBy = null,
      } = payload;

      const { error } = await supabase.rpc('sp_discussion_replies_update', {
        p_id: id,
        p_body: body,
        p_parent_reply_id: parentReplyId,
        p_is_accepted_answer: isAcceptedAnswer,
        p_upvote_count: upvoteCount,
        p_updated_by: updatedBy,
      });

      if (error) throw error;

      logger.info(`Discussion reply updated: id=${id}`);

      const updated = await this.findDiscussionReplyById(id);
      if (!updated) {
        throw new Error(`Discussion reply updated but could not be fetched`);
      }

      return updated;
    } catch (err) {
      logger.error(`Error updating discussion reply ${id}: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — via sp_discussion_replies_delete
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteDiscussionReply
   * Soft delete a single discussion reply
   * @param {number} id
   * @returns {void}
   */
  async deleteDiscussionReply(id) {
    try {
      const { error } = await supabase.rpc('sp_discussion_replies_delete', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Discussion reply deleted: id=${id}`);
    } catch (err) {
      logger.error(`Error deleting discussion reply ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteDiscussionReplies
   * Soft delete multiple discussion replies (bulk)
   * @param {Array<number>} ids
   * @returns {void}
   */
  async deleteDiscussionReplies(ids) {
    try {
      if (!ids || ids.length === 0) {
        throw new Error('No reply IDs provided for deletion');
      }

      for (const id of ids) {
        await this.deleteDiscussionReply(id);
      }

      logger.info(`Discussion replies deleted (bulk): ${ids.length} replies deleted`);
    } catch (err) {
      logger.error(`Error deleting discussion replies: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — via sp_discussion_replies_restore
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreDiscussionReply
   * Restore a single deleted discussion reply
   * @param {number} id
   * @returns {void}
   */
  async restoreDiscussionReply(id) {
    try {
      const { error } = await supabase.rpc('sp_discussion_replies_restore', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Discussion reply restored: id=${id}`);
    } catch (err) {
      logger.error(`Error restoring discussion reply ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreDiscussionReplies
   * Restore multiple deleted discussion replies (bulk)
   * @param {Array<number>} ids
   * @returns {void}
   */
  async restoreDiscussionReplies(ids) {
    try {
      if (!ids || ids.length === 0) {
        throw new Error('No reply IDs provided for restoration');
      }

      for (const id of ids) {
        await this.restoreDiscussionReply(id);
      }

      logger.info(`Discussion replies restored (bulk): ${ids.length} replies restored`);
    } catch (err) {
      logger.error(`Error restoring discussion replies: ${err.message}`);
      throw err;
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  DISCUSSION VOTES
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // READ — via udf_get_discussion_votes
  // ─────────────────────────────────────────────────────────────

  /**
   * getDiscussionVotes
   * Fetches a list of votes with filtering, sorting, and pagination
   * @param {Object} options
   * @returns {Array} votes with pagination metadata (total_count)
   */
  async getDiscussionVotes(options = {}) {
    try {
      const {
        userId = null,
        voteableType = null,
        discussionId = null,
        replyId = null,
        voteType = null,
        sortColumn = 'created_at',
        sortDirection = 'DESC',
        pageIndex = 1,
        pageSize = 20,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_discussion_votes', {
        p_user_id: userId,
        p_voteable_type: voteableType,
        p_discussion_id: discussionId,
        p_reply_id: replyId,
        p_vote_type: voteType,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_page_index: pageIndex,
        p_page_size: pageSize,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching discussion votes: ${err.message}`);
      throw err;
    }
  }

  /**
   * findDiscussionVoteById
   * Fetches a single vote by ID
   * @param {number} id
   * @returns {Object|null} vote or null
   */
  async findDiscussionVoteById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_discussion_votes', {
        p_user_id: null,
        p_voteable_type: null,
        p_discussion_id: null,
        p_reply_id: null,
        p_vote_type: null,
        p_sort_column: 'id',
        p_sort_direction: 'ASC',
        p_page_index: 1,
        p_page_size: 10000,
      });

      if (error) throw error;

      const result = data?.find((v) => v.dv_id === Number(id));
      return result || null;
    } catch (err) {
      logger.error(`Error finding discussion vote by ID: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — via sp_discussion_votes_insert
  // ─────────────────────────────────────────────────────────────

  /**
   * createDiscussionVote
   * Creates a new discussion vote
   * @param {Object} payload
   * @returns {Object} created vote
   */
  async createDiscussionVote(payload) {
    try {
      const {
        userId,
        voteableType,
        voteType,
        discussionId = null,
        replyId = null,
        createdBy = null,
      } = payload;

      const { data: newId, error } = await supabase.rpc('sp_discussion_votes_insert', {
        p_user_id: userId,
        p_voteable_type: voteableType,
        p_vote_type: voteType,
        p_discussion_id: discussionId,
        p_reply_id: replyId,
        p_created_by: createdBy,
      });

      if (error) throw error;

      logger.info(`Discussion vote created: id=${newId}, type=${voteableType}, vote=${voteType}`);

      const newVote = await this.findDiscussionVoteById(newId);
      if (!newVote) {
        throw new Error(`Discussion vote created (id: ${newId}) but could not be fetched`);
      }

      return newVote;
    } catch (err) {
      logger.error(`Error creating discussion vote: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — via sp_discussion_votes_update
  // ─────────────────────────────────────────────────────────────

  /**
   * updateDiscussionVote
   * Updates an existing discussion vote (toggle vote type)
   * @param {number} id
   * @param {Object} payload
   * @returns {Object} updated vote record
   */
  async updateDiscussionVote(id, payload) {
    try {
      const { voteType = null, updatedBy = null } = payload;

      const { error } = await supabase.rpc('sp_discussion_votes_update', {
        p_id: id,
        p_vote_type: voteType,
        p_updated_by: updatedBy,
      });

      if (error) throw error;

      logger.info(`Discussion vote updated: id=${id}`);

      const updated = await this.findDiscussionVoteById(id);
      if (!updated) {
        throw new Error(`Discussion vote updated but could not be fetched`);
      }

      return updated;
    } catch (err) {
      logger.error(`Error updating discussion vote ${id}: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — via sp_discussion_votes_delete
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteDiscussionVote
   * Soft delete a single discussion vote
   * @param {number} id
   * @returns {void}
   */
  async deleteDiscussionVote(id) {
    try {
      const { error } = await supabase.rpc('sp_discussion_votes_delete', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Discussion vote deleted: id=${id}`);
    } catch (err) {
      logger.error(`Error deleting discussion vote ${id}: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — via sp_discussion_votes_restore
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreDiscussionVote
   * Restore a single deleted discussion vote
   * @param {number} id
   * @returns {void}
   */
  async restoreDiscussionVote(id) {
    try {
      const { error } = await supabase.rpc('sp_discussion_votes_restore', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Discussion vote restored: id=${id}`);
    } catch (err) {
      logger.error(`Error restoring discussion vote ${id}: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new DiscussionManagementRepository();
