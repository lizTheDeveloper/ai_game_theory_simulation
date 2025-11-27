#!/bin/bash
# MARCUS 3.0 Monitoring & Observability Testing Script
# Validates monitoring infrastructure: Prometheus metrics, log aggregation, alerts, health checks
# Usage: ./test_marcus_monitoring.sh

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

# Monitoring configuration
API_BASE="${API_BASE:-http://localhost:3000}"
PROMETHEUS_URL="${PROMETHEUS_URL:-http://localhost:9090}"
LOG_DIR="${LOG_DIR:-/var/log/marcus}"

echo "======================================================================"
echo "📊 MARCUS 3.0 Monitoring & Observability Testing"
echo "======================================================================"
echo ""
info "API Base: $API_BASE"
info "Prometheus: $PROMETHEUS_URL"
info "Log Directory: $LOG_DIR"
echo ""

# ============================================================================
# Test 1: Health Endpoint Availability
# ============================================================================
info "Testing health endpoint..."

HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE/health" 2>/dev/null || echo "ERROR\n500")
HEALTH_CODE=$(echo "$HEALTH_RESPONSE" | tail -1)
HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | head -n -1)

if [ "$HEALTH_CODE" = "200" ]; then
    pass "Health endpoint responding"

    # Check if response is JSON
    if echo "$HEALTH_BODY" | grep -q "{.*}"; then
        pass "Health endpoint returns JSON"

        # Check for status field
        if echo "$HEALTH_BODY" | grep -q '"status"'; then
            pass "Health endpoint includes status field"
        else
            warn "Health endpoint missing 'status' field"
            ((TOTAL_TESTS++))
        fi
    else
        warn "Health endpoint not returning JSON"
        ((TOTAL_TESTS+=2))
    fi
else
    fail "Health endpoint not accessible" "HTTP $HEALTH_CODE - API may not be running"
    ((TOTAL_TESTS+=2))
fi

echo ""

# ============================================================================
# Test 2: Metrics Endpoint (Prometheus)
# ============================================================================
info "Testing metrics endpoint..."

METRICS_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE/metrics" 2>/dev/null || echo "ERROR\n500")
METRICS_CODE=$(echo "$METRICS_RESPONSE" | tail -1)
METRICS_BODY=$(echo "$METRICS_RESPONSE" | head -n -1)

if [ "$METRICS_CODE" = "200" ]; then
    pass "Metrics endpoint responding"

    # Check for Prometheus format
    if echo "$METRICS_BODY" | grep -q "^# HELP\|^# TYPE"; then
        pass "Metrics in Prometheus format"

        # Count metrics
        METRIC_COUNT=$(echo "$METRICS_BODY" | grep -c "^[a-z_]" || echo "0")
        info "Metrics exposed: $METRIC_COUNT"

        if [ "$METRIC_COUNT" -gt 10 ]; then
            pass "Multiple metrics available ($METRIC_COUNT)"
        else
            warn "Few metrics exposed ($METRIC_COUNT)"
            ((TOTAL_TESTS++))
        fi

        # Check for important metrics
        if echo "$METRICS_BODY" | grep -q "http_requests_total\|nodejs_"; then
            pass "Standard metrics present (HTTP, Node.js)"
        else
            warn "Standard metrics may be missing"
            ((TOTAL_TESTS++))
        fi
    else
        fail "Metrics not in Prometheus format" "Check metrics middleware"
    fi
elif [ "$METRICS_CODE" = "404" ]; then
    warn "Metrics endpoint not implemented (/metrics not found)"
    ((TOTAL_TESTS+=4))
else
    fail "Metrics endpoint error" "HTTP $METRICS_CODE"
    ((TOTAL_TESTS+=4))
fi

echo ""

# ============================================================================
# Test 3: Prometheus Server Connectivity
# ============================================================================
info "Testing Prometheus server..."

