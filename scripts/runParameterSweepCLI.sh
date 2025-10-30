#!/bin/bash
# Parameter Sweep Runner - CLI Monte Carlo
#
# Runs comprehensive parameter sweep across scenario modes and threshold configurations
# 2 scenario modes × 5 threshold scenarios × N=100 = 1,000 simulations
# Estimated runtime: 3-5 hours

set -e

echo "=== Monte Carlo Parameter Sweep (CLI) ==="
echo ""
echo "Configuration:"
echo "  • 2 scenario modes (historical, unprecedented)"
echo "  • 5 threshold scenarios (doom, cautious, baseline, progressive, utopia)"
echo "  • N=100 seeds per configuration"
echo "  • Total: 1,000 simulations (~3-5 hours)"
echo ""

# Create output directory for sweep results
SWEEP_DIR="monteCarloOutputs/sweep_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$SWEEP_DIR"

echo "Results will be saved to: $SWEEP_DIR"
echo ""

# Counter for progress
TOTAL_CONFIGS=10
CURRENT=0

# Arrays for sweep parameters
SCENARIOS=("historical" "unprecedented")
THRESHOLDS=("doom" "cautious" "baseline" "progressive" "utopia")

# Run sweep
for scenario in "${SCENARIOS[@]}"; do
  for threshold in "${THRESHOLDS[@]}"; do
    CURRENT=$((CURRENT + 1))

    echo "[$CURRENT/$TOTAL_CONFIGS] Running: scenario=$scenario, threshold=$threshold"
    echo "  Seeds: 50000-50099 (N=100)"
    echo "  Started: $(date +%H:%M:%S)"

    # Run Monte Carlo simulation
    # Note: Using sequential mode (--sequential) for stability
    npx tsx scripts/monteCarloSimulation.ts \
      --runs=100 \
      --max-months=360 \
      --scenario="$scenario" \
      --threshold-scenario="$threshold" \
      --sequential \
      > "$SWEEP_DIR/${scenario}_${threshold}.log" 2>&1

    echo "  Completed: $(date +%H:%M:%S)"
    echo "  Log: $SWEEP_DIR/${scenario}_${threshold}.log"
    echo ""
  done
done

echo "✅ Parameter sweep complete!"
echo "Results saved to: $SWEEP_DIR"
echo ""
echo "Summary logs:"
ls -lh "$SWEEP_DIR"/*.log
