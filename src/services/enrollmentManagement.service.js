const enrollmentManagementRepository = require('../repositories/enrollmentManagement.repository');

class EnrollmentManagementService {
  // ENROLLMENTS
  async getEnrollments({
    filterStudentId = null,
    filterCourseId = null,
    filterStatus = null,
    filterSourceType = null,
    filterBundleId = null,
    filterBatchId = null,
    filterOrderId = null,
    filterIsActive = null,
    filterIsDeleted = false,
    searchTerm = null,
    sortColumn = 'enrolled_at',
    sortDirection = 'DESC',
    page = 1,
    limit = 20,
  }) {
    const pageIndex = page;
    const pageSize = limit;

    const data = await enrollmentManagementRepository.getEnrollments({
      filterStudentId,
      filterCourseId,
      filterStatus,
      filterSourceType,
      filterBundleId,
      filterBatchId,
      filterOrderId,
      filterIsActive,
      filterIsDeleted,
      searchTerm,
      sortColumn,
      sortDirection,
      pageIndex,
      pageSize,
    });

    return data;
  }

  async createEnrollment(
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
    createdBy = null
  ) {
    const enrollmentId = await enrollmentManagementRepository.createEnrollment(
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

    return enrollmentId;
  }

  async updateEnrollment(
    id,
    enrollmentStatus = null,
    expiresAt = null,
    accessStartsAt = null,
    accessEndsAt = null,
    updatedBy = null
  ) {
    await enrollmentManagementRepository.updateEnrollment(
      id,
      enrollmentStatus,
      expiresAt,
      accessStartsAt,
      accessEndsAt,
      updatedBy
    );
  }

  async deleteEnrollment(id) {
    await enrollmentManagementRepository.deleteEnrollment(id);
  }

  async bulkDeleteEnrollments(ids) {
    await enrollmentManagementRepository.bulkDeleteEnrollments(ids);
  }

  async restoreEnrollment(id) {
    await enrollmentManagementRepository.restoreEnrollment(id);
  }

  async bulkRestoreEnrollments(ids) {
    await enrollmentManagementRepository.bulkRestoreEnrollments(ids);
  }

  // BATCH ENROLLMENTS
  async getBatchEnrollments({
    filterStudentId = null,
    filterBatchId = null,
    filterStatus = null,
    filterOrderId = null,
    filterIsActive = null,
    filterIsDeleted = false,
    searchTerm = null,
    sortColumn = 'enrolled_at',
    sortDirection = 'DESC',
    page = 1,
    limit = 20,
  }) {
    const pageIndex = page;
    const pageSize = limit;

    const data = await enrollmentManagementRepository.getBatchEnrollments({
      filterStudentId,
      filterBatchId,
      filterStatus,
      filterOrderId,
      filterIsActive,
      filterIsDeleted,
      searchTerm,
      sortColumn,
      sortDirection,
      pageIndex,
      pageSize,
    });

    return data;
  }

  async createBatchEnrollment(
    batchId,
    studentId,
    orderId = null,
    enrollmentStatus = 'active',
    enrolledAt = null,
    completedAt = null,
    createdBy = null
  ) {
    const batchEnrollmentId = await enrollmentManagementRepository.createBatchEnrollment(
      batchId,
      studentId,
      orderId,
      enrollmentStatus,
      enrolledAt,
      completedAt,
      createdBy
    );

    return batchEnrollmentId;
  }

  async updateBatchEnrollment(
    id,
    enrollmentStatus = null,
    completedAt = null,
    updatedBy = null
  ) {
    await enrollmentManagementRepository.updateBatchEnrollment(
      id,
      enrollmentStatus,
      completedAt,
      updatedBy
    );
  }

  async deleteBatchEnrollment(id) {
    await enrollmentManagementRepository.deleteBatchEnrollment(id);
  }

  async bulkDeleteBatchEnrollments(ids) {
    await enrollmentManagementRepository.bulkDeleteBatchEnrollments(ids);
  }

  async restoreBatchEnrollment(id) {
    await enrollmentManagementRepository.restoreBatchEnrollment(id);
  }

  async bulkRestoreBatchEnrollments(ids) {
    await enrollmentManagementRepository.bulkRestoreBatchEnrollments(ids);
  }

  // WEBINAR REGISTRATIONS
  async getWebinarRegistrations({
    filterStudentId = null,
    filterWebinarId = null,
    filterStatus = null,
    filterOrderId = null,
    filterIsActive = null,
    filterIsDeleted = false,
    searchTerm = null,
    sortColumn = 'registered_at',
    sortDirection = 'DESC',
    page = 1,
    limit = 20,
  }) {
    const pageIndex = page;
    const pageSize = limit;

    const data = await enrollmentManagementRepository.getWebinarRegistrations({
      filterStudentId,
      filterWebinarId,
      filterStatus,
      filterOrderId,
      filterIsActive,
      filterIsDeleted,
      searchTerm,
      sortColumn,
      sortDirection,
      pageIndex,
      pageSize,
    });

    return data;
  }

  async createWebinarRegistration(
    webinarId,
    studentId,
    orderId = null,
    registrationStatus = 'registered',
    registeredAt = null,
    attendedAt = null,
    createdBy = null
  ) {
    const registrationId = await enrollmentManagementRepository.createWebinarRegistration(
      webinarId,
      studentId,
      orderId,
      registrationStatus,
      registeredAt,
      attendedAt,
      createdBy
    );

    return registrationId;
  }

  async updateWebinarRegistration(
    id,
    registrationStatus = null,
    attendedAt = null,
    updatedBy = null
  ) {
    await enrollmentManagementRepository.updateWebinarRegistration(
      id,
      registrationStatus,
      attendedAt,
      updatedBy
    );
  }

  async deleteWebinarRegistration(id) {
    await enrollmentManagementRepository.deleteWebinarRegistration(id);
  }

  async bulkDeleteWebinarRegistrations(ids) {
    await enrollmentManagementRepository.bulkDeleteWebinarRegistrations(ids);
  }

  async restoreWebinarRegistration(id) {
    await enrollmentManagementRepository.restoreWebinarRegistration(id);
  }

  async bulkRestoreWebinarRegistrations(ids) {
    await enrollmentManagementRepository.bulkRestoreWebinarRegistrations(ids);
  }
}

module.exports = new EnrollmentManagementService();
