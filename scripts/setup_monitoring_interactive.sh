#!/bin/bash
#
# MARCUS 3.0 - Interactive Monitoring Setup (VM)
# Run this on the VM to install and configure monitoring
#
# Usage:
#   sudo ./scripts/setup_monitoring_interactive.sh

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

clear

echo -e "${CYAN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                                                            ║${NC}"
echo -e "${CYAN}║         MARCUS 3.0 - Interactive Monitoring Setup         ║${NC}"
echo -e "${CYAN}║                                                            ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}This script will:${NC}"
echo "  1. Install Prometheus + Grafana monitoring stack"
echo "  2. Configure all exporters (Node, PostgreSQL, Redis)"
echo "  3. Set up 5 pre-built dashboards + 16 alerts"
echo "  4. Generate configuration for local access"
echo ""
echo -e "${YELLOW}⏱️  Estimated time: 5-10 minutes${NC}"
echo ""

read -p "Press Enter to continue or Ctrl+C to cancel..."

# ============================================================================
# Step 1: Detect VM Configuration
# ============================================================================

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Step 1: Detecting VM Configuration${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Detect external IP
EXTERNAL_IP=$(curl -s ifconfig.me 2>/dev/null || echo "")
if [ -z "$EXTERNAL_IP" ]; then
    EXTERNAL_IP=$(hostname -I | awk '{print $1}')
fi

# Detect internal IP
INTERNAL_IP=$(hostname -I | awk '{print $1}')

# Detect hostname
HOSTNAME=$(hostname)

# Detect SSH port (default 22)
SSH_PORT=$(ss -tlnp 2>/dev/null | grep sshd | grep -oP ':\K[0-9]+' | head -1 || echo "22")

# Detect current user (who ran sudo)
SUDO_USER_NAME=${SUDO_USER:-$(whoami)}

echo -e "${GREEN}✅ Detected VM Configuration:${NC}"
echo "   External IP:  $EXTERNAL_IP"
echo "   Internal IP:  $INTERNAL_IP"
echo "   Hostname:     $HOSTNAME"
echo "   SSH Port:     $SSH_PORT"
echo "   SSH User:     $SUDO_USER_NAME"
echo ""

read -p "Is this correct? (y/n): " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo ""
    read -p "Enter VM external IP: " EXTERNAL_IP
    read -p "Enter VM internal IP: " INTERNAL_IP
    read -p "Enter SSH port [22]: " SSH_PORT
    SSH_PORT=${SSH_PORT:-22}
    read -p "Enter SSH username: " SUDO_USER_NAME
fi

# ============================================================================
# Step 2: Install Monitoring Stack
# ============================================================================

echo ""
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

# Run setup script
bash ./scripts/setup-monitoring.sh

echo ""
echo -e "${GREEN}✅ Monitoring stack installed${NC}"

# ============================================================================
# Step 3: Generate .env.monitoring Configuration
# ============================================================================

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Step 3: Generating Configuration${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Create .env.monitoring file (owned by the sudo user)
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

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Step 4: Verifying Installation${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

sleep 3  # Give services time to start

# Run verification script if available
if [ -f "./scripts/test_monitoring_access.sh" ]; then
    bash ./scripts/test_monitoring_access.sh
else
    # Quick manual verification
    echo "Checking service status..."
    for service in prometheus grafana-server prometheus-node-exporter; do
        if systemctl is-active --quiet "$service" 2>/dev/null; then
            echo -e "${GREEN}✅ $service: Running${NC}"
        else
            echo -e "${RED}❌ $service: Not running${NC}"
        fi
    done
fi

# ============================================================================
# Step 5: Generate Local Machine Instructions
# ============================================================================

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Step 5: Next Steps - Access from Local Machine${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

INSTRUCTIONS_FILE="MONITORING_ACCESS_INSTRUCTIONS.txt"
cat > "$INSTRUCTIONS_FILE" <<EOF
╔════════════════════════════════════════════════════════════╗
║     MARCUS 3.0 - Monitoring Access Instructions           ║
╚════════════════════════════════════════════════════════════╝

VM Configuration:
  External IP: $EXTERNAL_IP
  SSH Port:    $SSH_PORT
  SSH User:    $SUDO_USER_NAME

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OPTION A: Automated Setup (Recommended)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Copy the local access script to your local machine:

   scp -P $SSH_PORT $SUDO_USER_NAME@$EXTERNAL_IP:~/ai_game_theory_simulation/scripts/local_view_dashboards.sh ~/

2. Run the script on your local machine:

   bash ~/local_view_dashboards.sh

3. The script will:
   - Prompt for VM connection details
   - Create SSH tunnels automatically
   - Open Grafana in your browser

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OPTION B: Manual Setup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. On your LOCAL machine, create SSH tunnel:

   ssh -p $SSH_PORT -L 3000:localhost:3000 -L 9090:localhost:9090 $SUDO_USER_NAME@$EXTERNAL_IP

2. Keep the SSH session open and open in your browser:

   Grafana:    http://localhost:3000
   Prometheus: http://localhost:9090

3. Grafana first-time setup:
   - Login: admin / admin
   - Add Prometheus data source: http://localhost:9090
   - Browse dashboards: Dashboards → Browse

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The 5 Dashboards:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Platform Overview    - Request rate, errors, latency
2. Agent Health         - Agent status, throughput, errors
3. Database Metrics     - Query performance, connections
4. Redis Metrics        - Cache performance, memory usage
5. Circuit Breakers     - Service health, failure detection

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Troubleshooting:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If dashboards show "No data":
  1. Check Prometheus targets: http://localhost:9090/targets
  2. Verify MARCUS platform is running
  3. Check PostgreSQL/Redis connections
  4. Review logs: sudo journalctl -u prometheus -n 50

For more help, see: docs/MARCUS_MONITORING_OVERVIEW.md
EOF

chown "$SUDO_USER_NAME:$SUDO_USER_NAME" "$INSTRUCTIONS_FILE"

echo -e "${BLUE}📄 Instructions saved to: $INSTRUCTIONS_FILE${NC}"
echo ""
cat "$INSTRUCTIONS_FILE"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}║              🎉 Monitoring Setup Complete! 🎉              ║${NC}"
echo -e "${GREEN}║                                                            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Next step: Run the local access script on your local machine${NC}"
echo ""
