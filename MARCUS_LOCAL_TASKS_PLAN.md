# MARCUS 3.0 - Local Tasks Plan (No Cloud Required)

**Date:** November 21, 2025
**Branch:** `claude/build-marcus-agent-016LTPXuAb6A3hYDwTvMjyof`
**Status:** 🚀 READY TO EXECUTE

---

## 📋 Executive Summary

**Objective:** Complete all Phase 4+ tasks that can be executed locally without cloud infrastructure provisioning.

**Scope:** Docker builds, security testing, load testing preparation, Kubernetes manifest preparation

**Time Estimate:** 2-4 days (16-32 hours)

**Why this matters:** These tasks prepare MARCUS 3.0 for rapid deployment when cloud infrastructure is provisioned. They identify and fix security issues early, validate Docker builds, and ensure manifests are correct.

---

## ✅ Prerequisites (Already Complete)

- ✅ Phase 1: Platform Deployment
- ✅ Phase 2: Security Hardening
- ✅ Phase 3: Performance & Monitoring (all 4 sub-phases)
- ✅ Local VM operational (marcus-test-vm or equivalent)
- ✅ MARCUS 3.0 running locally on port 3000

---

## 🎯 Local Tasks (No Cloud Required)

### Category A: Docker Image Building & Testing

#### A.1 Build TypeScript/Node.js Docker Image
**From:** Task 6.9 in Consolidated Checklist
**Status:** Not started
**Time:** 🕐 2-3 hours
**Priority:** HIGH

**Tasks:**
- [ ] Review existing Dockerfile (create if missing)
- [ ] Build image: `docker build -t marcus-platform:v3.0.0 -f Dockerfile .`
- [ ] Verify image size (<500 MB target)
- [ ] Test image locally:
  ```bash
  docker run -d --name marcus-test \
    -p 3000:3000 \
    --env-file .env \
    marcus-platform:v3.0.0
  ```
- [ ] Verify health endpoint: `curl http://localhost:3000/health`
- [ ] Check logs: `docker logs marcus-test`
- [ ] Stop and remove: `docker stop marcus-test && docker rm marcus-test`

**Success Criteria:**
- ✅ Image builds successfully (<10 minutes)
- ✅ Image size <500 MB
- ✅ Container starts and health check passes
- ✅ API endpoints responsive

**Blockers:** None

---

#### A.2 Build Python Agent Docker Image
**From:** Task 6.18 in Consolidated Checklist
**Status:** Not started
**Time:** 🕐 2-3 hours
**Priority:** HIGH

**Tasks:**
- [ ] Review Python agent code: `src/platform/agents/citation_integrity_agent.py`
- [ ] Create/review Dockerfile for Python agents
- [ ] Build image: `docker build -t marcus-python-agent:v3.0.0 -f Dockerfile.agent .`
- [ ] Verify image size (<300 MB target)
- [ ] Test single agent:
  ```bash
  docker run -d --name agent-test \
    --env-file .env \
    marcus-python-agent:v3.0.0
  ```
- [ ] Verify agent logs: `docker logs agent-test`
- [ ] Test IPC communication with API server
- [ ] Stop and remove: `docker stop agent-test && docker rm agent-test`

**Success Criteria:**
- ✅ Agent image builds successfully
- ✅ Agent starts and connects to API server
- ✅ IPC communication works
- ✅ Agent processes test citation request

**Blockers:** None

---

#### A.3 Multi-Container Testing (Docker Compose)
**Status:** Not started
**Time:** 🕐 1-2 hours
**Priority:** MEDIUM

**Tasks:**
- [ ] Create/review `docker-compose.yml`:
  - API server (marcus-platform:v3.0.0)
  - 3 Python agents (marcus-python-agent:v3.0.0)
  - PostgreSQL (existing)
  - Redis (existing)
