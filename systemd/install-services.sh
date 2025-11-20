#!/bin/bash
# Install Autonomous Worker Systemd Services
# Run this script to set up the autonomous worker system

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 Installing Autonomous Worker Systemd Services"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "❌ This script must be run as root (use sudo)"
  exit 1
fi

echo "✅ Running as root"
echo "📁 Project root: $PROJECT_ROOT"
echo ""

# Copy service files
echo "📋 Installing service files..."
cp "$SCRIPT_DIR"/*.service /etc/systemd/system/
cp "$SCRIPT_DIR"/*.timer /etc/systemd/system/
echo "✅ Service files copied to /etc/systemd/system/"
echo ""

# Reload systemd
echo "🔄 Reloading systemd daemon..."
systemctl daemon-reload
echo "✅ Systemd reloaded"
echo ""

# Enable timers
echo "⚙️  Enabling timers..."
systemctl enable autonomous-worker.timer
systemctl enable researcher-worker.timer
systemctl enable worker-watcher.timer
systemctl enable merge-orchestrator.timer
echo "✅ Timers enabled (will start on boot)"
echo ""

# Start timers
echo "🚀 Starting timers..."
systemctl start autonomous-worker.timer
systemctl start researcher-worker.timer
systemctl start worker-watcher.timer
systemctl start merge-orchestrator.timer
echo "✅ Timers started"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Installation Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Show status
echo "📊 Timer Status:"
systemctl list-timers autonomous-worker.timer researcher-worker.timer worker-watcher.timer merge-orchestrator.timer --no-pager
echo ""

echo "⏰ Schedule:"
echo "  :00  - Autonomous Worker      (implementation work)"
echo "  :15  - Worker Watcher         (health check & auto-fix)"
echo "  :30  - Researcher Worker      (research updates)"
echo "  :45  - Merge Orchestrator     (process branches)"
echo ""

echo "📝 Management Commands:"
echo "  Status:  systemctl status autonomous-worker.timer"
echo "  Stop:    systemctl stop autonomous-worker.timer"
echo "  Start:   systemctl start autonomous-worker.timer"
echo "  Logs:    journalctl -u autonomous-worker.service -f"
echo ""

echo "⚠️  Make sure Claude Code CLI is installed and authenticated!"
echo "   Test with: claude --version"
echo ""
