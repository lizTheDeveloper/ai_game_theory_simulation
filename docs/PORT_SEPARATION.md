# Port Separation Guide

**CRITICAL: Keep frontend simulation and backend monitoring completely separate.**

This document defines the port allocation to prevent confusion between the research simulation tool (frontend) and the MARCUS platform monitoring infrastructure (backend).

---

## Port Allocation

### Frontend - Game Simulation (ai_game_theory_simulation)

| Port | Service | Description | Access |
|------|---------|-------------|--------|
| **4000** | **Game Simulation Dashboard** | Research tool - AI game theory simulation UI | http://localhost:4000 |
| 9091 | Game Sim Metrics Server | Simulation state export (NOT in Prometheus) | http://localhost:9091/metrics |

**Purpose:** Interactive research tool for exploring AI alignment → sustainability pathways

**Tech Stack:** Next.js, TypeScript, pure simulation engine

---

### Backend - MARCUS Platform Monitoring

| Port | Service | Description | Access |
|------|---------|-------------|--------|
| **5000** | **Grafana Dashboards** | 5 monitoring dashboards for MARCUS platform | http://localhost:5000 |
| 3001 | MARCUS API Server | Citation integrity platform API | http://localhost:3001 |
| 5001-5009 | Python Citation Agents | 9 behavioral agents (honest, sloppy, biased, etc.) | Internal IPC |
| 5432 | PostgreSQL | Database (marcus_production, marcus_test) | Internal |
| 6379 | Redis | Cache & queue | Internal |
| 9090 | Prometheus | Time-series metrics database | http://localhost:9090 |
| 9100 | Node Exporter | System metrics (CPU, RAM, disk) | http://localhost:9100/metrics |
| 9187 | PostgreSQL Exporter | Database metrics | http://localhost:9187/metrics |
| 9121 | Redis Exporter | Cache metrics | http://localhost:9121/metrics |

**Purpose:** Production monitoring infrastructure for citation agent platform

**Tech Stack:** Node.js (API), Python (agents), PostgreSQL, Redis, Prometheus, Grafana

---

## The 5 Grafana Dashboards (Backend Monitoring)

Access all at **http://localhost:5000** after logging in (admin/admin):

### 1. Platform Overview
**Purpose:** High-level MARCUS platform health
- HTTP request rates and error rates
- P95 response times
- Active database connections
- Platform uptime

**File:** `monitoring/grafana/dashboards/platform-overview.json`

### 2. Agent Health
**Purpose:** Monitor 9 Python citation agents
- Agent status (healthy/unhealthy)
- Citations analyzed per minute
- Agent response times
- Error breakdown by type

**File:** `monitoring/grafana/dashboards/agent-health.json`

### 3. Database Metrics
**Purpose:** PostgreSQL performance monitoring
- Query execution times (P95)
- Connection pool usage
- Cache hit ratios
- Slow queries (>100ms)

**File:** `monitoring/grafana/dashboards/database-metrics.json`

### 4. Circuit Breakers
**Purpose:** Circuit breaker health and failures
- Circuit breaker states (CLOSED/OPEN/HALF-OPEN)
- Circuit breaker trips over time
- Success rates by circuit breaker
- Recovery times

**File:** `monitoring/grafana/dashboards/circuit-breakers.json`

### 5. Redis Metrics
**Purpose:** Cache performance monitoring
- Operations per second (GET/SET)
- Memory usage (current vs max)
- Cache hit rate
- Evicted keys
- Connected clients

**File:** `monitoring/grafana/dashboards/redis-metrics.json`

---

## Quick Access Summary

### 🎮 FRONTEND (Research Simulation)
```bash
# Game Simulation Dashboard
open http://localhost:4000
```

### 🔧 BACKEND (MARCUS Monitoring)
```bash
# Grafana Dashboards (5 dashboards)
open http://localhost:5000

# Prometheus Metrics Explorer
open http://localhost:9090

# MARCUS API Health
curl http://localhost:3001/api/health
```

---

## Why This Separation Matters

**Frontend (port 4000):**
- Research tool for human users
- Models AI alignment → sustainability scenarios
- Educational/exploratory purpose
- No production monitoring needed

**Backend (port 5000):**
- Production monitoring for MARCUS platform
- Tracks citation agent performance
- Database/cache health monitoring
- Operational alerts and SLIs

**These are COMPLETELY DIFFERENT SYSTEMS.** Never confuse their ports.

---

## Common Mistakes to Avoid

❌ **WRONG:** "The dashboard is at localhost:4000" (Which dashboard? Game or Grafana?)
✅ **CORRECT:** "The **Grafana monitoring dashboards** are at localhost:5000"
✅ **CORRECT:** "The **game simulation dashboard** is at localhost:4000"

❌ **WRONG:** Assuming monitoring data applies to the game simulation
✅ **CORRECT:** Monitoring data tracks MARCUS citation agents, NOT the game simulation

❌ **WRONG:** Trying to access game simulation metrics in Grafana
✅ **CORRECT:** Game simulation metrics are on port 9091 and NOT integrated with Prometheus

---

## Verification Commands

### Check Frontend
```bash
# Game simulation should be on port 4000
ss -tlnp | grep :4000
# Expected: next-server listening on port 4000
```

### Check Backend Monitoring
```bash
# Grafana should be on port 5000
ss -tlnp | grep :5000
# Expected: grafana listening on port 5000

# Prometheus should be on port 9090
ss -tlnp | grep :9090
# Expected: prometheus listening on port 9090

# MARCUS API should be on port 3001
ss -tlnp | grep :3001
# Expected: marcus-api-server listening on port 3001
```

### Check All Monitoring Services
```bash
systemctl status grafana-server
systemctl status prometheus
systemctl status prometheus-node-exporter
systemctl status prometheus-postgres-exporter
```

---

## Documentation References

**Backend Monitoring:**
- Architecture: `docs/MARCUS_MONITORING_ARCHITECTURE.md`
- Overview: `docs/MARCUS_MONITORING_OVERVIEW.md`
- Setup: `monitoring/README.md`
- Dashboards: `monitoring/grafana/dashboards/*.json`

**Frontend Simulation:**
- Main README: `README.md`
- Wiki: `docs/wiki/README.md`
- Commands: `docs/COMMANDS.md`

---

## History

**2025-11-22:** Created to prevent port confusion after Grafana port conflict
- Moved Grafana from port 4000 → 5000 to avoid conflict with game simulation
- Game simulation dashboard runs on port 4000
- MARCUS monitoring dashboards (Grafana) run on port 5000
- These systems are now permanently separated
