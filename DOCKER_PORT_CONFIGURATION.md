# Docker Port Configuration - VM vs Container Networks

**Date:** November 22, 2025
**Issue:** Port conflicts between native VM services and Docker containers
**Severity:** HIGH - Prevents multi-container startup
**Status:** ✅ RESOLVED

---

## Executive Summary

The VM has native PostgreSQL and Redis services running on standard ports (5432, 6379) for the monitoring system. Docker Compose attempted to bind containers to the same ports, causing conflicts. Solution: Use alternate **host ports** (5433, 6380) that map to internal **container ports** (5432, 6379), and configure workers to use **Docker network service names** instead of localhost.

**Critical Learning:** Docker has THREE port contexts - host VM, container internal, and Docker network - all must be understood separately.

---

## Problem Statement

### Initial Error

```
Error response from daemon: failed to set up container networking:
driver failed programming external connectivity on endpoint marcus-redis:
failed to bind host port 0.0.0.0:6379/tcp: address already in use
```

**Translation:** Docker tried to expose Redis on VM port 6379, but that port was already taken by the native Redis service.

### Root Cause

The VM runs native services configured during Phase 3 (monitoring setup):

```bash
$ sudo ss -tlnp | grep -E ':(6379|5432)\s'
LISTEN 0  244   127.0.0.1:5432   0.0.0.0:*   users:(("postgres",pid=56164,fd=5))
LISTEN 0  511   127.0.0.1:6379   0.0.0.0:*   users:(("redis-server",pid=54343,fd=6))
```

**Why they exist:**
- PostgreSQL (port 5432): Marcus database for agent state persistence
- Redis (port 6379): Metrics collection, cache for monitoring stack

**Why we can't stop them:**
- Monitoring system (Prometheus/Grafana) depends on them
- Production metrics collection runs 24/7
- Stopping them breaks existing infrastructure

---

## Three Port Contexts Explained

### Context 1: Host VM Ports (Physical Machine)

**What it is:** Ports on the actual VM operating system (Linux).

**Who binds here:**
- Native services (systemd-managed PostgreSQL, Redis)
- Docker daemon itself (listens on Docker socket)
- Monitoring stack (Prometheus 9090, Grafana 3000)

**Port mapping format:** `<host_port>:<container_port>`

**Example:**
```yaml
ports:
  - "5433:5432"  # VM port 5433 → Container port 5432
```

**Access from VM:**
```bash
# Access Docker PostgreSQL from VM
psql -h localhost -p 5433 -U marcus -d citation_integrity

# Access native PostgreSQL from VM
psql -h localhost -p 5432 -U postgres -d postgres
```

### Context 2: Container Internal Ports

**What it is:** Ports inside the container's network namespace.

**Who binds here:**
- Services running INSIDE containers (PostgreSQL, Redis processes)
- These use standard ports (5432, 6379) regardless of host mapping

**Example:**
```yaml
# docker-compose.yml
postgres:
  image: postgres:15-alpine
  ports:
    - "5433:5432"  # Host 5433 maps to Container 5432
```

**Inside the container:**
```bash
$ docker exec marcus-postgres netstat -tlnp
LISTEN  0.0.0.0:5432  # PostgreSQL listening on standard port INSIDE container
```

**Key insight:** Container always uses 5432 internally, host mapping is transparent to it.

### Context 3: Docker Network (Bridge)

**What it is:** Internal Docker network where containers communicate using **service names as hostnames**.

**Network created:**
```yaml
networks:
  marcus-network:
    driver: bridge
```

**Container communication:**
- Containers reference each other by **service name** (postgres, redis)
- Docker DNS resolves service names to container IPs
- Uses **internal container ports** (5432, 6379), NOT host ports

**Example worker configuration:**
```yaml
citation-agent:
  environment:
    REDIS_HOST: redis        # Service name (NOT localhost!)
    REDIS_PORT: 6379         # Container internal port (NOT 6380!)
    DATABASE_HOST: postgres  # Service name (NOT localhost!)
    DATABASE_PORT: 5432      # Container internal port (NOT 5433!)
  networks:
    - marcus-network
```

