# MARCUS 3.0 - Weekly Completion Plan

**Branch:** `claude/build-marcus-agent-016LTPXuAb6A3hYDwTvMjyof`
**Week:** November 20-27, 2025
**Goal:** Complete all MARCUS 3.0 incomplete tasks
**Source:** `docs/MARCUS_INCOMPLETE_TASKS.md`

---

## Overview

**Total Time Estimate:** 15-20 hours
**Work Split:**
- **Dev Environment (Now):** 8-10 hours - Scripts, configs, templates, documentation
- **Production VM (Later):** 7-10 hours - Infrastructure setup, testing, deployment

**Status as of Nov 20:**
- ✅ Python Agent System code implemented (~95% complete)
- ✅ Database migration created (006_agent_system_schema.sql)
- ✅ Integration tests created (agentIntegration.test.ts)
- ✅ Comprehensive documentation (3,400+ lines)
- ⏳ Migration not applied to database
- ⏳ Services not configured to use agents
- ⏳ Monitoring infrastructure not set up

---

## Phase Organization

### **Phase 1: Code Artifacts** (Dev Environment - NOW)
**Time:** 3-4 hours
**Can complete without VM infrastructure**

### **Phase 2: Monitoring Setup** (Dev Environment - NOW)
**Time:** 2-3 hours
**Create configs and templates**

### **Phase 3: Load Testing** (Dev Environment - NOW)
**Time:** 2-3 hours
**Create k6 test scenarios**

### **Phase 4: VM Deployment** (Production VM - LATER)
**Time:** 2-3 hours
**Execute on VM with infrastructure**

### **Phase 5: Validation & Testing** (Production VM - LATER)
**Time:** 3-4 hours
**Run tests and verify**

### **Phase 6: Final Hardening** (Production VM - LATER)
**Time:** 1-2 hours
**Security configuration**

---

## PHASE 1: Code Artifacts (NOW - 3-4 hours)

**Goal:** Create all scripts, configs, and code that can be written without running services.

### Task 1.1: Security Package Integration (30 min)

**Install and configure Helmet.js + express-rate-limit**

```bash
# Install packages
npm install helmet express-rate-limit cors

# Verify installation
npm list helmet express-rate-limit cors
```

**Files to update:**
- `src/platform/api/server.ts` - Add security middleware

**What to add:**
```typescript
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Stricter auth rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  skipSuccessfulRequests: true,
});

app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);
```

**Deliverable:** Security middleware integrated ✅

---

### Task 1.2: E2E Integration Test (2 hours)

**Create end-to-end workflow test**

**File:** `src/platform/__tests__/e2e/fullWorkflow.test.ts`

