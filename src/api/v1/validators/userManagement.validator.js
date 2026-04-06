const { z } = require('zod');
const { getValidRoleCodes } = require('../../../utils/roleCache');

const coerceBoolean = z.preprocess(
  (val) => {
    if (typeof val === 'boolean') return val;
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  },
  z.boolean()
);

const coerceSmallInt = z.preprocess(
  (val) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') { const n = parseInt(val, 10); return isNaN(n) ? val : n; }
    return val;
  },
  z.number().int()
);

const coerceNumber = z.preprocess(
  (val) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') { const n = Number(val); return isNaN(n) ? val : n; }
    return val;
  },
  z.number()
);

const coercePositiveNumber = z.preprocess(
  (val) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') { const n = Number(val); return isNaN(n) ? val : n; }
    return val;
  },
  z.number().positive()
);

// ============================================================================
// SHARED SCHEMAS
// ============================================================================

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/).transform(Number)
});

const listQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1').transform(Number),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10').transform(Number),
  search: z.string().max(255).optional(),
  sortBy: z.string().max(100).optional(),
  sortDir: z.enum(['asc', 'desc']).optional()
});

// ============================================================================
// USERS
// ============================================================================

const createUserSchema = z.object({
  countryId: z.number().int().positive('Country ID must be a positive number'),
  firstName: z.string().min(1).max(100, 'First name must be between 1 and 100 characters'),
  lastName: z.string().min(1).max(100, 'Last name must be between 1 and 100 characters'),
  password: z.string().min(6).max(100, 'Password must be between 6 and 100 characters'),
  email: z.string().email().optional().nullable(),
  mobile: z.string().optional().nullable(),
  role: z.string().default('student').refine(
    (val) => getValidRoleCodes().includes(val),
    { message: () => `Invalid role. Valid roles: ${getValidRoleCodes().join(', ')}` },
  ),
  isActive: coerceBoolean.default(true)
});

const updateUserSchema = z.object({
  countryId: z.number().int().positive('Country ID must be a positive number').optional(),
  firstName: z.string().min(1).max(100, 'First name must be between 1 and 100 characters').optional(),
  lastName: z.string().min(1).max(100, 'Last name must be between 1 and 100 characters').optional(),
  email: z.string().email().optional().nullable(),
  mobile: z.string().optional().nullable(),
  role: z.string().optional().refine(
    (val) => val === undefined || getValidRoleCodes().includes(val),
    { message: () => `Invalid role. Valid roles: ${getValidRoleCodes().join(', ')}` },
  ),
  isActive: coerceBoolean.optional()
});

const userListQuerySchema = listQuerySchema.extend({
  role: z.string().optional().refine(
    (val) => val === undefined || getValidRoleCodes().includes(val),
    { message: () => `Invalid role. Valid roles: ${getValidRoleCodes().join(', ')}` },
  ),
  countryId: z.string().regex(/^\d+$/).transform(Number).optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  isEmailVerified: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  isMobileVerified: z.enum(['true', 'false']).transform(v => v === 'true').optional()
});

// ============================================================================
// USER PROFILES
// ============================================================================

