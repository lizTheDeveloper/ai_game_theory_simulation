# Grafana Dashboards - Research Tool

**Far-Future Aesthetic:** Elysium-inspired, high-contrast, clean design with glowing accents

**Folder:** "Research Tool" (UID: `ef4v15yhwmjggd`)
**Metrics Source:** http://localhost:9091/metrics
**Prometheus:** http://localhost:9090
**Auto-Refresh:** 5 seconds

---

## Dashboard Overview

### 1. Overview Dashboard (`01-overview.json`)
**UID:** `sim-overview-01`
**Purpose:** High-level simulation state at a glance

**Key Metrics:**
- Current Month (stat)
- Simulation Phase (alignment/transition/flourishing)
- Quality of Life (gauge: 0-1, color thresholds)
- Population (stat with sparkline)
- AI Agents Count
- Technologies Deployed
- Active Crises (alert color if >0)
- Outcome Tier (bar gauge: extinction → utopia)

**Layout:** 2x4 grid, clean spacing

---

### 2. Paradigms Dashboard (`02-paradigms.json`)
**UID:** `sim-paradigms-02`
**Purpose:** Multi-paradigm worldview dynamics

**Key Metrics:**
- Paradigm Influence Over Time (4 lines: Western Liberal, Development, Ecological, Indigenous)
- Current Paradigm Distribution (pie/donut chart)
- Transition Velocity (stat with trend)
- Paradigm Influence Bars (4 bars showing current state)

**Colors:** Distinct colors for each paradigm (blue, green, orange, purple)

---

### 3. AI Agents Dashboard (`03-ai-agents.json`)
**UID:** `sim-ai-agents-03`
**Purpose:** AI capabilities across 17 dimensions

**Key Metrics:**
- AI Capability Dimensions (bar chart: all 17 dimensions)
- Average AI Capability (gauge)
- Sandbagging Detection (table: agent | sandbagging | gaming)
- Capability Over Time (time series)

**17 Dimensions:** Physical, Digital, Cognitive, Social, Economic, Research, Governance, Education, Health, Energy, Transportation, Manufacturing, Agriculture, Communication, Military, Environmental, Space

**Aesthetic:** Clean, technical look with glowing cyan accents

---

### 4. Crises Dashboard (`04-crises.json`)
**UID:** `sim-crises-04`
**Purpose:** Active crises, cascade effects, severity tracking

**Key Metrics:**
- Active Crises Count (big stat, alert color)
- Crisis Severity by Type (bar chart: 10 crisis types)
- Cascade Depth (stat with alert threshold)
- Crisis Severity Over Time (time series)

**Crisis Types:** Climate, Nuclear, Pandemic, Economic, Social, Technological, Resource, Geopolitical, Conflict, Environmental

