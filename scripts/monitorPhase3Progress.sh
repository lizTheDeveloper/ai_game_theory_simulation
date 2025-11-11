#!/bin/bash
# Monitor Phase 3 Scenario Analysis progress
# Usage: ./scripts/monitorPhase3Progress.sh

LOG_FILE=$(ls -t logs/phase3_monte_carlo_*.log 2>/dev/null | head -1)

if [ -z "$LOG_FILE" ]; then
  echo "❌ No Phase 3 log file found"
  exit 1
fi

echo "📊 Phase 3 Scenario Analysis - Progress Monitor"
echo "Log file: $LOG_FILE"
echo ""

# Current scenario
CURRENT_SCENARIO=$(grep -E "MONTE CARLO:" "$LOG_FILE" | tail -1)
echo "🎯 Current: $CURRENT_SCENARIO"

# Current seed
CURRENT_SEED=$(grep -E "\[.*/.*\] Running seed" "$LOG_FILE" | tail -1)
echo "🎲 Progress: $CURRENT_SEED"

# Completed scenarios
COMPLETED=$(grep -c "💾 Saved to:" "$LOG_FILE")
echo "✅ Completed scenarios: $COMPLETED / 12"

# Completion rate
TOTAL_RUNS=120  # 12 scenarios × 10 seeds
COMPLETED_RUNS=$(grep -c "✅ Complete:" "$LOG_FILE")
echo "📈 Completed runs: $COMPLETED_RUNS / $TOTAL_RUNS"

# Estimated time remaining
if [ "$COMPLETED_RUNS" -gt 0 ]; then
  ELAPSED_SECONDS=$(( $(date +%s) - $(stat -c %Y "$LOG_FILE") ))
  ELAPSED_MINUTES=$(( $ELAPSED_SECONDS / 60 ))
  SECONDS_PER_RUN=$(( $ELAPSED_SECONDS / $COMPLETED_RUNS ))
  REMAINING_RUNS=$(( $TOTAL_RUNS - $COMPLETED_RUNS ))
  REMAINING_SECONDS=$(( $REMAINING_RUNS * $SECONDS_PER_RUN ))
  REMAINING_HOURS=$(( $REMAINING_SECONDS / 3600 ))
  REMAINING_MINUTES=$(( ($REMAINING_SECONDS % 3600) / 60 ))

  echo ""
  echo "⏱️  Elapsed: $ELAPSED_MINUTES minutes"
  echo "⏳ Estimated remaining: ${REMAINING_HOURS}h ${REMAINING_MINUTES}m"
  echo "📊 Average: ${SECONDS_PER_RUN}s per run"
fi

echo ""
echo "📜 Recent output (last 20 lines):"
echo "─────────────────────────────────────────────────────────"
tail -20 "$LOG_FILE"
