/**
 * ═══════════════════════════════════════════════════════════════
 * OTP SERVICE — Generate, Store, Verify, Resend Cooldown
 * ═══════════════════════════════════════════════════════════════
 * OTPs are stored in Redis with TTL.
 * Key format:  otp:{purpose}:{identifier}
 * Cooldown:    otp_cooldown:{purpose}:{identifier}
 * Attempts:    otp_attempts:{purpose}:{identifier}
 * ═══════════════════════════════════════════════════════════════
 */

const redis = require('../config/redis');
const config = require('../config');
const { generateOtp } = require('../utils/helpers');
const { BadRequestError, TooManyRequestsError } = require('../utils/errors');
const { REDIS_PREFIXES } = require('../utils/constants');
const logger = require('../config/logger');

class OtpService {
  /**
   * Generate and store an OTP in Redis
   * @param {string} purpose - e.g. 'registration', 'forgot_password'
   * @param {string} identifier - email or mobile
   * @returns {{ otp: string, expiresInSeconds: number }}
   */
  async generate(purpose, identifier) {
    const cooldownKey = `${REDIS_PREFIXES.OTP_COOLDOWN}:${purpose}:${identifier}`;
    const otpKey = `${REDIS_PREFIXES.OTP}:${purpose}:${identifier}`;
    const attemptsKey = `${REDIS_PREFIXES.OTP_ATTEMPTS}:${purpose}:${identifier}`;

    // Check resend cooldown (60 seconds)
    const cooldownTtl = await redis.ttl(cooldownKey);
    if (cooldownTtl > 0) {
      throw new TooManyRequestsError(
        `Please wait ${cooldownTtl} seconds before requesting a new OTP`,
      );
    }

    // Generate OTP
    const otp = generateOtp();
    const expiresInSeconds = config.otp.expiryMinutes * 60;

    // Store OTP in Redis with TTL
    await redis.set(otpKey, otp, 'EX', expiresInSeconds);

    // Reset attempt counter
    await redis.set(attemptsKey, '0', 'EX', expiresInSeconds);

    // Set resend cooldown
    await redis.set(cooldownKey, '1', 'EX', config.otp.resendCooldownSeconds);

    logger.info(`OTP generated for ${purpose}:${identifier}`);

    return { otp, expiresInSeconds };
  }

  /**
   * Verify an OTP
   * @param {string} purpose
   * @param {string} identifier
   * @param {string} inputOtp
   * @returns {boolean}
   */
  async verify(purpose, identifier, inputOtp) {
    const otpKey = `${REDIS_PREFIXES.OTP}:${purpose}:${identifier}`;
    const attemptsKey = `${REDIS_PREFIXES.OTP_ATTEMPTS}:${purpose}:${identifier}`;

    // Check if OTP exists
    const storedOtp = await redis.get(otpKey);
    if (!storedOtp) {
      throw new BadRequestError('OTP has expired or was not generated. Please request a new one.');
    }

    // Check attempt count
    const attempts = parseInt(await redis.get(attemptsKey) || '0', 10);
    if (attempts >= config.otp.maxAttempts) {
      // Delete the OTP — force re-request
      await redis.del(otpKey, attemptsKey);
      throw new TooManyRequestsError(
        'Maximum OTP attempts exceeded. Please request a new OTP.',
      );
    }

    // Increment attempt
    await redis.incr(attemptsKey);

    // Compare
    if (storedOtp !== inputOtp) {
      const remaining = config.otp.maxAttempts - (attempts + 1);
      throw new BadRequestError(
        `Invalid OTP. ${remaining} attempt(s) remaining.`,
      );
    }

    // OTP is valid — clean up
    await redis.del(otpKey, attemptsKey, `${REDIS_PREFIXES.OTP_COOLDOWN}:${purpose}:${identifier}`);

    logger.info(`OTP verified for ${purpose}:${identifier}`);
    return true;
  }

  /**
   * Check cooldown status (for resend endpoint)
   * @param {string} purpose
   * @param {string} identifier
   * @returns {{ canResend: boolean, waitSeconds: number }}
   */
  async checkCooldown(purpose, identifier) {
    const cooldownKey = `${REDIS_PREFIXES.OTP_COOLDOWN}:${purpose}:${identifier}`;
    const ttl = await redis.ttl(cooldownKey);

    if (ttl > 0) {
      return { canResend: false, waitSeconds: ttl };
    }

    return { canResend: true, waitSeconds: 0 };
  }
}

module.exports = new OtpService();
