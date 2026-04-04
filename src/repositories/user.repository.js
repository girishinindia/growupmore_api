/**
 * ═══════════════════════════════════════════════════════════════
 * USER REPOSITORY — Database Layer (Supabase RPC)
 * ═══════════════════════════════════════════════════════════════
 * All database operations use ONLY the functions defined in the
 * SQL phases:
 *
 *   udf_get_users     — FUNCTION (read, search, filter, paginate)
 *   sp_users_insert   — FUNCTION (create user, returns new id,
 *                        hashes password via pgcrypto internally)
 *   sp_users_update   — FUNCTION (update user, returns void,
 *                        hashes password via pgcrypto if provided)
 *   sp_users_delete   — FUNCTION (soft delete, returns void)
 *
 * IMPORTANT:
 *   - sp_users_insert and sp_users_update hash the password
 *     internally via crypt(p_password, gen_salt('bf')).
 *     Do NOT pre-hash in Node — send RAW plaintext.
 *   - udf_get_users returns from uv_users view — password is
 *     NEVER returned. For password verification we query the
 *     users table directly and use bcryptjs.compare() (Node
 *     side) against the pgcrypto hash ($2a$ format).
 * ═══════════════════════════════════════════════════════════════
 */

const { supabase } = require('../config/database');
const bcrypt = require('bcryptjs');
const logger = require('../config/logger');

class UserRepository {
  // ─────────────────────────────────────────────────────────────
  //  READ — via udf_get_users (returns from uv_users, no password)
  // ─────────────────────────────────────────────────────────────

