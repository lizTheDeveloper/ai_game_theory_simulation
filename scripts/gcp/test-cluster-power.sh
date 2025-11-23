#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_ID="project-6d921a00-c010-437c-990"
CLUSTER_NAME="marcus-platform"
REGION="us-central1"
NAMESPACE="marcus-platform"

echo "════════════════════════════════════════════════════════════════"
echo "   Cluster Power Management Test Suite"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Test tracking
TESTS_PASSED=0
TESTS_FAILED=0

function run_test() {
    local test_name="$1"
    local command="$2"
    local expected="$3"

    echo -n "  Testing: $test_name... "

    result=$(eval "$command" 2>/dev/null || echo "FAILED")

    if [[ "$result" == *"$expected"* ]]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "    Expected: $expected"
        echo "    Got: $result"
        ((TESTS_FAILED++))
        return 1
    fi
}

function test_current_state() {
    echo -e "${BLUE}📊 Testing Current State...${NC}"

    # Test 1: Check deployment replicas
    run_test "Deployments scaled down" \
        "kubectl get deployment orchestrator -n $NAMESPACE -o jsonpath='{.spec.replicas}'" \
        "0"

    # Test 2: Check logging configuration
    run_test "Logging disabled/reduced" \
        "gcloud container clusters describe $CLUSTER_NAME --zone $REGION --format='value(loggingConfig.componentConfig.enableComponents[])' | wc -l" \
        "0"

    # Test 3: Check node pool configuration
    run_test "Node pool minimum set to 1" \
        "gcloud container node-pools describe default-pool --cluster=$CLUSTER_NAME --zone=$REGION --format='value(autoscaling.minNodeCount)'" \
        "1"

    # Test 4: Check running pods (should be minimal)
    WORKLOAD_PODS=$(kubectl get pods -n $NAMESPACE --field-selector=status.phase=Running \
        -o custom-columns=NAME:.metadata.name --no-headers | \
        grep -v "postgres\|redis" | wc -l)

    if [ "$WORKLOAD_PODS" -eq 0 ]; then
        echo -e "  Testing: Workload pods at zero... ${GREEN}✓ PASSED${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "  Testing: Workload pods at zero... ${RED}✗ FAILED${NC} (Found $WORKLOAD_PODS running)"
        ((TESTS_FAILED++))
    fi

    echo ""
}

function test_power_cycle() {
    echo -e "${BLUE}🔄 Testing Power Cycle (ON -> OFF -> ON)...${NC}"
    echo "  This will take 2-3 minutes..."
    echo ""

    # Get initial state
    INITIAL_STATE=$(kubectl get configmap cluster-power-state -n $NAMESPACE -o jsonpath='{.data.state}' 2>/dev/null || echo "unknown")
    echo "  Initial state: $INITIAL_STATE"

    # Test turning ON
    echo -e "  ${YELLOW}Testing: Power ON...${NC}"
    timeout 120 bash -c "./scripts/gcp/cluster-power.sh on 2>&1 | grep -q 'Cluster is now in NORMAL mode'" && {
        echo -e "  ${GREEN}✓ Power ON completed${NC}"
        ((TESTS_PASSED++))
    } || {
        echo -e "  ${RED}✗ Power ON failed or timed out${NC}"
        ((TESTS_FAILED++))
    }

    # Wait for pods to come up
    echo "  Waiting 30s for pods to start..."
    sleep 30

    # Verify ON state
    ORCHESTRATOR_REPLICAS=$(kubectl get deployment orchestrator -n $NAMESPACE -o jsonpath='{.spec.replicas}')
    if [ "$ORCHESTRATOR_REPLICAS" -gt 0 ]; then
        echo -e "  ${GREEN}✓ Services scaled up (orchestrator: $ORCHESTRATOR_REPLICAS replicas)${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "  ${RED}✗ Services did not scale up${NC}"
        ((TESTS_FAILED++))
    fi

    # Test turning OFF
    echo -e "  ${YELLOW}Testing: Power OFF...${NC}"
    timeout 120 bash -c "./scripts/gcp/cluster-power.sh off 2>&1 | grep -q 'Cluster is now in HIBERNATE mode'" && {
        echo -e "  ${GREEN}✓ Power OFF completed${NC}"
        ((TESTS_PASSED++))
    } || {
        echo -e "  ${RED}✗ Power OFF failed or timed out${NC}"
        ((TESTS_FAILED++))
    }

    # Wait for scale down
    echo "  Waiting 30s for pods to terminate..."
    sleep 30

    # Verify OFF state
    ORCHESTRATOR_REPLICAS=$(kubectl get deployment orchestrator -n $NAMESPACE -o jsonpath='{.spec.replicas}')
    if [ "$ORCHESTRATOR_REPLICAS" -eq 0 ]; then
        echo -e "  ${GREEN}✓ Services scaled down${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "  ${RED}✗ Services did not scale down${NC}"
        ((TESTS_FAILED++))
    fi

    echo ""
}

