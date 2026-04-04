/**
 * ═══════════════════════════════════════════════════════════════
 * V1 ROUTES — Registers all v1 route modules
 * ═══════════════════════════════════════════════════════════════
 */

const { Router } = require('express');
const authRoutes = require('./routes/auth.routes');

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);

// Future routes will be added here:
// router.use('/users', usersRoutes);
// router.use('/courses', coursesRoutes);
// etc.

module.exports = router;
