#!/bin/bash
# Run Monte Carlo simulation in a detached tmux session

SESSION_NAME="montecarlo-$(date +%Y%m%d-%H%M%S)"

# Create new tmux session and run simulation
tmux new-session -d -s "$SESSION_NAME" "cd $(dirname $0)/.. && npx tsx scripts/monteCarloSimulation.ts; echo '\n\nSimulation complete. Press any key to exit...'; read"

echo "🚀 Started Monte Carlo simulation in tmux session: $SESSION_NAME"
echo ""
echo "Commands:"
echo "  • Attach to session:  tmux attach -t $SESSION_NAME"
echo "  • Check if running:   tmux ls | grep $SESSION_NAME"
echo "  • Kill session:       tmux kill-session -t $SESSION_NAME"
echo ""
echo "Output will be written to: monteCarloOutputs/mc_<timestamp>.log"
echo ""
echo "To monitor progress:"
echo "  tail -f monteCarloOutputs/mc_*.log | grep -E '(Run [0-9]+/|✅|❌|⏩)'"

