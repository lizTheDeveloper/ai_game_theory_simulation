#!/bin/bash
# Monitor Monte Carlo progress

LOG_FILE=$(ls -t logs/mc_ai_alignment_first_fix_*.log | head -1)

while ps aux | grep "scenarioPhase3MonteCarlo" | grep -v grep > /dev/null; do
  sleep 30
  echo "Still running... $(date +%H:%M:%S)"
  grep "Run " "$LOG_FILE" | tail -1
done

echo ""
echo "COMPLETE at $(date +%H:%M:%S)"
echo ""
echo "=== FINAL RESULTS ==="
tail -100 "$LOG_FILE" | grep -A50 "AGGREGATE RESULTS"
