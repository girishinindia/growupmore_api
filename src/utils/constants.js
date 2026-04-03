/**
 * ═══════════════════════════════════════════════════════════════
 * APPLICATION CONSTANTS
 * ═══════════════════════════════════════════════════════════════
 * Central place for all magic strings, codes, and enums.
 * Import from here — never hardcode these values.
 * ═══════════════════════════════════════════════════════════════
 */

// ─── User Roles (matches phase-36 roles table) ──────────────
const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  INSTRUCTOR: 'instructor',
  TEACHING_ASSISTANT: 'teaching_assistant',
  STUDENT: 'student',
  GUEST: 'guest',
  SUPPORT: 'support_agent',
});

// ─── Role Hierarchy (higher number = more power) ────────────
const ROLE_HIERARCHY = Object.freeze({
  [ROLES.SUPER_ADMIN]: 100,
  [ROLES.ADMIN]: 90,
  [ROLES.MANAGER]: 80,
  [ROLES.SUPPORT]: 70,
  [ROLES.INSTRUCTOR]: 60,
  [ROLES.TEACHING_ASSISTANT]: 50,
  [ROLES.STUDENT]: 10,
  [ROLES.GUEST]: 0,
});

// ─── Permission Codes (matches phase-36 permissions table) ──
const PERMISSIONS = Object.freeze({
  // Users
  USER_CREATE: 'user.create',
  USER_READ: 'user.read',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',

  // Courses
  COURSE_CREATE: 'course.create',
  COURSE_READ: 'course.read',
  COURSE_UPDATE: 'course.update',
  COURSE_DELETE: 'course.delete',
  COURSE_PUBLISH: 'course.publish',

  // Enrollments
  ENROLLMENT_CREATE: 'enrollment.create',
  ENROLLMENT_READ: 'enrollment.read',
  ENROLLMENT_UPDATE: 'enrollment.update',
  ENROLLMENT_DELETE: 'enrollment.delete',

  // Categories
  CATEGORY_CREATE: 'category.create',
  CATEGORY_READ: 'category.read',
  CATEGORY_UPDATE: 'category.update',
  CATEGORY_DELETE: 'category.delete',

  // Master Data
  MASTER_DATA_CREATE: 'master_data.create',
  MASTER_DATA_READ: 'master_data.read',
  MASTER_DATA_UPDATE: 'master_data.update',
  MASTER_DATA_DELETE: 'master_data.delete',

  // Payments
  PAYMENT_READ: 'payment.read',
  PAYMENT_REFUND: 'payment.refund',

  // Roles & Permissions
  ROLE_CREATE: 'role.create',
  ROLE_READ: 'role.read',
  ROLE_UPDATE: 'role.update',
  ROLE_DELETE: 'role.delete',
  PERMISSION_ASSIGN: 'permission.assign',

  // Reports & Analytics
  REPORT_VIEW: 'report.view',
  ANALYTICS_VIEW: 'analytics.view',

  // Support
  TICKET_CREATE: 'ticket.create',
  TICKET_READ: 'ticket.read',
  TICKET_UPDATE: 'ticket.update',
  TICKET_ASSIGN: 'ticket.assign',

  // Notifications
  NOTIFICATION_SEND: 'notification.send',
  ANNOUNCEMENT_CREATE: 'announcement.create',

  // Blog
  BLOG_CREATE: 'blog.create',
  BLOG_READ: 'blog.read',
  BLOG_UPDATE: 'blog.update',
  BLOG_DELETE: 'blog.delete',
  BLOG_PUBLISH: 'blog.publish',

  // Internships
  INTERNSHIP_CREATE: 'internship.create',
  INTERNSHIP_READ: 'internship.read',
  INTERNSHIP_UPDATE: 'internship.update',
  INTERNSHIP_DELETE: 'internship.delete',

  // Certificates
  CERTIFICATE_CREATE: 'certificate.create',
  CERTIFICATE_READ: 'certificate.read',
  CERTIFICATE_ISSUE: 'certificate.issue',

  // Webinars
  WEBINAR_CREATE: 'webinar.create',
  WEBINAR_READ: 'webinar.read',
  WEBINAR_UPDATE: 'webinar.update',
  WEBINAR_DELETE: 'webinar.delete',

  // Chat
  CHAT_READ: 'chat.read',
  CHAT_MODERATE: 'chat.moderate',

  // Coupons
  COUPON_CREATE: 'coupon.create',
  COUPON_READ: 'coupon.read',
  COUPON_UPDATE: 'coupon.update',
  COUPON_DELETE: 'coupon.delete',

  // File Upload
  FILE_UPLOAD: 'file.upload',
  FILE_DELETE: 'file.delete',
});

