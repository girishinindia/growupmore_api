/**
 * ═══════════════════════════════════════════════════════════════
 * STUDENT MANAGEMENT CONTROLLER — Student Profiles
 * ═══════════════════════════════════════════════════════════════
 */

const studentManagementService = require('../../../services/studentManagement.service');
const { sendSuccess, sendCreated } = require('../../../utils/response');

class StudentManagementController {
  // ==================== STUDENT PROFILES ====================

  async getStudentProfiles(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        sortBy = 'id',
        sortDir = 'asc',
        userId,
        enrollmentType,
        preferredLearningMode,
        difficultyPreference,
        subscriptionPlan,
        educationLevelId,
        learningGoalId,
        specializationId,
        isCurrentlyStudying,
        isSeekingJob,
        isActive,
      } = req.query;

      const filters = {};
      if (userId !== undefined) filters.userId = userId;
      if (enrollmentType !== undefined) filters.enrollmentType = enrollmentType;
      if (preferredLearningMode !== undefined) filters.preferredLearningMode = preferredLearningMode;
      if (difficultyPreference !== undefined) filters.difficultyPreference = difficultyPreference;
      if (subscriptionPlan !== undefined) filters.subscriptionPlan = subscriptionPlan;
      if (educationLevelId !== undefined) filters.educationLevelId = educationLevelId;
      if (learningGoalId !== undefined) filters.learningGoalId = learningGoalId;
      if (specializationId !== undefined) filters.specializationId = specializationId;
      if (isCurrentlyStudying !== undefined) filters.isCurrentlyStudying = isCurrentlyStudying;
      if (isSeekingJob !== undefined) filters.isSeekingJob = isSeekingJob;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await studentManagementService.getStudentProfiles({
        filters,
        search,
        sort: { field: sortBy, direction: sortDir },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, { data, message: 'Student Profiles retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getStudentProfileById(req, res, next) {
    try {
      const data = await studentManagementService.getStudentProfileById(req.params.id);
      sendSuccess(res, { data, message: 'Student Profile retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createStudentProfile(req, res, next) {
    try {
      const studentProfileData = {
        userId: req.body.userId,
        enrollmentNumber: req.body.enrollmentNumber,
        enrollmentDate: req.body.enrollmentDate || null,
        enrollmentType: req.body.enrollmentType || 'self',
        educationLevelId: req.body.educationLevelId || null,
        currentInstitution: req.body.currentInstitution || null,
        currentFieldOfStudy: req.body.currentFieldOfStudy || null,
        currentSemesterOrYear: req.body.currentSemesterOrYear || null,
        expectedGraduationDate: req.body.expectedGraduationDate || null,
        isCurrentlyStudying: req.body.isCurrentlyStudying !== undefined ? req.body.isCurrentlyStudying : false,
        learningGoalId: req.body.learningGoalId || null,
        specializationId: req.body.specializationId || null,
        preferredLearningMode: req.body.preferredLearningMode || 'self_paced',
        preferredLearningLanguageId: req.body.preferredLearningLanguageId || null,
        preferredContentType: req.body.preferredContentType || 'video',
        dailyLearningHours: req.body.dailyLearningHours || null,
        weeklyAvailableDays: req.body.weeklyAvailableDays || 5,
        difficultyPreference: req.body.difficultyPreference || 'intermediate',
        parentGuardianName: req.body.parentGuardianName || null,
        parentGuardianPhone: req.body.parentGuardianPhone || null,
        parentGuardianEmail: req.body.parentGuardianEmail || null,
        parentGuardianRelation: req.body.parentGuardianRelation || null,
        subscriptionPlan: req.body.subscriptionPlan || 'free',
        referredByUserId: req.body.referredByUserId || null,
        referralCode: req.body.referralCode || null,
        isSeekingJob: req.body.isSeekingJob !== undefined ? req.body.isSeekingJob : false,
        preferredJobRoles: req.body.preferredJobRoles || null,
        preferredLocations: req.body.preferredLocations || null,
        expectedSalaryRange: req.body.expectedSalaryRange || null,
        resumeUrl: req.body.resumeUrl || null,
        portfolioUrl: req.body.portfolioUrl || null,
        isOpenToInternship: req.body.isOpenToInternship !== undefined ? req.body.isOpenToInternship : false,
        isOpenToFreelance: req.body.isOpenToFreelance !== undefined ? req.body.isOpenToFreelance : false,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      };

      const data = await studentManagementService.createStudentProfile(studentProfileData, req.user.userId);
      sendCreated(res, { data, message: 'Student Profile created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateStudentProfile(req, res, next) {
    try {
      const updates = {};

      if (req.body.enrollmentNumber !== undefined) updates.enrollmentNumber = req.body.enrollmentNumber;
      if (req.body.enrollmentDate !== undefined) updates.enrollmentDate = req.body.enrollmentDate;
      if (req.body.enrollmentType !== undefined) updates.enrollmentType = req.body.enrollmentType;
      if (req.body.educationLevelId !== undefined) updates.educationLevelId = req.body.educationLevelId;
      if (req.body.currentInstitution !== undefined) updates.currentInstitution = req.body.currentInstitution;
      if (req.body.currentFieldOfStudy !== undefined) updates.currentFieldOfStudy = req.body.currentFieldOfStudy;
      if (req.body.currentSemesterOrYear !== undefined) updates.currentSemesterOrYear = req.body.currentSemesterOrYear;
      if (req.body.expectedGraduationDate !== undefined) updates.expectedGraduationDate = req.body.expectedGraduationDate;
      if (req.body.isCurrentlyStudying !== undefined) updates.isCurrentlyStudying = req.body.isCurrentlyStudying;
      if (req.body.learningGoalId !== undefined) updates.learningGoalId = req.body.learningGoalId;
      if (req.body.specializationId !== undefined) updates.specializationId = req.body.specializationId;
      if (req.body.preferredLearningMode !== undefined) updates.preferredLearningMode = req.body.preferredLearningMode;
      if (req.body.preferredLearningLanguageId !== undefined) updates.preferredLearningLanguageId = req.body.preferredLearningLanguageId;
      if (req.body.preferredContentType !== undefined) updates.preferredContentType = req.body.preferredContentType;
      if (req.body.dailyLearningHours !== undefined) updates.dailyLearningHours = req.body.dailyLearningHours;
      if (req.body.weeklyAvailableDays !== undefined) updates.weeklyAvailableDays = req.body.weeklyAvailableDays;
      if (req.body.difficultyPreference !== undefined) updates.difficultyPreference = req.body.difficultyPreference;
      if (req.body.parentGuardianName !== undefined) updates.parentGuardianName = req.body.parentGuardianName;
      if (req.body.parentGuardianPhone !== undefined) updates.parentGuardianPhone = req.body.parentGuardianPhone;
      if (req.body.parentGuardianEmail !== undefined) updates.parentGuardianEmail = req.body.parentGuardianEmail;
      if (req.body.parentGuardianRelation !== undefined) updates.parentGuardianRelation = req.body.parentGuardianRelation;
      if (req.body.coursesEnrolled !== undefined) updates.coursesEnrolled = req.body.coursesEnrolled;
      if (req.body.coursesCompleted !== undefined) updates.coursesCompleted = req.body.coursesCompleted;
      if (req.body.coursesInProgress !== undefined) updates.coursesInProgress = req.body.coursesInProgress;
      if (req.body.certificatesEarned !== undefined) updates.certificatesEarned = req.body.certificatesEarned;
      if (req.body.totalLearningHours !== undefined) updates.totalLearningHours = req.body.totalLearningHours;
      if (req.body.averageScore !== undefined) updates.averageScore = req.body.averageScore;
      if (req.body.currentStreakDays !== undefined) updates.currentStreakDays = req.body.currentStreakDays;
      if (req.body.longestStreakDays !== undefined) updates.longestStreakDays = req.body.longestStreakDays;
      if (req.body.xpPoints !== undefined) updates.xpPoints = req.body.xpPoints;
      if (req.body.level !== undefined) updates.level = req.body.level;
      if (req.body.subscriptionPlan !== undefined) updates.subscriptionPlan = req.body.subscriptionPlan;
      if (req.body.subscriptionStartDate !== undefined) updates.subscriptionStartDate = req.body.subscriptionStartDate;
      if (req.body.subscriptionEndDate !== undefined) updates.subscriptionEndDate = req.body.subscriptionEndDate;
      if (req.body.totalAmountPaid !== undefined) updates.totalAmountPaid = req.body.totalAmountPaid;
      if (req.body.hasActiveSubscription !== undefined) updates.hasActiveSubscription = req.body.hasActiveSubscription;
      if (req.body.referredByUserId !== undefined) updates.referredByUserId = req.body.referredByUserId;
      if (req.body.referralCode !== undefined) updates.referralCode = req.body.referralCode;
      if (req.body.isSeekingJob !== undefined) updates.isSeekingJob = req.body.isSeekingJob;
      if (req.body.preferredJobRoles !== undefined) updates.preferredJobRoles = req.body.preferredJobRoles;
      if (req.body.preferredLocations !== undefined) updates.preferredLocations = req.body.preferredLocations;
      if (req.body.expectedSalaryRange !== undefined) updates.expectedSalaryRange = req.body.expectedSalaryRange;
      if (req.body.portfolioUrl !== undefined) updates.portfolioUrl = req.body.portfolioUrl;
      if (req.body.isOpenToInternship !== undefined) updates.isOpenToInternship = req.body.isOpenToInternship;
      if (req.body.isOpenToFreelance !== undefined) updates.isOpenToFreelance = req.body.isOpenToFreelance;
      if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;

      const data = await studentManagementService.updateStudentProfile(req.params.id, updates, req.user.userId);
      sendSuccess(res, { data, message: 'Student Profile updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteStudentProfile(req, res, next) {
    try {
      await studentManagementService.deleteStudentProfile(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Student Profile deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreStudentProfile(req, res, next) {
    try {
      const data = await studentManagementService.restoreStudentProfile(req.params.id);
      sendSuccess(res, { message: 'Student profile restored successfully', data });
    } catch (error) {
      next(error);
    }
  }

  async uploadResume(req, res, next) {
    try {
      const data = await studentManagementService.handleResumeUpload(req.params.id, req.file, req.user.userId);
      sendSuccess(res, { data, message: 'Resume uploaded successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StudentManagementController();
