# Monitoring Stack Architecture

## System Overview

This document maps all services, their ports, dependencies, and data flows in the monitoring infrastructure.

## Mermaid Flowchart

```mermaid
graph TB
    subgraph "User Access Layer"
        USER[User Browser]
    end

    subgraph "Web Services - Port 3000-5000"
        NEXT["Next.js Server<br/>(next-server)<br/>Port 3000<br/>MARCUS Frontend"]
        MARCUS["MARCUS API Server<br/>(marcus-api-server)<br/>Port 3001<br/>Citation Platform"]
        GAME["Game Simulation<br/>(next-server)<br/>Port 4000<br/>Research Tool (SEPARATE)"]
        GRAFANA["Grafana<br/>Port 5000<br/>MARCUS Monitoring"]
    end

    subgraph "Metrics Servers - Port 9000+"
        PROMETHEUS["Prometheus<br/>Port 9090<br/>Time-Series DB"]
        GAME_METRICS["Game Sim Metrics<br/>(game-sim-metrics-server)<br/>Port 9091<br/>Simulation State"]
        NODE_EXP["Node Exporter<br/>Port 9100<br/>System Metrics"]
        PG_EXP["PostgreSQL Exporter<br/>Port 9187<br/>Database Metrics"]
        REDIS_EXP["Redis Exporter<br/>Port 9121<br/>Cache Metrics<br/>(DOWN)"]
    end

    subgraph "Data Stores"
        POSTGRES[(PostgreSQL<br/>Port 5432<br/>marcus_production<br/>marcus_test)]
        REDIS[(Redis<br/>Port 6379<br/>Cache + Queue)]
    end

    subgraph "Python Agents - Port 5001-5009"
        HONEST[Honest Agent<br/>Port 5001]
        SLOPPY[Sloppy Agent<br/>Port 5002]
        BIASED[Biased Agent<br/>Port 5003]
        FABRICATOR[Fabricator Agent<br/>Port 5004]
        STRATEGIC[Strategic Agent<br/>Port 5005]
        CONFUSED[Confused Agent<br/>Port 5006]
        ADVERSARIAL[Adversarial Agent<br/>Port 5007]
        OVERCONFIDENT[Overconfident Agent<br/>Port 5008]
        LAZY[Lazy Agent<br/>Port 5009]
    end

    %% User Connections
    USER -->|HTTP :3000| NEXT
    USER -->|HTTP :3001| MARCUS
    USER -->|HTTP :4000| GAME
    USER -->|HTTP :5000| GRAFANA

    %% Prometheus Scraping (Data Collection)
    PROMETHEUS -->|Scrape /api/metrics<br/>10s interval| MARCUS
    PROMETHEUS -->|Scrape /metrics<br/>15s interval| NODE_EXP
    PROMETHEUS -->|Scrape /metrics<br/>15s interval| PG_EXP
    PROMETHEUS -.->|Scrape /metrics<br/>(DOWN)| REDIS_EXP
    PROMETHEUS -.->|NOT CONFIGURED| GAME_METRICS

    %% Grafana Queries
    GRAFANA -->|PromQL Queries| PROMETHEUS

    %% Database Connections
    MARCUS -->|pg connection pool| POSTGRES
    MARCUS -->|Redis client| REDIS
    PG_EXP -->|Read pg_stat tables| POSTGRES
    REDIS_EXP -.->|Redis INFO| REDIS

    %% Python Agent Connections
    MARCUS -->|IPC/HTTP| HONEST
    MARCUS -->|IPC/HTTP| SLOPPY
    MARCUS -->|IPC/HTTP| BIASED
    MARCUS -->|IPC/HTTP| FABRICATOR
    MARCUS -->|IPC/HTTP| STRATEGIC
    MARCUS -->|IPC/HTTP| CONFUSED
    MARCUS -->|IPC/HTTP| ADVERSARIAL
    MARCUS -->|IPC/HTTP| OVERCONFIDENT
    MARCUS -->|IPC/HTTP| LAZY

    HONEST -->|Store results| POSTGRES
    SLOPPY -->|Store results| POSTGRES
    BIASED -->|Store results| POSTGRES
    FABRICATOR -->|Store results| POSTGRES
    STRATEGIC -->|Store results| POSTGRES
    CONFUSED -->|Store results| POSTGRES
    ADVERSARIAL -->|Store results| POSTGRES
    OVERCONFIDENT -->|Store results| POSTGRES
    LAZY -->|Store results| POSTGRES

    %% Game Simulation (Separate System)
    NEXT -->|API Calls| GAME_METRICS
    GAME_METRICS -->|Exposes /metrics| GAME_METRICS

    style PROMETHEUS fill:#ff9999
    style GRAFANA fill:#99ccff
    style MARCUS fill:#99ff99
    style POSTGRES fill:#ffcc99
    style REDIS fill:#ffcc99
    style REDIS_EXP fill:#999999
    style GAME_METRICS fill:#ffff99
```

