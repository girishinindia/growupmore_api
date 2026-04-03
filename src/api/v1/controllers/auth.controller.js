/**
 * AUTH CONTROLLER — All Authentication Endpoints
 */

const authService = require('../../../services/auth.service');
const { successResponse, createdResponse } = require('../../../utils/response');

// POST /auth/register (Step 1 — sends OTPs to email & mobile, returns registration_token)
const register = async (req, res) => {
  const result = await authService.register(req.body);
  createdResponse(res, result, result.message);
};

// POST /auth/verify-registration-email (Step 2a — verify email OTP during registration)
const verifyRegistrationEmail = async (req, res) => {
  const result = await authService.verifyRegistrationEmailOtp(req.body);
  successResponse(res, result, result.message);
};

// POST /auth/verify-registration-mobile (Step 2b — verify mobile OTP during registration)
const verifyRegistrationMobile = async (req, res) => {
  const result = await authService.verifyRegistrationMobileOtp(req.body);
  successResponse(res, result, result.message);
};

// POST /auth/resend-registration-otp (resend OTP for pending registration)
const resendRegistrationOtp = async (req, res) => {
  const result = await authService.resendRegistrationOtp(req.body);
  successResponse(res, null, result.message);
};

// POST /auth/login
const login = async (req, res) => {
  const { identifier, password } = req.body;
  const result = await authService.login({
    identifier,
    password,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });
  successResponse(res, result, 'Login successful');
};

// POST /auth/verify-email-otp
const verifyEmailOtp = async (req, res) => {
  const result = await authService.verifyEmailOtp(req.body);
  successResponse(res, result, result.message);
};

// POST /auth/verify-mobile-otp
const verifyMobileOtp = async (req, res) => {
  const result = await authService.verifyMobileOtp(req.body);
  successResponse(res, result, result.message);
};

// POST /auth/resend-otp
const resendOtp = async (req, res) => {
  const result = await authService.resendOtp(req.body);
  successResponse(res, null, result.message);
};

// POST /auth/forgot-password
const forgotPassword = async (req, res) => {
  const result = await authService.forgotPassword(req.body);
  successResponse(res, null, result.message);
};

// POST /auth/verify-reset-otp
const verifyResetOtp = async (req, res) => {
  const result = await authService.verifyResetOtp(req.body);
  successResponse(res, { resetToken: result.resetToken }, result.message);
};

// POST /auth/reset-password
const resetPassword = async (req, res) => {
  const result = await authService.resetPassword({
    resetToken: req.body.reset_token,
    newPassword: req.body.new_password,
  });
  successResponse(res, null, result.message);
};

// POST /auth/refresh-token
const refreshToken = async (req, res) => {
  const result = await authService.refreshToken({
    refreshToken: req.body.refresh_token,
  });
  successResponse(res, result, 'Token refreshed successfully');
};

// POST /auth/logout
const logout = async (req, res) => {
  const result = await authService.logout(req.token, req.user?.id);
  successResponse(res, null, result.message);
};

// GET /auth/me
const getProfile = async (req, res) => {
  const profile = await authService.getProfile(req.user.id);
  successResponse(res, profile, 'Profile retrieved successfully');
};

// POST /auth/change-password
const changePassword = async (req, res) => {
  const result = await authService.changePassword(req.user.id, {
    currentPassword: req.body.current_password,
    newPassword: req.body.new_password,
  });
  successResponse(res, null, result.message);
};

// POST /auth/request-email-change
const requestEmailChange = async (req, res) => {
  const result = await authService.requestEmailChange(req.user.id, req.body.new_email);
  successResponse(res, null, result.message);
};

// POST /auth/verify-email-change
const verifyEmailChange = async (req, res) => {
  const result = await authService.verifyEmailChange(req.user.id, req.body.otp);
  successResponse(res, null, result.message);
};

// POST /auth/request-mobile-change
const requestMobileChange = async (req, res) => {
  const result = await authService.requestMobileChange(req.user.id, req.body.new_mobile);
  successResponse(res, null, result.message);
};

// POST /auth/verify-mobile-change
const verifyMobileChange = async (req, res) => {
  const result = await authService.verifyMobileChange(req.user.id, req.body.otp);
  successResponse(res, null, result.message);
};

module.exports = {
  register,
  verifyRegistrationEmail,
  verifyRegistrationMobile,
  resendRegistrationOtp,
  login,
  verifyEmailOtp,
  verifyMobileOtp,
  resendOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  refreshToken,
  logout,
  getProfile,
  changePassword,
  requestEmailChange,
  verifyEmailChange,
  requestMobileChange,
  verifyMobileChange,
};
