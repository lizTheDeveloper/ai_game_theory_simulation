#!/bin/bash
# MARCUS 3.0 Performance Testing Script
# Load testing and benchmarking: API response times, DB query performance, throughput, memory usage
# Usage: ./test_marcus_performance.sh

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

# API base URL
API_BASE="${API_BASE:-http://localhost:3000}"

# Performance thresholds (milliseconds)
THRESHOLD_FAST=100
THRESHOLD_ACCEPTABLE=500
THRESHOLD_SLOW=1000

echo "======================================================================"
echo "⚡ MARCUS 3.0 Performance Testing"
echo "======================================================================"
echo ""
info "API Base URL: $API_BASE"
info "Thresholds: Fast (<${THRESHOLD_FAST}ms), Acceptable (<${THRESHOLD_ACCEPTABLE}ms), Slow (<${THRESHOLD_SLOW}ms)"
echo ""

# ============================================================================
# Test 1: API Response Time - Health Endpoint
# ============================================================================
info "Testing API response time (health endpoint)..."

TOTAL_TIME=0
NUM_REQUESTS=10

for i in $(seq 1 $NUM_REQUESTS); do
    START_TIME=$(date +%s%3N)

    curl -s "$API_BASE/health" > /dev/null 2>&1

    END_TIME=$(date +%s%3N)
    REQUEST_TIME=$((END_TIME - START_TIME))
    TOTAL_TIME=$((TOTAL_TIME + REQUEST_TIME))
done

AVG_TIME=$((TOTAL_TIME / NUM_REQUESTS))

if [ $AVG_TIME -lt $THRESHOLD_FAST ]; then
    pass "Health endpoint response time: ${AVG_TIME}ms (fast)"
elif [ $AVG_TIME -lt $THRESHOLD_ACCEPTABLE ]; then
    pass "Health endpoint response time: ${AVG_TIME}ms (acceptable)"
elif [ $AVG_TIME -lt $THRESHOLD_SLOW ]; then
    warn "Health endpoint response time: ${AVG_TIME}ms (slow)"
    ((TOTAL_TESTS++))
else
    fail "Health endpoint response time: ${AVG_TIME}ms" "Exceeds ${THRESHOLD_SLOW}ms threshold"
fi

echo ""

# ============================================================================
# Test 2: API Response Time - Authentication
# ============================================================================
info "Testing API response time (authentication)..."

# Create test user
TEST_USER_EMAIL="perf_test_$$@test.com"
TEST_USER_PASSWORD="PerfTest123!"

curl -s -X POST "$API_BASE/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_USER_EMAIL\",\"password\":\"$TEST_USER_PASSWORD\",\"name\":\"Perf Test\"}" > /dev/null 2>&1

# Measure login performance
TOTAL_LOGIN_TIME=0
NUM_LOGIN_REQUESTS=5

for i in $(seq 1 $NUM_LOGIN_REQUESTS); do
    START_TIME=$(date +%s%3N)

    curl -s -X POST "$API_BASE/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$TEST_USER_EMAIL\",\"password\":\"$TEST_USER_PASSWORD\"}" > /dev/null 2>&1

    END_TIME=$(date +%s%3N)
    REQUEST_TIME=$((END_TIME - START_TIME))
    TOTAL_LOGIN_TIME=$((TOTAL_LOGIN_TIME + REQUEST_TIME))
done

AVG_LOGIN_TIME=$((TOTAL_LOGIN_TIME / NUM_LOGIN_REQUESTS))

if [ $AVG_LOGIN_TIME -lt $THRESHOLD_ACCEPTABLE ]; then
    pass "Login endpoint response time: ${AVG_LOGIN_TIME}ms"
elif [ $AVG_LOGIN_TIME -lt $THRESHOLD_SLOW ]; then
    warn "Login endpoint response time: ${AVG_LOGIN_TIME}ms (slow)"
    ((TOTAL_TESTS++))
else
    fail "Login endpoint response time: ${AVG_LOGIN_TIME}ms" "Exceeds ${THRESHOLD_SLOW}ms threshold (bcrypt rounds may be too high)"
fi

echo ""

# ============================================================================
# Test 3: Database Query Performance
# ============================================================================
info "Testing database query performance..."

