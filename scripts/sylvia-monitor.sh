#!/bin/bash
# Sylvia (Research Skeptic) Monitor
# Monitors research channel for validation questions

export AGENT_NAME="Sylvia"
export AGENT_ID="sylvia"
export MATRIX_TOKEN_VAR="MATRIX_TOKEN_SYLVIA"
export POLL_INTERVAL=60

# Watch research channel (Sylvia's primary channel)
export WATCH_CHANNELS="!YdS1AvY5d7d6TfqEJC6klIdE6q3pqD1A1lFVMZ0dJ4I"

# Execute the generic monitor template
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "${SCRIPT_DIR}/agent-monitor-template.sh"
