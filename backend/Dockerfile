# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci
COPY src ./src
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci --production && apk del python3 make g++
COPY --from=builder /app/dist ./dist
EXPOSE 5500
CMD ["node", "dist/main.js"]