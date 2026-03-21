#!/bin/sh
set -e

echo "Running migrations..."

# Reintentar hasta 5 veces con 3 segundos de espera
MAX_RETRIES=5
COUNT=0

until npx prisma migrate deploy || [ $COUNT -eq $MAX_RETRIES ]; do
  COUNT=$((COUNT + 1))
  echo "Migration failed, retry $COUNT/$MAX_RETRIES in 3s..."
  sleep 3
done

if [ $COUNT -eq $MAX_RETRIES ]; then
  echo "Migrations failed after $MAX_RETRIES retries, starting server anyway..."
fi

echo "Starting server..."
exec node dist/src/index.js