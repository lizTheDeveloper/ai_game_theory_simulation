# MARCUS 3.0 Operational Deployment Checklist

**Status:** Development Complete (83% of roadmap) | Ready for Infrastructure Deployment

**Purpose:** Step-by-step checklist for deploying MARCUS 3.0 to production infrastructure and completing operational validation.

---

## Phase 7 Operational Tasks (Remaining 9/12 Tasks)

### Documentation Tasks (Optional - Can be completed post-deployment)

#### Task 7.3: Deployment Guide
- [ ] Document step-by-step cloud provider setup (AWS/GCP/Azure)
- [ ] Create Terraform/CloudFormation infrastructure-as-code templates
- [ ] Document DNS and SSL certificate provisioning
- [ ] Create database migration execution guide
- [ ] Document secrets management setup (AWS Secrets Manager/Google Secret Manager/HashiCorp Vault)
- [ ] Create rollback procedures for each deployment step
- [ ] Add troubleshooting guide for common deployment issues
**Estimated time:** 1-2 days
**Dependencies:** Choice of cloud provider

#### Task 7.4: Architecture Diagrams
- [ ] Create system architecture diagram (Mermaid/PlantUML)
  - API Gateway → Load Balancer → App Servers → Database Cluster
  - Redis cluster for rate limiting and caching
  - Monitoring stack (Prometheus/Grafana/Jaeger)
- [ ] Create sequence diagrams for key flows:
  - Citation analysis request (multi-agent consensus)
  - Code attribution request (plagiarism detection)
  - Authentication flow (JWT with refresh tokens)
  - Password reset flow
- [ ] Create data flow diagrams:
  - Agent orchestration and state management
  - Database replication topology
  - Metrics collection pipeline
- [ ] Create deployment topology diagram (Kubernetes pods, services, ingresses)
**Estimated time:** 1 day
**Dependencies:** None (can be done now)

#### Task 7.5: Performance Tuning Guide
- [ ] Database optimization guide:
  - Index strategy for citation_analyses table
  - Query optimization for agent_states aggregations
  - PostgreSQL autovacuum tuning for high-write workload
  - Connection pool sizing calculations
- [ ] Caching strategy documentation:
  - Redis TTL recommendations for different data types
  - Cache invalidation patterns
  - Write-through vs write-back tradeoffs
- [ ] Application tuning guide:
  - Node.js event loop optimization
  - Python agent process pool sizing
  - Memory limits for agent containers
- [ ] Load balancer configuration:
  - Session affinity for stateful agent requests
  - Health check intervals
  - Connection timeouts
**Estimated time:** 1-2 days
**Dependencies:** Load testing results (Task 7.8)

#### Task 7.11: Production Communication Plan
- [ ] Create stakeholder announcement template
- [ ] Document launch timeline and milestones
- [ ] Create status page for service availability
- [ ] Set up incident communication channels (Slack/email)
- [ ] Create post-mortem template for incidents
**Estimated time:** 0.5 days
**Dependencies:** None

---

### Infrastructure Provisioning Tasks (Required before operational validation)

#### Prerequisites: Cloud Provider Setup
- [ ] **Choose cloud provider:** AWS / GCP / Azure
- [ ] **Create cloud account** with billing alerts
- [ ] **Set up VPC/Virtual Network** with public and private subnets
- [ ] **Configure network security groups:**
  - Allow HTTPS (443) from Internet to load balancer
  - Allow internal traffic between app servers and databases
  - Deny all other inbound traffic
