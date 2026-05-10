#!/usr/bin/env sh
# Start the random video player server.
# Edit VIDEO_DIR below (or keep it in .env.local) and run this script on your NAS.

# ---- Configuration ----
# You can set VIDEO_DIR here as a fallback if .env.local is not present.
# If .env.local exists next to this script, it takes precedence.
# VIDEO_DIR=/volume1/videos

# ---- Runtime ----
PORT="${PORT:-5150}"
HOSTNAME="${HOSTNAME:-0.0.0.0}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Starting Random Video Player on http://${HOSTNAME}:${PORT}"
exec node "$SCRIPT_DIR/server.js"