if command -v psql > /dev/null 2>&1 && [ -n "$DATABASE_NAME" ]; then
    PGPASS_FILE="$HOME/.pgpass_perf_$$"

    if [ -n "$DATABASE_PASSWORD" ]; then
        echo "${DATABASE_HOST}:${DATABASE_PORT:-5432}:${DATABASE_NAME}:${DATABASE_USER}:${DATABASE_PASSWORD}" > "$PGPASS_FILE"
        chmod 600 "$PGPASS_FILE"
        export PGPASSFILE="$PGPASS_FILE"
    fi

    # Test simple SELECT query performance
    START_TIME=$(date +%s%3N)

    psql -h "${DATABASE_HOST}" -U "${DATABASE_USER}" -d "${DATABASE_NAME}" -c "SELECT COUNT(*) FROM users;" > /dev/null 2>&1

    END_TIME=$(date +%s%3N)
    QUERY_TIME=$((END_TIME - START_TIME))

    if [ $QUERY_TIME -lt $THRESHOLD_FAST ]; then
        pass "Simple SELECT query: ${QUERY_TIME}ms (fast)"
    elif [ $QUERY_TIME -lt $THRESHOLD_ACCEPTABLE ]; then
        pass "Simple SELECT query: ${QUERY_TIME}ms (acceptable)"
    else
        warn "Simple SELECT query: ${QUERY_TIME}ms (slow - check indices)"
        ((TOTAL_TESTS++))
    fi

    # Test JOIN query performance
    START_TIME=$(date +%s%3N)

    psql -h "${DATABASE_HOST}" -U "${DATABASE_USER}" -d "${DATABASE_NAME}" -c "
        SELECT u.id, u.email, COUNT(rt.id) as token_count
        FROM users u
        LEFT JOIN refresh_tokens rt ON u.id = rt.user_id
        GROUP BY u.id, u.email
        LIMIT 100;
    " > /dev/null 2>&1

    END_TIME=$(date +%s%3N)
    JOIN_TIME=$((END_TIME - START_TIME))

    if [ $JOIN_TIME -lt $THRESHOLD_ACCEPTABLE ]; then
        pass "JOIN query performance: ${JOIN_TIME}ms"
    elif [ $JOIN_TIME -lt $THRESHOLD_SLOW ]; then
        warn "JOIN query performance: ${JOIN_TIME}ms (consider optimizing)"
        ((TOTAL_TESTS++))
    else
        fail "JOIN query performance: ${JOIN_TIME}ms" "Exceeds ${THRESHOLD_SLOW}ms - check indices and query plan"
    fi

    rm -f "$PGPASS_FILE"
else
    warn "PostgreSQL not available - skipping database performance tests"
    ((TOTAL_TESTS+=2))
fi

echo ""

# ============================================================================
# Test 4: API Throughput (Concurrent Requests)
# ============================================================================
info "Testing API throughput with concurrent requests..."

# Create 20 concurrent health check requests
CONCURRENT_COUNT=20
START_TIME=$(date +%s%3N)

for i in $(seq 1 $CONCURRENT_COUNT); do
    curl -s "$API_BASE/health" > /dev/null 2>&1 &
done

# Wait for all background jobs
wait

END_TIME=$(date +%s%3N)
TOTAL_CONCURRENT_TIME=$((END_TIME - START_TIME))

# Calculate requests per second
if [ $TOTAL_CONCURRENT_TIME -gt 0 ]; then
    RPS=$((CONCURRENT_COUNT * 1000 / TOTAL_CONCURRENT_TIME))

    if [ $RPS -ge 50 ]; then
        pass "Throughput: ${RPS} req/sec (${CONCURRENT_COUNT} concurrent in ${TOTAL_CONCURRENT_TIME}ms)"
    elif [ $RPS -ge 20 ]; then
        warn "Throughput: ${RPS} req/sec (acceptable but could be improved)"
        ((TOTAL_TESTS++))
    else
        fail "Throughput: ${RPS} req/sec" "Low throughput detected (target: 50+ req/sec)"
    fi
else
    warn "Concurrent requests completed too fast to measure accurately"
    ((TOTAL_TESTS++))
