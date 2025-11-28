#!/bin/bash
# Devon (DevOps) Monitor
# Monitors implementation channel for infrastructure questions

export AGENT_NAME="Devon"
export AGENT_ID="devon"
export MATRIX_TOKEN_VAR="MATRIX_TOKEN_DEVON"
export POLL_INTERVAL=60

# Watch implementation channel (Devon's primary channel)
export WATCH_CHANNELS="!rnTkKCinvpZLUQlywzVtMdKLH9EuElxLu0EGFJ1LZGA"

# Execute the generic monitor template
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "${SCRIPT_DIR}/agent-monitor-template.sh"
