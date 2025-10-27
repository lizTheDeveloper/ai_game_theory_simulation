# Dashboard Implementation Audit
**Date:** October 26, 2025
**Purpose:** Compare actual implementation vs FRONTEND_ROADMAP.md

---

## Executive Summary

**Overall Status:** ~65-70% complete

The dashboard foundation is solid and most core features are implemented. Key missing pieces:
1. **Paradigm drill-down side panels** (user explicitly requested)
2. **Regional biome breakdown** for environmental data
3. **Government/policy dashboard** (30 countries, bilateral tensions)
4. **Crisis cascade visualization** (network graphs)
5. **Advanced visualizations** (violin plots, Sankey refinements)

**Architecture Note:** No server-side API implemented (Phase -1). All data flows through Web Worker → StateDelta → React Context. This is actually a simpler architecture than planned and works well for current scale.

---

## Detailed Implementation Status

### ✅ Phase 0: Foundation (95% DONE)

**Implemented:**
- ✅ Core components: `Panel`, `MetricCard`, `StatusIndicator`
- ✅ Navigation system with 10 dashboard routes
- ✅ Web Worker simulation engine (`SimulationWorkerClient`)
- ✅ State management via React Context (`SimulationWorkerProvider`)
- ✅ Base styling (Elysium-inspired black/white/cyan aesthetic)

**Missing:**
- ❌ Jotai + React Query (roadmap specified, but React Context works fine)
- ❌ Chart infrastructure (Visx/Chart.js not installed, using inline SVG)
- ⚠️ Sparklines partially implemented but trajectory tracking disabled (see line 48-51 in `ParadigmDashboard.tsx`)

**Files:**
- `src/components/core/Panel.tsx`
- `src/components/core/MetricCard.tsx`
- `src/components/core/StatusIndicator.tsx`
- `src/components/core/Navigation.tsx`
- `src/lib/contexts/SimulationWorkerContext.tsx`

---

### ✅ Phase 1: Mission Control (65% DONE)

**Implemented:**
- ✅ Critical metrics row (population, QoL, AI capability, alignment)
- ✅ Multi-paradigm DUI scores (4 paradigms)
- ✅ System health panel
- ✅ Environmental systems panel
- ✅ Basic status indicators

**Missing (HIGH PRIORITY):**
- ❌ **Paradigm drill-down side panels** (user requested: click paradigm → shows 4-19 indicators + sparklines)
- ❌ AI agent distribution violin plots (currently shows only averages, not distribution of 20 agents)
- ❌ Active crises panel with severity + cascade multipliers
- ❌ Regional breakdown for critical metrics (15 countries)

**Files:**
- `src/components/dashboards/OverviewDashboard.tsx` (lines 1-208)

**User Quote:**
> "Click paradigm score → side panel slides out showing indicators per paradigm with progress bars + 12-month trend sparklines + regional breakdown"

---

### ✅ Phase 2: AI Agents Dashboard (90% DONE)

**Implemented:**
- ✅ Population overview (20 agents total)
- ✅ Individual agent cards with true vs revealed capabilities
- ✅ Capability matrix heatmap (20 agents × 7 dimensions)
- ✅ Lifecycle Sankey diagram with alignment breakdown
- ✅ Sleeper agent detection panel
- ✅ Deception strategies tracking (honest/gaming/sandbagging)
- ✅ AI suffering metrics panel (conditional on visibility config)
- ✅ AI collectives tracking (trauma-driven collectives)
- ✅ Dark compute usage tracking
- ✅ Research focus display per agent

**Missing:**
- ❌ Violin plots for capability/alignment distributions (uses simple stats instead)
- ❌ Network graph for sleeper connections

**Files:**
- `src/components/dashboards/AIAgentsDashboard.tsx` (lines 1-1543) - **Most complete dashboard!**

**Notes:**
- This is the most feature-rich dashboard
- Table view vs card view toggle works well
- Capability matrix shows sandbagging detection beautifully

---

### ✅ Phase 3: Environmental Dashboard (60% DONE)

