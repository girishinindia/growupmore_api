const { Router } = require('express');
const ctrl = require('../controllers/blogManagement.controller');
const validate = require('../../../middleware/validate.middleware');
const authenticate = require('../../../middleware/auth.middleware');
const { authorize } = require('../../../middleware/authorize.middleware');

// Import validator schemas
const {
  idParamSchema,
  categoryIdParamSchema,
  blogIdParamSchema,
  blockIdParamSchema,
  commentIdParamSchema,
  restoreSchema,
  bulkIdsSchema,
  createBlogCategorySchema,
  updateBlogCategorySchema,
  blogCategoryListQuerySchema,
  createBlogSchema,
  updateBlogSchema,
  blogListQuerySchema,
  createContentBlockSchema,
  updateContentBlockSchema,
  contentBlockListQuerySchema,
  createBlogTagSchema,
  updateBlogTagSchema,
  blogTagListQuerySchema,
  createBlogCommentSchema,
  updateBlogCommentSchema,
  blogCommentListQuerySchema,
  createBlogLikeSchema,
  updateBlogLikeSchema,
  blogLikeListQuerySchema,
  createBlogCommentTranslationSchema,
  updateBlogCommentTranslationSchema,
  createBlogFollowSchema,
  updateBlogFollowSchema,
  blogFollowListQuerySchema,
  createRelatedCourseSchema,
  updateRelatedCourseSchema,
  relatedCourseListQuerySchema,
  createBlogCategoryTranslationSchema,
  updateBlogCategoryTranslationSchema,
  createBlogTranslationSchema,
  updateBlogTranslationSchema,
  createContentBlockTranslationSchema,
  updateContentBlockTranslationSchema,
} = require('../validators/blogManagement.validator');

const router = Router();
router.use(authenticate);

// ============================================================================
// BLOG CATEGORIES (permission: blog_category.*)
// ============================================================================

/**
 * GET /blog-management/blog-categories
 * Retrieves list of blog categories with filtering and pagination
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {string} searchTerm - Search in category name/description
 * @query {string} sortBy - Sort column (default: created_at)
 * @query {string} sortDir - Sort direction (ASC or DESC, default: DESC)
 */
router.get(
  '/blog-categories',
  authorize('blog_category.read'),
  validate(blogCategoryListQuerySchema, 'query'),
  ctrl.getBlogCategories,
);

/**
 * GET /blog-management/blog-categories/json
 * Retrieves blog categories in JSON format
 */
router.get(
  '/blog-categories/json',
  authorize('blog_category.read'),
  ctrl.getBlogCategoriesJSON,
);

/**
 * POST /blog-management/blog-categories/bulk-delete
 * Soft deletes multiple blog categories in bulk
 * @body {Array<number>} ids - Array of category IDs to delete
 */
router.post(
  '/blog-categories/bulk-delete',
  authorize('blog_category.delete'),
  validate(bulkIdsSchema),
  ctrl.bulkDeleteBlogCategories,
);

/**
 * POST /blog-management/blog-categories/bulk-restore
 * Restores multiple deleted blog categories in bulk
 * @body {Array<number>} ids - Array of category IDs to restore
 */
router.post(
  '/blog-categories/bulk-restore',
  authorize('blog_category.delete'),
  validate(bulkIdsSchema),
  ctrl.bulkRestoreBlogCategories,
);

/**
 * GET /blog-management/blog-categories/:id
 * Retrieves a single blog category by ID
 * @param {number} id - Category ID
 */
router.get(
  '/blog-categories/:id',
  authorize('blog_category.read'),
  validate(idParamSchema, 'params'),
  ctrl.getBlogCategoryById,
);

/**
 * POST /blog-management/blog-categories
 * Creates a new blog category
 * @body {string} name - Category name (required)
 * @body {string} description - Category description (optional)
 * @body {number} displayOrder - Display order (optional)
 */
router.post(
  '/blog-categories',
  authorize('blog_category.create'),
  validate(createBlogCategorySchema),
  ctrl.createBlogCategory,
);

/**
 * PATCH /blog-management/blog-categories/:id
 * Updates an existing blog category
 * @param {number} id - Category ID
 * @body {string} name - Category name (optional)
 * @body {string} description - Category description (optional)
 * @body {number} displayOrder - Display order (optional)
 */
