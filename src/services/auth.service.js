/**
 * ═══════════════════════════════════════════════════════════════
 * AUTH SERVICE — Registration, Login, Forgot/Change Password,
 *                Change Email/Mobile, Logout
 * ═══════════════════════════════════════════════════════════════
 *
 * DATABASE LAYER:
 *   All DB operations use ONLY the stored procedures/functions
 *   defined in the SQL phases:
 *     sp_users_insert  — creates user (hashes password via pgcrypto)
 *     sp_users_update  — updates user (hashes password via pgcrypto)
 *     sp_users_delete  — soft deletes user
 *     udf_get_users    — reads users (returns uv_users view columns)
 *
 *   IMPORTANT: Passwords are hashed INSIDE the SPs using
 *   crypt(p_password, gen_salt('bf')). The API sends RAW
 *   plaintext passwords to the SPs — never pre-hash.
 *
 *   The uv_users view returns prefixed columns:
 *     user_id, user_first_name, user_email, user_mobile,
 *     user_role, user_is_active, etc.
 *
 * ═══════════════════════════════════════════════════════════════
 */

const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const redis = require('../config/redis');
const userRepository = require('../repositories/user.repository');
const otpService = require('./otp.service');
const emailService = require('./email.service');
const smsService = require('./sms.service');
const logger = require('../config/logger');
const {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} = require('../utils/errors');
const {
  ROLES,
  OTP_PURPOSES,
  REDIS_PREFIXES,
  DEFAULT_COUNTRY_ID,
} = require('../utils/constants');
const { normaliseEmail, normaliseMobile, maskEmail, maskMobile } = require('../utils/helpers');

class AuthService {
  // ─────────────────────────────────────────────────────────────
  //  REGISTRATION — Step 1: Initiate (send OTP to email or mobile)
  // ─────────────────────────────────────────────────────────────
  //  Flow when BOTH email & mobile provided:
  //    register → verify-email → verify-mobile → user created
  //  Flow when ONLY email provided:
  //  Both email and mobile are REQUIRED.
  //  Flow: register → verify-email → verify-mobile → user created
  // ─────────────────────────────────────────────────────────────
  async initiateRegistration({ firstName, lastName, email, mobile, password }) {
    // Normalise
    email = normaliseEmail(email);
    mobile = normaliseMobile(mobile);

    // Both email and mobile are required
    if (!email || !mobile) {
      throw new BadRequestError('Both email and mobile are required for registration');
    }

    // Check uniqueness via udf_get_users
    const emailTaken = await userRepository.emailExists(email);
    if (emailTaken) {
      throw new ConflictError('Email is already registered');
    }

    const mobileTaken = await userRepository.mobileExists(mobile);
    if (mobileTaken) {
      throw new ConflictError('Mobile number is already registered');
    }

    // Always start with email verification first
    const pendingKey = `${REDIS_PREFIXES.PENDING_REGISTRATION}:${email}`;
    const pendingData = JSON.stringify({
      firstName,
      lastName,
      email,
      mobile,
      password, // RAW — sp_users_insert hashes via pgcrypto
      role: ROLES.STUDENT,
      countryId: DEFAULT_COUNTRY_ID,
      step: 'email_pending',
    });

    await redis.set(pendingKey, pendingData, 'EX', config.otp.expiryMinutes * 60);

    // Send OTP to email first (mobile comes after email is verified)
    const { otp, expiresInSeconds } = await otpService.generate(
      OTP_PURPOSES.REGISTRATION,
      email,
    );

    await emailService.sendOtp({
      to: email,
      toName: firstName,
      otp,
      purpose: OTP_PURPOSES.REGISTRATION,
    });

    return {
      message: 'OTP sent to your email. Please verify your email first.',
      identifier: email,
      maskedEmail: maskEmail(email),
      maskedMobile: maskMobile(mobile),
      step: 'email_pending',
      expiresInSeconds,
      resendAfterSeconds: config.otp.resendCooldownSeconds,
    };
  }

