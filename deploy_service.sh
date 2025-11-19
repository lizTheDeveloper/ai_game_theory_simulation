#!/bin/bash
# Deploy MARCUS systemd service to VM

set -e

echo "📦 Deploying MARCUS systemd service..."

# Check if running as root
if [ "$EUID" -eq 0 ]; then
  echo "❌ Don't run this as root. Run as g7throwawayplz and it will sudo when needed."
  exit 1
fi

# Stop dev server if running
echo "🛑 Stopping any running dev servers..."
pkill -f "next dev" || true

# Copy service file to systemd
echo "📋 Installing service file..."
sudo cp marcus-platform.service /etc/systemd/system/

# Reload systemd
echo "🔄 Reloading systemd daemon..."
sudo systemctl daemon-reload

# Enable service to start on boot
echo "✅ Enabling service to start on boot..."
sudo systemctl enable marcus-platform

# Start the service
echo "🚀 Starting MARCUS platform service..."
sudo systemctl start marcus-platform

# Wait a moment for startup
sleep 2

# Check status
echo ""
echo "📊 Service Status:"
sudo systemctl status marcus-platform --no-pager || true

echo ""
echo "📝 Recent logs:"
sudo journalctl -u marcus-platform -n 20 --no-pager

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Useful commands:"
echo "  sudo systemctl status marcus-platform    # Check status"
echo "  sudo systemctl restart marcus-platform   # Restart service"
echo "  sudo systemctl stop marcus-platform      # Stop service"
echo "  sudo journalctl -u marcus-platform -f    # Follow logs"
echo "  curl http://localhost:3000/health        # Health check"
