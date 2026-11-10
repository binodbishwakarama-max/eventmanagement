# =========================================================================
# DSU CAMPUS EVENTS — PRODUCTION MULTI-STAGE DOCKERFILE
# =========================================================================

# Stage 1: Build the React client application
FROM node:20-alpine AS client-builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/

RUN npm ci

COPY client/ ./client/
ENV VITE_API_URL=/api
ENV VITE_DEMO_MODE=false
RUN npm run build -w client

# Stage 2: Production runtime image
FROM node:20-alpine AS runner
WORKDIR /app

# Install wget for health checks & dumb-init for proper signal handling
RUN apk add --no-cache dumb-init wget

ENV NODE_ENV=production
ENV PORT=5001

# Copy root dependency manifests and install only production dependencies
COPY package.json package-lock.json ./
COPY server/package.json ./server/
COPY client/package.json ./client/

RUN npm ci --omit=dev

# Copy server code
COPY server/ ./server/

# Copy client production build artifacts from stage 1 into client/dist
COPY --from=client-builder /app/client/dist ./client/dist

# Ensure storage directories exist and assign permissions to non-root node user
RUN mkdir -p /app/server/uploads && chown -R node:node /app

USER node

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5001/api/health/live || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server/src/server.js"]

