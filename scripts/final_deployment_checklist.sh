#!/bin/bash

# MARCUS 3.0 - Final Deployment Checklist
# This script verifies all critical deployment steps are complete

set -euo pipefail

echo "🚀 MARCUS 3.0 - Final Deployment Checklist"
echo "==========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Helper function to check status
check_item() {
  local description=$1
  local check_command=$2
  local is_critical=${3:-true}

  echo -n "  Checking: $description... "

  if eval "$check_command" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASSED++))
    return 0
  else
    if [ "$is_critical" = "true" ]; then
      echo -e "${RED}❌ FAIL${NC}"
      ((FAILED++))
    else
      echo -e "${YELLOW}⚠️  WARN${NC}"
      ((WARNINGS++))
    fi
    return 1
  fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  SECURITY CONFIGURATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check JWT secrets are set
check_item "JWT_SECRET configured in .env" "grep -q '^JWT_SECRET=' .env && [ \$(grep '^JWT_SECRET=' .env | cut -d= -f2 | wc -c) -gt 32 ]"

check_item "JWT_REFRESH_SECRET configured in .env" "grep -q '^JWT_REFRESH_SECRET=' .env && [ \$(grep '^JWT_REFRESH_SECRET=' .env | cut -d= -f2 | wc -c) -gt 32 ]"

# Check if default admin password has been changed
check_item "Default admin password changed" "! sudo -u postgres psql -tAc \"SELECT password_hash FROM users WHERE email = 'admin@marcus-platform.local'\" marcus 2>/dev/null | grep -q '\$2b\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMeshwkZK64L3oD0BX/rkJP6Hy'"

# Check Redis password is set
check_item "REDIS_PASSWORD configured in .env" "grep -q '^REDIS_PASSWORD=' .env" false

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  INFRASTRUCTURE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check PostgreSQL is running
check_item "PostgreSQL service running" "sudo systemctl is-active postgresql"

# Check Redis is running
check_item "Redis service running" "sudo systemctl is-active redis-server"

# Check MARCUS service configuration
check_item "MARCUS systemd service exists" "[ -f /etc/systemd/system/marcus-platform.service ]"

check_item "MARCUS service uses standalone build" "grep -q 'standalone/server.js' /etc/systemd/system/marcus-platform.service"

# Check if MARCUS service is enabled
check_item "MARCUS service auto-start enabled" "sudo systemctl is-enabled marcus-platform" false

# Check if MARCUS service is running
check_item "MARCUS service running" "sudo systemctl is-active marcus-platform" false

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  BUILD ARTIFACTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Next.js standalone build exists
check_item "Next.js standalone build exists" "[ -f .next/standalone/server.js ]"

# Check node_modules exists
check_item "Dependencies installed" "[ -d node_modules ]"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  DATABASE SCHEMA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check database tables exist
check_item "users table exists" "sudo -u postgres psql -tAc \"SELECT to_regclass('public.users')\" marcus 2>/dev/null | grep -q users"

check_item "refresh_tokens table exists" "sudo -u postgres psql -tAc \"SELECT to_regclass('public.refresh_tokens')\" marcus 2>/dev/null | grep -q refresh_tokens"

check_item "auth_audit_log table exists" "sudo -u postgres psql -tAc \"SELECT to_regclass('public.auth_audit_log')\" marcus 2>/dev/null | grep -q auth_audit_log"

# Check PostgreSQL functions exist
check_item "reset_failed_attempts() function exists" "sudo -u postgres psql -tAc \"SELECT to_regprocedure('reset_failed_attempts(uuid)')\" marcus 2>/dev/null | grep -q reset_failed_attempts"

check_item "check_and_lock_account() function exists" "sudo -u postgres psql -tAc \"SELECT to_regprocedure('check_and_lock_account(varchar,integer,integer)')\" marcus 2>/dev/null | grep -q check_and_lock_account"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  TESTING"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check test configuration exists
check_item "Test configuration exists" "[ -f src/platform/config/platformConfig.ts ]" false

# Check test runner exists
check_item "Integration test runner exists" "[ -x scripts/run_integration_tests.sh ]" false

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "  ${GREEN}✅ Passed:${NC}   $PASSED"
echo -e "  ${YELLOW}⚠️  Warnings:${NC} $WARNINGS"
echo -e "  ${RED}❌ Failed:${NC}   $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}✅ DEPLOYMENT CHECKLIST PASSED!${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "🎉 MARCUS 3.0 is ready for production!"
  echo ""

  if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Note: $WARNINGS warning(s) detected (non-critical)${NC}"
    echo ""
  fi

  echo "📋 Next steps:"
  echo "  1. Start the MARCUS service: sudo systemctl start marcus-platform"
  echo "  2. Verify startup: sudo journalctl -u marcus-platform -n 20"
  echo "  3. Test API: curl http://localhost:3000/health"
  echo ""
  exit 0
else
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${RED}❌ DEPLOYMENT CHECKLIST FAILED!${NC}"
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "🔧 Please resolve the failed checks above before deploying to production."
  echo ""
  echo "📖 Common fixes:"
  echo ""
  echo "  • JWT secrets not set:"
  echo "    Run: ./scripts/generate_jwt_secrets.sh"
  echo ""
  echo "  • Admin password not changed:"
  echo "    Run: sudo ./scripts/change_admin_password.sh"
  echo ""
  echo "  • Service not configured:"
  echo "    Run: ./scripts/update_systemd_service.sh"
  echo ""
  echo "  • Database schema missing:"
  echo "    Run: sudo -u postgres psql marcus < src/platform/database/auth-schema.sql"
  echo ""
  exit 1
fi
