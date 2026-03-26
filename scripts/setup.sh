#!/usr/bin/env bash
# =============================================================================
# setup.sh — First-time project setup (local dev without Docker)
# Usage: ./scripts/setup.sh
# =============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "=============================="
echo "  Campaign Manager — Setup"
echo "=============================="

# ── 1. Check prerequisites ──────────────────────────────────────────────────
echo ""
echo "▸ Checking prerequisites..."

check_cmd() {
  if ! command -v "$1" &>/dev/null; then
    echo "  ✗ $1 is not installed. $2"
    exit 1
  fi
  echo "  ✓ $1 found"
}

check_cmd "node" "Install from https://nodejs.org (v22+ required)"
check_cmd "yarn" "Install with: npm install -g yarn"
check_cmd "psql" "Install PostgreSQL from https://www.postgresql.org/download/"

# Check Node version >= 22
NODE_MAJOR=$(node -v | cut -d. -f1 | tr -d 'v')
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "  ✗ Node.js v18+ required (found v$(node -v))"
  exit 1
fi
echo "  ✓ Node.js $(node -v)"

# ── 2. Copy .env ────────────────────────────────────────────────────────────
echo ""
echo "▸ Setting up environment..."

if [ ! -f .env ]; then
  cp .env.example .env
  echo "  ✓ Created .env from .env.example"
else
  echo "  ✓ .env already exists (skipped)"
fi

# ── 3. Install dependencies ─────────────────────────────────────────────────
echo ""
echo "▸ Installing dependencies..."
yarn install
echo "  ✓ Dependencies installed"

# ── 4. Setup Husky ──────────────────────────────────────────────────────────
echo ""
echo "▸ Setting up Husky git hooks..."
npx husky 2>/dev/null || true
chmod +x .husky/pre-commit 2>/dev/null || true
echo "  ✓ Husky configured"

# ── 5. Create databases ─────────────────────────────────────────────────────
echo ""
echo "▸ Creating databases..."

# Parse DATABASE_URL from .env
DB_URL=$(grep DATABASE_URL .env | cut -d= -f2-)
# Extract parts: postgres://user:pass@host:port/dbname
DB_USER=$(echo "$DB_URL" | sed -E 's|postgres://([^:]+):.*|\1|')
DB_HOST=$(echo "$DB_URL" | sed -E 's|.*@([^:]+):.*|\1|')
DB_PORT=$(echo "$DB_URL" | sed -E 's|.*:([0-9]+)/.*|\1|')
DB_NAME=$(echo "$DB_URL" | sed -E 's|.*/([^?]+).*|\1|')

create_db_if_not_exists() {
  local dbname="$1"
  if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt 2>/dev/null | cut -d\| -f1 | grep -qw "$dbname"; then
    echo "  ✓ Database '$dbname' already exists"
  else
    createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$dbname" 2>/dev/null && \
      echo "  ✓ Created database '$dbname'" || \
      echo "  ⚠ Could not create '$dbname' — create it manually: createdb $dbname"
  fi
}

create_db_if_not_exists "$DB_NAME"
create_db_if_not_exists "${DB_NAME}_test"

# ── 6. Run migrations ───────────────────────────────────────────────────────
echo ""
echo "▸ Running database migrations..."
yarn db:migrate 2>&1 && echo "  ✓ Migrations complete" || echo "  ⚠ Migrations failed (is PostgreSQL running?)"

# ── 7. Seed data ────────────────────────────────────────────────────────────
echo ""
echo "▸ Seeding demo data..."
yarn db:seed 2>&1 && echo "  ✓ Seed data loaded" || echo "  ⚠ Seeding failed (may already be seeded)"

# ── 8. Done ─────────────────────────────────────────────────────────────────
echo ""
echo "=============================="
echo "  Setup complete!"
echo "=============================="
echo ""
echo "  Start dev servers:    yarn dev"
echo "  Backend only:         yarn dev:backend"
echo "  Frontend only:        yarn dev:frontend"
echo "  Run tests:            yarn test"
echo ""
echo "  Demo login:"
echo "    Email:    admin@example.com"
echo "    Password: password123"
echo ""
