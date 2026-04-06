const { z } = require('zod');
const { coercePositiveInt } = require('./shared/coerce');

// ============================================================================
// SHARED SCHEMAS
// ============================================================================

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a positive integer').transform(Number),
});

const listQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('20'),
  search: z.string().max(100).optional(),
  sortBy: z.string().max(50).optional(),
  sortDir: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional().default('ASC'),
});

// ============================================================================
// 1. COURSES SCHEMAS
// ============================================================================

const createCourseSchema = z.object({
  instructorId: coercePositiveInt.optional(),
  courseLanguageId: coercePositiveInt.optional(),
  isInstructorCourse: z.boolean().optional().default(false),
  code: z.string().min(1).max(100).trim().optional(),
  slug: z.string().min(1).max(255).trim().optional(),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional().default('beginner'),
  courseStatus: z.enum(['draft', 'review', 'published', 'archived', 'suspended']).optional().default('draft'),
  durationHours: z.number().positive().nullable().optional(),
  price: z.number().nonnegative().optional().default(0),
  originalPrice: z.number().nonnegative().nullable().optional(),
  discountPercentage: z.number().min(0).max(100).nullable().optional(),
  currency: z.string().max(10).optional().default('INR'),
  isFree: z.boolean().optional().default(false),
  isNew: z.boolean().optional().default(false),
  newUntil: z.string().datetime().nullable().optional(),
  isFeatured: z.boolean().optional().default(false),
  isBestseller: z.boolean().optional().default(false),
  hasPlacementAssistance: z.boolean().optional().default(false),
  hasCertificate: z.boolean().optional().default(true),
  maxStudents: coercePositiveInt.nullable().optional(),
  refundDays: z.number().int().nonnegative().optional().default(0),
  isActive: z.boolean().optional().default(true),
  publishedAt: z.string().datetime().nullable().optional(),
  contentUpdatedAt: z.string().datetime().nullable().optional(),
});

const updateCourseSchema = z.object({
  instructorId: coercePositiveInt.optional(),
  courseLanguageId: coercePositiveInt.optional(),
  isInstructorCourse: z.boolean().optional(),
  code: z.string().min(1).max(100).trim().optional(),
  slug: z.string().min(1).max(255).trim().optional(),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  courseStatus: z.enum(['draft', 'review', 'published', 'archived', 'suspended']).optional(),
  durationHours: z.number().positive().nullable().optional(),
  price: z.number().nonnegative().optional(),
  originalPrice: z.number().nonnegative().nullable().optional(),
  discountPercentage: z.number().min(0).max(100).nullable().optional(),
  currency: z.string().max(10).optional(),
  isFree: z.boolean().optional(),
  isNew: z.boolean().optional(),
  newUntil: z.string().datetime().nullable().optional(),
  isFeatured: z.boolean().optional(),
  isBestseller: z.boolean().optional(),
  hasPlacementAssistance: z.boolean().optional(),
  hasCertificate: z.boolean().optional(),
  maxStudents: coercePositiveInt.nullable().optional(),
  refundDays: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
  publishedAt: z.string().datetime().nullable().optional(),
  contentUpdatedAt: z.string().datetime().nullable().optional(),
}).strict();

const courseListQuerySchema = listQuerySchema.extend({
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  courseStatus: z.enum(['draft', 'review', 'published', 'archived', 'suspended']).optional(),
  isFree: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  currency: z.string().optional(),
  isInstructorCourse: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  courseId: z.string().regex(/^\d+$/).transform(Number).optional(),
  languageId: z.string().regex(/^\d+$/).transform(Number).optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  sortTable: z.enum(['course']).optional(),
});

// ============================================================================
// 2. COURSE TRANSLATIONS SCHEMAS
// ============================================================================

