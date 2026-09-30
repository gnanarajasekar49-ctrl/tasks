# Use official lightweight Node.js Alpine base image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Set default application environment variables
ENV APP_ENV=production \
    DB_HOST=localhost \
    APP_PORT=8080

# Copy package manifests first to leverage Docker layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy application source code
COPY src/ ./src/

# Expose the configured application port
EXPOSE 8080

# Switch to unprivileged user for container security
USER node

# Healthcheck configuration
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${APP_PORT}/health || exit 1

# Start the application
CMD ["node", "src/server.js"]
