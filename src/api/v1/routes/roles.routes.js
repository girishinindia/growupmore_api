/**
 * ═══════════════════════════════════════════════════════════════
 * ROLES ROUTES — Roles, Role-Permissions, User-Role-Assignments
 * ═══════════════════════════════════════════════════════════════
 *
 * Roles CRUD:
 *   GET    /                — List roles (paginated)
 *   GET    /:id             — Get role by ID
 *   POST   /                — Create role
 *   PUT    /:id             — Update role
 *   DELETE /:id             — Soft-delete role
 *   POST   /:id/restore     — Restore role
 *
 * Role Permissions:
 *   GET    /permissions/list         — List role-permission mappings
 *   POST   /permissions/assign       — Assign single permission to role
 *   POST   /permissions/bulk-assign  — Assign multiple permissions to role
 *   POST   /permissions/remove       — Remove permission from role
 *
 * User Role Assignments:
 *   GET    /user-assignments/list    — List user-role assignments
 *   POST   /user-assignments/assign  — Assign role to user
 *   DELETE /user-assignments/:id     — Revoke user-role assignment
 *   POST   /user-assignments/:id/restore — Restore user-role assignment
 *
 * ═══════════════════════════════════════════════════════════════
 */

const { Router } = require('express');
const { asyncHandler } = require('../../../utils/helpers');
const { auth } = require('../../../middleware/auth.middleware');
const { requirePermission } = require('../../../middleware/permission.middleware');
const validate = require('../../../middleware/validate.middleware');
const pagination = require('../../../middleware/pagination.middleware');
const controller = require('../controllers/roles.controller');
const {
  createRoleSchema,
  updateRoleSchema,
  assignPermissionSchema,
  bulkAssignPermissionsSchema,
  removePermissionSchema,
  assignRoleToUserSchema,
} = require('../validators/roles.validator');

const router = Router();

// ─── Roles CRUD ──────────────────────────────────────────

router.get(
  '/',
  auth,
  pagination,
  asyncHandler(controller.listRoles)
);

router.get(
  '/:id',
  auth,
  asyncHandler(controller.getRoleById)
);

router.post(
  '/',
  auth,
  requirePermission('roles.create'),
  validate(createRoleSchema),
  asyncHandler(controller.createRole)
);

router.put(
  '/:id',
  auth,
  requirePermission('roles.update'),
  validate(updateRoleSchema),
  asyncHandler(controller.updateRole)
);

router.delete(
  '/:id',
  auth,
  requirePermission('roles.delete'),
  asyncHandler(controller.deleteRole)
);

router.post(
  '/:id/restore',
  auth,
  requirePermission('roles.restore'),
  asyncHandler(controller.restoreRole)
);

// ─── Role Permissions ────────────────────────────────────

router.get(
  '/permissions/list',
  auth,
  pagination,
  asyncHandler(controller.listRolePermissions)
);

router.post(
  '/permissions/assign',
  auth,
  requirePermission('roles.manage'),
  validate(assignPermissionSchema),
  asyncHandler(controller.assignPermission)
);

router.post(
  '/permissions/bulk-assign',
  auth,
  requirePermission('roles.manage'),
  validate(bulkAssignPermissionsSchema),
  asyncHandler(controller.bulkAssignPermissions)
);

router.post(
  '/permissions/remove',
  auth,
  requirePermission('roles.manage'),
  validate(removePermissionSchema),
  asyncHandler(controller.removePermission)
);

// ─── User Role Assignments ───────────────────────────────

router.get(
  '/user-assignments/list',
  auth,
  pagination,
  asyncHandler(controller.listUserRoleAssignments)
);

router.post(
  '/user-assignments/assign',
  auth,
  requirePermission('roles.assign'),
  validate(assignRoleToUserSchema),
  asyncHandler(controller.assignRoleToUser)
);

router.delete(
  '/user-assignments/:id',
  auth,
  requirePermission('roles.assign'),
  asyncHandler(controller.revokeUserRole)
);

router.post(
  '/user-assignments/:id/restore',
  auth,
  requirePermission('roles.assign'),
  asyncHandler(controller.restoreUserRole)
);

module.exports = router;