```typescript
import request from 'supertest';
import { app } from '../../api/server';
import { Pool } from 'pg';
import Redis from 'ioredis';

describe('E2E: Full Citation Analysis Workflow', () => {
  let dbPool: Pool;
  let redisClient: Redis;

  beforeAll(async () => {
    // Setup test database and Redis
    dbPool = new Pool({
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5433'),
      database: process.env.DATABASE_NAME || 'marcus_test',
      user: process.env.DATABASE_USER || 'marcus',
      password: process.env.DATABASE_PASSWORD,
    });

    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    });
  });

  afterAll(async () => {
    await dbPool.end();
    await redisClient.quit();
  });

  it('should complete full user journey: register → login → analyze → fetch → logout', async () => {
    // 1. User Registration
    const registerRes = await request(app)
      .post('/auth/register')
      .send({
        email: 'e2e-test@example.com',
        password: 'SecurePassword123!',
        role: 'operator'
      })
      .expect(201);

    expect(registerRes.body).toHaveProperty('user');
    expect(registerRes.body).toHaveProperty('accessToken');
    expect(registerRes.body).toHaveProperty('refreshToken');

    // 2. User Login
    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: 'e2e-test@example.com',
        password: 'SecurePassword123!'
      })
      .expect(200);

    const { accessToken, refreshToken } = loginRes.body;
    expect(accessToken).toBeDefined();
    expect(refreshToken).toBeDefined();

    // 3. Submit Citation Analysis (requires Python agents)
    const citationRes = await request(app)
      .post('/api/citations/analyze')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        text: 'According to Smith et al. (2024), climate change has accelerated.',
        claimedSource: 'Smith et al. 2024'
      })
      .expect(202); // Accepted for processing

    const { analysisId } = citationRes.body;
    expect(analysisId).toBeDefined();

    // 4. Poll for Analysis Results
    let analysis;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max

    while (attempts < maxAttempts) {
      const statusRes = await request(app)
        .get(`/api/citations/${analysisId}`)
        .set('Authorization', `Bearer ${accessToken}`);

      if (statusRes.body.status === 'completed') {
        analysis = statusRes.body;
        break;
      } else if (statusRes.body.status === 'failed') {
        throw new Error(`Analysis failed: ${statusRes.body.error}`);
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    expect(analysis).toBeDefined();
    expect(analysis.status).toBe('completed');
    expect(analysis.result).toHaveProperty('credibility_score');
    expect(analysis.result).toHaveProperty('confidence');
    expect(analysis.result).toHaveProperty('consensus');

    // 5. Refresh Access Token
    const refreshRes = await request(app)
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    const newAccessToken = refreshRes.body.accessToken;
    expect(newAccessToken).toBeDefined();
    expect(newAccessToken).not.toBe(accessToken); // Should be new token

    // 6. User Logout
    const logoutRes = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${newAccessToken}`)
      .send({ refreshToken: refreshRes.body.refreshToken })
      .expect(200);

    expect(logoutRes.body).toHaveProperty('message', 'Logged out successfully');

    // 7. Verify token invalidation - should fail
    await request(app)
      .get(`/api/citations/${analysisId}`)
      .set('Authorization', `Bearer ${newAccessToken}`)
      .expect(401); // Unauthorized after logout
  });
});
```

**Deliverable:** E2E test created (can't run until VM has agents) ✅

---

### Task 1.3: Agent Health Monitoring Enhancement (1 hour)

**Create agent health monitoring utilities**

**File:** `src/platform/monitoring/agentHealthMonitor.ts`

```typescript
import { EventEmitter } from 'events';
import { PythonAgentWrapper } from '../integration/citationAgentIntegration';

export interface AgentHealthStatus {
  agentId: string;
  status: 'healthy' | 'degraded' | 'down';
  lastSeen: Date;
  metrics: {
    uptime: number;
    requestsProcessed: number;
    avgResponseTime: number;
    errorRate: number;
  };
}

export class AgentHealthMonitor extends EventEmitter {
  private agents: Map<string, PythonAgentWrapper> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private readonly checkIntervalMs: number;

  constructor(checkIntervalMs: number = 10000) {
    super();
    this.checkIntervalMs = checkIntervalMs;
  }

  registerAgent(agent: PythonAgentWrapper): void {
    this.agents.set(agent.id, agent);
  }

  unregisterAgent(agentId: string): void {
    this.agents.delete(agentId);
  }

  startMonitoring(): void {
    if (this.healthCheckInterval) {
      return; // Already monitoring
    }

    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, this.checkIntervalMs);
  }

  stopMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  private async performHealthCheck(): Promise<void> {
    const results: AgentHealthStatus[] = [];

    for (const [agentId, agent] of this.agents) {
      try {
        const isHealthy = await agent.healthCheck();
        const metrics = agent.getMetrics();

        const status: AgentHealthStatus = {
          agentId,
          status: isHealthy ? 'healthy' : 'down',
          lastSeen: new Date(),
          metrics: {
            uptime: metrics.uptime,
            requestsProcessed: metrics.requestsProcessed,
            avgResponseTime: metrics.avgResponseTime,
            errorRate: metrics.errorRate
          }
        };

        results.push(status);

        if (!isHealthy) {
          this.emit('agent_down', { agentId, lastSeen: status.lastSeen });
        }
      } catch (error) {
        const status: AgentHealthStatus = {
          agentId,
          status: 'down',
          lastSeen: new Date(),
          metrics: {
            uptime: 0,
            requestsProcessed: 0,
            avgResponseTime: 0,
            errorRate: 1.0
          }
        };

        results.push(status);
        this.emit('agent_down', { agentId, error: error.message });
      }
    }

    this.emit('health_check_complete', results);
  }

  getAgentStatus(): AgentHealthStatus[] {
    const statuses: AgentHealthStatus[] = [];

    for (const [agentId, agent] of this.agents) {
      const metrics = agent.getMetrics();

      statuses.push({
        agentId,
        status: agent.isHealthy() ? 'healthy' : 'down',
        lastSeen: new Date(),
        metrics: {
          uptime: metrics.uptime,
          requestsProcessed: metrics.requestsProcessed,
          avgResponseTime: metrics.avgResponseTime,
          errorRate: metrics.errorRate
        }
      });
    }

    return statuses;
  }
}
```

**Deliverable:** Agent health monitoring utilities ✅

---

### Task 1.4: Deployment Validation Script (1 hour)

**Create comprehensive deployment validation script**

**File:** `scripts/validate_deployment.sh`

```bash
#!/bin/bash

