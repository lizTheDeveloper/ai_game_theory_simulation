#!/bin/bash
# MARCUS 3.0 - PostgreSQL Port Migration Script
# Migrates PostgreSQL from port 5433 (non-standard) to port 5432 (standard)

set -euo pipefail

echo "🔄 MARCUS 3.0 - PostgreSQL Port Migration"
echo "=========================================="
echo ""
echo "This script will migrate PostgreSQL from port 5433 to port 5432 (standard)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}❌ Error: This script must be run with sudo${NC}"
  echo "Usage: sudo ./scripts/migrate_postgres_port.sh"
  exit 1
fi

# Step 1: Check current PostgreSQL port
echo "📋 Step 1: Checking current PostgreSQL port..."
CURRENT_PORT=$(sudo -u postgres psql -tAc "SHOW port;" 2>/dev/null || echo "ERROR")

if [ "$CURRENT_PORT" = "ERROR" ]; then
  echo -e "${RED}❌ Error: Cannot connect to PostgreSQL${NC}"
  echo "Make sure PostgreSQL is running:"
  echo "  sudo systemctl status postgresql"
  exit 1
fi

echo -e "${GREEN}✅ Current PostgreSQL port: $CURRENT_PORT${NC}"
echo ""

# If already on 5432, no migration needed
if [ "$CURRENT_PORT" = "5432" ]; then
  echo -e "${GREEN}✅ PostgreSQL is already on standard port 5432${NC}"
  echo "No migration needed!"
  exit 0
fi

# Step 2: Stop MARCUS platform if running
echo "📋 Step 2: Stopping MARCUS platform..."
if systemctl is-active --quiet marcus-platform; then
  systemctl stop marcus-platform
  echo -e "${GREEN}✅ MARCUS platform stopped${NC}"
else
  echo -e "${YELLOW}⚠️  MARCUS platform is not running (systemd service)${NC}"
fi

# Also kill any running processes
pkill -f "tsx src/platform/startup.ts" 2>/dev/null || true
pkill -f "citation_integrity_agent.py" 2>/dev/null || true
echo ""

# Step 3: Change PostgreSQL port to 5432
echo "📋 Step 3: Changing PostgreSQL port from $CURRENT_PORT to 5432..."
sudo -u postgres psql -c "ALTER SYSTEM SET port = 5432;"
echo -e "${GREEN}✅ Port configuration changed${NC}"
echo ""

# Step 4: Restart PostgreSQL
echo "📋 Step 4: Restarting PostgreSQL..."
systemctl restart postgresql

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 3

# Verify PostgreSQL is running on 5432
for i in {1..10}; do
  if pg_isready -h localhost -p 5432 -U postgres > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL is ready on port 5432${NC}"
    break
  fi
  if [ $i -eq 10 ]; then
    echo -e "${RED}❌ Error: PostgreSQL failed to start on port 5432${NC}"
    echo "Check status: sudo systemctl status postgresql"
    exit 1
  fi
  sleep 1
done

# Verify port change
NEW_PORT=$(sudo -u postgres psql -tAc "SHOW port;" 2>/dev/null)
if [ "$NEW_PORT" != "5432" ]; then
  echo -e "${RED}❌ Error: Port change failed. Still on port $NEW_PORT${NC}"
  exit 1
fi
echo ""

# Step 5: Update .env file
echo "📋 Step 5: Updating .env file..."
ENV_FILE="/home/g7throwawayplz/ai_game_theory_simulation/.env"

if [ -f "$ENV_FILE" ]; then
  # Backup .env
  cp "$ENV_FILE" "${ENV_FILE}.bak_port_migration"
  echo "📦 Backup created: ${ENV_FILE}.bak_port_migration"

  # Update DATABASE_PORT
  if grep -q "^DATABASE_PORT=" "$ENV_FILE"; then
    sed -i 's/^DATABASE_PORT=.*/DATABASE_PORT=5432/' "$ENV_FILE"
    echo -e "${GREEN}✅ DATABASE_PORT updated to 5432${NC}"
  else
    echo "DATABASE_PORT=5432" >> "$ENV_FILE"
    echo -e "${GREEN}✅ DATABASE_PORT=5432 added${NC}"
  fi

  # Update DB_PORT (alternative naming)
  if grep -q "^DB_PORT=" "$ENV_FILE"; then
    sed -i 's/^DB_PORT=.*/DB_PORT=5432/' "$ENV_FILE"
    echo -e "${GREEN}✅ DB_PORT updated to 5432${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Warning: .env file not found at $ENV_FILE${NC}"
  echo "You may need to create it manually with DATABASE_PORT=5432"
fi
echo ""

# Step 6: Update firewall if needed
echo "📋 Step 6: Updating firewall rules..."
if command -v ufw > /dev/null 2>&1; then
  if ufw status | grep -q "5433.*ALLOW" 2>/dev/null; then
    ufw delete allow 5433/tcp 2>/dev/null || true
    echo -e "${GREEN}✅ Removed firewall rule for port 5433${NC}"
  fi

  if ! ufw status | grep -q "5432.*ALLOW" 2>/dev/null; then
    ufw allow 5432/tcp
    echo -e "${GREEN}✅ Added firewall rule for port 5432${NC}"
  else
    echo -e "${GREEN}✅ Firewall rule for port 5432 already exists${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  UFW not installed, skipping firewall configuration${NC}"
fi
echo ""

# Step 7: Test database connection
echo "📋 Step 7: Testing database connection on port 5432..."
if psql -h localhost -p 5432 -U marcus -d marcus_test -c "SELECT version();" > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Database connection successful${NC}"
else
  echo -e "${YELLOW}⚠️  Warning: Could not test connection (this is normal if password not in .pgpass)${NC}"
fi
echo ""

# Step 8: Restart MARCUS platform
echo "📋 Step 8: Restarting MARCUS platform..."
if systemctl list-unit-files | grep -q "marcus-platform.service"; then
  systemctl start marcus-platform
  sleep 3
  if systemctl is-active --quiet marcus-platform; then
    echo -e "${GREEN}✅ MARCUS platform started${NC}"
  else
    echo -e "${RED}❌ Warning: MARCUS platform failed to start${NC}"
    echo "Check logs: sudo journalctl -u marcus-platform -f"
  fi
else
  echo -e "${YELLOW}⚠️  MARCUS platform systemd service not configured${NC}"
  echo "To start manually:"
  echo "  cd /home/g7throwawayplz/ai_game_theory_simulation"
  echo "  NODE_ENV=development npx tsx src/platform/startup.ts"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ MIGRATION COMPLETE${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Summary:"
echo "  • PostgreSQL port: $CURRENT_PORT → 5432"
echo "  • .env file: DATABASE_PORT=5432"
echo "  • Firewall: Port 5432 allowed"
echo "  • Platform: Restarted"
echo ""
echo "🎯 Next steps:"
echo "  1. Verify agents are connecting:"
echo "     sudo journalctl -u marcus-platform -n 50 | grep 'PostgreSQL'"
echo ""
echo "  2. Run tests:"
echo "     cd /home/g7throwawayplz/ai_game_theory_simulation"
echo "     npm test"
echo ""
echo "  3. Check platform health:"
echo "     curl http://localhost:3000/health"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