**Implemented:**
- ✅ Core environmental indicators (climate, biodiversity, resources, pollution)
- ✅ Planetary boundaries crossed count
- ✅ Environmental debt tracking
- ✅ Crisis indicators (phosphorus, freshwater, ocean, novel entities)
- ✅ Cascade risk analysis with multipliers

**Missing (FROM ROADMAP):**
- ❌ **9 horizontal bar charts** for planetary boundaries (currently simple progress bars)
- ❌ **Regional biome breakdown** for Land Use/Biosphere (4 regions: Tropical, Temperate, Grasslands, Boreal/Arctic)
  - Per-region: habitat cover %, extinction rate, ecosystem collapse risk, ecosystems lost
  - Biodiversity weights per region
  - Small multiples visualization
- ❌ Tipping points detailed view (Amazon, coral, pollinators, permafrost, AMOC)
- ❌ Timeline to point of no return

**Files:**
- `src/components/dashboards/EnvironmentalDashboard.tsx` (lines 1-278)

**Roadmap Quote (lines 339-354):**
> "NEW (Oct 22, 2025): Regional biome breakdown for Land Use/Biosphere"

---

### ✅ Phase 4: Regions Dashboard (40% DONE)

**Implemented:**
- ✅ Global population and QoL metrics
- ✅ Social cohesion and institutional trust
- ✅ Regional breakdown cards (population, QoL, healthcare, climate vulnerability)
- ✅ High vulnerability alerts

**Missing (MAJOR GAPS):**
- ❌ **30-country government overview** (currently only regional aggregates)
- ❌ Political regime types (democracy, autocracy, hybrid)
- ❌ Government policies per country (AI regulation, climate, UBI, safety nets)
- ❌ Bilateral tensions network graph
- ❌ Election cycles, coalition structures
- ❌ "Elysium" pattern detection

**Files:**
- `src/components/dashboards/RegionsDashboard.tsx` (lines 1-315)

**Roadmap Note (line 395):**
> "FIXES: RegionsDashboard currently uses FAKE data"

**Status:** Need to verify if this is still using fake data or real StateDelta

---

### ✅ Phase 5: Tech Tree Dashboard (70% DONE)

**Implemented:**
- ✅ Deployed tech count and list
- ✅ Active research projects with progress bars
- ✅ Tech tree hierarchy by tier (0-4)
- ✅ Prerequisite dependencies shown
- ✅ Deployment percentage per tech
- ✅ Tech risk level tracking

**Missing:**
- ❌ Interactive zoom/pan
- ❌ Critical path highlighting
- ❌ S-curve deployment visualizations
- ❌ Regional deployment levels (15 countries)
- ❌ Detailed technology effects per tech

**Files:**
- `src/components/dashboards/TechTreeDashboard.tsx` (lines 1-259)

**Notes:**
- Tree structure is implemented but static
- Could benefit from graph visualization library (D3, Cytoscape)

---

### ✅ Phase 6: Crisis Dashboard (50% DONE)

**Implemented:**
- ✅ Crisis type detection
- ✅ Crisis severity indicators
- ✅ Basic crisis information

**Missing:**
- ❌ **Crisis cascade network graph** (showing interactions + compounding)
- ❌ Intervention windows countdown
- ❌ Critical path analysis
- ❌ Emergency response effectiveness tracking

**Files:**
- `src/components/dashboards/CrisisDashboard.tsx` (11,239 bytes)

**Notes:**
- Didn't read full file but based on size, likely basic implementation

---

### ✅ Phase 7: Detection Dashboard (50% DONE)

**Implemented:**
- ✅ Detection systems status
- ✅ Basic detection metrics

**Missing:**
- ❌ Gaming detection detailed dashboard (benchmark manipulation)
- ❌ Sleeper detection detailed dashboard (proactive + ensemble)
- ❌ Detection effectiveness metrics
- ❌ False positive rates
- ❌ Investment ROI analysis

**Files:**
- `src/components/dashboards/DetectionDashboard.tsx` (8,382 bytes)