const createUserProfileSchema = z.object({
  userId: z.number().int().positive('User ID must be a positive number'),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional().nullable(),
  bloodGroup: z.string().optional().nullable(),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed', 'separated']).optional().nullable(),
  nationality: z.string().optional().nullable(),
  about: z.string().optional().nullable(),
  headline: z.string().optional().nullable(),
  addressLine1: z.string().optional().nullable(),
  addressLine2: z.string().optional().nullable(),
  landmark: z.string().optional().nullable(),
  countryId: z.number().int().positive().optional().nullable(),
  stateId: z.number().int().positive().optional().nullable(),
  cityId: z.number().int().positive().optional().nullable(),
  pincode: z.string().optional().nullable(),
  currentAddressLine1: z.string().optional().nullable(),
  currentAddressLine2: z.string().optional().nullable(),
  currentLandmark: z.string().optional().nullable(),
  currentCountryId: z.number().int().positive().optional().nullable(),
  currentStateId: z.number().int().positive().optional().nullable(),
  currentCityId: z.number().int().positive().optional().nullable(),
  currentPincode: z.string().optional().nullable(),
  isSameAsPermanent: coerceBoolean.optional(),
  alternateEmail: z.string().email().optional().nullable(),
  alternateMobile: z.string().optional().nullable(),
  whatsappNumber: z.string().optional().nullable(),
  emergencyContactName: z.string().optional().nullable(),
  emergencyContactPhone: z.string().optional().nullable(),
  emergencyContactRelation: z.string().optional().nullable(),
  aadharNumber: z.string().optional().nullable(),
  panNumber: z.string().optional().nullable(),
  passportNumber: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  bankAccountNumber: z.string().optional().nullable(),
  bankIfscCode: z.string().optional().nullable(),
  bankBranch: z.string().optional().nullable(),
  bankAccountType: z.enum(['savings', 'current']).optional().nullable(),
  upiId: z.string().optional().nullable(),
  gstNumber: z.string().optional().nullable(),
  preferredLanguageId: z.number().int().positive().optional().nullable(),
  timezone: z.string().default('Asia/Kolkata'),
  themePreference: z.enum(['light', 'dark', 'system']).default('system'),
  emailNotifications: coerceBoolean.optional(),
  smsNotifications: coerceBoolean.optional(),
  pushNotifications: coerceBoolean.optional(),
  isActive: coerceBoolean.default(true)
});

const updateUserProfileSchema = z.object({
  userId: z.number().int().positive('User ID must be a positive number').optional(),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional().nullable(),
  bloodGroup: z.string().optional().nullable(),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed', 'separated']).optional().nullable(),
  nationality: z.string().optional().nullable(),
  about: z.string().optional().nullable(),
  headline: z.string().optional().nullable(),
  addressLine1: z.string().optional().nullable(),
  addressLine2: z.string().optional().nullable(),
  landmark: z.string().optional().nullable(),
  countryId: z.number().int().positive().optional().nullable(),
  stateId: z.number().int().positive().optional().nullable(),
  cityId: z.number().int().positive().optional().nullable(),
  pincode: z.string().optional().nullable(),
  currentAddressLine1: z.string().optional().nullable(),
  currentAddressLine2: z.string().optional().nullable(),
  currentLandmark: z.string().optional().nullable(),
  currentCountryId: z.number().int().positive().optional().nullable(),
  currentStateId: z.number().int().positive().optional().nullable(),
  currentCityId: z.number().int().positive().optional().nullable(),
  currentPincode: z.string().optional().nullable(),
  isSameAsPermanent: coerceBoolean.optional(),
  alternateEmail: z.string().email().optional().nullable(),
  alternateMobile: z.string().optional().nullable(),
  whatsappNumber: z.string().optional().nullable(),
  emergencyContactName: z.string().optional().nullable(),
  emergencyContactPhone: z.string().optional().nullable(),
  emergencyContactRelation: z.string().optional().nullable(),
  aadharNumber: z.string().optional().nullable(),
  panNumber: z.string().optional().nullable(),
  passportNumber: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  bankAccountNumber: z.string().optional().nullable(),
  bankIfscCode: z.string().optional().nullable(),
  bankBranch: z.string().optional().nullable(),
  bankAccountType: z.enum(['savings', 'current']).optional().nullable(),
  upiId: z.string().optional().nullable(),
  gstNumber: z.string().optional().nullable(),
  preferredLanguageId: z.number().int().positive().optional().nullable(),
  timezone: z.string().optional(),
  themePreference: z.enum(['light', 'dark', 'system']).optional(),
  emailNotifications: coerceBoolean.optional(),
  smsNotifications: coerceBoolean.optional(),
  pushNotifications: coerceBoolean.optional(),
  isActive: coerceBoolean.optional()
});

const userProfileListQuerySchema = listQuerySchema.extend({
  userId: z.string().regex(/^\d+$/).transform(Number).optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  bloodGroup: z.string().max(10).optional(),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed', 'separated']).optional(),
  nationality: z.string().max(100).optional(),
  isProfileComplete: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  countryId: z.string().regex(/^\d+$/).transform(Number).optional(),
  stateId: z.string().regex(/^\d+$/).transform(Number).optional(),
  cityId: z.string().regex(/^\d+$/).transform(Number).optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional()
});

// ============================================================================
// USER EDUCATION
// ============================================================================

