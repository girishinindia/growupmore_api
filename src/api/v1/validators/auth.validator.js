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
  .regex(/^\d{10,15}$/, 'Mobile must be 10-15 digits (no spaces, dashes, or +)')
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

const initiateRegistrationSchema = z
  .object({
    firstName: nameField,
    lastName: nameField,
    email: emailField.optional(),
    mobile: mobileField.optional(),
    password: passwordField,
  })
  .refine((data) => data.email || data.mobile, {
    message: 'Either email or mobile is required',
    path: ['email'],
  });

const verifyRegistrationEmailSchema = z.object({
  identifier: z.string().min(1, 'Identifier (email or mobile) is required'),
  otp: otpField,
});

const verifyRegistrationMobileSchema = z.object({
  identifier: z.string().min(1, 'Mobile number is required (without country code)'),
  otp: otpField,
});

const resendOtpSchema = z.object({
  identifier: z.string().min(1, 'Identifier (email or mobile) is required'),
});

// ═══════════════════════════════════════════════════════════════
//  LOGIN
// ═══════════════════════════════════════════════════════════════

const loginSchema = z.object({
  username: z.string().min(1, 'Email or mobile is required'),
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
  resetPasswordSchema,
  changePasswordSchema,
  initiateChangeEmailSchema,
  verifyChangeEmailSchema,
  initiateChangeMobileSchema,
  verifyChangeMobileSchema,
  refreshTokenSchema,
};