if command -v curl > /dev/null 2>&1; then
    PROM_RESPONSE=$(curl -s -w "\n%{http_code}" "$PROMETHEUS_URL/-/healthy" 2>/dev/null || echo "ERROR\n500")
    PROM_CODE=$(echo "$PROM_RESPONSE" | tail -1)

    if [ "$PROM_CODE" = "200" ]; then
        pass "Prometheus server accessible"

        # Check if scraping our metrics
        TARGETS_RESPONSE=$(curl -s "$PROMETHEUS_URL/api/v1/targets" 2>/dev/null || echo "")

        if echo "$TARGETS_RESPONSE" | grep -q "marcus\|localhost:3000"; then
            pass "MARCUS metrics being scraped by Prometheus"
        else
            warn "MARCUS may not be configured as Prometheus target"
            info "Add to prometheus.yml: job_name: 'marcus', targets: ['localhost:3000']"
            ((TOTAL_TESTS++))
        fi
    else
        warn "Prometheus server not accessible at $PROMETHEUS_URL"
        info "Install Prometheus for production monitoring"
        ((TOTAL_TESTS+=2))
    fi
else
    warn "curl not available - skipping Prometheus connectivity test"
    ((TOTAL_TESTS+=2))
fi

echo ""

# ============================================================================
# Test 4: Log Directory and Files
# ============================================================================
info "Checking logging configuration..."

if [ -d "$LOG_DIR" ]; then
    pass "Log directory exists: $LOG_DIR"

    # Check write permissions
    if [ -w "$LOG_DIR" ]; then
        pass "Log directory writable"
    else
        fail "Log directory not writable" "Run: sudo chmod 755 $LOG_DIR && sudo chown $USER $LOG_DIR"
    fi

    # Count log files
    LOG_FILE_COUNT=$(find "$LOG_DIR" -name "*.log" 2>/dev/null | wc -l)

    info "Log files found: $LOG_FILE_COUNT"

    if [ "$LOG_FILE_COUNT" -gt 0 ]; then
        pass "Log files present"

        # Check for recent logs
        RECENT_LOGS=$(find "$LOG_DIR" -name "*.log" -mtime -1 2>/dev/null | wc -l)

        if [ "$RECENT_LOGS" -gt 0 ]; then
            pass "Recent log activity ($RECENT_LOGS files modified in last 24h)"
        else
            warn "No recent log activity (no logs modified in last 24h)"
            ((TOTAL_TESTS++))
        fi
    else
        info "No log files yet (normal for new installation)"
        ((TOTAL_TESTS+=2))
    fi
else
    warn "Log directory not found: $LOG_DIR"
    info "Will be created on first log write"
    ((TOTAL_TESTS+=4))
fi

echo ""

# ============================================================================
# Test 5: Log Rotation Configuration
# ============================================================================
info "Checking log rotation..."

if command -v logrotate > /dev/null 2>&1; then
    pass "logrotate installed"

    # Check for MARCUS logrotate config
    if [ -f "/etc/logrotate.d/marcus" ]; then
        pass "MARCUS logrotate configuration exists"

        # Verify configuration syntax
        if logrotate -d /etc/logrotate.d/marcus > /dev/null 2>&1; then
            pass "Logrotate configuration valid"
        else
            warn "Logrotate configuration may have errors"
            ((TOTAL_TESTS++))
        fi
    else
        warn "Logrotate configuration not found"
        info "Create /etc/logrotate.d/marcus for automatic log rotation"
        ((TOTAL_TESTS+=2))
    fi
else
    warn "logrotate not installed"
    info "Install logrotate for automatic log management"
    ((TOTAL_TESTS+=3))
fi

echo ""

# ============================================================================
# Test 6: Systemd Journal Integration
# ============================================================================
info "Checking systemd journal..."

if command -v journalctl > /dev/null 2>&1; then
    pass "journalctl available"

    # Check for MARCUS service logs
    MARCUS_LOGS=$(journalctl -u marcus-platform --since "1 day ago" 2>/dev/null | wc -l)

    if [ "$MARCUS_LOGS" -gt 0 ]; then
        pass "MARCUS service logging to journald ($MARCUS_LOGS entries)"
    else
        info "No journald entries for marcus-platform (service may not be configured)"
        ((TOTAL_TESTS++))
    fi

    # Check journal size
    JOURNAL_SIZE=$(journalctl --disk-usage 2>/dev/null | grep -o "[0-9.]*[GM]B" | head -1 || echo "unknown")
    info "Journal disk usage: $JOURNAL_SIZE"
else
    warn "systemd/journalctl not available"
    ((TOTAL_TESTS+=2))
fi

echo ""

# ============================================================================
# Test 7: Error Monitoring and Alerting
# ============================================================================
info "Testing error monitoring..."

