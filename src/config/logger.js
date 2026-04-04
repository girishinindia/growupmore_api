/**
 * ═══════════════════════════════════════════════════════════════
 * LOGGER — Winston Setup (Console + File Transports)
 * ═══════════════════════════════════════════════════════════════
 */

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const logLevel = process.env.LOG_LEVEL || (env === 'production' ? 'info' : 'debug');
const logDir = process.env.LOG_DIR || 'logs';

// ─── Custom Formats ──────────────────────────────────────────

const timestampFormat = winston.format.timestamp({
  format: 'YYYY-MM-DD HH:mm:ss.SSS',
});

const consoleFormat = winston.format.combine(
  timestampFormat,
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, requestId, ...meta }) => {
    const rid = requestId ? ` [${requestId}]` : '';
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level}${rid}: ${message}${metaStr}`;
  }),
);

const fileFormat = winston.format.combine(
  timestampFormat,
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// ─── Transports ──────────────────────────────────────────────

const transports = [];

// Console transport — always active
transports.push(
  new winston.transports.Console({
    format: consoleFormat,
    handleExceptions: true,
  }),
);

// File transports — only in non-test environments
if (env !== 'test') {
  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat,
      zippedArchive: true,
    }),
  );

  transports.push(
    new DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '60d',
      level: 'error',
      format: fileFormat,
      zippedArchive: true,
    }),
  );
}

// ─── Logger Instance ─────────────────────────────────────────

const logger = winston.createLogger({
  level: logLevel,
  defaultMeta: { service: 'growupmore-api' },
  transports,
  exitOnError: false,
});

// ─── Stream for Morgan HTTP Logger ───────────────────────────

logger.stream = {
  write: (message) => {
    logger.info(message.trim(), { type: 'http' });
  },
};

module.exports = logger;
