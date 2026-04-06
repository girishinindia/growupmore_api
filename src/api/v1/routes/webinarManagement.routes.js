/**
 * ═══════════════════════════════════════════════════════════════
 * WEBINAR MANAGEMENT ROUTES — Webinars
 * ═══════════════════════════════════════════════════════════════
 */

const { Router } = require('express');
const ctrl = require('../controllers/webinarManagement.controller');
const validate = require('../../../middleware/validate.middleware');
const authenticate = require('../../../middleware/auth.middleware');
const { authorize } = require('../../../middleware/authorize.middleware');

const {
  idParamSchema,
  createWebinarSchema,
  updateWebinarSchema,
  webinarListQuerySchema,
} = require('../validators/webinarManagement.validator');

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// ============================================================================
// WEBINARS ROUTES
// ============================================================================

router.get('/webinars', authorize('webinar.read'), validate(webinarListQuerySchema, 'query'), ctrl.getWebinars);
router.get('/webinars/:id', authorize('webinar.read'), validate(idParamSchema, 'params'), ctrl.getWebinarById);
router.post('/webinars', authorize('webinar.create'), validate(createWebinarSchema), ctrl.createWebinar);
router.patch('/webinars/:id', authorize('webinar.update'), validate(idParamSchema, 'params'), validate(updateWebinarSchema), ctrl.updateWebinar);
router.delete('/webinars/:id', authorize('webinar.delete'), validate(idParamSchema, 'params'), ctrl.deleteWebinar);
router.post('/webinars/:id/restore', authorize('webinar.update'), validate(idParamSchema, 'params'), ctrl.restoreWebinar);

module.exports = router;
