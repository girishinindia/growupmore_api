/**
 * ═══════════════════════════════════════════════════════════════
 * SERVER — Entry Point, Starts HTTP Server
 * ═══════════════════════════════════════════════════════════════
 */

const app = require('./app');
const config = require('./config');
const logger = require('./config/logger');
const { testConnection } = require('./config/database');

const PORT = config.port;

// ─── Start Server ────────────────────────────────────────────

const startServer = async () => {
  // Test database connection
  await testConnection();

  const server = app.listen(PORT, () => {
    logger.info('═══════════════════════════════════════════════════');
    logger.info(`  ${config.appName}`);
    logger.info(`  Environment : ${config.env}`);
    logger.info(`  Port        : ${PORT}`);
    logger.info(`  API URL     : ${config.appUrl}/api/${config.apiVersion}`);
    logger.info(`  Health      : ${config.appUrl}/api/health`);
    logger.info('═══════════════════════════════════════════════════');
  });

  // ─── Graceful Shutdown ───────────────────────────────────────

  const gracefulShutdown = (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);

    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // ─── Unhandled Errors ────────────────────────────────────────

  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled Promise Rejection');
  });

  process.on('uncaughtException', (error) => {
    logger.error({ error }, 'Uncaught Exception');
    process.exit(1);
  });
};

startServer();
