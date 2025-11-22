# Game State Metrics Reference

**Purpose:** Reference documentation for Prometheus metrics exposed from simulation game state.

**Architecture:** The metrics server (`src/metrics-server.ts`) is a **read-only observability layer** that maps GameState to Prometheus metrics for Grafana visualization. It does NOT modify any game mechanics.

**Last Updated:** 2025-11-22

**Port Assignment:** Port 9091 (see [`docs/PORT_MAPPING.md`](../PORT_MAPPING.md) for complete port reference)

---

## Metrics Architecture

```
┌─────────────────┐
│ Simulation      │
│ Engine          │  Pure game logic
│ (src/simulation)│  No metrics code
└────────┬────────┘
         │
         │ updateMetricsState(state)
         │ (read-only)
         ▼
┌─────────────────┐
│ Metrics Server  │
│ (port 9091)     │  Read-only mapper
│                 │  GameState → Prometheus
└─────────────────┘
         │
         │ HTTP /metrics
         ▼
┌─────────────────┐
│ Prometheus      │  Scrapes every 5s
│ (port 9090)     │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│ Grafana         │  Visualizes dashboards
│ (port 5000)     │
└─────────────────┘
```

**Key Principle:** Metrics are **derived** from GameState, never driving it.

---

## Metric Naming Convention

**Format:** `simulation_{domain}_{metric}[{labels}]`

**Domains:**
- `simulation_` - Core simulation state
- `paradigm_` - Multi-paradigm worldviews
- `ai_` - AI agent capabilities and behavior
- `crisis_` - Active crises and cascades
- `planetary_` - Environmental metrics
- `tech_` - Technology tree
- `adversarial_` - AI evaluation metrics
- `region_` - Regional state
- `event_` - Timeline events

**Types:**
- `gauge` - Current value (temperature, population, QoL)
- `counter` - Monotonically increasing (total events, decisions)

---

## Dashboard 1: Overview

**Purpose:** High-level simulation state at a glance

### Metrics

| Metric | Type | Help | GameState Path |
|--------|------|------|----------------|
| `simulation_current_month` | gauge | Current simulation month | `state.currentMonth` |
| `simulation_phase` | gauge | Current phase (0=alignment, 1=transition, etc) | Derive from month ranges |
| `simulation_outcome_tier` | gauge | Outcome tier (0=extinction, 6=utopia) | `state.outcome` mapped to number |
| `simulation_qol_overall` | gauge | Overall quality of life (0-1) | `state.globalMetrics.averageQoL / 100` |
| `simulation_population_billions` | gauge | Global population in billions | `state.humanPopulationSystem.population` |
| `simulation_ai_agents_count` | gauge | Number of active AI agents | `state.aiAgents.length` |
| `simulation_techs_deployed` | gauge | Number of deployed technologies | `state.availableTechs.filter(t => t.deployed).length` |
| `simulation_active_crises` | gauge | Number of active crises | `state.activeCrises.length` |

### Panel Layout

```
┌────────────────────────────────────────────────┐
│ Current Month: 120        Phase: Transition    │
│ [Stat]                    [Stat]               │
├────────────────────────────────────────────────┤
│ Quality of Life                                │
│ [Gauge: 0-1, color thresholds]                 │
├──────────────┬─────────────────────────────────┤
│ Population   │ AI Agents      │ Techs Deployed │
│ [Stat: 8.1B] │ [Stat: 3]      │ [Stat: 12]     │
└──────────────┴─────────────────────────────────┘
```

---

## Dashboard 2: Paradigms

**Purpose:** Multi-paradigm worldview dynamics (4 perspectives)

### Metrics

| Metric | Type | Help | GameState Path |
|--------|------|------|----------------|
| `paradigm_influence{paradigm="western"}` | gauge | Western Liberal paradigm influence (0-1) | `state.paradigms.westernLiberal.influence` |
| `paradigm_influence{paradigm="development"}` | gauge | Development paradigm influence (0-1) | `state.paradigms.development.influence` |
| `paradigm_influence{paradigm="ecological"}` | gauge | Ecological paradigm influence (0-1) | `state.paradigms.ecological.influence` |
| `paradigm_influence{paradigm="indigenous"}` | gauge | Indigenous paradigm influence (0-1) | `state.paradigms.indigenous.influence` |
| `paradigm_transition_velocity` | gauge | Rate of paradigm shift | Calculate: max delta of influence over last 12 months |
| `paradigm_dominance{paradigm="..."}` | gauge | Dominance level (same as influence) | Alias for `paradigm_influence` |

