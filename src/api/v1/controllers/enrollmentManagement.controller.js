const { sendSuccess, sendCreated } = require('../../../utils/response');
const enrollmentManagementService = require('../../../services/enrollmentManagement.service');

class EnrollmentManagementController {
  // ENROLLMENTS
  async getEnrollments(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        studentId = null,
        courseId = null,
        status = null,
        sourceType = null,
        bundleId = null,
        batchId = null,
        orderId = null,
        isActive = null,
        isDeleted = false,
        searchTerm = null,
        sortBy = 'enrolled_at',
        sortDir = 'DESC',
      } = req.query;

      const data = await enrollmentManagementService.getEnrollments({
        filterStudentId: studentId || null,
        filterCourseId: courseId || null,
        filterStatus: status || null,
        filterSourceType: sourceType || null,
        filterBundleId: bundleId || null,
        filterBatchId: batchId || null,
        filterOrderId: orderId || null,
        filterIsActive: isActive || null,
        filterIsDeleted: isDeleted,
        searchTerm: searchTerm || null,
        sortColumn: sortBy,
        sortDirection: sortDir,
        page: Number(page),
        limit: Number(limit),
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, {
        data,
        message: 'Enrollments retrieved successfully',
        meta,
      });
    } catch (error) {
      next(error);
    }
  }

  async createEnrollment(req, res, next) {
    try {
      const {
        studentId,
        courseId,
        sourceType = 'direct',
        bundleId = null,
        batchId = null,
        orderId = null,
        orderItemId = null,
        enrollmentStatus = 'active',
        enrolledAt = null,
        expiresAt = null,
        accessStartsAt = null,
        accessEndsAt = null,
      } = req.body;

      const createdBy = req.user?.id || null;

      const enrollmentId = await enrollmentManagementService.createEnrollment(
        studentId,
        courseId,
        sourceType,
        bundleId,
        batchId,
        orderId,
        orderItemId,
        enrollmentStatus,
        enrolledAt,
        expiresAt,
        accessStartsAt,
        accessEndsAt,
        createdBy
      );

      sendCreated(res, {
        data: { id: enrollmentId },
        message: 'Enrollment created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateEnrollment(req, res, next) {
    try {
      const { id } = req.params;
      const {
        enrollmentStatus = null,
        expiresAt = null,
        accessStartsAt = null,
        accessEndsAt = null,
      } = req.body;

      const updatedBy = req.user?.id || null;

      await enrollmentManagementService.updateEnrollment(
        id,
        enrollmentStatus,
        expiresAt,
        accessStartsAt,
        accessEndsAt,
        updatedBy
      );

      sendSuccess(res, {
        message: 'Enrollment updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteEnrollment(req, res, next) {
    try {
      const { id } = req.params;

      await enrollmentManagementService.deleteEnrollment(id);

      sendSuccess(res, {
        message: 'Enrollment deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async bulkDeleteEnrollments(req, res, next) {
    try {
      const { ids } = req.body;

      await enrollmentManagementService.bulkDeleteEnrollments(ids);

      sendSuccess(res, {
        message: 'Enrollments deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async restoreEnrollment(req, res, next) {
    try {
      const { id } = req.params;

      await enrollmentManagementService.restoreEnrollment(id);

      sendSuccess(res, {
        message: 'Enrollment restored successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async bulkRestoreEnrollments(req, res, next) {
    try {
      const { ids } = req.body;

      await enrollmentManagementService.bulkRestoreEnrollments(ids);

      sendSuccess(res, {
        message: 'Enrollments restored successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // BATCH ENROLLMENTS
  async getBatchEnrollments(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        studentId = null,
        batchId = null,
        status = null,
        orderId = null,
        isActive = null,
        isDeleted = false,
        searchTerm = null,
        sortBy = 'enrolled_at',
        sortDir = 'DESC',
      } = req.query;

      const data = await enrollmentManagementService.getBatchEnrollments({
        filterStudentId: studentId || null,
        filterBatchId: batchId || null,
        filterStatus: status || null,
        filterOrderId: orderId || null,
        filterIsActive: isActive || null,
        filterIsDeleted: isDeleted,
        searchTerm: searchTerm || null,
        sortColumn: sortBy,
        sortDirection: sortDir,
        page: Number(page),
        limit: Number(limit),
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, {
        data,
        message: 'Batch enrollments retrieved successfully',
        meta,
      });
    } catch (error) {
      next(error);
    }
  }

  async createBatchEnrollment(req, res, next) {
    try {
      const {
        batchId,
        studentId,
        orderId = null,
        enrollmentStatus = 'active',
        enrolledAt = null,
        completedAt = null,
      } = req.body;

      const createdBy = req.user?.id || null;

      const batchEnrollmentId = await enrollmentManagementService.createBatchEnrollment(
        batchId,
        studentId,
        orderId,
        enrollmentStatus,
        enrolledAt,
        completedAt,
        createdBy
      );

      sendCreated(res, {
        data: { id: batchEnrollmentId },
        message: 'Batch enrollment created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBatchEnrollment(req, res, next) {
    try {
      const { id } = req.params;
      const {
        enrollmentStatus = null,
        completedAt = null,
      } = req.body;

      const updatedBy = req.user?.id || null;

      await enrollmentManagementService.updateBatchEnrollment(
        id,
        enrollmentStatus,
        completedAt,
        updatedBy
      );

      sendSuccess(res, {
        message: 'Batch enrollment updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteBatchEnrollment(req, res, next) {
    try {
      const { id } = req.params;

      await enrollmentManagementService.deleteBatchEnrollment(id);

      sendSuccess(res, {
        message: 'Batch enrollment deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async bulkDeleteBatchEnrollments(req, res, next) {
    try {
      const { ids } = req.body;

      await enrollmentManagementService.bulkDeleteBatchEnrollments(ids);

      sendSuccess(res, {
        message: 'Batch enrollments deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async restoreBatchEnrollment(req, res, next) {
    try {
      const { id } = req.params;

      await enrollmentManagementService.restoreBatchEnrollment(id);

      sendSuccess(res, {
        message: 'Batch enrollment restored successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async bulkRestoreBatchEnrollments(req, res, next) {
    try {
      const { ids } = req.body;

      await enrollmentManagementService.bulkRestoreBatchEnrollments(ids);

      sendSuccess(res, {
        message: 'Batch enrollments restored successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // WEBINAR REGISTRATIONS
  async getWebinarRegistrations(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        studentId = null,
        webinarId = null,
        status = null,
        orderId = null,
        isActive = null,
        isDeleted = false,
        searchTerm = null,
        sortBy = 'registered_at',
        sortDir = 'DESC',
      } = req.query;

      const data = await enrollmentManagementService.getWebinarRegistrations({
        filterStudentId: studentId || null,
        filterWebinarId: webinarId || null,
        filterStatus: status || null,
        filterOrderId: orderId || null,
        filterIsActive: isActive || null,
        filterIsDeleted: isDeleted,
        searchTerm: searchTerm || null,
        sortColumn: sortBy,
        sortDirection: sortDir,
        page: Number(page),
        limit: Number(limit),
      });

      const totalCount = data.length > 0 ? data[0].total_count : 0;
      const meta = {
        page: Number(page),
        limit: Number(limit),
        totalCount: Number(totalCount),
        totalPages: Math.ceil(Number(totalCount) / Number(limit)),
      };

      sendSuccess(res, {
        data,
        message: 'Webinar registrations retrieved successfully',
        meta,
      });
    } catch (error) {
      next(error);
    }
  }

  async createWebinarRegistration(req, res, next) {
    try {
      const {
        webinarId,
        studentId,
        orderId = null,
        registrationStatus = 'registered',
        registeredAt = null,
        attendedAt = null,
      } = req.body;

      const createdBy = req.user?.id || null;

      const registrationId = await enrollmentManagementService.createWebinarRegistration(
        webinarId,
        studentId,
        orderId,
        registrationStatus,
        registeredAt,
        attendedAt,
        createdBy
      );

      sendCreated(res, {
        data: { id: registrationId },
        message: 'Webinar registration created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateWebinarRegistration(req, res, next) {
    try {
      const { id } = req.params;
      const {
        registrationStatus = null,
        attendedAt = null,
      } = req.body;

      const updatedBy = req.user?.id || null;

      await enrollmentManagementService.updateWebinarRegistration(
        id,
        registrationStatus,
        attendedAt,
        updatedBy
      );

      sendSuccess(res, {
        message: 'Webinar registration updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteWebinarRegistration(req, res, next) {
    try {
      const { id } = req.params;

      await enrollmentManagementService.deleteWebinarRegistration(id);

      sendSuccess(res, {
        message: 'Webinar registration deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async bulkDeleteWebinarRegistrations(req, res, next) {
    try {
      const { ids } = req.body;

      await enrollmentManagementService.bulkDeleteWebinarRegistrations(ids);

      sendSuccess(res, {
        message: 'Webinar registrations deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async restoreWebinarRegistration(req, res, next) {
    try {
      const { id } = req.params;

      await enrollmentManagementService.restoreWebinarRegistration(id);

      sendSuccess(res, {
        message: 'Webinar registration restored successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async bulkRestoreWebinarRegistrations(req, res, next) {
    try {
      const { ids } = req.body;

      await enrollmentManagementService.bulkRestoreWebinarRegistrations(ids);

      sendSuccess(res, {
        message: 'Webinar registrations restored successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EnrollmentManagementController();