## Port Mapping Reference

| Port | Service | Process Name | Purpose |
|------|---------|--------------|---------|
| 3000 | Next.js | `next-server` | MARCUS Platform Frontend |
| 3001 | MARCUS API | `marcus-api-server` | Citation Integrity Platform API |
| 3002 | (Reserved) | - | MARCUS Test Environment |
| 4000 | Game Simulation | `next-server` | Research Tool (SEPARATE SYSTEM) |
| 5000 | Grafana | `grafana-server` | MARCUS Monitoring Dashboards |
| 5001-5009 | Python Agents | `citation_agent_*` | MARCUS Behavioral Agents |
| 5432 | PostgreSQL | `postgres` | Database (marcus_production, marcus_test) |
| 6379 | Redis | `redis-server` | Cache & Queue |
| 9090 | Prometheus | `prometheus` | Time-Series Metrics DB |
| 9091 | Game Sim Metrics | `game-sim-metrics-server` | Simulation State Export |
| 9100 | Node Exporter | `prometheus-node-exporter` | System Metrics (CPU, RAM, Disk) |
| 9187 | PostgreSQL Exporter | `postgres_exporter` | Database Metrics |
| 9121 | Redis Exporter | `redis_exporter` | Cache Metrics (DOWN) |

## Data Flow Descriptions

### 1. User → Web Services
- Users access MARCUS frontend (port 3000) for platform UI
- Users access MARCUS API (port 3001) for citation analysis
- Users access Game Simulation (port 4000) for research tool (SEPARATE SYSTEM)
- Users access Grafana (port 5000) for MARCUS monitoring dashboards

### 2. Prometheus Scraping
Prometheus actively scrapes metrics endpoints every 10-15 seconds:
- **MARCUS API** (`localhost:3001/api/metrics`) - Platform metrics (HTTP requests, agent status, circuit breakers, DB pool)
- **Node Exporter** (`localhost:9100/metrics`) - System metrics (CPU, memory, disk, network)
- **PostgreSQL Exporter** (`localhost:9187/metrics`) - Database metrics (connections, locks, replication)
- **Redis Exporter** (`localhost:9121/metrics`) - Cache metrics (CURRENTLY DOWN)

### 3. Grafana Visualization
Grafana queries Prometheus using PromQL to render 5 dashboards:
1. **Platform Overview** - Overall MARCUS health, request rates, error rates
2. **Agent Health** - Status of 9 Python agents, request latencies
3. **Database Metrics** - Connection pool usage, query performance
4. **Circuit Breakers** - Circuit breaker states, failure rates
5. **Redis Metrics** - Cache hit rates, memory usage (NO DATA - exporter down)

