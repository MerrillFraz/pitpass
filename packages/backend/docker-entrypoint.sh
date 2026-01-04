#!/bin/sh

# Wait for DB to be ready
until nc -z db 5432; do
  echo 'Waiting for DB...'
  sleep 1
done

# Apply Prisma migrations
  echo "DATABASE_URL: $DATABASE_URL"
  npx prisma migrate deploy --config=./packages/backend/prisma.config.ts

# Start the application
node dist/index.js