- [ ] Start stack: `docker-compose up -d`
- [ ] Verify all containers running: `docker-compose ps`
- [ ] Test citation analysis end-to-end
- [ ] Check agent orchestration
- [ ] Stop stack: `docker-compose down`

**Success Criteria:**
- ✅ All containers start successfully
- ✅ Citation analysis works end-to-end
- ✅ Multi-agent orchestration functional

**Blockers:** Requires A.1 and A.2 complete

---

### Category B: Security Testing

#### B.1 Automated Security Scanning
**From:** Task 9.1-9.4 in Consolidated Checklist
**Status:** Not started
**Time:** 🕐 4-6 hours
**Priority:** HIGH

**Tasks:**

**B.1.1 OWASP ZAP Scan**
- [ ] Install OWASP ZAP:
  ```bash
  docker pull owasp/zap2docker-stable
  ```
- [ ] Run baseline scan against local instance:
  ```bash
  docker run -t owasp/zap2docker-stable zap-baseline.py \
    -t http://localhost:3000 \
    -r zap-report-baseline.html
  ```
- [ ] Review findings in `zap-report-baseline.html`
- [ ] Document CRITICAL/HIGH findings
- [ ] Create remediation plan for HIGH/CRITICAL issues

**B.1.2 Dependency Vulnerability Scan**
- [ ] Run npm audit:
  ```bash
  npm audit --production > security/npm-audit-$(date +%Y%m%d).txt
  ```
- [ ] Review findings, prioritize CRITICAL/HIGH
- [ ] Run Python audit:
  ```bash
  pip-audit -r requirements.txt > security/pip-audit-$(date +%Y%m%d).txt
  ```
- [ ] Document vulnerabilities requiring fixes

**B.1.3 Container Image Scan**
- [ ] Install trivy:
  ```bash
  curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
  ```
- [ ] Scan TypeScript image:
  ```bash
  trivy image marcus-platform:v3.0.0 > security/trivy-api-$(date +%Y%m%d).txt
  ```
- [ ] Scan Python agent image:
  ```bash
  trivy image marcus-python-agent:v3.0.0 > security/trivy-agent-$(date +%Y%m%d).txt
  ```
- [ ] Review findings, prioritize CRITICAL/HIGH

**B.1.4 Remediation**
- [ ] Fix all CRITICAL findings (must fix before deployment)
- [ ] Fix HIGH findings (strong recommendation)
- [ ] Document MEDIUM/LOW findings with risk acceptance

**Success Criteria:**
- ✅ Zero CRITICAL security findings
- ✅ All HIGH findings remediated or documented
- ✅ Security scan reports archived in `security/` directory

**Blockers:** Requires A.1, A.2 complete for container scanning

---

#### B.2 Manual Penetration Testing
**From:** Task 9.5-9.10 in Consolidated Checklist
**Status:** Not started
**Time:** 📅 1 day (8 hours)
**Priority:** MEDIUM

**Tasks:**

**B.2.1 Authentication Bypass Testing**
- [ ] Test JWT with modified signature → expect 401
- [ ] Test expired JWT → expect 401
- [ ] Test SQL injection in login: `' OR '1'='1` → expect blocked
- [ ] Test missing authorization header → expect 401
- [ ] Test malformed JWT → expect 401

**B.2.2 Authorization Flaw Testing**
- [ ] Create 2 test users (User A, User B)
- [ ] Test User A accessing User B's citations → expect 403
- [ ] Test regular user accessing admin endpoint → expect 403
- [ ] Test IDOR attacks → expect ownership enforcement
- [ ] Test role escalation attempts → expect blocked

**B.2.3 Input Validation Testing**
- [ ] Send 10 MB JSON payload → expect 413
- [ ] Send malformed JSON → expect 400
- [ ] Test XSS payload: `<script>alert(1)</script>` → expect escaped
- [ ] Test path traversal: `../../../../etc/passwd` → expect blocked
- [ ] Test SQL injection in all inputs → expect blocked

