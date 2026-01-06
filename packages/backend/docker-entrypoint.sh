#!/bin/sh
# Exit immediately if a command exits with a non-zero status
set -e 

# 1. Wait for DB to be ready (Using the internal Docker network name 'db')
until nc -z db 5432; do
  echo 'Waiting for DB to accept connections on port 5432...'
  sleep 1
done

# 2. Apply Prisma Migrations (The missing piece)
# This updates the live Google Cloud database to match your new code.
# In 2026, Prisma 7 automatically finds prisma.config.ts in the parent dir.
echo 'Deploying database migrations...'
npx prisma migrate deploy

# 3. Start the application
# We use 'exec' so the Node process receives system signals (like shutdown) directly.
echo 'Starting the pitpass app backend...'
exec node dist/index.js
