#!/bin/bash
# Start Morgan Command Monitor
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$HOME/.claude/logs"
PIDFILE="$HOME/.claude/morgan-command-monitor.pid"

mkdir -p "$LOG_DIR"

if [ -f "$PIDFILE" ]; then
    PID=$(cat "$PIDFILE")
    if kill -0 "$PID" 2>/dev/null; then
        echo "Morgan monitor already running (PID: $PID)"
        exit 0
    fi
    rm -f "$PIDFILE"
fi

source "$HOME/.superalignment-env" 2>/dev/null || true

if [ -z "$MATRIX_TOKEN_MORGAN" ]; then
    echo "ERROR: MATRIX_TOKEN_MORGAN not set in ~/.superalignment-env"
    exit 1
fi

if [ -z "$MATRIX_DM_ROOM_LIZTHEDEVELOPER" ]; then
    echo "ERROR: MATRIX_DM_ROOM_LIZTHEDEVELOPER not set"
    echo "Create DM between @agent-morgan and @lizthedeveloper, get room ID from Settings > Advanced"
    exit 1
fi

LOG_FILE="$LOG_DIR/morgan-command-monitor.log"
echo "Starting Morgan monitor..."
nohup python3 "$SCRIPT_DIR/morgan-command-monitor.py" >> "$LOG_FILE" 2>&1 &
echo $! > "$PIDFILE"
echo "Started (PID: $(cat $PIDFILE)). Logs: tail -f $LOG_FILE"
