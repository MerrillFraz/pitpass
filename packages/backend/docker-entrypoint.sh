#!/bin/sh
# Exit immediately if a command exits with a non-zero status
set -e 

# Wait for DB to be ready
until nc -z db 5432; do
  echo 'Waiting for DB...'
  sleep 1
done


# Start the application
node dist/index.js