const createCourseTranslationSchema = z.object({
  courseId: coercePositiveInt,
  languageId: coercePositiveInt,
  title: z.string().min(1).max(500).trim(),
  shortIntro: z.string().max(1000).nullable().optional(),
  longIntro: z.string().nullable().optional(),
  tagline: z.string().max(500).nullable().optional(),
  videoTitle: z.string().max(500).nullable().optional(),
  videoDescription: z.string().nullable().optional(),
  videoDurationMinutes: coercePositiveInt.nullable().optional(),
  tags: z.array(z.any()).nullable().optional(),
  isNewTitle: z.string().max(200).nullable().optional(),
  prerequisites: z.array(z.any()).nullable().optional(),
  skillsGain: z.array(z.any()).nullable().optional(),
  whatYouWillLearn: z.array(z.any()).nullable().optional(),
  courseIncludes: z.array(z.any()).nullable().optional(),
  courseIsFor: z.array(z.any()).nullable().optional(),
  applyForDesignations: z.array(z.any()).nullable().optional(),
  demandInCountries: z.array(z.any()).nullable().optional(),
  salaryStandard: z.array(z.any()).nullable().optional(),
  futureCourses: z.array(z.any()).nullable().optional(),
  metaTitle: z.string().max(500).nullable().optional(),
  metaDescription: z.string().max(1000).nullable().optional(),
  metaKeywords: z.string().max(500).nullable().optional(),
  canonicalUrl: z.string().url().nullable().optional(),
  ogSiteName: z.string().max(200).nullable().optional(),
  ogTitle: z.string().max(500).nullable().optional(),
  ogDescription: z.string().max(1000).nullable().optional(),
  ogType: z.string().max(50).nullable().optional(),
  ogImage: z.string().nullable().optional(),
  ogUrl: z.string().url().nullable().optional(),
  twitterSite: z.string().max(200).nullable().optional(),
  twitterTitle: z.string().max(500).nullable().optional(),
  twitterDescription: z.string().max(1000).nullable().optional(),
  twitterImage: z.string().nullable().optional(),
  twitterCard: z.string().max(50).optional().default('summary_large_image'),
  robotsDirective: z.string().max(100).optional().default('index,follow'),
  focusKeyword: z.string().max(200).nullable().optional(),
  structuredData: z.any().nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

const updateCourseTranslationSchema = z.object({
  title: z.string().min(1).max(500).trim().optional(),
  shortIntro: z.string().max(1000).nullable().optional(),
  longIntro: z.string().nullable().optional(),
  tagline: z.string().max(500).nullable().optional(),
  videoTitle: z.string().max(500).nullable().optional(),
  videoDescription: z.string().nullable().optional(),
  videoDurationMinutes: coercePositiveInt.nullable().optional(),
  tags: z.array(z.any()).nullable().optional(),
  isNewTitle: z.string().max(200).nullable().optional(),
  prerequisites: z.array(z.any()).nullable().optional(),
  skillsGain: z.array(z.any()).nullable().optional(),
  whatYouWillLearn: z.array(z.any()).nullable().optional(),
  courseIncludes: z.array(z.any()).nullable().optional(),
  courseIsFor: z.array(z.any()).nullable().optional(),
  applyForDesignations: z.array(z.any()).nullable().optional(),
  demandInCountries: z.array(z.any()).nullable().optional(),
  salaryStandard: z.array(z.any()).nullable().optional(),
  futureCourses: z.array(z.any()).nullable().optional(),
  metaTitle: z.string().max(500).nullable().optional(),
  metaDescription: z.string().max(1000).nullable().optional(),
  metaKeywords: z.string().max(500).nullable().optional(),
  canonicalUrl: z.string().url().nullable().optional(),
  ogSiteName: z.string().max(200).nullable().optional(),
  ogTitle: z.string().max(500).nullable().optional(),
  ogDescription: z.string().max(1000).nullable().optional(),
  ogType: z.string().max(50).nullable().optional(),
  ogImage: z.string().nullable().optional(),
  ogUrl: z.string().url().nullable().optional(),
  twitterSite: z.string().max(200).nullable().optional(),
  twitterTitle: z.string().max(500).nullable().optional(),
  twitterDescription: z.string().max(1000).nullable().optional(),
  twitterImage: z.string().nullable().optional(),
  twitterCard: z.string().max(50).optional(),
  robotsDirective: z.string().max(100).optional(),
  focusKeyword: z.string().max(200).nullable().optional(),
  structuredData: z.any().nullable().optional(),
  isActive: z.boolean().optional(),
}).strict();

// ============================================================================
// 3. COURSE MODULES SCHEMAS
// ============================================================================

const createCourseModuleSchema = z.object({
  courseId: coercePositiveInt,
  slug: z.string().max(255).trim().nullable().optional(),
  displayOrder: z.number().int().nonnegative().optional().default(0),
  estimatedMinutes: coercePositiveInt.nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

const updateCourseModuleSchema = z.object({
  slug: z.string().max(255).trim().nullable().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
  estimatedMinutes: coercePositiveInt.nullable().optional(),
  isActive: z.boolean().optional(),
}).strict();

const courseModuleListQuerySchema = listQuerySchema.extend({
  courseId: z.string().regex(/^\d+$/).transform(Number).optional(),
  courseModuleId: z.string().regex(/^\d+$/).transform(Number).optional(),
  languageId: z.string().regex(/^\d+$/).transform(Number).optional(),
  filterCourseId: z.string().regex(/^\d+$/).transform(Number).optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  sortTable: z.enum(['module']).optional(),
});

// ============================================================================
// 4. COURSE MODULE TRANSLATIONS SCHEMAS
// ============================================================================

const createCourseModuleTranslationSchema = z.object({
  courseModuleId: coercePositiveInt,
  languageId: coercePositiveInt,
  name: z.string().min(1).max(500).trim(),
  shortIntro: z.string().max(1000).nullable().optional(),
  description: z.string().nullable().optional(),
  tags: z.array(z.any()).nullable().optional(),
  metaTitle: z.string().max(500).nullable().optional(),
  metaDescription: z.string().max(1000).nullable().optional(),
  metaKeywords: z.string().max(500).nullable().optional(),
  canonicalUrl: z.string().url().nullable().optional(),
  ogSiteName: z.string().max(200).nullable().optional(),
  ogTitle: z.string().max(500).nullable().optional(),
  ogDescription: z.string().max(1000).nullable().optional(),
  ogType: z.string().max(50).nullable().optional(),
  ogImage: z.string().nullable().optional(),
  ogUrl: z.string().url().nullable().optional(),
  twitterSite: z.string().max(200).nullable().optional(),
  twitterTitle: z.string().max(500).nullable().optional(),
  twitterDescription: z.string().max(1000).nullable().optional(),
  twitterImage: z.string().nullable().optional(),
  twitterCard: z.string().max(50).optional().default('summary_large_image'),
  robotsDirective: z.string().max(100).optional().default('index,follow'),
  focusKeyword: z.string().max(200).nullable().optional(),
  structuredData: z.any().nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

const updateCourseModuleTranslationSchema = z.object({
  name: z.string().min(1).max(500).trim().optional(),
  shortIntro: z.string().max(1000).nullable().optional(),
  description: z.string().nullable().optional(),
  tags: z.array(z.any()).nullable().optional(),
  metaTitle: z.string().max(500).nullable().optional(),
  metaDescription: z.string().max(1000).nullable().optional(),
  metaKeywords: z.string().max(500).nullable().optional(),
  canonicalUrl: z.string().url().nullable().optional(),
  ogSiteName: z.string().max(200).nullable().optional(),
  ogTitle: z.string().max(500).nullable().optional(),
  ogDescription: z.string().max(1000).nullable().optional(),
  ogType: z.string().max(50).nullable().optional(),
  ogImage: z.string().nullable().optional(),
  ogUrl: z.string().url().nullable().optional(),
  twitterSite: z.string().max(200).nullable().optional(),
  twitterTitle: z.string().max(500).nullable().optional(),
  twitterDescription: z.string().max(1000).nullable().optional(),
  twitterImage: z.string().nullable().optional(),
  twitterCard: z.string().max(50).optional(),
  robotsDirective: z.string().max(100).optional(),
  focusKeyword: z.string().max(200).nullable().optional(),
  structuredData: z.any().nullable().optional(),
  isActive: z.boolean().optional(),
}).strict();

// ============================================================================
// 5. COURSE MODULE TOPICS SCHEMAS
// ============================================================================

const createCourseModuleTopicSchema = z.object({
  courseModuleId: coercePositiveInt,
  topicId: coercePositiveInt.nullable().optional(),
  displayOrder: z.number().int().nonnegative().optional().default(0),
  customTitle: z.string().max(500).nullable().optional(),
  customDescription: z.string().nullable().optional(),
  estimatedMinutes: coercePositiveInt.nullable().optional(),
  isPreview: z.boolean().optional().default(false),
  note: z.string().max(1000).nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

const updateCourseModuleTopicSchema = z.object({
  courseModuleId: coercePositiveInt.optional(),
  topicId: coercePositiveInt.nullable().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
  customTitle: z.string().max(500).nullable().optional(),
  customDescription: z.string().nullable().optional(),
  estimatedMinutes: coercePositiveInt.nullable().optional(),
  isPreview: z.boolean().optional(),
  note: z.string().max(1000).nullable().optional(),
  isActive: z.boolean().optional(),
}).strict();

const courseModuleTopicListQuerySchema = listQuerySchema.extend({
  courseModuleId: z.string().regex(/^\d+$/).transform(Number).optional(),
  topicId: z.string().regex(/^\d+$/).transform(Number).optional(),
  filterCourseModuleId: z.string().regex(/^\d+$/).transform(Number).optional(),
  isPreview: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  hasTopic: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

const bulkIdsSchema = z.object({
  ids: z.array(coercePositiveInt).min(1),
});

// ============================================================================
// 6. COURSE SUB-CATEGORIES SCHEMAS
// ============================================================================

const createCourseSubCategorySchema = z.object({
  courseId: coercePositiveInt,
  subCategoryId: coercePositiveInt,
  isPrimary: z.boolean().optional().default(false),
  displayOrder: z.number().int().nonnegative().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

const updateCourseSubCategorySchema = z.object({
  isPrimary: z.boolean().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
}).strict();

// ============================================================================
// 7. COURSE SUBJECTS SCHEMAS
// ============================================================================

const createCourseSubjectSchema = z.object({
  courseId: coercePositiveInt,
  moduleId: coercePositiveInt,
  subjectId: coercePositiveInt,
  displayOrder: z.number().int().nonnegative().optional().default(0),
  note: z.string().max(1000).nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

const updateCourseSubjectSchema = z.object({
  displayOrder: z.number().int().nonnegative().optional(),
  note: z.string().max(1000).nullable().optional(),
  isActive: z.boolean().optional(),
}).strict();

// ============================================================================
// 8. COURSE CHAPTERS SCHEMAS
// ============================================================================

const createCourseChapterSchema = z.object({
  courseSubjectId: coercePositiveInt,
  chapterId: coercePositiveInt,
  displayOrder: z.number().int().nonnegative().optional().default(0),
  isFreeTrial: z.boolean().optional().default(false),
  note: z.string().max(1000).nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

const updateCourseChapterSchema = z.object({
  displayOrder: z.number().int().nonnegative().optional(),
  isFreeTrial: z.boolean().optional(),
  note: z.string().max(1000).nullable().optional(),
  isActive: z.boolean().optional(),
}).strict();

// ============================================================================
// 9. COURSE INSTRUCTORS SCHEMAS
// ============================================================================

const createCourseInstructorSchema = z.object({
  courseId: coercePositiveInt,
  instructorId: coercePositiveInt,
  instructorRole: z.enum(['lead', 'co_instructor', 'teaching_assistant', 'guest']).optional().default('co_instructor'),
  contribution: z.string().max(500).nullable().optional(),
  revenueSharePct: z.number().min(0).max(100).nullable().optional(),
  joinDate: z.string().nullable().optional(),
  leaveDate: z.string().nullable().optional(),
  displayOrder: z.number().int().nonnegative().optional().default(0),
  isVisible: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true),
});

const updateCourseInstructorSchema = z.object({
  instructorRole: z.enum(['lead', 'co_instructor', 'teaching_assistant', 'guest']).optional(),
  contribution: z.string().max(500).nullable().optional(),
  revenueSharePct: z.number().min(0).max(100).nullable().optional(),
  joinDate: z.string().nullable().optional(),
  leaveDate: z.string().nullable().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
  isVisible: z.boolean().optional(),
  isActive: z.boolean().optional(),
}).strict();

// ============================================================================
// 10. BUNDLES SCHEMAS
// ============================================================================

const createBundleSchema = z.object({
  bundleOwner: z.enum(['system', 'instructor']).optional().default('system'),
  instructorId: coercePositiveInt.nullable().optional(),
  code: z.string().max(100).trim().nullable().optional(),
  slug: z.string().max(255).trim().nullable().optional(),
  price: z.number().nonnegative().optional().default(0),
  originalPrice: z.number().nonnegative().nullable().optional(),
  discountPercentage: z.number().min(0).max(100).nullable().optional(),
  validityDays: coercePositiveInt.nullable().optional(),
  startsAt: z.string().datetime().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  isFeatured: z.boolean().optional().default(false),
  displayOrder: z.number().int().nonnegative().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

const updateBundleSchema = z.object({
  bundleOwner: z.enum(['system', 'instructor']).optional(),
  instructorId: coercePositiveInt.nullable().optional(),
  code: z.string().max(100).trim().nullable().optional(),
  slug: z.string().max(255).trim().nullable().optional(),
  price: z.number().nonnegative().optional(),
  originalPrice: z.number().nonnegative().nullable().optional(),
  discountPercentage: z.number().min(0).max(100).nullable().optional(),
  validityDays: coercePositiveInt.nullable().optional(),
  startsAt: z.string().datetime().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  isFeatured: z.boolean().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
}).strict();

const bundleListQuerySchema = listQuerySchema.extend({
  bundleOwner: z.enum(['system', 'instructor']).optional(),
  isFeatured: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  bundleId: z.string().regex(/^\d+$/).transform(Number).optional(),
  languageId: z.string().regex(/^\d+$/).transform(Number).optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  sortTable: z.enum(['bundle']).optional(),
});

// ============================================================================
// 11. BUNDLE TRANSLATIONS SCHEMAS
// ============================================================================

const createBundleTranslationSchema = z.object({
  bundleId: coercePositiveInt,
  languageId: coercePositiveInt,
  title: z.string().min(1).max(500).trim(),
  description: z.string().nullable().optional(),
  shortDescription: z.string().max(1000).nullable().optional(),
  highlights: z.array(z.any()).nullable().optional(),
  tags: z.array(z.any()).nullable().optional(),
  metaTitle: z.string().max(500).nullable().optional(),
  metaDescription: z.string().max(1000).nullable().optional(),
  metaKeywords: z.string().max(500).nullable().optional(),
  canonicalUrl: z.string().url().nullable().optional(),
  ogSiteName: z.string().max(200).nullable().optional(),
  ogTitle: z.string().max(500).nullable().optional(),
  ogDescription: z.string().max(1000).nullable().optional(),
  ogType: z.string().max(50).nullable().optional(),
  ogImage: z.string().nullable().optional(),
  ogUrl: z.string().url().nullable().optional(),
  twitterSite: z.string().max(200).nullable().optional(),
  twitterTitle: z.string().max(500).nullable().optional(),
  twitterDescription: z.string().max(1000).nullable().optional(),
  twitterImage: z.string().nullable().optional(),
  twitterCard: z.string().max(50).optional().default('summary_large_image'),
  robotsDirective: z.string().max(100).optional().default('index,follow'),
  focusKeyword: z.string().max(200).nullable().optional(),
  structuredData: z.any().nullable().optional(),
  isActive: z.boolean().optional().default(true),
});

const updateBundleTranslationSchema = z.object({
  title: z.string().min(1).max(500).trim().optional(),
  description: z.string().nullable().optional(),
  shortDescription: z.string().max(1000).nullable().optional(),
  highlights: z.array(z.any()).nullable().optional(),
  tags: z.array(z.any()).nullable().optional(),
  metaTitle: z.string().max(500).nullable().optional(),
  metaDescription: z.string().max(1000).nullable().optional(),
  metaKeywords: z.string().max(500).nullable().optional(),
  canonicalUrl: z.string().url().nullable().optional(),
  ogSiteName: z.string().max(200).nullable().optional(),
  ogTitle: z.string().max(500).nullable().optional(),
  ogDescription: z.string().max(1000).nullable().optional(),
  ogType: z.string().max(50).nullable().optional(),
  ogImage: z.string().nullable().optional(),
  ogUrl: z.string().url().nullable().optional(),
  twitterSite: z.string().max(200).nullable().optional(),
  twitterTitle: z.string().max(500).nullable().optional(),
  twitterDescription: z.string().max(1000).nullable().optional(),
  twitterImage: z.string().nullable().optional(),
  twitterCard: z.string().max(50).optional(),
  robotsDirective: z.string().max(100).optional(),
  focusKeyword: z.string().max(200).nullable().optional(),
  structuredData: z.any().nullable().optional(),
  isActive: z.boolean().optional(),
}).strict();

// ============================================================================
// 12. BUNDLE COURSES SCHEMAS
// ============================================================================

const createBundleCourseSchema = z.object({
  bundleId: coercePositiveInt,
  courseId: coercePositiveInt,
  displayOrder: z.number().int().nonnegative().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

const updateBundleCourseSchema = z.object({
  displayOrder: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
}).strict();

const bundleCourseListQuerySchema = listQuerySchema.extend({
  bundleId: z.string().regex(/^\d+$/).transform(Number).optional(),
  courseId: z.string().regex(/^\d+$/).transform(Number).optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

// ============================================================================
// RESTORE SCHEMA
// ============================================================================

const restoreSchema = z.preprocess(
  (val) => (val === undefined || val === null ? {} : val),
  z.object({
    restoreTranslations: z.boolean().optional().default(false),
  })
);

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Shared
  idParamSchema,
  listQuerySchema,

  // Courses
  createCourseSchema,
  updateCourseSchema,
  courseListQuerySchema,

  // Course Translations
  createCourseTranslationSchema,
  updateCourseTranslationSchema,

  // Course Modules
  createCourseModuleSchema,
  updateCourseModuleSchema,
  courseModuleListQuerySchema,

  // Course Module Translations
  createCourseModuleTranslationSchema,
  updateCourseModuleTranslationSchema,

  // Course Module Topics
  createCourseModuleTopicSchema,
  updateCourseModuleTopicSchema,
  courseModuleTopicListQuerySchema,
  bulkIdsSchema,

  // Course Sub-Categories
  createCourseSubCategorySchema,
  updateCourseSubCategorySchema,

  // Course Subjects
  createCourseSubjectSchema,
  updateCourseSubjectSchema,

  // Course Chapters
  createCourseChapterSchema,
  updateCourseChapterSchema,

  // Course Instructors
  createCourseInstructorSchema,
  updateCourseInstructorSchema,

  // Bundles
  createBundleSchema,
  updateBundleSchema,
  bundleListQuerySchema,

  // Bundle Translations
  createBundleTranslationSchema,
  updateBundleTranslationSchema,

  // Bundle Courses
  createBundleCourseSchema,
  updateBundleCourseSchema,
  bundleCourseListQuerySchema,

  // Restore
  restoreSchema,
};
