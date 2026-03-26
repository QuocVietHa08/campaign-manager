#!/usr/bin/env bash
# =============================================================================
# lint-format.sh — Run Prettier and ESLint across the project
# Usage: ./scripts/lint-format.sh [--check]
# =============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

CHECK_ONLY=false
for arg in "$@"; do
  case $arg in
    --check|-c) CHECK_ONLY=true ;;
  esac
done

echo "=============================="
echo "  Lint & Format"
echo "=============================="

if [ "$CHECK_ONLY" = true ]; then
  echo ""
  echo "▸ Checking formatting (Prettier)..."
  yarn format:check && echo "  ✓ Formatting OK" || { echo "  ✗ Formatting issues found. Run: yarn format"; exit 1; }

  echo ""
  echo "▸ Checking lint (ESLint)..."
  yarn lint 2>&1 && echo "  ✓ Lint OK" || { echo "  ✗ Lint issues found"; exit 1; }
else
  echo ""
  echo "▸ Formatting (Prettier)..."
  yarn format
  echo "  ✓ Formatted"

  echo ""
  echo "▸ Linting (ESLint --fix)..."
  yarn lint 2>&1 || true
  echo "  ✓ Lint complete"
fi

echo ""
echo "✓ Done"