  // ─────────────────────────────────────────────────────────────
  //  REGISTRATION — Step 2a: Verify Email OTP
  //  If mobile exists → sends mobile OTP, returns mobile_pending
  //  If no mobile    → creates user directly (email-only signup)
  // ─────────────────────────────────────────────────────────────
  async verifyRegistrationEmail({ identifier, otp }) {
    identifier = normaliseEmail(identifier) || normaliseMobile(identifier);

    // Verify email OTP
    await otpService.verify(OTP_PURPOSES.REGISTRATION, identifier, otp);

    // Retrieve pending registration data
    const pendingKey = `${REDIS_PREFIXES.PENDING_REGISTRATION}:${identifier}`;
    const pendingData = await redis.get(pendingKey);

    if (!pendingData) {
      throw new BadRequestError(
        'Registration session expired. Please start the registration again.',
      );
    }

    const userData = JSON.parse(pendingData);

    // Email verified → move to mobile verification step
    userData.step = 'mobile_pending';

    // Move pending data from email key → mobile key
    // So verify-mobile & resend-otp use mobile number as identifier
    const mobileKey = `${REDIS_PREFIXES.PENDING_REGISTRATION}:${userData.mobile}`;
    await redis.set(mobileKey, JSON.stringify(userData), 'EX', config.otp.expiryMinutes * 60);
    await redis.del(pendingKey); // Remove old email-based key

    // Generate & send mobile OTP
    const { otp: mobileOtp, expiresInSeconds } = await otpService.generate(
      OTP_PURPOSES.REGISTRATION_MOBILE,
      userData.mobile,
    );

    await smsService.sendOtp({
      mobile: userData.mobile,
      name: userData.firstName,
      otp: mobileOtp,
    });

    logger.info(`Email verified for registration: ${identifier}. Mobile OTP sent. Pending key moved to mobile.`);

    return {
      message: 'Email verified successfully. OTP sent to your mobile number. Use your 10-digit mobile number as identifier for next steps.',
      identifier: userData.mobile,
      step: 'mobile_pending',
      maskedMobile: maskMobile(userData.mobile),
      expiresInSeconds,
      resendAfterSeconds: config.otp.resendCooldownSeconds,
    };
  }

  // ─────────────────────────────────────────────────────────────
  //  REGISTRATION — Step 2b: Verify Mobile OTP & Create User
  //  Called after email is verified. Both email and mobile are
  //  always present.
  // ─────────────────────────────────────────────────────────────
  async verifyRegistrationMobile({ identifier, otp }) {
    identifier = normaliseEmail(identifier) || normaliseMobile(identifier);

    // Retrieve pending data to get mobile number
    const pendingKey = `${REDIS_PREFIXES.PENDING_REGISTRATION}:${identifier}`;
    const pendingData = await redis.get(pendingKey);

    if (!pendingData) {
      throw new BadRequestError(
        'Registration session expired. Please start the registration again.',
      );
    }

    const userData = JSON.parse(pendingData);

    // Guard: must be in mobile_pending step
    if (userData.step !== 'mobile_pending') {
      throw new BadRequestError(
        'Please verify your email first before verifying mobile.',
      );
    }

    // Verify mobile OTP
    await otpService.verify(OTP_PURPOSES.REGISTRATION_MOBILE, userData.mobile, otp);

    // Final uniqueness check (race condition guard)
    if (userData.email) {
      const emailTaken = await userRepository.emailExists(userData.email);
      if (emailTaken) {
        await redis.del(pendingKey);
        throw new ConflictError('Email was registered by another user. Please try again.');
      }
    }

    const mobileTaken = await userRepository.mobileExists(userData.mobile);
    if (mobileTaken) {
      await redis.del(pendingKey);
      throw new ConflictError('Mobile was registered by another user. Please try again.');
    }

    // NOW save to database via sp_users_insert
    // Password is RAW — the SP hashes it via crypt(p_password, gen_salt('bf'))
    const user = await userRepository.create({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      mobile: userData.mobile,
      password: userData.password, // RAW plaintext → SP hashes
      role: userData.role,
      countryId: userData.countryId,
      isEmailVerified: !!userData.email,
      isMobileVerified: true,
    });

    // Clean up pending data
    await redis.del(pendingKey);

    logger.info(`User registered: ${user.user_id} (${user.user_email || user.user_mobile})`);

    // Auto-login after registration
    const tokens = await this._createSession(user);

    return {
      message: 'Registration successful!',
      step: 'complete',
      user: this._sanitizeUser(user),
      ...tokens,
    };
  }

