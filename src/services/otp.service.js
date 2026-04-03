/**
 * OTP SERVICE — Generate, Store, Verify OTPs via Redis
 */

const redis = require('../config/redis');
const config = require('../config/index');
const logger = require('../config/logger');
const { generateOTP } = require('../utils/helpers');
const { ValidationError, RateLimitError } = require('../utils/errors');

const OTP_PREFIX = 'otp';
const OTP_COOLDOWN_PREFIX = 'otp_cooldown';
const OTP_ATTEMPTS_PREFIX = 'otp_attempts';

class OtpService {
  /**
   * Generate and store OTP for a target (email or mobile)
   * @param {string} target - email or mobile number
   * @param {string} purpose - 'register', 'login', 'reset_password', 'change_email', 'change_mobile', 'verify_email', 'verify_mobile'
   * @returns {string} The generated OTP
   */
  async generate(target, purpose = 'register') {
    const key = `${OTP_PREFIX}:${purpose}:${target}`;
    const cooldownKey = `${OTP_COOLDOWN_PREFIX}:${purpose}:${target}`;

    // Check cooldown (prevent rapid resend)
    const cooldown = await redis.get(cooldownKey);
    if (cooldown) {
      const ttl = await redis.ttl(cooldownKey);
      throw new RateLimitError(
        `Please wait ${ttl > 0 ? ttl : config.otp.resendCooldownSeconds} seconds before requesting a new OTP.`
      );
    }

    // Generate OTP
    const otp = generateOTP(config.otp.length);
    const expirySeconds = config.otp.expiryMinutes * 60;

    // Store OTP in Redis with expiry
    const otpData = JSON.stringify({
      otp,
      purpose,
      target,
      attempts: 0,
      createdAt: new Date().toISOString(),
    });

    await redis.set(key, otpData, 'EX', expirySeconds);

    // Set cooldown
    await redis.set(cooldownKey, '1', 'EX', config.otp.resendCooldownSeconds);

    logger.debug({ target, purpose }, 'OTP generated and stored');

    return otp;
  }

  /**
   * Verify an OTP
   * @param {string} target - email or mobile number
   * @param {string} otp - The OTP to verify
   * @param {string} purpose - Must match the purpose used during generation
   * @returns {boolean} true if valid
   */
  async verify(target, otp, purpose = 'register') {
    const key = `${OTP_PREFIX}:${purpose}:${target}`;
    const attemptsKey = `${OTP_ATTEMPTS_PREFIX}:${purpose}:${target}`;

    // Check max attempts
    const attempts = parseInt(await redis.get(attemptsKey) || '0', 10);
    if (attempts >= config.otp.maxAttempts) {
      // Delete the OTP — force regeneration
      await redis.del(key);
      await redis.del(attemptsKey);
      throw new ValidationError(
        'Maximum OTP verification attempts exceeded. Please request a new OTP.'
      );
    }

    // Get stored OTP
    const stored = await redis.get(key);
    if (!stored) {
      throw new ValidationError('OTP has expired or was not found. Please request a new OTP.');
    }

    const otpData = JSON.parse(stored);

    // Increment attempts
    await redis.set(attemptsKey, String(attempts + 1), 'EX', config.otp.expiryMinutes * 60);

    // Verify OTP
    if (otpData.otp !== otp) {
      const remaining = config.otp.maxAttempts - (attempts + 1);
      throw new ValidationError(
        `Invalid OTP. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`
      );
    }

    // OTP is valid — clean up
    await redis.del(key);
    await redis.del(attemptsKey);
    await redis.del(`${OTP_COOLDOWN_PREFIX}:${purpose}:${target}`);

    logger.debug({ target, purpose }, 'OTP verified successfully');
    return true;
  }

  /**
   * Invalidate any existing OTP for a target
   */
  async invalidate(target, purpose = 'register') {
    const key = `${OTP_PREFIX}:${purpose}:${target}`;
    const attemptsKey = `${OTP_ATTEMPTS_PREFIX}:${purpose}:${target}`;
    const cooldownKey = `${OTP_COOLDOWN_PREFIX}:${purpose}:${target}`;
    await redis.del(key);
    await redis.del(attemptsKey);
    await redis.del(cooldownKey);
  }

  /**
   * Check if OTP exists (without verifying)
   */
  async exists(target, purpose = 'register') {
    const key = `${OTP_PREFIX}:${purpose}:${target}`;
    return (await redis.exists(key)) === 1;
  }
}

module.exports = new OtpService();
