#!/bin/bash
# Test script to verify ingress rate limiting is enforced
#
# Usage:
#   ./test-rate-limiting.sh <ingress-url> [requests-per-second]
#
# Example:
#   ./test-rate-limiting.sh https://marcus.example.com 5
#   ./test-rate-limiting.sh http://localhost:3000 10

set -e

# Configuration
INGRESS_URL=${1:-"http://localhost:3000"}
RPS=${2:-5}  # Requests per second
DURATION=${3:-60}  # Test duration in seconds
TOTAL_REQUESTS=$((RPS * DURATION))

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================"
echo "MARCUS Platform Rate Limiting Test"
echo "========================================"
echo "Target: $INGRESS_URL"
echo "Rate: $RPS req/sec"
echo "Duration: $DURATION seconds"
echo "Total requests: $TOTAL_REQUESTS"
echo "========================================"
echo ""

# Create results directory
RESULTS_DIR="logs/rate-limit-tests"
mkdir -p $RESULTS_DIR
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RESULTS_FILE="$RESULTS_DIR/test_${TIMESTAMP}.log"

echo "Results will be saved to: $RESULTS_FILE"
echo ""

# Counters
SUCCESS_COUNT=0
RATE_LIMITED_COUNT=0
ERROR_COUNT=0
START_TIME=$(date +%s)

# Function to make request and track result
make_request() {
  local request_num=$1
  local response=$(curl -s -w "\n%{http_code}" -X GET "$INGRESS_URL/health" 2>&1)
  local http_code=$(echo "$response" | tail -n1)
  local timestamp=$(date +%s)
  local elapsed=$((timestamp - START_TIME))

  case $http_code in
    200)
      SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
      echo -e "${GREEN}[${elapsed}s] Request $request_num: HTTP $http_code - SUCCESS${NC}" | tee -a $RESULTS_FILE
      ;;
    429)
      RATE_LIMITED_COUNT=$((RATE_LIMITED_COUNT + 1))
      echo -e "${YELLOW}[${elapsed}s] Request $request_num: HTTP $http_code - RATE LIMITED${NC}" | tee -a $RESULTS_FILE
      ;;
    *)
      ERROR_COUNT=$((ERROR_COUNT + 1))
      echo -e "${RED}[${elapsed}s] Request $request_num: HTTP $http_code - ERROR${NC}" | tee -a $RESULTS_FILE
      ;;
  esac
}

# Run load test
echo "Starting load test..."
echo ""

for i in $(seq 1 $TOTAL_REQUESTS); do
  make_request $i &

  # Throttle to maintain target RPS
  if [ $((i % RPS)) -eq 0 ]; then
    wait  # Wait for current batch to complete
    sleep 1  # Wait 1 second before next batch
  fi
done

# Wait for all background requests to complete
wait

END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))

echo ""
echo "========================================"
echo "Test Results"
echo "========================================"
echo "Duration: ${ELAPSED}s (expected ${DURATION}s)"
echo "Total requests: $TOTAL_REQUESTS"
echo -e "${GREEN}Success (200): $SUCCESS_COUNT${NC}"
echo -e "${YELLOW}Rate limited (429): $RATE_LIMITED_COUNT${NC}"
echo -e "${RED}Errors (other): $ERROR_COUNT${NC}"
echo ""

# Calculate percentages
SUCCESS_PCT=$(awk "BEGIN {printf \"%.2f\", ($SUCCESS_COUNT / $TOTAL_REQUESTS) * 100}")
RATE_LIMITED_PCT=$(awk "BEGIN {printf \"%.2f\", ($RATE_LIMITED_COUNT / $TOTAL_REQUESTS) * 100}")
ERROR_PCT=$(awk "BEGIN {printf \"%.2f\", ($ERROR_COUNT / $TOTAL_REQUESTS) * 100}")

echo "Success rate: ${SUCCESS_PCT}%"
echo "Rate limited: ${RATE_LIMITED_PCT}%"
echo "Error rate: ${ERROR_PCT}%"
echo ""

# Expected results analysis
echo "========================================"
echo "Analysis"
echo "========================================"

