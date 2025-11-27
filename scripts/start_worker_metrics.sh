#!/bin/bash
# MARCUS 3.0 - Citation Worker Metrics Aggregator Startup Script
#
# Starts the metrics aggregator server that exposes Prometheus metrics
# from all citation workers on port 9300.
#
# Usage:
#   ./scripts/start_worker_metrics.sh
#
# Environment Variables:
#   METRICS_PORT - Port to listen on (default: 9300)
#   METRICS_HOST - Host to bind to (default: 0.0.0.0)
#
# Author: Marcus (Platform Engineer)
# Date: 2025-11-22

set -euo pipefail

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Change to project root
cd "$PROJECT_ROOT"

# Create logs directory
mkdir -p logs

# Set environment variables
export METRICS_PORT="${METRICS_PORT:-9300}"
export METRICS_HOST="${METRICS_HOST:-0.0.0.0}"

# Log file
LOG_FILE="logs/worker_metrics_server.log"
PID_FILE="/tmp/worker_metrics_server.pid"

echo "🚀 Starting Citation Worker Metrics Aggregator"
echo "   Port: $METRICS_PORT"
echo "   Host: $METRICS_HOST"
echo "   Log: $LOG_FILE"

# Check if already running
if [ -f "$PID_FILE" ]; then
  OLD_PID=$(cat "$PID_FILE")
  if ps -p "$OLD_PID" > /dev/null 2>&1; then
    echo "⚠️  Metrics server already running (PID: $OLD_PID)"
    echo "   Stop with: kill $OLD_PID"
    exit 1
  else
    echo "🧹 Removing stale PID file"
    rm -f "$PID_FILE"
  fi
fi

# Start server in background
nohup python3 src/platform/metrics/worker_metrics_server.py > "$LOG_FILE" 2>&1 &
METRICS_PID=$!

# Save PID
echo "$METRICS_PID" > "$PID_FILE"

# Wait and verify
sleep 2
if ps -p "$METRICS_PID" > /dev/null 2>&1; then
  echo "✅ Metrics server started (PID: $METRICS_PID)"
  echo ""
  echo "📊 Endpoints:"
  echo "   Health:  http://localhost:$METRICS_PORT/health"
  echo "   Metrics: http://localhost:$METRICS_PORT/metrics"
  echo ""
  echo "🔍 Verify:"
  echo "   curl http://localhost:$METRICS_PORT/health"
  echo "   tail -f $LOG_FILE"
else
  echo "❌ Failed to start metrics server"
  echo "Check logs: tail $LOG_FILE"
  rm -f "$PID_FILE"
  exit 1
fi
