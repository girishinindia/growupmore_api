/**
 * ═══════════════════════════════════════════════════════════════
 * AUTH MIDDLEWARE — JWT Verification
 * ═══════════════════════════════════════════════════════════════
 * Extracts Bearer token from Authorization header, verifies with
 * jsonwebtoken, and attaches user to req.user.
 * Includes optional Redis cache for revoked tokens.
 * ═══════════════════════════════════════════════════════════════
 */

const jwt = require('jsonwebtoken');
const config = require('../config/index');
const logger = require('../config/logger');
const { AuthenticationError } = require('../utils/errors');

let redis = null;
// Try to load Redis (optional — if not available, continue without caching)
try {
  redis = require('../config/redis');
} catch (_err) {
  // Redis not configured, continue without token revocation cache
}

/**
 * Middleware: Verify Bearer token and attach user to req.user
 * Used on protected routes.
 *
 * @example
 * router.get('/me', auth, controller.getProfile);
 *
 * @throws {AuthenticationError} If token is missing, invalid, or expired
 */
const auth = async (req, _res, next) => {
  try {
    // Extract Bearer token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError(
        'No authentication token. Please provide a valid Bearer token.'
      );
    }

    const token = authHeader.slice(7); // Remove 'Bearer ' prefix

    // Check if token is blacklisted in Redis (optional)
    if (redis && !redis._isMock) {
      try {
        const isBlacklisted = await redis.get(`blacklist:${token}`);
        if (isBlacklisted) {
          throw new AuthenticationError('Token has been revoked.');
        }
      } catch (redisErr) {
        logger.warn({ err: redisErr }, 'Failed to check token blacklist');
        // Continue anyway — don't fail auth if Redis is down
      }
    }

    // Verify JWT using access secret
    const decoded = jwt.verify(token, config.jwt.accessSecret);

    // Attach decoded user to request
    req.user = decoded;
    req.token = token; // Store token for later use (e.g., logout)

    logger.debug({ userId: req.user.id }, 'User authenticated');

    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return next(new AuthenticationError('Invalid token.'));
    }
    if (err instanceof jwt.TokenExpiredError) {
      return next(new AuthenticationError('Token has expired. Please refresh.'));
    }
    if (err instanceof AuthenticationError) {
      return next(err);
    }
    logger.error({ err }, 'Auth middleware error');
    next(new AuthenticationError('Authentication failed.'));
  }
};

/**
 * Middleware: Optional authentication
 * Verifies token if present, but doesn't fail if missing.
 * Useful for routes that work with or without auth.
 *
 * @example
 * router.get('/articles', optionalAuth, controller.list);
 */
const optionalAuth = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // If no auth header, continue without user
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.slice(7);

    // Check blacklist
    if (redis && !redis._isMock) {
      try {
        const isBlacklisted = await redis.get(`blacklist:${token}`);
        if (isBlacklisted) {
          return next(); // Token revoked, treat as unauthenticated
        }
      } catch (_err) {
        // Redis error, continue
      }
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    req.user = decoded;
    req.token = token;
  } catch (_err) {
    // Token invalid or expired, continue as unauthenticated
    req.user = null;
  }

  next();
};

module.exports = { auth, optionalAuth };
