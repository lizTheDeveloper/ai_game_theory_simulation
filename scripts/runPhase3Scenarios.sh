#!/bin/bash
# Phase 3 Scenario Analysis - Monte Carlo Execution
# Date: November 11, 2025
# Purpose: Run all 13 scenarios with N=10 Monte Carlo validation

set -e

SCRIPT_DIR="/home/lizthedeveloper_gmail_com/ai_game_theory_simulation"
LOG_DIR="$SCRIPT_DIR/logs/phase3_scenarios_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$LOG_DIR"

echo "🧪 Phase 3 Scenario Analysis - Monte Carlo Execution"
echo "Log directory: $LOG_DIR"
echo "Started: $(date)"
echo ""

# Scenarios to run (13 total)
SCENARIOS=(
  "no-tech"
  "god-mode"
  "climate-first"
  "equality-first"
  "ai-alignment-first"
  "democratic-participation"
  "scientific-acceleration"
  "authoritarian-efficiency"
  "high-trust-start"
  "low-inequality-start"
  "strong-institutions-start"
  "renewable-first"
  "carbon-removal-first"
  "foundations-first"
  "adaptive-deployment"
)

# Monte Carlo runs per scenario
N=10

# Run each scenario N times with different seeds
TOTAL_RUNS=$((${#SCENARIOS[@]} * N))
CURRENT_RUN=0

for scenario in "${SCENARIOS[@]}"; do
  echo "=========================================="
  echo "Running scenario: $scenario (N=$N)"
  echo "=========================================="
  
  for seed in {1..10}; do
    CURRENT_RUN=$((CURRENT_RUN + 1))
    echo "[$CURRENT_RUN/$TOTAL_RUNS] Running $scenario with seed $seed..."
    
    # Run scenario and save output
    npx tsx "$SCRIPT_DIR/scripts/scenarioRunner.ts" "$scenario" "$seed" 360 \
      > "$LOG_DIR/${scenario}_seed${seed}.log" 2>&1 || {
        echo "❌ ERROR: $scenario seed $seed failed"
        echo "Check log: $LOG_DIR/${scenario}_seed${seed}.log"
      }
  done
  
  echo "✅ Completed $scenario (10 runs)"
  echo ""
done

echo "=========================================="
echo "Phase 3 Monte Carlo Execution Complete"
echo "Total runs: $TOTAL_RUNS"
echo "Completed: $(date)"
echo "Logs: $LOG_DIR"
echo "=========================================="

# Generate summary statistics
echo ""
echo "Generating summary statistics..."
npx tsx "$SCRIPT_DIR/scripts/analyzePhase3Results.ts" "$LOG_DIR" > "$LOG_DIR/summary.md" 2>&1 || {
  echo "⚠️  Summary generation failed (this is expected if analyzePhase3Results.ts doesn't exist yet)"
}

echo "✅ Phase 3 execution complete!"
