/**
 * ═══════════════════════════════════════════════════════════════
 * PAGINATION MIDDLEWARE
 * ═══════════════════════════════════════════════════════════════
 * Parses page, limit, sort, search from query string.
 * Normalizes and validates values, attaches to req.pagination.
 * Maps directly to Supabase UDF parameters:
 *   p_page_index, p_page_size, p_sort_column, p_sort_direction, p_search_term
 * ═══════════════════════════════════════════════════════════════
 */

const { PAGINATION_DEFAULTS, SORT_DIRECTIONS } = require('../utils/constants');

const pagination = (req, _res, next) => {
  const {
    page = PAGINATION_DEFAULTS.PAGE,
    limit = PAGINATION_DEFAULTS.LIMIT,
    sort = PAGINATION_DEFAULTS.SORT_COLUMN,
    order = PAGINATION_DEFAULTS.SORT_DIRECTION,
    search = '',
  } = req.query;

  // Parse and clamp values
  const parsedPage = Math.max(1, parseInt(page, 10) || PAGINATION_DEFAULTS.PAGE);
  const parsedLimit = Math.min(
    PAGINATION_DEFAULTS.MAX_LIMIT,
    Math.max(1, parseInt(limit, 10) || PAGINATION_DEFAULTS.LIMIT),
  );

  // Validate sort direction
  const parsedOrder = SORT_DIRECTIONS[String(order).toUpperCase()] || PAGINATION_DEFAULTS.SORT_DIRECTION;

  // Sanitize sort column (prevent SQL injection — only allow alphanumeric + underscore)
  const parsedSort = /^[a-zA-Z_]+$/.test(sort) ? sort : PAGINATION_DEFAULTS.SORT_COLUMN;

  req.pagination = {
    page: parsedPage,
    limit: parsedLimit,
    sort: parsedSort,
    order: parsedOrder,
    search: String(search).trim(),
    // Direct mapping to Supabase UDF params
    p_page_index: parsedPage,
    p_page_size: parsedLimit,
    p_sort_column: parsedSort,
    p_sort_direction: parsedOrder,
    p_search_term: String(search).trim() || null,
  };

  next();
};

module.exports = pagination;