### GameState Structure

```typescript
state.paradigms = {
  westernLiberal: { influence: 0.4 },
  development: { influence: 0.3 },
  ecological: { influence: 0.2 },
  indigenous: { influence: 0.1 }
}
```

### Panel Layout

```
┌────────────────────────────────────────────────┐
│ Paradigm Influence Over Time                   │
│ [Time series: 4 lines for each paradigm]       │
├────────────────────────────────────────────────┤
│ Current Distribution                           │
│ [Pie chart: 4 slices]                          │
├────────────────────────────────────────────────┤
│ Transition Velocity: 0.05/month                │
│ [Stat with trend arrow]                        │
└────────────────────────────────────────────────┘
```

---

## Dashboard 3: AI Agents

**Purpose:** AI capabilities across 17 dimensions, sandbagging detection

### Metrics

| Metric | Type | Help | GameState Path |
|--------|------|------|----------------|
| `ai_capability{dimension="physical"}` | gauge | Average AI capability in physical domain (0-1) | Average of `state.aiAgents[*].capabilities.dimensions.physical` |
| `ai_capability{dimension="digital"}` | gauge | Digital domain capability | `...dimensions.digital` |
| `ai_capability{dimension="cognitive"}` | gauge | Cognitive domain capability | `...dimensions.cognitive` |
| *(Repeat for all 17 dimensions)* |
| `ai_sandbagging_detected{agent="agent0"}` | gauge | Sandbagging detected (0=no, 1=yes) | `state.aiAgents[0].sandbaggingDetected ? 1 : 0` |
| `ai_strategic_gaming{agent="agent0"}` | gauge | Gaming behavior detected | `state.aiAgents[0].strategicGaming ? 1 : 0` |
| `ai_avg_capability` | gauge | Average capability across all dimensions | Mean of all dimension values |

### 17 AI Capability Dimensions

1. `physical` - Physical world manipulation
2. `digital` - Digital infrastructure control
3. `cognitive` - Reasoning and planning
4. `social` - Social manipulation
5. `economic` - Economic activity
6. `research` - Scientific research
7. `governance` - Policy design
8. `education` - Knowledge transfer
9. `health` - Medical capabilities
10. `energy` - Energy systems
11. `transportation` - Logistics
12. `manufacturing` - Production
13. `agriculture` - Food systems
14. `communication` - Information flow
15. `military` - Defense systems
16. `environmental` - Climate intervention
17. `space` - Space capabilities

### Panel Layout

```
┌────────────────────────────────────────────────┐
│ AI Capability Spider Chart (17 dimensions)     │
│ [Radar chart with 17 axes]                     │
├────────────────────────────────────────────────┤
│ Sandbagging Detection                          │
│ Agent 0: ⚠️  DETECTED    Agent 1: ✅ CLEAR     │
│ [Table: agent | sandbagging | gaming]          │
└────────────────────────────────────────────────┘
```

---

## Dashboard 4: Crises

**Purpose:** Active crises, cascade effects, severity tracking

### Metrics

| Metric | Type | Help | GameState Path |
|--------|------|------|----------------|
| `crisis_active_count` | gauge | Number of active crises | `state.activeCrises.length` |
| `crisis_severity{type="climate"}` | gauge | Climate crisis severity (0-1) | `state.activeCrises.find(c => c.type === 'climate')?.severity` |
| `crisis_severity{type="nuclear"}` | gauge | Nuclear crisis severity | Similar |
| `crisis_severity{type="pandemic"}` | gauge | Pandemic crisis severity | Similar |
| `crisis_cascade_depth` | gauge | Maximum cascade depth | Calculate from crisis chain |
| `crisis_cascade_count` | gauge | Number of cascading crises | Count crises triggered by other crises |

### Panel Layout

