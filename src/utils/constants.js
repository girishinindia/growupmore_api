/**
 * ═══════════════════════════════════════════════════════════════
 * CONSTANTS — Application-wide Enums & Constants
 * ═══════════════════════════════════════════════════════════════
 */

const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  CONTENT_MANAGER: 'content_manager',
  FINANCE_ADMIN: 'finance_admin',
  SUPPORT_AGENT: 'support_agent',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student',
});

const ROLE_LEVELS = Object.freeze({
  super_admin: 0,
  admin: 1,
  moderator: 2,
  content_manager: 2,
  finance_admin: 2,
  support_agent: 3,
  instructor: 4,
  student: 5,
});

const OTP_PURPOSES = Object.freeze({
  REGISTRATION: 'registration',
  REGISTRATION_MOBILE: 'registration_mobile',
  FORGOT_PASSWORD: 'forgot_password',
  CHANGE_EMAIL: 'change_email',
  CHANGE_MOBILE: 'change_mobile',
});

const REDIS_PREFIXES = Object.freeze({
  OTP: 'otp',
  OTP_ATTEMPTS: 'otp_attempts',
  OTP_COOLDOWN: 'otp_cooldown',
  SESSION: 'session',
  REFRESH_TOKEN: 'refresh_token',
  PENDING_REGISTRATION: 'pending_reg',
  PENDING_FORGOT_PASSWORD: 'pending_forgot',
  PENDING_CHANGE_EMAIL: 'pending_change_email',
  PENDING_CHANGE_MOBILE: 'pending_change_mobile',
});

const DEFAULT_COUNTRY_ID = 1; // India

module.exports = {
  ROLES,
  ROLE_LEVELS,
  OTP_PURPOSES,
  REDIS_PREFIXES,
  DEFAULT_COUNTRY_ID,
};
