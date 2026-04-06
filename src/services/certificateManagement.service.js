const certificateManagementRepository = require('../repositories/certificateManagement.repository');
const logger = require('../config/logger');
const { BadRequestError, NotFoundError } = require('../utils/errors');

class CertificateManagementService {
  // ═════════════════════════════════════════════════════════════
  //  CERTIFICATE TEMPLATES
  // ═════════════════════════════════════════════════════════════

  async getCertificateTemplates(options = {}) {
    try {
      const {
        certificateTemplateId = null,
        languageId = null,
        templateType = null,
        isDefault = null,
        isActive = null,
        searchTerm = null,
        sortTable = 'template',
        sortBy = 'code',
        sortDir = 'ASC',
        page = 1,
        limit = 20,
      } = options;

      const repoOptions = {
        certificateTemplateId,
        languageId,
        templateType,
        isDefault,
        isActive,
        filterIsDeleted: false,
        searchTerm,
        sortTable,
        sortColumn: sortBy,
        sortDirection: sortDir,
        pageIndex: page - 1,
        pageSize: limit,
      };

      return await certificateManagementRepository.getCertificateTemplates(repoOptions);
    } catch (error) {
      logger.error('Error fetching certificate templates:', error);
      throw error;
    }
  }

  async getCertificateTemplateById(id) {
    try {
      if (!id) throw new BadRequestError('Template ID is required');

      const result = await certificateManagementRepository.findCertificateTemplateById(id);
      if (!result) throw new NotFoundError('Certificate template not found');

      return result;
    } catch (error) {
      logger.error(`Error fetching certificate template ${id}:`, error);
      throw error;
    }
  }

  async getCertificateTemplatesJson(languageId = null) {
    try {
      return await certificateManagementRepository.getCertificateTemplatesJson(languageId);
    } catch (error) {
      logger.error('Error fetching certificate templates JSON:', error);
      throw error;
    }
  }

  async createCertificateTemplate(templateData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!templateData.code) throw new BadRequestError('Template code is required');

      const payload = {
        ...templateData,
        createdBy: actingUserId,
      };

      const created = await certificateManagementRepository.createCertificateTemplate(payload);
      logger.info(`Certificate template created: ${created.certificate_template_id}`, { createdBy: actingUserId });

