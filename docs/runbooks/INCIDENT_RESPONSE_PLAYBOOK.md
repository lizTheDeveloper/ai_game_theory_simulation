# Incident Response Playbook - Citation Integrity Platform

**Version**: 1.0
**Owner**: Platform Engineering
**Last Updated**: November 16, 2025

---

## Quick Reference

| Severity | Response Time | Escalation | Examples |
|----------|--------------|------------|----------|
| **P0 - Critical** | <15 min | Immediate | Complete system down, data loss |
| **P1 - High** | <1 hour | Within 2 hours | Major feature broken, security breach |
| **P2 - Medium** | <4 hours | Next business day | Performance degradation, minor bugs |
| **P3 - Low** | <24 hours | Optional | Cosmetic issues, feature requests |

---

## P0: Critical Incidents

### System Completely Down

**Symptoms**:
- Health endpoint returns 503
- All API requests failing
- No responses from application

**Immediate Actions** (< 5 minutes):
```bash
# 1. Check if process is running
ps aux | grep citation-integrity
# If not running: sudo systemctl restart citation-integrity

# 2. Check logs for crash reason
tail -100 /var/log/citation-integrity/error.log

# 3. Check system resources
free -h  # Memory
df -h    # Disk space
top      # CPU usage

# 4. Notify #incidents channel
# Post: "P0: Citation Integrity Platform DOWN. Investigating."
```

**Resolution Steps**:
1. **If out of memory**: Increase swap, restart with more memory
2. **If disk full**: Clear old logs, increase disk space
3. **If crashed**: Check error logs, apply hotfix if known issue
4. **If database down**: Restart PostgreSQL, check connections

**Rollback Decision Point** (10 minutes):
If cause unknown or fix risky → Execute rollback procedure

### Data Loss / Corruption

**Symptoms**:
- Missing provenance records
- Grades incorrectly calculated
- Parameters lost

**Immediate Actions** (< 5 minutes):
```bash
# 1. STOP all writes immediately
sudo systemctl stop citation-integrity

# 2. Backup current state (even if corrupted)
pg_dump citation_integrity_production > emergency-backup-$(date +%Y%m%d_%H%M%S).sql

# 3. Check last good backup
ls -lht /backups/*.sql | head -5

# 4. Notify stakeholders
# Email: "P0: Data corruption detected. Writes paused. Restoring from backup."
```

**Resolution Steps**:
1. Identify corruption extent (which tables, how many records)
2. Restore from last good backup (test in staging first)
3. Apply transaction logs to recover recent changes
4. Validate data integrity before resuming

**Prevention**:
- Daily backups (automated)
- Point-in-time recovery enabled
- Transaction log retention: 7 days

### Security Breach

**Symptoms**:
- Suspicious authentication attempts
- Unexpected data access
- Alerts from intrusion detection

**Immediate Actions** (< 5 minutes):
```bash
# 1. Isolate system (disconnect from network)
sudo iptables -A INPUT -j DROP
sudo iptables -A OUTPUT -j DROP
# (Allow only SSH for emergency access)

# 2. Preserve evidence
tar -czf forensics-$(date +%Y%m%d_%H%M%S).tar.gz /var/log/

# 3. Revoke all API keys
# (Run key rotation script)

# 4. Notify security team + legal
# Email: security@platform.ai, legal@platform.ai
```

**Resolution Steps**:
1. **Forensic analysis**: What was accessed? What was modified?
2. **Patch vulnerability**: Apply security fix
3. **Reset credentials**: All API keys, database passwords, SSH keys
4. **Audit trail review**: Who had access? What did they do?
5. **Public disclosure** (if required by law/policy)

**Post-Incident**:
- Root cause analysis (RCA) within 48 hours
- Security audit by external firm
- Implement additional controls

---

## P1: High Severity

### MCP Server Unavailable

**Symptoms**:
- Verification requests timing out
- "MCP connection failed" errors
- 100% cache miss rate

