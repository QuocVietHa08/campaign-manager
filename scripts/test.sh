#!/usr/bin/env bash
# =============================================================================
# test.sh — Run tests (creates test DB if needed, runs migrations)
# Usage: ./scripts/test.sh [--watch]
# =============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

WATCH_FLAG=""
for arg in "$@"; do
  case $arg in
    --watch|-w) WATCH_FLAG="--watch" ;;
  esac
done

echo "=============================="
echo "  Running Tests"
echo "=============================="

# Parse DATABASE_URL from .env
if [ -f .env ]; then
  DB_URL=$(grep DATABASE_URL .env | cut -d= -f2-)
  DB_USER=$(echo "$DB_URL" | sed -E 's|postgres://([^:]+):.*|\1|')
  DB_HOST=$(echo "$DB_URL" | sed -E 's|.*@([^:]+):.*|\1|')
  DB_PORT=$(echo "$DB_URL" | sed -E 's|.*:([0-9]+)/.*|\1|')
  DB_NAME=$(echo "$DB_URL" | sed -E 's|.*/([^?]+).*|\1|')
  TEST_DB="${DB_NAME}_test"

  # Check if test DB exists, create if not
  if command -v psql &>/dev/null; then
    if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt 2>/dev/null | cut -d\| -f1 | grep -qw "$TEST_DB"; then
      echo "▸ Creating test database '$TEST_DB'..."
      createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$TEST_DB" 2>/dev/null && \
        echo "  ✓ Created" || echo "  ⚠ Could not create — run: createdb $TEST_DB"
    else
      echo "✓ Test database '$TEST_DB' exists"
    fi
  fi
fi

echo ""
echo "▸ Running Jest..."
if [ -n "$WATCH_FLAG" ]; then
  NODE_ENV=test yarn workspace @campaign-manager/backend test -- --watch
else
  NODE_ENV=test yarn test
fi
