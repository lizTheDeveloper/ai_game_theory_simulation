# Frontend Implementation Roadmap (REVISED - Oct 22, 2025)
## Next.js Dashboard for Simulation Visualization

**Date:** October 22, 2025 (Updated after Architecture Review)
**Purpose:** Full dashboard implementation (Option A) with multi-agent parallelization
**Design System:** `/designs/` (Elysium-inspired far-future aesthetic)
**Architecture Review:** `reviews/dashboard_architecture_20251022.md` (7 CRITICAL issues addressed)

---

## Executive Summary

**Original Timeline:** 12+ weeks sequential
**Revised Timeline:** 3-4 weeks with multi-agent parallelization
**Approach:** Break into independent subplans for overnight agent work
**Status:** ✅ Research complete, ✅ Design spec complete, ✅ Architecture reviewed

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

### Subplan 1A: Paradigm Cards with Drill-Down (Agent 1) ✨
**File:** `plans/dashboard/paradigm-drilldown.md`
**USER REQUESTED FEATURE**

**Tasks:**
- 4 paradigm score cards (Western Liberal, Development, Ecological, Indigenous)
- Click interaction → side panel slides out
- Side panel shows 4-19 indicators per paradigm:
  - Western Liberal: 4 indicators (democracy, civil liberties, rule of law, econ freedom)
  - Development: 3+ indicators (life expectancy, GDP, education)
  - Ecological: 9 indicators (9 planetary boundaries)
  - Indigenous: 3+ indicators (social trust, community bonds, meaning)
- Each indicator: progress bar + 12-month trend sparkline + current value
- Regional breakdown (15 countries) for each indicator
- Smooth 300ms slide animation with glass morphism
- Close on click-outside or ESC key

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

## Total Effort & Timeline

### Sequential Timeline (Original)
**Total:** 64-86 hours = 8-10.75 weeks (40h/week) = **~12 weeks**

### Parallel Timeline (Multi-Agent)
**Phases:** 8 phases (Phase -1 through Phase 8)
**Duration per phase:** 1 week with 3-6 agents
**Total:** **8 weeks with parallelization**

**Further optimization with overlapping:**
- Phase -1 (API): Week 1
- Phase 0 (Foundation): Week 2
- Phases 1-2 (Mission Control + Agents): Week 3-4 (overlap)
- Phases 3-4 (Environment + Government): Week 5-6 (overlap)
- Phases 5-6 (Tech Tree + Crises): Week 7-8 (overlap)
- Phases 7-8 (Welfare + Timeline): Week 9-10 (overlap)

**Optimized Timeline: 10 weeks → ~3-4 weeks with aggressive parallelization**

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

**Last Updated:** October 22, 2025 (Post-Architecture Review)
