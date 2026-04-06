const { z } = require('zod');
const { coercePositiveInt } = require('./shared/coerce');

// ============================================================================
// SHARED SCHEMAS
// ============================================================================

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a positive integer').transform(Number),
}).strict();

const blogIdParamSchema = z.object({
  blogId: z.string().regex(/^\d+$/, 'Blog ID must be a positive integer').transform(Number),
}).strict();

const categoryIdParamSchema = z.object({
  categoryId: z.string().regex(/^\d+$/, 'Category ID must be a positive integer').transform(Number),
}).strict();

const blockIdParamSchema = z.object({
  blockId: z.string().regex(/^\d+$/, 'Block ID must be a positive integer').transform(Number),
}).strict();

const commentIdParamSchema = z.object({
  commentId: z.string().regex(/^\d+$/, 'Comment ID must be a positive integer').transform(Number),
}).strict();

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
}).strict();

// ============================================================================
// BLOG CATEGORIES SCHEMAS
// ============================================================================

const createBlogCategorySchema = z
  .object({
    name: z.string().min(1, 'Name is required').max(500).trim(),
    code: z.string().max(100).trim().optional(),
    description: z.string().max(2000).trim().optional(),
    parentCategoryId: coercePositiveInt.optional().nullable(),
    displayOrder: z.number().int().nonnegative().optional().default(0),
    icon: z.string().max(500).optional(),
    coverImageUrl: z.string().max(1000).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

const updateBlogCategorySchema = z
  .object({
    name: z.string().min(1).max(500).trim().optional().nullable(),
    code: z.string().max(100).trim().optional().nullable(),
    description: z.string().max(2000).trim().optional().nullable(),
    parentCategoryId: coercePositiveInt.optional().nullable(),
    displayOrder: z.number().int().nonnegative().optional().nullable(),
    icon: z.string().max(500).optional().nullable(),
    coverImageUrl: z.string().max(1000).optional().nullable(),
    isActive: z.boolean().optional().nullable(),
  })
  .strict();

const blogCategoryListQuerySchema = listQuerySchema.extend({
  parentCategoryId: z.string().regex(/^\d+$/).transform(Number).optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  searchTerm: z.string().max(500).optional(),
  sortBy: z.string().max(100).optional().default('created_at'),
  sortDir: z.enum(['ASC', 'DESC']).optional().default('ASC'),
});

// ============================================================================
// BLOG CATEGORY TRANSLATIONS SCHEMAS
// ============================================================================

const createBlogCategoryTranslationSchema = z
  .object({
    languageId: coercePositiveInt,
    name: z.string().min(1, 'Name is required').max(500).trim(),
    description: z.string().max(2000).trim().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

const updateBlogCategoryTranslationSchema = z
  .object({
    name: z.string().min(1).max(500).trim().optional().nullable(),
    description: z.string().max(2000).trim().optional().nullable(),
    isActive: z.boolean().optional().nullable(),
  })
  .strict();

// ============================================================================
// BLOGS SCHEMAS
// ============================================================================

const createBlogSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(1000).trim(),
    blogOwner: z.enum(['system', 'instructor']).optional().default('system'),
    authorId: coercePositiveInt.optional(),
    categoryId: coercePositiveInt.optional(),
    subtitle: z.string().max(500).trim().optional(),
    excerpt: z.string().max(2000).trim().optional(),
    metaTitle: z.string().max(500).optional(),
    metaDescription: z.string().max(500).optional(),
    metaKeywords: z.string().max(500).optional(),
    coverImageUrl: z.string().max(1000).optional(),
    thumbnailUrl: z.string().max(1000).optional(),
    readingTimeMinutes: z.number().int().nonnegative().optional(),
    blogStatus: z.enum(['draft', 'under_review', 'published', 'archived', 'suspended']).optional().default('draft'),
    publishedAt: z.string().datetime().optional(),
    featuredUntil: z.string().datetime().optional(),
    isFeatured: z.boolean().optional().default(false),
    isPinned: z.boolean().optional().default(false),
    allowComments: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

const updateBlogSchema = z
  .object({
    title: z.string().min(1).max(1000).trim().optional().nullable(),
    blogOwner: z.enum(['system', 'instructor']).optional().nullable(),
    authorId: coercePositiveInt.optional().nullable(),
    categoryId: coercePositiveInt.optional().nullable(),
    subtitle: z.string().max(500).trim().optional().nullable(),
    excerpt: z.string().max(2000).trim().optional().nullable(),
    metaTitle: z.string().max(500).optional().nullable(),
    metaDescription: z.string().max(500).optional().nullable(),
    metaKeywords: z.string().max(500).optional().nullable(),
    coverImageUrl: z.string().max(1000).optional().nullable(),
    thumbnailUrl: z.string().max(1000).optional().nullable(),
    readingTimeMinutes: z.number().int().nonnegative().optional().nullable(),
    blogStatus: z.enum(['draft', 'under_review', 'published', 'archived', 'suspended']).optional().nullable(),
    publishedAt: z.string().datetime().optional().nullable(),
    featuredUntil: z.string().datetime().optional().nullable(),
    isFeatured: z.boolean().optional().nullable(),
    isPinned: z.boolean().optional().nullable(),
    allowComments: z.boolean().optional().nullable(),
    viewCount: z.number().int().nonnegative().optional().nullable(),
    likeCount: z.number().int().nonnegative().optional().nullable(),
    commentCount: z.number().int().nonnegative().optional().nullable(),
    shareCount: z.number().int().nonnegative().optional().nullable(),
    requiresApproval: z.boolean().optional().nullable(),
    approvedBy: coercePositiveInt.optional().nullable(),
    approvedAt: z.string().datetime().optional().nullable(),
    rejectionReason: z.string().max(2000).optional().nullable(),
    isActive: z.boolean().optional().nullable(),
  })
  .strict();

const blogListQuerySchema = listQuerySchema.extend({
  authorId: z.string().regex(/^\d+$/).transform(Number).optional(),
  categoryId: z.string().regex(/^\d+$/).transform(Number).optional(),
  blogOwner: z.enum(['system', 'instructor']).optional(),
  blogStatus: z.enum(['draft', 'under_review', 'published', 'archived', 'suspended']).optional(),
  isFeatured: z
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
// BLOG TRANSLATIONS SCHEMAS
// ============================================================================

const createBlogTranslationSchema = z
  .object({
    languageId: coercePositiveInt,
    title: z.string().min(1, 'Title is required').max(1000).trim(),
    subtitle: z.string().max(500).trim().optional(),
    excerpt: z.string().max(2000).trim().optional(),
    metaTitle: z.string().max(500).optional(),
    metaDescription: z.string().max(500).optional(),
    metaKeywords: z.string().max(500).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

const updateBlogTranslationSchema = z
  .object({
    title: z.string().min(1).max(1000).trim().optional().nullable(),
    subtitle: z.string().max(500).trim().optional().nullable(),
    excerpt: z.string().max(2000).trim().optional().nullable(),
    metaTitle: z.string().max(500).optional().nullable(),
    metaDescription: z.string().max(500).optional().nullable(),
    metaKeywords: z.string().max(500).optional().nullable(),
    isActive: z.boolean().optional().nullable(),
  })
  .strict();

// ============================================================================
// BLOG CONTENT BLOCKS SCHEMAS
// ============================================================================

const createContentBlockSchema = z
  .object({
    blogId: coercePositiveInt,
    blockType: z.enum(['text', 'image', 'video', 'text_with_image', 'text_with_video', 'text_with_media']),
    blockOrder: z.number().int().nonnegative().optional().default(0),
    content: z.string().max(50000).optional(),
    contentFormat: z.enum(['html', 'markdown', 'plain']).optional().default('html'),
    imageUrl: z.string().max(1000).optional(),
    imageAltText: z.string().max(500).optional(),
    imageCaption: z.string().max(2000).optional(),
    videoUrl: z.string().max(1000).optional(),
    videoThumbnailUrl: z.string().max(1000).optional(),
    videoDurationSeconds: z.number().int().nonnegative().optional(),
    mediaPosition: z.enum(['left', 'right', 'center', 'full_width', 'inline']).optional().default('center'),
    isActive: z.boolean().optional(),
  })
  .strict();

const updateContentBlockSchema = z
  .object({
    blockType: z.enum(['text', 'image', 'video', 'text_with_image', 'text_with_video', 'text_with_media']).optional().nullable(),
    blockOrder: z.number().int().nonnegative().optional().nullable(),
    content: z.string().max(50000).optional().nullable(),
    contentFormat: z.enum(['html', 'markdown', 'plain']).optional().nullable(),
    imageUrl: z.string().max(1000).optional().nullable(),
    imageAltText: z.string().max(500).optional().nullable(),
    imageCaption: z.string().max(2000).optional().nullable(),
    videoUrl: z.string().max(1000).optional().nullable(),
    videoThumbnailUrl: z.string().max(1000).optional().nullable(),
    videoDurationSeconds: z.number().int().nonnegative().optional().nullable(),
    mediaPosition: z.enum(['left', 'right', 'center', 'full_width', 'inline']).optional().nullable(),
    isActive: z.boolean().optional().nullable(),
  })
  .strict();

const contentBlockListQuerySchema = listQuerySchema.extend({
  blogId: z.string().regex(/^\d+$/).transform(Number).optional(),
  blockType: z.enum(['text', 'image', 'video', 'text_with_image', 'text_with_video', 'text_with_media']).optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  searchTerm: z.string().max(500).optional(),
  sortBy: z.string().max(100).optional().default('block_order'),
  sortDir: z.enum(['ASC', 'DESC']).optional().default('ASC'),
});

// ============================================================================
// BLOG CONTENT BLOCK TRANSLATIONS SCHEMAS
// ============================================================================

const createContentBlockTranslationSchema = z
  .object({
    languageId: coercePositiveInt,
    content: z.string().max(50000).optional(),
    imageAltText: z.string().max(500).optional(),
    imageCaption: z.string().max(2000).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

const updateContentBlockTranslationSchema = z
  .object({
    content: z.string().max(50000).optional().nullable(),
    imageAltText: z.string().max(500).optional().nullable(),
    imageCaption: z.string().max(2000).optional().nullable(),
    isActive: z.boolean().optional().nullable(),
  })
  .strict();

// ============================================================================
// BLOG TAGS SCHEMAS
// ============================================================================

const createBlogTagSchema = z
  .object({
    blogId: coercePositiveInt,
    tag: z.string().min(1, 'Tag is required').max(100).trim(),
    displayOrder: z.number().int().nonnegative().optional().default(0),
    isActive: z.boolean().optional(),
  })
  .strict();

const updateBlogTagSchema = z
  .object({
    tag: z.string().min(1).max(100).trim().optional().nullable(),
    displayOrder: z.number().int().nonnegative().optional().nullable(),
    isActive: z.boolean().optional().nullable(),
  })
  .strict();

const blogTagListQuerySchema = listQuerySchema.extend({
  blogId: z.string().regex(/^\d+$/).transform(Number).optional(),
  tag: z.string().max(100).optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  searchTerm: z.string().max(500).optional(),
  sortBy: z.string().max(100).optional().default('display_order'),
  sortDir: z.enum(['ASC', 'DESC']).optional().default('ASC'),
});

// ============================================================================
// BLOG COMMENTS SCHEMAS
// ============================================================================

const createBlogCommentSchema = z
  .object({
    blogId: coercePositiveInt,
    content: z.string().min(1, 'Content is required').max(5000).trim(),
    parentCommentId: coercePositiveInt.optional().nullable(),
    commentStatus: z.enum(['pending', 'approved', 'rejected', 'flagged']).optional().default('approved'),
    isActive: z.boolean().optional(),
  })
  .strict();

const updateBlogCommentSchema = z
  .object({
    content: z.string().min(1).max(5000).trim().optional().nullable(),
    commentStatus: z.enum(['pending', 'approved', 'rejected', 'flagged']).optional().nullable(),
    moderatedBy: coercePositiveInt.optional().nullable(),
    moderatedAt: z.string().datetime().optional().nullable(),
    rejectionReason: z.string().max(2000).optional().nullable(),
    isPinned: z.boolean().optional().nullable(),
    isAuthorReply: z.boolean().optional().nullable(),
    isActive: z.boolean().optional().nullable(),
  })
  .strict();

const blogCommentListQuerySchema = listQuerySchema.extend({
  blogId: z.string().regex(/^\d+$/).transform(Number).optional(),
  userId: z.string().regex(/^\d+$/).transform(Number).optional(),
  parentCommentId: z.string().regex(/^\d+$/).transform(Number).optional(),
  commentStatus: z.enum(['pending', 'approved', 'rejected', 'flagged']).optional(),
  isPinned: z
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
// BLOG COMMENT TRANSLATIONS SCHEMAS
// ============================================================================

const createBlogCommentTranslationSchema = z
  .object({
    languageId: coercePositiveInt,
    content: z.string().min(1, 'Content is required').max(5000).trim(),
    isActive: z.boolean().optional(),
  })
  .strict();

const updateBlogCommentTranslationSchema = z
  .object({
    content: z.string().min(1).max(5000).trim().optional().nullable(),
    isActive: z.boolean().optional().nullable(),
  })
  .strict();

// ============================================================================
// BLOG LIKES SCHEMAS
// ============================================================================

const createBlogLikeSchema = z
  .object({
    likeableType: z.enum(['blog', 'comment']),
    blogId: coercePositiveInt.optional(),
    commentId: coercePositiveInt.optional(),
  })
  .strict()
  .refine(
    (data) => {
      if (data.likeableType === 'blog') return data.blogId != null;
      if (data.likeableType === 'comment') return data.commentId != null;
      return false;
    },
    {
      message: 'blogId is required when likeableType is blog, commentId is required when likeableType is comment',
    },
  );

const updateBlogLikeSchema = z
  .object({
    isActive: z.boolean().optional().nullable(),
  })
  .strict();

const blogLikeListQuerySchema = listQuerySchema.extend({
  userId: z.string().regex(/^\d+$/).transform(Number).optional(),
  blogId: z.string().regex(/^\d+$/).transform(Number).optional(),
  commentId: z.string().regex(/^\d+$/).transform(Number).optional(),
  likeableType: z.enum(['blog', 'comment']).optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  sortBy: z.string().max(100).optional().default('created_at'),
  sortDir: z.enum(['ASC', 'DESC']).optional().default('DESC'),
});

// ============================================================================
// BLOG FOLLOWS SCHEMAS
// ============================================================================

const createBlogFollowSchema = z
  .object({
    followType: z.enum(['author', 'category']),
    authorId: coercePositiveInt.optional(),
    categoryId: coercePositiveInt.optional(),
    notifyNewPost: z.boolean().optional().default(true),
  })
  .strict()
  .refine(
    (data) => {
      if (data.followType === 'author') return data.authorId != null;
      if (data.followType === 'category') return data.categoryId != null;
      return false;
    },
    {
      message: 'authorId is required when followType is author, categoryId is required when followType is category',
    },
  );

const updateBlogFollowSchema = z
  .object({
    notifyNewPost: z.boolean().optional().nullable(),
    isActive: z.boolean().optional().nullable(),
  })
  .strict();

const blogFollowListQuerySchema = listQuerySchema.extend({
  userId: z.string().regex(/^\d+$/).transform(Number).optional(),
  followType: z.enum(['author', 'category']).optional(),
  authorId: z.string().regex(/^\d+$/).transform(Number).optional(),
  categoryId: z.string().regex(/^\d+$/).transform(Number).optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  sortBy: z.string().max(100).optional().default('created_at'),
  sortDir: z.enum(['ASC', 'DESC']).optional().default('DESC'),
});

// ============================================================================
// BLOG RELATED COURSES SCHEMAS
// ============================================================================

const createRelatedCourseSchema = z
  .object({
    blogId: coercePositiveInt,
    courseId: coercePositiveInt,
    displayOrder: z.number().int().nonnegative().optional().default(0),
    relevanceNote: z.string().max(1000).optional(),
  })
  .strict();

const updateRelatedCourseSchema = z
  .object({
    displayOrder: z.number().int().nonnegative().optional().nullable(),
    relevanceNote: z.string().max(1000).optional().nullable(),
    isActive: z.boolean().optional().nullable(),
  })
  .strict();

const relatedCourseListQuerySchema = listQuerySchema.extend({
  blogId: z.string().regex(/^\d+$/).transform(Number).optional(),
  courseId: z.string().regex(/^\d+$/).transform(Number).optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  searchTerm: z.string().max(500).optional(),
  sortBy: z.string().max(100).optional().default('display_order'),
  sortDir: z.enum(['ASC', 'DESC']).optional().default('ASC'),
});

// ============================================================================
// VALIDATORS EXPORT
// ============================================================================

module.exports = {
  // Shared
  idParamSchema,
  blogIdParamSchema,
  categoryIdParamSchema,
  blockIdParamSchema,
  commentIdParamSchema,
  restoreSchema,
  bulkIdsSchema,
  listQuerySchema,

  // Blog Categories
  createBlogCategorySchema,
  updateBlogCategorySchema,
  blogCategoryListQuerySchema,

  // Blog Category Translations
  createBlogCategoryTranslationSchema,
  updateBlogCategoryTranslationSchema,

  // Blogs
  createBlogSchema,
  updateBlogSchema,
  blogListQuerySchema,

  // Blog Translations
  createBlogTranslationSchema,
  updateBlogTranslationSchema,

  // Blog Content Blocks
  createContentBlockSchema,
  updateContentBlockSchema,
  contentBlockListQuerySchema,

  // Blog Content Block Translations
  createContentBlockTranslationSchema,
  updateContentBlockTranslationSchema,

  // Blog Tags
  createBlogTagSchema,
  updateBlogTagSchema,
  blogTagListQuerySchema,

  // Blog Comments
  createBlogCommentSchema,
  updateBlogCommentSchema,
  blogCommentListQuerySchema,

  // Blog Comment Translations
  createBlogCommentTranslationSchema,
  updateBlogCommentTranslationSchema,

  // Blog Likes
  createBlogLikeSchema,
  updateBlogLikeSchema,
  blogLikeListQuerySchema,

  // Blog Follows
  createBlogFollowSchema,
  updateBlogFollowSchema,
  blogFollowListQuerySchema,

  // Blog Related Courses
  createRelatedCourseSchema,
  updateRelatedCourseSchema,
  relatedCourseListQuerySchema,
};