**B.2.4 Rate Limiting Testing**
- [ ] Send 150 login requests in 1 minute → expect 429 after 100
- [ ] Verify different IPs are independent
- [ ] Test X-Forwarded-For spoofing → expect blocked
- [ ] Test rate limit bypass attempts

**B.2.5 Security Headers Testing**
- [ ] Verify CSP header present
- [ ] Verify HSTS header present
- [ ] Verify X-Frame-Options: DENY
- [ ] Test iframe embedding → expect blocked
- [ ] Verify X-Content-Type-Options: nosniff

**B.2.6 Password Security Testing**
- [ ] Test weak password rejection (e.g., "password")
- [ ] Test common password rejection (e.g., "Password123!")
- [ ] Test password reset token expiration (2 hours)
- [ ] Verify single-use reset tokens
- [ ] Test password reset rate limiting

**Success Criteria:**
- ✅ All authentication bypass attempts blocked
- ✅ All authorization flaws addressed
- ✅ Input validation working correctly
- ✅ Rate limiting effective
- ✅ Security headers properly configured
- ✅ Password security compliant

**Documentation:**
- Create `security/penetration-test-results-$(date +%Y%m%d).md`
- Document all findings with severity and remediation status

**Blockers:** None (can test against local instance)

---

### Category C: Load Testing Preparation

#### C.1 k6 Load Testing Tool Setup
**From:** Task 8.1-8.2 in Consolidated Checklist
**Status:** Not started
**Time:** ⚡ 1 hour
**Priority:** MEDIUM

**Tasks:**
- [ ] Install k6:
  ```bash
  # Ubuntu/Debian
  sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
    --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
  echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | \
    sudo tee /etc/apt/sources.list.d/k6.list
  sudo apt-get update
  sudo apt-get install k6
  ```
- [ ] Verify installation: `k6 version`
- [ ] Test with sample script:
  ```bash
  k6 run tests/load/api-load-test.js
  ```

**Success Criteria:**
- ✅ k6 installed successfully
- ✅ Sample test runs without errors

**Blockers:** None

---

#### C.2 Define Extended Load Test Scenarios
**From:** Task 8.2 in Consolidated Checklist
**Status:** Not started
**Time:** 🕐 2 hours
**Priority:** MEDIUM

**Tasks:**
- [ ] Review existing scenarios in `tests/load/api-load-test.js`
- [ ] Create extended scenarios:
  - 70% citation analysis
  - 20% code attribution
  - 10% authentication/authorization
- [ ] Define workload distribution
- [ ] Create scenario matrix:
  - Baseline: 10 RPS for 5 minutes
  - Sustained: 50 RPS for 15 minutes
  - Spike: 0→100 RPS spike
  - Stress: Gradual ramp to 200 RPS

**Deliverable:**
- [ ] Updated `tests/load/extended-scenarios.js`
- [ ] Scenario documentation in `tests/load/README.md`

**Success Criteria:**
- ✅ Scenarios reflect production workload distribution
- ✅ All scenarios documented
- ✅ Baseline metrics defined

**Blockers:** None

---

#### C.3 Run Load Tests Against Local Instance
**From:** Task 8.3-8.13 (adapted for local)
**Status:** Not started
**Time:** 🕐 4-6 hours
**Priority:** LOW (can be done after cloud deployment too)

**Tasks:**
- [ ] Run baseline test (10 RPS × 5 min)
- [ ] Run sustained test (50 RPS × 15 min)
- [ ] Run spike test (0→100 RPS spike)
- [ ] Monitor local metrics:
  - API error rate
  - P95 latency
  - Database CPU (via `top` or `htop`)
  - Redis memory usage
- [ ] Document results in `benchmarks/local-load-test-$(date +%Y%m%d).md`

**Success Criteria:**
- ✅ Baseline test completes without errors
- ✅ Sustained test maintains <2% error rate
- ✅ Spike test shows graceful degradation (not crashes)
- ✅ Results documented

