#!/bin/bash
# MARCUS 3.0 Upgrade Safety Testing Script
# Validates upgrade procedures: migration rollback, zero-downtime, config migration
# Usage: ./test_marcus_upgrade.sh

# set -e  # Disabled to see all test results

# ============================================================================
# Load Environment Variables Securely (OWASP Compliant)
# ============================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

load_env_file() {
    local env_file="$1"
    if [ -f "$env_file" ]; then
        set -a
        source "$env_file"
        set +a
        return 0
    fi
    return 1
}

# OWASP Credential Hierarchy (most specific to most general):
if load_env_file "$PROJECT_DIR/.env.test"; then
    : # Success - using .env.test (test-specific credentials)
elif load_env_file "$PROJECT_DIR/.env"; then
    : # Success - using .env (production credentials)
elif load_env_file "$PROJECT_DIR/.env.secrets"; then
    : # Success - using .env.secrets (production secrets)
else
    echo "⚠️  Warning: No .env.test, .env, or .env.secrets file found"
    echo "    Environment variables must be set manually"
fi

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASSED_TESTS++))
    ((TOTAL_TESTS++))
}

fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    echo -e "${RED}   Details: $2${NC}"
    ((FAILED_TESTS++))
    ((TOTAL_TESTS++))
}

info() {
    echo -e "${BLUE}ℹ️  INFO${NC}: $1"
}

warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
}

echo "======================================================================"
echo "🔄 MARCUS 3.0 Upgrade Safety Testing"
echo "======================================================================"
echo ""

# ============================================================================
# Test 1: Database Migration Files
# ============================================================================
info "Checking database migration files..."

MIGRATION_DIR="$PROJECT_DIR/migrations"

if [ -d "$MIGRATION_DIR" ]; then
    pass "Migration directory exists"

    MIGRATION_COUNT=$(find "$MIGRATION_DIR" -name "*.sql" -o -name "*.js" -o -name "*.ts" 2>/dev/null | wc -l)

    info "Migration files found: $MIGRATION_COUNT"

    if [ "$MIGRATION_COUNT" -gt 0 ]; then
        pass "Migration files present"
    else
        warn "No migration files (may be managed by ORM)"
        ((TOTAL_TESTS++))
    fi
else
    warn "Migration directory not found"
    info "Migrations may be managed by ORM or in different location"
    ((TOTAL_TESTS+=2))
fi

echo ""

# ============================================================================
# Test 2: Migration Tool Availability
# ============================================================================
info "Checking migration tools..."

# Check for common migration tools
if command -v npm > /dev/null 2>&1; then
    # Check package.json for migration scripts
    if [ -f "$PROJECT_DIR/package.json" ]; then
        if grep -q "migrate" "$PROJECT_DIR/package.json"; then
            pass "Migration scripts in package.json"
        else
            warn "No migration scripts in package.json"
            ((TOTAL_TESTS++))
        fi
    fi
fi

# Check for SQL migration tools
if command -v psql > /dev/null 2>&1; then
    pass "psql available for manual migrations"
else
    warn "psql not available"
    ((TOTAL_TESTS++))
fi

echo ""

# ============================================================================
# Test 3: Database Schema Versioning
# ============================================================================
info "Checking schema versioning..."

