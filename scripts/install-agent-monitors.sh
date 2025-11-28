#!/bin/bash
# Install Agent Monitor Services
# Copies systemd service files to /etc/systemd/system and enables them

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SYSTEMD_DIR="$PROJECT_DIR/systemd"

echo "🤖 Installing Agent Monitor Services"
echo ""

# Check if running with sufficient privileges
if [ "$EUID" -ne 0 ]; then
    echo "❌ This script must be run with sudo"
    echo "Usage: sudo ./install-agent-monitors.sh"
    exit 1
fi

# Create log directory
echo "📁 Creating log directory..."
mkdir -p "$PROJECT_DIR/logs/agent-monitors"
chown lizthedeveloper_gmail_com:lizthedeveloper_gmail_com "$PROJECT_DIR/logs/agent-monitors"

# List of agents to install
AGENTS=("roy" "sylvia" "cynthia" "orchestrator" "devon")

# Install each service
for AGENT in "${AGENTS[@]}"; do
    SERVICE_FILE="${AGENT}-monitor.service"

    echo ""
    echo "📦 Installing ${AGENT}-monitor service..."

    # Copy service file to systemd directory
    if [ -f "$SYSTEMD_DIR/$SERVICE_FILE" ]; then
        cp "$SYSTEMD_DIR/$SERVICE_FILE" /etc/systemd/system/
        echo "  ✅ Copied $SERVICE_FILE to /etc/systemd/system/"
    else
        echo "  ⚠️  Warning: $SERVICE_FILE not found in $SYSTEMD_DIR"
        continue
    fi

    # Reload systemd daemon
    systemctl daemon-reload

    # Enable service (start on boot)
    systemctl enable "$SERVICE_FILE"
    echo "  ✅ Enabled $SERVICE_FILE"

    # Check if service is already running
    if systemctl is-active --quiet "$SERVICE_FILE"; then
        echo "  ℹ️  Service already running, restarting..."
        systemctl restart "$SERVICE_FILE"
    else
        echo "  ▶️  Starting $SERVICE_FILE..."
        systemctl start "$SERVICE_FILE"
    fi

    # Check status
    if systemctl is-active --quiet "$SERVICE_FILE"; then
        echo "  ✅ ${AGENT}-monitor is running"
    else
        echo "  ❌ ${AGENT}-monitor failed to start"
        systemctl status "$SERVICE_FILE" --no-pager -l
    fi
done

echo ""
echo "📊 Service Status Summary:"
echo ""
for AGENT in "${AGENTS[@]}"; do
    SERVICE_FILE="${AGENT}-monitor.service"
    if systemctl is-active --quiet "$SERVICE_FILE"; then
        echo "  ✅ ${AGENT}-monitor: RUNNING"
    else
        echo "  ❌ ${AGENT}-monitor: STOPPED"
    fi
done

echo ""
echo "🎉 Agent monitor installation complete!"
echo ""
echo "📝 Useful commands:"
echo "  Check status:     sudo systemctl status <agent>-monitor.service"
echo "  View logs:        sudo journalctl -u <agent>-monitor.service -f"
echo "  Stop service:     sudo systemctl stop <agent>-monitor.service"
echo "  Start service:    sudo systemctl start <agent>-monitor.service"
echo "  Restart service:  sudo systemctl restart <agent>-monitor.service"
echo ""
echo "📂 Monitor logs also saved to: $PROJECT_DIR/logs/agent-monitors/"
