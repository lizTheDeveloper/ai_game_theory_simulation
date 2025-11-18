/**
 * PM2 Ecosystem Configuration for MARCUS 3.0
 *
 * Production process supervision with auto-restart, log management,
 * and cluster mode support.
 *
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 status
 *   pm2 logs marcus-platform
 *   pm2 monit
 *   pm2 stop all
 *   pm2 restart all
 *
 * @see https://pm2.keymetrics.io/docs/usage/application-declaration/
 */

module.exports = {
  apps: [
    {
      // ==================================================================
      // MARCUS Platform Server
      // ==================================================================
      name: 'marcus-platform',
      script: 'dist/platform/startup.js',
      cwd: __dirname,

      // Node.js configuration
      node_args: '--max-old-space-size=2048',
      interpreter: 'node',

      // Environment
      env: {
        NODE_ENV: 'production',
        // Other env vars should be in .env file
      },

      // Process management
      instances: 1,  // Single instance (Python agents managed by orchestrator)
      exec_mode: 'fork',  // Not cluster (agents need stable IPC)

      // Auto-restart configuration
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',  // Must stay up 10s to count as successful start
      restart_delay: 5000,  // Wait 5s between restarts

      // Crash handling
      exp_backoff_restart_delay: 100,  // Exponential backoff: 100ms, 200ms, 400ms...
      max_memory_restart: '1G',  // Restart if memory exceeds 1GB

      // Logging
      error_file: 'logs/pm2/marcus-platform-error.log',
      out_file: 'logs/pm2/marcus-platform-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      log_type: 'json',

      // Monitoring
      listen_timeout: 10000,  // Wait 10s for listen event
      kill_timeout: 5000,  // Wait 5s for graceful shutdown before SIGKILL
      shutdown_with_message: true,

      // Watch mode (disable in production)
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.git', 'dist'],

      // Cron restart (optional - restart daily at 3am)
      // cron_restart: '0 3 * * *',

      // Health checks
      // wait_ready: true,  // Wait for process.send('ready')

      // Post-deployment hooks
      post_update: ['npm install', 'npm run build'],
    },

    // ==================================================================
    // Metrics Server (optional - if running separately)
    // ==================================================================
    /*
    {
      name: 'marcus-metrics',
      script: 'dist/platform/metrics/server.js',
      cwd: __dirname,

      env: {
        NODE_ENV: 'production',
        METRICS_PORT: 9090,
      },

      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,

      error_file: 'logs/pm2/marcus-metrics-error.log',
      out_file: 'logs/pm2/marcus-metrics-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      watch: false,
    },
    */
  ],

  // ==================================================================
  // PM2 Deployment Configuration (optional)
  // ==================================================================
  deploy: {
    production: {
      user: 'deploy',
      host: ['production-server-1.example.com'],
      ref: 'origin/main',
      repo: 'git@github.com:404GeneNotFound/ai_game_theory_simulation.git',
      path: '/var/www/marcus',

      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production && pm2 save',

      // Environment variables (use .env file instead for secrets)
      env: {
        NODE_ENV: 'production',
      },
    },

    staging: {
      user: 'deploy',
      host: ['staging-server-1.example.com'],
      ref: 'origin/develop',
      repo: 'git@github.com:404GeneNotFound/ai_game_theory_simulation.git',
      path: '/var/www/marcus-staging',

      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging && pm2 save',

      env: {
        NODE_ENV: 'staging',
      },
    },
  },
};
