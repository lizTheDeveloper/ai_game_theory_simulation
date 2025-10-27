#!/bin/bash
# Bug hunt helper script - runs simulation with separated stderr
# Usage: ./scripts/run-bug-hunt.sh [runs] [max-months]

set -euo pipefail

RUNS=${1:-1}
MAX_MONTHS=${2:-180}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

STDOUT_LOG="logs/bug_hunt_${RUNS}runs_${MAX_MONTHS}mo_stdout_${TIMESTAMP}.log"
STDERR_LOG="logs/bug_hunt_${RUNS}runs_${MAX_MONTHS}mo_stderr_${TIMESTAMP}.log"

echo "🔍 Starting bug hunt: ${RUNS} runs × ${MAX_MONTHS} months"
echo "📊 stdout: ${STDOUT_LOG}"
echo "❌ stderr: ${STDERR_LOG}"

npx tsx scripts/monteCarloSimulation.ts \
  --runs="${RUNS}" \
  --max-months="${MAX_MONTHS}" \
  > "${STDOUT_LOG}" \
  2> "${STDERR_LOG}" &

PID=$!
echo "🚀 Running in background (PID: ${PID})"
echo ""
echo "Check for errors:"
echo "  ls -lh ${STDERR_LOG}  # If size > 0, errors exist"
echo "  cat ${STDERR_LOG}     # View errors"
echo ""
echo "Monitor progress:"
echo "  tail -f ${STDOUT_LOG}"