**Blockers:** Requires C.1, C.2 complete

**Note:** Local results will differ from cloud (single VM vs distributed infrastructure), but this validates the test suite works correctly.

---

### Category D: Kubernetes Manifest Preparation

#### D.1 Review and Update Kubernetes Manifests
**Status:** Not started
**Time:** 🕐 2-3 hours
**Priority:** MEDIUM

**Tasks:**
- [ ] Verify `k8s/` directory exists (create if missing)
- [ ] Review/create deployment manifest: `k8s/marcus-deployment.yaml`
  - Resource limits (CPU: 1000m, Memory: 2Gi)
  - Replica count: 2
  - Health check probes
  - Environment variables
- [ ] Review/create service manifest: `k8s/marcus-service.yaml`
  - Service type: ClusterIP
  - Port mappings
- [ ] Review/create ingress manifest: `k8s/marcus-ingress.yaml`
  - SSL/TLS configuration
  - Path routing
- [ ] Review/create ConfigMap: `k8s/marcus-configmap.yaml`
  - Non-sensitive configuration
- [ ] Review/create Secret template: `k8s/marcus-secrets.yaml.template`
  - Placeholder for JWT secrets, DB passwords
  - Document required secrets
- [ ] Validate YAML syntax:
  ```bash
  yamllint k8s/*.yaml
  ```

**Success Criteria:**
- ✅ All manifests present and syntactically valid
- ✅ Resource limits appropriate
- ✅ Health checks configured
- ✅ Documentation complete

**Blockers:** None

---

#### D.2 Validate Manifests (Dry Run)
**Status:** Not started
**Time:** ⚡ 30 minutes
**Priority:** LOW (requires kubectl)

**Tasks:**
- [ ] Install kubectl (if not present)
- [ ] Validate manifests:
  ```bash
  kubectl apply --dry-run=client -f k8s/
  ```
- [ ] Fix any validation errors
- [ ] Document required secrets/configmaps

**Success Criteria:**
- ✅ All manifests pass dry-run validation
- ✅ No syntax errors

**Blockers:** Requires D.1 complete

**Note:** This validates syntax only, not runtime behavior (requires actual K8s cluster).

---

### Category E: Database & Operational Tasks

#### E.1 PostgreSQL Port Migration (Pending)
**From:** Phase 2 carryover
**Status:** ⚠️ Blocked by VM access
**Time:** ⚡ 5 minutes
**Priority:** MEDIUM (not a blocker, but good practice)

**Tasks:**
- [ ] SSH to VM: `ssh <username>@marcus-test-vm`
- [ ] Run migration script:
  ```bash
  cd ~/ai_game_theory_simulation
  sudo ./scripts/migrate_postgres_port.sh
  ```
- [ ] Verify migration: `sudo -u postgres psql -tAc "SHOW port;"`
- [ ] Restart MARCUS: `NODE_ENV=development npx tsx src/platform/startup.ts`
- [ ] Run tests: `npm test`

**Success Criteria:**
- ✅ PostgreSQL listening on port 5432 (standard)
- ✅ All tests passing after migration
- ✅ MARCUS operational

**Blockers:** Requires VM access with sudo privileges

**Note:** Migration script is ready, just needs execution.

---

#### E.2 Local Backup & Restore Testing
**Status:** Not started
**Time:** 🕐 2 hours
**Priority:** LOW

**Tasks:**
- [ ] Create backup script: `scripts/backup_marcus_local.sh`
  - PostgreSQL dump
  - Redis RDB snapshot
  - .env file
  - SSL certificates (if any)
- [ ] Test backup creation
- [ ] Verify backup integrity
- [ ] Create restore script: `scripts/restore_marcus_local.sh`
- [ ] Test restore on clean VM/container
- [ ] Document backup/restore procedures

