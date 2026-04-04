/**
 * ═══════════════════════════════════════════════════════════════
 * DATABASE — Supabase Client Initialization
 * ═══════════════════════════════════════════════════════════════
 */

const { createClient } = require('@supabase/supabase-js');
const config = require('./index');
const logger = require('./logger');

const isConfigured = config.supabase.url && config.supabase.serviceRoleKey;

if (!isConfigured) {
  logger.warn('Supabase URL or Service Role Key not configured. Database operations will fail.');
}

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-key';

// Service Role Client — Full access, bypasses RLS
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
 */
const testConnection = async () => {
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
