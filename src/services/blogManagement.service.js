const blogManagementRepository = require('../repositories/blogManagement.repository');
const logger = require('../config/logger');
const { BadRequestError, NotFoundError } = require('../utils/errors');

class BlogManagementService {
  // ═════════════════════════════════════════════════════════════
  //  BLOG CATEGORIES
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // LIST — Blog Categories
  // ─────────────────────────────────────────────────────────────

  /**
   * getBlogCategories
   * Fetches a list of blog categories with filtering and pagination
   * @param {Object} options
   * @returns {Array} categories with pagination metadata
   */
  async getBlogCategories(options = {}) {
    try {
      return await blogManagementRepository.getBlogCategories(options);
    } catch (error) {
      logger.error('Error fetching blog categories:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // READ — Single Blog Category by ID
  // ─────────────────────────────────────────────────────────────

  /**
   * getBlogCategoryById
   * Fetches a single blog category by ID
   * @param {number} id
   * @returns {Object} category
   */
  async getBlogCategoryById(id) {
    try {
      if (!id) throw new BadRequestError('Blog category ID is required');

      const result = await blogManagementRepository.findBlogCategoryById(id);
      if (!result) throw new NotFoundError('Blog category not found');

      return result;
    } catch (error) {
      logger.error(`Error fetching blog category ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // READ — Blog Categories as JSON
  // ─────────────────────────────────────────────────────────────

  /**
   * getBlogCategoriesJSON
   * Fetches blog categories in JSON structure
   * @returns {Object} JSONB array of categories
   */
  async getBlogCategoriesJSON() {
    try {
      return await blogManagementRepository.getBlogCategoriesJSON();
    } catch (error) {
      logger.error('Error fetching blog categories JSON:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — New Blog Category
  // ─────────────────────────────────────────────────────────────

  /**
   * createBlogCategory
   * Creates a new blog category
   * @param {Object} categoryData
   * @param {number} actingUserId
   * @returns {Object} created category
   */
  async createBlogCategory(categoryData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!categoryData.name) throw new BadRequestError('Category name is required');

      const payload = {
        ...categoryData,
        createdBy: actingUserId,
      };

      const created = await blogManagementRepository.createBlogCategory(payload);
      logger.info(`Blog category created: ${created.bc_id}`, { createdBy: actingUserId });

      return created;
    } catch (error) {
      logger.error('Error creating blog category:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — Existing Blog Category
  // ─────────────────────────────────────────────────────────────

  /**
   * updateBlogCategory
   * Updates an existing blog category
   * @param {number} id
   * @param {Object} updates
   * @param {number} actingUserId
   * @returns {Object} updated category
   */
  async updateBlogCategory(id, updates, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Blog category ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await blogManagementRepository.findBlogCategoryById(id);
      if (!existing) throw new NotFoundError('Blog category not found');

      const payload = {
        ...updates,
        updatedBy: actingUserId,
      };

      const updated = await blogManagementRepository.updateBlogCategory(id, payload);
      logger.info(`Blog category updated: ${id}`, { updatedBy: actingUserId });

      return updated;
    } catch (error) {
      logger.error(`Error updating blog category ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — Single Blog Category
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteBlogCategory
   * Soft deletes a single blog category
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async deleteBlogCategory(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Blog category ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await blogManagementRepository.findBlogCategoryById(id);
      if (!existing) throw new NotFoundError('Blog category not found');

      await blogManagementRepository.deleteBlogCategory(id);
      logger.info(`Blog category deleted: ${id}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting blog category ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BULK DELETE — Multiple Blog Categories
  // ─────────────────────────────────────────────────────────────

  /**
   * bulkDeleteBlogCategories
   * Soft deletes multiple blog categories in bulk
   * @param {Array<number>} ids
   * @param {number} actingUserId
   * @returns {void}
   */
  async bulkDeleteBlogCategories(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('At least one blog category ID is required');
      }
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await blogManagementRepository.deleteBlogCategories(ids);
      logger.info(`Blog categories bulk deleted: ${ids.length} categories`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error('Error bulk deleting blog categories:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — Single Blog Category
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreBlogCategory
   * Restores a single deleted blog category
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async restoreBlogCategory(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Blog category ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await blogManagementRepository.restoreBlogCategory(id);
      logger.info(`Blog category restored: ${id}`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error(`Error restoring blog category ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BULK RESTORE — Multiple Blog Categories
  // ─────────────────────────────────────────────────────────────

  /**
   * bulkRestoreBlogCategories
   * Restores multiple deleted blog categories in bulk
   * @param {Array<number>} ids
   * @param {number} actingUserId
   * @returns {void}
   */
  async bulkRestoreBlogCategories(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('At least one blog category ID is required');
      }
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await blogManagementRepository.restoreBlogCategories(ids);
      logger.info(`Blog categories bulk restored: ${ids.length} categories`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error('Error bulk restoring blog categories:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — Blog Category Translation
  // ─────────────────────────────────────────────────────────────

  /**
   * createBlogCategoryTranslation
   * Creates a new blog category translation
   * @param {Object} translationData
   * @param {number} actingUserId
   * @returns {Object} created translation
   */
  async createBlogCategoryTranslation(translationData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!translationData.blogCategoryId) throw new BadRequestError('Blog category ID is required');
      if (!translationData.language) throw new BadRequestError('Language is required');

      const payload = {
        ...translationData,
        createdBy: actingUserId,
      };

      const created = await blogManagementRepository.createBlogCategoryTranslation(payload);
      logger.info(`Blog category translation created: ${created.bct_id}`, { createdBy: actingUserId });

      return created;
    } catch (error) {
      logger.error('Error creating blog category translation:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — Blog Category Translation
  // ─────────────────────────────────────────────────────────────

  /**
   * updateBlogCategoryTranslation
   * Updates an existing blog category translation
   * @param {number} id
   * @param {Object} updates
   * @param {number} actingUserId
   * @returns {Object} updated translation
   */
  async updateBlogCategoryTranslation(id, updates, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Blog category translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await blogManagementRepository.findBlogCategoryTranslationById(id);
      if (!existing) throw new NotFoundError('Blog category translation not found');

      const payload = {
        ...updates,
        updatedBy: actingUserId,
      };

      const updated = await blogManagementRepository.updateBlogCategoryTranslation(id, payload);
      logger.info(`Blog category translation updated: ${id}`, { updatedBy: actingUserId });

      return updated;
    } catch (error) {
      logger.error(`Error updating blog category translation ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — Blog Category Translation
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteBlogCategoryTranslation
   * Soft deletes a blog category translation
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async deleteBlogCategoryTranslation(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Blog category translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await blogManagementRepository.findBlogCategoryTranslationById(id);
      if (!existing) throw new NotFoundError('Blog category translation not found');

      await blogManagementRepository.deleteBlogCategoryTranslation(id);
      logger.info(`Blog category translation deleted: ${id}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting blog category translation ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — Blog Category Translation
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreBlogCategoryTranslation
   * Restores a deleted blog category translation
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async restoreBlogCategoryTranslation(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Blog category translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await blogManagementRepository.restoreBlogCategoryTranslation(id);
      logger.info(`Blog category translation restored: ${id}`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error(`Error restoring blog category translation ${id}:`, error);
      throw error;
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  BLOGS
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // LIST — Blogs
  // ─────────────────────────────────────────────────────────────

  /**
   * getBlogs
   * Fetches a list of blogs with filtering and pagination
   * @param {Object} options
   * @returns {Array} blogs with pagination metadata
   */
  async getBlogs(options = {}) {
    try {
      return await blogManagementRepository.getBlogs(options);
    } catch (error) {
      logger.error('Error fetching blogs:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // READ — Single Blog by ID
  // ─────────────────────────────────────────────────────────────

  /**
   * getBlogById
   * Fetches a single blog by ID
   * @param {number} id
   * @returns {Object} blog
   */
  async getBlogById(id) {
    try {
      if (!id) throw new BadRequestError('Blog ID is required');

      const result = await blogManagementRepository.findBlogById(id);
      if (!result) throw new NotFoundError('Blog not found');

      return result;
    } catch (error) {
      logger.error(`Error fetching blog ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // READ — Blogs as JSON
  // ─────────────────────────────────────────────────────────────

  /**
   * getBlogsJSON
   * Fetches blogs in JSON structure
   * @returns {Object} JSONB array of blogs
   */
  async getBlogsJSON() {
    try {
      return await blogManagementRepository.getBlogsJSON();
    } catch (error) {
      logger.error('Error fetching blogs JSON:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — New Blog
  // ─────────────────────────────────────────────────────────────

  /**
   * createBlog
   * Creates a new blog
   * @param {Object} blogData
   * @param {number} actingUserId
   * @returns {Object} created blog
   */
  async createBlog(blogData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!blogData.title) throw new BadRequestError('Blog title is required');

      const payload = {
        ...blogData,
        createdBy: actingUserId,
      };

      const created = await blogManagementRepository.createBlog(payload);
      logger.info(`Blog created: ${created.b_id}`, { createdBy: actingUserId });

      return created;
    } catch (error) {
      logger.error('Error creating blog:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — Existing Blog
  // ─────────────────────────────────────────────────────────────

  /**
   * updateBlog
   * Updates an existing blog
   * @param {number} id
   * @param {Object} updates
   * @param {number} actingUserId
   * @returns {Object} updated blog
   */
  async updateBlog(id, updates, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Blog ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await blogManagementRepository.findBlogById(id);
      if (!existing) throw new NotFoundError('Blog not found');

      const payload = {
        ...updates,
        updatedBy: actingUserId,
      };

      const updated = await blogManagementRepository.updateBlog(id, payload);
      logger.info(`Blog updated: ${id}`, { updatedBy: actingUserId });

      return updated;
    } catch (error) {
      logger.error(`Error updating blog ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — Single Blog
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteBlog
   * Soft deletes a single blog
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async deleteBlog(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Blog ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await blogManagementRepository.findBlogById(id);
      if (!existing) throw new NotFoundError('Blog not found');

      await blogManagementRepository.deleteBlog(id);
      logger.info(`Blog deleted: ${id}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting blog ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BULK DELETE — Multiple Blogs
  // ─────────────────────────────────────────────────────────────

  /**
   * bulkDeleteBlogs
   * Soft deletes multiple blogs in bulk
   * @param {Array<number>} ids
   * @param {number} actingUserId
   * @returns {void}
   */
  async bulkDeleteBlogs(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('At least one blog ID is required');
      }
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await blogManagementRepository.deleteBlogs(ids);
      logger.info(`Blogs bulk deleted: ${ids.length} blogs`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error('Error bulk deleting blogs:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — Single Blog
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreBlog
   * Restores a single deleted blog
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async restoreBlog(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Blog ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await blogManagementRepository.restoreBlog(id);
      logger.info(`Blog restored: ${id}`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error(`Error restoring blog ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BULK RESTORE — Multiple Blogs
  // ─────────────────────────────────────────────────────────────

  /**
   * bulkRestoreBlogs
   * Restores multiple deleted blogs in bulk
   * @param {Array<number>} ids
   * @param {number} actingUserId
   * @returns {void}
   */
  async bulkRestoreBlogs(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('At least one blog ID is required');
      }
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await blogManagementRepository.restoreBlogs(ids);
      logger.info(`Blogs bulk restored: ${ids.length} blogs`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error('Error bulk restoring blogs:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — Blog Translation
  // ─────────────────────────────────────────────────────────────

  /**
   * createBlogTranslation
   * Creates a new blog translation
   * @param {Object} translationData
   * @param {number} actingUserId
   * @returns {Object} created translation
   */
  async createBlogTranslation(translationData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!translationData.blogId) throw new BadRequestError('Blog ID is required');
      if (!translationData.language) throw new BadRequestError('Language is required');

      const payload = {
        ...translationData,
        createdBy: actingUserId,
      };

      const created = await blogManagementRepository.createBlogTranslation(payload);
      logger.info(`Blog translation created: ${created.bt_id}`, { createdBy: actingUserId });

      return created;
    } catch (error) {
      logger.error('Error creating blog translation:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — Blog Translation
  // ─────────────────────────────────────────────────────────────

  /**
   * updateBlogTranslation
   * Updates an existing blog translation
   * @param {number} id
   * @param {Object} updates
   * @param {number} actingUserId
   * @returns {Object} updated translation
   */
  async updateBlogTranslation(id, updates, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Blog translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await blogManagementRepository.findBlogTranslationById(id);
      if (!existing) throw new NotFoundError('Blog translation not found');

      const payload = {
        ...updates,
        updatedBy: actingUserId,
      };

      const updated = await blogManagementRepository.updateBlogTranslation(id, payload);
      logger.info(`Blog translation updated: ${id}`, { updatedBy: actingUserId });

      return updated;
    } catch (error) {
      logger.error(`Error updating blog translation ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — Blog Translation
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteBlogTranslation
   * Soft deletes a blog translation
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async deleteBlogTranslation(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Blog translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await blogManagementRepository.findBlogTranslationById(id);
      if (!existing) throw new NotFoundError('Blog translation not found');

      await blogManagementRepository.deleteBlogTranslation(id);
      logger.info(`Blog translation deleted: ${id}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting blog translation ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — Blog Translation
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreBlogTranslation
   * Restores a deleted blog translation
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async restoreBlogTranslation(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Blog translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await blogManagementRepository.restoreBlogTranslation(id);
      logger.info(`Blog translation restored: ${id}`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error(`Error restoring blog translation ${id}:`, error);
      throw error;
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  CONTENT BLOCKS
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // LIST — Content Blocks
  // ─────────────────────────────────────────────────────────────

  /**
   * getContentBlocks
   * Fetches a list of content blocks with filtering and pagination
   * @param {Object} options
   * @returns {Array} content blocks with pagination metadata
   */
  async getContentBlocks(options = {}) {
    try {
      return await blogManagementRepository.getContentBlocks(options);
    } catch (error) {
      logger.error('Error fetching content blocks:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // READ — Single Content Block by ID
  // ─────────────────────────────────────────────────────────────

  /**
   * getContentBlockById
   * Fetches a single content block by ID
   * @param {number} id
   * @returns {Object} content block
   */
  async getContentBlockById(id) {
    try {
      if (!id) throw new BadRequestError('Content block ID is required');

      const result = await blogManagementRepository.findContentBlockById(id);
      if (!result) throw new NotFoundError('Content block not found');

      return result;
    } catch (error) {
      logger.error(`Error fetching content block ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — New Content Block
  // ─────────────────────────────────────────────────────────────

  /**
   * createContentBlock
   * Creates a new content block
   * @param {Object} blockData
   * @param {number} actingUserId
   * @returns {Object} created content block
   */
  async createContentBlock(blockData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!blockData.blogId) throw new BadRequestError('Blog ID is required');
      if (!blockData.blockType) throw new BadRequestError('Block type is required');

      const payload = {
        ...blockData,
        createdBy: actingUserId,
      };

      const created = await blogManagementRepository.createContentBlock(payload);
      logger.info(`Content block created: ${created.cb_id}`, { createdBy: actingUserId });

      return created;
    } catch (error) {
      logger.error('Error creating content block:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — Existing Content Block
  // ─────────────────────────────────────────────────────────────

  /**
   * updateContentBlock
   * Updates an existing content block
   * @param {number} id
   * @param {Object} updates
   * @param {number} actingUserId
   * @returns {Object} updated content block
   */
  async updateContentBlock(id, updates, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Content block ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await blogManagementRepository.findContentBlockById(id);
      if (!existing) throw new NotFoundError('Content block not found');

      const payload = {
        ...updates,
        updatedBy: actingUserId,
      };

      const updated = await blogManagementRepository.updateContentBlock(id, payload);
      logger.info(`Content block updated: ${id}`, { updatedBy: actingUserId });

      return updated;
    } catch (error) {
      logger.error(`Error updating content block ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — Single Content Block
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteContentBlock
   * Soft deletes a single content block
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async deleteContentBlock(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Content block ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await blogManagementRepository.findContentBlockById(id);
      if (!existing) throw new NotFoundError('Content block not found');

      await blogManagementRepository.deleteContentBlock(id);
      logger.info(`Content block deleted: ${id}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting content block ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BULK DELETE — Multiple Content Blocks
  // ─────────────────────────────────────────────────────────────

  /**
   * bulkDeleteContentBlocks
   * Soft deletes multiple content blocks in bulk
   * @param {Array<number>} ids
   * @param {number} actingUserId
   * @returns {void}
   */
  async bulkDeleteContentBlocks(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('At least one content block ID is required');
      }
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await blogManagementRepository.deleteContentBlocks(ids);
      logger.info(`Content blocks bulk deleted: ${ids.length} blocks`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error('Error bulk deleting content blocks:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — Single Content Block
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreContentBlock
   * Restores a single deleted content block
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async restoreContentBlock(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Content block ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await blogManagementRepository.restoreContentBlock(id);
      logger.info(`Content block restored: ${id}`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error(`Error restoring content block ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BULK RESTORE — Multiple Content Blocks
  // ─────────────────────────────────────────────────────────────

  /**
   * bulkRestoreContentBlocks
   * Restores multiple deleted content blocks in bulk
   * @param {Array<number>} ids
   * @param {number} actingUserId
   * @returns {void}
   */
  async bulkRestoreContentBlocks(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('At least one content block ID is required');
      }
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await blogManagementRepository.restoreContentBlocks(ids);
      logger.info(`Content blocks bulk restored: ${ids.length} blocks`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error('Error bulk restoring content blocks:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — Content Block Translation
  // ─────────────────────────────────────────────────────────────

  /**
   * createContentBlockTranslation
   * Creates a new content block translation
   * @param {Object} translationData
   * @param {number} actingUserId
   * @returns {Object} created translation
   */
  async createContentBlockTranslation(translationData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!translationData.contentBlockId) throw new BadRequestError('Content block ID is required');
      if (!translationData.language) throw new BadRequestError('Language is required');

      const payload = {
        ...translationData,
        createdBy: actingUserId,
      };

      const created = await blogManagementRepository.createContentBlockTranslation(payload);
      logger.info(`Content block translation created: ${created.cbt_id}`, { createdBy: actingUserId });

      return created;
    } catch (error) {
      logger.error('Error creating content block translation:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — Content Block Translation
  // ─────────────────────────────────────────────────────────────

  /**
   * updateContentBlockTranslation
   * Updates an existing content block translation
   * @param {number} id
   * @param {Object} updates
   * @param {number} actingUserId
   * @returns {Object} updated translation
   */
  async updateContentBlockTranslation(id, updates, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Content block translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await blogManagementRepository.findContentBlockTranslationById(id);
      if (!existing) throw new NotFoundError('Content block translation not found');

      const payload = {
        ...updates,
        updatedBy: actingUserId,
      };

      const updated = await blogManagementRepository.updateContentBlockTranslation(id, payload);
      logger.info(`Content block translation updated: ${id}`, { updatedBy: actingUserId });

      return updated;
    } catch (error) {
      logger.error(`Error updating content block translation ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — Content Block Translation
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteContentBlockTranslation
   * Soft deletes a content block translation
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async deleteContentBlockTranslation(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Content block translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await blogManagementRepository.findContentBlockTranslationById(id);
      if (!existing) throw new NotFoundError('Content block translation not found');

      await blogManagementRepository.deleteContentBlockTranslation(id);
      logger.info(`Content block translation deleted: ${id}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting content block translation ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — Content Block Translation
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreContentBlockTranslation
   * Restores a deleted content block translation
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async restoreContentBlockTranslation(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Content block translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await blogManagementRepository.restoreContentBlockTranslation(id);
      logger.info(`Content block translation restored: ${id}`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error(`Error restoring content block translation ${id}:`, error);
      throw error;
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  BLOG TAGS
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // LIST — Blog Tags
  // ─────────────────────────────────────────────────────────────

  /**
   * getBlogTags
   * Fetches a list of blog tags with filtering and pagination
   * @param {Object} options
   * @returns {Array} tags with pagination metadata
   */
  async getBlogTags(options = {}) {
    try {
      return await blogManagementRepository.getBlogTags(options);
    } catch (error) {
      logger.error('Error fetching blog tags:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // READ — Single Blog Tag by ID
  // ─────────────────────────────────────────────────────────────

  /**
   * getBlogTagById
   * Fetches a single blog tag by ID
   * @param {number} id
   * @returns {Object} tag
   */
  async getBlogTagById(id) {
    try {
      if (!id) throw new BadRequestError('Blog tag ID is required');

      const result = await blogManagementRepository.findBlogTagById(id);
      if (!result) throw new NotFoundError('Blog tag not found');

      return result;
    } catch (error) {
      logger.error(`Error fetching blog tag ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — New Blog Tag
  // ─────────────────────────────────────────────────────────────

  /**
   * createBlogTag
   * Creates a new blog tag
   * @param {Object} tagData
   * @param {number} actingUserId
   * @returns {Object} created tag
   */
  async createBlogTag(tagData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!tagData.name) throw new BadRequestError('Tag name is required');

      const payload = {
        ...tagData,
        createdBy: actingUserId,
      };

      const created = await blogManagementRepository.createBlogTag(payload);
      logger.info(`Blog tag created: ${created.bt_id}`, { createdBy: actingUserId });

      return created;
    } catch (error) {
      logger.error('Error creating blog tag:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — Existing Blog Tag
  // ─────────────────────────────────────────────────────────────

  /**
   * updateBlogTag
   * Updates an existing blog tag
   * @param {number} id
   * @param {Object} updates
   * @param {number} actingUserId
   * @returns {Object} updated tag
   */
  async updateBlogTag(id, updates, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Blog tag ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await blogManagementRepository.findBlogTagById(id);
      if (!existing) throw new NotFoundError('Blog tag not found');

      const payload = {
        ...updates,
        updatedBy: actingUserId,
      };

      const updated = await blogManagementRepository.updateBlogTag(id, payload);
      logger.info(`Blog tag updated: ${id}`, { updatedBy: actingUserId });

      return updated;
    } catch (error) {
      logger.error(`Error updating blog tag ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — Single Blog Tag
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteBlogTag
   * Soft deletes a single blog tag
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async deleteBlogTag(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Blog tag ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await blogManagementRepository.findBlogTagById(id);
      if (!existing) throw new NotFoundError('Blog tag not found');

      await blogManagementRepository.deleteBlogTag(id);
      logger.info(`Blog tag deleted: ${id}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting blog tag ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BULK DELETE — Multiple Blog Tags
  // ─────────────────────────────────────────────────────────────

  /**
   * bulkDeleteBlogTags
   * Soft deletes multiple blog tags in bulk
   * @param {Array<number>} ids
   * @param {number} actingUserId
   * @returns {void}
   */
  async bulkDeleteBlogTags(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('At least one blog tag ID is required');
      }
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await blogManagementRepository.deleteBlogTags(ids);
      logger.info(`Blog tags bulk deleted: ${ids.length} tags`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error('Error bulk deleting blog tags:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — Single Blog Tag
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreBlogTag
   * Restores a single deleted blog tag
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async restoreBlogTag(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Blog tag ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await blogManagementRepository.restoreBlogTag(id);
      logger.info(`Blog tag restored: ${id}`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error(`Error restoring blog tag ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BULK RESTORE — Multiple Blog Tags
  // ─────────────────────────────────────────────────────────────

  /**
   * bulkRestoreBlogTags
   * Restores multiple deleted blog tags in bulk
   * @param {Array<number>} ids
   * @param {number} actingUserId
   * @returns {void}
   */
  async bulkRestoreBlogTags(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('At least one blog tag ID is required');
      }
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await blogManagementRepository.restoreBlogTags(ids);
      logger.info(`Blog tags bulk restored: ${ids.length} tags`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error('Error bulk restoring blog tags:', error);
      throw error;
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  BLOG COMMENTS
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // LIST — Blog Comments
  // ─────────────────────────────────────────────────────────────

  /**
   * getBlogComments
   * Fetches a list of blog comments with filtering and pagination
   * @param {Object} options
   * @returns {Array} comments with pagination metadata
   */
  async getBlogComments(options = {}) {
    try {
      return await blogManagementRepository.getBlogComments(options);
    } catch (error) {
      logger.error('Error fetching blog comments:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // READ — Single Blog Comment by ID
  // ─────────────────────────────────────────────────────────────

  /**
   * getBlogCommentById
   * Fetches a single blog comment by ID
   * @param {number} id
   * @returns {Object} comment
   */
  async getBlogCommentById(id) {
    try {
      if (!id) throw new BadRequestError('Blog comment ID is required');

      const result = await blogManagementRepository.findBlogCommentById(id);
      if (!result) throw new NotFoundError('Blog comment not found');

      return result;
    } catch (error) {
      logger.error(`Error fetching blog comment ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — New Blog Comment
  // ─────────────────────────────────────────────────────────────

  /**
   * createBlogComment
   * Creates a new blog comment
   * @param {Object} commentData
   * @param {number} actingUserId
   * @returns {Object} created comment
   */
  async createBlogComment(commentData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!commentData.blogId) throw new BadRequestError('Blog ID is required');
      if (!commentData.comment) throw new BadRequestError('Comment text is required');

      const payload = {
        ...commentData,
        userId: actingUserId,
        createdBy: actingUserId,
      };

      const created = await blogManagementRepository.createBlogComment(payload);
      logger.info(`Blog comment created: ${created.bc_id}`, { createdBy: actingUserId });

      return created;
    } catch (error) {
      logger.error('Error creating blog comment:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — Existing Blog Comment
  // ─────────────────────────────────────────────────────────────

  /**
   * updateBlogComment
   * Updates an existing blog comment
   * @param {number} id
   * @param {Object} updates
   * @param {number} actingUserId
   * @returns {Object} updated comment
   */
  async updateBlogComment(id, updates, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Blog comment ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await blogManagementRepository.findBlogCommentById(id);
      if (!existing) throw new NotFoundError('Blog comment not found');

      const payload = {
        ...updates,
        updatedBy: actingUserId,
      };

      const updated = await blogManagementRepository.updateBlogComment(id, payload);
      logger.info(`Blog comment updated: ${id}`, { updatedBy: actingUserId });

      return updated;
    } catch (error) {
      logger.error(`Error updating blog comment ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — Single Blog Comment
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteBlogComment
   * Soft deletes a single blog comment
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async deleteBlogComment(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Blog comment ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await blogManagementRepository.findBlogCommentById(id);
      if (!existing) throw new NotFoundError('Blog comment not found');

      await blogManagementRepository.deleteBlogComment(id);
      logger.info(`Blog comment deleted: ${id}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting blog comment ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BULK DELETE — Multiple Blog Comments
  // ─────────────────────────────────────────────────────────────

  /**
   * bulkDeleteBlogComments
   * Soft deletes multiple blog comments in bulk
   * @param {Array<number>} ids
   * @param {number} actingUserId
   * @returns {void}
   */
  async bulkDeleteBlogComments(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('At least one blog comment ID is required');
      }
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await blogManagementRepository.deleteBlogComments(ids);
      logger.info(`Blog comments bulk deleted: ${ids.length} comments`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error('Error bulk deleting blog comments:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — Single Blog Comment
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreBlogComment
   * Restores a single deleted blog comment
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async restoreBlogComment(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Blog comment ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await blogManagementRepository.restoreBlogComment(id);
      logger.info(`Blog comment restored: ${id}`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error(`Error restoring blog comment ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BULK RESTORE — Multiple Blog Comments
  // ─────────────────────────────────────────────────────────────

  /**
   * bulkRestoreBlogComments
   * Restores multiple deleted blog comments in bulk
   * @param {Array<number>} ids
   * @param {number} actingUserId
   * @returns {void}
   */
  async bulkRestoreBlogComments(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('At least one blog comment ID is required');
      }
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await blogManagementRepository.restoreBlogComments(ids);
      logger.info(`Blog comments bulk restored: ${ids.length} comments`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error('Error bulk restoring blog comments:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — Blog Comment Translation
  // ─────────────────────────────────────────────────────────────

  /**
   * createBlogCommentTranslation
   * Creates a new blog comment translation
   * @param {Object} translationData
   * @param {number} actingUserId
   * @returns {Object} created translation
   */
  async createBlogCommentTranslation(translationData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!translationData.blogCommentId) throw new BadRequestError('Blog comment ID is required');
      if (!translationData.language) throw new BadRequestError('Language is required');

      const payload = {
        ...translationData,
        createdBy: actingUserId,
      };

      const created = await blogManagementRepository.createBlogCommentTranslation(payload);
      logger.info(`Blog comment translation created: ${created.bct_id}`, { createdBy: actingUserId });

      return created;
    } catch (error) {
      logger.error('Error creating blog comment translation:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — Blog Comment Translation
  // ─────────────────────────────────────────────────────────────

  /**
   * updateBlogCommentTranslation
   * Updates an existing blog comment translation
   * @param {number} id
   * @param {Object} updates
   * @param {number} actingUserId
   * @returns {Object} updated translation
   */
  async updateBlogCommentTranslation(id, updates, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Blog comment translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await blogManagementRepository.findBlogCommentTranslationById(id);
      if (!existing) throw new NotFoundError('Blog comment translation not found');

      const payload = {
        ...updates,
        updatedBy: actingUserId,
      };

      const updated = await blogManagementRepository.updateBlogCommentTranslation(id, payload);
      logger.info(`Blog comment translation updated: ${id}`, { updatedBy: actingUserId });

      return updated;
    } catch (error) {
      logger.error(`Error updating blog comment translation ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — Blog Comment Translation
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteBlogCommentTranslation
   * Soft deletes a blog comment translation
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async deleteBlogCommentTranslation(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Blog comment translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await blogManagementRepository.findBlogCommentTranslationById(id);
      if (!existing) throw new NotFoundError('Blog comment translation not found');

      await blogManagementRepository.deleteBlogCommentTranslation(id);
      logger.info(`Blog comment translation deleted: ${id}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting blog comment translation ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — Blog Comment Translation
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreBlogCommentTranslation
   * Restores a deleted blog comment translation
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async restoreBlogCommentTranslation(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Blog comment translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await blogManagementRepository.restoreBlogCommentTranslation(id);
      logger.info(`Blog comment translation restored: ${id}`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error(`Error restoring blog comment translation ${id}:`, error);
      throw error;
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  BLOG LIKES
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // LIST — Blog Likes
  // ─────────────────────────────────────────────────────────────

  /**
   * getBlogLikes
   * Fetches a list of blog likes with filtering and pagination
   * @param {Object} options
   * @returns {Array} likes with pagination metadata
   */
  async getBlogLikes(options = {}) {
    try {
      return await blogManagementRepository.getBlogLikes(options);
    } catch (error) {
      logger.error('Error fetching blog likes:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // READ — Single Blog Like by ID
  // ─────────────────────────────────────────────────────────────

  /**
   * getBlogLikeById
   * Fetches a single blog like by ID
   * @param {number} id
   * @returns {Object} like
   */
  async getBlogLikeById(id) {
    try {
      if (!id) throw new BadRequestError('Blog like ID is required');

      const result = await blogManagementRepository.findBlogLikeById(id);
      if (!result) throw new NotFoundError('Blog like not found');

      return result;
    } catch (error) {
      logger.error(`Error fetching blog like ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — New Blog Like
  // ─────────────────────────────────────────────────────────────

  /**
   * createBlogLike
   * Creates a new blog like
   * @param {Object} likeData
   * @param {number} actingUserId
   * @returns {Object} created like
   */
  async createBlogLike(likeData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!likeData.blogId) throw new BadRequestError('Blog ID is required');

      const payload = {
        ...likeData,
        userId: actingUserId,
        createdBy: actingUserId,
      };

      const created = await blogManagementRepository.createBlogLike(payload);
      logger.info(`Blog like created: ${created.bl_id}`, { createdBy: actingUserId });

      return created;
    } catch (error) {
      logger.error('Error creating blog like:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — Existing Blog Like
  // ─────────────────────────────────────────────────────────────

  /**
   * updateBlogLike
   * Updates an existing blog like
   * @param {number} id
   * @param {Object} updates
   * @param {number} actingUserId
   * @returns {Object} updated like
   */
  async updateBlogLike(id, updates, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Blog like ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await blogManagementRepository.findBlogLikeById(id);
      if (!existing) throw new NotFoundError('Blog like not found');

      const payload = {
        ...updates,
        updatedBy: actingUserId,
      };

      const updated = await blogManagementRepository.updateBlogLike(id, payload);
      logger.info(`Blog like updated: ${id}`, { updatedBy: actingUserId });

      return updated;
    } catch (error) {
      logger.error(`Error updating blog like ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — Single Blog Like
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteBlogLike
   * Soft deletes a single blog like
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async deleteBlogLike(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Blog like ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await blogManagementRepository.findBlogLikeById(id);
      if (!existing) throw new NotFoundError('Blog like not found');

      await blogManagementRepository.deleteBlogLike(id);
      logger.info(`Blog like deleted: ${id}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting blog like ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — Single Blog Like
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreBlogLike
   * Restores a single deleted blog like
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async restoreBlogLike(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Blog like ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await blogManagementRepository.restoreBlogLike(id);
      logger.info(`Blog like restored: ${id}`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error(`Error restoring blog like ${id}:`, error);
      throw error;
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  BLOG FOLLOWS
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // LIST — Blog Follows
  // ─────────────────────────────────────────────────────────────

  /**
   * getBlogFollows
   * Fetches a list of blog follows with filtering and pagination
   * @param {Object} options
   * @returns {Array} follows with pagination metadata
   */
  async getBlogFollows(options = {}) {
    try {
      return await blogManagementRepository.getBlogFollows(options);
    } catch (error) {
      logger.error('Error fetching blog follows:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // READ — Single Blog Follow by ID
  // ─────────────────────────────────────────────────────────────

  /**
   * getBlogFollowById
   * Fetches a single blog follow by ID
   * @param {number} id
   * @returns {Object} follow
   */
  async getBlogFollowById(id) {
    try {
      if (!id) throw new BadRequestError('Blog follow ID is required');

      const result = await blogManagementRepository.findBlogFollowById(id);
      if (!result) throw new NotFoundError('Blog follow not found');

      return result;
    } catch (error) {
      logger.error(`Error fetching blog follow ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — New Blog Follow
  // ─────────────────────────────────────────────────────────────

  /**
   * createBlogFollow
   * Creates a new blog follow
   * @param {Object} followData
   * @param {number} actingUserId
   * @returns {Object} created follow
   */
  async createBlogFollow(followData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!followData.blogId) throw new BadRequestError('Blog ID is required');

      const payload = {
        ...followData,
        userId: actingUserId,
        createdBy: actingUserId,
      };

      const created = await blogManagementRepository.createBlogFollow(payload);
      logger.info(`Blog follow created: ${created.bf_id}`, { createdBy: actingUserId });

      return created;
    } catch (error) {
      logger.error('Error creating blog follow:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — Existing Blog Follow
  // ─────────────────────────────────────────────────────────────

  /**
   * updateBlogFollow
   * Updates an existing blog follow
   * @param {number} id
   * @param {Object} updates
   * @param {number} actingUserId
   * @returns {Object} updated follow
   */
  async updateBlogFollow(id, updates, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Blog follow ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await blogManagementRepository.findBlogFollowById(id);
      if (!existing) throw new NotFoundError('Blog follow not found');

      const payload = {
        ...updates,
        updatedBy: actingUserId,
      };

      const updated = await blogManagementRepository.updateBlogFollow(id, payload);
      logger.info(`Blog follow updated: ${id}`, { updatedBy: actingUserId });

      return updated;
    } catch (error) {
      logger.error(`Error updating blog follow ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — Single Blog Follow
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteBlogFollow
   * Soft deletes a single blog follow
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async deleteBlogFollow(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Blog follow ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await blogManagementRepository.findBlogFollowById(id);
      if (!existing) throw new NotFoundError('Blog follow not found');

      await blogManagementRepository.deleteBlogFollow(id);
      logger.info(`Blog follow deleted: ${id}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting blog follow ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — Single Blog Follow
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreBlogFollow
   * Restores a single deleted blog follow
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async restoreBlogFollow(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Blog follow ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await blogManagementRepository.restoreBlogFollow(id);
      logger.info(`Blog follow restored: ${id}`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error(`Error restoring blog follow ${id}:`, error);
      throw error;
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  BLOG RELATED COURSES
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // LIST — Related Courses
  // ─────────────────────────────────────────────────────────────

  /**
   * getRelatedCourses
   * Fetches a list of related courses with filtering and pagination
   * @param {Object} options
   * @returns {Array} related courses with pagination metadata
   */
  async getRelatedCourses(options = {}) {
    try {
      return await blogManagementRepository.getRelatedCourses(options);
    } catch (error) {
      logger.error('Error fetching related courses:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // READ — Single Related Course by ID
  // ─────────────────────────────────────────────────────────────

  /**
   * getRelatedCourseById
   * Fetches a single related course by ID
   * @param {number} id
   * @returns {Object} related course
   */
  async getRelatedCourseById(id) {
    try {
      if (!id) throw new BadRequestError('Related course ID is required');

      const result = await blogManagementRepository.findRelatedCourseById(id);
      if (!result) throw new NotFoundError('Related course not found');

      return result;
    } catch (error) {
      logger.error(`Error fetching related course ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — New Related Course
  // ─────────────────────────────────────────────────────────────

  /**
   * createRelatedCourse
   * Creates a new related course
   * @param {Object} courseData
   * @param {number} actingUserId
   * @returns {Object} created related course
   */
  async createRelatedCourse(courseData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!courseData.blogId) throw new BadRequestError('Blog ID is required');
      if (!courseData.courseId) throw new BadRequestError('Course ID is required');

      const payload = {
        ...courseData,
        createdBy: actingUserId,
      };

      const created = await blogManagementRepository.createRelatedCourse(payload);
      logger.info(`Related course created: ${created.brc_id}`, { createdBy: actingUserId });

      return created;
    } catch (error) {
      logger.error('Error creating related course:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — Existing Related Course
  // ─────────────────────────────────────────────────────────────

  /**
   * updateRelatedCourse
   * Updates an existing related course
   * @param {number} id
   * @param {Object} updates
   * @param {number} actingUserId
   * @returns {Object} updated related course
   */
  async updateRelatedCourse(id, updates, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Related course ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await blogManagementRepository.findRelatedCourseById(id);
      if (!existing) throw new NotFoundError('Related course not found');

      const payload = {
        ...updates,
        updatedBy: actingUserId,
      };

      const updated = await blogManagementRepository.updateRelatedCourse(id, payload);
      logger.info(`Related course updated: ${id}`, { updatedBy: actingUserId });

      return updated;
    } catch (error) {
      logger.error(`Error updating related course ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — Single Related Course
  // ─────────────────────────────────────────────────────────────

  /**
   * deleteRelatedCourse
   * Soft deletes a single related course
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async deleteRelatedCourse(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Related course ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await blogManagementRepository.findRelatedCourseById(id);
      if (!existing) throw new NotFoundError('Related course not found');

      await blogManagementRepository.deleteRelatedCourse(id);
      logger.info(`Related course deleted: ${id}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting related course ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BULK DELETE — Multiple Related Courses
  // ─────────────────────────────────────────────────────────────

  /**
   * bulkDeleteRelatedCourses
   * Soft deletes multiple related courses in bulk
   * @param {Array<number>} ids
   * @param {number} actingUserId
   * @returns {void}
   */
  async bulkDeleteRelatedCourses(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('At least one related course ID is required');
      }
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await blogManagementRepository.deleteRelatedCourses(ids);
      logger.info(`Related courses bulk deleted: ${ids.length} courses`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error('Error bulk deleting related courses:', error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — Single Related Course
  // ─────────────────────────────────────────────────────────────

  /**
   * restoreRelatedCourse
   * Restores a single deleted related course
   * @param {number} id
   * @param {number} actingUserId
   * @returns {void}
   */
  async restoreRelatedCourse(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Related course ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await blogManagementRepository.restoreRelatedCourse(id);
      logger.info(`Related course restored: ${id}`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error(`Error restoring related course ${id}:`, error);
      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // BULK RESTORE — Multiple Related Courses
  // ─────────────────────────────────────────────────────────────

  /**
   * bulkRestoreRelatedCourses
   * Restores multiple deleted related courses in bulk
   * @param {Array<number>} ids
   * @param {number} actingUserId
   * @returns {void}
   */
  async bulkRestoreRelatedCourses(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('At least one related course ID is required');
      }
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await blogManagementRepository.restoreRelatedCourses(ids);
      logger.info(`Related courses bulk restored: ${ids.length} courses`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error('Error bulk restoring related courses:', error);
      throw error;
    }
  }
}

module.exports = new BlogManagementService();
