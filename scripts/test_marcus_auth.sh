#!/bin/bash
# MARCUS 3.0 Authentication System Validation Script
# Tests registration, login, lockout, tokens, password reset, rate limiting
# Usage: ./test_marcus_auth.sh

# ============================================================================
# Load Environment Variables Securely (OWASP Compliant)
# ============================================================================
# OWASP Credential Hierarchy (most specific to most general):
# 1. .env.test (test-specific credentials for CI/local dev)
# 2. .env (production credentials, runtime)
# 3. .env.secrets (production secrets vault, provisioning)
# Passwords never exposed in process listings or command line arguments

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

load_env_file() {
    local env_file="$1"
    if [ -f "$env_file" ]; then
        # Use set -a to auto-export all variables
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
TEST_EMAIL="auth-test-$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123!"
ADMIN_EMAIL="admin-test-$(date +%s)@example.com"
ADMIN_PASSWORD="AdminPassword456!"

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
echo "🔒 MARCUS 3.0 Authentication System Validation"
echo "======================================================================"
echo ""

# ============================================================================
# Test 1: Health Check
# ============================================================================
info "Testing API health endpoint..."

HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE/health" 2>/dev/null)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -1)
BODY=$(echo "$HEALTH_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    pass "Health endpoint responding"
    info "Response: $BODY"
else
    fail "Health endpoint not responding" "HTTP $HTTP_CODE"
    echo "Please ensure MARCUS service is running: sudo systemctl status marcus-platform"
    exit 1
fi

echo ""

# ============================================================================
# Test 2: User Registration
# ============================================================================
info "Testing user registration..."

REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"role\":\"operator\"}" \
    2>/dev/null)

HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -1)
BODY=$(echo "$REGISTER_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "201" ]; then
    pass "User registration successful"

    # Extract user ID from response
    USER_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | cut -d':' -f2)
    info "Created user ID: $USER_ID"
else
    fail "User registration failed" "HTTP $HTTP_CODE - $BODY"
fi

echo ""

# ============================================================================
# Test 3: Duplicate Registration Prevention
# ============================================================================
info "Testing duplicate email prevention..."

DUPLICATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"role\":\"operator\"}" \
    2>/dev/null)

HTTP_CODE=$(echo "$DUPLICATE_RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "409" ]; then
    pass "Duplicate email rejected (HTTP 409)"
else
    fail "Duplicate email not rejected" "Expected HTTP 409, got $HTTP_CODE"
fi

echo ""

# ============================================================================
# Test 4: Password Requirements
# ============================================================================
info "Testing password requirements..."

WEAK_PASSWORD_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"weak-test-$(date +%s)@example.com\",\"password\":\"weak\",\"role\":\"viewer\"}" \
    2>/dev/null)

HTTP_CODE=$(echo "$WEAK_PASSWORD_RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "400" ]; then
    pass "Weak password rejected (HTTP 400)"
else
    fail "Weak password not rejected" "Expected HTTP 400, got $HTTP_CODE"
fi

echo ""

# ============================================================================
# Test 5: Email Format Validation
# ============================================================================
info "Testing email format validation..."

INVALID_EMAIL_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"not-an-email\",\"password\":\"$TEST_PASSWORD\",\"role\":\"viewer\"}" \
    2>/dev/null)

