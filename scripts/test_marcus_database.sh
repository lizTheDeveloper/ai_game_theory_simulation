#!/bin/bash
# MARCUS 3.0 Database Validation Script
# Deep validation of PostgreSQL database schema, migrations, and integrity
# Usage: ./test_marcus_database.sh

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
# 1. Test-specific environment file (for CI/local dev with safe test credentials)
# 2. User's .env.test file (test-specific secrets)
# 3. User's .env file (production credentials)
# 4. User's .env.secrets file (production secrets vault)
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

# ============================================================================
# Secure Database Connection Setup (OWASP Compliant)
# ============================================================================
PGPASS_FILE="$HOME/.pgpass_test_$$"

setup_secure_db_connection() {
    if [ -n "$DATABASE_PASSWORD" ]; then
        echo "${DATABASE_HOST:-localhost}:${DATABASE_PORT:-5432}:${DATABASE_NAME}:${DATABASE_USER}:${DATABASE_PASSWORD}" > "$PGPASS_FILE"
        chmod 600 "$PGPASS_FILE"
        export PGPASSFILE="$PGPASS_FILE"
    fi
}

cleanup_secure_db_connection() {
    if [ -f "$PGPASS_FILE" ]; then
        rm -f "$PGPASS_FILE"
    fi
}

setup_secure_db_connection
trap cleanup_secure_db_connection EXIT

# Secure psql wrapper
secure_psql() {
    psql -h "${DATABASE_HOST:-localhost}" -U "${DATABASE_USER}" -d "${DATABASE_NAME}" "$@"
}

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
echo "🔍 MARCUS 3.0 Database Validation"
echo "======================================================================"
echo ""

# ============================================================================
# Test 1: Database Connection
# ============================================================================
info "Testing database connection..."

if secure_psql -c "SELECT 1;" > /dev/null 2>&1; then
    pass "Database connection successful"
    info "Database: ${DATABASE_NAME}"
    info "Host: ${DATABASE_HOST:-localhost}"
    info "Port: ${DATABASE_PORT:-5432}"
else
    fail "Database connection failed" "Cannot connect to ${DATABASE_NAME}"
    exit 1
fi

echo ""

# ============================================================================
# Test 2: Migrations Applied
# ============================================================================
info "Checking database migrations..."

# Expected tables from migrations
EXPECTED_TABLES=("users" "refresh_tokens" "auth_audit_log" "citation_analyses" "agent_swarm_state")

for table in "${EXPECTED_TABLES[@]}"; do
    if secure_psql -c "SELECT to_regclass('public.$table');" | grep -q "$table"; then
        pass "Table exists: $table"
    else
        fail "Missing table: $table" "Migration may not have been applied"
    fi
done

echo ""

# ============================================================================
# Test 3: Foreign Key Constraints
# ============================================================================
info "Validating foreign key constraints..."