**Why this works:**
- Worker container is on `marcus-network`
- Redis container is on `marcus-network`
- Docker DNS resolves "redis" → 172.18.0.3 (example IP)
- Worker connects to 172.18.0.3:6379 (internal container port)
- **Host port mapping (6380) is irrelevant for inter-container communication**

---

## Common Mistakes (Anti-Patterns)

### ❌ Mistake 1: Using localhost Inside Containers

```yaml
# WRONG - Worker tries to connect to itself!
citation-agent:
  environment:
    REDIS_HOST: localhost  # ❌ Resolves to worker container, not Redis
    REDIS_PORT: 6380       # ❌ Wrong port (host port, not container port)
```

**What happens:**
- `localhost` inside container = the container itself
- Worker tries to connect to itself on port 6380 (nothing listening)
- Connection refused error

**Fix:**
```yaml
# CORRECT - Use Docker network service names
citation-agent:
  environment:
    REDIS_HOST: redis  # ✅ Docker DNS resolves to Redis container
    REDIS_PORT: 6379   # ✅ Container internal port
```

### ❌ Mistake 2: Using Host Ports in Container Environment

```yaml
# WRONG - Using host port mapping inside container
citation-agent:
  environment:
    REDIS_HOST: redis
    REDIS_PORT: 6380  # ❌ This is the HOST port, not container port!
```

**What happens:**
- Worker connects to redis:6380
- Redis container only listens on 6379 internally
- Connection refused (nothing on 6380 inside Redis container)

**Fix:**
```yaml
# CORRECT - Use container internal port
citation-agent:
  environment:
    REDIS_HOST: redis
    REDIS_PORT: 6379  # ✅ Redis listens on 6379 inside container
```

### ❌ Mistake 3: Not Understanding Port Mapping Direction

```yaml
# Port mapping format: "HOST:CONTAINER"
ports:
  - "6380:6379"
    #  ^     ^
    #  |     └─ Container internal port (what service binds to)
    #  └─ Host VM port (what VM users access)
```

**Common confusion:**
- "My VM uses 6380, so container should too" ❌
- **Reality:** Container always uses standard port internally (6379), host mapping is external

---

## Solution Architecture

### Port Mapping Strategy

```yaml
# PostgreSQL
postgres:
  ports:
    - "5433:5432"
  # ↑ Host VM port 5433 → Container internal 5432
  # VM access: psql -h localhost -p 5433
  # Container access: psql -h postgres -p 5432

# Redis
redis:
  ports:
    - "6380:6379"
  # ↑ Host VM port 6380 → Container internal 6379
  # VM access: redis-cli -h localhost -p 6380
  # Container access: redis-cli -h redis -p 6379
```

