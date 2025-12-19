# MARCUS 3.0 Performance Tuning Guide

This document provides comprehensive performance tuning guidance for the MARCUS citation integrity platform across all layers: database, cache, application, and infrastructure.

## Table of Contents

1. [Performance Overview](#performance-overview)
2. [Database Optimization](#database-optimization)
3. [Redis Caching Strategy](#redis-caching-strategy)
4. [Application Tuning](#application-tuning)
5. [Load Balancer Configuration](#load-balancer-configuration)
6. [Kubernetes Resource Optimization](#kubernetes-resource-optimization)
7. [Network Performance](#network-performance)
8. [Monitoring & Profiling](#monitoring--profiling)

---

## Performance Overview

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response Time (p50) | < 100ms | Prometheus histogram |
| API Response Time (p95) | < 500ms | Prometheus histogram |
| API Response Time (p99) | < 1000ms | Prometheus histogram |
| Citation Analysis Throughput | > 100/min | jobs processed |
| Database Query Time (p95) | < 50ms | pg_stat_statements |
| Cache Hit Rate | > 80% | Redis INFO stats |
| CPU Utilization (avg) | 40-60% | Kubernetes metrics |
| Memory Utilization (avg) | 50-70% | Kubernetes metrics |
| Error Rate | < 0.1% | HTTP 5xx count |

### Baseline Performance Metrics

**Before optimization:**
```
API Response Time (p95): ~800ms
Database Queries (p95): ~150ms
Cache Hit Rate: ~45%
Citations/min: ~30
CPU Usage: 75-85%
```

**After optimization (target):**
```
API Response Time (p95): ~300ms
Database Queries (p95): ~30ms
Cache Hit Rate: ~85%
Citations/min: >100
CPU Usage: 40-60%
```

---

## Database Optimization

### PostgreSQL Configuration

**File:** `/etc/postgresql/15/main/postgresql.conf`

```ini
# ============================================================================
# Memory Configuration (16GB Server)
# ============================================================================

# Shared buffers: 25% of total RAM
shared_buffers = 4GB

# Effective cache size: 50-75% of total RAM
effective_cache_size = 12GB

# Maintenance work memory: For VACUUM, CREATE INDEX
maintenance_work_mem = 1GB

# Work memory: Per-query sort/hash operations
work_mem = 64MB

# ============================================================================
# Query Planner
# ============================================================================

# Enable parallel queries
max_parallel_workers_per_gather = 4
max_parallel_workers = 8
max_worker_processes = 8

# Cost-based optimization
random_page_cost = 1.1  # SSD storage
effective_io_concurrency = 200  # Number of concurrent I/O operations

# ============================================================================
# Write-Ahead Log (WAL)
# ============================================================================

# WAL level for replication
wal_level = replica

# Checkpoint tuning
checkpoint_completion_target = 0.9
max_wal_size = 2GB
min_wal_size = 1GB

# WAL buffers
wal_buffers = 16MB

# ============================================================================
# Connection Pooling
# ============================================================================

# Max connections
max_connections = 200

# Prepared statement cache
max_prepared_transactions = 0  # Disable if not using 2PC

# ============================================================================
# Logging & Monitoring
# ============================================================================

# Log slow queries
log_min_duration_statement = 1000  # Log queries > 1s

# Query statistics
shared_preload_libraries = 'pg_stat_statements'
pg_stat_statements.track = all
pg_stat_statements.max = 10000

# ============================================================================
# Autovacuum Tuning
# ============================================================================

autovacuum = on
autovacuum_max_workers = 3
autovacuum_naptime = 10s  # More frequent vacuuming
autovacuum_vacuum_threshold = 50
autovacuum_analyze_threshold = 50
autovacuum_vacuum_scale_factor = 0.05  # Vacuum at 5% dead tuples
autovacuum_analyze_scale_factor = 0.02
```

**Apply changes:**
```bash
sudo systemctl restart postgresql
```

### Index Optimization

#### Required Indexes

```sql
-- ============================================================================
-- Users Table
-- ============================================================================

-- Email lookup (login)
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- Last login filtering
CREATE INDEX CONCURRENTLY idx_users_last_login ON users(last_login DESC);

-- Verified users
CREATE INDEX CONCURRENTLY idx_users_verified ON users(verified) WHERE verified = true;

-- ============================================================================
-- Citation Jobs Table
-- ============================================================================

-- Job status polling (most critical)
CREATE INDEX CONCURRENTLY idx_citation_jobs_status ON citation_jobs(status);

-- User job history
CREATE INDEX CONCURRENTLY idx_citation_jobs_user_created
  ON citation_jobs(user_id, created_at DESC);

-- Recent jobs dashboard
CREATE INDEX CONCURRENTLY idx_citation_jobs_created
  ON citation_jobs(created_at DESC);

-- Incomplete jobs monitoring
CREATE INDEX CONCURRENTLY idx_citation_jobs_incomplete
  ON citation_jobs(status, created_at)
  WHERE status IN ('PENDING', 'PROCESSING');

-- Paper ID lookup
CREATE INDEX CONCURRENTLY idx_citation_jobs_paper_id ON citation_jobs(paper_id);

-- ============================================================================
-- Citations Tables
-- ============================================================================

-- Raw citations by job
CREATE INDEX CONCURRENTLY idx_citations_raw_job_id ON citations_raw(job_id);

-- Raw citations by agent (for consensus)
CREATE INDEX CONCURRENTLY idx_citations_raw_job_agent
  ON citations_raw(job_id, agent_id);

-- Final citations by job
CREATE INDEX CONCURRENTLY idx_citations_final_job_id ON citations_final(job_id);

-- Verified citations only
CREATE INDEX CONCURRENTLY idx_citations_final_verified
  ON citations_final(verified) WHERE verified = true;

-- ============================================================================
-- Agent Swarm State
-- ============================================================================

-- Agent lookup by ID
CREATE UNIQUE INDEX idx_agent_swarm_state_agent_id ON agent_swarm_state(agent_id);

-- Agent type filtering
CREATE INDEX CONCURRENTLY idx_agent_swarm_state_type ON agent_swarm_state(agent_type);

-- High-reputation agents
CREATE INDEX CONCURRENTLY idx_agent_swarm_state_reputation
  ON agent_swarm_state(reputation_score DESC);

-- ============================================================================
-- Agent Memory
-- ============================================================================

-- Memory by agent
CREATE INDEX CONCURRENTLY idx_agent_memory_state_id ON agent_memory(agent_state_id);

-- Active memories (not expired)
CREATE INDEX CONCURRENTLY idx_agent_memory_active
  ON agent_memory(agent_state_id, expires_at)
  WHERE expires_at > NOW();

-- Relevance-sorted memories
CREATE INDEX CONCURRENTLY idx_agent_memory_relevance
  ON agent_memory(agent_state_id, relevance_score DESC);

-- ============================================================================
-- Audit Logs
-- ============================================================================

-- User audit trail
CREATE INDEX CONCURRENTLY idx_audit_logs_user_created
  ON audit_logs(user_id, created_at DESC);

-- Event type filtering
CREATE INDEX CONCURRENTLY idx_audit_logs_event_type ON audit_logs(event_type);

-- Recent security events
CREATE INDEX CONCURRENTLY idx_audit_logs_security
  ON audit_logs(created_at DESC)
  WHERE event_type IN ('LOGIN_FAILED', 'PASSWORD_RESET', 'UNAUTHORIZED_ACCESS');

-- ============================================================================
-- Verification & Reset Tokens
-- ============================================================================

-- Token lookup (most critical for auth flow)
CREATE UNIQUE INDEX idx_verification_tokens_token ON verification_tokens(token);
CREATE UNIQUE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);

-- Token expiration cleanup
CREATE INDEX CONCURRENTLY idx_verification_tokens_expires
  ON verification_tokens(expires_at);
CREATE INDEX CONCURRENTLY idx_password_reset_tokens_expires
  ON password_reset_tokens(expires_at);
```

#### Monitoring Index Usage

**Find unused indexes:**
```sql
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexrelname !~ '^pg_toast'
ORDER BY pg_relation_size(indexrelid) DESC;
```

**Find missing indexes (sequential scans):**
```sql
SELECT
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    seq_tup_read / seq_scan AS avg_seq_tup,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS table_size
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_tup_read DESC
LIMIT 20;
```

### Query Optimization

#### Slow Query Analysis

**Enable pg_stat_statements:**
```sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Find slowest queries
SELECT
    round(total_exec_time::numeric, 2) AS total_time_ms,
    calls,
    round(mean_exec_time::numeric, 2) AS mean_time_ms,
    round((100 * total_exec_time / sum(total_exec_time::numeric) OVER ())::numeric, 2) AS percentage,
    substring(query, 1, 100) AS query_preview
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 20;
```

#### Common Query Patterns & Optimizations

**1. Job Status Polling (Most Frequent)**

❌ **Slow query:**
```sql
SELECT * FROM citation_jobs WHERE id = $1;
```

✅ **Optimized with partial index:**
```sql
-- Only fetch required fields
SELECT id, status, quality_score, error_message, completed_at
FROM citation_jobs
WHERE id = $1;

-- Index: idx_citation_jobs_status
```

**2. User Job History**

❌ **Slow query (full table scan):**
```sql
SELECT * FROM citation_jobs
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 20;
```

✅ **Optimized with composite index:**
```sql
SELECT
    id,
    paper_id,
    status,
    quality_score,
    created_at,
    completed_at
FROM citation_jobs
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 20;

-- Index: idx_citation_jobs_user_created (user_id, created_at DESC)
```

**3. Citation Consensus Aggregation**

❌ **Slow query (no index on job_id + agent_id):**
```sql
SELECT
    agent_id,
    COUNT(*) as citation_count,
    AVG(confidence) as avg_confidence
FROM citations_raw
WHERE job_id = $1
GROUP BY agent_id;
```

✅ **Optimized with covering index:**
```sql
-- Same query, but with optimized index
-- Index: idx_citations_raw_job_agent (job_id, agent_id) INCLUDE (confidence)
```

**4. Active Jobs Monitoring**

❌ **Slow query:**
```sql
SELECT * FROM citation_jobs
WHERE status IN ('PENDING', 'PROCESSING')
ORDER BY created_at;
```

✅ **Optimized with partial index:**
```sql
SELECT id, user_id, paper_id, status, created_at
FROM citation_jobs
WHERE status IN ('PENDING', 'PROCESSING')
ORDER BY created_at DESC
LIMIT 100;

-- Partial index: idx_citation_jobs_incomplete
```

### Connection Pooling

#### Application-Level Pooling (pg pool)

**File:** `src/config/database.ts`

```typescript
import { Pool } from 'pg';

export const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,

  // Connection pool configuration
  max: 20,                    // Maximum pool size (20 connections)
  min: 5,                     // Minimum idle connections
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 10000, // Wait 10s for available connection

  // Performance optimization
  statement_timeout: 30000,   // Kill queries > 30s
  query_timeout: 30000,       // Application-level query timeout

  // SSL configuration (production)
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: true,
    ca: process.env.DATABASE_SSL_CA,
  } : false,
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await pool.end();
});
```

#### PgBouncer (External Connection Pooler)

**Installation:**
```bash
sudo apt-get install pgbouncer
```

**File:** `/etc/pgbouncer/pgbouncer.ini`

```ini
[databases]
marcus = host=localhost port=5432 dbname=marcus pool_size=25

[pgbouncer]
listen_addr = 127.0.0.1
listen_port = 6432
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt

# Pool configuration
pool_mode = transaction          # Transaction-level pooling
max_client_conn = 200            # Max client connections
default_pool_size = 25           # Default pool per database
reserve_pool_size = 5            # Emergency connections
reserve_pool_timeout = 3

# Timeouts
server_lifetime = 3600           # Close server connections after 1h
server_idle_timeout = 600        # Close idle servers after 10min

# Logging
log_connections = 1
log_disconnections = 1
log_pooler_errors = 1
```

**Connect through PgBouncer:**
```typescript
const pool = new Pool({
  host: 'localhost',
  port: 6432,  // PgBouncer port
  database: 'marcus',
  // ... other config
});
```

### Vacuum & Maintenance

**Automated VACUUM strategy:**

```sql
-- Check table bloat
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    n_dead_tup,
    n_live_tup,
    round(100.0 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_tuple_percent
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;

-- Manual VACUUM for high-churn tables
VACUUM (VERBOSE, ANALYZE) citation_jobs;
VACUUM (VERBOSE, ANALYZE) citations_raw;
VACUUM (VERBOSE, ANALYZE) audit_logs;

-- Aggressive VACUUM to reclaim disk space
VACUUM FULL citation_jobs;  -- Requires table lock!
```

**Cron job for maintenance:**
```bash
# /etc/cron.d/postgres-maintenance
0 2 * * 0 postgres /usr/bin/vacuumdb -z -d marcus
0 3 * * 0 postgres /usr/bin/reindexdb -d marcus
```

---

## Redis Caching Strategy

### Redis Configuration

**File:** `/etc/redis/redis.conf`

```ini
# ============================================================================
# Memory Management (8GB Server)
# ============================================================================

# Max memory: 4GB (50% of RAM)
maxmemory 4gb

# Eviction policy: LRU (Least Recently Used)
maxmemory-policy allkeys-lru

# ============================================================================
# Persistence (for session data)
# ============================================================================

# AOF persistence for durability
appendonly yes
appendfsync everysec
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb

# RDB snapshots (backup)
save 900 1       # Save after 900s if 1 key changed
save 300 10      # Save after 300s if 10 keys changed
save 60 10000    # Save after 60s if 10000 keys changed

# ============================================================================
# Performance Tuning
# ============================================================================

# TCP backlog
tcp-backlog 511

# Max clients
maxclients 10000

# Timeouts
timeout 300  # Close idle clients after 5min

# ============================================================================
# Slow Log
# ============================================================================

slowlog-log-slower-than 10000  # Log commands > 10ms
slowlog-max-len 128

# ============================================================================
# Security
# ============================================================================

requirepass ${REDIS_PASSWORD}
bind 127.0.0.1  # Only local connections
protected-mode yes
```

### Caching Patterns

#### 1. Cache-Aside (Lazy Loading)

**Pattern:** Application checks cache first, loads from DB on miss, populates cache.

```typescript
import { pool } from './database';
import { redis } from './redis';

async function getCitationJob(jobId: string) {
  const cacheKey = `job:${jobId}`;

  // 1. Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // 2. Cache miss - load from database
  const result = await pool.query(
    'SELECT * FROM citation_jobs WHERE id = $1',
    [jobId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const job = result.rows[0];

  // 3. Populate cache (TTL: 5 minutes)
  await redis.setex(cacheKey, 300, JSON.stringify(job));

  return job;
}
```

#### 2. Write-Through Cache

**Pattern:** Write to cache and database simultaneously.

```typescript
async function updateCitationJob(jobId: string, updates: Partial<CitationJob>) {
  const cacheKey = `job:${jobId}`;

  // 1. Update database
  const result = await pool.query(
    `UPDATE citation_jobs
     SET status = $1, quality_score = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [updates.status, updates.qualityScore, jobId]
  );

  const updatedJob = result.rows[0];

  // 2. Update cache
  await redis.setex(cacheKey, 300, JSON.stringify(updatedJob));

  return updatedJob;
}
```

#### 3. Read-Through Cache (with TTL)

**Pattern:** Cache fetches data from DB automatically on miss.

```typescript
async function getCachedUserProfile(userId: string) {
  const cacheKey = `user:${userId}:profile`;

  // Atomic read-through with Lua script
  const lua = `
    local cached = redis.call('GET', KEYS[1])
    if cached then
      return cached
    end

    -- Cache miss - caller must handle DB fetch
    return nil
  `;

  const cached = await redis.eval(lua, 1, cacheKey);
  if (cached) {
    return JSON.parse(cached as string);
  }

  // Fetch from database
  const result = await pool.query(
    'SELECT id, email, settings FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length > 0) {
    const profile = result.rows[0];
    await redis.setex(cacheKey, 600, JSON.stringify(profile));
    return profile;
  }

  return null;
}
```

#### 4. Cache Invalidation

**Strategies:**

**A. TTL-Based Invalidation (simplest):**
```typescript
// Short TTL for frequently changing data
await redis.setex('job:status:123', 60, 'PROCESSING');

// Long TTL for rarely changing data
await redis.setex('user:profile:456', 3600, JSON.stringify(profile));
```

**B. Event-Based Invalidation:**
```typescript
// Invalidate on update
async function completeJob(jobId: string) {
  await pool.query(
    'UPDATE citation_jobs SET status = $1, completed_at = NOW() WHERE id = $2',
    ['COMPLETED', jobId]
  );

  // Invalidate cache
  await redis.del(`job:${jobId}`);
  await redis.del(`user:${userId}:jobs`);

  // Publish event for other services
  await redis.publish('jobs:completed', JSON.stringify({ jobId }));
}
```

**C. Cache Tags (for bulk invalidation):**
```typescript
// Tag pattern: tag:user:123 -> [job:456, job:789]
await redis.sadd(`tag:user:${userId}`, `job:${jobId}`);

// Invalidate all jobs for user
const jobs = await redis.smembers(`tag:user:${userId}`);
if (jobs.length > 0) {
  await redis.del(...jobs);
  await redis.del(`tag:user:${userId}`);
}
```

### Redis Cluster Configuration (High Availability)

**For production deployments with >1M keys:**

```yaml
# redis-cluster.yml (Kubernetes)
apiVersion: v1
kind: ConfigMap
metadata:
  name: redis-cluster-config
data:
  redis.conf: |
    cluster-enabled yes
    cluster-config-file nodes.conf
    cluster-node-timeout 5000
    appendonly yes

    maxmemory 2gb
    maxmemory-policy allkeys-lru

    requirepass ${REDIS_PASSWORD}
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: redis-cluster
spec:
  replicas: 6  # 3 masters + 3 replicas
  serviceName: redis-cluster
  template:
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        command: ["redis-server", "/etc/redis/redis.conf"]
        volumeMounts:
        - name: config
          mountPath: /etc/redis
        - name: data
          mountPath: /data
      volumes:
      - name: config
        configMap:
          name: redis-cluster-config
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
```

### Monitoring Redis Performance

**Key metrics:**

```bash
# Redis INFO
redis-cli INFO stats

# Important metrics:
# - instantaneous_ops_per_sec: Operations/second
# - used_memory_human: Memory usage
# - evicted_keys: Keys evicted due to maxmemory
# - keyspace_hits / keyspace_misses: Hit rate
# - connected_clients: Active connections
```

**Target cache hit rate:**
```bash
# Calculate hit rate
HIT_RATE=$(redis-cli INFO stats | grep -E 'keyspace_hits|keyspace_misses' | awk -F: '{sum+=$2} END {print (sum > 0 ? (keyspace_hits / sum) * 100 : 0)}')

echo "Cache hit rate: ${HIT_RATE}%"  # Target: >80%
```

---

## Application Tuning

### Node.js Performance

#### Event Loop Optimization

```typescript
// src/server.ts

import express from 'express';
import { performance } from 'perf_hooks';

const app = express();

// ============================================================================
// Event Loop Monitoring
// ============================================================================

const EVENT_LOOP_LAG_THRESHOLD = 100; // ms

setInterval(() => {
  const start = performance.now();
  setImmediate(() => {
    const lag = performance.now() - start;
    if (lag > EVENT_LOOP_LAG_THRESHOLD) {
      console.warn(`⚠️  Event loop lag: ${lag.toFixed(2)}ms`);
    }
  });
}, 5000);

// ============================================================================
// Async Work Offloading
// ============================================================================

import { Worker } from 'worker_threads';

// CPU-intensive work in worker thread
function analyzeTextInWorker(text: string): Promise<Analysis> {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./workers/text-analyzer.js', {
      workerData: { text }
    });

    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

// ============================================================================
// Request Batching
// ============================================================================

import Dataloader from 'dataloader';

// Batch database queries
const citationLoader = new Dataloader(async (jobIds: string[]) => {
  const result = await pool.query(
    'SELECT * FROM citation_jobs WHERE id = ANY($1)',
    [jobIds]
  );

  const jobMap = new Map(result.rows.map(row => [row.id, row]));
  return jobIds.map(id => jobMap.get(id) || null);
}, {
  maxBatchSize: 100,
  batchScheduleFn: (callback) => setTimeout(callback, 10), // 10ms batch window
});

// Usage
const job = await citationLoader.load(jobId);
```

#### Memory Management

```typescript
// ============================================================================
// Heap Size Configuration
// ============================================================================

// package.json scripts
{
  "scripts": {
    "start": "node --max-old-space-size=2048 dist/server.js",
    "dev": "NODE_ENV=development nodemon --exec 'node --max-old-space-size=1024' src/server.ts"
  }
}

// ============================================================================
// Memory Leak Detection
// ============================================================================

import v8 from 'v8';
import { writeFileSync } from 'fs';

// Heap snapshot on demand
app.get('/debug/heap-snapshot', (req, res) => {
  const snapshot = v8.writeHeapSnapshot();
  res.json({ snapshot });
});

// Periodic memory monitoring
setInterval(() => {
  const usage = process.memoryUsage();
  const heapUsedPct = (usage.heapUsed / usage.heapTotal) * 100;

  if (heapUsedPct > 90) {
    console.error(`🚨 High memory usage: ${heapUsedPct.toFixed(2)}%`);

    // Force garbage collection (requires --expose-gc flag)
    if (global.gc) {
      global.gc();
    }
  }
}, 60000);

// ============================================================================
// Streaming for Large Responses
// ============================================================================

import { pipeline } from 'stream/promises';

app.get('/api/citations/export/:jobId', async (req, res) => {
  const { jobId } = req.params;

  // Stream query results instead of loading all in memory
  const queryStream = new QueryStream(
    'SELECT * FROM citations_final WHERE job_id = $1',
    [jobId]
  );

  const client = await pool.connect();
  const stream = client.query(queryStream);

  res.setHeader('Content-Type', 'application/json');
  res.write('[');

  let first = true;
  for await (const row of stream) {
    if (!first) res.write(',');
    res.write(JSON.stringify(row));
    first = false;
  }

  res.write(']');
  res.end();

  client.release();
});
```

### HTTP/2 & Compression

```typescript
import http2 from 'http2';
import compression from 'compression';
import { readFileSync } from 'fs';

// ============================================================================
// HTTP/2 Server (Production)
// ============================================================================

const server = http2.createSecureServer({
  key: readFileSync('/etc/ssl/private/server.key'),
  cert: readFileSync('/etc/ssl/certs/server.crt'),
}, app);

// ============================================================================
// Compression Middleware
// ============================================================================

app.use(compression({
  level: 6,              // Compression level (0-9, 6 is balanced)
  threshold: 1024,       // Only compress responses > 1KB
  filter: (req, res) => {
    // Don't compress already compressed content
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
}));

// ============================================================================
// Brotli Compression (Better than gzip)
// ============================================================================

import expressStaticGzip from 'express-static-gzip';

app.use('/', expressStaticGzip('public', {
  enableBrotli: true,
  orderPreference: ['br', 'gz'],
}));
```

### Rate Limiting & Throttling

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

// ============================================================================
// Redis-Backed Rate Limiting
// ============================================================================

const limiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'ratelimit:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // Max 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests, please try again later.',
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

// Apply to all API routes
app.use('/api/', limiter);

// ============================================================================
// Per-Endpoint Rate Limits
// ============================================================================

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,  // Only 5 login attempts per 15 minutes
  skipSuccessfulRequests: true,
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  // Login logic
});

// ============================================================================
// Distributed Rate Limiting (Token Bucket)
// ============================================================================

import { RateLimiterRedis } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'ratelimit',
  points: 10,        // Number of points
  duration: 1,       // Per second
  blockDuration: 60, // Block for 60s if exceeded
});

app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (err) {
    res.status(429).send('Too Many Requests');
  }
});
```

---

## Load Balancer Configuration

### Nginx Load Balancer

**File:** `/etc/nginx/sites-available/marcus-lb.conf`

```nginx
# ============================================================================
# Upstream Server Pool
# ============================================================================

upstream marcus_backend {
    # Load balancing method
    least_conn;  # Route to server with fewest active connections

    # Backend servers
    server 10.0.1.10:3000 max_fails=3 fail_timeout=30s;
    server 10.0.1.11:3000 max_fails=3 fail_timeout=30s;
    server 10.0.1.12:3000 max_fails=3 fail_timeout=30s;

    # Health check
    keepalive 32;  # Keep 32 connections open to backends
}

# ============================================================================
# HTTP Server (Redirect to HTTPS)
# ============================================================================

server {
    listen 80;
    listen [::]:80;
    server_name marcus-platform.com;

    # Redirect all HTTP to HTTPS
    return 301 https://$host$request_uri;
}

# ============================================================================
# HTTPS Server
# ============================================================================

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name marcus-platform.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/marcus-platform.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/marcus-platform.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1024;

    # Client body size limit
    client_max_body_size 10M;

    # Timeouts
    proxy_connect_timeout 10s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    # ========================================================================
    # API Endpoints
    # ========================================================================

    location /api/ {
        proxy_pass http://marcus_backend;

        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Connection reuse
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;

        # Rate limiting
        limit_req zone=api_limit burst=20 nodelay;
    }

    # ========================================================================
    # Static Assets (Cached)
    # ========================================================================

    location /static/ {
        alias /var/www/marcus/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # ========================================================================
    # Health Check Endpoint
    # ========================================================================

    location /health {
        proxy_pass http://marcus_backend;
        access_log off;
    }
}

# ============================================================================
# Rate Limiting Zones
# ============================================================================

# Define in http block
http {
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_conn_zone $binary_remote_addr zone=conn_limit:10m;

    # Connection limits
    limit_conn conn_limit 10;  # Max 10 concurrent connections per IP
}
```

### AWS Application Load Balancer (ALB)

**Terraform configuration:**

```hcl
# ALB with health checks and connection draining
resource "aws_lb" "marcus" {
  name               = "marcus-platform-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public.*.id

  enable_deletion_protection = true
  enable_http2              = true
  idle_timeout              = 60

  tags = {
    Name = "MARCUS Platform ALB"
  }
}

# Target group with health checks
resource "aws_lb_target_group" "marcus_api" {
  name     = "marcus-api-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
  }

  deregistration_delay = 30  # Connection draining

  stickiness {
    type            = "lb_cookie"
    cookie_duration = 86400  # 24 hours
    enabled         = true
  }
}

# HTTPS listener
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.marcus.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = aws_acm_certificate.marcus.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.marcus_api.arn
  }
}

# HTTP redirect to HTTPS
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.marcus.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}
```

---

## Kubernetes Resource Optimization

### Resource Requests & Limits

```yaml
# deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: marcus-api
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: api
        image: marcus-platform:v3.0

        # ====================================================================
        # Resource Configuration
        # ====================================================================
        resources:
          requests:
            memory: "1Gi"     # Guaranteed memory
            cpu: "500m"       # Guaranteed CPU (0.5 cores)
          limits:
            memory: "2Gi"     # Max memory before OOMKill
            cpu: "2000m"      # Max CPU (2 cores)

        # ====================================================================
        # Health Checks
        # ====================================================================
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3

        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          successThreshold: 1
          failureThreshold: 3

        # ====================================================================
        # Graceful Shutdown
        # ====================================================================
        lifecycle:
          preStop:
            exec:
              command: ["/bin/sh", "-c", "sleep 15"]  # Wait for connections to drain
```

### Horizontal Pod Autoscaler (HPA)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: marcus-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: marcus-api

  minReplicas: 3
  maxReplicas: 10

  metrics:
  # CPU-based scaling
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70  # Scale when avg CPU > 70%

  # Memory-based scaling
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80  # Scale when avg memory > 80%

  # Custom metric: Request rate
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "1000"  # Scale when RPS > 1000 per pod

  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300  # Wait 5 min before scaling down
      policies:
      - type: Percent
        value: 50      # Scale down max 50% of pods at once
        periodSeconds: 60

    scaleUp:
      stabilizationWindowSeconds: 0  # Scale up immediately
      policies:
      - type: Percent
        value: 100     # Double pods if needed
        periodSeconds: 15
      - type: Pods
        value: 4       # Add max 4 pods at once
        periodSeconds: 15
      selectPolicy: Max
```

### Pod Disruption Budget

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: marcus-api-pdb
spec:
  minAvailable: 2  # Always keep at least 2 pods running
  selector:
    matchLabels:
      app: marcus-api
```

---

## Network Performance

### DNS Caching

```bash
# Install dnsmasq for local DNS caching
sudo apt-get install dnsmasq

# /etc/dnsmasq.conf
cache-size=1000
no-negcache
```

### TCP Tuning

```bash
# /etc/sysctl.conf - Linux kernel parameters

# Increase TCP buffer sizes
net.core.rmem_max = 134217728
net.core.wmem_max = 134217728
net.ipv4.tcp_rmem = 4096 87380 67108864
net.ipv4.tcp_wmem = 4096 65536 67108864

# Enable TCP window scaling
net.ipv4.tcp_window_scaling = 1

# Increase max connections
net.core.somaxconn = 4096
net.ipv4.tcp_max_syn_backlog = 8192

# Reduce TIME_WAIT sockets
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_tw_reuse = 1

# Enable TCP fast open
net.ipv4.tcp_fastopen = 3

# Apply changes
sudo sysctl -p
```

---

## Monitoring & Profiling

### Application Profiling

```typescript
import { performance, PerformanceObserver } from 'perf_hooks';

// ============================================================================
// Function-level profiling
// ============================================================================

export function profileAsync(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const start = performance.now();

    try {
      const result = await originalMethod.apply(this, args);
      const duration = performance.now() - start;

      console.log(`⏱️  ${propertyKey} took ${duration.toFixed(2)}ms`);

      // Record to Prometheus
      httpRequestDuration.labels(propertyKey).observe(duration / 1000);

      return result;
    } catch (error) {
      const duration = performance.now() - start;
      console.error(`❌ ${propertyKey} failed after ${duration.toFixed(2)}ms`);
      throw error;
    }
  };

  return descriptor;
}

// Usage
class CitationService {
  @profileAsync
  async analyzeCitation(jobId: string) {
    // Implementation
  }
}

// ============================================================================
// CPU Profiling
// ============================================================================

import { Session } from 'inspector';

let profilingSession: Session | null = null;

export function startCPUProfile() {
  profilingSession = new Session();
  profilingSession.connect();
  profilingSession.post('Profiler.enable');
  profilingSession.post('Profiler.start');
  console.log('✅ CPU profiling started');
}

export function stopCPUProfile(outputFile: string) {
  if (!profilingSession) return;

  profilingSession.post('Profiler.stop', (err, { profile }) => {
    if (err) {
      console.error('❌ Failed to stop profiling:', err);
      return;
    }

    writeFileSync(outputFile, JSON.stringify(profile));
    console.log(`✅ CPU profile saved to ${outputFile}`);

    profilingSession!.disconnect();
    profilingSession = null;
  });
}

// Expose via admin endpoint
app.post('/debug/profiling/start', (req, res) => {
  startCPUProfile();
  res.json({ status: 'profiling started' });
});

app.post('/debug/profiling/stop', (req, res) => {
  const filename = `/tmp/cpu-profile-${Date.now()}.cpuprofile`;
  stopCPUProfile(filename);
  res.json({ status: 'profiling stopped', file: filename });
});
```

### Performance Dashboard (Grafana)

**Key panels:**

1. **API Performance:**
   - Request rate (requests/sec)
   - Response time (p50, p95, p99)
   - Error rate (%)
   - Active connections

2. **Database Performance:**
   - Query latency (p95)
   - Connection pool usage
   - Cache hit rate
   - Transaction rate

3. **System Resources:**
   - CPU usage (%)
   - Memory usage (GB)
   - Disk I/O (MB/s)
   - Network throughput (MB/s)

4. **Business Metrics:**
   - Citations analyzed/hour
   - Average quality score
   - Agent consensus rate
   - User session duration

---

## Summary

This guide covers comprehensive performance tuning across all layers of the MARCUS platform:

- **Database:** PostgreSQL configuration, indexing, connection pooling, query optimization
- **Cache:** Redis configuration, caching patterns, invalidation strategies
- **Application:** Node.js optimization, memory management, rate limiting
- **Load Balancer:** Nginx/ALB configuration, health checks, SSL termination
- **Kubernetes:** Resource limits, autoscaling, pod disruption budgets
- **Network:** TCP tuning, DNS caching, compression
- **Monitoring:** Profiling, metrics collection, performance dashboards

**Recommended implementation order:**
1. Database indexing & query optimization (biggest impact)
2. Redis caching patterns (easy wins)
3. Connection pooling (PgBouncer)
4. Application-level optimizations
5. Load balancer configuration
6. Kubernetes autoscaling
7. Advanced profiling & tuning

For deployment procedures, see:
- **Deployment Guide:** `docs/MARCUS_DEPLOYMENT_GUIDE.md`
- **Architecture Diagrams:** `docs/MARCUS_ARCHITECTURE_DIAGRAMS.md`
- **Production Runbook:** `docs/MARCUS_PRODUCTION_RUNBOOK.md`
