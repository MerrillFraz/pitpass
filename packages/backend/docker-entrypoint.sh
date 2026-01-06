#!/bin/sh
set -e 

until nc -z db 5432; do
  echo 'Waiting for Postgres...'
  sleep 1
done

echo 'Applying database migrations...'
# Move to root where prisma.config.ts lives to run the migration
cd /usr/src/app
npx prisma migrate deploy

# Move back to backend to start the app
cd /usr/src/app/packages/backend
exec node dist/index.js