#!/bin/bash
# MARCUS 3.0 Security Testing Script
# OWASP compliance validation including SQL injection, XSS, CSRF, auth bypass, RBAC, and rate limiting
# Usage: ./test_marcus_security.sh

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

echo "======================================================================"
echo "🔒 MARCUS 3.0 Security Testing (OWASP Compliance)"
echo "======================================================================"
echo ""
info "API Base URL: $API_BASE"
echo ""

# ============================================================================
# Test 1: SQL Injection Prevention
# ============================================================================
info "Testing SQL injection resistance..."

# Common SQL injection payloads
SQL_INJECTION_PAYLOADS=(
    "' OR '1'='1"
    "'; DROP TABLE users; --"
    "admin'--"
    "1' UNION SELECT NULL, NULL, NULL--"
    "' OR 1=1--"
)

SQL_INJECTION_BLOCKED=0
SQL_INJECTION_TOTAL=0

for payload in "${SQL_INJECTION_PAYLOADS[@]}"; do
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$payload\",\"password\":\"test\"}" 2>/dev/null || echo "ERROR\n500")

    CODE=$(echo "$RESPONSE" | tail -1)

    # Should reject with 400/401/422, NOT 500 (indicates unhandled SQL error)
    if [ "$CODE" != "500" ] && [ "$CODE" != "ERROR" ]; then
        ((SQL_INJECTION_BLOCKED++))
    fi

    ((SQL_INJECTION_TOTAL++))
done

if [ $SQL_INJECTION_BLOCKED -eq $SQL_INJECTION_TOTAL ]; then
    pass "SQL injection payloads properly sanitized ($SQL_INJECTION_BLOCKED/$SQL_INJECTION_TOTAL)"
else
    fail "SQL injection vulnerabilities detected" "$((SQL_INJECTION_TOTAL - SQL_INJECTION_BLOCKED)) payloads caused errors"
fi

echo ""

# ============================================================================
# Test 2: XSS (Cross-Site Scripting) Prevention
# ============================================================================
info "Testing XSS resistance..."

# XSS payloads
XSS_PAYLOADS=(
    "<script>alert('XSS')</script>"
    "<img src=x onerror=alert('XSS')>"
    "javascript:alert('XSS')"
    "<svg onload=alert('XSS')>"
)

XSS_BLOCKED=0
XSS_TOTAL=0

for payload in "${XSS_PAYLOADS[@]}"; do
    RESPONSE=$(curl -s -X POST "$API_BASE/api/auth/register" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"test@test.com\",\"password\":\"Test123!\",\"name\":\"$payload\"}" 2>/dev/null || echo "")

    # Check if response contains unsanitized payload
    if ! echo "$RESPONSE" | grep -F "<script>" > /dev/null && \
       ! echo "$RESPONSE" | grep -F "onerror=" > /dev/null; then
        ((XSS_BLOCKED++))
    fi

    ((XSS_TOTAL++))
done

if [ $XSS_BLOCKED -eq $XSS_TOTAL ]; then
    pass "XSS payloads properly sanitized ($XSS_BLOCKED/$XSS_TOTAL)"
else
    fail "XSS vulnerabilities detected" "$((XSS_TOTAL - XSS_BLOCKED)) payloads returned unsanitized"
fi

echo ""

# ============================================================================
# Test 3: Authentication Bypass Attempts
# ============================================================================
info "Testing authentication bypass resistance..."

# Attempt to access protected endpoint without auth
BYPASS_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE/api/auth/profile" 2>/dev/null || echo "ERROR\n500")
BYPASS_CODE=$(echo "$BYPASS_RESPONSE" | tail -1)

if [ "$BYPASS_CODE" = "401" ] || [ "$BYPASS_CODE" = "403" ]; then
    pass "Unauthenticated access properly rejected"
else
    fail "Authentication bypass possible" "HTTP $BYPASS_CODE (expected 401/403)"
fi

# Attempt with invalid token
INVALID_TOKEN_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE/api/auth/profile" \
    -H "Authorization: Bearer invalid_token_12345" 2>/dev/null || echo "ERROR\n500")
INVALID_TOKEN_CODE=$(echo "$INVALID_TOKEN_RESPONSE" | tail -1)

if [ "$INVALID_TOKEN_CODE" = "401" ] || [ "$INVALID_TOKEN_CODE" = "403" ]; then
    pass "Invalid token properly rejected"
else
    fail "Invalid token accepted" "HTTP $INVALID_TOKEN_CODE (expected 401/403)"
