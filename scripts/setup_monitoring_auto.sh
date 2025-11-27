#!/bin/bash
#
# MARCUS 3.0 - Automated Monitoring Setup (Non-Interactive)
# Run this on the VM to install and configure monitoring
#
# Usage:
#   sudo ./scripts/setup_monitoring_auto.sh

set -euo pipefail

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ Error: This script must be run with sudo${NC}"
  exit 1
fi

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                            ║${NC}"
echo -e "${CYAN}║      MARCUS 3.0 - Automated Monitoring Setup (VM)         ║${NC}"
echo -e "${CYAN}║                                                            ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================================================
# Step 1: Detect VM Configuration
# ============================================================================

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Step 1: Detecting VM Configuration${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Detect external IP
echo -n "Detecting external IP... "
EXTERNAL_IP=$(curl -s --max-time 5 ifconfig.me 2>/dev/null || echo "")
if [ -z "$EXTERNAL_IP" ]; then
    EXTERNAL_IP=$(hostname -I | awk '{print $1}')
fi
echo -e "${GREEN}$EXTERNAL_IP${NC}"

# Detect internal IP
echo -n "Detecting internal IP... "
INTERNAL_IP=$(hostname -I | awk '{print $1}')
echo -e "${GREEN}$INTERNAL_IP${NC}"

# Detect hostname
echo -n "Detecting hostname... "
HOSTNAME=$(hostname)
echo -e "${GREEN}$HOSTNAME${NC}"

# Detect SSH port
echo -n "Detecting SSH port... "
SSH_PORT=$(ss -tlnp 2>/dev/null | grep sshd | grep -oP ':\K[0-9]+' | head -1 || echo "22")
echo -e "${GREEN}$SSH_PORT${NC}"

# Detect current user
SUDO_USER_NAME=${SUDO_USER:-$(whoami)}
echo -n "Detected user... "
echo -e "${GREEN}$SUDO_USER_NAME${NC}"

echo ""
echo -e "${BLUE}VM Configuration:${NC}"
echo "  External IP:  $EXTERNAL_IP"
echo "  Internal IP:  $INTERNAL_IP"
echo "  Hostname:     $HOSTNAME"
echo "  SSH Port:     $SSH_PORT"
echo "  SSH User:     $SUDO_USER_NAME"
echo ""

# ============================================================================
# Step 2: Install Monitoring Stack
# ============================================================================

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Step 2: Installing Monitoring Stack${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if setup script exists
if [ ! -f "./scripts/setup-monitoring.sh" ]; then
    echo -e "${RED}❌ Error: setup-monitoring.sh not found${NC}"
    exit 1
fi

echo -e "${BLUE}Running automated monitoring setup...${NC}"
echo ""

# Run setup script (redirect to show output but not wait for input)
if bash ./scripts/setup-monitoring.sh 2>&1; then
    echo ""
    echo -e "${GREEN}✅ Monitoring stack installed${NC}"
else
    echo ""
    echo -e "${YELLOW}⚠️  Setup script encountered issues, continuing...${NC}"
fi

# ============================================================================
# Step 3: Generate .env.monitoring Configuration
# ============================================================================

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Step 3: Generating Configuration${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Create .env.monitoring file
ENV_FILE=".env.monitoring"
cat > "$ENV_FILE" <<EOF
# MARCUS 3.0 - Monitoring Configuration
# Generated: $(date)
# DO NOT COMMIT THIS FILE - Contains VM-specific information

# VM Connection Details
MONITORING_VM_EXTERNAL_IP=$EXTERNAL_IP
MONITORING_VM_INTERNAL_IP=$INTERNAL_IP
MONITORING_VM_HOSTNAME=$HOSTNAME
MONITORING_SSH_PORT=$SSH_PORT
MONITORING_SSH_USER=$SUDO_USER_NAME

# Monitoring Ports
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000
NODE_EXPORTER_PORT=9100
POSTGRES_EXPORTER_PORT=9187
REDIS_EXPORTER_PORT=9121
ALERTMANAGER_PORT=9093

# Grafana Credentials (change after first login)
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=admin

# URLs (accessible via SSH tunnel)
GRAFANA_URL=http://localhost:3000
PROMETHEUS_URL=http://localhost:9090
EOF

# Set ownership to the user who ran sudo
chown "$SUDO_USER_NAME:$SUDO_USER_NAME" "$ENV_FILE"
chmod 600 "$ENV_FILE"

echo -e "${GREEN}✅ Configuration saved to: $ENV_FILE${NC}"
echo ""

# ============================================================================
# Step 4: Verify Installation
# ============================================================================

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Step 4: Verifying Installation${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

sleep 3  # Give services time to start

# Check services
echo "Checking service status..."
SERVICES=(prometheus grafana-server prometheus-node-exporter)

for service in "${SERVICES[@]}"; do
    if systemctl is-active --quiet "$service" 2>/dev/null; then
        echo -e "${GREEN}✅ $service: Running${NC}"
    else
        echo -e "${YELLOW}⚠️  $service: Not running (may not be installed yet)${NC}"
    fi
done

# Check PostgreSQL exporter (may not be running if DB not configured)
if systemctl is-active --quiet prometheus-postgres-exporter 2>/dev/null; then
    echo -e "${GREEN}✅ prometheus-postgres-exporter: Running${NC}"
else
    echo -e "${YELLOW}⚠️  prometheus-postgres-exporter: Not running (configure database connection)${NC}"
fi

# Check Redis exporter (may not be running if Redis not configured)
if systemctl is-active --quiet redis-exporter 2>/dev/null; then
    echo -e "${GREEN}✅ redis-exporter: Running${NC}"
else
    echo -e "${YELLOW}⚠️  redis-exporter: Not running (configure Redis connection)${NC}"
fi

echo ""

# Check ports
echo "Checking port accessibility..."
if curl -s --max-time 3 http://localhost:9090/-/healthy > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Prometheus: http://localhost:9090${NC}"
else
    echo -e "${YELLOW}⚠️  Prometheus: Not accessible yet${NC}"
fi

if curl -s --max-time 3 http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Grafana: http://localhost:3000${NC}"
else
    echo -e "${YELLOW}⚠️  Grafana: Not accessible yet${NC}"
fi

echo ""

# ============================================================================
# Step 5: Generate Instructions
# ============================================================================

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Step 5: Local Access Instructions${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cat <<INSTRUCTIONS

╔════════════════════════════════════════════════════════════╗
║     MARCUS 3.0 - Access Dashboards from Local Machine     ║
╚════════════════════════════════════════════════════════════╝

VM Details:
  External IP: $EXTERNAL_IP
  SSH Port:    $SSH_PORT
  SSH User:    $SUDO_USER_NAME

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Option 1: Automated (Recommended)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

On your LOCAL machine:

1. Copy the script:
   scp -P $SSH_PORT $SUDO_USER_NAME@$EXTERNAL_IP:~/ai_game_theory_simulation/scripts/local_view_dashboards.sh ~/

2. Run it:
   bash ~/local_view_dashboards.sh

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Option 2: Manual SSH Tunnel
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ssh -p $SSH_PORT -L 3000:localhost:3000 -L 9090:localhost:9090 $SUDO_USER_NAME@$EXTERNAL_IP

Then open in browser:
  Grafana:    http://localhost:3000 (admin/admin)
  Prometheus: http://localhost:9090

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
First-Time Grafana Setup:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Login: admin / admin
2. Configuration → Data Sources → Add Prometheus
3. URL: http://localhost:9090
4. Save & Test
5. Dashboards → Browse → View 5 MARCUS dashboards

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSTRUCTIONS

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║              🎉 Setup Complete! 🎉                         ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Configuration saved to: .env.monitoring${NC}"
echo -e "${BLUE}Use the local script on your machine to access dashboards${NC}"
echo ""
