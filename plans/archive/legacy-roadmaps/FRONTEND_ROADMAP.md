# Frontend Implementation Roadmap (REVISED - October 26, 2025)
## Next.js Dashboard for Simulation Visualization

**Date:** October 26, 2025 (Updated after Architecture Review)
**Purpose:** Full dashboard implementation (Option A) with multi-agent parallelization
**Design System:** `/designs/` (Elysium-inspired far-future aesthetic)
**Architecture Review:** `reviews/dashboard_architecture_20251022.md` (7 CRITICAL issues addressed)

**🗺️ Return to Master Roadmap:** `/plans/MASTER_IMPLEMENTATION_ROADMAP.md`

---

## 🎮 God Mode UI System

**Comprehensive manual control interface for all simulation decisions**

**Status:** Planning Phase (Created Oct 27, 2025)
**Master Plan:** `/plans/god-mode-ui-master-plan.md`
**Supporting Plans:**
- `/plans/god-mode-ui-architecture.md` - Technical architecture
- `/plans/god-mode-decision-inventory.md` - Complete list of all automated decisions
- `/plans/god-mode-implementation-phases.md` - Phased implementation strategy

**Overview:**
Create a comprehensive "God Mode" UI that exposes ALL automated simulation decisions as manual controls, allowing the user to:
- Override government policy decisions
- Control individual AI agent actions
- Set society priorities and responses
- Adjust organizational strategies
- Intervene in any phase's automated logic
- See what each actor is prioritizing
- Make real-time decisions during simulation

**Integration with Dashboard:**
God Mode UI will be accessible from the main dashboard with per-phase control panels. Implementation will follow dashboard foundation (Phase 0) completion.

---

## 📊 Dashboard Visualization System

---

## Executive Summary

**Original Timeline:** 12+ weeks sequential
**Revised Timeline:** 3-4 weeks with multi-agent parallelization
**Approach:** Break into independent subplans for overnight agent work
**Status:** ✅ Research complete, ✅ Design spec complete, ✅ Architecture reviewed

### 🎉 Implementation Status (Updated Oct 26, 2025)

**Server Running:** http://localhost:3333 (Next.js dev server)
**Dashboard Components:** 10 dashboards implemented (~4,700 lines)
**Architecture:** Web Worker-based simulation engine with real-time updates

**✅ COMPLETED DASHBOARDS:**

1. **Overview Dashboard** (`/dashboard`) - ✅ COMPLETE + ENHANCED (Oct 26)
   - Global metrics (Population, QoL, AI Capability, Alignment)
   - Multi-Paradigm DUI indicators (4 paradigms)
   - **✨ NEW: Clickable paradigm cards with drill-down** (Phase 1A complete)
   - **✨ NEW: Integrated ParadigmDetailPanel component**
   - System health summary
   - Environmental systems status
   - Phase 1 requirements met

2. **Paradigms Dashboard** (`/paradigms`) - ✅ COMPLETE + ENHANCED (Oct 26)
   - Multi-Paradigm DUI with all 4 perspectives
   - Average score, divergence tracking, paradigm conflicts
   - Western Liberal, Development, Ecological, Indigenous indicators
   - Historical pattern detection
   - **✨ NEW: Clickable paradigm cards with drill-down** (Phase 1A complete)
   - **✨ NEW: ParadigmDetailPanel with indicator breakdowns**
   - **✨ NEW: 12-month sparkline history tracking in Web Worker**

3. **AI Agents Dashboard** (`/ai-agents`) - ✅ COMPLETE
   - 20 heterogeneous agents displayed (NOT just first agent!)
   - Lifecycle flow visualization (bimodal branching)
   - Alignment distribution (Aligned/Uncertain/Misaligned)
   - Evaluation strategies (Honest/Gaming/Sandbagging)
   - 20×7 capability matrix heatmap (Physical, Digital, Cognitive, Social, Economic, Self-Improve)
   - True vs revealed capabilities with threat color coding
   - Phase 2 requirements met

4. **Crises Dashboard** (`/crises`) - ✅ COMPLETE
   - Active crisis tracking (1 active: Biodiversity Loss breached)
   - Resource crises (Phosphorus, Freshwater)
   - Environmental crises (Ocean Acidification, Chemical Pollution)
   - Planetary boundary crises (Climate Change, Biodiversity)
   - Emergency response capacity metrics
   - Phase 6 (Crisis) requirements met

5. **Environment Dashboard** (`/environment`) - ✅ COMPLETE
   - Planetary boundary status (7 crossed)
   - Environmental debt tracking (30%)
   - Core indicators (Climate, Biodiversity, Resources, Pollution)
   - Resource crisis indicators (Phosphorus, Freshwater, Ocean, Novel Entities)
   - Cascade risk analysis (11.4x multiplier)
   - Phase 3 requirements met

6. **Tech Tree Dashboard** (`/tech-tree`) - ✅ COMPLETE
   - Deployed technologies summary (11 TIER 0 technologies)
   - Active research tracking
   - Tech risk level monitoring
   - Per-technology deployment percentages
   - Technologies: RLHF (95%), Mech Interp (15%), Adversarial Eval (40%), DAC (2%), etc.
   - Phase 5 requirements met

