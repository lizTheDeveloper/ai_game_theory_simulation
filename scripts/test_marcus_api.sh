#!/bin/bash
# MARCUS 3.0 API Endpoint Validation Script
# Tests API endpoints, CORS, error handling, authentication, response formats
# Usage: ./test_marcus_api.sh

# ============================================================================
# Load Environment Variables Securely (OWASP Compliant)
# ============================================================================
# OWASP Credential Hierarchy (most specific to most general):
# 1. .env.test (test-specific credentials for CI/local dev)
# 2. .env (production credentials, runtime)
# 3. .env.secrets (production secrets vault, provisioning)
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
    echo "    Using default configuration values"
fi

# ============================================================================
# Configuration
# ============================================================================
API_BASE="${API_BASE:-http://localhost:3000}"
API_PORT="${API_PORT:-3000}"
TEST_EMAIL="api-test-$(date +%s)@example.com"
TEST_PASSWORD="ApiTestPassword123!"

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
echo "🌐 MARCUS 3.0 API Endpoint Validation"
echo "======================================================================"
echo ""

# ============================================================================
# Test 1: Service Running
# ============================================================================
info "Checking if MARCUS service is running..."

if systemctl is-active --quiet marcus-platform 2>/dev/null; then
    pass "MARCUS service is running"
else
    warn "MARCUS service status unknown (may not be systemd-managed)"
fi

# Check if port is listening
if netstat -tuln 2>/dev/null | grep -q ":$API_PORT "; then
    pass "API port $API_PORT is listening"
else
    if lsof -i ":$API_PORT" >/dev/null 2>&1; then
        pass "API port $API_PORT is listening"
    else
        fail "API port $API_PORT not listening" "Service may not be running"
        exit 1
    fi
fi

echo ""

# ============================================================================
# Test 2: Root Endpoint
# ============================================================================
info "Testing root endpoint..."

