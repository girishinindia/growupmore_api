/**
 * ═══════════════════════════════════════════════════════════════
 * AUTH VALIDATOR — Zod Schemas for All Auth Routes
 * ═══════════════════════════════════════════════════════════════
 */

const { z } = require('zod');

// ─── Shared field schemas ────────────────────────────────────

const emailField = z
  .string()
  .email('Invalid email address')
  .max(255, 'Email must be at most 255 characters')
  .transform((v) => v.toLowerCase().trim());

const mobileField = z
  .string()
  .regex(/^\d{10}$/, 'Mobile must be exactly 10 digits (without country code)')
  .transform((v) => v.replace(/[\s\-\+]/g, ''));

const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one digit')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

const otpField = z
  .string()
  .regex(/^\d{6}$/, 'OTP must be exactly 6 digits');

const nameField = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be at most 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
  .transform((v) => v.trim());

// ═══════════════════════════════════════════════════════════════
//  REGISTRATION
// ═══════════════════════════════════════════════════════════════

const roleField = z
  .string()
  .min(2, 'Role must be at least 2 characters')
  .max(50, 'Role must be at most 50 characters')
  .regex(/^[a-z_]+$/, 'Role must be lowercase letters and underscores only')
  .optional()
  .default('student');

const initiateRegistrationSchema = z.object({
  firstName: nameField,
  lastName: nameField,
  email: emailField,
  mobile: mobileField,
  password: passwordField,
  role: roleField,
});

const verifyRegistrationEmailSchema = z.object({
  identifier: z
    .string()
    .email('Identifier must be a valid email address for email verification'),
  otp: otpField,
});

const verifyRegistrationMobileSchema = z.object({
  identifier: z.string().regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits (without country code)'),
  otp: otpField,
});

const resendOtpSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Identifier (email or mobile) is required')
    .refine(
      (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || /^\d{10}$/.test(val),
      'Identifier must be a valid email or exactly 10-digit mobile number (without country code)',
    ),
});

// ═══════════════════════════════════════════════════════════════
//  LOGIN
// ═══════════════════════════════════════════════════════════════

const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Email or mobile is required')
    .refine(
      (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || /^\d{10}$/.test(val),
      'Username must be a valid email or exactly 10-digit mobile number (without country code)',
    ),
  password: z.string().min(1, 'Password is required'),
});

// ═══════════════════════════════════════════════════════════════
//  FORGOT PASSWORD
// ═══════════════════════════════════════════════════════════════

const initiateForgotPasswordSchema = z.object({
  email: emailField,
  mobile: mobileField,
});

const verifyForgotPasswordSchema = z.object({
  email: emailField,
  otp: otpField,
});

const resendForgotPasswordOtpSchema = z.object({
  email: emailField,
});

const resetPasswordSchema = z.object({
  resetToken: z.string().uuid('Invalid reset token'),
  newPassword: passwordField,
});

// ═══════════════════════════════════════════════════════════════
//  CHANGE PASSWORD (logged in)
// ═══════════════════════════════════════════════════════════════

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordField,
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

// ═══════════════════════════════════════════════════════════════
//  CHANGE EMAIL (logged in)
// ═══════════════════════════════════════════════════════════════

const initiateChangeEmailSchema = z.object({
  newEmail: emailField,
});

const verifyChangeEmailSchema = z.object({
  otp: otpField,
});

// ═══════════════════════════════════════════════════════════════
//  CHANGE MOBILE (logged in)
// ═══════════════════════════════════════════════════════════════

const initiateChangeMobileSchema = z.object({
  newMobile: mobileField,
});

const verifyChangeMobileSchema = z.object({
  otp: otpField,
});

// ═══════════════════════════════════════════════════════════════
//  REFRESH TOKEN
// ═══════════════════════════════════════════════════════════════

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

module.exports = {
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
};
