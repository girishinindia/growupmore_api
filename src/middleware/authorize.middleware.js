const { supabase } = require('../config/database');
const { ForbiddenError } = require('../utils/errors');
const logger = require('../config/logger');

/**
 * Check if user has super_admin role to bypass permission checks
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
async function isSuperAdmin(userId) {
  try {
    const { data: roles, error } = await supabase.rpc('udf_get_user_role_assignments', {
      p_id: null,
      p_user_id: userId,
      p_role_id: null,
      p_role_code: null,
      p_filter_context_type: null,
      p_filter_context_id: null,
      p_filter_is_valid: true,
      p_search_term: null,
      p_sort_column: 'assigned_at',
      p_sort_direction: 'DESC',
      p_page_index: 1,
      p_page_size: null,
    });

    if (error) {
      logger.error('Error checking super_admin role:', error);
      return false;
    }

    return roles && roles.some((r) => r.ura_role_code === 'super_admin');
  } catch (error) {
    logger.error('Exception checking super_admin role:', error);
    return false;
  }
}

/**
 * Check if user has a specific permission
 * @param {string} userId
 * @param {string} permissionCode
 * @returns {Promise<boolean>}
 */
async function userHasPermission(userId, permissionCode) {
  try {
    const { data, error } = await supabase.rpc('fn_user_has_permission', {
      p_user_id: userId,
      p_permission_code: permissionCode,
    });

    if (error) {
      logger.error(`Error checking permission ${permissionCode} for user ${userId}:`, error);
      return false;
    }

    return data === true;
  } catch (error) {
    logger.error(`Exception checking permission ${permissionCode} for user ${userId}:`, error);
    return false;
  }
}

/**
 * Check if user has any of the specified permissions (OR logic)
 * @param {string} userId
 * @param {string[]} permissionCodes
 * @returns {Promise<boolean>}
 */
async function userHasAnyPermission(userId, permissionCodes) {
  if (!Array.isArray(permissionCodes) || permissionCodes.length === 0) {
    return false;
  }

  const results = await Promise.all(
    permissionCodes.map((code) => userHasPermission(userId, code))
  );

  return results.some((hasPermission) => hasPermission === true);
}

/**
 * Check if user has any of the specified roles
 * @param {string} userId
 * @param {string[]} roleCodes
 * @returns {Promise<boolean>}
 */
async function userHasAnyRole(userId, roleCodes) {
  if (!Array.isArray(roleCodes) || roleCodes.length === 0) {
    return false;
  }

  try {
    const { data: roles, error } = await supabase.rpc('udf_get_user_role_assignments', {
      p_id: null,
      p_user_id: userId,
      p_role_id: null,
      p_role_code: null,
      p_filter_context_type: null,
      p_filter_context_id: null,
      p_filter_is_valid: true,
      p_search_term: null,
      p_sort_column: 'assigned_at',
      p_sort_direction: 'DESC',
      p_page_index: 1,
      p_page_size: null,
    });

    if (error) {
      logger.error('Error checking user roles:', error);
      return false;
    }

    if (!roles || !Array.isArray(roles)) {
      return false;
    }

    return roles.some((r) => roleCodes.includes(r.ura_role_code));
  } catch (error) {
    logger.error('Exception checking user roles:', error);
    return false;
  }
}

/**
 * Middleware factory: requires user to have a specific permission
 * Super admins bypass all permission checks
 * @param {string} permissionCode
 * @returns {Function} Express middleware
 */
function authorize(permissionCode) {
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        logger.warn('authorize middleware: no userId found on request');
        throw new ForbiddenError('User not authenticated');
      }

      // Check if user is super_admin
      const superAdmin = await isSuperAdmin(userId);
      if (superAdmin) {
        logger.debug(`User ${userId} is super_admin, bypassing permission check for ${permissionCode}`);
        return next();
      }

      // Check if user has required permission
      const hasPermission = await userHasPermission(userId, permissionCode);
      if (!hasPermission) {
        logger.warn(
          `User ${userId} denied access: missing permission ${permissionCode}`
        );
        throw new ForbiddenError(`You do not have permission: ${permissionCode}`);
      }

      logger.debug(`User ${userId} authorized for permission ${permissionCode}`);
      next();
    } catch (error) {
      if (error instanceof ForbiddenError) {
        return next(error);
      }

      logger.error('Error in authorize middleware:', error);
      next(new ForbiddenError('Authorization check failed'));
    }
  };
}

/**
 * Middleware factory: requires user to have any of the specified permissions (OR logic)
 * Super admins bypass all permission checks
 * @param {string[]} permissionCodes
 * @returns {Function} Express middleware
 */
function authorizeAny(permissionCodes) {
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        logger.warn('authorizeAny middleware: no userId found on request');
        throw new ForbiddenError('User not authenticated');
      }

      // Check if user is super_admin
      const superAdmin = await isSuperAdmin(userId);
      if (superAdmin) {
        logger.debug(`User ${userId} is super_admin, bypassing permission check for [${permissionCodes.join(', ')}]`);
        return next();
      }

      // Check if user has any required permission
      const hasAnyPermission = await userHasAnyPermission(userId, permissionCodes);
      if (!hasAnyPermission) {
        logger.warn(
          `User ${userId} denied access: missing any of permissions [${permissionCodes.join(', ')}]`
        );
        throw new ForbiddenError(`You do not have any of the required permissions`);
      }

      logger.debug(`User ${userId} authorized for any of permissions [${permissionCodes.join(', ')}]`);
      next();
    } catch (error) {
      if (error instanceof ForbiddenError) {
        return next(error);
      }

      logger.error('Error in authorizeAny middleware:', error);
      next(new ForbiddenError('Authorization check failed'));
    }
  };
}

/**
 * Middleware factory: requires user to have any of the specified roles
 * Super admins bypass all role checks
 * @param {...string} roleCodes - variable arguments for role codes
 * @returns {Function} Express middleware
 */
function authorizeRole(...roleCodes) {
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        logger.warn('authorizeRole middleware: no userId found on request');
        throw new ForbiddenError('User not authenticated');
      }

      // Check if user is super_admin
      const superAdmin = await isSuperAdmin(userId);
      if (superAdmin) {
        logger.debug(`User ${userId} is super_admin, bypassing role check for [${roleCodes.join(', ')}]`);
        return next();
      }

      // Check if user has any required role
      const hasAnyRole = await userHasAnyRole(userId, roleCodes);
      if (!hasAnyRole) {
        logger.warn(
          `User ${userId} denied access: missing any of roles [${roleCodes.join(', ')}]`
        );
        throw new ForbiddenError(`You do not have any of the required roles`);
      }

      logger.debug(`User ${userId} authorized for any of roles [${roleCodes.join(', ')}]`);
      next();
    } catch (error) {
      if (error instanceof ForbiddenError) {
        return next(error);
      }

      logger.error('Error in authorizeRole middleware:', error);
      next(new ForbiddenError('Authorization check failed'));
    }
  };
}

module.exports = {
  authorize,
  authorizeAny,
  authorizeRole,
};
