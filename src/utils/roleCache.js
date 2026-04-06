/**
 * ═══════════════════════════════════════════════════════════════
 * ROLE CACHE — Dynamic Role Code Loading from Database
 * ═══════════════════════════════════════════════════════════════
 *
 * Loads valid role codes from the `roles` table at server startup
 * and caches them in memory. Provides a refresh mechanism for
 * runtime updates without server restart.
 *
 * Usage:
 *   const { getValidRoleCodes, loadRoles } = require('./utils/roleCache');
 *   await loadRoles();                    // call once at startup
 *   const codes = getValidRoleCodes();    // ['super_admin', 'admin', ...]
 */

const { supabase } = require('../config/database');
const logger = require('../config/logger');

// ─── In-Memory Cache ──────────────────────────────────────────

let roleCodes = [];
let lastLoadedAt = null;

// ─── Load Roles from Database ─────────────────────────────────

/**
 * Fetches all active, non-deleted role codes from the database
 * via udf_get_roles and caches them in memory.
 *
 * @returns {Promise<string[]>} Array of role code strings
 */
const loadRoles = async () => {
  try {
    const { data, error } = await supabase.rpc('udf_get_roles', {
      p_is_active: true,
      p_sort_column: 'display_order',
      p_sort_direction: 'ASC',
    });

    if (error) {
      logger.error({ error }, 'Failed to load roles from database');
      // Keep existing cache if refresh fails
      if (roleCodes.length > 0) {
        logger.warn('Using previously cached role codes');
        return roleCodes;
      }
      throw error;
    }

    roleCodes = data.map((row) => String(row.role_code).toLowerCase());
    lastLoadedAt = new Date();

    logger.info(`Role cache loaded: ${roleCodes.length} roles [${roleCodes.join(', ')}]`);
    return roleCodes;
  } catch (err) {
    logger.error({ err }, 'Role cache load error');
    throw err;
  }
};

// ─── Getters ──────────────────────────────────────────────────

/**
 * Returns the cached array of valid role codes.
 * @returns {string[]}
 */
const getValidRoleCodes = () => roleCodes;

/**
 * Returns when the cache was last loaded.
 * @returns {Date|null}
 */
const getLastLoadedAt = () => lastLoadedAt;

/**
 * Checks whether a given role code is valid.
 * @param {string} code
 * @returns {boolean}
 */
const isValidRole = (code) => roleCodes.includes(String(code).toLowerCase());

// ─── Exports ──────────────────────────────────────────────────

module.exports = {
  loadRoles,
  getValidRoleCodes,
  getLastLoadedAt,
  isValidRole,
};
