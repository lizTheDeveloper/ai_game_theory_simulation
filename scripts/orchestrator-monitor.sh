#!/bin/bash
# Orchestrator Monitor
# Monitors coordination channel for complex task requests

export AGENT_NAME="Orchestrator"
export AGENT_ID="orchestrator"
export MATRIX_TOKEN_VAR="MATRIX_TOKEN_ORCHESTRATOR"
export POLL_INTERVAL=60

# Watch coordination channel (Orchestrator's primary channel)
export WATCH_CHANNELS="!G-uy0v5GZd9IUqFufg4KIt0ks6d7bNdwquD29SVC4-I"

# Execute the generic monitor template
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec "${SCRIPT_DIR}/agent-monitor-template.sh"
