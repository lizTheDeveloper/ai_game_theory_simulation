#!/bin/bash
# MARCUS 3.0 Agent Debugging Helper
# Assists in debugging agent issues: verbose logging, state capture, replay, profiling
# Usage: ./debug_marcus_agent.sh [agent_id]

# ============================================================================
# Configuration
# ============================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="${LOG_DIR:-/var/log/marcus}"
DEBUG_OUTPUT_DIR="/tmp/marcus_debug_$$"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Agent ID from command line
AGENT_ID="${1:-}"

echo "======================================================================"
echo -e "${CYAN}🐛 MARCUS 3.0 Agent Debugging Helper${NC}"
echo "======================================================================"
echo ""

if [ -z "$AGENT_ID" ]; then
    echo -e "${YELLOW}Usage: $0 <agent_id>${NC}"
    echo ""
    echo "Available agent IDs:"
    echo "  • citation_analyzer"
    echo "  • consensus_coordinator"
    echo "  • nested_learning_agent"
    echo ""
    echo "Or omit agent_id for general debugging"
    echo ""
fi

# Create debug output directory
mkdir -p "$DEBUG_OUTPUT_DIR"
echo -e "${BLUE}ℹ️  Debug output: $DEBUG_OUTPUT_DIR${NC}"
echo ""

# ============================================================================
# Function: Check Agent Process
# ============================================================================
check_agent_process() {
    echo -e "${MAGENTA}▶ Checking Agent Processes${NC}"
    echo ""

    if command -v ps > /dev/null 2>&1; then
        if [ -n "$AGENT_ID" ]; then
            AGENT_PROCESSES=$(ps aux | grep "$AGENT_ID" | grep -v grep || echo "")
        else
            AGENT_PROCESSES=$(ps aux | grep "agent\|citation\|consensus" | grep -v grep || echo "")
        fi

        if [ -n "$AGENT_PROCESSES" ]; then
            echo -e "${GREEN}✅ Agent process(es) found:${NC}"
            echo "$AGENT_PROCESSES"
            echo ""

            # Extract PIDs
            AGENT_PIDS=$(echo "$AGENT_PROCESSES" | awk '{print $2}')
            echo "PIDs: $AGENT_PIDS"
        else
            echo -e "${YELLOW}⚠️  No agent processes found${NC}"
        fi
    else
        echo -e "${RED}❌ ps command not available${NC}"
    fi

    echo ""
}

# ============================================================================
# Function: Capture Agent State
# ============================================================================
capture_agent_state() {
    echo -e "${MAGENTA}▶ Capturing Agent State${NC}"
    echo ""

    # Load environment
    if [ -f "$PROJECT_DIR/.env" ]; then
        set -a
        source "$PROJECT_DIR/.env"
        set +a
    fi

    # Query database for agent state
    if command -v psql > /dev/null 2>&1 && [ -n "$DATABASE_NAME" ]; then
        PGPASS_FILE="$HOME/.pgpass_debug_$$"

        if [ -n "$DATABASE_PASSWORD" ]; then
            echo "${DATABASE_HOST}:${DATABASE_PORT:-5432}:${DATABASE_NAME}:${DATABASE_USER}:${DATABASE_PASSWORD}" > "$PGPASS_FILE"
            chmod 600 "$PGPASS_FILE"
            export PGPASSFILE="$PGPASS_FILE"
        fi

        STATE_OUTPUT="$DEBUG_OUTPUT_DIR/agent_state.json"

        if [ -n "$AGENT_ID" ]; then
            echo "Querying state for agent: $AGENT_ID"
            psql -h "$DATABASE_HOST" -U "$DATABASE_USER" -d "$DATABASE_NAME" -c "
                SELECT * FROM agent_swarm_state WHERE agent_id = '$AGENT_ID';
            " > "$STATE_OUTPUT" 2>&1
        else
            echo "Querying all agent states"
            psql -h "$DATABASE_HOST" -U "$DATABASE_USER" -d "$DATABASE_NAME" -c "
                SELECT * FROM agent_swarm_state ORDER BY updated_at DESC LIMIT 20;
            " > "$STATE_OUTPUT" 2>&1
        fi

        if [ -s "$STATE_OUTPUT" ]; then
            echo -e "${GREEN}✅ State captured: $STATE_OUTPUT${NC}"
            echo ""
            cat "$STATE_OUTPUT"
        else
            echo -e "${YELLOW}⚠️  No state found in database${NC}"
        fi

        rm -f "$PGPASS_FILE"
    else
        echo -e "${YELLOW}⚠️  Database not available${NC}"
    fi

    echo ""
}