router.patch(
  '/blog-categories/:id',
  authorize('blog_category.update'),
  validate(idParamSchema, 'params'),
  validate(updateBlogCategorySchema),
  ctrl.updateBlogCategory,
);

/**
 * DELETE /blog-management/blog-categories/:id
 * Soft deletes a single blog category
 * @param {number} id - Category ID
 */
router.delete(
  '/blog-categories/:id',
  authorize('blog_category.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteBlogCategory,
);

/**
 * POST /blog-management/blog-categories/:id/restore
 * Restores a single deleted blog category
 * @param {number} id - Category ID
 */
router.post(
  '/blog-categories/:id/restore',
  authorize('blog_category.delete'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreBlogCategory,
);

/**
 * POST /blog-management/blog-categories/:categoryId/translations
 * Creates a translation for a blog category
 * @param {number} categoryId - Category ID
 * @body {string} language - Language code (required)
 * @body {string} name - Translated name (required)
 * @body {string} description - Translated description (optional)
 */
router.post(
  '/blog-categories/:categoryId/translations',
  authorize('blog_category.create'),
  validate(categoryIdParamSchema, 'params'),
  validate(createBlogCategoryTranslationSchema),
  ctrl.createBlogCategoryTranslation,
);

/**
 * PATCH /blog-management/category-translations/:id
 * Updates a blog category translation
 * @param {number} id - Translation ID
 * @body {string} name - Translated name (optional)
 * @body {string} description - Translated description (optional)
 */
router.patch(
  '/category-translations/:id',
  authorize('blog_category.update'),
  validate(idParamSchema, 'params'),
  validate(updateBlogCategoryTranslationSchema),
  ctrl.updateBlogCategoryTranslation,
);

/**
 * DELETE /blog-management/category-translations/:id
 * Soft deletes a blog category translation
 * @param {number} id - Translation ID
 */
router.delete(
  '/category-translations/:id',
  authorize('blog_category.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteBlogCategoryTranslation,
);

/**
 * POST /blog-management/category-translations/:id/restore
 * Restores a deleted blog category translation
 * @param {number} id - Translation ID
 */
router.post(
  '/category-translations/:id/restore',
  authorize('blog_category.delete'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreBlogCategoryTranslation,
);

// ============================================================================
// BLOGS (permission: blog.*)
// ============================================================================

/**
 * GET /blog-management/blogs
 * Retrieves list of blogs with filtering and pagination
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {number} categoryId - Filter by category ID
 * @query {number} userId - Filter by user ID
 * @query {boolean} isPublished - Filter by published status
 * @query {string} searchTerm - Search in blog title/content
 * @query {string} sortBy - Sort column (default: created_at)
 * @query {string} sortDir - Sort direction (ASC or DESC, default: DESC)
 */
router.get(
  '/blogs',
  authorize('blog.read'),
  validate(blogListQuerySchema, 'query'),
  ctrl.getBlogs,
);

/**
 * GET /blog-management/blogs/json
 * Retrieves blogs in JSON format
 */
router.get(
  '/blogs/json',
  authorize('blog.read'),
  ctrl.getBlogsJSON,
);

/**
 * POST /blog-management/blogs/bulk-delete
 * Soft deletes multiple blogs in bulk
 * @body {Array<number>} ids - Array of blog IDs to delete
 */
router.post(
  '/blogs/bulk-delete',
  authorize('blog.delete'),
  validate(bulkIdsSchema),
  ctrl.bulkDeleteBlogs,
);

/**
 * POST /blog-management/blogs/bulk-restore
 * Restores multiple deleted blogs in bulk
 * @body {Array<number>} ids - Array of blog IDs to restore
 */
router.post(
  '/blogs/bulk-restore',
  authorize('blog.delete'),
  validate(bulkIdsSchema),
  ctrl.bulkRestoreBlogs,
);

/**
 * GET /blog-management/blogs/:id
 * Retrieves a single blog by ID
 * @param {number} id - Blog ID
 */
router.get(
  '/blogs/:id',
  authorize('blog.read'),
  validate(idParamSchema, 'params'),
  ctrl.getBlogById,
);

/**
 * POST /blog-management/blogs
 * Creates a new blog
 * @body {number} categoryId - Category ID (required)
 * @body {string} title - Blog title (required)
 * @body {string} content - Blog content (required)
 * @body {boolean} isPublished - Published flag (default: false)
 * @body {string} excerpt - Blog excerpt (optional)
 * @body {string} featuredImage - Featured image URL (optional)
 */
router.post(
  '/blogs',
  authorize('blog.create'),
  validate(createBlogSchema),
  ctrl.createBlog,
);

/**
 * PATCH /blog-management/blogs/:id
 * Updates an existing blog
 * @param {number} id - Blog ID
 * @body {number} categoryId - Category ID (optional)
 * @body {string} title - Blog title (optional)
 * @body {string} content - Blog content (optional)
 * @body {boolean} isPublished - Published flag (optional)
 * @body {string} excerpt - Blog excerpt (optional)
 * @body {string} featuredImage - Featured image URL (optional)
 */
router.patch(
  '/blogs/:id',
  authorize('blog.update'),
  validate(idParamSchema, 'params'),
  validate(updateBlogSchema),
  ctrl.updateBlog,
);

/**
 * DELETE /blog-management/blogs/:id
 * Soft deletes a single blog
 * @param {number} id - Blog ID
 */
router.delete(
  '/blogs/:id',
  authorize('blog.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteBlog,
);

/**
 * POST /blog-management/blogs/:id/restore
 * Restores a single deleted blog
 * @param {number} id - Blog ID
 */
router.post(
  '/blogs/:id/restore',
  authorize('blog.delete'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreBlog,
);

/**
 * POST /blog-management/blogs/:blogId/translations
 * Creates a translation for a blog
 * @param {number} blogId - Blog ID
 * @body {string} language - Language code (required)
 * @body {string} title - Translated title (required)
 * @body {string} content - Translated content (required)
 * @body {string} excerpt - Translated excerpt (optional)
 */
router.post(
  '/blogs/:blogId/translations',
  authorize('blog.create'),
  validate(blogIdParamSchema, 'params'),
  validate(createBlogTranslationSchema),
  ctrl.createBlogTranslation,
);

/**
 * PATCH /blog-management/blog-translations/:id
 * Updates a blog translation
 * @param {number} id - Translation ID
 * @body {string} title - Translated title (optional)
 * @body {string} content - Translated content (optional)
 * @body {string} excerpt - Translated excerpt (optional)
 */
router.patch(
  '/blog-translations/:id',
  authorize('blog.update'),
  validate(idParamSchema, 'params'),
  validate(updateBlogTranslationSchema),
  ctrl.updateBlogTranslation,
);

/**
 * DELETE /blog-management/blog-translations/:id
 * Soft deletes a blog translation
 * @param {number} id - Translation ID
 */
router.delete(
  '/blog-translations/:id',
  authorize('blog.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteBlogTranslation,
);

/**
 * POST /blog-management/blog-translations/:id/restore
 * Restores a deleted blog translation
 * @param {number} id - Translation ID
 */
router.post(
  '/blog-translations/:id/restore',
  authorize('blog.delete'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreBlogTranslation,
);

// ============================================================================
// CONTENT BLOCKS (permission: blog.*)
// ============================================================================

/**
 * GET /blog-management/content-blocks
 * Retrieves list of content blocks with filtering and pagination
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {number} blogId - Filter by blog ID
 * @query {string} blockType - Filter by block type (text, image, video, etc.)
 * @query {string} searchTerm - Search in content
 * @query {string} sortBy - Sort column (default: created_at)
 * @query {string} sortDir - Sort direction (ASC or DESC, default: DESC)
 */
router.get(
  '/content-blocks',
  authorize('blog.read'),
  validate(contentBlockListQuerySchema, 'query'),
  ctrl.getContentBlocks,
);

/**
 * POST /blog-management/content-blocks/bulk-delete
 * Soft deletes multiple content blocks in bulk
 * @body {Array<number>} ids - Array of block IDs to delete
 */
router.post(
  '/content-blocks/bulk-delete',
  authorize('blog.delete'),
  validate(bulkIdsSchema),
  ctrl.bulkDeleteContentBlocks,
);

/**
 * POST /blog-management/content-blocks/bulk-restore
 * Restores multiple deleted content blocks in bulk
 * @body {Array<number>} ids - Array of block IDs to restore
 */
router.post(
  '/content-blocks/bulk-restore',
  authorize('blog.delete'),
  validate(bulkIdsSchema),
  ctrl.bulkRestoreContentBlocks,
);

/**
 * GET /blog-management/content-blocks/:id
 * Retrieves a single content block by ID
 * @param {number} id - Block ID
 */
router.get(
  '/content-blocks/:id',
  authorize('blog.read'),
  validate(idParamSchema, 'params'),
  ctrl.getContentBlockById,
);

/**
 * POST /blog-management/content-blocks
 * Creates a new content block
 * @body {number} blogId - Blog ID (required)
 * @body {string} blockType - Block type (required)
 * @body {string} content - Block content (required)
 * @body {number} displayOrder - Display order (optional)
 */
router.post(
  '/content-blocks',
  authorize('blog.create'),
  validate(createContentBlockSchema),
  ctrl.createContentBlock,
);

/**
 * PATCH /blog-management/content-blocks/:id
 * Updates an existing content block
 * @param {number} id - Block ID
 * @body {string} blockType - Block type (optional)
 * @body {string} content - Block content (optional)
 * @body {number} displayOrder - Display order (optional)
 */
router.patch(
  '/content-blocks/:id',
  authorize('blog.update'),
  validate(idParamSchema, 'params'),
  validate(updateContentBlockSchema),
  ctrl.updateContentBlock,
);

/**
 * DELETE /blog-management/content-blocks/:id
 * Soft deletes a single content block
 * @param {number} id - Block ID
 */
router.delete(
  '/content-blocks/:id',
  authorize('blog.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteContentBlock,
);

/**
 * POST /blog-management/content-blocks/:id/restore
 * Restores a single deleted content block
 * @param {number} id - Block ID
 */
router.post(
  '/content-blocks/:id/restore',
  authorize('blog.delete'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreContentBlock,
);

/**
 * POST /blog-management/content-blocks/:blockId/translations
 * Creates a translation for a content block
 * @param {number} blockId - Block ID
 * @body {string} language - Language code (required)
 * @body {string} content - Translated content (required)
 */
router.post(
  '/content-blocks/:blockId/translations',
  authorize('blog.create'),
  validate(blockIdParamSchema, 'params'),
  validate(createContentBlockTranslationSchema),
  ctrl.createContentBlockTranslation,
);

/**
 * PATCH /blog-management/block-translations/:id
 * Updates a content block translation
 * @param {number} id - Translation ID
 * @body {string} content - Translated content (optional)
 */
router.patch(
  '/block-translations/:id',
  authorize('blog.update'),
  validate(idParamSchema, 'params'),
  validate(updateContentBlockTranslationSchema),
  ctrl.updateContentBlockTranslation,
);

/**
 * DELETE /blog-management/block-translations/:id
 * Soft deletes a content block translation
 * @param {number} id - Translation ID
 */
router.delete(
  '/block-translations/:id',
  authorize('blog.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteContentBlockTranslation,
);

/**
 * POST /blog-management/block-translations/:id/restore
 * Restores a deleted content block translation
 * @param {number} id - Translation ID
 */
router.post(
  '/block-translations/:id/restore',
  authorize('blog.delete'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreContentBlockTranslation,
);

// ============================================================================
// BLOG TAGS (permission: blog.*)
// ============================================================================

/**
 * GET /blog-management/blog-tags
 * Retrieves list of blog tags with filtering and pagination
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {string} searchTerm - Search in tag name
 * @query {string} sortBy - Sort column (default: created_at)
 * @query {string} sortDir - Sort direction (ASC or DESC, default: DESC)
 */
router.get(
  '/blog-tags',
  authorize('blog.read'),
  validate(blogTagListQuerySchema, 'query'),
  ctrl.getBlogTags,
);

/**
 * POST /blog-management/blog-tags/bulk-delete
 * Soft deletes multiple blog tags in bulk
 * @body {Array<number>} ids - Array of tag IDs to delete
 */
router.post(
  '/blog-tags/bulk-delete',
  authorize('blog.delete'),
  validate(bulkIdsSchema),
  ctrl.bulkDeleteBlogTags,
);

/**
 * POST /blog-management/blog-tags/bulk-restore
 * Restores multiple deleted blog tags in bulk
 * @body {Array<number>} ids - Array of tag IDs to restore
 */
router.post(
  '/blog-tags/bulk-restore',
  authorize('blog.delete'),
  validate(bulkIdsSchema),
  ctrl.bulkRestoreBlogTags,
);

/**
 * GET /blog-management/blog-tags/:id
 * Retrieves a single blog tag by ID
 * @param {number} id - Tag ID
 */
router.get(
  '/blog-tags/:id',
  authorize('blog.read'),
  validate(idParamSchema, 'params'),
  ctrl.getBlogTagById,
);

/**
 * POST /blog-management/blog-tags
 * Creates a new blog tag
 * @body {string} name - Tag name (required)
 * @body {string} slug - Tag slug (optional)
 */
router.post(
  '/blog-tags',
  authorize('blog.create'),
  validate(createBlogTagSchema),
  ctrl.createBlogTag,
);

/**
 * PATCH /blog-management/blog-tags/:id
 * Updates an existing blog tag
 * @param {number} id - Tag ID
 * @body {string} name - Tag name (optional)
 * @body {string} slug - Tag slug (optional)
 */
router.patch(
  '/blog-tags/:id',
  authorize('blog.update'),
  validate(idParamSchema, 'params'),
  validate(updateBlogTagSchema),
  ctrl.updateBlogTag,
);

/**
 * DELETE /blog-management/blog-tags/:id
 * Soft deletes a single blog tag
 * @param {number} id - Tag ID
 */
router.delete(
  '/blog-tags/:id',
  authorize('blog.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteBlogTag,
);

/**
 * POST /blog-management/blog-tags/:id/restore
 * Restores a single deleted blog tag
 * @param {number} id - Tag ID
 */
router.post(
  '/blog-tags/:id/restore',
  authorize('blog.delete'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreBlogTag,
);

// ============================================================================
// BLOG COMMENTS (permission: blog_comment.*)
// ============================================================================

/**
 * GET /blog-management/blog-comments
 * Retrieves list of blog comments with filtering and pagination
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {number} blogId - Filter by blog ID
 * @query {number} userId - Filter by user ID
 * @query {boolean} isApproved - Filter by approval status
 * @query {string} searchTerm - Search in comment text
 * @query {string} sortBy - Sort column (default: created_at)
 * @query {string} sortDir - Sort direction (ASC or DESC, default: DESC)
 */
router.get(
  '/blog-comments',
  authorize('blog_comment.read'),
  validate(blogCommentListQuerySchema, 'query'),
  ctrl.getBlogComments,
);

/**
 * POST /blog-management/blog-comments/bulk-delete
 * Soft deletes multiple blog comments in bulk
 * @body {Array<number>} ids - Array of comment IDs to delete
 */
router.post(
  '/blog-comments/bulk-delete',
  authorize('blog_comment.delete'),
  validate(bulkIdsSchema),
  ctrl.bulkDeleteBlogComments,
);

/**
 * POST /blog-management/blog-comments/bulk-restore
 * Restores multiple deleted blog comments in bulk
 * @body {Array<number>} ids - Array of comment IDs to restore
 */
router.post(
  '/blog-comments/bulk-restore',
  authorize('blog_comment.delete'),
  validate(bulkIdsSchema),
  ctrl.bulkRestoreBlogComments,
);

/**
 * GET /blog-management/blog-comments/:id
 * Retrieves a single blog comment by ID
 * @param {number} id - Comment ID
 */
router.get(
  '/blog-comments/:id',
  authorize('blog_comment.read'),
  validate(idParamSchema, 'params'),
  ctrl.getBlogCommentById,
);

/**
 * POST /blog-management/blog-comments
 * Creates a new blog comment
 * @body {number} blogId - Blog ID (required)
 * @body {string} content - Comment content (required)
 * @body {number} parentCommentId - Parent comment ID for nested replies (optional)
 * @body {boolean} isApproved - Approval flag (default: false)
 */
router.post(
  '/blog-comments',
  authorize('blog_comment.create'),
  validate(createBlogCommentSchema),
  ctrl.createBlogComment,
);

/**
 * PATCH /blog-management/blog-comments/:id
 * Updates an existing blog comment
 * @param {number} id - Comment ID
 * @body {string} content - Comment content (optional)
 * @body {boolean} isApproved - Approval flag (optional)
 */
router.patch(
  '/blog-comments/:id',
  authorize('blog_comment.update'),
  validate(idParamSchema, 'params'),
  validate(updateBlogCommentSchema),
  ctrl.updateBlogComment,
);

/**
 * DELETE /blog-management/blog-comments/:id
 * Soft deletes a single blog comment
 * @param {number} id - Comment ID
 */
router.delete(
  '/blog-comments/:id',
  authorize('blog_comment.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteBlogComment,
);

/**
 * POST /blog-management/blog-comments/:id/restore
 * Restores a single deleted blog comment
 * @param {number} id - Comment ID
 */
router.post(
  '/blog-comments/:id/restore',
  authorize('blog_comment.delete'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreBlogComment,
);

/**
 * POST /blog-management/blog-comments/:commentId/translations
 * Creates a translation for a blog comment
 * @param {number} commentId - Comment ID
 * @body {string} language - Language code (required)
 * @body {string} content - Translated content (required)
 */
router.post(
  '/blog-comments/:commentId/translations',
  authorize('blog_comment.create'),
  validate(commentIdParamSchema, 'params'),
  validate(createBlogCommentTranslationSchema),
  ctrl.createBlogCommentTranslation,
);

/**
 * PATCH /blog-management/comment-translations/:id
 * Updates a blog comment translation
 * @param {number} id - Translation ID
 * @body {string} content - Translated content (optional)
 */
router.patch(
  '/comment-translations/:id',
  authorize('blog_comment.update'),
  validate(idParamSchema, 'params'),
  validate(updateBlogCommentTranslationSchema),
  ctrl.updateBlogCommentTranslation,
);

/**
 * DELETE /blog-management/comment-translations/:id
 * Soft deletes a blog comment translation
 * @param {number} id - Translation ID
 */
router.delete(
  '/comment-translations/:id',
  authorize('blog_comment.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteBlogCommentTranslation,
);

/**
 * POST /blog-management/comment-translations/:id/restore
 * Restores a deleted blog comment translation
 * @param {number} id - Translation ID
 */
router.post(
  '/comment-translations/:id/restore',
  authorize('blog_comment.delete'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreBlogCommentTranslation,
);

// ============================================================================
// BLOG LIKES (permission: blog.*)
// ============================================================================

/**
 * GET /blog-management/blog-likes
 * Retrieves list of blog likes with filtering and pagination
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {number} blogId - Filter by blog ID
 * @query {number} userId - Filter by user ID
 * @query {string} sortBy - Sort column (default: created_at)
 * @query {string} sortDir - Sort direction (ASC or DESC, default: DESC)
 */
router.get(
  '/blog-likes',
  authorize('blog.read'),
  validate(blogLikeListQuerySchema, 'query'),
  ctrl.getBlogLikes,
);

/**
 * GET /blog-management/blog-likes/:id
 * Retrieves a single blog like by ID
 * @param {number} id - Like ID
 */
router.get(
  '/blog-likes/:id',
  authorize('blog.read'),
  validate(idParamSchema, 'params'),
  ctrl.getBlogLikeById,
);

/**
 * POST /blog-management/blog-likes
 * Creates a new blog like
 * @body {number} blogId - Blog ID (required)
 */
router.post(
  '/blog-likes',
  authorize('blog.create'),
  validate(createBlogLikeSchema),
  ctrl.createBlogLike,
);

/**
 * PATCH /blog-management/blog-likes/:id
 * Updates an existing blog like
 * @param {number} id - Like ID
 */
router.patch(
  '/blog-likes/:id',
  authorize('blog.update'),
  validate(idParamSchema, 'params'),
  validate(updateBlogLikeSchema),
  ctrl.updateBlogLike,
);

/**
 * DELETE /blog-management/blog-likes/:id
 * Soft deletes a single blog like
 * @param {number} id - Like ID
 */
router.delete(
  '/blog-likes/:id',
  authorize('blog.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteBlogLike,
);

/**
 * POST /blog-management/blog-likes/:id/restore
 * Restores a single deleted blog like
 * @param {number} id - Like ID
 */
router.post(
  '/blog-likes/:id/restore',
  authorize('blog.delete'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreBlogLike,
);

// ============================================================================
// BLOG FOLLOWS (permission: blog.*)
// ============================================================================

/**
 * GET /blog-management/blog-follows
 * Retrieves list of blog follows with filtering and pagination
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {number} blogId - Filter by blog ID
 * @query {number} userId - Filter by user ID
 * @query {string} sortBy - Sort column (default: created_at)
 * @query {string} sortDir - Sort direction (ASC or DESC, default: DESC)
 */
router.get(
  '/blog-follows',
  authorize('blog.read'),
  validate(blogFollowListQuerySchema, 'query'),
  ctrl.getBlogFollows,
);

/**
 * GET /blog-management/blog-follows/:id
 * Retrieves a single blog follow by ID
 * @param {number} id - Follow ID
 */
router.get(
  '/blog-follows/:id',
  authorize('blog.read'),
  validate(idParamSchema, 'params'),
  ctrl.getBlogFollowById,
);

/**
 * POST /blog-management/blog-follows
 * Creates a new blog follow
 * @body {number} blogId - Blog ID (required)
 */
router.post(
  '/blog-follows',
  authorize('blog.create'),
  validate(createBlogFollowSchema),
  ctrl.createBlogFollow,
);

/**
 * PATCH /blog-management/blog-follows/:id
 * Updates an existing blog follow
 * @param {number} id - Follow ID
 */
router.patch(
  '/blog-follows/:id',
  authorize('blog.update'),
  validate(idParamSchema, 'params'),
  validate(updateBlogFollowSchema),
  ctrl.updateBlogFollow,
);

/**
 * DELETE /blog-management/blog-follows/:id
 * Soft deletes a single blog follow
 * @param {number} id - Follow ID
 */
router.delete(
  '/blog-follows/:id',
  authorize('blog.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteBlogFollow,
);

/**
 * POST /blog-management/blog-follows/:id/restore
 * Restores a single deleted blog follow
 * @param {number} id - Follow ID
 */
router.post(
  '/blog-follows/:id/restore',
  authorize('blog.delete'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreBlogFollow,
);

// ============================================================================
// BLOG RELATED COURSES (permission: blog.*)
// ============================================================================

/**
 * GET /blog-management/related-courses
 * Retrieves list of related courses with filtering and pagination
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {number} blogId - Filter by blog ID
 * @query {number} courseId - Filter by course ID
 * @query {string} sortBy - Sort column (default: created_at)
 * @query {string} sortDir - Sort direction (ASC or DESC, default: DESC)
 */
router.get(
  '/related-courses',
  authorize('blog.read'),
  validate(relatedCourseListQuerySchema, 'query'),
  ctrl.getRelatedCourses,
);

/**
 * POST /blog-management/related-courses/bulk-delete
 * Soft deletes multiple related courses in bulk
 * @body {Array<number>} ids - Array of related course IDs to delete
 */
router.post(
  '/related-courses/bulk-delete',
  authorize('blog.delete'),
  validate(bulkIdsSchema),
  ctrl.bulkDeleteRelatedCourses,
);

/**
 * POST /blog-management/related-courses/bulk-restore
 * Restores multiple deleted related courses in bulk
 * @body {Array<number>} ids - Array of related course IDs to restore
 */
router.post(
  '/related-courses/bulk-restore',
  authorize('blog.delete'),
  validate(bulkIdsSchema),
  ctrl.bulkRestoreRelatedCourses,
);

/**
 * GET /blog-management/related-courses/:id
 * Retrieves a single related course by ID
 * @param {number} id - Related course ID
 */
router.get(
  '/related-courses/:id',
  authorize('blog.read'),
  validate(idParamSchema, 'params'),
  ctrl.getRelatedCourseById,
);

/**
 * POST /blog-management/related-courses
 * Creates a new related course
 * @body {number} blogId - Blog ID (required)
 * @body {number} courseId - Course ID (required)
 * @body {number} displayOrder - Display order (optional)
 */
router.post(
  '/related-courses',
  authorize('blog.create'),
  validate(createRelatedCourseSchema),
  ctrl.createRelatedCourse,
);

/**
 * PATCH /blog-management/related-courses/:id
 * Updates an existing related course
 * @param {number} id - Related course ID
 * @body {number} displayOrder - Display order (optional)
 */
router.patch(
  '/related-courses/:id',
  authorize('blog.update'),
  validate(idParamSchema, 'params'),
  validate(updateRelatedCourseSchema),
  ctrl.updateRelatedCourse,
);

/**
 * DELETE /blog-management/related-courses/:id
 * Soft deletes a single related course
 * @param {number} id - Related course ID
 */
router.delete(
  '/related-courses/:id',
  authorize('blog.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteRelatedCourse,
);

/**
 * POST /blog-management/related-courses/:id/restore
 * Restores a single deleted related course
 * @param {number} id - Related course ID
 */
router.post(
  '/related-courses/:id/restore',
  authorize('blog.delete'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreRelatedCourse,
);

module.exports = router;