# Check if logs contain error tracking
if [ -d "$LOG_DIR" ]; then
    ERROR_COUNT=$(find "$LOG_DIR" -name "*.log" -type f -exec grep -c "ERROR\|FATAL\|CRITICAL" {} \; 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "0")

    info "Total errors logged: $ERROR_COUNT"

    if [ "$ERROR_COUNT" -gt 0 ]; then
        info "Error logging is active"
        ((TOTAL_TESTS++))

        # Check for recent errors
        RECENT_ERRORS=$(find "$LOG_DIR" -name "*.log" -mtime -1 -type f -exec grep -c "ERROR\|FATAL\|CRITICAL" {} \; 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "0")

        if [ "$RECENT_ERRORS" -gt 10 ]; then
            warn "High error rate in last 24h: $RECENT_ERRORS errors"
            info "Investigate error patterns"
            ((TOTAL_TESTS++))
        else
            info "Error rate acceptable (last 24h: $RECENT_ERRORS errors)"
            ((TOTAL_TESTS++))
        fi
    else
        info "No errors logged (could be good or logging not configured)"
        ((TOTAL_TESTS+=2))
    fi
else
    info "Log directory not available - skipping error monitoring test"
    ((TOTAL_TESTS+=2))
fi

echo ""

# ============================================================================
# Test 8: Performance Metrics Collection
# ============================================================================
info "Testing performance metrics..."

if [ "$METRICS_CODE" = "200" ]; then
    # Check for performance-related metrics
    if echo "$METRICS_BODY" | grep -q "response_time\|duration\|latency"; then
        pass "Response time metrics available"
    else
        warn "Response time metrics not found"
        ((TOTAL_TESTS++))
    fi

    if echo "$METRICS_BODY" | grep -q "memory\|heap"; then
        pass "Memory metrics available"
    else
        warn "Memory metrics not found"
        ((TOTAL_TESTS++))
    fi

    if echo "$METRICS_BODY" | grep -q "cpu\|process"; then
        pass "CPU/process metrics available"
    else
        warn "CPU/process metrics not found"
        ((TOTAL_TESTS++))
    fi
else
    warn "Metrics endpoint not available - skipping performance metrics test"
    ((TOTAL_TESTS+=3))
fi

echo ""

# ============================================================================
# Test 9: Database Connection Monitoring
# ============================================================================
info "Testing database monitoring..."

