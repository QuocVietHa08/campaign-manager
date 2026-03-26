#!/usr/bin/env bash
# =============================================================================
# db-reset.sh — Reset database: undo all migrations, re-migrate, re-seed
# Usage: ./scripts/db-reset.sh [--test]
# =============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

TARGET="development"
for arg in "$@"; do
  case $arg in
    --test|-t) TARGET="test" ;;
  esac
done

echo "=============================="
echo "  Database Reset ($TARGET)"
echo "=============================="

if [ "$TARGET" = "test" ]; then
  export NODE_ENV=test
fi

echo ""
echo "▸ Undoing all migrations..."
yarn db:migrate:undo 2>&1 || echo "  (no migrations to undo)"

echo ""
echo "▸ Running migrations..."
yarn db:migrate

echo ""
echo "▸ Seeding data..."
yarn db:seed

echo ""
echo "✓ Database reset complete"
