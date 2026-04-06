/**
 * Shared Zod coercion helpers for validators.
 *
 * Form-data and URL-encoded payloads always send strings.
 * These helpers transparently coerce string values to their
 * expected JS types so validation works regardless of the
 * Content-Type used by the client.
 */
const { z } = require('zod');

// ── Boolean ────────────────────────────────────────────────────
const coerceBoolean = z.preprocess(
  (val) => {
    if (typeof val === 'boolean') return val;
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  },
  z.boolean()
);

// ── Integer (any) ──────────────────────────────────────────────
const coerceSmallInt = z.preprocess(
  (val) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') { const n = parseInt(val, 10); return isNaN(n) ? val : n; }
    return val;
  },
  z.number().int()
);

// ── Number (any, including decimals) ───────────────────────────
const coerceNumber = z.preprocess(
  (val) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') { const n = Number(val); return isNaN(n) ? val : n; }
    return val;
  },
  z.number()
);

// ── Positive number (decimals allowed) ─────────────────────────
const coercePositiveNumber = z.preprocess(
  (val) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') { const n = Number(val); return isNaN(n) ? val : n; }
    return val;
  },
  z.number().positive()
);

// ── Positive integer (ID fields) ──────────────────────────────
const coercePositiveInt = z.preprocess(
  (val) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') { const n = parseInt(val, 10); return isNaN(n) ? val : n; }
    return val;
  },
  z.number().int().positive()
);

module.exports = {
  coerceBoolean,
  coerceSmallInt,
  coerceNumber,
  coercePositiveNumber,
  coercePositiveInt,
};