# MARCUS 3.0 - Deployment Validation Script
# Validates all production requirements are met

set -euo pipefail

echo "🔍 MARCUS 3.0 - Deployment Validation"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

check_item() {
  local description=$1
  local check_command=$2
  local is_critical=${3:-true}

  echo -n "  Checking: $description... "

  if eval "$check_command" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASSED++))
    return 0
  else
    if [ "$is_critical" = "true" ]; then
      echo -e "${RED}❌ FAIL${NC}"
      ((FAILED++))
    else
      echo -e "${YELLOW}⚠️  WARN${NC}"
      ((WARNINGS++))
    fi
    return 1
  fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  ENVIRONMENT VARIABLES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

check_item ".env file exists" "[ -f .env ]"
check_item "DATABASE_HOST set" "grep -q '^DATABASE_HOST=' .env"
check_item "DATABASE_PORT set" "grep -q '^DATABASE_PORT=' .env"
check_item "DATABASE_NAME set" "grep -q '^DATABASE_NAME=' .env"
check_item "REDIS_HOST set" "grep -q '^REDIS_HOST=' .env"
check_item "REDIS_PASSWORD set" "grep -q '^REDIS_PASSWORD=' .env" false
check_item "JWT_SECRET set (>32 chars)" "grep -q '^JWT_SECRET=' .env && [ \$(grep '^JWT_SECRET=' .env | cut -d= -f2 | wc -c) -gt 32 ]"
check_item "JWT_REFRESH_SECRET set (>32 chars)" "grep -q '^JWT_REFRESH_SECRET=' .env && [ \$(grep '^JWT_REFRESH_SECRET=' .env | cut -d= -f2 | wc -c) -gt 32 ]"
check_item "ENABLE_AGENTS set" "grep -q '^ENABLE_AGENTS=' .env" false
check_item "NUM_AGENTS set" "grep -q '^NUM_AGENTS=' .env" false

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  DEPENDENCIES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

check_item "Node.js installed (v18+)" "node --version | grep -E 'v(18|19|20|21)'"
check_item "npm installed" "which npm"
check_item "Python 3.9+ installed" "python3 --version | grep -E '3\\.(9|10|11|12)'"
check_item "pip3 installed" "which pip3"
check_item "node_modules exists" "[ -d node_modules ]"
check_item "Python packages installed" "pip3 list | grep -q psycopg2" false

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  BUILD ARTIFACTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

check_item "TypeScript compiled (dist/ exists)" "[ -d dist ]"
check_item "Next.js standalone build exists" "[ -f .next/standalone/server.js ]" false

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  SERVICES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

check_item "PostgreSQL running" "pg_isready -h localhost -p 5433" false
check_item "Redis running" "redis-cli -h localhost -p 6379 ping" false

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  DATABASE SCHEMA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

check_item "users table exists" "sudo -u postgres psql -d marcus -tAc \"SELECT to_regclass('public.users')\" 2>/dev/null | grep -q users" false
check_item "agent_states table exists" "sudo -u postgres psql -d marcus -tAc \"SELECT to_regclass('public.agent_states')\" 2>/dev/null | grep -q agent_states" false

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣  SECURITY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

check_item "helmet package installed" "npm list helmet 2>/dev/null | grep -q helmet"
check_item "express-rate-limit installed" "npm list express-rate-limit 2>/dev/null | grep -q express-rate-limit"
check_item ".env file permissions (600)" "[ \$(stat -c '%a' .env 2>/dev/null || stat -f '%A' .env 2>/dev/null) = '600' ]" false

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "  ${GREEN}✅ Passed:${NC}   $PASSED"
echo -e "  ${YELLOW}⚠️  Warnings:${NC} $WARNINGS"
echo -e "  ${RED}❌ Failed:${NC}   $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}✅ DEPLOYMENT VALIDATION PASSED!${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""

  if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Note: $WARNINGS warning(s) detected (non-critical)${NC}"
    echo ""
  fi

  exit 0