  // ─────────────────────────────────────────────────────────────
  //  REGISTRATION — Resend OTP (step-aware)
  //  Resends to email if email_pending, to mobile if mobile_pending
  // ─────────────────────────────────────────────────────────────
  async resendRegistrationOtp({ identifier }) {
    identifier = normaliseEmail(identifier) || normaliseMobile(identifier);

    const pendingKey = `${REDIS_PREFIXES.PENDING_REGISTRATION}:${identifier}`;
    const pendingData = await redis.get(pendingKey);

    if (!pendingData) {
      throw new BadRequestError('No pending registration found. Please register again.');
    }

    const userData = JSON.parse(pendingData);

    if (userData.step === 'email_pending') {
      // Resend email OTP
      const { otp, expiresInSeconds } = await otpService.generate(
        OTP_PURPOSES.REGISTRATION,
        userData.email,
      );

      await emailService.sendOtp({
        to: userData.email,
        toName: userData.firstName,
        otp,
        purpose: OTP_PURPOSES.REGISTRATION,
      });

      return {
        message: 'OTP resent to your email.',
        step: 'email_pending',
        maskedEmail: maskEmail(userData.email),
        maskedMobile: userData.mobile ? maskMobile(userData.mobile) : null,
        expiresInSeconds,
        resendAfterSeconds: config.otp.resendCooldownSeconds,
      };
    } else if (userData.step === 'mobile_pending') {
      // Resend mobile OTP
      const { otp, expiresInSeconds } = await otpService.generate(
        OTP_PURPOSES.REGISTRATION_MOBILE,
        userData.mobile,
      );

      await smsService.sendOtp({
        mobile: userData.mobile,
        name: userData.firstName,
        otp,
      });

      return {
        message: 'OTP resent to your mobile.',
        step: 'mobile_pending',
        maskedEmail: userData.email ? maskEmail(userData.email) : null,
        maskedMobile: maskMobile(userData.mobile),
        expiresInSeconds,
        resendAfterSeconds: config.otp.resendCooldownSeconds,
      };
    }

    throw new BadRequestError('Invalid registration state. Please register again.');
  }

  // ─────────────────────────────────────────────────────────────
  //  LOGIN
  // ─────────────────────────────────────────────────────────────
  async login({ username, password }) {
    const identifier = normaliseEmail(username) || normaliseMobile(username);

    // Verify password in the database (pgcrypto crypt() comparison)
    // This returns the user row if password matches, null otherwise
    const user = await userRepository.verifyPassword(identifier, password);

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if account is active
    if (!user.is_active) {
      throw new UnauthorizedError('Your account has been deactivated. Please contact support.');
    }

    // Update last login
    await userRepository.updateLastLogin(user.id);

    // Fetch full user data from udf_get_users (with country info)
    const fullUser = await userRepository.findById(user.id);

    // Create session & tokens
    const tokens = await this._createSession(fullUser || user);

    logger.info(`User logged in: ${user.id} (${user.email || user.mobile})`);

    return {
      message: 'Login successful',
      user: this._sanitizeUser(fullUser || user),
      ...tokens,
    };
  }

