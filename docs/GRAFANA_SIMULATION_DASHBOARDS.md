# Grafana Simulation Dashboards - Implementation Plan

**Status:** Infrastructure ready, waiting for metrics enhancement

**Created:** 2025-11-22

---

## ✅ Completed Setup

1. **Prometheus Configuration**
   - Added `game-simulation` scrape job
   - Scraping `localhost:9091/metrics` every 5 seconds
   - Status: ✅ Working (`health: up`)

2. **Grafana Folder**
   - Created "Research Tool" folder in Grafana
   - URL: http://localhost:5000/dashboards/f/ef4v15yhwmjggd/research-tool
   - Ready for dashboards

---

## ⚠️  Current Limitation

The game simulation metrics endpoint (`localhost:9091/metrics`) currently only exports **basic health metrics**:

```prometheus
simulation_up                      # 1 = up, 0 = down
simulation_uptime_seconds          # API uptime
simulation_last_update_timestamp   # Last state update
simulation_state_available         # Whether state is available (currently 0)
simulation_memory_heap_used_bytes  # Node.js memory
simulation_memory_heap_total_bytes # Node.js total memory
```

**Missing:** Actual game state data (paradigms, AI agents, crises, environment, tech tree, etc.)

---

## 📋 Requested Dashboards

The user wants 10 dashboards mirroring the Next.js UI:

1. **Overview** - High-level simulation state
2. **Paradigms** - 4 worldview perspectives (Western, Development, Ecological, Indigenous)
3. **AI Agents** - AI capabilities, sandbagging detection, strategic behavior
4. **Crises** - Active crises, cascade effects
5. **Environment** - Planetary boundaries, climate metrics
6. **Tech Tree** - 71 breakthrough technologies (TIER 0-4)
7. **Detection** - Adversarial AI evaluation, gaming detection
8. **Regions** - Regional state, cooperation levels
9. **Timeline** - Historical events, decision points
10. **Real-Time** - Live simulation state updates

**Additional:** "Configure & Start" button to initialize simulation from Grafana

---

## 🔧 What's Needed

### Phase 1: Enhance Metrics Endpoint

**File:** `src/metrics/server.ts` (or similar)

**Add metrics for:**

#### Overview Dashboard Metrics
```typescript
simulation_current_month          # Current simulation month
simulation_phase                  # Current phase (alignment/transition/etc)
simulation_outcome_trajectory     # Utopia → Extinction scale
simulation_qol_overall           # Overall quality of life (0-1)
```

#### Paradigm Metrics
```typescript
paradigm_dominance{paradigm="western"}      # Western Liberal dominance
paradigm_dominance{paradigm="development"}  # Development paradigm
paradigm_dominance{paradigm="ecological"}   # Ecological paradigm
paradigm_dominance{paradigm="indigenous"}   # Indigenous paradigm
paradigm_transition_velocity               # Rate of paradigm shift
```

#### AI Agent Metrics
```typescript
ai_capability{dimension="physical"}        # 17 capability dimensions
ai_capability{dimension="digital"}
ai_capability{dimension="cognitive"}
# ... (all 17 dimensions)
ai_sandbagging_detected{agent="agent1"}   # Sandbagging detection
ai_strategic_gaming{agent="agent1"}       # Gaming behavior
```

#### Crisis Metrics
```typescript
active_crises_count                       # Number of active crises
crisis_severity{type="climate"}          # Crisis severity by type
crisis_cascade_depth                     # Depth of cascade effects
```

#### Environment Metrics
```typescript
planetary_boundary{boundary="climate"}    # All 9 planetary boundaries
planetary_boundary{boundary="biodiversity"}
# ... (all 9 boundaries)
global_temperature_delta                 # Temperature change from baseline
ocean_ph_level                          # Ocean acidification
```

#### Tech Tree Metrics
```typescript
tech_deployed{tier="0", name="..."}      # Tech deployment status
tech_tier_completion{tier="0"}           # % of tier completed
tech_dependency_satisfied{tech="..."}    # Dependencies met
```

#### Detection Metrics
```typescript
adversarial_eval_score{agent="agent1"}   # Adversarial evaluation
gaming_detected{agent="agent1"}          # Gaming detection
alignment_fidelity{agent="agent1"}       # Alignment score
```

#### Region Metrics
```typescript
region_cooperation{region="north_america"} # Regional cooperation
region_qol{region="north_america"}        # Regional quality of life
region_tech_access{region="africa"}       # Tech accessibility
```

#### Timeline Metrics
```typescript
events_total                             # Total events logged
critical_decisions_count                 # Number of decision points
branching_points_count                   # Significant bifurcations
```

#### Real-Time Metrics
```typescript
simulation_speed                         # Simulation ticks/second
state_update_latency_ms                  # State update delay
websocket_connections                    # Active connections
```