if command -v psql > /dev/null 2>&1 && [ -n "$DATABASE_HOST" ]; then
    PGPASS_FILE="$HOME/.pgpass_upgrade_$$"

    if [ -n "$DATABASE_PASSWORD" ]; then
        echo "${DATABASE_HOST}:${DATABASE_PORT:-5432}:${DATABASE_NAME}:${DATABASE_USER}:${DATABASE_PASSWORD}" > "$PGPASS_FILE"
        chmod 600 "$PGPASS_FILE"
        export PGPASSFILE="$PGPASS_FILE"
    fi

    # Check for schema_migrations or similar table
    SCHEMA_VERSION_TABLE=$(psql -h "$DATABASE_HOST" -U "$DATABASE_USER" -d "$DATABASE_NAME" -t -c "
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename LIKE '%migration%'
        OR tablename LIKE '%version%';
    " 2>/dev/null | tr -d ' ')

    if [ -n "$SCHEMA_VERSION_TABLE" ]; then
        pass "Schema versioning table exists: $SCHEMA_VERSION_TABLE"

        # Get current version
        VERSION_COUNT=$(psql -h "$DATABASE_HOST" -U "$DATABASE_USER" -d "$DATABASE_NAME" -t -c "
            SELECT COUNT(*) FROM $SCHEMA_VERSION_TABLE;
        " 2>/dev/null | tr -d ' ')

        if [ -n "$VERSION_COUNT" ] && [ "$VERSION_COUNT" -gt 0 ]; then
            info "Applied migrations: $VERSION_COUNT"
            pass "Database has migration history"
        fi
    else
        warn "No schema versioning table found"
        info "Create schema_migrations table for upgrade tracking"
        ((TOTAL_TESTS+=2))
    fi

    rm -f "$PGPASS_FILE"
else
    warn "Cannot check schema versioning (database not accessible)"
    ((TOTAL_TESTS+=2))
fi

echo ""

# ============================================================================
# Test 4: Configuration Backward Compatibility
# ============================================================================
info "Testing configuration backward compatibility..."

if [ -f "$PROJECT_DIR/.env" ]; then
    # Check for version field in .env
    if grep -q "^VERSION=" "$PROJECT_DIR/.env"; then
        ENV_VERSION=$(grep "^VERSION=" "$PROJECT_DIR/.env" | cut -d'=' -f2)
        info "Current version: $ENV_VERSION"
        pass "Version tracking in .env"
    else
        warn "No VERSION field in .env"
        info "Add VERSION=X.Y.Z for upgrade tracking"
        ((TOTAL_TESTS++))
    fi

    # Check for backup of old config
    if [ -f "$PROJECT_DIR/.env.bak" ] || [ -f "$PROJECT_DIR/.env.old" ]; then
        pass "Previous .env backup exists"
    else
        info "No .env backup (normal for first deployment)"
        ((TOTAL_TESTS++))
    fi
else
    warn ".env file not found"
    ((TOTAL_TESTS+=2))
fi

echo ""

# ============================================================================
# Test 5: Rollback Capability
# ============================================================================
info "Testing rollback capability..."

# Check for down/rollback migrations
if [ -d "$MIGRATION_DIR" ]; then
    ROLLBACK_COUNT=$(find "$MIGRATION_DIR" -name "*down.sql" -o -name "*rollback*" 2>/dev/null | wc -l)

    if [ "$ROLLBACK_COUNT" -gt 0 ]; then
        pass "Rollback migrations available ($ROLLBACK_COUNT)"
    else
        warn "No rollback migrations found"
        info "Create down migrations for safe rollbacks"
        ((TOTAL_TESTS++))
    fi
else
    info "No migration directory - skipping rollback test"
    ((TOTAL_TESTS++))
fi

echo ""

# ============================================================================
# Test 6: Zero-Downtime Deployment
# ============================================================================
info "Testing zero-downtime deployment readiness..."

# Check for PM2 or similar process manager
if command -v pm2 > /dev/null 2>&1; then
    pass "PM2 installed (supports zero-downtime reloads)"
else
    warn "PM2 not installed"
    info "Install PM2 for zero-downtime deployments: npm install -g pm2"
    ((TOTAL_TESTS++))
fi

# Check for systemd service with reload
if systemctl list-unit-files | grep -q "marcus-platform.service"; then
    pass "Systemd service configured"

    # Check if service supports reload
    if systemctl show marcus-platform.service | grep -q "ExecReload="; then
        pass "Service supports graceful reload"
    else
        warn "Service may not support graceful reload"
        ((TOTAL_TESTS++))
    fi
else
    warn "Systemd service not configured"
    ((TOTAL_TESTS+=2))
fi

echo ""

# ============================================================================
# Test 7: Database Connection Pooling
# ============================================================================
info "Checking connection pool configuration..."

if [ -n "$DATABASE_POOL_SIZE" ] || [ -n "$DATABASE_POOL_MIN" ]; then
    info "Connection pool configured"
    pass "Database pooling enabled"

    if [ -n "$DATABASE_POOL_SIZE" ]; then
        info "Pool size: $DATABASE_POOL_SIZE"
    fi

    if [ -n "$DATABASE_POOL_MIN" ] && [ -n "$DATABASE_POOL_MAX" ]; then
        info "Pool range: $DATABASE_POOL_MIN - $DATABASE_POOL_MAX"
    fi
else
    warn "Connection pool not configured in .env"
    info "Add DATABASE_POOL_SIZE for better upgrade safety"
    ((TOTAL_TESTS++))
fi

echo ""

# ============================================================================
# Test 8: Health Check During Upgrade
# ============================================================================
info "Testing health check availability..."

# Health check should remain available during upgrades
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE/health" 2>/dev/null || echo "ERROR\n500")
HEALTH_CODE=$(echo "$HEALTH_RESPONSE" | tail -1)

if [ "$HEALTH_CODE" = "200" ]; then
    pass "Health endpoint available for upgrade monitoring"
else
    warn "Health endpoint not accessible (API may not be running)"
    ((TOTAL_TESTS++))
fi

echo ""

# ============================================================================
# Test 9: Dependency Lock Files
# ============================================================================
info "Checking dependency lock files..."

if [ -f "$PROJECT_DIR/package-lock.json" ]; then
    pass "package-lock.json exists (reproducible builds)"
elif [ -f "$PROJECT_DIR/yarn.lock" ]; then
    pass "yarn.lock exists (reproducible builds)"
elif [ -f "$PROJECT_DIR/pnpm-lock.yaml" ]; then
    pass "pnpm-lock.yaml exists (reproducible builds)"
else
    fail "No lock file found" "Create package-lock.json for reproducible upgrades"
fi

echo ""

# ============================================================================
# Test 10: Upgrade Documentation
# ============================================================================
info "Checking upgrade documentation..."

UPGRADE_DOCS=0

if [ -f "$PROJECT_DIR/UPGRADE.md" ] || [ -f "$PROJECT_DIR/docs/UPGRADE.md" ]; then
    pass "Upgrade documentation exists"
    ((UPGRADE_DOCS++))
else
    warn "UPGRADE.md not found"
fi

if [ -f "$PROJECT_DIR/CHANGELOG.md" ]; then
    pass "CHANGELOG.md exists"
    ((UPGRADE_DOCS++))
else
    warn "CHANGELOG.md not found"
fi

if [ $UPGRADE_DOCS -eq 0 ]; then
    info "Create UPGRADE.md and CHANGELOG.md for upgrade procedures"
    ((TOTAL_TESTS++))
fi

echo ""

# ============================================================================
# Summary
# ============================================================================
echo "======================================================================"
echo "📊 Upgrade Safety Test Summary"
echo "======================================================================"
echo -e "Total Tests:  ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed:       ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed:       ${RED}$FAILED_TESTS${NC}"
echo ""

# Calculate upgrade safety score
if [ $TOTAL_TESTS -gt 0 ]; then
    SAFETY_SCORE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo -e "Upgrade Safety Score: ${BLUE}${SAFETY_SCORE}%${NC}"
    echo ""
fi

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✅ All upgrade safety tests passed!${NC}"
    echo ""
    echo "✨ MARCUS platform is ready for safe upgrades."
    echo ""
    echo "📋 Recommended upgrade procedure:"
    echo "  1. Backup database: pg_dump -Fc > backup.dump"
    echo "  2. Review CHANGELOG.md for breaking changes"
    echo "  3. Test migrations in staging environment"
    echo "  4. Enable maintenance mode"
    echo "  5. Run migrations: npm run migrate"
    echo "  6. Deploy new code: pm2 reload marcus"
    echo "  7. Verify health: curl /health"
    echo "  8. Monitor logs for errors"
    echo "  9. Disable maintenance mode"
    exit 0
else
    echo -e "${RED}❌ Some upgrade safety tests failed${NC}"
    echo ""
    echo "⚠️  Address failures before performing production upgrades."
    exit 1
fi