**Success Criteria:**
- ✅ Backup script creates complete snapshot
- ✅ Restore script successfully restores from backup
- ✅ Procedures documented

**Blockers:** None

---

### Category F: Documentation & Reporting

#### F.1 Create Security Test Report Template
**Status:** Not started
**Time:** ⚡ 30 minutes
**Priority:** LOW

**Tasks:**
- [ ] Create template: `docs/templates/security-test-report.md`
  - Executive summary
  - Findings by severity (CRITICAL, HIGH, MEDIUM, LOW)
  - Remediation status
  - Recommendations
- [ ] Document security testing procedures

**Success Criteria:**
- ✅ Template created and ready for use

**Blockers:** None

---

#### F.2 Update Master Checklist with Progress
**Status:** Not started
**Time:** ⚡ 15 minutes (after each task)
**Priority:** HIGH

**Tasks:**
- [ ] Mark completed tasks in `docs/MARCUS_CONSOLIDATED_TASK_CHECKLIST.md`
- [ ] Update completion percentages
- [ ] Document any new findings or blockers

**Success Criteria:**
- ✅ Checklist reflects current status

**Blockers:** None

---

## 📊 Summary Matrix

| Task | Category | Priority | Time | Blockers | Can Do Locally |
|------|----------|----------|------|----------|----------------|
| A.1 | Docker Build | HIGH | 2-3h | None | ✅ Yes |
| A.2 | Docker Build | HIGH | 2-3h | None | ✅ Yes |
| A.3 | Docker Test | MEDIUM | 1-2h | A.1, A.2 | ✅ Yes |
| B.1 | Security Scan | HIGH | 4-6h | A.1, A.2 | ✅ Yes |
| B.2 | Pentest | MEDIUM | 8h | None | ✅ Yes |
| C.1 | Load Test Setup | MEDIUM | 1h | None | ✅ Yes |
| C.2 | Load Test Scenarios | MEDIUM | 2h | None | ✅ Yes |
| C.3 | Local Load Test | LOW | 4-6h | C.1, C.2 | ✅ Yes |
| D.1 | K8s Manifests | MEDIUM | 2-3h | None | ✅ Yes |
| D.2 | K8s Validation | LOW | 30m | D.1 | ✅ Yes |
| E.1 | Port Migration | MEDIUM | 5m | VM access | ⚠️ Needs VM |
| E.2 | Backup/Restore | LOW | 2h | None | ✅ Yes |
| F.1 | Doc Template | LOW | 30m | None | ✅ Yes |
| F.2 | Update Checklist | HIGH | 15m | None | ✅ Yes |

---

## 🎯 Recommended Execution Order

### Day 1 (6-8 hours): Docker & Initial Security
1. **A.1** - Build TypeScript Docker image (2-3h)
2. **A.2** - Build Python agent Docker image (2-3h)
3. **A.3** - Multi-container testing (1-2h)
4. **B.1.1** - Run OWASP ZAP scan (1h)

### Day 2 (6-8 hours): Security Testing
5. **B.1.2** - Dependency vulnerability scans (1h)
6. **B.1.3** - Container image scans (1h)
7. **B.1.4** - Remediate CRITICAL/HIGH findings (2-4h)
8. **B.2** - Manual penetration testing (8h if time permits, or Day 3)

### Day 3 (4-6 hours): Load Testing & K8s
9. **C.1** - Install k6 (1h)
10. **C.2** - Define test scenarios (2h)
11. **C.3** - Run local load tests (4-6h, optional)
12. **D.1** - Review K8s manifests (2-3h)

### Day 4 (2-4 hours): Operational & Documentation
13. **D.2** - Validate K8s manifests (30m)
14. **E.1** - PostgreSQL port migration (5m, if VM access available)
15. **E.2** - Backup/restore testing (2h, optional)
16. **F.1** - Security report template (30m)
17. **F.2** - Update checklist (15m)

