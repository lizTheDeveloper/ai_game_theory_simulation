# MARCUS 3.0 - Port Configuration & Grafana Dashboard Planning

**Date:** November 22, 2025
**Status:** Complete
**Session Type:** Configuration cleanup + dashboard planning
**Duration:** ~1 hour

---

## Executive Summary

Session focused on resolving port conflicts between MARCUS monitoring (Grafana) and Game Simulation frontend, cleaning up duplicate Grafana dashboards, and planning simulation metrics integration.

**Key Outcomes:**
1. Port conflict resolved - Grafana moved 4000 → 5000
2. SSH tunnel documentation corrected
3. Duplicate dashboards removed from Grafana
4. Implementation plan created for 10 simulation dashboards
5. Comprehensive port mapping documentation

---

## Work Completed

### 1. Port Configuration Resolution

**Problem identified:**
- Grafana configured on port 4000
- Game Simulation frontend also on port 4000
- SSH tunnel command incorrect (mapped both ports to 9090)

**Resolution:**
- **Grafana:** Moved to port 5000 (MARCUS monitoring stack)
- **Game Simulation:** Remains on port 4000 (frontend research tool)
- **SSH tunnel corrected:** Proper port forwarding setup documented

**Files created:**
- `docs/PORT_MAPPING.md` - Single source of truth for all ports
- `docs/PORT_SEPARATION.md` - Frontend vs backend separation guide
- `docs/SSH_TUNNEL_COMMAND.md` - Correct SSH tunnel setup

**Files updated:**
- `docs/MARCUS_MONITORING_ARCHITECTURE.md` - Port corrections
- `docs/MARCUS_MONITORING_OVERVIEW.md` - Access point updates

### 2. Grafana Dashboard Cleanup

**Actions taken:**
- Removed 5 duplicate dashboards from General folder:
  - Citations Analysis Overview (duplicate)
  - MARCUS Agent Metrics (duplicate)
  - MARCUS Citation Analysis (duplicate)
  - MARCUS Infrastructure (duplicate)
  - MARCUS Overview (duplicate)

**Organization:**
- All MARCUS monitoring dashboards → "MARCUS" folder
- Created "Research Tool" folder for future simulation dashboards
- Clean separation between platform monitoring and research metrics

### 3. Simulation Metrics Integration Planning

**Prometheus configuration:**
- Added scrape job for game simulation metrics (port 9091)
- Metrics endpoint: `http://localhost:9091/metrics`

**Dashboard implementation plan:**
- 10 simulation dashboards designed (system-level + outcomes)
- Documented in `docs/GRAFANA_SIMULATION_DASHBOARDS.md`
- Two implementation options:
  - **Option 1:** Manual JSON creation
  - **Option 2:** Agent-based (simulation-maintainer + far-future-ux-designer)

**Planned dashboards:**
1. AI Capabilities & Safety Metrics
2. Human Population & Quality of Life
3. Environmental Systems & Climate
4. Economic & Technological Progress
5. Social & Political Dynamics
6. Resource & Energy Systems
7. Food & Agriculture Systems
8. Government & Institutional Metrics
9. Outcome Trajectories & Tier Progress
10. Multi-Paradigm DUI Integration

---

## Port Mapping Summary

**MARCUS Platform (Backend):**
- Orchestrator API: 3000
- Citation Agent: 8000
- PostgreSQL: 5432
- Redis Cluster: 7000-7005
- Prometheus: 9090
- **Grafana: 5000** (CHANGED from 4000)
- Orchestrator Metrics: 9090
- Agent Metrics: 9091

**Game Simulation (Frontend Research Tool):**
- Next.js Frontend: **4000** (no change)
- Simulation Metrics: 9091 (Prometheus scrape)

**Correct SSH Tunnel:**
```bash
ssh -L 5000:localhost:5000 \
    -L 9090:localhost:9090 \
    g7throwawayplz@<VM-IP>
```

---

## Documentation Files

### Created
1. **`docs/PORT_MAPPING.md`** (5186 bytes)
   - Complete port inventory
   - Service → port mappings
   - Conflict resolution history

