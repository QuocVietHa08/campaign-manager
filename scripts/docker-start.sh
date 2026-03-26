#!/usr/bin/env bash
# =============================================================================
# docker-start.sh — Start everything with Docker Compose
# Usage: ./scripts/docker-start.sh [--build] [--detach]
# =============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

BUILD_FLAG=""
DETACH_FLAG=""

for arg in "$@"; do
  case $arg in
    --build|-b) BUILD_FLAG="--build" ;;
    --detach|-d) DETACH_FLAG="-d" ;;
    *) echo "Unknown arg: $arg"; exit 1 ;;
  esac
done

echo "=============================="
echo "  Campaign Manager — Docker"
echo "=============================="

# Check Docker is running
if ! docker info &>/dev/null; then
  echo "✗ Docker is not running. Please start Docker Desktop first."
  exit 1
fi
echo "✓ Docker is running"

# Stop existing containers
echo ""
echo "▸ Stopping existing containers..."
docker compose down 2>/dev/null || true

# Start services
echo ""
echo "▸ Starting services..."
docker compose up $BUILD_FLAG $DETACH_FLAG

# If running in detached mode, show status
if [ -n "$DETACH_FLAG" ]; then
  echo ""
  echo "▸ Waiting for services to be healthy..."
  sleep 5
  docker compose ps
  echo ""
  echo "=============================="
  echo "  Services running!"
  echo "=============================="
  echo ""
  echo "  Frontend:  http://localhost:5173"
  echo "  Backend:   http://localhost:3001"
  echo "  Postgres:  localhost:5432"
  echo ""
  echo "  View logs:    docker compose logs -f"
  echo "  Stop:         docker compose down"
  echo ""
fi
