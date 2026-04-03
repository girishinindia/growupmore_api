/**
 * AUTH ROUTES — All Authentication Endpoints
 *
 * Registration Flow (3-step — OTPs must be verified BEFORE user is created):
 *   POST /register                   — Step 1: Validate, send OTPs to email + mobile, return registration_token
 *   POST /verify-registration-email  — Step 2a: Verify email OTP (with registration_token)
 *   POST /verify-registration-mobile — Step 2b: Verify mobile OTP (with registration_token)
 *   POST /resend-registration-otp    — Resend OTP for pending registration (channel: email|mobile)
 *
 * Public (no auth):
 *   POST /login            — Login with email/mobile + password (requires both verified)
 *   POST /verify-email-otp — Verify email OTP (existing users)
 *   POST /verify-mobile-otp — Verify mobile OTP (existing users)
 *   POST /resend-otp       — Resend verification OTP (existing users)
 *   POST /forgot-password  — Request password reset OTP
 *   POST /verify-reset-otp — Verify reset OTP (returns resetToken)
 *   POST /reset-password   — Reset password with resetToken
 *   POST /refresh-token    — Refresh access token
 *
 * Protected (requires auth):
 *   POST /logout              — Logout (blacklist token)
 *   GET  /me                  — Get current user profile
 *   POST /change-password     — Change password (old + new)
 *   POST /request-email-change  — Request email change (sends OTP to new email)
 *   POST /verify-email-change   — Verify email change with OTP
 *   POST /request-mobile-change — Request mobile change (sends OTP)
 *   POST /verify-mobile-change  — Verify mobile change with OTP
 */

const { Router } = require('express');
const { asyncHandler } = require('../../../utils/helpers');
const { auth } = require('../../../middleware/auth.middleware');
const { authLimiter, strictLimiter } = require('../../../middleware/rateLimiter.middleware');
const { verifyRecaptcha } = require('../../../middleware/recaptcha.middleware');
const validate = require('../../../middleware/validate.middleware');
const controller = require('../controllers/auth.controller');
const {
  registerSchema,
  verifyRegistrationEmailSchema,
  verifyRegistrationMobileSchema,
  resendRegistrationOtpSchema,
  loginSchema,
  verifyEmailOtpSchema,
  verifyMobileOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
  refreshTokenSchema,
  changePasswordSchema,
  requestEmailChangeSchema,
  verifyEmailChangeSchema,
  requestMobileChangeSchema,
  verifyMobileChangeSchema,
} = require('../validators/auth.validator');

const router = Router();

// ─── Public Routes ───────────────────────────────────────

router.post(
  '/register',
  authLimiter,
  verifyRecaptcha('register'),
  validate(registerSchema),
  asyncHandler(controller.register)
);

router.post(
  '/verify-registration-email',
  authLimiter,
  validate(verifyRegistrationEmailSchema),
  asyncHandler(controller.verifyRegistrationEmail)
);

router.post(
  '/verify-registration-mobile',
  authLimiter,
  validate(verifyRegistrationMobileSchema),
  asyncHandler(controller.verifyRegistrationMobile)
);

router.post(
  '/resend-registration-otp',
  strictLimiter,
  validate(resendRegistrationOtpSchema),
  asyncHandler(controller.resendRegistrationOtp)
);

router.post(
  '/login',
  authLimiter,
  verifyRecaptcha('login'),
  validate(loginSchema),
  asyncHandler(controller.login)
);

router.post(
  '/verify-email-otp',
  authLimiter,
  validate(verifyEmailOtpSchema),
  asyncHandler(controller.verifyEmailOtp)
);

router.post(
  '/verify-mobile-otp',
  authLimiter,
  validate(verifyMobileOtpSchema),
  asyncHandler(controller.verifyMobileOtp)
);

router.post(
  '/resend-otp',
  strictLimiter,
  validate(resendOtpSchema),
  asyncHandler(controller.resendOtp)
);

router.post(
  '/forgot-password',
  authLimiter,
  verifyRecaptcha('forgot_password'),
  validate(forgotPasswordSchema),
  asyncHandler(controller.forgotPassword)
);

router.post(
  '/verify-reset-otp',
  authLimiter,
  validate(verifyResetOtpSchema),
  asyncHandler(controller.verifyResetOtp)
);

router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  asyncHandler(controller.resetPassword)
);

router.post(
  '/refresh-token',
  validate(refreshTokenSchema),
  asyncHandler(controller.refreshToken)
);

// ─── Protected Routes ────────────────────────────────────

router.post('/logout', auth, asyncHandler(controller.logout));

router.get('/me', auth, asyncHandler(controller.getProfile));

router.post(
  '/change-password',
  auth,
  validate(changePasswordSchema),
  asyncHandler(controller.changePassword)
);

router.post(
  '/request-email-change',
  auth,
  validate(requestEmailChangeSchema),
  asyncHandler(controller.requestEmailChange)
);

router.post(
  '/verify-email-change',
  auth,
  validate(verifyEmailChangeSchema),
  asyncHandler(controller.verifyEmailChange)
);

router.post(
  '/request-mobile-change',
  auth,
  validate(requestMobileChangeSchema),
  asyncHandler(controller.requestMobileChange)
);

router.post(
  '/verify-mobile-change',
  auth,
  validate(verifyMobileChangeSchema),
  asyncHandler(controller.verifyMobileChange)
);

module.exports = router;
