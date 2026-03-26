#!/bin/bash
# ──────────────────────────────────────────────
#  OpenBee — Start frontend & backend together
# ──────────────────────────────────────────────

set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

cleanup() {
  echo ""
  echo "🐝 Shutting down OpenBee..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
  echo "✅ All processes stopped."
}
trap cleanup EXIT INT TERM

# ── Start Backend (FastAPI + uvicorn on port 8000) ──
echo "🔧 Starting backend..."
cd "$BACKEND_DIR"
uv run python server.py &
BACKEND_PID=$!

# ── Start Frontend (Vite dev server on port 5173) ──
echo "🎨 Starting frontend..."
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "──────────────────────────────────────"
echo "  🐝 OpenBee is running!"
echo "  Frontend → http://localhost:5173"
echo "  Backend  → http://localhost:8000"
echo "  Press Ctrl+C to stop both."
echo "──────────────────────────────────────"
echo ""

wait
