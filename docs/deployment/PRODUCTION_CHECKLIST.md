# Production Deployment Checklist
## Citation Integrity Platform

**Version**: 1.0
**Date**: November 16, 2025
**Owner**: Marcus (Platform Engineer)

---

## Overview

This checklist ensures safe, repeatable production deployments of the Citation Integrity Platform.

**Estimated Time**: 30-45 minutes
**Required Approvals**: 2 (Security + Platform Lead)
**Rollback Time**: <10 minutes

---

## Pre-Deployment Checks

### 1. Code Quality

- [ ] All tests passing (unit, integration, E2E)
  ```bash
  npm test
  npm test -- tests/e2e/
  npm test -- tests/integration/
  ```

- [ ] No linter errors
  ```bash
  npm run lint
  ```

- [ ] Type checking passes
  ```bash
  npx tsc --noEmit
  ```

- [ ] Code coverage ≥90%
  ```bash
  npm test -- --coverage
  # Check: All statements ≥90%
  ```

### 2. Security Validation

- [ ] OWASP Top 10 audit completed
  ```bash
  cat tests/security/OWASP_TOP10_AUDIT.md
  # Status: ✅ PASS (0 CRITICAL, 0 HIGH)
  ```

- [ ] Dependency scan clean
  ```bash
  npm audit --audit-level=high
  npx snyk test
  # Expected: 0 HIGH/CRITICAL vulnerabilities
  ```

- [ ] Secrets audit
  ```bash
  git secrets --scan
  grep -r "sk-" src/ --exclude-dir=node_modules
  # Expected: No hardcoded secrets
  ```

- [ ] TLS configuration verified
  ```bash
  openssl s_client -connect api.platform.ai:443 -tls1_3
  # Expected: TLS 1.3 handshake succeeds
  ```

### 3. Performance Benchmarks

- [ ] Load tests passing
  ```bash
  npm test -- tests/load/k6-load-test.js
  # Target: 1000 req/min sustained, <500ms p95
  ```

- [ ] Throughput validated
  ```bash
  # Target: 100+ citations/hour
  npm test -- tests/performance/verificationPipeline.bench.ts
  ```

- [ ] Latency targets met
  ```bash
  # Target: p95 <10s for verification
  ```

### 4. Configuration Review

- [ ] Environment variables set
  ```bash
  # Check .env.production has:
  - MCP_API_URL
  - MCP_API_KEY
  - DATABASE_URL
  - REDIS_URL
  - SECRET_KEY_BASE
  - TLS_CERT_PATH
  - TLS_KEY_PATH
  ```

- [ ] Secrets manager configured
  ```bash
  # HashiCorp Vault or AWS Secrets Manager
  vault status
  # or
  aws secretsmanager list-secrets
  ```

- [ ] Database migrations ready
  ```bash
  npm run db:migrate:status
  # All migrations applied
  ```

- [ ] Redis cache accessible
  ```bash
  redis-cli ping
  # Expected: PONG
  ```

### 5. Infrastructure Readiness

- [ ] Production server accessible
  ```bash
  ssh production@platform.ai
  # Verify SSH access
  ```

- [ ] Disk space sufficient (≥20GB free)
  ```bash
  df -h /var/www/citation-integrity
  # Expected: ≥20GB available
  ```

- [ ] Memory available (≥4GB free)
  ```bash
  free -h
  # Expected: ≥4GB available
  ```

- [ ] Monitoring dashboards configured
  ```bash
  # Grafana: https://metrics.platform.ai/d/citation-integrity
  # ELK: https://logs.platform.ai
  ```

- [ ] Alerts configured
  ```bash
  # PagerDuty integration tested
  # Slack #alerts channel subscribed
  ```

---

## Deployment Steps

### Phase 1: Backup

- [ ] Backup current production code
  ```bash
  ssh production@platform.ai
  cd /var/www/citation-integrity
  tar -czf backup-$(date +%Y%m%d_%H%M%S).tar.gz .
  mv backup-*.tar.gz /backups/
  ```

- [ ] Backup database
  ```bash
  pg_dump citation_integrity_production > backup-db-$(date +%Y%m%d_%H%M%S).sql
  ```

- [ ] Backup Redis cache (optional, can rebuild)
  ```bash
  redis-cli BGSAVE
  cp /var/lib/redis/dump.rdb /backups/redis-$(date +%Y%m%d).rdb
  ```

