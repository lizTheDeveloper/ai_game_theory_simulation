# MARCUS 3.0 - Deployment Runbook

## Overview

This runbook provides step-by-step procedures for deploying the MARCUS 3.0 Citation Integrity Platform across all environments.

## Pre-Deployment Checklist

- [ ] All tests passing (Python + TypeScript)
- [ ] Linting checks passing
- [ ] Security scans passing
- [ ] Docker images built successfully
- [ ] Benchmark results reviewed
- [ ] Database migrations prepared (if any)
- [ ] Secrets rotated (if scheduled)
- [ ] Team notified of deployment window

## Environment-Specific Deployments

### Development Environment

**Trigger:** Automatic on merge to `main`

**Access:**
- URL: https://dev.marcus.example.com
- SSH: `ssh marcus@dev-server`
- Monitoring: https://dev.marcus.example.com:3001 (Grafana)

**Manual Deployment:**
```bash
# SSH to dev server
ssh marcus@dev-server

# Navigate to deployment directory
cd /opt/marcus-3.0

# Pull latest images
docker-compose pull

# Deploy
docker-compose up -d --remove-orphans

# Check status
docker-compose ps

# View logs
docker-compose logs -f orchestrator
```

**Health Check:**
```bash
curl https://dev.marcus.example.com/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-17T12:00:00Z",
  "agents": {
    "total": 3,
    "healthy": 3
  },
  "database": true,
  "redis": true
}
```

### Staging Environment

**Trigger:** Automatic after successful dev deployment

**Access:**
- URL: https://staging.marcus.example.com
- SSH: `ssh marcus@staging-server`
- Monitoring: https://staging.marcus.example.com:3001 (Grafana)

**Blue-Green Deployment:**

1. **Determine Current Color:**
```bash
ssh marcus@staging-server
cd /opt/marcus-3.0

if docker-compose -f docker-compose.blue.yml ps | grep -q "Up"; then
  echo "Current: BLUE, Deploying to: GREEN"
else
  echo "Current: GREEN, Deploying to: BLUE"
fi
```

2. **Deploy to Target Environment:**
```bash
# Example: deploying to green
docker-compose -f docker-compose.green.yml pull
docker-compose -f docker-compose.green.yml up -d
```

3. **Health Check:**
```bash
# Wait for services to be ready
timeout 60 bash -c 'until curl -f http://localhost:3001/health; do sleep 5; done'

# Check all services
curl http://localhost:3001/health
curl http://localhost:3001/metrics
```

4. **Run Integration Tests:**
```bash
./integration-tests.sh green
```

5. **Switch Traffic:**
```bash
# Update load balancer / reverse proxy
./switch-traffic.sh green

# Verify
curl https://staging.marcus.example.com/health
```

6. **Monitor:**
```bash
# Watch logs for 5 minutes
docker-compose -f docker-compose.green.yml logs -f
```

### Production Environment

**Trigger:** Manual approval required

**Access:**
- URL: https://marcus.example.com
- SSH: `ssh marcus@prod-server`
- Monitoring: https://monitoring.marcus.example.com (Grafana)

**Pre-Production Checklist:**
- [ ] Staging deployment successful
- [ ] Integration tests passed
- [ ] Benchmark regression check passed
- [ ] Database backup verified
- [ ] Rollback plan reviewed
- [ ] Team on standby
- [ ] Maintenance window scheduled (if applicable)

**Blue-Green Production Deployment:**

1. **Backup Current State:**
```bash
ssh marcus@prod-server
cd /opt/marcus-3.0

# Backup database
./backup-state.sh

# Verify backup
ls -lh backups/
```

2. **Determine Current Color:**
```bash
if docker-compose -f docker-compose.blue.yml ps | grep -q "Up"; then
  CURRENT="blue"
  TARGET="green"
else
  CURRENT="green"
  TARGET="blue"
fi

echo "Production: $CURRENT → $TARGET"
```

3. **Deploy to Target:**
```bash
docker-compose -f docker-compose.$TARGET.yml pull
docker-compose -f docker-compose.$TARGET.yml up -d
```

4. **Comprehensive Health Checks:**
```bash
# Wait for services
timeout 120 bash -c "until curl -f http://localhost:300$TARGET/health; do sleep 5; done"

# Run smoke tests
./smoke-tests.sh $TARGET
```

5. **Switch Production Traffic:**
```bash
# Update load balancer
./switch-traffic.sh $TARGET

# Verify external access
curl https://marcus.example.com/health
```

6. **Monitor for 5 Minutes:**
```bash
# Watch application logs
docker-compose -f docker-compose.$TARGET.yml logs -f orchestrator &

# Watch metrics
watch -n 5 'curl -s https://marcus.example.com/metrics | grep citation_'

# Wait
sleep 300
```

7. **Final Health Check:**
```bash
curl -f https://marcus.example.com/health || (echo "Health check failed! Rolling back..."; ./switch-traffic.sh $CURRENT; exit 1)
```

8. **Tag Deployment:**
```bash
git tag -a "prod-$(date +%Y%m%d-%H%M%S)" -m "Production deployment"
git push --tags
```

## Rollback Procedures

### Automatic Rollback

