#!/bin/bash

# Parameter Sweep Validation Script
# Tests Monte Carlo fixes across multiple scenario configurations
# Oct 30, 2025 - Post Monte Carlo bug fixes validation

set -e

RUNS=$1
PHASE=$2
LOG_DIR="logs/parameter_sweep_$(date +%Y%m%d_%H%M%S)"

if [ -z "$RUNS" ]; then
  echo "Usage: $0 <runs> <phase>"
  echo "  runs: Number of simulations per config (10 for Phase 1, 100 for Phase 2)"
  echo "  phase: 'phase1' or 'phase2'"
  exit 1
fi

mkdir -p "$LOG_DIR"

echo "🎲 PARAMETER SWEEP VALIDATION - $PHASE"
echo "============================================"
echo "Runs per config: $RUNS"
echo "Log directory: $LOG_DIR"
echo ""

# Define configurations to test
# Format: "scenario_mode:threshold_scenario:description"
CONFIGS=(
  "historical:baseline:Historical baseline (research-backed)"
  "unprecedented:baseline:Unprecedented baseline (tail risks)"
  "dual:baseline:Dual baseline (50/50 split)"
  "dual:doom:Dual doom (pessimistic thresholds)"
  "dual:cautious:Dual cautious (conservative estimates)"
  "dual:progressive:Dual progressive (optimistic tech)"
  "historical:doom:Historical doom (worst case historical)"
  "unprecedented:progressive:Unprecedented progressive (best case tail risks)"
)

TOTAL_CONFIGS=${#CONFIGS[@]}
CURRENT=0

for config in "${CONFIGS[@]}"; do
  CURRENT=$((CURRENT + 1))
  IFS=':' read -r scenario threshold desc <<< "$config"

  echo ""
  echo "[$CURRENT/$TOTAL_CONFIGS] Running: $desc"
  echo "  Scenario: $scenario | Threshold: $threshold | Runs: $RUNS"

  # Generate seed range based on config index
  SEED_START=$((90000 + (CURRENT - 1) * 1000))
  SEED_END=$((SEED_START + RUNS - 1))

  LOG_FILE="$LOG_DIR/config_${CURRENT}_${scenario}_${threshold}.log"

  npx tsx scripts/monteCarloSimulation.ts \
    --scenario="$scenario" \
    --threshold-scenario="$threshold" \
    --seeds="${SEED_START}-${SEED_END}" \
    --logLevel=minimal \
    > "$LOG_FILE" 2>&1

  # Check for errors
  if grep -q "ERROR\|EXCEPTION\|NaN" "$LOG_FILE"; then
    echo "  ❌ FAILED - Errors detected, see $LOG_FILE"
    exit 1
  else
    echo "  ✅ COMPLETE - $RUNS runs successful"
  fi
done

echo ""
echo "🎉 PARAMETER SWEEP COMPLETE"
echo "All $TOTAL_CONFIGS configurations tested successfully"
echo "Total simulations: $((TOTAL_CONFIGS * RUNS))"
echo ""
echo "Logs saved to: $LOG_DIR"
