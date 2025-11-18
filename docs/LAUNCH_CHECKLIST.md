# MARCUS 3.0 Production Launch Checklist

## Pre-Launch (1 week before)

### Infrastructure
- [ ] Kubernetes cluster provisioned (5+ nodes, 4 CPU / 16GB RAM each)
- [ ] PostgreSQL primary + 2 replicas configured
- [ ] Redis 6-node cluster deployed
- [ ] Istio service mesh installed
- [ ] Cert-manager configured (Let's Encrypt production)
- [ ] DNS records updated (marcus.example.com → ingress IP)

### Security
- [ ] All secrets rotated (JWT, database, Redis)
- [ ] Secrets stored in Vault/AWS Secrets Manager (not in k8s secrets)
- [ ] Rate limits configured for production traffic
- [ ] Firewall rules applied (only ports 80, 443, 6443 open)
- [ ] Admin user password changed from default
- [ ] Audit logging enabled and shipping to SIEM

### Monitoring
- [ ] Grafana dashboards imported (6 dashboards)
- [ ] Prometheus alert rules configured (30 alerts)
- [ ] PagerDuty integration tested
- [ ] Loki log aggregation working
- [ ] Jaeger tracing endpoint accessible
- [ ] Runbook distributed to on-call team

### Testing
- [ ] Integration tests passing (100%)
- [ ] Load test at 10x traffic completed
- [ ] Chaos engineering scenarios validated
- [ ] Security penetration test complete
- [ ] 7-day production pilot successful (0 P0/P1 incidents)

## Launch Day

### T-60 minutes
- [ ] All team members on call
- [ ] Rollback plan reviewed
- [ ] Database backup created
- [ ] Traffic currently at 0%

### T-30 minutes
- [ ] Final health checks passing (`kubectl get pods -n marcus-platform`)
- [ ] Circuit breakers in CLOSED state
- [ ] No active alerts in Prometheus
- [ ] Agents all healthy (`/api/admin/agents {"action": "health"}`)

### T-15 minutes
- [ ] DNS TTL reduced to 60s (for fast rollback)
- [ ] Monitoring dashboards open
- [ ] Incident channel active (#marcus-launch)

### T-0: LAUNCH
- [ ] Update DNS to point to production ingress
- [ ] Verify first requests succeed (check Grafana)
- [ ] Monitor error rate (<1%)
- [ ] Watch agent health dashboard

### T+15 minutes
- [ ] Traffic ramping normally
- [ ] No 5xx errors
- [ ] Database connections stable (<50% pool)
- [ ] Redis cluster healthy

### T+60 minutes
- [ ] Full traffic migrated
- [ ] All metrics within normal ranges
- [ ] No alerts firing
- [ ] Declare launch successful ✅

## Post-Launch

### T+1 day
- [ ] Review logs for any warnings
- [ ] Check CSP violation reports
- [ ] Verify audit logs capturing all events
- [ ] Send launch success announcement

### T+1 week
- [ ] Restore DNS TTL to 3600s
- [ ] Review performance metrics vs baselines
- [ ] Identify any optimization opportunities
- [ ] Schedule retrospective

## Rollback Procedure

If error rate >5% or P0 incident:

1. **Immediate**: Revert DNS to old system (60s TTL = 1 min switchover)
2. **Stop traffic**: Scale orchestrator to 0 replicas
3. **Investigate**: Check logs, metrics, agent health
4. **Fix forward** or **stay rolled back** (team decision)
5. **Post-mortem**: Within 48 hours

## Success Criteria

- ✅ Error rate <1%
- ✅ P95 latency <200ms
- ✅ Agent consensus >80%
- ✅ Zero data loss
- ✅ No security incidents
- ✅ Team confidence high

---

**Launch Captain**: [Name]
**Date**: [YYYY-MM-DD]
**Time**: [HH:MM UTC]