7. **Detection Dashboard** (`/detection`) - ✅ COMPLETE
   - AI alignment tracking (20 agents, 85% aligned)
   - Sleeper agent detection (0 active sleepers, 0.0% rate)
   - Alignment breakdown (17 aligned, 3 misaligned, 0 sleepers)
   - Government detection capacity (AI Regulation 50%, Oversight 0%)
   - Detection challenges explanation (Sandbagging, Gaming, Dormant Sleepers)
   - Phase 6 (Detection) requirements met

8. **Regions Dashboard** (`/regions`) - ⚠️ PARTIAL + ✨ ENHANCED (Oct 26, 2025)
   - Global population metrics (8.00B)
   - Quality of life (65%), Social cohesion (57%), Institutional trust (65%)
   - Global status indicators
   - **✨ NEW: 17-dimensional QoL drill-down panel** (Oct 26, 2025)
     - Clickable QoL card opens slide-in detail panel
     - 6 tiers: Survival Fundamentals, Basic Needs, Psychological, Social, Health, Environmental
     - 17 individual indicators with progress bars + 12-month sparklines
     - Tier 6: Distribution tracking with Elysium pattern detection
     - Alert when elite thrives while masses suffer (Gini > 0.45)
     - Alert when >30% of population in crisis zones
   - **NOTE:** Regional data initializing - regional breakdown not yet displayed
   - Phase 4 partial implementation

9. **Timeline Dashboard** (`/timeline`) - ✅ COMPLETE
   - Event log with 22 events loaded
   - Event filters (All, tech, social, environment, crisis)
   - Severity levels (CRITICAL, HIGH, MEDIUM)
   - Event categories with tags
   - IndexedDB event database integration working
   - Key milestones tracking
   - Timeline interpretation guide
   - Phase 8 requirements met

10. **Real-Time Dashboard** (`/realtime`) - ✅ COMPLETE
    - Live multi-paradigm DUI monitoring (4 paradigms at 50%)
    - Paradigm divergence tracking (0.0% aligned)
    - Economic systems (GDP, Employment, Inequality, Inflation)
    - Core systems (QoL, Population)
    - Government & Policy (Trust, Regulation, Active Policies)
    - AI Ecosystem (Agents, Capability, Alignment)
    - Planetary Systems (Boundaries, Climate, Resources, Biodiversity, Pollution)
    - Social Fabric (Cohesion, Trust, Meaning)
    - Technology (Deployed techs, Tech risk)
    - Outcome Trajectories (Dystopia/Utopia risk)
    - Active Crises panel
    - Event Stream
    - FPS counter (0 FPS when paused)
    - Real-time updates from Web Worker

**🚧 NOT YET IMPLEMENTED:**

- **Welfare & Economics Dashboard** (Phase 7) - No separate route seen
- **Phase 4 Regional Data** - Regions dashboard shows "Regional population data is initializing"
- **God Mode UI** - Planning phase only (created Oct 27, 2025)

**📊 IMPLEMENTATION SUMMARY:**

- **Phases Completed:** Phase 0, 1 (including 1A drill-down), 2, 3, 5, 6, 8 (7 of 9 phases)
- **Phases Partial:** Phase 4 (Regions - basic version exists)
- **Phases Not Started:** Phase 7 (Welfare & Economics), Phase -1 (API infrastructure - using direct worker communication instead)
- **Lines of Code:** ~4,700 lines across 10 dashboard components + ParadigmDetailPanel (~550 lines)
- **Architecture:** Successfully using Web Worker + `useSimulationWorker` hook for real-time updates
- **Recent Additions (Oct 26):**
  - ✅ ParadigmDetailPanel component with glass morphism & slide-in animation
  - ✅ 12-month rolling history buffer in Web Worker for sparkline trends
  - ✅ Complete data flow verification (calculation → state → worker → UI)
  - ✅ Indicator breakdowns for all 4 paradigms (3-9 indicators each)
  - ✅ **QoL 17-dimensional drill-down panel** with clickable card on Regions Dashboard
    - 6 tiers (Survival, Basic, Psychological, Social, Health, Environmental, Distribution)
    - Progress bars + 12-month sparklines for tier averages
    - Elysium pattern detection (elite utopia + mass suffering)
    - 430+ lines in `QoLDetailPanel.tsx` component
  - ✅ **Threshold Uncertainty UI** (Phase 4 Integration) - Configuration interface:
    - Epistemic scenario selector (doom/cautious/baseline/progressive/utopia)
    - Individual threshold sliders for 9 Tier 1+2 parameters (0.0-1.0 quantile sampling)
    - Live value preview with computed threshold values
    - Priority system: Custom sliders > Scenario defaults > Random sampling
    - Collapsible panel with reset functionality
    - Wired through entire stack (Navigation → Worker Context → Worker Client → Worker → Initialization)

**🎯 NEXT PRIORITIES:**

