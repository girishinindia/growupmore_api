/**
 * ═══════════════════════════════════════════════════════════════
 * APP — Express Application Setup & Global Middleware
 * ═══════════════════════════════════════════════════════════════
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const compression = require('compression');
const morgan = require('morgan');
const config = require('./config');
const logger = require('./config/logger');
const apiRouter = require('./api/router');
const requestId = require('./middleware/requestId.middleware');
const sanitize = require('./middleware/sanitize.middleware');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');
const notFound = require('./middleware/notFound.middleware');
const errorHandler = require('./middleware/errorHandler.middleware');

const app = express();

// ─── Security ────────────────────────────────────────────────
app.use(helmet());
app.use(hpp());

// ─── CORS ────────────────────────────────────────────────────
app.use(
  cors({
    origin: config.cors.origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  }),
);

// ─── Body Parsing ────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Compression ─────────────────────────────────────────────
app.use(compression());

// ─── Request ID ──────────────────────────────────────────────
app.use(requestId);

// ─── HTTP Logging ────────────────────────────────────────────
if (!config.isTest) {
  app.use(
    morgan('short', {
      stream: logger.stream,
      skip: (req) => req.url === '/api/health',
    }),
  );
}

// ─── Input Sanitization ─────────────────────────────────────
app.use(sanitize);

// ─── Rate Limiting ───────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Health Check ────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'GrowUpMore API is running',
    data: {
      environment: config.env,
      version: config.apiVersion,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()) + 's',
    },
  });
});

// ─── API Routes ──────────────────────────────────────────────
app.use('/api', apiRouter);

// ─── 404 Handler ─────────────────────────────────────────────
app.use(notFound);

// ─── Global Error Handler ────────────────────────────────────
app.use(errorHandler);

module.exports = app;