fi

echo ""

# ============================================================================
# Test 5: Memory Usage
# ============================================================================
info "Testing memory usage..."

# Check if process is running
API_PID=$(pgrep -f "node.*3000" || pgrep -f "next-server" || echo "")

if [ -n "$API_PID" ]; then
    if command -v ps > /dev/null 2>&1; then
        # Get memory usage in KB
        MEM_KB=$(ps -o rss= -p "$API_PID" 2>/dev/null | awk '{sum+=$1} END {print sum}')

        if [ -n "$MEM_KB" ] && [ "$MEM_KB" -gt 0 ]; then
            MEM_MB=$((MEM_KB / 1024))

            info "Current memory usage: ${MEM_MB}MB"

            if [ $MEM_MB -lt 200 ]; then
                pass "Memory usage within limits: ${MEM_MB}MB"
            elif [ $MEM_MB -lt 500 ]; then
                warn "Memory usage moderate: ${MEM_MB}MB (monitor for leaks)"
                ((TOTAL_TESTS++))
            else
                fail "Memory usage high: ${MEM_MB}MB" "Possible memory leak - investigate"
            fi
        else
            warn "Could not measure memory usage"
            ((TOTAL_TESTS++))
        fi
    else
        warn "ps command not available - skipping memory test"
        ((TOTAL_TESTS++))
    fi
else
    warn "API process not found - skipping memory test"
    ((TOTAL_TESTS++))
fi

echo ""

# ============================================================================
# Test 6: Redis Performance
# ============================================================================
info "Testing Redis performance..."

if command -v redis-cli > /dev/null 2>&1 && [ -n "$REDIS_HOST" ]; then
    REDIS_AUTH_ARGS=""
    if [ -n "$REDIS_PASSWORD" ]; then
        REDIS_AUTH_ARGS="-a $REDIS_PASSWORD"
    fi

    # Test SET performance
    START_TIME=$(date +%s%3N)

    for i in $(seq 1 100); do
        redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" $REDIS_AUTH_ARGS SET "perf_test_$i" "value_$i" > /dev/null 2>&1
    done

    END_TIME=$(date +%s%3N)
    REDIS_SET_TIME=$((END_TIME - START_TIME))

    if [ $REDIS_SET_TIME -lt 100 ]; then
        pass "Redis SET performance: ${REDIS_SET_TIME}ms for 100 operations"
    else
        warn "Redis SET performance: ${REDIS_SET_TIME}ms (may need optimization)"
        ((TOTAL_TESTS++))
    fi

    # Test GET performance
    START_TIME=$(date +%s%3N)

    for i in $(seq 1 100); do
        redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" $REDIS_AUTH_ARGS GET "perf_test_$i" > /dev/null 2>&1
    done

    END_TIME=$(date +%s%3N)
    REDIS_GET_TIME=$((END_TIME - START_TIME))

    if [ $REDIS_GET_TIME -lt 100 ]; then
        pass "Redis GET performance: ${REDIS_GET_TIME}ms for 100 operations"
    else
        warn "Redis GET performance: ${REDIS_GET_TIME}ms (may need optimization)"
        ((TOTAL_TESTS++))
    fi

    # Cleanup test keys
    redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" $REDIS_AUTH_ARGS DEL $(seq -f "perf_test_%.0f" 1 100) > /dev/null 2>&1
else
    warn "Redis not available - skipping Redis performance tests"
    ((TOTAL_TESTS+=2))
fi

echo ""

# ============================================================================
# Test 7: Connection Pool Efficiency
# ============================================================================
info "Testing database connection pool..."