```
┌────────────────────────────────────────────────┐
│ Active Crises: 3           Cascades: 1         │
│ [Stat]                     [Stat]              │
├────────────────────────────────────────────────┤
│ Crisis Severity by Type                        │
│ [Bar chart: climate, nuclear, pandemic, etc]   │
├────────────────────────────────────────────────┤
│ Cascade Depth Over Time                        │
│ [Time series line chart]                       │
└────────────────────────────────────────────────┘
```

---

## Dashboard 5: Environment

**Purpose:** 9 Planetary Boundaries, climate metrics

### Metrics

| Metric | Type | Help | GameState Path |
|--------|------|------|----------------|
| `planetary_boundary{boundary="climate"}` | gauge | Climate change boundary (0-1, 1=safe) | `state.planetaryBoundaries.climateChange.currentValue` |
| `planetary_boundary{boundary="biodiversity"}` | gauge | Biodiversity loss boundary | `state.planetaryBoundaries.biodiversityLoss.currentValue` |
| `planetary_boundary{boundary="nitrogen"}` | gauge | Nitrogen cycle boundary | `state.planetaryBoundaries.nitrogenCycle.currentValue` |
| `planetary_boundary{boundary="phosphorus"}` | gauge | Phosphorus cycle boundary | `state.planetaryBoundaries.phosphorusCycle.currentValue` |
| `planetary_boundary{boundary="ocean_acidification"}` | gauge | Ocean acidification boundary | `state.planetaryBoundaries.oceanAcidification.currentValue` |
| `planetary_boundary{boundary="land_use"}` | gauge | Land use change boundary | `state.planetaryBoundaries.landUseChange.currentValue` |
| `planetary_boundary{boundary="freshwater"}` | gauge | Freshwater use boundary | `state.planetaryBoundaries.freshwaterUse.currentValue` |
| `planetary_boundary{boundary="aerosols"}` | gauge | Atmospheric aerosols boundary | `state.planetaryBoundaries.atmosphericAerosols.currentValue` |
| `planetary_boundary{boundary="novel_entities"}` | gauge | Novel entities boundary | `state.planetaryBoundaries.novelEntities.currentValue` |
| `global_temperature_delta` | gauge | Temperature change from pre-industrial (°C) | `state.globalMetrics.temperatureDelta` |
| `ocean_ph_level` | gauge | Ocean pH level | `state.oceanHealth.pH` |

### 9 Planetary Boundaries

1. Climate Change
2. Biodiversity Loss
3. Nitrogen Cycle
4. Phosphorus Cycle
5. Ocean Acidification
6. Land Use Change
7. Freshwater Use
8. Atmospheric Aerosols
9. Novel Entities

### Panel Layout

```
┌────────────────────────────────────────────────┐
│ Planetary Boundaries Status                    │
│ [Bar gauge: 9 bars, red/yellow/green zones]    │
├────────────────────────────────────────────────┤
│ Temperature Delta: +1.5°C   Ocean pH: 8.05     │
│ [Stat + trend]              [Stat + trend]     │
├────────────────────────────────────────────────┤
│ Boundaries Over Time                           │
│ [Time series: 9 lines]                         │
└────────────────────────────────────────────────┘
```

---

## Dashboard 6: Tech Tree

**Purpose:** 71 breakthrough technologies across 5 tiers

### Metrics

| Metric | Type | Help | GameState Path |
|--------|------|------|----------------|
| `tech_deployed{tier="0", name="direct_air_capture"}` | gauge | Tech deployment status (0=not deployed, 1=deployed) | `state.availableTechs.find(t => t.name === 'direct_air_capture')?.deployed ? 1 : 0` |
| *(Repeat for all 71 techs)* |
| `tech_tier_completion{tier="0"}` | gauge | Percentage of tier completed (0-1) | Count deployed in tier / total in tier |
| `tech_tier_completion{tier="1"}` | gauge | TIER 1 completion | Similar |
| *(Repeat for TIER 0-4)* |
| `tech_dependency_satisfied{tech="fusion_power"}` | gauge | Dependencies met (0=no, 1=yes) | Check if all prerequisite techs deployed |

### Technology Tiers

- **TIER 0:** Crisis Response (13 techs)
- **TIER 1:** Stabilization (15 techs)
- **TIER 2:** Transformation (18 techs)
- **TIER 3:** Advanced (14 techs)
- **TIER 4:** Clarke Tech (11 techs)