  // ─────────────────────────────────────────────────────────────
  //  FORGOT PASSWORD — Step 1: Send OTP
  // ─────────────────────────────────────────────────────────────
  async initiateForgotPassword({ email, mobile }) {
    email = normaliseEmail(email);
    mobile = normaliseMobile(mobile);

    if (!email || !mobile) {
      throw new BadRequestError('Both email and mobile are required for password reset');
    }

    // Find user by email via udf_get_users
    const userByEmail = await userRepository.findByEmail(email);
    if (!userByEmail) {
      throw new NotFoundError('No account found with this email');
    }

    // Verify mobile matches the same user
    if (userByEmail.user_mobile !== mobile) {
      throw new BadRequestError('Email and mobile do not match the same account');
    }

    // Store pending data
    const pendingKey = `${REDIS_PREFIXES.PENDING_FORGOT_PASSWORD}:${email}`;
    await redis.set(
      pendingKey,
      JSON.stringify({ userId: userByEmail.user_id, email, mobile }),
      'EX',
      config.otp.expiryMinutes * 60,
    );

    // Generate OTP
    const { otp, expiresInSeconds } = await otpService.generate(
      OTP_PURPOSES.FORGOT_PASSWORD,
      email,
    );

    // Send OTP to both
    await emailService.sendOtp({
      to: email,
      toName: userByEmail.user_first_name,
      otp,
      purpose: OTP_PURPOSES.FORGOT_PASSWORD,
    });

    await smsService.sendOtp({
      mobile,
      name: userByEmail.user_first_name,
      otp,
    });

    return {
      message: 'OTP sent to your email and mobile.',
      maskedEmail: maskEmail(email),
      maskedMobile: maskMobile(mobile),
      expiresInSeconds,
      resendAfterSeconds: config.otp.resendCooldownSeconds,
    };
  }

  // ─────────────────────────────────────────────────────────────
  //  FORGOT PASSWORD — Step 2: Verify OTP
  // ─────────────────────────────────────────────────────────────
  async verifyForgotPasswordOtp({ email, otp }) {
    email = normaliseEmail(email);

    await otpService.verify(OTP_PURPOSES.FORGOT_PASSWORD, email, otp);

    const resetToken = uuidv4();
    const pendingKey = `${REDIS_PREFIXES.PENDING_FORGOT_PASSWORD}:${email}`;
    const pendingData = await redis.get(pendingKey);

    if (!pendingData) {
      throw new BadRequestError('Password reset session expired. Please try again.');
    }

    const { userId } = JSON.parse(pendingData);

    // Store reset token (valid for 5 minutes)
    const resetKey = `password_reset:${resetToken}`;
    await redis.set(resetKey, JSON.stringify({ userId, email }), 'EX', 300);

    await redis.del(pendingKey);

    return {
      message: 'OTP verified. Please set your new password.',
      resetToken,
    };
  }

  // ─────────────────────────────────────────────────────────────
  //  FORGOT PASSWORD — Step 3: Set New Password
  // ─────────────────────────────────────────────────────────────
  async resetPassword({ resetToken, newPassword }) {
    const resetKey = `password_reset:${resetToken}`;
    const resetData = await redis.get(resetKey);

    if (!resetData) {
      throw new BadRequestError('Reset token expired or invalid. Please start again.');
    }

    const { userId } = JSON.parse(resetData);

    // Update password via sp_users_update (RAW password — SP hashes it)
    await userRepository.updatePassword(userId, newPassword);

    await redis.del(resetKey);

    // Invalidate all sessions
    await this._invalidateAllSessions(userId);

    logger.info(`Password reset for user: ${userId}`);

    return {
      message: 'Password changed successfully. Please login with your new password.',
    };
  }

  // ─────────────────────────────────────────────────────────────
  //  FORGOT PASSWORD — Resend OTP
  // ─────────────────────────────────────────────────────────────
  async resendForgotPasswordOtp({ email }) {
    email = normaliseEmail(email);

    const pendingKey = `${REDIS_PREFIXES.PENDING_FORGOT_PASSWORD}:${email}`;
    const pendingData = await redis.get(pendingKey);

    if (!pendingData) {
      throw new BadRequestError('No pending password reset found. Please start again.');
    }

    const { userId, mobile } = JSON.parse(pendingData);
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { otp, expiresInSeconds } = await otpService.generate(
      OTP_PURPOSES.FORGOT_PASSWORD,
      email,
    );

    await emailService.sendOtp({
      to: email,
      toName: user.user_first_name,
      otp,
      purpose: OTP_PURPOSES.FORGOT_PASSWORD,
    });

    if (mobile) {
      await smsService.sendOtp({
        mobile,
        name: user.user_first_name,
        otp,
      });
    }

    return {
      message: 'OTP resent successfully.',
      maskedEmail: maskEmail(email),
      maskedMobile: mobile ? maskMobile(mobile) : null,
      expiresInSeconds,
      resendAfterSeconds: config.otp.resendCooldownSeconds,
    };
  }

