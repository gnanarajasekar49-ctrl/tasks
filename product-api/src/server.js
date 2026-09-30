const app = require('./app');
const config = require('./config');

const server = app.listen(config.appPort, '0.0.0.0', () => {
  console.log('==============================================');
  console.log('       E-Commerce Product API Started         ');
  console.log('==============================================');
  console.log(`• Environment (APP_ENV) : ${config.appEnv}`);
  console.log(`• Database Host (DB_HOST) : ${config.dbHost}`);
  console.log(`• Listening Port (APP_PORT): ${config.appPort}`);
  console.log(`• Health Check Endpoint   : http://localhost:${config.appPort}/health`);
  console.log(`• Products Endpoint       : http://localhost:${config.appPort}/products`);
  console.log('==============================================');
});

// Graceful shutdown handling
const shutdown = (signal) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Force shutdown after timeout.');
    process.exit(1);
  }, 5000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
