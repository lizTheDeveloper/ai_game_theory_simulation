#!/bin/bash
# MARCUS 3.0 - PostgreSQL Port Migration Test Script
# Validates the migrate_postgres_port.sh script without executing destructive operations
# Usage: ./test_migrate_postgres_port.sh

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

MIGRATION_SCRIPT="$SCRIPT_DIR/migrate_postgres_port.sh"

echo "======================================================================"
echo "🔄 MARCUS 3.0 PostgreSQL Port Migration Test"
echo "======================================================================"
echo ""
info "Migration script: $MIGRATION_SCRIPT"
echo ""

# ============================================================================
# Test 1: Migration Script Exists
# ============================================================================
info "Checking migration script..."

if [ -f "$MIGRATION_SCRIPT" ]; then
    pass "Migration script exists"

    SCRIPT_SIZE=$(stat -f%z "$MIGRATION_SCRIPT" 2>/dev/null || stat -c%s "$MIGRATION_SCRIPT" 2>/dev/null)
    info "Script size: $SCRIPT_SIZE bytes"
else
    fail "Migration script not found" "Expected at: $MIGRATION_SCRIPT"
    exit 1
fi

# Check if executable
if [ -x "$MIGRATION_SCRIPT" ]; then
    pass "Migration script is executable"
else
    warn "Migration script not executable (run: chmod +x $MIGRATION_SCRIPT)"
    ((TOTAL_TESTS++))
fi

echo ""

# ============================================================================
# Test 2: Script Syntax Validation
# ============================================================================
info "Validating script syntax..."

# Check for bash syntax errors
if bash -n "$MIGRATION_SCRIPT" 2>/dev/null; then
    pass "Script syntax is valid"
else
    fail "Script syntax errors detected" "Run: bash -n $MIGRATION_SCRIPT"
fi

# Check for set -e (exit on error)
if grep -q "set -euo pipefail" "$MIGRATION_SCRIPT"; then
    pass "Script uses strict error handling (set -euo pipefail)"
elif grep -q "set -e" "$MIGRATION_SCRIPT"; then
    pass "Script uses error handling (set -e)"
else
    warn "Script may not use strict error handling"
    ((TOTAL_TESTS++))
fi

echo ""

# ============================================================================
# Test 3: Prerequisites Check
# ============================================================================
info "Checking prerequisites..."

# Check PostgreSQL client
if command -v psql > /dev/null 2>&1; then
    pass "PostgreSQL client (psql) available"
else
    warn "PostgreSQL client not found (required for migration)"
    ((TOTAL_TESTS++))
fi

# Check pg_isready
if command -v pg_isready > /dev/null 2>&1; then
    pass "pg_isready utility available"
else
    warn "pg_isready not found (used for readiness checks)"
    ((TOTAL_TESTS++))
fi

# Check systemctl
if command -v systemctl > /dev/null 2>&1; then
    pass "systemctl available (for service management)"
else
    warn "systemctl not found (required for PostgreSQL restart)"
    ((TOTAL_TESTS++))
fi

# Check ufw (optional)
if command -v ufw > /dev/null 2>&1; then
    info "UFW firewall available"
else
    info "UFW not found (firewall configuration will be skipped)"
fi

echo ""

# ============================================================================
# Test 4: Current PostgreSQL Configuration
# ============================================================================
info "Checking current PostgreSQL configuration..."

# Try to detect current PostgreSQL port
CURRENT_PG_PORT=""

# Method 1: Check if PostgreSQL is running and query port
if command -v psql > /dev/null 2>&1; then
    CURRENT_PG_PORT=$(sudo -u postgres psql -tAc "SHOW port;" 2>/dev/null || echo "")

    if [ -n "$CURRENT_PG_PORT" ]; then
        info "PostgreSQL currently running on port: $CURRENT_PG_PORT"

        if [ "$CURRENT_PG_PORT" = "5432" ]; then
            pass "PostgreSQL already on standard port 5432 (no migration needed)"
        elif [ "$CURRENT_PG_PORT" = "5433" ]; then
            info "PostgreSQL on non-standard port 5433 (migration recommended)"
            ((TOTAL_TESTS++))
        else
            info "PostgreSQL on custom port $CURRENT_PG_PORT"
            ((TOTAL_TESTS++))
        fi
    else
        warn "Cannot query PostgreSQL port (may not be running or no permissions)"
        ((TOTAL_TESTS++))
    fi
else
    warn "Cannot check PostgreSQL port (psql not available)"
    ((TOTAL_TESTS++))
