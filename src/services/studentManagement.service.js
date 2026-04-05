/**
 * ═══════════════════════════════════════════════════════════════
 * STUDENT MANAGEMENT SERVICE — Business Logic Layer
 * ═══════════════════════════════════════════════════════════════
 * Handles Student Profiles business rules.
 * ═══════════════════════════════════════════════════════════════
 */

const studentManagementRepository = require('../repositories/studentManagement.repository');
const logger = require('../config/logger');
const { BadRequestError, NotFoundError } = require('../utils/errors');
const bunnyService = require('../services/bunny.service');

const CDN_FOLDERS = {
  RESUMES: 'students/resumes',
};

class StudentManagementService {
  // ========== STUDENT PROFILES ==========

  async getStudentProfiles(options = {}) {
    try {
      const { filters = {}, search, sort, pagination = {} } = options;

      const repoOptions = {
        filterUserId: filters.userId || null,
        filterEnrollmentType: filters.enrollmentType || null,
        filterPreferredLearningMode: filters.preferredLearningMode || null,
        filterPreferredContentType: filters.preferredContentType || null,
        filterDifficultyPreference: filters.difficultyPreference || null,
        filterSubscriptionPlan: filters.subscriptionPlan || null,
        filterHasActiveSubscription: filters.hasActiveSubscription !== undefined ? filters.hasActiveSubscription : null,
        filterIsCurrentlyStudying: filters.isCurrentlyStudying !== undefined ? filters.isCurrentlyStudying : null,
        filterIsSeekingJob: filters.isSeekingJob !== undefined ? filters.isSeekingJob : null,
        filterIsOpenToInternship: filters.isOpenToInternship !== undefined ? filters.isOpenToInternship : null,
        filterIsOpenToFreelance: filters.isOpenToFreelance !== undefined ? filters.isOpenToFreelance : null,
        filterIsActive: filters.isActive !== undefined ? filters.isActive : null,
        filterIsDeleted: filters.isDeleted !== undefined ? filters.isDeleted : false,
        filterEducationLevelId: filters.educationLevelId || null,
        filterLearningGoalId: filters.learningGoalId || null,
        filterSpecializationId: filters.specializationId || null,
        filterPreferredLearningLanguageId: filters.preferredLearningLanguageId || null,
        filterUserRole: filters.userRole || null,
        filterUserIsActive: filters.userIsActive !== undefined ? filters.userIsActive : null,
        searchTerm: search || null,
        sortTable: sort?.table || 'stu',
        sortColumn: sort?.field || 'id',
        sortDirection: sort?.direction || 'ASC',
        pageIndex: pagination.page || 1,
        pageSize: pagination.limit || 20,
      };

      return await studentManagementRepository.getStudentProfiles(repoOptions);
    } catch (error) {
      logger.error('Error fetching student profiles:', error);
      throw error;
    }
  }

  async getStudentProfileById(studentProfileId) {
    try {
      if (!studentProfileId) throw new BadRequestError('Student Profile ID is required');

      const studentProfile = await studentManagementRepository.findStudentProfileById(studentProfileId);
      if (!studentProfile) throw new NotFoundError(`Student Profile with ID ${studentProfileId} not found`);

      return studentProfile;
    } catch (error) {
      logger.error(`Error fetching student profile ${studentProfileId}:`, error);
      throw error;
    }
  }

  async createStudentProfile(studentProfileData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!studentProfileData.userId) throw new BadRequestError('User ID is required');
      if (!studentProfileData.enrollmentNumber) throw new BadRequestError('Enrollment number is required');

      const created = await studentManagementRepository.createStudentProfile(studentProfileData);
      logger.info(`Student Profile created for user ${studentProfileData.userId}`, { createdBy: actingUserId });
      return created;
    } catch (error) {
      logger.error('Error creating student profile:', error);
      throw error;
    }
  }

  async updateStudentProfile(studentProfileId, updates, actingUserId) {
    try {
      if (!studentProfileId) throw new BadRequestError('Student Profile ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await studentManagementRepository.findStudentProfileById(studentProfileId);
      if (!existing) throw new NotFoundError(`Student Profile with ID ${studentProfileId} not found`);

      const updated = await studentManagementRepository.updateStudentProfile(studentProfileId, updates);
      logger.info(`Student Profile updated: ${studentProfileId}`, { updatedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error updating student profile ${studentProfileId}:`, error);
      throw error;
    }
  }

  async deleteStudentProfile(studentProfileId, actingUserId) {
    try {
      if (!studentProfileId) throw new BadRequestError('Student Profile ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await studentManagementRepository.findStudentProfileById(studentProfileId);
      if (!existing) throw new NotFoundError(`Student Profile with ID ${studentProfileId} not found`);

      // Clean up resume from CDN if it exists
      if (existing.resume_url) {
        bunnyService.deleteFile(existing.resume_url).catch((err) => {
          logger.warn(`Failed to delete resume from CDN: ${existing.resume_url}`, { error: err });
        });
      }

      await studentManagementRepository.deleteStudentProfile(studentProfileId);
      logger.info(`Student Profile deleted: ${studentProfileId}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting student profile ${studentProfileId}:`, error);
      throw error;
    }
  }

  async handleResumeUpload(studentProfileId, file, actingUserId) {
    try {
      if (!studentProfileId) throw new BadRequestError('Student Profile ID is required');
      if (!file) throw new BadRequestError('Resume file is required');

      const existing = await studentManagementRepository.findStudentProfileById(studentProfileId);
      if (!existing) throw new NotFoundError(`Student Profile with ID ${studentProfileId} not found`);

      // Delete old resume from CDN if it exists
      if (existing.resume_url) {
        bunnyService.deleteFile(existing.resume_url).catch((err) => {
          logger.warn(`Failed to delete old resume from CDN: ${existing.resume_url}`, { error: err });
        });
      }

      // Upload new resume
      const uploadResult = await bunnyService.uploadFile(file.buffer, file.originalname, CDN_FOLDERS.RESUMES);

      // Update student profile with new resume URL
      const updates = { resumeUrl: uploadResult.cdnUrl };
      const updated = await studentManagementRepository.updateStudentProfile(studentProfileId, updates);

      logger.info(`Resume uploaded for student profile ${studentProfileId}`, { uploadedBy: actingUserId });
      return updated;
    } catch (error) {
      logger.error(`Error handling resume upload for student profile ${studentProfileId}:`, error);
      throw error;
    }
  }
}

module.exports = new StudentManagementService();