  // ─────────────────────────────────────────────────────────────
  //  CHANGE PASSWORD (logged in)
  // ─────────────────────────────────────────────────────────────
  async changePassword({ userId, oldPassword, newPassword }) {
    // Verify old password against DB using pgcrypto
    // First get the user to know their identifier
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const identifier = user.user_email || user.user_mobile;

    // Verify old password in DB
    const verified = await userRepository.verifyPassword(identifier, oldPassword);
    if (!verified) {
      throw new BadRequestError('Current password is incorrect');
    }

    // Update password via sp_users_update (RAW password — SP hashes it)
    await userRepository.updatePassword(userId, newPassword);

    // Invalidate all sessions → force logout everywhere
    await this._invalidateAllSessions(userId);

    logger.info(`Password changed for user: ${userId}`);

    return {
      message: 'Password changed successfully. You have been logged out from all devices. Please login again.',
    };
  }

  // ─────────────────────────────────────────────────────────────
  //  CHANGE EMAIL — Step 1: Send OTP to new email
  // ─────────────────────────────────────────────────────────────
  async initiateChangeEmail({ userId, newEmail }) {
    newEmail = normaliseEmail(newEmail);

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.user_email && user.user_email.toLowerCase() === newEmail) {
      throw new BadRequestError('New email is the same as your current email');
    }

    const emailTaken = await userRepository.emailExists(newEmail);
    if (emailTaken) {
      throw new ConflictError('This email is already registered to another account');
    }

    const pendingKey = `${REDIS_PREFIXES.PENDING_CHANGE_EMAIL}:${userId}`;
    await redis.set(
      pendingKey,
      JSON.stringify({ userId, newEmail }),
      'EX',
      config.otp.expiryMinutes * 60,
    );

    const { otp, expiresInSeconds } = await otpService.generate(
      OTP_PURPOSES.CHANGE_EMAIL,
      newEmail,
    );

    await emailService.sendOtp({
      to: newEmail,
      toName: user.user_first_name,
      otp,
      purpose: OTP_PURPOSES.CHANGE_EMAIL,
    });