### Phase 2: Deploy Code

- [ ] Pull latest code
  ```bash
  git fetch origin
  git checkout production
  git pull origin production
  # Verify: Commit matches expected SHA
  ```

- [ ] Install dependencies
  ```bash
  npm ci --production
  # Uses package-lock.json (exact versions)
  ```

- [ ] Build application
  ```bash
  npm run build
  # Expected: Build succeeds, no errors
  ```

- [ ] Run database migrations
  ```bash
  npm run db:migrate
  # Verify: All migrations applied
  ```

### Phase 3: Health Checks

- [ ] Start application (staging mode)
  ```bash
  NODE_ENV=staging npm start &
  # Wait 10 seconds for startup
  ```

- [ ] Verify health endpoint
  ```bash
  curl http://localhost:3000/health
  # Expected: {"status": "healthy", "version": "1.0.0"}
  ```

- [ ] Test critical endpoints
  ```bash
  # Parameter validation
  curl -X POST http://localhost:3000/api/v1/parameters/validate \
    -H "Content-Type: application/json" \
    -d '{"name": "test", "value": 1.0, "type": "VERIFIED"}'
  # Expected: 200 OK

  # Claim verification
  curl -X POST http://localhost:3000/api/v1/claims/verify \
    -H "Content-Type: application/json" \
    -d '{"claim": "Test", "citation": {"authors": ["Test"], "year": 2025}}'
  # Expected: 200 OK
  ```

- [ ] Check MCP connectivity
  ```bash
  curl http://localhost:3000/api/v1/health/mcp
  # Expected: {"mcp": "connected", "papers_indexed": 205}
  ```

- [ ] Verify database connection
  ```bash
  npm run db:check
  # Expected: Connection successful
  ```

- [ ] Verify Redis cache
  ```bash
  npm run cache:check
  # Expected: Cache operational, hit rate >80%
  ```

### Phase 4: Gradual Rollout

- [ ] Deploy to canary (10% traffic)
  ```bash
  # Update load balancer
  aws elbv2 modify-target-group --target-group-arn <arn> --weight 10
  ```

- [ ] Monitor canary metrics (10 minutes)
  ```bash
  # Check Grafana dashboard
  # Metrics:
  - Error rate <1%
  - Latency p95 <10s
  - Throughput >100 citations/hour
  ```

- [ ] Deploy to 50% traffic
  ```bash
  aws elbv2 modify-target-group --target-group-arn <arn> --weight 50
  ```

- [ ] Monitor 50% metrics (10 minutes)
  ```bash
  # Same checks as canary
  ```

- [ ] Deploy to 100% traffic
  ```bash
  aws elbv2 modify-target-group --target-group-arn <arn> --weight 100
  ```

### Phase 5: Post-Deployment Validation

- [ ] Run smoke tests
  ```bash
  npm run test:smoke
  # Verifies: All critical workflows function
  ```

- [ ] Check error logs
  ```bash
  tail -f /var/log/citation-integrity/error.log
  # Expected: No critical errors
  ```

- [ ] Verify monitoring dashboards
  ```bash
  # Grafana: All metrics green
  # ELK: No error spikes
  ```

- [ ] Test end-to-end workflow
  ```bash
  # 1. Upload research file
  # 2. Extract claims
  # 3. Verify citations
  # 4. Generate grade
  # Expected: All steps complete successfully
  ```

- [ ] Verify LSS monitoring active
  ```bash
  curl http://localhost:3000/api/v1/drift/monitor
  # Expected: Parameter drift monitoring operational
  ```

---

## Post-Deployment

### Documentation

- [ ] Update deployment log
  ```bash
  echo "$(date): Deployed v1.0.0 (SHA: $(git rev-parse HEAD))" >> DEPLOYMENT_LOG.md
  ```

- [ ] Tag release
  ```bash
  git tag -a v1.0.0 -m "Production release: Citation Integrity Platform"
  git push origin v1.0.0
  ```

- [ ] Update changelog
  ```bash
  # docs/CHANGELOG.md
  ## [1.0.0] - 2025-11-16
  ### Added
  - Parameter provenance tracking
  - Automated citation grading
  - Auto-save middleware
  - Nested Learning architecture
  ```

### Communication

