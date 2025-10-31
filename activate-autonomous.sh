#!/bin/bash
# Quick Activation Script for Autonomous Worker

set -e

echo "=== Claude Code Autonomous Worker Activation ==="
echo ""

# Check for API key
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo "⚠️  ANTHROPIC_API_KEY not found!"
    echo ""
    echo "Please set your API key first:"
    echo "  export ANTHROPIC_API_KEY=\"sk-ant-YOUR-KEY-HERE\""
    echo ""
    echo "Or add to ~/.bashrc for persistence:"
    echo "  echo 'export ANTHROPIC_API_KEY=\"sk-ant-YOUR-KEY-HERE\"' >> ~/.bashrc"
    echo "  source ~/.bashrc"
    echo ""
    exit 1
fi

echo "✅ API key found"
echo ""

# Install Claude Code if not present
if ! command -v claude &> /dev/null; then
    echo "📦 Installing Claude Code CLI..."
    sudo npm install -g @anthropic-ai/claude-code
    echo "✅ Claude Code installed"
else
    echo "✅ Claude Code already installed"
fi
echo ""

# Install systemd service and timer
echo "📝 Installing systemd service..."
sudo cp /tmp/claude-worker.service /etc/systemd/system/
sudo cp /tmp/claude-worker.timer /etc/systemd/system/

# Add API key to systemd service if not in environment
if ! grep -q ANTHROPIC_API_KEY /etc/systemd/system/claude-worker.service; then
    sudo mkdir -p /etc/systemd/system/claude-worker.service.d
    sudo bash -c "cat > /etc/systemd/system/claude-worker.service.d/override.conf << EOF
[Service]
Environment=\"ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY\"
EOF"
    echo "✅ API key configured in systemd service"
fi

# Reload systemd
echo "🔄 Reloading systemd..."
sudo systemctl daemon-reload

# Enable and start timer
echo "🚀 Enabling autonomous worker..."
sudo systemctl enable claude-worker.timer
sudo systemctl start claude-worker.timer

echo ""
echo "✅ Autonomous Worker Activated!"
echo ""
echo "Status:"
sudo systemctl status claude-worker.timer --no-pager
echo ""
echo "Next run:"
sudo systemctl list-timers claude-worker.timer --no-pager
echo ""
echo "📋 Management Commands:"
echo "  Stop:     sudo systemctl stop claude-worker.timer"
echo "  Start:    sudo systemctl start claude-worker.timer"  
echo "  Status:   sudo systemctl status claude-worker.timer"
echo "  Logs:     sudo journalctl -u claude-worker.service -f"
echo ""
echo "⚠️  Cost Warning: This will consume API credits (~$5-25/day)"
echo "   Monitor usage at: https://console.anthropic.com"
echo ""
