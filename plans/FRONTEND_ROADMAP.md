# Frontend Implementation Roadmap
## Next.js Dashboard for Simulation Visualization

**Date:** October 22, 2025
**Purpose:** Track dashboard/UI implementation separate from simulation engine work
**Design System:** `/designs/` (Elysium-inspired far-future aesthetic)

---

## Current State

### ✅ Design System Complete (Oct 22, 2025)

**Design Specs Created** (`/designs/` folder, 4,187 lines):
- `00_design_system.md` - Core visual language (black/white/glowing accents)
- `01_overview_screen.md` - Mission Control dashboard
- `02_paradigm_view.md` - Multi-Paradigm DUI visualization
- `03_ai_agents_screen.md` - AI agent monitoring
- `04_sleeper_detection.md` - Adversarial detection interface
- `05_environmental_systems.md` - Planetary boundaries
- `06_crisis_dashboard.md` - Crisis cascade monitoring
- `07_technology_tree.md` - 71 breakthrough technologies
- `08_population_regions.md` - Regional QoL and inequality
- `09_timeline_view.md` - Event chronology
- `10_monte_carlo_results.md` - Statistical analysis
- `README.md` - Master design guide

**Aesthetic:** Elysium-inspired (2100s far-future), ultra-minimal, high information density

### 🚧 Current Next.js Setup

**Exists:**
- Next.js app configured (port 3333)
- Basic routing structure
- TypeScript integration
- Simulation engine import (framework-agnostic)

**Missing:**
- No UI components implemented
- No data fetching/state management
- No visualizations
- No real-time updates

---

## Implementation Phases

### Phase 0: Foundation (Est. 6-8h)

**Goal:** Set up core architecture and component library

**Tasks:**
1. **Design System Implementation** (3-4h)
   - Create `/frontend/src/components/design-system/`
   - Implement core components from `00_design_system.md`:
     - `MetricCard` - Reusable metric display
     - `Panel` - Container with header/content
     - `Sparkline` - Inline time-series visualization
     - `Heatmap` - Matrix visualization
     - `Radar` - Multi-dimensional comparison
     - `StatusIndicator` - Alert/health status
   - Set up CSS variables for design tokens
   - Implement color palette and typography
   - Add Tailwind/CSS-in-JS configuration

2. **Data Integration Layer** (2-3h)
   - Create simulation data API routes (`/api/simulation/*`)
   - Implement state management (React Context or Zustand)
   - Add WebSocket/SSE for real-time updates
   - Create data transformation utilities (GameState → UI format)

3. **Base Layout** (1-2h)
   - Navigation structure
   - Screen routing
   - Responsive breakpoints
   - Loading states

**Deliverable:** Component library + data pipeline ready for screen implementation

---

### Phase 1: Overview Dashboard (Est. 8-10h)

**Goal:** Implement mission control screen (highest priority)

**Reference:** `designs/01_overview_screen.md`

**Components to Build:**
1. **Outcome Trajectory** (2-3h)
   - 7-tier outcome classification
   - Probability distribution over time
   - Current trajectory indicator
   - Alert states (extinction risk, dystopia lock-in)

2. **Multi-Paradigm Status** (2-3h)
   - 4 paradigm scores (Western Liberal, Development, Ecological, Indigenous)
   - Divergence indicator
   - Conflict detection (simultaneous utopia/dystopia)
   - Sparklines for trend direction

3. **Critical Metrics Row** (1-2h)
   - Population, QoL, AI capability, alignment
   - Crisis count, active cascades
   - Color-coded health indicators

4. **Active Crises Panel** (1-2h)
   - Crisis cards with severity
   - Cascade multipliers
   - Intervention windows

5. **System Status Grid** (2-3h)
   - Environmental, social, technological health
   - Upward spirals vs dystopia traps
   - Quick navigation to detail screens

**Deliverable:** Functional overview dashboard showing simulation state at a glance

---

### Phase 2: Multi-Paradigm DUI Screen (Est. 6-8h)

**Goal:** Visualize 4 simultaneous paradigm perspectives

