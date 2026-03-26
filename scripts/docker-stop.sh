#!/usr/bin/env bash
# =============================================================================
# docker-stop.sh — Stop Docker Compose services
# Usage: ./scripts/docker-stop.sh [--clean]
# =============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

CLEAN=false
for arg in "$@"; do
  case $arg in
    --clean|-c) CLEAN=true ;;
  esac
done

echo "▸ Stopping containers..."
docker compose down

if [ "$CLEAN" = true ]; then
  echo "▸ Removing volumes (database data will be lost)..."
  docker compose down -v
  echo "✓ Containers and volumes removed"
else
  echo "✓ Containers stopped (database data preserved)"
  echo "  Use --clean to also remove volumes"
fi
