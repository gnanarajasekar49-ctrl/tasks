# ─── Stage 1: Install dependencies ───────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

# ─── Stage 2: Production image ────────────────────────────────────────────────
FROM node:20-alpine

# Default environment configuration (overridable via docker run -e)
ENV APP_ENV=production \
    APP_PORT=8081

WORKDIR /app

# Copy production deps from builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy application source and public assets
COPY src/    ./src/
COPY public/ ./public/
COPY package.json ./

EXPOSE 8081

# Built-in container health check (used by Docker and Jenkins verification)
HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${APP_PORT}/health || exit 1

# Run as non-root user for security
USER node

CMD ["node", "src/server.js"]
