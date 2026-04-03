/**
 * ═══════════════════════════════════════════════════════════════
 * USERS ROUTES — User Management (Admin)
 * ═══════════════════════════════════════════════════════════════
 *
 *   GET    /                — List users (paginated, filterable)
 *   GET    /:id             — Get user by ID
 *   POST   /                — Create user (admin)
 *   PUT    /:id             — Update user profile
 *   PATCH  /:id/role        — Update user role
 *   PATCH  /:id/active      — Activate/deactivate user
 *   DELETE /:id             — Soft-delete user
 *   POST   /:id/restore     — Restore soft-deleted user
 *
 * ═══════════════════════════════════════════════════════════════
 */

const { Router } = require('express');
const { asyncHandler } = require('../../../utils/helpers');
const { auth } = require('../../../middleware/auth.middleware');
const { requirePermission } = require('../../../middleware/permission.middleware');
const validate = require('../../../middleware/validate.middleware');
const pagination = require('../../../middleware/pagination.middleware');
const controller = require('../controllers/users.controller');
const {
  createUserSchema,
  updateUserSchema,
  updateUserRoleSchema,
  setActiveSchema,
} = require('../validators/users.validator');

const router = Router();

router.get(
  '/',
  auth,
  requirePermission('users.read'),
  pagination,
  asyncHandler(controller.list)
);

router.get(
  '/:id',
  auth,
  requirePermission('users.read'),
  asyncHandler(controller.getById)
);

router.post(
  '/',
  auth,
  requirePermission('users.create'),
  validate(createUserSchema),
  asyncHandler(controller.create)
);

router.put(
  '/:id',
  auth,
  requirePermission('users.update'),
  validate(updateUserSchema),
  asyncHandler(controller.update)
);

router.patch(
  '/:id/role',
  auth,
  requirePermission('users.manage'),
  validate(updateUserRoleSchema),
  asyncHandler(controller.updateRole)
);

router.patch(
  '/:id/active',
  auth,
  requirePermission('users.manage'),
  validate(setActiveSchema),
  asyncHandler(controller.setActive)
);

router.delete(
  '/:id',
  auth,
  requirePermission('users.delete'),
  asyncHandler(controller.delete)
);

router.post(
  '/:id/restore',
  auth,
  requirePermission('users.restore'),
  asyncHandler(controller.restore)
);

module.exports = router;
