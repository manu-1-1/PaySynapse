#!/bin/sh
set -e

echo "🚀 [PaySynapse Container Entrypoint] Checking database readiness..."

# Wait for PostgreSQL to be ready and push Prisma schema
npx prisma db push --skip-generate

# Seed demo data if database is fresh
echo "🌱 [PaySynapse Container Entrypoint] Initializing database state..."
node scripts/generate-demo-data.js || true

echo "✨ [PaySynapse Container Entrypoint] Starting PaySynapse application on port 3000..."
exec node server.js