const createUserEducationSchema = z.object({
  userId: z.number().int().positive('User ID must be a positive number'),
  educationLevelId: z.number().int().positive('Education Level ID must be a positive number'),
  institutionName: z.string().min(1).max(300, 'Institution name must be between 1 and 300 characters'),
  boardOrUniversity: z.string().optional().nullable(),
  fieldOfStudy: z.string().optional().nullable(),
  specialization: z.string().optional().nullable(),
  gradeOrPercentage: z.string().optional().nullable(),
  gradeType: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  isCurrentlyStudying: coerceBoolean.default(false),
  isHighestQualification: coerceBoolean.default(false),
  description: z.string().optional().nullable(),
  isActive: coerceBoolean.default(true)
});

const updateUserEducationSchema = z.object({
  userId: z.number().int().positive('User ID must be a positive number').optional(),
  educationLevelId: z.number().int().positive('Education Level ID must be a positive number').optional(),
  institutionName: z.string().min(1).max(300, 'Institution name must be between 1 and 300 characters').optional(),
  boardOrUniversity: z.string().optional().nullable(),
  fieldOfStudy: z.string().optional().nullable(),
  specialization: z.string().optional().nullable(),
  gradeOrPercentage: z.string().optional().nullable(),
  gradeType: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  isCurrentlyStudying: coerceBoolean.optional(),
  isHighestQualification: coerceBoolean.optional(),
  description: z.string().optional().nullable(),
  isActive: coerceBoolean.optional()
});

const userEducationListQuerySchema = listQuerySchema.extend({
  userId: z.string().regex(/^\d+$/).transform(Number).optional(),
  educationLevelId: z.string().regex(/^\d+$/).transform(Number).optional(),
  levelCategory: z.string().max(100).optional(),
  gradeType: z.string().max(50).optional(),
  isCurrentlyStudying: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional()
});

// ============================================================================
// USER EXPERIENCE
// ============================================================================

const createUserExperienceSchema = z.object({
  userId: z.number().int().positive('User ID must be a positive number'),
  companyName: z.string().min(1).max(300, 'Company name must be between 1 and 300 characters'),
  jobTitle: z.string().min(1).max(300, 'Job title must be between 1 and 300 characters'),
  startDate: z.string(),
  designationId: z.number().int().positive().optional().nullable(),
  employmentType: z.enum(['full_time', 'part_time', 'contract', 'internship', 'freelance']).default('full_time'),
  department: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  workMode: z.enum(['on_site', 'remote', 'hybrid']).default('on_site'),
  endDate: z.string().optional().nullable(),
  isCurrentJob: coerceBoolean.default(false),
  description: z.string().optional().nullable(),
  keyAchievements: z.string().optional().nullable(),
  skillsUsed: z.string().optional().nullable(),
  salaryRange: z.string().optional().nullable(),
  referenceName: z.string().optional().nullable(),
  referencePhone: z.string().optional().nullable(),
  referenceEmail: z.string().email().optional().nullable(),
  isActive: coerceBoolean.default(true)
});

const updateUserExperienceSchema = z.object({
  userId: z.number().int().positive('User ID must be a positive number').optional(),
  companyName: z.string().min(1).max(300, 'Company name must be between 1 and 300 characters').optional(),
  jobTitle: z.string().min(1).max(300, 'Job title must be between 1 and 300 characters').optional(),
  startDate: z.string().optional(),
  designationId: z.number().int().positive().optional().nullable(),
  employmentType: z.enum(['full_time', 'part_time', 'contract', 'internship', 'freelance']).optional(),
  department: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  workMode: z.enum(['on_site', 'remote', 'hybrid']).optional(),
  endDate: z.string().optional().nullable(),
  isCurrentJob: coerceBoolean.optional(),
  description: z.string().optional().nullable(),
  keyAchievements: z.string().optional().nullable(),
  skillsUsed: z.string().optional().nullable(),
  salaryRange: z.string().optional().nullable(),
  referenceName: z.string().optional().nullable(),
  referencePhone: z.string().optional().nullable(),
  referenceEmail: z.string().email().optional().nullable(),
  isActive: coerceBoolean.optional()
});

