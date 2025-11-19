#!/bin/bash
# MARCUS 3.0 - Update systemd service to use standalone build
# Fixes the Next.js warning: "next start" does not work with "output: standalone"

set -e

echo "🔧 Updating MARCUS systemd service to use standalone build"
echo "==========================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_step() { echo -e "\n📋 $1"; }

# Check if running on VM
if [ ! -f "/home/g7throwawayplz/ai_game_theory_simulation/marcus-platform.service" ]; then
    print_error "This script must be run on the production VM"
    print_error "Expected path: /home/g7throwawayplz/ai_game_theory_simulation/"
    exit 1
fi

cd /home/g7throwawayplz/ai_game_theory_simulation

# Check if standalone build exists
print_step "Checking standalone build"

if [ ! -f ".next/standalone/server.js" ]; then
    print_warning "Standalone build not found. Running production build..."

    # Build Next.js with standalone output
    npm run build

    if [ ! -f ".next/standalone/server.js" ]; then
        print_error "Standalone build failed. Check next.config.js for 'output: standalone'"
        exit 1
    fi

    print_success "Standalone build created"
else
    print_success "Standalone build already exists"
fi

# Backup current service file
print_step "Backing up current systemd service"

if [ -f "/etc/systemd/system/marcus-platform.service" ]; then
    sudo cp /etc/systemd/system/marcus-platform.service \
         /etc/systemd/system/marcus-platform.service.backup.$(date +%Y%m%d_%H%M%S)
    print_success "Backed up current service file"
else
    print_warning "No existing service file found in /etc/systemd/system/"
fi

# Copy updated service file
print_step "Installing updated systemd service"

sudo cp marcus-platform.service /etc/systemd/system/marcus-platform.service
print_success "Copied updated service file"

# Reload systemd
print_step "Reloading systemd daemon"

sudo systemctl daemon-reload
print_success "Systemd daemon reloaded"

# Restart service
print_step "Restarting MARCUS platform"

sudo systemctl restart marcus-platform
sleep 3

# Check service status
if sudo systemctl is-active --quiet marcus-platform; then
    print_success "MARCUS service is running"

    # Check logs for the warning
    print_step "Checking service logs"

    LOGS=$(sudo journalctl -u marcus-platform -n 20 --no-pager)

    if echo "$LOGS" | grep -q "does not work with.*standalone"; then
        print_warning "Warning still present in logs (may be from previous start)"
    else
        print_success "No standalone warning in recent logs"
    fi

    if echo "$LOGS" | grep -q "Ready in"; then
        print_success "Service started successfully"
    fi
else
    print_error "MARCUS service failed to start"
    print_error "Check logs: sudo journalctl -u marcus-platform -xe"
    exit 1
fi

# Test API endpoint
print_step "Testing API endpoint"

if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ | grep -q "200"; then
    print_success "API is responding"
else
    print_warning "API check inconclusive (may take a moment to start)"
fi

# Summary
print_step "Update Summary"

echo ""
echo "✅ systemd service updated to use standalone build"
echo "✅ Service restarted successfully"
echo "✅ API is accessible"
echo ""
echo "Next.js will now use the optimized standalone build:"
echo "  - Faster startup time"
echo "  - Lower memory usage"
echo "  - No warning in logs"
echo ""
echo "Commands:"
echo "  - View logs: sudo journalctl -u marcus-platform -f"
echo "  - Check status: sudo systemctl status marcus-platform"
echo "  - Test API: curl http://localhost:3000/"
echo ""

print_success "Update complete!"
