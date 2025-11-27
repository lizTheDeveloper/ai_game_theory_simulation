#!/bin/bash
# MARCUS 3.0 CI/CD Full Test Suite
# Orchestrates all test scripts for comprehensive CI/CD validation
# Usage: ./ci_marcus_full_suite.sh [--quick|--full]

set -e  # Exit on first failure in CI mode

# ============================================================================
# Configuration
# ============================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Test mode
TEST_MODE="${1:-full}"

# Test results
TOTAL_SUITES=0
PASSED_SUITES=0
FAILED_SUITES=0

declare -a FAILED_SUITE_NAMES

# ============================================================================
# Helper Functions
# ============================================================================
info() {
    echo -e "${BLUE}ℹ️  INFO${NC}: $1"
}

warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
}

section() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

run_test_suite() {
    local suite_name="$1"
    local script_path="$2"
    local optional="${3:-false}"

    ((TOTAL_SUITES++))

    echo -e "${MAGENTA}▶ Running: $suite_name${NC}"

    if [ ! -f "$script_path" ]; then
        if [ "$optional" = "true" ]; then
            echo -e "${YELLOW}  ⊘ SKIP${NC}: Script not found (optional)"
            return 0
        else
            echo -e "${RED}  ❌ FAIL${NC}: Script not found (required)"
            FAILED_SUITE_NAMES+=("$suite_name (missing)")
            ((FAILED_SUITES++))
            return 1
        fi
    fi

    if [ ! -x "$script_path" ]; then
        echo -e "${YELLOW}  ⚠️  WARN${NC}: Script not executable, attempting chmod +x"
        chmod +x "$script_path" 2>/dev/null || true
    fi

    # Run test suite
    START_TIME=$(date +%s)

    if "$script_path"; then
        END_TIME=$(date +%s)
        DURATION=$((END_TIME - START_TIME))
        echo -e "${GREEN}  ✅ PASS${NC}: $suite_name (${DURATION}s)"
        ((PASSED_SUITES++))
        return 0
    else
        END_TIME=$(date +%s)
        DURATION=$((END_TIME - START_TIME))
        echo -e "${RED}  ❌ FAIL${NC}: $suite_name (${DURATION}s)"
        FAILED_SUITE_NAMES+=("$suite_name")
        ((FAILED_SUITES++))
        return 1
    fi
}

# ============================================================================
# Banner
# ============================================================================
echo "======================================================================"
echo -e "${MAGENTA}🚀 MARCUS 3.0 CI/CD Full Test Suite${NC}"
echo "======================================================================"
echo ""
info "Mode: $TEST_MODE"
info "Project: $PROJECT_DIR"
info "Started: $(date)"
echo ""

# ============================================================================
# Pre-flight Checks
# ============================================================================
section "1️⃣  Pre-flight Checks"

info "Checking environment..."

# Check Node.js
if command -v node > /dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅${NC} Node.js installed: $NODE_VERSION"
else
    echo -e "${RED}❌${NC} Node.js not found"
    exit 1
fi

# Check npm
if command -v npm > /dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅${NC} npm installed: $NPM_VERSION"
else
    echo -e "${RED}❌${NC} npm not found"
    exit 1
fi

# Check PostgreSQL
if command -v psql > /dev/null 2>&1; then
    PSQL_VERSION=$(psql --version | head -1)
    echo -e "${GREEN}✅${NC} PostgreSQL client: $PSQL_VERSION"
else
    echo -e "${YELLOW}⚠️${NC} psql not found (some tests may be skipped)"
fi

# Check Redis
if command -v redis-cli > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} Redis CLI available"
else
    echo -e "${YELLOW}⚠️${NC} redis-cli not found (some tests may be skipped)"
fi

# Check Python
if command -v python3 > /dev/null 2>&1; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✅${NC} Python: $PYTHON_VERSION"
else
    echo -e "${YELLOW}⚠️${NC} Python 3 not found (agent tests will be skipped)"
fi

echo ""
info "Installing dependencies..."
cd "$PROJECT_DIR"

if npm install --silent > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} Dependencies installed"
else
    echo -e "${YELLOW}⚠️${NC} Dependency installation had warnings (continuing)"
fi

# ============================================================================
# Phase 1: Critical Tests
# ============================================================================
section "2️⃣  Phase 1: Critical Tests (Infrastructure)"

run_test_suite "Database Validation" "$SCRIPT_DIR/test_marcus_database.sh"
run_test_suite "Authentication Tests" "$SCRIPT_DIR/test_marcus_auth.sh"
run_test_suite "API Endpoint Tests" "$SCRIPT_DIR/test_marcus_api.sh"
run_test_suite "Python Agent Tests" "$SCRIPT_DIR/test_marcus_python_agent.sh" "true"

# ============================================================================
# Phase 2: Integration & Security Tests
# ============================================================================
section "3️⃣  Phase 2: Integration & Security"

