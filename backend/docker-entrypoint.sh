#!/bin/sh
set -e

echo "⏳ Waiting for PostgreSQL..."
until node -e "
const { Client } = require('pg');
const c = new Client({ connectionString: process.env.DATABASE_URL });
c.connect().then(() => c.end()).then(() => process.exit(0)).catch(() => process.exit(1));
" 2>/dev/null; do
  sleep 2
done
echo "✅ PostgreSQL is ready"

echo "🌱 Seeding questions if needed..."
node scripts/docker-seed.js || echo "⚠️  Seed skipped or partial"

exec "$@"
