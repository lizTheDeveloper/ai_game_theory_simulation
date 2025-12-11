# Frontend Specification
## Next.js Dashboard for Simulation Visualization

**Created:** December 6, 2025 (Migrated from FRONTEND_ROADMAP.md)
**Purpose:** Full dashboard implementation with far-future aesthetics
**Design System:** `/designs/` (Elysium-inspired, high-contrast, glowing accents)

**Parent Spec:** [Project](../project/spec.md)

---

## Purpose

Next.js web dashboard for visualizing simulation state in real-time. Surfaces complex multi-dimensional data (17D AI capabilities, 17D QoL, 4 paradigm perspectives, 9 planetary boundaries, etc.) through clean, far-future UI design.

**Design Philosophy:** Elysium-inspired far-future aesthetic - black/white/glowing, high-contrast, minimal clutter, geometric precision.

---

## Requirements

### Requirement: Real-Time Simulation Updates
The dashboard SHALL update in real-time as the simulation progresses.

#### Scenario: Web Worker Integration
- WHEN the simulation runs in a Web Worker
- THEN the dashboard MUST receive incremental state updates
- AND it MUST render deltas (not full state re-renders)
- AND updates MUST be efficient (<16ms per frame for 60fps)

#### Scenario: Delta Propagation
- WHEN simulation state changes
- THEN only changed values MUST be sent to UI
- AND full state dumps SHALL be avoided (except initialization)
- AND sparkline histories MUST be maintained in worker

### Requirement: Multi-Paradigm Visualization
The dashboard SHALL display all 4 paradigm perspectives simultaneously.

**Paradigms:**
1. Western Liberal (individual autonomy, political rights)
2. Development (basic needs, poverty reduction)
3. Ecological (planetary health, biodiversity)
4. Indigenous (cultural preservation, land rights)

#### Scenario: Paradigm Card Drill-Down
- WHEN a user clicks a paradigm card
- THEN it MUST show detailed indicator breakdowns
- AND it MUST show 12-month sparkline history
- AND it MUST highlight divergence from other paradigms

#### Scenario: Paradigm Divergence Alert
- WHEN paradigms diverge by >20 points
- THEN it MUST visually alert the user
- AND it MUST explain the source of conflict
- AND it MUST show trend direction (converging/diverging)

### Requirement: God Mode Manual Control
The dashboard SHALL expose ALL automated simulation decisions as manual controls.

#### Scenario: Policy Override
- WHEN a user enables God Mode
- THEN they MUST be able to override government policy decisions
- AND control individual AI agent actions
- AND set society priorities and responses
- AND adjust organizational strategies
- AND intervene in any phase's automated logic

#### Scenario: Decision Visibility
- WHEN God Mode is active
- THEN user MUST see what each actor is prioritizing
- AND make real-time decisions during simulation
- AND see the immediate impact of interventions

### Requirement: Far-Future Aesthetics
The dashboard SHALL use Elysium-inspired design language.

#### Scenario: Visual Design
- WHEN rendering UI components
- THEN they MUST use high-contrast black/white/glowing aesthetic
- AND they MUST avoid cluttered information density
- AND they MUST use clean geometric layouts
- AND glowing accents MUST be used sparingly (highlights only)

#### Scenario: Data Visualization
- WHEN displaying complex data
- THEN visualizations MUST prioritize clarity over decoration
- AND color coding MUST be semantic (RED=danger, GREEN=healthy, AMBER=warning)
- AND sparklines MUST show trend direction at a glance

### Requirement: Dashboard Component Library
The dashboard SHALL provide reusable components for common patterns.

**Core Components:**
- MetricCard (single value + trend)
- ParadigmCard (4 paradigm perspectives)
- BoundaryStatus (9 planetary boundaries)
- AIAgentMatrix (20 heterogeneous agents)
- CrisisPanel (active crises + emergency response)
- TechTreeVisualization (71 breakthrough technologies)
- SparklineHistory (12-month trends)

