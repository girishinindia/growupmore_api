/**
 * ═══════════════════════════════════════════════════════════════
 * REDIS — Upstash Redis Connection (ioredis)
 * ═══════════════════════════════════════════════════════════════
 */

const Redis = require('ioredis');
const config = require('./index');
const logger = require('./logger');

// ── In-memory mock (used as fallback) ───────────────────────
function createMockRedis() {
  const store = new Map();
  const expiry = new Map();

  return {
    get: async (key) => {
      if (expiry.has(key) && Date.now() > expiry.get(key)) {
        store.delete(key);
        expiry.delete(key);
        return null;
      }
      return store.get(key) || null;
    },
    set: async (key, value, ...args) => {
      store.set(key, value);
      if (args[0] === 'EX' && args[1]) {
        const ttlMs = args[1] * 1000;
        expiry.set(key, Date.now() + ttlMs);
        setTimeout(() => {
          store.delete(key);
          expiry.delete(key);
        }, ttlMs);
      }
      return 'OK';
    },
    del: async (...keys) => {
      let count = 0;
      keys.forEach((key) => {
        if (store.delete(key)) {
          count++;
        }
        expiry.delete(key);
      });
      return count;
    },
    keys: async (pattern) => {
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
      if (!expiry.has(key)) {
        return -1;
      }
      const remaining = Math.ceil((expiry.get(key) - Date.now()) / 1000);
      return remaining > 0 ? remaining : -2;
    },
    exists: async (key) => {
      if (expiry.has(key) && Date.now() > expiry.get(key)) {
        store.delete(key);
        expiry.delete(key);
        return 0;
      }
      return store.has(key) ? 1 : 0;
    },
    flushall: async () => {
      store.clear();
      expiry.clear();
      return 'OK';
    },
    call: async () => null,
    status: 'ready',
    _isMock: true,
  };
}

let redis;

if (config.redis.url) {
  let connectionFailed = false;

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
  });

  ioRedis.on('ready', () => {
    logger.info('Redis ready to accept commands');
  });

  ioRedis.on('error', (err) => {
    if (!connectionFailed) {
      logger.error({ err: err.message });
    }
  });

  ioRedis.on('close', () => {
    if (connectionFailed) {
      logger.warn('Redis unavailable. Using in-memory fallback.');
    }
  });

  const mockFallback = createMockRedis();

  redis = new Proxy(ioRedis, {
    get(target, prop) {
      if (connectionFailed && typeof mockFallback[prop] === 'function') {
        return mockFallback[prop];
      }
      if (prop === '_isMock') {
        return connectionFailed;
      }
      if (prop === '_isFallback') {
        return connectionFailed;
      }
      const value = target[prop];
      if (typeof value === 'function') {
        return value.bind(target);
      }
      return value;
    },
  });
} else {
  logger.warn('Redis URL not configured. Using in-memory fallback (not for production).');
  redis = createMockRedis();
}

module.exports = redis;
