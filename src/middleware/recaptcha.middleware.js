/**
 * ═══════════════════════════════════════════════════════════════
 * RECAPTCHA MIDDLEWARE — Google reCAPTCHA v3 Verification
 * ═══════════════════════════════════════════════════════════════
 * Extracts recaptcha_token from body, verifies with Google API,
 * checks score >= minScore, and validates action.
 * Can be skipped in dev via RECAPTCHA_SKIP=true.
 * ═══════════════════════════════════════════════════════════════
 */

const axios = require('axios');
const config = require('../config/index');
const logger = require('../config/logger');
const { ValidationError, UnprocessableError } = require('../utils/errors');

const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

/**
 * Middleware: Verify reCAPTCHA token
 * Reads recaptcha_token from req.body, verifies with Google.
 *
 * @param {string} expectedAction - The action name (e.g., 'register', 'login')
 *
 * @example
 * router.post(
 *   '/register',
 *   verifyRecaptcha('register'),
 *   validate(registerSchema),
 *   controller.register
 * );
 *
 * @throws {ValidationError} If token is missing or verification fails
 * @throws {UnprocessableError} If Google API is unavailable
 */
const verifyRecaptcha = (expectedAction) => {
  return async (req, _res, next) => {
    try {
      // Skip verification in dev if RECAPTCHA_SKIP=true
      if (config.isDev && config.recaptcha.skip) {
        logger.debug({ action: expectedAction }, 'reCAPTCHA verification skipped (dev mode)');
        return next();
      }

      // Check if secret key is configured
      if (!config.recaptcha.secretKey) {
        if (config.isDev) {
          logger.warn('reCAPTCHA secret key not configured, skipping verification');
          return next();
        }
        throw new UnprocessableError('reCAPTCHA not configured.');
      }

      // Extract token from request body
      const { recaptcha_token } = req.body;
      if (!recaptcha_token) {
        throw new ValidationError('reCAPTCHA token is required.', [
          {
            field: 'recaptcha_token',
            message: 'reCAPTCHA token is missing.',
            code: 'required',
          },
        ]);
      }

      logger.debug(
        { action: expectedAction, tokenLength: recaptcha_token.length },
        'Verifying reCAPTCHA token'
      );

      // Send verification request to Google
      const response = await axios.post(
        RECAPTCHA_VERIFY_URL,
        new URLSearchParams({
          secret: config.recaptcha.secretKey,
          response: recaptcha_token,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 5000,
        }
      );

      const { success, score, action, challenge_ts, error_codes } = response.data;

      logger.debug(
        { success, score, action, challenge_ts, error_codes },
        'reCAPTCHA response received'
      );

      // Check if verification was successful
      if (!success) {
        const errorMessage = error_codes ? error_codes.join(', ') : 'reCAPTCHA verification failed.';
        logger.warn({ error_codes }, 'reCAPTCHA verification failed');
        throw new ValidationError(errorMessage);
      }

      // Check score threshold (0.0 = bot, 1.0 = human)
      if (score < config.recaptcha.minScore) {
        logger.warn(
          { score, minScore: config.recaptcha.minScore },
          'reCAPTCHA score below threshold'
        );
        throw new ValidationError(
          `Suspected bot activity detected (score: ${score}). Please try again.`
        );
      }

      // Verify action matches expected action
      if (action !== expectedAction) {
        logger.warn(
          { expectedAction, receivedAction: action },
          'reCAPTCHA action mismatch'
        );
        throw new ValidationError(
          'reCAPTCHA token action does not match. Please refresh the page and try again.'
        );
      }

      // Attach reCAPTCHA result to request for logging/auditing
      req.recaptchaScore = score;
      req.recaptchaAction = action;

      logger.debug(
        { action, score, expectedAction },
        'reCAPTCHA verification successful'
      );

      next();
    } catch (err) {
      if (err instanceof ValidationError) {
        return next(err);
      }
      if (err instanceof UnprocessableError) {
        return next(err);
      }

      if (err.code === 'ECONNABORTED' || err.code === 'ENOTFOUND') {
        logger.error({ err }, 'Failed to reach Google reCAPTCHA API');
        return next(
          new UnprocessableError('Unable to verify reCAPTCHA. Please try again later.')
        );
      }

      logger.error({ err }, 'reCAPTCHA middleware error');
      next(new UnprocessableError('reCAPTCHA verification error.'));
    }
  };
};

module.exports = { verifyRecaptcha };