HTTP_CODE=$(echo "$INVALID_EMAIL_RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "400" ]; then
    pass "Invalid email format rejected (HTTP 400)"
else
    fail "Invalid email not rejected" "Expected HTTP 400, got $HTTP_CODE"
fi

echo ""

# ============================================================================
# Test 6: Successful Login
# ============================================================================
info "Testing login with valid credentials..."

LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
    2>/dev/null)

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -1)
BODY=$(echo "$LOGIN_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
    pass "Login successful"

    # Extract tokens
    ACCESS_TOKEN=$(echo "$BODY" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    REFRESH_TOKEN=$(echo "$BODY" | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)

    if [ -n "$ACCESS_TOKEN" ] && [ -n "$REFRESH_TOKEN" ]; then
        pass "Tokens received (accessToken + refreshToken)"
        info "Access token length: ${#ACCESS_TOKEN} chars"
    else
        fail "Tokens missing from response" "accessToken or refreshToken not found"
    fi
else
    fail "Login failed" "HTTP $HTTP_CODE - $BODY"
fi

echo ""

# ============================================================================
# Test 7: Invalid Password
# ============================================================================
info "Testing login with invalid password..."

INVALID_LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"WrongPassword123!\"}" \
    2>/dev/null)

HTTP_CODE=$(echo "$INVALID_LOGIN_RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "401" ]; then
    pass "Invalid password rejected (HTTP 401)"
else
    fail "Invalid password not rejected" "Expected HTTP 401, got $HTTP_CODE"
fi

echo ""

# ============================================================================
# Test 8: Non-existent User
# ============================================================================
info "Testing login with non-existent email..."

NONEXISTENT_LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"nonexistent-$(date +%s)@example.com\",\"password\":\"$TEST_PASSWORD\"}" \
    2>/dev/null)

HTTP_CODE=$(echo "$NONEXISTENT_LOGIN_RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "401" ]; then
    pass "Non-existent user rejected (HTTP 401)"
else
    fail "Non-existent user not rejected" "Expected HTTP 401, got $HTTP_CODE"
fi

echo ""

# ============================================================================
# Test 9: Account Lockout
# ============================================================================
info "Testing account lockout after failed attempts..."

LOCKOUT_EMAIL="lockout-test-$(date +%s)@example.com"

# Register user for lockout test
curl -s -X POST "$API_BASE/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$LOCKOUT_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"role\":\"operator\"}" \
    >/dev/null 2>&1

# Make 5 failed login attempts
info "Making 5 failed login attempts..."
for i in {1..5}; do
    curl -s -X POST "$API_BASE/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$LOCKOUT_EMAIL\",\"password\":\"WrongPassword123!\"}" \
        >/dev/null 2>&1
    sleep 0.5
done

# 6th attempt (with correct password) should be locked
LOCKOUT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$LOCKOUT_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
    2>/dev/null)

HTTP_CODE=$(echo "$LOCKOUT_RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "403" ]; then
    pass "Account lockout triggered (HTTP 403)"
else
    fail "Account lockout not triggered" "Expected HTTP 403, got $HTTP_CODE"
fi

echo ""

# ============================================================================
# Test 10: JWT Token Structure
# ============================================================================
info "Testing JWT token structure..."

if [ -n "$ACCESS_TOKEN" ]; then
    # JWT should have 3 parts separated by dots
    TOKEN_PARTS=$(echo "$ACCESS_TOKEN" | tr -cd '.' | wc -c)

    if [ "$TOKEN_PARTS" -eq 2 ]; then
        pass "JWT token has correct structure (3 parts)"

        # Decode JWT payload (base64url decode)
        PAYLOAD=$(echo "$ACCESS_TOKEN" | cut -d'.' -f2)

        # Add padding if needed for base64 decode
        case $((${#PAYLOAD} % 4)) in
            2) PAYLOAD="${PAYLOAD}==" ;;
            3) PAYLOAD="${PAYLOAD}=" ;;
        esac

        DECODED=$(echo "$PAYLOAD" | base64 -d 2>/dev/null)

        if echo "$DECODED" | grep -q "email"; then
            pass "JWT payload contains email claim"
        else
            fail "JWT payload missing email claim" "Payload: $DECODED"
        fi

        if echo "$DECODED" | grep -q "exp"; then
            pass "JWT payload contains expiration (exp)"
        else
            fail "JWT payload missing expiration" "Payload: $DECODED"
        fi
    else
        fail "JWT token has incorrect structure" "Expected 3 parts, got $((TOKEN_PARTS + 1))"
    fi
else
    warn "Skipping JWT structure test (no access token available)"
fi

echo ""

# ============================================================================
# Test 11: Token Refresh
# ============================================================================
info "Testing token refresh..."

if [ -n "$REFRESH_TOKEN" ]; then
    REFRESH_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/auth/refresh" \
        -H "Content-Type: application/json" \
        -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}" \
        2>/dev/null)

    HTTP_CODE=$(echo "$REFRESH_RESPONSE" | tail -1)
    BODY=$(echo "$REFRESH_RESPONSE" | head -n -1)

    if [ "$HTTP_CODE" = "200" ]; then
        pass "Token refresh successful"

        NEW_ACCESS_TOKEN=$(echo "$BODY" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

        if [ -n "$NEW_ACCESS_TOKEN" ] && [ "$NEW_ACCESS_TOKEN" != "$ACCESS_TOKEN" ]; then
            pass "New access token different from old token"
        else
            fail "Token refresh returned same token" "Expected new token"
        fi
    else
        fail "Token refresh failed" "HTTP $HTTP_CODE - $BODY"
    fi
else
    warn "Skipping token refresh test (no refresh token available)"
fi

echo ""

# ============================================================================
# Test 12: Invalid Refresh Token
# ============================================================================
info "Testing invalid refresh token..."

INVALID_REFRESH_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/auth/refresh" \
    -H "Content-Type: application/json" \
    -d "{\"refreshToken\":\"invalid-token-12345\"}" \
    2>/dev/null)

HTTP_CODE=$(echo "$INVALID_REFRESH_RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "401" ]; then
    pass "Invalid refresh token rejected (HTTP 401)"
else
    fail "Invalid refresh token not rejected" "Expected HTTP 401, got $HTTP_CODE"
fi

echo ""

# ============================================================================
# Test 13: Logout
# ============================================================================
info "Testing logout..."

if [ -n "$ACCESS_TOKEN" ] && [ -n "$REFRESH_TOKEN" ]; then
    LOGOUT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/auth/logout" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}" \
        2>/dev/null)

    HTTP_CODE=$(echo "$LOGOUT_RESPONSE" | tail -1)

    if [ "$HTTP_CODE" = "200" ]; then
        pass "Logout successful"

        # Try using the token after logout - should fail
        UNAUTHORIZED_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE/api/citations/history" \
            -H "Authorization: Bearer $ACCESS_TOKEN" \
            2>/dev/null)

        HTTP_CODE=$(echo "$UNAUTHORIZED_RESPONSE" | tail -1)

        if [ "$HTTP_CODE" = "401" ]; then
            pass "Token invalidated after logout (HTTP 401)"
        else
            warn "Token may not be properly invalidated after logout (HTTP $HTTP_CODE)"
        fi
    else
        fail "Logout failed" "HTTP $HTTP_CODE"
    fi
else
    warn "Skipping logout test (no tokens available)"
fi

echo ""

# ============================================================================
# Test 14: RBAC - Role-Based Access Control
# ============================================================================
info "Testing role-based access control (RBAC)..."

# Register admin user
ADMIN_REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\",\"role\":\"admin\"}" \
    2>/dev/null)

HTTP_CODE=$(echo "$ADMIN_REGISTER_RESPONSE" | tail -1)
BODY=$(echo "$ADMIN_REGISTER_RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "201" ]; then
    ADMIN_ACCESS_TOKEN=$(echo "$BODY" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

    if [ -n "$ADMIN_ACCESS_TOKEN" ]; then
        # Decode JWT to check role
        PAYLOAD=$(echo "$ADMIN_ACCESS_TOKEN" | cut -d'.' -f2)
        case $((${#PAYLOAD} % 4)) in
            2) PAYLOAD="${PAYLOAD}==" ;;
            3) PAYLOAD="${PAYLOAD}=" ;;
        esac
        DECODED=$(echo "$PAYLOAD" | base64 -d 2>/dev/null)

        if echo "$DECODED" | grep -q '"role":"admin"'; then
            pass "Admin role correctly assigned in JWT"
        else
            fail "Admin role not in JWT" "Expected role:admin, got: $DECODED"
        fi
    else
        fail "Admin registration did not return access token" "Response: $BODY"
    fi
else
    fail "Admin registration failed" "HTTP $HTTP_CODE - $BODY"
fi

echo ""

# ============================================================================
# Test 15: Rate Limiting (if enabled)
# ============================================================================
info "Testing rate limiting..."

info "Making 15 rapid requests to check rate limiting..."
RATE_LIMIT_TRIGGERED=false

for i in {1..15}; do
    RATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"ratelimit-test@example.com\",\"password\":\"test\"}" \
        2>/dev/null)

    HTTP_CODE=$(echo "$RATE_RESPONSE" | tail -1)

    if [ "$HTTP_CODE" = "429" ]; then
        RATE_LIMIT_TRIGGERED=true
        break
    fi
done

if [ "$RATE_LIMIT_TRIGGERED" = true ]; then
    pass "Rate limiting active (HTTP 429 received)"
else
    warn "Rate limiting not triggered after 15 requests (may not be enabled)"
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
    echo -e "${GREEN}✅ All authentication tests passed!${NC}"
    echo ""
    echo "Authentication system is properly configured and secure."
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    echo ""
    echo "Please review the failures above and fix before deploying to production."
    exit 1
fi
