const assessmentManagementService = require('../../../services/assessmentManagement.service');
const { sendSuccess, sendCreated } = require('../../../utils/response');

class AssessmentManagementController {
  // ============ ASSESSMENTS ============

  async getAssessments(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        sortBy = 'display_order',
        sortDir = 'asc',
        assessmentType,
        assessmentScope,
        contentType,
        difficultyLevel,
        chapterId,
        moduleId,
        courseId,
        isMandatory,
        assessmentId,
        languageId,
        isActive,
      } = req.query;

      const filters = {};
      if (assessmentId) filters.assessmentId = assessmentId;
      if (languageId) filters.languageId = languageId;
      if (assessmentType) filters.assessmentType = assessmentType;
      if (assessmentScope) filters.assessmentScope = assessmentScope;
      if (contentType) filters.contentType = contentType;
      if (difficultyLevel) filters.difficultyLevel = difficultyLevel;
      if (chapterId) filters.chapterId = chapterId;
      if (moduleId) filters.moduleId = moduleId;
      if (courseId) filters.courseId = courseId;
      if (isMandatory !== undefined) filters.isMandatory = isMandatory;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await assessmentManagementService.getAssessments({
        filters,
        search,
        sort: { table: 'assessment', column: sortBy, direction: sortDir.toUpperCase() },
        pagination: { page: Number(page), limit: Number(limit) },
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };
      sendSuccess(res, { data, message: 'Assessments retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getAssessmentById(req, res, next) {
    try {
      const data = await assessmentManagementService.getAssessmentById(req.params.id);
      sendSuccess(res, { data, message: 'Assessment retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createAssessment(req, res, next) {
    try {
      const data = await assessmentManagementService.createAssessment(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Assessment created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateAssessment(req, res, next) {
    try {
      await assessmentManagementService.updateAssessment(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { message: 'Assessment updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteAssessment(req, res, next) {
    try {
      await assessmentManagementService.deleteAssessment(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Assessment deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreAssessment(req, res, next) {
    try {
      const data = await assessmentManagementService.restoreAssessment(
        req.params.id,
        req.body.restoreTranslations,
        req.user.userId
      );
      sendSuccess(res, { data, message: 'Assessment restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ ASSESSMENT TRANSLATIONS ============

  async createAssessmentTranslation(req, res, next) {
    try {
      if (req.files?.image1?.[0]) req.body.image1File = req.files.image1[0];
      if (req.files?.image2?.[0]) req.body.image2File = req.files.image2[0];

      await assessmentManagementService.createAssessmentTranslation(req.body, req.user.userId);
      sendCreated(res, { message: 'Assessment Translation created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateAssessmentTranslation(req, res, next) {
    try {
      if (req.files?.image1?.[0]) req.body.image1File = req.files.image1[0];
      if (req.files?.image2?.[0]) req.body.image2File = req.files.image2[0];

      await assessmentManagementService.updateAssessmentTranslation(
        req.params.id,
        req.body,
        req.user.userId
      );
      sendSuccess(res, { message: 'Assessment Translation updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteAssessmentTranslation(req, res, next) {
    try {
      await assessmentManagementService.deleteAssessmentTranslation(
        req.params.id,
        req.user.userId
      );
      sendSuccess(res, { message: 'Assessment Translation deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreAssessmentTranslation(req, res, next) {
    try {
      const data = await assessmentManagementService.restoreAssessmentTranslation(
        req.params.id,
        req.user.userId
      );
      sendSuccess(res, { data, message: 'Assessment Translation restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ ASSESSMENT ATTACHMENTS ============

  async getAssessmentAttachments(req, res, next) {
    try {
      const {
        assessmentId,
        languageId,
        attachmentType,
        isActive,
        search,
      } = req.query;

      const filters = {};
      if (assessmentId) filters.assessmentId = assessmentId;
      if (languageId) filters.languageId = languageId;
      if (attachmentType) filters.attachmentType = attachmentType;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await assessmentManagementService.getAssessmentAttachments({
        filters,
        search,
      });

      sendSuccess(res, { data, message: 'Assessment Attachments retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getAssessmentAttachmentById(req, res, next) {
    try {
      const data = await assessmentManagementService.getAssessmentAttachmentById(req.params.id);
      sendSuccess(res, { data, message: 'Assessment Attachment retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createAssessmentAttachment(req, res, next) {
    try {
      if (req.files?.file?.[0]) req.body.fileData = req.files.file[0];

      const data = await assessmentManagementService.createAssessmentAttachment(
        req.body,
        req.user.userId
      );
      sendCreated(res, { data, message: 'Assessment Attachment created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateAssessmentAttachment(req, res, next) {
    try {
      if (req.files?.file?.[0]) req.body.fileData = req.files.file[0];

      await assessmentManagementService.updateAssessmentAttachment(
        req.params.id,
        req.body,
        req.user.userId
      );
      sendSuccess(res, { message: 'Assessment Attachment updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteAssessmentAttachment(req, res, next) {
    try {
      await assessmentManagementService.deleteAssessmentAttachment(
        req.params.id,
        req.user.userId
      );
      sendSuccess(res, { message: 'Assessment Attachment deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreAssessmentAttachment(req, res, next) {
    try {
      const data = await assessmentManagementService.restoreAssessmentAttachment(
        req.params.id,
        req.body.restoreTranslations,
        req.user.userId
      );
      sendSuccess(res, { data, message: 'Assessment Attachment restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ ASSESSMENT ATTACHMENT TRANSLATIONS ============

  async createAssessmentAttachmentTranslation(req, res, next) {
    try {
      await assessmentManagementService.createAssessmentAttachmentTranslation(
        req.body,
        req.user.userId
      );
      sendCreated(res, { message: 'Assessment Attachment Translation created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateAssessmentAttachmentTranslation(req, res, next) {
    try {
      await assessmentManagementService.updateAssessmentAttachmentTranslation(
        req.params.id,
        req.body,
        req.user.userId
      );
      sendSuccess(res, { message: 'Assessment Attachment Translation updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteAssessmentAttachmentTranslation(req, res, next) {
    try {
      await assessmentManagementService.deleteAssessmentAttachmentTranslation(
        req.params.id,
        req.user.userId
      );
      sendSuccess(res, { message: 'Assessment Attachment Translation deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreAssessmentAttachmentTranslation(req, res, next) {
    try {
      const data = await assessmentManagementService.restoreAssessmentAttachmentTranslation(
        req.params.id,
        req.user.userId
      );
      sendSuccess(res, {
        data,
        message: 'Assessment Attachment Translation restored successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // ============ ASSESSMENT SOLUTIONS ============

  async getAssessmentSolutions(req, res, next) {
    try {
      const {
        assessmentId,
        languageId,
        solutionType,
        isActive,
        search,
      } = req.query;

      const filters = {};
      if (assessmentId) filters.assessmentId = assessmentId;
      if (languageId) filters.languageId = languageId;
      if (solutionType) filters.solutionType = solutionType;
      if (isActive !== undefined) filters.isActive = isActive;

      const data = await assessmentManagementService.getAssessmentSolutions({
        filters,
        search,
      });

      sendSuccess(res, { data, message: 'Assessment Solutions retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getAssessmentSolutionById(req, res, next) {
    try {
      const data = await assessmentManagementService.getAssessmentSolutionById(req.params.id);
      sendSuccess(res, { data, message: 'Assessment Solution retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createAssessmentSolution(req, res, next) {
    try {
      if (req.files?.file?.[0]) req.body.fileData = req.files.file[0];
      if (req.files?.video?.[0]) req.body.videoData = req.files.video[0];

      const data = await assessmentManagementService.createAssessmentSolution(
        req.body,
        req.user.userId
      );
      sendCreated(res, { data, message: 'Assessment Solution created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateAssessmentSolution(req, res, next) {
    try {
      if (req.files?.file?.[0]) req.body.fileData = req.files.file[0];
      if (req.files?.video?.[0]) req.body.videoData = req.files.video[0];

      await assessmentManagementService.updateAssessmentSolution(
        req.params.id,
        req.body,
        req.user.userId
      );
      sendSuccess(res, { message: 'Assessment Solution updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteAssessmentSolution(req, res, next) {
    try {
      await assessmentManagementService.deleteAssessmentSolution(
        req.params.id,
        req.user.userId
      );
      sendSuccess(res, { message: 'Assessment Solution deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreAssessmentSolution(req, res, next) {
    try {
      const data = await assessmentManagementService.restoreAssessmentSolution(
        req.params.id,
        req.body.restoreTranslations,
        req.user.userId
      );
      sendSuccess(res, { data, message: 'Assessment Solution restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ============ ASSESSMENT SOLUTION TRANSLATIONS ============

  async createAssessmentSolutionTranslation(req, res, next) {
    try {
      if (req.files?.videoThumbnail?.[0]) req.body.videoThumbnailFile = req.files.videoThumbnail[0];

      await assessmentManagementService.createAssessmentSolutionTranslation(
        req.body,
        req.user.userId
      );
      sendCreated(res, { message: 'Assessment Solution Translation created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateAssessmentSolutionTranslation(req, res, next) {
    try {
      if (req.files?.videoThumbnail?.[0]) req.body.videoThumbnailFile = req.files.videoThumbnail[0];

      await assessmentManagementService.updateAssessmentSolutionTranslation(
        req.params.id,
        req.body,
        req.user.userId
      );
      sendSuccess(res, { message: 'Assessment Solution Translation updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteAssessmentSolutionTranslation(req, res, next) {
    try {
      await assessmentManagementService.deleteAssessmentSolutionTranslation(
        req.params.id,
        req.user.userId
      );
      sendSuccess(res, { message: 'Assessment Solution Translation deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreAssessmentSolutionTranslation(req, res, next) {
    try {
      const data = await assessmentManagementService.restoreAssessmentSolutionTranslation(
        req.params.id,
        req.user.userId
      );
      sendSuccess(res, {
        data,
        message: 'Assessment Solution Translation restored successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AssessmentManagementController();
