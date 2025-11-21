#!/bin/bash
# MARCUS 3.0 Backup and Restore Testing Script
# Validates disaster recovery readiness: backup creation, integrity, restore, point-in-time recovery
# Usage: ./test_marcus_backup_restore.sh

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

# Backup configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/marcus}"
TEST_BACKUP_DIR="/tmp/marcus_backup_test_$$"

echo "======================================================================"
echo "💾 MARCUS 3.0 Backup & Restore Testing"
echo "======================================================================"
echo ""
info "Backup directory: $BACKUP_DIR"
info "Test backup directory: $TEST_BACKUP_DIR"
echo ""

# ============================================================================
# Test 1: Backup Tools Availability
# ============================================================================
info "Checking backup tools..."

if command -v pg_dump > /dev/null 2>&1; then
    PG_DUMP_VERSION=$(pg_dump --version | head -1)
    pass "pg_dump available: $PG_DUMP_VERSION"
else
    fail "pg_dump not found" "Install PostgreSQL client tools"
    exit 1
fi

if command -v pg_restore > /dev/null 2>&1; then
    pass "pg_restore available"
else
    fail "pg_restore not found" "Install PostgreSQL client tools"
fi

if command -v tar > /dev/null 2>&1; then
    pass "tar available (for compressed backups)"
else
    warn "tar not found (compression will not be available)"
    ((TOTAL_TESTS++))
fi

if command -v gzip > /dev/null 2>&1; then
    pass "gzip available (for compression)"
else
    warn "gzip not found (backups will be uncompressed)"
    ((TOTAL_TESTS++))
fi

echo ""

# ============================================================================
# Test 2: Backup Directory Setup
# ============================================================================
info "Checking backup directory configuration..."

if [ -d "$BACKUP_DIR" ]; then
    pass "Backup directory exists: $BACKUP_DIR"

    if [ -w "$BACKUP_DIR" ]; then
        pass "Backup directory is writable"
    else
        fail "Backup directory not writable" "Run: sudo chmod 755 $BACKUP_DIR && sudo chown $USER $BACKUP_DIR"
    fi
else
    warn "Backup directory does not exist: $BACKUP_DIR"
    info "Will be created during first backup"
    ((TOTAL_TESTS+=2))
fi

# Create test backup directory
mkdir -p "$TEST_BACKUP_DIR"
if [ -d "$TEST_BACKUP_DIR" ]; then
    pass "Test backup directory created"
else
    fail "Cannot create test backup directory" "$TEST_BACKUP_DIR"
fi

echo ""

# ============================================================================
# Test 3: Database Connection for Backup
# ============================================================================
info "Testing database connection..."

if [ -n "$DATABASE_HOST" ] && [ -n "$DATABASE_NAME" ]; then
    PGPASS_FILE="$HOME/.pgpass_backup_$$"

    if [ -n "$DATABASE_PASSWORD" ]; then
        echo "${DATABASE_HOST}:${DATABASE_PORT:-5432}:${DATABASE_NAME}:${DATABASE_USER}:${DATABASE_PASSWORD}" > "$PGPASS_FILE"
        chmod 600 "$PGPASS_FILE"
        export PGPASSFILE="$PGPASS_FILE"
    fi

    if psql -h "$DATABASE_HOST" -U "$DATABASE_USER" -d "$DATABASE_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
        pass "Database connection successful"
    else
        fail "Cannot connect to database" "Check credentials and network"
        rm -f "$PGPASS_FILE"
        exit 1
    fi
else
    fail "Database credentials not configured" "Set DATABASE_HOST and DATABASE_NAME in .env"
    exit 1
fi

echo ""

# ============================================================================
# Test 4: Schema-Only Backup Test
# ============================================================================
info "Testing schema-only backup..."

SCHEMA_BACKUP="$TEST_BACKUP_DIR/schema_test.sql"

if pg_dump -h "$DATABASE_HOST" -U "$DATABASE_USER" -d "$DATABASE_NAME" \
    --schema-only --no-owner --no-acl -f "$SCHEMA_BACKUP" 2>/dev/null; then
    pass "Schema-only backup created"

    # Check file size
    SCHEMA_SIZE=$(stat -f%z "$SCHEMA_BACKUP" 2>/dev/null || stat -c%s "$SCHEMA_BACKUP" 2>/dev/null)

    if [ "$SCHEMA_SIZE" -gt 1000 ]; then
        pass "Schema backup has content (${SCHEMA_SIZE} bytes)"
    else
        fail "Schema backup too small" "May be incomplete (${SCHEMA_SIZE} bytes)"
    fi

    # Check for expected schema elements
    if grep -q "CREATE TABLE" "$SCHEMA_BACKUP"; then
        pass "Schema contains CREATE TABLE statements"
    else
        fail "Schema backup missing CREATE TABLE" "Backup may be incomplete"
    fi
