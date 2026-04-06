const { Router } = require('express');
const ctrl = require('../controllers/callFollowupManagement.controller');
const validate = require('../../../middleware/validate.middleware');
const authenticate = require('../../../middleware/auth.middleware');
const { authorize } = require('../../../middleware/authorize.middleware');

// Import validator schemas
const {
  idParamSchema,
  callPurposeIdParamSchema,
  callLogIdParamSchema,
  restoreSchema,
  bulkIdsSchema,
  createCallPurposeSchema,
  updateCallPurposeSchema,
  callPurposeListQuerySchema,
  createCallPurposeTranslationSchema,
  updateCallPurposeTranslationSchema,
  createCallLogSchema,
  updateCallLogSchema,
  callLogListQuerySchema,
  createCallLogTranslationSchema,
  updateCallLogTranslationSchema,
} = require('../validators/callFollowupManagement.validator');

const router = Router();
router.use(authenticate);

// ============================================================================
// CALL PURPOSES (permission: call_purpose.*)
// ============================================================================

/**
 * GET /call-followups/call-purposes
 * Retrieves list of call purposes with filtering and pagination
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 25)
 * @query {string} search - Search term for purpose name/code
 * @query {string} sortBy - Sort column (default: display_order)
 * @query {string} sortDir - Sort direction (ASC or DESC, default: ASC)
 */
router.get(
  '/call-purposes',
  authorize('call_purpose.read'),
  validate(callPurposeListQuerySchema, 'query'),
  ctrl.getCallPurposes,
);

/**
 * GET /call-followups/call-purposes/json
 * Retrieves call purposes as JSONB
 */
router.get(
  '/call-purposes/json',
  authorize('call_purpose.read'),
  ctrl.getCallPurposesJSON,
);

/**
 * POST /call-followups/call-purposes/bulk-delete
 * Soft deletes multiple call purposes in bulk
 * @body {Array<number>} ids - Array of call purpose IDs to delete
 */
router.post(
  '/call-purposes/bulk-delete',
  authorize('call_purpose.delete'),
  validate(bulkIdsSchema),
  ctrl.bulkDeleteCallPurposes,
);

/**
 * POST /call-followups/call-purposes/bulk-restore
 * Restores multiple deleted call purposes in bulk
 * @body {Array<number>} ids - Array of call purpose IDs to restore
 */
router.post(
  '/call-purposes/bulk-restore',
  authorize('call_purpose.delete'),
  validate(bulkIdsSchema),
  ctrl.bulkRestoreCallPurposes,
);

/**
 * GET /call-followups/call-purposes/:id
 * Retrieves a single call purpose by ID
 * @param {number} id - Call purpose ID
 */
router.get(
  '/call-purposes/:id',
  authorize('call_purpose.read'),
  validate(idParamSchema, 'params'),
  ctrl.getCallPurposeById,
);

/**
 * POST /call-followups/call-purposes
 * Creates a new call purpose
 * @body {string} name - Purpose name (required)
 * @body {string} code - Purpose code (optional)
 * @body {number} displayOrder - Display order (optional, default: 0)
 */
router.post(
  '/call-purposes',
  authorize('call_purpose.create'),
  validate(createCallPurposeSchema),
  ctrl.createCallPurpose,
);

/**
 * PATCH /call-followups/call-purposes/:id
 * Updates an existing call purpose
 * @param {number} id - Call purpose ID
 * @body {string} name - Purpose name (optional)
 * @body {string} code - Purpose code (optional)
 * @body {number} displayOrder - Display order (optional)
 * @body {boolean} isActive - Active status (optional)
 */
router.patch(
  '/call-purposes/:id',
  authorize('call_purpose.update'),
  validate(idParamSchema, 'params'),
  validate(updateCallPurposeSchema),
  ctrl.updateCallPurpose,
);

/**
 * DELETE /call-followups/call-purposes/:id
 * Soft deletes a single call purpose
 * @param {number} id - Call purpose ID
 */
