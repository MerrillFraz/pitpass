# 1. Install dependencies
FROM node:20-alpine AS deps
WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
COPY packages/backend/package.json ./packages/backend/

# Prisma v7 looks for this in the current directory during install/generate
COPY prisma.config.ts ./ 

RUN npm install -w backend --omit=dev

# 2. Build the application
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Copy deps and source
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . . 
# Ensure config is at root
COPY prisma.config.ts ./ 

# --- THE FIX ---
# Run from root (no '-w backend').
# This prevents the "double nesting" path error.
# We still need the dummy DATABASE_URL for Prisma 7 validation.
RUN DATABASE_URL="postgresql://placeholder" npx prisma generate

# Now build the backend (which uses the client we just generated)
RUN npm run build -w backend


# 3. Run the application
FROM node:20-alpine AS runner
WORKDIR /usr/src/app

# --- CRITICAL MISSING PIECE ---
# Prisma CLI needs the root package.json to resolve the project structure
COPY --from=builder /usr/src/app/package.json ./

# --- CONFIG AND SCHEMA ---
# Copy the config to the root so the CLI finds it automatically
COPY --from=builder /usr/src/app/prisma.config.ts ./
# Copy the schema and migrations (needed for migrate deploy)
COPY --from=builder /usr/src/app/packages/backend/prisma ./packages/backend/prisma

# --- APP ASSETS ---
COPY --from=builder /usr/src/app/packages/backend/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/packages/backend/package.json ./packages/backend/package.json

# --- ENTRYPOINT ---
COPY packages/backend/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY packages/backend/docker-entrypoint-init.sh /usr/local/bin/docker-entrypoint-init.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint-init.sh

EXPOSE 3000
CMD ["docker-entrypoint.sh"]

