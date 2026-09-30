/**
 * Automated Integration Test Suite — Banking Customer Portal
 * Tests: Health check, customer registration, view all customers,
 *        view single customer, input validation, and delete.
 */
const assert = require('assert');
const http = require('http');
const { app } = require('../src/app');

// Helper: Make HTTP request against the test server
function request(server, { path, method = 'GET', body = null }) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const options = {
      hostname: '127.0.0.1',
      port,
      path,
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {}
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

let passed = 0;
let failed = 0;
const results = [];

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓  ${name}`);
    results.push({ name, passed: true });
    passed++;
  } catch (err) {
    console.error(`  ✗  ${name}`);
    console.error(`     → ${err.message}`);
    results.push({ name, passed: false, error: err.message });
    failed++;
  }
}

async function runTests() {
  const server = app.listen(0); // bind on random port so no collision
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  Banking Customer Portal — Automated Test Suite');
  console.log('═══════════════════════════════════════════════════════\n');

  // ──────────────────────────────────────────────────────────────
  // TEST 1: Health check returns status UP
  // ──────────────────────────────────────────────────────────────
  await test('Health check returns HTTP 200 and status UP', async () => {
    const res = await request(server, { path: '/health' });
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    assert.strictEqual(res.body.status, 'UP', `Expected status=UP, got ${res.body.status}`);
    assert.ok(res.body.service, 'Expected service field in health response');
  });

  // ──────────────────────────────────────────────────────────────
  // TEST 2: GET /api/customers returns seeded customers
  // ──────────────────────────────────────────────────────────────
  await test('GET /api/customers returns customer list with total count', async () => {
    const res = await request(server, { path: '/api/customers' });
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    assert.ok(typeof res.body.total === 'number', 'Expected total to be a number');
    assert.ok(Array.isArray(res.body.customers), 'Expected customers to be an array');
    assert.ok(res.body.total >= 2, `Expected at least 2 customers, got ${res.body.total}`);
  });

  // ──────────────────────────────────────────────────────────────
  // TEST 3: POST /api/customers registers a new customer
  // ──────────────────────────────────────────────────────────────
  let createdId;
  await test('POST /api/customers registers a new customer and returns 201', async () => {
    const payload = {
      fullName: 'Test User Jenkins',
      email: 'testuser.jenkins@horizonbank.com',
      accountType: 'Savings',
      initialDeposit: 2500.00
    };
    const res = await request(server, { path: '/api/customers', method: 'POST', body: payload });
    assert.strictEqual(res.status, 201, `Expected 201, got ${res.status}`);
    assert.ok(res.body.customer, 'Expected customer object in response');
    assert.strictEqual(res.body.customer.fullName, 'Test User Jenkins');
    assert.ok(res.body.customer.accountNumber.startsWith('ACC-'), 'Expected accountNumber starting with ACC-');
    assert.strictEqual(res.body.customer.balance, 2500.00);
    createdId = res.body.customer.id;
  });

  // ──────────────────────────────────────────────────────────────
  // TEST 4: GET /api/customers/:id retrieves the created customer
  // ──────────────────────────────────────────────────────────────
  await test('GET /api/customers/:id retrieves a specific customer by ID', async () => {
    if (!createdId) return assert.fail('Previous test did not set createdId');
    const res = await request(server, { path: `/api/customers/${createdId}` });
    assert.strictEqual(res.status, 200, `Expected 200, got ${res.status}`);
    assert.ok(res.body.customer, 'Expected customer in response');
    assert.strictEqual(res.body.customer.id, createdId);
    assert.strictEqual(res.body.customer.email, 'testuser.jenkins@horizonbank.com');
  });

  // ──────────────────────────────────────────────────────────────
  // TEST 5: POST /api/customers with missing fields returns 400
  // ──────────────────────────────────────────────────────────────
  await test('POST /api/customers with missing fields returns HTTP 400', async () => {
    const payload = { fullName: 'Incomplete Customer' }; // missing email, accountType, initialDeposit
    const res = await request(server, { path: '/api/customers', method: 'POST', body: payload });
    assert.strictEqual(res.status, 400, `Expected 400, got ${res.status}`);
    assert.ok(res.body.error, 'Expected error message in response');
  });

  // ──────────────────────────────────────────────────────────────
  // TEST 6: POST /api/customers with invalid accountType returns 400
  // ──────────────────────────────────────────────────────────────
  await test('POST /api/customers with invalid accountType returns HTTP 400', async () => {
    const payload = {
      fullName: 'Bad Type Customer',
      email: 'badtype@horizonbank.com',
      accountType: 'Investment', // Invalid
      initialDeposit: 500
    };
    const res = await request(server, { path: '/api/customers', method: 'POST', body: payload });
    assert.strictEqual(res.status, 400, `Expected 400, got ${res.status}`);
    assert.ok(res.body.error.includes('accountType'), 'Expected accountType error message');
  });

  // ──────────────────────────────────────────────────────────────
  // TEST 7: GET /api/customers/:id for non-existent customer returns 404
  // ──────────────────────────────────────────────────────────────
  await test('GET /api/customers/9999 for non-existent customer returns HTTP 404', async () => {
    const res = await request(server, { path: '/api/customers/9999' });
    assert.strictEqual(res.status, 404, `Expected 404, got ${res.status}`);
    assert.ok(res.body.error, 'Expected error message in response');
  });

  server.close();

  // ────── Summary ──────
  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log('═══════════════════════════════════════════════════════\n');

  if (failed > 0) {
    console.error('TEST SUITE FAILED — pipeline should stop here.\n');
    process.exit(1);
  }

  console.log('All tests passed! Docker build stage can proceed.\n');
  process.exit(0);
}

runTests().catch(err => {
  console.error('\nUnexpected test runner error:', err);
  process.exit(1);
});
