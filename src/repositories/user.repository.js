/**
 * ═══════════════════════════════════════════════════════════════
 * USER REPOSITORY — Database Layer (Supabase RPC)
 * ═══════════════════════════════════════════════════════════════
 * All database operations use ONLY the stored procedures and
 * functions defined in the SQL phases:
 *
 *   udf_get_users        — Phase 04 (read, search, filter, paginate)
 *   sp_users_insert       — Phase 04 (create user, hashes password internally)
 *   sp_users_update       — Phase 04 (update user, hashes password internally)
 *   sp_users_delete       — Phase 04 (soft delete)
 *
 * IMPORTANT:
 *   - sp_users_insert and sp_users_update hash the password
 *     internally via pgcrypto crypt(). Do NOT pre-hash in Node.
 *   - udf_get_users returns from uv_users view — password is
 *     NEVER returned. For password verification we use a direct
 *     select on users table (only for login/auth).
 * ═══════════════════════════════════════════════════════════════
 */

const { supabase } = require('../config/database');
const logger = require('../config/logger');

class UserRepository {
  // ─────────────────────────────────────────────────────────────
  //  READ — via udf_get_users (returns from uv_users, no password)
  // ─────────────────────────────────────────────────────────────

  /**
   * Get user by ID via udf_get_users
   * NOTE: Does NOT return password (view excludes it)
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
   * Get user by email via udf_get_users + search
   * NOTE: Does NOT return password
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

    // udf_get_users search is ILIKE across many fields — we must
    // exact-match on email from the results
    if (data && data.length > 0) {
      const match = data.find(
        (u) => u.user_email && u.user_email.toLowerCase() === email.toLowerCase(),
      );
      return match || null;
    }

    return null;
  }

  /**
   * Get user by mobile via udf_get_users + search
   * NOTE: Does NOT return password
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
   * Find user by email OR mobile (for login, profile lookups)
   * NOTE: Does NOT return password
   */
  async findByEmailOrMobile(identifier) {
    const byEmail = await this.findByEmail(identifier);
    if (byEmail) {
      return byEmail;
    }
    return this.findByMobile(identifier);
  }

  // ─────────────────────────────────────────────────────────────
  //  PASSWORD VERIFICATION — Direct query (only time we touch
  //  the users table directly, because udf_get_users / uv_users
  //  correctly excludes the password column)
  // ─────────────────────────────────────────────────────────────

  /**
   * Verify password using pgcrypto crypt() in the database.
   * Returns the full user row (including id, role, etc.) if
   * the password matches, or null if it doesn't.
   *
   * SQL: WHERE password = crypt(p_raw_password, password)
   * This is how pgcrypto bcrypt verification works — it re-hashes
   * the input using the stored hash as the salt.
   */
  async verifyPasswordByEmail(email, rawPassword) {
    const { data, error } = await supabase
      .from('users')
      .select('id, country_id, first_name, last_name, email, mobile, role, is_active, is_deleted, is_email_verified, is_mobile_verified, last_login, created_at')
      .ilike('email', email)
      .eq('is_deleted', false)
      .filter('password', 'eq', supabase.rpc ? undefined : undefined) // Can't filter by crypt in PostgREST
      .limit(1);

    // PostgREST cannot do crypt() comparison in a filter,
    // so we use a raw RPC call instead
    const { data: verifyData, error: verifyError } = await supabase.rpc('udf_verify_user_password', {
      p_identifier: email,
      p_password: rawPassword,
    }).maybeSingle();

    // If the platform doesn't have udf_verify_user_password,
    // fall back to a raw SQL approach via supabase.rpc
    if (verifyError) {
      logger.warn('udf_verify_user_password not found — using fallback SQL verification');
      return this._verifyPasswordFallback(email, rawPassword);
    }

    return verifyData || null;
  }