else
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${RED}❌ DEPLOYMENT VALIDATION FAILED!${NC}"
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo "🔧 Please resolve the failed checks above before deploying."
  echo ""
  exit 1
fi
```

**Deliverable:** Validation script created ✅

---

## PHASE 2: Monitoring Setup (NOW - 2-3 hours)

**Goal:** Create Prometheus and Grafana configuration files.

### Task 2.1: Prometheus Configuration (45 min)

**File:** `prometheus/prometheus.yml`

```yaml
# MARCUS 3.0 - Prometheus Configuration
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    cluster: 'marcus-production'
    environment: 'production'

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - 'localhost:9093'

# Load rules once and periodically evaluate them
rule_files:
  - 'marcus_alerts.yml'
  - 'agent_alerts.yml'

# Scrape configurations
scrape_configs:
  # MARCUS Platform
  - job_name: 'marcus'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: /metrics
    scrape_interval: 10s
    scrape_timeout: 5s

  # PostgreSQL Exporter (optional)
  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']
    scrape_interval: 30s

  # Redis Exporter (optional)
  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:9121']
    scrape_interval: 30s

  # Node Exporter (system metrics)
  - job_name: 'node'
    static_configs:
      - targets: ['localhost:9100']
    scrape_interval: 15s
```

**File:** `prometheus/marcus_alerts.yml`

```yaml
# MARCUS 3.0 - Alert Rules
groups:
  - name: marcus_platform
    interval: 30s
    rules:
      # High Error Rate
      - alert: HighErrorRate
        expr: rate(marcus_http_requests_total{status_code=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
          component: api
        annotations:
          summary: "MARCUS error rate > 5%"
          description: "{{ $value | humanizePercentage }} of requests returning 5xx errors"

      # Slow Response Time
      - alert: SlowResponseTime
        expr: histogram_quantile(0.95, marcus_http_request_duration_seconds_bucket) > 2.0
        for: 10m
        labels:
          severity: warning
          component: api
        annotations:
          summary: "MARCUS p95 latency > 2s"
          description: "95th percentile response time is {{ $value | humanizeDuration }}"

      # Database Pool Exhausted
      - alert: DatabasePoolExhausted
        expr: marcus_db_pool_waiting > 5
        for: 2m
        labels:
          severity: warning
          component: database
        annotations:
          summary: "Database connection pool under pressure"
          description: "{{ $value }} queries waiting for connection"

      # Circuit Breaker Open
      - alert: CircuitBreakerOpen
        expr: marcus_circuit_breaker_state == 2
        for: 1m
        labels:
          severity: warning
          component: integration
        annotations:
          summary: "Circuit breaker {{ $labels.breaker_name }} is OPEN"
          description: "Circuit breaker has tripped, blocking requests"

      # Low Agent Count
      - alert: LowAgentCount
        expr: marcus_agent_count < 2
        for: 3m
        labels:
          severity: critical
          component: agents
        annotations:
          summary: "Fewer than 2 agents running"
          description: "Only {{ $value }} agents available (minimum: 2)"

      # High Agent Error Rate
      - alert: HighAgentErrorRate
        expr: avg(marcus_agent_error_rate) > 0.1
        for: 5m
        labels:
          severity: warning
          component: agents
        annotations:
          summary: "Agent error rate > 10%"
          description: "{{ $value | humanizePercentage }} of agent requests failing"
```

**File:** `prometheus/agent_alerts.yml`

```yaml
# MARCUS 3.0 - Python Agent Alerts
groups:
  - name: python_agents
    interval: 30s
    rules:
      # Agent Down
      - alert: AgentDown
        expr: marcus_agent_status == 0
        for: 2m
        labels:
          severity: critical
          component: agents
        annotations:
          summary: "Python agent {{ $labels.agent_id }} is down"
          description: "Agent has not responded to health checks"

      # Agent Slow Response
      - alert: AgentSlowResponse
        expr: marcus_agent_avg_response_time > 5000
        for: 5m
        labels:
          severity: warning
          component: agents
        annotations:
          summary: "Agent {{ $labels.agent_id }} responding slowly"
          description: "Average response time: {{ $value }}ms (threshold: 5000ms)"

      # Agent High Memory
      - alert: AgentHighMemory
        expr: marcus_agent_memory_usage > 500 * 1024 * 1024
        for: 10m
        labels:
          severity: warning
          component: agents
        annotations:
          summary: "Agent {{ $labels.agent_id }} high memory usage"
          description: "Memory usage: {{ $value | humanize1024 }}B (threshold: 500MB)"

      # Consensus Variance High
      - alert: HighConsensusVariance
        expr: marcus_consensus_variance > 0.3
        for: 5m
        labels:
          severity: warning
          component: consensus
        annotations:
          summary: "High variance in agent consensus"
          description: "Variance: {{ $value }} (threshold: 0.3) - agents disagreeing significantly"
```

**Deliverable:** Prometheus configs created ✅

---

### Task 2.2: Grafana Dashboard (1 hour)

**File:** `grafana/dashboards/marcus-overview.json`

```json
{
  "dashboard": {
    "title": "MARCUS 3.0 - Platform Overview",
    "tags": ["marcus", "citation-integrity"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(marcus_http_requests_total[5m])",
            "legendFormat": "{{method}} {{path}}"
          }
        ],
        "gridPos": {"x": 0, "y": 0, "w": 12, "h": 8}
      },
      {
        "id": 2,
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(marcus_http_requests_total{status_code=~\"5..\"}[5m])",
            "legendFormat": "5xx errors"
          }
        ],
        "gridPos": {"x": 12, "y": 0, "w": 12, "h": 8}
      },
      {
        "id": 3,
        "title": "Response Time (p50, p95, p99)",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.50, marcus_http_request_duration_seconds_bucket)",
            "legendFormat": "p50"
          },
          {
            "expr": "histogram_quantile(0.95, marcus_http_request_duration_seconds_bucket)",
            "legendFormat": "p95"
          },
          {
            "expr": "histogram_quantile(0.99, marcus_http_request_duration_seconds_bucket)",
            "legendFormat": "p99"
          }
        ],
        "gridPos": {"x": 0, "y": 8, "w": 12, "h": 8}
      },
      {
        "id": 4,
        "title": "Database Pool Status",
        "type": "graph",
        "targets": [
          {
            "expr": "marcus_db_pool_total",
            "legendFormat": "Total connections"
          },
          {
            "expr": "marcus_db_pool_idle",
            "legendFormat": "Idle connections"
          },
          {
            "expr": "marcus_db_pool_waiting",
            "legendFormat": "Waiting queries"
          }
        ],
        "gridPos": {"x": 12, "y": 8, "w": 12, "h": 8}
      },
      {
        "id": 5,
        "title": "Agent Status",
        "type": "stat",
        "targets": [
          {
            "expr": "marcus_agent_count",
            "legendFormat": "Total Agents"
          },
          {
            "expr": "sum(marcus_agent_status)",
            "legendFormat": "Healthy Agents"
          }
        ],
        "gridPos": {"x": 0, "y": 16, "w": 6, "h": 4}
      },
      {
        "id": 6,
        "title": "Agent Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "marcus_agent_avg_response_time",
            "legendFormat": "{{agent_id}}"
          }
        ],
        "gridPos": {"x": 6, "y": 16, "w": 18, "h": 8}
      },
      {
        "id": 7,
        "title": "Consensus Metrics",
        "type": "graph",
        "targets": [
          {
            "expr": "marcus_consensus_score",
            "legendFormat": "Consensus Score"
          },
          {
            "expr": "marcus_consensus_variance",
            "legendFormat": "Variance"
          }
        ],
        "gridPos": {"x": 0, "y": 24, "w": 12, "h": 8}
      },
      {
        "id": 8,
        "title": "Circuit Breaker Status",
        "type": "stat",
        "targets": [
          {
            "expr": "marcus_circuit_breaker_state",
            "legendFormat": "{{breaker_name}}"
          }
        ],
        "gridPos": {"x": 12, "y": 24, "w": 12, "h": 8}
      }
    ],
    "refresh": "10s",
    "time": {
      "from": "now-1h",
      "to": "now"
    }
  }
}
```

**File:** `grafana/datasources/prometheus.yml`

```yaml
# MARCUS 3.0 - Grafana Data Source
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://localhost:9090
    isDefault: true
    editable: false
