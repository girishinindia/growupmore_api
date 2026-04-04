/**
 * ═══════════════════════════════════════════════════════════════
 * MASTER ROUTER — /api/v1 → v1, /api/v2 → v2
 * ═══════════════════════════════════════════════════════════════
 */

const { Router } = require('express');
const v1Routes = require('./v1');

const router = Router();

// API version routing
router.use('/v1', v1Routes);

// Future: router.use('/v2', v2Routes);

module.exports = router;