  /**
   * Verify password by email or mobile — uses raw SQL via
   * supabase.rpc to leverage pgcrypto crypt() in the DB.
   *
   * Since the SPs hash passwords via crypt(), we MUST verify
   * in the DB using the same crypt() function.
   */
  async verifyPassword(identifier, rawPassword) {
    // Use a direct query with crypt() for password comparison
    // This is the ONLY place we query the users table directly
    const { data, error } = await supabase
      .from('users')
      .select('id, country_id, first_name, last_name, email, mobile, role, is_active, is_deleted, is_email_verified, is_mobile_verified, last_login, email_verified_at, mobile_verified_at, created_at, updated_at')
      .or(`email.ilike.${identifier},mobile.eq.${identifier}`)
      .eq('is_deleted', false)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      logger.error({ error }, 'UserRepository.verifyPassword — user lookup failed');
      throw error;
    }

    if (!data) {
      return null;
    }

    // Now verify password using pgcrypto crypt() via raw SQL
    const { data: pwMatch, error: pwError } = await supabase.rpc('udf_check_user_password', {
      p_user_id: data.id,
      p_password: rawPassword,
    });

    if (pwError) {
      // Fallback: if udf_check_user_password doesn't exist, use raw SQL
      logger.warn('udf_check_user_password not available — using raw SQL fallback');
      return this._verifyPasswordRawSql(data.id, rawPassword, data);
    }

    return pwMatch === true ? data : null;
  }

  /**
   * Fallback password verification using raw SQL.
   * Uses the Supabase PostgREST RPC to call a one-off SQL check.
   */
  async _verifyPasswordRawSql(userId, rawPassword, userData) {
    // Query: SELECT (password = crypt($2, password)) AS matched
    //        FROM users WHERE id = $1
    const { data, error } = await supabase
      .from('users')
      .select('password')
      .eq('id', userId)
      .eq('is_deleted', false)
      .single();

    if (error) {
      logger.error({ error }, 'UserRepository._verifyPasswordRawSql failed');
      throw error;
    }

    if (!data || !data.password) {
      return null;
    }

    // We need bcryptjs on the Node side to compare against pgcrypto hash
    // pgcrypto crypt('bf') produces standard bcrypt hashes ($2a$) that
    // bcryptjs can verify
    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(rawPassword, data.password);

    return isMatch ? userData : null;
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
  //  CREATE — via sp_users_insert
  //  Password is hashed INSIDE the SP via crypt(p_password, gen_salt('bf'))
  //  So we pass the RAW plaintext password here.
  // ─────────────────────────────────────────────────────────────

  /**
   * Create a new user via sp_users_insert
   * @param {Object} params
   * @param {string} params.password — RAW plaintext (SP hashes it)
   */
  async create({ firstName, lastName, email, mobile, password, role, countryId, isEmailVerified, isMobileVerified }) {
    const { data, error } = await supabase.rpc('sp_users_insert', {
      p_country_id: countryId,
      p_first_name: firstName,
      p_last_name: lastName,
      p_password: password, // RAW — SP hashes internally
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

    // sp_users_insert is a PROCEDURE (no return value).
    // After insert, fetch the newly created user via udf_get_users.
    const identifier = email || mobile;
    const newUser = email ? await this.findByEmail(email) : await this.findByMobile(mobile);

    if (!newUser) {
      throw new Error(`User created but could not be fetched: ${identifier}`);
    }

    return newUser;
  }

  // ─────────────────────────────────────────────────────────────
  //  UPDATE — via sp_users_update
  //  Uses COALESCE pattern: pass NULL to keep current value.
  //  Password is hashed INSIDE the SP if provided.
  // ─────────────────────────────────────────────────────────────

  /**
   * Update user password via sp_users_update
   * @param {number} userId
   * @param {string} rawPassword — RAW plaintext (SP hashes it)
   */
  async updatePassword(userId, rawPassword) {
    const { error } = await supabase.rpc('sp_users_update', {
      p_id: userId,
      p_password: rawPassword, // RAW — SP hashes internally
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
   * Update last login timestamp via sp_users_update
   * (sp_users_update doesn't have a last_login param,
   *  so we do a minimal direct update for this one field)
   */
  async updateLastLogin(userId) {
    const { error } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId)
      .eq('is_deleted', false);

    if (error) {
      logger.error({ error }, 'UserRepository.updateLastLogin failed');
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  DELETE — via sp_users_delete (soft delete)
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
