# syntax=docker/dockerfile:1

# 1. Install dependencies
FROM node:20-alpine AS deps
WORKDIR /usr/src/app
# Copy root package files
COPY package.json package-lock.json* ./
# Copy frontend package file
COPY packages/frontend/package.json ./packages/frontend/
RUN npm install -w frontend --omit=dev

# 2. Build the application
FROM node:20-alpine AS builder
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
RUN npm run build -w frontend

# 3. Serve the application
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html
COPY --from=builder /usr/src/app/packages/frontend/dist .
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