#### Scenario: Component Reuse
- WHEN creating a new dashboard
- THEN it MUST use existing components where applicable
- AND new components MUST follow established patterns
- AND styling MUST be consistent across all dashboards

### Requirement: Performance Optimization
The dashboard SHALL maintain 60fps rendering even with complex data.

#### Scenario: Large Dataset Rendering
- WHEN rendering 20 AI agents × 17 capability dimensions (340 data points)
- THEN it MUST render in <16ms
- AND it MUST use virtualization for large lists
- AND it MUST use memoization for expensive calculations

#### Scenario: Real-Time Updates
- WHEN receiving simulation updates every 100ms
- THEN UI MUST stay responsive
- AND frame rate MUST remain ≥60fps
- AND input latency MUST remain <100ms

---

## Active Work

### CRITICAL Priority

#### CRITICAL-1: Game UI State Integration
**Status:** ✅ COMPLETE (Dec 7, 2025 - Session 56)
**Implemented By:** far-future-ux-designer (Tessa)
**Commit:** 5285463c
**Context:** Dashboard not consuming simulation state properly
**Impact:** Blocking all dashboard development
**Root Cause:** `gameState` from `useGameState()` was not being passed to `GameDashboard` component
**Solution:** Added `gameState` to destructured values and passed as prop to `GameDashboard`
**Results:** Month counter updates, event stream displays, resources show actual values
**Archival:** `/plans/completed/CRITICAL_game_ui_state_integration_IMPLEMENTED_20251207.md`

---

### MEDIUM Priority

#### M-7: Coverage Report Dashboard
**Status:** Proposed
**Context:** Visualize test coverage by module/phase
**Impact:** Easier to identify untested code
**Next Steps:** Design UI → Implement → Integrate with npm test

#### M-8: Monte Carlo Outcome Analysis Dashboard
**Status:** Proposed
**Context:** Visualize N≥10 run outcome distributions
**Impact:** Easier to spot anomalies, validate determinism
**Next Steps:** Design UI → Implement → Integrate with Monte Carlo script

---

## Completed Dashboards

### Overview Dashboard (`/dashboard`)
**Status:** ✅ COMPLETE + ENHANCED
**Features:**
- Global metrics (Population, QoL, AI Capability, Alignment)
- Multi-Paradigm DUI indicators (4 paradigms)
- Clickable paradigm cards with drill-down
- Integrated ParadigmDetailPanel component
- System health summary
- Environmental systems status

### Paradigms Dashboard (`/paradigms`)
**Status:** ✅ COMPLETE + ENHANCED
**Features:**
- Multi-Paradigm DUI with all 4 perspectives
- Average score, divergence tracking, paradigm conflicts
- Historical pattern detection
- Clickable paradigm cards with drill-down
- 12-month sparkline history tracking

### AI Agents Dashboard (`/ai-agents`)
**Status:** ✅ COMPLETE
**Features:**
- 20 heterogeneous agents displayed
- Lifecycle flow visualization (bimodal branching)
- Alignment distribution (Aligned/Uncertain/Misaligned)
- Evaluation strategies (Honest/Gaming/Sandbagging)
- 20×7 capability matrix heatmap
- True vs revealed capabilities with threat color coding

### Crises Dashboard (`/crises`)
**Status:** ✅ COMPLETE
**Features:**
- Active crisis tracking
- Resource crises (Phosphorus, Freshwater)
- Environmental crises (Ocean Acidification, Chemical Pollution)
- Planetary boundary crises (Climate Change, Biodiversity)
- Emergency response capacity metrics

### Environment Dashboard (`/environment`)
**Status:** ✅ COMPLETE
**Features:**
- Planetary boundary status (9 boundaries)
- Environmental debt tracking
- Core indicators (Climate, Biodiversity, Resources, Pollution)
- Resource crisis indicators
- Cascade risk analysis with multiplier

