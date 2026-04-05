const { Router } = require('express');
const rbacController = require('../controllers/rbac.controller');
const validate = require('../../../middleware/validate.middleware');
const authenticate = require('../../../middleware/auth.middleware');
const { authorize, authorizeAny, authorizeRole } = require('../../../middleware/authorize.middleware');

const {
  createRoleSchema,
  updateRoleSchema,
  assignPermissionSchema,
  bulkAssignPermissionsSchema,
  assignRoleToUserSchema,
  updateAssignmentSchema,
  idParamSchema,
  roleIdParamSchema,
  roleListQuerySchema,
  permissionListQuerySchema,
  rolePermissionListQuerySchema,
  assignmentListQuerySchema,
  listQuerySchema,
  restoreRoleSchema,
} = require('../validators/rbac.validator');

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// ============================================================================
// ROLES ROUTES
// ============================================================================

router.get('/roles', authorize('role.read'), validate(roleListQuerySchema, 'query'), rbacController.getRoles);
router.get('/roles/:id', authorize('role.read'), validate(idParamSchema, 'params'), rbacController.getRoleById);
router.post('/roles', authorize('role.create'), validate(createRoleSchema), rbacController.createRole);
router.patch('/roles/:id', authorize('role.update'), validate(idParamSchema, 'params'), validate(updateRoleSchema), rbacController.updateRole);
router.delete('/roles/:id', authorize('role.delete'), validate(idParamSchema, 'params'), rbacController.deleteRole);
router.post('/roles/:id/restore', authorize('role.update'), validate(idParamSchema, 'params'), validate(restoreRoleSchema), rbacController.restoreRole);

// ============================================================================
// ROLE PERMISSIONS ROUTES
// ============================================================================

router.get('/roles/:roleId/permissions', authorize('permission.manage'), validate(roleIdParamSchema, 'params'), validate(rolePermissionListQuerySchema, 'query'), rbacController.getRolePermissions);
router.post('/roles/:roleId/permissions', authorize('permission.manage'), validate(roleIdParamSchema, 'params'), validate(assignPermissionSchema), rbacController.assignPermission);
router.post('/roles/:roleId/permissions/bulk', authorize('permission.manage'), validate(roleIdParamSchema, 'params'), validate(bulkAssignPermissionsSchema), rbacController.bulkAssignPermissions);
router.delete('/roles/:roleId/permissions/:permissionId', authorize('permission.manage'), rbacController.removePermission);
router.delete('/roles/:roleId/permissions', authorize('permission.manage'), validate(roleIdParamSchema, 'params'), rbacController.removeAllPermissions);

// ============================================================================
// USER ROLE ASSIGNMENTS ROUTES
// ============================================================================

router.get('/user-role-assignments', authorize('role.assign'), validate(assignmentListQuerySchema, 'query'), rbacController.getUserRoleAssignments);
router.post('/user-role-assignments', authorize('role.assign'), validate(assignRoleToUserSchema), rbacController.assignRoleToUser);
router.patch('/user-role-assignments/:id', authorize('role.assign'), validate(idParamSchema, 'params'), validate(updateAssignmentSchema), rbacController.updateAssignment);
router.delete('/user-role-assignments/:id', authorize('role.assign'), validate(idParamSchema, 'params'), rbacController.revokeAssignment);
router.post('/user-role-assignments/:id/restore', authorize('role.assign'), validate(idParamSchema, 'params'), rbacController.restoreAssignment);

// ============================================================================
// PERMISSIONS ROUTES (READ-ONLY)
// ============================================================================

router.get('/permissions', authorize('permission.manage'), validate(permissionListQuerySchema, 'query'), rbacController.getPermissions);
router.get('/permissions/:id', authorize('permission.manage'), validate(idParamSchema, 'params'), rbacController.getPermissionById);

// ============================================================================
// MODULES ROUTES (READ-ONLY)
// ============================================================================

router.get('/modules', authorize('role.read'), validate(listQuerySchema, 'query'), rbacController.getModules);

// ============================================================================
// USER PERMISSIONS ROUTES
// ============================================================================

router.get('/my-permissions', rbacController.getMyPermissions);
router.get('/users/:userId/permissions', authorize('role.read'), rbacController.getUserPermissions);

module.exports = router;
