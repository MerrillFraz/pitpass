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
RUN npm install

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

# 3. Production Runner
FROM node:20-alpine AS runner
WORKDIR /usr/src/app

# Set production environment
ENV NODE_ENV=production

# --- INFRASTRUCTURE ---
# Copy root files needed for npm install and Prisma CLI resolution in production
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/prisma.config.ts ./

# --- BACKEND ASSETS ---
# Copy the compiled code and its specific package.json
COPY --from=builder /usr/src/app/packages/backend/dist ./packages/backend/dist
COPY --from=builder /usr/src/app/packages/backend/package.json ./packages/backend/package.json
# Copy the schema for runtime migrations (prisma migrate deploy)
COPY --from=builder /usr/src/app/packages/backend/prisma ./packages/backend/prisma

# --- DEPENDENCIES ---
# Install only production dependencies for the entire monorepo
RUN npm install --omit=dev

# --- SCRIPTS ---
COPY packages/backend/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

# Ensure the entrypoint knows where the app starts
WORKDIR /usr/src/app/packages/backend
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
