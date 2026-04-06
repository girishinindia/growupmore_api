/**
 * ═══════════════════════════════════════════════════════════════
 * BLOG MANAGEMENT REPOSITORY — Database Layer (Supabase RPC)
 * ═══════════════════════════════════════════════════════════════
 * Phase 28: Comprehensive Blog Management System
 *
 * Entity Groups (8 total):
 *   1. BLOG CATEGORIES        — 8 SP + 1 UDF + 1 JSONB
 *   2. BLOGS                  — 8 SP + 1 UDF + 1 JSONB
 *   3. CONTENT BLOCKS         — 8 SP + 1 UDF
 *   4. BLOG TAGS              — 4 SP + 1 UDF
 *   5. BLOG COMMENTS          — 8 SP + 1 UDF
 *   6. BLOG LIKES             — 4 SP + 1 UDF
 *   7. BLOG FOLLOWS           — 4 SP + 1 UDF
 *   8. BLOG RELATED COURSES   — 4 SP + 1 UDF
 * ═══════════════════════════════════════════════════════════════
 */

const { supabase } = require('../config/database');
const logger = require('../config/logger');

class BlogManagementRepository {
  // ═════════════════════════════════════════════════════════════
  // 1. BLOG CATEGORIES
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // READ — via udf_get_blog_categories
  // ─────────────────────────────────────────────────────────────

