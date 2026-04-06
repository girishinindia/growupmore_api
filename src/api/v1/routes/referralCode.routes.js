/**
 * ═══════════════════════════════════════════════════════════════
 * REFERRAL CODE ROUTES — Referral Codes
 * ═══════════════════════════════════════════════════════════════
 */

const { Router } = require('express');
const ctrl = require('../controllers/referralCode.controller');
const validate = require('../../../middleware/validate.middleware');
const authenticate = require('../../../middleware/auth.middleware');
const { authorize } = require('../../../middleware/authorize.middleware');

const {
  idParamSchema,
  createReferralCodeSchema,
  updateReferralCodeSchema,
  referralCodeListQuerySchema,
} = require('../validators/referralCode.validator');

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// ============================================================================
// REFERRAL CODES ROUTES
// ============================================================================

router.get('/', authorize('referral_code.read'), validate(referralCodeListQuerySchema, 'query'), ctrl.getReferralCodes);
router.get('/:id', authorize('referral_code.read'), validate(idParamSchema, 'params'), ctrl.getReferralCodeById);
router.post('/', authorize('referral_code.create'), validate(createReferralCodeSchema), ctrl.createReferralCode);
router.patch('/:id', authorize('referral_code.update'), validate(idParamSchema, 'params'), validate(updateReferralCodeSchema), ctrl.updateReferralCode);
router.delete('/:id', authorize('referral_code.delete'), validate(idParamSchema, 'params'), ctrl.deleteReferralCode);
router.post('/:id/restore', authorize('referral_code.update'), validate(idParamSchema, 'params'), ctrl.restoreReferralCode);

module.exports = router;