```

**Deliverable:** Grafana dashboard created ✅

---

### Task 2.3: Monitoring Setup Script (30 min)

**File:** `scripts/setup_monitoring.sh`

```bash
#!/bin/bash

# MARCUS 3.0 - Monitoring Setup Script
# Installs and configures Prometheus + Grafana

set -euo pipefail

echo "📊 MARCUS 3.0 - Monitoring Setup"
echo "================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "⚠️  This script should be run with sudo"
  echo "Usage: sudo ./scripts/setup_monitoring.sh"
  exit 1
fi

# 1. Install Prometheus
echo "📦 Installing Prometheus..."
apt-get update
apt-get install -y prometheus

# 2. Install Grafana
echo "📦 Installing Grafana..."
wget -q -O - https://packages.grafana.com/gpg.key | apt-key add -
echo "deb https://packages.grafana.com/oss/deb stable main" > /etc/apt/sources.list.d/grafana.list
apt-get update
apt-get install -y grafana

# 3. Copy Prometheus configuration
echo "⚙️  Configuring Prometheus..."
cp prometheus/prometheus.yml /etc/prometheus/
cp prometheus/marcus_alerts.yml /etc/prometheus/
cp prometheus/agent_alerts.yml /etc/prometheus/

# 4. Copy Grafana configuration
echo "⚙️  Configuring Grafana..."
mkdir -p /etc/grafana/provisioning/datasources
mkdir -p /etc/grafana/provisioning/dashboards
cp grafana/datasources/prometheus.yml /etc/grafana/provisioning/datasources/
cp grafana/dashboards/marcus-overview.json /var/lib/grafana/dashboards/