---

## 📈 Success Metrics

**Critical Path (Must Complete):**
- ✅ TypeScript Docker image builds and runs
- ✅ Python agent Docker image builds and runs
- ✅ Zero CRITICAL security findings
- ✅ All HIGH security findings remediated or documented

**Recommended (Should Complete):**
- ✅ Multi-container testing passes
- ✅ Kubernetes manifests validated
- ✅ Load testing tools installed and configured

**Optional (Nice to Have):**
- ✅ Local load tests executed
- ✅ Backup/restore procedures tested
- ✅ PostgreSQL port migrated

---

## 🚀 Post-Completion Status

**When all tasks complete, MARCUS 3.0 will have:**
- ✅ Production-ready Docker images
- ✅ Security validated (zero CRITICAL issues)
- ✅ Load testing tools ready
- ✅ Kubernetes manifests prepared
- ✅ Backup/restore procedures documented

**Ready for:** Cloud infrastructure provisioning (Phase 4) → Immediate deployment when cloud is ready

---

## 📁 Deliverables

**Docker Images:**
- `marcus-platform:v3.0.0` (TypeScript API server)
- `marcus-python-agent:v3.0.0` (Python citation integrity agents)

**Security Reports:**
- `security/zap-report-baseline.html` (OWASP ZAP)
- `security/npm-audit-YYYYMMDD.txt` (Node.js dependencies)
- `security/pip-audit-YYYYMMDD.txt` (Python dependencies)
- `security/trivy-api-YYYYMMDD.txt` (API container scan)
- `security/trivy-agent-YYYYMMDD.txt` (Agent container scan)
- `security/penetration-test-results-YYYYMMDD.md` (Manual testing)

**Load Testing:**
- `tests/load/extended-scenarios.js` (Scenario definitions)
- `benchmarks/local-load-test-YYYYMMDD.md` (Results)

**Kubernetes:**
- `k8s/marcus-deployment.yaml`
- `k8s/marcus-service.yaml`
- `k8s/marcus-ingress.yaml`
- `k8s/marcus-configmap.yaml`
- `k8s/marcus-secrets.yaml.template`

**Documentation:**
- `docs/templates/security-test-report.md`
- Updated `docs/MARCUS_CONSOLIDATED_TASK_CHECKLIST.md`

---

## 🆘 Troubleshooting

**Docker build fails:**
- Check Dockerfile syntax
- Verify all dependencies in package.json/requirements.txt
- Check Docker disk space: `docker system df`

**Security scans report false positives:**
- Document in security report with justification
- Consider version updates for dependencies
- Accept risk for LOW/MEDIUM findings if justified

**Load tests fail:**
- Check local VM resources (CPU, memory)
- Verify MARCUS is running: `curl http://localhost:3000/health`
- Check logs: `journalctl -u marcus-platform -f`

**Kubernetes validation fails:**
- Check YAML syntax: `yamllint k8s/*.yaml`
- Verify resource limits are realistic
- Check secret references are correct

---

## 📚 References

**Primary Documents:**
- `docs/MARCUS_CONSOLIDATED_TASK_CHECKLIST.md` (96 tasks, prioritized)
- `MARCUS_3.0_STATUS_SUMMARY.md` (Phase 3 completion summary)
- `src/platform/README.md` (Platform architecture)

**Security:**
- `docs/SECURITY_IMPROVEMENTS.md` (OWASP compliance)
- `docs/MARCUS_SECURITY_CHECKLIST.md` (Pre-deployment validation)

**Testing:**
- `docs/MARCUS_TEST_SUITE.md` (Complete test documentation)
- `scripts/test_marcus_complete.sh` (System validation)

---

**Created:** November 21, 2025
**Last Updated:** November 21, 2025
**Status:** 🚀 READY FOR EXECUTION

---

*All local tasks can be executed immediately without waiting for cloud infrastructure decisions.*
