#!/bin/bash
# MARCUS 3.0 Deployment Validation Script
#
# Validates production environment is properly configured
# Run before deploying to production
#
# Usage: ./scripts/validateDeployment.sh [environment]
#   environment: dev | staging | production (default: production)

set -euo pipefail

# Configuration
ENVIRONMENT="${1:-production}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNING=0

# Functions
log_header() {
  echo -e "\n${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}"
}

log_success() {
  echo -e "${GREEN}✅ $1${NC}"
  ((CHECKS_PASSED++))
}

log_error() {
  echo -e "${RED}❌ $1${NC}"
  ((CHECKS_FAILED++))
}

log_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
  ((CHECKS_WARNING++))
}

log_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

# Start validation
log_header "MARCUS 3.0 Deployment Validation"
echo "Environment: $ENVIRONMENT"
echo "Date: $(date -Iseconds)"
echo ""

# ============================================
# 1. Environment Variables Check
# ============================================
log_header "1. Environment Variables"

check_env_var() {
  local var_name="$1"
  local required="${2:-false}"
  local secret="${3:-false}"

  if [ -n "${!var_name:-}" ]; then
    if [ "$secret" = "true" ]; then
      log_success "$var_name is set (***)"
    else
      log_success "$var_name is set: ${!var_name}"
    fi
  else
    if [ "$required" = "true" ]; then
      log_error "$var_name is REQUIRED but not set"
    else
      log_warning "$var_name is not set (optional)"
    fi
  fi
}

# Required environment variables
check_env_var "NODE_ENV" true false
check_env_var "DATABASE_HOST" true false
check_env_var "DATABASE_PORT" true false
check_env_var "DATABASE_NAME" true false
check_env_var "DATABASE_USER" true false
check_env_var "DATABASE_PASSWORD" true true
check_env_var "REDIS_HOST" true false
check_env_var "REDIS_PORT" true false
check_env_var "JWT_SECRET" true true
check_env_var "ANTHROPIC_API_KEY" true true

# Optional but recommended
check_env_var "JWT_REFRESH_SECRET" false true
check_env_var "REDIS_PASSWORD" false true
check_env_var "LOG_LEVEL" false false
check_env_var "SERVER_PORT" false false

# Production-specific
if [ "$ENVIRONMENT" = "production" ]; then
  if [ "${NODE_ENV:-}" != "production" ]; then
    log_error "NODE_ENV should be 'production' in production environment"
  fi
fi

# ============================================
# 2. JWT Secret Strength
# ============================================
log_header "2. JWT Secret Validation"