    return {
      message: 'OTP sent to your new email address.',
      maskedEmail: maskEmail(newEmail),
      expiresInSeconds,
      resendAfterSeconds: config.otp.resendCooldownSeconds,
    };
  }

  // ─────────────────────────────────────────────────────────────
  //  CHANGE EMAIL — Step 2: Verify OTP & Update
  // ─────────────────────────────────────────────────────────────
  async verifyChangeEmail({ userId, otp }) {
    const pendingKey = `${REDIS_PREFIXES.PENDING_CHANGE_EMAIL}:${userId}`;
    const pendingData = await redis.get(pendingKey);

    if (!pendingData) {
      throw new BadRequestError('Email change session expired. Please start again.');
    }

    const { newEmail } = JSON.parse(pendingData);

    await otpService.verify(OTP_PURPOSES.CHANGE_EMAIL, newEmail, otp);

    const emailTaken = await userRepository.emailExists(newEmail);
    if (emailTaken) {
      await redis.del(pendingKey);
      throw new ConflictError('This email was taken by another user. Please try a different one.');
    }

    // Update email via sp_users_update
    await userRepository.updateEmail(userId, newEmail);

    await redis.del(pendingKey);
    await this._invalidateAllSessions(userId);

    logger.info(`Email changed for user: ${userId} → ${maskEmail(newEmail)}`);

    return {
      message: 'Email updated successfully. You have been logged out. Please login again.',
    };
  }

  // ─────────────────────────────────────────────────────────────
  //  CHANGE MOBILE — Step 1: Send OTP to new mobile
  // ─────────────────────────────────────────────────────────────
  async initiateChangeMobile({ userId, newMobile }) {
    newMobile = normaliseMobile(newMobile);

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.user_mobile === newMobile) {
      throw new BadRequestError('New mobile number is the same as your current number');
    }

    const mobileTaken = await userRepository.mobileExists(newMobile);
    if (mobileTaken) {
      throw new ConflictError('This mobile number is already registered to another account');
    }

    const pendingKey = `${REDIS_PREFIXES.PENDING_CHANGE_MOBILE}:${userId}`;
    await redis.set(
      pendingKey,
      JSON.stringify({ userId, newMobile }),
      'EX',
      config.otp.expiryMinutes * 60,
    );

    const { otp, expiresInSeconds } = await otpService.generate(
      OTP_PURPOSES.CHANGE_MOBILE,
      newMobile,
    );

    await smsService.sendOtp({
      mobile: newMobile,
      name: user.user_first_name,
      otp,
    });

    return {
      message: 'OTP sent to your new mobile number.',
      maskedMobile: maskMobile(newMobile),
      expiresInSeconds,
      resendAfterSeconds: config.otp.resendCooldownSeconds,
    };
  }

  // ─────────────────────────────────────────────────────────────
  //  CHANGE MOBILE — Step 2: Verify OTP & Update
  // ─────────────────────────────────────────────────────────────
  async verifyChangeMobile({ userId, otp }) {
    const pendingKey = `${REDIS_PREFIXES.PENDING_CHANGE_MOBILE}:${userId}`;
    const pendingData = await redis.get(pendingKey);

    if (!pendingData) {
      throw new BadRequestError('Mobile change session expired. Please start again.');
    }

    const { newMobile } = JSON.parse(pendingData);

    await otpService.verify(OTP_PURPOSES.CHANGE_MOBILE, newMobile, otp);

    const mobileTaken = await userRepository.mobileExists(newMobile);
    if (mobileTaken) {
      await redis.del(pendingKey);
      throw new ConflictError('This mobile number was taken. Please try a different one.');
    }

    // Update mobile via sp_users_update
    await userRepository.updateMobile(userId, newMobile);

    await redis.del(pendingKey);
    await this._invalidateAllSessions(userId);

    logger.info(`Mobile changed for user: ${userId} → ${maskMobile(newMobile)}`);

    return {
      message: 'Mobile number updated successfully. You have been logged out. Please login again.',
    };
  }

  // ─────────────────────────────────────────────────────────────
  //  LOGOUT
  // ─────────────────────────────────────────────────────────────
  async logout({ userId, sessionId }) {
    const sessionKey = `${REDIS_PREFIXES.SESSION}:${userId}:${sessionId}`;
    await redis.del(sessionKey);

    const refreshKey = `${REDIS_PREFIXES.REFRESH_TOKEN}:${userId}:${sessionId}`;
    await redis.del(refreshKey);

    logger.info(`User logged out: ${userId} (session: ${sessionId})`);

    return { message: 'Logged out successfully' };
  }

  // ─────────────────────────────────────────────────────────────
  //  REFRESH TOKEN
  // ─────────────────────────────────────────────────────────────
  async refreshToken({ refreshToken }) {
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    } catch (_err) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const refreshKey = `${REDIS_PREFIXES.REFRESH_TOKEN}:${decoded.userId}:${decoded.sessionId}`;
    const storedToken = await redis.get(refreshKey);

    if (!storedToken || storedToken !== refreshToken) {
      throw new UnauthorizedError('Refresh token revoked or invalid');
    }

    const user = await userRepository.findById(decoded.userId);
    if (!user || !user.user_is_active) {
      throw new UnauthorizedError('User not found or deactivated');
    }

    const accessToken = this._generateAccessToken(user, decoded.sessionId);

    return {
      accessToken,
      expiresIn: config.jwt.accessExpiresIn,
    };
  }

  // ═══════════════════════════════════════════════════════════
  //  PRIVATE HELPERS
  // ═══════════════════════════════════════════════════════════

  /**
   * Create a new session in Redis and return JWT tokens.
   * Accepts user data from uv_users (prefixed: user_id, user_email, etc.)
   * OR from direct query (unprefixed: id, email, etc.)
   */
  async _createSession(user) {
    const sessionId = uuidv4();

    const accessToken = this._generateAccessToken(user, sessionId);
    const refreshToken = this._generateRefreshToken(user, sessionId);

    const userId = user.user_id || user.id;
    const userEmail = user.user_email || user.email;
    const userMobile = user.user_mobile || user.mobile;
    const userRole = user.user_role || user.role;

    // Store session in Redis
    const sessionKey = `${REDIS_PREFIXES.SESSION}:${userId}:${sessionId}`;
    const sessionData = JSON.stringify({
      userId,
      email: userEmail,
      mobile: userMobile,
      role: userRole,
      createdAt: new Date().toISOString(),
    });

    await redis.set(sessionKey, sessionData, 'EX', config.redis.sessionTtl);

    // Store refresh token
    const refreshKey = `${REDIS_PREFIXES.REFRESH_TOKEN}:${userId}:${sessionId}`;
    const refreshExpirySeconds = this._parseExpiryToSeconds(config.jwt.refreshExpiresIn);
    await redis.set(refreshKey, refreshToken, 'EX', refreshExpirySeconds);

    return {
      accessToken,
      refreshToken,
      expiresIn: config.jwt.accessExpiresIn,
    };
  }

  /**
   * Generate access token.
   * Handles both uv_users prefixed and direct query field names.
   */
  _generateAccessToken(user, sessionId) {
    return jwt.sign(
      {
        userId: user.user_id || user.id,
        email: user.user_email || user.email,
        mobile: user.user_mobile || user.mobile,
        role: user.user_role || user.role,
        sessionId,
      },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiresIn },
    );
  }

  _generateRefreshToken(user, sessionId) {
    return jwt.sign(
      {
        userId: user.user_id || user.id,
        sessionId,
        type: 'refresh',
      },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn },
    );
  }

  /**
   * Invalidate all sessions for a user (force logout everywhere)
   */
  async _invalidateAllSessions(userId) {
    const sessionPattern = `${REDIS_PREFIXES.SESSION}:${userId}:*`;
    const refreshPattern = `${REDIS_PREFIXES.REFRESH_TOKEN}:${userId}:*`;

    const sessionKeys = await redis.keys(sessionPattern);
    const refreshKeys = await redis.keys(refreshPattern);

    const allKeys = [...sessionKeys, ...refreshKeys];

    if (allKeys.length > 0) {
      for (const key of allKeys) {
        await redis.del(key);
      }
    }

    logger.info(`All sessions invalidated for user: ${userId} (${allKeys.length} keys deleted)`);
  }

  /**
   * Parse JWT expiry string (e.g. '7d', '15m', '1h') to seconds
   */
  _parseExpiryToSeconds(expiry) {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 604800;
    }
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
    return value * (multipliers[unit] || 86400);
  }

  /**
   * Remove sensitive fields and normalise to API response shape.
   * Handles both uv_users (prefixed) and direct query (unprefixed) formats.
   */
  _sanitizeUser(user) {
    return {
      id: user.user_id || user.id,
      firstName: user.user_first_name || user.first_name,
      lastName: user.user_last_name || user.last_name,
      email: user.user_email || user.email,
      mobile: user.user_mobile || user.mobile,
      role: user.user_role || user.role,
      isActive: user.user_is_active ?? user.is_active,
      isEmailVerified: user.user_is_email_verified ?? user.is_email_verified,
      isMobileVerified: user.user_is_mobile_verified ?? user.is_mobile_verified,
      lastLogin: user.user_last_login || user.last_login,
      createdAt: user.user_created_at || user.created_at,
      // Country info (from uv_users view)
      country: user.country_name
        ? {
            name: user.country_name,
            iso2: user.country_iso2,
            phoneCode: user.country_phone_code,
            currency: user.country_currency,
            currencySymbol: user.country_currency_symbol,
            flagImage: user.country_flag_image,
          }
        : undefined,
    };
  }
}

module.exports = new AuthService();
