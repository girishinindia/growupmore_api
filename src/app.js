/**
 * ═══════════════════════════════════════════════════════════════
 * APP.JS — The Express Application
 * ═══════════════════════════════════════════════════════════════
 * ONLY middleware registration + route mounting.
 * No server.listen() here — that's in server.js
 *
 * Middleware chain (exact order matters):
 *   1. helmet          → Security headers
 *   2. cors            → Cross-origin resource sharing
 *   3. compression     → Gzip responses
 *   4. express.json    → Parse JSON bodies
 *   5. express.urlencoded → Parse URL-encoded bodies
 *   6. hpp             → HTTP parameter pollution protection
 *   7. requestId       → Unique ID per request
 *   8. requestLogger   → Log every HTTP request
 *   9. globalLimiter   → Rate limit all routes
 *  10. sanitize        → Clean XSS from inputs
 *  11. pagination      → Parse page/limit/sort/search
 *  12. API routes      → Mount /api/v1, /api/v2
 *  13. notFound        → 404 for undefined routes
 *  14. errorHandler    → Format all errors
 * ═══════════════════════════════════════════════════════════════
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const hpp = require('hpp');

const config = require('./config/index');

// Middleware
const requestId = require('./middleware/requestId.middleware');
const requestLogger = require('./middleware/requestLogger.middleware');
const { globalLimiter } = require('./middleware/rateLimiter.middleware');
const sanitize = require('./middleware/sanitize.middleware');
const pagination = require('./middleware/pagination.middleware');
const notFound = require('./middleware/notFound.middleware');
const errorHandler = require('./middleware/errorHandler.middleware');

// Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Routes
const apiRouter = require('./api/router');

// ─── Create Express App ──────────────────────────────────────
const app = express();

// ─── Trust Proxy (behind Nginx) ──────────────────────────────
app.set('trust proxy', 1);

// ─── 1. Security Headers ────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false, // Disable CSP for API (no HTML served)
}));

// ─── 2. CORS ─────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }
    if (config.cors.origins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'Accept-Language'],
  exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  maxAge: 86400, // Cache preflight for 24 hours
}));

// ─── 3. Compression ──────────────────────────────────────────
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  threshold: 1024, // Only compress responses > 1KB
}));

// ─── 4. Body Parsers ─────────────────────────────────────────
app.use(express.json({
  limit: '10mb',
  strict: true,
}));

app.use(express.urlencoded({
  extended: true,
  limit: '10mb',
}));

// ─── 5. HTTP Parameter Pollution Protection ──────────────────
app.use(hpp({
  whitelist: ['sort', 'order', 'fields', 'tags', 'categories'],
}));

// ─── 6. Request ID ───────────────────────────────────────────
app.use(requestId);

// ─── 7. Request Logger ───────────────────────────────────────
app.use(requestLogger);

// ─── 8. Global Rate Limiter ──────────────────────────────────
if (!config.isTest) {
  app.use(globalLimiter);
}

// ─── 9. Sanitize Inputs ──────────────────────────────────────
app.use(sanitize);

// ─── 10. Pagination Parser ───────────────────────────────────
app.use(pagination);

// ─── 11. Swagger UI ─────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: `
    .swagger-ui .topbar { background-color: #0EA5E9; }
    .swagger-ui .topbar .download-url-wrapper .select-label select { border-color: #fff; }
    .swagger-ui .info .title { color: #0369A1; }
  `,
  customSiteTitle: 'GrowUpMore API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: 'none',
    filter: true,
    tagsSorter: 'alpha',
    operationsSorter: 'method',
  },
}));

// Serve raw JSON spec at /api-docs.json
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ─── 12. Health Check (before API routes — no auth needed) ───
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'GrowUpMore API is running',
    data: {
      service: config.appName,
      version: config.apiVersion,
      environment: config.env,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
    },
  });
});

// ─── 12. Mount API Routes ────────────────────────────────────
app.use('/api', apiRouter);

// ─── 13. 404 Handler ─────────────────────────────────────────
app.use(notFound);

// ─── 14. Global Error Handler (MUST be last) ─────────────────
app.use(errorHandler);

module.exports = app;
