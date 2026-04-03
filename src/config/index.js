/**
 * ═══════════════════════════════════════════════════════════════
 * CONFIG — Single Source of Truth
 * ═══════════════════════════════════════════════════════════════
 * Every file in the project imports config from HERE.
 * No file should ever read process.env directly.
 * ═══════════════════════════════════════════════════════════════
 */

const dotenv = require('dotenv');
const path = require('path');

// Load .env file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production'
  ? '.env'
  : `.env.${process.env.NODE_ENV || 'development'}`;

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// Fallback to .env if environment-specific file not found
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const config = {
  // ─── Server ────────────────────────────────────────────────
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  apiVersion: process.env.API_VERSION || 'v1',
  appName: process.env.APP_NAME || 'GrowUpMore API',
  appUrl: process.env.APP_URL || 'http://localhost:5000',
  timezone: process.env.TIMEZONE || 'Asia/Kolkata',

  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',

  // ─── Supabase ──────────────────────────────────────────────
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    databaseUrl: process.env.DATABASE_URL,
  },

  // ─── JWT ───────────────────────────────────────────────────
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // ─── CORS ──────────────────────────────────────────────────
  cors: {
    origins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim())
      : ['http://localhost:3000', 'http://localhost:3001'],
  },

  // ─── Redis ─────────────────────────────────────────────────
  redis: {
    url: process.env.UPSTASH_REDIS_URL,
    sessionTtl: parseInt(process.env.REDIS_SESSION_TTL, 10) || 1800,
    cacheTtl: parseInt(process.env.REDIS_CACHE_TTL, 10) || 300,
    otpTtl: parseInt(process.env.REDIS_OTP_TTL, 10) || 600,
  },

  // ─── Bunny Storage ────────────────────────────────────────
  bunnyStorage: {
    zone: process.env.BUNNY_STORAGE_ZONE,
    key: process.env.BUNNY_STORAGE_KEY,
    url: process.env.BUNNY_STORAGE_URL || 'https://sg.storage.bunnycdn.com',
    cdnUrl: process.env.BUNNY_CDN_URL,
  },

  // ─── Bunny Stream ─────────────────────────────────────────
  bunnyStream: {
    apiKey: process.env.BUNNY_STREAM_API_KEY,
    libraryId: process.env.BUNNY_STREAM_LIBRARY_ID,
    cdn: process.env.BUNNY_STREAM_CDN,
    tokenKey: process.env.BUNNY_STREAM_TOKEN_KEY,
  },

  // ─── Bunny Account ────────────────────────────────────────
  bunnyAccount: {
    apiKey: process.env.BUNNY_ACCOUNT_API_KEY,
  },

  // ─── Email (Brevo) ────────────────────────────────────────
  email: {
    brevoApiKey: process.env.BREVO_API_KEY,
    smtp: {
      host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    from: process.env.EMAIL_FROM || 'info@growupmore.com',
    fromName: process.env.EMAIL_FROM_NAME || 'Grow Up More',
    admin: process.env.EMAIL_ADMIN || 'info@growupmore.com',
    adminNotify: process.env.EMAIL_ADMIN_NOTIFY || 'girishinindia@gmail.com',
  },

  // ─── SMS (SMS Gateway Hub — DLT Compliant) ────────────────
  sms: {
    apiKey: process.env.SMS_API_KEY,
    senderId: process.env.SMS_SENDER_ID || 'GUMORE',
    route: process.env.SMS_ROUTE || 'clickhere',
    channel: process.env.SMS_CHANNEL || '2',
    dcs: process.env.SMS_DCS || '0',
    flash: process.env.SMS_FLASH || '0',
    entityId: process.env.SMS_ENTITY_ID,
    dltTemplateId: process.env.SMS_DLT_TEMPLATE_ID,
  },

  // ─── Razorpay ─────────────────────────────────────────────
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
    currency: process.env.RAZORPAY_CURRENCY || 'INR',
  },

  // ─── reCAPTCHA Enterprise ─────────────────────────────────
  recaptcha: {
    secretKey: process.env.RECAPTCHA_SECRET_KEY,
    siteKey: process.env.RECAPTCHA_SITE_KEY,
    apiKey: process.env.RECAPTCHA_API_KEY,
    projectId: process.env.RECAPTCHA_PROJECT_ID || 'growupmore',
    minScore: parseFloat(process.env.RECAPTCHA_MIN_SCORE) || 0.5,
    skip: process.env.RECAPTCHA_SKIP === 'true',
  },

  // ─── Rate Limiting ─────────────────────────────────────────
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
    authMax: parseInt(process.env.RATE_LIMIT_AUTH_MAX, 10) || 10,
  },

  // ─── File Upload ───────────────────────────────────────────
  upload: {
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 50,
    maxFileSizeBytes: (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 50) * 1024 * 1024,
    allowedImageTypes: (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml').split(','),
    allowedDocTypes: (process.env.ALLOWED_DOC_TYPES || 'application/pdf').split(','),
  },

  // ─── Logging ───────────────────────────────────────────────
  log: {
    level: process.env.LOG_LEVEL || 'debug',
    dir: process.env.LOG_DIR || 'logs',
  },

  // ─── OTP ───────────────────────────────────────────────────
  otp: {
    length: parseInt(process.env.OTP_LENGTH, 10) || 6,
    expiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 10,
    maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS, 10) || 3,
    resendCooldownSeconds: parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS, 10) || 180,
  },

  // ─── Bcrypt ────────────────────────────────────────────────
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
  },

  // ─── Default Language ─────────────────────────────────────
  defaultLang: {
    code: process.env.DEFAULT_LANG_CODE || 'en',
    id: parseInt(process.env.DEFAULT_LANG_ID, 10) || 1,
  },
};

module.exports = config;
