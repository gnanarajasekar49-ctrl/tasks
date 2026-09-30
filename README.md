# Tasks Repository

This repository contains two completed tasks for the Real-Time Docker and Jenkins Hands-On Assessment.

---

## Task 1 — E-Commerce Product API

**Directory:** `product-api/`

A containerised REST API for managing e-commerce products.

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Application health status |
| `/products` | GET | List all products |
| `/products/:id` | GET | View a single product |
| `/products` | POST | Add a new product |
| `/products/:id` | PUT | Update a product |
| `/products/:id` | DELETE | Delete a product |

**Quick Start:**
```bash
docker build -t product-api:latest ./product-api
docker run -d --name product-api -p 8080:8080 \
  -e APP_ENV=production -e DB_HOST=localhost -e APP_PORT=8080 \
  product-api:latest
curl http://localhost:8080/health
```

---

## Task 2 — Banking Customer Portal CI Pipeline

**Directory:** `customer-portal/`

A Banking Customer Portal with Customer Registration and Details APIs, backed by a full Jenkins CI pipeline.

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | Health check (used by Jenkins Container Verification) |
| `/api/customers` | GET | List all customers |
| `/api/customers/:id` | GET | View a customer by ID |
| `/api/customers` | POST | Register a new customer |

**Jenkins Pipeline Stages:**
1. **Checkout** — retrieves source code using secured Jenkins credentials
2. **Build** — installs Node.js dependencies
3. **Test** — executes 7 automated tests (pipeline stops on failure)
4. **Docker Build** — builds `customer-portal:build-<BUILD_NUMBER>` image
5. **Container Verification** — starts container and verifies `/health` endpoint
6. **Cleanup** — removes the temporary verification container

**Quick Start:**
```bash
docker build -t customer-portal:build-1 ./customer-portal
docker run -d --name customer-portal -p 8081:8081 customer-portal:build-1
curl http://localhost:8081/health
```