router.delete(
  '/call-purposes/:id',
  authorize('call_purpose.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteCallPurpose,
);

/**
 * POST /call-followups/call-purposes/:id/restore
 * Restores a single deleted call purpose
 * @param {number} id - Call purpose ID
 */
router.post(
  '/call-purposes/:id/restore',
  authorize('call_purpose.delete'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreCallPurpose,
);

// ============================================================================
// CALL PURPOSE TRANSLATIONS (permission: call_purpose.*)
// ============================================================================

/**
 * POST /call-followups/call-purposes/:callPurposeId/translations
 * Creates a new call purpose translation
 * @param {number} callPurposeId - Call purpose ID
 * @body {number} languageId - Language ID (required)
 * @body {string} name - Translation name (required)
 * @body {string} description - Translation description (optional)
 */
router.post(
  '/call-purposes/:callPurposeId/translations',
  authorize('call_purpose.create'),
  validate(callPurposeIdParamSchema, 'params'),
  validate(createCallPurposeTranslationSchema),
  ctrl.createCallPurposeTranslation,
);

/**
 * PATCH /call-followups/purpose-translations/:id
 * Updates an existing call purpose translation
 * @param {number} id - Translation ID
 * @body {string} name - Translation name (optional)
 * @body {string} description - Translation description (optional)
 */
router.patch(
  '/purpose-translations/:id',
  authorize('call_purpose.update'),
  validate(idParamSchema, 'params'),
  validate(updateCallPurposeTranslationSchema),
  ctrl.updateCallPurposeTranslation,
);

/**
 * DELETE /call-followups/purpose-translations/:id
 * Soft deletes a call purpose translation
 * @param {number} id - Translation ID
 */
router.delete(
  '/purpose-translations/:id',
  authorize('call_purpose.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteCallPurposeTranslation,
);

/**
 * POST /call-followups/purpose-translations/:id/restore
 * Restores a deleted call purpose translation
 * @param {number} id - Translation ID
 */
router.post(
  '/purpose-translations/:id/restore',
  authorize('call_purpose.delete'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreCallPurposeTranslation,
);

// ============================================================================
// CALL LOGS (permission: call_log.*)
// ============================================================================

/**
 * GET /call-followups/call-logs
 * Retrieves list of call logs with filtering and pagination
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 25)
 * @query {number} studentId - Filter by student ID
 * @query {number} calledBy - Filter by called by user ID
 * @query {number} purposeId - Filter by call purpose ID
 * @query {string} callType - Filter by call type (outbound, inbound)
 * @query {string} callStatus - Filter by call status (scheduled, attempted, connected, etc.)
 * @query {string} outcome - Filter by outcome
 * @query {string} scheduledAfter - Filter for calls scheduled after date
 * @query {string} scheduledBefore - Filter for calls scheduled before date
 * @query {string} sortBy - Sort column (default: created_at)
 * @query {string} sortDir - Sort direction (ASC or DESC, default: DESC)
 */
router.get(
  '/call-logs',
  authorize('call_log.read'),
  validate(callLogListQuerySchema, 'query'),
  ctrl.getCallLogs,
);

/**
 * GET /call-followups/call-logs/json
 * Retrieves call logs as JSONB
 * @query {number} studentId - Filter by student ID (optional)
 */
router.get(
  '/call-logs/json',
  authorize('call_log.read'),
  ctrl.getCallLogsJSON,
);

/**
 * POST /call-followups/call-logs/bulk-delete
 * Soft deletes multiple call logs in bulk
 * @body {Array<number>} ids - Array of call log IDs to delete
 */
router.post(
  '/call-logs/bulk-delete',
  authorize('call_log.delete'),
  validate(bulkIdsSchema),
  ctrl.bulkDeleteCallLogs,
);

/**
 * POST /call-followups/call-logs/bulk-restore
 * Restores multiple deleted call logs in bulk
 * @body {Array<number>} ids - Array of call log IDs to restore
 */
router.post(
  '/call-logs/bulk-restore',
  authorize('call_log.delete'),
  validate(bulkIdsSchema),
  ctrl.bulkRestoreCallLogs,
);

/**
 * GET /call-followups/call-logs/:id
 * Retrieves a single call log by ID
 * @param {number} id - Call log ID
 */
router.get(
  '/call-logs/:id',
  authorize('call_log.read'),
  validate(idParamSchema, 'params'),
  ctrl.getCallLogById,
);

/**
 * POST /call-followups/call-logs
 * Creates a new call log
 * @body {number} studentId - Student ID (required)
 * @body {number} calledBy - Called by user ID (required)
 * @body {number} purposeId - Call purpose ID (optional)
 * @body {number} previousCallId - Previous call ID (optional)
 * @body {number} followUpNumber - Follow-up number (optional, default: 1)
 * @body {string} callType - Call type: outbound or inbound (optional, default: outbound)
 * @body {string} callStatus - Call status (optional, default: scheduled)
 * @body {string} scheduledAt - Scheduled datetime (optional)
 * @body {string} calledAt - Called datetime (optional)
 * @body {number} durationSeconds - Call duration in seconds (optional)
 * @body {string} phoneNumberUsed - Phone number used (optional)
 * @body {number} courseId - Course ID (optional)
 * @body {number} batchId - Batch ID (optional)
 * @body {number} orderId - Order ID (optional)
 * @body {number} ticketId - Ticket ID (optional)
 * @body {string} outcome - Call outcome (optional)
 * @body {string} nextFollowUpDate - Next follow-up date (optional)
 * @body {string} nextAction - Next action description (optional)
 */
router.post(
  '/call-logs',
  authorize('call_log.create'),
  validate(createCallLogSchema),
  ctrl.createCallLog,
);

/**
 * PATCH /call-followups/call-logs/:id
 * Updates an existing call log
 * @param {number} id - Call log ID
 * @body {number} purposeId - Call purpose ID (optional)
 * @body {number} previousCallId - Previous call ID (optional)
 * @body {number} followUpNumber - Follow-up number (optional)
 * @body {string} callType - Call type (optional)
 * @body {string} callStatus - Call status (optional)
 * @body {string} scheduledAt - Scheduled datetime (optional)
 * @body {string} calledAt - Called datetime (optional)
 * @body {number} durationSeconds - Call duration in seconds (optional)
 * @body {string} phoneNumberUsed - Phone number used (optional)
 * @body {string} outcome - Call outcome (optional)
 * @body {string} nextFollowUpDate - Next follow-up date (optional)
 * @body {string} nextAction - Next action description (optional)
 * @body {boolean} isActive - Active status (optional)
 */
router.patch(
  '/call-logs/:id',
  authorize('call_log.update'),
  validate(idParamSchema, 'params'),
  validate(updateCallLogSchema),
  ctrl.updateCallLog,
);

/**
 * DELETE /call-followups/call-logs/:id
 * Soft deletes a single call log
 * @param {number} id - Call log ID
 */
router.delete(
  '/call-logs/:id',
  authorize('call_log.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteCallLog,
);

/**
 * POST /call-followups/call-logs/:id/restore
 * Restores a single deleted call log
 * @param {number} id - Call log ID
 */
router.post(
  '/call-logs/:id/restore',
  authorize('call_log.delete'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreCallLog,
);

// ============================================================================
// CALL LOG TRANSLATIONS (permission: call_log.*)
// ============================================================================

/**
 * POST /call-followups/call-logs/:callLogId/translations
 * Creates a new call log translation
 * @param {number} callLogId - Call log ID
 * @body {number} languageId - Language ID (required)
 * @body {string} summary - Call summary (optional)
 * @body {string} studentResponse - Student response (optional)
 * @body {string} internalNotes - Internal notes (optional)
 */
router.post(
  '/call-logs/:callLogId/translations',
  authorize('call_log.create'),
  validate(callLogIdParamSchema, 'params'),
  validate(createCallLogTranslationSchema),
  ctrl.createCallLogTranslation,
);

/**
 * PATCH /call-followups/log-translations/:id
 * Updates an existing call log translation
 * @param {number} id - Translation ID
 * @body {string} summary - Call summary (optional)
 * @body {string} studentResponse - Student response (optional)
 * @body {string} internalNotes - Internal notes (optional)
 */
router.patch(
  '/log-translations/:id',
  authorize('call_log.update'),
  validate(idParamSchema, 'params'),
  validate(updateCallLogTranslationSchema),
  ctrl.updateCallLogTranslation,
);

/**
 * DELETE /call-followups/log-translations/:id
 * Soft deletes a call log translation
 * @param {number} id - Translation ID
 */
router.delete(
  '/log-translations/:id',
  authorize('call_log.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteCallLogTranslation,
);

/**
 * POST /call-followups/log-translations/:id/restore
 * Restores a deleted call log translation
 * @param {number} id - Translation ID
 */
router.post(
  '/log-translations/:id/restore',
  authorize('call_log.delete'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreCallLogTranslation,
);

module.exports = router;