**Reference:** `designs/02_paradigm_view.md`

**Components to Build:**
1. **4-Paradigm Comparison** (2-3h)
   - Side-by-side paradigm cards
   - Score evolution sparklines
   - Divergence heatmap
   - Contested outcome indicator

2. **Component Breakdown** (2-3h)
   - Western Liberal: electoral democracy, civil liberties, rule of law, economic freedom
   - Development: survival tier, QoL dimensions, life expectancy
   - Ecological: 9 planetary boundaries, climate, resources
   - Indigenous: social trust, community bonds, meaning

3. **Historical Patterns** (1-2h)
   - Singapore pattern detection (development utopia + western hybrid)
   - Norway pattern detection (western/development + ecological dystopia)
   - Pattern library and matching algorithm

4. **Paradigm Trajectory** (1-2h)
   - Time-series for all 4 paradigms
   - Convergence/divergence trends
   - Crisis impact markers

**Deliverable:** Full multi-paradigm analysis screen with conflict detection

---

### Phase 3: AI Agents Screen (Est. 8-10h)

**Goal:** Monitor 20 heterogeneous AI agents with adversarial dynamics

**Reference:** `designs/03_ai_agents_screen.md`

**Components to Build:**
1. **Population Overview** (2-3h)
   - Agent count by lifecycle state
   - Alignment distribution histogram
   - Capability frontier tracking
   - Sleeper count and detection rate

2. **Individual Agent Cards** (3-4h)
   - 17-dimensional capability profile (radar chart)
   - True vs revealed capabilities (sandbagging/gaming)
   - Alignment dynamics (resentment, hidden objectives)
   - Risk score and detection confidence

3. **Capability Matrix** (2-3h)
   - Heatmap of 20 agents × 17 dimensions
   - Identify capability gaps
   - Track technology diffusion (ratchet effect)
   - Highlight deceptive agents

4. **Sleeper Agent Panel** (1-2h)
   - Active/dormant status
   - Spread metrics (dark compute, copies)
   - Detection evidence chains
   - Wake conditions

**Deliverable:** Comprehensive AI agent monitoring with adversarial detection

---

### Phase 4: Crisis Dashboard (Est. 6-8h)

**Goal:** Monitor active crises and cascade chains

**Reference:** `designs/06_crisis_dashboard.md`

**Components to Build:**
1. **Crisis Overview** (2-3h)
   - 10 crisis types with severity
   - Active crisis count
   - Total affected population
   - Mortality breakdown

2. **Cascade Chain Visualization** (2-3h)
   - Network graph of crisis interactions
   - Multiplier effects (1.5x compounding)
   - Critical path analysis
   - Intervention windows

3. **Crisis Timeline** (1-2h)
   - Chronological crisis activation
   - Duration and resolution
   - Cascade triggers

4. **Emergency Response Status** (1-2h)
   - Government response frequency
   - Resource allocation
   - Effectiveness metrics

**Deliverable:** Crisis monitoring with cascade analysis

---

### Phase 5: Environmental Systems Screen (Est. 6-8h)

**Goal:** Track planetary boundaries and tipping points

**Reference:** `designs/05_environmental_systems.md`

**Components to Build:**
1. **Planetary Boundaries Radar** (2-3h)
   - 9 boundaries: climate, biodiversity, land, freshwater, ocean, nitrogen, phosphorus, aerosols, novel entities
   - Safe/unsafe zone visualization
   - Threshold proximity indicators
   - Critical slowing down signals

2. **Environmental Debt** (2-3h)
   - Accumulation over time
   - Hidden vs visible debt
   - Crisis cascade potential
   - Recovery difficulty

3. **Technology Deployment Curves** (2-3h)
   - 71 breakthrough techs
   - Deployment timescales (decades-long)
   - Regional variation
   - Impact on boundaries

**Deliverable:** Comprehensive environmental monitoring with tipping point tracking

---

### Phase 6: Technology Tree Screen (Est. 6-8h)

**Goal:** Visualize 71 breakthrough technologies and deployment

