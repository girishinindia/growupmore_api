/**
 * PM2 Ecosystem Configuration — GrowUpMore API
 *
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 restart growupmore-api
 *   pm2 logs growupmore-api
 *   pm2 monit
 */

module.exports = {
  apps: [
    {
      name: 'growupmore-api',
      script: 'src/server.js',
      cwd: '/var/www/growupmore-api',
      instances: 1,                  // Use 'max' for cluster mode (multi-core)
      exec_mode: 'fork',             // Change to 'cluster' if instances > 1
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      min_uptime: '10s',
      max_restarts: 10,

      // Logging
      error_file: '/var/www/growupmore-api/logs/pm2-error.log',
      out_file: '/var/www/growupmore-api/logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // Environment — Production (default)
      env: {
        NODE_ENV: 'production',
        PORT: 5001,
      },

      // Environment — Development (use: pm2 start ecosystem.config.js --env development)
      env_development: {
        NODE_ENV: 'development',
        PORT: 5001,
      },

      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 10000,
      shutdown_with_message: true,
    },
  ],
};
