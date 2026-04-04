/**
 * ═══════════════════════════════════════════════════════════════
 * REDIS — Upstash Redis Connection (ioredis)
 * ═══════════════════════════════════════════════════════════════
 * Uses Upstash Redis as primary store.
 * Falls back to in-memory mock if connection fails.
 * The mock correctly handles TTL, multiple set on same key,
 * and clearing old timers on overwrite.
 * ═══════════════════════════════════════════════════════════════
 */

const Redis = require('ioredis');
const config = require('./index');
const logger = require('./logger');

// ── In-memory mock (used as fallback) ───────────────────────
function createMockRedis() {
  const store = new Map();
  const expiry = new Map();
  const timers = new Map(); // Track setTimeout handles to avoid leaks

  return {
    get: async (key) => {
      // Check expiry first
      if (expiry.has(key) && Date.now() > expiry.get(key)) {
        store.delete(key);
        expiry.delete(key);
        if (timers.has(key)) {
          clearTimeout(timers.get(key));
          timers.delete(key);
        }
        return null;
      }
      const val = store.get(key);
      return val !== undefined ? val : null;
    },
    set: async (key, value, ...args) => {
      store.set(key, String(value));

      // Clear old timer for this key (prevents stale setTimeout from
      // deleting a re-set key prematurely)
      if (timers.has(key)) {
        clearTimeout(timers.get(key));
        timers.delete(key);
      }

      if (args[0] === 'EX' && args[1]) {
        const ttlMs = args[1] * 1000;
        expiry.set(key, Date.now() + ttlMs);
        const timer = setTimeout(() => {
          store.delete(key);
          expiry.delete(key);
          timers.delete(key);
        }, ttlMs);
        timers.set(key, timer);
        // Unref timer so it doesn't keep Node.js alive
        if (timer.unref) timer.unref();
      }
      return 'OK';
    },
    del: async (...keys) => {
      // Flatten in case an array is passed: del([k1, k2])
      const flatKeys = keys.flat();
      let count = 0;
      flatKeys.forEach((key) => {
        if (store.delete(key)) count++;
        expiry.delete(key);
        if (timers.has(key)) {
          clearTimeout(timers.get(key));
          timers.delete(key);
        }
      });
      return count;
    },
    keys: async (pattern) => {
      // Expire check on all keys first
      const now = Date.now();
      for (const [key, exp] of expiry) {
        if (now > exp) {
          store.delete(key);
          expiry.delete(key);
          if (timers.has(key)) {
            clearTimeout(timers.get(key));
            timers.delete(key);
          }
        }
      }
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return Array.from(store.keys()).filter((key) => regex.test(key));
    },
    incr: async (key) => {
      const val = parseInt(store.get(key) || '0', 10) + 1;
      store.set(key, String(val));
      return val;
    },
    decr: async (key) => {
      const val = parseInt(store.get(key) || '0', 10) - 1;
      store.set(key, String(val));
      return val;
    },
    ttl: async (key) => {
      if (!expiry.has(key)) return -1;
      const remaining = Math.ceil((expiry.get(key) - Date.now()) / 1000);
      return remaining > 0 ? remaining : -2;
    },
    exists: async (key) => {
      if (expiry.has(key) && Date.now() > expiry.get(key)) {
        store.delete(key);
        expiry.delete(key);
        if (timers.has(key)) {
          clearTimeout(timers.get(key));
          timers.delete(key);
        }
        return 0;
      }
      return store.has(key) ? 1 : 0;
    },
    flushall: async () => {
      store.clear();
      expiry.clear();
      for (const timer of timers.values()) clearTimeout(timer);
      timers.clear();
      return 'OK';
    },
    call: async () => null,
    status: 'ready',
    _isMock: true,
    _store: store, // Exposed for debugging
  };
}

let redis;

if (config.redis.url) {
  let connectionFailed = false;
  let wasEverConnected = false;

  const ioRedis = new Redis(config.redis.url, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 5) {
        logger.warn('Redis max retries reached. Falling back to in-memory cache.');
        connectionFailed = true;
        return null;
      }
      const delay = Math.min(times * 200, 3000);
      return delay;
    },
    enableReadyCheck: true,
    lazyConnect: false,
    connectTimeout: 10000,
    commandTimeout: 5000,
  });

  ioRedis.on('connect', () => {
    logger.info('Redis connected (Upstash)');
    wasEverConnected = true;
  });

  ioRedis.on('ready', () => {
    logger.info('Redis ready to accept commands');
  });

  ioRedis.on('error', (err) => {
    if (!connectionFailed) {
      logger.error({ err: err.message }, 'Redis error');
    }
  });

  ioRedis.on('close', () => {
    if (connectionFailed) {
      logger.warn('Redis connection closed. Using in-memory fallback.');
    }
  });

  const mockFallback = createMockRedis();

  // Proxy that falls back to mock if connection fails.
  // Also wraps real commands to fall back per-command on error.
  redis = new Proxy(ioRedis, {
    get(target, prop) {
      // Always use mock if connection permanently failed
      if (connectionFailed && typeof mockFallback[prop] === 'function') {
        return mockFallback[prop];
      }

      if (prop === '_isMock') return connectionFailed;
      if (prop === '_isFallback') return connectionFailed;

      const value = target[prop];
      if (typeof value === 'function') {
        // Wrap real Redis commands to catch per-command errors
        // and fall back to mock for that specific call
        const boundFn = value.bind(target);
        return async (...args) => {
          try {
            return await boundFn(...args);
          } catch (err) {
            logger.warn(
              `Redis command '${String(prop)}' failed: ${err.message}. Using mock fallback for this call.`,
            );
            if (typeof mockFallback[prop] === 'function') {
              return mockFallback[prop](...args);
            }
            throw err;
          }
        };
      }
      return value;
    },
  });
} else {
  logger.warn('Redis URL not configured. Using in-memory fallback (not for production).');
  redis = createMockRedis();
}

module.exports = redis;
