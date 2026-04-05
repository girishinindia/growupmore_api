/**
 * ═══════════════════════════════════════════════════════════════
 * BRANCH MANAGEMENT ROUTES — Branches, Departments, Branch Departments
 * ═══════════════════════════════════════════════════════════════
 */

const { Router } = require('express');
const ctrl = require('../controllers/branchManagement.controller');
const validate = require('../../../middleware/validate.middleware');
const authenticate = require('../../../middleware/auth.middleware');
const { authorize } = require('../../../middleware/authorize.middleware');

const {
  idParamSchema,
  createBranchSchema,
  updateBranchSchema,
  branchListQuerySchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  departmentListQuerySchema,
  createBranchDepartmentSchema,
  updateBranchDepartmentSchema,
  branchDepartmentListQuerySchema,
} = require('../validators/branchManagement.validator');

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// ============================================================================
// BRANCHES ROUTES
// ============================================================================

router.get('/branches', authorize('branch.read'), validate(branchListQuerySchema, 'query'), ctrl.getBranches);
router.get('/branches/:id', authorize('branch.read'), validate(idParamSchema, 'params'), ctrl.getBranchById);
router.post('/branches', authorize('branch.create'), validate(createBranchSchema), ctrl.createBranch);
router.patch('/branches/:id', authorize('branch.update'), validate(idParamSchema, 'params'), validate(updateBranchSchema), ctrl.updateBranch);
router.delete('/branches/:id', authorize('branch.delete'), validate(idParamSchema, 'params'), ctrl.deleteBranch);
router.post('/branches/:id/restore', authenticate, authorize('branch.update'), validate(idParamSchema, 'params'), ctrl.restoreBranch);

// ============================================================================
// DEPARTMENTS ROUTES
// ============================================================================

router.get('/departments', authorize('department.read'), validate(departmentListQuerySchema, 'query'), ctrl.getDepartments);
router.get('/departments/:id', authorize('department.read'), validate(idParamSchema, 'params'), ctrl.getDepartmentById);
router.post('/departments', authorize('department.create'), validate(createDepartmentSchema), ctrl.createDepartment);
router.patch('/departments/:id', authorize('department.update'), validate(idParamSchema, 'params'), validate(updateDepartmentSchema), ctrl.updateDepartment);
router.delete('/departments/:id', authorize('department.delete'), validate(idParamSchema, 'params'), ctrl.deleteDepartment);
router.post('/departments/:id/restore', authenticate, authorize('department.update'), validate(idParamSchema, 'params'), ctrl.restoreDepartment);

// ============================================================================
// BRANCH DEPARTMENTS ROUTES
// ============================================================================

router.get('/branch-departments', authorize('branch_department.read'), validate(branchDepartmentListQuerySchema, 'query'), ctrl.getBranchDepartments);
router.get('/branch-departments/:id', authorize('branch_department.read'), validate(idParamSchema, 'params'), ctrl.getBranchDepartmentById);
router.post('/branch-departments', authorize('branch_department.create'), validate(createBranchDepartmentSchema), ctrl.createBranchDepartment);
router.patch('/branch-departments/:id', authorize('branch_department.update'), validate(idParamSchema, 'params'), validate(updateBranchDepartmentSchema), ctrl.updateBranchDepartment);
router.delete('/branch-departments/:id', authorize('branch_department.delete'), validate(idParamSchema, 'params'), ctrl.deleteBranchDepartment);

module.exports = router;
