#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

echo "=== Crescent Studio Build ==="

# 1. Build Python backend with PyInstaller
echo ""
echo "--- Building backend ---"
cd "$BACKEND_DIR"

if [ ! -d ".venv" ]; then
  echo "Error: backend/.venv not found. Create a virtualenv first."
  exit 1
fi

.venv/bin/pip install pyinstaller --quiet
.venv/bin/pyinstaller crescent-backend.spec --distpath "$ROOT_DIR/backend-dist" --workpath "$ROOT_DIR/build-tmp" -y

echo "Backend built to: $ROOT_DIR/backend-dist/"

# 2. Build frontend + Electron
echo ""
echo "--- Building frontend + Electron ---"
cd "$FRONTEND_DIR"

npm ci --quiet
ELECTRON=true npx vite build
npx electron-builder --config package.json

echo ""
echo "=== Build complete ==="
echo "Distributable: $FRONTEND_DIR/release/"
