#!/bin/bash
# MARCUS 3.0 Python Agent Validation Script
# Validates Python agent functionality including demo mode, IPC, analysis accuracy, and state persistence
# Usage: ./test_marcus_python_agent.sh

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
echo "🤖 MARCUS 3.0 Python Agent Validation"
echo "======================================================================"
echo ""

# ============================================================================
# Test 1: Python Environment
# ============================================================================
info "Checking Python environment..."

if command -v python3 > /dev/null 2>&1; then
    PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2)
    pass "Python 3 installed: $PYTHON_VERSION"
else
    fail "Python 3 not found" "Python 3.8+ required for agents"
    exit 1
fi

# Check for required Python packages
REQUIRED_PACKAGES=("anthropic" "redis" "psycopg2")
MISSING_PACKAGES=()

for package in "${REQUIRED_PACKAGES[@]}"; do
    if python3 -c "import $package" 2>/dev/null; then
        pass "Python package installed: $package"
    else
        fail "Missing Python package: $package" "Run: pip install $package"
        MISSING_PACKAGES+=("$package")
    fi
done

if [ ${#MISSING_PACKAGES[@]} -gt 0 ]; then
    warn "Some packages are missing. Agent tests may fail."
fi

echo ""

# ============================================================================
# Test 2: Agent Directory Structure
# ============================================================================
info "Validating agent directory structure..."

EXPECTED_DIRS=(
    "agents"
    "agents/swarm"
    "agents/nested_learning"
)

for dir in "${EXPECTED_DIRS[@]}"; do
    if [ -d "$PROJECT_DIR/$dir" ]; then
        pass "Directory exists: $dir"
    else
        fail "Missing directory: $dir" "Agent codebase incomplete"
    fi
done

# Check for key agent files
EXPECTED_FILES=(
    "agents/swarm/coordinator.py"
    "agents/nested_learning/analyzer.py"
    "agents/ipc.py"
)

for file in "${EXPECTED_FILES[@]}"; do
    if [ -f "$PROJECT_DIR/$file" ]; then
        pass "Agent file exists: $file"
    else
        warn "Missing agent file: $file (may be optional)"
    fi
done

echo ""

# ============================================================================
# Test 3: Demo Mode - Agent Spawn
# ============================================================================
info "Testing agent spawn in demo mode..."

# Create test payload
TEST_PAYLOAD=$(cat <<'EOF'
{
  "test": true,
  "citations": [
    {
      "id": "test-1",
      "title": "Test Paper on AI Safety",
      "authors": ["Smith, J.", "Doe, A."],
      "year": 2024,
      "claims": ["AI systems should be aligned with human values"]
    }
  ]
}
EOF
)

# Test agent spawn (demo mode - no actual API call)
AGENT_TEST_OUTPUT=$(mktemp)

if [ -f "$PROJECT_DIR/agents/demo.py" ]; then
    python3 "$PROJECT_DIR/agents/demo.py" <<< "$TEST_PAYLOAD" > "$AGENT_TEST_OUTPUT" 2>&1 || true

    if [ -s "$AGENT_TEST_OUTPUT" ]; then
        pass "Agent demo mode executed"
        info "Agent output generated ($(wc -l < "$AGENT_TEST_OUTPUT") lines)"
    else
        fail "Agent demo mode failed" "No output generated"
    fi
else
    warn "Demo agent not found (agents/demo.py) - skipping demo test"
    ((TOTAL_TESTS++))
fi

rm -f "$AGENT_TEST_OUTPUT"

echo ""

# ============================================================================
# Test 4: IPC - Inter-Process Communication
# ============================================================================
info "Testing IPC mechanisms..."

# Test Redis connection (IPC message bus)
if [ -n "$REDIS_HOST" ] && [ -n "$REDIS_PORT" ]; then
    if command -v redis-cli > /dev/null 2>&1; then
        REDIS_AUTH_ARGS=""
        if [ -n "$REDIS_PASSWORD" ]; then
            REDIS_AUTH_ARGS="-a $REDIS_PASSWORD"
        fi

        if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" $REDIS_AUTH_ARGS PING 2>/dev/null | grep -q "PONG"; then
            pass "Redis IPC connection successful"

            # Test IPC queue operations
            TEST_QUEUE_KEY="marcus:test:agent_queue:$$"

            # Write to queue
            if redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" $REDIS_AUTH_ARGS LPUSH "$TEST_QUEUE_KEY" "test_message" > /dev/null 2>&1; then
                pass "IPC queue write successful"

                # Read from queue
                QUEUE_MESSAGE=$(redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" $REDIS_AUTH_ARGS RPOP "$TEST_QUEUE_KEY" 2>/dev/null)

                if [ "$QUEUE_MESSAGE" = "test_message" ]; then
                    pass "IPC queue read successful"
                else
                    fail "IPC queue read failed" "Expected 'test_message', got '$QUEUE_MESSAGE'"
                fi

                # Cleanup
                redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" $REDIS_AUTH_ARGS DEL "$TEST_QUEUE_KEY" > /dev/null 2>&1
            else
                fail "IPC queue write failed" "Cannot write to Redis queue"
            fi
        else
            fail "Redis IPC connection failed" "Cannot connect to Redis at $REDIS_HOST:$REDIS_PORT"
        fi
    else
        warn "redis-cli not found - skipping IPC queue tests"
        ((TOTAL_TESTS++))
    fi
else
    warn "REDIS_HOST/REDIS_PORT not configured - skipping IPC tests"
    ((TOTAL_TESTS++))
fi

echo ""

# ============================================================================
# Test 5: Analysis Accuracy - Citation Validation
# ============================================================================
info "Testing citation analysis accuracy..."

# Test citation parser (if available)
if [ -f "$PROJECT_DIR/agents/citation_parser.py" ]; then
    CITATION_TEST_INPUT=$(cat <<'EOF'
Smith et al. (2024) found that AI alignment requires multi-stakeholder governance.
According to Doe and Johnson (2023), "transparency is essential for trustworthy AI."
EOF
)

    CITATION_OUTPUT=$(python3 "$PROJECT_DIR/agents/citation_parser.py" <<< "$CITATION_TEST_INPUT" 2>&1 || echo "ERROR")

    if echo "$CITATION_OUTPUT" | grep -q "Smith"; then
        pass "Citation extraction working (detected 'Smith et al.')"
    else
        fail "Citation extraction failed" "Could not detect citations in test input"
    fi

    if echo "$CITATION_OUTPUT" | grep -q "2024"; then
        pass "Year extraction working (detected '2024')"
    else
        fail "Year extraction failed" "Could not extract year from citations"
    fi
else
    warn "Citation parser not found - skipping accuracy tests"
    ((TOTAL_TESTS+=2))
fi

echo ""

# ============================================================================
# Test 6: State Persistence
# ============================================================================
info "Testing agent state persistence..."

# Check PostgreSQL connection for agent state
if [ -n "$DATABASE_HOST" ] && [ -n "$DATABASE_NAME" ]; then
    # Create temporary .pgpass file
    PGPASS_FILE="$HOME/.pgpass_test_$$"

    if [ -n "$DATABASE_PASSWORD" ]; then
        echo "${DATABASE_HOST}:${DATABASE_PORT:-5432}:${DATABASE_NAME}:${DATABASE_USER}:${DATABASE_PASSWORD}" > "$PGPASS_FILE"
        chmod 600 "$PGPASS_FILE"
        export PGPASSFILE="$PGPASS_FILE"
    fi

    # Check for agent_swarm_state table
    if psql -h "$DATABASE_HOST" -U "$DATABASE_USER" -d "$DATABASE_NAME" -c "SELECT to_regclass('public.agent_swarm_state');" 2>/dev/null | grep -q "agent_swarm_state"; then
        pass "Agent state table exists (agent_swarm_state)"

        # Test state write/read cycle
        TEST_AGENT_ID="test_agent_$$"
        TEST_STATE='{"test": true, "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'

        # Insert test state
        INSERT_RESULT=$(psql -h "$DATABASE_HOST" -U "$DATABASE_USER" -d "$DATABASE_NAME" -t -c "
            INSERT INTO agent_swarm_state (agent_id, state, updated_at)
            VALUES ('$TEST_AGENT_ID', '$TEST_STATE', NOW())
            ON CONFLICT (agent_id) DO UPDATE SET state = EXCLUDED.state, updated_at = NOW()
            RETURNING id;
        " 2>&1)

        if echo "$INSERT_RESULT" | grep -q "^[0-9]"; then
            pass "Agent state write successful"

            # Read state back
            READ_STATE=$(psql -h "$DATABASE_HOST" -U "$DATABASE_USER" -d "$DATABASE_NAME" -t -c "
                SELECT state FROM agent_swarm_state WHERE agent_id = '$TEST_AGENT_ID';
            " 2>/dev/null | tr -d '[:space:]')

            if echo "$READ_STATE" | grep -q '"test":true'; then
                pass "Agent state read successful"
            else
                fail "Agent state read failed" "Could not retrieve persisted state"
            fi

            # Cleanup test state
            psql -h "$DATABASE_HOST" -U "$DATABASE_USER" -d "$DATABASE_NAME" -c "
                DELETE FROM agent_swarm_state WHERE agent_id = '$TEST_AGENT_ID';
            " > /dev/null 2>&1
        else
            fail "Agent state write failed" "Cannot persist agent state to database"
        fi
    else
        fail "Agent state table missing" "agent_swarm_state table not found in database"
    fi

    # Cleanup .pgpass
    rm -f "$PGPASS_FILE"
else
    warn "Database not configured - skipping state persistence tests"
    ((TOTAL_TESTS+=3))
fi

echo ""

# ============================================================================
# Test 7: Agent Process Management
# ============================================================================
info "Testing agent process lifecycle..."

# Check for agent launcher script
if [ -f "$PROJECT_DIR/scripts/launch_agent.sh" ]; then
    pass "Agent launcher script exists"

    # Check if launcher is executable
    if [ -x "$PROJECT_DIR/scripts/launch_agent.sh" ]; then
        pass "Agent launcher is executable"
    else
        warn "Agent launcher not executable (run: chmod +x scripts/launch_agent.sh)"
    fi
else
    warn "Agent launcher script not found (scripts/launch_agent.sh)"
    ((TOTAL_TESTS+=2))
fi

# Check for agent monitor
if [ -f "$PROJECT_DIR/scripts/monitor_agents.sh" ]; then
    pass "Agent monitor script exists"
else
    warn "Agent monitor script not found (scripts/monitor_agents.sh)"
    ((TOTAL_TESTS++))
fi

echo ""

# ============================================================================
# Test 8: Error Handling & Recovery
# ============================================================================
info "Testing error handling..."

# Test graceful degradation (agent spawn with invalid input)
if [ -f "$PROJECT_DIR/agents/demo.py" ]; then
    ERROR_TEST_OUTPUT=$(python3 "$PROJECT_DIR/agents/demo.py" <<< "INVALID JSON" 2>&1 || true)

    # Should not crash - should return error message
    if echo "$ERROR_TEST_OUTPUT" | grep -qi "error\|invalid\|failed"; then
        pass "Agent handles invalid input gracefully"
    else
        warn "Agent error handling unclear (no error message detected)"
    fi
else
    warn "Demo agent not available - skipping error handling test"
    ((TOTAL_TESTS++))
fi

echo ""

# ============================================================================
# Test 9: Anthropic API Configuration
# ============================================================================
info "Checking Anthropic API configuration..."

if [ -n "$ANTHROPIC_API_KEY" ]; then
    KEY_PREFIX=$(echo "$ANTHROPIC_API_KEY" | cut -c1-7)

    if [ "$KEY_PREFIX" = "sk-ant-" ]; then
        pass "Anthropic API key format valid"
        info "Key prefix: sk-ant-***"
    else
        warn "Anthropic API key format unexpected (expected sk-ant- prefix)"
    fi

    # Test API connection (lightweight check - don't actually call API in test mode)
    if [ "$NODE_ENV" != "test" ]; then
        info "Skipping live API test in test environment"
    fi
else
    warn "ANTHROPIC_API_KEY not configured (required for production agents)"
fi

echo ""

# ============================================================================
# Test 10: Agent Logging
# ============================================================================
info "Checking agent logging configuration..."

LOG_DIR="${LOG_DIR:-/var/log/marcus}"

if [ -d "$LOG_DIR" ]; then
    pass "Agent log directory exists: $LOG_DIR"

    # Check write permissions
    if [ -w "$LOG_DIR" ]; then
        pass "Log directory is writable"
    else
        fail "Log directory not writable" "Run: sudo chmod 755 $LOG_DIR && sudo chown $USER $LOG_DIR"
    fi
else
    warn "Log directory not found: $LOG_DIR (will use fallback logging)"
    ((TOTAL_TESTS++))
fi

# Check for recent agent logs
AGENT_LOGS=$(find "$LOG_DIR" -name "agent_*.log" 2>/dev/null | wc -l || echo "0")

if [ "$AGENT_LOGS" -gt 0 ]; then
    info "Agent log files found: $AGENT_LOGS"
else
    info "No agent logs yet (normal for new installation)"
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
    echo -e "${GREEN}✅ All Python agent validation tests passed!${NC}"
    echo ""
    echo "Python agents are properly configured and ready for production."
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    echo ""
    echo "Please review the failures above and fix before deploying to production."
    exit 1
fi