### Network Topology Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ VM Host (Physical Machine)                                      │
│                                                                  │
│  Native Services:                                               │
│  ┌─────────────────┐  ┌─────────────────┐                      │
│  │ PostgreSQL      │  │ Redis           │                      │
│  │ Port: 5432      │  │ Port: 6379      │                      │
│  │ (Monitoring DB) │  │ (Metrics Cache) │                      │
│  └─────────────────┘  └─────────────────┘                      │
│                                                                  │
│  Docker Host:                                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Docker Network: marcus-network (172.18.0.0/16)            │ │
│  │                                                            │ │
│  │  ┌────────────────────┐  ┌────────────────────┐          │ │
│  │  │ Container:         │  │ Container:         │          │ │
│  │  │ marcus-postgres    │  │ marcus-redis       │          │ │
│  │  │ Internal: 5432     │  │ Internal: 6379     │          │ │
│  │  │ Host Map: 5433     │  │ Host Map: 6380     │          │ │
│  │  │ IP: 172.18.0.2     │  │ IP: 172.18.0.3     │          │ │
│  │  └────────────────────┘  └────────────────────┘          │ │
│  │            ▲                      ▲                        │ │
│  │            │                      │                        │ │
│  │            │  Docker DNS:         │                        │ │
│  │            │  "postgres" → 172.18.0.2:5432                │ │
│  │            │  "redis" → 172.18.0.3:6379                   │ │
│  │            │                      │                        │ │
│  │  ┌─────────┴──────────────────────┴─────────────────┐    │ │
│  │  │ Container: citation-agent-1                       │    │ │
│  │  │ Environment:                                      │    │ │
│  │  │   REDIS_HOST=redis (not localhost!)              │    │ │
│  │  │   REDIS_PORT=6379 (container port, not 6380!)    │    │ │
│  │  │   DATABASE_HOST=postgres                         │    │ │
│  │  │   DATABASE_PORT=5432                             │    │ │
│  │  │ IP: 172.18.0.4                                   │    │ │
│  │  └──────────────────────────────────────────────────┘    │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  External Access from VM:                                       │
│  - Docker PostgreSQL: localhost:5433                           │
│  - Docker Redis: localhost:6380                                │
│  - Native PostgreSQL: localhost:5432                           │
│  - Native Redis: localhost:6379                                │
└─────────────────────────────────────────────────────────────────┘
```

### Configuration Files

**docker-compose.yml (CORRECT):**
```yaml
services:
  postgres:
    image: postgres:15-alpine
    container_name: marcus-postgres
    ports:
      - "5433:5432"  # Using 5433 on host to avoid conflict with native PostgreSQL
    networks:
      - marcus-network

  redis:
    image: redis:7-alpine
    container_name: marcus-redis
    ports:
      - "6380:6379"  # Using 6380 on host to avoid conflict with native Redis
    networks:
      - marcus-network

  citation-agent:
    image: marcus-citation-agent:v3.0.2
    environment:
      # Worker service configuration (Redis queue-based)
      REDIS_HOST: redis          # ✅ Docker network service name
      REDIS_PORT: 6379           # ✅ Container internal port
      DATABASE_HOST: postgres    # ✅ Docker network service name
      DATABASE_PORT: 5432        # ✅ Container internal port
    networks:
      - marcus-network
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

networks:
  marcus-network:
    driver: bridge
```

---

## Verification Steps

### 1. Check VM Port Usage

```bash
# See what's using ports on VM
$ sudo ss -tlnp | grep -E ':(5432|5433|6379|6380)\s'

# Expected output:
LISTEN 127.0.0.1:5432  # Native PostgreSQL
LISTEN 127.0.0.1:6379  # Native Redis
LISTEN 0.0.0.0:5433    # Docker PostgreSQL (mapped)
LISTEN 0.0.0.0:6380    # Docker Redis (mapped)
```

### 2. Check Container Internal Ports

```bash
# PostgreSQL inside container
$ docker exec marcus-postgres netstat -tlnp
LISTEN 0.0.0.0:5432  # ✅ Standard port inside container

# Redis inside container
$ docker exec marcus-redis netstat -tlnp
LISTEN 0.0.0.0:6379  # ✅ Standard port inside container
```

### 3. Test Docker Network DNS

```bash
# From worker container, resolve service names
$ docker exec citation-worker-1 ping -c 1 postgres
PING postgres (172.18.0.2): 56 data bytes
# ✅ DNS resolves "postgres" to container IP

$ docker exec citation-worker-1 ping -c 1 redis
PING redis (172.18.0.3): 56 data bytes
# ✅ DNS resolves "redis" to container IP
```

### 4. Test Connectivity

```bash
# From VM host to Docker PostgreSQL
$ psql -h localhost -p 5433 -U marcus -d citation_integrity
# ✅ Connects via host port mapping

# From worker container to Docker PostgreSQL
$ docker exec citation-worker-1 psql -h postgres -p 5432 -U marcus -d citation_integrity
# ✅ Connects via Docker network service name