// ─── Course Status ───────────────────────────────────────────
const COURSE_STATUS = Object.freeze({
  DRAFT: 'draft',
  PENDING_REVIEW: 'pending_review',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  SUSPENDED: 'suspended',
});

// ─── Enrollment Status ───────────────────────────────────────
const ENROLLMENT_STATUS = Object.freeze({
  ACTIVE: 'active',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  SUSPENDED: 'suspended',
});

// ─── Payment Status ──────────────────────────────────────────
const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  AUTHORIZED: 'authorized',
  CAPTURED: 'captured',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
});

// ─── Order Status ────────────────────────────────────────────
const ORDER_STATUS = Object.freeze({
  CREATED: 'created',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
});

// ─── Ticket Status ───────────────────────────────────────────
const TICKET_STATUS = Object.freeze({
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  WAITING_ON_CUSTOMER: 'waiting_on_customer',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
});

// ─── Batch Status ────────────────────────────────────────────
const BATCH_STATUS = Object.freeze({
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});

// ─── Blog Status ─────────────────────────────────────────────
const BLOG_STATUS = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
});

// ─── Internship Status ───────────────────────────────────────
const INTERNSHIP_STATUS = Object.freeze({
  DRAFT: 'draft',
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});

// ─── Notification Types ──────────────────────────────────────
const NOTIFICATION_TYPES = Object.freeze({
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  IN_APP: 'in_app',
});

// ─── Sort Directions ─────────────────────────────────────────
const SORT_DIRECTIONS = Object.freeze({
  ASC: 'ASC',
  DESC: 'DESC',
});

// ─── Default Pagination ──────────────────────────────────────
const PAGINATION_DEFAULTS = Object.freeze({
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
  SORT_COLUMN: 'created_at',
  SORT_DIRECTION: 'DESC',
});

// ─── Cache Key Prefixes ──────────────────────────────────────
const CACHE_KEYS = Object.freeze({
  SESSION: 'session',
  OTP: 'otp',
  COURSES: 'courses',
  COURSE: 'course',
  CATEGORIES: 'categories',
  PROFILE: 'profile',
  RATE_LIMIT: 'rl',
  VIDEO_TOKEN: 'vtoken',
  ENROLLMENT: 'enrollment',
  PERMISSIONS: 'permissions',
  MENU: 'menu',
});

// ─── File Upload Paths (Bunny Storage) ───────────────────────
const STORAGE_PATHS = Object.freeze({
  THUMBNAILS: 'thumbnails',
  MATERIALS: 'materials',
  AVATARS: 'avatars',
  CERTIFICATES: 'certificates',
  ASSIGNMENTS: 'assignments',
  ASSETS: 'assets',
  DOCUMENTS: 'documents',
  BLOG_IMAGES: 'blog-images',
});

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  PERMISSIONS,
  COURSE_STATUS,
  ENROLLMENT_STATUS,
  PAYMENT_STATUS,
  ORDER_STATUS,
  TICKET_STATUS,
  BATCH_STATUS,
  BLOG_STATUS,
  INTERNSHIP_STATUS,
  NOTIFICATION_TYPES,
  SORT_DIRECTIONS,
  PAGINATION_DEFAULTS,
  CACHE_KEYS,
  STORAGE_PATHS,
};