  /**
   * Get user by ID via udf_get_users
   * Returns full user with country info (no password)
   */
  async findById(id) {
    const { data, error } = await supabase.rpc('udf_get_users', {
      p_id: id,
      p_is_active: true,
    });

    if (error) {
      logger.error({ error }, 'UserRepository.findById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  /**
   * Get user by email via udf_get_users + exact match
   * Returns full user with country info (no password)
   */
  async findByEmail(email) {
    const { data, error } = await supabase.rpc('udf_get_users', {
      p_search_term: email,
      p_filter_is_deleted: false,
      p_page_size: 10,
      p_page_index: 1,
    });

    if (error) {
      logger.error({ error }, 'UserRepository.findByEmail failed');
      throw error;
    }

    // udf_get_users search is ILIKE across many fields —
    // we must exact-match on email from the results
    if (data && data.length > 0) {
      const match = data.find(
        (u) => u.user_email && u.user_email.toLowerCase() === email.toLowerCase(),
      );
      return match || null;
    }

    return null;
  }

  /**
   * Get user by mobile via udf_get_users + exact match
   * Returns full user with country info (no password)
   */
  async findByMobile(mobile) {
    const { data, error } = await supabase.rpc('udf_get_users', {
      p_search_term: mobile,
      p_filter_is_deleted: false,
      p_page_size: 10,
      p_page_index: 1,
    });

    if (error) {
      logger.error({ error }, 'UserRepository.findByMobile failed');
      throw error;
    }

    if (data && data.length > 0) {
      const match = data.find((u) => u.user_mobile === mobile);
      return match || null;
    }

    return null;
  }

  /**
   * Find user by email OR mobile
   * Returns full user with country info (no password)
   */
  async findByEmailOrMobile(identifier) {
    const byEmail = await this.findByEmail(identifier);
    if (byEmail) return byEmail;
    return this.findByMobile(identifier);
  }

  // ─────────────────────────────────────────────────────────────
  //  CHECK EXISTENCE — via udf_get_users
  // ─────────────────────────────────────────────────────────────

  /**
   * Check if email already exists (returns boolean)
   */
  async emailExists(email) {
    const user = await this.findByEmail(email);
    return !!user;
  }

  /**
   * Check if mobile already exists (returns boolean)
   */
  async mobileExists(mobile) {
    const user = await this.findByMobile(mobile);
    return !!user;
  }

  // ─────────────────────────────────────────────────────────────
  //  PASSWORD VERIFICATION
  //  Direct query on users table (ONLY place we touch the table
  //  directly) because uv_users view excludes the password column.
  //  pgcrypto crypt('bf') produces $2a$ bcrypt hashes that
  //  bcryptjs.compare() can verify on the Node side.
  // ─────────────────────────────────────────────────────────────

  /**
   * Verify password by email or mobile.
   * Step 1: Find user row from users table (includes password)
   * Step 2: bcryptjs.compare(rawPassword, storedHash)
   * Returns the user row (without password) if match, null otherwise.
   */
  async verifyPassword(identifier, rawPassword) {
    const { data, error } = await supabase
      .from('users')
      .select('id, country_id, first_name, last_name, email, mobile, password, role, is_active, is_deleted, is_email_verified, is_mobile_verified, last_login, email_verified_at, mobile_verified_at, created_at, updated_at')
      .or(`email.ilike.${identifier},mobile.eq.${identifier}`)
      .eq('is_deleted', false)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error({ error }, 'UserRepository.verifyPassword — user lookup failed');
      throw error;
    }

    if (!data || !data.password) {
      return null;
    }

    // Compare using bcryptjs (compatible with pgcrypto $2a$ hash)
    const isMatch = await bcrypt.compare(rawPassword, data.password);

    if (!isMatch) {
      return null;
    }

    // Return user data WITHOUT password
    const { password: _pw, ...userWithoutPassword } = data;
    return userWithoutPassword;
  }

  // ─────────────────────────────────────────────────────────────
  //  CREATE — via sp_users_insert (FUNCTION, returns new user ID)
  //  Password is hashed INSIDE the function via pgcrypto.
  //  We send RAW plaintext password — never pre-hash.
  // ─────────────────────────────────────────────────────────────

  /**
   * Create a new user via sp_users_insert
   * @param {Object} params
   * @param {string} params.password — RAW plaintext (function hashes it)
   * @returns {Object} Full user object from udf_get_users
   */
  async create({ firstName, lastName, email, mobile, password, role, countryId, isEmailVerified, isMobileVerified }) {
    const { data: newId, error } = await supabase.rpc('sp_users_insert', {
      p_country_id: countryId,
      p_first_name: firstName,
      p_last_name: lastName,
      p_password: password, // RAW — function hashes via pgcrypto
      p_email: email || null,
      p_mobile: mobile || null,
      p_role: role || 'student',
      p_is_active: true,
      p_is_email_verified: isEmailVerified || false,
      p_is_mobile_verified: isMobileVerified || false,
    });

    if (error) {
      logger.error({ error }, 'UserRepository.create (sp_users_insert) failed');
      throw error;
    }

    // sp_users_insert now returns the new user's ID (BIGINT)
    // Fetch full user data with country info via udf_get_users
    const newUser = await this.findById(newId);

    if (!newUser) {
      throw new Error(`User created (id: ${newId}) but could not be fetched via udf_get_users`);
    }

    logger.info(`User created via sp_users_insert: id=${newId}`);
    return newUser;
  }

  // ─────────────────────────────────────────────────────────────
  //  UPDATE — via sp_users_update (FUNCTION, returns void)
  //  Uses COALESCE pattern: pass only the fields you want to
  //  change. Omitted params default to NULL → keep current value.
  //  Password is hashed INSIDE the function if provided.
  // ─────────────────────────────────────────────────────────────

  /**
   * Update user password via sp_users_update
   * @param {number} userId
   * @param {string} rawPassword — RAW plaintext (function hashes it)
   */
  async updatePassword(userId, rawPassword) {
    const { error } = await supabase.rpc('sp_users_update', {
      p_id: userId,
      p_password: rawPassword, // RAW — function hashes via pgcrypto
    });

    if (error) {
      logger.error({ error }, 'UserRepository.updatePassword (sp_users_update) failed');
      throw error;
    }

    return { id: userId };
  }

  /**
   * Update user email via sp_users_update
   */
  async updateEmail(userId, newEmail) {
    const { error } = await supabase.rpc('sp_users_update', {
      p_id: userId,
      p_email: newEmail,
      p_is_email_verified: true,
    });

    if (error) {
      logger.error({ error }, 'UserRepository.updateEmail (sp_users_update) failed');
      throw error;
    }

    return { id: userId, email: newEmail };
  }

  /**
   * Update user mobile via sp_users_update
   */
  async updateMobile(userId, newMobile) {
    const { error } = await supabase.rpc('sp_users_update', {
      p_id: userId,
      p_mobile: newMobile,
      p_is_mobile_verified: true,
    });

    if (error) {
      logger.error({ error }, 'UserRepository.updateMobile (sp_users_update) failed');
      throw error;
    }

    return { id: userId, mobile: newMobile };
  }

  /**
   * Update last login timestamp.
   * sp_users_update doesn't have a last_login param,
   * so we do a direct update for this one field.
   */
  async updateLastLogin(userId) {
    const { error } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId)
      .eq('is_deleted', false);

    if (error) {
      logger.error({ error }, 'UserRepository.updateLastLogin failed');
      // Non-blocking — don't throw, login should still succeed
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  DELETE — via sp_users_delete (FUNCTION, returns void)
  //  Soft delete: sets is_deleted=true, is_active=false
  // ─────────────────────────────────────────────────────────────

  /**
   * Soft delete user via sp_users_delete
   */
  async delete(userId) {
    const { error } = await supabase.rpc('sp_users_delete', {
      p_id: userId,
    });

    if (error) {
      logger.error({ error }, 'UserRepository.delete (sp_users_delete) failed');
      throw error;
    }

    return { id: userId };
  }
}

module.exports = new UserRepository();
