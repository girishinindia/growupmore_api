/**
 * ═══════════════════════════════════════════════════════════════
 * PERMISSION MIDDLEWARE — Role-Based Access Control
 * ═══════════════════════════════════════════════════════════════
 * Checks if authenticated user has required permission.
 * Calls fn_user_has_permission through repository.
 * Caches result in Redis for performance.
 * ═══════════════════════════════════════════════════════════════
 */

const userRepo = require('../repositories/user.repository');
const logger = require('../config/logger');
const { AuthenticationError, ForbiddenError } = require('../utils/errors');

let redis = null;
// Try to load Redis (optional)
try {
  redis = require('../config/redis');
} catch (_err) {
  // Redis not configured
}
const PERMISSION_CACHE_TTL = 300; // 5 minutes

/**
 * Middleware: Check if user has required permission
 * Caches permission checks in Redis for 5 minutes.
 *
 * @param {string} permissionCode - Permission code (e.g., 'admin', 'can_edit_course')
 *
 * @example
 * router.post(
 *   '/courses',
 *   auth,
 *   requirePermission('can_create_course'),
 *   controller.createCourse
 * );
 *
 * @throws {AuthenticationError} If user is not authenticated
 * @throws {ForbiddenError} If user lacks required permission
 */
const requirePermission = (permissionCode) => {
  return async (req, _res, next) => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        throw new AuthenticationError('Authentication required.');
      }

      const userId = req.user.id;
      const cacheKey = `permission:${userId}:${permissionCode}`;

      // Check Redis cache first
      if (redis && !redis._isMock) {
        try {
          const cachedResult = await redis.get(cacheKey);
          if (cachedResult !== null) {
            const hasPermission = cachedResult === 'true';
            logger.debug(
              { userId, permissionCode, cached: true, hasPermission },
              'Permission check (cached)'
            );

            if (!hasPermission) {
              throw new ForbiddenError(
                `You do not have permission to access this resource (${permissionCode}).`
              );
            }

            return next();
          }
        } catch (redisErr) {
          // Cache miss or error, continue to DB lookup
          logger.debug({ err: redisErr }, 'Permission cache miss or error');
        }
      }

      // Query database
      logger.debug({ userId, permissionCode }, 'Checking user permission');

      const hasPermission = await userRepo.hasPermission(userId, permissionCode);

      // Store result in cache
      if (redis && !redis._isMock) {
        try {
          await redis.setex(cacheKey, PERMISSION_CACHE_TTL, hasPermission ? 'true' : 'false');
        } catch (_err) {
          // Cache write failed, continue anyway
        }
      }

      logger.debug(
        { userId, permissionCode, hasPermission },
        'Permission check result'
      );

      if (!hasPermission) {
        throw new ForbiddenError(
          `You do not have permission to access this resource (${permissionCode}).`
        );
      }

      next();
    } catch (err) {
      if (err instanceof AuthenticationError || err instanceof ForbiddenError) {
        return next(err);
      }

      logger.error({ err, permissionCode: permissionCode }, 'Permission middleware error');
      next(new ForbiddenError('Unable to verify permissions.'));
    }
  };
};

/**
 * Helper: Invalidate permission cache for a user
 * Call this after updating user permissions.
 *
 * @param {string} userId
 * @param {string} [permissionCode] - Optional: invalidate only specific permission
 */
const invalidatePermissionCache = async (userId, permissionCode) => {
  if (!redis || redis._isMock) {
    return;
  }

  try {
    if (permissionCode) {
      const cacheKey = `permission:${userId}:${permissionCode}`;
      await redis.del(cacheKey);
      logger.debug({ userId, permissionCode }, 'Permission cache invalidated');
    } else {
      // Invalidate all permissions for user
      const pattern = `permission:${userId}:*`;
      const keys = await redis.keys(pattern);
      if (keys && keys.length > 0) {
        await redis.del(...keys);
        logger.debug({ userId, count: keys.length }, 'User permission cache invalidated');
      }
    }
  } catch (err) {
    logger.warn({ err, userId, permissionCode }, 'Failed to invalidate permission cache');
  }
};

module.exports = {
  requirePermission,
  invalidatePermissionCache,
};
