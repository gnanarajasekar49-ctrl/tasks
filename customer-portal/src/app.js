const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// In-memory customer store seeded with two sample customers
let customers = [
  {
    id: 1,
    accountNumber: 'ACC-100001',
    fullName: 'Alexander Wright',
    email: 'alex.wright@horizonbank.com',
    accountType: 'Savings',
    balance: 14250.75,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    accountNumber: 'ACC-100002',
    fullName: 'Sophia Martinez',
    email: 'sophia.martinez@horizonbank.com',
    accountType: 'Checking',
    balance: 5320.00,
    createdAt: new Date().toISOString()
  }
];

let nextId = 3;

// Helper: Generate unique account number
function generateAccountNumber() {
  return `ACC-${Math.floor(100000 + Math.random() * 900000)}`;
}

// GET /health — Health check (used by Jenkins Container Verification)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'banking-customer-portal',
    version: '1.0.0',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// GET /api/customers — List all registered customers
app.get('/api/customers', (req, res) => {
  res.status(200).json({ total: customers.length, customers });
});

// GET /api/customers/:id — Get a customer by numeric ID or account number
app.get('/api/customers/:id', (req, res) => {
  const param = req.params.id;
  const customer = customers.find(
    c => c.id === parseInt(param, 10) || c.accountNumber.toLowerCase() === param.toLowerCase()
  );

  if (!customer) {
    return res.status(404).json({ error: `Customer '${param}' not found` });
  }

  res.status(200).json({ customer });
});

// POST /api/customers — Register a new customer
app.post('/api/customers', (req, res) => {
  const { fullName, email, accountType, initialDeposit } = req.body;

  if (!fullName || !email || !accountType || initialDeposit === undefined) {
    return res.status(400).json({
      error: 'Validation failed: fullName, email, accountType, and initialDeposit are required'
    });
  }

  const deposit = parseFloat(initialDeposit);
  if (isNaN(deposit) || deposit < 0) {
    return res.status(400).json({
      error: 'Validation failed: initialDeposit must be a non-negative number'
    });
  }

  const validTypes = ['Savings', 'Checking'];
  if (!validTypes.includes(accountType)) {
    return res.status(400).json({
      error: `Validation failed: accountType must be one of: ${validTypes.join(', ')}`
    });
  }

  const newCustomer = {
    id: nextId++,
    accountNumber: generateAccountNumber(),
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    accountType,
    balance: deposit,
    createdAt: new Date().toISOString()
  };

  customers.push(newCustomer);

  res.status(201).json({
    message: 'Customer registered successfully',
    customer: newCustomer
  });
});

// DELETE /api/customers/:id — Remove a customer (utility for tests)
app.delete('/api/customers/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = customers.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Customer with ID ${id} not found` });
  }

  const removed = customers.splice(index, 1)[0];
  res.status(200).json({ message: 'Customer removed', customer: removed });
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

module.exports = { app, getCustomers: () => customers };
