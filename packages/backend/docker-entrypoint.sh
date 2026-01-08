#!/bin/sh
# This script ensures the database is ready, migrated, and seeded before starting the main application.

# Exit immediately if a command exits with a non-zero status.
set -e

# The `backend` service in docker-compose depends on the `db` service with a healthcheck,
# so we don't need to manually wait for the database here.

echo "Running database migrations..."
npx prisma migrate deploy

echo "Generating Prisma Client..."
npx prisma generate

echo "Seeding database..."
node packages/backend/prisma/seed.cjs

# Finally, execute the command passed to this script (the Dockerfile's CMD)
exec "$@"
