#!/bin/bash
# VM Blue-Green Status Check
# Shows current deployment state and service health

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

header() {
    echo -e "\n${BLUE}=== $* ===${NC}"
}

# Determine current LIVE service
get_current_service() {
    if [ -L /etc/nginx/conf.d/satu-active.conf ]; then
        readlink /etc/nginx/conf.d/satu-active.conf | grep -o 'blue\|green' || echo "unknown"
    else
        echo "unknown"
    fi
}

check_service_health() {
    local service=$1
    local port=$2

    if curl -f -s "http://127.0.0.1:$port/api/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Healthy${NC}"
        return 0
    else
        echo -e "${RED}❌ Unhealthy${NC}"
        return 1
    fi
}

CURRENT=$(get_current_service)
STANDBY=$([ "$CURRENT" = "blue" ] && echo "green" || echo "blue")

header "Blue-Green Deployment Status"

echo "LIVE Service: $CURRENT"
echo "Standby Service: $STANDBY"
echo ""

header "Service Health"

# Blue service
echo -n "Blue (port 3001): "
check_service_health "blue" 3001

# Green service
echo -n "Green (port 3002): "
check_service_health "green" 3002

# Webhook listener
echo -n "Webhook (port 8080): "
if curl -f -s "http://127.0.0.1:8080/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Not running${NC}"
fi

header "Service Status (systemd)"

sudo systemctl status satu-blue --no-pager -l | grep -E "Active:|Main PID:" || true
sudo systemctl status satu-green --no-pager -l | grep -E "Active:|Main PID:" || true
sudo systemctl status satu-webhook --no-pager -l | grep -E "Active:|Main PID:" || true

header "Nginx Status"

sudo systemctl status nginx --no-pager -l | grep -E "Active:|Main PID:" || true

header "Recent Deployments"

if [ -f /var/log/satu-deployments.log ]; then
    tail -10 /var/log/satu-deployments.log
else
    echo "No deployment history found"
fi

header "Disk Usage"

df -h /home/user/satu

header "Memory Usage"

free -h

header "Quick Links"

echo "Public URL: http://$(curl -s ifconfig.me || hostname -I | awk '{print $1}')"
echo "Blue Health: http://127.0.0.1:3001/api/health"
echo "Green Health: http://127.0.0.1:3002/api/health"
echo "Webhook Health: http://127.0.0.1:8080/health"
echo ""
echo "Commands:"
echo "  Deploy: sudo /home/user/satu/deployment/deploy-vm-blue-green.sh"
echo "  Rollback: sudo /home/user/satu/deployment/rollback-vm.sh"
echo "  Logs (blue): sudo journalctl -u satu-blue -f"
echo "  Logs (green): sudo journalctl -u satu-green -f"