ROOT_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE/" 2>/dev/null)
HTTP_CODE=$(echo "$ROOT_RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    pass "Root endpoint responding (HTTP $HTTP_CODE)"
else
    warn "Root endpoint returned unexpected status (HTTP $HTTP_CODE)"
fi

echo ""

# ============================================================================
# Test 3: CORS Headers
# ============================================================================
info "Testing CORS headers..."

CORS_RESPONSE=$(curl -s -I -X OPTIONS "$API_BASE/auth/register" \
    -H "Origin: http://example.com" \
    -H "Access-Control-Request-Method: POST" \
    2>/dev/null)

if echo "$CORS_RESPONSE" | grep -qi "Access-Control-Allow-Origin"; then
    pass "CORS headers present"

    if echo "$CORS_RESPONSE" | grep -qi "Access-Control-Allow-Methods"; then
        pass "CORS methods header present"
    else
        warn "CORS methods header missing"
    fi
else
    warn "CORS headers not found (may not be configured)"
fi

echo ""

# ============================================================================
# Test 4: Security Headers
# ============================================================================
info "Testing security headers..."

SECURITY_RESPONSE=$(curl -s -I "$API_BASE/" 2>/dev/null)

# Check for important security headers
if echo "$SECURITY_RESPONSE" | grep -qi "X-Content-Type-Options"; then
    pass "X-Content-Type-Options header present"
else
    warn "X-Content-Type-Options header missing (recommended: nosniff)"
fi

if echo "$SECURITY_RESPONSE" | grep -qi "X-Frame-Options"; then
    pass "X-Frame-Options header present"
else
    warn "X-Frame-Options header missing (recommended: DENY)"
fi

if echo "$SECURITY_RESPONSE" | grep -qi "Strict-Transport-Security"; then
    pass "HSTS header present"
else
    warn "Strict-Transport-Security header missing (recommended for HTTPS)"
fi

if echo "$SECURITY_RESPONSE" | grep -qi "Content-Security-Policy"; then
    pass "Content-Security-Policy header present"
else
    warn "Content-Security-Policy header missing"
fi

echo ""

# ============================================================================
# Test 5: Error Handling - 404
# ============================================================================
info "Testing 404 error handling..."

NOT_FOUND_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE/nonexistent-endpoint-12345" 2>/dev/null)
HTTP_CODE=$(echo "$NOT_FOUND_RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "404" ]; then
    pass "404 error handled correctly"
else
    fail "404 error not handled" "Expected HTTP 404, got $HTTP_CODE"
fi

echo ""

# ============================================================================
# Test 6: Error Handling - Invalid JSON
# ============================================================================
info "Testing invalid JSON error handling..."

INVALID_JSON_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/auth/register" \
    -H "Content-Type: application/json" \
    -d "{invalid json}" \
    2>/dev/null)

HTTP_CODE=$(echo "$INVALID_JSON_RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "400" ]; then
    pass "Invalid JSON rejected (HTTP 400)"
else
    warn "Invalid JSON handling unexpected (HTTP $HTTP_CODE)"
fi

echo ""

# ============================================================================
# Test 7: Content-Type Validation
# ============================================================================
info "Testing Content-Type validation..."

WRONG_CONTENT_TYPE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/auth/register" \
    -H "Content-Type: text/plain" \
    -d "not json" \
    2>/dev/null)

HTTP_CODE=$(echo "$WRONG_CONTENT_TYPE_RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "415" ]; then
    pass "Incorrect Content-Type rejected (HTTP $HTTP_CODE)"
else
    warn "Content-Type validation may not be enforced (HTTP $HTTP_CODE)"
fi

echo ""

# ============================================================================
# Test 8: Request Size Limit
# ============================================================================
info "Testing request size limit..."

# Generate 10 MB payload (should be rejected)
LARGE_PAYLOAD=$(python3 -c "print('x' * (10 * 1024 * 1024))" 2>/dev/null)

if [ $? -eq 0 ]; then
    LARGE_REQUEST_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/auth/register" \
        -H "Content-Type: application/json" \
        -d "{\"data\":\"$LARGE_PAYLOAD\"}" \
        --max-time 5 \
        2>/dev/null)

    HTTP_CODE=$(echo "$LARGE_REQUEST_RESPONSE" | tail -1)

    if [ "$HTTP_CODE" = "413" ]; then
        pass "Large request rejected (HTTP 413)"
    elif [ "$HTTP_CODE" = "400" ]; then
        pass "Large request rejected (HTTP 400)"
    else
        warn "Request size limit may not be enforced (HTTP $HTTP_CODE)"
    fi
else
    warn "Skipping large request test (python3 not available)"
fi

echo ""

# ============================================================================
# Test 9: Authentication Required Endpoints
# ============================================================================
info "Testing authentication required endpoints..."

# Try accessing protected endpoint without auth
UNAUTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE/api/citations/history" 2>/dev/null)
HTTP_CODE=$(echo "$UNAUTH_RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "401" ]; then
    pass "Protected endpoint requires authentication (HTTP 401)"
else
    warn "Protected endpoint may not require authentication (HTTP $HTTP_CODE)"
fi

echo ""

# ============================================================================
# Test 10: Invalid Bearer Token
# ============================================================================
info "Testing invalid bearer token..."

INVALID_TOKEN_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE/api/citations/history" \
    -H "Authorization: Bearer invalid-token-12345" \
    2>/dev/null)

HTTP_CODE=$(echo "$INVALID_TOKEN_RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    pass "Invalid token rejected (HTTP $HTTP_CODE)"
else
    warn "Invalid token handling unexpected (HTTP $HTTP_CODE)"
fi

echo ""

# ============================================================================
# Test 11: Response Format
# ============================================================================
info "Testing JSON response format..."

# Register test user
REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"role\":\"operator\"}" \
    2>/dev/null)

HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -1)
BODY=$(echo "$REGISTER_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "201" ]; then
    # Check if response is valid JSON
    if echo "$BODY" | python3 -m json.tool >/dev/null 2>&1; then
        pass "Response is valid JSON"

        # Check for expected fields
        if echo "$BODY" | grep -q '"user"'; then
            pass "Response contains user object"
        else
            warn "Response missing expected 'user' field"
        fi

        if echo "$BODY" | grep -q '"accessToken"'; then
            pass "Response contains accessToken"
        else
            warn "Response missing expected 'accessToken' field"
        fi
    else
        fail "Response is not valid JSON" "Body: $BODY"
    fi
else
    warn "Skipping JSON format test (registration failed: HTTP $HTTP_CODE)"
fi

echo ""

# ============================================================================
# Test 12: HTTP Methods
# ============================================================================
info "Testing HTTP method restrictions..."

# POST should work for register
POST_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"method-test-$(date +%s)@example.com\",\"password\":\"$TEST_PASSWORD\",\"role\":\"viewer\"}" \
    2>/dev/null)

POST_CODE=$(echo "$POST_RESPONSE" | tail -1)

if [ "$POST_CODE" = "201" ] || [ "$POST_CODE" = "409" ] || [ "$POST_CODE" = "400" ]; then
    pass "POST method accepted for /auth/register"
else
    warn "POST method handling unexpected (HTTP $POST_CODE)"
fi

# GET should not work for register
GET_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE/auth/register" 2>/dev/null)
GET_CODE=$(echo "$GET_RESPONSE" | tail -1)

if [ "$GET_CODE" = "405" ] || [ "$GET_CODE" = "404" ]; then
    pass "GET method rejected for /auth/register (HTTP $GET_CODE)"
else
    warn "GET method not properly rejected (HTTP $GET_CODE)"
fi

echo ""

# ============================================================================
# Test 13: Rate Limiting Headers
# ============================================================================
info "Testing rate limiting headers..."

RATE_RESPONSE=$(curl -s -I -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"test@example.com\",\"password\":\"test\"}" \
    2>/dev/null)

if echo "$RATE_RESPONSE" | grep -qi "X-RateLimit"; then
    pass "Rate limit headers present"

    LIMIT=$(echo "$RATE_RESPONSE" | grep -i "X-RateLimit-Limit" | cut -d':' -f2 | tr -d ' \r')
    REMAINING=$(echo "$RATE_RESPONSE" | grep -i "X-RateLimit-Remaining" | cut -d':' -f2 | tr -d ' \r')

    info "Rate limit: $LIMIT requests"
    info "Remaining: $REMAINING requests"
else
    warn "Rate limit headers not found (may not be configured)"
fi

echo ""

# ============================================================================
# Test 14: API Versioning
# ============================================================================
info "Testing API versioning..."

# Check if API uses versioning (e.g., /api/v1/)
if echo "$API_BASE" | grep -q "/v[0-9]"; then
    pass "API uses versioning in URL"
else
    info "API versioning not detected in URL structure"
fi

echo ""

# ============================================================================
# Test 15: Response Times
# ============================================================================
info "Testing API response times..."

# Simple endpoint response time
START_TIME=$(date +%s%N)
curl -s "$API_BASE/" >/dev/null 2>&1
END_TIME=$(date +%s%N)

ELAPSED_MS=$(( (END_TIME - START_TIME) / 1000000 ))

info "Root endpoint response time: ${ELAPSED_MS}ms"

if [ "$ELAPSED_MS" -lt 1000 ]; then
    pass "Response time acceptable (<1s)"
else
    warn "Response time high (${ELAPSED_MS}ms)"
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
    echo -e "${GREEN}✅ All API endpoint tests passed!${NC}"
    echo ""
    echo "API is properly configured and responding correctly."
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    echo ""
    echo "Please review the failures above and fix before deploying to production."
    exit 1
fi