      return created;
    } catch (error) {
      logger.error('Error creating certificate template:', error);
      throw error;
    }
  }

  async updateCertificateTemplate(id, updates, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Template ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await certificateManagementRepository.findCertificateTemplateById(id);
      if (!existing) throw new NotFoundError('Certificate template not found');

      const updated = await certificateManagementRepository.updateCertificateTemplate(id, updates);
      logger.info(`Certificate template updated: ${id}`, { updatedBy: actingUserId });

      return updated;
    } catch (error) {
      logger.error(`Error updating certificate template ${id}:`, error);
      throw error;
    }
  }

  async deleteCertificateTemplate(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Template ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await certificateManagementRepository.findCertificateTemplateById(id);
      if (!existing) throw new NotFoundError('Certificate template not found');

      await certificateManagementRepository.deleteCertificateTemplate(id);
      logger.info(`Certificate template deleted: ${id}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting certificate template ${id}:`, error);
      throw error;
    }
  }

  async restoreCertificateTemplate(id, actingUserId, restoreTranslations = true) {
    try {
      if (!id) throw new BadRequestError('Template ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await certificateManagementRepository.restoreCertificateTemplate(id, restoreTranslations);
      logger.info(`Certificate template restored: ${id}`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error(`Error restoring certificate template ${id}:`, error);
      throw error;
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  CERTIFICATE TEMPLATE TRANSLATIONS
  // ═════════════════════════════════════════════════════════════

  async createTemplateTranslation(translationData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!translationData.certificateTemplateId) throw new BadRequestError('Certificate template ID is required');
      if (!translationData.languageId) throw new BadRequestError('Language ID is required');
      if (!translationData.title) throw new BadRequestError('Title is required');

      const template = await certificateManagementRepository.findCertificateTemplateById(translationData.certificateTemplateId);
      if (!template) throw new NotFoundError('Certificate template not found');

      await certificateManagementRepository.createTemplateTranslation(translationData);
      logger.info(`Template translation created for template ${translationData.certificateTemplateId}`, { createdBy: actingUserId });
    } catch (error) {
      logger.error('Error creating template translation:', error);
      throw error;
    }
  }

  async updateTemplateTranslation(id, updates, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await certificateManagementRepository.updateTemplateTranslation(id, updates);
      logger.info(`Template translation updated: ${id}`, { updatedBy: actingUserId });
    } catch (error) {
      logger.error(`Error updating template translation ${id}:`, error);
      throw error;
    }
  }

  async deleteTemplateTranslation(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await certificateManagementRepository.deleteTemplateTranslation(id);
      logger.info(`Template translation deleted: ${id}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting template translation ${id}:`, error);
      throw error;
    }
  }

  async restoreTemplateTranslation(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Translation ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await certificateManagementRepository.restoreTemplateTranslation(id);
      logger.info(`Template translation restored: ${id}`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error(`Error restoring template translation ${id}:`, error);
      throw error;
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  CERTIFICATES
  // ═════════════════════════════════════════════════════════════

  async getCertificates(options = {}) {
    try {
      const {
        studentId = null,
        courseId = null,
        certificateNumber = null,
        templateId = null,
        isActive = null,
        issuedAfter = null,
        issuedBefore = null,
        searchTerm = null,
        sortBy = 'issued_at',
        sortDir = 'DESC',
        page = 1,
        limit = 20,
      } = options;

      const repoOptions = {
        studentId,
        courseId,
        certificateNumber,
        templateId,
        isActive,
        issuedAfter,
        issuedBefore,
        searchTerm,
        sortColumn: sortBy,
        sortDirection: sortDir,
        pageIndex: page - 1,
        pageSize: limit,
      };

      return await certificateManagementRepository.getCertificates(repoOptions);
    } catch (error) {
      logger.error('Error fetching certificates:', error);
      throw error;
    }
  }

  async getCertificateById(id) {
    try {
      if (!id) throw new BadRequestError('Certificate ID is required');

      const result = await certificateManagementRepository.findCertificateById(id);
      if (!result) throw new NotFoundError('Certificate not found');

      return result;
    } catch (error) {
      logger.error(`Error fetching certificate ${id}:`, error);
      throw error;
    }
  }

  async createCertificate(certData, actingUserId) {
    try {
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');
      if (!certData.studentId) throw new BadRequestError('Student ID is required');
      if (!certData.courseId) throw new BadRequestError('Course ID is required');
      if (!certData.enrollmentId) throw new BadRequestError('Enrollment ID is required');
      if (!certData.certificateTemplateId) throw new BadRequestError('Certificate template ID is required');

      const payload = {
        ...certData,
        createdBy: actingUserId,
      };

      const created = await certificateManagementRepository.createCertificate(payload);
      logger.info(`Certificate created: ${created.cert_id}`, { createdBy: actingUserId });

      return created;
    } catch (error) {
      logger.error('Error creating certificate:', error);
      throw error;
    }
  }

  async updateCertificate(id, updates, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Certificate ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await certificateManagementRepository.findCertificateById(id);
      if (!existing) throw new NotFoundError('Certificate not found');

      const payload = {
        ...updates,
        updatedBy: actingUserId,
      };

      const updated = await certificateManagementRepository.updateCertificate(id, payload);
      logger.info(`Certificate updated: ${id}`, { updatedBy: actingUserId });

      return updated;
    } catch (error) {
      logger.error(`Error updating certificate ${id}:`, error);
      throw error;
    }
  }

  async deleteCertificate(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Certificate ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      const existing = await certificateManagementRepository.findCertificateById(id);
      if (!existing) throw new NotFoundError('Certificate not found');

      await certificateManagementRepository.deleteCertificate(id);
      logger.info(`Certificate deleted: ${id}`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error(`Error deleting certificate ${id}:`, error);
      throw error;
    }
  }

  async bulkDeleteCertificates(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('At least one certificate ID is required');
      }
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await certificateManagementRepository.bulkDeleteCertificates(ids);
      logger.info(`Certificates bulk deleted: ${ids.length} certificates`, { deletedBy: actingUserId });
    } catch (error) {
      logger.error('Error bulk deleting certificates:', error);
      throw error;
    }
  }

  async restoreCertificate(id, actingUserId) {
    try {
      if (!id) throw new BadRequestError('Certificate ID is required');
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await certificateManagementRepository.restoreCertificate(id);
      logger.info(`Certificate restored: ${id}`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error(`Error restoring certificate ${id}:`, error);
      throw error;
    }
  }

  async bulkRestoreCertificates(ids, actingUserId) {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('At least one certificate ID is required');
      }
      if (!actingUserId) throw new BadRequestError('Acting user ID is required');

      await certificateManagementRepository.bulkRestoreCertificates(ids);
      logger.info(`Certificates bulk restored: ${ids.length} certificates`, { restoredBy: actingUserId });
    } catch (error) {
      logger.error('Error bulk restoring certificates:', error);
      throw error;
    }
  }
}

module.exports = new CertificateManagementService();
