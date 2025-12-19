# MARCUS 3.0 Testing & Validation Suite

## Overview
Comprehensive testing suite for MARCUS 3.0 platform deployment validation.

**Two Test Systems:**
1. **Jest Unit/Integration Tests** (`npm test`) - Code-level testing
2. **Bash Validation Scripts** - System/deployment validation

---

## 🧪 NPM Test Suite (`npm test`)

### **Current Status: ⚠️ BROKEN - Missing Dependencies**

**Error:** `Cannot find module 'dotenv' from 'jest.setup.ts'`

**Available Test Commands:**
```bash
npm test              # Run all Jest tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
npm run test:unit     # Unit tests only
npm run test:integration # Integration tests only
npm run test:system   # System tests only
npm run test:e2e      # Playwright E2E tests
```

### **Existing Jest Test Files (65 test suites)**

#### **Platform Tests** (`src/platform/__tests__/`)
- ✅ `integration/authFlow.test.ts` - Authentication flow
- ✅ `unit/platformConfig.test.ts` - Configuration
- ✅ `unit/metricsEndpoint.test.ts` - Metrics
- ✅ `unit/logger.test.ts` - Logging
- ✅ `unit/circuitBreaker.test.ts` - Circuit breaker
- ✅ `agentIntegration.test.ts` - Agent integration
- ✅ `e2e/fullWorkflow.test.ts` - End-to-end workflow

#### **Security Tests** (`src/platform/tests/`)
- ✅ `secrets/secretsManager.test.ts` - Secrets management
- ✅ `secrets/envBackend.test.ts` - Environment backend
- ✅ `validationIntegration.test.ts` - Validation
- ✅ `securityIntegration.test.ts` - Security integration
- ✅ `tls.test.ts` - TLS/SSL

#### **Government Agents Tests** (`packages/government-agents/tests/`)
- Multiple test files for government simulation

### **Fix Required:**
```bash
# Install missing dependency
npm install --save-dev dotenv

# Then run tests
npm test
```

---

## 📋 Bash Validation Scripts

### ✅ **Currently Existing**

#### 1. System-Level Tests
- **`test_marcus_complete.sh`** ✅ (87.2% passing)
  - System requirements (Node.js, Python, PostgreSQL, Redis)
  - Environment variables
  - Database schema validation
  - Project structure
  - TypeScript build status
  - Python dependencies
  - Python agent validation
  - API endpoints
  - Process supervision (PM2, systemd)
  - Documentation completeness

#### 2. Infrastructure Tests
- **`provision_marcus_vm.sh`** ✅
  - VM provisioning
  - Dependency installation
  - Database setup
  - Configuration generation

- **`setup_marcus_vm.sh`** ✅
  - VM configuration
  - Service setup

- **`check_docker_redis.sh`** ✅
  - Docker Redis validation

- **`final_deployment_checklist.sh`** ✅
  - Pre-deployment verification

- **`validateDeployment.sh`** ✅
  - Post-deployment validation

#### 3. Security Tests
- **`check-cert-expiry.sh`** ✅
  - SSL/TLS certificate validation

- **`validate-code-attribution.sh`** ✅
  - Code attribution checks

---

## 🚧 **Missing Critical Test Scripts**

### 1. MARCUS Platform-Specific Tests

#### **A. `test_marcus_database.sh`** ❌ NEEDED
**Purpose:** Deep database validation
```bash
#!/bin/bash
# Test database integrity, migrations, constraints, indices
- Verify all migrations applied
- Check foreign key constraints
- Validate indices exist and are used
- Test connection pooling
- Verify row-level security
- Check database performance
```

#### **B. `test_marcus_auth.sh`** ❌ NEEDED
**Purpose:** Authentication system validation
```bash
# Test authentication flows
- User registration
- Login (success/failure)
- Token refresh
- Token revocation
- Password reset flow
- Email verification
- Session management
- Rate limiting
- Account lockout
```

#### **C. `test_marcus_api.sh`** ❌ NEEDED
**Purpose:** API endpoint validation
```bash
# Test all API endpoints
- Health check endpoint
- Authentication endpoints
- Citation analysis endpoints
- Agent management endpoints
- Rate limiting
- CORS configuration
- Error handling
- Response formats
```

#### **D. `test_marcus_python_agent.sh`** ❌ NEEDED
**Purpose:** Python agent validation
```bash
# Test Python citation integrity agent
- Demo mode functionality
- IPC mode communication
- Citation analysis accuracy
- Agent state persistence
- Error handling
- Memory usage
- Performance benchmarks
```

#### **E. `test_marcus_integration.sh`** ❌ NEEDED
**Purpose:** End-to-end integration tests
```bash
# Full workflow tests
- User registers → analyzes citation → reviews results
- Multi-agent consensus testing
- Database → Agent → API → Frontend flow
- Concurrent user handling
- Long-running analysis jobs
```

#### **F. `test_marcus_performance.sh`** ❌ NEEDED
**Purpose:** Performance and load testing
```bash
# Performance benchmarks
- API response times (p50, p95, p99)
- Database query performance
- Python agent processing time
- Concurrent request handling
- Memory usage under load
- CPU utilization
```

