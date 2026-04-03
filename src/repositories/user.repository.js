/**
 * USER REPOSITORY — Direct Supabase Queries
 * Phase 01 has no stored procedures for users, so we use direct table queries.
 */

const BaseRepository = require('./base.repository');
const { supabase } = require('../config/database');
const logger = require('../config/logger');
const { NotFoundError, ConflictError, AppError } = require('../utils/errors');

class UserRepository extends BaseRepository {

  async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_deleted', false)
      .maybeSingle();

    if (error) this._handleSupabaseError(error, 'findByEmail');
    return data; // null if not found
  }

  async findByMobile(mobile) {
    const cleanMobile = mobile.replace(/\D/g, '');
    const variants = [cleanMobile];
    if (cleanMobile.length === 10) variants.push(`+91${cleanMobile}`, `91${cleanMobile}`);
    if (cleanMobile.startsWith('91') && cleanMobile.length === 12) variants.push(`+${cleanMobile}`, cleanMobile.slice(2));

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_deleted', false)
      .in('mobile', variants)
      .maybeSingle();

    if (error) this._handleSupabaseError(error, 'findByMobile');
    return data;
  }

  async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .maybeSingle();

    if (error) this._handleSupabaseError(error, 'findById');
    return data;
  }

  async findByIdOrFail(id) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundError('User');
    return user;
  }

  async create(payload) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email ? payload.email.toLowerCase() : null,
        mobile: payload.mobile || null,
        password: payload.password,
        role: payload.role || 'student',
        country_id: payload.country_id || 1,
        is_active: true,
        is_email_verified: false,
        is_mobile_verified: false,
      })
      .select('id, first_name, last_name, email, mobile, role, is_active, is_email_verified, is_mobile_verified, created_at')
      .single();

    if (error) this._handleSupabaseError(error, 'create');
    return data;
  }

  async updatePassword(userId, hashedPassword) {
    const { data, error } = await supabase
      .from('users')
      .update({ password: hashedPassword, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .eq('is_deleted', false)
      .select('id')
      .single();

    if (error) this._handleSupabaseError(error, 'updatePassword');
    return data;
  }

  async markEmailVerified(userId) {
    const { data, error } = await supabase
      .from('users')
      .update({
        is_email_verified: true,
        email_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .eq('is_deleted', false)
      .select('id, is_email_verified')
      .single();

    if (error) this._handleSupabaseError(error, 'markEmailVerified');
    return data;
  }

  async markMobileVerified(userId) {
    const { data, error } = await supabase
      .from('users')
      .update({
        is_mobile_verified: true,
        mobile_verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .eq('is_deleted', false)
      .select('id, is_mobile_verified')
      .single();

    if (error) this._handleSupabaseError(error, 'markMobileVerified');
    return data;
  }

  async updateEmail(userId, newEmail) {
    const { data, error } = await supabase
      .from('users')
      .update({
        email: newEmail.toLowerCase(),
        is_email_verified: false,
        email_verified_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .eq('is_deleted', false)
      .select('id, email, is_email_verified')
      .single();

    if (error) this._handleSupabaseError(error, 'updateEmail');
    return data;
  }

  async updateMobile(userId, newMobile) {
    const { data, error } = await supabase
      .from('users')
      .update({
        mobile: newMobile,
        is_mobile_verified: false,
        mobile_verified_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .eq('is_deleted', false)
      .select('id, mobile, is_mobile_verified')
      .single();

    if (error) this._handleSupabaseError(error, 'updateMobile');
    return data;
  }

  async updateLastLogin(userId) {
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId);
  }

  async updateProfile(userId, payload) {
    const updateData = {};
    if (payload.first_name !== undefined) updateData.first_name = payload.first_name;
    if (payload.last_name !== undefined) updateData.last_name = payload.last_name;
    if (payload.country_id !== undefined) updateData.country_id = payload.country_id;
    updateData.updated_at = new Date().toISOString();
    if (payload.updated_by) updateData.updated_by = payload.updated_by;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .eq('is_deleted', false)
      .select('id, first_name, last_name, email, mobile, role, country_id, is_active, is_email_verified, is_mobile_verified, created_at, updated_at')
      .single();

    if (error) this._handleSupabaseError(error, 'updateProfile');
    return data;
  }

  async softDelete(userId, deletedBy = null) {
    const { data, error } = await supabase
      .from('users')
      .update({
        is_deleted: true,
        is_active: false,
        deleted_at: new Date().toISOString(),
        updated_by: deletedBy,
      })
      .eq('id', userId)
      .eq('is_deleted', false)
      .select('id')
      .single();

    if (error) this._handleSupabaseError(error, 'softDelete');
    return data;
  }

  async restore(userId, restoredBy = null) {
    const { data, error } = await supabase
      .from('users')
      .update({
        is_deleted: false,
        is_active: true,
        deleted_at: null,
        updated_by: restoredBy,
      })
      .eq('id', userId)
      .eq('is_deleted', true)
      .select('id')
      .single();

    if (error) this._handleSupabaseError(error, 'restore');
    return data;
  }

  async updateRole(userId, role, updatedBy = null) {
    const { data, error } = await supabase
      .from('users')
      .update({ role, updated_by: updatedBy, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .eq('is_deleted', false)
      .select('id, role')
      .single();

    if (error) this._handleSupabaseError(error, 'updateRole');
    return data;
  }

  async setActive(userId, isActive, updatedBy = null) {
    const { data, error } = await supabase
      .from('users')
      .update({ is_active: isActive, updated_by: updatedBy, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .eq('is_deleted', false)
      .select('id, is_active')
      .single();

    if (error) this._handleSupabaseError(error, 'setActive');
    return data;
  }

  async list({ page = 1, limit = 20, search = '', sort = 'created_at', order = 'DESC', role = null, isActive = null } = {}) {
    let query = supabase
      .from('users')
      .select('id, first_name, last_name, email, mobile, role, country_id, is_active, is_email_verified, is_mobile_verified, last_login, created_at, updated_at', { count: 'exact' })
      .eq('is_deleted', false);

    if (role) query = query.eq('role', role);
    if (isActive !== null) query = query.eq('is_active', isActive);
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,mobile.ilike.%${search}%`);
    }

    // Sort
    const ascending = order.toUpperCase() === 'ASC';
    query = query.order(sort, { ascending });

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) this._handleSupabaseError(error, 'list');
    return { data: data || [], totalCount: count || 0 };
  }

  /**
   * Check if user has a specific permission via fn_user_has_permission
   */
  async hasPermission(userId, permissionCode) {
    try {
      const { data, error } = await supabase.rpc('fn_user_has_permission', {
        p_user_id: userId,
        p_permission_code: permissionCode,
      });

      if (error) {
        logger.warn({ error, userId, permissionCode }, 'Permission check failed');
        return false;
      }

      return data === true;
    } catch (err) {
      logger.error({ err, userId, permissionCode }, 'hasPermission error');
      return false;
    }
  }

  /**
   * Get all permissions for a user via fn_user_permissions
   */
  async getUserPermissions(userId) {
    try {
      const { data, error } = await supabase.rpc('fn_user_permissions', {
        p_user_id: userId,
      });

      if (error) {
        logger.warn({ error, userId }, 'getUserPermissions failed');
        return [];
      }

      return data || [];
    } catch (err) {
      logger.error({ err, userId }, 'getUserPermissions error');
      return [];
    }
  }

  async storePasswordResetToken(userId, token, expiresAt) {
    // Store in Redis instead of DB for simplicity
    const redis = require('../config/redis');
    const key = `password_reset:${token}`;
    const ttl = Math.floor((new Date(expiresAt) - new Date()) / 1000);
    await redis.set(key, JSON.stringify({ userId, token, expiresAt }), 'EX', ttl > 0 ? ttl : 600);
  }

  async verifyPasswordResetToken(token) {
    const redis = require('../config/redis');
    const key = `password_reset:${token}`;
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data);
  }

  async revokePasswordResetToken(token) {
    const redis = require('../config/redis');
    const key = `password_reset:${token}`;
    await redis.del(key);
  }
}

module.exports = new UserRepository();