### Phase 2: Create Grafana Dashboards

For each of the 10 dashboards, create a JSON dashboard file in:
`monitoring/grafana/dashboards/research-tool/`

**Example structure:**
```json
{
  "dashboard": {
    "title": "Simulation Overview",
    "tags": ["simulation", "research-tool", "overview"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "Current Month",
        "type": "stat",
        "targets": [{
          "expr": "simulation_current_month"
        }]
      },
      {
        "id": 2,
        "title": "Overall Quality of Life",
        "type": "gauge",
        "targets": [{
          "expr": "simulation_qol_overall"
        }]
      }
      // ... more panels
    ]
  },
  "folderUid": "ef4v15yhwmjggd",  // Research Tool folder
  "overwrite": true
}
```

### Phase 3: Add Control Interface

**"Configure & Start" button:**

Options:
1. **Grafana Dashboard Link** - Simple link to simulation UI
2. **Webhook Panel** - Grafana panel that calls simulation API
3. **External Link** - Button that opens http://localhost:4000 in new tab

**Simplest approach:**
Add a Text panel with markdown link to the simulation UI.

---

## 🤖 Recommended Approach

This is a complex task requiring:
1. Deep understanding of game state structure
2. Prometheus metrics design
3. Grafana dashboard UX design
4. Real-time data visualization

**Recommendation:** Use the multi-agent workflow

### Option 1: far-future-ux-designer Agent
```bash
# Invoke from Claude Code
Task({
  subagent_type: "far-future-ux-designer",
  description: "Create 10 Grafana dashboards for simulation",
  prompt: "Create 10 Grafana dashboards in the 'Research Tool' folder to mirror the Next.js UI. Dashboards: Overview, Paradigms, AI Agents, Crises, Environment, Tech Tree, Detection, Regions, Timeline, Real-Time. First, enhance the metrics endpoint at port 9091 to export game state data, then create the dashboard JSON files."
})
```

**Why this agent:**
- Specializes in dashboard design
- Understands data visualization
- Knows React patterns (can read Next.js source)
- Creates far-future aesthetics

### Option 2: simulation-maintainer + far-future-ux-designer

**Step 1:** simulation-maintainer enhances metrics endpoint
```bash
Task({
  subagent_type: "simulation-maintainer",
  description: "Add game state metrics to port 9091",
  prompt: "Enhance src/metrics/server.ts to export game state metrics for Grafana. Need metrics for: paradigms, AI agents, crises, environment (9 planetary boundaries), tech tree (71 techs), detection scores, regions, timeline events, real-time state."
})
```

**Step 2:** far-future-ux-designer creates dashboards
```bash
Task({
  subagent_type: "far-future-ux-designer",
  description: "Create 10 Grafana dashboards",
  prompt: "Create 10 Grafana dashboards in 'Research Tool' folder using the new metrics. Dashboards: Overview, Paradigms, AI Agents, Crises, Environment, Tech Tree, Detection, Regions, Timeline, Real-Time. Use far-future aesthetics (Elysium-inspired, high-contrast)."
})
```

---

## 📊 Quick Win: Basic Dashboard

**I can create ONE basic dashboard now** using the existing metrics to demonstrate the concept:

```bash
# Create a simple "Simulation Health" dashboard
curl -u admin:admin -X POST http://localhost:5000/api/dashboards/db \
  -H "Content-Type: application/json" \
  -d @monitoring/grafana/dashboards/research-tool/simulation-health.json
```

This would show:
- Simulation uptime
- Memory usage
- State availability
- Health status

**But for the full 10 dashboards, use the agents!**

---

## 🚀 Next Steps

1. **Decide:** Quick win (basic dashboard) OR full implementation (agents)?

2. **If quick win:**
   - I'll create a basic "Simulation Health" dashboard now
   - Shows available metrics
   - Proves the concept

3. **If full implementation:**
   - Invoke simulation-maintainer to enhance metrics endpoint
   - Then invoke far-future-ux-designer to create 10 dashboards
   - Estimated time: 2-4 hours with agents

---

## 📁 File Locations

**Prometheus config:**
- `/etc/prometheus/prometheus.yml` (game-simulation job added)

**Grafana folder:**
- UID: `ef4v15yhwmjggd`
- Title: "Research Tool"

**Metrics endpoint:**
- Port: 9091
- URL: http://localhost:9091/metrics
- Source: game-sim-metrics-server process (PID 2175)

**Dashboard storage (for future dashboards):**
- `monitoring/grafana/dashboards/research-tool/`

---

## 🔗 Quick Links

**Access Grafana Research Tool folder:**
http://localhost:5000/dashboards/f/ef4v15yhwmjggd/research-tool

**Access simulation UI:**
http://localhost:4000

**Check Prometheus targets:**
http://localhost:9090/targets

**Check simulation metrics:**
http://localhost:9091/metrics