function test_cost_verification() {
    echo -e "${BLUE}💰 Testing Cost Metrics...${NC}"

    # Get current node count
    NODE_COUNT=$(gcloud container clusters describe $CLUSTER_NAME --zone $REGION --format="value(currentNodeCount)" 2>/dev/null || echo "0")
    echo "  Current nodes: $NODE_COUNT"

    # Calculate estimated costs
    NODE_COST=$(echo "$NODE_COUNT * 1.5" | bc -l | cut -d. -f1-2)
    echo "  Estimated node cost: ~\$$NODE_COST/day"

    # Check if logging is disabled
    LOGGING_ENABLED=$(gcloud container clusters describe $CLUSTER_NAME --zone $REGION --format="value(loggingConfig.componentConfig.enableComponents[])" 2>/dev/null | wc -l)

    if [ "$LOGGING_ENABLED" -eq 0 ]; then
        echo -e "  ${GREEN}✓ Logging disabled (saving ~\$1.15/day)${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "  ${YELLOW}⚠ Logging still enabled (costing ~\$1.15/day)${NC}"
    fi

    # Estimate total daily cost
    if [ "$NODE_COUNT" -le 1 ] && [ "$LOGGING_ENABLED" -eq 0 ]; then
        echo -e "  ${GREEN}✓ Cluster in minimum cost mode (~\$1.50/day)${NC}"
        ((TESTS_PASSED++))
    else
        TOTAL_COST=$(echo "$NODE_COST + 1.15" | bc -l | cut -d. -f1-2)
        echo -e "  ${YELLOW}⚠ Cluster not fully optimized (~\$$TOTAL_COST/day)${NC}"
    fi

    echo ""
}

function test_database_persistence() {
    echo -e "${BLUE}🔒 Testing Database Persistence...${NC}"

    # Check PostgreSQL is still running
    PG_READY=$(kubectl exec -n $NAMESPACE postgres-primary-0 -- pg_isready 2>/dev/null || echo "not ready")
    if [[ "$PG_READY" == *"accepting connections"* ]]; then
        echo -e "  ${GREEN}✓ PostgreSQL is running and accepting connections${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "  ${RED}✗ PostgreSQL is not responding${NC}"
        ((TESTS_FAILED++))
    fi

    # Check Redis is still running
    REDIS_PING=$(kubectl exec -n $NAMESPACE redis-0 -- redis-cli ping 2>/dev/null || echo "failed")
    if [[ "$REDIS_PING" == "PONG" ]]; then
        echo -e "  ${GREEN}✓ Redis is running and responding${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "  ${RED}✗ Redis is not responding${NC}"
        ((TESTS_FAILED++))
    fi

    echo ""
}

function test_quick_checks() {
    echo -e "${BLUE}⚡ Running Quick Checks...${NC}"

    # Test script exists and is executable
    if [ -x "./scripts/gcp/cluster-power.sh" ]; then
        echo -e "  ${GREEN}✓ Power script is executable${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "  ${RED}✗ Power script not found or not executable${NC}"
        ((TESTS_FAILED++))
    fi

    # Test status command
    if ./scripts/gcp/cluster-power.sh status 2>&1 | grep -q "Deployment Status"; then
        echo -e "  ${GREEN}✓ Status command works${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "  ${RED}✗ Status command failed${NC}"
        ((TESTS_FAILED++))
    fi

    # Check KEDA is installed
    if kubectl get deployment -n keda keda-operator &>/dev/null; then
        echo -e "  ${GREEN}✓ KEDA is installed${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "  ${RED}✗ KEDA not found${NC}"
        ((TESTS_FAILED++))
    fi

    # Check log exclusions exist
    EXCLUSIONS=$(curl -s -H "Authorization: Bearer $(gcloud auth print-access-token)" \
        "https://logging.googleapis.com/v2/projects/${PROJECT_ID}/exclusions" | \
        grep -c '"name"' || echo "0")

    if [ "$EXCLUSIONS" -gt 0 ]; then
        echo -e "  ${GREEN}✓ Log exclusions configured ($EXCLUSIONS filters)${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "  ${YELLOW}⚠ No log exclusions found${NC}"
    fi

    echo ""
}

# Main test execution
echo "Running test suite..."
echo ""

# Run tests based on arguments
if [ "$1" == "quick" ]; then
    test_quick_checks
    test_current_state
elif [ "$1" == "full" ]; then
    test_quick_checks
    test_current_state
    test_database_persistence
    test_cost_verification
    test_power_cycle  # This takes time
else
    # Default: run all except power cycle
    test_quick_checks
    test_current_state
    test_database_persistence
    test_cost_verification

    echo -e "${YELLOW}Note: Skipping power cycle test (takes 3-5 minutes)${NC}"
    echo "      Run with 'full' argument to include: $0 full"
fi

# Summary
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "   Test Results Summary"
echo "════════════════════════════════════════════════════════════════"
echo -e "  ${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "  ${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed! Your cluster power management is working correctly.${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}⚠️  Some tests failed. Review the output above for details.${NC}"
    exit 1
fi