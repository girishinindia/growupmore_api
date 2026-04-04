/**
 * ═══════════════════════════════════════════════════════════════
 * V1 ROUTES — Registers all v1 route modules
 * ═══════════════════════════════════════════════════════════════
 */

const { Router } = require('express');
const authRoutes = require('./routes/auth.routes');
const rbacRoutes = require('./routes/rbac.routes');

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/rbac', rbacRoutes);

module.exports = router;
