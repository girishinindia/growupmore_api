const { Router } = require('express');
const ctrl = require('../controllers/specialSessionManagement.controller');
const validate = require('../../../middleware/validate.middleware');
const authenticate = require('../../../middleware/auth.middleware');
const { authorize } = require('../../../middleware/authorize.middleware');

// Import validator schemas
const {
  idParamSchema,
  sessionRequestIdParamSchema,
  scheduledSessionIdParamSchema,
  restoreSchema,
  bulkIdsSchema,
  createSessionRequestSchema,
  updateSessionRequestSchema,
  sessionRequestListQuerySchema,
  createSessionRequestTranslationSchema,
  updateSessionRequestTranslationSchema,
  createScheduledSessionSchema,
  updateScheduledSessionSchema,
  scheduledSessionListQuerySchema,
  createScheduledSessionTranslationSchema,
  updateScheduledSessionTranslationSchema,
} = require('../validators/specialSessionManagement.validator');

const router = Router();
router.use(authenticate);

// ============================================================================
// SESSION REQUESTS (permission: session_request.*)
// ============================================================================

/**
 * GET /special-sessions/session-requests
 * Retrieves list of session requests with filtering and pagination
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {number} studentId - Filter by student ID
 * @query {number} instructorId - Filter by instructor ID
 * @query {number} courseId - Filter by course ID
 * @query {string} requestType - Filter by type
 * @query {string} requestStatus - Filter by status
 * @query {boolean} isActive - Filter by active status
 * @query {string} searchTerm - Search term
 * @query {string} sortBy - Sort column (default: created_at)
 * @query {string} sortDir - Sort direction (ASC or DESC, default: DESC)
 */
router.get(
  '/session-requests',
  authorize('session_request.read'),
  validate(sessionRequestListQuerySchema, 'query'),
  ctrl.getSessionRequests,
);

/**
 * GET /special-sessions/session-requests/json
 * Retrieves hierarchical JSON structure with session requests
 * @query {number} courseId - Filter by course ID (optional)
 */
router.get(
  '/session-requests/json',
  authorize('session_request.read'),
  ctrl.getSessionRequestsJSON,
);

/**
 * POST /special-sessions/session-requests/bulk-delete
 * Soft deletes multiple session requests in bulk
 * @body {Array<number>} ids - Array of session request IDs to delete
 */
router.post(
  '/session-requests/bulk-delete',
  authorize('session_request.delete'),
  validate(bulkIdsSchema),
  ctrl.bulkDeleteSessionRequests,
);

/**
 * POST /special-sessions/session-requests/bulk-restore
 * Restores multiple deleted session requests in bulk
 * @body {Array<number>} ids - Array of session request IDs to restore
 */
router.post(
  '/session-requests/bulk-restore',
  authorize('session_request.delete'),
  validate(bulkIdsSchema),
  ctrl.bulkRestoreSessionRequests,
);

/**
 * GET /special-sessions/session-requests/:id
 * Retrieves a single session request by ID
 * @param {number} id - Session request ID
 */
router.get(
  '/session-requests/:id',
  authorize('session_request.read'),
  validate(idParamSchema, 'params'),
  ctrl.getSessionRequestById,
);

/**
 * POST /special-sessions/session-requests
 * Creates a new session request
 * @body {number} studentId - Student ID (required)
 * @body {number} instructorId - Instructor ID (optional)
 * @body {number} courseId - Course ID (optional)
 * @body {string} requestType - Type: one_on_one, group, doubt_clearing, mentoring, career_guidance (optional)
 * @body {string} preferredDate - Preferred date (optional)
 * @body {string} preferredTimeSlot - Preferred time slot (optional)
 * @body {number} durationMinutes - Duration in minutes (optional, default: 60)
 * @body {boolean} isFree - Is free flag (optional, default: false)
 * @body {number} price - Price (optional, default: 0.00)
 */
router.post(
  '/session-requests',
  authorize('session_request.create'),
  validate(createSessionRequestSchema),
  ctrl.createSessionRequest,
);

/**
 * PATCH /special-sessions/session-requests/:id
 * Updates an existing session request
 * @param {number} id - Session request ID
 * @body {number} instructorId - Instructor ID (optional)
 * @body {number} courseId - Course ID (optional)
 * @body {string} requestType - Type (optional)
 * @body {string} preferredDate - Preferred date (optional)
 * @body {string} preferredTimeSlot - Preferred time slot (optional)
 * @body {number} durationMinutes - Duration in minutes (optional)
 * @body {boolean} isFree - Is free flag (optional)
 * @body {number} price - Price (optional)
 * @body {string} requestStatus - Status (optional)
 * @body {string} rejectionReason - Rejection reason (optional)
 */
