/**
 * AUTH VALIDATORS — Zod Schemas
 * Covers all auth flows: register, login, OTP, password reset, email/mobile change
 */

const { z } = require('zod');

// ─── Shared Schemas ────────────────────────────────────────

const emailSchema = z
  .string()
  .email('Please provide a valid email address.')
  .max(255)
  .trim()
  .toLowerCase();

const indianMobileSchema = z
  .string()
  .trim()
  .refine(
    (val) => {
      const cleaned = val.replace(/\D/g, '');
      return /^[6-9]\d{9}$/.test(cleaned) || /^91[6-9]\d{9}$/.test(cleaned);
    },
    { message: 'Please provide a valid Indian mobile number (10 digits, starting with 6-9).' }
  );

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(128, 'Password must not exceed 128 characters.')
  .refine(
    (val) => /[A-Z]/.test(val),
    { message: 'Password must contain at least one uppercase letter.' }
  )
  .refine(
    (val) => /[a-z]/.test(val),
    { message: 'Password must contain at least one lowercase letter.' }
  )
  .refine(
    (val) => /\d/.test(val),
    { message: 'Password must contain at least one number.' }
  )
  .refine(
    (val) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val),
    { message: 'Password must contain at least one special character.' }
  );

const otpSchema = z
  .string()
  .length(6, 'OTP must be exactly 6 digits.')
  .regex(/^\d{6}$/, 'OTP must contain only digits.');

// ─── Register ──────────────────────────────────────────────

const registerSchema = z.object({
  first_name: z
    .string()
    .min(2, 'First name must be at least 2 characters.')
    .max(50, 'First name must not exceed 50 characters.')
    .trim(),
  last_name: z
    .string()
    .min(2, 'Last name must be at least 2 characters.')
    .max(50, 'Last name must not exceed 50 characters.')
    .trim(),
  email: emailSchema,
  mobile: indianMobileSchema,
  password: passwordSchema,
  country_id: z.number().int().positive().optional().default(1),
  agree_to_terms: z
    .boolean()
    .refine((val) => val === true, { message: 'You must agree to the terms and conditions.' }),
});

// ─── Login ─────────────────────────────────────────────────

const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Email or mobile number is required.')
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required.'),
});

// ─── Verify Registration Email OTP (new flow) ─────────────

const verifyRegistrationEmailSchema = z.object({
  registration_token: z.string().min(1, 'Registration token is required.'),
  otp: otpSchema,
});

// ─── Verify Registration Mobile OTP (new flow) ────────────

const verifyRegistrationMobileSchema = z.object({
  registration_token: z.string().min(1, 'Registration token is required.'),
  otp: otpSchema,
});

// ─── Resend Registration OTP (new flow) ────────────────────

const resendRegistrationOtpSchema = z.object({
  registration_token: z.string().min(1, 'Registration token is required.'),
  channel: z.enum(['email', 'mobile'], { message: 'Channel must be "email" or "mobile".' }),
});

// ─── Verify Email OTP (for existing users) ─────────────────

const verifyEmailOtpSchema = z.object({
  email: emailSchema,
  otp: otpSchema,
});

// ─── Verify Mobile OTP (for existing users) ────────────────

const verifyMobileOtpSchema = z.object({
  mobile: indianMobileSchema,
  otp: otpSchema,
});

// ─── Resend OTP (for existing users) ───────────────────────

const resendOtpSchema = z.object({
  email: emailSchema,
  purpose: z.enum(['verify_email', 'verify_mobile', 'reset_password']).optional().default('verify_email'),
});

// ─── Forgot Password ──────────────────────────────────────

const forgotPasswordSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Email or mobile number is required.')
    .trim(),
});

// ─── Verify Reset OTP ──────────────────────────────────────

const verifyResetOtpSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Email or mobile number is required.')
    .trim(),
  otp: otpSchema,
});

// ─── Reset Password ────────────────────────────────────────

const resetPasswordSchema = z.object({
  reset_token: z.string().min(1, 'Reset token is required.'),
  new_password: passwordSchema,
  confirm_password: z.string().min(1, 'Please confirm your password.'),
}).refine(
  (data) => data.new_password === data.confirm_password,
  { message: 'Passwords do not match.', path: ['confirm_password'] }
);

// ─── Refresh Token ─────────────────────────────────────────

const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required.'),
});

// ─── Change Password (authenticated) ──────────────────────

const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required.'),
  new_password: passwordSchema,
  confirm_password: z.string().min(1, 'Please confirm your password.'),
}).refine(
  (data) => data.new_password === data.confirm_password,
  { message: 'Passwords do not match.', path: ['confirm_password'] }
);

// ─── Request Email Change ──────────────────────────────────

const requestEmailChangeSchema = z.object({
  new_email: emailSchema,
});

// ─── Verify Email Change ───────────────────────────────────

const verifyEmailChangeSchema = z.object({
  otp: otpSchema,
});

// ─── Request Mobile Change ─────────────────────────────────

const requestMobileChangeSchema = z.object({
  new_mobile: indianMobileSchema,
});

// ─── Verify Mobile Change ──────────────────────────────────

const verifyMobileChangeSchema = z.object({
  otp: otpSchema,
});

module.exports = {
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
};