# 5. Start services
echo "🚀 Starting services..."
systemctl start prometheus
systemctl start grafana-server
systemctl enable prometheus
systemctl enable grafana-server

# 6. Verify
echo "✅ Verifying installation..."
sleep 5

if systemctl is-active --quiet prometheus; then
  echo "  ✅ Prometheus running"
else
  echo "  ❌ Prometheus not running"
  exit 1
fi

if systemctl is-active --quiet grafana-server; then
  echo "  ✅ Grafana running"
else
  echo "  ❌ Grafana not running"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ MONITORING SETUP COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Prometheus: http://localhost:9090"
echo "📈 Grafana: http://localhost:3000 (admin/admin)"
echo ""
echo "Next steps:"
echo "  1. Open Grafana at http://localhost:3000"
echo "  2. Login with admin/admin (change password)"
echo "  3. Go to Dashboards → Browse"
echo "  4. Open 'MARCUS 3.0 - Platform Overview'"
echo ""
```

**Deliverable:** Monitoring setup script created ✅

---

## PHASE 3: Load Testing (NOW - 2-3 hours)

**Goal:** Create k6 load testing scenarios.

### Task 3.1: Baseline Load Test (30 min)

**File:** `scripts/loadtest/baseline.js`

```javascript
// MARCUS 3.0 - Baseline Load Test
// Tests: Health check endpoint under steady load

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '1m', target: 10 },  // Ramp up to 10 users
    { duration: '3m', target: 10 },  // Stay at 10 users
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'],  // 95% < 500ms
    'http_req_failed': ['rate<0.01'],    // < 1% failures
    'errors': ['rate<0.01'],             // < 1% errors
  },
};

export default function () {
  const res = http.get('http://localhost:3000/health');

  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
    'has status field': (r) => r.json('status') !== undefined,
  });

  errorRate.add(!success);
  sleep(1);
}
```

**Deliverable:** Baseline test created ✅

---

### Task 3.2: Authentication Load Test (45 min)

**File:** `scripts/loadtest/auth.js`

```javascript
// MARCUS 3.0 - Authentication Load Test
// Tests: Login and token refresh under load

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const refreshDuration = new Trend('refresh_duration');