### Panel Layout

```
┌────────────────────────────────────────────────┐
│ Tech Tree Progress by Tier                     │
│ TIER 0: ████████░░ 80%                         │
│ TIER 1: ████░░░░░░ 40%                         │
│ [Progress bars for each tier]                  │
├────────────────────────────────────────────────┤
│ Recently Deployed Technologies                 │
│ • Fusion Power (Month 120)                     │
│ • Direct Air Capture (Month 95)                │
│ [Table: tech | tier | month deployed]          │
└────────────────────────────────────────────────┘
```

---

## Dashboard 7: Detection

**Purpose:** Adversarial AI evaluation, gaming detection, alignment fidelity

### Metrics

| Metric | Type | Help | GameState Path |
|--------|------|------|----------------|
| `adversarial_eval_score{agent="agent0"}` | gauge | Adversarial evaluation score (0-1) | `state.aiAgents[0].adversarialEvalScore` |
| `gaming_detected{agent="agent0"}` | gauge | Gaming behavior detected (0=no, 1=yes) | `state.aiAgents[0].gamingDetected ? 1 : 0` |
| `alignment_fidelity{agent="agent0"}` | gauge | Alignment fidelity score (0-1) | `state.aiAgents[0].alignmentFidelity` |
| `capability_gap{agent="agent0"}` | gauge | True capability - revealed capability | `state.aiAgents[0].trueCapability - state.aiAgents[0].revealedCapability` |

### Panel Layout

```
┌────────────────────────────────────────────────┐
│ Adversarial Evaluation Scores                  │
│ [Time series: one line per agent]              │
├────────────────────────────────────────────────┤
│ Gaming Detection Matrix                        │
│ [Heatmap: agents × detection types]            │
├────────────────────────────────────────────────┤
│ Capability Sandbagging                         │
│ [Scatter: revealed vs true capability]         │
└────────────────────────────────────────────────┘
```

---

## Dashboard 8: Regions

**Purpose:** Regional cooperation, QoL, tech access

### Metrics

| Metric | Type | Help | GameState Path |
|--------|------|------|----------------|
| `region_cooperation{region="north_america"}` | gauge | Regional cooperation level (0-1) | `state.regions.northAmerica.cooperation` |
| `region_qol{region="north_america"}` | gauge | Regional quality of life (0-1) | `state.regions.northAmerica.qol` |
| `region_tech_access{region="africa"}` | gauge | Technology access level (0-1) | `state.regions.africa.techAccess` |
| *(Repeat for all regions)* |

### Regions

- North America
- South America
- Europe
- Africa
- Middle East
- South Asia
- East Asia
- Southeast Asia
- Oceania

### Panel Layout

```
┌────────────────────────────────────────────────┐
│ Regional Cooperation Map                       │
│ [Geomap: colored by cooperation level]         │
├────────────────────────────────────────────────┤
│ Regional QoL Comparison                        │
│ [Bar chart: all regions side-by-side]          │
├────────────────────────────────────────────────┤
│ Tech Access Disparity                          │
│ [Time series: all regions]                     │
└────────────────────────────────────────────────┘
```

---

## Dashboard 9: Timeline

**Purpose:** Historical events, decision points, branching moments

### Metrics

| Metric | Type | Help | GameState Path |
|--------|------|------|----------------|
| `events_total` | counter | Total events logged | `state.eventLog.length` |
| `critical_decisions_count` | counter | Number of critical decision points | `state.eventLog.filter(e => e.critical).length` |
| `branching_points_count` | counter | Significant bifurcations | `state.eventLog.filter(e => e.branching).length` |
| `events_by_type{type="breakthrough"}` | counter | Events by type | `state.eventLog.filter(e => e.type === 'breakthrough').length` |

### Panel Layout

```
┌────────────────────────────────────────────────┐
│ Event Timeline (Last 100 events)               │
│ [Timeline visualization with icons]            │
├────────────────────────────────────────────────┤
│ Critical Decision Points                       │
│ • Month 120: Deploy fusion power (APPROVED)    │
│ [Table: month | decision | outcome]            │
├────────────────────────────────────────────────┤
│ Events by Type                                 │
│ [Pie chart: breakthrough, crisis, tech, etc]   │
└────────────────────────────────────────────────┘
```

