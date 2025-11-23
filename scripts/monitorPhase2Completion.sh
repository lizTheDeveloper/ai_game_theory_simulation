#!/bin/bash
# Monitor Phase 2 Monte Carlo completion
# Checks every 5 minutes and reports when done

LOG_FILE="$1"
EXPECTED_RUNS=130

if [ -z "$LOG_FILE" ]; then
  echo "Usage: $0 <logfile>"
  exit 1
fi

echo "Monitoring: $LOG_FILE"
echo "Expected runs: $EXPECTED_RUNS"
echo ""

while true; do
  if [ ! -f "$LOG_FILE" ]; then
    echo "$(date): Log file not found"
    sleep 300
    continue
  fi

  COMPLETED=$(grep -c "Outcome:" "$LOG_FILE")
  SCENARIOS=$(grep -c "🔬.*Monte Carlo" "$LOG_FILE")
  SIZE=$(du -h "$LOG_FILE" | cut -f1)

  echo "$(date): $COMPLETED/$EXPECTED_RUNS runs, $SCENARIOS scenarios started, log size: $SIZE"

  # Check for completion marker
  if grep -q "✅ Phase 2 Scenario Analysis Complete" "$LOG_FILE"; then
    echo ""
    echo "========================================="
    echo "✅ MONTE CARLO SUITE COMPLETE"
    echo "========================================="
    echo "Total runs: $COMPLETED"
    echo "Log file: $LOG_FILE"
    echo "Ready for statistical analysis"
    exit 0
  fi

  # Check if process still running
  if ! pgrep -f "runPhase2Scenarios.ts" > /dev/null; then
    echo ""
    echo "⚠️  WARNING: Process not running but suite not complete"
    echo "Completed runs: $COMPLETED/$EXPECTED_RUNS"
    exit 1
  fi

  sleep 300  # Check every 5 minutes
done
