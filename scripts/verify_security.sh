#!/bin/bash
# MARCUS 3.0 - Security Verification Script (No sudo required)
# Checks current security configuration without making changes

echo "🔍 MARCUS 3.0 Security Verification"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_pass() { echo -e "${GREEN}✅ $1${NC}"; }
print_fail() { echo -e "${RED}❌ $1${NC}"; }
print_warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "ℹ️  $1"; }

echo "📋 Redis Configuration"
echo "----------------------"

# Check if Redis is running
if pgrep -x redis-server > /dev/null; then
    print_pass "Redis server is running"

    # Test connection without password
    if redis-cli ping 2>/dev/null | grep -q "PONG"; then
        print_warn "Redis accepts connections WITHOUT password"
        print_info "Run: ./scripts/harden_security.sh to enable authentication"
    elif redis-cli ping 2>&1 | grep -q "NOAUTH"; then
        print_pass "Redis requires authentication (password configured)"

        # Check if password is in .env
        if grep -q "^REDIS_PASSWORD=" "$HOME/ai_game_theory_simulation/.env" 2>/dev/null; then
            print_pass "REDIS_PASSWORD found in .env"
        else
            print_warn "REDIS_PASSWORD not in .env (service may not connect)"
        fi
    else
        print_fail "Cannot connect to Redis"
    fi
else
    print_fail "Redis server is not running"
    print_info "Start with: sudo systemctl start redis-server"
fi

echo ""
echo "📋 PostgreSQL Configuration"
echo "---------------------------"

# Check PostgreSQL port
PG_PORT=$(sudo -u postgres psql -tAc "SHOW port;" 2>/dev/null || echo "unknown")
if [ "$PG_PORT" != "unknown" ]; then
    print_pass "PostgreSQL is running on port: $PG_PORT"

    # Check SSL status
    SSL_STATUS=$(sudo -u postgres psql -tAc "SHOW ssl;" 2>/dev/null || echo "unknown")
    if [ "$SSL_STATUS" = "on" ]; then
        print_pass "PostgreSQL SSL is enabled"
    elif [ "$SSL_STATUS" = "off" ]; then
        print_warn "PostgreSQL SSL is disabled"
        print_info "Consider enabling for production use"
    else
        print_warn "Could not check SSL status"
    fi
else
    print_fail "Cannot connect to PostgreSQL"
fi

echo ""
echo "📋 MARCUS Service Configuration"
echo "-------------------------------"

# Check if service is running
if systemctl is-active --quiet marcus-platform 2>/dev/null; then
    print_pass "MARCUS service is running"

    # Check if service is enabled
    if systemctl is-enabled --quiet marcus-platform 2>/dev/null; then
        print_pass "MARCUS service is enabled (starts on boot)"
    else
        print_warn "MARCUS service is not enabled for auto-start"
    fi
else
    print_fail "MARCUS service is not running"
    print_info "Start with: sudo systemctl start marcus-platform"
fi

echo ""
echo "📋 Environment Configuration"
echo "----------------------------"

ENV_FILE="$HOME/ai_game_theory_simulation/.env"
if [ -f "$ENV_FILE" ]; then
    print_pass ".env file exists"

    # Check required variables
    REQUIRED_VARS=(
        "DATABASE_HOST"
        "DATABASE_NAME"
        "DATABASE_USER"
        "DATABASE_PASSWORD"
        "REDIS_HOST"
        "JWT_SECRET"
    )

    MISSING=()
    for var in "${REQUIRED_VARS[@]}"; do
        if ! grep -q "^${var}=" "$ENV_FILE"; then
            MISSING+=("$var")
        fi
    done

    if [ ${#MISSING[@]} -eq 0 ]; then
        print_pass "All required environment variables present"
    else
        print_fail "Missing environment variables: ${MISSING[*]}"
    fi

    # Check optional security variables
    if grep -q "^REDIS_PASSWORD=" "$ENV_FILE"; then
        print_pass "Redis password configured in .env"
    else
        print_warn "Redis password not set in .env"
    fi
else
    print_fail ".env file not found"
fi

echo ""
echo "📋 Security Package Status"
echo "--------------------------"

# Check if security packages are installed
cd "$HOME/ai_game_theory_simulation" 2>/dev/null || exit 1

if [ -f "package.json" ]; then
    if grep -q '"helmet"' package.json; then
        print_pass "helmet package installed"
    else
        print_warn "helmet package not installed"
    fi

    if grep -q '"express-rate-limit"' package.json; then
        print_pass "express-rate-limit package installed"
    else
        print_warn "express-rate-limit package not installed"
    fi
else
    print_fail "package.json not found"
fi

echo ""
echo "📋 Summary"
echo "----------"

# Overall status
CRITICAL_CHECKS=0
WARNING_CHECKS=0

# Redis running and authenticated
if ! pgrep -x redis-server > /dev/null; then
    ((CRITICAL_CHECKS++))
fi

# PostgreSQL running
if [ "$PG_PORT" = "unknown" ]; then
    ((CRITICAL_CHECKS++))
fi

# MARCUS service running
if ! systemctl is-active --quiet marcus-platform 2>/dev/null; then
    ((CRITICAL_CHECKS++))
fi

# .env exists
if [ ! -f "$ENV_FILE" ]; then
    ((CRITICAL_CHECKS++))
fi

# Redis password not set
if ! grep -q "^REDIS_PASSWORD=" "$ENV_FILE" 2>/dev/null; then
    ((WARNING_CHECKS++))
fi

# PostgreSQL SSL not enabled
if [ "$SSL_STATUS" = "off" ]; then
    ((WARNING_CHECKS++))
fi

echo ""
if [ $CRITICAL_CHECKS -eq 0 ] && [ $WARNING_CHECKS -eq 0 ]; then
    print_pass "All security checks passed!"
elif [ $CRITICAL_CHECKS -eq 0 ]; then
    print_warn "$WARNING_CHECKS warning(s) - system operational but security could be improved"
else
    print_fail "$CRITICAL_CHECKS critical issue(s) found"
    if [ $WARNING_CHECKS -gt 0 ]; then
        print_warn "$WARNING_CHECKS warning(s) also present"
    fi
fi

echo ""
echo "Next steps:"
echo "  - Run ./scripts/harden_security.sh to apply security hardening"
echo "  - Check service logs: sudo journalctl -u marcus-platform -f"
echo "  - Test API: curl http://localhost:3000/health"
echo ""