# From VM host to native PostgreSQL
$ psql -h localhost -p 5432 -U postgres -d postgres
# ✅ Native service still accessible
```

---

## Troubleshooting Guide

### Error: "Address already in use"

**Symptom:**
```
Error: failed to bind host port 0.0.0.0:5432/tcp: address already in use
```

**Diagnosis:**
```bash
# Find what's using the port
$ sudo lsof -i :5432
COMMAND   PID     USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
postgres  56164  postgres 5u  IPv4  12345      0t0  TCP localhost:5432
```

**Solution:**
- Change `docker-compose.yml` port mapping to unused port
- Use 5433 for PostgreSQL, 6380 for Redis
- Keep native services on 5432, 6379

### Error: "Connection refused" from Worker

**Symptom:**
```
Worker logs: Error connecting to Redis: Connection refused (localhost:6379)
```

**Diagnosis:**
Worker environment has `REDIS_HOST: localhost` (wrong!)

**Solution:**
```yaml
# Change from localhost to service name
environment:
  REDIS_HOST: redis  # Not localhost!
  REDIS_PORT: 6379   # Container internal port
```

### Error: "No route to host"

**Symptom:**
```
Worker logs: Error connecting to postgres:5433: No route to host
```

**Diagnosis:**
Worker is using **host port** instead of **container port**

**Solution:**
```yaml
# Use container internal port, not host mapped port
environment:
  DATABASE_HOST: postgres
  DATABASE_PORT: 5432  # Not 5433!
```

---

## Testing Checklist

**Before starting containers:**
- [ ] Check VM ports are free: `sudo ss -tlnp | grep -E ':(5433|6380)'`
- [ ] Verify native services running: `sudo ss -tlnp | grep -E ':(5432|6379)'`

**After starting containers:**
- [ ] Containers started successfully (no port conflicts)
- [ ] Host can access Docker PostgreSQL: `psql -h localhost -p 5433`
- [ ] Host can access Docker Redis: `redis-cli -h localhost -p 6380`
- [ ] Host can still access native PostgreSQL: `psql -h localhost -p 5432`
- [ ] Host can still access native Redis: `redis-cli -h localhost -p 6379`
- [ ] Workers can connect to Docker services: Check worker logs for successful connections

**Container network verification:**
- [ ] Workers use service names (redis, postgres) not localhost
- [ ] Workers use container ports (5432, 6379) not host ports (5433, 6380)
- [ ] DNS resolution works: `docker exec worker ping postgres`

---

## Key Takeaways

### Critical Rules

1. **Inside Docker network:** Use service names + container ports
   ```yaml
   REDIS_HOST: redis      # ✅ Service name
   REDIS_PORT: 6379       # ✅ Container port
   ```

2. **From VM host:** Use localhost + host mapped ports
   ```bash
   redis-cli -h localhost -p 6380  # ✅ Host port
   ```

3. **Port mapping format:** `"<host>:<container>"`
   ```yaml
   ports:
     - "6380:6379"  # Host 6380 → Container 6379
   ```

4. **Never use localhost in container environment variables**
   - Containers on same Docker network use service names
   - `localhost` inside container = the container itself

### Why This Matters

**Production Impact:**
- Wrong configuration = connection failures
- Workers can't reach database/cache
- Silent failures (no error until runtime)

**Development Impact:**
- Works locally (single machine) but fails in containers
- "Works on my machine" syndrome
- Difficult to debug (network namespace confusion)

**Operational Impact:**
- Native services must coexist with Docker
- Monitoring stack depends on native services
- Can't just "stop everything and restart"

---

## Related Documentation

- **Docker Networking:** https://docs.docker.com/network/
- **Docker Compose Networking:** https://docs.docker.com/compose/networking/
- **Port Binding:** https://docs.docker.com/config/containers/container-networking/#published-ports

---

## Future Improvements

**When migrating to Kubernetes:**
- Use `ClusterIP` services (no host port mapping)
- Service discovery via Kubernetes DNS
- Separate namespaces for different environments
- No port conflicts (each pod has own IP)

**When migrating to cloud:**
- Use managed PostgreSQL (no port conflicts)
- Use managed Redis (no port conflicts)
- Network policies for security
- Load balancers handle external access

---

**Attribution:** 404GeneNotFound
**Date:** November 22, 2025
**Session:** MARCUS 3.0 Phase 4 + Worker Service Implementation

**This is critical infrastructure knowledge. Port confusion costs hours of debugging.**
