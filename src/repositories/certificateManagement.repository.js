/**
 * ═══════════════════════════════════════════════════════════════
 * CERTIFICATE MANAGEMENT REPOSITORY — Database Layer (Supabase RPC)
 * ═══════════════════════════════════════════════════════════════
 * Handles certificate template, translation, and certificate operations:
 *
 *   CERTIFICATE TEMPLATES:
 *     udf_get_certificate_templates            — FUNCTION (read, search, filter, paginate)
 *     udfj_getcertificatetemplates             — FUNCTION (hierarchical JSON with translations)
 *     sp_certificate_templates_insert          — FUNCTION (create template, returns BIGINT)
 *     sp_certificate_templates_update          — FUNCTION (update template, returns VOID)
 *     sp_certificate_templates_delete          — FUNCTION (soft delete with cascade, returns VOID)
 *     sp_certificate_templates_restore         — FUNCTION (restore with optional cascade, returns VOID)
 *
 *   CERTIFICATE TEMPLATE TRANSLATIONS:
 *     sp_certificate_template_translations_insert   — FUNCTION (create translation, returns VOID)
 *     sp_certificate_template_translations_update   — FUNCTION (update translation, returns VOID)
 *     sp_certificate_template_translations_delete   — FUNCTION (soft delete, returns VOID)
 *     sp_certificate_template_translations_restore  — FUNCTION (restore, returns VOID)
 *
 *   CERTIFICATES:
 *     udf_get_certificates                     — FUNCTION (read, search, filter, paginate)
 *     sp_certificates_insert                   — FUNCTION (create certificate, returns BIGINT)
 *     sp_certificates_update                   — FUNCTION (update certificate, returns VOID)
 *     sp_certificates_delete                   — FUNCTION (single soft delete, returns VOID)
 *     sp_certificates_delete_batch             — FUNCTION (bulk soft delete, returns VOID)
 *     sp_certificates_restore                  — FUNCTION (single restore, returns VOID)
 *     sp_certificates_restore_batch            — FUNCTION (bulk restore, returns VOID)
 * ═══════════════════════════════════════════════════════════════
 */

const { supabase } = require('../config/database');
const logger = require('../config/logger');

class CertificateManagementRepository {
  // ═════════════════════════════════════════════════════════════
  //  CERTIFICATE TEMPLATES
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // READ — via udf_get_certificate_templates
  // ─────────────────────────────────────────────────────────────

