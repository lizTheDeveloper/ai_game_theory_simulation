#!/bin/bash
# Monte Carlo Runner - Properly manages simulation runs with logs and results
#
# Usage: ./scripts/runMonteCarlo.sh [runs] [months] [name]
#
# Examples:
#   ./scripts/runMonteCarlo.sh 10 600 realistic_timeline
#   ./scripts/runMonteCarlo.sh 5 240 quick_test

set -e

# Parse arguments
RUNS=${1:-10}
MONTHS=${2:-600}
NAME=${3:-mc_$(date +%Y%m%d_%H%M%S)}

# Create directories
mkdir -p logs/monte_carlo
mkdir -p results/monte_carlo

# File paths
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="logs/monte_carlo/${NAME}_${TIMESTAMP}.log"
RESULT_FILE="results/monte_carlo/${NAME}_${TIMESTAMP}_results.json"
SUMMARY_FILE="results/monte_carlo/${NAME}_${TIMESTAMP}_summary.txt"

echo "=========================================="
echo "Monte Carlo Simulation"
echo "=========================================="
echo "Runs:      $RUNS"
echo "Months:    $MONTHS ($(echo "scale=1; $MONTHS/12" | bc) years)"
echo "Name:      $NAME"
echo "Log:       $LOG_FILE"
echo "Results:   $RESULT_FILE"
echo "Summary:   $SUMMARY_FILE"
echo "=========================================="
echo ""

# Run the simulation
# Redirect stdout to log file, stderr to both log and terminal
echo "Starting simulation at $(date)..."
npx tsx scripts/monteCarloSimulation.ts \
  --runs=$RUNS \
  --max-months=$MONTHS \
  2>&1 | tee "$LOG_FILE"

# Extract summary statistics
echo ""
echo "Generating summary..."
tail -200 "$LOG_FILE" > "$SUMMARY_FILE"

echo ""
echo "=========================================="
echo "Simulation Complete!"
echo "=========================================="
echo "Duration:  $(tail -1 "$LOG_FILE" | grep -o '[0-9.]*s' | head -1 || echo 'N/A')"
echo "Log:       $LOG_FILE"
echo "Size:      $(ls -lh "$LOG_FILE" | awk '{print $5}')"
echo "=========================================="