else
    fail "Schema backup failed" "Check pg_dump permissions"
fi

echo ""

# ============================================================================
# Test 5: Full Database Backup Test
# ============================================================================
info "Testing full database backup..."

FULL_BACKUP="$TEST_BACKUP_DIR/full_backup_test.dump"

START_TIME=$(date +%s)

if pg_dump -h "$DATABASE_HOST" -U "$DATABASE_USER" -d "$DATABASE_NAME" \
    --format=custom --no-owner --no-acl -f "$FULL_BACKUP" 2>/dev/null; then
    END_TIME=$(date +%s)
    BACKUP_TIME=$((END_TIME - START_TIME))

    pass "Full database backup created (${BACKUP_TIME}s)"

    # Check file size
    FULL_SIZE=$(stat -f%z "$FULL_BACKUP" 2>/dev/null || stat -c%s "$FULL_BACKUP" 2>/dev/null)
    FULL_SIZE_MB=$((FULL_SIZE / 1024 / 1024))

    info "Backup size: ${FULL_SIZE_MB}MB"

    if [ "$FULL_SIZE" -gt 10000 ]; then
        pass "Full backup has content (${FULL_SIZE_MB}MB)"
    else
        warn "Full backup very small (${FULL_SIZE_MB}MB) - may be empty database"
        ((TOTAL_TESTS++))
    fi
else
    fail "Full database backup failed" "Check pg_dump permissions"
fi

echo ""

# ============================================================================
# Test 6: Backup Compression Test
# ============================================================================
info "Testing backup compression..."

if command -v gzip > /dev/null 2>&1; then
    COMPRESSED_BACKUP="$TEST_BACKUP_DIR/compressed_test.sql.gz"

    if pg_dump -h "$DATABASE_HOST" -U "$DATABASE_USER" -d "$DATABASE_NAME" \
        --schema-only | gzip > "$COMPRESSED_BACKUP" 2>/dev/null; then
        pass "Compressed backup created"

        COMPRESSED_SIZE=$(stat -f%z "$COMPRESSED_BACKUP" 2>/dev/null || stat -c%s "$COMPRESSED_BACKUP" 2>/dev/null)

        if [ "$COMPRESSED_SIZE" -gt 0 ]; then
            # Calculate compression ratio
            UNCOMPRESSED_SIZE=$(stat -f%z "$SCHEMA_BACKUP" 2>/dev/null || stat -c%s "$SCHEMA_BACKUP" 2>/dev/null)

            if [ "$UNCOMPRESSED_SIZE" -gt 0 ]; then
                COMPRESSION_RATIO=$((100 * COMPRESSED_SIZE / UNCOMPRESSED_SIZE))
                info "Compression ratio: ${COMPRESSION_RATIO}% of original"

                if [ "$COMPRESSION_RATIO" -lt 50 ]; then
                    pass "Good compression achieved (${COMPRESSION_RATIO}%)"
                else
                    info "Moderate compression (${COMPRESSION_RATIO}%)"
                    ((TOTAL_TESTS++))
                fi
            fi
        else
            fail "Compressed backup is empty" "Compression may have failed"
        fi
    else
        fail "Compressed backup creation failed" "Check gzip and pg_dump"
    fi
else
    warn "gzip not available - skipping compression test"
    ((TOTAL_TESTS+=2))
fi

echo ""

# ============================================================================
# Test 7: Backup Integrity Verification
# ============================================================================
info "Testing backup integrity..."

# Verify custom format backup can be listed
if pg_restore --list "$FULL_BACKUP" > /dev/null 2>&1; then
    pass "Backup file integrity verified (pg_restore can read it)"

    # Count objects in backup
    OBJECT_COUNT=$(pg_restore --list "$FULL_BACKUP" 2>/dev/null | grep -c "^[0-9]" || echo "0")

    info "Objects in backup: $OBJECT_COUNT"

    if [ "$OBJECT_COUNT" -gt 10 ]; then
        pass "Backup contains multiple objects ($OBJECT_COUNT)"
    else
        warn "Backup has few objects ($OBJECT_COUNT) - may be incomplete"
        ((TOTAL_TESTS++))
    fi