# Expected: ~100 req/min = ~1.67 req/sec allowed
# If we send 5 req/sec, we expect ~33% success, ~67% rate limited
EXPECTED_ALLOWED_PER_MIN=100
EXPECTED_ALLOWED_PER_SEC=$(awk "BEGIN {printf \"%.2f\", $EXPECTED_ALLOWED_PER_MIN / 60}")
EXPECTED_SUCCESS_PCT=$(awk "BEGIN {printf \"%.2f\", ($EXPECTED_ALLOWED_PER_SEC / $RPS) * 100}")

echo "Expected allowed rate: ~${EXPECTED_ALLOWED_PER_MIN}/min (~${EXPECTED_ALLOWED_PER_SEC}/sec)"
echo "Your sending rate: ${RPS}/sec"

if (( $(echo "$RPS <= $EXPECTED_ALLOWED_PER_SEC" | bc -l) )); then
  echo -e "${GREEN}✓ Sending rate within limits - expect mostly 200s${NC}"
  if (( $(echo "$SUCCESS_PCT >= 90" | bc -l) )); then
    echo -e "${GREEN}✓ PASS: Success rate ${SUCCESS_PCT}% >= 90% (rate limiting NOT triggered as expected)${NC}"
  else
    echo -e "${RED}✗ FAIL: Success rate ${SUCCESS_PCT}% < 90% (unexpected rate limiting)${NC}"
  fi
else
  echo -e "${YELLOW}⚠ Sending rate exceeds limits - expect rate limiting${NC}"
  echo -e "Expected success rate: ~${EXPECTED_SUCCESS_PCT}%"

  if (( $(echo "$RATE_LIMITED_PCT >= 30" | bc -l) )); then
    echo -e "${GREEN}✓ PASS: Rate limiting is working (${RATE_LIMITED_PCT}% requests limited)${NC}"
  else
    echo -e "${RED}✗ FAIL: Rate limiting not working properly (only ${RATE_LIMITED_PCT}% limited)${NC}"
  fi
fi

# Check error rate
if (( $(echo "$ERROR_PCT <= 5" | bc -l) )); then
  echo -e "${GREEN}✓ PASS: Error rate ${ERROR_PCT}% <= 5%${NC}"
else
  echo -e "${RED}✗ FAIL: Error rate ${ERROR_PCT}% > 5% (unexpected errors)${NC}"
fi

echo ""
echo "Full results saved to: $RESULTS_FILE"
echo "========================================"

# Burst test (optional)
echo ""
read -p "Run burst test? (sends 150 requests immediately to test burst capacity) [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo ""
  echo "========================================"
  echo "Burst Test"
  echo "========================================"
  echo "Sending 150 requests immediately..."
  echo ""

  BURST_RESULTS_FILE="$RESULTS_DIR/burst_test_${TIMESTAMP}.log"
  BURST_SUCCESS=0
  BURST_LIMITED=0
  BURST_ERROR=0

  for i in $(seq 1 150); do
    response=$(curl -s -w "\n%{http_code}" -X GET "$INGRESS_URL/health" 2>&1)
    http_code=$(echo "$response" | tail -n1)

    case $http_code in
      200) BURST_SUCCESS=$((BURST_SUCCESS + 1)) ;;
      429) BURST_LIMITED=$((BURST_LIMITED + 1)) ;;
      *) BURST_ERROR=$((BURST_ERROR + 1)) ;;
    esac

    echo "Request $i: HTTP $http_code" >> $BURST_RESULTS_FILE
  done

  echo "Burst test complete!"
  echo -e "${GREEN}Success (200): $BURST_SUCCESS${NC}"
  echo -e "${YELLOW}Rate limited (429): $BURST_LIMITED${NC}"
  echo -e "${RED}Errors (other): $BURST_ERROR${NC}"
  echo ""

  # Expected: 150 burst capacity, so all 150 should succeed
  if [ $BURST_SUCCESS -ge 140 ]; then
    echo -e "${GREEN}✓ PASS: Burst capacity working (${BURST_SUCCESS}/150 succeeded)${NC}"
  else
    echo -e "${YELLOW}⚠ WARNING: Burst capacity may be lower than expected (${BURST_SUCCESS}/150 succeeded)${NC}"
  fi

  echo "Burst results saved to: $BURST_RESULTS_FILE"
fi

echo ""
echo "Test complete!"
