/**
 * AUTH SERVICE — Complete Authentication & Authorization
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/index');
const logger = require('../config/logger');
const redis = require('../config/redis');
const userRepository = require('../repositories/user.repository');
const otpService = require('./otp.service');
const emailService = require('./email.service');
const smsService = require('./sms.service');
const { AuthenticationError, ValidationError, ConflictError, NotFoundError, ForbiddenError } = require('../utils/errors');
const { formatIndianMobile, maskEmail, maskPhone } = require('../utils/helpers');

// Redis key prefixes for pending registration
const PENDING_REG_PREFIX = 'pending_reg';
const PENDING_REG_TTL = 600; // 10 minutes to complete both OTP verifications

class AuthService {
  // ─── REGISTER (Step 1 — Validate, store pending, send OTPs to both email & mobile) ──
  async register(payload) {
    const { first_name, last_name, email, mobile, password, country_id } = payload;
    const formattedMobile = formatIndianMobile(mobile);
    const lowerEmail = email.toLowerCase();

    // Check existing email
    const existingEmail = await userRepository.findByEmail(lowerEmail);
    if (existingEmail) {
      throw new ConflictError('An account with this email already exists.');
    }

    // Check existing mobile
    const existingMobile = await userRepository.findByMobile(formattedMobile);
    if (existingMobile) {
      throw new ConflictError('An account with this mobile number already exists.');
    }

    // Hash password upfront (store in pending data)
    const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);

    // Create a unique registration token
    const regToken = require('crypto').randomBytes(32).toString('hex');

    // Store pending registration in Redis (NOT in the DB yet)
    const pendingData = {
      first_name,
      last_name,
      email: lowerEmail,
      mobile: formattedMobile,
      password: hashedPassword,
      country_id: country_id || 1,
      email_verified: false,
      mobile_verified: false,
      created_at: new Date().toISOString(),
    };

    await redis.set(
      `${PENDING_REG_PREFIX}:${regToken}`,
      JSON.stringify(pendingData),
      'EX',
      PENDING_REG_TTL
    );

    // Also index by email & mobile so we can look up the regToken
    await redis.set(`${PENDING_REG_PREFIX}_email:${lowerEmail}`, regToken, 'EX', PENDING_REG_TTL);
    await redis.set(`${PENDING_REG_PREFIX}_mobile:${formattedMobile}`, regToken, 'EX', PENDING_REG_TTL);

    // Generate OTPs for both email and mobile
    const emailOtp = await otpService.generate(lowerEmail, 'verify_email');
    const mobileOtp = await otpService.generate(formattedMobile, 'verify_mobile');

    // Send Email OTP via Brevo
    await emailService.sendOtp({
      to: lowerEmail,
      toName: first_name,
      otp: emailOtp,
      purpose: 'verify_email',
      expiryMinutes: config.otp.expiryMinutes,
    });

    // Send Mobile OTP via SMSGatewayHub
    smsService.sendOtp({
      mobile: formattedMobile,
      name: first_name,
      otp: mobileOtp,
    }).catch(err => {
      logger.warn({ err, mobile: formattedMobile }, 'Failed to send registration SMS OTP');
    });

    logger.info({ email: lowerEmail, mobile: formattedMobile }, 'Registration initiated — OTPs sent to email & mobile');

    return {
      registration_token: regToken,
      message: `OTPs have been sent to ${maskEmail(lowerEmail)} and ${maskPhone(formattedMobile)}. Please verify both to complete registration.`,
    };
  }

  // ─── VERIFY REGISTRATION EMAIL OTP (Step 2a) ──────────────
  async verifyRegistrationEmailOtp({ registration_token, otp }) {
    const pendingRaw = await redis.get(`${PENDING_REG_PREFIX}:${registration_token}`);
    if (!pendingRaw) {
      throw new ValidationError('Registration session expired or invalid. Please register again.');
    }

    const pending = JSON.parse(pendingRaw);

    if (pending.email_verified) {
      return {
        registration_token,
        email_verified: true,
        mobile_verified: pending.mobile_verified,
        message: 'Email is already verified.',
      };
    }

    // Verify the OTP
    await otpService.verify(pending.email, otp, 'verify_email');

    // Mark email as verified in pending data
    pending.email_verified = true;
    const ttl = await redis.ttl(`${PENDING_REG_PREFIX}:${registration_token}`);
    await redis.set(
      `${PENDING_REG_PREFIX}:${registration_token}`,
      JSON.stringify(pending),
      'EX',
      ttl > 0 ? ttl : PENDING_REG_TTL
    );

    logger.info({ email: pending.email }, 'Registration email OTP verified');

    // If both verified, finalize registration
    if (pending.email_verified && pending.mobile_verified) {
      return this._finalizeRegistration(registration_token, pending);
    }

    return {
      registration_token,
      email_verified: true,
      mobile_verified: pending.mobile_verified,
      message: 'Email verified. Please verify your mobile number to complete registration.',
    };
  }

  // ─── VERIFY REGISTRATION MOBILE OTP (Step 2b) ─────────────
  async verifyRegistrationMobileOtp({ registration_token, otp }) {
    const pendingRaw = await redis.get(`${PENDING_REG_PREFIX}:${registration_token}`);
    if (!pendingRaw) {
      throw new ValidationError('Registration session expired or invalid. Please register again.');
    }

    const pending = JSON.parse(pendingRaw);

    if (pending.mobile_verified) {
      return {
        registration_token,
        email_verified: pending.email_verified,
        mobile_verified: true,
        message: 'Mobile is already verified.',
      };
    }

    // Verify the OTP
    await otpService.verify(pending.mobile, otp, 'verify_mobile');

    // Mark mobile as verified in pending data
    pending.mobile_verified = true;
    const ttl = await redis.ttl(`${PENDING_REG_PREFIX}:${registration_token}`);
    await redis.set(
      `${PENDING_REG_PREFIX}:${registration_token}`,
      JSON.stringify(pending),
      'EX',
      ttl > 0 ? ttl : PENDING_REG_TTL
    );

    logger.info({ mobile: pending.mobile }, 'Registration mobile OTP verified');

    // If both verified, finalize registration
    if (pending.email_verified && pending.mobile_verified) {
      return this._finalizeRegistration(registration_token, pending);
    }

    return {
      registration_token,
      email_verified: pending.email_verified,
      mobile_verified: true,
      message: 'Mobile verified. Please verify your email to complete registration.',
    };
  }

  // ─── RESEND REGISTRATION OTP ───────────────────────────────
  async resendRegistrationOtp({ registration_token, channel }) {
    const pendingRaw = await redis.get(`${PENDING_REG_PREFIX}:${registration_token}`);
    if (!pendingRaw) {
      throw new ValidationError('Registration session expired or invalid. Please register again.');
    }

    const pending = JSON.parse(pendingRaw);

    if (channel === 'email') {
      if (pending.email_verified) {
        return { message: 'Email is already verified.' };
      }
      const otp = await otpService.generate(pending.email, 'verify_email');
      await emailService.sendOtp({
        to: pending.email,
        toName: pending.first_name,
        otp,
        purpose: 'verify_email',
        expiryMinutes: config.otp.expiryMinutes,
      });
      return { message: `OTP resent to ${maskEmail(pending.email)}.` };
    }

    if (channel === 'mobile') {
      if (pending.mobile_verified) {
        return { message: 'Mobile is already verified.' };
      }
      const otp = await otpService.generate(pending.mobile, 'verify_mobile');
      smsService.sendOtp({
        mobile: pending.mobile,
        name: pending.first_name,
        otp,
      }).catch(err => {
        logger.warn({ err }, 'Failed to resend registration SMS OTP');
      });
      return { message: `OTP resent to ${maskPhone(pending.mobile)}.` };
    }

    throw new ValidationError('Invalid channel. Use "email" or "mobile".');
  }

  // ─── FINALIZE REGISTRATION (internal — both OTPs verified) ──
  async _finalizeRegistration(regToken, pending) {
    // Double-check no one registered with same email/mobile in the meantime
    const existingEmail = await userRepository.findByEmail(pending.email);
    if (existingEmail) {
      await this._cleanupPendingRegistration(regToken, pending);
      throw new ConflictError('An account with this email was created while you were verifying. Please try again.');
    }

    const existingMobile = await userRepository.findByMobile(pending.mobile);
    if (existingMobile) {
      await this._cleanupPendingRegistration(regToken, pending);
      throw new ConflictError('An account with this mobile number was created while you were verifying. Please try again.');
    }

    // NOW create the user in the database (both OTPs verified)
    const user = await userRepository.create({
      first_name: pending.first_name,
      last_name: pending.last_name,
      email: pending.email,
      mobile: pending.mobile,
      password: pending.password,
      role: 'student',
      country_id: pending.country_id,
    });

    // Mark both as verified in DB
    await userRepository.markEmailVerified(user.id);
    await userRepository.markMobileVerified(user.id);

    // Cleanup Redis pending data
    await this._cleanupPendingRegistration(regToken, pending);

    // Send welcome email (non-blocking)
    emailService.sendWelcome({ to: pending.email, toName: pending.first_name }).catch(err => {
      logger.warn({ err }, 'Failed to send welcome email');
    });

    // Notify admin (non-blocking)
    emailService.sendAdminNewUserNotification({ user: { ...user, mobile: pending.mobile } }).catch(err => {
      logger.warn({ err }, 'Failed to send admin notification');
    });

    // Generate tokens — user is fully verified
    const tokens = this._generateTokens({ ...user, is_email_verified: true, is_mobile_verified: true });

    logger.info({ userId: user.id, email: pending.email }, 'User registration completed — both OTPs verified');

    return {
      user: this._sanitizeUser({ ...user, is_email_verified: true, is_mobile_verified: true }),
      tokens,
      registration_complete: true,
      message: 'Registration complete! Both email and mobile verified. Welcome to GrowUpMore!',
    };
  }

  async _cleanupPendingRegistration(regToken, pending) {
    await redis.del(`${PENDING_REG_PREFIX}:${regToken}`);
    if (pending.email) await redis.del(`${PENDING_REG_PREFIX}_email:${pending.email}`);
    if (pending.mobile) await redis.del(`${PENDING_REG_PREFIX}_mobile:${pending.mobile}`);
  }

  // ─── VERIFY EMAIL OTP (for existing users — e.g. login re-verification) ──
  async verifyEmailOtp({ email, otp }) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new NotFoundError('User');

    await otpService.verify(email.toLowerCase(), otp, 'verify_email');
    await userRepository.markEmailVerified(user.id);

    logger.info({ userId: user.id }, 'Email verified successfully');

    // Check if both are now verified
    const updatedUser = await userRepository.findById(user.id);
    if (updatedUser.is_email_verified && updatedUser.is_mobile_verified) {
      const tokens = this._generateTokens(updatedUser);
      return {
        user: this._sanitizeUser(updatedUser),
        tokens,
        message: 'Email verified successfully.',
      };
    }

    return {
      message: 'Email verified successfully. Please also verify your mobile number.',
      email_verified: true,
      mobile_verified: updatedUser.is_mobile_verified,
    };
  }

  // ─── VERIFY MOBILE OTP (for existing users) ───────────────
  async verifyMobileOtp({ mobile, otp }) {
    const formattedMobile = formatIndianMobile(mobile);
    const user = await userRepository.findByMobile(formattedMobile);
    if (!user) throw new NotFoundError('User');

    await otpService.verify(formattedMobile, otp, 'verify_mobile');
    await userRepository.markMobileVerified(user.id);

    logger.info({ userId: user.id }, 'Mobile verified successfully');

    // Check if both are now verified
    const updatedUser = await userRepository.findById(user.id);
    if (updatedUser.is_email_verified && updatedUser.is_mobile_verified) {
      const tokens = this._generateTokens(updatedUser);
      return {
        user: this._sanitizeUser(updatedUser),
        tokens,
        message: 'Mobile verified successfully.',
      };
    }

    return {
      message: 'Mobile verified successfully. Please also verify your email.',
      email_verified: updatedUser.is_email_verified,
      mobile_verified: true,
    };
  }

  // ─── RESEND OTP (for existing users) ───────────────────────
  async resendOtp({ email, purpose }) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new NotFoundError('User');

    const target = email.toLowerCase();

    if (purpose === 'verify_mobile' && user.mobile) {
      // Send mobile OTP via SMS
      const otp = await otpService.generate(user.mobile, 'verify_mobile');
      smsService.sendOtp({
        mobile: user.mobile,
        name: user.first_name,
        otp,
      }).catch(err => {
        logger.warn({ err }, 'Failed to resend mobile OTP');
      });
      return { message: `OTP sent to ${maskPhone(user.mobile)}.` };
    }

    // Default: send email OTP
    const otp = await otpService.generate(target, purpose || 'verify_email');
    await emailService.sendOtp({
      to: target,
      toName: user.first_name,
      otp,
      purpose: purpose || 'verify_email',
      expiryMinutes: config.otp.expiryMinutes,
    });

    return { message: `OTP sent to ${maskEmail(email)}.` };
  }

  // ─── LOGIN ──────────────────────────────────────────────
  async login({ identifier, password, ip, userAgent }) {
    // identifier can be email or mobile
    let user;

    if (identifier.includes('@')) {
      user = await userRepository.findByEmail(identifier);
    } else {
      const formatted = formatIndianMobile(identifier);
      user = await userRepository.findByMobile(formatted);
    }

    if (!user) {
      throw new AuthenticationError('Invalid credentials.');
    }

    if (!user.is_active) {
      throw new AuthenticationError('Your account has been deactivated. Please contact support.');
    }

    if (user.is_deleted) {
      throw new AuthenticationError('Invalid credentials.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid credentials.');
    }

    // Check both email and mobile verification
    if (!user.is_email_verified || !user.is_mobile_verified) {
      const unverified = [];

      if (!user.is_email_verified) {
        const emailOtp = await otpService.generate(user.email, 'verify_email');
        await emailService.sendOtp({
          to: user.email,
          toName: user.first_name,
          otp: emailOtp,
          purpose: 'verify_email',
        });
        unverified.push('email');
      }

      if (!user.is_mobile_verified && user.mobile) {
        const mobileOtp = await otpService.generate(user.mobile, 'verify_mobile');
        smsService.sendOtp({
          mobile: user.mobile,
          name: user.first_name,
          otp: mobileOtp,
        }).catch(err => {
          logger.warn({ err }, 'Failed to send login mobile OTP');
        });
        unverified.push('mobile');
      }

      throw new AuthenticationError(
        `${unverified.join(' and ')} not verified. New OTP(s) have been sent for verification.`
      );
    }

    // Generate tokens
    const tokens = this._generateTokens(user);

    // Update last login
    userRepository.updateLastLogin(user.id).catch(() => {});

    // Store session in Redis
    await this._storeSession(user.id, tokens.accessToken);

    // Send login alert (non-blocking)
    emailService.sendLoginAlert({
      to: user.email,
      toName: user.first_name,
      ip,
      userAgent,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: config.timezone }),
    }).catch(() => {});

    logger.info({ userId: user.id }, 'User logged in');

    return {
      user: this._sanitizeUser(user),
      tokens,
    };
  }

  // ─── FORGOT PASSWORD ───────────────────────────────────
  async forgotPassword({ identifier }) {
    let user;

    if (identifier.includes('@')) {
      user = await userRepository.findByEmail(identifier);
    } else {
      const formatted = formatIndianMobile(identifier);
      user = await userRepository.findByMobile(formatted);
    }

    // Don't reveal if user exists
    if (!user) {
      return { message: 'If an account exists with this email/mobile, an OTP has been sent.' };
    }

    if (!user.email) {
      throw new ValidationError('No email address associated with this account.');
    }

    // Generate OTP for password reset
    const otp = await otpService.generate(user.email, 'reset_password');

    await emailService.sendPasswordResetOtp({
      to: user.email,
      toName: user.first_name,
      otp,
    });

    logger.info({ userId: user.id }, 'Password reset OTP sent');

    return { message: 'If an account exists with this email/mobile, an OTP has been sent.' };
  }

  // ─── VERIFY RESET OTP (Step 1 of password reset) ───────
  async verifyResetOtp({ identifier, otp }) {
    let user;

    if (identifier.includes('@')) {
      user = await userRepository.findByEmail(identifier);
    } else {
      const formatted = formatIndianMobile(identifier);
      user = await userRepository.findByMobile(formatted);
    }

    if (!user) throw new AuthenticationError('Invalid request.');

    await otpService.verify(user.email, otp, 'reset_password');

    // Generate a temporary reset token (valid for 10 minutes)
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    await redis.set(`reset_token:${resetToken}`, String(user.id), 'EX', 600);

    return {
      resetToken,
      message: 'OTP verified. You can now reset your password.',
    };
  }

  // ─── RESET PASSWORD (Step 2 — uses reset token from above) ─
  async resetPassword({ resetToken, newPassword }) {
    const userId = await redis.get(`reset_token:${resetToken}`);
    if (!userId) {
      throw new AuthenticationError('Reset token is invalid or expired. Please request a new OTP.');
    }

    const user = await userRepository.findById(parseInt(userId, 10));
    if (!user) throw new NotFoundError('User');

    const hashedPassword = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);
    await userRepository.updatePassword(user.id, hashedPassword);

    // Invalidate reset token
    await redis.del(`reset_token:${resetToken}`);

    // Invalidate all sessions
    await this._invalidateAllSessions(user.id);

    // Send confirmation email
    emailService.sendPasswordChanged({ to: user.email, toName: user.first_name }).catch(() => {});

    logger.info({ userId: user.id }, 'Password reset successful');

    return { message: 'Password reset successful. Please login with your new password.' };
  }

  // ─── REFRESH TOKEN ──────────────────────────────────────
  async refreshToken({ refreshToken }) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);

      if (decoded.tokenType !== 'refresh') {
        throw new AuthenticationError('Invalid refresh token.');
      }

      const user = await userRepository.findById(decoded.id);
      if (!user || !user.is_active) {
        throw new AuthenticationError('User not found or inactive.');
      }

      const tokens = this._generateTokens(user);
      await this._storeSession(user.id, tokens.accessToken);

      return { tokens, user: this._sanitizeUser(user) };
    } catch (err) {
      if (err instanceof AuthenticationError) throw err;
      throw new AuthenticationError('Invalid or expired refresh token.');
    }
  }

  // ─── LOGOUT ─────────────────────────────────────────────
  async logout(token, userId) {
    // Blacklist the token
    try {
      const decoded = jwt.decode(token);
      const ttl = decoded.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 900;
      if (ttl > 0) {
        await redis.set(`blacklist:${token}`, '1', 'EX', ttl);
      }
    } catch (_err) {
      // Token already invalid, just continue
    }

    // Remove session
    if (userId) {
      await redis.del(`session:${userId}`);
    }

    return { message: 'Logged out successfully.' };
  }

  // ─── GET PROFILE ────────────────────────────────────────
  async getProfile(userId) {
    const user = await userRepository.findByIdOrFail(userId);
    const permissions = await userRepository.getUserPermissions(userId);
    return {
      ...this._sanitizeUser(user),
      permissions: permissions.map(p => p.permission_code),
    };
  }

  // ─── REQUEST EMAIL CHANGE ──────────────────────────────
  async requestEmailChange(userId, newEmail) {
    const user = await userRepository.findByIdOrFail(userId);

    // Check if new email already exists
    const existing = await userRepository.findByEmail(newEmail);
    if (existing) {
      throw new ConflictError('This email is already in use.');
    }

    // Store pending change in Redis
    await redis.set(`email_change:${userId}`, newEmail.toLowerCase(), 'EX', 600);

    // Generate OTP and send to NEW email
    const otp = await otpService.generate(newEmail.toLowerCase(), 'change_email');
    await emailService.sendEmailChangeOtp({
      to: user.email,
      toName: user.first_name,
      otp,
      newEmail,
    });

    return { message: `An OTP has been sent to ${maskEmail(newEmail)} to verify the change.` };
  }

  // ─── VERIFY EMAIL CHANGE ──────────────────────────────
  async verifyEmailChange(userId, otp) {
    const newEmail = await redis.get(`email_change:${userId}`);
    if (!newEmail) {
      throw new ValidationError('No email change request found or it has expired.');
    }

    await otpService.verify(newEmail, otp, 'change_email');
    await userRepository.updateEmail(userId, newEmail);
    await userRepository.markEmailVerified(userId);
    await redis.del(`email_change:${userId}`);

    return { message: 'Email updated and verified successfully.' };
  }

  // ─── REQUEST MOBILE CHANGE ────────────────────────────
  async requestMobileChange(userId, newMobile) {
    const user = await userRepository.findByIdOrFail(userId);
    const formattedMobile = formatIndianMobile(newMobile);

    const existing = await userRepository.findByMobile(formattedMobile);
    if (existing) {
      throw new ConflictError('This mobile number is already in use.');
    }

    await redis.set(`mobile_change:${userId}`, formattedMobile, 'EX', 600);

    const otp = await otpService.generate(formattedMobile, 'change_mobile');

    // Send notification to current email
    await emailService.sendMobileChangeOtp({
      to: user.email,
      toName: user.first_name,
      otp,
    });

    return { message: `An OTP has been sent for mobile number verification.` };
  }

  // ─── VERIFY MOBILE CHANGE ────────────────────────────
  async verifyMobileChange(userId, otp) {
    const newMobile = await redis.get(`mobile_change:${userId}`);
    if (!newMobile) {
      throw new ValidationError('No mobile change request found or it has expired.');
    }

    await otpService.verify(newMobile, otp, 'change_mobile');
    await userRepository.updateMobile(userId, newMobile);
    await userRepository.markMobileVerified(userId);
    await redis.del(`mobile_change:${userId}`);

    return { message: 'Mobile number updated and verified successfully.' };
  }

  // ─── CHANGE PASSWORD (authenticated) ──────────────────
  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await userRepository.findByIdOrFail(userId);

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      throw new ValidationError('Current password is incorrect.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);
    await userRepository.updatePassword(userId, hashedPassword);

    // Invalidate all sessions except current
    await this._invalidateAllSessions(userId);

    emailService.sendPasswordChanged({ to: user.email, toName: user.first_name }).catch(() => {});

    return { message: 'Password changed successfully.' };
  }

  // ─── PRIVATE HELPERS ────────────────────────────────────

  _generateTokens(user) {
    const accessPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      tokenType: 'access',
    };

    const refreshPayload = {
      id: user.id,
      tokenType: 'refresh',
    };

    const accessToken = jwt.sign(accessPayload, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiresIn,
    });

    const refreshToken = jwt.sign(refreshPayload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });

    return { accessToken, refreshToken };
  }

  _sanitizeUser(user) {
    const { password, is_deleted, deleted_at, ...sanitized } = user;
    return sanitized;
  }

  async _storeSession(userId, token) {
    try {
      await redis.set(`session:${userId}`, token, 'EX', config.redis.sessionTtl);
    } catch (_err) {
      // Non-critical
    }
  }

  async _invalidateAllSessions(userId) {
    try {
      const keys = await redis.keys(`session:${userId}*`);
      if (keys.length > 0) await redis.del(...keys);
    } catch (_err) {
      // Non-critical
    }
  }
}

module.exports = new AuthService();
