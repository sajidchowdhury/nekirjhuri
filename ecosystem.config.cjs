/**
 * PM2 Ecosystem Configuration for নেকির ঝুড়ি
 *
 * Usage:
 *   pm2 start ecosystem.config.cjs --env production
 *   pm2 restart nekirjhuri --update-env
 *   pm2 stop nekirjhuri
 *   pm2 delete nekirjhuri
 *
 * The app runs from the Next.js standalone server:
 *   .next/standalone/server.js
 *
 * Environment variables are loaded from .env (not duplicated here).
 * Never put secrets in this file — it's committed to Git.
 */
module.exports = {
  apps: [
    {
      name: "nekirjhuri",
      script: ".next/standalone/server.js",
      cwd: "/var/www/nekirjhuri.com",
      env: {
        NODE_ENV: "production",
      },
      // Auto-restart on crash
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      // Logs
      error_file: "/var/log/nekirjhuri/error.log",
      out_file: "/var/log/nekirjhuri/out.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      // Watch: do NOT watch files in production (causes restart loops)
      watch: false,
    },
  ],
};