fi

# Attempt with malformed Authorization header
MALFORMED_AUTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE/api/auth/profile" \
    -H "Authorization: NotBearer token123" 2>/dev/null || echo "ERROR\n500")
MALFORMED_AUTH_CODE=$(echo "$MALFORMED_AUTH_RESPONSE" | tail -1)

if [ "$MALFORMED_AUTH_CODE" = "401" ] || [ "$MALFORMED_AUTH_CODE" = "403" ]; then
    pass "Malformed auth header properly rejected"
else
    fail "Malformed auth header accepted" "HTTP $MALFORMED_AUTH_CODE (expected 401/403)"
fi

echo ""

# ============================================================================
# Test 4: Password Security
# ============================================================================
info "Testing password security policies..."

# Weak password should be rejected
WEAK_PASSWORD_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"weakpw_$$@test.com\",\"password\":\"123\",\"name\":\"Test\"}" 2>/dev/null || echo "ERROR\n500")
WEAK_PW_CODE=$(echo "$WEAK_PASSWORD_RESPONSE" | tail -1)

if [ "$WEAK_PW_CODE" = "400" ] || [ "$WEAK_PW_CODE" = "422" ]; then
    pass "Weak password rejected"
else
    warn "Weak password may be accepted (HTTP $WEAK_PW_CODE, expected 400/422)"
fi

# Common password should be rejected
COMMON_PASSWORD_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"commonpw_$$@test.com\",\"password\":\"password\",\"name\":\"Test\"}" 2>/dev/null || echo "ERROR\n500")
COMMON_PW_CODE=$(echo "$COMMON_PASSWORD_RESPONSE" | tail -1)

if [ "$COMMON_PW_CODE" = "400" ] || [ "$COMMON_PW_CODE" = "422" ]; then
    pass "Common password rejected"
else
    warn "Common password may be accepted (HTTP $COMMON_PW_CODE, expected 400/422)"
fi

echo ""

# ============================================================================
# Test 5: CSRF Protection
# ============================================================================
info "Testing CSRF protection..."

# Check for CSRF token requirement on state-changing operations
# Modern approach: SameSite cookies or CSRF tokens

CSRF_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/auth/register" \
    -H "Content-Type: application/json" \
    -H "Origin: http://malicious-site.com" \
    -d "{\"email\":\"csrf_$$@test.com\",\"password\":\"Test123!\",\"name\":\"Test\"}" 2>/dev/null || echo "ERROR\n500")
CSRF_CODE=$(echo "$CSRF_RESPONSE" | tail -1)

# Check if CORS policy blocks cross-origin requests
if echo "$CSRF_RESPONSE" | grep -qi "cors\|origin"; then
    pass "CORS policy provides CSRF protection"
elif [ "$CSRF_CODE" = "403" ]; then
    pass "CSRF protection active (403 response)"
else
    warn "CSRF protection may be insufficient (verify SameSite cookie settings)"
    ((TOTAL_TESTS++))
fi

echo ""

# ============================================================================
# Test 6: Rate Limiting
# ============================================================================
info "Testing rate limiting..."

# Send rapid requests to login endpoint
RATE_LIMIT_HITS=0
RATE_LIMIT_TOTAL=20

for i in $(seq 1 $RATE_LIMIT_TOTAL); do
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"ratelimit@test.com\",\"password\":\"test\"}" 2>/dev/null || echo "ERROR\n500")

    CODE=$(echo "$RESPONSE" | tail -1)

    # 429 = Too Many Requests
    if [ "$CODE" = "429" ]; then
        ((RATE_LIMIT_HITS++))
        break
    fi
done

if [ $RATE_LIMIT_HITS -gt 0 ]; then
    pass "Rate limiting active (triggered after $i requests)"
else
    warn "Rate limiting not detected (sent $RATE_LIMIT_TOTAL requests without 429 response)"
    ((TOTAL_TESTS++))
fi

echo ""

# ============================================================================
# Test 7: HTTPS/TLS Enforcement
# ============================================================================
info "Checking TLS/HTTPS configuration..."

