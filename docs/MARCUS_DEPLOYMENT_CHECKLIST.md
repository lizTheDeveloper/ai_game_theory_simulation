# Marcus Platform Agent Deployment Checklist

**Created:** 2025-11-17
**Agent:** Marcus (Platform Engineer)
**Status:** Pre-deployment - Agent created but infrastructure not yet needed

## Executive Summary

This checklist guides the deployment of Marcus and the MARCUS 3.0 Citation Integrity Platform. Based on architecture review, Marcus is **currently premature** - the simulation has no Python agents requiring orchestration.

**Architecture Skeptic Verdict:** APPROVED WITH RESERVATIONS
- 2 HIGH priority issues to fix before activation
- 4 MEDIUM priority improvements recommended
- No CRITICAL blocking issues

---

## Pre-Deployment Review

### ✅ Completed
- [x] Marcus agent definition created (`.claude/agents/marcus.md`)
- [x] Memory system initialized (`.claude/agents/memories/marcus-memory.json`)
- [x] MCP server registration (added to `scripts/agent-memory-server.py`)
- [x] Documentation updated (`CLAUDE.md`, memory README)
- [x] Architecture review completed

### ⚠️ Architecture Issues to Address

**HIGH Priority (Must Fix):**
- [ ] **H1:** Define clear scope boundaries (Marcus = external integrations, NOT simulation core)
- [ ] **H2:** Add conflict resolution to state synchronization pattern

**MEDIUM Priority (Recommended):**
- [ ] **M1:** Simplify memory structure (5 layers → 3 layers)
- [ ] **M2:** Add resource utilization metrics to benchmarking
- [ ] **M3:** Align error handling with "fail loudly" philosophy
- [ ] **M4:** Add resource isolation to process management

**LOW Priority (Optional):**
- [ ] **L1:** Assign Marcus to "implementation" chatroom channel
- [ ] **L2:** Create migration guide for existing Python scripts
- [ ] **L3:** Replace citation examples with simulation-relevant schemas

**Review Details:** See `/home/user/ai_game_theory_simulation/reviews/marcus-agent-architecture-review.md`

---

## Phase 1: Platform Infrastructure Setup

**Prerequisites:** Actual need for Python agent orchestration (currently absent)

### 1.1 System Requirements
**Assignee:** DevOps / System Admin

- [ ] Install PostgreSQL 14+ (`apt install postgresql-14`)
- [ ] Install Redis 7+ (`apt install redis-server`)
- [ ] Configure PostgreSQL user and database
  ```bash
  sudo -u postgres psql
  CREATE DATABASE citation_integrity;
  CREATE USER citation_agent WITH ENCRYPTED PASSWORD 'secure_password';
  GRANT ALL PRIVILEGES ON DATABASE citation_integrity TO citation_agent;
  ```
- [ ] Verify Redis running (`redis-cli ping` → PONG)
- [ ] Configure firewall rules (PostgreSQL: 5432, Redis: 6379)

### 1.2 Python Environment Setup
**Assignee:** Marcus

- [ ] Create Python virtual environment
  ```bash
  python3 -m venv venv/marcus-platform
  source venv/marcus-platform/bin/activate
  ```
- [ ] Install Python dependencies
  ```bash
  pip install numpy>=1.21.0 pandas>=1.3.0 psycopg2-binary>=2.9.0 \
              redis>=4.0.0 scikit-learn>=1.0.0 asyncio
  ```
- [ ] Verify installations (`python -c "import numpy, pandas, psycopg2, redis"`)

### 1.3 TypeScript Dependencies
**Assignee:** Marcus

- [ ] Install Node.js dependencies
  ```bash
  npm install --save pg ioredis pino prom-client simple-statistics csv-writer
  npm install --save-dev @types/pg @types/pino
  ```
- [ ] Verify TypeScript compilation (`npx tsc --noEmit`)

---

## Phase 2: Core Agent Implementation

**Agent Assignments:**
- **Python code:** Marcus (platform infrastructure)
- **TypeScript integration:** Marcus (orchestration layer)
- **Code review:** Roy (simulation-maintainer)
- **Testing:** unit-test-writer + integration-test-writer

### 2.1 Python Agent Core
**Assignee:** Marcus
**Files to create:**

