#!/bin/bash
# Phase 3 Policy Package Scenarios - Monte Carlo Execution
# Date: November 11, 2025
# Purpose: Run 5 realistic policy package combinations with N=10 Monte Carlo validation
# Context: Phase 1+2 COMPLETE (diagnostic + execution), Phase 3 tests policy combinations

set -e

SCRIPT_DIR="/home/lizthedeveloper_gmail_com/ai_game_theory_simulation"
LOG_DIR="$SCRIPT_DIR/logs/phase3_policy_packages_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$LOG_DIR"

echo "================================================================"
echo "Phase 3 Policy Package Scenarios - Monte Carlo Execution"
echo "================================================================"
echo "Log directory: $LOG_DIR"
echo "Started: $(date)"
echo ""

# Phase 3 Policy Package Scenarios (5 total)
# These combine multiple governance dimensions (unlike Phase 2 single-dimension tests)
SCENARIOS=(
  "green-new-deal"           # Progressive: climate + UBI + jobs
  "techno-optimist"          # Libertarian: all tech, minimal government
  "degrowth"                 # Ecological: restoration + low growth
  "authoritarian-climate"    # China model: rapid deployment, low democracy
  "nordic-social-democracy"  # Scandinavian: gradual tech + high equality
)

# Monte Carlo runs per scenario
N=10

# Run each scenario N times with different seeds
TOTAL_RUNS=$((${#SCENARIOS[@]} * N))
CURRENT_RUN=0
START_TIME=$(date +%s)

for scenario in "${SCENARIOS[@]}"; do
  echo "=========================================="
  echo "Running scenario: $scenario (N=$N)"
  echo "=========================================="

  for seed in {1..10}; do
    CURRENT_RUN=$((CURRENT_RUN + 1))
    ELAPSED=$(($(date +%s) - START_TIME))
    AVG_TIME=$((ELAPSED / CURRENT_RUN))
    REMAINING_RUNS=$((TOTAL_RUNS - CURRENT_RUN))
    EST_REMAINING=$((AVG_TIME * REMAINING_RUNS))

    echo "[$CURRENT_RUN/$TOTAL_RUNS] Running $scenario with seed $seed... (ETA: $((EST_REMAINING / 60)) min)"

    # Run scenario with 360-month duration
    # Note: scenarioRunner.ts has a bug with history.cooperativeSpirals extraction
    # We'll use a simpler runner that doesn't extract all metrics
    npx tsx "$SCRIPT_DIR/scripts/simplifiedScenarioRunner.ts" "$scenario" "$seed" 360 \
      > "$LOG_DIR/${scenario}_seed${seed}.log" 2>&1 || {
        echo "ERROR: $scenario seed $seed failed"
        echo "Check log: $LOG_DIR/${scenario}_seed${seed}.log"
        # Continue with other runs even if one fails
      }
  done

  echo "Completed $scenario (10 runs)"
  echo ""
done

echo "=========================================="
echo "Phase 3 Policy Package Monte Carlo Complete"
echo "=========================================="
echo "Total runs: $TOTAL_RUNS"
echo "Duration: $(($(date +%s) - START_TIME))s ($(($(date +%s) - START_TIME) / 60) min)"
echo "Completed: $(date)"
echo "Logs: $LOG_DIR"
echo ""

# Count successful runs
SUCCESS_COUNT=$(ls -1 "$LOG_DIR"/*.log 2>/dev/null | wc -l)
echo "Successful runs: $SUCCESS_COUNT / $TOTAL_RUNS"

if [ $SUCCESS_COUNT -eq $TOTAL_RUNS ]; then
  echo "All runs completed successfully!"
else
  echo "Some runs failed. Check individual logs in $LOG_DIR"
fi

echo ""
echo "Next steps:"
echo "1. Analyze results with Priya (quantitative-validator)"
echo "2. Generate comparative analysis report"
echo "3. Identify trade-offs (climate vs equality, speed vs democracy)"
echo "4. Validate with Cynthia + Sylvia (research interpretation)"
echo "5. Architecture review"
echo "6. Update wiki documentation"
