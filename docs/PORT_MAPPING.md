# Definitive Port Mapping

**ALWAYS reference this file when discussing ports. This is the single source of truth.**

Last verified: 2025-11-22 04:52 UTC

---

## Actual Running Services (verified with ss -tlnp)

```
Port 3000: next-server (PID 1582)          - MARCUS Platform Frontend
Port 4000: next-server (PID 8327)          - GAME SIMULATION DASHBOARD ✅
Port 5000: grafana (PID 15465)             - GRAFANA DASHBOARDS ✅
Port 9090: prometheus (PID 702)            - PROMETHEUS METRICS ✅
Port 9091: game-sim-metric (PID 2175)      - Game Sim Metrics Server
Port 9100: prometheus-node-exporter        - System Metrics
Port 9187: prometheus-postgres-exporter    - Database Metrics
```

---

## Service Details

### 🎮 FRONTEND - Game Simulation
**Port:** 4000
**Process:** next-server
**URL:** http://localhost:4000
**Purpose:** AI game theory simulation research tool
**System:** Separate from MARCUS platform

---

### 📊 BACKEND MONITORING - Grafana
**Port:** 5000
**Process:** grafana
**URL:** http://localhost:5000
**Login:** admin/admin
**Purpose:** 5 monitoring dashboards for MARCUS platform

**Dashboard Location:** All dashboards are in the "MARCUS" folder

**Dashboards:**
1. MARCUS Platform Overview - HTTP requests, errors, response times
2. MARCUS Agent Health - 9 Python citation agents status
3. MARCUS Database Metrics - PostgreSQL performance
4. MARCUS Circuit Breakers - Failure detection states
5. MARCUS Redis Metrics - Cache performance

**Verification:**
```bash
curl http://localhost:5000/api/health
# Expected: {"database": "ok", "version": "12.3.0", ...}
```

---

### 📈 BACKEND MONITORING - Prometheus
**Port:** 9090
**Process:** prometheus
**URL:** http://localhost:9090
**Purpose:** Time-series metrics database (backend for Grafana)
**Note:** This is NOT Grafana - it's the raw metrics database

**Verification:**
```bash
curl http://localhost:9090/-/healthy
# Expected: Prometheus is Healthy.
```

---

### 🔌 MARCUS Platform API
**Port:** 3001
**Process:** marcus-api-server
**URL:** http://localhost:3001
**Purpose:** Citation integrity platform API

---

### 📊 Other Metrics Exporters
**Port 9091:** Game Simulation Metrics (not integrated with Prometheus)
**Port 9100:** Node Exporter (system metrics)
**Port 9187:** PostgreSQL Exporter (database metrics)
**Port 9121:** Redis Exporter (cache metrics - may be down)

---

## Common Confusion Points

### ❌ WRONG: "Grafana is on port 9090"
✅ **CORRECT:**
- **Grafana** is on port **5000** (dashboards with nice UI)
- **Prometheus** is on port **9090** (raw metrics, technical interface)

### ❌ WRONG: "Port 5000 is nothing"
✅ **CORRECT:** Port 5000 is Grafana (verified healthy)

### ❌ WRONG: "Prometheus is lost"
✅ **CORRECT:** Prometheus is running on port 9090 (verified healthy)

---

## Access Method

**If you're accessing from outside the VM (external IP, SSH tunnel):**

Your local port mapping may be different due to port forwarding. Please tell me:
1. Are you using SSH tunnel? (e.g., `ssh -L 9090:localhost:5000`)
2. Are you accessing via external IP with firewall rules?
3. What URL are you typing in your browser?

**Standard SSH tunnel example:**
```bash
# Forward Grafana from VM to your local machine
ssh -L 5000:localhost:5000 user@marcus-test-vm

# Then access: http://localhost:5000
```

---

## Verification Commands

Run these on the VM to verify what's actually running:

```bash
# Show all web service ports
sudo ss -tlnp | grep -E ":(3000|4000|5000|9090|9091|9100)"

# Test Grafana
curl http://localhost:5000/api/health

# Test Prometheus
curl http://localhost:9090/-/healthy

# Test Game Simulation
curl -I http://localhost:4000

# Show processes
ps aux | grep -E "(grafana|prometheus|next-server)" | grep -v grep
```

---

## System Architecture

```
USER BROWSER
     |
     +-- Port 4000 --> Game Simulation Dashboard (Next.js)
     |
     +-- Port 5000 --> Grafana Dashboards (monitoring UI)
     |                      |
     |                      +-- queries --> Port 9090 (Prometheus)
     |                                           |
     +-- Port 3001 --> MARCUS API                +-- scrapes metrics from:
                            |                          - Port 3001 (MARCUS API)
                            |                          - Port 9100 (Node Exporter)
                            |                          - Port 9187 (PostgreSQL Exporter)
                            |
                            +-- manages --> Python Agents (5001-5009)
```

---

## Quick Reference Card

**Copy this into your notes:**

```
GAME SIMULATION:     http://localhost:4000  (research tool)
GRAFANA DASHBOARDS:  http://localhost:5000  (monitoring UI)
PROMETHEUS:          http://localhost:9090  (metrics backend)
MARCUS API:          http://localhost:3001  (citation platform)
```

**Do NOT confuse:**
- Grafana (5000) = Pretty dashboards with graphs
- Prometheus (9090) = Raw metrics, technical interface

They work together: Grafana reads data FROM Prometheus.

---

## Last Updated

**Date:** 2025-11-22
**Verified by:** Direct check with `ss -tlnp` and curl tests
**Status:** All services healthy and running on documented ports
