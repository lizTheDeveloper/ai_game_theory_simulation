# Citation Integrity Platform - Troubleshooting Runbook

**Audience**: On-Call Engineers, Platform Team
**Severity Levels**: CRITICAL → HIGH → MEDIUM → LOW
**MTTR Target**: <15 minutes (CRITICAL), <1 hour (HIGH)

---

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Common Issues](#common-issues)
3. [Performance Issues](#performance-issues)
4. [Integration Issues](#integration-issues)
5. [Data Issues](#data-issues)
6. [Monitoring Alerts](#monitoring-alerts)
7. [Escalation Procedures](#escalation-procedures)

---

## Quick Reference

### Health Check Commands

```bash
# Quick health check
npm test -- tests/integration/citationIntegrity --passWithNoTests

# Type checking
npx tsc --noEmit

# Platform tests
npm test -- src/platform

# Check logs
tail -f logs/*.log | grep -E "(ERROR|CRITICAL)"
```

### Log Locations

| Component | Log Path | Format |
|-----------|----------|--------|
| **Deployment** | `logs/deployment_*.log` | Timestamped text |
| **Verification Queue** | `logs/verification_*.log` | JSON |
| **Auto Grader** | `logs/grading_*.log` | JSON |
| **LSS Monitor** | `logs/lss_*.log` | JSON |
| **Application** | `logs/app_*.log` | Structured JSON |

### Emergency Rollback

```bash
# If system is broken, rollback immediately
BACKUP_FILE=$(cat .deployments/backups/latest_backup.txt)
tar -xzf "${BACKUP_FILE}" -C .
npm ci --prefer-offline
npx tsc --noEmit && npm test -- src/platform
```

---

## Common Issues

### Issue 1: Queue Backlog

**Symptoms**:
- Verification queue depth > 500
- Latency p95 > 15s
- Throughput < 50 citations/hour

**Diagnosis**:
```bash
# Check queue stats
node -e "
const {VerificationQueue} = require('./dist/platform/queues/verificationQueue');
const queue = new VerificationQueue({});
console.log(queue.getStats());
"

# Expected output: { pending: <count>, processing: <count>, ... }
```

**Root Causes**:
1. MCP server slow/down
2. Concurrency too low
3. Rate limit too strict
4. Memory leak in queue

**Resolution**:

**Immediate (CRITICAL)**:
```bash
# 1. Increase concurrency temporarily
# Edit: src/platform/queues/verificationQueue.ts
# Change: maxConcurrency: 5 → 10

# 2. Restart queue processor
pkill -f "verificationQueue"
node dist/platform/queues/verificationQueue.js &

# 3. Monitor recovery
watch -n 5 'node -e "const q = require(\"./dist/platform/queues/verificationQueue\"); console.log(q.getStats())"'
```

**Long-term (HIGH)**:
```bash
# 1. Tune queue parameters
# File: src/platform/queues/verificationQueue.ts
maxConcurrency: 10,  // Increase from 5
rateLimit: 20,       // Increase from 10
batchSize: 50        // Increase from 20

# 2. Add more MCP server instances (load balancing)

# 3. Implement prefetching for likely claims
```

**Prevention**:
- Alert when queue depth > 100 (15 min)
- Monitor MCP server latency
- Auto-scale concurrency based on load

---

### Issue 2: Cache Miss Rate High

**Symptoms**:
- Cache hit rate < 60%
- MCP server load high
- Latency increased

**Diagnosis**:
```bash
# Check cache stats
node -e "
const {CitationCache} = require('./dist/platform/cache/citationCache');
const cache = new CitationCache({});
console.log(cache.getStats());
"

# Expected: { size: <count>, hits: <count>, misses: <count>, hitRate: 0.8+ }
```

**Root Causes**:
1. Cache size too small (eviction)
2. TTL too short (expiration)
3. Cache keys not normalized
4. Unique citation patterns (no duplication)

**Resolution**:

**Immediate (MEDIUM)**:
```bash
# 1. Increase cache size
# Edit: src/platform/cache/citationCache.ts
maxSize: 10000,  # Increase from 1000

# 2. Increase TTL
ttlMs: 7200000,  # 2 hours (from 1 hour)

# 3. Restart with new config
```

**Long-term (LOW)**:
```bash
# 1. Implement cache warming (prefetch common citations)

# 2. Use Redis for distributed cache (multi-instance)

# 3. Implement semantic similarity caching
#    (cache "Li 2023" also matches "Li et al. 2023")
```

**Prevention**:
- Alert when cache hit rate < 70% (30 min)
- Monitor cache size and eviction rate
- Dashboard for cache effectiveness

---

### Issue 3: MCP Server Connection Errors

**Symptoms**:
- Verification failures with "ECONNREFUSED"
- Timeout errors
- Retry exhaustion

**Diagnosis**:
```bash
# 1. Check MCP server connectivity
curl -v http://mcp-server:3456/health
# Expected: HTTP 200 OK

# 2. Check DNS resolution
nslookup mcp-server

# 3. Check logs for retry attempts
grep -E "MCP.*retry|ECONNREFUSED" logs/*.log
```

**Root Causes**:
1. MCP server down/crashed
2. Network partition
3. Firewall blocking connection
4. DNS resolution failure

**Resolution**:

**Immediate (CRITICAL)**:
```bash
# 1. Restart MCP server
ssh mcp-server
sudo systemctl restart citation-verifier-mcp
sudo systemctl status citation-verifier-mcp

# 2. If still failing, use fallback mode
# Edit: src/platform/mcp/citationClient.ts
const client = new CitationClient({
  mcpServerUrl: process.env.MCP_FALLBACK_URL || 'http://fallback-mcp:3456',
  timeout: 30000,  # Increase timeout
  retries: 5       # Increase retries
});

# 3. Monitor recovery
tail -f logs/verification_*.log | grep "MCP connection"
```

**Long-term (HIGH)**:
```bash
# 1. Set up MCP server high availability (multiple instances)

# 2. Implement circuit breaker pattern

# 3. Add health check monitoring for MCP server
```

**Prevention**:
- MCP server uptime monitoring (alert <99%)
- Automated MCP server restart on crash
- Load balancer with failover

---

### Issue 4: Grade Drift Detected

**Symptoms**:
- Grade distribution shifted >10% from baseline
- LSS alerts for grade inconsistency
- Student complaints about grading

**Diagnosis**:
```bash
# 1. Check grade distribution
node -e "
const {GradingConsistencyChecker} = require('./dist/platform/grading/consistencyChecker');
const checker = new GradingConsistencyChecker({});
console.log(checker.getDistribution());
"

# Expected: { A: 20%, B: 33%, C: 28%, D: 13%, F: 6% }
# Alert if: Deviation > 10% from baseline

# 2. Check recent grading results
cat logs/grading_*.log | jq '.grade, .letterGrade' | tail -100
```

**Root Causes**:
1. Grading rubric changed
2. Severity classifier drift
3. Verification false positives increased
4. Claim extraction bugs

**Resolution**:

**Immediate (HIGH)**:
```bash
# 1. Review recent grading changes
git log --oneline --since="1 week ago" -- src/platform/grading/

# 2. Run consistency check with historical data
npx tsx scripts/migrate/historicalGrades.ts --source ./data/historical_grades.json

# 3. If drift confirmed, re-validate rubric
# File: src/platform/grading/autoGrader.ts
# Review penalty values:
#   fabricated_citation: -10 (was this changed?)
#   magnitude_error: -10 to -15 (range correct?)
```

**Long-term (MEDIUM)**:
```bash
# 1. Implement grade drift monitoring dashboard

# 2. A/B test rubric changes before deployment

# 3. Add inter-rater reliability validation
#    (compare auto-grader vs human grader)
```

**Prevention**:
- Alert when grade drift > 5% (daily check)
- Rubric change approval workflow
- Historical grade baseline tracking

---

### Issue 5: Parameter Drift (LSS Alert)

**Symptoms**:
- LSS > 0.2 for verified parameters
- GitHub issues created automatically
- Code value != cited value

**Diagnosis**:
```bash
# 1. Check which parameters drifted
grep "LSS.*parameter_drift" logs/lss_*.log | jq '.parameter, .lss'

# 2. Verify against research citation
# Example: cascade_factor
grep -A5 "@provenance" src/simulation/systems/*.ts | grep -B2 "cascade"
```

**Root Causes**:
1. Code manually edited (forgot to update provenance)
2. Research paper value changed
3. Typo in parameter value
4. Provenance decorator removed

**Resolution**:

**Immediate (MEDIUM)**:
```bash
# 1. Identify drifted parameter
PARAMETER="cascade_amplification_factor"

# 2. Find current value in code
grep -r "${PARAMETER}" src/

# 3. Find cited value in provenance
grep -A10 "@provenance" src/ | grep -B5 "${PARAMETER}" | grep "doi"

# 4. Look up cited value in paper
# Use DOI to verify correct value

# 5. Update code to match citation OR update citation if research changed
```

**Long-term (LOW)**:
```bash
# 1. Add pre-commit hook to validate provenance

# 2. Automated CI/CD check for parameter drift

# 3. Parameter freeze for production (require PR for changes)
```

**Prevention**:
- Pre-commit hook validates LSS < 0.2
- CI/CD blocks deployment if drift detected
- Parameter change approval workflow

---

## Performance Issues

### Slow Verification Pipeline

**Symptoms**:
- Latency p95 > 15s
- Throughput < 50 citations/hour

**Diagnosis**:
```bash
# 1. Profile verification pipeline
npm test -- tests/performance/verificationPipeline.bench.ts

# 2. Check MCP server latency
curl -w "@curl-format.txt" -o /dev/null -s http://mcp-server:3456/verify

# curl-format.txt:
# time_total: %{time_total}
```

**Resolution**:
```bash
# 1. Increase queue concurrency
# 2. Optimize MCP server queries (batching)
# 3. Increase cache size and TTL
# 4. Implement claim prefetching
```

### Memory Leak

**Symptoms**:
- Memory usage continuously increasing
- Process crashes with "Out of Memory"
- Performance degradation over time

**Diagnosis**:
```bash
# 1. Monitor memory usage
while true; do
  ps aux | grep "node.*platform"
  sleep 60
done

# 2. Take heap snapshot
node --inspect dist/platform/queues/verificationQueue.js
# Chrome DevTools -> Memory -> Take Heap Snapshot

# 3. Check for object retention
grep -E "queue|cache|memory" logs/*.log | grep "size"
```

**Resolution**:
```bash
# 1. Restart process (immediate)
pkill -f "verificationQueue"

# 2. Implement periodic cleanup
setInterval(() => {
  cache.cleanup();  // Remove expired entries
  queue.prune();    // Remove completed items
}, 3600000); // Every hour

# 3. Add memory limits
node --max-old-space-size=4096 dist/platform/queues/verificationQueue.js
```

---

## Integration Issues

### Agent Memory Not Saving

**Symptoms**:
- Agents repeat completed work
- Task memory empty
- Session summaries missing

**Diagnosis**:
```bash
# 1. Check auto-save trigger logs
grep "auto-save" logs/*.log | tail -50

# 2. Verify MCP agent-memory connection
# (Would require MCP client testing)

# 3. Check completion signal detection
node -e "
const {AutoSaveTriggers} = require('./dist/platform/middleware/autoSaveTriggers');
const triggers = new AutoSaveTriggers({});
const signals = triggers.detectCompletionSignals('Implementation complete.');
console.log(signals);
"
# Expected: Array with completion pattern match
```

**Resolution**:
```bash
# 1. Verify auto-save middleware is enabled

# 2. Check completion pattern matching
# File: src/platform/middleware/autoSaveTriggers.ts
# Ensure patterns include agent's completion language

# 3. Manual memory save (emergency)
# Use MCP agent-memory tool directly
```

---

## Monitoring Alerts

### Alert: Parameter Drift Critical (LSS > 0.5)

**Severity**: CRITICAL
**MTTR Target**: <15 minutes

**Response**:
1. Identify parameter: Check alert payload for `parameter` field
2. Verify drift: `grep "${PARAMETER}" logs/lss_*.log`
3. Immediate fix: Update code to match citation OR update citation
4. Create GitHub issue: Auto-created by LSS monitor
5. Deploy fix: Emergency deployment if production-critical

### Alert: Verification Queue Backlog

**Severity**: HIGH
**MTTR Target**: <1 hour

**Response**:
1. Check queue depth: `queue.getStats()`
2. Increase concurrency: Edit `maxConcurrency` in config
3. Check MCP server: `curl http://mcp-server:3456/health`
4. Restart queue: `pkill -f verificationQueue && restart`
5. Monitor recovery: Watch queue depth decrease

### Alert: Cache Hit Rate Low (<60%)

**Severity**: MEDIUM
**MTTR Target**: <4 hours

**Response**:
1. Check cache stats: `cache.getStats()`
2. Increase cache size: Edit `maxSize` in config
3. Increase TTL: Edit `ttlMs` in config
4. Analyze cache keys: Look for duplication patterns
5. Implement warming: Prefetch common citations

---

## Escalation Procedures

### Severity Levels

| Severity | Example | MTTR | Escalation |
|----------|---------|------|------------|
| **CRITICAL** | Parameter drift >50%, MCP down, data loss | <15 min | Immediate PagerDuty |
| **HIGH** | Queue backlog, grade drift, performance degradation | <1 hour | Slack + On-call |
| **MEDIUM** | Cache miss rate, memory leak, integration issues | <4 hours | Slack |
| **LOW** | Documentation, minor bugs, optimization | <1 day | Ticket |

### Escalation Path

1. **On-Call Engineer** (CRITICAL/HIGH)
   - PagerDuty: `platform-oncall`
   - Slack: `#platform-oncall`

2. **Platform Lead** (Unresolved after 1 hour)
   - Email: `platform-lead@example.com`
   - Slack: `@platform-lead`

3. **CTO** (Unresolved after 4 hours)
   - Email: `cto@example.com`
   - Phone: `+1-XXX-XXX-XXXX`

### Emergency Contacts

```
Platform Team:
  - On-Call: oncall@example.com (PagerDuty: platform-oncall)
  - Lead: platform-lead@example.com
  - Slack: #platform-team

Infrastructure:
  - DevOps: devops@example.com (PagerDuty: devops-oncall)
  - Network: network@example.com

Security:
  - Security Team: security@example.com
  - Incident Response: ir@example.com
```

---

## Appendix

### Useful Commands

```bash
# System health
npm test -- tests/integration/citationIntegrity

# Check specific component
node -e "const C = require('./dist/platform/[component]'); ..."

# View logs with jq
cat logs/*.log | jq 'select(.level=="ERROR")'

# Monitor in real-time
tail -f logs/*.log | grep -E "(ERROR|CRITICAL|WARNING)"

# Performance profiling
npm test -- tests/performance/verificationPipeline.bench.ts
```

### Log Analysis

```bash
# Count errors by type
cat logs/*.log | jq '.error_type' | sort | uniq -c

# Find slow requests (>5s)
cat logs/verification_*.log | jq 'select(.duration_ms > 5000)'

# Track queue depth over time
cat logs/*.log | jq 'select(.queue_depth) | .timestamp, .queue_depth' | paste - -
```

---

**Last Updated**: 2025-11-16 by Marcus (Platform Engineer)
