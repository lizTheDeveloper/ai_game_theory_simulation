# MARCUS 3.0 Production Runbook

**Version:** 2.0
**Last Updated:** 2025-11-21
**Maintainer:** Platform Team

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Deployment](#deployment)
5. [Configuration](#configuration)
6. [Monitoring](#monitoring)
7. [Operations](#operations)
8. [Troubleshooting](#troubleshooting)
9. [Disaster Recovery](#disaster-recovery)
10. [Maintenance](#maintenance)
11. [Security](#security)
12. [Contacts](#contacts)

---

## System Overview

**MARCUS 3.0** (Multi-Agent Research Citation Utility System) is a citation integrity platform that integrates Python-based AI agents with a TypeScript/Node.js backend for academic paper verification.

### Key Components
- **TypeScript Backend** - Express API, authentication, database persistence
- **Python Agents** - Citation analysis, nested learning, swarm intelligence
- **PostgreSQL** - User accounts, audit logs, citation data
- **Redis** - Session management, caching, rate limiting
- **Prometheus** - Metrics collection and monitoring

### Service Dependencies
- Node.js >= 18.x
- PostgreSQL >= 13
- Redis >= 6.0
- Python >= 3.9

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│              Load Balancer (nginx)              │
└───────────────────┬─────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
┌───────▼────────┐    ┌─────────▼────────┐
│  MARCUS API    │    │  MARCUS API      │
│  (Node.js)     │    │  (Node.js)       │
└───┬────────┬───┘    └───┬────────┬─────┘
    │        │            │        │
    │   ┌────▼────────────▼───┐    │
    │   │   PostgreSQL DB    │    │
    │   └────────────────────┘    │
    │                             │
    │   ┌────────────────────┐    │
    │   │      Redis         │    │
    │   └────────────────────┘    │
    │                             │
    │   ┌────────────────────┐    │
    └───►  Python Agents     ◄────┘
        │  (Child Processes) │
        └────────────────────┘
```

### Data Flow
1. User authenticates via `/auth/login` → JWT token issued
2. Client sends citation request with JWT → Express middleware validates
3. API spawns Python agent process via IPC
4. Agent analyzes citation → returns results
5. API stores results in PostgreSQL → returns to client
6. Metrics recorded to Prometheus

---

## Prerequisites

### Hardware Requirements (Production)
- **CPU:** 4+ cores (8+ recommended)
- **RAM:** 8GB minimum (16GB recommended)
- **Disk:** 50GB SSD minimum (100GB+ for logs/backups)
- **Network:** 1Gbps

### Software Dependencies

```bash
# System packages (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install -y \
  nodejs \
  npm \
  postgresql \
  redis-server \
  python3 \
  python3-pip \
  nginx

# Verify versions
node --version    # >= 18.x
npm --version     # >= 9.x
psql --version    # >= 13.x
redis-cli --version  # >= 6.0
python3 --version # >= 3.9
```

---

## Deployment

### 1. Environment Setup

```bash
# Clone repository
git clone https://github.com/404GeneNotFound/ai_game_theory_simulation.git
cd ai_game_theory_simulation

# Create .env file
cp .env.example .env
nano .env
```

### 2. Environment Variables

**Required:**
```bash
# Node.js
NODE_ENV=production
SERVER_PORT=3000
LOG_LEVEL=info

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=marcus_production
DATABASE_USER=marcus_app
DATABASE_PASSWORD=<generate-strong-password>
DATABASE_POOL_MAX=20
DATABASE_POOL_MIN=2

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=<generate-strong-password>
REDIS_DB=0

# Authentication
JWT_SECRET=<generate-64-char-random-string>
JWT_REFRESH_SECRET=<generate-64-char-random-string>
ACCESS_TOKEN_TTL=900        # 15 minutes
REFRESH_TOKEN_TTL=604800    # 7 days

# Python Agents
ANTHROPIC_API_KEY=<your-api-key>
ENABLE_AGENTS=true
NUM_AGENTS=3

# CORS
CORS_ORIGIN=https://yourdomain.com
```

**Generate Secrets:**
```bash
# JWT_SECRET (64 chars)
openssl rand -base64 48

# Database password (32 chars)
openssl rand -base64 24
```

### 3. Database Setup

```bash
# Create database and user
sudo -u postgres psql <<EOF
CREATE DATABASE marcus_production;
CREATE USER marcus_app WITH PASSWORD '<your-password>';
GRANT ALL PRIVILEGES ON DATABASE marcus_production TO marcus_app;
\c marcus_production
GRANT ALL ON SCHEMA public TO marcus_app;
EOF

# Run migrations (if using a migration tool)
npm run migrate
```

**Manual Schema Creation:**
```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'viewer',
  is_active BOOLEAN DEFAULT true,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

### 4. Install Dependencies

```bash
# Node.js dependencies
npm ci --production

# Python dependencies
pip3 install -r requirements.txt
```

### 5. Build Application

```bash
# TypeScript compilation
npm run build

# Verify build
ls -la dist/
```

### 6. Start Services

```bash
# Using systemd (recommended)
sudo systemctl start marcus
sudo systemctl enable marcus

# Or using PM2
pm2 start npm --name "marcus" -- start
pm2 save
pm2 startup
```

---

## Configuration

### Systemd Service File

Create `/etc/systemd/system/marcus.service`:

```ini
[Unit]
Description=MARCUS 3.0 Citation Platform
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=marcus
WorkingDirectory=/opt/marcus
EnvironmentFile=/opt/marcus/.env
ExecStart=/usr/bin/node /opt/marcus/dist/server.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=marcus

# Security
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/marcus/logs

[Install]
WantedBy=multi-user.target
```

### nginx Reverse Proxy

Create `/etc/nginx/sites-available/marcus`:

```nginx
upstream marcus_backend {
  server 127.0.0.1:3000;
  server 127.0.0.1:3001;  # If running multiple instances
  keepalive 64;
}

server {
  listen 80;
  server_name marcus.yourdomain.com;
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name marcus.yourdomain.com;

  ssl_certificate /etc/letsencrypt/live/marcus.yourdomain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/marcus.yourdomain.com/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;

  access_log /var/log/nginx/marcus_access.log;
  error_log /var/log/nginx/marcus_error.log;

  location / {
    proxy_pass http://marcus_backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
  }

  location /metrics {
    deny all;  # Only allow Prometheus scraper
    allow 10.0.0.0/8;
    proxy_pass http://marcus_backend/metrics;
  }

  location /health {
    access_log off;
    proxy_pass http://marcus_backend/health;
  }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/marcus /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Monitoring

### Prometheus Metrics

**Metrics Endpoint:** `GET /metrics`

**Key Metrics:**
- `marcus_http_request_duration_seconds` - Request latency
- `marcus_http_requests_total` - Request count
- `marcus_http_active_connections` - Concurrent connections
- `marcus_agent_status{agent_id}` - Agent health (1=healthy, 0=down)
- `marcus_auth_attempts_total{result}` - Auth success/failure/lockout
- `marcus_circuit_breaker_state{breaker_name}` - Circuit state (0/1/2)
- `marcus_db_pool_size` - Database connection pool
- `process_cpu_user_seconds_total` - CPU usage
- `nodejs_heap_size_used_bytes` - Memory usage

### Prometheus Configuration

Add to `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'marcus'
    scrape_interval: 15s
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: /metrics
```

### Alert Rules

Create `marcus_alerts.yml`:

```yaml
groups:
  - name: marcus
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: rate(marcus_http_requests_total{status_code=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"

      # Database connection pool exhaustion
      - alert: DatabasePoolExhausted
        expr: marcus_db_pool_waiting > 5
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "Database connection pool under pressure"

      # Circuit breaker open
      - alert: CircuitBreakerOpen
        expr: marcus_circuit_breaker_state == 2
        for: 1m
        labels:
          severity: warning
        annotations:
          summary: "Circuit breaker {{ $labels.breaker_name }} is OPEN"

      # High auth failure rate
      - alert: HighAuthFailureRate
        expr: rate(marcus_auth_attempts_total{result="failure"}[5m]) > 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High authentication failure rate (potential attack)"

      # Agent down
      - alert: AgentDown
        expr: marcus_agent_status == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Python agent {{ $labels.agent_id }} is down"
```

### Grafana Dashboard

Import `dashboards/marcus-overview.json` or create panels for:
1. **Request Rate** - `rate(marcus_http_requests_total[5m])`
2. **Error Rate** - `rate(marcus_http_requests_total{status_code=~"5.."}[5m])`
3. **Latency (p95)** - `histogram_quantile(0.95, marcus_http_request_duration_seconds_bucket)`
4. **Active Connections** - `marcus_http_active_connections`
5. **CPU Usage** - `rate(process_cpu_user_seconds_total[5m])`
6. **Memory Usage** - `nodejs_heap_size_used_bytes`

---

## Operations

### Starting the Service

```bash
# Systemd
sudo systemctl start marcus
sudo systemctl status marcus

# PM2
pm2 start marcus
pm2 status
```

### Stopping the Service

```bash
# Systemd
sudo systemctl stop marcus

# PM2
pm2 stop marcus
```

### Restarting the Service

```bash
# Graceful restart (systemd)
sudo systemctl reload marcus

# Force restart
sudo systemctl restart marcus

# PM2 (zero-downtime)
pm2 reload marcus
```

### Viewing Logs

```bash
# Systemd logs
sudo journalctl -u marcus -f

# PM2 logs
pm2 logs marcus

# Application logs
tail -f /opt/marcus/logs/marcus-$(date +%Y-%m-%d).log
```

### Deployment Process

1. **Pre-deployment validation**
   ```bash
   ./scripts/validateDeployment.sh production
   ```

2. **Backup database**
   ```bash
   pg_dump marcus_production > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

3. **Pull latest code**
   ```bash
   git pull origin main
   ```

4. **Install dependencies**
   ```bash
   npm ci --production
   pip3 install -r requirements.txt
   ```

5. **Run migrations** (if applicable)
   ```bash
   npm run migrate
   ```

6. **Build application**
   ```bash
   npm run build
   ```

7. **Restart service**
   ```bash
   pm2 reload marcus --update-env
   ```

8. **Verify deployment**
   ```bash
   curl https://marcus.yourdomain.com/health
   ```

---

## Common Incident Procedures

This section provides step-by-step procedures for handling common production incidents.

### Incident Response Framework

**All incidents should follow this framework:**

1. **Detect** - Alert triggers or user report
2. **Triage** - Assess severity and impact
3. **Mitigate** - Stop the bleeding (rollback, scale, failover)
4. **Investigate** - Root cause analysis
5. **Resolve** - Permanent fix
6. **Document** - Post-mortem and prevention

**Severity Levels:**
- **P1 (Critical):** Complete service outage, data loss, security breach
- **P2 (High):** Partial outage, severe degradation affecting >50% users
- **P3 (Medium):** Degraded performance, minor feature outage
- **P4 (Low):** Minor issues, no user impact

### Incident 1: Complete Service Outage

**Symptoms:**
- `/health` endpoint returns 5xx errors
- All API requests failing
- No logs being written

**Immediate Actions (5 minutes):**

```bash
# 1. Verify outage scope
curl -I https://marcus-platform.com/health

# 2. Check service status
sudo systemctl status marcus-platform
pm2 status marcus

# 3. Check system resources
top -bn1 | head -20
df -h
free -h

# 4. Check for OOM kills
dmesg | grep -i "out of memory"
sudo journalctl -k | grep -i "killed process"
```

**Mitigation (10 minutes):**

```bash
# Option A: Restart service
pm2 restart marcus --update-env

# Option B: Rollback to last known good version
cd /opt/marcus
git log --oneline -5  # Find last working commit
git checkout <last-good-commit>
npm ci --production
npm run build
pm2 restart marcus

# Option C: Scale horizontally (if load-related)
# Add more instances via load balancer config
```

**Communication:**
- Post status update to status page within 5 minutes
- Notify #incidents Slack channel
- Send customer email if outage >15 minutes

**Post-Incident:**
- Run full post-mortem meeting within 48 hours
- Update monitoring alerts to catch earlier
- Add regression test if code-related

### Incident 2: Database Performance Degradation

**Symptoms:**
- `pg_stat_database_blocked` > 10
- API response times p95 > 3 seconds
- Connection pool exhaustion warnings

**Immediate Actions:**

```bash
# 1. Identify slow queries
sudo -u postgres psql marcus_production <<EOF
SELECT
    pid,
    now() - pg_stat_activity.query_start AS duration,
    query,
    state
FROM pg_stat_activity
WHERE state != 'idle'
AND query_start < now() - interval '30 seconds'
ORDER BY duration DESC
LIMIT 10;
EOF

# 2. Check for locks
sudo -u postgres psql marcus_production <<EOF
SELECT
    blocked_locks.pid AS blocked_pid,
    blocked_activity.usename AS blocked_user,
    blocking_locks.pid AS blocking_pid,
    blocking_activity.usename AS blocking_user,
    blocked_activity.query AS blocked_statement,
    blocking_activity.query AS blocking_statement
FROM pg_catalog.pg_locks blocked_locks
JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_locks.pid = blocked_activity.pid
JOIN pg_catalog.pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_locks.pid = blocking_activity.pid
WHERE NOT blocked_locks.GRANTED;
EOF

# 3. Check connection count
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"
```

**Mitigation:**

```bash
# Option A: Kill long-running queries
sudo -u postgres psql marcus_production -c "
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE query_start < now() - interval '5 minutes'
AND state = 'active';
"

# Option B: Clear lock contention
sudo -u postgres psql marcus_production -c "
SELECT pg_cancel_backend(pid)
FROM pg_stat_activity
WHERE wait_event_type = 'Lock';
"

# Option C: Emergency VACUUM
sudo -u postgres vacuumdb -z marcus_production

# Option D: Increase connection pool (temporary)
# Update .env
DATABASE_POOL_MAX=100
pm2 restart marcus --update-env
```

**Root Cause Investigation:**
- Review pg_stat_statements for slowest queries
- Check for missing indexes
- Analyze query execution plans (EXPLAIN ANALYZE)
- Review recent schema changes

### Incident 3: Memory Leak

**Symptoms:**
- Heap usage steadily increasing over time
- OOM kills in system logs
- Service restarts required daily

**Immediate Actions:**

```bash
# 1. Check current memory usage
pm2 monit

# 2. Take heap snapshot
node --inspect dist/server.js &
PID=$!

# Connect with Chrome DevTools
# chrome://inspect → Take heap snapshot

# 3. Check for process leaks
ps aux | grep node | wc -l  # Should be stable

# 4. Monitor garbage collection
NODE_OPTIONS="--expose-gc --trace-gc" pm2 restart marcus
pm2 logs marcus | grep -i "scavenge\|marksweep"
```

**Mitigation:**

```bash
# Short-term: Restart on schedule
pm2 delete marcus
pm2 start ecosystem.config.js --cron-restart="0 4 * * *"

# Medium-term: Increase heap size
NODE_OPTIONS="--max-old-space-size=4096" pm2 restart marcus

# Long-term: Fix leak in code (requires investigation)
```

**Investigation Tools:**
```bash
# Generate heap dump
kill -USR2 $PID  # Sends signal to generate heapdump

# Analyze with Chrome DevTools Memory Profiler
# Look for detached DOM nodes, unclosed connections
```

### Incident 4: Redis Connection Failure

**Symptoms:**
- Session management failing
- Rate limiting not working
- Queue processing stopped

**Immediate Actions:**

```bash
# 1. Check Redis service
sudo systemctl status redis
redis-cli PING

# 2. Check Redis logs
sudo journalctl -u redis -n 100

# 3. Check memory usage
redis-cli INFO memory

# 4. Check for blocked clients
redis-cli CLIENT LIST | grep -i blocked
```

**Mitigation:**

```bash
# Option A: Restart Redis
sudo systemctl restart redis

# Option B: Flush evicted keys
redis-cli FLUSHDB  # WARNING: Clears all data!

# Option C: Increase maxmemory
sudo sed -i 's/maxmemory .*/maxmemory 8gb/' /etc/redis/redis.conf
sudo systemctl restart redis

# Option D: Failover to replica (if configured)
redis-cli SLAVEOF NO ONE  # Promote replica to master
```

**Data Loss Assessment:**
- Sessions: Users will need to re-authenticate
- Rate limits: Temporarily reset (acceptable)
- Job queues: May lose in-flight jobs (check queue persistence)

### Incident 5: Certificate Expiration

**Symptoms:**
- Browser warnings "Your connection is not private"
- API clients failing with SSL errors
- Monitoring alerts: `ssl_cert_expiry_days < 7`

**Immediate Actions:**

```bash
# 1. Check certificate expiration
echo | openssl s_client -connect marcus-platform.com:443 2>/dev/null | \
  openssl x509 -noout -dates

# 2. Verify certbot auto-renewal
sudo certbot renew --dry-run
```

**Mitigation:**

```bash
# Option A: Manual renewal
sudo certbot renew --force-renewal
sudo systemctl reload nginx

# Option B: Use existing backup cert
sudo cp /etc/letsencrypt/live/marcus-platform.com/fullchain.pem.backup \
  /etc/letsencrypt/live/marcus-platform.com/fullchain.pem
sudo systemctl reload nginx

# Option C: Emergency self-signed cert (last resort)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/emergency.key \
  -out /etc/ssl/certs/emergency.crt

# Update nginx config temporarily
sudo nginx -t && sudo systemctl reload nginx
```

**Prevention:**
- Set up monitoring alert 30 days before expiration
- Verify certbot cron job runs weekly
- Test renewal process quarterly

### Incident 6: API Performance Degradation

**Symptoms:**
- Response times p95 > 1s (normal: <300ms)
- Increased error rate (>1%)
- User complaints about slowness

**Immediate Actions:**

```bash
# 1. Check current performance
curl -w "@curl-format.txt" -o /dev/null -s https://marcus-platform.com/health

# curl-format.txt:
# time_total: %{time_total}s
# time_connect: %{time_connect}s
# time_starttransfer: %{time_starttransfer}s

# 2. Check active requests
pm2 monit

# 3. Check database query times
# (see Database Performance Degradation)

# 4. Check for external API issues
curl -w "time_total: %{time_total}\n" https://api.anthropic.com/v1/health
```

**Mitigation:**

```bash
# Option A: Add more API servers
# Scale horizontally via load balancer

# Option B: Enable aggressive caching
redis-cli CONFIG SET maxmemory-policy allkeys-lfu

# Option C: Enable circuit breakers
# Update .env
CIRCUIT_BREAKER_THRESHOLD=10
pm2 restart marcus --update-env

# Option D: Rate limit aggressive users
redis-cli KEYS "ratelimit:*" | head -20
# Identify and block abusive IPs
```

**Investigation:**
- Review Prometheus dashboards for anomalies
- Check for N+1 query patterns
- Analyze distributed tracing (if enabled)
- Review recent deployments

### Incident 7: Agent Process Failures

**Symptoms:**
- Citation analysis jobs stuck in PENDING
- Agent spawn errors in logs
- `marcus_agent_failures` metric increasing

**Immediate Actions:**

```bash
# 1. Check running agent processes
ps aux | grep python | grep citation_analyzer

# 2. Check agent logs
tail -f /var/log/marcus/agents-$(date +%Y-%m-%d).log

# 3. Check for zombie processes
ps aux | grep defunct

# 4. Check Python dependencies
pip3 list | grep -i anthropic
```

**Mitigation:**

```bash
# Option A: Restart agent pool
pkill -f "python.*citation_analyzer"
pm2 restart marcus  # Will respawn agents

# Option B: Clear agent queue
redis-cli DEL marcus:agent:queue

# Option C: Reduce agent concurrency (if resource-limited)
# Update .env
MAX_AGENT_PROCESSES=5
pm2 restart marcus

# Option D: Switch to fallback analysis (if available)
# Update .env
FALLBACK_ANALYSIS_MODE=true
pm2 restart marcus
```

**Data Recovery:**
- Retry failed jobs from database
- Notify affected users
- Queue cleanup script

### Incident 8: Security Breach

**Symptoms:**
- Unusual authentication patterns
- Unexpected database changes
- Security scanning alerts
- User reports of unauthorized access

**CRITICAL: Follow security incident runbook**

**Immediate Actions (DO NOT DELAY):**

```bash
# 1. Isolate affected systems
sudo ufw deny from <suspicious-ip>

# 2. Rotate all secrets immediately
./scripts/rotate_all_secrets.sh

# 3. Invalidate all sessions
redis-cli FLUSHDB

# 4. Enable maintenance mode
touch /opt/marcus/MAINTENANCE_MODE

# 5. Capture forensic evidence
sudo tar czf /secure/forensics-$(date +%Y%m%d-%H%M%S).tar.gz \
  /var/log/marcus \
  /var/log/nginx \
  /var/log/auth.log

# 6. Notify security team immediately
# Send to: security@yourdomain.com
```

**Escalation:**
- Immediately escalate to CTO
- Contact legal team if PII exposed
- Notify customers within 72 hours (GDPR requirement)

**Post-Incident:**
- Full security audit required
- Penetration test before resuming service
- Mandatory post-mortem with security team

---

## Troubleshooting

### Service Won't Start

**Symptom:** `systemctl start marcus` fails

**Diagnosis:**
```bash
# Check logs
sudo journalctl -u marcus -n 50

# Check port availability
sudo netstat -tlnp | grep 3000

# Verify environment variables
sudo systemctl show marcus --property=Environment
```

**Common Causes:**
- Port 3000 already in use
- Missing environment variables
- Database connection failure
- Permissions issues

**Resolution:**
```bash
# Kill process on port 3000
sudo kill $(sudo lsof -t -i:3000)

# Verify .env file exists and is readable
ls -la /opt/marcus/.env

# Test database connection
psql "postgresql://$DATABASE_USER:$DATABASE_PASSWORD@$DATABASE_HOST:$DATABASE_PORT/$DATABASE_NAME" -c '\q'
```

### High Memory Usage

**Symptom:** `nodejs_heap_size_used_bytes` > 2GB

**Diagnosis:**
```bash
# Heap snapshot
node --inspect dist/server.js
# Chrome DevTools → Memory → Take heap snapshot

# Check for memory leaks
pm2 monit
```

**Common Causes:**
- Memory leak in agent child processes
- Large result sets not paginated
- Connection pool not closing

**Resolution:**
```bash
# Restart service to free memory
pm2 restart marcus

# Increase heap size (temporary)
NODE_OPTIONS=--max-old-space-size=4096 pm2 restart marcus
```

### Database Connection Pool Exhausted

**Symptom:** `marcus_db_pool_waiting` > 10

**Diagnosis:**
```bash
# Check active connections
psql -U postgres -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'marcus_production';"

# Check long-running queries
psql -U postgres -c "SELECT pid, now() - pg_stat_activity.query_start AS duration, query FROM pg_stat_activity WHERE state = 'active' ORDER BY duration DESC;"
```

**Resolution:**
```bash
# Increase pool size in .env
DATABASE_POOL_MAX=40

# Terminate idle connections
psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'marcus_production' AND state = 'idle' AND state_change < now() - interval '10 minutes';"
```

### Circuit Breaker Stuck OPEN

**Symptom:** `marcus_circuit_breaker_state` = 2 for > 5 minutes

**Diagnosis:**
```bash
# Check breaker state
curl http://localhost:3000/api/admin/circuit-breakers

# Check underlying service
curl http://localhost:3000/health
```

**Resolution:**
```bash
# Force close circuit breaker (admin API)
curl -X POST http://localhost:3000/api/admin/circuit-breakers/agent-service/reset \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Restart service if needed
pm2 restart marcus
```

### Authentication Failures

**Symptom:** `marcus_auth_attempts_total{result="failure"}` spiking

**Diagnosis:**
```bash
# Check audit logs
psql -U marcus_app -d marcus_production -c "SELECT * FROM audit_logs WHERE action = 'login_failed' ORDER BY created_at DESC LIMIT 20;"

# Check for account lockouts
psql -U marcus_app -d marcus_production -c "SELECT email, failed_login_attempts, locked_until FROM users WHERE locked_until > now();"
```

**Resolution:**
```bash
# Unlock account (admin API)
curl -X POST http://localhost:3000/api/admin/users/unlock \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

---

## Disaster Recovery

### Database Backup

**Automated Daily Backup:**
```bash
# Create backup script
cat > /opt/marcus/scripts/backup_db.sh <<'EOF'
#!/bin/bash
BACKUP_DIR="/opt/marcus/backups"
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U marcus_app marcus_production | gzip > "$BACKUP_DIR/marcus_$DATE.sql.gz"
find "$BACKUP_DIR" -name "marcus_*.sql.gz" -mtime +7 -delete
EOF

# Add to crontab
sudo crontab -e
# Add: 0 2 * * * /opt/marcus/scripts/backup_db.sh
```

**Manual Backup:**
```bash
pg_dump -U marcus_app marcus_production > backup.sql
```

### Database Restore

```bash
# Stop application
sudo systemctl stop marcus

# Drop and recreate database
sudo -u postgres psql -c "DROP DATABASE marcus_production;"
sudo -u postgres psql -c "CREATE DATABASE marcus_production OWNER marcus_app;"

# Restore backup
psql -U marcus_app -d marcus_production < backup.sql

# Start application
sudo systemctl start marcus
```

### Redis Persistence

**Enable RDB snapshots:**
Edit `/etc/redis/redis.conf`:
```
save 900 1
save 300 10
save 60 10000
dbfilename marcus_dump.rdb
```

**Restore Redis:**
```bash
sudo systemctl stop redis
sudo cp /var/lib/redis/marcus_dump.rdb.backup /var/lib/redis/dump.rdb
sudo systemctl start redis
```

---

## Maintenance

### Log Rotation

Create `/etc/logrotate.d/marcus`:
```
/opt/marcus/logs/*.log {
  daily
  rotate 30
  compress
  delaycompress
  missingok
  notifempty
  create 0644 marcus marcus
  postrotate
    systemctl reload marcus
  endscript
}
```

### Database Vacuum

```bash
# Run weekly (crontab)
0 3 * * 0 psql -U marcus_app -d marcus_production -c "VACUUM ANALYZE;"
```

### Security Updates

```bash
# Monthly updates
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get autoremove -y

# npm updates (review first)
npm audit
npm audit fix

# Python updates
pip3 list --outdated
pip3 install --upgrade setuptools cryptography
```

---

## Security

### TLS Certificate Renewal (Let's Encrypt)

```bash
# Auto-renewal (certbot)
sudo certbot renew --dry-run

# Add to crontab (if not automatic)
0 0 * * * certbot renew --quiet && systemctl reload nginx
```

### Rotating JWT Secrets

```bash
# Generate new secret
NEW_SECRET=$(openssl rand -base64 48)

# Update .env
echo "JWT_SECRET=$NEW_SECRET" >> .env

# Restart service (invalidates all tokens)
sudo systemctl restart marcus
```

### Security Audit

```bash
# Run quarterly
./scripts/validateDeployment.sh production
npm audit
pip3 check
```

---

## Contacts & Escalation Paths

### On-Call Rotation

**Primary On-Call:** See PagerDuty schedule (https://yourdomain.pagerduty.com)

**Rotation Schedule:**
- Week 1-2: Platform Team A
- Week 3-4: Platform Team B
- Rotation changes Monday 09:00 UTC

**On-Call Responsibilities:**
- Respond to PagerDuty alerts within 15 minutes
- Triage and mitigate P1/P2 incidents
- Escalate to secondary on-call if needed
- Write incident summary within 24 hours

### Escalation Matrix

**For Platform/Infrastructure Issues:**

| Severity | First Contact | Response Time | Escalate To | Escalation Time |
|----------|--------------|---------------|-------------|-----------------|
| P1 (Critical) | On-Call Engineer | 15 min | Platform Team Lead | 30 min |
| P2 (High) | On-Call Engineer | 30 min | Platform Team Lead | 2 hours |
| P3 (Medium) | On-Call Engineer | 2 hours | Platform Team Lead | Next business day |
| P4 (Low) | Create ticket | Next business day | - | - |

**For Security Incidents:**

| Severity | First Contact | Response Time | Escalate To | Escalation Time |
|----------|--------------|---------------|-------------|-----------------|
| P1 (Data Breach) | Security Team + CTO | Immediately | Legal Team | 1 hour |
| P2 (Attempted Breach) | Security Team | 30 min | CTO | 4 hours |
| P3 (Vulnerability) | Security Team | 4 hours | - | - |

**For Data/Database Issues:**

| Severity | First Contact | Response Time | Escalate To | Escalation Time |
|----------|--------------|---------------|-------------|-----------------|
| P1 (Data Loss) | DBA + Platform Lead | Immediately | CTO | 30 min |
| P2 (Corruption) | DBA | 30 min | Platform Lead | 2 hours |
| P3 (Performance) | DBA | 2 hours | Platform Lead | Next business day |

### Contact Directory

**Internal Teams:**

**Platform Team:**
- Team Lead: platform-lead@yourdomain.com
- Secondary: platform-secondary@yourdomain.com
- Slack Channel: #platform-incidents
- PagerDuty: +1-555-PLATFORM

**Database Administration:**
- DBA Lead: dba-lead@yourdomain.com
- Slack Channel: #database-ops
- PagerDuty: +1-555-DBA-TEAM

**Security Team:**
- Security Lead: security@yourdomain.com
- Incident Hotline: +1-555-SECURITY (24/7)
- Slack Channel: #security-incidents (private)
- Email: security-incidents@yourdomain.com

**Engineering Leadership:**
- VP Engineering: vp-eng@yourdomain.com
- CTO: cto@yourdomain.com
- Slack: @cto, @vp-eng

**External Vendors:**

**Cloud Provider (AWS/GCP):**
- AWS Support Portal: https://console.aws.amazon.com/support
- AWS Premium Support: +1-206-266-4064 (24/7)
- GCP Support Portal: https://console.cloud.google.com/support
- GCP Premium Support: +1-877-355-5787 (24/7)

**Anthropic (AI API):**
- Support Email: support@anthropic.com
- Status Page: https://status.anthropic.com
- API Docs: https://docs.anthropic.com

**Database Hosting (if managed):**
- RDS Support: via AWS Support Portal
- Cloud SQL Support: via GCP Support Portal

**CDN/DNS Provider:**
- Cloudflare Support: https://dash.cloudflare.com/support
- Route 53 Support: via AWS Support Portal

**Monitoring & Alerting:**
- PagerDuty Support: support@pagerduty.com
- PagerDuty Status: https://status.pagerduty.com
- Prometheus Community: https://prometheus.io/community

### Communication Channels

**Incident Communication:**
- **Internal:** #incidents Slack channel (all hands)
- **External:** status.yourdomain.com (customer-facing)
- **Email:** incidents@yourdomain.com (incident team only)

**Status Page Updates:**
```bash
# Update status page (example using statuspage.io)
curl -X PATCH "https://api.statuspage.io/v1/pages/<page-id>/incidents/<incident-id>" \
  -H "Authorization: OAuth <token>" \
  -d '{
    "incident": {
      "status": "investigating",
      "body": "We are investigating elevated error rates on the API"
    }
  }'
```

**Customer Communication Templates:**

**Initial Incident Notice (< 15 minutes):**
```
Subject: [Incident] MARCUS Platform - Service Degradation

We are currently investigating reports of [issue description].
Our team is actively working on resolution.

Status: Investigating
Started: [timestamp]
Impact: [% of users affected]

Updates will be posted every 30 minutes at: https://status.yourdomain.com
```

**Resolution Notice:**
```
Subject: [Resolved] MARCUS Platform - Service Restored

The incident affecting [service] has been resolved.

Incident Summary:
- Start: [timestamp]
- End: [timestamp]
- Duration: [X hours Y minutes]
- Root Cause: [brief explanation]

Next Steps:
- Post-mortem will be published within 48 hours
- Preventive measures being implemented

We apologize for any inconvenience.
```

### Escalation Decision Tree

```
┌─────────────────────────────┐
│   Incident Detected         │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Is service completely down?│
│  OR Data loss/breach?       │
└──────────┬──────────────────┘
           │
    ┌──────┴──────┐
    │ YES         │ NO
    ▼             ▼
┌─────────┐   ┌──────────────────┐
│ P1      │   │ Assess impact    │
│ Critical│   │ >50% users: P2   │
│         │   │ <50% users: P3   │
└────┬────┘   └────┬─────────────┘
     │             │
     ▼             ▼
┌─────────────┐   ┌──────────────┐
│ 1. Page CTO │   │ Page On-Call │
│ 2. All hands│   └──────┬───────┘
│ 3. Start    │          │
│    war room │          ▼
└─────┬───────┘   ┌──────────────┐
      │           │ Can resolve  │
      │           │ in 2 hours?  │
      │           └──────┬───────┘
      │                  │
      │           ┌──────┴──────┐
      │           │ YES         │ NO
      │           ▼             ▼
      │      ┌─────────┐   ┌────────────┐
      │      │ Execute │   │ Escalate to│
      │      │ runbook │   │ Team Lead  │
      │      └────┬────┘   └─────┬──────┘
      │           │              │
      └───────────┴──────────────┘
                  │
                  ▼
          ┌───────────────┐
          │ Post-mortem   │
          │ within 48h    │
          └───────────────┘
```

---

**Document Version:** 2.0
**Last Review:** 2025-11-21
**Next Review:** 2026-02-21

**Changelog:**
- v2.0 (2025-11-21): Added comprehensive incident procedures (8 scenarios), enhanced escalation matrix, communication templates
- v1.0 (2025-11-19): Initial runbook creation
