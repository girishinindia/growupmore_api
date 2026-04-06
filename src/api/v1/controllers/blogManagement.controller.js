const blogManagementService = require('../../../services/blogManagement.service');
const { sendSuccess, sendCreated } = require('../../../utils/response');

class BlogManagementController {
  // ═════════════════════════════════════════════════════════════
  //  BLOG CATEGORIES
  // ═════════════════════════════════════════════════════════════

  /**
   * getBlogCategories
   * Retrieves a list of blog categories with filtering and pagination
   */
  async getBlogCategories(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        searchTerm,
        sortBy,
        sortDir,
      } = req.query;

      const data = await blogManagementService.getBlogCategories({
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

      sendSuccess(res, { data, message: 'Blog categories retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  /**
   * getBlogCategoryById
   * Retrieves a single blog category by ID
   */
  async getBlogCategoryById(req, res, next) {
    try {
      const data = await blogManagementService.getBlogCategoryById(req.params.id);
      sendSuccess(res, { data, message: 'Blog category retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * getBlogCategoriesJSON
   * Retrieves blog categories in JSON format
   */
  async getBlogCategoriesJSON(req, res, next) {
    try {
      const data = await blogManagementService.getBlogCategoriesJSON();
      sendSuccess(res, { data, message: 'Blog categories JSON retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * createBlogCategory
   * Creates a new blog category
   */
  async createBlogCategory(req, res, next) {
    try {
      const data = await blogManagementService.createBlogCategory(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Blog category created successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * updateBlogCategory
   * Updates an existing blog category
   */
  async updateBlogCategory(req, res, next) {
    try {
      const data = await blogManagementService.updateBlogCategory(
        req.params.id,
        req.body,
        req.user.userId,
      );
      sendSuccess(res, { data, message: 'Blog category updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * deleteBlogCategory
   * Soft deletes a single blog category
   */
  async deleteBlogCategory(req, res, next) {
    try {
      await blogManagementService.deleteBlogCategory(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Blog category deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * bulkDeleteBlogCategories
   * Soft deletes multiple blog categories in bulk
   */
  async bulkDeleteBlogCategories(req, res, next) {
    try {
      const { ids } = req.body;
      await blogManagementService.bulkDeleteBlogCategories(ids, req.user.userId);
      sendSuccess(res, { message: 'Blog categories deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * restoreBlogCategory
   * Restores a single deleted blog category
   */
  async restoreBlogCategory(req, res, next) {
    try {
      await blogManagementService.restoreBlogCategory(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Blog category restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * bulkRestoreBlogCategories
   * Restores multiple deleted blog categories in bulk
   */
  async bulkRestoreBlogCategories(req, res, next) {
    try {
      const { ids } = req.body;
      await blogManagementService.bulkRestoreBlogCategories(ids, req.user.userId);
      sendSuccess(res, { message: 'Blog categories restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * createBlogCategoryTranslation
   * Creates a translation for a blog category
   */
  async createBlogCategoryTranslation(req, res, next) {
    try {
      const data = await blogManagementService.createBlogCategoryTranslation(
        req.params.categoryId,
        req.body,
        req.user.userId,
      );
      sendCreated(res, { data, message: 'Blog category translation created successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * updateBlogCategoryTranslation
   * Updates a blog category translation
   */
  async updateBlogCategoryTranslation(req, res, next) {
    try {
      const data = await blogManagementService.updateBlogCategoryTranslation(
        req.params.id,
        req.body,
        req.user.userId,
      );
      sendSuccess(res, { data, message: 'Blog category translation updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * deleteBlogCategoryTranslation
   * Soft deletes a blog category translation
   */
  async deleteBlogCategoryTranslation(req, res, next) {
    try {
      await blogManagementService.deleteBlogCategoryTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Blog category translation deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * restoreBlogCategoryTranslation
   * Restores a deleted blog category translation
   */
  async restoreBlogCategoryTranslation(req, res, next) {
    try {
      await blogManagementService.restoreBlogCategoryTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Blog category translation restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  BLOGS
  // ═════════════════════════════════════════════════════════════

  /**
   * getBlogs
   * Retrieves a list of blogs with filtering and pagination
   */
  async getBlogs(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        categoryId,
        userId,
        isPublished,
        searchTerm,
        sortBy,
        sortDir,
      } = req.query;

      const data = await blogManagementService.getBlogs({
        categoryId: categoryId || null,
        userId: userId || null,
        isPublished: isPublished != null ? isPublished : null,
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

      sendSuccess(res, { data, message: 'Blogs retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  /**
   * getBlogById
   * Retrieves a single blog by ID
   */
  async getBlogById(req, res, next) {
    try {
      const data = await blogManagementService.getBlogById(req.params.id);
      sendSuccess(res, { data, message: 'Blog retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * getBlogsJSON
   * Retrieves blogs in JSON format
   */
  async getBlogsJSON(req, res, next) {
    try {
      const data = await blogManagementService.getBlogsJSON();
      sendSuccess(res, { data, message: 'Blogs JSON retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * createBlog
   * Creates a new blog
   */
  async createBlog(req, res, next) {
    try {
      const data = await blogManagementService.createBlog(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Blog created successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * updateBlog
   * Updates an existing blog
   */
  async updateBlog(req, res, next) {
    try {
      const data = await blogManagementService.updateBlog(
        req.params.id,
        req.body,
        req.user.userId,
      );
      sendSuccess(res, { data, message: 'Blog updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * deleteBlog
   * Soft deletes a single blog
   */
  async deleteBlog(req, res, next) {
    try {
      await blogManagementService.deleteBlog(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Blog deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * bulkDeleteBlogs
   * Soft deletes multiple blogs in bulk
   */
  async bulkDeleteBlogs(req, res, next) {
    try {
      const { ids } = req.body;
      await blogManagementService.bulkDeleteBlogs(ids, req.user.userId);
      sendSuccess(res, { message: 'Blogs deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * restoreBlog
   * Restores a single deleted blog
   */
  async restoreBlog(req, res, next) {
    try {
      await blogManagementService.restoreBlog(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Blog restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * bulkRestoreBlogs
   * Restores multiple deleted blogs in bulk
   */
  async bulkRestoreBlogs(req, res, next) {
    try {
      const { ids } = req.body;
      await blogManagementService.bulkRestoreBlogs(ids, req.user.userId);
      sendSuccess(res, { message: 'Blogs restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * createBlogTranslation
   * Creates a translation for a blog
   */
  async createBlogTranslation(req, res, next) {
    try {
      const data = await blogManagementService.createBlogTranslation(
        req.params.blogId,
        req.body,
        req.user.userId,
      );
      sendCreated(res, { data, message: 'Blog translation created successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * updateBlogTranslation
   * Updates a blog translation
   */
  async updateBlogTranslation(req, res, next) {
    try {
      const data = await blogManagementService.updateBlogTranslation(
        req.params.id,
        req.body,
        req.user.userId,
      );
      sendSuccess(res, { data, message: 'Blog translation updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * deleteBlogTranslation
   * Soft deletes a blog translation
   */
  async deleteBlogTranslation(req, res, next) {
    try {
      await blogManagementService.deleteBlogTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Blog translation deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * restoreBlogTranslation
   * Restores a deleted blog translation
   */
  async restoreBlogTranslation(req, res, next) {
    try {
      await blogManagementService.restoreBlogTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Blog translation restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  CONTENT BLOCKS
  // ═════════════════════════════════════════════════════════════

  /**
   * getContentBlocks
   * Retrieves a list of content blocks with filtering and pagination
   */
  async getContentBlocks(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        blogId,
        blockType,
        searchTerm,
        sortBy,
        sortDir,
      } = req.query;

      const data = await blogManagementService.getContentBlocks({
        blogId: blogId || null,
        blockType: blockType || null,
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

      sendSuccess(res, { data, message: 'Content blocks retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  /**
   * getContentBlockById
   * Retrieves a single content block by ID
   */
  async getContentBlockById(req, res, next) {
    try {
      const data = await blogManagementService.getContentBlockById(req.params.id);
      sendSuccess(res, { data, message: 'Content block retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * createContentBlock
   * Creates a new content block
   */
  async createContentBlock(req, res, next) {
    try {
      const data = await blogManagementService.createContentBlock(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Content block created successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * updateContentBlock
   * Updates an existing content block
   */
  async updateContentBlock(req, res, next) {
    try {
      const data = await blogManagementService.updateContentBlock(
        req.params.id,
        req.body,
        req.user.userId,
      );
      sendSuccess(res, { data, message: 'Content block updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * deleteContentBlock
   * Soft deletes a single content block
   */
  async deleteContentBlock(req, res, next) {
    try {
      await blogManagementService.deleteContentBlock(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Content block deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * bulkDeleteContentBlocks
   * Soft deletes multiple content blocks in bulk
   */
  async bulkDeleteContentBlocks(req, res, next) {
    try {
      const { ids } = req.body;
      await blogManagementService.bulkDeleteContentBlocks(ids, req.user.userId);
      sendSuccess(res, { message: 'Content blocks deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * restoreContentBlock
   * Restores a single deleted content block
   */
  async restoreContentBlock(req, res, next) {
    try {
      await blogManagementService.restoreContentBlock(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Content block restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * bulkRestoreContentBlocks
   * Restores multiple deleted content blocks in bulk
   */
  async bulkRestoreContentBlocks(req, res, next) {
    try {
      const { ids } = req.body;
      await blogManagementService.bulkRestoreContentBlocks(ids, req.user.userId);
      sendSuccess(res, { message: 'Content blocks restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * createContentBlockTranslation
   * Creates a translation for a content block
   */
  async createContentBlockTranslation(req, res, next) {
    try {
      const data = await blogManagementService.createContentBlockTranslation(
        req.params.blockId,
        req.body,
        req.user.userId,
      );
      sendCreated(res, { data, message: 'Content block translation created successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * updateContentBlockTranslation
   * Updates a content block translation
   */
  async updateContentBlockTranslation(req, res, next) {
    try {
      const data = await blogManagementService.updateContentBlockTranslation(
        req.params.id,
        req.body,
        req.user.userId,
      );
      sendSuccess(res, { data, message: 'Content block translation updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * deleteContentBlockTranslation
   * Soft deletes a content block translation
   */
  async deleteContentBlockTranslation(req, res, next) {
    try {
      await blogManagementService.deleteContentBlockTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Content block translation deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * restoreContentBlockTranslation
   * Restores a deleted content block translation
   */
  async restoreContentBlockTranslation(req, res, next) {
    try {
      await blogManagementService.restoreContentBlockTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Content block translation restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  BLOG TAGS
  // ═════════════════════════════════════════════════════════════

  /**
   * getBlogTags
   * Retrieves a list of blog tags with filtering and pagination
   */
  async getBlogTags(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        searchTerm,
        sortBy,
        sortDir,
      } = req.query;

      const data = await blogManagementService.getBlogTags({
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

      sendSuccess(res, { data, message: 'Blog tags retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  /**
   * getBlogTagById
   * Retrieves a single blog tag by ID
   */
  async getBlogTagById(req, res, next) {
    try {
      const data = await blogManagementService.getBlogTagById(req.params.id);
      sendSuccess(res, { data, message: 'Blog tag retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * createBlogTag
   * Creates a new blog tag
   */
  async createBlogTag(req, res, next) {
    try {
      const data = await blogManagementService.createBlogTag(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Blog tag created successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * updateBlogTag
   * Updates an existing blog tag
   */
  async updateBlogTag(req, res, next) {
    try {
      const data = await blogManagementService.updateBlogTag(
        req.params.id,
        req.body,
        req.user.userId,
      );
      sendSuccess(res, { data, message: 'Blog tag updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * deleteBlogTag
   * Soft deletes a single blog tag
   */
  async deleteBlogTag(req, res, next) {
    try {
      await blogManagementService.deleteBlogTag(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Blog tag deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * bulkDeleteBlogTags
   * Soft deletes multiple blog tags in bulk
   */
  async bulkDeleteBlogTags(req, res, next) {
    try {
      const { ids } = req.body;
      await blogManagementService.bulkDeleteBlogTags(ids, req.user.userId);
      sendSuccess(res, { message: 'Blog tags deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * restoreBlogTag
   * Restores a single deleted blog tag
   */
  async restoreBlogTag(req, res, next) {
    try {
      await blogManagementService.restoreBlogTag(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Blog tag restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * bulkRestoreBlogTags
   * Restores multiple deleted blog tags in bulk
   */
  async bulkRestoreBlogTags(req, res, next) {
    try {
      const { ids } = req.body;
      await blogManagementService.bulkRestoreBlogTags(ids, req.user.userId);
      sendSuccess(res, { message: 'Blog tags restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  BLOG COMMENTS
  // ═════════════════════════════════════════════════════════════

  /**
   * getBlogComments
   * Retrieves a list of blog comments with filtering and pagination
   */
  async getBlogComments(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        blogId,
        userId,
        isApproved,
        searchTerm,
        sortBy,
        sortDir,
      } = req.query;

      const data = await blogManagementService.getBlogComments({
        blogId: blogId || null,
        userId: userId || null,
        isApproved: isApproved != null ? isApproved : null,
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

      sendSuccess(res, { data, message: 'Blog comments retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  /**
   * getBlogCommentById
   * Retrieves a single blog comment by ID
   */
  async getBlogCommentById(req, res, next) {
    try {
      const data = await blogManagementService.getBlogCommentById(req.params.id);
      sendSuccess(res, { data, message: 'Blog comment retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * createBlogComment
   * Creates a new blog comment
   */
  async createBlogComment(req, res, next) {
    try {
      const data = await blogManagementService.createBlogComment(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Blog comment created successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * updateBlogComment
   * Updates an existing blog comment
   */
  async updateBlogComment(req, res, next) {
    try {
      const data = await blogManagementService.updateBlogComment(
        req.params.id,
        req.body,
        req.user.userId,
      );
      sendSuccess(res, { data, message: 'Blog comment updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * deleteBlogComment
   * Soft deletes a single blog comment
   */
  async deleteBlogComment(req, res, next) {
    try {
      await blogManagementService.deleteBlogComment(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Blog comment deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * bulkDeleteBlogComments
   * Soft deletes multiple blog comments in bulk
   */
  async bulkDeleteBlogComments(req, res, next) {
    try {
      const { ids } = req.body;
      await blogManagementService.bulkDeleteBlogComments(ids, req.user.userId);
      sendSuccess(res, { message: 'Blog comments deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * restoreBlogComment
   * Restores a single deleted blog comment
   */
  async restoreBlogComment(req, res, next) {
    try {
      await blogManagementService.restoreBlogComment(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Blog comment restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * bulkRestoreBlogComments
   * Restores multiple deleted blog comments in bulk
   */
  async bulkRestoreBlogComments(req, res, next) {
    try {
      const { ids } = req.body;
      await blogManagementService.bulkRestoreBlogComments(ids, req.user.userId);
      sendSuccess(res, { message: 'Blog comments restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * createBlogCommentTranslation
   * Creates a translation for a blog comment
   */
  async createBlogCommentTranslation(req, res, next) {
    try {
      const data = await blogManagementService.createBlogCommentTranslation(
        req.params.commentId,
        req.body,
        req.user.userId,
      );
      sendCreated(res, { data, message: 'Blog comment translation created successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * updateBlogCommentTranslation
   * Updates a blog comment translation
   */
  async updateBlogCommentTranslation(req, res, next) {
    try {
      const data = await blogManagementService.updateBlogCommentTranslation(
        req.params.id,
        req.body,
        req.user.userId,
      );
      sendSuccess(res, { data, message: 'Blog comment translation updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * deleteBlogCommentTranslation
   * Soft deletes a blog comment translation
   */
  async deleteBlogCommentTranslation(req, res, next) {
    try {
      await blogManagementService.deleteBlogCommentTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Blog comment translation deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * restoreBlogCommentTranslation
   * Restores a deleted blog comment translation
   */
  async restoreBlogCommentTranslation(req, res, next) {
    try {
      await blogManagementService.restoreBlogCommentTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Blog comment translation restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  BLOG LIKES
  // ═════════════════════════════════════════════════════════════

  /**
   * getBlogLikes
   * Retrieves a list of blog likes with filtering and pagination
   */
  async getBlogLikes(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        blogId,
        userId,
        sortBy,
        sortDir,
      } = req.query;

      const data = await blogManagementService.getBlogLikes({
        blogId: blogId || null,
        userId: userId || null,
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

      sendSuccess(res, { data, message: 'Blog likes retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  /**
   * getBlogLikeById
   * Retrieves a single blog like by ID
   */
  async getBlogLikeById(req, res, next) {
    try {
      const data = await blogManagementService.getBlogLikeById(req.params.id);
      sendSuccess(res, { data, message: 'Blog like retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * createBlogLike
   * Creates a new blog like
   */
  async createBlogLike(req, res, next) {
    try {
      const data = await blogManagementService.createBlogLike(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Blog like created successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * updateBlogLike
   * Updates an existing blog like
   */
  async updateBlogLike(req, res, next) {
    try {
      const data = await blogManagementService.updateBlogLike(
        req.params.id,
        req.body,
        req.user.userId,
      );
      sendSuccess(res, { data, message: 'Blog like updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * deleteBlogLike
   * Soft deletes a single blog like
   */
  async deleteBlogLike(req, res, next) {
    try {
      await blogManagementService.deleteBlogLike(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Blog like deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * restoreBlogLike
   * Restores a single deleted blog like
   */
  async restoreBlogLike(req, res, next) {
    try {
      await blogManagementService.restoreBlogLike(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Blog like restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  BLOG FOLLOWS
  // ═════════════════════════════════════════════════════════════

  /**
   * getBlogFollows
   * Retrieves a list of blog follows with filtering and pagination
   */
  async getBlogFollows(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        blogId,
        userId,
        sortBy,
        sortDir,
      } = req.query;

      const data = await blogManagementService.getBlogFollows({
        blogId: blogId || null,
        userId: userId || null,
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

      sendSuccess(res, { data, message: 'Blog follows retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  /**
   * getBlogFollowById
   * Retrieves a single blog follow by ID
   */
  async getBlogFollowById(req, res, next) {
    try {
      const data = await blogManagementService.getBlogFollowById(req.params.id);
      sendSuccess(res, { data, message: 'Blog follow retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * createBlogFollow
   * Creates a new blog follow
   */
  async createBlogFollow(req, res, next) {
    try {
      const data = await blogManagementService.createBlogFollow(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Blog follow created successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * updateBlogFollow
   * Updates an existing blog follow
   */
  async updateBlogFollow(req, res, next) {
    try {
      const data = await blogManagementService.updateBlogFollow(
        req.params.id,
        req.body,
        req.user.userId,
      );
      sendSuccess(res, { data, message: 'Blog follow updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * deleteBlogFollow
   * Soft deletes a single blog follow
   */
  async deleteBlogFollow(req, res, next) {
    try {
      await blogManagementService.deleteBlogFollow(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Blog follow deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * restoreBlogFollow
   * Restores a single deleted blog follow
   */
  async restoreBlogFollow(req, res, next) {
    try {
      await blogManagementService.restoreBlogFollow(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Blog follow restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  BLOG RELATED COURSES
  // ═════════════════════════════════════════════════════════════

  /**
   * getRelatedCourses
   * Retrieves a list of related courses with filtering and pagination
   */
  async getRelatedCourses(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        blogId,
        courseId,
        sortBy,
        sortDir,
      } = req.query;

      const data = await blogManagementService.getRelatedCourses({
        blogId: blogId || null,
        courseId: courseId || null,
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

      sendSuccess(res, { data, message: 'Related courses retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  /**
   * getRelatedCourseById
   * Retrieves a single related course by ID
   */
  async getRelatedCourseById(req, res, next) {
    try {
      const data = await blogManagementService.getRelatedCourseById(req.params.id);
      sendSuccess(res, { data, message: 'Related course retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * createRelatedCourse
   * Creates a new related course
   */
  async createRelatedCourse(req, res, next) {
    try {
      const data = await blogManagementService.createRelatedCourse(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Related course created successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * updateRelatedCourse
   * Updates an existing related course
   */
  async updateRelatedCourse(req, res, next) {
    try {
      const data = await blogManagementService.updateRelatedCourse(
        req.params.id,
        req.body,
        req.user.userId,
      );
      sendSuccess(res, { data, message: 'Related course updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * deleteRelatedCourse
   * Soft deletes a single related course
   */
  async deleteRelatedCourse(req, res, next) {
    try {
      await blogManagementService.deleteRelatedCourse(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Related course deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * bulkDeleteRelatedCourses
   * Soft deletes multiple related courses in bulk
   */
  async bulkDeleteRelatedCourses(req, res, next) {
    try {
      const { ids } = req.body;
      await blogManagementService.bulkDeleteRelatedCourses(ids, req.user.userId);
      sendSuccess(res, { message: 'Related courses deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * restoreRelatedCourse
   * Restores a single deleted related course
   */
  async restoreRelatedCourse(req, res, next) {
    try {
      await blogManagementService.restoreRelatedCourse(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Related course restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * bulkRestoreRelatedCourses
   * Restores multiple deleted related courses in bulk
   */
  async bulkRestoreRelatedCourses(req, res, next) {
    try {
      const { ids } = req.body;
      await blogManagementService.bulkRestoreRelatedCourses(ids, req.user.userId);
      sendSuccess(res, { message: 'Related courses restored successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BlogManagementController();