2. **`docs/PORT_SEPARATION.md`** (6088 bytes)
   - Frontend vs backend architecture
   - Port allocation strategy
   - Access patterns

3. **`docs/SSH_TUNNEL_COMMAND.md`** (2174 bytes)
   - Correct tunnel setup
   - Common mistakes
   - Troubleshooting

4. **`docs/GRAFANA_SIMULATION_DASHBOARDS.md`** (9521 bytes)
   - 10 dashboard specifications
   - Implementation options
   - Agent coordination plan

### Updated
1. **`docs/MARCUS_MONITORING_ARCHITECTURE.md`** (9750 bytes)
   - Port corrections (4000 → 5000)
   - Updated architecture diagram

2. **`docs/MARCUS_MONITORING_OVERVIEW.md`** (13646 bytes)
   - Access point updates
   - SSH tunnel corrections

---

## Next Session Work

**Recommended approach: Option 2 (Agent-based implementation)**

1. **Invoke `simulation-maintainer`:**
   - Enhance `/api/metrics` endpoint
   - Add Prometheus exposition format
   - Expose critical simulation state (17 AI capabilities, 17 QoL dimensions, environmental metrics, breakthrough tech status)

2. **Invoke `far-future-ux-designer`:**
   - Create 10 Grafana dashboard JSONs
   - Design far-future aesthetic visualizations
   - Implement Elysium-inspired color schemes
   - Deploy to Grafana "Research Tool" folder

3. **Validation:**
   - Verify metrics scraping (Prometheus targets)
   - Test dashboard queries
   - Validate refresh rates
   - Create example panels for each system

**Timeline estimate:** 2-3 hours for full implementation

---

## Commit Summary

**Commit:** `84e40da8`
**Branch:** `claude/build-marcus-agent-016LTPXuAb6A3hYDwTvMjyof`
**Message:** "docs: Add port mapping docs and Grafana monitoring separation"

**Files changed:**
- 6 new documentation files
- 2 updated monitoring docs
- Clean separation between MARCUS platform and simulation metrics

---

## Lessons Learned

### What Went Well
1. **Port conflict caught early** - Before production deployment
2. **Documentation-first approach** - Created clear references for future
3. **Dashboard cleanup** - Grafana UI now organized and navigable
4. **Implementation plan** - Clear next steps with agent coordination

### What Could Be Improved
1. **Port allocation should have been documented earlier** - Discovered conflict reactively
2. **Grafana dashboard organization** - Should enforce folder structure from start
3. **Simulation metrics endpoint** - Should have been Prometheus-compatible from beginning

### Recommendations
1. **Port registry** - Maintain `PORT_MAPPING.md` as single source of truth
2. **Dashboard governance** - Enforce folder structure, prevent duplicates
3. **Metrics standards** - All services should expose Prometheus metrics by default

---

## Attribution

**Coordinator:** Main context (acting as session orchestrator)
**Session Type:** Configuration cleanup + planning
**Date:** November 22, 2025
**Duration:** ~1 hour
**Status:** Complete - Ready for dashboard implementation

**Philosophy Applied:**
> "Precision in coordination. The roadmap is a living document, but it must remain scannable and actionable. Chaos in configuration leads to chaos in operations."

---

## Quick Reference

### Access MARCUS Monitoring
```bash
# SSH tunnel
ssh -L 5000:localhost:5000 -L 9090:localhost:9090 g7throwawayplz@<VM-IP>

# Grafana: http://localhost:5000
# Prometheus: http://localhost:9090
```

### Access Game Simulation
```bash
# Frontend: http://localhost:4000
# Metrics: http://localhost:9091/metrics (Prometheus format, pending implementation)
```

### Grafana Organization
```
MARCUS folder/
├── Citations Analysis Overview
├── MARCUS Agent Metrics
├── MARCUS Citation Analysis
├── MARCUS Infrastructure
└── MARCUS Overview

Research Tool folder/
└── (10 simulation dashboards, pending implementation)
```

---

**End of Report**
