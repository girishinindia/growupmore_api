/**
 * EMAIL SERVICE — Brevo (Sendinblue) Transactional Emails
 * Uses Handlebars templates with a beautiful light-blue theme
 */

const { BrevoClient } = require('@getbrevo/brevo');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const config = require('../config/index');
const logger = require('../config/logger');
const { ServiceUnavailableError } = require('../utils/errors');

class EmailService {
  constructor() {
    this.client = null;
    this.templates = {};
    this._initBrevo();
    this._loadTemplates();
  }

  _initBrevo() {
    if (!config.email.brevoApiKey) {
      logger.warn('Brevo API key not configured. Emails will be logged only.');
      return;
    }

    this.client = new BrevoClient({ apiKey: config.email.brevoApiKey });
  }

  _loadTemplates() {
    const templateDir = path.join(__dirname, '../templates/email');
    const templateFiles = [
      'base',
      'otp',
      'welcome',
      'password-reset',
      'password-changed',
      'admin-new-user',
      'email-change',
      'mobile-change',
      'login-alert',
    ];

    // Register base as partial
    try {
      const basePath = path.join(templateDir, 'base.hbs');
      if (fs.existsSync(basePath)) {
        const baseTemplate = fs.readFileSync(basePath, 'utf8');
        handlebars.registerPartial('base', baseTemplate);
      }
    } catch (err) {
      logger.warn({ err }, 'Failed to load base email template');
    }

    // Load all templates
    for (const name of templateFiles) {
      try {
        const filePath = path.join(templateDir, `${name}.hbs`);
        if (fs.existsSync(filePath)) {
          const source = fs.readFileSync(filePath, 'utf8');
          this.templates[name] = handlebars.compile(source);
        }
      } catch (err) {
        logger.warn({ err, template: name }, 'Failed to load email template');
      }
    }

    logger.debug({ loaded: Object.keys(this.templates) }, 'Email templates loaded');
  }

  /**
   * Render a template with data
   */
  _render(templateName, data) {
    const template = this.templates[templateName];
    if (!template) {
      logger.warn({ templateName }, 'Email template not found, using fallback');
      return `<p>${data.message || 'No content'}</p>`;
    }
    return template({
      ...data,
      appName: config.appName,
      appUrl: config.appUrl,
      year: new Date().getFullYear(),
      supportEmail: config.email.from,
    });
  }

  /**
   * Send an email via Brevo
   */
  async send({ to, subject, templateName, data, toName = '' }) {
    const html = this._render(templateName, data);

    // In dev or if Brevo not configured, just log
    if (!this.client) {
      logger.info({
        to,
        subject,
        templateName,
        otp: data.otp || null,
      }, 'EMAIL (not sent — Brevo not configured)');

      if (config.isDev) {
        logger.info(`\n📧 EMAIL PREVIEW:\n  To: ${to}\n  Subject: ${subject}\n  OTP: ${data.otp || 'N/A'}\n`);
      }
      return { success: true, preview: true };
    }

    try {
      const result = await this.client.transactionalEmails.sendTransacEmail({
        sender: {
          name: config.email.fromName,
          email: config.email.from,
        },
        to: [{ email: to, name: toName || to }],
        subject,
        htmlContent: html,
      });

      logger.info({ to, subject, messageId: result.messageId }, 'Email sent successfully');
      return { success: true, messageId: result.messageId };
    } catch (err) {
      logger.error({ err, to, subject }, 'Failed to send email');
      // Don't throw — email failure shouldn't block the main flow
      return { success: false, error: err.message };
    }
  }

  // ─── Convenience Methods ─────────────────────────────────

  async sendOtp({ to, toName, otp, purpose, expiryMinutes }) {
    const purposeMap = {
      register: 'Complete Your Registration',
      verify_email: 'Verify Your Email Address',
      verify_mobile: 'Verify Your Mobile Number',
      reset_password: 'Reset Your Password',
      change_email: 'Verify Your New Email Address',
      change_mobile: 'Verify Your New Mobile Number',
      login: 'Login Verification',
    };

    const subject = `${purposeMap[purpose] || 'Your OTP'} — ${config.appName}`;

    return this.send({
      to,
      toName,
      subject,
      templateName: 'otp',
      data: {
        name: toName || to,
        otp,
        purpose,
        purposeLabel: purposeMap[purpose] || 'Verification',
        expiryMinutes: expiryMinutes || config.otp.expiryMinutes,
      },
    });
  }

  async sendWelcome({ to, toName }) {
    return this.send({
      to,
      toName,
      subject: `Welcome to ${config.appName}! 🎉`,
      templateName: 'welcome',
      data: { name: toName || to },
    });
  }

  async sendPasswordResetOtp({ to, toName, otp }) {
    return this.send({
      to,
      toName,
      subject: `Password Reset — ${config.appName}`,
      templateName: 'password-reset',
      data: {
        name: toName || to,
        otp,
        expiryMinutes: config.otp.expiryMinutes,
      },
    });
  }

  async sendPasswordChanged({ to, toName }) {
    return this.send({
      to,
      toName,
      subject: `Password Changed — ${config.appName}`,
      templateName: 'password-changed',
      data: { name: toName || to },
    });
  }

  async sendAdminNewUserNotification({ user }) {
    const adminEmail = config.email.adminNotify || config.email.admin;
    return this.send({
      to: adminEmail,
      subject: `New User Registration — ${config.appName}`,
      templateName: 'admin-new-user',
      data: {
        name: 'Admin',
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          registeredAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        },
      },
    });
  }

  async sendEmailChangeOtp({ to, toName, otp, newEmail }) {
    return this.send({
      to: newEmail,
      toName,
      subject: `Verify Your New Email — ${config.appName}`,
      templateName: 'email-change',
      data: {
        name: toName || to,
        otp,
        newEmail,
        expiryMinutes: config.otp.expiryMinutes,
      },
    });
  }

  async sendMobileChangeOtp({ to, toName, otp }) {
    // This sends to the user's current email as notification
    return this.send({
      to,
      toName,
      subject: `Mobile Number Change Requested — ${config.appName}`,
      templateName: 'mobile-change',
      data: {
        name: toName || to,
        otp,
        expiryMinutes: config.otp.expiryMinutes,
      },
    });
  }

  async sendLoginAlert({ to, toName, ip, userAgent, timestamp }) {
    return this.send({
      to,
      toName,
      subject: `New Login Detected — ${config.appName}`,
      templateName: 'login-alert',
      data: {
        name: toName || to,
        ip: ip || 'Unknown',
        userAgent: userAgent || 'Unknown',
        timestamp: timestamp || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      },
    });
  }
}

module.exports = new EmailService();