if [ -n "${JWT_SECRET:-}" ]; then
  JWT_SECRET_LENGTH=${#JWT_SECRET}
  if [ "$JWT_SECRET_LENGTH" -ge 32 ]; then
    log_success "JWT_SECRET length is sufficient ($JWT_SECRET_LENGTH chars)"
  else
    log_error "JWT_SECRET is too short ($JWT_SECRET_LENGTH chars, minimum 32 required)"
  fi
else
  log_error "JWT_SECRET not set (cannot validate)"
fi

# ============================================
# 3. Database Connectivity
# ============================================
log_header "3. Database Connectivity"

if command -v psql &> /dev/null; then
  if psql "postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}" -c '\q' &> /dev/null; then
    log_success "PostgreSQL connection successful"
  else
    log_error "Cannot connect to PostgreSQL database"
  fi
else
  log_warning "psql not installed, skipping database connectivity test"
fi

# ============================================
# 4. Redis Connectivity
# ============================================
log_header "4. Redis Connectivity"

if command -v redis-cli &> /dev/null; then
  if [ -n "${REDIS_PASSWORD:-}" ]; then
    if redis-cli -h "${REDIS_HOST}" -p "${REDIS_PORT}" -a "${REDIS_PASSWORD}" PING &> /dev/null; then
      log_success "Redis connection successful (with authentication)"
    else
      log_error "Cannot connect to Redis"
    fi
  else
    if redis-cli -h "${REDIS_HOST}" -p "${REDIS_PORT}" PING &> /dev/null; then
      log_warning "Redis connection successful (no authentication - security risk)"
    else
      log_error "Cannot connect to Redis"
    fi
  fi
else
  log_warning "redis-cli not installed, skipping Redis connectivity test"
fi

# ============================================
# 5. Node.js Version
# ============================================
log_header "5. Node.js Environment"

NODE_VERSION=$(node --version)
log_info "Node.js version: $NODE_VERSION"

# Extract major version
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_MAJOR" -ge 18 ]; then
  log_success "Node.js version is compatible (>= 18.x)"
else
  log_error "Node.js version is too old (require >= 18.x, have $NODE_VERSION)"
fi

# ============================================
# 6. npm Dependencies
# ============================================
log_header "6. npm Dependencies"

if [ -f "$PROJECT_ROOT/package-lock.json" ]; then
  log_success "package-lock.json exists"
else
  log_error "package-lock.json missing (run npm install)"
fi

if [ -d "$PROJECT_ROOT/node_modules" ]; then
  log_success "node_modules directory exists"
else
  log_error "node_modules missing (run npm install)"
fi

# Check for vulnerabilities
log_info "Running npm audit..."
AUDIT_OUTPUT=$(npm audit --production 2>&1 || true)
CRITICAL_VULNS=$(echo "$AUDIT_OUTPUT" | grep -oP '\d+ critical' || echo "0 critical")
HIGH_VULNS=$(echo "$AUDIT_OUTPUT" | grep -oP '\d+ high' || echo "0 high")

if echo "$AUDIT_OUTPUT" | grep -q "found 0 vulnerabilities"; then
  log_success "No npm vulnerabilities found"
elif echo "$CRITICAL_VULNS" | grep -q "0 critical"; then
  log_warning "npm vulnerabilities found: $CRITICAL_VULNS, $HIGH_VULNS"
else
  log_error "Critical npm vulnerabilities found: $CRITICAL_VULNS"
fi

# ============================================
# 7. TypeScript Compilation
# ============================================
log_header "7. TypeScript Compilation"

cd "$PROJECT_ROOT"
if npx tsc --noEmit &> /dev/null; then
  log_success "TypeScript compilation successful (no type errors)"
else
  log_error "TypeScript compilation failed (type errors present)"
fi

# ============================================
# 8. Unit Tests
# ============================================
log_header "8. Unit Tests"

log_info "Running platform unit tests..."
TEST_OUTPUT=$(npm test -- src/platform/__tests__/unit/ 2>&1 || true)

if echo "$TEST_OUTPUT" | grep -q "Tests:.*passed"; then
  PASSED_TESTS=$(echo "$TEST_OUTPUT" | grep -oP '\d+(?= passed)')
  log_success "Unit tests passing ($PASSED_TESTS tests)"
else
  log_error "Unit tests failing"
fi

# ============================================
# 9. Production Build
# ============================================
log_header "9. Production Build"

if [ -f "$PROJECT_ROOT/next.config.js" ]; then
  log_info "Building Next.js production bundle..."
  if npm run build &> /dev/null; then
    log_success "Production build successful"
  else
    log_error "Production build failed"
  fi
else
  log_warning "next.config.js not found, skipping build test"
fi

# ============================================
# 10. Security Headers
# ============================================
log_header "10. Security Configuration"

# Check if helmet is installed
if npm list helmet &> /dev/null; then
  log_success "helmet.js installed (security headers)"
else
  log_warning "helmet.js not installed (recommended for security headers)"
fi

# Check if rate limiting is installed
if npm list express-rate-limit &> /dev/null; then
  log_success "express-rate-limit installed"
else
  log_warning "express-rate-limit not installed (recommended for API protection)"
fi

# ============================================
# 11. Monitoring & Logging
# ============================================
log_header "11. Monitoring & Logging"

# Check if winston is installed
if npm list winston &> /dev/null; then
  log_success "winston installed (structured logging)"
else
  log_error "winston not installed (required for logging)"
fi

# Check if prom-client is installed
if npm list prom-client &> /dev/null; then
  log_success "prom-client installed (Prometheus metrics)"
else
  log_error "prom-client not installed (required for monitoring)"
fi

# Check logs directory
if [ -d "$PROJECT_ROOT/logs" ]; then
  log_success "logs directory exists"
else
  log_warning "logs directory missing (creating...)"
  mkdir -p "$PROJECT_ROOT/logs"
fi

# ============================================
# 12. Python Agent Dependencies
# ============================================
log_header "12. Python Agent Environment"

if command -v python3 &> /dev/null; then
  PYTHON_VERSION=$(python3 --version)
  log_info "Python version: $PYTHON_VERSION"
  log_success "Python 3 is available"

  # Check for pip
  if command -v pip3 &> /dev/null; then
    log_success "pip3 is available"
  else
    log_error "pip3 not found (required for Python dependencies)"
  fi
else
  log_error "Python 3 not found (required for citation agents)"
fi

# ============================================
# Summary
# ============================================
log_header "Validation Summary"

TOTAL_CHECKS=$((CHECKS_PASSED + CHECKS_FAILED + CHECKS_WARNING))
echo ""
echo "Total Checks: $TOTAL_CHECKS"
echo -e "${GREEN}Passed: $CHECKS_PASSED${NC}"
echo -e "${RED}Failed: $CHECKS_FAILED${NC}"
echo -e "${YELLOW}Warnings: $CHECKS_WARNING${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
  if [ $CHECKS_WARNING -eq 0 ]; then
    echo -e "${GREEN}✅ Environment is READY for deployment${NC}"
    exit 0
  else
    echo -e "${YELLOW}⚠️  Environment is READY with warnings${NC}"
    echo -e "${YELLOW}   Review warnings before deploying to production${NC}"
    exit 0
  fi
else
  echo -e "${RED}❌ Environment is NOT READY for deployment${NC}"
  echo -e "${RED}   Fix errors before deploying${NC}"
  exit 1
fi