fi

# Method 2: Check .env file configuration
if [ -f "$PROJECT_DIR/.env" ]; then
    ENV_DB_PORT=$(grep "^DATABASE_PORT=" "$PROJECT_DIR/.env" | cut -d'=' -f2)

    if [ -n "$ENV_DB_PORT" ]; then
        info ".env DATABASE_PORT: $ENV_DB_PORT"

        if [ "$ENV_DB_PORT" = "5432" ]; then
            pass ".env file configured for standard port 5432"
        else
            info ".env file configured for port $ENV_DB_PORT (may need migration)"
            ((TOTAL_TESTS++))
        fi
    else
        warn "DATABASE_PORT not found in .env file"
        ((TOTAL_TESTS++))
    fi
else
    warn ".env file not found at $PROJECT_DIR/.env"
    ((TOTAL_TESTS++))
fi

echo ""

# ============================================================================
# Test 5: Script Logic Validation
# ============================================================================
info "Validating migration script logic..."

# Check for port detection logic
if grep -q "CURRENT_PORT.*psql.*SHOW port" "$MIGRATION_SCRIPT"; then
    pass "Script includes port detection logic"
else
    fail "Port detection logic not found" "Script may not properly detect current port"
fi

# Check for 5432 check (already migrated)
if grep -q "5432.*already.*standard.*port" "$MIGRATION_SCRIPT"; then
    pass "Script checks if already on standard port"
else
    warn "Script may not check if migration is needed"
    ((TOTAL_TESTS++))
fi

# Check for PostgreSQL restart
if grep -q "systemctl restart postgresql" "$MIGRATION_SCRIPT"; then
    pass "Script includes PostgreSQL restart"
else
    fail "PostgreSQL restart not found" "Migration may not take effect"
fi

# Check for .env backup
if grep -q "\.env.*bak" "$MIGRATION_SCRIPT"; then
    pass "Script creates .env backup before modification"
else
    warn "Script may not backup .env file before changes"
    ((TOTAL_TESTS++))
fi

# Check for firewall configuration
if grep -q "ufw" "$MIGRATION_SCRIPT"; then
    pass "Script includes firewall configuration (UFW)"
else
    info "Script may not configure firewall (acceptable if UFW not used)"
fi

# Check for connection test
if grep -q "psql.*localhost.*5432" "$MIGRATION_SCRIPT"; then
    pass "Script includes connection test on new port"
else
    warn "Script may not test connection after migration"
    ((TOTAL_TESTS++))
fi

echo ""

# ============================================================================
# Test 6: Safety Checks
# ============================================================================
info "Validating safety mechanisms..."

# Check for sudo requirement
if grep -q "EUID.*-ne.*0\|must be run.*sudo" "$MIGRATION_SCRIPT"; then
    pass "Script requires sudo/root (prevents accidental execution)"
else
    fail "Script does not check for sudo/root" "Could fail with permission errors"
fi

# Check for service stop before migration
if grep -q "systemctl stop\|pkill" "$MIGRATION_SCRIPT"; then
    pass "Script stops services before migration"
else
    warn "Script may not stop services before migration"
    ((TOTAL_TESTS++))
fi

# Check for readiness verification
if grep -q "pg_isready" "$MIGRATION_SCRIPT"; then
    pass "Script verifies PostgreSQL readiness after restart"
else
    warn "Script may not verify PostgreSQL is ready after restart"
    ((TOTAL_TESTS++))
fi

# Check for error handling in port change verification
if grep -q "NEW_PORT.*5432" "$MIGRATION_SCRIPT"; then
    pass "Script verifies port change was successful"
else
    warn "Script may not verify migration success"
    ((TOTAL_TESTS++))
fi

echo ""

# ============================================================================
# Test 7: .env File Backup Check
# ============================================================================
info "Checking .env backup capability..."

if [ -f "$PROJECT_DIR/.env" ]; then
    # Check if we can read .env
    if [ -r "$PROJECT_DIR/.env" ]; then
        pass ".env file is readable"
    else
        fail ".env file not readable" "Migration script may fail to backup"
    fi

    # Check if we can create backup (test write permissions in directory)
    ENV_DIR=$(dirname "$PROJECT_DIR/.env")

    if [ -w "$ENV_DIR" ]; then
        pass ".env directory is writable (backup creation will work)"
    else
        fail ".env directory not writable" "Cannot create .env backup"
    fi
else
    warn ".env file not found (migration will warn but may continue)"
    ((TOTAL_TESTS++))
fi

echo ""

