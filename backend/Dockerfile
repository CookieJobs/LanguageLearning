# Build stage: compile TypeScript only
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
COPY src ./src
RUN npx tsc

# Production stage: reuse pre-built argon2 binary from old image
FROM bdcbe82ef0c2 AS runtime
WORKDIR /app
# Replace old dist with new compiled dist (minus node_modules)
COPY --from=builder /app/dist ./dist
# argon2 binary already exists at /app/node_modules/argon2/lib/binding/napi-v3/argon2.node