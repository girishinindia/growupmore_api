/**
 * ═══════════════════════════════════════════════════════════════
 * EDUCATION-LEVELS ROUTES
 * ═══════════════════════════════════════════════════════════════
 */

const { Router } = require('express');
const { asyncHandler } = require('../../../utils/helpers');
const { auth } = require('../../../middleware/auth.middleware');
const { requirePermission } = require('../../../middleware/permission.middleware');
const validate = require('../../../middleware/validate.middleware');
const pagination = require('../../../middleware/pagination.middleware');
const controller = require('../controllers/education-levels.controller');
const { createEducationLevelSchema, updateEducationLevelSchema } = require('../validators/education-levels.validator');

const router = Router();

router.get('/', pagination, asyncHandler(controller.list));

router.get('/:id', asyncHandler(controller.getById));

router.post(
  '/',
  auth,
  requirePermission('master_data.create'),
  validate(createEducationLevelSchema),
  asyncHandler(controller.create)
);

router.put(
  '/:id',
  auth,
  requirePermission('master_data.update'),
  validate(updateEducationLevelSchema),
  asyncHandler(controller.update)
);

router.delete(
  '/:id',
  auth,
  requirePermission('master_data.delete'),
  asyncHandler(controller.delete)
);

module.exports = router;
