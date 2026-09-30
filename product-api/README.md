# E-Commerce Product API

A containerized RESTful Product API designed for web and mobile e-commerce applications.

---

## Architecture Flow

```text
Client (Web / Mobile / curl)
       │
       ▼
Docker Container (Port 8080 exposed)
       │
       ▼
Product API (Node.js / Express)
 ├── /health    (Health check)
 └── /products  (CRUD operations)
```

---

## Application Configuration

The application is configured through environment variables:

| Variable | Description | Default Value |
|---|---|---|
| `APP_ENV` | Application environment (`development`, `test`, `production`) | `production` |
| `DB_HOST` | Database host or future database connection endpoint | `localhost` |
| `APP_PORT` | Port the internal HTTP server binds to | `8080` |

---

## API Endpoints

### 1. Health Check
* **`GET /health`**
  ```bash
  curl http://localhost:8080/health
  ```
  Response:
  ```json
  {
    "status": "UP",
    "message": "Product API is healthy and operational",
    "environment": "production",
    "dbHost": "localhost",
    "port": 8080,
    "uptimeSeconds": 15,
    "timestamp": "2026-09-30T09:00:00.000Z"
  }
  ```

### 2. View All Products
* **`GET /products`** (optional filters: `?category=Electronics`, `?search=keyboard`)
  ```bash
  curl http://localhost:8080/products
  ```

### 3. View Single Product
* **`GET /products/:id`**
  ```bash
  curl http://localhost:8080/products/1
  ```

### 4. Add Product
* **`POST /products`**
  ```bash
  curl -X POST http://localhost:8080/products \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Wireless Gaming Mouse",
      "description": "Ergonomic 16000 DPI sensor",
      "category": "Electronics",
      "price": 59.99,
      "stock": 100
    }'
  ```

### 5. Update Product
* **`PUT /products/:id`**
  ```bash
  curl -X PUT http://localhost:8080/products/1 \
    -H "Content-Type: application/json" \
    -d '{
      "price": 179.99,
      "stock": 35
    }'
  ```

### 6. Delete Product
* **`DELETE /products/:id`**
  ```bash
  curl -X DELETE http://localhost:8080/products/1
  ```

---

## Docker Lifecycle Commands

### 1. Build the Docker Image
```bash
docker build -t product-api:latest .
```

### 2. Run the Container
```bash
docker run -d \
  --name product-api-container \
  -p 8080:8080 \
  -e APP_ENV=production \
  -e DB_HOST=db.prod.internal \
  -e APP_PORT=8080 \
  product-api:latest
```

### 3. Test Endpoints
```bash
# Health check
curl http://localhost:8080/health

# List products
curl http://localhost:8080/products
```

### 4. Stop and Remove the Container
```bash
docker stop product-api-container
docker rm product-api-container
```

### 5. Start a New Container (Consistent Behavior Verification)
```bash
docker run -d \
  --name product-api-container-v2 \
  -p 8080:8080 \
  -e APP_ENV=staging \
  -e DB_HOST=db.stage.internal \
  product-api:latest
```
