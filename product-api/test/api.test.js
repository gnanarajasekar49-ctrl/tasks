const assert = require('assert');
const http = require('http');
const app = require('../src/app');

function makeRequest(server, path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const req = http.request(
      {
        host: '127.0.0.1',
        port,
        path,
        method,
        headers: body ? { 'Content-Type': 'application/json' } : {}
      },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  const server = app.listen(0);
  console.log('Running API tests...');

  try {
    // 1. Health check
    const health = await makeRequest(server, '/health');
    assert.strictEqual(health.status, 200);
    assert.strictEqual(health.body.status, 'UP');
    console.log('✓ Health check passed');

    // 2. View all products
    const products = await makeRequest(server, '/products');
    assert.strictEqual(products.status, 200);
    assert(products.body.total >= 3);
    console.log('✓ View products passed');

    // 3. View single product
    const product = await makeRequest(server, '/products/1');
    assert.strictEqual(product.status, 200);
    assert.strictEqual(product.body.id, 1);
    console.log('✓ View single product passed');

    // 4. Add new product
    const createRes = await makeRequest(server, '/products', 'POST', {
      name: 'Test Gaming Mouse',
      price: 49.99,
      category: 'Electronics',
      stock: 15
    });
    assert.strictEqual(createRes.status, 201);
    const newId = createRes.body.product.id;
    console.log('✓ Add product passed (ID: ' + newId + ')');

    // 5. Update product
    const updateRes = await makeRequest(server, `/products/${newId}`, 'PUT', {
      price: 39.99,
      stock: 20
    });
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.body.product.price, 39.99);
    console.log('✓ Update product passed');

    // 6. Delete product
    const deleteRes = await makeRequest(server, `/products/${newId}`, 'DELETE');
    assert.strictEqual(deleteRes.status, 200);
    console.log('✓ Delete product passed');

    console.log('\nAll API integration tests passed successfully!');
  } finally {
    server.close();
  }
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
