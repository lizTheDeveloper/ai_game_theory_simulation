#!/bin/bash
# Cynthia (Super-Alignment Researcher) Monitor
# Monitors research channel for research requests

export AGENT_NAME="Cynthia"
export AGENT_ID="cynthia"
export MATRIX_TOKEN_VAR="MATRIX_TOKEN_CYNTHIA"
export POLL_INTERVAL=60

# Watch research channel (Cynthia's primary channel)
export WATCH_CHANNELS="!YdS1AvY5d7d6TfqEJC6klIdE6q3pqD1A1lFVMZ0dJ4I"

# Execute the generic monitor template
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "${SCRIPT_DIR}/agent-monitor-template.sh"