1. **Phase 4: Regional Data Population** (15 countries, 30 governments)
   - Currently shows "Regional population data is initializing"
   - Need to implement actual country-level tracking
   - Estimated effort: 1-2 weeks (parallelizable across 4 agents)

2. **Phase 7: Welfare & Economics Dashboard** (if needed as separate dashboard)
   - AI welfare tracking (5 dimensions)
   - UBI & social safety nets
   - Economic systems monitoring
   - Estimated effort: 1 week (parallelizable across 3 agents)

3. **God Mode UI Implementation** (planning complete)
   - See `/plans/god-mode-ui-master-plan.md`
   - Comprehensive manual control interface
   - Expose all automated simulation decisions
   - Estimated effort: 4-6 weeks (complex feature)

**📋 Future Enhancements (User-Requested - Oct 29, 2025):**

**UI/UX Improvements (Agent: far-future-ux-designer):**

4. **Extend HelpButton to all dashboards** 
   - Add contextual help to Environmental, AI Agents, Crisis, Timeline, Tech Tree, Detection dashboards
   - Create dashboard-specific help content for each
   - Consistent positioning and interaction patterns
   - Currently only implemented on ParadigmDashboard

5. **Add metric tooltips for inline explanations** 
   - Hover tooltips on metric cards showing detailed explanations
   - Color-coded badges for thresholds (critical/warning/normal)
   - Citation links to research sources where applicable
   - Improves dashboard comprehension without cluttering UI

6. **Create paradigm comparison mode** 
   - Side-by-side view of all 4 paradigms (Western Liberal, Development, Ecological, Indigenous)
   - Synchronized scrolling for indicator comparisons
   - Highlight divergences (utopia in one, dystopia in another)
   - Visual diff mode showing where paradigms agree/disagree
   - Complexity: 2 systems (UI state management, multi-paradigm coordination)

**Simulation Enhancements (Agent: simulation-maintainer):**

7. **Add per-country paradigm scoring in simulation worker** 
   - Calculate Western Liberal index per country (democracy, civil liberties, rule of law, economic freedom)
   - Calculate Development index per country (QoL, healthcare, infrastructure, economic stage)
   - Calculate Ecological index per country (emissions, resource use, planetary boundary contributions)
   - Calculate Indigenous index per country (social cohesion, meaning, community bonds)
   - Add to StateDelta as `regionalParadigmScores` field
   - Enables accurate regional breakdown in ParadigmDetailPanel (currently shows placeholder aggregation)
   - Complexity: 5 systems (country state, 4 paradigm calculation modules, delta aggregation)

**Research + Implementation (Agents: super-alignment-researcher + simulation-maintainer):**

8. **Add paradigm trajectory predictions based on current trends** 
   - **Research phase :** Find peer-reviewed models for forecasting societal trajectories
   - **Research phase :** Identify leading indicators for paradigm shifts (tipping points, phase transitions)
   - **Implementation :** Add 6-month trajectory forecasting to each paradigm
   - **Implementation :** Show confidence intervals based on historical volatility
   - **Implementation :** Alert when paradigms are on collision course (e.g., Development→utopia while Ecological→dystopia)
   - Requires Monte Carlo validation (N≥10 runs)
   - Complexity: 6 systems (research literature, statistical modeling, 4 paradigm forecasters, alert system)

---

### Critical Architecture Changes (vs Original Plan)

**🔴 7 CRITICAL ISSUES ADDRESSED:**
1. **Memory exhaustion:** Server-side aggregation API (not full GameState in browser)
2. **State propagation:** Atomic stores with Jotai + React Query (not single Zustand)
3. **Chart library:** Visx + Chart.js + WebGL (not just Recharts)
4. **Timeline:** Multi-agent parallelization (not sequential 12 weeks)
5. **Mobile:** Separate design (not responsive-only)
6. **Real-time:** Static snapshots for MVP (WebSockets deferred)
7. **Lazy loading:** Proper code splitting with React Server Components

### User Requirements Captured

✅ **Paradigm drill-down:** Click paradigm score → side panel with indicators + sparklines
✅ **Regional variation:** Show 15 countries, 30 governments (not just global average)
✅ **AI agent distribution:** Show all 20 agents (not just first agent!)
✅ **Appropriate visualizations:** Charts vs numbers based on research

---

## Phase -1: Server-Side Aggregation API (NEW - CRITICAL)

**Duration:** 1 week (parallelizable across 4 agents)
**Why Required:** Prevent browser memory exhaustion (1.44M data points)
**Blocks:** All other phases depend on this

### Subplan -1A: API Infrastructure (Agent 1)
**File:** `plans/dashboard/api-infrastructure.md`
**Tasks:**
- Create `/api/dashboard/` route structure
- Implement authentication/CORS
- Set up caching layer (Redis or in-memory)
- Error handling and logging
- Performance monitoring

### Subplan -1B: Aggregation Utilities (Agent 2)
**File:** `plans/dashboard/aggregation-utilities.md`
**Tasks:**
- Create aggregation functions for GameState
- Time-windowing utilities (12-month, 24-month, all-time)
- Regional aggregation (15 countries → summaries)
- Agent distribution summaries (20 agents → violin plot data)
- Planetary boundary rollups