### Economy Dashboard (`/economy`)
**Status:** ✅ COMPLETE
**Features:**
- GDP metrics (global, per capita, growth rate)
- Wealth distribution (Gini coefficient)
- Employment statistics
- Organizational resources tracking
- Economic crisis indicators

### Society Dashboard (`/society`)
**Status:** ✅ COMPLETE
**Features:**
- Population demographics
- Rights status (political, economic, civil)
- Governance metrics (trust, participation)
- Social conflict indicators
- Cultural preservation status

### Technology Dashboard (`/technology`)
**Status:** ✅ COMPLETE
**Features:**
- Breakthrough technology tree (71 technologies)
- Deployment status by tier (0-4)
- R&D capacity metrics
- Technology effectiveness tracking
- Breakthrough timeline visualization

### Quality of Life Dashboard (`/quality-of-life`)
**Status:** ✅ COMPLETE
**Features:**
- 17-dimensional QoL breakdown
- 5-tier status (Survival → Environmental Quality)
- Regional variation
- Historical trends
- Bottleneck identification

### Events Dashboard (`/events`)
**Status:** ✅ COMPLETE
**Features:**
- Event log with filtering
- Event categories (Crisis, Policy, Tech, Breakthrough)
- Timeline visualization
- Event impact analysis
- Searchable history

---

## God Mode UI System

**Status:** Planning Phase
**Master Plan:** `/plans/god-mode-ui-master-plan.md`

See: [God Mode Specification](../simulation/god-mode/spec.md) for detailed requirements

**Overview:**
Comprehensive manual control interface exposing ALL automated simulation decisions:
- Government policy overrides
- Individual AI agent control
- Society priority setting
- Organizational strategy adjustment
- Per-phase intervention capability

**Integration:**
God Mode UI accessible from main dashboard with per-phase control panels. Implementation follows dashboard foundation completion.

---

## Related Specifications

- [Project Roadmap](../project/spec.md) - Parent spec
- [Simulation Roadmap](../simulation/spec.md) - Backend integration
- [God Mode System](../simulation/god-mode/spec.md) - Manual control requirements

---

## Development Standards

### File Organization
- `src/app/` - Next.js app router pages
- `src/components/` - React components
- `src/components/dashboards/` - Dashboard-specific components
- `src/lib/` - UI-specific utilities
- `src/workers/` - Web Workers for simulation

### Module Boundaries
- Frontend CAN import from `src/simulation/` (one-way dependency)
- Simulation MUST NOT import from `src/lib/` or `src/components/`
- Web Worker runs simulation, UI consumes state via delta messages

### Performance Standards
- 60fps minimum (16ms per frame)
- <100ms input latency
- Virtualization for lists >100 items
- Memoization for expensive calculations
- Delta propagation (not full state dumps)

### Design System
- Color palette: Black (#000), White (#FFF), Glow (#00FFFF, #FF00FF, #FFFF00)
- Typography: System fonts, geometric sans-serif
- Layout: Grid-based, clean geometric shapes
- Contrast: High-contrast for accessibility
- Animations: Subtle, purposeful (not decorative)

---

## Contributing

### Adding a New Dashboard

1. Create page in `src/app/[dashboard-name]/page.tsx`
2. Create dashboard component in `src/components/dashboards/[Name]Dashboard.tsx`
3. Connect to simulation state via Web Worker
4. Use delta propagation (not full state)
5. Follow far-future aesthetic guidelines
6. Add to navigation menu
7. Test on multiple screen sizes

### Modifying Existing Components

1. Create change proposal in `openspec/changes/[feature-name]/`
2. Design validation (far-future-ux-designer agent)
3. Implementation via nextjs-component-writer or manual
4. Performance testing (maintain 60fps)
5. Merge delta into this spec

### Before Merging

- All components render without errors
- 60fps maintained on target hardware
- Responsive design works on mobile/tablet/desktop
- Accessibility standards met (WCAG 2.1 AA)
- Far-future aesthetic guidelines followed
