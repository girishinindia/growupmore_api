/**
 * ═══════════════════════════════════════════════════════════════
 * AUTH CONTROLLER — Handles HTTP request/response for Auth
 * ═══════════════════════════════════════════════════════════════
 * Thin layer: validate → call service → send response
 * ═══════════════════════════════════════════════════════════════
 */

const authService = require('../../../services/auth.service');
const { sendSuccess, sendCreated } = require('../../../utils/response');
const { StatusCodes } = require('http-status-codes');

class AuthController {
  // ─── Registration ──────────────────────────────────────────

  async initiateRegistration(req, res, next) {
    try {
      const result = await authService.initiateRegistration(req.body);
      return sendSuccess(res, {
        statusCode: StatusCodes.OK,
        message: result.message,
        data: {
          identifier: result.identifier,
          maskedEmail: result.maskedEmail,
          maskedMobile: result.maskedMobile,
          expiresInSeconds: result.expiresInSeconds,
          resendAfterSeconds: result.resendAfterSeconds,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyRegistrationEmail(req, res, next) {
    try {
      const result = await authService.verifyRegistrationEmail(req.body);

      // If step is complete (email-only registration), return 201 with user
      if (result.step === 'complete') {
        return sendCreated(res, {
          message: result.message,
          data: {
            user: result.user,
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            expiresIn: result.expiresIn,
          },
        });
      }

      // Email verified, mobile OTP sent → return 200
      // identifier switches to mobile number for next steps
      return sendSuccess(res, {
        statusCode: StatusCodes.OK,
        message: result.message,
        data: {
          identifier: result.identifier,
          step: result.step,
          maskedMobile: result.maskedMobile,
          expiresInSeconds: result.expiresInSeconds,
          resendAfterSeconds: result.resendAfterSeconds,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyRegistrationMobile(req, res, next) {
    try {
      const result = await authService.verifyRegistrationMobile(req.body);
      return sendCreated(res, {
        message: result.message,
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresIn: result.expiresIn,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async resendRegistrationOtp(req, res, next) {
    try {
      const result = await authService.resendRegistrationOtp(req.body);
      return sendSuccess(res, {
        message: result.message,
        data: {
          maskedEmail: result.maskedEmail,
          maskedMobile: result.maskedMobile,
          expiresInSeconds: result.expiresInSeconds,
          resendAfterSeconds: result.resendAfterSeconds,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Login ─────────────────────────────────────────────────

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      return sendSuccess(res, {
        message: result.message,
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expiresIn: result.expiresIn,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Forgot Password ──────────────────────────────────────

  async initiateForgotPassword(req, res, next) {
    try {
      const result = await authService.initiateForgotPassword(req.body);
      return sendSuccess(res, {
        message: result.message,
        data: {
          maskedEmail: result.maskedEmail,
          maskedMobile: result.maskedMobile,
          expiresInSeconds: result.expiresInSeconds,
          resendAfterSeconds: result.resendAfterSeconds,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyForgotPasswordOtp(req, res, next) {
    try {
      const result = await authService.verifyForgotPasswordOtp(req.body);
      return sendSuccess(res, {
        message: result.message,
        data: {
          resetToken: result.resetToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const result = await authService.resetPassword(req.body);
      return sendSuccess(res, {
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async resendForgotPasswordOtp(req, res, next) {
    try {
      const result = await authService.resendForgotPasswordOtp(req.body);
      return sendSuccess(res, {
        message: result.message,
        data: {
          maskedEmail: result.maskedEmail,
          maskedMobile: result.maskedMobile,
          expiresInSeconds: result.expiresInSeconds,
          resendAfterSeconds: result.resendAfterSeconds,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Change Password (logged in) ──────────────────────────

  async changePassword(req, res, next) {
    try {
      const result = await authService.changePassword({
        userId: req.user.userId,
        ...req.body,
      });
      return sendSuccess(res, {
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Change Email (logged in) ─────────────────────────────

  async initiateChangeEmail(req, res, next) {
    try {
      const result = await authService.initiateChangeEmail({
        userId: req.user.userId,
        ...req.body,
      });
      return sendSuccess(res, {
        message: result.message,
        data: {
          maskedEmail: result.maskedEmail,
          expiresInSeconds: result.expiresInSeconds,
          resendAfterSeconds: result.resendAfterSeconds,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyChangeEmail(req, res, next) {
    try {
      const result = await authService.verifyChangeEmail({
        userId: req.user.userId,
        ...req.body,
      });
      return sendSuccess(res, {
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Change Mobile (logged in) ────────────────────────────

  async initiateChangeMobile(req, res, next) {
    try {
      const result = await authService.initiateChangeMobile({
        userId: req.user.userId,
        ...req.body,
      });
      return sendSuccess(res, {
        message: result.message,
        data: {
          maskedMobile: result.maskedMobile,
          expiresInSeconds: result.expiresInSeconds,
          resendAfterSeconds: result.resendAfterSeconds,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyChangeMobile(req, res, next) {
    try {
      const result = await authService.verifyChangeMobile({
        userId: req.user.userId,
        ...req.body,
      });
      return sendSuccess(res, {
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Logout ────────────────────────────────────────────────

  async logout(req, res, next) {
    try {
      const result = await authService.logout({
        userId: req.user.userId,
        sessionId: req.user.sessionId,
      });
      return sendSuccess(res, {
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // ─── Refresh Token ─────────────────────────────────────────

  async refreshToken(req, res, next) {
    try {
      const result = await authService.refreshToken(req.body);
      return sendSuccess(res, {
        message: 'Token refreshed',
        data: {
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
