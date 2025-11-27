#!/bin/bash
#
# MARCUS 3.0 - Local Dashboard Viewer
# Run this on your LOCAL machine to access VM dashboards
#
# Usage:
#   bash local_view_dashboards.sh

set -euo pipefail

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

clear

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                            ║${NC}"
echo -e "${CYAN}║       MARCUS 3.0 - Dashboard Viewer (Local Machine)       ║${NC}"
echo -e "${CYAN}║                                                            ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}This script will:${NC}"
echo "  1. Prompt for VM connection details"
echo "  2. Create SSH tunnels to monitoring services"
echo "  3. Open dashboards in your browser"
echo ""

# ============================================================================
# Step 1: Collect VM Connection Details
# ============================================================================

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Step 1: VM Connection Details${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if .env.monitoring exists locally
if [ -f ".env.monitoring" ]; then
    echo -e "${BLUE}ℹ️  Found .env.monitoring file${NC}"
    source .env.monitoring

    echo "Loaded configuration:"
    echo "  VM IP:    ${MONITORING_VM_EXTERNAL_IP:-Not set}"
    echo "  SSH Port: ${MONITORING_SSH_PORT:-22}"
    echo "  SSH User: ${MONITORING_SSH_USER:-Not set}"
    echo ""

    read -p "Use this configuration? (y/n): " USE_CONFIG
    if [[ "$USE_CONFIG" =~ ^[Yy]$ ]]; then
        VM_IP=${MONITORING_VM_EXTERNAL_IP}
        SSH_PORT=${MONITORING_SSH_PORT:-22}
        SSH_USER=${MONITORING_SSH_USER}
    fi
fi

# Prompt for details if not loaded
if [ -z "${VM_IP:-}" ]; then
    echo -e "${YELLOW}Enter VM connection details:${NC}"
    echo ""
    read -p "VM IP address or hostname: " VM_IP
    read -p "SSH port [22]: " SSH_PORT
    SSH_PORT=${SSH_PORT:-22}
    read -p "SSH username: " SSH_USER
fi

echo ""
echo -e "${GREEN}✅ Will connect to: $SSH_USER@$VM_IP:$SSH_PORT${NC}"
echo ""

# ============================================================================
# Step 2: Test SSH Connection
# ============================================================================

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Step 2: Testing SSH Connection${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${BLUE}Testing connection to VM...${NC}"
if ssh -p "$SSH_PORT" -o ConnectTimeout=5 -o BatchMode=yes "$SSH_USER@$VM_IP" "exit" 2>/dev/null; then
    echo -e "${GREEN}✅ SSH connection successful${NC}"
else
    echo -e "${YELLOW}⚠️  SSH connection test failed (may require password)${NC}"
    echo -e "${BLUE}ℹ️  Will proceed - you may be prompted for password${NC}"
fi

echo ""

# ============================================================================
# Step 3: Check for Existing Tunnels
# ============================================================================

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Step 3: Checking Existing Tunnels${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if ports are already in use
PORTS_IN_USE=()
for port in 3000 9090; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        PORTS_IN_USE+=($port)
    fi
done

if [ ${#PORTS_IN_USE[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  The following ports are already in use: ${PORTS_IN_USE[*]}${NC}"
    echo ""
    echo "This might mean:"
    echo "  1. SSH tunnels are already running"
    echo "  2. Another service is using these ports"
    echo ""
    read -p "Kill existing processes and create new tunnels? (y/n): " KILL_EXISTING

    if [[ "$KILL_EXISTING" =~ ^[Yy]$ ]]; then
        for port in "${PORTS_IN_USE[@]}"; do
            echo "Killing processes on port $port..."
            lsof -ti:$port | xargs kill -9 2>/dev/null || true
        done
        echo -e "${GREEN}✅ Ports cleared${NC}"
    else
        echo -e "${BLUE}ℹ️  Will attempt to create tunnels anyway${NC}"
    fi
fi

echo ""

# ============================================================================
# Step 4: Create SSH Tunnels
# ============================================================================

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Step 4: Creating SSH Tunnels${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Create tunnel script
TUNNEL_SCRIPT=$(mktemp)
cat > "$TUNNEL_SCRIPT" <<EOF
#!/bin/bash
# SSH Tunnel for MARCUS Monitoring
# Created: $(date)
# VM: $SSH_USER@$VM_IP:$SSH_PORT

echo "Creating SSH tunnels..."
echo "  Grafana:    localhost:3000 -> VM:3000"
echo "  Prometheus: localhost:9090 -> VM:9090"
echo ""
echo "Press Ctrl+C to close tunnels"
echo ""

ssh -p $SSH_PORT \\
    -L 3000:localhost:3000 \\
    -L 9090:localhost:9090 \\
    -o ServerAliveInterval=60 \\
    -o ServerAliveCountMax=3 \\
    -N \\
    $SSH_USER@$VM_IP
EOF

chmod +x "$TUNNEL_SCRIPT"

echo -e "${BLUE}Starting SSH tunnels in background...${NC}"
echo ""

# Start tunnel in background
nohup bash "$TUNNEL_SCRIPT" > /tmp/marcus_tunnel.log 2>&1 &
TUNNEL_PID=$!

# Wait for tunnels to establish
echo -n "Waiting for tunnels to establish"
for i in {1..10}; do
    sleep 1
    echo -n "."

    # Check if both ports are listening
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 && \
       lsof -Pi :9090 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo ""
        echo -e "${GREEN}✅ Tunnels established successfully${NC}"
        TUNNELS_READY=true
        break
    fi
done
echo ""

if [ "${TUNNELS_READY:-false}" != "true" ]; then
    echo -e "${RED}❌ Tunnels failed to establish${NC}"
    echo -e "${YELLOW}Check /tmp/marcus_tunnel.log for details${NC}"
    exit 1
fi

# Save tunnel PID for cleanup
echo "$TUNNEL_PID" > /tmp/marcus_tunnel.pid

echo -e "${BLUE}Tunnel PID: $TUNNEL_PID${NC}"
echo ""

# ============================================================================
# Step 5: Open Dashboards
# ============================================================================

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Step 5: Opening Dashboards${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Detect OS and browser
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    BROWSER_CMD="open"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    if command -v xdg-open >/dev/null; then
        BROWSER_CMD="xdg-open"
    elif command -v gnome-open >/dev/null; then
        BROWSER_CMD="gnome-open"
    fi
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    # Windows
    BROWSER_CMD="start"
fi

if [ -n "${BROWSER_CMD:-}" ]; then
    echo -e "${BLUE}Opening Grafana in browser...${NC}"
    sleep 2  # Give Grafana time to respond
    $BROWSER_CMD "http://localhost:3000" 2>/dev/null || true
    echo -e "${GREEN}✅ Browser opened${NC}"
else
    echo -e "${YELLOW}⚠️  Could not detect browser${NC}"
    echo -e "${BLUE}Manually open: http://localhost:3000${NC}"
fi

echo ""

# ============================================================================
# Summary
# ============================================================================

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║           🎉 Dashboard Access Ready! 🎉                    ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${CYAN}Access URLs:${NC}"
echo "  Grafana:    ${BLUE}http://localhost:3000${NC}"
echo "  Prometheus: ${BLUE}http://localhost:9090${NC}"
echo ""
echo -e "${CYAN}Grafana Login:${NC}"
echo "  Username: ${BLUE}admin${NC}"
echo "  Password: ${BLUE}admin${NC}"
echo "  ${YELLOW}(Change password on first login)${NC}"
echo ""
echo -e "${CYAN}First-Time Setup:${NC}"
echo "  1. Login to Grafana"
echo "  2. Configuration → Data Sources → Add Prometheus"
echo "  3. URL: ${BLUE}http://localhost:9090${NC}"
echo "  4. Click 'Save & Test'"
echo "  5. Dashboards → Browse → See all 5 MARCUS dashboards"
echo ""
echo -e "${CYAN}The 5 Dashboards:${NC}"
echo "  1. Platform Overview    - Request rate, errors, latency"
echo "  2. Agent Health         - Agent status, throughput, errors"
echo "  3. Database Metrics     - Query performance, connections"
echo "  4. Redis Metrics        - Cache performance, memory"
echo "  5. Circuit Breakers     - Service health, failures"
echo ""
echo -e "${CYAN}Tunnel Management:${NC}"
echo "  PID:  $TUNNEL_PID"
echo "  Logs: /tmp/marcus_tunnel.log"
echo ""
echo -e "${YELLOW}To close tunnels:${NC}"
echo "  kill $TUNNEL_PID"
echo ""
echo -e "${YELLOW}Or use the convenience script:${NC}"
echo "  bash scripts/stop_dashboards.sh"
echo ""

# Create stop script
STOP_SCRIPT="scripts/stop_dashboards.sh"
cat > "$STOP_SCRIPT" <<STOP_EOF
#!/bin/bash
# Stop MARCUS Dashboard Tunnels

if [ -f /tmp/marcus_tunnel.pid ]; then
    PID=\$(cat /tmp/marcus_tunnel.pid)
    if ps -p \$PID > /dev/null 2>&1; then
        echo "Stopping tunnel (PID: \$PID)..."
        kill \$PID
        rm /tmp/marcus_tunnel.pid
        echo "✅ Tunnels stopped"
    else
        echo "⚠️  Tunnel process not running"
        rm /tmp/marcus_tunnel.pid
    fi
else
    echo "⚠️  No tunnel PID file found"
fi
STOP_EOF

chmod +x "$STOP_SCRIPT"

echo -e "${GREEN}Keep this terminal open to maintain tunnels!${NC}"
echo ""
