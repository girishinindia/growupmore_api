/**
 * ═══════════════════════════════════════════════════════════════
 * DATABASE — Supabase Client Initialization
 * ═══════════════════════════════════════════════════════════════
 * Two clients:
 *   supabase      → Uses service_role key (full access, bypasses RLS)
 *   supabaseAnon  → Uses anon key (respects RLS, for client-like operations)
 * ═══════════════════════════════════════════════════════════════
 */

const { createClient } = require('@supabase/supabase-js');
const config = require('./index');
const logger = require('./logger');

const isConfigured = config.supabase.url && config.supabase.serviceRoleKey;

if (!isConfigured) {
  logger.warn('Supabase URL or Service Role Key not configured. Database operations will fail.');
}

// Use a placeholder URL when not configured (prevents crash on startup)
const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-key';

// Service Role Client — Full access, bypasses RLS
// Used by: repositories, services, background jobs
const supabase = createClient(
  config.supabase.url || PLACEHOLDER_URL,
  config.supabase.serviceRoleKey || PLACEHOLDER_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
  },
);

// Anon Client — Respects RLS policies
// Used by: auth flows that need RLS context
const supabaseAnon = createClient(
  config.supabase.url || PLACEHOLDER_URL,
  config.supabase.anonKey || PLACEHOLDER_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

/**
 * Test the Supabase connection
 * Call this during server startup to verify connectivity
 */
const testConnection = async () => {
  // Skip connection test if Supabase is not configured
  if (!isConfigured) {
    logger.warn('Supabase not configured — skipping connection test.');
    return false;
  }

  try {
    const { data, error } = await supabase.rpc('udf_get_countries', {
      p_page_size: 1,
      p_page_index: 1,
    });

    if (error) {
      logger.error({ error }, 'Supabase connection test failed');
      return false;
    }

    logger.info('Supabase connected successfully');
    return true;
  } catch (err) {
    logger.error({ err }, 'Supabase connection test error');
    return false;
  }
};

module.exports = {
  supabase,
  supabaseAnon,
  testConnection,
};
