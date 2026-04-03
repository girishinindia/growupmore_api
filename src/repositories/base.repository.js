/**
 * ═══════════════════════════════════════════════════════════════
 * BASE REPOSITORY — Supabase Abstraction Layer
 * ═══════════════════════════════════════════════════════════════
 * Wraps all Supabase calls into reusable methods.
 * Every module's repository extends or uses this.
 *
 * Methods:
 *   callFunction(name, params)   → supabase.rpc() for udf_* functions
 *   callProcedure(name, params)  → supabase.rpc() for sp_* procedures
 *   handleError(error)           → Maps Supabase errors to custom errors
 * ═══════════════════════════════════════════════════════════════
 */

const { supabase } = require('../config/database');
const logger = require('../config/logger');
const {
  AppError,
  NotFoundError,
  ConflictError,
  ValidationError,
} = require('../utils/errors');

class BaseRepository {
  /**
   * Call a Supabase RPC function (udf_get_*)
   * Used for READ operations
   *
   * @param {string} functionName - e.g., 'udf_get_countries'
   * @param {Object} params - Function parameters
   * @returns {Promise<Array>} Query results
   */
  async callFunction(functionName, params = {}) {
    try {
      // Remove null/undefined params (Supabase RPC doesn't like them)
      const cleanParams = this._cleanParams(params);

      logger.debug({ functionName, params: cleanParams }, 'Calling Supabase function');

      const { data, error } = await supabase.rpc(functionName, cleanParams);

      if (error) {
        this._handleSupabaseError(error, functionName);
      }

      return data || [];
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      logger.error({ err, functionName, params }, 'Repository callFunction error');
      throw new AppError(`Database query failed: ${functionName}`);
    }
  }

  /**
   * Call a Supabase RPC procedure (sp_*)
   * Used for CREATE, UPDATE, DELETE operations
   *
   * @param {string} procedureName - e.g., 'sp_countries_insert'
   * @param {Object} params - Procedure parameters
   * @returns {Promise<*>} Procedure result
   */
  async callProcedure(procedureName, params = {}) {
    try {
      const cleanParams = this._cleanParams(params);

      logger.debug({ procedureName, params: cleanParams }, 'Calling Supabase procedure');

      const { data, error } = await supabase.rpc(procedureName, cleanParams);

      if (error) {
        this._handleSupabaseError(error, procedureName);
      }

      return data;
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      logger.error({ err, procedureName, params }, 'Repository callProcedure error');
      throw new AppError(`Database operation failed: ${procedureName}`);
    }
  }

  /**
   * Call a function that returns a single record
   * Throws NotFoundError if no data returned
   *
   * @param {string} functionName
   * @param {Object} params
   * @param {string} resourceName - For error message (e.g., 'Country')
   * @returns {Promise<Object>} Single record
   */
  async callFunctionSingle(functionName, params = {}, resourceName = 'Resource') {
    const data = await this.callFunction(functionName, params);

    if (!data || (Array.isArray(data) && data.length === 0)) {
      throw new NotFoundError(resourceName);
    }

    return Array.isArray(data) ? data[0] : data;
  }

  /**
   * Call a function with pagination support
   * Returns { data, totalCount } extracted from the UDF result
   *
   * @param {string} functionName
   * @param {Object} params - Must include p_page_index, p_page_size
   * @returns {Promise<{data: Array, totalCount: number}>}
   */
  async callFunctionPaginated(functionName, params = {}) {
    const data = await this.callFunction(functionName, params);

    if (!data || data.length === 0) {
      return { data: [], totalCount: 0 };
    }

    // UDFs return total_count in every row — extract from first row
    const totalCount = data[0].total_count || 0;

    // Remove total_count from each row (it's metadata, not data)
    const cleanData = data.map((row) => {
      const { total_count: _tc, ...rest } = row;
      return rest;
    });

    return { data: cleanData, totalCount };
  }

  /**
   * Direct table query (for simple operations that don't need stored procedures)
   *
   * @param {string} table - Table name
   * @returns {import('@supabase/supabase-js').PostgrestQueryBuilder}
   */
  from(table) {
    return supabase.from(table);
  }

  // ─── Private Helpers ─────────────────────────────────────

  /**
   * Remove null/undefined values from params
   */
  _cleanParams(params) {
    const cleaned = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }

  /**
   * Map Supabase errors to custom AppError subclasses
   */
  _handleSupabaseError(error, operationName) {
    const msg = error.message || 'Database operation failed.';
    const code = error.code;

    logger.error({ error, operationName }, 'Supabase error');

    // PostgreSQL error codes
    if (code === '23505') {
      throw new ConflictError('Duplicate entry. This record already exists.');
    }
    if (code === '23503') {
      throw new ValidationError('Referenced record not found. Check foreign key values.');
    }
    if (code === '23502') {
      throw new ValidationError('Required field is missing.');
    }
    if (code === '42883') {
      throw new AppError(`Function or procedure not found: ${operationName}`, 500);
    }
    if (code === 'P0001') {
      // RAISE EXCEPTION from stored procedure
      throw new AppError(msg, 400);
    }

    // Check for "not found" patterns in error messages from our SPs
    if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('no active')) {
      throw new NotFoundError(operationName.replace(/^(sp_|udf_get_)/, ''));
    }

    throw new AppError(msg, 400);
  }
}

module.exports = BaseRepository;
