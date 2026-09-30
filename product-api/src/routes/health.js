const express = require('express');
const router = express.Router();
const config = require('../config');

// GET /health - Returns application health status and configuration details
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'Product API is healthy and operational',
    environment: config.appEnv,
    dbHost: config.dbHost,
    port: config.appPort,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
