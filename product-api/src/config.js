/**
 * Application Configuration
 * Configures application settings using environment variables instead of hard-coding them.
 */
const config = {
  appEnv: process.env.APP_ENV || 'development',
  appPort: parseInt(process.env.APP_PORT, 10) || 8080,
  dbHost: process.env.DB_HOST || 'localhost'
};

module.exports = config;