# Query all foreign keys
FK_COUNT=$(secure_psql -t -c "
    SELECT COUNT(*)
    FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
    AND table_schema = 'public';
" | tr -d ' ')

if [ "$FK_COUNT" -ge 5 ]; then
    pass "Foreign keys present: $FK_COUNT constraints"
else
    fail "Insufficient foreign keys: $FK_COUNT" "Expected at least 5 foreign key constraints"
fi

# Check specific foreign keys
FK_CHECKS=(
    "refresh_tokens|user_id|users"
    "auth_audit_log|user_id|users"
    "citation_analyses|user_id|users"
)

for fk in "${FK_CHECKS[@]}"; do
    IFS='|' read -r table column ref_table <<< "$fk"

    FK_EXISTS=$(secure_psql -t -c "
        SELECT COUNT(*)
        FROM information_schema.key_column_usage kcu
        JOIN information_schema.table_constraints tc
            ON kcu.constraint_name = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND kcu.table_name = '$table'
        AND kcu.column_name = '$column';
    " | tr -d ' ')

    if [ "$FK_EXISTS" -ge 1 ]; then
        pass "Foreign key: $table.$column → $ref_table"
    else
        fail "Missing foreign key: $table.$column → $ref_table" "Check migration scripts"
    fi
done

echo ""

# ============================================================================
# Test 4: Indices
# ============================================================================
info "Checking database indices..."

# Count all indices (excluding primary keys)
INDEX_COUNT=$(secure_psql -t -c "
    SELECT COUNT(*)
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname NOT LIKE '%pkey';
" | tr -d ' ')

if [ "$INDEX_COUNT" -ge 15 ]; then
    pass "Indices present: $INDEX_COUNT indices"

    # Sample important indices
    IMPORTANT_INDICES=(
        "users|idx_users_email"
        "refresh_tokens|idx_refresh_tokens_expires_at"
        "auth_audit_log|idx_auth_audit_log_created_at"
        "citation_analyses|idx_citation_analyses_user_id"
    )

    for idx in "${IMPORTANT_INDICES[@]}"; do
        IFS='|' read -r table index_name <<< "$idx"

        if secure_psql -c "\d $table" | grep -q "$index_name"; then
            pass "Index exists: $index_name on $table"
        else
            warn "Missing recommended index: $index_name on $table"
        fi
    done
else
    fail "Insufficient indices: $INDEX_COUNT" "Expected at least 15 indices for performance"
fi

echo ""

# ============================================================================
# Test 5: Connection Pooling Configuration
# ============================================================================
info "Testing connection pool settings..."

MAX_CONNECTIONS=$(secure_psql -t -c "SHOW max_connections;" | tr -d ' ')
SHARED_BUFFERS=$(secure_psql -t -c "SHOW shared_buffers;" | tr -d ' ')

info "PostgreSQL max_connections: $MAX_CONNECTIONS"
info "PostgreSQL shared_buffers: $SHARED_BUFFERS"

if [ "$MAX_CONNECTIONS" -ge 100 ]; then
    pass "Connection limit adequate: $MAX_CONNECTIONS"
else
    warn "Low connection limit: $MAX_CONNECTIONS (recommended: 100+)"
fi

echo ""

# ============================================================================
# Test 6: Database Functions
# ============================================================================
info "Checking stored procedures/functions..."

# Expected functions for auth system
EXPECTED_FUNCTIONS=(
    "reset_failed_attempts"
    "check_and_lock_account"
)

for func in "${EXPECTED_FUNCTIONS[@]}"; do
    FUNC_EXISTS=$(secure_psql -t -c "
        SELECT COUNT(*)
        FROM pg_proc
        WHERE proname = '$func';
    " | tr -d ' ')

    if [ "$FUNC_EXISTS" -ge 1 ]; then
        pass "Function exists: $func"
    else
        fail "Missing function: $func" "Required for authentication system"
    fi
done

echo ""

# ============================================================================
# Test 7: Data Integrity Checks
# ============================================================================
info "Running data integrity checks..."

# Check for orphaned records (foreign key violations)
ORPHANED_REFRESH_TOKENS=$(secure_psql -t -c "
    SELECT COUNT(*)
    FROM refresh_tokens rt
    LEFT JOIN users u ON rt.user_id = u.id
    WHERE u.id IS NULL;
" | tr -d ' ')

if [ "$ORPHANED_REFRESH_TOKENS" -eq 0 ]; then
    pass "No orphaned refresh_tokens"
else
    fail "Orphaned refresh_tokens found: $ORPHANED_REFRESH_TOKENS" "Foreign key integrity issue"
fi

ORPHANED_AUDIT_LOGS=$(secure_psql -t -c "
    SELECT COUNT(*)
    FROM auth_audit_log aal
    LEFT JOIN users u ON aal.user_id = u.id
    WHERE aal.user_id IS NOT NULL AND u.id IS NULL;
" | tr -d ' ')

if [ "$ORPHANED_AUDIT_LOGS" -eq 0 ]; then
    pass "No orphaned auth_audit_log records"
else
    warn "Orphaned auth_audit_log records: $ORPHANED_AUDIT_LOGS (user_id may be null for failed logins)"
fi

echo ""

# ============================================================================
# Test 8: Database Size and Performance
# ============================================================================
info "Checking database size and statistics..."

DB_SIZE=$(secure_psql -t -c "
    SELECT pg_size_pretty(pg_database_size('${DATABASE_NAME}'));
" | tr -d ' ')

info "Database size: $DB_SIZE"

# Check table sizes
echo ""
info "Table sizes (top 5):"
secure_psql -c "
    SELECT
        schemaname || '.' || tablename AS table,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    LIMIT 5;
"

pass "Database size check complete"

echo ""

# ============================================================================
# Test 9: SSL Configuration
# ============================================================================
info "Checking SSL configuration..."

SSL_ENABLED=$(secure_psql -t -c "SHOW ssl;" | tr -d ' ')

if [ "$SSL_ENABLED" = "on" ]; then
    pass "PostgreSQL SSL enabled"

    SSL_CIPHER=$(secure_psql -t -c "SHOW ssl_ciphers;" | tr -d ' ')
    info "SSL ciphers: $SSL_CIPHER"
else
    warn "PostgreSQL SSL disabled (recommended for production)"
fi

echo ""

# ============================================================================
# Test 10: Backup Readiness
# ============================================================================
info "Checking backup configuration..."

# Check if pg_dump is available
if command -v pg_dump > /dev/null 2>&1; then
    pass "pg_dump utility available"

    # Test backup (dry run to validate schema)
    if pg_dump -h "${DATABASE_HOST:-localhost}" -U "${DATABASE_USER}" -d "${DATABASE_NAME}" --schema-only > /dev/null 2>&1; then
        pass "Schema backup test successful"
    else
        fail "Schema backup test failed" "pg_dump cannot export schema"
    fi
else
    warn "pg_dump utility not found (required for backups)"
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

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✅ All database validation tests passed!${NC}"
    echo ""
    echo "Database is properly configured and ready for production."
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    echo ""
    echo "Please review the failures above and fix before deploying to production."
    exit 1
fi