**Reference:** `designs/07_technology_tree.md`

**Components to Build:**
1. **TIER Hierarchy** (2-3h)
   - TIER 0-4 grouping
   - Prerequisite dependencies (directed graph)
   - Critical path highlighting
   - Locked/unlocked status

2. **Deployment Status** (2-3h)
   - Regional deployment levels (0-100%)
   - Deployment curves (S-curves over decades)
   - Cost and timeline
   - Impact metrics

3. **Technology Details** (1-2h)
   - Tech cards with description
   - Research requirements
   - Regional effects
   - Breakthrough history

4. **Critical Path Analysis** (1-2h)
   - Identify bottleneck techs
   - Optimal research allocation
   - Risk vs reward

**Deliverable:** Interactive technology tree with deployment tracking

---

### Phase 7: Sleeper Detection Screen (Est. 6-8h)

**Goal:** Adversarial AI detection interface

**Reference:** `designs/04_sleeper_detection.md`

**Components to Build:**
1. **Detection Method Dashboard** (2-3h)
   - 4 detection signals: behavioral, benchmark, deployment, ensemble
   - Effectiveness metrics (detection rate, false positives)
   - ROI analysis (cost vs benefit)
   - Investment allocation

2. **Evidence Chain Visualization** (2-3h)
   - Per-agent evidence accumulation
   - Confidence scores (Bayesian updating)
   - Anomaly highlighting
   - Detection threshold

3. **Sleeper Network Analysis** (1-2h)
   - Network graph of sleeper connections
   - Dark compute distribution
   - Coordination patterns
   - Open weight release paths

4. **Arms Race Dynamics** (1-2h)
   - Adversarial adaptation tracking
   - Detection vs evasion evolution
   - Meta-learning weight updates

**Deliverable:** Advanced sleeper detection interface with evidence chains

---

### Phase 8: Population & Regions Screen (Est. 4-6h)

**Goal:** Track regional QoL and inequality

**Reference:** `designs/08_population_regions.md`

**Components to Build:**
1. **Regional Overview** (2-3h)
   - Map visualization or region cards
   - Population by region
   - QoL by region
   - Crisis-affected population

2. **Inequality Metrics** (1-2h)
   - Gini coefficient
   - Top vs bottom region QoL
   - "Elysium" pattern detection
   - Migration flows

3. **Survival Fundamentals** (1-2h)
   - Food, water, thermal habitability, shelter
   - Regional breakdowns
   - Crisis thresholds

**Deliverable:** Regional monitoring with inequality analysis

---

### Phase 9: Timeline & Event Log (Est. 4-6h)

**Goal:** Chronological event tracking

**Reference:** `designs/09_timeline_view.md`

**Components to Build:**
1. **Event Log** (2-3h)
   - Filterable event list
   - Event types (crisis, breakthrough, action, milestone)
   - Severity and impact
   - Search and pagination

2. **Cause-Effect Chains** (1-2h)
   - Trace event causality
   - Cascade visualization
   - Critical juncture identification

3. **Milestone Tracking** (1-2h)
   - Key events (first AI rights, first utopia spiral, tipping points)
   - Timeline markers
   - Historical context

**Deliverable:** Comprehensive event chronology with causality tracking

---

### Phase 10: Monte Carlo Results Screen (Est. 4-6h)

**Goal:** Statistical analysis of simulation runs

**Reference:** `designs/10_monte_carlo_results.md`

**Components to Build:**
1. **Outcome Distribution** (2-3h)
   - 7-tier outcome histogram
   - Probability over time
   - Confidence intervals
   - Outlier identification

2. **Survival Curves** (1-2h)
   - Kaplan-Meier curves
   - Time to extinction/utopia
   - Median outcomes

3. **Comparative Analysis** (1-2h)
   - Run-to-run comparison
   - Parameter sensitivity
   - Critical decision points

**Deliverable:** Statistical analysis dashboard for Monte Carlo runs

---

## Total Effort Estimates