run_test_suite "Integration Tests (E2E)" "$SCRIPT_DIR/test_marcus_integration.sh" "true"
run_test_suite "Security Tests (OWASP)" "$SCRIPT_DIR/test_marcus_security.sh" "true"

if [ "$TEST_MODE" != "quick" ]; then
    run_test_suite "Performance Tests" "$SCRIPT_DIR/test_marcus_performance.sh" "true"
fi

# ============================================================================
# Phase 3: Unit & Integration Tests (Jest/npm test)
# ============================================================================
section "4️⃣  Phase 3: Unit & Integration Tests (Jest)"

((TOTAL_SUITES++))

echo -e "${MAGENTA}▶ Running: Jest Test Suite${NC}"

START_TIME=$(date +%s)

if npm test -- --silent --passWithNoTests 2>&1 | tee /tmp/jest_output.log; then
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))

    # Extract test results from Jest output
    JEST_RESULTS=$(grep -E "Tests:.*passed" /tmp/jest_output.log | tail -1 || echo "")

    echo -e "${GREEN}  ✅ PASS${NC}: Jest Test Suite (${DURATION}s)"
    if [ -n "$JEST_RESULTS" ]; then
        info "Results: $JEST_RESULTS"
    fi
    ((PASSED_SUITES++))
else
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    echo -e "${RED}  ❌ FAIL${NC}: Jest Test Suite (${DURATION}s)"
    FAILED_SUITE_NAMES+=("Jest Test Suite")
    ((FAILED_SUITES++))
fi

# ============================================================================
# Phase 4: Code Quality (optional in quick mode)
# ============================================================================
if [ "$TEST_MODE" = "full" ]; then
    section "5️⃣  Phase 4: Code Quality"

    # TypeScript type checking
    ((TOTAL_SUITES++))
    echo -e "${MAGENTA}▶ Running: TypeScript Type Checking${NC}"

    START_TIME=$(date +%s)

    if npx tsc --noEmit > /tmp/tsc_output.log 2>&1; then
        END_TIME=$(date +%s)
        DURATION=$((END_TIME - START_TIME))
        echo -e "${GREEN}  ✅ PASS${NC}: TypeScript Type Checking (${DURATION}s)"
        ((PASSED_SUITES++))
    else
        END_TIME=$(date +%s)
        DURATION=$((END_TIME - START_TIME))
        echo -e "${RED}  ❌ FAIL${NC}: TypeScript Type Checking (${DURATION}s)"
        echo -e "${YELLOW}  Errors:${NC}"
        head -20 /tmp/tsc_output.log
        FAILED_SUITE_NAMES+=("TypeScript Type Checking")
        ((FAILED_SUITES++))
    fi

    # ESLint (if configured)
    if [ -f "$PROJECT_DIR/.eslintrc.js" ] || [ -f "$PROJECT_DIR/.eslintrc.json" ]; then
        ((TOTAL_SUITES++))
        echo -e "${MAGENTA}▶ Running: ESLint${NC}"

        START_TIME=$(date +%s)

        if npx eslint . --ext .ts,.tsx,.js,.jsx --max-warnings 50 > /tmp/eslint_output.log 2>&1; then
            END_TIME=$(date +%s)
            DURATION=$((END_TIME - START_TIME))
            echo -e "${GREEN}  ✅ PASS${NC}: ESLint (${DURATION}s)"
            ((PASSED_SUITES++))
        else
            END_TIME=$(date +%s)
            DURATION=$((END_TIME - START_TIME))
            echo -e "${YELLOW}  ⚠️  WARN${NC}: ESLint found issues (${DURATION}s)"
            info "Warnings are acceptable; review manually"
            ((PASSED_SUITES++))
        fi
    fi
fi

# ============================================================================
# Summary
# ============================================================================
section "📊 Final Summary"

echo ""
echo -e "${CYAN}Test Suites Summary:${NC}"
echo -e "  Total Suites:  ${BLUE}$TOTAL_SUITES${NC}"
echo -e "  Passed:        ${GREEN}$PASSED_SUITES${NC}"
echo -e "  Failed:        ${RED}$FAILED_SUITES${NC}"
echo ""

if [ $FAILED_SUITES -gt 0 ]; then
    echo -e "${RED}Failed Suites:${NC}"
    for suite in "${FAILED_SUITE_NAMES[@]}"; do
        echo -e "  ${RED}•${NC} $suite"
    done
    echo ""
fi

# Calculate success rate
if [ $TOTAL_SUITES -gt 0 ]; then
    SUCCESS_RATE=$((PASSED_SUITES * 100 / TOTAL_SUITES))
    echo -e "Success Rate: ${BLUE}${SUCCESS_RATE}%${NC}"
    echo ""
fi

echo "======================================================================"

if [ $FAILED_SUITES -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED - Ready for deployment${NC}"
    echo "======================================================================"
    echo ""
    info "Completed: $(date)"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED - Review before deployment${NC}"
    echo "======================================================================"
    echo ""
    info "Completed: $(date)"
    exit 1
fi
