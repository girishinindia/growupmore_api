/**
 * ═══════════════════════════════════════════════════════════════
 * SERVER.JS — Entry Point
 * ═══════════════════════════════════════════════════════════════
 * ONLY starts the server. No Express logic here.
 * Handles graceful shutdown, uncaught exceptions.
 * ═══════════════════════════════════════════════════════════════
 */

const config = require('./config/index');
const logger = require('./config/logger');
const app = require('./app');

// ─── Uncaught Exception Handler ──────────────────────────────
process.on('uncaughtException', (err) => {
  logger.error({ err }, 'UNCAUGHT EXCEPTION — Shutting down...');
  process.exit(1);
});

// ─── Start Server ────────────────────────────────────────────
const server = app.listen(config.port, () => {
  logger.info(`
  ╔═══════════════════════════════════════════════╗
  ║   ${config.appName}                        ║
  ║   Environment : ${config.env.padEnd(28)}║
  ║   Port        : ${String(config.port).padEnd(28)}║
  ║   API Version : ${config.apiVersion.padEnd(28)}║
  ║   Health      : http://localhost:${config.port}/api/health  ║
  ╚═══════════════════════════════════════════════╝
  `);

  // Test database connection on startup (non-blocking)
  if (!config.isTest) {
    const { testConnection } = require('./config/database');
    testConnection().catch(() => {
      logger.warn('Could not connect to Supabase on startup. Will retry on first request.');
    });
  }
});

// ─── Unhandled Rejection Handler ─────────────────────────────
process.on('unhandledRejection', (err) => {
  logger.error({ err }, 'UNHANDLED REJECTION — Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});

// ─── Graceful Shutdown (SIGTERM from PM2/Docker) ─────────────
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed. Process terminating.');
    process.exit(0);
  });
});

// ─── Graceful Shutdown (SIGINT from Ctrl+C) ──────────────────
process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed. Process terminating.');
    process.exit(0);
  });
});

module.exports = server;
