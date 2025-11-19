# MARCUS 3.0 Production Runbook

**Version:** 1.0
**Last Updated:** 2025-11-19
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

## Contacts

**On-Call Rotation:** See PagerDuty schedule

**Escalation:**
1. Platform Team Lead: platform-lead@yourdomain.com
2. CTO: cto@yourdomain.com

**External Vendors:**
- Anthropic API Support: support@anthropic.com
- AWS Support: aws.amazon.com/support

---

**Document Version:** 1.0
**Last Review:** 2025-11-19
**Next Review:** 2026-02-19
