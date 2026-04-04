/**
 * ═══════════════════════════════════════════════════════════════
 * MIDDLEWARE — JWT Authentication
 * ═══════════════════════════════════════════════════════════════
 * Verifies Bearer token, checks session in Redis, attaches user
 * to req.user
 * ═══════════════════════════════════════════════════════════════
 */

const jwt = require('jsonwebtoken');
const config = require('../config');
const redis = require('../config/redis');
const { UnauthorizedError } = require('../utils/errors');
const { REDIS_PREFIXES } = require('../utils/constants');
const logger = require('../config/logger');

const authenticate = async (req, _res, next) => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token is required');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Access token is required');
    }

    // 2. Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.accessSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Access token has expired');
      }
      throw new UnauthorizedError('Invalid access token');
    }

    // 3. Check session exists in Redis (not logged out)
    const sessionKey = `${REDIS_PREFIXES.SESSION}:${decoded.userId}:${decoded.sessionId}`;
    const session = await redis.get(sessionKey);

    if (!session) {
      throw new UnauthorizedError('Session expired or logged out. Please login again.');
    }

    // 4. Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      mobile: decoded.mobile,
      role: decoded.role,
      sessionId: decoded.sessionId,
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
