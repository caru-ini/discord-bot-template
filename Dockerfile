# Build stage
FROM oven/bun:1.4.0 AS builder

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .

# Production stage
FROM oven/bun:1.4.0-slim AS runner

WORKDIR /app

# Copy node_modules and source files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./
COPY --from=builder /app/tsconfig.json ./

# Set as production environment
ENV NODE_ENV=production 

# Run as non-root user
USER bun

CMD ["bun", "run", "start"]
