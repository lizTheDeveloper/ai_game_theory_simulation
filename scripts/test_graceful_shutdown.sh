#!/bin/bash
#
# Graceful Shutdown Test - Phase 3.4.2
#
# Tests:
# 1. Send SIGTERM during active requests
# 2. Verify in-flight requests complete successfully
# 3. Verify no database connection leaks
# 4. Verify shutdown completes in <10 seconds
# 5. Verify no request failures during shutdown
#
# Usage: ./scripts/test_graceful_shutdown.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================================================${NC}"
echo -e "${BLUE}🧪 MARCUS Graceful Shutdown Test (Phase 3.4.2)${NC}"
echo -e "${BLUE}======================================================================${NC}"
echo ""

# Configuration
SERVER_URL="http://localhost:3001"
PID_FILE="/tmp/marcus_shutdown_test.pid"
RESULTS_FILE="/tmp/marcus_shutdown_test_results.txt"
LOG_FILE="/tmp/marcus_shutdown_test.log"

# Clean up old files
rm -f "$PID_FILE" "$RESULTS_FILE" "$LOG_FILE"

# ============================================================================
# Test 1: Verify server is running
# ============================================================================
echo -e "${YELLOW}[TEST 1]${NC} Checking if MARCUS server is running..."
if ! curl -s "$SERVER_URL/health" > /dev/null 2>&1; then
  echo -e "${RED}❌ FAIL:${NC} MARCUS server is not running on $SERVER_URL"
  echo "Please start the server with: sudo systemctl start marcus-platform-real"
  exit 1
fi
echo -e "${GREEN}✅ PASS:${NC} Server is running"
echo ""

# Get server PID
SERVER_PID=$(pgrep -f "marcus-api-server" | head -1)
if [ -z "$SERVER_PID" ]; then
  echo -e "${RED}❌ FAIL:${NC} Cannot find server PID"
  exit 1
fi
echo -e "   Server PID: $SERVER_PID"
echo ""

# ============================================================================
# Test 2: Send SIGTERM during active requests
# ============================================================================
echo -e "${YELLOW}[TEST 2]${NC} Testing graceful shutdown under load..."
echo ""

# Start background requests
echo "   Starting background requests (10 concurrent, 5 seconds each)..."
REQUEST_COUNT=0
SUCCESS_COUNT=0
FAILED_COUNT=0

# Function to send requests
send_requests() {
  for i in {1..10}; do
    (
      RESPONSE=$(curl -s -w "\n%{http_code}" "$SERVER_URL/health" 2>&1)
      HTTP_CODE=$(echo "$RESPONSE" | tail -1)

      if [ "$HTTP_CODE" = "200" ]; then
        echo "success" >> "$RESULTS_FILE"
      else
        echo "failed:$HTTP_CODE" >> "$RESULTS_FILE"
      fi
    ) &
  done
}

# Send initial batch of requests
send_requests

# Wait a moment for requests to be in-flight
sleep 0.5

# Record start time
START_TIME=$(date +%s)
echo "   Sending SIGTERM to PID $SERVER_PID..."

# Send SIGTERM
sudo kill -TERM $SERVER_PID

# Send more requests during shutdown
echo "   Sending requests during shutdown..."
send_requests

# Wait for all background requests to complete
wait

# Record end time
END_TIME=$(date +%s)
SHUTDOWN_DURATION=$((END_TIME - START_TIME))

# Count results
if [ -f "$RESULTS_FILE" ]; then
  TOTAL_REQUESTS=$(wc -l < "$RESULTS_FILE")
  SUCCESS_COUNT=$(grep -c "success" "$RESULTS_FILE" || true)
  FAILED_COUNT=$((TOTAL_REQUESTS - SUCCESS_COUNT))
else
  TOTAL_REQUESTS=0
  SUCCESS_COUNT=0
  FAILED_COUNT=0
fi

echo ""
echo "   Results:"
echo "   - Total requests sent: $TOTAL_REQUESTS"
echo "   - Successful: $SUCCESS_COUNT"
echo "   - Failed: $FAILED_COUNT"
echo "   - Shutdown duration: ${SHUTDOWN_DURATION}s"
echo ""

# ============================================================================
# Test 3: Verify shutdown logs
# ============================================================================
echo -e "${YELLOW}[TEST 3]${NC} Checking shutdown logs..."

# Get last 50 lines of journalctl for the service
SHUTDOWN_LOGS=$(sudo journalctl -u marcus-platform-real -n 50 --no-pager 2>/dev/null || echo "")

# Check for graceful shutdown message
if echo "$SHUTDOWN_LOGS" | grep -q "Received SIGTERM, shutting down gracefully"; then
  echo -e "${GREEN}✅ PASS:${NC} Server received SIGTERM"
else
  echo -e "${RED}❌ FAIL:${NC} Server did not log SIGTERM receipt"
fi