- [ ] `src/platform/agents/citation_integrity_agent.py` (650+ lines)
  - [ ] CitationBehavior enum (9 behaviors)
  - [ ] NestedCitationMemory class (4-level hierarchy)
  - [ ] CitationIntegrityAgent class
  - [ ] Platform integration hooks

**Quality checks:**
- [ ] All imports resolve
- [ ] Type hints on all functions
- [ ] Docstrings on public methods
- [ ] No hardcoded credentials

**Validation:**
```bash
# Run syntax check
python -m py_compile src/platform/agents/citation_integrity_agent.py

# Run basic import test
python -c "from src.platform.agents.citation_integrity_agent import CitationIntegrityAgent"
```

### 2.2 TypeScript Integration Layer
**Assignee:** Marcus
**Files to create:**

- [ ] `src/platform/integration/citationAgentIntegration.ts` (1200+ lines)
  - [ ] PythonAgentWrapper class (process management)
  - [ ] AgentStateManager class (PostgreSQL + Redis)
  - [ ] CitationAgentOrchestrator class (multi-agent coordination)
  - [ ] MetricsCollector class (Prometheus integration)

**Quality checks:**
- [ ] TypeScript compiles without errors
- [ ] All interfaces properly typed
- [ ] Error handling on all async operations
- [ ] Resource cleanup in finally blocks

**Validation:**
```bash
# Type check
npx tsc --noEmit

# Run linter
npx eslint src/platform/integration/citationAgentIntegration.ts
```

### 2.3 Database Schema
**Assignee:** Marcus
**Files to create:**

- [ ] `src/platform/database/schema.sql`
  - [ ] agent_states table
  - [ ] citation_analyses table
  - [ ] agent_metrics table
  - [ ] Proper indexes and constraints

**Deployment:**
```bash
# Apply schema
psql -U citation_agent -d citation_integrity -f src/platform/database/schema.sql

# Verify tables created
psql -U citation_agent -d citation_integrity -c "\dt"
```

**Validation:**
- [ ] All tables created successfully
- [ ] Constraints enforce valid data ranges
- [ ] Indexes cover common queries

### 2.4 Unit Tests
**Assignee:** unit-test-writer
**Agent invocation:**
```typescript
Task({
  subagent_type: "unit-test-writer",
  description: "Create unit tests for Marcus platform",
  prompt: "Create comprehensive unit tests for:
  1. PythonAgentWrapper process management
  2. AgentStateManager cache/DB sync
  3. CitationAgentOrchestrator consensus calculation

  Cover edge cases: process crashes, DB connection failures, cache misses."
})
```

**Files to create:**
- [ ] `src/platform/__tests__/agentWrapper.test.ts`
- [ ] `src/platform/__tests__/stateManager.test.ts`
- [ ] `src/platform/__tests__/orchestrator.test.ts`

**Coverage requirements:**
- [ ] Line coverage >80%
- [ ] Branch coverage >75%
- [ ] All error paths tested

### 2.5 Integration Tests
**Assignee:** integration-test-writer
**Agent invocation:**
```typescript
Task({
  subagent_type: "integration-test-writer",
  description: "Create integration tests for Marcus platform",
  prompt: "Create integration tests that verify:
  1. Python agent spawning and IPC
  2. End-to-end citation analysis flow
  3. Multi-agent consensus calculation
  4. Database persistence and retrieval

  Use test fixtures for sample citations and expected behaviors."
})
```

**Files to create:**
- [ ] `src/platform/__tests__/integration/platform.integration.test.ts`
- [ ] `src/platform/__tests__/fixtures/sample_citations.json`
- [ ] `src/platform/__tests__/fixtures/expected_behaviors.json`

**Test scenarios:**
- [ ] 1 agent processes 100 citations
- [ ] 10 agents reach consensus on 1000 citations
- [ ] Agent failure scenarios (crash, timeout, malformed data)
- [ ] Database failover and recovery

---

## Phase 3: Evaluation Framework

**Agent Assignments:**
- **Python benchmarks:** Marcus (evaluation suite)
- **TypeScript benchmarks:** Marcus (performance testing)
- **Baseline comparisons:** Priya (quantitative validator)

### 3.1 Python Evaluation Suite
**Assignee:** Marcus
**Files to create:**