else
    fail "Backup integrity check failed" "File may be corrupted"
fi

echo ""

# ============================================================================
# Test 8: Test Database Restore (Dry Run)
# ============================================================================
info "Testing restore capability (dry run)..."

# Create a test database for restore
TEST_DB_NAME="marcus_restore_test_$$"

if psql -h "$DATABASE_HOST" -U "$DATABASE_USER" -d postgres \
    -c "CREATE DATABASE $TEST_DB_NAME;" > /dev/null 2>&1; then
    pass "Test database created: $TEST_DB_NAME"

    # Restore backup to test database
    if pg_restore -h "$DATABASE_HOST" -U "$DATABASE_USER" -d "$TEST_DB_NAME" \
        --no-owner --no-acl "$FULL_BACKUP" > /dev/null 2>&1; then
        pass "Backup restored to test database"

        # Verify tables exist
        TABLE_COUNT=$(psql -h "$DATABASE_HOST" -U "$DATABASE_USER" -d "$TEST_DB_NAME" \
            -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')

        if [ -n "$TABLE_COUNT" ] && [ "$TABLE_COUNT" -gt 0 ]; then
            pass "Restored database has $TABLE_COUNT tables"
        else
            fail "Restored database has no tables" "Restore may have failed"
        fi
    else
        fail "Restore to test database failed" "Check pg_restore logs"
    fi

    # Cleanup test database
    psql -h "$DATABASE_HOST" -U "$DATABASE_USER" -d postgres \
        -c "DROP DATABASE $TEST_DB_NAME;" > /dev/null 2>&1

    info "Test database cleaned up"
else
    fail "Cannot create test database" "Check PostgreSQL permissions"
fi

echo ""

# ============================================================================
# Test 9: Point-in-Time Recovery (PITR) Configuration
# ============================================================================
info "Checking point-in-time recovery configuration..."

# Check if WAL archiving is enabled
WAL_LEVEL=$(psql -h "$DATABASE_HOST" -U "$DATABASE_USER" -d "$DATABASE_NAME" \
    -t -c "SHOW wal_level;" 2>/dev/null | tr -d ' ')

if [ -n "$WAL_LEVEL" ]; then
    info "WAL level: $WAL_LEVEL"

    if [ "$WAL_LEVEL" = "replica" ] || [ "$WAL_LEVEL" = "logical" ]; then
        pass "WAL level supports PITR (${WAL_LEVEL})"
    else
        warn "WAL level may not support PITR (${WAL_LEVEL})"
        info "For PITR, set wal_level=replica in postgresql.conf"
        ((TOTAL_TESTS++))
    fi
else
    warn "Cannot determine WAL level"
    ((TOTAL_TESTS++))
fi

# Check archive mode
ARCHIVE_MODE=$(psql -h "$DATABASE_HOST" -U "$DATABASE_USER" -d "$DATABASE_NAME" \
    -t -c "SHOW archive_mode;" 2>/dev/null | tr -d ' ')

if [ "$ARCHIVE_MODE" = "on" ]; then
    pass "Archive mode enabled (PITR available)"

    # Check archive command
    ARCHIVE_COMMAND=$(psql -h "$DATABASE_HOST" -U "$DATABASE_USER" -d "$DATABASE_NAME" \
        -t -c "SHOW archive_command;" 2>/dev/null)

    if echo "$ARCHIVE_COMMAND" | grep -q "cp\|rsync\|wal"; then
        info "Archive command configured: $ARCHIVE_COMMAND"
        ((TOTAL_TESTS++))
    else
        warn "Archive command may not be configured properly"
        ((TOTAL_TESTS++))
    fi
else
    warn "Archive mode not enabled (PITR not available)"
    info "Enable with archive_mode=on in postgresql.conf"
    ((TOTAL_TESTS+=2))
fi

echo ""

# ============================================================================
# Test 10: Backup Rotation and Retention
# ============================================================================
info "Checking backup retention policy..."

if [ -d "$BACKUP_DIR" ]; then
    # Count existing backups
    BACKUP_COUNT=$(find "$BACKUP_DIR" -name "*.dump" -o -name "*.sql" -o -name "*.gz" 2>/dev/null | wc -l)

    info "Existing backups: $BACKUP_COUNT"

    if [ "$BACKUP_COUNT" -gt 0 ]; then
        # Find oldest backup
        OLDEST_BACKUP=$(find "$BACKUP_DIR" -type f \( -name "*.dump" -o -name "*.sql" -o -name "*.gz" \) -printf '%T@ %p\n' 2>/dev/null | sort -n | head -1 | cut -d' ' -f2-)

        if [ -n "$OLDEST_BACKUP" ]; then
            BACKUP_AGE_DAYS=$(( ($(date +%s) - $(stat -f%m "$OLDEST_BACKUP" 2>/dev/null || stat -c%Y "$OLDEST_BACKUP" 2>/dev/null)) / 86400 ))
            info "Oldest backup age: ${BACKUP_AGE_DAYS} days"

            if [ "$BACKUP_AGE_DAYS" -lt 30 ]; then
                pass "Backup retention within 30 days"
            else
                warn "Oldest backup is ${BACKUP_AGE_DAYS} days old"
                info "Consider implementing backup rotation"
                ((TOTAL_TESTS++))
            fi
        fi
    else
        info "No existing backups (normal for new installation)"
        ((TOTAL_TESTS++))
    fi
else
    info "Backup directory not yet created"
    ((TOTAL_TESTS++))
fi

echo ""

# ============================================================================
# Test 11: Redis Backup Capability
# ============================================================================
info "Testing Redis backup capability..."

if command -v redis-cli > /dev/null 2>&1 && [ -n "$REDIS_HOST" ]; then
    REDIS_AUTH_ARGS=""
    if [ -n "$REDIS_PASSWORD" ]; then
        REDIS_AUTH_ARGS="-a $REDIS_PASSWORD"
    fi

    # Trigger BGSAVE (background save)
    BGSAVE_RESPONSE=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" $REDIS_AUTH_ARGS BGSAVE 2>/dev/null || echo "ERROR")

    if echo "$BGSAVE_RESPONSE" | grep -q "Background saving started"; then
        pass "Redis background save triggered"

        # Wait for save to complete
        sleep 2

        # Check last save time
        LAST_SAVE=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" $REDIS_AUTH_ARGS LASTSAVE 2>/dev/null)

        if [ -n "$LAST_SAVE" ]; then
            info "Last Redis save: $(date -d @$LAST_SAVE 2>/dev/null || date -r $LAST_SAVE 2>/dev/null)"
            pass "Redis LASTSAVE command working"
        fi
    else
        warn "Redis background save may not be working: $BGSAVE_RESPONSE"
        ((TOTAL_TESTS++))
    fi
else
    warn "Redis not available - skipping Redis backup test"
    ((TOTAL_TESTS+=2))
fi

echo ""

# ============================================================================
# Cleanup
# ============================================================================
info "Cleaning up test files..."

rm -rf "$TEST_BACKUP_DIR"
rm -f "$PGPASS_FILE"

info "Test files cleaned up"

echo ""

# ============================================================================
# Summary
# ============================================================================
echo "======================================================================"
echo "📊 Backup & Restore Test Summary"
echo "======================================================================"
echo -e "Total Tests:  ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed:       ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed:       ${RED}$FAILED_TESTS${NC}"
echo ""

# Calculate DR readiness score
if [ $TOTAL_TESTS -gt 0 ]; then
    DR_SCORE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo -e "DR Readiness: ${BLUE}${DR_SCORE}%${NC}"
    echo ""
fi

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✅ All backup & restore tests passed!${NC}"
    echo ""
    echo "✨ MARCUS platform is disaster recovery ready."
    echo ""
    echo "📋 Recommended backup schedule:"
    echo "  • Daily: Full database backup (custom format)"
    echo "  • Weekly: Schema-only backup"
    echo "  • Monthly: Compressed backup for archival"
    echo "  • Continuous: WAL archiving (if PITR enabled)"
    echo ""
    echo "🔧 Backup commands:"
    echo "  pg_dump -h localhost -U marcus -d marcus_production -Fc > backup_\$(date +%Y%m%d).dump"
    echo "  redis-cli BGSAVE"
    exit 0
else
    echo -e "${RED}❌ Some backup & restore tests failed${NC}"
    echo ""
    echo "⚠️  Address failures before relying on backups for disaster recovery."
    exit 1
fi
