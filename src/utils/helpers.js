/**
 * ═══════════════════════════════════════════════════════════════
 * HELPER UTILITIES
 * ═══════════════════════════════════════════════════════════════
 * Misc helper functions used across the application.
 * ═══════════════════════════════════════════════════════════════
 */

const crypto = require('crypto');
const slugify = require('slugify');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Generate a URL-safe slug from text
 */
const createSlug = (text) => {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true,
  });
};

/**
 * Generate a numeric OTP of given length
 */
const generateOTP = (length = 6) => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
};

/**
 * Generate a secure random token (hex)
 */
const generateToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Format date to IST (India Standard Time)
 */
const formatDateIST = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  return dayjs(date).tz('Asia/Kolkata').format(format);
};

/**
 * Get current timestamp in IST
 */
const nowIST = () => {
  return dayjs().tz('Asia/Kolkata');
};

/**
 * Format Indian phone number (ensure +91 prefix)
 */
const formatIndianMobile = (mobile) => {
  if (!mobile) {
    return null;
  }
  const cleaned = String(mobile).replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }
  if (cleaned.length === 13 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }
  return mobile;
};

/**
 * Validate Indian mobile number (10 digits, starts with 6-9)
 */
const isValidIndianMobile = (mobile) => {
  const cleaned = String(mobile).replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(cleaned) || /^91[6-9]\d{9}$/.test(cleaned);
};

/**
 * Mask email for display (g****@gmail.com)
 */
const maskEmail = (email) => {
  if (!email) {
    return '';
  }
  const [local, domain] = email.split('@');
  const masked = local.charAt(0) + '****';
  return `${masked}@${domain}`;
};

/**
 * Mask phone for display (****3210)
 */
const maskPhone = (phone) => {
  if (!phone) {
    return '';
  }
  const cleaned = String(phone).replace(/\D/g, '');
  return '****' + cleaned.slice(-4);
};

/**
 * Pick specific keys from an object (whitelist)
 */
const pick = (obj, keys) => {
  return keys.reduce((result, key) => {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});
};

/**
 * Omit specific keys from an object (blacklist)
 */
const omit = (obj, keys) => {
  return Object.keys(obj).reduce((result, key) => {
    if (!keys.includes(key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});
};

/**
 * Check if a value is empty (null, undefined, '', [], {})
 */
const isEmpty = (value) => {
  if (value === null || value === undefined || value === '') {
    return true;
  }
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return true;
  }
  return false;
};

/**
 * Sleep for given milliseconds (useful for retry logic)
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Convert amount to paise (for Razorpay)
 */
const toPaise = (amount) => Math.round(amount * 100);

/**
 * Convert paise to rupees
 */
const toRupees = (paise) => paise / 100;

/**
 * Wrap an async route handler to catch errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  createSlug,
  generateOTP,
  generateToken,
  formatDateIST,
  nowIST,
  formatIndianMobile,
  isValidIndianMobile,
  maskEmail,
  maskPhone,
  pick,
  omit,
  isEmpty,
  sleep,
  toPaise,
  toRupees,
  asyncHandler,
};