const userExperienceListQuerySchema = listQuerySchema.extend({
  userId: z.string().regex(/^\d+$/).transform(Number).optional(),
  designationId: z.string().regex(/^\d+$/).transform(Number).optional(),
  employmentType: z.enum(['full_time', 'part_time', 'contract', 'internship', 'freelance']).optional(),
  workMode: z.enum(['on_site', 'remote', 'hybrid']).optional(),
  isCurrentJob: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional()
});

// ============================================================================
// USER SOCIAL MEDIAS
// ============================================================================

const createUserSocialMediaSchema = z.object({
  userId: z.number().int().positive('User ID must be a positive number'),
  socialMediaId: z.number().int().positive('Social Media ID must be a positive number'),
  profileUrl: z.string().url('Profile URL must be a valid URL'),
  username: z.string().optional().nullable(),
  isPrimary: coerceBoolean.default(false),
  isVerified: coerceBoolean.default(false),
  isActive: coerceBoolean.default(true)
});

const updateUserSocialMediaSchema = z.object({
  userId: z.number().int().positive('User ID must be a positive number').optional(),
  socialMediaId: z.number().int().positive('Social Media ID must be a positive number').optional(),
  profileUrl: z.string().url('Profile URL must be a valid URL').optional(),
  username: z.string().optional().nullable(),
  isPrimary: coerceBoolean.optional(),
  isVerified: coerceBoolean.optional(),
  isActive: coerceBoolean.optional()
});

const userSocialMediaListQuerySchema = listQuerySchema.extend({
  userId: z.string().regex(/^\d+$/).transform(Number).optional(),
  socialMediaId: z.string().regex(/^\d+$/).transform(Number).optional(),
  platformType: z.string().max(100).optional(),
  isPrimary: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional()
});

// ============================================================================
// USER SKILLS
// ============================================================================

const createUserSkillSchema = z.object({
  userId: z.number().int().positive('User ID must be a positive number'),
  skillId: z.number().int().positive('Skill ID must be a positive number'),
  proficiencyLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).default('beginner'),
  yearsOfExperience: coercePositiveNumber.optional(),
  isPrimary: coerceBoolean.default(false),
  endorsementCount: coerceSmallInt.default(0),
  isActive: coerceBoolean.default(true)
});

const updateUserSkillSchema = z.object({
  userId: z.number().int().positive('User ID must be a positive number').optional(),
  skillId: z.number().int().positive('Skill ID must be a positive number').optional(),
  proficiencyLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  yearsOfExperience: coercePositiveNumber.optional(),
  isPrimary: coerceBoolean.optional(),
  endorsementCount: coerceSmallInt.optional(),
  isActive: coerceBoolean.optional()
});

const userSkillListQuerySchema = listQuerySchema.extend({
  userId: z.string().regex(/^\d+$/).transform(Number).optional(),
  skillId: z.string().regex(/^\d+$/).transform(Number).optional(),
  proficiencyLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  skillCategory: z.string().max(100).optional(),
  isPrimary: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional()
});

// ============================================================================
// USER LANGUAGES
// ============================================================================

const createUserLanguageSchema = z.object({
  userId: z.number().int().positive('User ID must be a positive number'),
  languageId: z.number().int().positive('Language ID must be a positive number'),
  proficiencyLevel: z.enum(['basic', 'conversational', 'proficient', 'fluent', 'native']).default('basic'),
  canRead: coerceBoolean.default(false),
  canWrite: coerceBoolean.default(false),
  canSpeak: coerceBoolean.default(false),
  isPrimary: coerceBoolean.default(false),
  isNative: coerceBoolean.default(false),
  isActive: coerceBoolean.default(true)
});

const updateUserLanguageSchema = z.object({
  userId: z.number().int().positive('User ID must be a positive number').optional(),
  languageId: z.number().int().positive('Language ID must be a positive number').optional(),
  proficiencyLevel: z.enum(['basic', 'conversational', 'proficient', 'fluent', 'native']).optional(),
  canRead: coerceBoolean.optional(),
  canWrite: coerceBoolean.optional(),
  canSpeak: coerceBoolean.optional(),
  isPrimary: coerceBoolean.optional(),
  isNative: coerceBoolean.optional(),
  isActive: coerceBoolean.optional()
});