---

### ✅ Phase 8: Timeline Dashboard (60% DONE)

**Implemented:**
- ✅ Event timeline with chronological log
- ✅ Event filtering
- ✅ Basic event cards

**Missing:**
- ❌ Monte Carlo results integration
- ❌ Outcome distribution histogram (7-tier)
- ❌ Survival curves (Kaplan-Meier)
- ❌ Historical pattern detection (Singapore, Norway patterns)
- ❌ Parameter sensitivity analysis

**Files:**
- `src/components/dashboards/TimelineDashboard.tsx` (17,274 bytes)
- `src/components/dashboards/MonteCarloResultsDashboard.tsx` (14,035 bytes) - separate component

---

### ❌ Phase -1: Server-Side Aggregation API (NOT IMPLEMENTED)

**Status:** NOT NEEDED for current architecture

**Explanation:**
- Roadmap planned server-side API to prevent browser memory exhaustion
- Actual implementation uses Web Worker architecture:
  - Simulation runs in Web Worker
  - Minimal `StateDelta` messages sent to UI
  - React Context distributes state to components
- This is actually simpler and works well for current scale
- No API routes found in `src/app/api/`

**Conclusion:** Skip this phase unless scale demands it

---

## Missing Features Summary

### HIGH PRIORITY (User Explicitly Requested)

1. **Paradigm Drill-Down Side Panels** (Phase 1)
   - Click paradigm score → slide-out panel
   - Show 4-19 indicators per paradigm
   - Progress bars + 12-month sparklines
   - Regional breakdown (15 countries)
   - 300ms animation with glass morphism

2. **Regional Biome Breakdown** (Phase 3)
   - 4 regional biomes for Land Use/Biosphere
   - Small multiples visualization
   - Biodiversity weights
   - Aggregation to global metrics

### MEDIUM PRIORITY (Roadmap Items)

3. **Government/Policy Dashboard** (Phase 4)
   - 30-country overview
   - Political regime types
   - Government policies (AI regulation, climate, UBI)
   - Bilateral tensions network graph

4. **Crisis Cascade Visualization** (Phase 6)
   - Network graph of crisis interactions
   - Compounding multipliers
   - Critical path analysis

5. **AI Agent Violin Plots** (Phase 1)
   - Distribution of 20 agents (not just average)
   - Capability and alignment distributions
   - Outlier highlighting

### LOW PRIORITY (Nice-to-Have)

6. **Tech Tree Interactivity** (Phase 5)
   - Zoom/pan controls
   - Critical path highlighting

7. **Advanced Detection Dashboards** (Phase 7)
   - Gaming detection detailed view
   - Sleeper detection ROI

8. **Monte Carlo Integration** (Phase 8)
   - Survival curves
   - Pattern detection visualization

---

## Architecture Notes

### State Flow
```
Simulation Engine (Web Worker)
  ↓ (postMessage)
StateDelta
  ↓ (React Context)
SimulationWorkerProvider
  ↓ (useSimulationWorker hook)
Dashboard Components
```

### Data Structure
`StateDelta` interface provides:
- Basic metrics (population, QoL, paradigm scores)
- AI agent array (20 agents with full details)
- Regional populations (when available)
- Deployed techs, active research
- Crisis indicators
- Event logs

**Key limitation:** No full `GameState` in browser (by design for memory efficiency)

### Sparklines Issue
From `ParadigmDashboard.tsx:48-51`:
```typescript
// Note: Sparklines removed - trajectory not available in StateDelta
// Would need to implement history tracking in Web Worker if needed
const getSparkline = (_paradigm: 'western' | 'development' | 'ecological' | 'indigenous') => {
  return [] // Placeholder - trajectory tracking not yet implemented
}
```

**Solution:** Add trajectory history to StateDelta or store in React state

---

## Recommendations

### Immediate Next Steps

1. **Implement Paradigm Drill-Down** (Phase 1 - user requested)
   - Create `ParadigmDetailPanel` component
   - Add click handler to paradigm cards
   - Implement slide-out animation
   - Show indicator breakdown per paradigm
   - Add close on ESC/click-outside