# ============================================================================
# Test 8: Existing Backups Check
# ============================================================================
info "Checking for existing migration backups..."

EXISTING_BACKUPS=$(find "$PROJECT_DIR" -maxdepth 1 -name ".env.bak_port_migration*" 2>/dev/null | wc -l)

if [ "$EXISTING_BACKUPS" -gt 0 ]; then
    info "Found $EXISTING_BACKUPS existing migration backup(s)"

    LATEST_BACKUP=$(find "$PROJECT_DIR" -maxdepth 1 -name ".env.bak_port_migration*" -type f -printf '%T@ %p\n' 2>/dev/null | sort -rn | head -1 | cut -d' ' -f2-)

    if [ -n "$LATEST_BACKUP" ]; then
        info "Latest backup: $(basename "$LATEST_BACKUP")"

        # Check if backup is recent (within last 7 days)
        BACKUP_AGE_DAYS=$(find "$LATEST_BACKUP" -mtime +7 2>/dev/null | wc -l)

        if [ "$BACKUP_AGE_DAYS" -eq 0 ]; then
            info "Recent backup exists (< 7 days old)"
            ((TOTAL_TESTS++))
        else
            info "Backup is older than 7 days"
            ((TOTAL_TESTS++))
        fi
    fi
else
    info "No existing migration backups (normal for first run)"
    ((TOTAL_TESTS++))
fi

echo ""

# ============================================================================
# Test 9: Script Documentation
# ============================================================================
info "Checking script documentation..."

# Check for usage instructions
if grep -q "Usage:" "$MIGRATION_SCRIPT"; then
    pass "Script includes usage instructions"
else
    warn "Script may not include usage instructions"
    ((TOTAL_TESTS++))
fi

# Check for step-by-step output
STEP_COUNT=$(grep -c "Step [0-9]" "$MIGRATION_SCRIPT" || echo "0")

if [ "$STEP_COUNT" -ge 5 ]; then
    pass "Script includes step-by-step progress output ($STEP_COUNT steps)"
else
    warn "Script may not provide detailed progress output"
    ((TOTAL_TESTS++))
fi

# Check for summary/completion message
if grep -q "MIGRATION COMPLETE\|Summary:" "$MIGRATION_SCRIPT"; then
    pass "Script includes completion summary"
else
    warn "Script may not provide completion summary"
    ((TOTAL_TESTS++))
fi

echo ""

# ============================================================================
# Test 10: Dry-Run Capability
# ============================================================================
info "Checking for dry-run or test mode..."

# Check if script supports dry-run mode
if grep -q "dry.run\|--dry-run\|DRY_RUN" "$MIGRATION_SCRIPT"; then
    pass "Script may support dry-run mode"
else
    info "Script does not appear to support dry-run mode"
    info "Consider adding --dry-run flag for testing"
    ((TOTAL_TESTS++))
fi

echo ""

# ============================================================================
# Test 11: Rollback Capability
# ============================================================================
info "Checking rollback capability..."

# Since .env backup is created, rollback is possible manually
if grep -q "\.env.*bak" "$MIGRATION_SCRIPT"; then
    info "Manual rollback possible using .env backup"
    info "To rollback: cp .env.bak_port_migration .env && sudo systemctl restart postgresql"
    ((TOTAL_TESTS++))
else
    warn "No clear rollback mechanism (backup restoration may be manual)"
    ((TOTAL_TESTS++))
fi

echo ""

# ============================================================================
# Summary
# ============================================================================
echo "======================================================================"
echo "📊 Test Summary"
echo "======================================================================"
echo -e "Total Tests:  ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed:       ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed:       ${RED}$FAILED_TESTS${NC}"
echo ""

# Calculate readiness score
if [ $TOTAL_TESTS -gt 0 ]; then
    READINESS_SCORE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo -e "Readiness Score: ${BLUE}${READINESS_SCORE}%${NC}"
    echo ""
fi

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✅ Migration script validation passed!${NC}"
    echo ""
    echo "✨ The migration script is ready to use."
    echo ""
    echo "To run the migration:"
    echo "  sudo $MIGRATION_SCRIPT"
    echo ""
    echo "⚠️  IMPORTANT: Run during maintenance window"
    echo "   - Will restart PostgreSQL service"
    echo "   - Will stop MARCUS platform briefly"
    echo "   - Creates .env backup automatically"
    exit 0
else
    echo -e "${RED}❌ Some validation checks failed${NC}"
    echo ""
    echo "Please review failures above before running migration."
    exit 1
fi