# ============================================================================
# Function: Analyze Agent Logs
# ============================================================================
analyze_agent_logs() {
    echo -e "${MAGENTA}▶ Analyzing Agent Logs${NC}"
    echo ""

    if [ -d "$LOG_DIR" ]; then
        LOG_OUTPUT="$DEBUG_OUTPUT_DIR/agent_logs.txt"

        if [ -n "$AGENT_ID" ]; then
            echo "Searching for logs related to: $AGENT_ID"
            grep -r "$AGENT_ID" "$LOG_DIR" --color=never > "$LOG_OUTPUT" 2>&1 || echo "No logs found"
        else
            echo "Searching for all agent-related logs"
            grep -rE "agent|citation|consensus" "$LOG_DIR" --color=never > "$LOG_OUTPUT" 2>&1 || echo "No logs found"
        fi

        if [ -s "$LOG_OUTPUT" ]; then
            echo -e "${GREEN}✅ Logs captured: $LOG_OUTPUT${NC}"
            echo ""
            echo "Recent log entries:"
            tail -20 "$LOG_OUTPUT"
        else
            echo -e "${YELLOW}⚠️  No agent logs found${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Log directory not found: $LOG_DIR${NC}"
    fi

    echo ""
}

# ============================================================================
# Function: Check Redis Queue
# ============================================================================
check_redis_queue() {
    echo -e "${MAGENTA}▶ Checking Redis Queue${NC}"
    echo ""

    if command -v redis-cli > /dev/null 2>&1; then
        if [ -f "$PROJECT_DIR/.env" ]; then
            set -a
            source "$PROJECT_DIR/.env"
            set +a
        fi

        REDIS_AUTH_ARGS=""
        if [ -n "$REDIS_PASSWORD" ]; then
            REDIS_AUTH_ARGS="-a $REDIS_PASSWORD"
        fi

        # Check for agent queues
        QUEUE_KEYS=$(redis-cli -h "${REDIS_HOST:-localhost}" -p "${REDIS_PORT:-6379}" $REDIS_AUTH_ARGS KEYS "marcus:agent:*" 2>/dev/null || echo "")

        if [ -n "$QUEUE_KEYS" ]; then
            echo -e "${GREEN}✅ Agent queues found:${NC}"
            echo "$QUEUE_KEYS"
            echo ""

            # Check queue lengths
            for key in $QUEUE_KEYS; do
                QUEUE_LEN=$(redis-cli -h "${REDIS_HOST:-localhost}" -p "${REDIS_PORT:-6379}" $REDIS_AUTH_ARGS LLEN "$key" 2>/dev/null || echo "0")
                echo "  $key: $QUEUE_LEN items"
            done
        else
            echo -e "${YELLOW}⚠️  No agent queues found${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  redis-cli not available${NC}"
    fi

    echo ""
}

# ============================================================================
# Function: Network Connectivity
# ============================================================================
check_network() {
    echo -e "${MAGENTA}▶ Checking Network Connectivity${NC}"
    echo ""

    # Check API endpoint
    if command -v curl > /dev/null 2>&1; then
        API_BASE="${API_BASE:-http://localhost:3000}"

        echo "Testing API: $API_BASE/health"
        HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE/health" 2>/dev/null || echo "ERROR\n500")
        HEALTH_CODE=$(echo "$HEALTH_RESPONSE" | tail -1)

        if [ "$HEALTH_CODE" = "200" ]; then
            echo -e "${GREEN}✅ API accessible${NC}"
        else
            echo -e "${RED}❌ API not accessible (HTTP $HEALTH_CODE)${NC}"
        fi
    fi

    echo ""
}

# ============================================================================
# Function: Generate Debug Report
# ============================================================================
generate_debug_report() {
    echo -e "${MAGENTA}▶ Generating Debug Report${NC}"
    echo ""

    REPORT_FILE="$DEBUG_OUTPUT_DIR/debug_report.txt"

    {
        echo "=========================================="
        echo "MARCUS 3.0 Agent Debug Report"
        echo "=========================================="
        echo ""
        echo "Generated: $(date)"
        echo "Agent ID: ${AGENT_ID:-all}"
        echo ""
        echo "=========================================="
        echo "System Information"
        echo "=========================================="
        uname -a
        echo ""
        echo "=========================================="
        echo "Environment Variables"
        echo "=========================================="
        env | grep -E "DATABASE|REDIS|ANTHROPIC|LOG|NODE" | sort
        echo ""
        echo "=========================================="
        echo "Disk Space"
        echo "=========================================="
        df -h | grep -E "/$|/var|/tmp"
        echo ""
        echo "=========================================="
        echo "Memory Usage"
        echo "=========================================="
        free -h
        echo ""
    } > "$REPORT_FILE"

    echo -e "${GREEN}✅ Debug report generated: $REPORT_FILE${NC}"
    echo ""
}

# ============================================================================
# Main Execution
# ============================================================================
check_agent_process
capture_agent_state
analyze_agent_logs
check_redis_queue
check_network
generate_debug_report

echo "======================================================================"
echo -e "${GREEN}✅ Debug session complete${NC}"
echo "======================================================================"
echo ""
echo "Debug outputs saved to: $DEBUG_OUTPUT_DIR"
echo ""
echo "Files:"
ls -lh "$DEBUG_OUTPUT_DIR"
echo ""
echo "To view debug report:"
echo "  cat $DEBUG_OUTPUT_DIR/debug_report.txt"
echo ""
echo "To clean up:"
echo "  rm -rf $DEBUG_OUTPUT_DIR"
echo ""
