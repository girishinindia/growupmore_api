const { Router } = require('express');
const ctrl = require('../controllers/certificateManagement.controller');
const validate = require('../../../middleware/validate.middleware');
const authenticate = require('../../../middleware/auth.middleware');
const { authorize } = require('../../../middleware/authorize.middleware');

const {
  idParamSchema,
  templateIdParamSchema,
  restoreSchema,
  bulkIdsSchema,
  createCertificateTemplateSchema,
  updateCertificateTemplateSchema,
  certificateTemplateListQuerySchema,
  createTemplateTranslationSchema,
  updateTemplateTranslationSchema,
  createCertificateSchema,
  updateCertificateSchema,
  certificateListQuerySchema,
} = require('../validators/certificateManagement.validator');

const router = Router();
router.use(authenticate);

// ============================================================================
// CERTIFICATE TEMPLATES (permission: certificate_template.*)
// ============================================================================

router.get(
  '/certificate-templates',
  authorize('certificate_template.read'),
  validate(certificateTemplateListQuerySchema, 'query'),
  ctrl.getCertificateTemplates
);

router.post(
  '/certificate-templates',
  authorize('certificate_template.create'),
  validate(createCertificateTemplateSchema),
  ctrl.createCertificateTemplate
);

router.get(
  '/certificate-templates/:id',
  authorize('certificate_template.read'),
  validate(idParamSchema, 'params'),
  ctrl.getCertificateTemplateById
);

router.patch(
  '/certificate-templates/:id',
  authorize('certificate_template.update'),
  validate(idParamSchema, 'params'),
  validate(updateCertificateTemplateSchema),
  ctrl.updateCertificateTemplate
);

router.delete(
  '/certificate-templates/:id',
  authorize('certificate_template.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteCertificateTemplate
);

router.post(
  '/certificate-templates/:id/restore',
  authorize('certificate_template.update'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreCertificateTemplate
);

// ============================================================================
// CERTIFICATE TEMPLATE TRANSLATIONS (permission: certificate_template_translation.*)
// ============================================================================

router.post(
  '/certificate-templates/:templateId/translations',
  authorize('certificate_template_translation.create'),
  validate(templateIdParamSchema, 'params'),
  validate(createTemplateTranslationSchema),
  ctrl.createTemplateTranslation
);

router.patch(
  '/template-translations/:id',
  authorize('certificate_template_translation.update'),
  validate(idParamSchema, 'params'),
  validate(updateTemplateTranslationSchema),
  ctrl.updateTemplateTranslation
);

router.delete(
  '/template-translations/:id',
  authorize('certificate_template_translation.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteTemplateTranslation
);

router.post(
  '/template-translations/:id/restore',
  authorize('certificate_template_translation.update'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreTemplateTranslation
);

// ============================================================================
// CERTIFICATES (permission: certificate.*)
// ============================================================================

router.get(
  '/certificates',
  authorize('certificate.read'),
  validate(certificateListQuerySchema, 'query'),
  ctrl.getCertificates
);

router.post(
  '/certificates/bulk-delete',
  authorize('certificate.delete'),
  validate(bulkIdsSchema),
  ctrl.bulkDeleteCertificates
);

router.post(
  '/certificates/bulk-restore',
  authorize('certificate.update'),
  validate(bulkIdsSchema),
  ctrl.bulkRestoreCertificates
);

router.get(
  '/certificates/:id',
  authorize('certificate.read'),
  validate(idParamSchema, 'params'),
  ctrl.getCertificateById
);

router.post(
  '/certificates',
  authorize('certificate.create'),
  validate(createCertificateSchema),
  ctrl.createCertificate
);

router.patch(
  '/certificates/:id',
  authorize('certificate.update'),
  validate(idParamSchema, 'params'),
  validate(updateCertificateSchema),
  ctrl.updateCertificate
);

router.delete(
  '/certificates/:id',
  authorize('certificate.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteCertificate
);

router.post(
  '/certificates/:id/restore',
  authorize('certificate.update'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreCertificate
);

module.exports = router;