const userLanguageListQuerySchema = listQuerySchema.extend({
  userId: z.string().regex(/^\d+$/).transform(Number).optional(),
  languageId: z.string().regex(/^\d+$/).transform(Number).optional(),
  proficiencyLevel: z.enum(['basic', 'conversational', 'proficient', 'fluent', 'native']).optional(),
  isPrimary: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  isNative: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional()
});

// ============================================================================
// USER DOCUMENTS
// ============================================================================

const createUserDocumentSchema = z.object({
  userId: z.number().int().positive('User ID must be a positive number'),
  documentTypeId: z.number().int().positive('Document Type ID must be a positive number'),
  documentId: z.number().int().positive('Document ID must be a positive number'),
  documentNumber: z.string().optional().nullable(),
  fileFormat: z.string().optional().nullable(),
  issueDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  issuingAuthority: z.string().optional().nullable(),
  verificationStatus: z.enum(['pending', 'verified', 'rejected']).default('pending'),
  isActive: coerceBoolean.default(true)
});

const updateUserDocumentSchema = z.object({
  userId: z.number().int().positive('User ID must be a positive number').optional(),
  documentTypeId: z.number().int().positive('Document Type ID must be a positive number').optional(),
  documentId: z.number().int().positive('Document ID must be a positive number').optional(),
  documentNumber: z.string().optional().nullable(),
  fileFormat: z.string().optional().nullable(),
  issueDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  issuingAuthority: z.string().optional().nullable(),
  verificationStatus: z.enum(['pending', 'verified', 'rejected']).optional(),
  verifiedBy: z.number().int().positive().optional(),
  rejectionReason: z.string().optional().nullable(),
  adminNotes: z.string().optional().nullable(),
  isActive: coerceBoolean.optional()
});

const userDocumentListQuerySchema = listQuerySchema.extend({
  userId: z.string().regex(/^\d+$/).transform(Number).optional(),
  documentTypeId: z.string().regex(/^\d+$/).transform(Number).optional(),
  verificationStatus: z.enum(['pending', 'verified', 'rejected']).optional(),
  fileFormat: z.string().max(50).optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional()
});

// ============================================================================
// USER PROJECTS
// ============================================================================

const createUserProjectSchema = z.object({
  userId: z.number().int().positive('User ID must be a positive number'),
  projectTitle: z.string().min(1).max(500, 'Project title must be between 1 and 500 characters'),
  startDate: z.string(),
  projectCode: z.string().optional().nullable(),
  projectType: z.enum(['personal', 'academic', 'professional', 'open_source', 'freelance']).default('personal'),
  description: z.string().optional().nullable(),
  objectives: z.string().optional().nullable(),
  roleInProject: z.string().optional().nullable(),
  responsibilities: z.string().optional().nullable(),
  teamSize: coerceSmallInt.optional(),
  isSoloProject: coerceBoolean.default(false),
  organizationName: z.string().optional().nullable(),
  clientName: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  technologiesUsed: z.string().optional().nullable(),
  toolsUsed: z.string().optional().nullable(),
  programmingLanguages: z.string().optional().nullable(),
  frameworks: z.string().optional().nullable(),
  databasesUsed: z.string().optional().nullable(),
  platform: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  isOngoing: coerceBoolean.default(false),
  durationMonths: coerceSmallInt.optional(),
  projectStatus: z.enum(['in_progress', 'completed', 'on_hold', 'cancelled']).default('completed'),
  keyAchievements: z.string().optional().nullable(),
  challengesFaced: z.string().optional().nullable(),
  lessonsLearned: z.string().optional().nullable(),
  impactSummary: z.string().optional().nullable(),
  usersServed: z.string().optional().nullable(),
  projectUrl: z.string().url('Project URL must be a valid URL').optional().nullable(),
  repositoryUrl: z.string().url('Repository URL must be a valid URL').optional().nullable(),
  demoUrl: z.string().url('Demo URL must be a valid URL').optional().nullable(),
  documentationUrl: z.string().url('Documentation URL must be a valid URL').optional().nullable(),
  caseStudyUrl: z.string().url('Case Study URL must be a valid URL').optional().nullable(),
  isFeatured: coerceBoolean.default(false),
  isPublished: coerceBoolean.default(false),
  awards: z.string().optional().nullable(),
  certifications: z.string().optional().nullable(),
  referenceName: z.string().optional().nullable(),
  referenceEmail: z.string().email().optional().nullable(),
  referencePhone: z.string().optional().nullable(),
  displayOrder: coerceSmallInt.default(0),
  isActive: coerceBoolean.default(true)
});