export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp to 50 users
    { duration: '5m', target: 50 },   // Maintain 50 users
    { duration: '2m', target: 100 },  // Spike to 100 users
    { duration: '3m', target: 100 },  // Maintain spike
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    'login_duration': ['p(95)<1000'],      // 95% < 1s
    'refresh_duration': ['p(95)<500'],     // 95% < 500ms
    'http_req_failed': ['rate<0.01'],      // < 1% failures
    'errors': ['rate<0.05'],               // < 5% errors
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  // 1. Register (first time only)
  const userId = `testuser${__VU}_${__ITER}@example.com`;
  const password = 'TestPassword123!';

  const registerRes = http.post(`${BASE_URL}/auth/register`, JSON.stringify({
    email: userId,
    password: password,
    role: 'operator'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  // Registration might fail if user exists - that's okay
  check(registerRes, {
    'register status is 201 or 400': (r) => r.status === 201 || r.status === 400,
  });

  sleep(1);

  // 2. Login
  const loginStart = Date.now();
  const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: userId,
    password: password
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  loginDuration.add(Date.now() - loginStart);

  const loginSuccess = check(loginRes, {
    'login status is 200': (r) => r.status === 200,
    'has accessToken': (r) => r.json('accessToken') !== undefined,
    'has refreshToken': (r) => r.json('refreshToken') !== undefined,
  });

  errorRate.add(!loginSuccess);

  if (!loginSuccess) {
    return;
  }

  const { accessToken, refreshToken } = loginRes.json();

  sleep(2);

  // 3. Refresh token
  const refreshStart = Date.now();
  const refreshRes = http.post(`${BASE_URL}/auth/refresh`, JSON.stringify({
    refreshToken: refreshToken
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  refreshDuration.add(Date.now() - refreshStart);

  const refreshSuccess = check(refreshRes, {
    'refresh status is 200': (r) => r.status === 200,
    'has new accessToken': (r) => r.json('accessToken') !== undefined,
  });

  errorRate.add(!refreshSuccess);

  sleep(1);
}
```

**Deliverable:** Auth load test created ✅

---

### Task 3.3: Citation Analysis Load Test (45 min)

**File:** `scripts/loadtest/citation.js`

```javascript
// MARCUS 3.0 - Citation Analysis Load Test
// Tests: Python agent performance under load

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const analysisDuration = new Trend('analysis_duration');

export const options = {
  stages: [
    { duration: '3m', target: 20 },   // Ramp to 20 users
    { duration: '10m', target: 20 },  // Maintain 20 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    'analysis_duration': ['p(95)<5000'],   // 95% < 5s
    'http_req_failed': ['rate<0.05'],      // < 5% failures
    'errors': ['rate<0.10'],               // < 10% errors (agents may be slower)
  },
};

const BASE_URL = 'http://localhost:3000';

// Login once per VU
export function setup() {
  const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: 'admin@marcus-platform.local',
    password: process.env.ADMIN_PASSWORD || 'changeme'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (loginRes.status !== 200) {
    throw new Error('Setup failed: Could not login');
  }

  return { accessToken: loginRes.json('accessToken') };
}

export default function (data) {
  const citations = [
    { text: 'According to Smith et al. (2024), climate change has accelerated.', source: 'Smith et al. 2024' },
    { text: 'Jones and Brown (2023) found that renewable energy is cost-effective.', source: 'Jones & Brown 2023' },
    { text: 'Recent studies by Lee et al. (2025) show AI alignment progress.', source: 'Lee et al. 2025' },
  ];

  const citation = citations[Math.floor(Math.random() * citations.length)];

  const analysisStart = Date.now();
  const analysisRes = http.post(`${BASE_URL}/api/citations/analyze`, JSON.stringify({
    text: citation.text,
    claimedSource: citation.source
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${data.accessToken}`
    },
  });
  analysisDuration.add(Date.now() - analysisStart);

  const success = check(analysisRes, {
    'analysis status is 202': (r) => r.status === 202,
    'has analysisId': (r) => r.json('analysisId') !== undefined,
  });

  errorRate.add(!success);

  sleep(3);  // Wait before next request
}
```

**Deliverable:** Citation load test created ✅

---

### Task 3.4: Spike Test (30 min)

**File:** `scripts/loadtest/spike.js`

```javascript
// MARCUS 3.0 - Spike Test
// Tests: System behavior under sudden traffic spike

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 200 },  // Sudden spike to 200 users
    { duration: '1m', target: 200 },   // Hold spike
    { duration: '30s', target: 0 },    // Drop to 0
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'],  // 95% < 2s (relaxed for spike)
    'http_req_failed': ['rate<0.10'],     // < 10% failures
    'errors': ['rate<0.15'],              // < 15% errors
  },
};

export default function () {
  const res = http.get('http://localhost:3000/health');

  const success = check(res, {
    'status is 200': (r) => r.status === 200,
  });

  errorRate.add(!success);
  sleep(Math.random() * 2);  // Random delay 0-2s
}
```

**Deliverable:** Spike test created ✅

---

## PHASE 4: VM Deployment (VM - 2-3 hours)

**Goal:** Execute all scripts on production VM.

### Execution Steps (On VM)

```bash
# 1. Pull latest code
cd /home/g7throwawayplz/ai_game_theory_simulation
git pull origin claude/build-marcus-agent-016LTPXuAb6A3hYDwTvMjyof

# 2. Install dependencies
npm install
pip3 install -r src/platform/agents/requirements.txt

# 3. Apply database migration
sudo -u postgres psql -d marcus -f src/platform/database/migrations/006_agent_system_schema.sql

# 4. Add agent config to .env
cat >> .env <<EOF

# Python Agent System
ENABLE_AGENTS=true
NUM_AGENTS=3
AGENT_TIMEOUT_MS=30000
EOF

# 5. Set up monitoring
sudo ./scripts/setup_monitoring.sh

# 6. Run validation
./scripts/validate_deployment.sh
```

**Expected time:** 2-3 hours

**Deliverable:** MARCUS deployed with agents + monitoring ✅

---

## PHASE 5: Validation & Testing (VM - 3-4 hours)

**Goal:** Run all tests and validate deployment.

### Testing Steps

```bash
# 1. Run integration tests (auth flow)
./scripts/run_integration_tests.sh
# Expected: 18/18 passing

# 2. Run agent integration tests
npm test -- agentIntegration.test.ts
# Expected: 10/10 passing

# 3. Run E2E test
npm test -- fullWorkflow.test.ts
# Expected: 1/1 passing

# 4. Run load tests
k6 run scripts/loadtest/baseline.js
k6 run scripts/loadtest/auth.js
k6 run scripts/loadtest/citation.js
k6 run scripts/loadtest/spike.js

# 5. Check monitoring
curl http://localhost:9090/api/v1/targets  # Prometheus
# Open http://localhost:3000  # Grafana
```

**Expected time:** 3-4 hours

**Deliverable:** All tests passing, monitoring operational ✅

---

## PHASE 6: Final Hardening (VM - 1-2 hours)

**Goal:** Execute security configuration.

### Security Steps

```bash
# 1. Generate JWT secrets
./scripts/generate_jwt_secrets.sh

# 2. Change admin password
sudo ./scripts/change_admin_password.sh

# 3. Run deployment checklist
./scripts/final_deployment_checklist.sh

# 4. Restart service
sudo systemctl restart marcus-platform

# 5. Verify
sudo systemctl status marcus-platform
sudo journalctl -u marcus-platform -n 50
```

**Expected time:** 1-2 hours

**Deliverable:** MARCUS fully hardened and production-ready ✅

---

## Summary Timeline

| Phase | Location | Time | Status |
|-------|----------|------|--------|
| Phase 1: Code Artifacts | Dev Env | 3-4h | ⏳ In Progress |
| Phase 2: Monitoring | Dev Env | 2-3h | ⏳ Pending |
| Phase 3: Load Testing | Dev Env | 2-3h | ⏳ Pending |
| Phase 4: VM Deployment | VM | 2-3h | ⏳ Pending |
| Phase 5: Validation | VM | 3-4h | ⏳ Pending |
| Phase 6: Final Hardening | VM | 1-2h | ⏳ Pending |

**Total:** 13-19 hours over 5-7 days

---

## Success Criteria

- [ ] All security packages installed (helmet, rate-limit)
- [ ] E2E test created and passing
- [ ] Agent health monitoring implemented
- [ ] Deployment validation script created
- [ ] Prometheus + Grafana configs created
- [ ] 4 k6 load test scenarios created
- [ ] All scripts executable on VM
- [ ] All integration tests passing (28/28)
- [ ] Monitoring operational (Prometheus + Grafana)
- [ ] Load tests show acceptable performance
- [ ] Security configuration complete
- [ ] Production deployment validated

---

**Created:** 2025-11-20
**Status:** Phase 1 in progress
**Next:** Complete Phase 1 code artifacts
