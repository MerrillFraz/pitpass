# syntax=docker/dockerfile:1

# 1. Install dependencies
FROM node:20-alpine AS deps
WORKDIR /usr/src/app
# Copy root package files
COPY package.json package-lock.json* ./
# Copy backend package file
COPY packages/backend/package.json ./packages/backend/
RUN npm install -w backend --omit=dev

# 2. Build the application
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
# Generate prisma client
RUN npx prisma generate --schema=./packages/backend/prisma/schema.prisma
RUN npm run build -w backend

# 3. Run the application
FROM node:20-alpine AS runner
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/packages/backend/package.json ./packages/backend/package.json
COPY --from=builder /usr/src/app/packages/backend/prisma ./packages/backend/prisma
COPY --from=builder /usr/src/app/packages/backend/.env ./packages/backend/.env
EXPOSE 3000
CMD ["node", "dist/index.js"]