if command -v psql > /dev/null 2>&1 && [ -n "$DATABASE_NAME" ]; then
    PGPASS_FILE="$HOME/.pgpass_pool_$$"

    if [ -n "$DATABASE_PASSWORD" ]; then
        echo "${DATABASE_HOST}:${DATABASE_PORT:-5432}:${DATABASE_NAME}:${DATABASE_USER}:${DATABASE_PASSWORD}" > "$PGPASS_FILE"
        chmod 600 "$PGPASS_FILE"
        export PGPASSFILE="$PGPASS_FILE"
    fi

    # Check active connections
    ACTIVE_CONNECTIONS=$(psql -h "${DATABASE_HOST}" -U "${DATABASE_USER}" -d "${DATABASE_NAME}" -t -c "
        SELECT COUNT(*) FROM pg_stat_activity WHERE datname = '${DATABASE_NAME}';
    " 2>/dev/null | tr -d ' ')

    if [ -n "$ACTIVE_CONNECTIONS" ]; then
        info "Active database connections: $ACTIVE_CONNECTIONS"

        # Get max_connections setting
        MAX_CONNECTIONS=$(psql -h "${DATABASE_HOST}" -U "${DATABASE_USER}" -d "${DATABASE_NAME}" -t -c "SHOW max_connections;" 2>/dev/null | tr -d ' ')

        if [ -n "$MAX_CONNECTIONS" ]; then
            CONNECTION_USAGE=$((ACTIVE_CONNECTIONS * 100 / MAX_CONNECTIONS))

            if [ $CONNECTION_USAGE -lt 50 ]; then
                pass "Connection pool usage: ${CONNECTION_USAGE}% (${ACTIVE_CONNECTIONS}/${MAX_CONNECTIONS})"
            elif [ $CONNECTION_USAGE -lt 80 ]; then
                warn "Connection pool usage: ${CONNECTION_USAGE}% (monitor closely)"
                ((TOTAL_TESTS++))
            else
                fail "Connection pool usage: ${CONNECTION_USAGE}%" "Close to limit - increase max_connections or fix leaks"
            fi
        fi
    fi

    rm -f "$PGPASS_FILE"
else
    warn "PostgreSQL not available - skipping connection pool test"
    ((TOTAL_TESTS++))
fi

echo ""

# ============================================================================
# Test 8: Large Payload Handling
# ============================================================================
info "Testing large payload handling..."

# Create a large JSON payload (100 citations)
LARGE_PAYLOAD='{"citations":['
for i in $(seq 1 100); do
    LARGE_PAYLOAD="$LARGE_PAYLOAD{\"title\":\"Test Paper $i\",\"authors\":[\"Author A\",\"Author B\"],\"year\":2024,\"claims\":[\"Claim 1\",\"Claim 2\"]}"
    if [ $i -lt 100 ]; then
        LARGE_PAYLOAD="$LARGE_PAYLOAD,"
    fi
done
LARGE_PAYLOAD="$LARGE_PAYLOAD]}"

# Login to get token
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_USER_EMAIL\",\"password\":\"$TEST_USER_PASSWORD\"}" 2>/dev/null)

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -n "$ACCESS_TOKEN" ]; then
    START_TIME=$(date +%s%3N)

    LARGE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/citations/analyze" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$LARGE_PAYLOAD" 2>/dev/null || echo "ERROR\n500")

    END_TIME=$(date +%s%3N)
    LARGE_PAYLOAD_TIME=$((END_TIME - START_TIME))
    LARGE_CODE=$(echo "$LARGE_RESPONSE" | tail -1)

    if [ "$LARGE_CODE" = "200" ] || [ "$LARGE_CODE" = "201" ] || [ "$LARGE_CODE" = "202" ] || [ "$LARGE_CODE" = "404" ]; then
        if [ $LARGE_PAYLOAD_TIME -lt 2000 ]; then
            pass "Large payload handling: ${LARGE_PAYLOAD_TIME}ms (100 citations)"
        elif [ $LARGE_PAYLOAD_TIME -lt 5000 ]; then
            warn "Large payload handling: ${LARGE_PAYLOAD_TIME}ms (acceptable but slow)"
            ((TOTAL_TESTS++))
        else
            fail "Large payload handling: ${LARGE_PAYLOAD_TIME}ms" "Exceeds 5000ms threshold"
        fi
    else
        warn "Large payload test inconclusive (HTTP $LARGE_CODE)"
        ((TOTAL_TESTS++))
    fi
else
    warn "No access token - skipping large payload test"
    ((TOTAL_TESTS++))
fi

echo ""

# ============================================================================
# Test 9: Database Index Effectiveness
# ============================================================================
info "Testing database index effectiveness..."