  /**
   * getBlogCategories
   * Fetches categories with filtering, sorting, and pagination
   * @param {Object} options
   * @returns {Array} categories with pagination metadata
   */
  async getBlogCategories(options = {}) {
    try {
      const {
        id = null,
        categoryId = null,
        languageId = null,
        parentCategoryId = null,
        isActive = null,
        sortTable = 'blog_categories',
        sortColumn = 'created_at',
        sortDirection = 'DESC',
        searchTerm = null,
        pageIndex = 1,
        pageSize = 20,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_blog_categories', {
        p_id: id,
        p_category_id: categoryId,
        p_language_id: languageId,
        p_parent_category_id: parentCategoryId,
        p_is_active: isActive,
        p_sort_table: sortTable,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_search_term: searchTerm,
        p_page_index: pageIndex,
        p_page_size: pageSize,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching blog categories: ${err.message}`);
      throw err;
    }
  }

  /**
   * findBlogCategoryById
   * Fetches a single blog category by ID
   * @param {number} id
   * @returns {Object|null}
   */
  async findBlogCategoryById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_blog_categories', {
        p_id: null,
        p_category_id: null,
        p_language_id: null,
        p_parent_category_id: null,
        p_is_active: null,
        p_sort_table: 'blog_categories',
        p_sort_column: 'id',
        p_sort_direction: 'ASC',
        p_search_term: null,
        p_page_index: 1,
        p_page_size: 10000,
      });

      if (error) throw error;

      const result = data?.find((c) => c.category_id === Number(id));
      return result || null;
    } catch (err) {
      logger.error(`Error finding blog category by ID: ${err.message}`);
      throw err;
    }
  }

  /**
   * getBlogCategoriesJSON
   * Fetches hierarchical JSON structure of blog categories
   * @returns {Object} JSONB array of categories
   */
  async getBlogCategoriesJSON() {
    try {
      const { data, error } = await supabase.rpc('udfj_getblog_categories');

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching blog categories JSON: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — via sp_blog_categories_insert
  // ─────────────────────────────────────────────────────────────

  /**
   * createBlogCategory
   * Creates a new blog category
   * @param {Object} payload
   * @returns {Object} created category
   */
  async createBlogCategory(payload) {
    try {
      const {
        name,
        code = null,
        description = null,
        parentCategoryId = null,
        displayOrder = 0,
        icon = null,
        coverImageUrl = null,
        isActive = true,
        createdBy = null,
      } = payload;

      const { data: newId, error } = await supabase.rpc('sp_blog_categories_insert', {
        p_name: name,
        p_code: code,
        p_description: description,
        p_parent_category_id: parentCategoryId,
        p_display_order: displayOrder,
        p_icon: icon,
        p_cover_image_url: coverImageUrl,
        p_is_active: isActive,
        p_created_by: createdBy,
      });

      if (error) throw error;

      logger.info(`Blog category created: id=${newId}, name=${name}`);

      const newCategory = await this.findBlogCategoryById(newId);
      if (!newCategory) {
        throw new Error(`Blog category created (id: ${newId}) but could not be fetched`);
      }

      return newCategory;
    } catch (err) {
      logger.error(`Error creating blog category: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — via sp_blog_categories_update
  // ─────────────────────────────────────────────────────────────

  /**
   * updateBlogCategory
   * Updates an existing blog category
   * @param {number} id
   * @param {Object} payload
   * @returns {Object} updated category
   */
  async updateBlogCategory(id, payload) {
    try {
      const {
        name = null,
        code = null,
        description = null,
        parentCategoryId = null,
        displayOrder = null,
        icon = null,
        coverImageUrl = null,
        isActive = null,
        updatedBy = null,
      } = payload;

      const { error } = await supabase.rpc('sp_blog_categories_update', {
        p_id: id,
        p_name: name,
        p_code: code,
        p_description: description,
        p_parent_category_id: parentCategoryId,
        p_display_order: displayOrder,
        p_icon: icon,
        p_cover_image_url: coverImageUrl,
        p_is_active: isActive,
        p_updated_by: updatedBy,
      });

      if (error) throw error;

      logger.info(`Blog category updated: id=${id}`);

      const updated = await this.findBlogCategoryById(id);
      if (!updated) {
        throw new Error(`Blog category updated but could not be fetched`);
      }

      return updated;
    } catch (err) {
      logger.error(`Error updating blog category ${id}: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — via sp_blog_categories_delete
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteBlogCategory
   * Soft delete a single blog category
   * @param {number} id
   * @returns {void}
   */
  async deleteBlogCategory(id) {
    try {
      const { error } = await supabase.rpc('sp_blog_categories_delete', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Blog category deleted: id=${id}`);
    } catch (err) {
      logger.error(`Error deleting blog category ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * bulkDeleteBlogCategories
   * Soft delete multiple blog categories
   * @param {Array<number>} ids
   * @returns {void}
   */
  async bulkDeleteBlogCategories(ids) {
    try {
      if (!ids || ids.length === 0) {
        throw new Error('No category IDs provided for deletion');
      }

      for (const id of ids) {
        await this.deleteBlogCategory(id);
      }

      logger.info(`Blog categories deleted (bulk): ${ids.length} categories deleted`);
    } catch (err) {
      logger.error(`Error deleting blog categories: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — via sp_blog_categories_restore
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreBlogCategory
   * Restore a deleted blog category
   * @param {number} id
   * @returns {void}
   */
  async restoreBlogCategory(id) {
    try {
      const { error } = await supabase.rpc('sp_blog_categories_restore', {
        p_id: id,
        p_restore_translations: false,
      });

      if (error) throw error;

      logger.info(`Blog category restored: id=${id}`);
    } catch (err) {
      logger.error(`Error restoring blog category ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * bulkRestoreBlogCategories
   * Restore multiple deleted blog categories
   * @param {Array<number>} ids
   * @returns {void}
   */
  async bulkRestoreBlogCategories(ids) {
    try {
      if (!ids || ids.length === 0) {
        throw new Error('No category IDs provided for restoration');
      }

      for (const id of ids) {
        await this.restoreBlogCategory(id);
      }

      logger.info(`Blog categories restored (bulk): ${ids.length} categories restored`);
    } catch (err) {
      logger.error(`Error restoring blog categories: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BLOG CATEGORY TRANSLATIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * createBlogCategoryTranslation
   * Creates a translation for a blog category
   * @param {Object} payload
   * @returns {void}
   */
  async createBlogCategoryTranslation(payload) {
    try {
      const {
        categoryId,
        languageId,
        name,
        description = null,
        isActive = true,
      } = payload;

      const { error } = await supabase.rpc('sp_blog_category_translations_insert', {
        p_category_id: categoryId,
        p_language_id: languageId,
        p_name: name,
        p_description: description,
        p_is_active: isActive,
      });

      if (error) throw error;

      logger.info(`Blog category translation created: category=${categoryId}, language=${languageId}`);
    } catch (err) {
      logger.error(`Error creating blog category translation: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateBlogCategoryTranslation
   * Updates a blog category translation
   * @param {number} id
   * @param {Object} payload
   * @returns {void}
   */
  async updateBlogCategoryTranslation(id, payload) {
    try {
      const {
        name = null,
        description = null,
        isActive = null,
      } = payload;

      const { error } = await supabase.rpc('sp_blog_category_translations_update', {
        p_id: id,
        p_name: name,
        p_description: description,
        p_is_active: isActive,
      });

      if (error) throw error;

      logger.info(`Blog category translation updated: id=${id}`);
    } catch (err) {
      logger.error(`Error updating blog category translation ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteBlogCategoryTranslation
   * Soft delete a blog category translation
   * @param {number} id
   * @returns {void}
   */
  async deleteBlogCategoryTranslation(id) {
    try {
      const { error } = await supabase.rpc('sp_blog_category_translations_delete', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Blog category translation deleted: id=${id}`);
    } catch (err) {
      logger.error(`Error deleting blog category translation ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreBlogCategoryTranslation
   * Restore a deleted blog category translation
   * @param {number} id
   * @returns {void}
   */
  async restoreBlogCategoryTranslation(id) {
    try {
      const { error } = await supabase.rpc('sp_blog_category_translations_restore', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Blog category translation restored: id=${id}`);
    } catch (err) {
      logger.error(`Error restoring blog category translation ${id}: ${err.message}`);
      throw err;
    }
  }

  // ═════════════════════════════════════════════════════════════
  // 2. BLOGS
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // READ — via udf_get_blogs
  // ─────────────────────────────────────────────────────────────

  /**
   * getBlogs
   * Fetches blogs with filtering, sorting, and pagination
   * @param {Object} options
   * @returns {Array} blogs with pagination metadata
   */
  async getBlogs(options = {}) {
    try {
      const {
        id = null,
        blogId = null,
        languageId = null,
        authorId = null,
        categoryId = null,
        isActive = null,
        filterBlogOwner = null,
        filterBlogStatus = null,
        filterIsFeatured = null,
        sortTable = 'blogs',
        sortColumn = 'created_at',
        sortDirection = 'DESC',
        searchTerm = null,
        pageIndex = 1,
        pageSize = 20,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_blogs', {
        p_id: id,
        p_blog_id: blogId,
        p_language_id: languageId,
        p_author_id: authorId,
        p_category_id: categoryId,
        p_is_active: isActive,
        p_filter_blog_owner: filterBlogOwner,
        p_filter_blog_status: filterBlogStatus,
        p_filter_is_featured: filterIsFeatured,
        p_sort_table: sortTable,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_search_term: searchTerm,
        p_page_index: pageIndex,
        p_page_size: pageSize,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching blogs: ${err.message}`);
      throw err;
    }
  }

  /**
   * findBlogById
   * Fetches a single blog by ID
   * @param {number} id
   * @returns {Object|null}
   */
  async findBlogById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_blogs', {
        p_id: null,
        p_blog_id: null,
        p_language_id: null,
        p_author_id: null,
        p_category_id: null,
        p_is_active: null,
        p_filter_blog_owner: null,
        p_filter_blog_status: null,
        p_filter_is_featured: null,
        p_sort_table: 'blogs',
        p_sort_column: 'id',
        p_sort_direction: 'ASC',
        p_search_term: null,
        p_page_index: 1,
        p_page_size: 10000,
      });

      if (error) throw error;

      const result = data?.find((b) => b.blog_id === Number(id));
      return result || null;
    } catch (err) {
      logger.error(`Error finding blog by ID: ${err.message}`);
      throw err;
    }
  }

  /**
   * getBlogsJSON
   * Fetches blogs as hierarchical JSON structure
   * @param {number|null} authorId
   * @returns {Object} JSONB array of blogs
   */
  async getBlogsJSON(authorId = null) {
    try {
      const { data, error } = await supabase.rpc('udfj_getblogs', {
        p_author_id: authorId,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching blogs JSON: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — via sp_blogs_insert
  // ─────────────────────────────────────────────────────────────

  /**
   * createBlog
   * Creates a new blog
   * @param {Object} payload
   * @returns {Object} created blog
   */
  async createBlog(payload) {
    try {
      const {
        title,
        blogOwner = 'system',
        authorId = null,
        categoryId = null,
        subtitle = null,
        excerpt = null,
        metaTitle = null,
        metaDescription = null,
        metaKeywords = null,
        coverImageUrl = null,
        thumbnailUrl = null,
        readingTimeMinutes = null,
        blogStatus = 'draft',
        publishedAt = null,
        featuredUntil = null,
        isFeatured = false,
        isPinned = false,
        allowComments = true,
        isActive = true,
        createdBy = null,
      } = payload;

      const { data: newId, error } = await supabase.rpc('sp_blogs_insert', {
        p_title: title,
        p_blog_owner: blogOwner,
        p_author_id: authorId,
        p_category_id: categoryId,
        p_subtitle: subtitle,
        p_excerpt: excerpt,
        p_meta_title: metaTitle,
        p_meta_description: metaDescription,
        p_meta_keywords: metaKeywords,
        p_cover_image_url: coverImageUrl,
        p_thumbnail_url: thumbnailUrl,
        p_reading_time_minutes: readingTimeMinutes,
        p_blog_status: blogStatus,
        p_published_at: publishedAt,
        p_featured_until: featuredUntil,
        p_is_featured: isFeatured,
        p_is_pinned: isPinned,
        p_allow_comments: allowComments,
        p_is_active: isActive,
        p_created_by: createdBy,
      });

      if (error) throw error;

      logger.info(`Blog created: id=${newId}, title=${title}`);

      const newBlog = await this.findBlogById(newId);
      if (!newBlog) {
        throw new Error(`Blog created (id: ${newId}) but could not be fetched`);
      }

      return newBlog;
    } catch (err) {
      logger.error(`Error creating blog: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — via sp_blogs_update
  // ─────────────────────────────────────────────────────────────

  /**
   * updateBlog
   * Updates an existing blog
   * @param {number} id
   * @param {Object} payload
   * @returns {Object} updated blog
   */
  async updateBlog(id, payload) {
    try {
      const {
        title = null,
        categoryId = null,
        subtitle = null,
        excerpt = null,
        metaTitle = null,
        metaDescription = null,
        metaKeywords = null,
        coverImageUrl = null,
        thumbnailUrl = null,
        readingTimeMinutes = null,
        blogStatus = null,
        publishedAt = null,
        featuredUntil = null,
        isFeatured = null,
        isPinned = null,
        allowComments = null,
        viewCount = null,
        likeCount = null,
        commentCount = null,
        shareCount = null,
        isActive = null,
        requiresApproval = null,
        approvedBy = null,
        approvedAt = null,
        rejectionReason = null,
        updatedBy = null,
      } = payload;

      const { error } = await supabase.rpc('sp_blogs_update', {
        p_id: id,
        p_title: title,
        p_category_id: categoryId,
        p_subtitle: subtitle,
        p_excerpt: excerpt,
        p_meta_title: metaTitle,
        p_meta_description: metaDescription,
        p_meta_keywords: metaKeywords,
        p_cover_image_url: coverImageUrl,
        p_thumbnail_url: thumbnailUrl,
        p_reading_time_minutes: readingTimeMinutes,
        p_blog_status: blogStatus,
        p_published_at: publishedAt,
        p_featured_until: featuredUntil,
        p_is_featured: isFeatured,
        p_is_pinned: isPinned,
        p_allow_comments: allowComments,
        p_view_count: viewCount,
        p_like_count: likeCount,
        p_comment_count: commentCount,
        p_share_count: shareCount,
        p_is_active: isActive,
        p_requires_approval: requiresApproval,
        p_approved_by: approvedBy,
        p_approved_at: approvedAt,
        p_rejection_reason: rejectionReason,
        p_updated_by: updatedBy,
      });

      if (error) throw error;

      logger.info(`Blog updated: id=${id}`);

      const updated = await this.findBlogById(id);
      if (!updated) {
        throw new Error(`Blog updated but could not be fetched`);
      }

      return updated;
    } catch (err) {
      logger.error(`Error updating blog ${id}: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — via sp_blogs_delete
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteBlog
   * Soft delete a single blog
   * @param {number} id
   * @returns {void}
   */
  async deleteBlog(id) {
    try {
      const { error } = await supabase.rpc('sp_blogs_delete', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Blog deleted: id=${id}`);
    } catch (err) {
      logger.error(`Error deleting blog ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * bulkDeleteBlogs
   * Soft delete multiple blogs
   * @param {Array<number>} ids
   * @returns {void}
   */
  async bulkDeleteBlogs(ids) {
    try {
      if (!ids || ids.length === 0) {
        throw new Error('No blog IDs provided for deletion');
      }

      for (const id of ids) {
        await this.deleteBlog(id);
      }

      logger.info(`Blogs deleted (bulk): ${ids.length} blogs deleted`);
    } catch (err) {
      logger.error(`Error deleting blogs: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — via sp_blogs_restore
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreBlog
   * Restore a deleted blog
   * @param {number} id
   * @returns {void}
   */
  async restoreBlog(id) {
    try {
      const { error } = await supabase.rpc('sp_blogs_restore', {
        p_id: id,
        p_restore_translations: false,
      });

      if (error) throw error;

      logger.info(`Blog restored: id=${id}`);
    } catch (err) {
      logger.error(`Error restoring blog ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * bulkRestoreBlogs
   * Restore multiple deleted blogs
   * @param {Array<number>} ids
   * @returns {void}
   */
  async bulkRestoreBlogs(ids) {
    try {
      if (!ids || ids.length === 0) {
        throw new Error('No blog IDs provided for restoration');
      }

      for (const id of ids) {
        await this.restoreBlog(id);
      }

      logger.info(`Blogs restored (bulk): ${ids.length} blogs restored`);
    } catch (err) {
      logger.error(`Error restoring blogs: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BLOG TRANSLATIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * createBlogTranslation
   * Creates a translation for a blog
   * @param {Object} payload
   * @returns {void}
   */
  async createBlogTranslation(payload) {
    try {
      const {
        blogId,
        languageId,
        title,
        subtitle = null,
        excerpt = null,
        metaTitle = null,
        metaDescription = null,
        metaKeywords = null,
        isActive = true,
      } = payload;

      const { error } = await supabase.rpc('sp_blog_translations_insert', {
        p_blog_id: blogId,
        p_language_id: languageId,
        p_title: title,
        p_subtitle: subtitle,
        p_excerpt: excerpt,
        p_meta_title: metaTitle,
        p_meta_description: metaDescription,
        p_meta_keywords: metaKeywords,
        p_is_active: isActive,
      });

      if (error) throw error;

      logger.info(`Blog translation created: blog=${blogId}, language=${languageId}`);
    } catch (err) {
      logger.error(`Error creating blog translation: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateBlogTranslation
   * Updates a blog translation
   * @param {number} id
   * @param {Object} payload
   * @returns {void}
   */
  async updateBlogTranslation(id, payload) {
    try {
      const {
        title = null,
        subtitle = null,
        excerpt = null,
        metaTitle = null,
        metaDescription = null,
        metaKeywords = null,
        isActive = null,
      } = payload;

      const { error } = await supabase.rpc('sp_blog_translations_update', {
        p_id: id,
        p_title: title,
        p_subtitle: subtitle,
        p_excerpt: excerpt,
        p_meta_title: metaTitle,
        p_meta_description: metaDescription,
        p_meta_keywords: metaKeywords,
        p_is_active: isActive,
      });

      if (error) throw error;

      logger.info(`Blog translation updated: id=${id}`);
    } catch (err) {
      logger.error(`Error updating blog translation ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteBlogTranslation
   * Soft delete a blog translation
   * @param {number} id
   * @returns {void}
   */
  async deleteBlogTranslation(id) {
    try {
      const { error } = await supabase.rpc('sp_blog_translations_delete', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Blog translation deleted: id=${id}`);
    } catch (err) {
      logger.error(`Error deleting blog translation ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreBlogTranslation
   * Restore a deleted blog translation
   * @param {number} id
   * @returns {void}
   */
  async restoreBlogTranslation(id) {
    try {
      const { error } = await supabase.rpc('sp_blog_translations_restore', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Blog translation restored: id=${id}`);
    } catch (err) {
      logger.error(`Error restoring blog translation ${id}: ${err.message}`);
      throw err;
    }
  }

  // ═════════════════════════════════════════════════════════════
  // 3. CONTENT BLOCKS
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // READ — via udf_get_blog_content_blocks
  // ─────────────────────────────────────────────────────────────

  /**
   * getContentBlocks
   * Fetches content blocks with filtering and pagination
   * @param {Object} options
   * @returns {Array} content blocks
   */
  async getContentBlocks(options = {}) {
    try {
      const {
        id = null,
        blogId = null,
        blockType = null,
        isActive = null,
        searchTerm = null,
        sortColumn = 'block_order',
        sortDirection = 'ASC',
        pageIndex = 1,
        pageSize = 50,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_blog_content_blocks', {
        p_id: id,
        p_blog_id: blogId,
        p_block_type: blockType,
        p_is_active: isActive,
        p_search_term: searchTerm,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_page_index: pageIndex,
        p_page_size: pageSize,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching content blocks: ${err.message}`);
      throw err;
    }
  }

  /**
   * findContentBlockById
   * Fetches a single content block by ID
   * @param {number} id
   * @returns {Object|null}
   */
  async findContentBlockById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_blog_content_blocks', {
        p_id: null,
        p_blog_id: null,
        p_block_type: null,
        p_is_active: null,
        p_search_term: null,
        p_sort_column: 'id',
        p_sort_direction: 'ASC',
        p_page_index: 1,
        p_page_size: 10000,
      });

      if (error) throw error;

      const result = data?.find((b) => b.block_id === Number(id));
      return result || null;
    } catch (err) {
      logger.error(`Error finding content block by ID: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — via sp_blog_content_blocks_insert
  // ─────────────────────────────────────────────────────────────

  /**
   * createContentBlock
   * Creates a new content block
   * @param {Object} payload
   * @returns {Object} created block
   */
  async createContentBlock(payload) {
    try {
      const {
        blogId,
        blockType,
        blockOrder = 0,
        content = null,
        contentFormat = 'text',
        imageUrl = null,
        imageAltText = null,
        imageCaption = null,
        videoUrl = null,
        videoThumbnailUrl = null,
        videoDurationSeconds = null,
        mediaPosition = 'center',
        isActive = true,
        createdBy = null,
      } = payload;

      const { data: newId, error } = await supabase.rpc('sp_blog_content_blocks_insert', {
        p_blog_id: blogId,
        p_block_type: blockType,
        p_block_order: blockOrder,
        p_content: content,
        p_content_format: contentFormat,
        p_image_url: imageUrl,
        p_image_alt_text: imageAltText,
        p_image_caption: imageCaption,
        p_video_url: videoUrl,
        p_video_thumbnail_url: videoThumbnailUrl,
        p_video_duration_seconds: videoDurationSeconds,
        p_media_position: mediaPosition,
        p_is_active: isActive,
        p_created_by: createdBy,
      });

      if (error) throw error;

      logger.info(`Content block created: id=${newId}, blog=${blogId}, type=${blockType}`);

      const newBlock = await this.findContentBlockById(newId);
      if (!newBlock) {
        throw new Error(`Content block created (id: ${newId}) but could not be fetched`);
      }

      return newBlock;
    } catch (err) {
      logger.error(`Error creating content block: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — via sp_blog_content_blocks_update
  // ─────────────────────────────────────────────────────────────

  /**
   * updateContentBlock
   * Updates an existing content block
   * @param {number} id
   * @param {Object} payload
   * @returns {Object} updated block
   */
  async updateContentBlock(id, payload) {
    try {
      const {
        blockType = null,
        blockOrder = null,
        content = null,
        contentFormat = null,
        imageUrl = null,
        imageAltText = null,
        imageCaption = null,
        videoUrl = null,
        videoThumbnailUrl = null,
        videoDurationSeconds = null,
        mediaPosition = null,
        isActive = null,
        updatedBy = null,
      } = payload;

      const { error } = await supabase.rpc('sp_blog_content_blocks_update', {
        p_id: id,
        p_block_type: blockType,
        p_block_order: blockOrder,
        p_content: content,
        p_content_format: contentFormat,
        p_image_url: imageUrl,
        p_image_alt_text: imageAltText,
        p_image_caption: imageCaption,
        p_video_url: videoUrl,
        p_video_thumbnail_url: videoThumbnailUrl,
        p_video_duration_seconds: videoDurationSeconds,
        p_media_position: mediaPosition,
        p_is_active: isActive,
        p_updated_by: updatedBy,
      });

      if (error) throw error;

      logger.info(`Content block updated: id=${id}`);

      const updated = await this.findContentBlockById(id);
      if (!updated) {
        throw new Error(`Content block updated but could not be fetched`);
      }

      return updated;
    } catch (err) {
      logger.error(`Error updating content block ${id}: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — via sp_blog_content_blocks_delete
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteContentBlock
   * Soft delete a single content block
   * @param {number} blockId
   * @returns {void}
   */
  async deleteContentBlock(blockId) {
    try {
      const { error } = await supabase.rpc('sp_blog_content_blocks_delete', {
        p_block_id: blockId,
      });

      if (error) throw error;

      logger.info(`Content block deleted: id=${blockId}`);
    } catch (err) {
      logger.error(`Error deleting content block ${blockId}: ${err.message}`);
      throw err;
    }
  }

  /**
   * bulkDeleteContentBlocks
   * Soft delete multiple content blocks
   * @param {Array<number>} ids
   * @returns {void}
   */
  async bulkDeleteContentBlocks(ids) {
    try {
      if (!ids || ids.length === 0) {
        throw new Error('No block IDs provided for deletion');
      }

      for (const id of ids) {
        await this.deleteContentBlock(id);
      }

      logger.info(`Content blocks deleted (bulk): ${ids.length} blocks deleted`);
    } catch (err) {
      logger.error(`Error deleting content blocks: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — via sp_blog_content_blocks_restore
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreContentBlock
   * Restore a deleted content block
   * @param {number} blockId
   * @returns {void}
   */
  async restoreContentBlock(blockId) {
    try {
      const { error } = await supabase.rpc('sp_blog_content_blocks_restore', {
        p_block_id: blockId,
        p_restore_translations: false,
      });

      if (error) throw error;

      logger.info(`Content block restored: id=${blockId}`);
    } catch (err) {
      logger.error(`Error restoring content block ${blockId}: ${err.message}`);
      throw err;
    }
  }

  /**
   * bulkRestoreContentBlocks
   * Restore multiple deleted content blocks
   * @param {Array<number>} ids
   * @returns {void}
   */
  async bulkRestoreContentBlocks(ids) {
    try {
      if (!ids || ids.length === 0) {
        throw new Error('No block IDs provided for restoration');
      }

      for (const id of ids) {
        await this.restoreContentBlock(id);
      }

      logger.info(`Content blocks restored (bulk): ${ids.length} blocks restored`);
    } catch (err) {
      logger.error(`Error restoring content blocks: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CONTENT BLOCK TRANSLATIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * createContentBlockTranslation
   * Creates a translation for a content block
   * @param {Object} payload
   * @returns {void}
   */
  async createContentBlockTranslation(payload) {
    try {
      const {
        blockId,
        languageId,
        content,
        imageAltText = null,
        imageCaption = null,
        isActive = true,
      } = payload;

      const { error } = await supabase.rpc('sp_blog_content_block_translations_insert', {
        p_block_id: blockId,
        p_language_id: languageId,
        p_content: content,
        p_image_alt_text: imageAltText,
        p_image_caption: imageCaption,
        p_is_active: isActive,
      });

      if (error) throw error;

      logger.info(`Content block translation created: block=${blockId}, language=${languageId}`);
    } catch (err) {
      logger.error(`Error creating content block translation: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateContentBlockTranslation
   * Updates a content block translation
   * @param {number} translationId
   * @param {Object} payload
   * @returns {void}
   */
  async updateContentBlockTranslation(translationId, payload) {
    try {
      const {
        content = null,
        imageAltText = null,
        imageCaption = null,
        isActive = null,
      } = payload;

      const { error } = await supabase.rpc('sp_blog_content_block_translations_update', {
        p_id: translationId,
        p_content: content,
        p_image_alt_text: imageAltText,
        p_image_caption: imageCaption,
        p_is_active: isActive,
      });

      if (error) throw error;

      logger.info(`Content block translation updated: id=${translationId}`);
    } catch (err) {
      logger.error(`Error updating content block translation ${translationId}: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteContentBlockTranslation
   * Soft delete a content block translation
   * @param {number} translationId
   * @returns {void}
   */
  async deleteContentBlockTranslation(translationId) {
    try {
      const { error } = await supabase.rpc('sp_blog_content_block_translations_delete', {
        p_id: translationId,
      });

      if (error) throw error;

      logger.info(`Content block translation deleted: id=${translationId}`);
    } catch (err) {
      logger.error(`Error deleting content block translation ${translationId}: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreContentBlockTranslation
   * Restore a deleted content block translation
   * @param {number} translationId
   * @returns {void}
   */
  async restoreContentBlockTranslation(translationId) {
    try {
      const { error } = await supabase.rpc('sp_blog_content_block_translations_restore', {
        p_id: translationId,
      });

      if (error) throw error;

      logger.info(`Content block translation restored: id=${translationId}`);
    } catch (err) {
      logger.error(`Error restoring content block translation ${translationId}: ${err.message}`);
      throw err;
    }
  }

  // ═════════════════════════════════════════════════════════════
  // 4. BLOG TAGS
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // READ — via udf_get_blog_tags
  // ─────────────────────────────────────────────────────────────

  /**
   * getBlogTags
   * Fetches blog tags with filtering and pagination
   * @param {Object} options
   * @returns {Array} blog tags
   */
  async getBlogTags(options = {}) {
    try {
      const {
        id = null,
        blogId = null,
        tag = null,
        isActive = null,
        searchTerm = null,
        sortColumn = 'display_order',
        sortDirection = 'ASC',
        pageIndex = 1,
        pageSize = 50,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_blog_tags', {
        p_id: id,
        p_blog_id: blogId,
        p_tag: tag,
        p_is_active: isActive,
        p_search_term: searchTerm,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_page_index: pageIndex,
        p_page_size: pageSize,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching blog tags: ${err.message}`);
      throw err;
    }
  }

  /**
   * findBlogTagById
   * Fetches a single blog tag by ID
   * @param {number} id
   * @returns {Object|null}
   */
  async findBlogTagById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_blog_tags', {
        p_id: null,
        p_blog_id: null,
        p_tag: null,
        p_is_active: null,
        p_search_term: null,
        p_sort_column: 'id',
        p_sort_direction: 'ASC',
        p_page_index: 1,
        p_page_size: 10000,
      });

      if (error) throw error;

      const result = data?.find((t) => t.tag_id === Number(id));
      return result || null;
    } catch (err) {
      logger.error(`Error finding blog tag by ID: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — via sp_blog_tags_insert
  // ─────────────────────────────────────────────────────────────

  /**
   * createBlogTag
   * Creates a new blog tag
   * @param {Object} payload
   * @returns {Object} created tag
   */
  async createBlogTag(payload) {
    try {
      const {
        blogId,
        tag,
        displayOrder = 0,
        isActive = true,
        createdBy = null,
      } = payload;

      const { data: newId, error } = await supabase.rpc('sp_blog_tags_insert', {
        p_blog_id: blogId,
        p_tag: tag,
        p_display_order: displayOrder,
        p_is_active: isActive,
        p_created_by: createdBy,
      });

      if (error) throw error;

      logger.info(`Blog tag created: id=${newId}, blog=${blogId}, tag=${tag}`);

      const newTag = await this.findBlogTagById(newId);
      if (!newTag) {
        throw new Error(`Blog tag created (id: ${newId}) but could not be fetched`);
      }

      return newTag;
    } catch (err) {
      logger.error(`Error creating blog tag: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — via sp_blog_tags_update
  // ─────────────────────────────────────────────────────────────

  /**
   * updateBlogTag
   * Updates an existing blog tag
   * @param {number} id
   * @param {Object} payload
   * @returns {Object} updated tag
   */
  async updateBlogTag(id, payload) {
    try {
      const {
        tag = null,
        displayOrder = null,
        isActive = null,
        updatedBy = null,
      } = payload;

      const { error } = await supabase.rpc('sp_blog_tags_update', {
        p_id: id,
        p_tag: tag,
        p_display_order: displayOrder,
        p_is_active: isActive,
        p_updated_by: updatedBy,
      });

      if (error) throw error;

      logger.info(`Blog tag updated: id=${id}`);

      const updated = await this.findBlogTagById(id);
      if (!updated) {
        throw new Error(`Blog tag updated but could not be fetched`);
      }

      return updated;
    } catch (err) {
      logger.error(`Error updating blog tag ${id}: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — via sp_blog_tags_delete
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteBlogTag
   * Soft delete a single blog tag
   * @param {number} id
   * @returns {void}
   */
  async deleteBlogTag(id) {
    try {
      const { error } = await supabase.rpc('sp_blog_tags_delete', {
        p_tag_id: id,
      });

      if (error) throw error;

      logger.info(`Blog tag deleted: id=${id}`);
    } catch (err) {
      logger.error(`Error deleting blog tag ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * bulkDeleteBlogTags
   * Soft delete multiple blog tags
   * @param {Array<number>} ids
   * @returns {void}
   */
  async bulkDeleteBlogTags(ids) {
    try {
      if (!ids || ids.length === 0) {
        throw new Error('No tag IDs provided for deletion');
      }

      for (const id of ids) {
        await this.deleteBlogTag(id);
      }

      logger.info(`Blog tags deleted (bulk): ${ids.length} tags deleted`);
    } catch (err) {
      logger.error(`Error deleting blog tags: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — via sp_blog_tags_restore
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreBlogTag
   * Restore a deleted blog tag
   * @param {number} id
   * @returns {void}
   */
  async restoreBlogTag(id) {
    try {
      const { error } = await supabase.rpc('sp_blog_tags_restore', {
        p_tag_id: id,
      });

      if (error) throw error;

      logger.info(`Blog tag restored: id=${id}`);
    } catch (err) {
      logger.error(`Error restoring blog tag ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * bulkRestoreBlogTags
   * Restore multiple deleted blog tags
   * @param {Array<number>} ids
   * @returns {void}
   */
  async bulkRestoreBlogTags(ids) {
    try {
      if (!ids || ids.length === 0) {
        throw new Error('No tag IDs provided for restoration');
      }

      for (const id of ids) {
        await this.restoreBlogTag(id);
      }

      logger.info(`Blog tags restored (bulk): ${ids.length} tags restored`);
    } catch (err) {
      logger.error(`Error restoring blog tags: ${err.message}`);
      throw err;
    }
  }

  // ═════════════════════════════════════════════════════════════
  // 5. BLOG COMMENTS
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // READ — via udf_get_blog_comments
  // ─────────────────────────────────────────────────────────────

  /**
   * getBlogComments
   * Fetches blog comments with filtering and pagination
   * @param {Object} options
   * @returns {Array} blog comments
   */
  async getBlogComments(options = {}) {
    try {
      const {
        searchTerm = null,
        filterCommentStatus = null,
        filterIsPinned = null,
        filterIsActive = null,
        id = null,
        blogId = null,
        userId = null,
        parentCommentId = null,
        sortColumn = 'created_at',
        sortDirection = 'DESC',
        pageIndex = 1,
        pageSize = 20,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_blog_comments', {
        p_search_term: searchTerm,
        p_filter_comment_status: filterCommentStatus,
        p_filter_is_pinned: filterIsPinned,
        p_filter_is_active: filterIsActive,
        p_id: id,
        p_blog_id: blogId,
        p_user_id: userId,
        p_parent_comment_id: parentCommentId,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_page_index: pageIndex,
        p_page_size: pageSize,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching blog comments: ${err.message}`);
      throw err;
    }
  }

  /**
   * findBlogCommentById
   * Fetches a single blog comment by ID
   * @param {number} id
   * @returns {Object|null}
   */
  async findBlogCommentById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_blog_comments', {
        p_search_term: null,
        p_filter_comment_status: null,
        p_filter_is_pinned: null,
        p_filter_is_active: null,
        p_id: null,
        p_blog_id: null,
        p_user_id: null,
        p_parent_comment_id: null,
        p_sort_column: 'id',
        p_sort_direction: 'ASC',
        p_page_index: 1,
        p_page_size: 10000,
      });

      if (error) throw error;

      const result = data?.find((c) => c.comment_id === Number(id));
      return result || null;
    } catch (err) {
      logger.error(`Error finding blog comment by ID: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — via sp_blog_comments_insert
  // ─────────────────────────────────────────────────────────────

  /**
   * createBlogComment
   * Creates a new blog comment
   * @param {Object} payload
   * @returns {Object} created comment
   */
  async createBlogComment(payload) {
    try {
      const {
        blogId,
        userId,
        content,
        parentCommentId = null,
        commentStatus = 'pending',
        isActive = true,
        createdBy = null,
      } = payload;

      const { data: newId, error } = await supabase.rpc('sp_blog_comments_insert', {
        p_blog_id: blogId,
        p_user_id: userId,
        p_content: content,
        p_parent_comment_id: parentCommentId,
        p_comment_status: commentStatus,
        p_is_active: isActive,
        p_created_by: createdBy,
      });

      if (error) throw error;

      logger.info(`Blog comment created: id=${newId}, blog=${blogId}, user=${userId}`);

      const newComment = await this.findBlogCommentById(newId);
      if (!newComment) {
        throw new Error(`Blog comment created (id: ${newId}) but could not be fetched`);
      }

      return newComment;
    } catch (err) {
      logger.error(`Error creating blog comment: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — via sp_blog_comments_update
  // ─────────────────────────────────────────────────────────────

  /**
   * updateBlogComment
   * Updates an existing blog comment
   * @param {number} id
   * @param {Object} payload
   * @returns {Object} updated comment
   */
  async updateBlogComment(id, payload) {
    try {
      const {
        content = null,
        commentStatus = null,
        moderatedBy = null,
        moderatedAt = null,
        rejectionReason = null,
        isPinned = null,
        isAuthorReply = null,
        isActive = null,
        updatedBy = null,
      } = payload;

      const { error } = await supabase.rpc('sp_blog_comments_update', {
        p_comment_id: id,
        p_content: content,
        p_comment_status: commentStatus,
        p_moderated_by: moderatedBy,
        p_moderated_at: moderatedAt,
        p_rejection_reason: rejectionReason,
        p_is_pinned: isPinned,
        p_is_author_reply: isAuthorReply,
        p_is_active: isActive,
        p_updated_by: updatedBy,
      });

      if (error) throw error;

      logger.info(`Blog comment updated: id=${id}`);

      const updated = await this.findBlogCommentById(id);
      if (!updated) {
        throw new Error(`Blog comment updated but could not be fetched`);
      }

      return updated;
    } catch (err) {
      logger.error(`Error updating blog comment ${id}: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — via sp_blog_comments_delete
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteBlogComment
   * Soft delete a single blog comment
   * @param {number} id
   * @returns {void}
   */
  async deleteBlogComment(id) {
    try {
      const { error } = await supabase.rpc('sp_blog_comments_delete', {
        p_comment_id: id,
      });

      if (error) throw error;

      logger.info(`Blog comment deleted: id=${id}`);
    } catch (err) {
      logger.error(`Error deleting blog comment ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * bulkDeleteBlogComments
   * Soft delete multiple blog comments
   * @param {Array<number>} ids
   * @returns {void}
   */
  async bulkDeleteBlogComments(ids) {
    try {
      if (!ids || ids.length === 0) {
        throw new Error('No comment IDs provided for deletion');
      }

      for (const id of ids) {
        await this.deleteBlogComment(id);
      }

      logger.info(`Blog comments deleted (bulk): ${ids.length} comments deleted`);
    } catch (err) {
      logger.error(`Error deleting blog comments: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — via sp_blog_comments_restore
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreBlogComment
   * Restore a deleted blog comment
   * @param {number} id
   * @returns {void}
   */
  async restoreBlogComment(id) {
    try {
      const { error } = await supabase.rpc('sp_blog_comments_restore', {
        p_comment_id: id,
        p_restore_translations: false,
      });

      if (error) throw error;

      logger.info(`Blog comment restored: id=${id}`);
    } catch (err) {
      logger.error(`Error restoring blog comment ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * bulkRestoreBlogComments
   * Restore multiple deleted blog comments
   * @param {Array<number>} ids
   * @returns {void}
   */
  async bulkRestoreBlogComments(ids) {
    try {
      if (!ids || ids.length === 0) {
        throw new Error('No comment IDs provided for restoration');
      }

      for (const id of ids) {
        await this.restoreBlogComment(id);
      }

      logger.info(`Blog comments restored (bulk): ${ids.length} comments restored`);
    } catch (err) {
      logger.error(`Error restoring blog comments: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BLOG COMMENT TRANSLATIONS
  // ─────────────────────────────────────────────────────────────

  /**
   * createBlogCommentTranslation
   * Creates a translation for a blog comment
   * @param {Object} payload
   * @returns {void}
   */
  async createBlogCommentTranslation(payload) {
    try {
      const {
        commentId,
        languageId,
        content,
        isActive = true,
      } = payload;

      const { error } = await supabase.rpc('sp_blog_comment_translations_insert', {
        p_comment_id: commentId,
        p_language_id: languageId,
        p_content: content,
        p_is_active: isActive,
      });

      if (error) throw error;

      logger.info(`Blog comment translation created: comment=${commentId}, language=${languageId}`);
    } catch (err) {
      logger.error(`Error creating blog comment translation: ${err.message}`);
      throw err;
    }
  }

  /**
   * updateBlogCommentTranslation
   * Updates a blog comment translation
   * @param {number} translationId
   * @param {Object} payload
   * @returns {void}
   */
  async updateBlogCommentTranslation(translationId, payload) {
    try {
      const {
        content = null,
        isActive = null,
      } = payload;

      const { error } = await supabase.rpc('sp_blog_comment_translations_update', {
        p_id: translationId,
        p_content: content,
        p_is_active: isActive,
      });

      if (error) throw error;

      logger.info(`Blog comment translation updated: id=${translationId}`);
    } catch (err) {
      logger.error(`Error updating blog comment translation ${translationId}: ${err.message}`);
      throw err;
    }
  }

  /**
   * deleteBlogCommentTranslation
   * Soft delete a blog comment translation
   * @param {number} translationId
   * @returns {void}
   */
  async deleteBlogCommentTranslation(translationId) {
    try {
      const { error } = await supabase.rpc('sp_blog_comment_translations_delete', {
        p_id: translationId,
      });

      if (error) throw error;

      logger.info(`Blog comment translation deleted: id=${translationId}`);
    } catch (err) {
      logger.error(`Error deleting blog comment translation ${translationId}: ${err.message}`);
      throw err;
    }
  }

  /**
   * restoreBlogCommentTranslation
   * Restore a deleted blog comment translation
   * @param {number} translationId
   * @returns {void}
   */
  async restoreBlogCommentTranslation(translationId) {
    try {
      const { error } = await supabase.rpc('sp_blog_comment_translations_restore', {
        p_id: translationId,
      });

      if (error) throw error;

      logger.info(`Blog comment translation restored: id=${translationId}`);
    } catch (err) {
      logger.error(`Error restoring blog comment translation ${translationId}: ${err.message}`);
      throw err;
    }
  }

  // ═════════════════════════════════════════════════════════════
  // 6. BLOG LIKES
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // READ — via udf_get_blog_likes
  // ─────────────────────────────────────────────────────────────

  /**
   * getBlogLikes
   * Fetches blog likes with filtering and pagination
   * @param {Object} options
   * @returns {Array} blog likes
   */
  async getBlogLikes(options = {}) {
    try {
      const {
        filterIsActive = null,
        id = null,
        userId = null,
        blogId = null,
        commentId = null,
        likeableType = null,
        sortColumn = 'created_at',
        sortDirection = 'DESC',
        pageIndex = 1,
        pageSize = 20,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_blog_likes', {
        p_filter_is_active: filterIsActive,
        p_id: id,
        p_user_id: userId,
        p_blog_id: blogId,
        p_comment_id: commentId,
        p_likeable_type: likeableType,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_page_index: pageIndex,
        p_page_size: pageSize,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching blog likes: ${err.message}`);
      throw err;
    }
  }

  /**
   * findBlogLikeById
   * Fetches a single blog like by ID
   * @param {number} id
   * @returns {Object|null}
   */
  async findBlogLikeById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_blog_likes', {
        p_filter_is_active: null,
        p_id: null,
        p_user_id: null,
        p_blog_id: null,
        p_comment_id: null,
        p_likeable_type: null,
        p_sort_column: 'id',
        p_sort_direction: 'ASC',
        p_page_index: 1,
        p_page_size: 10000,
      });

      if (error) throw error;

      const result = data?.find((l) => l.like_id === Number(id));
      return result || null;
    } catch (err) {
      logger.error(`Error finding blog like by ID: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — via sp_blog_likes_insert
  // ─────────────────────────────────────────────────────────────

  /**
   * createBlogLike
   * Creates a new blog like
   * @param {Object} payload
   * @returns {Object} created like
   */
  async createBlogLike(payload) {
    try {
      const {
        userId,
        likeableType,
        blogId = null,
        commentId = null,
        createdBy = null,
      } = payload;

      const { data: newId, error } = await supabase.rpc('sp_blog_likes_insert', {
        p_user_id: userId,
        p_likeable_type: likeableType,
        p_blog_id: blogId,
        p_comment_id: commentId,
        p_created_by: createdBy,
      });

      if (error) throw error;

      logger.info(`Blog like created: id=${newId}, user=${userId}, type=${likeableType}`);

      const newLike = await this.findBlogLikeById(newId);
      if (!newLike) {
        throw new Error(`Blog like created (id: ${newId}) but could not be fetched`);
      }

      return newLike;
    } catch (err) {
      logger.error(`Error creating blog like: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — via sp_blog_likes_update
  // ─────────────────────────────────────────────────────────────

  /**
   * updateBlogLike
   * Updates an existing blog like
   * @param {number} id
   * @param {Object} payload
   * @returns {Object} updated like
   */
  async updateBlogLike(id, payload) {
    try {
      const {
        isActive = null,
        updatedBy = null,
      } = payload;

      const { error } = await supabase.rpc('sp_blog_likes_update', {
        p_like_id: id,
        p_is_active: isActive,
        p_updated_by: updatedBy,
      });

      if (error) throw error;

      logger.info(`Blog like updated: id=${id}`);

      const updated = await this.findBlogLikeById(id);
      if (!updated) {
        throw new Error(`Blog like updated but could not be fetched`);
      }

      return updated;
    } catch (err) {
      logger.error(`Error updating blog like ${id}: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — via sp_blog_likes_delete
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteBlogLike
   * Soft delete a single blog like
   * @param {number} id
   * @returns {void}
   */
  async deleteBlogLike(id) {
    try {
      const { error } = await supabase.rpc('sp_blog_likes_delete', {
        p_like_id: id,
      });

      if (error) throw error;

      logger.info(`Blog like deleted: id=${id}`);
    } catch (err) {
      logger.error(`Error deleting blog like ${id}: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — via sp_blog_likes_restore
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreBlogLike
   * Restore a deleted blog like
   * @param {number} id
   * @returns {void}
   */
  async restoreBlogLike(id) {
    try {
      const { error } = await supabase.rpc('sp_blog_likes_restore', {
        p_like_id: id,
      });

      if (error) throw error;

      logger.info(`Blog like restored: id=${id}`);
    } catch (err) {
      logger.error(`Error restoring blog like ${id}: ${err.message}`);
      throw err;
    }
  }

  // ═════════════════════════════════════════════════════════════
  // 7. BLOG FOLLOWS
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // READ — via udf_get_blog_follows
  // ─────────────────────────────────────────────────────────────

  /**
   * getBlogFollows
   * Fetches blog follows with filtering and pagination
   * @param {Object} options
   * @returns {Array} blog follows
   */
  async getBlogFollows(options = {}) {
    try {
      const {
        id = null,
        userId = null,
        followType = null,
        authorId = null,
        categoryId = null,
        isActive = null,
        sortColumn = 'created_at',
        sortDirection = 'DESC',
        pageIndex = 1,
        pageSize = 20,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_blog_follows', {
        p_id: id,
        p_user_id: userId,
        p_follow_type: followType,
        p_author_id: authorId,
        p_category_id: categoryId,
        p_is_active: isActive,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_page_index: pageIndex,
        p_page_size: pageSize,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching blog follows: ${err.message}`);
      throw err;
    }
  }

  /**
   * findBlogFollowById
   * Fetches a single blog follow by ID
   * @param {number} id
   * @returns {Object|null}
   */
  async findBlogFollowById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_blog_follows', {
        p_id: null,
        p_user_id: null,
        p_follow_type: null,
        p_author_id: null,
        p_category_id: null,
        p_is_active: null,
        p_sort_column: 'id',
        p_sort_direction: 'ASC',
        p_page_index: 1,
        p_page_size: 10000,
      });

      if (error) throw error;

      const result = data?.find((f) => f.follow_id === Number(id));
      return result || null;
    } catch (err) {
      logger.error(`Error finding blog follow by ID: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — via sp_blog_follows_insert
  // ─────────────────────────────────────────────────────────────

  /**
   * createBlogFollow
   * Creates a new blog follow
   * @param {Object} payload
   * @returns {Object} created follow
   */
  async createBlogFollow(payload) {
    try {
      const {
        userId,
        followType,
        authorId = null,
        categoryId = null,
        notifyNewPost = true,
        createdBy = null,
      } = payload;

      const { data: newId, error } = await supabase.rpc('sp_blog_follows_insert', {
        p_user_id: userId,
        p_follow_type: followType,
        p_author_id: authorId,
        p_category_id: categoryId,
        p_notify_new_post: notifyNewPost,
        p_created_by: createdBy,
      });

      if (error) throw error;

      logger.info(`Blog follow created: id=${newId}, user=${userId}, type=${followType}`);

      const newFollow = await this.findBlogFollowById(newId);
      if (!newFollow) {
        throw new Error(`Blog follow created (id: ${newId}) but could not be fetched`);
      }

      return newFollow;
    } catch (err) {
      logger.error(`Error creating blog follow: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — via sp_blog_follows_update
  // ─────────────────────────────────────────────────────────────

  /**
   * updateBlogFollow
   * Updates an existing blog follow
   * @param {number} id
   * @param {Object} payload
   * @returns {Object} updated follow
   */
  async updateBlogFollow(id, payload) {
    try {
      const {
        notifyNewPost = null,
        isActive = null,
        updatedBy = null,
      } = payload;

      const { error } = await supabase.rpc('sp_blog_follows_update', {
        p_id: id,
        p_notify_new_post: notifyNewPost,
        p_is_active: isActive,
        p_updated_by: updatedBy,
      });

      if (error) throw error;

      logger.info(`Blog follow updated: id=${id}`);

      const updated = await this.findBlogFollowById(id);
      if (!updated) {
        throw new Error(`Blog follow updated but could not be fetched`);
      }

      return updated;
    } catch (err) {
      logger.error(`Error updating blog follow ${id}: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — via sp_blog_follows_delete
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteBlogFollow
   * Soft delete a single blog follow
   * @param {number} id
   * @returns {void}
   */
  async deleteBlogFollow(id) {
    try {
      const { error } = await supabase.rpc('sp_blog_follows_delete', {
        p_id: id,
        p_deleted_by: null,
      });

      if (error) throw error;

      logger.info(`Blog follow deleted: id=${id}`);
    } catch (err) {
      logger.error(`Error deleting blog follow ${id}: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — via sp_blog_follows_restore
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreBlogFollow
   * Restore a deleted blog follow
   * @param {number} id
   * @returns {void}
   */
  async restoreBlogFollow(id) {
    try {
      const { error } = await supabase.rpc('sp_blog_follows_restore', {
        p_id: id,
        p_restored_by: null,
      });

      if (error) throw error;

      logger.info(`Blog follow restored: id=${id}`);
    } catch (err) {
      logger.error(`Error restoring blog follow ${id}: ${err.message}`);
      throw err;
    }
  }

  // ═════════════════════════════════════════════════════════════
  // 8. BLOG RELATED COURSES
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // READ — via udf_get_blog_related_courses
  // ─────────────────────────────────────────────────────────────

  /**
   * getRelatedCourses
   * Fetches related courses with filtering and pagination
   * @param {Object} options
   * @returns {Array} related courses
   */
  async getRelatedCourses(options = {}) {
    try {
      const {
        id = null,
        blogId = null,
        courseId = null,
        isActive = null,
        searchTerm = null,
        sortColumn = 'display_order',
        sortDirection = 'ASC',
        pageIndex = 1,
        pageSize = 20,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_blog_related_courses', {
        p_id: id,
        p_blog_id: blogId,
        p_course_id: courseId,
        p_is_active: isActive,
        p_search_term: searchTerm,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_page_index: pageIndex,
        p_page_size: pageSize,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching related courses: ${err.message}`);
      throw err;
    }
  }

  /**
   * findRelatedCourseById
   * Fetches a single related course by ID
   * @param {number} id
   * @returns {Object|null}
   */
  async findRelatedCourseById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_blog_related_courses', {
        p_id: null,
        p_blog_id: null,
        p_course_id: null,
        p_is_active: null,
        p_search_term: null,
        p_sort_column: 'id',
        p_sort_direction: 'ASC',
        p_page_index: 1,
        p_page_size: 10000,
      });

      if (error) throw error;

      const result = data?.find((r) => r.relation_id === Number(id));
      return result || null;
    } catch (err) {
      logger.error(`Error finding related course by ID: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — via sp_blog_related_courses_insert
  // ─────────────────────────────────────────────────────────────

  /**
   * createRelatedCourse
   * Creates a new related course link
   * @param {Object} payload
   * @returns {Object} created relation
   */
  async createRelatedCourse(payload) {
    try {
      const {
        blogId,
        courseId,
        displayOrder = 0,
        relevanceNote = null,
        createdBy = null,
      } = payload;

      const { data: newId, error } = await supabase.rpc('sp_blog_related_courses_insert', {
        p_blog_id: blogId,
        p_course_id: courseId,
        p_display_order: displayOrder,
        p_relevance_note: relevanceNote,
        p_created_by: createdBy,
      });

      if (error) throw error;

      logger.info(`Related course created: id=${newId}, blog=${blogId}, course=${courseId}`);

      const newRelation = await this.findRelatedCourseById(newId);
      if (!newRelation) {
        throw new Error(`Related course created (id: ${newId}) but could not be fetched`);
      }

      return newRelation;
    } catch (err) {
      logger.error(`Error creating related course: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — via sp_blog_related_courses_update
  // ─────────────────────────────────────────────────────────────

  /**
   * updateRelatedCourse
   * Updates an existing related course link
   * @param {number} id
   * @param {Object} payload
   * @returns {Object} updated relation
   */
  async updateRelatedCourse(id, payload) {
    try {
      const {
        displayOrder = null,
        relevanceNote = null,
        isActive = null,
        updatedBy = null,
      } = payload;

      const { error } = await supabase.rpc('sp_blog_related_courses_update', {
        p_id: id,
        p_display_order: displayOrder,
        p_relevance_note: relevanceNote,
        p_is_active: isActive,
        p_updated_by: updatedBy,
      });

      if (error) throw error;

      logger.info(`Related course updated: id=${id}`);

      const updated = await this.findRelatedCourseById(id);
      if (!updated) {
        throw new Error(`Related course updated but could not be fetched`);
      }

      return updated;
    } catch (err) {
      logger.error(`Error updating related course ${id}: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — via sp_blog_related_courses_delete
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteRelatedCourse
   * Soft delete a single related course link
   * @param {number} id
   * @returns {void}
   */
  async deleteRelatedCourse(id) {
    try {
      const { error } = await supabase.rpc('sp_blog_related_courses_delete', {
        p_id: id,
        p_deleted_by: null,
      });

      if (error) throw error;

      logger.info(`Related course deleted: id=${id}`);
    } catch (err) {
      logger.error(`Error deleting related course ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * bulkDeleteRelatedCourses
   * Soft delete multiple related course links
   * @param {Array<number>} ids
   * @returns {void}
   */
  async bulkDeleteRelatedCourses(ids) {
    try {
      if (!ids || ids.length === 0) {
        throw new Error('No relation IDs provided for deletion');
      }

      for (const id of ids) {
        await this.deleteRelatedCourse(id);
      }

      logger.info(`Related courses deleted (bulk): ${ids.length} relations deleted`);
    } catch (err) {
      logger.error(`Error deleting related courses: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — via sp_blog_related_courses_restore
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreRelatedCourse
   * Restore a deleted related course link
   * @param {number} id
   * @returns {void}
   */
  async restoreRelatedCourse(id) {
    try {
      const { error } = await supabase.rpc('sp_blog_related_courses_restore', {
        p_id: id,
        p_restored_by: null,
      });

      if (error) throw error;

      logger.info(`Related course restored: id=${id}`);
    } catch (err) {
      logger.error(`Error restoring related course ${id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * bulkRestoreRelatedCourses
   * Restore multiple deleted related course links
   * @param {Array<number>} ids
   * @returns {void}
   */
  async bulkRestoreRelatedCourses(ids) {
    try {
      if (!ids || ids.length === 0) {
        throw new Error('No relation IDs provided for restoration');
      }

      for (const id of ids) {
        await this.restoreRelatedCourse(id);
      }

      logger.info(`Related courses restored (bulk): ${ids.length} relations restored`);
    } catch (err) {
      logger.error(`Error restoring related courses: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new BlogManagementRepository();
