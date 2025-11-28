#!/bin/bash
# Roy (Simulation Maintainer) Monitor
# Monitors implementation channel for simulation-related questions

export AGENT_NAME="Roy"
export AGENT_ID="roy"
export MATRIX_TOKEN_VAR="MATRIX_TOKEN_ROY"
export POLL_INTERVAL=60

# Watch implementation channel (Roy's primary channel)
export WATCH_CHANNELS="!rnTkKCinvpZLUQlywzVtMdKLH9EuElxLu0EGFJ1LZGA"

# Execute the generic monitor template
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "${SCRIPT_DIR}/agent-monitor-template.sh"