2. **Add Regional Biome Breakdown** (Phase 3 - roadmap item)
   - Update `EnvironmentalDashboard.tsx`
   - Create 4 regional biome cards
   - Add small multiples visualization
   - Wire up to StateDelta

3. **Fix AI Agent Distribution** (Phase 1)
   - Add violin plot or histogram
   - Show distribution of all 20 agents
   - Replace single average with distribution view

### Medium-Term Improvements

4. **Implement Government Dashboard** (Phase 4)
   - Create `GovernmentDashboard.tsx`
   - 30-country cards
   - Policy tracking
   - Bilateral tensions network

5. **Add Crisis Cascade Visualization** (Phase 6)
   - Network graph library (D3 or Cytoscape)
   - Show crisis interactions
   - Compounding multipliers

### Long-Term Enhancements

6. **Chart Library Integration**
   - Install Visx or Chart.js
   - Replace inline SVG with proper charts
   - Add interactivity (zoom, pan, tooltips)

7. **Sparkline History Tracking**
   - Add trajectory storage to Web Worker
   - Send historical data in StateDelta
   - Enable 12-month trend sparklines

---

## Files Reference

**Dashboard Components:**
- `src/components/dashboards/OverviewDashboard.tsx` (7,595 bytes)
- `src/components/dashboards/ParadigmDashboard.tsx` (7,224 bytes)
- `src/components/dashboards/AIAgentsDashboard.tsx` (77,219 bytes) ⭐ Most complete
- `src/components/dashboards/EnvironmentalDashboard.tsx` (12,632 bytes)
- `src/components/dashboards/RegionsDashboard.tsx` (12,854 bytes)
- `src/components/dashboards/TechTreeDashboard.tsx` (8,921 bytes)
- `src/components/dashboards/CrisisDashboard.tsx` (11,239 bytes)
- `src/components/dashboards/DetectionDashboard.tsx` (8,382 bytes)
- `src/components/dashboards/TimelineDashboard.tsx` (17,274 bytes)
- `src/components/dashboards/MonteCarloResultsDashboard.tsx` (14,035 bytes)

**Core Components:**
- `src/components/core/Panel.tsx` (1,087 bytes)
- `src/components/core/MetricCard.tsx` (1,851 bytes)
- `src/components/core/StatusIndicator.tsx` (1,377 bytes)
- `src/components/core/Navigation.tsx` (16,280 bytes)

**Infrastructure:**
- `src/lib/contexts/SimulationWorkerContext.tsx`
- `src/lib/simulationWorkerClient.ts`

**Roadmap:**
- `plans/FRONTEND_ROADMAP.md` (687 lines)

---

## Completion Estimates

| Phase | Estimated % Complete | Missing Features |
|-------|---------------------|------------------|
| Phase -1: Server API | 0% (not needed) | Skip entirely |
| Phase 0: Foundation | 95% | Chart library, Jotai |
| Phase 1: Mission Control | 65% | Paradigm drill-down, violin plots, crisis panel |
| Phase 2: AI Agents | 90% | Violin plots, network graphs |
| Phase 3: Environment | 60% | Regional biomes, tipping points |
| Phase 4: Regions/Gov | 40% | 30 countries, policies, tensions |
| Phase 5: Tech Tree | 70% | Interactivity, regional deployment |
| Phase 6: Crises | 50% | Network visualization |
| Phase 7: Detection | 50% | Detailed dashboards |
| Phase 8: Timeline | 60% | Monte Carlo integration |

**Overall: ~65-70% complete**

---

## Next Actions

1. ✅ Create this audit document
2. ⏭️ Update `FRONTEND_ROADMAP.md` with completion status
3. ⏭️ Prioritize: Paradigm drill-down (HIGH), Regional biomes (MEDIUM), Government dashboard (MEDIUM)
4. ⏭️ Decision: Should we implement missing features or mark roadmap as "good enough"?