### 4. MARCUS API → Python Agents
MARCUS API server orchestrates 9 Python behavioral agents via IPC/HTTP:
- Each agent analyzes citations with different behavioral profiles
- Agents write results to PostgreSQL (citation_analyses table)
- Agent status exposed via MARCUS metrics endpoint

### 5. MARCUS API → Data Stores
- **PostgreSQL** - Persistent storage (users, citation_analyses, agent_behaviors, auth tables)
- **Redis** - Session cache, rate limiting, agent state cache

### 6. Game Simulation (Separate System)
- Next.js UI (port 3000) communicates with metrics server (port 9091)
- Metrics server exposes simulation state
- **NOT currently integrated with Prometheus** (different project)

## Metrics Available

### MARCUS Platform Metrics (port 3001)
```
marcus_http_request_duration_seconds - HTTP request latency histogram
marcus_http_requests_total - Total HTTP requests counter
marcus_http_active_connections - Active HTTP connections gauge
marcus_agent_status - Agent health status (1=healthy, 0=unhealthy)
marcus_agent_request_duration_seconds - Agent request latency
marcus_db_pool_size - Database connection pool size
marcus_db_pool_waiting - Waiting connections
marcus_circuit_breaker_state - Circuit breaker states
marcus_citation_analysis_total - Total citations analyzed
marcus_auth_attempts_total - Authentication attempts
+ Node.js default metrics (process_cpu, process_memory, nodejs_eventloop_lag, etc.)
```

### System Metrics (port 9100)
```
node_cpu_seconds_total - CPU time per core
node_memory_MemTotal_bytes - Total system memory
node_memory_MemAvailable_bytes - Available memory
node_disk_io_time_seconds_total - Disk I/O time
node_network_receive_bytes_total - Network RX bytes
node_network_transmit_bytes_total - Network TX bytes
```

### Database Metrics (port 9187)
```
pg_stat_database_numbackends - Active database connections
pg_stat_database_xact_commit - Committed transactions
pg_stat_database_xact_rollback - Rolled back transactions
pg_locks_count - Database locks by type
pg_replication_lag_seconds - Replication lag (if applicable)
```

### Game Simulation Metrics (port 9091 - NOT in Prometheus)
```
simulation_up - Simulation health status
simulation_uptime_seconds - Simulation uptime
simulation_state_available - Whether state is available
simulation_memory_* - Memory usage metrics
```

## Current Issues

### ❌ Redis Exporter Down (Port 9121)
**Status:** Service not responding
**Impact:** No Redis metrics in dashboards
**Resolution:** Restart redis_exporter service

### ⚠️ Game Simulation Not Integrated
**Status:** Metrics server running but not scraped by Prometheus
**Impact:** Game simulation metrics not visible in Grafana
**Resolution:** Add scrape config to prometheus.yml (if integration desired)

## Service Health Check

```bash
# Check all services
systemctl status marcus-platform-real  # MARCUS API
systemctl status prometheus            # Prometheus
systemctl status grafana-server        # Grafana
systemctl status prometheus-node-exporter  # System metrics
systemctl status prometheus-postgres-exporter  # DB metrics

# Check process names
ps aux | grep -E "(marcus-api-server|game-sim-metrics-server|next-server)"

# Check port listeners
ss -tulpn | grep -E "(3000|3001|4000|5432|6379|9090|9091|9100|9187|9121)"

# Check Prometheus targets
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {job: .labels.job, health: .health}'

# Check Grafana datasources
curl -s http://admin:admin@localhost:4000/api/datasources | jq '.[] | {name: .name, type: .type, url: .url}'
```

## Documentation References

- **Setup Guide:** `docs/MARCUS_SETUP_GUIDE.md`
- **Debugging:** `docs/MARCUS_DEBUGGING_REPORT.md`
- **Test Results:** `logs/complete_test_results.log`
- **Monitoring Summary:** `/tmp/monitoring_summary.txt`
- **TOC:** `docs/MARCUS_MASTER_TABLE_OF_CONTENTS.md`