If health checks fail, the deployment workflow automatically rolls back.

### Manual Rollback

**Development/Staging:**
```bash
ssh marcus@{env}-server
cd /opt/marcus-3.0

# Restore previous version
docker-compose down
git checkout {previous-tag}
docker-compose up -d

# Verify
curl http://localhost:3000/health
```

**Production (Blue-Green):**
```bash
ssh marcus@prod-server
cd /opt/marcus-3.0

# Determine target environment
if docker-compose -f docker-compose.blue.yml ps | grep -q "Up"; then
  ROLLBACK_TO="green"
else
  ROLLBACK_TO="blue"
fi

echo "Rolling back to $ROLLBACK_TO"

# Switch traffic back
./switch-traffic.sh $ROLLBACK_TO

# Verify
curl https://marcus.example.com/health

# Stop new version
if [ "$ROLLBACK_TO" == "blue" ]; then
  docker-compose -f docker-compose.green.yml down
else
  docker-compose -f docker-compose.blue.yml down
fi
```

### Database Rollback

**If migrations were applied:**
```bash
# Restore from backup
./restore-database.sh backups/latest.sql

# Verify data integrity
psql -U marcus -d citation_integrity -c "SELECT COUNT(*) FROM agent_states;"
```

## Monitoring During Deployment

### Key Metrics to Watch

**Application Health:**
- Orchestrator /health endpoint (200 OK)
- Agent count (should match NUM_AGENTS)
- Database connectivity
- Redis connectivity

**Performance Metrics:**
- p95 latency (<100ms normal)
- Throughput (>50 citations/sec normal)
- Error rate (<1% normal)
- CPU usage (<50% normal)
- Memory usage (<1GB normal)

**Grafana Dashboards:**
- Platform Overview
- Agent Health
- Performance Metrics
- Error Rates

### Prometheus Queries

```promql
# Request rate
rate(citation_requests_total[5m])

# Error rate
rate(citation_errors_total[5m]) / rate(citation_requests_total[5m])

# p95 latency
histogram_quantile(0.95, rate(citation_latency_ms_bucket[5m]))

# Agent health
citation_agent_healthy
```

## Troubleshooting

### Common Issues

**Issue: Orchestrator won't start**

**Symptoms:**
- Health check fails
- Logs show connection errors

**Resolution:**
```bash
# Check database connectivity
docker-compose exec postgres pg_isready

# Check Redis
docker-compose exec redis redis-cli ping

# Review orchestrator logs
docker-compose logs orchestrator

# Restart orchestrator
docker-compose restart orchestrator
```

**Issue: Agents not responding**

**Symptoms:**
- Agent count shows 0
- Consensus level drops

**Resolution:**
```bash
# Check agent logs
docker-compose logs citation-agent

# Check agent processes
docker-compose ps | grep agent

# Restart agents
docker-compose restart citation-agent

# Scale if needed
docker-compose up -d --scale citation-agent=5
```

**Issue: High latency**

**Symptoms:**
- p95 latency >200ms
- Timeout errors

**Resolution:**
```bash
# Check system resources
docker stats

# Check database performance
docker-compose exec postgres psql -U marcus -c "SELECT * FROM pg_stat_activity;"

# Check for slow queries
docker-compose exec postgres psql -U marcus -c "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Scale agents
docker-compose up -d --scale citation-agent=10

# Check Redis cache hit rate
docker-compose exec redis redis-cli INFO stats
```

**Issue: Database connection pool exhausted**

**Symptoms:**
- "too many connections" errors
- Requests timing out

**Resolution:**
```bash
# Check current connections
docker-compose exec postgres psql -U marcus -c "SELECT COUNT(*) FROM pg_stat_activity;"

# Terminate idle connections
docker-compose exec postgres psql -U marcus -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND state_change < NOW() - INTERVAL '5 minutes';"

# Increase pool size in .env
echo "POSTGRES_POOL_SIZE=50" >> .env
docker-compose up -d
```

## Post-Deployment Tasks

- [ ] Verify all health checks passing
- [ ] Review deployment logs
- [ ] Check Grafana dashboards
- [ ] Update deployment log
- [ ] Notify team of successful deployment
- [ ] Monitor for 24 hours
- [ ] Review error logs
- [ ] Update documentation if changes made

## Emergency Contacts

**On-Call:**
- Primary: [Name] - [Phone]
- Secondary: [Name] - [Phone]

**Escalation:**
- Platform Lead: [Name] - [Phone]
- CTO: [Name] - [Phone]

## Deployment Log Template

```
# Deployment Log - MARCUS 3.0

Date: 2025-11-17
Environment: Production
Deployed By: [Your Name]
Commit: abc123def
Tag: prod-20251117-120000

## Pre-Deployment
- [ ] All checks passed
- [ ] Backup completed
- [ ] Team notified

## Deployment
- Started: 12:00 UTC
- Blue/Green: blue → green
- Traffic switched: 12:05 UTC
- Completed: 12:10 UTC

## Post-Deployment
- Health checks: ✅ Passed
- Performance: ✅ Normal
- Error rate: ✅ <1%
- Monitoring: ✅ Active

## Issues
None

## Notes
Smooth deployment, no issues.
```
