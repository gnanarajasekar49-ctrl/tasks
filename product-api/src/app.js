const express = require('express');
const healthRoutes = require('./routes/health');
const productRoutes = require('./routes/products');
const config = require('./config');

const app = express();

// Middleware
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Root welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'E-Commerce Product API',
    version: '1.0.0',
    environment: config.appEnv,
    endpoints: {
      health: 'GET /health',
      listProducts: 'GET /products',
      getProduct: 'GET /products/:id',
      createProduct: 'POST /products',
      updateProduct: 'PUT /products/:id',
      deleteProduct: 'DELETE /products/:id'
    }
  });
});

// Mount routes
app.use('/health', healthRoutes);
app.use('/products', productRoutes);

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
