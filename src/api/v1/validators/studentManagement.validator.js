/**
 * ═══════════════════════════════════════════════════════════════
 * STUDENT MANAGEMENT VALIDATORS — Zod Schemas
 * ═══════════════════════════════════════════════════════════════
 * Student Profiles validation schemas
 * ═══════════════════════════════════════════════════════════════
 */

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
// STUDENT PROFILE SCHEMAS
// ============================================================================

const createStudentProfileSchema = z.object({
  userId: coercePositiveInt,
  enrollmentNumber: z.string().min(1).max(100).trim(),
  enrollmentDate: z.string().date().optional().nullable(),
  enrollmentType: z.enum(['self', 'corporate', 'scholarship', 'referral', 'trial', 'other']).optional().default('self'),
  educationLevelId: coercePositiveInt.optional().nullable(),
  currentInstitution: z.string().max(500).optional().nullable(),
  currentFieldOfStudy: z.string().max(500).optional().nullable(),
  currentSemesterOrYear: z.string().max(100).optional().nullable(),
  expectedGraduationDate: z.string().date().optional().nullable(),
  isCurrentlyStudying: z.boolean().optional().default(false),
  learningGoalId: coercePositiveInt.optional().nullable(),
  specializationId: coercePositiveInt.optional().nullable(),
  preferredLearningMode: z.enum(['self_paced', 'instructor_led', 'blended', 'live_online', 'offline_classroom']).optional().default('self_paced'),
  preferredLearningLanguageId: coercePositiveInt.optional().nullable(),
  preferredContentType: z.enum(['video', 'text', 'interactive', 'audio', 'mixed']).optional().default('video'),
  dailyLearningHours: z.number().positive().optional().nullable(),
  weeklyAvailableDays: z.number().int().min(1).max(7).optional().default(5),
  difficultyPreference: z.enum(['beginner', 'intermediate', 'advanced', 'mixed']).optional().default('intermediate'),
  parentGuardianName: z.string().max(200).optional().nullable(),
  parentGuardianPhone: z.string().max(20).optional().nullable(),
  parentGuardianEmail: z.string().email().optional().nullable(),
  parentGuardianRelation: z.string().max(100).optional().nullable(),
  subscriptionPlan: z.enum(['free', 'basic', 'premium', 'enterprise']).optional().default('free'),
  referredByUserId: coercePositiveInt.optional().nullable(),
  referralCode: z.string().max(100).optional().nullable(),
  isSeekingJob: z.boolean().optional().default(false),
  preferredJobRoles: z.string().max(500).optional().nullable(),
  preferredLocations: z.string().max(500).optional().nullable(),
  expectedSalaryRange: z.string().max(100).optional().nullable(),
  resumeUrl: z.string().max(1000).url().optional().nullable(),
  portfolioUrl: z.string().max(1000).url().optional().nullable(),
  isOpenToInternship: z.boolean().optional().default(false),
  isOpenToFreelance: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
});

const updateStudentProfileSchema = z.object({
  enrollmentNumber: z.string().min(1).max(100).trim().optional(),
  enrollmentDate: z.string().date().optional().nullable(),
  enrollmentType: z.enum(['self', 'corporate', 'scholarship', 'referral', 'trial', 'other']).optional().nullable(),
  educationLevelId: coercePositiveInt.optional().nullable(),
  currentInstitution: z.string().max(500).optional().nullable(),
  currentFieldOfStudy: z.string().max(500).optional().nullable(),
  currentSemesterOrYear: z.string().max(100).optional().nullable(),
  expectedGraduationDate: z.string().date().optional().nullable(),
  isCurrentlyStudying: z.boolean().optional(),
  learningGoalId: coercePositiveInt.optional().nullable(),
  specializationId: coercePositiveInt.optional().nullable(),
  preferredLearningMode: z.enum(['self_paced', 'instructor_led', 'blended', 'live_online', 'offline_classroom']).optional().nullable(),
  preferredLearningLanguageId: coercePositiveInt.optional().nullable(),
  preferredContentType: z.enum(['video', 'text', 'interactive', 'audio', 'mixed']).optional().nullable(),
  dailyLearningHours: z.number().positive().optional().nullable(),
  weeklyAvailableDays: z.number().int().min(1).max(7).optional().nullable(),
  difficultyPreference: z.enum(['beginner', 'intermediate', 'advanced', 'mixed']).optional().nullable(),
  parentGuardianName: z.string().max(200).optional().nullable(),
  parentGuardianPhone: z.string().max(20).optional().nullable(),
  parentGuardianEmail: z.string().email().optional().nullable(),
  parentGuardianRelation: z.string().max(100).optional().nullable(),
  coursesEnrolled: z.number().int().min(0).optional().nullable(),
  coursesCompleted: z.number().int().min(0).optional().nullable(),
  coursesInProgress: z.number().int().min(0).optional().nullable(),
  certificatesEarned: z.number().int().min(0).optional().nullable(),
  totalLearningHours: z.number().min(0).optional().nullable(),
  averageScore: z.number().min(0).max(100).optional().nullable(),
  currentStreakDays: z.number().int().min(0).optional().nullable(),
  longestStreakDays: z.number().int().min(0).optional().nullable(),
  xpPoints: z.number().int().min(0).optional().nullable(),
  level: z.number().int().min(1).optional().nullable(),
  subscriptionPlan: z.enum(['free', 'basic', 'premium', 'enterprise']).optional().nullable(),
  subscriptionStartDate: z.string().date().optional().nullable(),
  subscriptionEndDate: z.string().date().optional().nullable(),
  totalAmountPaid: z.number().min(0).optional().nullable(),
  hasActiveSubscription: z.boolean().optional(),
  referredByUserId: coercePositiveInt.optional().nullable(),
  referralCode: z.string().max(100).optional().nullable(),
  isSeekingJob: z.boolean().optional(),
  preferredJobRoles: z.string().max(500).optional().nullable(),
  preferredLocations: z.string().max(500).optional().nullable(),
  expectedSalaryRange: z.string().max(100).optional().nullable(),
  portfolioUrl: z.string().max(1000).url().optional().nullable(),
  isOpenToInternship: z.boolean().optional(),
  isOpenToFreelance: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

const studentProfileListQuerySchema = listQuerySchema.extend({
  userId: z.string().regex(/^\d+$/).transform(Number).optional(),
  enrollmentType: z.enum(['self', 'corporate', 'scholarship', 'referral', 'trial', 'other']).optional(),
  preferredLearningMode: z.enum(['self_paced', 'instructor_led', 'blended', 'live_online', 'offline_classroom']).optional(),
  difficultyPreference: z.enum(['beginner', 'intermediate', 'advanced', 'mixed']).optional(),
  subscriptionPlan: z.enum(['free', 'basic', 'premium', 'enterprise']).optional(),
  educationLevelId: z.string().regex(/^\d+$/).transform(Number).optional(),
  learningGoalId: z.string().regex(/^\d+$/).transform(Number).optional(),
  specializationId: z.string().regex(/^\d+$/).transform(Number).optional(),
  isCurrentlyStudying: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  isSeekingJob: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
});

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Shared
  idParamSchema,
  listQuerySchema,

  // Student Profiles
  createStudentProfileSchema,
  updateStudentProfileSchema,
  studentProfileListQuerySchema,
};
