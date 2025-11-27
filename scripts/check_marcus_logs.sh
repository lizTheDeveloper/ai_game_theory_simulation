#!/bin/bash
# MARCUS 3.0 Log Analysis Helper
# Analyzes logs for: error rate, anomalies, security events, pattern matching
# Usage: ./check_marcus_logs.sh [--errors|--security|--performance|--last=N]

# ============================================================================
# Configuration
# ============================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="${LOG_DIR:-/var/log/marcus}"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Parse command line arguments
MODE="summary"
LAST_N_HOURS=24

for arg in "$@"; do
    case $arg in
        --errors)
            MODE="errors"
            ;;
        --security)
            MODE="security"
            ;;
        --performance)
            MODE="performance"
            ;;
        --last=*)
            LAST_N_HOURS="${arg#*=}"
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --errors       Show error analysis"
            echo "  --security     Show security events"
            echo "  --performance  Show performance issues"
            echo "  --last=N       Analyze last N hours (default: 24)"
            echo "  --help         Show this help"
            echo ""
            exit 0
            ;;
    esac
done

echo "======================================================================"
echo -e "${CYAN}📋 MARCUS 3.0 Log Analysis${NC}"
echo "======================================================================"
echo ""
echo -e "${BLUE}Log Directory: $LOG_DIR${NC}"
echo -e "${BLUE}Time Range: Last $LAST_N_HOURS hours${NC}"
echo -e "${BLUE}Mode: $MODE${NC}"
echo ""

# Check if log directory exists
if [ ! -d "$LOG_DIR" ]; then
    echo -e "${RED}❌ Log directory not found: $LOG_DIR${NC}"
    exit 1
fi

# ============================================================================
# Function: Count log entries by level
# ============================================================================
count_by_level() {
    echo -e "${MAGENTA}▶ Log Level Distribution${NC}"
    echo ""

    ERROR_COUNT=$(find "$LOG_DIR" -name "*.log" -mtime "-$((LAST_N_HOURS / 24 + 1))" -type f -exec grep -hc "ERROR" {} \; 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "0")
    WARN_COUNT=$(find "$LOG_DIR" -name "*.log" -mtime "-$((LAST_N_HOURS / 24 + 1))" -type f -exec grep -hc "WARN" {} \; 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "0")
    INFO_COUNT=$(find "$LOG_DIR" -name "*.log" -mtime "-$((LAST_N_HOURS / 24 + 1))" -type f -exec grep -hc "INFO" {} \; 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "0")

    echo -e "${RED}ERROR:${NC} $ERROR_COUNT"
    echo -e "${YELLOW}WARN:${NC}  $WARN_COUNT"
    echo -e "${BLUE}INFO:${NC}  $INFO_COUNT"

    TOTAL=$((ERROR_COUNT + WARN_COUNT + INFO_COUNT))

    if [ "$TOTAL" -gt 0 ]; then
        ERROR_RATE=$((ERROR_COUNT * 100 / TOTAL))
        echo ""
        echo "Error Rate: ${ERROR_RATE}%"

        if [ "$ERROR_RATE" -gt 5 ]; then
            echo -e "${RED}⚠️  High error rate detected${NC}"
        elif [ "$ERROR_RATE" -gt 1 ]; then
            echo -e "${YELLOW}⚠️  Moderate error rate${NC}"
        else
            echo -e "${GREEN}✅ Error rate acceptable${NC}"
        fi
    fi

    echo ""
}

# ============================================================================
# Function: Show recent errors
# ============================================================================
show_recent_errors() {
    echo -e "${MAGENTA}▶ Recent Errors (Last $LAST_N_HOURS hours)${NC}"
    echo ""

    RECENT_ERRORS=$(find "$LOG_DIR" -name "*.log" -mtime "-$((LAST_N_HOURS / 24 + 1))" -type f -exec grep -h "ERROR\|FATAL\|CRITICAL" {} \; 2>/dev/null | tail -20)

    if [ -n "$RECENT_ERRORS" ]; then
        echo "$RECENT_ERRORS" | while IFS= read -r line; do
            echo -e "${RED}$line${NC}"
        done
    else
        echo -e "${GREEN}✅ No errors in last $LAST_N_HOURS hours${NC}"
    fi

    echo ""
}