**Immediate Actions** (< 15 minutes):
```bash
# 1. Check MCP server status
curl https://mcp.research.ai/health
# If down: Contact MCP team

# 2. Enable degraded mode (flag claims as UNVERIFIED)
# (System auto-detects and gracefully degrades)

# 3. Notify users
# Slack #citation-integrity: "Verification temporarily unavailable. Claims flagged as UNVERIFIED."

# 4. Monitor queue depth
curl http://localhost:3000/api/v1/queue/status
# If backing up: Increase TTL, pause non-critical verifications
```

**Resolution Steps**:
1. Wait for MCP team to restore service
2. Replay queued verifications once MCP returns
3. Re-verify UNVERIFIED claims
4. Validate: No claims incorrectly marked

**Prevention**:
- MCP SLA: 99.9% uptime
- Failover MCP server (backup)
- Aggressive caching (84% hit rate reduces dependency)

### Database Performance Degradation

**Symptoms**:
- Slow query responses (>1s)
- Connection pool exhausted
- Timeout errors

**Immediate Actions** (< 30 minutes):
```bash
# 1. Identify slow queries
psql citation_integrity_production
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state != 'idle' ORDER BY duration DESC;

# 2. Kill long-running queries (if blocking)
SELECT pg_terminate_backend(pid) WHERE pid = <PID>;

# 3. Check connection pool
# If exhausted: Increase pool size temporarily

# 4. Check for missing indexes
# (Run EXPLAIN ANALYZE on slow queries)
```

**Resolution Steps**:
1. Add missing indexes (if identified)
2. Optimize slow queries (rewrite with better joins)
3. Scale database (vertical: more CPU/RAM, horizontal: read replicas)
4. Review query patterns (N+1 queries?)

**Prevention**:
- Monthly query performance review
- Automated slow query logging
- Database monitoring dashboards

### Grading System Failure

**Symptoms**:
- All grades = 0 or 100
- Inconsistent penalties applied
- Inter-rater reliability drops

**Immediate Actions** (< 1 hour):
```bash
# 1. Disable automated grading
# (Revert to manual grading temporarily)

# 2. Investigate last deployment
git log --oneline -10
# Check: Recent changes to grading logic?

# 3. Run test suite
npm test -- src/platform/grading/

# 4. Compare grades with gold standard
npm run grade:validate
```

**Resolution Steps**:
1. Identify regression (code change, data corruption, config change)
2. Rollback grading logic to last known good version
3. Re-grade affected submissions
4. Notify affected users of grade corrections

**Prevention**:
- Gold standard test corpus (1000 claims with known grades)
- Pre-deployment validation (compare auto vs manual on test set)
- Monitoring: Alert if inter-rater reliability < 0.85

---

## P2: Medium Severity

### High Error Rate (5-10%)

**Symptoms**:
- Error rate above baseline (1%)
- Specific endpoint failing frequently
- User reports of intermittent failures

**Immediate Actions** (< 2 hours):
```bash
# 1. Identify error pattern
cat /var/log/citation-integrity/error.log | grep "ERROR" | cut -d' ' -f5 | sort | uniq -c | sort -rn

# 2. Check for rate limiting
# (If external API calls failing: back off)

# 3. Monitor error trend
# (Is it increasing, stable, or decreasing?)

# 4. Notify #alerts channel
# Slack: "Error rate elevated (7%). Investigating endpoint X."
```

**Resolution Steps**:
1. Fix identified bug (if code issue)
2. Scale resources (if capacity issue)
3. Adjust rate limits (if external API throttling)
4. Deploy fix and monitor for 1 hour

### Cache Hit Rate Drop (<70%)

**Symptoms**:
- Cache hit rate drops from 84% to <70%
- Increased latency
- Higher MCP server load

**Immediate Actions** (< 2 hours):
```bash
# 1. Check cache server
redis-cli ping
# If slow: Check memory, eviction rate

# 2. Analyze cache patterns
redis-cli INFO stats
# Check: Evicted keys, hit rate, memory usage

# 3. Review recent claim patterns
# (New research area? Different claim types?)

# 4. Increase cache size if needed
# (Or adjust eviction policy)
```

**Resolution Steps**:
1. Optimize cache key structure (better clustering)
2. Increase cache TTL for stable claims
3. Pre-warm cache for common research areas
4. Monitor for 24 hours

