#!/bin/bash
# Start channel monitor in background

echo "🚀 Starting channel monitor..."

# Kill existing monitor if running
if [ -f .monitor.pid ]; then
  OLD_PID=$(cat .monitor.pid)
  if ps -p $OLD_PID > /dev/null 2>&1; then
    echo "⚠️  Stopping existing monitor (PID $OLD_PID)..."
    kill $OLD_PID
    sleep 1
  fi
fi

# Start new monitor
npx tsx scripts/simple-channel-monitor.ts > logs/monitor.log 2>&1 &
NEW_PID=$!

# Save PID
echo $NEW_PID > .monitor.pid

echo "✅ Monitor started (PID $NEW_PID)"
echo "📋 Logs: tail -f logs/monitor.log"
echo "🛑 Stop: bash scripts/stop-monitor.sh"