# ============================================================================
# Function: Detect error patterns
# ============================================================================
detect_error_patterns() {
    echo -e "${MAGENTA}▶ Error Pattern Analysis${NC}"
    echo ""

    # Common error patterns
    DB_ERRORS=$(find "$LOG_DIR" -name "*.log" -mtime "-$((LAST_N_HOURS / 24 + 1))" -type f -exec grep -hc "database\|postgres\|connection.*failed" {} \; 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "0")
    AUTH_ERRORS=$(find "$LOG_DIR" -name "*.log" -mtime "-$((LAST_N_HOURS / 24 + 1))" -type f -exec grep -hc "authentication\|unauthorized\|forbidden" {} \; 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "0")
    NETWORK_ERRORS=$(find "$LOG_DIR" -name "*.log" -mtime "-$((LAST_N_HOURS / 24 + 1))" -type f -exec grep -hc "timeout\|ECONNREFUSED\|network" {} \; 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "0")

    echo "Database errors: $DB_ERRORS"
    echo "Auth errors: $AUTH_ERRORS"
    echo "Network errors: $NETWORK_ERRORS"

    if [ "$DB_ERRORS" -gt 10 ]; then
        echo -e "${RED}⚠️  High database error rate${NC}"
    fi

    if [ "$AUTH_ERRORS" -gt 20 ]; then
        echo -e "${RED}⚠️  High authentication failure rate (possible attack)${NC}"
    fi

    if [ "$NETWORK_ERRORS" -gt 10 ]; then
        echo -e "${YELLOW}⚠️  Network connectivity issues detected${NC}"
    fi

    echo ""
}

# ============================================================================
# Function: Security event analysis
# ============================================================================
analyze_security_events() {
    echo -e "${MAGENTA}▶ Security Event Analysis${NC}"
    echo ""

    # SQL injection attempts
    SQL_INJECTION=$(find "$LOG_DIR" -name "*.log" -mtime "-$((LAST_N_HOURS / 24 + 1))" -type f -exec grep -hc "' OR '1'='1\|UNION SELECT\|DROP TABLE" {} \; 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "0")

    # XSS attempts
    XSS_ATTEMPTS=$(find "$LOG_DIR" -name "*.log" -mtime "-$((LAST_N_HOURS / 24 + 1))" -type f -exec grep -hc "<script>\|onerror=\|javascript:" {} \; 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "0")

    # Failed logins
    FAILED_LOGINS=$(find "$LOG_DIR" -name "*.log" -mtime "-$((LAST_N_HOURS / 24 + 1))" -type f -exec grep -hc "login.*failed\|authentication.*failed" {} \; 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "0")

    echo "SQL injection attempts: $SQL_INJECTION"
    echo "XSS attempts: $XSS_ATTEMPTS"
    echo "Failed logins: $FAILED_LOGINS"

    if [ "$SQL_INJECTION" -gt 0 ]; then
        echo -e "${RED}⚠️  SQL injection attempts detected${NC}"
    fi

    if [ "$XSS_ATTEMPTS" -gt 0 ]; then
        echo -e "${RED}⚠️  XSS attempts detected${NC}"
    fi

    if [ "$FAILED_LOGINS" -gt 50 ]; then
        echo -e "${RED}⚠️  Brute force attack suspected${NC}"
    elif [ "$FAILED_LOGINS" -gt 20 ]; then
        echo -e "${YELLOW}⚠️  Multiple failed login attempts${NC}"
    else
        echo -e "${GREEN}✅ No significant security events${NC}"
    fi

    echo ""
}