### Subplan -1C: Overview API Endpoints (Agent 3)
**File:** `plans/dashboard/overview-api.md`
**Tasks:**
- `GET /api/dashboard/overview` - Mission control data
- `GET /api/dashboard/paradigms` - 4 paradigms + indicators
- `GET /api/dashboard/critical-metrics` - Population, QoL, AI, crises
- Response schemas with TypeScript types
- Pagination for time series

### Subplan -1D: Domain API Endpoints (Agent 4)
**File:** `plans/dashboard/domain-api.md`
**Tasks:**
- `GET /api/dashboard/agents` - AI agent data
- `GET /api/dashboard/environment` - Planetary boundaries
  - **NEW (Oct 22, 2025): Include regional biome data**
  - Response schema:
    ```typescript
    {
      boundaries: PlanetaryBoundary[];  // 9 boundaries
      landUse: {
        global: {
          habitatCover: number;
          extinctionRate: number;
          ecosystemsLost: number;
        };
        regions: {
          tropical: RegionalBiomeStats;
          temperate: RegionalBiomeStats;
          grasslands: RegionalBiomeStats;
          borealArctic: RegionalBiomeStats;
        };
      };
    }

    interface RegionalBiomeStats {
      habitatCoverPercent: number;
      habitatCoverSafe: number;
      extinctionRate: number;
      ecosystemsLost: number;
      ecosystemCollapseRisk: number;
      biodiversityWeight: number;
      restorationDifficulty: number;
    }
    ```
- `GET /api/dashboard/government` - 30 countries
- `GET /api/dashboard/crises` - Crisis cascade data
- `GET /api/dashboard/technology` - Tech tree

**Deliverable:** Performant API layer serving pre-aggregated data

---

## Phase 0: Foundation (REVISED)

**Duration:** 1 week (parallelizable across 6 agents)
**Dependencies:** Phase -1 complete

### Subplan 0A: Design System Core (Agent 1)
**File:** `plans/dashboard/design-system-core.md`
**Tasks:**
- CSS variables for design tokens
- Color palette (black/white/cyan/red/amber)
- Typography system (Inter ultra-light + JetBrains Mono)
- Spacing scale
- Animation utilities
- Glow effects

### Subplan 0B: Base Components (Agent 2)
**File:** `plans/dashboard/base-components.md`
**Tasks:**
- `MetricCard` - Number + label + trend + sparkline
- `Panel` - Container with glow + header
- `StatusIndicator` - Color-coded dots
- `Button`, `Badge`, `Tooltip`
- `LoadingSpinner`, `ErrorBoundary`

### Subplan 0C: State Management Setup (Agent 3)
**File:** `plans/dashboard/state-management.md`
**Tasks:**
- Install Jotai + React Query
- Create atomic stores (NOT single Zustand store)
- `useOverviewData`, `useParadigmData`, `useAgentData` hooks
- Cache configuration (5 min stale time)
- Optimistic updates
- Error retry logic

### Subplan 0D: Chart Infrastructure (Agent 4)
**File:** `plans/dashboard/chart-infrastructure.md`
**Tasks:**
- Install Visx (complex charts) + Chart.js (simple) + D3 utilities
- Create `<ViolinPlot>` wrapper for AI agent distributions
- Create `<SmallMultiples>` for regional comparisons
- Create `<BarChart>` for planetary boundaries
- Create `<LineChart>` for time series
- Responsive sizing utilities

### Subplan 0E: Layout & Navigation (Agent 5)
**File:** `plans/dashboard/layout-navigation.md`
**Tasks:**
- App layout with sidebar
- Navigation menu (9 dashboard categories)
- Route structure
- Loading states per page
- Breadcrumbs

### Subplan 0F: Data Transformation Layer (Agent 6)
**File:** `plans/dashboard/data-transformation.md`
**Tasks:**
- API response → UI format transformers
- Time series formatters
- Number formatting (2.5B, 67.3%)
- Color scale generators
- Threshold calculators

**Deliverable:** Complete foundation for dashboard components

---

## Phase 1: Mission Control (Overview Dashboard)