**Colors:** Warning colors (red #FF0040, orange #FF6B00, amber #FFB000)

---

### 5. Environment Dashboard (`05-environment.json`)
**UID:** `sim-environment-05`
**Purpose:** 9 Planetary Boundaries, climate metrics

**Key Metrics:**
- Planetary Boundaries Status (bar gauge: 9 bars with zones)
- Temperature Delta (°C from pre-industrial)
- Ocean pH Level (safe range indicator)
- Planetary Boundaries Over Time (9 lines)

**9 Boundaries:** Climate Change, Biodiversity Loss, Nitrogen Cycle, Phosphorus Cycle, Ocean Acidification, Land Use Change, Freshwater Use, Atmospheric Aerosols, Novel Entities

**Colors:** Green (safe), Yellow (warning), Red (critical)

---

### 6. Tech Tree Dashboard (`06-tech-tree.json`)
**UID:** `sim-tech-tree-06`
**Purpose:** 71 breakthrough technologies across 5 tiers

**Key Metrics:**
- Tech Tree Progress by Tier (bar gauge: TIER 0-4 completion %)
- Recently Deployed Technologies (table)
- Total Deployed vs Available (stats)

**Technology Tiers:**
- TIER 0: Crisis Response (13 techs)
- TIER 1: Stabilization (15 techs)
- TIER 2: Transformation (18 techs)
- TIER 3: Advanced (14 techs)
- TIER 4: Clarke Tech (11 techs)

**Layout:** Emphasizes tier progression visually

---

### 7. Detection Dashboard (`07-detection.json`)
**UID:** `sim-detection-07`
**Purpose:** Adversarial AI evaluation, gaming detection

**Key Metrics:**
- Adversarial Eval Scores Over Time (one line per agent)
- Gaming Detection Table (agent | gaming | alignment_fidelity)
- Capability Gap (bar chart per agent: true vs revealed)

**Aesthetic:** High-tech surveillance look with cyan glow

---

### 8. Regional Dynamics Dashboard (`08-regions.json`)
**UID:** `sim-regions-08`
**Purpose:** Regional cooperation, QoL, tech access

**Key Metrics:**
- Regional Cooperation (bar gauge: all regions)
- Regional QoL (bar gauge: all regions)
- Regional Tech Access (bar gauge: all regions)
- Regional Metrics Over Time (3 time series charts)

**Regions:** North America, South America, Europe, Africa, Middle East, South Asia, East Asia, Southeast Asia, Oceania

**Layout:** 6 panels showing current state and trends

---

### 9. Event Timeline Dashboard (`09-timeline.json`)
**UID:** `sim-timeline-09`
**Purpose:** Historical events, decision points, branching moments

**Key Metrics:**
- Total Events (big stat counter)
- Critical Decisions Count (stat)
- Branching Points Count (stat)
- Events by Type (pie chart)
- Event Rate Over Time (time series)
- Event Types Over Time (stacked area chart)
- Critical Decision Points (table)

**Event Types:** Breakthrough, Crisis, Tech, Decision, etc.

---

### 10. Real-Time Performance Dashboard (`10-realtime.json`)
**UID:** `sim-realtime-10`
**Purpose:** Live simulation state, performance metrics

**Key Metrics:**
- Simulation Speed (gauge: ticks/sec, target zones)
- Uptime (stat: seconds)
- WebSocket Connections (stat)
- Memory Usage (time series: heap MB)
- State Update Latency (time series: ms)
- Simulation Ticks Per Second (time series with thresholds)
- Average Latency (5m stat)
- Peak Memory (15m stat)

**Auto-Refresh:** 5 seconds for live monitoring

**Performance Thresholds:**
- Speed: <0.5 ticks/sec (red), 0.5-1.0 (amber), 1.0-2.0 (green), >2.0 (cyan)
- Latency: <50ms (green), 50-200ms (amber), >200ms (red)
- Memory: <512MB (green), 512-1024MB (amber), >1024MB (red)

---

## Design Philosophy

### Color Palette
- **Primary:** Pure white (#FFFFFF) on deep black (#000000)
- **Accent:** Glowing cyan/blue (#00F0FF, #0080FF)
- **Warning:** Glowing amber/orange (#FFB000, #FF6B00)
- **Critical:** Glowing red (#FF0040, #FF0000)
- **Success:** Glowing green/emerald (#00FF88, #00CC66)
- **Neutral:** Low-opacity white/gray (#FFFFFF20-40)

### Visual Language
- Dark theme, high contrast
- Glowing effects for active states
- Thin, elegant typography
- Smooth transitions (200-400ms)
- Information dense but clean
- 5-second auto-refresh for real-time feel

### Panel Types Used
- `stat` - Single value with optional sparkline
- `gauge` - Semi-circle or bar gauge
- `timeseries` - Line/area chart over time
- `bargauge` - Horizontal/vertical bars
- `piechart` - Pie or donut chart
- `table` - Data table

---

## Installation

These dashboards are automatically provisioned when Grafana starts via:

```
monitoring/grafana/provisioning/dashboards/research-tool.yaml
```

**Manual import:**
1. Open Grafana (http://localhost:5000)
2. Go to Dashboards → Import
3. Upload JSON file or paste content
4. Select "Research Tool" folder
5. Click Import

---

## Data Source

All dashboards query **Prometheus** data source (UID: `prometheus`) which scrapes metrics from:

**Metrics Server:** http://localhost:9091/metrics (5-second scrape interval)

**Metrics Reference:** `/docs/metrics/GAME_STATE_METRICS_REFERENCE.md`

---

## Usage

**View all dashboards:**
1. Open Grafana: http://localhost:5000
2. Navigate to Dashboards → Research Tool folder
3. Select any dashboard

**Best practices:**
- Start with Overview (01) for general state
- Use specialized dashboards for deep dives
- Real-Time (10) for monitoring simulation performance
- Timeline (09) for historical event analysis

---

## Troubleshooting

**No data showing:**
- Check metrics server is running: `curl http://localhost:9091/metrics`
- Check Prometheus is scraping: http://localhost:9090/targets
- Verify time range (top-right corner)

**Slow dashboards:**
- Reduce time range (use "Last 15m" instead of "Last 1h")
- Disable auto-refresh temporarily
- Check simulation performance (use Dashboard 10)

**Missing metrics:**
- Some metrics may not exist until simulation state is populated
- Check `docs/metrics/GAME_STATE_METRICS_REFERENCE.md` for metric availability

---

## Future Enhancements

**Potential additions:**
- Alert rules for critical thresholds
- Custom variables for filtering (by region, agent, etc.)
- Annotations for significant events
- Additional breakdowns (per-agent details, per-region drilldowns)
- Predictive panels (projected outcomes)

---

**Created:** 2025-11-22
**Version:** 1.0
**Grafana Version:** 9.0+
**Schema Version:** 38
