/**
 * ═══════════════════════════════════════════════════════════════
 * SMS SERVICE — SMS Gateway Hub (DLT Compliant)
 * ═══════════════════════════════════════════════════════════════
 * DLT Template: "Dear {#var#}, OTP is for new user registration
 * is {#var#}. Thank You, Genius ITens (Grow Up More)"
 * ═══════════════════════════════════════════════════════════════
 */

const axios = require('axios');
const config = require('../config');
const logger = require('../config/logger');

const SMS_API_URL = 'https://www.smsgatewayhub.com/api/mt/SendSMS';

class SmsService {
  constructor() {
    this.apiKey = config.sms.apiKey;
    this.senderId = config.sms.senderId;
    this.route = config.sms.route;
    this.channel = config.sms.channel;
    this.dcs = config.sms.dcs;
    this.flash = config.sms.flash;
    this.entityId = config.sms.entityId;
    this.dltTemplateId = config.sms.dltTemplateId;
  }

  /**
   * Send OTP SMS via SMS Gateway Hub
   * @param {Object} options
   * @param {string} options.mobile - Mobile number (10 digits without country code)
   * @param {string} options.name - Recipient name (1st DLT variable)
   * @param {string} options.otp - OTP value (2nd DLT variable)
   */
  async sendOtp({ mobile, name, otp }) {
    try {
      // Prepend country code 91 (India) for SMS gateway — stored as 10 digits internally
      const mobileWithCode = mobile.length === 10 ? `91${mobile}` : mobile;

      // DLT template must match exactly
      const text = `Dear ${name}, OTP is for new user registration is ${otp}. Thank You, Genius ITens (Grow Up More)`;

      const params = new URLSearchParams({
        APIKey: this.apiKey,
        senderid: this.senderId,
        channel: this.channel,
        DCS: this.dcs,
        flashsms: this.flash,
        number: mobileWithCode,
        text,
        route: this.route,
        EntityId: this.entityId,
        dlttemplateid: this.dltTemplateId,
      });

      const url = `${SMS_API_URL}?${params.toString()}`;

      const response = await axios.get(url, { timeout: 10000 });

      logger.info(`SMS sent to ${mobile} — response: ${JSON.stringify(response.data)}`);
      return { success: true, data: response.data };
    } catch (error) {
      logger.error({
        message: `Failed to send SMS to ${mobile}`,
        error: error.response?.data || error.message,
      });
      // Don't throw — SMS failure should NOT block the flow
      return { success: false, error: error.response?.data || error.message };
    }
  }
}

module.exports = new SmsService();