# ============================================================================
# Function: Performance issue detection
# ============================================================================
analyze_performance() {
    echo -e "${MAGENTA}▶ Performance Issue Analysis${NC}"
    echo ""

    # Slow queries
    SLOW_QUERIES=$(find "$LOG_DIR" -name "*.log" -mtime "-$((LAST_N_HOURS / 24 + 1))" -type f -exec grep -hc "slow query\|query.*[5-9][0-9][0-9][0-9]ms\|query.*[0-9]s" {} \; 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "0")

    # High memory warnings
    MEMORY_WARNINGS=$(find "$LOG_DIR" -name "*.log" -mtime "-$((LAST_N_HOURS / 24 + 1))" -type f -exec grep -hc "memory.*high\|out of memory\|heap" {} \; 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "0")

    # Timeout errors
    TIMEOUTS=$(find "$LOG_DIR" -name "*.log" -mtime "-$((LAST_N_HOURS / 24 + 1))" -type f -exec grep -hc "timeout\|timed out" {} \; 2>/dev/null | awk '{sum+=$1} END {print sum}' || echo "0")

    echo "Slow queries: $SLOW_QUERIES"
    echo "Memory warnings: $MEMORY_WARNINGS"
    echo "Timeout errors: $TIMEOUTS"

    if [ "$SLOW_QUERIES" -gt 10 ]; then
        echo -e "${YELLOW}⚠️  Performance degradation detected (slow queries)${NC}"
    fi

    if [ "$MEMORY_WARNINGS" -gt 5 ]; then
        echo -e "${RED}⚠️  Memory pressure detected${NC}"
    fi

    if [ "$TIMEOUTS" -gt 10 ]; then
        echo -e "${YELLOW}⚠️  Multiple timeout errors${NC}"
    fi

    if [ "$SLOW_QUERIES" -eq 0 ] && [ "$MEMORY_WARNINGS" -eq 0 ] && [ "$TIMEOUTS" -eq 0 ]; then
        echo -e "${GREEN}✅ No performance issues detected${NC}"
    fi

    echo ""
}

# ============================================================================
# Function: Top error messages
# ============================================================================
show_top_errors() {
    echo -e "${MAGENTA}▶ Most Common Errors${NC}"
    echo ""

    TOP_ERRORS=$(find "$LOG_DIR" -name "*.log" -mtime "-$((LAST_N_HOURS / 24 + 1))" -type f -exec grep -h "ERROR" {} \; 2>/dev/null | sed 's/^.*ERROR[: ]*//' | sort | uniq -c | sort -rn | head -10)

    if [ -n "$TOP_ERRORS" ]; then
        echo "$TOP_ERRORS" | while IFS= read -r line; do
            COUNT=$(echo "$line" | awk '{print $1}')
            MESSAGE=$(echo "$line" | cut -d' ' -f2-)

            if [ "$COUNT" -gt 10 ]; then
                echo -e "${RED}$COUNT × ${NC}$MESSAGE"
            else
                echo -e "${YELLOW}$COUNT × ${NC}$MESSAGE"
            fi
        done
    else
        echo -e "${GREEN}✅ No errors found${NC}"
    fi

    echo ""
}

# ============================================================================
# Main execution based on mode
# ============================================================================

case $MODE in
    errors)
        count_by_level
        show_recent_errors
        detect_error_patterns
        show_top_errors
        ;;
    security)
        analyze_security_events
        ;;
    performance)
        analyze_performance
        ;;
    summary)
        count_by_level
        detect_error_patterns
        analyze_security_events
        analyze_performance
        ;;
esac

echo "======================================================================"
echo -e "${GREEN}✅ Log analysis complete${NC}"
echo "======================================================================"
echo ""
echo "For detailed analysis:"
echo "  --errors       Detailed error analysis"
echo "  --security     Security event analysis"
echo "  --performance  Performance issue analysis"
echo ""