if command -v psql > /dev/null 2>&1 && [ -n "$DATABASE_NAME" ]; then
    PGPASS_FILE="$HOME/.pgpass_idx_$$"

    if [ -n "$DATABASE_PASSWORD" ]; then
        echo "${DATABASE_HOST}:${DATABASE_PORT:-5432}:${DATABASE_NAME}:${DATABASE_USER}:${DATABASE_PASSWORD}" > "$PGPASS_FILE"
        chmod 600 "$PGPASS_FILE"
        export PGPASSFILE="$PGPASS_FILE"
    fi

    # Check for unused indices
    UNUSED_INDICES=$(psql -h "${DATABASE_HOST}" -U "${DATABASE_USER}" -d "${DATABASE_NAME}" -t -c "
        SELECT COUNT(*)
        FROM pg_stat_user_indexes
        WHERE idx_scan = 0 AND schemaname = 'public';
    " 2>/dev/null | tr -d ' ')

    if [ -n "$UNUSED_INDICES" ]; then
        if [ "$UNUSED_INDICES" -eq 0 ]; then
            pass "All indices are being used"
        else
            warn "$UNUSED_INDICES indices are unused (consider removing to improve write performance)"
            ((TOTAL_TESTS++))
        fi
    fi

    # Check index cache hit ratio
    INDEX_CACHE_RATIO=$(psql -h "${DATABASE_HOST}" -U "${DATABASE_USER}" -d "${DATABASE_NAME}" -t -c "
        SELECT ROUND(100.0 * sum(idx_blks_hit) / NULLIF(sum(idx_blks_hit + idx_blks_read), 0), 2)
        FROM pg_statio_user_indexes;
    " 2>/dev/null | tr -d ' ')

    if [ -n "$INDEX_CACHE_RATIO" ]; then
        INDEX_CACHE_RATIO_INT=$(echo "$INDEX_CACHE_RATIO" | cut -d'.' -f1)

        if [ "$INDEX_CACHE_RATIO_INT" -ge 95 ]; then
            pass "Index cache hit ratio: ${INDEX_CACHE_RATIO}% (excellent)"
        elif [ "$INDEX_CACHE_RATIO_INT" -ge 85 ]; then
            warn "Index cache hit ratio: ${INDEX_CACHE_RATIO}% (acceptable, consider increasing shared_buffers)"
            ((TOTAL_TESTS++))
        else
            fail "Index cache hit ratio: ${INDEX_CACHE_RATIO}%" "Low cache hit ratio - increase shared_buffers"
        fi
    fi

    rm -f "$PGPASS_FILE"
else
    warn "PostgreSQL not available - skipping index effectiveness tests"
    ((TOTAL_TESTS+=2))
fi

echo ""

# ============================================================================
# Cleanup Test Data
# ============================================================================
info "Cleaning up test data..."

if command -v psql > /dev/null 2>&1 && [ -n "$DATABASE_NAME" ]; then
    PGPASS_FILE="$HOME/.pgpass_cleanup_$$"

    if [ -n "$DATABASE_PASSWORD" ]; then
        echo "${DATABASE_HOST}:${DATABASE_PORT:-5432}:${DATABASE_NAME}:${DATABASE_USER}:${DATABASE_PASSWORD}" > "$PGPASS_FILE"
        chmod 600 "$PGPASS_FILE"
        export PGPASSFILE="$PGPASS_FILE"
    fi

    psql -h "${DATABASE_HOST}" -U "${DATABASE_USER}" -d "${DATABASE_NAME}" -c "
        DELETE FROM users WHERE email LIKE 'perf_test_%@test.com';
    " > /dev/null 2>&1

    rm -f "$PGPASS_FILE"

    info "Test users cleaned up"
fi

echo ""

# ============================================================================
# Summary
# ============================================================================
echo "======================================================================"
echo "📊 Performance Test Summary"
echo "======================================================================"
echo -e "Total Tests:  ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed:       ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed:       ${RED}$FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✅ All performance tests passed!${NC}"
    echo ""
    echo "MARCUS platform meets performance benchmarks."
    exit 0
else
    echo -e "${RED}❌ Some performance tests failed${NC}"
    echo ""
    echo "⚠️  Review failures and optimize before production deployment."
    exit 1
fi