- [ ] `src/platform/evaluation/citation_evaluation_benchmarks.py` (1800+ lines)
  - [ ] BenchmarkDatasetGenerator class
  - [ ] CitationMetrics dataclass
  - [ ] Baseline implementations (5 types)
  - [ ] Statistical analysis functions

**Datasets to generate:**
- [ ] Clean dataset (1,000 samples)
- [ ] Mixed dataset (1,000 samples)
- [ ] Adversarial dataset (1,000 samples)
- [ ] Temporal drift dataset (1,000 samples)
- [ ] Field-specific datasets (1,500 samples)
- [ ] Edge cases (500 samples)

**Validation:**
```bash
# Run evaluation suite
python src/platform/evaluation/citation_evaluation_benchmarks.py

# Should output:
# - Accuracy metrics
# - Performance metrics
# - Convergence metrics
# - Baseline comparisons
```

### 3.2 TypeScript Benchmarking
**Assignee:** Marcus
**Files to create:**

- [ ] `src/platform/evaluation/citationBenchmarks.ts` (1500+ lines)
  - [ ] BenchmarkDatasetGenerator class
  - [ ] CitationBenchmarkEvaluator class
  - [ ] BenchmarkReportGenerator class
  - [ ] Performance profiling utilities

**Metrics to track:**
- [ ] Latency (p50, p95, p99)
- [ ] Throughput (citations/sec)
- [ ] Memory usage over time
- [ ] CPU utilization
- [ ] Database connection pool usage

**Output formats:**
- [ ] HTML dashboard
- [ ] JSON report
- [ ] CSV data files
- [ ] Markdown summary

### 3.3 Quantitative Validation
**Assignee:** Priya (quantitative validator)
**Agent invocation:**
```typescript
Task({
  subagent_type: "priya",
  description: "Validate Marcus platform benchmarks",
  prompt: "Review benchmark results from citation platform evaluation:

  Target metrics:
  - Overall Accuracy: >80%
  - F1 Score: >75%
  - Behavior Detection: >70%
  - Consensus Level: >80%
  - Latency (p95): <100ms
  - Throughput: >50/sec

  Analyze:
  1. Do results meet targets?
  2. Statistical significance of improvements over baselines
  3. Convergence stability (CV < 0.01% for determinism)
  4. Performance scaling (1→10→50 agents)

  Provide quantitative gap analysis for any failing metrics."
})
```

**Deliverables:**
- [ ] Statistical validation report
- [ ] Gap analysis for failing metrics
- [ ] Recommendations for performance tuning

---

## Phase 4: Production Deployment

**Agent Assignments:**
- **Configuration:** Marcus (platform setup)
- **Monitoring:** Marcus (Prometheus/Grafana)
- **Documentation:** wiki-documentation-updater

### 4.1 Configuration Management
**Assignee:** Marcus
**Files to create:**

- [ ] `config/platform.json` (main configuration)
- [ ] `config/platform.development.json` (dev overrides)
- [ ] `config/platform.production.json` (prod settings)

**Configuration schema:**
```json
{
  "numAgents": 10,
  "database": {
    "host": "localhost",
    "port": 5432,
    "database": "citation_integrity",
    "user": "citation_agent",
    "password": "${DB_PASSWORD}",
    "poolSize": 20
  },
  "redis": {
    "host": "localhost",
    "port": 6379,
    "db": 0,
    "ttl": 3600
  },
  "learning": {
    "initialLearningRate": 0.1,
    "explorationRate": 0.2,
    "metaLearningRate": 0.01,
    "memoryConsolidationInterval": 100
  },
  "performance": {
    "maxConcurrentRequests": 50,
    "requestTimeout": 5000,
    "cacheTTL": 1800
  },
  "monitoring": {
    "metricsPort": 9090,
    "logLevel": "info",
    "healthCheckInterval": 10000
  }
}
```

**Security:**
- [ ] No credentials in config files (use env vars)
- [ ] File permissions set to 600
- [ ] Sensitive configs in `.gitignore`

### 4.2 Prometheus Metrics
**Assignee:** Marcus

- [ ] Add `/metrics` endpoint to API server
- [ ] Configure Prometheus scraping
  ```yaml
  # prometheus.yml
  scrape_configs:
    - job_name: 'citation-platform'
      static_configs:
        - targets: ['localhost:9090']
  ```
