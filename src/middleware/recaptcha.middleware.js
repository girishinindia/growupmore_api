/**
 * ═══════════════════════════════════════════════════════════════
 * reCAPTCHA v3 MIDDLEWARE — Google reCAPTCHA Enterprise
 * ═══════════════════════════════════════════════════════════════
 * Verifies reCAPTCHA v3 token sent in the request body or header.
 *
 * Behaviour:
 *   - If config.recaptcha.skip === true  → skip verification (dev mode)
 *   - If config.recaptcha.skip === false → verify token via Google API
 *
 * Toggle via .env:
 *   RECAPTCHA_SKIP=true   → development (no verification)
 *   RECAPTCHA_SKIP=false  → production  (full verification)
 * ═══════════════════════════════════════════════════════════════
 */

const config = require('../config');
const logger = require('../config/logger');
const { BadRequestError } = require('../utils/errors');

/**
 * Verify reCAPTCHA token with Google reCAPTCHA Enterprise API
 * @param {string} token - The reCAPTCHA token from the client
 * @param {string} expectedAction - The expected action name (e.g. 'register', 'login')
 * @returns {Promise<{ score: number, valid: boolean }>}
 */
async function verifyRecaptchaToken(token, expectedAction) {
  const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${config.recaptcha.projectId}/assessments?key=${config.recaptcha.apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event: {
        token,
        siteKey: config.recaptcha.siteKey,
        expectedAction,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    logger.error(`reCAPTCHA API error: ${response.status} — ${errorText}`);
    throw new BadRequestError('reCAPTCHA verification failed. Please try again.');
  }

  const data = await response.json();

  const score = data.riskAnalysis?.score ?? 0;
  const tokenValid = data.tokenProperties?.valid ?? false;
  const actionMatch = data.tokenProperties?.action === expectedAction;

  logger.info(
    `reCAPTCHA result: score=${score} | valid=${tokenValid} | action=${data.tokenProperties?.action} | expected=${expectedAction} | match=${actionMatch}`,
  );

  return {
    score,
    valid: tokenValid && actionMatch && score >= config.recaptcha.minScore,
  };
}

/**
 * Middleware factory — returns a middleware that verifies reCAPTCHA
 * @param {string} action - Expected reCAPTCHA action name
 * @returns {Function} Express middleware
 */
const verifyRecaptcha = (action) => {
  return async (req, res, next) => {
    // ── Skip in development / when RECAPTCHA_SKIP=true ──────
    if (config.recaptcha.skip) {
      logger.debug(`reCAPTCHA skipped for action: ${action} (RECAPTCHA_SKIP=true)`);
      return next();
    }

    // ── Extract token from body or header ───────────────────
    const token =
      req.body.recaptchaToken ||
      req.body.recaptcha_token ||
      req.headers['x-recaptcha-token'];

    if (!token) {
      return next(new BadRequestError('reCAPTCHA token is required.'));
    }

    try {
      const result = await verifyRecaptchaToken(token, action);

      if (!result.valid) {
        logger.warn(
          `reCAPTCHA failed for action: ${action} | score=${result.score} | minScore=${config.recaptcha.minScore}`,
        );
        return next(
          new BadRequestError('reCAPTCHA verification failed. Please try again.'),
        );
      }

      // Attach score to request for downstream use if needed
      req.recaptchaScore = result.score;
      return next();
    } catch (err) {
      // If it's already our BadRequestError, pass it through
      if (err.statusCode) {
        return next(err);
      }
      logger.error({ err: err.message }, 'reCAPTCHA verification error');
      return next(new BadRequestError('reCAPTCHA verification failed. Please try again.'));
    }
  };
};

module.exports = { verifyRecaptcha };