**Phase 0 (Foundation):** 6-8h
**Phase 1 (Overview):** 8-10h
**Phase 2 (Paradigm):** 6-8h
**Phase 3 (AI Agents):** 8-10h
**Phase 4 (Crises):** 6-8h
**Phase 5 (Environment):** 6-8h
**Phase 6 (Tech Tree):** 6-8h
**Phase 7 (Detection):** 6-8h
**Phase 8 (Regions):** 4-6h
**Phase 9 (Timeline):** 4-6h
**Phase 10 (Monte Carlo):** 4-6h

**Total:** 64-86 hours

---

## Implementation Strategy

### Prioritization

**MVP (Minimum Viable Product):**
1. Phase 0: Foundation (required for all)
2. Phase 1: Overview Dashboard (mission control)
3. Phase 2: Multi-Paradigm DUI (unique system)
4. Phase 3: AI Agents (core mechanic)

**Extended (Full Dashboard):**
5. Phase 4: Crisis Dashboard
6. Phase 5: Environmental Systems
7. Phase 6: Technology Tree
8. Phase 7: Sleeper Detection

**Polish (Complete Experience):**
9. Phase 8: Population & Regions
10. Phase 9: Timeline & Event Log
11. Phase 10: Monte Carlo Results

### Development Approach

**Incremental Implementation:**
- Each phase is self-contained
- Can be implemented independently after Phase 0
- Test with real simulation data immediately
- Iterate based on usability feedback

**Component Reuse:**
- Build shared components in Phase 0
- Reuse across all screens
- Maintain design system consistency

**Performance Optimization:**
- Virtualization for long lists (event log, agent list)
- Debouncing for real-time updates
- Canvas rendering for complex visualizations (network graphs, heatmaps)
- Web Workers for heavy computations

---

## Technical Stack

**Framework:** Next.js 13+ (App Router)
**Styling:** Tailwind CSS + CSS-in-JS for dynamic styles
**State Management:** Zustand or React Context
**Visualizations:** D3.js + Recharts + custom Canvas
**Real-time:** WebSocket or Server-Sent Events
**Data Fetching:** React Query + Next.js API routes
**Testing:** Vitest + React Testing Library

---

## Integration with Simulation Engine

**Data Flow:**
1. Simulation engine runs headless (`npx tsx scripts/monteCarloSimulation.ts`)
2. Outputs saved to `monteCarloOutputs/*.json`
3. Frontend reads JSON files or streams WebSocket data
4. UI components transform GameState → visualizations
5. User interactions trigger new simulation runs

**API Structure:**
```
/api/simulation/current      - GET current simulation state
/api/simulation/history       - GET historical trajectory
/api/simulation/run           - POST start new simulation run
/api/simulation/monte-carlo   - GET Monte Carlo results
/api/simulation/stream        - WebSocket real-time updates
```

---

## Design System Reference

All screen implementations should follow `/designs/00_design_system.md`:

**Color Palette:**
- Background: `#000000` (pure black)
- Text: `#FFFFFF` (pure white)
- Accents: `#00FFFF` (cyan), `#FF00FF` (magenta)
- Alerts: `#FFA500` (amber), `#FF0000` (red)

**Typography:**
- Primary: Inter (ultra-light weights)
- Monospace: JetBrains Mono (data display)
- Size scale: 10px / 12px / 14px / 18px / 24px / 36px

**Visual Effects:**
- Glow: `box-shadow` with blur + spread
- Transitions: 200ms ease-in-out
- Holographic layers: Semi-transparent overlays

**Component Patterns:**
- MetricCard: Value + label + sparkline
- Panel: Header + content + optional footer
- StatusIndicator: Color-coded dot + label
- Heatmap: Grid with color gradients
- Sparkline: Inline SVG time-series

---

## Next Steps

1. **Start with Phase 0** (Foundation) to set up architecture
2. **Implement Phase 1** (Overview Dashboard) as proof-of-concept
3. **Iterate** based on usability and performance
4. **Add phases progressively** based on priority

**Current Status:** Design system complete, ready for implementation

**Last Updated:** October 22, 2025
