#!/usr/bin/env bash
# =============================================================================
# typecheck.sh — Run TypeScript type checking on both packages
# Usage: ./scripts/typecheck.sh
# =============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "=============================="
echo "  TypeScript Type Check"
echo "=============================="

FAILED=false

echo ""
echo "▸ Checking backend..."
if npx tsc --noEmit --project packages/backend/tsconfig.json 2>&1; then
  echo "  ✓ Backend types OK"
else
  echo "  ✗ Backend type errors"
  FAILED=true
fi

echo ""
echo "▸ Checking frontend..."
cd packages/frontend
if npx tsc --noEmit 2>&1; then
  echo "  ✓ Frontend types OK"
else
  echo "  ✗ Frontend type errors"
  FAILED=true
fi
cd "$ROOT_DIR"

echo ""
if [ "$FAILED" = true ]; then
  echo "✗ Type errors found"
  exit 1
else
  echo "✓ All types OK"
fi
