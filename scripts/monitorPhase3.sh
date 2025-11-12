#!/bin/bash
# Monitor Phase 3 Monte Carlo progress
# Usage: ./scripts/monitorPhase3.sh

LOG_FILE=$(ls -t logs/scenario_phase3_complete_mc_*.log 2>/dev/null | head -1)

if [ -z "$LOG_FILE" ]; then
  echo "❌ No Phase 3 log file found"
  exit 1
fi

echo "📊 PHASE 3 MONTE CARLO PROGRESS"
echo "================================"
echo "Log file: $LOG_FILE"
echo "File size: $(du -h "$LOG_FILE" | cut -f1)"
echo ""

# Count completed runs
COMPLETED_RUNS=$(grep -c "✅ Run .* complete:" "$LOG_FILE" 2>/dev/null || echo "0")
TOTAL_RUNS=130  # 13 scenarios × 10 runs
PROGRESS_PCT=$(echo "scale=1; $COMPLETED_RUNS * 100 / $TOTAL_RUNS" | bc)

echo "Progress: $COMPLETED_RUNS / $TOTAL_RUNS runs ($PROGRESS_PCT%)"
echo ""

# Count scenario completions
echo "Completed scenarios:"
grep "📊 MONTE CARLO STATISTICS:" "$LOG_FILE" | sed 's/.*: /  /' || echo "  (none yet)"
echo ""

# Check for errors
ERROR_COUNT=$(grep -c "❌" "$LOG_FILE" 2>/dev/null || echo "0")
if [ "$ERROR_COUNT" -gt 0 ]; then
  echo "⚠️  Errors detected: $ERROR_COUNT"
  echo ""
fi

# Check for completion
if grep -q "✅ PHASE 3 COMPLETE MONTE CARLO VALIDATION DONE" "$LOG_FILE" 2>/dev/null; then
  echo "✅ MONTE CARLO COMPLETE!"
  echo ""

  # Show results file
  RESULTS_FILE="${LOG_FILE%.log}_results.json"
  if [ -f "$RESULTS_FILE" ]; then
    echo "Results saved to: $RESULTS_FILE"
    echo "Size: $(du -h "$RESULTS_FILE" | cut -f1)"
  fi
else
  echo "⏳ Still running..."
  echo ""
  echo "Latest output:"
  echo "-------------"
  tail -20 "$LOG_FILE"
fi

echo ""
echo "To monitor live: tail -f $LOG_FILE"
echo "To kill: pkill -f scenarioPhase3Complete"
