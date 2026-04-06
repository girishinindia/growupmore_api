const express = require('express');
const validate = require('../../../middleware/validate.middleware');
const authenticate = require('../../../middleware/auth.middleware');
const { authorize } = require('../../../middleware/authorize.middleware');
const enrollmentManagementController = require('../controllers/enrollmentManagement.controller');
const {
  getEnrollmentsSchema,
  createEnrollmentSchema,
  updateEnrollmentSchema,
  deleteEnrollmentSchema,
  bulkDeleteEnrollmentsSchema,
  bulkRestoreEnrollmentsSchema,
  getBatchEnrollmentsSchema,
  createBatchEnrollmentSchema,
  updateBatchEnrollmentSchema,
  deleteBatchEnrollmentSchema,
  bulkDeleteBatchEnrollmentsSchema,
  bulkRestoreBatchEnrollmentsSchema,
  getWebinarRegistrationsSchema,
  createWebinarRegistrationSchema,
  updateWebinarRegistrationSchema,
  deleteWebinarRegistrationSchema,
  bulkDeleteWebinarRegistrationsSchema,
  bulkRestoreWebinarRegistrationsSchema,
} = require('../validators/enrollmentManagement.validator');

const router = express.Router();

router.use(authenticate);

// ENROLLMENTS ROUTES
router.get(
  '/enrollments',
  validate(getEnrollmentsSchema),
  authorize('enrollment.read'),
  enrollmentManagementController.getEnrollments.bind(enrollmentManagementController)
);

router.post(
  '/enrollments',
  validate(createEnrollmentSchema),
  authorize('enrollment.create'),
  enrollmentManagementController.createEnrollment.bind(enrollmentManagementController)
);

router.post(
  '/enrollments/bulk-delete',
  validate(bulkDeleteEnrollmentsSchema),
  authorize('enrollment.delete'),
  enrollmentManagementController.bulkDeleteEnrollments.bind(enrollmentManagementController)
);

router.post(
  '/enrollments/bulk-restore',
  validate(bulkRestoreEnrollmentsSchema),
  authorize('enrollment.delete'),
  enrollmentManagementController.bulkRestoreEnrollments.bind(enrollmentManagementController)
);

router.patch(
  '/enrollments/:id',
  validate(updateEnrollmentSchema),
  authorize('enrollment.update'),
  enrollmentManagementController.updateEnrollment.bind(enrollmentManagementController)
);

router.delete(
  '/enrollments/:id',
  validate(deleteEnrollmentSchema),
  authorize('enrollment.delete'),
  enrollmentManagementController.deleteEnrollment.bind(enrollmentManagementController)
);

router.post(
  '/enrollments/:id/restore',
  validate(deleteEnrollmentSchema),
  authorize('enrollment.delete'),
  enrollmentManagementController.restoreEnrollment.bind(enrollmentManagementController)
);

// BATCH ENROLLMENTS ROUTES
router.get(
  '/batch-enrollments',
  validate(getBatchEnrollmentsSchema),
  authorize('batch_enrollment.read'),
  enrollmentManagementController.getBatchEnrollments.bind(enrollmentManagementController)
);

router.post(
  '/batch-enrollments',
  validate(createBatchEnrollmentSchema),
  authorize('batch_enrollment.create'),
  enrollmentManagementController.createBatchEnrollment.bind(enrollmentManagementController)
);

router.post(
  '/batch-enrollments/bulk-delete',
  validate(bulkDeleteBatchEnrollmentsSchema),
  authorize('batch_enrollment.delete'),
  enrollmentManagementController.bulkDeleteBatchEnrollments.bind(enrollmentManagementController)
);

router.post(
  '/batch-enrollments/bulk-restore',
  validate(bulkRestoreBatchEnrollmentsSchema),
  authorize('batch_enrollment.delete'),
  enrollmentManagementController.bulkRestoreBatchEnrollments.bind(enrollmentManagementController)
);

router.patch(
  '/batch-enrollments/:id',
  validate(updateBatchEnrollmentSchema),
  authorize('batch_enrollment.update'),
  enrollmentManagementController.updateBatchEnrollment.bind(enrollmentManagementController)
);

router.delete(
  '/batch-enrollments/:id',
  validate(deleteBatchEnrollmentSchema),
  authorize('batch_enrollment.delete'),
  enrollmentManagementController.deleteBatchEnrollment.bind(enrollmentManagementController)
);

router.post(
  '/batch-enrollments/:id/restore',
  validate(deleteBatchEnrollmentSchema),
  authorize('batch_enrollment.delete'),
  enrollmentManagementController.restoreBatchEnrollment.bind(enrollmentManagementController)
);

// WEBINAR REGISTRATIONS ROUTES
router.get(
  '/webinar-registrations',
  validate(getWebinarRegistrationsSchema),
  authorize('webinar_registration.read'),
  enrollmentManagementController.getWebinarRegistrations.bind(enrollmentManagementController)
);

router.post(
  '/webinar-registrations',
  validate(createWebinarRegistrationSchema),
  authorize('webinar_registration.create'),
  enrollmentManagementController.createWebinarRegistration.bind(enrollmentManagementController)
);

router.post(
  '/webinar-registrations/bulk-delete',
  validate(bulkDeleteWebinarRegistrationsSchema),
  authorize('webinar_registration.delete'),
  enrollmentManagementController.bulkDeleteWebinarRegistrations.bind(enrollmentManagementController)
);

router.post(
  '/webinar-registrations/bulk-restore',
  validate(bulkRestoreWebinarRegistrationsSchema),
  authorize('webinar_registration.delete'),
  enrollmentManagementController.bulkRestoreWebinarRegistrations.bind(enrollmentManagementController)
);

router.patch(
  '/webinar-registrations/:id',
  validate(updateWebinarRegistrationSchema),
  authorize('webinar_registration.update'),
  enrollmentManagementController.updateWebinarRegistration.bind(enrollmentManagementController)
);

router.delete(
  '/webinar-registrations/:id',
  validate(deleteWebinarRegistrationSchema),
  authorize('webinar_registration.delete'),
  enrollmentManagementController.deleteWebinarRegistration.bind(enrollmentManagementController)
);

router.post(
  '/webinar-registrations/:id/restore',
  validate(deleteWebinarRegistrationSchema),
  authorize('webinar_registration.delete'),
  enrollmentManagementController.restoreWebinarRegistration.bind(enrollmentManagementController)
);

module.exports = router;
