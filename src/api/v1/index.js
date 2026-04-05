/**
 * ═══════════════════════════════════════════════════════════════
 * V1 ROUTES — Registers all v1 route modules
 * ═══════════════════════════════════════════════════════════════
 */

const { Router } = require('express');
const authRoutes = require('./routes/auth.routes');
const rbacRoutes = require('./routes/rbac.routes');
const masterDataRoutes = require('./routes/masterData.routes');
const masterDataExtendedRoutes = require('./routes/masterDataExtended.routes');
const branchManagementRoutes = require('./routes/branchManagement.routes');
const userManagementRoutes = require('./routes/userManagement.routes');
const employeeManagementRoutes = require('./routes/employeeManagement.routes');
const studentManagementRoutes = require('./routes/studentManagement.routes');
const instructorManagementRoutes = require('./routes/instructorManagement.routes');
const materialManagementRoutes = require('./routes/materialManagement.routes');

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/rbac', rbacRoutes);
router.use('/master-data', masterDataRoutes);
router.use('/master-data', masterDataExtendedRoutes);
router.use('/branch-management', branchManagementRoutes);
router.use('/user-management', userManagementRoutes);
router.use('/employee-management', employeeManagementRoutes);
router.use('/student-management', studentManagementRoutes);
router.use('/instructor-management', instructorManagementRoutes);
router.use('/material-management', materialManagementRoutes);

module.exports = router;
