const { app } = require('./app');

const PORT = parseInt(process.env.APP_PORT, 10) || 8081;
const ENV = process.env.APP_ENV || 'development';

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('===============================================');
  console.log('    Banking Customer Portal — Started          ');
  console.log('===============================================');
  console.log(`  Environment : ${ENV}`);
  console.log(`  Port        : ${PORT}`);
  console.log(`  Health      : http://localhost:${PORT}/health`);
  console.log(`  Customers   : http://localhost:${PORT}/api/customers`);
  console.log(`  Portal      : http://localhost:${PORT}/`);
  console.log('===============================================');
});

const shutdown = (signal) => {
  console.log(`\n[${signal}] Shutting down gracefully...`);
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
