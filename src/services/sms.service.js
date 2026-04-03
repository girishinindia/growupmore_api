/**
 * SMS SERVICE — SMSGatewayHub Integration (DLT Compliant)
 * Sends OTP via SMS using SMSGatewayHub HTTP API
 *
 * DLT Template (Entity ID: configured in .env):
 *   "Dear {#var#}, OTP is for new user registration is {#var#}. Thank You, Genius ITens (Grow Up More)"
 */

const config = require('../config/index');
const logger = require('../config/logger');

class SmsService {
  constructor() {
    this.baseUrl = 'https://www.smsgatewayhub.com/api/mt/SendSMS';
    this.configured = !!config.sms.apiKey;

    if (!this.configured) {
      logger.warn('SMS API key not configured. SMS will be logged only.');
    }
  }

  /**
   * Send an SMS via SMSGatewayHub
   * @param {string} mobile - 10-digit Indian mobile (will be prefixed with 91)
   * @param {string} message - SMS body (must match DLT template)
   * @returns {{ success: boolean, messageId?: string, error?: string }}
   */
  async send(mobile, message) {
    // Clean to 10-digit
    const cleanMobile = mobile.replace(/\D/g, '');
    const tenDigit = cleanMobile.length === 12 && cleanMobile.startsWith('91')
      ? cleanMobile.slice(2)
      : cleanMobile.length === 10
        ? cleanMobile
        : cleanMobile;

    // In dev or if not configured, just log
    if (!this.configured) {
      logger.info({
        mobile: tenDigit,
        message,
      }, 'SMS (not sent — SMS API key not configured)');

      if (config.isDev) {
        logger.info(`\n📱 SMS PREVIEW:\n  To: +91${tenDigit}\n  Message: ${message}\n`);
      }
      return { success: true, preview: true };
    }

    const params = new URLSearchParams({
      APIKey: config.sms.apiKey,
      senderid: config.sms.senderId,
      channel: config.sms.channel,
      DCS: config.sms.dcs,
      flashsms: config.sms.flash,
      number: `91${tenDigit}`,
      text: message,
      route: config.sms.route,
      EntityId: config.sms.entityId,
      dlttemplateid: config.sms.dltTemplateId,
    });

    const url = `${this.baseUrl}?${params.toString()}`;

    try {
      const response = await fetch(url, { method: 'GET' });
      const raw = await response.text();

      let parsed = null;
      try {
        parsed = JSON.parse(raw);
      } catch {
        // Response is not JSON
      }

      if (response.ok && parsed && (parsed.ErrorCode === '000' || parsed.ErrorMessage === 'Success')) {
        logger.info({ mobile: tenDigit, status: response.status }, 'SMS sent successfully');
        return { success: true, messageId: parsed.MessageId || parsed.JobId || null };
      }

      logger.error({ mobile: tenDigit, status: response.status, raw }, 'SMS send failed');
      return { success: false, error: raw };
    } catch (err) {
      logger.error({ err, mobile: tenDigit }, 'Failed to send SMS');
      return { success: false, error: err.message };
    }
  }

  /**
   * Send OTP SMS using the registered DLT template
   * DLT template: "Dear {NAME}, OTP is for new user registration is {OTP}. Thank You, Genius ITens (Grow Up More)"
   *
   * @param {Object} params
   * @param {string} params.mobile - 10-digit mobile
   * @param {string} params.name - Recipient name
   * @param {string} params.otp - 6-digit OTP
   * @returns {{ success: boolean }}
   */
  async sendOtp({ mobile, name, otp }) {
    const message = `Dear ${name}, OTP is for new user registration is ${otp}. Thank You, Genius ITens (Grow Up More)`;
    return this.send(mobile, message);
  }
}

module.exports = new SmsService();