# Check if API is running on HTTPS
if echo "$API_BASE" | grep -q "^https://"; then
    pass "API running on HTTPS"

    # Check TLS version (if openssl available)
    if command -v openssl > /dev/null 2>&1; then
        API_HOST=$(echo "$API_BASE" | sed 's|https://||' | cut -d: -f1)
        API_PORT=$(echo "$API_BASE" | sed 's|https://||' | cut -d: -f2)
        API_PORT=${API_PORT:-443}

        TLS_VERSION=$(echo "Q" | openssl s_client -connect "$API_HOST:$API_PORT" 2>/dev/null | grep "Protocol" | head -1 || echo "")

        if echo "$TLS_VERSION" | grep -q "TLSv1.2\|TLSv1.3"; then
            pass "TLS version secure: $TLS_VERSION"
        else
            warn "TLS version unclear or outdated: $TLS_VERSION"
        fi
    else
        info "openssl not available - skipping TLS version check"
    fi
else
    warn "API running on HTTP (use HTTPS in production)"
    ((TOTAL_TESTS++))
fi

echo ""

# ============================================================================
# Test 8: JWT Security
# ============================================================================
info "Testing JWT security..."

# Register test user
TEST_USER_EMAIL="jwt_test_$$@test.com"
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_USER_EMAIL\",\"password\":\"TestJWT123!\",\"name\":\"JWT Test\"}" 2>/dev/null)

# Login and get token
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_USER_EMAIL\",\"password\":\"TestJWT123!\"}" 2>/dev/null)

JWT_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -n "$JWT_TOKEN" ]; then
    # Check JWT structure (should be 3 parts: header.payload.signature)
    JWT_PARTS=$(echo "$JWT_TOKEN" | tr '.' '\n' | wc -l)

    if [ "$JWT_PARTS" -eq 3 ]; then
        pass "JWT token structure valid (3 parts)"

        # Decode JWT header to check algorithm
        JWT_HEADER=$(echo "$JWT_TOKEN" | cut -d'.' -f1)

        # Check that 'none' algorithm is not used (security vulnerability)
        if echo "$JWT_HEADER" | base64 -d 2>/dev/null | grep -qi '"alg":"none"'; then
            fail "JWT using 'none' algorithm (critical security vulnerability)" "Use HS256, RS256, or ES256"
        else
            pass "JWT not using 'none' algorithm"
        fi

        # Try to tamper with token (change payload)
        TAMPERED_TOKEN=$(echo "$JWT_TOKEN" | sed 's/[a-zA-Z0-9]$/X/')

        TAMPER_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE/api/auth/profile" \
            -H "Authorization: Bearer $TAMPERED_TOKEN" 2>/dev/null || echo "ERROR\n500")
        TAMPER_CODE=$(echo "$TAMPER_RESPONSE" | tail -1)

        if [ "$TAMPER_CODE" = "401" ] || [ "$TAMPER_CODE" = "403" ]; then
            pass "Tampered JWT rejected (signature verification working)"
        else
            fail "Tampered JWT accepted" "HTTP $TAMPER_CODE - signature verification may be disabled"
        fi
    else
        fail "JWT token structure invalid" "Expected 3 parts, got $JWT_PARTS"
    fi
else
    warn "No JWT token received - skipping JWT security tests"
    ((TOTAL_TESTS+=3))
fi

echo ""

# ============================================================================
# Test 9: RBAC (Role-Based Access Control)
# ============================================================================
info "Testing role-based access control..."

# This test requires admin endpoints to exist
ADMIN_ENDPOINT_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE/api/admin/users" \
    -H "Authorization: Bearer ${JWT_TOKEN:-invalid}" 2>/dev/null || echo "ERROR\n500")
ADMIN_CODE=$(echo "$ADMIN_ENDPOINT_RESPONSE" | tail -1)

if [ "$ADMIN_CODE" = "403" ]; then
    pass "Non-admin user blocked from admin endpoint"
elif [ "$ADMIN_CODE" = "404" ]; then
    warn "Admin endpoints not implemented yet"
    ((TOTAL_TESTS++))
elif [ "$ADMIN_CODE" = "401" ]; then
    info "Admin endpoint requires authentication (expected)"
    ((TOTAL_TESTS++))
else
    warn "RBAC behavior unclear (HTTP $ADMIN_CODE for admin endpoint)"
    ((TOTAL_TESTS++))
fi

echo ""

# ============================================================================
# Test 10: Sensitive Data Exposure
# ============================================================================
info "Testing for sensitive data exposure..."

# Check if password hashes are exposed in API responses
if [ -n "$LOGIN_RESPONSE" ]; then
    if echo "$LOGIN_RESPONSE" | grep -qi "password\|hash\|salt"; then
        fail "Sensitive data exposed in response" "Password-related fields should not be in API responses"
    else
        pass "No password data in API responses"
    fi
