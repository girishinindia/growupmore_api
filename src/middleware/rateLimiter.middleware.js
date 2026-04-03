/**
 * ═══════════════════════════════════════════════════════════════
 * RATE LIMITER MIDDLEWARE
 * ═══════════════════════════════════════════════════════════════
 * Redis-backed when available, in-memory fallback for dev.
 * Three limiters: globalLimiter, authLimiter, strictLimiter
 * Each gets its own RedisStore instance with a unique prefix.
 * ═══════════════════════════════════════════════════════════════
 */

const rateLimit = require('express-rate-limit');
const config = require('../config/index');
const logger = require('../config/logger');

let useRedis = false;
let redis;

// Check if Redis is available for rate limiting
try {
  redis = require('../config/redis');
  if (!redis._isMock) {
    require('rate-limit-redis'); // Ensure package exists
    useRedis = true;
    logger.info('Rate limiter using Redis store');
  }
} catch (_err) {
  logger.info('Rate limiter using in-memory store');
}

/**
 * Creates a new RedisStore for each limiter with a unique prefix.
 * express-rate-limit does NOT allow sharing a single store instance.
 */
function createRedisStore(prefix) {
  if (!useRedis) return undefined;
  const { RedisStore } = require('rate-limit-redis');
  return new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: `gum:rl:${prefix}:`,
  });
}

// ─── Global Rate Limiter (all routes) ────────────────────────
const globalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  ...(useRedis && { store: createRedisStore('global') }),
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests. Please try again later.',
    error: 'Too many requests. Please try again later.',
  },
  validate: { xForwardedForHeader: false },
});

// ─── Auth Rate Limiter (login, register, OTP) ────────────────
const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  ...(useRedis && { store: createRedisStore('auth') }),
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    error: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  validate: { xForwardedForHeader: false },
});

// ─── Strict Limiter (for OTP, password reset) ────────────────
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  ...(useRedis && { store: createRedisStore('strict') }),
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many attempts. Please try again after 1 hour.',
    error: 'Too many attempts. Please try again after 1 hour.',
  },
  validate: { xForwardedForHeader: false },
});

module.exports = { globalLimiter, authLimiter, strictLimiter };
