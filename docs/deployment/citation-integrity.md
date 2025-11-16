# Citation Integrity Platform - Deployment Guide

**Audience**: DevOps Engineers, Platform Team
**Prerequisites**: Node.js 20+, npm, Unix-like OS
**Deployment Time**: <10 minutes
**Rollback Time**: <5 minutes

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Deployment Steps](#deployment-steps)
4. [Post-Deployment Validation](#post-deployment-validation)
5. [Rollback Procedures](#rollback-procedures)
6. [Environment-Specific Configuration](#environment-specific-configuration)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

| Component | Requirement | Validation |
|-----------|------------|------------|
| **Node.js** | v20.0.0+ | `node --version` |
| **npm** | v9.0.0+ | `npm --version` |
| **TypeScript** | v5.0.0+ | `npx tsc --version` |
| **Disk Space** | 5 GB+ available | `df -h` |
| **Memory** | 4 GB+ available | `free -h` |
| **OS** | Linux/macOS | `uname -a` |

### Access Requirements

- SSH access to deployment servers
- Git repository access
- npm registry access
- (Production) MCP server credentials
- (Production) Secrets manager access (Vault/AWS)

### Pre-Install Tools

```bash
# Install Node.js 20+ (if needed)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be v20.x.x
npm --version   # Should be v9.x.x or higher
```

---

## Pre-Deployment Checklist

### Code Review

- [ ] All tests passing (`npm test`)
- [ ] Type checking clean (`npx tsc --noEmit`)
- [ ] ESLint clean (`npm run lint`)
- [ ] Integration tests passing
- [ ] Performance benchmarks meet targets

### Security Audit

- [ ] `npm audit` shows 0 HIGH/CRITICAL vulnerabilities
- [ ] No secrets in code (use environment variables)
- [ ] TLS certificates valid (production only)
- [ ] Secrets manager configured (production only)

### Documentation

- [ ] CHANGELOG.md updated
- [ ] API documentation current
- [ ] Monitoring dashboards configured
- [ ] Runbooks updated

### Stakeholder Notification

- [ ] Platform team notified
- [ ] On-call engineer identified
- [ ] Deployment window communicated
- [ ] Rollback plan reviewed

---

## Deployment Steps

### Automated Deployment (Recommended)

**Use the deployment script** for consistent, automated deployments:

```bash
# Navigate to project root
cd /path/to/ai_game_theory_simulation

# Run deployment script
./scripts/deploy/citationIntegrity.sh [environment]

# Environments:
#   development - Local development
#   staging - Staging environment
#   production - Production deployment
```

**What the script does**:
1. Preflight checks (Node.js version, disk space, etc.)
2. Creates backup for rollback
3. Installs dependencies (`npm ci`)
4. Runs type checking (`npx tsc --noEmit`)
5. Runs tests (`npm test`)
6. Runs migrations (creates directories, etc.)
7. Starts services (validates configuration)
8. Health checks (validates deployment)
9. Generates deployment summary

**Deployment logs**: `logs/deployment_YYYYMMDD_HHMMSS.log`

### Manual Deployment (Advanced)

If you need manual control:

```bash
# 1. Backup current state
mkdir -p .deployments/backups
tar -czf .deployments/backups/backup_$(date +%Y%m%d_%H%M%S).tar.gz \
  -C . src/platform package.json package-lock.json tsconfig.json

# 2. Pull latest code
git fetch origin
git checkout [branch/tag]
git pull

# 3. Install dependencies
npm ci --prefer-offline --no-audit

# 4. Type check
npx tsc --noEmit

# 5. Run tests
npm test -- src/platform

# 6. Run migrations
mkdir -p .cache/citations .cache/verifications .queue logs

# 7. Validate configuration
# Check environment variables are set

# 8. Health check
npm test -- tests/integration/citationIntegrity --passWithNoTests
```

---

## Post-Deployment Validation

### Automated Health Checks

The deployment script runs these automatically. Manual validation:

```bash
# 1. TypeScript compilation
npx tsc --noEmit --skipLibCheck
# Expected: No errors

# 2. Platform modules present
ls src/platform/multiLevelState.ts
ls src/platform/queues/verificationQueue.ts
ls src/platform/grading/autoGrader.ts
# Expected: Files exist

# 3. Integration tests
npm test -- tests/integration/citationIntegrity
# Expected: All tests pass

# 4. Performance benchmarks
npm test -- tests/performance/verificationPipeline.bench.ts
# Expected: All targets met
```

### Manual Smoke Tests

```bash
# Test 1: Import platform modules (Node.js REPL)
node
> const { MultiLevelState } = require('./dist/platform/multiLevelState.js');
> const state = new MultiLevelState({ enableLogging: false });
> state.validateFrequencyHierarchy();
// Expected: { valid: true, frequencies: [1.0, 0.1, 0.01, 0.001] }

# Test 2: LSS Monitor
> const { LSSMonitor } = require('./dist/simulation/utils/lssMonitor.js');
> const monitor = new LSSMonitor({ enableLogging: false });
> monitor.checkParameterDrift({ value: 1.5, citedValue: 2.0, type: 'VERIFIED' });
// Expected: 0.25 (25% drift)

# Test 3: Verification Queue
> const { VerificationQueue } = require('./dist/platform/queues/verificationQueue.js');
> const queue = new VerificationQueue({ maxConcurrency: 5 });
> queue.getStats();
// Expected: { pending: 0, processing: 0, completed: 0, failed: 0 }
```

### Monitoring Validation

**Check Grafana dashboards** (production only):

1. Navigate to: `https://grafana.example.com/d/citation-integrity`
2. Verify panels showing data:
   - Nested Learning Hierarchy: All 4 levels active
   - LSS Signals: Metrics flowing
   - Verification Pipeline: Queue stats present
3. Check alerts configured:
   - Critical: Parameter drift >50%
   - Warning: Cache hit rate <60%

**Expected First-Time Deployment State**:
- Queue depth: 0
- Cache size: 0
- Verification requests: 0
- All health checks: Green

---

## Rollback Procedures

### When to Rollback

**Rollback immediately if**:
- Health checks fail
- Critical tests fail
- Type checking errors
- Production incidents (severity: critical)

**Investigate before rollback if**:
- Performance degradation <20%
- Non-critical tests fail
- Monitoring gaps (metrics not flowing)

### Automated Rollback

```bash
# The deployment script creates automatic backups
# Rollback is built into the script on failure

# To manually trigger rollback:
./scripts/deploy/citationIntegrity.sh development --rollback
```

### Manual Rollback

```bash
# 1. Find latest backup
BACKUP_FILE=$(cat .deployments/backups/latest_backup.txt)
echo "Rolling back to: ${BACKUP_FILE}"

# 2. Extract backup
tar -xzf "${BACKUP_FILE}" -C .

# 3. Reinstall dependencies
npm ci --prefer-offline --no-audit

# 4. Validate rollback
npx tsc --noEmit
npm test -- src/platform

# 5. Verify services
# Check that the previous version is running correctly
```

**Rollback Time**: <5 minutes

**After Rollback**:
1. Investigate failure cause
2. Fix issues
3. Re-test in development/staging
4. Schedule new deployment

---

## Environment-Specific Configuration

### Development

**Purpose**: Local development, testing

```bash
# Environment variables
export NODE_ENV=development
export LOG_LEVEL=debug
export ENABLE_LOGGING=true

# Features
- Verbose logging
- No secrets required
- Mock MCP servers
- Local file persistence
```

**Deployment**:
```bash
./scripts/deploy/citationIntegrity.sh development
```

### Staging

**Purpose**: Pre-production testing, integration validation

```bash
# Environment variables
export NODE_ENV=staging
export LOG_LEVEL=info
export MCP_SERVER_URL=https://staging-mcp.example.com

# Features
- Production-like environment
- Real MCP servers (staging)
- Performance monitoring
- Alert testing (non-critical)
```

**Deployment**:
```bash
# Requires staging credentials
./scripts/deploy/citationIntegrity.sh staging
```

### Production

**Purpose**: Live production system

```bash
# Environment variables (loaded from secrets manager)
export NODE_ENV=production
export LOG_LEVEL=warn
export MCP_SERVER_URL=https://mcp.example.com
export SECRETS_MANAGER_URL=https://vault.example.com
export TLS_CERT_PATH=/etc/ssl/certs/citation-integrity.crt
export TLS_KEY_PATH=/etc/ssl/private/citation-integrity.key

# Features
- Secrets manager integration
- TLS encryption
- Rate limiting
- PagerDuty alerts
- 99.9% SLA monitoring
```

**Deployment** (requires approvals):
```bash
# 1. Get approvals
# - Platform lead approval
# - Security team sign-off
# - Stakeholder notification

# 2. Deploy during maintenance window
./scripts/deploy/citationIntegrity.sh production

# 3. Monitor for 1 hour
# - Watch Grafana dashboards
# - Check PagerDuty (no alerts)
# - Validate metrics flowing

# 4. Mark deployment complete
# - Update CHANGELOG.md
# - Close deployment ticket
# - Notify stakeholders
```

---

## Troubleshooting

### Common Deployment Failures

#### Error: "npm ci failed"

**Cause**: Corrupt package-lock.json or network issues

**Resolution**:
```bash
# 1. Clear npm cache
npm cache clean --force

# 2. Verify package-lock.json
git checkout package-lock.json

# 3. Retry
npm ci
```

#### Error: "Type checking failed"

**Cause**: TypeScript errors in code

**Resolution**:
```bash
# 1. Run type check with details
npx tsc --noEmit

# 2. Fix errors or rollback

# 3. Never deploy with type errors
```

#### Error: "Tests failed"

**Cause**: Breaking changes in code

**Resolution**:
```bash
# 1. Check which tests failed
npm test -- src/platform --verbose

# 2. Fix tests or rollback

# 3. Run integration tests
npm test -- tests/integration/citationIntegrity
```

#### Error: "Health checks failed"

**Cause**: Missing dependencies, configuration issues

**Resolution**:
```bash
# 1. Check logs
cat logs/deployment_*.log | grep ERROR

# 2. Verify platform modules
ls src/platform/*.ts

# 3. Re-run health checks manually
npm test -- tests/integration/citationIntegrity
```

### Deployment Logs

**Location**: `logs/deployment_YYYYMMDD_HHMMSS.log`

**View logs**:
```bash
# Latest deployment
ls -t logs/deployment_*.log | head -1 | xargs cat

# Watch live deployment
tail -f logs/deployment_*.log
```

---

## Appendix

### Deployment Checklist (Print-Friendly)

```
☐ Prerequisites verified
☐ Code reviewed and tests passing
☐ Security audit clean
☐ Documentation updated
☐ Stakeholders notified
☐ Backup created
☐ Dependencies installed
☐ Type checking passed
☐ Tests passed
☐ Migrations run
☐ Services started
☐ Health checks passed
☐ Monitoring validated
☐ Smoke tests complete
☐ Deployment logged
☐ Stakeholders updated
```

### Emergency Contacts

| Role | Contact | Escalation |
|------|---------|------------|
| **Platform Lead** | platform-lead@example.com | PagerDuty: platform-team |
| **On-Call Engineer** | oncall@example.com | PagerDuty: platform-oncall |
| **Security Team** | security@example.com | security-team Slack |

### References

- [PROJECT_PLAN_CITATION_INTEGRITY.md](../../PROJECT_PLAN_CITATION_INTEGRITY.md)
- [Monitoring Dashboard](../monitoring/citationIntegrityDashboard.md)
- [Troubleshooting Runbook](../runbooks/citation-integrity-troubleshooting.md)
- [Wiki Documentation](../wiki/citation-integrity-platform.md)

---

**Last Updated**: 2025-11-16 by Marcus (Platform Engineer)
