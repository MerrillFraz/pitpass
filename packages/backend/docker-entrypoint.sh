#!/bin/sh
set -e 

until nc -z db 5432; do
  echo 'Waiting for Postgres...'
  sleep 1
done

echo 'Applying database migrations...'
# Move to root where prisma.config.ts lives to run the migration and then execute the app from root
cd /usr/src/app
npx prisma migrate deploy

echo 'Generating Prisma Client...'
npx prisma generate --schema=./packages/backend/prisma/schema.prisma

exec node packages/backend/dist/index.js