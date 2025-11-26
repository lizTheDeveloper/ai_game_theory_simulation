#!/bin/bash
# Get current Claude Code usage statistics

set -e

SESSION_NAME="claude_usage_$$"

# Start tmux session
tmux new-session -d -s "$SESSION_NAME" "claude --model sonnet --dangerously-skip-permissions" 2>/dev/null || true
sleep 3

# Send /usage command - with delay before Enter
tmux send-keys -t "$SESSION_NAME" "/usage"
sleep 2  # Wait for autocomplete to appear
tmux send-keys -t "$SESSION_NAME" Enter
sleep 10  # Wait for usage screen to render

# Capture output
USAGE_OUTPUT=$(tmux capture-pane -t "$SESSION_NAME" -p)

# Cleanup
tmux send-keys -t "$SESSION_NAME" Escape
sleep 1  
tmux send-keys -t "$SESSION_NAME" C-c
tmux kill-session -t "$SESSION_NAME" 2>/dev/null || true

# Extract percentages
PERCENTAGES=($(echo "$USAGE_OUTPUT" | grep -oE "[0-9]+%" | tr -d '%'))

SESSION_PCT=${PERCENTAGES[0]:-0}
WEEK_PCT=${PERCENTAGES[1]:-0}
OPUS_PCT=${PERCENTAGES[2]:-0}

# Output for sourcing
echo "SESSION_USAGE_PCT=$SESSION_PCT"
echo "WEEK_USAGE_PCT=$WEEK_PCT"  
echo "OPUS_USAGE_PCT=$OPUS_PCT"

# Human-readable comment
echo "# Session: ${SESSION_PCT}%, Week: ${WEEK_PCT}%, Opus: ${OPUS_PCT}%" >&2