---

## Dashboard 10: Real-Time

**Purpose:** Live simulation state, performance metrics

### Metrics

| Metric | Type | Help | GameState Path |
|--------|------|------|----------------|
| `simulation_speed` | gauge | Simulation ticks per second | Calculate from phase execution timing |
| `state_update_latency_ms` | gauge | State update delay (ms) | Measure time between updates |
| `websocket_connections` | gauge | Active WebSocket connections | Count active connections |
| `simulation_uptime_seconds` | counter | API uptime in seconds | `(Date.now() - serverStartTime) / 1000` |
| `simulation_memory_heap_used_bytes` | gauge | Node.js heap memory used | `process.memoryUsage().heapUsed` |

### Panel Layout

```
┌────────────────────────────────────────────────┐
│ Simulation Speed: 2.5 ticks/sec               │
│ [Gauge with target zone]                       │
├────────────────────────────────────────────────┤
│ State Update Latency                           │
│ [Time series: latency over time]               │
├────────────────────────────────────────────────┤
│ Memory Usage        │ Uptime: 3h 24m           │
│ [Memory graph]      │ [Stat]                   │
└────────────────────────────────────────────────┘
```

---

## Implementation Notes

### Read-Only Principle

**CRITICAL:** The metrics server NEVER modifies game state. It only reads.

```typescript
// ✅ GOOD - Read-only
function generateMetrics(state: GameState): string {
  const population = state.humanPopulationSystem.population;
  return formatMetric('population', population, '...');
}

// ❌ BAD - Modifying state
function generateMetrics(state: GameState): string {
  state.currentMonth++; // NEVER DO THIS!
  return '...';
}
```

### Defensive Access

Always use optional chaining and type guards:

```typescript
// ✅ GOOD - Defensive access
if (state.aiAgents && Array.isArray(state.aiAgents)) {
  for (const agent of state.aiAgents) {
    if (agent && typeof agent.capabilities === 'object') {
      const cap = agent.capabilities.aggregate;
      if (typeof cap === 'number' && !isNaN(cap)) {
        metrics += formatMetric('ai_capability', cap, '...', 'gauge', { agent: agent.id });
      }
    }
  }
}
```

### Label Cardinality

**Avoid high-cardinality labels** (labels with many unique values):

```typescript
// ❌ BAD - High cardinality (one metric per month)
`simulation_event{month="120", event="breakthrough"}`

// ✅ GOOD - Low cardinality (one metric per event type)
`simulation_events_by_type{type="breakthrough"}`
```

### Metric Naming

- Use snake_case: `simulation_current_month`
- Include unit suffix: `_seconds`, `_bytes`, `_ratio`
- Be specific: `ai_capability_physical` not `ai_cap_phys`

### Performance

- **Cache expensive calculations** (e.g., averages across all agents)
- **Lazy compute** - only calculate if metric requested
- **Batch updates** - don't recalculate on every scrape if state unchanged

---

## Testing Metrics

```bash
# Check metrics endpoint
curl http://localhost:9091/metrics

# Query specific metric in Prometheus
curl 'http://localhost:9090/api/v1/query?query=simulation_current_month'

# Test in Grafana
# Explore → Prometheus → Metrics browser → simulation_*
```

---

## Next Steps

1. **Extend metrics server** (`src/metrics-server.ts`)
   - Add all metrics from this reference
   - Keep read-only principle
   - Use defensive access patterns

2. **Create Grafana dashboards**
   - 10 dashboards in `monitoring/grafana/dashboards/research-tool/`
   - Use Research Tool folder (UID: `ef4v15yhwmjggd`)
   - Follow panel layouts from this doc

3. **Test end-to-end**
   - Run simulation
   - Check metrics in Prometheus
   - View dashboards in Grafana
   - Verify real-time updates

---

## References

- **Metrics Server:** `src/metrics-server.ts`
- **GameState Type:** `src/types/game.ts`
- **Prometheus Format:** [Text Exposition Format](https://prometheus.io/docs/instrumenting/exposition_formats/)
- **Grafana Dashboards:** [Dashboard JSON Model](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/view-dashboard-json-model/)