if [ -n "$DATABASE_HOST" ] && command -v psql > /dev/null 2>&1; then
    # Check active connections
    PGPASS_FILE="$HOME/.pgpass_monitor_$$"

    if [ -n "$DATABASE_PASSWORD" ]; then
        echo "${DATABASE_HOST}:${DATABASE_PORT:-5432}:${DATABASE_NAME}:${DATABASE_USER}:${DATABASE_PASSWORD}" > "$PGPASS_FILE"
        chmod 600 "$PGPASS_FILE"
        export PGPASSFILE="$PGPASS_FILE"
    fi

    ACTIVE_CONNS=$(psql -h "$DATABASE_HOST" -U "$DATABASE_USER" -d "$DATABASE_NAME" -t -c "
        SELECT COUNT(*) FROM pg_stat_activity WHERE datname = '$DATABASE_NAME';
    " 2>/dev/null | tr -d ' ')

    if [ -n "$ACTIVE_CONNS" ]; then
        info "Active database connections: $ACTIVE_CONNS"

        if [ "$ACTIVE_CONNS" -lt 100 ]; then
            pass "Database connection count healthy ($ACTIVE_CONNS)"
        else
            warn "High database connection count: $ACTIVE_CONNS"
            ((TOTAL_TESTS++))
        fi

        # Check for long-running queries
        LONG_QUERIES=$(psql -h "$DATABASE_HOST" -U "$DATABASE_USER" -d "$DATABASE_NAME" -t -c "
            SELECT COUNT(*) FROM pg_stat_activity
            WHERE state = 'active' AND now() - query_start > interval '5 minutes';
        " 2>/dev/null | tr -d ' ')

        if [ "$LONG_QUERIES" = "0" ]; then
            pass "No long-running queries (>5 minutes)"
        else
            warn "$LONG_QUERIES queries running > 5 minutes"
            ((TOTAL_TESTS++))
        fi
    else
        warn "Cannot query database statistics"
        ((TOTAL_TESTS+=2))
    fi

    rm -f "$PGPASS_FILE"
else
    warn "Database not available - skipping database monitoring test"
    ((TOTAL_TESTS+=2))
fi

echo ""

# ============================================================================
# Test 10: Redis Monitoring
# ============================================================================
info "Testing Redis monitoring..."

if command -v redis-cli > /dev/null 2>&1 && [ -n "$REDIS_HOST" ]; then
    REDIS_AUTH_ARGS=""
    if [ -n "$REDIS_PASSWORD" ]; then
        REDIS_AUTH_ARGS="-a $REDIS_PASSWORD"
    fi

    # Get Redis INFO
    REDIS_INFO=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" $REDIS_AUTH_ARGS INFO 2>/dev/null || echo "ERROR")

    if [ "$REDIS_INFO" != "ERROR" ]; then
        pass "Redis INFO command successful"

        # Parse memory usage
        REDIS_MEMORY=$(echo "$REDIS_INFO" | grep "^used_memory_human:" | cut -d: -f2 | tr -d '\r')

        if [ -n "$REDIS_MEMORY" ]; then
            info "Redis memory usage: $REDIS_MEMORY"
            pass "Redis memory metrics available"
        else
            warn "Cannot parse Redis memory usage"
            ((TOTAL_TESTS++))
        fi

        # Check connected clients
        REDIS_CLIENTS=$(echo "$REDIS_INFO" | grep "^connected_clients:" | cut -d: -f2 | tr -d '\r')

        if [ -n "$REDIS_CLIENTS" ]; then
            info "Redis connected clients: $REDIS_CLIENTS"

            if [ "$REDIS_CLIENTS" -lt 100 ]; then
                pass "Redis client count healthy ($REDIS_CLIENTS)"
            else
                warn "High Redis client count: $REDIS_CLIENTS"
                ((TOTAL_TESTS++))
            fi
        fi
    else
        fail "Redis INFO command failed" "Check Redis connectivity"
    fi
else
    warn "Redis not available - skipping Redis monitoring test"
    ((TOTAL_TESTS+=3))
fi

echo ""

# ============================================================================
# Test 11: Alert Configuration
# ============================================================================
info "Checking alert configuration..."

# Check for Prometheus alert rules
if [ -f "/etc/prometheus/alerts.yml" ] || [ -f "/etc/prometheus/rules/*.yml" ]; then
    pass "Prometheus alert rules configured"
else
    warn "Prometheus alert rules not found"
    info "Create /etc/prometheus/alerts.yml for alerting"
    ((TOTAL_TESTS++))
fi

# Check for Alertmanager
ALERTMANAGER_URL="${ALERTMANAGER_URL:-http://localhost:9093}"
ALERTMANAGER_RESPONSE=$(curl -s -w "\n%{http_code}" "$ALERTMANAGER_URL/-/healthy" 2>/dev/null || echo "ERROR\n500")
ALERTMANAGER_CODE=$(echo "$ALERTMANAGER_RESPONSE" | tail -1)

if [ "$ALERTMANAGER_CODE" = "200" ]; then
    pass "Alertmanager accessible"
else
    warn "Alertmanager not accessible at $ALERTMANAGER_URL"
    info "Install Alertmanager for alert routing"
    ((TOTAL_TESTS++))
fi

echo ""

# ============================================================================
# Summary
# ============================================================================
echo "======================================================================"
echo "📊 Monitoring Test Summary"
echo "======================================================================"
echo -e "Total Tests:  ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed:       ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed:       ${RED}$FAILED_TESTS${NC}"
echo ""

# Calculate observability score
if [ $TOTAL_TESTS -gt 0 ]; then
    OBSERVABILITY_SCORE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo -e "Observability Score: ${BLUE}${OBSERVABILITY_SCORE}%${NC}"
    echo ""
fi

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✅ All monitoring tests passed!${NC}"
    echo ""
    echo "✨ MARCUS platform has good observability."
    echo ""
    echo "📋 Monitoring stack:"
    echo "  • Health endpoint: $API_BASE/health"
    echo "  • Metrics endpoint: $API_BASE/metrics"
    echo "  • Logs: $LOG_DIR"
    echo "  • Prometheus: $PROMETHEUS_URL"
    echo ""
    echo "🔧 Recommended dashboards:"
    echo "  • Grafana for visualization"
    echo "  • Alertmanager for alert routing"
    echo "  • ELK stack for log aggregation"
    exit 0
else
    echo -e "${RED}❌ Some monitoring tests failed${NC}"
    echo ""
    echo "⚠️  Improve monitoring coverage for production deployment."
    exit 1
fi