- [ ] Notify stakeholders
  ```
  Subject: Citation Integrity Platform v1.0.0 Deployed

  The Citation Integrity Platform is now live in production.

  Features:
  - Parameter provenance tracking
  - Automated citation verification
  - Mechanical grading (0% fabrication tolerance)
  - Auto-save memory consolidation

  Status: ✅ All health checks passing
  Metrics: https://metrics.platform.ai/d/citation-integrity

  Questions: #citation-integrity Slack channel
  ```

- [ ] Update status page
  ```
  https://status.platform.ai
  Status: Operational
  Latest Deployment: 2025-11-16 14:30 UTC
  ```

### Monitoring (First 24 Hours)

- [ ] Monitor error rates (hourly)
  ```bash
  # Target: <1% error rate
  ```

- [ ] Monitor latency (hourly)
  ```bash
  # Target: p95 <10s
  ```

- [ ] Monitor throughput (hourly)
  ```bash
  # Target: >100 citations/hour
  ```

- [ ] Monitor memory usage
  ```bash
  # Alert if >80% memory used
  ```

- [ ] Monitor disk usage
  ```bash
  # Alert if >90% disk used
  ```

- [ ] Check for LSS anomalies
  ```bash
  # Review high-LSS events (>0.5)
  ```

---

## Rollback Procedure

**If ANY critical issue detected:**

### Immediate Rollback (<10 minutes)

1. **Stop traffic to new version**
   ```bash
   aws elbv2 modify-target-group --target-group-arn <arn> --weight 0
   ```

2. **Restore previous code**
   ```bash
   cd /var/www/citation-integrity
   tar -xzf /backups/backup-<timestamp>.tar.gz
   npm ci --production
   npm start
   ```

3. **Rollback database** (if migrations applied)
   ```bash
   npm run db:rollback
   # or
   psql citation_integrity_production < /backups/backup-db-<timestamp>.sql
   ```

4. **Verify rollback**
   ```bash
   curl http://localhost:3000/health
   # Expected: Previous version healthy
   ```

5. **Resume traffic**
   ```bash
   aws elbv2 modify-target-group --target-group-arn <arn> --weight 100
   ```

6. **Notify stakeholders**
   ```
   Subject: Deployment Rollback - Citation Integrity Platform

   Production deployment rolled back due to [REASON].

   Status: Previous version (v0.9.0) restored
   Impact: [DURATION] minutes
   Next Steps: Root cause analysis, fix deployed to staging

   Incident Report: [LINK]
   ```

---

## Success Criteria

| Metric | Target | Validation |
|--------|--------|------------|
| Deployment time | <45 min | Timestamp log |
| Zero downtime | 100% uptime | Monitoring dashboard |
| Error rate | <1% | ELK logs |
| Latency p95 | <10s | Grafana metrics |
| Throughput | >100 citations/hour | Performance benchmarks |
| Rollback time (if needed) | <10 min | Tested in staging |

---

## Approvals

- [ ] **Security Review** - Signature: _________________ Date: _______
  - OWASP audit: ✅ PASS
  - Penetration testing: ✅ PASS
  - Secrets management: ✅ PASS

- [ ] **Platform Lead** - Signature: _________________ Date: _______
  - Code quality: ✅ PASS
  - Performance: ✅ PASS
  - Monitoring: ✅ PASS

- [ ] **Product Owner** (Optional) - Signature: _________________ Date: _______
  - Feature complete: ✅
  - User acceptance: ✅

---

## Emergency Contacts

| Role | Name | Slack | Phone | Email |
|------|------|-------|-------|-------|
| Platform Engineer | Marcus | @marcus | +1-XXX-XXX-XXXX | marcus@platform.ai |
| Security Lead | TBD | @security | +1-XXX-XXX-XXXX | security@platform.ai |
| DevOps On-Call | TBD | #devops | +1-XXX-XXX-XXXX | devops@platform.ai |

---

## References

- **Runbook**: `docs/runbooks/citation-integrity-troubleshooting.md`
- **Architecture**: `docs/wiki/citation-integrity-platform.md`
- **Rollback Guide**: `docs/deployment/ROLLBACK_PROCEDURES.md`
- **Incident Response**: `docs/runbooks/INCIDENT_RESPONSE_PLAYBOOK.md`

---

**Last Updated**: November 16, 2025
**Next Review**: May 16, 2026 (6 months)