  async getCertificateTemplates(options = {}) {
    try {
      const {
        id = null,
        certificateTemplateId = null,
        languageId = null,
        isActive = null,
        templateType = null,
        isDefault = null,
        filterIsActive = null,
        filterIsDeleted = false,
        sortTable = 'template',
        sortColumn = 'code',
        sortDirection = 'ASC',
        searchTerm = null,
        pageIndex = 1,
        pageSize = 20,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_certificate_templates', {
        p_id: id,
        p_certificate_template_id: certificateTemplateId,
        p_language_id: languageId,
        p_is_active: isActive,
        p_template_type: templateType,
        p_is_default: isDefault,
        p_filter_is_active: filterIsActive,
        p_filter_is_deleted: filterIsDeleted,
        p_sort_table: sortTable,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_search_term: searchTerm,
        p_page_index: pageIndex,
        p_page_size: pageSize,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching certificate templates: ${err.message}`);
      throw err;
    }
  }

  async findCertificateTemplateById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_certificate_templates', {
        p_id: null,
        p_certificate_template_id: null,
        p_language_id: null,
        p_is_active: null,
        p_template_type: null,
        p_is_default: null,
        p_filter_is_active: null,
        p_filter_is_deleted: false,
        p_sort_table: 'template',
        p_sort_column: 'id',
        p_sort_direction: 'ASC',
        p_search_term: null,
        p_page_index: 1,
        p_page_size: 10000,
      });

      if (error) throw error;

      const result = data?.find(t => t.certificate_template_id === Number(id));
      return result || null;
    } catch (err) {
      logger.error(`Error finding certificate template by ID: ${err.message}`);
      throw err;
    }
  }

  async getCertificateTemplatesJson(languageId = null) {
    try {
      const { data, error } = await supabase.rpc('udfj_getcertificatetemplates', {
        p_language_id: languageId,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching certificate templates JSON: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — via sp_certificate_templates_insert
  // ─────────────────────────────────────────────────────────────

  async createCertificateTemplate(payload) {
    try {
      const {
        code,
        templateType = 'completion',
        templateFileUrl = null,
        isDefault = false,
        isActive = true,
        createdBy = null,
      } = payload;

      const { data: newId, error } = await supabase.rpc('sp_certificate_templates_insert', {
        p_code: code,
        p_template_type: templateType,
        p_template_file_url: templateFileUrl,
        p_is_default: isDefault,
        p_is_active: isActive,
        p_created_by: createdBy,
      });

      if (error) throw error;

      logger.info(`Certificate template created: id=${newId}`);

      const newTemplate = await this.findCertificateTemplateById(newId);
      if (!newTemplate) {
        throw new Error(`Certificate template created (id: ${newId}) but could not be fetched`);
      }

      return newTemplate;
    } catch (err) {
      logger.error(`Error creating certificate template: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — via sp_certificate_templates_update
  // ─────────────────────────────────────────────────────────────

  async updateCertificateTemplate(id, payload) {
    try {
      const {
        code = null,
        templateType = null,
        templateFileUrl = null,
        isDefault = null,
        isActive = null,
      } = payload;

      const { error } = await supabase.rpc('sp_certificate_templates_update', {
        p_id: id,
        p_code: code,
        p_template_type: templateType,
        p_template_file_url: templateFileUrl,
        p_is_default: isDefault,
        p_is_active: isActive,
      });

      if (error) throw error;

      logger.info(`Certificate template updated: id=${id}`);

      const updated = await this.findCertificateTemplateById(id);
      if (!updated) {
        throw new Error(`Certificate template updated but could not be fetched`);
      }

      return updated;
    } catch (err) {
      logger.error(`Error updating certificate template ${id}: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — via sp_certificate_templates_delete
  // ─────────────────────────────────────────────────────────────

  async deleteCertificateTemplate(id) {
    try {
      const { error } = await supabase.rpc('sp_certificate_templates_delete', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Certificate template deleted: id=${id}`);
    } catch (err) {
      logger.error(`Error deleting certificate template ${id}: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — via sp_certificate_templates_restore
  // ─────────────────────────────────────────────────────────────

  async restoreCertificateTemplate(id, restoreTranslations = true) {
    try {
      const { error } = await supabase.rpc('sp_certificate_templates_restore', {
        p_id: id,
        p_restore_translations: restoreTranslations,
      });

      if (error) throw error;

      logger.info(`Certificate template restored: id=${id}`);
    } catch (err) {
      logger.error(`Error restoring certificate template ${id}: ${err.message}`);
      throw err;
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  CERTIFICATE TEMPLATE TRANSLATIONS
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // CREATE — via sp_certificate_template_translations_insert
  // ─────────────────────────────────────────────────────────────

  async createTemplateTranslation(payload) {
    try {
      const {
        certificateTemplateId,
        languageId,
        title,
        description = null,
        congratulationsText = null,
        footerText = null,
        isActive = true,
      } = payload;

      const { error } = await supabase.rpc('sp_certificate_template_translations_insert', {
        p_certificate_template_id: certificateTemplateId,
        p_language_id: languageId,
        p_title: title,
        p_description: description,
        p_congratulations_text: congratulationsText,
        p_footer_text: footerText,
        p_is_active: isActive,
      });

      if (error) throw error;

      logger.info(`Template translation created: templateId=${certificateTemplateId}, langId=${languageId}`);
    } catch (err) {
      logger.error(`Error creating template translation: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — via sp_certificate_template_translations_update
  // ─────────────────────────────────────────────────────────────

  async updateTemplateTranslation(id, payload) {
    try {
      const {
        title = null,
        description = null,
        congratulationsText = null,
        footerText = null,
        isActive = null,
      } = payload;

      const { error } = await supabase.rpc('sp_certificate_template_translations_update', {
        p_id: id,
        p_title: title,
        p_description: description,
        p_congratulations_text: congratulationsText,
        p_footer_text: footerText,
        p_is_active: isActive,
      });

      if (error) throw error;

      logger.info(`Template translation updated: id=${id}`);
    } catch (err) {
      logger.error(`Error updating template translation ${id}: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — via sp_certificate_template_translations_delete
  // ─────────────────────────────────────────────────────────────

  async deleteTemplateTranslation(id) {
    try {
      const { error } = await supabase.rpc('sp_certificate_template_translations_delete', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Template translation deleted: id=${id}`);
    } catch (err) {
      logger.error(`Error deleting template translation ${id}: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — via sp_certificate_template_translations_restore
  // ─────────────────────────────────────────────────────────────

  async restoreTemplateTranslation(id) {
    try {
      const { error } = await supabase.rpc('sp_certificate_template_translations_restore', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Template translation restored: id=${id}`);
    } catch (err) {
      logger.error(`Error restoring template translation ${id}: ${err.message}`);
      throw err;
    }
  }

  // ═════════════════════════════════════════════════════════════
  //  CERTIFICATES
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // READ — via udf_get_certificates
  // ─────────────────────────────────────────────────────────────

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
        sortColumn = 'issued_at',
        sortDirection = 'DESC',
        pageIndex = 1,
        pageSize = 20,
      } = options;

      const { data, error } = await supabase.rpc('udf_get_certificates', {
        p_id: null,
        p_student_id: studentId,
        p_course_id: courseId,
        p_certificate_number: certificateNumber,
        p_template_id: templateId,
        p_is_active: isActive,
        p_issued_after: issuedAfter,
        p_issued_before: issuedBefore,
        p_search_term: searchTerm,
        p_sort_column: sortColumn,
        p_sort_direction: sortDirection,
        p_page_index: pageIndex,
        p_page_size: pageSize,
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      logger.error(`Error fetching certificates: ${err.message}`);
      throw err;
    }
  }

  async findCertificateById(id) {
    try {
      const { data, error } = await supabase.rpc('udf_get_certificates', {
        p_id: null,
        p_student_id: null,
        p_course_id: null,
        p_certificate_number: null,
        p_template_id: null,
        p_is_active: null,
        p_issued_after: null,
        p_issued_before: null,
        p_search_term: null,
        p_sort_column: 'id',
        p_sort_direction: 'ASC',
        p_page_index: 1,
        p_page_size: 10000,
      });

      if (error) throw error;

      const result = data?.find(c => c.cert_id === Number(id));
      return result || null;
    } catch (err) {
      logger.error(`Error finding certificate by ID: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // CREATE — via sp_certificates_insert
  // ─────────────────────────────────────────────────────────────

  async createCertificate(payload) {
    try {
      const {
        studentId,
        courseId,
        enrollmentId,
        certificateTemplateId,
        certificateNumber = null,
        studentNameSnapshot = null,
        courseTitleSnapshot = null,
        verificationUrl = null,
        pdfUrl = null,
        issuedAt = null,
        isActive = true,
        createdBy = null,
      } = payload;

      const { data: newId, error } = await supabase.rpc('sp_certificates_insert', {
        p_student_id: studentId,
        p_course_id: courseId,
        p_enrollment_id: enrollmentId,
        p_certificate_template_id: certificateTemplateId,
        p_certificate_number: certificateNumber,
        p_student_name_snapshot: studentNameSnapshot,
        p_course_title_snapshot: courseTitleSnapshot,
        p_verification_url: verificationUrl,
        p_pdf_url: pdfUrl,
        p_issued_at: issuedAt,
        p_is_active: isActive,
        p_created_by: createdBy,
      });

      if (error) throw error;

      logger.info(`Certificate created: id=${newId}, student=${studentId}, course=${courseId}`);

      const newCert = await this.findCertificateById(newId);
      if (!newCert) {
        throw new Error(`Certificate created (id: ${newId}) but could not be fetched`);
      }

      return newCert;
    } catch (err) {
      logger.error(`Error creating certificate: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // UPDATE — via sp_certificates_update
  // ─────────────────────────────────────────────────────────────

  async updateCertificate(id, payload) {
    try {
      const {
        verificationUrl = null,
        pdfUrl = null,
        issuedAt = null,
        isActive = null,
        updatedBy = null,
      } = payload;

      const { error } = await supabase.rpc('sp_certificates_update', {
        p_id: id,
        p_verification_url: verificationUrl,
        p_pdf_url: pdfUrl,
        p_issued_at: issuedAt,
        p_is_active: isActive,
        p_updated_by: updatedBy,
      });

      if (error) throw error;

      logger.info(`Certificate updated: id=${id}`);

      const updated = await this.findCertificateById(id);
      if (!updated) {
        throw new Error(`Certificate updated but could not be fetched`);
      }

      return updated;
    } catch (err) {
      logger.error(`Error updating certificate ${id}: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // DELETE — via sp_certificates_delete / sp_certificates_delete_batch
  // ─────────────────────────────────────────────────────────────

  async deleteCertificate(id) {
    try {
      const { error } = await supabase.rpc('sp_certificates_delete', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Certificate deleted: id=${id}`);
    } catch (err) {
      logger.error(`Error deleting certificate ${id}: ${err.message}`);
      throw err;
    }
  }

  async bulkDeleteCertificates(ids) {
    try {
      if (!ids || ids.length === 0) {
        throw new Error('No certificate IDs provided for deletion');
      }

      const { error } = await supabase.rpc('sp_certificates_delete_batch', {
        p_ids: ids,
      });

      if (error) throw error;

      logger.info(`Certificates deleted (bulk): ${ids.length} certificates deleted`);
    } catch (err) {
      logger.error(`Error bulk deleting certificates: ${err.message}`);
      throw err;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // RESTORE — via sp_certificates_restore / sp_certificates_restore_batch
  // ─────────────────────────────────────────────────────────────

  async restoreCertificate(id) {
    try {
      const { error } = await supabase.rpc('sp_certificates_restore', {
        p_id: id,
      });

      if (error) throw error;

      logger.info(`Certificate restored: id=${id}`);
    } catch (err) {
      logger.error(`Error restoring certificate ${id}: ${err.message}`);
      throw err;
    }
  }

  async bulkRestoreCertificates(ids) {
    try {
      if (!ids || ids.length === 0) {
        throw new Error('No certificate IDs provided for restoration');
      }

      const { error } = await supabase.rpc('sp_certificates_restore_batch', {
        p_ids: ids,
      });

      if (error) throw error;

      logger.info(`Certificates restored (bulk): ${ids.length} certificates restored`);
    } catch (err) {
      logger.error(`Error bulk restoring certificates: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new CertificateManagementRepository();