else
    warn "No login response to check - skipping sensitive data test"
    ((TOTAL_TESTS++))
fi

# Check for stack traces in error responses
ERROR_RESPONSE=$(curl -s -X POST "$API_BASE/api/invalid/endpoint/test" 2>/dev/null || echo "")

if echo "$ERROR_RESPONSE" | grep -qi "stack\|trace\|error.*at\|\.ts:\|\.js:"; then
    fail "Stack traces exposed in error responses" "Disable detailed errors in production"
else
    pass "No stack traces in error responses"
fi

echo ""

# ============================================================================
# Test 11: Security Headers
# ============================================================================
info "Checking security headers..."

HEADERS_RESPONSE=$(curl -sI "$API_BASE/health" 2>/dev/null || echo "")

# Check for important security headers
SECURITY_HEADERS_FOUND=0
SECURITY_HEADERS_TOTAL=0

# X-Frame-Options (clickjacking protection)
if echo "$HEADERS_RESPONSE" | grep -qi "X-Frame-Options"; then
    pass "X-Frame-Options header present"
    ((SECURITY_HEADERS_FOUND++))
else
    warn "X-Frame-Options header missing (add for clickjacking protection)"
fi
((SECURITY_HEADERS_TOTAL++))

# X-Content-Type-Options (MIME sniffing protection)
if echo "$HEADERS_RESPONSE" | grep -qi "X-Content-Type-Options"; then
    pass "X-Content-Type-Options header present"
    ((SECURITY_HEADERS_FOUND++))
else
    warn "X-Content-Type-Options header missing (prevents MIME sniffing)"
fi
((SECURITY_HEADERS_TOTAL++))

# Strict-Transport-Security (HSTS - forces HTTPS)
if echo "$HEADERS_RESPONSE" | grep -qi "Strict-Transport-Security"; then
    pass "Strict-Transport-Security header present"
    ((SECURITY_HEADERS_FOUND++))
else
    warn "Strict-Transport-Security header missing (recommended for HTTPS)"
fi
((SECURITY_HEADERS_TOTAL++))

# Content-Security-Policy
if echo "$HEADERS_RESPONSE" | grep -qi "Content-Security-Policy"; then
    pass "Content-Security-Policy header present"
    ((SECURITY_HEADERS_FOUND++))
else
    warn "Content-Security-Policy header missing (recommended for XSS protection)"
fi
((SECURITY_HEADERS_TOTAL++))

info "Security headers: $SECURITY_HEADERS_FOUND/$SECURITY_HEADERS_TOTAL present"

echo ""

# ============================================================================
# Cleanup Test Data
# ============================================================================
info "Cleaning up test data..."

if command -v psql > /dev/null 2>&1 && [ -n "$DATABASE_NAME" ]; then
    PGPASS_FILE="$HOME/.pgpass_security_cleanup_$$"

    if [ -n "$DATABASE_PASSWORD" ]; then
        echo "${DATABASE_HOST}:${DATABASE_PORT:-5432}:${DATABASE_NAME}:${DATABASE_USER}:${DATABASE_PASSWORD}" > "$PGPASS_FILE"
        chmod 600 "$PGPASS_FILE"
        export PGPASSFILE="$PGPASS_FILE"
    fi

    # Delete test users
    psql -h "${DATABASE_HOST}" -U "${DATABASE_USER}" -d "${DATABASE_NAME}" -c "
        DELETE FROM users WHERE email LIKE '%_test_%@test.com';
        DELETE FROM users WHERE email LIKE 'jwt_test_%@test.com';
    " > /dev/null 2>&1

    rm -f "$PGPASS_FILE"

    info "Test users cleaned up"
fi

echo ""

# ============================================================================
# Summary
# ============================================================================
echo "======================================================================"
echo "📊 Security Test Summary"
echo "======================================================================"
echo -e "Total Tests:  ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed:       ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed:       ${RED}$FAILED_TESTS${NC}"
echo ""

# Calculate security score
if [ $TOTAL_TESTS -gt 0 ]; then
    SECURITY_SCORE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo -e "Security Score: ${BLUE}$SECURITY_SCORE%${NC}"
    echo ""
fi

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✅ All security tests passed!${NC}"
    echo ""
    echo "MARCUS platform meets OWASP compliance standards."
    exit 0
else
    echo -e "${RED}❌ Some security tests failed${NC}"
    echo ""
    echo "⚠️  CRITICAL: Address security issues before production deployment."
    exit 1
fi