#### **G. `test_marcus_security.sh`** ❌ NEEDED
**Purpose:** Security validation (OWASP)
```bash
# Security tests
- SQL injection attempts
- XSS prevention
- CSRF protection
- Authentication bypass attempts
- Authorization checks
- Session hijacking prevention
- Rate limiting effectiveness
- Input validation
- Output encoding
```

#### **H. `test_marcus_backup_restore.sh`** ❌ NEEDED
**Purpose:** Backup and disaster recovery
```bash
# Backup/restore validation
- Database backup creation
- Backup integrity verification
- Restore from backup
- Point-in-time recovery
- Data consistency checks
```

#### **I. `test_marcus_monitoring.sh`** ❌ NEEDED
**Purpose:** Monitoring and observability
```bash
# Monitoring validation
- Prometheus metrics scraping
- Log aggregation (if configured)
- Alert rule validation
- Health check endpoints
- Service discovery
```

#### **J. `test_marcus_upgrade.sh`** ❌ NEEDED
**Purpose:** Upgrade path validation
```bash
# Test upgrade procedures
- Database migration rollback
- Zero-downtime deployment
- Configuration migration
- Data migration validation
```

---

### 2. Continuous Integration Scripts

#### **K. `ci_marcus_full_suite.sh`** ❌ NEEDED
**Purpose:** CI/CD pipeline script
```bash
# Run all tests in CI environment
- Spin up test database
- Run all validation scripts
- Generate test report
- Upload coverage data
- Clean up test environment
```

---

### 3. Development/Debug Scripts

#### **L. `debug_marcus_agent.sh`** ❌ NEEDED
**Purpose:** Agent debugging helper
```bash
# Debug Python agent issues
- Enable verbose logging
- Capture agent state
- Replay failed citations
- Profile agent performance
```

#### **M. `check_marcus_logs.sh`** ❌ NEEDED
**Purpose:** Log analysis
```bash
# Analyze logs for issues
- Error rate detection
- Performance anomalies
- Security events
- Pattern matching
```

---

## 📊 Test Coverage Matrix

| Component | Unit Tests | Integration Tests | E2E Tests | Performance | Security |
|-----------|-----------|------------------|-----------|-------------|----------|
| **Database** | ✅ | ⚠️ Partial | ❌ | ❌ | ⚠️ Partial |
| **API Endpoints** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Auth System** | ❌ | ❌ | ❌ | ❌ | ⚠️ Partial |
| **Python Agent** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Frontend** | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Infrastructure** | ✅ | ✅ | ⚠️ Partial | ❌ | ⚠️ Partial |

**Legend:**
- ✅ Complete
- ⚠️ Partial
- ❌ Missing

---

## 🎯 Priority Implementation Order

### **Phase 1: Critical (Week 1)**
1. `test_marcus_database.sh` - Database integrity
2. `test_marcus_auth.sh` - Authentication security
3. `test_marcus_api.sh` - API functionality
4. `test_marcus_python_agent.sh` - Agent validation

### **Phase 2: Important (Week 2)**
5. `test_marcus_integration.sh` - E2E workflows
6. `test_marcus_security.sh` - OWASP compliance
7. `test_marcus_performance.sh` - Load testing
8. `ci_marcus_full_suite.sh` - CI automation

### **Phase 3: Operational (Week 3)**
9. `test_marcus_backup_restore.sh` - DR readiness
10. `test_marcus_monitoring.sh` - Observability
11. `test_marcus_upgrade.sh` - Upgrade safety
12. `debug_marcus_agent.sh` - Debug tools
13. `check_marcus_logs.sh` - Log analysis

---

## 🔧 Test Script Template

```bash
#!/bin/bash
# MARCUS 3.0 Test Script Template
# Usage: ./test_marcus_[component].sh

set -e

# Load environment securely
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

load_env_file "$PROJECT_DIR/.env" || load_env_file "$PROJECT_DIR/.env.secrets"

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Helper functions
print_test() {
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    echo -e "${YELLOW}[TEST $TESTS_TOTAL]${NC} $1"
}

print_pass() {
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo -e "${GREEN}✅ PASS:${NC} $1"
}

print_fail() {
    TESTS_FAILED=$((TESTS_FAILED + 1))
    echo -e "${RED}❌ FAIL:${NC} $1"
}

# Add your tests here

# Summary
echo ""
echo "Test Summary: $TESTS_PASSED/$TESTS_TOTAL passed"
exit $TESTS_FAILED
```

---

## 📈 Success Metrics

**Target Test Coverage:**
- Database: 90%+
- API: 85%+
- Auth: 95%+ (security-critical)
- Python Agent: 80%+
- Integration: 75%+

**Current Status:** 87.2% (34/39 tests in `test_marcus_complete.sh`)

**Goal:** 95% overall test coverage across all components

---

## 🔗 Related Documentation

- `docs/SECURITY_IMPROVEMENTS.md` - Security testing requirements
- `docs/MARCUS_DEBUGGING_REPORT.md` - Known issues and debugging
- `docs/MARCUS_IMPLEMENTATION_CHECKLIST.md` - Implementation verification
- `scripts/test_marcus_complete.sh` - Current test suite

---

## 📝 Notes

- All test scripts should follow OWASP security standards
- No password exposure in command line arguments
- All credentials loaded from `.env` or `.env.secrets`
- Tests should be idempotent (safe to run multiple times)
- Clean up resources after tests complete
- Generate structured output for CI parsing
