#!/bin/bash
# Rebuild Next.js and restart MARCUS service

set -e

echo "🔄 Rebuilding MARCUS platform..."

# Stop the service
echo "🛑 Stopping service..."
sudo systemctl stop marcus-platform || true

# Clean the corrupted build
echo "🧹 Cleaning corrupted build..."
rm -rf .next
rm -rf node_modules/.cache

# Rebuild for production
echo "🔨 Building for production..."
npm run build

# Check if build succeeded
if [ ! -f ".next/BUILD_ID" ]; then
  echo "❌ Build failed - BUILD_ID not found"
  exit 1
fi

echo "✅ Build complete"

# Restart the service
echo "🚀 Starting service..."
sudo systemctl start marcus-platform

# Wait for startup
sleep 3

# Check status
echo ""
echo "📊 Service Status:"
sudo systemctl status marcus-platform --no-pager || true

echo ""
echo "📝 Recent logs:"
sudo journalctl -u marcus-platform -n 30 --no-pager

echo ""
echo "✅ Rebuild and deployment complete!"
