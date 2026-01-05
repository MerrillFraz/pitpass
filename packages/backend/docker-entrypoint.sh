#!/bin/sh
# Exit immediately if a command exits with a non-zero status
set -e 

# Wait for DB to be ready
until nc -z db 5432; do
  echo 'Waiting for DB...'
  sleep 1
done

# Apply Prisma migrations
export DATABASE_URL="postgresql://user:password@db:5432/pitpass_db"
npx prisma migrate deploy --config ./prisma.config.ts

# Start the application
node dist/index.js
