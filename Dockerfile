# Multi-stage build for production deployment
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build client
RUN pnpm run build:client

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built client from builder
COPY --from=builder /app/client/dist ./client/dist

# Copy server code
COPY server ./server
COPY drizzle ./drizzle
COPY shared ./shared
COPY storage ./storage

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the server
CMD ["node", "--loader", "tsx", "server/_core/index.ts"]
