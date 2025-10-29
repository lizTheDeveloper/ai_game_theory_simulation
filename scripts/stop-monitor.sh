#!/bin/bash
# Stop channel monitor

if [ ! -f .monitor.pid ]; then
  echo "❌ Monitor not running (no PID file)"
  exit 1
fi

PID=$(cat .monitor.pid)

if ! ps -p $PID > /dev/null 2>&1; then
  echo "❌ Monitor not running (stale PID file)"
  rm .monitor.pid
  exit 1
fi

echo "🛑 Stopping monitor (PID $PID)..."
kill $PID

# Wait for clean shutdown
sleep 1

if ps -p $PID > /dev/null 2>&1; then
  echo "⚠️  Force killing..."
  kill -9 $PID
fi

rm .monitor.pid
echo "✅ Monitor stopped"