- [ ] Create Grafana dashboard JSON
- [ ] Set up alerting rules

**Key metrics to expose:**
- [ ] `citation_accuracy_total`
- [ ] `citation_latency_ms`
- [ ] `citation_throughput`
- [ ] `citation_agent_consensus`
- [ ] `citation_memory_usage_mb`
- [ ] `citation_f1_score`

### 4.3 Logging Setup
**Assignee:** Marcus

- [ ] Configure Pino structured logging
- [ ] Set up log rotation (daily, keep 30 days)
- [ ] Configure log levels by environment
- [ ] Add request ID tracing

**Log destinations:**
- [ ] stdout (Docker/K8s friendly)
- [ ] File: `/var/log/marcus-platform/app.log`
- [ ] Error file: `/var/log/marcus-platform/error.log`

### 4.4 Health Checks
**Assignee:** Marcus

- [ ] Implement `/health` endpoint
- [ ] Check database connectivity
- [ ] Check Redis connectivity
- [ ] Verify agent processes running
- [ ] Return HTTP 200 if healthy, 503 if degraded

**Health check response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-17T15:30:00Z",
  "agents": {
    "total": 10,
    "healthy": 9
  },
  "database": true,
  "redis": true
}
```

### 4.5 Deployment Scripts
**Assignee:** Marcus

- [ ] Create `scripts/deploy-platform.sh`
  - [ ] Stop existing processes
  - [ ] Pull latest code
  - [ ] Run database migrations
  - [ ] Restart services
  - [ ] Verify health

- [ ] Create `scripts/rollback-platform.sh`
  - [ ] Stop current version
  - [ ] Restore previous version
  - [ ] Rollback database if needed
  - [ ] Restart services

- [ ] Create `scripts/platform-status.sh`
  - [ ] Check all service statuses
  - [ ] Display key metrics
  - [ ] Show recent errors

**Validation:**
```bash
# Test deployment script (dry run)
bash scripts/deploy-platform.sh --dry-run

