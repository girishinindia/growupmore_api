const certificateManagementService = require('../../../services/certificateManagement.service');
const { sendSuccess, sendCreated } = require('../../../utils/response');

class CertificateManagementController {
  // ═════════════════════════════════════════════════════════════
  //  CERTIFICATE TEMPLATES
  // ═════════════════════════════════════════════════════════════

  async getCertificateTemplates(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        certificateTemplateId,
        languageId,
        templateType,
        isDefault,
        isActive,
        searchTerm,
        sortTable,
        sortBy,
        sortDir,
      } = req.query;

      const data = await certificateManagementService.getCertificateTemplates({
        certificateTemplateId: certificateTemplateId || null,
        languageId: languageId || null,
        templateType: templateType || null,
        isDefault: isDefault !== undefined ? isDefault : null,
        isActive: isActive !== undefined ? isActive : null,
        searchTerm: searchTerm || null,
        sortTable: sortTable || 'template',
        sortBy: sortBy || 'code',
        sortDir: sortDir || 'ASC',
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

      sendSuccess(res, { data, message: 'Certificate templates retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getCertificateTemplateById(req, res, next) {
    try {
      const data = await certificateManagementService.getCertificateTemplateById(req.params.id);
      sendSuccess(res, { data, message: 'Certificate template retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getCertificateTemplatesJson(req, res, next) {
    try {
      const { languageId } = req.query;
      const data = await certificateManagementService.getCertificateTemplatesJson(languageId || null);
      sendSuccess(res, { data, message: 'Certificate templates JSON retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createCertificateTemplate(req, res, next) {
    try {
      const data = await certificateManagementService.createCertificateTemplate(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Certificate template created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateCertificateTemplate(req, res, next) {
    try {
      const data = await certificateManagementService.updateCertificateTemplate(
        req.params.id,
        req.body,
        req.user.userId
      );
      sendSuccess(res, { data, message: 'Certificate template updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCertificateTemplate(req, res, next) {
    try {
      await certificateManagementService.deleteCertificateTemplate(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Certificate template deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreCertificateTemplate(req, res, next) {
    try {
      await certificateManagementService.restoreCertificateTemplate(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Certificate template restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  CERTIFICATE TEMPLATE TRANSLATIONS
  // ═════════════════════════════════════════════════════════════

  async createTemplateTranslation(req, res, next) {
    try {
      const translationData = {
        ...req.body,
        certificateTemplateId: Number(req.params.templateId),
      };
      await certificateManagementService.createTemplateTranslation(translationData, req.user.userId);
      sendCreated(res, { message: 'Template translation created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateTemplateTranslation(req, res, next) {
    try {
      await certificateManagementService.updateTemplateTranslation(req.params.id, req.body, req.user.userId);
      sendSuccess(res, { message: 'Template translation updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteTemplateTranslation(req, res, next) {
    try {
      await certificateManagementService.deleteTemplateTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Template translation deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreTemplateTranslation(req, res, next) {
    try {
      await certificateManagementService.restoreTemplateTranslation(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Template translation restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  CERTIFICATES
  // ═════════════════════════════════════════════════════════════

  async getCertificates(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        studentId,
        courseId,
        certificateNumber,
        templateId,
        isActive,
        issuedAfter,
        issuedBefore,
        searchTerm,
        sortBy,
        sortDir,
      } = req.query;

      const data = await certificateManagementService.getCertificates({
        studentId: studentId || null,
        courseId: courseId || null,
        certificateNumber: certificateNumber || null,
        templateId: templateId || null,
        isActive: isActive !== undefined ? isActive : null,
        issuedAfter: issuedAfter || null,
        issuedBefore: issuedBefore || null,
        searchTerm: searchTerm || null,
        sortBy: sortBy || 'issued_at',
        sortDir: sortDir || 'DESC',
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

      sendSuccess(res, { data, message: 'Certificates retrieved successfully', meta });
    } catch (error) {
      next(error);
    }
  }

  async getCertificateById(req, res, next) {
    try {
      const data = await certificateManagementService.getCertificateById(req.params.id);
      sendSuccess(res, { data, message: 'Certificate retrieved successfully' });
    } catch (error) {
      next(error);
    }
  }

  async createCertificate(req, res, next) {
    try {
      const data = await certificateManagementService.createCertificate(req.body, req.user.userId);
      sendCreated(res, { data, message: 'Certificate created successfully' });
    } catch (error) {
      next(error);
    }
  }

  async updateCertificate(req, res, next) {
    try {
      const data = await certificateManagementService.updateCertificate(
        req.params.id,
        req.body,
        req.user.userId
      );
      sendSuccess(res, { data, message: 'Certificate updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  async deleteCertificate(req, res, next) {
    try {
      await certificateManagementService.deleteCertificate(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Certificate deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async bulkDeleteCertificates(req, res, next) {
    try {
      const { ids } = req.body;
      await certificateManagementService.bulkDeleteCertificates(ids, req.user.userId);
      sendSuccess(res, { message: 'Certificates deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async restoreCertificate(req, res, next) {
    try {
      await certificateManagementService.restoreCertificate(req.params.id, req.user.userId);
      sendSuccess(res, { message: 'Certificate restored successfully' });
    } catch (error) {
      next(error);
    }
  }

  async bulkRestoreCertificates(req, res, next) {
    try {
      const { ids } = req.body;
      await certificateManagementService.bulkRestoreCertificates(ids, req.user.userId);
      sendSuccess(res, { message: 'Certificates restored successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CertificateManagementController();
