#!/bin/bash
# Check game scenario validation progress
# Priya - Dec 2025

LOG_FILE="/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/game_mc_validation_20251206.log"

echo "Game Scenario Validation Progress"
echo "=================================="
echo ""

# Check if log exists
if [ ! -f "$LOG_FILE" ]; then
  echo "❌ Log file not found: $LOG_FILE"
  exit 1
fi

# Extract progress markers
echo "Step Progress:"
grep -E "^(STEP|Running|Progress:|✅ Completed)" "$LOG_FILE" 2>/dev/null | tail -20

echo ""
echo "Log Statistics:"
echo "  Total lines: $(wc -l < "$LOG_FILE")"
echo "  Size: $(du -h "$LOG_FILE" | cut -f1)"

# Check if process is still running
PROCESS_COUNT=$(ps aux | grep "validateGameScenarios.ts" | grep -v grep | wc -l)
if [ "$PROCESS_COUNT" -gt 0 ]; then
  echo "  Status: ✅ RUNNING"
else
  echo "  Status: ⚠️ COMPLETED OR FAILED"
fi

echo ""
echo "Recent output (last 10 lines):"
tail -10 "$LOG_FILE"