router.patch(
  '/session-requests/:id',
  authorize('session_request.update'),
  validate(idParamSchema, 'params'),
  validate(updateSessionRequestSchema),
  ctrl.updateSessionRequest,
);

/**
 * DELETE /special-sessions/session-requests/:id
 * Soft deletes a single session request
 * @param {number} id - Session request ID
 */
router.delete(
  '/session-requests/:id',
  authorize('session_request.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteSessionRequest,
);

/**
 * POST /special-sessions/session-requests/:id/restore
 * Restores a single deleted session request
 * @param {number} id - Session request ID
 */
router.post(
  '/session-requests/:id/restore',
  authorize('session_request.delete'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreSessionRequest,
);

// ============================================================================
// SESSION REQUEST TRANSLATIONS (permission: session_request.*)
// ============================================================================

/**
 * POST /special-sessions/session-requests/:sessionRequestId/translations
 * Creates a translation for a session request
 * @param {number} sessionRequestId - Session request ID
 * @body {number} languageId - Language ID (required)
 * @body {string} topic - Topic (required)
 * @body {string} description - Description (optional)
 */
router.post(
  '/session-requests/:sessionRequestId/translations',
  authorize('session_request.create'),
  validate(sessionRequestIdParamSchema, 'params'),
  validate(createSessionRequestTranslationSchema),
  ctrl.createSessionRequestTranslation,
);

/**
 * PATCH /special-sessions/request-translations/:id
 * Updates a session request translation
 * @param {number} id - Translation ID
 * @body {string} topic - Topic (optional)
 * @body {string} description - Description (optional)
 */
router.patch(
  '/request-translations/:id',
  authorize('session_request.update'),
  validate(idParamSchema, 'params'),
  validate(updateSessionRequestTranslationSchema),
  ctrl.updateSessionRequestTranslation,
);

/**
 * DELETE /special-sessions/request-translations/:id
 * Soft deletes a session request translation
 * @param {number} id - Translation ID
 */
router.delete(
  '/request-translations/:id',
  authorize('session_request.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteSessionRequestTranslation,
);

/**
 * POST /special-sessions/request-translations/:id/restore
 * Restores a deleted session request translation
 * @param {number} id - Translation ID
 */
router.post(
  '/request-translations/:id/restore',
  authorize('session_request.delete'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreSessionRequestTranslation,
);

// ============================================================================
// SCHEDULED SESSIONS (permission: scheduled_session.*)
// ============================================================================

/**
 * GET /special-sessions/scheduled-sessions
 * Retrieves list of scheduled sessions with filtering and pagination
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20)
 * @query {number} studentId - Filter by student ID
 * @query {number} instructorId - Filter by instructor ID
 * @query {number} sessionRequestId - Filter by session request ID
 * @query {string} sessionStatus - Filter by status
 * @query {string} meetingPlatform - Filter by meeting platform
 * @query {boolean} isActive - Filter by active status
 * @query {string} searchTerm - Search term
 * @query {string} sortBy - Sort column (default: scheduled_at)
 * @query {string} sortDir - Sort direction (ASC or DESC, default: DESC)
 */
router.get(
  '/scheduled-sessions',
  authorize('scheduled_session.read'),
  validate(scheduledSessionListQuerySchema, 'query'),
  ctrl.getScheduledSessions,
);

/**
 * GET /special-sessions/scheduled-sessions/json
 * Retrieves hierarchical JSON structure with scheduled sessions
 * @query {number} instructorId - Filter by instructor ID (optional)
 */
router.get(
  '/scheduled-sessions/json',
  authorize('scheduled_session.read'),
  ctrl.getScheduledSessionsJSON,
);

/**
 * POST /special-sessions/scheduled-sessions/bulk-delete
 * Soft deletes multiple scheduled sessions in bulk
 * @body {Array<number>} ids - Array of scheduled session IDs to delete
 */
router.post(
  '/scheduled-sessions/bulk-delete',
  authorize('scheduled_session.delete'),
  validate(bulkIdsSchema),
  ctrl.bulkDeleteScheduledSessions,
);

/**
 * POST /special-sessions/scheduled-sessions/bulk-restore
 * Restores multiple deleted scheduled sessions in bulk
 * @body {Array<number>} ids - Array of scheduled session IDs to restore
 */
router.post(
  '/scheduled-sessions/bulk-restore',
  authorize('scheduled_session.delete'),
  validate(bulkIdsSchema),
  ctrl.bulkRestoreScheduledSessions,
);

/**
 * GET /special-sessions/scheduled-sessions/:id
 * Retrieves a single scheduled session by ID
 * @param {number} id - Scheduled session ID
 */
router.get(
  '/scheduled-sessions/:id',
  authorize('scheduled_session.read'),
  validate(idParamSchema, 'params'),
  ctrl.getScheduledSessionById,
);

/**
 * POST /special-sessions/scheduled-sessions
 * Creates a new scheduled session
 * @body {number} studentId - Student ID (required)
 * @body {number} instructorId - Instructor ID (required)
 * @body {string} scheduledAt - Scheduled at timestamp (required)
 * @body {number} sessionRequestId - Session request ID (optional)
 * @body {number} orderId - Order ID (optional)
 * @body {number} durationMinutes - Duration in minutes (optional, default: 60)
 * @body {string} meetingUrl - Meeting URL (optional)
 * @body {string} meetingPlatform - Meeting platform (optional)
 * @body {string} meetingId - Meeting ID (optional)
 * @body {string} meetingPassword - Meeting password (optional)
 */
router.post(
  '/scheduled-sessions',
  authorize('scheduled_session.create'),
  validate(createScheduledSessionSchema),
  ctrl.createScheduledSession,
);

/**
 * PATCH /special-sessions/scheduled-sessions/:id
 * Updates an existing scheduled session
 * @param {number} id - Scheduled session ID
 * @body {string} scheduledAt - Scheduled at timestamp (optional)
 * @body {number} durationMinutes - Duration in minutes (optional)
 * @body {string} endedAt - Ended at timestamp (optional)
 * @body {string} meetingUrl - Meeting URL (optional)
 * @body {string} meetingPlatform - Meeting platform (optional)
 * @body {string} meetingId - Meeting ID (optional)
 * @body {string} meetingPassword - Meeting password (optional)
 * @body {string} sessionStatus - Session status (optional)
 * @body {string} recordingUrl - Recording URL (optional)
 * @body {number} rating - Rating (optional)
 * @body {number} cancelledBy - Cancelled by user ID (optional)
 * @body {string} cancellationReason - Cancellation reason (optional)
 */
router.patch(
  '/scheduled-sessions/:id',
  authorize('scheduled_session.update'),
  validate(idParamSchema, 'params'),
  validate(updateScheduledSessionSchema),
  ctrl.updateScheduledSession,
);

/**
 * DELETE /special-sessions/scheduled-sessions/:id
 * Soft deletes a single scheduled session
 * @param {number} id - Scheduled session ID
 */
router.delete(
  '/scheduled-sessions/:id',
  authorize('scheduled_session.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteScheduledSession,
);

/**
 * POST /special-sessions/scheduled-sessions/:id/restore
 * Restores a single deleted scheduled session
 * @param {number} id - Scheduled session ID
 */
router.post(
  '/scheduled-sessions/:id/restore',
  authorize('scheduled_session.delete'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreScheduledSession,
);

// ============================================================================
// SCHEDULED SESSION TRANSLATIONS (permission: scheduled_session.*)
// ============================================================================

/**
 * POST /special-sessions/scheduled-sessions/:scheduledSessionId/translations
 * Creates a translation for a scheduled session
 * @param {number} scheduledSessionId - Scheduled session ID
 * @body {number} languageId - Language ID (required)
 * @body {string} instructorNotes - Instructor notes (optional)
 * @body {string} studentFeedback - Student feedback (optional)
 */
router.post(
  '/scheduled-sessions/:scheduledSessionId/translations',
  authorize('scheduled_session.create'),
  validate(scheduledSessionIdParamSchema, 'params'),
  validate(createScheduledSessionTranslationSchema),
  ctrl.createScheduledSessionTranslation,
);

/**
 * PATCH /special-sessions/session-translations/:id
 * Updates a scheduled session translation
 * @param {number} id - Translation ID
 * @body {string} instructorNotes - Instructor notes (optional)
 * @body {string} studentFeedback - Student feedback (optional)
 */
router.patch(
  '/session-translations/:id',
  authorize('scheduled_session.update'),
  validate(idParamSchema, 'params'),
  validate(updateScheduledSessionTranslationSchema),
  ctrl.updateScheduledSessionTranslation,
);

/**
 * DELETE /special-sessions/session-translations/:id
 * Soft deletes a scheduled session translation
 * @param {number} id - Translation ID
 */
router.delete(
  '/session-translations/:id',
  authorize('scheduled_session.delete'),
  validate(idParamSchema, 'params'),
  ctrl.deleteScheduledSessionTranslation,
);

/**
 * POST /special-sessions/session-translations/:id/restore
 * Restores a deleted scheduled session translation
 * @param {number} id - Translation ID
 */
router.post(
  '/session-translations/:id/restore',
  authorize('scheduled_session.delete'),
  validate(idParamSchema, 'params'),
  validate(restoreSchema),
  ctrl.restoreScheduledSessionTranslation,
);

module.exports = router;
