/**
 * ═══════════════════════════════════════════════════════════════
 * CONSTANTS — Application-wide Enums & Constants
 * ═══════════════════════════════════════════════════════════════
 */

const ROLES = Object.freeze({
  SUPER_ADMIN: 'sa',
  ADMIN: 'admin',
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
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
  OTP_PURPOSES,
  REDIS_PREFIXES,
  DEFAULT_COUNTRY_ID,
};