const updateUserProjectSchema = z.object({
  userId: z.number().int().positive('User ID must be a positive number').optional(),
  projectTitle: z.string().min(1).max(500, 'Project title must be between 1 and 500 characters').optional(),
  startDate: z.string().optional(),
  projectCode: z.string().optional().nullable(),
  projectType: z.enum(['personal', 'academic', 'professional', 'open_source', 'freelance']).optional(),
  description: z.string().optional().nullable(),
  objectives: z.string().optional().nullable(),
  roleInProject: z.string().optional().nullable(),
  responsibilities: z.string().optional().nullable(),
  teamSize: coerceSmallInt.optional(),
  isSoloProject: coerceBoolean.optional(),
  organizationName: z.string().optional().nullable(),
  clientName: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  technologiesUsed: z.string().optional().nullable(),
  toolsUsed: z.string().optional().nullable(),
  programmingLanguages: z.string().optional().nullable(),
  frameworks: z.string().optional().nullable(),
  databasesUsed: z.string().optional().nullable(),
  platform: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  isOngoing: coerceBoolean.optional(),
  durationMonths: coerceSmallInt.optional(),
  projectStatus: z.enum(['in_progress', 'completed', 'on_hold', 'cancelled']).optional(),
  keyAchievements: z.string().optional().nullable(),
  challengesFaced: z.string().optional().nullable(),
  lessonsLearned: z.string().optional().nullable(),
  impactSummary: z.string().optional().nullable(),
  usersServed: z.string().optional().nullable(),
  projectUrl: z.string().url('Project URL must be a valid URL').optional().nullable(),
  repositoryUrl: z.string().url('Repository URL must be a valid URL').optional().nullable(),
  demoUrl: z.string().url('Demo URL must be a valid URL').optional().nullable(),
  documentationUrl: z.string().url('Documentation URL must be a valid URL').optional().nullable(),
  caseStudyUrl: z.string().url('Case Study URL must be a valid URL').optional().nullable(),
  isFeatured: coerceBoolean.optional(),
  isPublished: coerceBoolean.optional(),
  awards: z.string().optional().nullable(),
  certifications: z.string().optional().nullable(),
  referenceName: z.string().optional().nullable(),
  referenceEmail: z.string().email().optional().nullable(),
  referencePhone: z.string().optional().nullable(),
  displayOrder: coerceSmallInt.optional(),
  isActive: coerceBoolean.optional()
});

const userProjectListQuerySchema = listQuerySchema.extend({
  userId: z.string().regex(/^\d+$/).transform(Number).optional(),
  projectType: z.enum(['personal', 'academic', 'professional', 'open_source', 'freelance']).optional(),
  projectStatus: z.enum(['in_progress', 'completed', 'on_hold', 'cancelled']).optional(),
  platform: z.string().max(100).optional(),
  isOngoing: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  isFeatured: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional()
});

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Shared
  idParamSchema,
  listQuerySchema,

  // Users
  createUserSchema,
  updateUserSchema,
  userListQuerySchema,

  // UserProfiles
  createUserProfileSchema,
  updateUserProfileSchema,
  userProfileListQuerySchema,

  // UserEducation
  createUserEducationSchema,
  updateUserEducationSchema,
  userEducationListQuerySchema,

  // UserExperience
  createUserExperienceSchema,
  updateUserExperienceSchema,
  userExperienceListQuerySchema,

  // UserSocialMedias
  createUserSocialMediaSchema,
  updateUserSocialMediaSchema,
  userSocialMediaListQuerySchema,

  // UserSkills
  createUserSkillSchema,
  updateUserSkillSchema,
  userSkillListQuerySchema,

  // UserLanguages
  createUserLanguageSchema,
  updateUserLanguageSchema,
  userLanguageListQuerySchema,

  // UserDocuments
  createUserDocumentSchema,
  updateUserDocumentSchema,
  userDocumentListQuerySchema,

  // UserProjects
  createUserProjectSchema,
  updateUserProjectSchema,
  userProjectListQuerySchema
};
