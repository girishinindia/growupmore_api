/**
 * ═══════════════════════════════════════════════════════════════
 * HELPERS — Misc Utility Functions
 * ═══════════════════════════════════════════════════════════════
 */

const crypto = require('crypto');
const config = require('../config');

/**
 * Generate a cryptographically secure numeric OTP
 */
const generateOtp = (length = config.otp.length) => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return crypto.randomInt(min, max + 1).toString();
};

/**
 * Mask email: gi***@gmail.com
 */
const maskEmail = (email) => {
  if (!email) {
    return null;
  }
  const [local, domain] = email.split('@');
  const masked = local.length <= 2 ? local[0] + '***' : local.slice(0, 2) + '***';
  return `${masked}@${domain}`;
};

/**
 * Mask mobile: ******8990
 */
const maskMobile = (mobile) => {
  if (!mobile) {
    return null;
  }
  return '******' + mobile.slice(-4);
};

/**
 * Normalise mobile number — strip spaces/dashes/+, then prepend 91 country code
 * User sends: 9662278990 (10 digits)
 * Stored as:  919662278990 (with country code)
 */
const normaliseMobile = (mobile) => {
  if (!mobile) {
    return null;
  }
  const cleaned = mobile.replace(/[\s\-\+]/g, '');
  // If already has country code (more than 10 digits), return as-is
  if (cleaned.length > 10) {
    return cleaned;
  }
  // Prepend default country code 91 (India)
  return `91${cleaned}`;
};

/**
 * Normalise email — lowercase, trim
 */
const normaliseEmail = (email) => {
  if (!email) {
    return null;
  }
  return email.toLowerCase().trim();
};

module.exports = {
  generateOtp,
  maskEmail,
  maskMobile,
  normaliseMobile,
  normaliseEmail,
};
