const express = require('express');
const router = express.Router();

// In-memory product store initialized with sample e-commerce data
let products = [
  {
    id: 1,
    name: 'Wireless Noise-Canceling Headphones',
    description: 'Over-ear Bluetooth headphones with active noise cancellation',
    category: 'Electronics',
    price: 199.99,
    stock: 45,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Ergonomic Mechanical Keyboard',
    description: 'RGB mechanical keyboard with hot-swappable switches',
    category: 'Computers',
    price: 129.50,
    stock: 28,
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Smart Fitness Watch',
    description: 'Waterproof smartwatch with heart rate and sleep tracking',
    category: 'Wearables',
    price: 89.99,
    stock: 60,
    createdAt: new Date().toISOString()
  }
];

let nextId = 4;

// GET /products - View all products (with optional ?category= filter)
router.get('/', (req, res) => {
  const { category, search } = req.query;
  let results = [...products];

  if (category) {
    results = results.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    results = results.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  res.status(200).json({
    total: results.length,
    products: results
  });
});

// GET /products/:id - View a single product by ID
router.get('/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10);
  if (isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: `Product with ID ${productId} not found` });
  }

  res.status(200).json(product);
});

// POST /products - Add a new product
router.post('/', (req, res) => {
  const { name, description, category, price, stock } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({
      error: 'Validation failed: "name" and "price" are required fields'
    });
  }

  const numericPrice = parseFloat(price);
  if (isNaN(numericPrice) || numericPrice < 0) {
    return res.status(400).json({
      error: 'Validation failed: "price" must be a positive number'
    });
  }

  const newProduct = {
    id: nextId++,
    name: name.trim(),
    description: description ? description.trim() : '',
    category: category ? category.trim() : 'General',
    price: numericPrice,
    stock: typeof stock === 'number' && stock >= 0 ? stock : 0,
    createdAt: new Date().toISOString()
  };

  products.push(newProduct);

  res.status(201).json({
    message: 'Product created successfully',
    product: newProduct
  });
});

// PUT /products/:id - Update an existing product
router.put('/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10);
  if (isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  const productIndex = products.findIndex(p => p.id === productId);
  if (productIndex === -1) {
    return res.status(404).json({ error: `Product with ID ${productId} not found` });
  }

  const { name, description, category, price, stock } = req.body;

  if (price !== undefined) {
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        error: 'Validation failed: "price" must be a positive number'
      });
    }
    products[productIndex].price = numericPrice;
  }

  if (name !== undefined) products[productIndex].name = name.trim();
  if (description !== undefined) products[productIndex].description = description.trim();
  if (category !== undefined) products[productIndex].category = category.trim();
  if (stock !== undefined && typeof stock === 'number' && stock >= 0) {
    products[productIndex].stock = stock;
  }

  products[productIndex].updatedAt = new Date().toISOString();

  res.status(200).json({
    message: 'Product updated successfully',
    product: products[productIndex]
  });
});

// DELETE /products/:id - Delete a product
router.delete('/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10);
  if (isNaN(productId)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  const productIndex = products.findIndex(p => p.id === productId);
  if (productIndex === -1) {
    return res.status(404).json({ error: `Product with ID ${productId} not found` });
  }

  const deletedProduct = products.splice(productIndex, 1)[0];

  res.status(200).json({
    message: 'Product deleted successfully',
    deletedProduct
  });
});

module.exports = router;
