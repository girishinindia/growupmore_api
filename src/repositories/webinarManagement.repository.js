/**
 * ═══════════════════════════════════════════════════════════════
 * WEBINAR MANAGEMENT REPOSITORY — Database Layer (Supabase RPC)
 * ═══════════════════════════════════════════════════════════════
 * Handles Webinars via:
 *
 *   WEBINARS:
 *   - udf_get_webinars           — read, search, filter, paginate
 *   - sp_webinars_insert         — create, returns new id (BIGINT)
 *   - sp_webinars_update         — update, returns void
 *   - sp_webinars_delete         — soft delete, returns void
 *   - sp_webinars_restore        — restore, returns void
 * ═══════════════════════════════════════════════════════════════
 */

const { supabase } = require('../config/database');
const logger = require('../config/logger');

class WebinarManagementRepository {
  // ─────────────────────────────────────────────────────────────
  //  WEBINARS — READ
  // ─────────────────────────────────────────────────────────────

  async findWebinarById(webinarId) {
    const { data, error } = await supabase.rpc('udf_get_webinars', {
      p_id: webinarId,
      p_webinar_id: null,
      p_language_id: null,
      p_is_active: null,
      p_filter_webinar_owner: null,
      p_filter_webinar_status: null,
      p_filter_meeting_platform: null,
      p_filter_is_free: null,
      p_filter_course_id: null,
      p_filter_chapter_id: null,
      p_filter_instructor_id: null,
      p_filter_is_deleted: false,
      p_search_query: null,
      p_sort_column: 'webinar_scheduled_at',
      p_sort_direction: 'DESC',
      p_limit: 1,
      p_offset: 0,
    });

    if (error) {
      logger.error({ error }, 'WebinarManagementRepository.findWebinarById failed');
      throw error;
    }

    return data && data.length > 0 ? data[0] : null;
  }

  async getWebinars(options = {}) {
    const { data, error } = await supabase.rpc('udf_get_webinars', {
      p_id: null,
      p_webinar_id: options.webinarId || null,
      p_language_id: options.languageId || null,
      p_is_active: options.isActive !== undefined ? options.isActive : null,
      p_filter_webinar_owner: options.filterWebinarOwner || null,
      p_filter_webinar_status: options.filterWebinarStatus || null,
      p_filter_meeting_platform: options.filterMeetingPlatform || null,
      p_filter_is_free: options.filterIsFree !== undefined ? options.filterIsFree : null,
      p_filter_course_id: options.filterCourseId || null,
      p_filter_chapter_id: options.filterChapterId || null,
      p_filter_instructor_id: options.filterInstructorId || null,
      p_filter_is_deleted: options.filterIsDeleted !== undefined ? options.filterIsDeleted : false,
      p_search_query: options.searchQuery || null,
      p_sort_column: options.sortColumn || 'webinar_scheduled_at',
      p_sort_direction: options.sortDirection || 'DESC',
      p_limit: options.limit || 20,
      p_offset: options.offset || 0,
    });

    if (error) {
      logger.error({ error }, 'WebinarManagementRepository.getWebinars failed');
      throw error;
    }

    return data || [];
  }

  // ─────────────────────────────────────────────────────────────
  //  WEBINARS — WRITE
  // ─────────────────────────────────────────────────────────────

  async createWebinar(webinarData) {
    const { data, error } = await supabase.rpc('sp_webinars_insert', {
      p_webinar_owner: webinarData.webinarOwner || 'system',
      p_instructor_id: webinarData.instructorId || null,
      p_course_id: webinarData.courseId || null,
      p_chapter_id: webinarData.chapterId || null,
      p_code: webinarData.code || null,
      p_slug: webinarData.slug || null,
      p_is_free: webinarData.isFree !== undefined ? webinarData.isFree : false,
      p_price: webinarData.price || 0.00,
      p_scheduled_at: webinarData.scheduledAt || null,
      p_duration_minutes: webinarData.durationMinutes || null,
      p_max_attendees: webinarData.maxAttendees || null,
      p_registered_count: webinarData.registeredCount || 0,
      p_meeting_platform: webinarData.meetingPlatform || 'zoom',
      p_meeting_url: webinarData.meetingUrl || null,
      p_meeting_id: webinarData.meetingId || null,
      p_meeting_password: webinarData.meetingPassword || null,
      p_recording_url: webinarData.recordingUrl || null,
      p_webinar_status: webinarData.webinarStatus || 'scheduled',
      p_display_order: webinarData.displayOrder || 0,
      p_created_by: webinarData.createdBy || null,
      p_updated_by: webinarData.updatedBy || null,
      p_is_active: webinarData.isActive !== undefined ? webinarData.isActive : true,
    });

    if (error) {
      logger.error({ error }, 'WebinarManagementRepository.createWebinar failed');
      throw error;
    }

    const newId = data;
    return this.findWebinarById(newId);
  }

  async updateWebinar(webinarId, updates) {
    const { error } = await supabase.rpc('sp_webinars_update', {
      p_webinar_id: webinarId,
      p_instructor_id: updates.instructorId !== undefined ? updates.instructorId : null,
      p_course_id: updates.courseId !== undefined ? updates.courseId : null,
      p_chapter_id: updates.chapterId !== undefined ? updates.chapterId : null,
      p_code: updates.code !== undefined ? updates.code : null,
      p_slug: updates.slug !== undefined ? updates.slug : null,
      p_is_free: updates.isFree !== undefined ? updates.isFree : null,
      p_price: updates.price !== undefined ? updates.price : null,
      p_scheduled_at: updates.scheduledAt !== undefined ? updates.scheduledAt : null,
      p_duration_minutes: updates.durationMinutes !== undefined ? updates.durationMinutes : null,
      p_max_attendees: updates.maxAttendees !== undefined ? updates.maxAttendees : null,
      p_registered_count: updates.registeredCount !== undefined ? updates.registeredCount : null,
      p_meeting_platform: updates.meetingPlatform !== undefined ? updates.meetingPlatform : null,
      p_meeting_url: updates.meetingUrl !== undefined ? updates.meetingUrl : null,
      p_meeting_id: updates.meetingId !== undefined ? updates.meetingId : null,
      p_meeting_password: updates.meetingPassword !== undefined ? updates.meetingPassword : null,
      p_recording_url: updates.recordingUrl !== undefined ? updates.recordingUrl : null,
      p_webinar_status: updates.webinarStatus !== undefined ? updates.webinarStatus : null,
      p_display_order: updates.displayOrder !== undefined ? updates.displayOrder : null,
      p_updated_by: updates.updatedBy || null,
      p_is_active: updates.isActive !== undefined ? updates.isActive : null,
    });

    if (error) {
      logger.error({ error }, 'WebinarManagementRepository.updateWebinar failed');
      throw error;
    }

    return this.findWebinarById(webinarId);
  }

  async deleteWebinar(webinarId) {
    const { error } = await supabase.rpc('sp_webinars_delete', {
      p_webinar_id: webinarId,
    });

    if (error) {
      logger.error({ error }, 'WebinarManagementRepository.deleteWebinar failed');
      throw error;
    }
  }

  async restoreWebinar(webinarId) {
    const { error } = await supabase.rpc('sp_webinars_restore', {
      p_webinar_id: webinarId,
    });

    if (error) {
      logger.error({ error }, 'WebinarManagementRepository.restoreWebinar failed');
      throw error;
    }
  }
}

module.exports = new WebinarManagementRepository();
