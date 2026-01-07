# 1. Install dependencies
FROM node:20-alpine AS deps
WORKDIR /usr/src/app

# Copy root manifests and backend manifests for workspace resolution
COPY package.json package-lock.json* ./
COPY prisma.config.ts ./ 
COPY packages/backend/package.json ./packages/backend/

# Prisma v7 requires the schema to be present during some install phases 
# depending on your engine settings
COPY packages/backend/prisma ./packages/backend/prisma

# Install ALL dependencies (root and workspaces)
RUN npm install --include=dev

# 2. Build the application
FROM node:20-alpine AS builder
WORKDIR /usr/src/app

# Copy node_modules from deps stage (all dependencies)
COPY --from=deps /usr/src/app/node_modules ./node_modules
# Copy all source files (leveraging .dockerignore to skip frontend/infra)
COPY . . 

# Generate Prisma Client 
# We run this from root so it picks up prisma.config.ts
# Using a placeholder URL to satisfy Prisma's build-time validation
RUN DATABASE_URL="postgresql://placeholder" npx prisma generate --schema=./packages/backend/prisma/schema.prisma

# Build the backend package
RUN npm run build -w backend

# Debug stage for builder
FROM builder AS builder-debug
CMD ["bash"]

# 3. Production Runner
FROM node:20-alpine AS runner
WORKDIR /usr/src/app

RUN apk add --no-cache curl dos2unix

# Set production environment
ENV NODE_ENV=production

# --- INFRASTRUCTURE ---
# Copy package manifests for workspace context and for npx to work correctly
COPY --from=deps /usr/src/app/package.json ./
COPY --from=deps /usr/src/app/package-lock.json* ./
COPY --from=builder /usr/src/app/packages/backend/package.json ./packages/backend/package.json
COPY --from=builder /usr/src/app/prisma.config.ts ./

# --- DEPENDENCIES ---
# Copy the entire pre-installed node_modules directory from the 'deps' stage
COPY --from=deps /usr/src/app/node_modules ./node_modules

# --- BACKEND ASSETS ---
# Copy the compiled code and its specific package.json
COPY --from=builder /usr/src/app/packages/backend/dist ./packages/backend/dist
# Copy the schema for runtime migrations (prisma migrate deploy)
COPY --from=builder /usr/src/app/packages/backend/prisma ./packages/backend/prisma

# --- SCRIPTS ---
COPY packages/backend/docker-entrypoint.sh /usr/local/bin/
RUN dos2unix /usr/local/bin/docker-entrypoint.sh && chmod +x /usr/local/bin/docker-entrypoint.sh

# --- STARTUP ---
WORKDIR /usr/src/app
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "packages/backend/dist/index.js"]

