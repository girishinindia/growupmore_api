/**
 * ═══════════════════════════════════════════════════════════════
 * PERMISSIONS & MODULES ROUTES
 * ═══════════════════════════════════════════════════════════════
 *
 * Permissions:
 *   GET    /                — List permissions (paginated)
 *   GET    /:id             — Get permission by ID
 *   POST   /                — Create permission
 *   PUT    /:id             — Update permission
 *   DELETE /:id             — Delete permission
 *
 * Modules:
 *   GET    /modules         — List modules (paginated)
 *   GET    /modules/:id     — Get module by ID
 *   POST   /modules         — Create module
 *   PUT    /modules/:id     — Update module
 *   DELETE /modules/:id     — Delete module
 *
 * ═══════════════════════════════════════════════════════════════
 */

const { Router } = require('express');
const { asyncHandler } = require('../../../utils/helpers');
const { auth } = require('../../../middleware/auth.middleware');
const { requirePermission } = require('../../../middleware/permission.middleware');
const validate = require('../../../middleware/validate.middleware');
const pagination = require('../../../middleware/pagination.middleware');
const controller = require('../controllers/permissions.controller');
const {
  createPermissionSchema,
  updatePermissionSchema,
  createModuleSchema,
  updateModuleSchema,
} = require('../validators/permissions.validator');

const router = Router();

// ─── Permissions CRUD ────────────────────────────────────

router.get(
  '/',
  auth,
  pagination,
  asyncHandler(controller.listPermissions)
);

router.get(
  '/:id',
  auth,
  asyncHandler(controller.getPermissionById)
);

router.post(
  '/',
  auth,
  requirePermission('permissions.create'),
  validate(createPermissionSchema),
  asyncHandler(controller.createPermission)
);

router.put(
  '/:id',
  auth,
  requirePermission('permissions.update'),
  validate(updatePermissionSchema),
  asyncHandler(controller.updatePermission)
);

router.delete(
  '/:id',
  auth,
  requirePermission('permissions.delete'),
  asyncHandler(controller.deletePermission)
);

// ─── Modules CRUD ────────────────────────────────────────

router.get(
  '/modules',
  auth,
  pagination,
  asyncHandler(controller.listModules)
);

router.get(
  '/modules/:id',
  auth,
  asyncHandler(controller.getModuleById)
);

router.post(
  '/modules',
  auth,
  requirePermission('permissions.create'),
  validate(createModuleSchema),
  asyncHandler(controller.createModule)
);

router.put(
  '/modules/:id',
  auth,
  requirePermission('permissions.update'),
  validate(updateModuleSchema),
  asyncHandler(controller.updateModule)
);

router.delete(
  '/modules/:id',
  auth,
  requirePermission('permissions.delete'),
  asyncHandler(controller.deleteModule)
);

module.exports = router;