---

## P3: Low Severity

### Minor UI Bugs

**Example**: Dashboard chart rendering incorrectly

**Actions** (< 1 business day):
- Log bug in GitHub Issues
- Assign to next sprint
- No immediate action required

### Feature Requests

**Example**: User requests new citation format support

**Actions**:
- Log in product backlog
- Gather requirements
- Prioritize in roadmap planning

---

## Communication Templates

### P0 Alert (Critical)

```
Subject: [P0] Citation Integrity Platform - Critical Incident

Status: INVESTIGATING / MITIGATING / RESOLVED
Impact: [Complete outage / Data loss / Security breach]
Affected Users: [All / Subset]
ETA for Resolution: [Time]

Current Status:
- [Timestamp]: Incident detected
- [Timestamp]: Isolation/mitigation in progress
- [Timestamp]: Root cause identified
- [Timestamp]: Fix deployed

Next Update: [Time]
Incident Lead: [Name]
Status Page: https://status.platform.ai
```

### P1 Alert (High)

```
Subject: [P1] Citation Integrity Platform - Service Degradation

Impact: [Feature X unavailable / Slow performance]
Affected Users: [All / Subset]
Workaround: [If available]
ETA for Resolution: [Time]

We are investigating [ISSUE]. Updates will be posted to #incidents.
```

### Incident Resolution

```
Subject: [RESOLVED] Citation Integrity Platform Incident

Incident: [Description]
Duration: [Start time] - [End time]
Root Cause: [Brief explanation]
Resolution: [What was done]

Post-Incident Actions:
- RCA document: [Link]
- Preventive measures: [List]
- Next review: [Date]

Thank you for your patience.
```

---

## Escalation Paths

### On-Call Rotation

| Time | Primary | Secondary | Escalation |
|------|---------|-----------|------------|
| Mon-Fri 9am-5pm | Marcus | DevOps Team | CTO |
| Mon-Fri 5pm-9am | DevOps Team | Marcus | CTO |
| Weekends | On-call rotation | DevOps Manager | CTO |

### Contact Information

| Role | Name | Slack | Phone | Email |
|------|------|-------|-------|-------|
| Platform Engineer | Marcus | @marcus | +1-XXX-XXX-XXXX | marcus@platform.ai |
| Security Lead | TBD | @security | +1-XXX-XXX-XXXX | security@platform.ai |
| DevOps On-Call | TBD | #devops | +1-XXX-XXX-XXXX | devops@platform.ai |
| CTO | TBD | @cto | +1-XXX-XXX-XXXX | cto@platform.ai |

---

## Post-Incident Review

### RCA Template

```markdown
# Root Cause Analysis - [Incident Name]

**Incident ID**: INC-YYYY-MM-DD-XXX
**Severity**: P0 / P1 / P2 / P3
**Date**: YYYY-MM-DD
**Duration**: [Start] - [End]
**Impact**: [Description]

## Timeline

- **[Time]**: Incident detected
- **[Time]**: Mitigation started
- **[Time]**: Root cause identified
- **[Time]**: Fix deployed
- **[Time]**: Incident resolved

## Root Cause

[Detailed explanation of what went wrong and why]

## Contributing Factors

1. [Factor 1]
2. [Factor 2]
3. [Factor 3]

## Resolution

[What was done to fix the issue]

## Preventive Measures

| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| [Action 1] | [Name] | [Date] | [TODO/DONE] |
| [Action 2] | [Name] | [Date] | [TODO/DONE] |

## Lessons Learned

- [Lesson 1]
- [Lesson 2]

## Monitoring Improvements

- [Improvement 1]
- [Improvement 2]
```

---

## References

- **Runbook**: `docs/runbooks/citation-integrity-troubleshooting.md`
- **Rollback**: `docs/deployment/ROLLBACK_PROCEDURES.md`
- **Architecture**: `docs/wiki/citation-integrity-platform.md`
- **Monitoring**: `docs/monitoring/citationIntegrityDashboard.md`

---

**Last Updated**: November 16, 2025
**Next Review**: May 16, 2026 (6 months)