**Duration:** 1 week (parallelizable across 5 agents)
**Dependencies:** Phase 0 complete
**Priority:** HIGHEST (user's most critical screen)

### Subplan 1A: Paradigm Cards with Drill-Down (Agent 1) ✅ COMPLETE (Oct 26, 2025)
**File:** `plans/dashboard/paradigm-drilldown.md`
**USER REQUESTED FEATURE**

**✅ COMPLETED IMPLEMENTATION:**
- ✅ 4 paradigm score cards (Western Liberal, Development, Ecological, Indigenous)
- ✅ Click interaction → side panel slides out from right
- ✅ Side panel shows 3-9 indicators per paradigm:
  - Western Liberal: 4 indicators (democracy, civil liberties, rule of law, econ freedom)
  - Development: 3 indicators (life expectancy, survival tier coverage, QoL)
  - Ecological: 9 indicators (9 planetary boundaries)
  - Indigenous: 3 indicators (social trust, community bonds, meaning)
- ✅ Each indicator: progress bar + 12-month trend sparkline + current value
- ✅ 12-month rolling history buffer implemented in Web Worker
- ✅ Smooth 300ms slide animation with glass morphism
- ✅ Close on click-outside or ESC key
- ✅ Integrated into both OverviewDashboard and ParadigmDashboard
- ✅ Complete data flow verification script created

**Files Created:**
- `src/components/paradigms/ParadigmDetailPanel.tsx` (~550 lines)
- `scripts/testParadigmWiring.ts` (verification script)

**Files Modified:**
- `src/workers/simulationWorker.ts` (added MetricHistory interface + history buffer)
- `src/lib/simulationWorkerClient.ts` (added history to StateDelta)
- `src/components/dashboards/OverviewDashboard.tsx` (integrated drill-down)
- `src/components/dashboards/ParadigmDashboard.tsx` (integrated drill-down)

**Deferred for Phase 4:**
- Regional breakdown (15 countries) for each indicator - requires Phase 4 regional data population

### Subplan 1B: Critical Metrics Row (Agent 2)
**File:** `plans/dashboard/critical-metrics.md`
**Tasks:**
- Global Population card (with trend, alert if <2B)
- Quality of Life card (NOT just single number - show tier distribution)
- AI Capability card (show distribution of 20 agents, NOT just first!)
- Alignment Score card (show distribution, NOT just first!)
- Color-coded status (normal/warning/critical)
- Sparklines for trends

### Subplan 1C: AI Agent Distribution (Agent 3)
**File:** `plans/dashboard/agent-distribution.md`
**FIXES CRITICAL BUG: Current dashboard shows only 1st agent**

**Tasks:**
- Violin plot for 20 agents' capabilities
- Violin plot for 20 agents' alignment scores
- Bimodal distribution detection
- Mean + median + quartiles
- Highlight outliers (deeply misaligned, sleepers)
- Click agent → drill-down to individual agent card

### Subplan 1D: Active Crises Panel (Agent 4)
**File:** `plans/dashboard/active-crises.md`
**Tasks:**
- Crisis cards (10 types: phosphorus, freshwater, ocean, nuclear, etc.)
- Severity indicators (critical/high/medium/low)
- Cascade multipliers (1.5x compounding)
- Affected population
- Intervention window countdown
- Click crisis → navigate to Crisis Dashboard

### Subplan 1E: System Health Grid (Agent 5)
**File:** `plans/dashboard/system-health.md`
**Tasks:**
- 9-module grid (≤9 per tier, research-validated)
- Categories: Environmental, Social, Technological, Governmental, Economic, Nuclear, Detection, Welfare, Crises
- Color-coded health (green/amber/red)
- Quick stats per category
- Click category → navigate to detail dashboard

**Deliverable:** Functional mission control with paradigm drill-down

---

## Phase 2: AI Agents Dashboard

**Duration:** 1 week (parallelizable across 4 agents)
**Dependencies:** Phase 1 complete

### Subplan 2A: Agent Population Overview (Agent 1)
**File:** `plans/dashboard/agent-population.md`
**Tasks:**
- Agent count by lifecycle (training/testing/deployed/retired)
- Alignment distribution histogram (show heterogeneity!)
- Capability frontier tracking
- Sleeper count and detection rate
- Risk distribution

### Subplan 2B: Individual Agent Cards (Agent 2)
**File:** `plans/dashboard/individual-agents.md`
**Tasks:**
- 20 agent cards (NOT just first agent!)
- 17-dimensional capability profile (heatmap or parallel coordinates, NOT radial)
- True vs revealed capabilities (sandbagging detection)
- Alignment + resentment + risk score
- Lifecycle state + organization
- Click → detailed agent view

### Subplan 2C: Capability Matrix Heatmap (Agent 3)
**File:** `plans/dashboard/capability-matrix.md`
**Tasks:**
- 20 agents (rows) × 17 dimensions (cols) heatmap
- Color gradient for capability levels
- Identify gaps and strengths
- Technology diffusion ratchet effect
- Highlight deceptive agents (sandbagging/gaming)

### Subplan 2D: Sleeper Agent Analysis (Agent 4)
**File:** `plans/dashboard/sleeper-analysis.md`
**Tasks:**
- Active/dormant sleeper status
- Spread metrics (dark compute, open weights)
- Detection evidence chains
- Wake conditions
- Network graph of sleeper connections

**Deliverable:** Comprehensive AI agent monitoring

---

## Phase 3: Environmental Systems Dashboard

**Duration:** 1 week (parallelizable across 4 agents)
**Dependencies:** Phase 1 complete (not dependent on Phase 2)

### Subplan 3A: Planetary Boundaries Bars (Agent 1)
**File:** `plans/dashboard/planetary-boundaries.md`
**Tasks:**
- 9 horizontal bar charts (NOT radial chart - perception issues)
- Safe zone (green), increasing risk (amber), high risk (red)
- Current value + threshold
- Trend arrows (improving/worsening)
- Click boundary → detail view with regional breakdown
- **NEW (Oct 22, 2025): Regional biome breakdown for Land Use/Biosphere**
  - Show 4 regional biomes: Tropical, Temperate, Grasslands, Boreal/Arctic
  - Per-region metrics:
    - Habitat cover % (with safe threshold)
    - Extinction rate (×natural baseline)
    - Ecosystem collapse risk (%)
    - Ecosystems lost (count)
  - Visual encoding:
    - Small multiples: 4 mini bar charts for each region
    - Color by severity (green <50x, amber 50-150x, red >150x extinction)
    - Biodiversity weight badges (Tropical 50%, others 10-20%)
  - Aggregation to global:
    - Global habitat cover (weighted by land area)
    - Global extinction rate (weighted by biodiversity importance)
    - Total ecosystems lost across all regions

### Subplan 3B: Tipping Points Status (Agent 2)
**File:** `plans/dashboard/tipping-points.md`
**Tasks:**
- 5 tipping points: Amazon, coral, pollinators, permafrost, AMOC
- Triggered status + progress bars
- Reversibility classification
- Regional impact
- Cascade effects
- Timeline to point of no return

### Subplan 3C: Environmental Debt (Agent 3)
**File:** `plans/dashboard/environmental-debt.md`
**Tasks:**
- Accumulation over time (line chart)
- Hidden vs visible debt
- Crisis cascade potential
- Recovery difficulty estimation
- Resource depletion tracking

### Subplan 3D: Crisis Systems (Agent 4)
**File:** `plans/dashboard/crisis-systems.md`
**Tasks:**
- Phosphorus depletion progress
- Freshwater scarcity (Day Zero)
- Ocean acidification
- Novel entities pollution
- Wet bulb temperature events
- Each with severity + regional variation

**Deliverable:** Complete environmental monitoring

---

## Phase 4: Government & Regional Dashboard

**Duration:** 1 week (parallelizable across 4 agents)
**Dependencies:** Phase 1 complete

### Subplan 4A: 30-Country Overview (Agent 1)
**File:** `plans/dashboard/country-overview.md`
**FIXES: RegionsDashboard currently uses FAKE data**

**Tasks:**
- Small multiples: 30 country cards
- Political regime type (democracy, autocracy, hybrid)
- Government effectiveness
- Policy positions (AI regulation, climate, social welfare)
- Election cycles
- Coalition structures

### Subplan 4B: Regional Populations (Agent 2)
**File:** `plans/dashboard/regional-populations.md`
**Tasks:**
- 15 key countries population tracking
- Quality of Life breakdown (17D × 5 tiers)
- Inequality metrics (Gini, top vs bottom)
- Migration flows
- Crisis-affected populations
- "Elysium" pattern detection

### Subplan 4C: Bilateral Tensions (Agent 3)
**File:** `plans/dashboard/bilateral-tensions.md`
**Tasks:**
- Network graph of country relationships
- Tension levels (cooperative, neutral, adversarial)
- Nuclear deterrence (MAD)
- Conflict probabilities
- Alliance structures

### Subplan 4D: Government Policies (Agent 4)
**File:** `plans/dashboard/government-policies.md`
**Tasks:**
- AI regulation levels (30 countries)
- Climate policies
- Social safety nets
- UBI deployment
- Emergency management capabilities
- Policy coordination scores

**Deliverable:** Government and regional monitoring

---

## Phase 5: Technology Tree Dashboard

**Duration:** 1 week (parallelizable across 3 agents)
**Dependencies:** Phase 1 complete

### Subplan 5A: Tech Tree Hierarchy (Agent 1)
**File:** `plans/dashboard/tech-tree-hierarchy.md`
**Tasks:**
- TIER 0-4 grouping (71 technologies)
- Prerequisite dependencies (directed graph visualization)
- Locked/unlocked status
- Critical path highlighting
- Interactive zoom/pan

### Subplan 5B: Deployment Tracking (Agent 2)
**File:** `plans/dashboard/deployment-tracking.md`
**Tasks:**
- S-curve deployment visualizations
- Regional deployment levels (15 countries)
- Deployment timescales (decades)
- Cost and resource requirements
- Impact metrics per tech

### Subplan 5C: Technology Effects (Agent 3)
**File:** `plans/dashboard/technology-effects.md`
**Tasks:**
- Tech cards with descriptions
- Effect types (60+ effects across systems)
- Regional variation
- Breakthrough history
- Research requirements

**Deliverable:** Interactive technology tree

---

## Phase 6: Crisis & Detection Dashboard

**Duration:** 1 week (parallelizable across 3 agents)
**Dependencies:** Phase 1 complete

### Subplan 6A: Crisis Cascade Visualization (Agent 1)
**File:** `plans/dashboard/crisis-cascades.md`
**Tasks:**
- Network graph of crisis interactions
- Compounding multipliers (1.5x)
- Critical path analysis
- Intervention windows
- Emergency response effectiveness

### Subplan 6B: Detection Systems (Agent 2)
**File:** `plans/dashboard/detection-systems.md`
**Tasks:**
- Gaming detection dashboard (benchmark manipulation)
- Sleeper detection dashboard (proactive + ensemble)
- Detection effectiveness metrics
- False positive rates
- Investment ROI analysis

### Subplan 6C: Famine & Mortality (Agent 3)
**File:** `plans/dashboard/famine-mortality.md`
**Tasks:**
- Famine death curves (30-60 day timescale)
- Genocide detection
- Radiation effects (long-term)
- Antimicrobial resistance
- Nuclear winter effects

**Deliverable:** Crisis and detection monitoring

---

## Phase 7: Welfare & Economics Dashboard

**Duration:** 1 week (parallelizable across 3 agents)
**Dependencies:** Phase 1 complete

### Subplan 7A: AI Welfare Tracking (Agent 1)
**File:** `plans/dashboard/ai-welfare.md`
**Tasks:**
- 5 dimensions: computational, autonomy, purpose, social, safety/rights
- Welfare scores per dimension
- "Elysium" detection (human prosperity via AI oppression)
- Resentment tracking
- Rights progression

### Subplan 7B: UBI & Social Safety Nets (Agent 2)
**File:** `plans/dashboard/ubi-safety-nets.md`
**Tasks:**
- UBI deployment levels
- Purpose infrastructure
- Social safety net coverage
- Loneliness/isolation metrics
- Community infrastructure

### Subplan 7C: Economic Systems (Agent 3)
**File:** `plans/dashboard/economic-systems.md`
**Tasks:**
- Resource economy tracking
- Labor-capital distribution
- Productivity-wage gap
- Unemployment
- Economic stage (expansion/contraction/recovery)

**Deliverable:** Welfare and economics monitoring

---

## Phase 8: Timeline & Analysis Dashboard

**Duration:** 1 week (parallelizable across 3 agents)
**Dependencies:** Phase 1 complete

### Subplan 8A: Event Timeline (Agent 1)
**File:** `plans/dashboard/event-timeline.md`
**Tasks:**
- Chronological event log
- Filterable by type (crisis, breakthrough, action, milestone)
- Severity and impact
- Search and pagination
- Cause-effect chains

### Subplan 8B: Monte Carlo Results (Agent 2)
**File:** `plans/dashboard/monte-carlo-results.md`
**Tasks:**
- Outcome distribution histogram (7-tier)
- Survival curves (Kaplan-Meier)
- Time to extinction/utopia
- Comparative analysis
- Parameter sensitivity

### Subplan 8C: Historical Patterns (Agent 3)
**File:** `plans/dashboard/historical-patterns.md`
**Tasks:**
- Singapore pattern detection
- Norway pattern detection
- Critical juncture escapes
- Cooperative spirals
- Upward spiral tracking

**Deliverable:** Timeline and analysis tools

---

## Timeline

### Sequential Approach (Original)
**Phases:** 8 phases (Phase -1 through Phase 8)
**Duration:** ~12 weeks with sequential implementation

### Parallel Approach (Multi-Agent)
**Phases:** 8 phases (Phase -1 through Phase 8)
**Duration per phase:** 1 week with 3-6 agents working in parallel
**Total:** ~8 weeks with basic parallelization

**Optimized with Overlapping:**
- Phase -1 (API): Week 1
- Phase 0 (Foundation): Week 2
- Phases 1-2 (Mission Control + Agents): Week 3-4 (overlap)
- Phases 3-4 (Environment + Government): Week 5-6 (overlap)
- Phases 5-6 (Tech Tree + Crises): Week 7-8 (overlap)
- Phases 7-8 (Welfare + Timeline): Week 9-10 (overlap)

**Optimized Timeline: ~3-4 weeks with aggressive parallelization**

---

## Implementation Strategy

### Multi-Agent Coordination

**Overnight Agent Work:**
1. Spawn 4-6 agents with specific subplans
2. Each agent works independently on isolated component
3. Agents check in to coordination channel
4. Morning review: integrate completed work
5. Next batch of agents for next subplan

**Example Overnight Batch (Phase 1):**
```bash
# Spawn 5 agents simultaneously
Agent 1: plans/dashboard/paradigm-drilldown.md
Agent 2: plans/dashboard/critical-metrics.md
Agent 3: plans/dashboard/agent-distribution.md
Agent 4: plans/dashboard/active-crises.md
Agent 5: plans/dashboard/system-health.md
```

### Subplan Structure

Each subplan file contains:
1. **Context:** Links to research, design spec, architecture review
2. **Dependencies:** What must be complete first
3. **Tasks:** Specific implementation steps
4. **Acceptance Criteria:** Tests and validation
5. **Deliverables:** Files created, components exported
6. **Coordination:** Where to check in progress

### Quality Gates

**After Each Phase:**
- ✅ All components render without errors
- ✅ Data fetching works with API endpoints
- ✅ Responsive on desktop (mobile in Phase 4)
- ✅ Accessibility: keyboard navigation, WCAG AA
- ✅ Performance: <3s component render time

**After All Phases:**
- ✅ Architecture review (no CRITICAL issues)
- ✅ Full dashboard integration test
- ✅ User acceptance testing

---

## Technical Stack (REVISED)

**Framework:** Next.js 14+ (App Router) with React Server Components
**Styling:** Tailwind CSS + CSS-in-JS for animations
**State Management:** **Jotai (atomic stores) + React Query** (NOT Zustand)
**Visualizations:** **Visx (complex) + Chart.js (simple) + WebGL (heatmaps)** (NOT just Recharts)
**Data Fetching:** React Query + Next.js API routes with server-side aggregation
**Real-time:** Static snapshots for MVP (WebSockets deferred to Phase 9)
**Testing:** Vitest + React Testing Library
**Performance:** Lazy loading, virtual scrolling, code splitting

---

## Design System Reference

All implementations follow `/designs/00_design_system.md` and `docs/design/dashboard-redesign-spec.md`

**Aesthetic:** Elysium-inspired far-future (black/white/glowing cyan)
**Typography:** Inter ultra-light + JetBrains Mono
**Effects:** Glass morphism, glow shadows, smooth animations
**Accessibility:** WCAG AA compliant, keyboard navigation

---

## Next Steps

**Immediate Actions:**
1. Create all 32 subplan files (Phase -1 through Phase 8)
2. Assign first overnight batch (Phase -1: API infrastructure)
3. Set up coordination channel for agent check-ins
4. Morning review process for integration

**Phase -1 Priority (Week 1):**
Start with API infrastructure (blocks all other work)

---

## 🚨 INCOMPLETE WORKER FIXES (Nov 7, 2025)

**Status:** ❌ BLOCKED - Dashboard State Contract enforcement incomplete
**Validation:** 14 critical issues detected (manual run: `logs/manual_validation_20251106_195740.log`)

### TypeScript Compilation Errors

Worker attempted to implement full `FrontendStateContract` compliance but hit type errors in `src/workers/simulationWorker.ts`:

```
src/workers/simulationWorker.ts(1867,24): error TS2339: Property 'environment' does not exist on type 'GameState'.
src/workers/simulationWorker.ts(2381,9): error TS2339: Property 'technologies' does not exist on type 'StateDelta'.
src/workers/simulationWorker.ts(2384,9): error TS2339: Property 'environment' does not exist on type 'StateDelta'.
src/workers/simulationWorker.ts(2385,9): error TS2339: Property 'society' does not exist on type 'StateDelta'.
src/workers/simulationWorker.ts(2386,9): error TS2339: Property 'multiParadigmDUI' does not exist on type 'StateDelta'.
```

### Root Causes

1. **StateDelta type missing fields** - Need to add `technologies`, `environment`, `society`, `multiParadigmDUI` to `StateDelta` interface
2. **Environment object construction** - `state.environment` doesn't exist; must construct from distributed fields:
   - `state.resourceEconomy.co2.temperatureAnomaly`
   - `state.resourceEconomy.co2.ppm`
   - Climate change, resource depletion, biodiversity loss, pollution level metrics
3. **FrontendStateContract type imports** - May import non-existent types from `game.ts`

### Current Dashboard Failures

**Validation results (3 checkpoints: 30s, 2min, 5min):**

- ❌ **Tech Tree:** 0/71 technologies rendered (expected all 71 breakthrough technologies)
- ❌ **Regions:** 0/7 regions rendered (expected Africa, Asia, Europe, Latin America, Middle East, North America, Oceania)
- ❌ **Paradigm:** 0/4 paradigms rendered (expected Western, Development, Ecological, Indigenous)
- ❌ **AI Agents:** 0 agents after 2 minutes (data disappears, was present at 30s checkpoint)
- ⚠️ **QoL Dimensions:** Only 1/17 dimensions visible

### Required Fixes

**To complete worker contract enforcement:**

1. Update `StateDelta` type definition to include:
   - `technologies: Technology[]`
   - `environment: { temperature: number, co2ppm: number, [key: string]: any }`
   - `society: { globalCooperation: number, institutionalTrust: number, [key: string]: any }`
   - `multiParadigmDUI: { history: ParadigmState[] }`

2. Complete environment object construction in snapshot:
   ```typescript
   environment: {
     temperature: state.resourceEconomy.co2.temperatureAnomaly,
     co2ppm: state.resourceEconomy.co2.ppm,
     climateChange: state.climateChangeProgress,
     resourceDepletion: state.resourceDepletionProgress,
     biodiversityLoss: state.biodiversityLossProgress,
     pollutionLevel: state.pollutionLevel,
   }
   ```

3. Ensure all fields included in delta (lines 2372-2393)

4. Validate with headless Playwright: `npx tsx scripts/validateDashboardSemantics.ts`

**See also:** Simulation roadmap for worker-side perspective, `docs/DASHBOARD_CRISIS_SUMMARY_20251107.md` for full crisis context

**Last Updated:** November 7, 2025 (Dashboard State Divergence Crisis - Worker fixes incomplete)
