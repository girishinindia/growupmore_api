/**
 * ═══════════════════════════════════════════════════════════════
 * AUTH ROUTES — /api/v1/auth
 * ═══════════════════════════════════════════════════════════════
 *
 * PUBLIC routes (no auth):
 *   POST /register              — Initiate registration (sends email OTP or mobile OTP)
 *   POST /register/verify-email — Verify email OTP (if mobile exists → sends mobile OTP)
 *   POST /register/verify-mobile — Verify mobile OTP → save user
 *   POST /register/resend-otp   — Resend current step's OTP (email or mobile)
 *   POST /login                 — Login with email/mobile + password
 *   POST /forgot-password       — Initiate forgot password (sends OTP)
 *   POST /forgot-password/verify — Verify forgot password OTP
 *   POST /forgot-password/reset — Set new password with reset token
 *   POST /forgot-password/resend-otp — Resend forgot password OTP
 *   POST /refresh-token         — Get new access token
 *
 * PROTECTED routes (auth required):
 *   POST /change-password       — Change password (old + new)
 *   POST /change-email          — Initiate email change (sends OTP)
 *   POST /change-email/verify   — Verify OTP → update email
 *   POST /change-mobile         — Initiate mobile change (sends OTP)
 *   POST /change-mobile/verify  — Verify OTP → update mobile
 *   POST /logout                — Logout (invalidate session)
 *
 * ═══════════════════════════════════════════════════════════════
 */

const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../../../middleware/validate.middleware');
const authenticate = require('../../../middleware/auth.middleware');
const { authLimiter } = require('../../../middleware/rateLimiter.middleware');
const { verifyRecaptcha } = require('../../../middleware/recaptcha.middleware');
const {
  initiateRegistrationSchema,
  verifyRegistrationEmailSchema,
  verifyRegistrationMobileSchema,
  resendOtpSchema,
  loginSchema,
  initiateForgotPasswordSchema,
  verifyForgotPasswordSchema,
  resendForgotPasswordOtpSchema,
  resetPasswordSchema,
  changePasswordSchema,
  initiateChangeEmailSchema,
  verifyChangeEmailSchema,
  initiateChangeMobileSchema,
  verifyChangeMobileSchema,
  refreshTokenSchema,
} = require('../validators/auth.validator');

const router = Router();

// ═══════════════════════════════════════════════════════════════
//  PUBLIC ROUTES
// ═══════════════════════════════════════════════════════════════

// Registration
router.post(
  '/register',
  authLimiter,
  verifyRecaptcha('register'),
  validate(initiateRegistrationSchema),
  authController.initiateRegistration,
);

router.post(
  '/register/verify-email',
  authLimiter,
  validate(verifyRegistrationEmailSchema),
  authController.verifyRegistrationEmail,
);

router.post(
  '/register/verify-mobile',
  authLimiter,
  validate(verifyRegistrationMobileSchema),
  authController.verifyRegistrationMobile,
);

router.post(
  '/register/resend-otp',
  authLimiter,
  validate(resendOtpSchema),
  authController.resendRegistrationOtp,
);

// Login
router.post(
  '/login',
  authLimiter,
  verifyRecaptcha('login'),
  validate(loginSchema),
  authController.login,
);

// Forgot Password
router.post(
  '/forgot-password',
  authLimiter,
  verifyRecaptcha('forgot_password'),
  validate(initiateForgotPasswordSchema),
  authController.initiateForgotPassword,
);

router.post(
  '/forgot-password/verify',
  authLimiter,
  validate(verifyForgotPasswordSchema),
  authController.verifyForgotPasswordOtp,
);

router.post(
  '/forgot-password/reset',
  authLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword,
);

router.post(
  '/forgot-password/resend-otp',
  authLimiter,
  validate(resendForgotPasswordOtpSchema),
  authController.resendForgotPasswordOtp,
);

// Refresh Token
router.post(
  '/refresh-token',
  validate(refreshTokenSchema),
  authController.refreshToken,
);

// ═══════════════════════════════════════════════════════════════
//  PROTECTED ROUTES (require login)
// ═══════════════════════════════════════════════════════════════

// Change Password
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword,
);

// Change Email
router.post(
  '/change-email',
  authenticate,
  validate(initiateChangeEmailSchema),
  authController.initiateChangeEmail,
);

router.post(
  '/change-email/verify',
  authenticate,
  validate(verifyChangeEmailSchema),
  authController.verifyChangeEmail,
);

// Change Mobile
router.post(
  '/change-mobile',
  authenticate,
  validate(initiateChangeMobileSchema),
  authController.initiateChangeMobile,
);

router.post(
  '/change-mobile/verify',
  authenticate,
  validate(verifyChangeMobileSchema),
  authController.verifyChangeMobile,
);

// Logout
router.post(
  '/logout',
  authenticate,
  authController.logout,
);

module.exports = router;