- [ ] **Provision SSL certificates** (Let's Encrypt or cloud provider managed certs)
- [ ] **Set up DNS** pointing to load balancer IP
- [ ] **Configure secrets management** (AWS Secrets Manager / Google Secret Manager / Vault)
  - Store JWT signing keys
  - Store database credentials
  - Store OAuth client secrets
  - Store encryption keys for password reset tokens

**Estimated time:** 1-2 days
**Cost estimate:** $100-500/month depending on scale

#### Infrastructure: Kubernetes Cluster
- [ ] **Create Kubernetes cluster:**
  - 3+ nodes for high availability
  - Node size: 4 vCPU, 16 GB RAM minimum
  - Auto-scaling enabled (3-10 nodes)
- [ ] **Install Istio service mesh:**
  ```bash
  istioctl install --set profile=production
  kubectl label namespace default istio-injection=enabled
  ```
- [ ] **Deploy cert-manager** for automatic SSL rotation
- [ ] **Set up ingress controller** (nginx-ingress or cloud provider's)
- [ ] **Configure horizontal pod autoscaling:**
  - Min 2 replicas, max 10 replicas
  - CPU target: 70%
  - Memory target: 80%

**Estimated time:** 1 day
**Dependencies:** Cloud provider setup
**Cost estimate:** $150-400/month for cluster

#### Infrastructure: PostgreSQL Database
- [ ] **Provision managed PostgreSQL** (RDS/Cloud SQL/Azure Database):
  - Version: 15+ (latest stable)
  - Instance size: db.t3.medium or equivalent (2 vCPU, 4 GB RAM)
  - Storage: 100 GB SSD with auto-scaling enabled
  - Multi-AZ deployment for high availability
  - Automated backups: daily, 7-day retention
  - Point-in-time recovery enabled
- [ ] **Configure read replicas** (1-2 replicas):
  - Same instance size as primary
  - Cross-AZ for disaster recovery
  - Replication lag alerts (<10 seconds)
- [ ] **Set up connection pooling** (PgBouncer):
  - Pool size: 20-50 connections per app server
  - Pool mode: transaction (for multi-agent workloads)
- [ ] **Apply database migrations:**
  ```bash
  psql -h <db-host> -U marcus_admin -d marcus_production -f src/platform/database/migrations/001_initial_schema.sql
  psql -h <db-host> -U marcus_admin -d marcus_production -f src/platform/database/migrations/002_agent_state_management.sql
  psql -h <db-host> -U marcus_admin -d marcus_production -f src/platform/database/migrations/003_csp_violations.sql
  psql -h <db-host> -U marcus_admin -d marcus_production -f src/platform/database/migrations/004_password_reset_tokens.sql
  ```
- [ ] **Create database users:**
  - `marcus_app` (read/write on tables, no DDL)
  - `marcus_readonly` (read-only for reporting)
  - `marcus_admin` (full access for migrations)

**Estimated time:** 0.5 days
**Dependencies:** Cloud provider setup
**Cost estimate:** $100-300/month

#### Infrastructure: Redis Cluster
- [ ] **Provision managed Redis** (ElastiCache/MemoryStore/Azure Cache):
  - Version: 7.0+
  - Instance type: cache.t3.medium or equivalent (2 vCPU, 3.09 GB RAM)
  - Cluster mode enabled (3-6 shards)
  - Multi-AZ replication
  - Automatic failover enabled
- [ ] **Configure persistence:**
  - RDB snapshots: hourly
  - AOF enabled for durability
- [ ] **Set up eviction policy:** `allkeys-lru` (evict least recently used keys when memory full)
- [ ] **Create Redis namespaces:**
  - `ratelimit:*` (rate limiting counters, TTL 60 seconds)
  - `session:*` (JWT refresh tokens, TTL 7 days)
  - `cache:*` (API response cache, TTL 5 minutes)
  - `csp:*` (CSP violation deduplication, TTL 1 minute)

**Estimated time:** 0.5 days
**Dependencies:** Cloud provider setup
**Cost estimate:** $50-150/month

#### Infrastructure: Monitoring Stack
- [ ] **Deploy Prometheus:**
  ```bash
  kubectl apply -f k8s/prometheus-deployment.yaml
  ```
  - Scrape interval: 15 seconds
  - Retention: 15 days
  - Storage: 50 GB persistent volume
- [ ] **Deploy Grafana:**
  ```bash
  kubectl apply -f k8s/grafana-deployment.yaml
  ```
  - Pre-load dashboards from `k8s/grafana-dashboards/`
  - Configure Prometheus data source
  - Set up alerting (email/Slack/PagerDuty)
- [ ] **Deploy Jaeger** (distributed tracing):
  ```bash
  kubectl apply -f k8s/jaeger-deployment.yaml
  ```
  - Sampling rate: 10% (adjust based on traffic)
  - Storage: Elasticsearch or Cassandra backend
- [ ] **Configure alerts:**
  - Error rate >5% for 5 minutes → PagerDuty
  - Database connection pool >90% → Slack
  - API latency P95 >500ms → Slack
  - Pod crash loop → PagerDuty
  - Certificate expiry <30 days → Email

**Estimated time:** 1 day
**Dependencies:** Kubernetes cluster
**Cost estimate:** $50-100/month

---

### Task 7.6: Execute Deployment Checklist (Phases 1-6)

**Goal:** Deploy MARCUS 3.0 to production infrastructure following documented procedures.

**Prerequisites:**
- [ ] All infrastructure provisioned (Kubernetes, PostgreSQL, Redis, Monitoring)
- [ ] SSL certificates issued and configured
- [ ] DNS pointing to load balancer
- [ ] Secrets stored in secrets manager

**Deployment Steps:**

#### Phase 1: Database Setup (Pre-deployment)
- [ ] Verify database connectivity from Kubernetes cluster
- [ ] Run all migrations (001-004) in order
- [ ] Verify schema with `\dt` and `\d <table_name>`
- [ ] Create database users (app, readonly, admin)
- [ ] Grant appropriate permissions
- [ ] Test connection from app container:
  ```bash
  kubectl run -it --rm psql-test --image=postgres:15 --restart=Never -- psql -h <db-host> -U marcus_app -d marcus_production -c "SELECT 1;"
  ```

**Estimated time:** 1 hour

#### Phase 2: Secrets Configuration
- [ ] Store secrets in secrets manager:
  ```bash
  # AWS example
  aws secretsmanager create-secret --name marcus/jwt-secret --secret-string "$(openssl rand -hex 32)"
  aws secretsmanager create-secret --name marcus/db-password --secret-string "<secure-password>"
  ```
- [ ] Configure Kubernetes secrets from secrets manager:
  ```bash
  kubectl create secret generic marcus-secrets \
    --from-literal=JWT_SECRET="$(aws secretsmanager get-secret-value --secret-id marcus/jwt-secret --query SecretString --output text)" \
    --from-literal=DB_PASSWORD="$(aws secretsmanager get-secret-value --secret-id marcus/db-password --query SecretString --output text)"
  ```
- [ ] Verify secrets mounted in pod:
  ```bash
  kubectl exec -it <pod-name> -- env | grep JWT_SECRET
  ```

**Estimated time:** 1 hour

#### Phase 3: Application Deployment
- [ ] Build Docker image:
  ```bash
  docker build -t marcus-platform:v3.0.0 -f src/platform/Dockerfile .
  ```
- [ ] Push to container registry:
  ```bash
  docker tag marcus-platform:v3.0.0 <registry>/marcus-platform:v3.0.0
  docker push <registry>/marcus-platform:v3.0.0
  ```
- [ ] Deploy to Kubernetes:
  ```bash
  kubectl apply -f k8s/marcus-deployment.yaml
  ```
- [ ] Verify pods are running:
  ```bash
  kubectl get pods -l app=marcus-platform
  kubectl logs -f <pod-name>
  ```
- [ ] Check health endpoint:
  ```bash
  kubectl port-forward <pod-name> 3000:3000
  curl http://localhost:3000/health
  ```

**Estimated time:** 2 hours

#### Phase 4: Networking & Ingress
- [ ] Deploy service:
  ```bash
  kubectl apply -f k8s/marcus-service.yaml
  ```
- [ ] Deploy ingress with SSL:
  ```bash
  kubectl apply -f k8s/marcus-ingress.yaml
  ```
- [ ] Verify SSL certificate:
  ```bash
  curl -I https://marcus.yourdomain.com/health
  ```
- [ ] Test external access:
  ```bash
  curl https://marcus.yourdomain.com/health
  ```

**Estimated time:** 1 hour

#### Phase 5: Python Agent Deployment
- [ ] Build Python agent Docker image:
  ```bash
  docker build -t marcus-python-agents:v3.0.0 -f src/platform/integration/agents/Dockerfile .
  ```
- [ ] Deploy agent pool (9 agents for citation integrity):
  ```bash
  kubectl apply -f k8s/python-agents-deployment.yaml
  ```
- [ ] Verify agent startup:
  ```bash
  kubectl logs -f <agent-pod-name>
  ```
- [ ] Test agent orchestration:
  ```bash
  curl -X POST https://marcus.yourdomain.com/api/citations/analyze \
    -H "Content-Type: application/json" \
    -d '{"text": "Test claim", "claimedSource": "Test source"}'
  ```

**Estimated time:** 2 hours

#### Phase 6: Monitoring & Alerting
- [ ] Verify Prometheus is scraping metrics:
  ```bash
  kubectl port-forward -n monitoring svc/prometheus 9090:9090
  # Open http://localhost:9090/targets - all should be UP
  ```
- [ ] Verify Grafana dashboards:
  ```bash
  kubectl port-forward -n monitoring svc/grafana 3000:3000
  # Open http://localhost:3000 - check all dashboards load
  ```
- [ ] Test alert firing:
  ```bash
  # Trigger test alert by stopping a pod
  kubectl scale deployment marcus-platform --replicas=0
  # Check Slack/email for alert
  kubectl scale deployment marcus-platform --replicas=3
  ```
- [ ] Verify Jaeger traces:
  ```bash
  kubectl port-forward -n monitoring svc/jaeger-query 16686:16686
  # Open http://localhost:16686 - check traces appear
  ```

**Estimated time:** 2 hours

**Total deployment time:** ~1 day

---

### Task 7.7: 7-Day Production Pilot

**Goal:** Run MARCUS 3.0 with limited production traffic to validate stability before full launch.

**Prerequisites:**
- [ ] Deployment complete (Task 7.6)
- [ ] Monitoring dashboards configured
- [ ] On-call rotation established

**Pilot Plan:**

#### Week 1: Limited Beta (Days 1-7)
- [ ] **Day 1: Invite 10 beta users**
  - Create beta user accounts
  - Send onboarding emails with API documentation
  - Monitor error rates every hour
  - **Success criteria:** Error rate <1%, P95 latency <200ms

- [ ] **Day 2-3: Monitor baseline metrics**
  - Track requests per minute (expected: 10-50 RPM)
  - Track database query performance (P95 <50ms)
  - Track agent response times (P95 <2 seconds for 9-agent consensus)
  - Review logs for errors/warnings
  - **Action items:** Fix any CRITICAL issues within 4 hours

- [ ] **Day 4-5: Expand to 50 beta users**
  - Invite additional users
  - Monitor scaling behavior (expected: 50-200 RPM)
  - Test auto-scaling (should add pods when CPU >70%)
  - Review database connection pool usage
  - **Success criteria:** No degradation in P95 latency

- [ ] **Day 6-7: Stress test & review**
  - Deliberately send burst traffic (300 RPM for 5 minutes)
  - Verify rate limiting works (429 errors expected after 100 req/min)
  - Verify database read replica failover (kill primary, check app continues)
  - Verify Redis failover (kill primary, check rate limiting continues)
  - **Go/No-Go decision:** Proceed to full launch if error rate <1%

**Daily Checklist:**
- [ ] Morning: Review overnight logs and metrics
- [ ] Midday: Check active user count and request volume
- [ ] Afternoon: Review error dashboard for new issues
- [ ] Evening: Summarize day's findings in shared doc

**Pilot Exit Criteria (Must meet ALL):**
- [ ] 7 days of uptime >99.9% (max 1 minute downtime)
- [ ] Error rate <1% for entire week
- [ ] P95 API latency <200ms
- [ ] No CRITICAL security incidents
- [ ] Database replication lag <10 seconds
- [ ] Zero data loss events

**Estimated time:** 7 days
**Dependencies:** Deployment complete

---

### Task 7.8: Load Testing at 10x Expected Traffic

**Goal:** Validate MARCUS 3.0 can handle 10x peak traffic without degradation.

**Prerequisites:**
- [ ] 7-day pilot complete (Task 7.7)
- [ ] Baseline performance metrics established

**Load Testing Plan:**

#### Test 1: Sustained Load (1 hour)
**Target:** 1,000 requests/minute (10x expected peak)

- [ ] **Set up load testing tool** (k6 / Artillery / Locust):
  ```bash
  # k6 example
  k6 run --vus 100 --duration 1h load-tests/sustained.js
  ```
- [ ] **Define test scenarios:**
  - 70% citation analysis requests (POST /api/citations/analyze)
  - 20% code attribution requests (POST /api/citations/code-attribution)
  - 10% authentication requests (POST /auth/login, /auth/refresh)
- [ ] **Run test and monitor:**
  - Target: 1,000 RPM for 60 minutes
  - Watch Grafana dashboards for:
    - API error rate (should stay <1%)
    - P95 latency (should stay <500ms)
    - Database CPU (should stay <80%)
    - Pod CPU (should trigger autoscaling to 5-8 pods)
- [ ] **Analyze results:**
  - [ ] Maximum throughput achieved: _______ RPM
  - [ ] P95 latency at peak: _______ ms
  - [ ] Error rate at peak: _______ %
  - [ ] Number of pods scaled to: _______
  - [ ] Database connection pool peak: _______ %

**Success criteria:**
- Error rate <2% during sustained 1,000 RPM
- P95 latency <500ms
- Auto-scaling adds pods as expected

**Estimated time:** 4 hours (setup + run + analysis)

#### Test 2: Spike Load (15 minutes)
**Target:** 5,000 requests/minute spike (50x expected peak)

- [ ] **Configure spike test:**
  ```javascript
  // k6 spike test
  export const options = {
    stages: [
      { duration: '2m', target: 100 },   // Ramp up
      { duration: '5m', target: 500 },   // Spike to 5,000 RPM (500 VUs * 10 RPS)
      { duration: '5m', target: 100 },   // Ramp down
    ],
  };
  ```
- [ ] **Run spike test and monitor:**
  - Watch for queue buildup in database
  - Check Redis memory usage
  - Monitor pod crash loops
- [ ] **Analyze spike behavior:**
  - [ ] How quickly did auto-scaling respond? _______ seconds
  - [ ] Did any requests fail? _______ (expected: some 429s, no 500s)
  - [ ] Recovery time after spike: _______ seconds

**Success criteria:**
- Rate limiting activates (429 errors expected >1,000 RPM per IP)
- No 500 errors or crashes
- System recovers within 2 minutes of spike ending

**Estimated time:** 2 hours

#### Test 3: Endurance Test (24 hours)
**Target:** 200 requests/minute (2x expected peak) for 24 hours

- [ ] **Set up long-running test:**
  ```bash
  k6 run --vus 20 --duration 24h load-tests/endurance.js
  ```
- [ ] **Monitor for memory leaks:**
  - Check pod memory usage every hour (should be stable)
  - Check database connection pool (should not grow unbounded)
  - Check Redis memory usage (should stay under 2 GB)
- [ ] **Analyze endurance results:**
  - [ ] Memory at start: _______ MB
  - [ ] Memory at 24 hours: _______ MB (should be within 10% of start)
  - [ ] Total requests processed: _______ (expected: ~288,000)
  - [ ] Error rate: _______ % (target: <0.1%)

**Success criteria:**
- No memory leaks (memory usage stable ±10%)
- Error rate <0.1%
- No manual intervention required

**Estimated time:** 26 hours (setup + 24h run + analysis)

**Total load testing time:** ~2-3 days

---

### Task 7.9: Security Review & Penetration Testing

**Goal:** Validate OWASP security controls and identify vulnerabilities before full launch.

**Prerequisites:**
- [ ] Deployment complete
- [ ] Load testing complete

**Security Testing Plan:**

#### Automated Security Scanning
- [ ] **Run OWASP ZAP scan:**
  ```bash
  docker run -t owasp/zap2docker-stable zap-baseline.py -t https://marcus.yourdomain.com -r zap-report.html
  ```
  - Review findings and fix any HIGH/CRITICAL issues
  - Expected findings: None (all OWASP Top 10 addressed in Phase 1)

- [ ] **Run dependency vulnerability scan:**
  ```bash
  npm audit --production
  pip-audit -r requirements.txt
  ```
  - Fix any HIGH/CRITICAL vulnerabilities
  - Document accepted risks for LOW/MEDIUM

- [ ] **Run container image scan:**
  ```bash
  trivy image <registry>/marcus-platform:v3.0.0
  ```
  - Fix any OS-level vulnerabilities
  - Update base images if needed

**Estimated time:** 4 hours

#### Manual Penetration Testing
**Scope:** Authentication, authorization, input validation, rate limiting

- [ ] **Test 1: Authentication bypass attempts**
  - [ ] Try JWT with modified signature (should return 401)
  - [ ] Try expired JWT (should return 401)
  - [ ] Try JWT with elevated role (should return 403)
  - [ ] Try SQL injection in login form: `' OR '1'='1` (should be blocked)
  - [ ] **Result:** No bypasses found ☑️

- [ ] **Test 2: Authorization flaws**
  - [ ] User A tries to access User B's citations (should return 403)
  - [ ] Regular user tries admin endpoint (should return 403)
  - [ ] Try IDOR: Change citation ID in request (should enforce ownership)
  - [ ] **Result:** RBAC working as expected ☑️

- [ ] **Test 3: Input validation**
  - [ ] Send 10 MB JSON payload (should return 413 Entity Too Large)
  - [ ] Send malformed JSON (should return 400 with sanitized error)
  - [ ] Send XSS payload in citation text: `<script>alert(1)</script>` (should be escaped)
  - [ ] Send path traversal in file upload: `../../../../etc/passwd` (should be blocked)
  - [ ] **Result:** All inputs validated ☑️

- [ ] **Test 4: Rate limiting**
  - [ ] Send 150 login requests in 1 minute (should get 429 after 100)
  - [ ] Verify rate limit is per-IP (different IPs should be independent)
  - [ ] Try rate limit bypass with X-Forwarded-For spoofing (should be blocked - we fixed this!)
  - [ ] **Result:** Rate limiting effective ☑️

- [ ] **Test 5: CSP and security headers**
  - [ ] Verify CSP header present: `curl -I https://marcus.yourdomain.com | grep content-security-policy`
  - [ ] Verify HSTS header: `strict-transport-security: max-age=31536000`
  - [ ] Verify X-Frame-Options: `DENY`
  - [ ] Try to embed in iframe (should be blocked by CSP)
  - [ ] **Result:** All headers configured ☑️

- [ ] **Test 6: Password security**
  - [ ] Try weak password (should be rejected: min 12 chars, mixed case, numbers)
  - [ ] Try common password: `Password123!` (should be rejected)
  - [ ] Verify password reset token expires (try token after 2 hours - should fail)
  - [ ] Verify password reset token is single-use (try same token twice - should fail)
  - [ ] **Result:** Password policy enforced ☑️

**Estimated time:** 1 day (8 hours)

#### Third-Party Security Audit (Optional but Recommended)
- [ ] **Engage professional pentest firm** (HackerOne, Bugcrowd, or local firm)
  - Provide scope: API endpoints, authentication, multi-agent system
  - Expected cost: $5,000-$15,000 for 2-3 day assessment
  - Timeline: 2 weeks (1 week testing + 1 week report)
- [ ] **Remediate findings:**
  - CRITICAL: Fix within 24 hours
  - HIGH: Fix within 1 week
  - MEDIUM: Fix within 1 month
  - LOW: Document and accept risk

**Estimated time:** 2-3 weeks
**Cost:** $5,000-$15,000

**Total security testing time:** 2-4 weeks (depending on third-party audit)

---

## Post-Deployment: Ongoing Operations

### Daily Operations
- [ ] **Morning checks** (30 minutes):
  - Review overnight error logs
  - Check monitoring dashboards for anomalies
  - Verify backup completion (database snapshots)
  - Review certificate expiry warnings

- [ ] **Weekly maintenance** (2 hours):
  - Review and rotate logs (keep 30 days)
  - Update dependencies (npm audit, pip-audit)
  - Review security advisories (GitHub, CVE databases)
  - Test disaster recovery (restore from backup to staging)

- [ ] **Monthly reviews** (4 hours):
  - Capacity planning (check if auto-scaling limits need adjustment)
  - Cost optimization (review cloud bills, rightsize instances)
  - Security review (re-run OWASP ZAP, check for new CVEs)
  - Performance tuning (review slow query logs, optimize indexes)

### Incident Response Runbook
See `docs/OPERATOR_RUNBOOK.md` for detailed procedures.

**Common incidents:**
- **High error rate (>5%):** Check application logs, database connectivity, agent process health
- **High latency (P95 >500ms):** Check database slow queries, Redis memory, CPU throttling
- **Database exhausted:** Add read replica, optimize queries, increase connection pool
- **Agent timeout:** Restart agent pool, check Python process memory leaks

---

## Summary Checklist

### Prerequisites (Before starting operational tasks)
- [ ] Cloud provider account created with billing alerts
- [ ] VPC/network configured with security groups
- [ ] SSL certificates provisioned
- [ ] DNS configured
- [ ] Secrets manager set up

### Infrastructure (1-2 weeks)
- [ ] Kubernetes cluster deployed with Istio
- [ ] PostgreSQL multi-AZ with read replicas
- [ ] Redis cluster with failover
- [ ] Monitoring stack (Prometheus/Grafana/Jaeger)
- [ ] All infrastructure tested and verified

### Deployment (1 day)
- [ ] Phase 1: Database setup
- [ ] Phase 2: Secrets configuration
- [ ] Phase 3: Application deployment
- [ ] Phase 4: Networking & ingress
- [ ] Phase 5: Python agents deployment
- [ ] Phase 6: Monitoring & alerting

### Validation (3-4 weeks)
- [ ] Task 7.7: 7-day production pilot (1 week)
- [ ] Task 7.8: Load testing (2-3 days)
- [ ] Task 7.9: Security testing (2-4 weeks)

### Documentation (Optional, 3-5 days)
- [ ] Task 7.3: Deployment guide
- [ ] Task 7.4: Architecture diagrams
- [ ] Task 7.5: Performance tuning guide
- [ ] Task 7.11: Communication plan

### Launch (1 day)
- [ ] Execute launch checklist (see `docs/LAUNCH_CHECKLIST.md`)
- [ ] Monitor for 48 hours post-launch
- [ ] Conduct post-launch review
- [ ] Archive launch documentation

---

## Success Metrics

**Production readiness achieved when ALL criteria met:**
- [ ] 7 days uptime >99.9%
- [ ] Error rate <1% under normal load
- [ ] P95 latency <200ms under normal load
- [ ] P95 latency <500ms under 10x load
- [ ] Zero CRITICAL security findings
- [ ] All HIGH security findings remediated
- [ ] Auto-scaling working (3-10 pods)
- [ ] Database failover tested successfully
- [ ] Redis failover tested successfully
- [ ] Monitoring and alerting verified
- [ ] Runbook procedures tested

**Estimated total time:** 4-6 weeks from infrastructure provisioning to full launch
**Estimated total cost:** $300-1,500/month for production infrastructure (depending on scale)

---

## Questions & Escalation

**Infrastructure questions:** DevOps lead / Cloud architect
**Security questions:** Security team / CISO
**Database questions:** DBA / Database architect
**Performance questions:** Performance engineering team

**For urgent issues during deployment:** Refer to `docs/OPERATOR_RUNBOOK.md` incident response procedures.