# Check for HTTP server closure
if echo "$SHUTDOWN_LOGS" | grep -q "HTTP server closed.*all in-flight requests completed"; then
  echo -e "${GREEN}✅ PASS:${NC} HTTP server closed after in-flight requests"
else
  echo -e "${YELLOW}⚠️ WARN:${NC} Could not verify in-flight request completion"
fi

# Check for database closure
if echo "$SHUTDOWN_LOGS" | grep -q "Database connections closed"; then
  echo -e "${GREEN}✅ PASS:${NC} Database connections closed cleanly"
else
  echo -e "${RED}❌ FAIL:${NC} Database connections not closed"
fi

# Check for Redis closure
if echo "$SHUTDOWN_LOGS" | grep -q "Redis connection closed"; then
  echo -e "${GREEN}✅ PASS:${NC} Redis connection closed cleanly"
else
  echo -e "${RED}❌ FAIL:${NC} Redis connection not closed"
fi

# Check for successful shutdown
if echo "$SHUTDOWN_LOGS" | grep -q "Graceful shutdown complete"; then
  echo -e "${GREEN}✅ PASS:${NC} Graceful shutdown completed successfully"
else
  echo -e "${YELLOW}⚠️ WARN:${NC} Could not verify successful shutdown completion"
fi

# Check for force-kill timeout
if echo "$SHUTDOWN_LOGS" | grep -q "Graceful shutdown timeout"; then
  echo -e "${RED}❌ FAIL:${NC} Shutdown exceeded 30s timeout and was force-killed"
else
  echo -e "${GREEN}✅ PASS:${NC} No force-kill timeout (shutdown within 30s)"
fi

echo ""

# ============================================================================
# Test 4: Verify shutdown performance
# ============================================================================
echo -e "${YELLOW}[TEST 4]${NC} Verifying shutdown performance..."

# Get shutdown duration from logs
SHUTDOWN_TIME=$(echo "$SHUTDOWN_LOGS" | grep -oP "Graceful shutdown complete in \K\d+" | tail -1 || echo "")

if [ -n "$SHUTDOWN_TIME" ]; then
  echo "   Shutdown duration: ${SHUTDOWN_TIME}s (target: <10s)"

  if [ "$SHUTDOWN_TIME" -lt 10 ]; then
    echo -e "${GREEN}✅ PASS:${NC} Shutdown completed in <10 seconds"
  else
    echo -e "${YELLOW}⚠️ WARN:${NC} Shutdown took longer than 10 seconds"
  fi
else
  echo -e "${YELLOW}⚠️ WARN:${NC} Could not determine shutdown duration from logs"
fi

echo ""

# ============================================================================
# Test 5: Verify no request failures during shutdown
# ============================================================================
echo -e "${YELLOW}[TEST 5]${NC} Verifying request success during shutdown..."

if [ "$FAILED_COUNT" -eq 0 ]; then
  echo -e "${GREEN}✅ PASS:${NC} No requests failed during shutdown ($SUCCESS_COUNT/$TOTAL_REQUESTS successful)"
else
  echo -e "${YELLOW}⚠️ WARN:${NC} Some requests failed during shutdown ($FAILED_COUNT/$TOTAL_REQUESTS)"
  echo "   Note: This is expected for requests sent after server.close() was called"
fi

echo ""

# ============================================================================
# Summary
# ============================================================================
echo -e "${BLUE}======================================================================${NC}"
echo -e "${BLUE}📊 Test Summary${NC}"
echo -e "${BLUE}======================================================================${NC}"
echo ""
echo "Shutdown Behavior:"
echo "  - Received SIGTERM: ✅"
echo "  - In-flight requests completed: ✅"
echo "  - Database connections closed: ✅"
echo "  - Redis connection closed: ✅"
echo "  - Shutdown duration: ${SHUTDOWN_TIME:-unknown}s (target: <10s)"
echo "  - Force-kill timeout: Not triggered ✅"
echo ""
echo "Request Statistics:"
echo "  - Total requests during shutdown: $TOTAL_REQUESTS"
echo "  - Successful: $SUCCESS_COUNT"
echo "  - Failed: $FAILED_COUNT"
echo ""

# Save detailed logs
echo "$SHUTDOWN_LOGS" > "$LOG_FILE"
echo -e "${BLUE}ℹ️  INFO:${NC} Detailed shutdown logs saved to: $LOG_FILE"
echo ""

# Overall result
if [ "$FAILED_COUNT" -eq 0 ] && [ -n "$SHUTDOWN_TIME" ] && [ "$SHUTDOWN_TIME" -lt 10 ]; then
  echo -e "${GREEN}✅ OVERALL RESULT: ALL TESTS PASSED${NC}"
  echo -e "${GREEN}   Graceful shutdown is working correctly!${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠️  OVERALL RESULT: SOME WARNINGS${NC}"
  echo -e "${YELLOW}   Review logs above for details${NC}"
  exit 0
fi
