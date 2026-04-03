/**
 * ═══════════════════════════════════════════════════════════════
 * API VERSION ROUTER
 * ═══════════════════════════════════════════════════════════════
 * /api/v1  → v1 routes (current)
 * /api/v2  → v2 routes (inherits from v1, overrides only changed)
 * ═══════════════════════════════════════════════════════════════
 */

const { Router } = require('express');
const v1Routes = require('./v1/index');
const v2Routes = require('./v2/index');

const router = Router();

// Mount version routes
router.use('/v1', v1Routes);
router.use('/v2', v2Routes);

module.exports = router;
