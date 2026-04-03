/**
 * ═══════════════════════════════════════════════════════════════
 * V2 ROUTE REGISTRY
 * ═══════════════════════════════════════════════════════════════
 * Inherits from v1. Override only routes that change in v2.
 * If a route isn't overridden, v1 handles it.
 * ═══════════════════════════════════════════════════════════════
 */

const { Router } = require('express');

const router = Router();

// ─── Health Check (versioned) ────────────────────────────────
router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'API v2 is running', version: 'v2' });
});

// ─── Override specific routes here as v2 evolves ─────────────
// Example:
// const coursesV2Routes = require('./routes/courses.routes');
// router.use('/courses', coursesV2Routes);

module.exports = router;
