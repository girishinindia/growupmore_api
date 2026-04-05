/**
 * ═══════════════════════════════════════════════════════════════
 * INSTRUCTOR MANAGEMENT VALIDATORS — Zod Schemas
 * ═══════════════════════════════════════════════════════════════
 * Instructor Profiles validation schemas
 * ═══════════════════════════════════════════════════════════════
 */

const { z } = require('zod');

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
// INSTRUCTOR PROFILE SCHEMAS
// ============================================================================

const createInstructorProfileSchema = z.object({
  userId: z.number().int().positive('User ID is required'),
  instructorCode: z.string().min(1).max(100).trim(),
  instructorType: z.enum(['internal', 'external', 'guest', 'visiting', 'corporate', 'community', 'other']).optional().default('external'),
  designationId: z.number().int().positive().optional().nullable(),
  departmentId: z.number().int().positive().optional().nullable(),
  branchId: z.number().int().positive().optional().nullable(),
  joiningDate: z.string().date().optional().nullable(),
  specializationId: z.number().int().positive().optional().nullable(),
  secondarySpecializationId: z.number().int().positive().optional().nullable(),
  teachingExperienceYears: z.number().nonnegative().optional().nullable(),
  industryExperienceYears: z.number().nonnegative().optional().nullable(),
  totalExperienceYears: z.number().nonnegative().optional().nullable(),
  preferredTeachingLanguageId: z.number().int().positive().optional().nullable(),
  teachingMode: z.enum(['online', 'offline', 'hybrid', 'recorded']).optional().default('online'),
  instructorBio: z.string().max(5000).optional().nullable(),
  tagline: z.string().max(500).optional().nullable(),
  demoVideoUrl: z.string().max(500).url().optional().nullable(),
  introVideoDurationSec: z.number().int().nonnegative().optional().nullable(),
  highestQualification: z.string().max(500).optional().nullable(),
  certificationsSummary: z.string().max(2000).optional().nullable(),
  awardsAndRecognition: z.string().max(2000).optional().nullable(),
  isAvailable: z.boolean().optional().default(true),
  availableHoursPerWeek: z.number().nonnegative().optional().nullable(),
  availableFrom: z.string().date().optional().nullable(),
  availableUntil: z.string().date().optional().nullable(),
  preferredTimeSlots: z.string().max(500).optional().nullable(),
  maxConcurrentCourses: z.number().int().positive().optional().default(3),
  paymentModel: z.enum(['revenue_share', 'fixed_per_course', 'hourly', 'salary', 'hybrid']).optional().default('revenue_share'),
  revenueSharePercentage: z.number().nonnegative().max(100).optional().nullable(),
  fixedRatePerCourse: z.number().nonnegative().optional().nullable(),
  hourlyRate: z.number().nonnegative().optional().nullable(),
  paymentCurrency: z.string().max(10).optional().default('INR'),
  isActive: z.boolean().optional().default(true),
});

const updateInstructorProfileSchema = z.object({
  instructorCode: z.string().min(1).max(100).trim().optional(),
  instructorType: z.enum(['internal', 'external', 'guest', 'visiting', 'corporate', 'community', 'other']).optional(),
  designationId: z.number().int().positive().optional().nullable(),
  departmentId: z.number().int().positive().optional().nullable(),
  branchId: z.number().int().positive().optional().nullable(),
  joiningDate: z.string().date().optional().nullable(),
  specializationId: z.number().int().positive().optional().nullable(),
  secondarySpecializationId: z.number().int().positive().optional().nullable(),
  teachingExperienceYears: z.number().nonnegative().optional().nullable(),
  industryExperienceYears: z.number().nonnegative().optional().nullable(),
  totalExperienceYears: z.number().nonnegative().optional().nullable(),
  preferredTeachingLanguageId: z.number().int().positive().optional().nullable(),
  teachingMode: z.enum(['online', 'offline', 'hybrid', 'recorded']).optional().nullable(),
  instructorBio: z.string().max(5000).optional().nullable(),
  tagline: z.string().max(500).optional().nullable(),
  demoVideoUrl: z.string().max(500).url().optional().nullable(),
  introVideoDurationSec: z.number().int().nonnegative().optional().nullable(),
  highestQualification: z.string().max(500).optional().nullable(),
  certificationsSummary: z.string().max(2000).optional().nullable(),
  awardsAndRecognition: z.string().max(2000).optional().nullable(),
  publicationsCount: z.number().int().nonnegative().optional().nullable(),
  patentsCount: z.number().int().nonnegative().optional().nullable(),
  totalCoursesCreated: z.number().int().nonnegative().optional().nullable(),
  totalCoursesPublished: z.number().int().nonnegative().optional().nullable(),
  totalStudentsTaught: z.number().int().nonnegative().optional().nullable(),
  totalReviewsReceived: z.number().int().nonnegative().optional().nullable(),
  averageRating: z.number().nonnegative().max(5).optional().nullable(),
  totalTeachingHours: z.number().nonnegative().optional().nullable(),
  totalContentMinutes: z.number().int().nonnegative().optional().nullable(),
  completionRate: z.number().nonnegative().max(100).optional().nullable(),
  isAvailable: z.boolean().optional(),
  availableHoursPerWeek: z.number().nonnegative().optional().nullable(),
  availableFrom: z.string().date().optional().nullable(),
  availableUntil: z.string().date().optional().nullable(),
  preferredTimeSlots: z.string().max(500).optional().nullable(),
  maxConcurrentCourses: z.number().int().positive().optional().nullable(),
  paymentModel: z.enum(['revenue_share', 'fixed_per_course', 'hourly', 'salary', 'hybrid']).optional().nullable(),
  revenueSharePercentage: z.number().nonnegative().max(100).optional().nullable(),
  fixedRatePerCourse: z.number().nonnegative().optional().nullable(),
  hourlyRate: z.number().nonnegative().optional().nullable(),
  paymentCurrency: z.string().max(10).optional().nullable(),
  approvalStatus: z.enum(['pending', 'approved', 'rejected', 'suspended']).optional().nullable(),
  approvedBy: z.number().int().positive().optional().nullable(),
  approvedAt: z.string().datetime().optional().nullable(),
  rejectionReason: z.string().max(1000).optional().nullable(),
  isVerified: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  badge: z.enum(['new', 'rising_star', 'popular', 'top_rated', 'expert', 'master', 'elite']).optional().nullable(),
  isActive: z.boolean().optional(),
});

const instructorProfileListQuerySchema = listQuerySchema.extend({
  userId: z.string().regex(/^\d+$/).transform(Number).optional(),
  instructorType: z.string().max(50).optional(),
  teachingMode: z.string().max(50).optional(),
  approvalStatus: z.string().max(50).optional(),
  paymentModel: z.string().max(50).optional(),
  badge: z.string().max(50).optional(),
  specializationId: z.string().regex(/^\d+$/).transform(Number).optional(),
  designationId: z.string().regex(/^\d+$/).transform(Number).optional(),
  departmentId: z.string().regex(/^\d+$/).transform(Number).optional(),
  branchId: z.string().regex(/^\d+$/).transform(Number).optional(),
  isAvailable: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  isVerified: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  isFeatured: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Shared
  idParamSchema,
  listQuerySchema,

  // Instructor Profiles
  createInstructorProfileSchema,
  updateInstructorProfileSchema,
  instructorProfileListQuerySchema,
};
