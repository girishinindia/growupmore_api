/**
 * ═══════════════════════════════════════════════════════════════
 * EMAIL SERVICE — Brevo Transactional API
 * ═══════════════════════════════════════════════════════════════
 */

const axios = require('axios');
const config = require('../config');
const logger = require('../config/logger');

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

class EmailService {
  constructor() {
    this.apiKey = config.email.brevoApiKey;
    this.from = {
      name: config.email.fromName,
      email: config.email.from,
    };
  }

  /**
   * Send an email via Brevo API
   * @param {Object} options
   * @param {string} options.to - Recipient email
   * @param {string} options.toName - Recipient name
   * @param {string} options.subject - Email subject
   * @param {string} options.htmlContent - HTML body
   */
  async send({ to, toName, subject, htmlContent }) {
    try {
      const payload = {
        sender: this.from,
        to: [{ email: to, name: toName || to }],
        subject,
        htmlContent,
      };

      const response = await axios.post(BREVO_API_URL, payload, {
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'api-key': this.apiKey,
        },
        timeout: 10000,
      });

      logger.info(`Email sent to ${to} — messageId: ${response.data?.messageId}`);
      return { success: true, messageId: response.data?.messageId };
    } catch (error) {
      logger.error({
        message: `Failed to send email to ${to}`,
        error: error.response?.data || error.message,
      });
      // Don't throw — email failure should NOT block the flow
      return { success: false, error: error.response?.data || error.message };
    }
  }

  /**
   * Send OTP email
   */
  async sendOtp({ to, toName, otp, purpose }) {
    const purposeLabels = {
      registration: 'Registration',
      forgot_password: 'Password Reset',
      change_email: 'Email Change Verification',
      change_mobile: 'Mobile Change Verification',
    };

    const label = purposeLabels[purpose] || 'Verification';

    const htmlContent = `
      <div style="font-family:Arial,sans-serif; max-width:600px; margin:0 auto; padding:30px; background:#ffffff;">
        <div style="text-align:center; padding:20px 0; border-bottom:2px solid #0b5ed7;">
          <h1 style="color:#0b5ed7; margin:0;">Grow Up More</h1>
          <p style="color:#666; margin:5px 0 0;">E-Learning Platform</p>
        </div>
        <div style="padding:30px 0;">
          <h2 style="color:#333;">Your OTP for ${label}</h2>
          <p style="color:#555; line-height:1.8;">
            Dear ${toName || 'User'},
          </p>
          <div style="text-align:center; margin:25px 0;">
            <div style="display:inline-block; background:#f0f7ff; border:2px dashed #0b5ed7; border-radius:12px; padding:20px 40px;">
              <span style="font-size:36px; font-weight:bold; letter-spacing:8px; color:#0b5ed7;">${otp}</span>
            </div>
          </div>
          <p style="color:#555; line-height:1.8;">
            This OTP is valid for <strong>${config.otp.expiryMinutes} minutes</strong>.
            Do not share this code with anyone.
          </p>
          <p style="color:#999; font-size:13px; margin-top:20px;">
            If you did not request this OTP, please ignore this email.
          </p>
        </div>
        <div style="text-align:center; padding:20px 0; border-top:1px solid #eee; color:#999; font-size:12px;">
          &copy; ${new Date().getFullYear()} Grow Up More | GrowUpMore.com
        </div>
      </div>
    `;

    return this.send({
      to,
      toName,
      subject: `${otp} is your ${label} OTP — Grow Up More`,
      htmlContent,
    });
  }
}

module.exports = new EmailService();