# Verify all steps would succeed
```

### 4.6 Documentation
**Assignee:** wiki-documentation-updater
**Agent invocation:**
```typescript
Task({
  subagent_type: "wiki-documentation-updater",
  description: "Document Marcus platform deployment",
  prompt: "Create comprehensive documentation for the Marcus citation integrity platform:

  1. Architecture overview with diagrams
  2. Installation guide (dependencies, setup)
  3. Configuration reference
  4. API documentation
  5. Monitoring and troubleshooting guide
  6. Performance tuning recommendations

  Location: docs/wiki/marcus-platform.md

  Include links to code files and cross-references to related systems."
})
```

**Documentation files:**
- [ ] `docs/wiki/marcus-platform.md` (main docs)
- [ ] `docs/MARCUS_API.md` (API reference)
- [ ] `docs/MARCUS_TROUBLESHOOTING.md` (common issues)
- [ ] `README.md` update (add Marcus section)

---

## Phase 5: Production Validation

**Agent Assignments:**
- **Performance testing:** Marcus + Priya
- **Security review:** Architecture-skeptic
- **Final validation:** Orchestrator

### 5.1 Load Testing
**Assignee:** Marcus

- [ ] Run 1-hour sustained load test
  - [ ] 100 citations/minute
  - [ ] Monitor resource usage
  - [ ] Check for memory leaks
  - [ ] Verify no degradation over time

- [ ] Run spike test
  - [ ] Sudden burst to 1000 citations/minute
  - [ ] Verify graceful degradation
  - [ ] Check recovery time

- [ ] Run soak test (24 hours)
  - [ ] Constant moderate load
  - [ ] Monitor for slow leaks
  - [ ] Verify log rotation works

**Success criteria:**
- [ ] No memory leaks (stable RSS over 24h)
- [ ] p95 latency remains <100ms
- [ ] No connection pool exhaustion
- [ ] Graceful degradation under load

### 5.2 Security Validation
**Assignee:** Architecture-skeptic
**Agent invocation:**
```typescript
Task({
  subagent_type: "architecture-skeptic",
  description: "Security review of Marcus platform",
  prompt: "Review the deployed Marcus platform for security issues:

  1. SQL injection vulnerabilities
  2. Process injection risks
  3. Credential exposure
  4. Resource exhaustion attacks
  5. Access control on API endpoints

  Provide severity-rated findings and remediation steps."
})
```

**Security checklist:**
- [ ] All database queries use parameterized statements
- [ ] No shell injection in process spawning
- [ ] Credentials stored in env vars, not code
- [ ] API endpoints have rate limiting
- [ ] Error messages don't leak sensitive data

### 5.3 Final Validation
**Assignee:** Orchestrator
**Agent invocation:**
```typescript
Task({
  subagent_type: "orchestrator",
  description: "Final validation of Marcus platform",
  prompt: "Coordinate final validation of the Marcus citation integrity platform:

  1. Verify all benchmarks pass (Priya)
  2. Confirm architecture review issues resolved (Architecture-skeptic)
  3. Check documentation complete (Wiki-updater)
  4. Validate production readiness (Marcus)

  Generate go/no-go recommendation for production deployment."
})
```

**Final checklist:**
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Benchmarks meet targets
- [ ] Architecture issues resolved
- [ ] Documentation complete
- [ ] Security review passed
- [ ] Load testing successful

---

## Phase 6: Post-Deployment

### 6.1 Monitoring Setup
**Assignee:** Marcus

- [ ] Configure alerts in Grafana
  - [ ] Latency >100ms for 5 minutes
  - [ ] Error rate >1% for 5 minutes
  - [ ] Agent failures >10% for 1 minute
  - [ ] Database connection pool >80% for 5 minutes

- [ ] Set up on-call rotation
- [ ] Create runbook for common issues

### 6.2 Performance Baseline
**Assignee:** Priya

- [ ] Collect 7 days of production metrics
- [ ] Establish performance baselines
- [ ] Document normal operating ranges
- [ ] Set up anomaly detection

### 6.3 Roadmap Update
**Assignee:** Architect
**Agent invocation:**
```typescript
Task({
  subagent_type: "architect",
  description: "Archive Marcus deployment to roadmap",
  prompt: "Archive the completed Marcus platform deployment:

  1. Move from active roadmap to /plans/completed/
  2. Document final metrics and learnings
  3. Update Progress Summary
  4. Create follow-up tasks for:
     - Python script migration (L2)
     - Memory structure simplification (M1)
     - Resource isolation implementation (M4)

  Preserve full deployment history for future reference."
})
```

---

## Risk Mitigation

### Current Risks

**HIGH:**
1. **Premature deployment** - No Python agents exist yet
   - **Mitigation:** Defer until actual need identified

2. **State synchronization bugs** - Conflict resolution missing
   - **Mitigation:** Add versioning before multi-agent use

**MEDIUM:**
3. **Performance unknown** - No real-world testing yet
   - **Mitigation:** Start with small agent count (1-3)

4. **Resource exhaustion** - No isolation implemented
   - **Mitigation:** Add cgroup limits in Phase 2.2

**LOW:**
5. **Scope creep** - Could overlap with Roy's domain
   - **Mitigation:** Clear documentation of boundaries

### Rollback Plan

If deployment fails:
1. Stop all agent processes
2. Restore previous database state
3. Roll back code to last known good commit
4. Document failure mode
5. Engage architecture-skeptic for root cause analysis

---

## Success Metrics

### Functional Requirements
- [ ] Platform can spawn and manage 10+ Python agents
- [ ] Consensus calculation produces consistent results
- [ ] State persists correctly to PostgreSQL
- [ ] Health checks accurately reflect system state

### Performance Requirements
- [ ] Accuracy: >80%
- [ ] F1 Score: >75%
- [ ] Consensus: >80%
- [ ] p95 Latency: <100ms
- [ ] Throughput: >50 citations/sec

### Operational Requirements
- [ ] Uptime: >99.9%
- [ ] Mean time to recovery: <5 minutes
- [ ] Alert response time: <15 minutes
- [ ] Deployment time: <10 minutes

---

## Next Steps

**IMMEDIATE (Before any deployment):**
1. Fix HIGH priority architecture issues (H1, H2)
2. Determine if Python agents are actually needed
3. If not needed, defer Marcus until use case emerges

**IF DEPLOYMENT PROCEEDS:**
1. Execute Phase 1 (Infrastructure Setup)
2. Execute Phase 2 (Core Implementation) with agent assistance
3. Execute Phase 3 (Evaluation) with Priya validation
4. Execute Phase 4 (Production Deployment) with careful monitoring
5. Execute Phase 5 (Validation) before going live
6. Execute Phase 6 (Post-Deployment) for ongoing operations

**RECOMMENDED APPROACH:**
**DEFER** - Keep Marcus dormant until Python agent orchestration is actually needed. When that time comes, use this checklist to deploy systematically with proper testing and validation.

---

## Agent Coordination Matrix

| Phase | Primary Agent | Supporting Agents | Deliverable |
|-------|---------------|-------------------|-------------|
| Pre-deployment | Architecture-skeptic | - | Review report ✅ |
| Phase 1 | Marcus | DevOps | Infrastructure ready |
| Phase 2.1 | Marcus | Roy (review) | Python agent core |
| Phase 2.2 | Marcus | Roy (review) | TypeScript integration |
| Phase 2.3 | Marcus | - | Database schema |
| Phase 2.4 | unit-test-writer | Marcus (context) | Unit tests |
| Phase 2.5 | integration-test-writer | Marcus (context) | Integration tests |
| Phase 3.1 | Marcus | - | Python benchmarks |
| Phase 3.2 | Marcus | - | TypeScript benchmarks |
| Phase 3.3 | Priya | Marcus (data) | Validation report |
| Phase 4 | Marcus | wiki-documentation-updater | Production deployment |
| Phase 5.1 | Marcus, Priya | - | Load test results |
| Phase 5.2 | Architecture-skeptic | - | Security review |
| Phase 5.3 | Orchestrator | All | Go/no-go decision |
| Phase 6 | Architect | Marcus, Priya | Roadmap archival |

---

## Appendix: Agent Invocation Examples

### Creating Python Agent Core
```typescript
Task({
  subagent_type: "marcus",
  description: "Implement citation integrity agent",
  prompt: `Implement the Python citation integrity agent based on MARCUS 3.0 spec:

Location: src/platform/agents/citation_integrity_agent.py

Requirements:
1. CitationBehavior enum with 9 behavior types
2. NestedCitationMemory class with 4-level hierarchy
3. CitationIntegrityAgent class with:
   - analyze_citation() method
   - update_reputation() method
   - _calculate_lss() for Local Surprise Signals
   - _self_modify_weights() for meta-learning

4. Platform integration:
   - PostgreSQL state persistence
   - Redis caching
   - Async operation support

Include comprehensive docstrings and type hints.`
})
```

### Creating TypeScript Integration
```typescript
Task({
  subagent_type: "marcus",
  description: "Implement TypeScript orchestration layer",
  prompt: `Implement the TypeScript integration layer for Python citation agents:

Location: src/platform/integration/citationAgentIntegration.ts

Components:
1. PythonAgentWrapper - spawn/manage Python processes
2. AgentStateManager - PostgreSQL + Redis state sync
3. CitationAgentOrchestrator - multi-agent coordination
4. MetricsCollector - Prometheus metrics

Requirements:
- Proper error handling (fail loudly, no silent fallbacks)
- Resource cleanup in finally blocks
- Type-safe interfaces throughout
- Health monitoring and graceful degradation

Fix H2 issue: Add version-based conflict resolution to state sync.`
})
```

### Benchmark Validation
```typescript
Task({
  subagent_type: "priya",
  description: "Validate Marcus platform benchmarks",
  prompt: `Analyze benchmark results from the citation integrity platform:

Results location: /results/benchmarks/

Validate against targets:
- Accuracy: >80% (actual: ${results.accuracy})
- F1 Score: >75% (actual: ${results.f1})
- Consensus: >80% (actual: ${results.consensus})
- p95 Latency: <100ms (actual: ${results.latencyP95}ms)
- Throughput: >50/sec (actual: ${results.throughput}/sec)

Provide:
1. Statistical significance tests vs baselines
2. Gap analysis for any failing metrics
3. Quantitative recommendations for tuning
4. Determinism validation (CV < 0.01%)

Be data-driven and precise.`
})
```

---

**STATUS:** Checklist created, awaiting deployment decision
**RECOMMENDATION:** Defer deployment until Python agent orchestration is actually needed
**CONTACT:** Marcus (platform-engineer) for questions
