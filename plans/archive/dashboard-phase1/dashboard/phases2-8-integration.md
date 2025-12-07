# Integration Subplans: Phases 2-8

## Phase 2F: AI Agents Dashboard Integration
**Agent:** 5 | **Duration:** 1 day | **Dependencies:** 2A-2D complete

**Tasks:**
- Create `src/app/dashboard/agents/page.tsx`
- Wire together: AgentPopulationOverview + IndividualAgentCards + CapabilityMatrixHeatmap + SleeperAnalysis
- Add tabs or sections for different views
- Link agent cards to detail view (`/dashboard/agents/:id`)
- Loading states, error boundary
- Navigation from Mission Control System Health grid

**Layout:**
```typescript
<div className="space-y-8">
  <AgentPopulationOverview />
  <Tabs>
    <Tab label="Individual Agents">
      <IndividualAgentCards />
    </Tab>
    <Tab label="Capability Matrix">
      <CapabilityMatrixHeatmap />
    </Tab>
    <Tab label="Sleeper Analysis">
      <SleeperAnalysis />
    </Tab>
  </Tabs>
</div>
```

---

## Phase 3F: Environment Dashboard Integration
**Agent:** 5 | **Duration:** 1 day | **Dependencies:** 3A-3D complete

**Tasks:**
- Create `src/app/dashboard/environment/page.tsx`
- Wire together: PlanetaryBoundariesBars + TippingPointsStatus + EnvironmentalDebt + CrisisSystems
- Grid layout (2×2 or vertical stack)
- Click boundary → detail modal
- Loading states, error boundary

**Layout:**
```typescript
<div className="space-y-8">
  <PlanetaryBoundariesBars />
  <div className="grid grid-cols-2 gap-8">
    <TippingPointsStatus />
    <EnvironmentalDebt />
  </div>
  <CrisisSystems />
</div>
```

---

## Phase 4F: Government Dashboard Integration
**Agent:** 5 | **Duration:** 1 day | **Dependencies:** 4A-4D complete

**Tasks:**
- Create `src/app/dashboard/government/page.tsx`
- Wire together: CountryOverview (small multiples) + RegionalPopulations + BilateralTensions (network graph) + GovernmentPolicies
- Click country card → detail view (`/dashboard/government/:id`)
- Loading states, error boundary

**Layout:**
```typescript
<div className="space-y-8">
  <CountryOverview />
  <div className="grid grid-cols-2 gap-8">
    <RegionalPopulations />
    <GovernmentPolicies />
  </div>
  <BilateralTensions />
</div>
```

---

## Phase 5F: Technology Dashboard Integration
**Agent:** 4 | **Duration:** 1 day | **Dependencies:** 5A-5C complete

**Tasks:**
- Create `src/app/dashboard/technology/page.tsx`
- Wire together: TechTreeHierarchy (main view) + DeploymentTracking + TechnologyEffects (side panels)
- Interactive tech tree with zoom/pan
- Click tech node → detail modal with deployment + effects
- Loading states, error boundary

**Layout:**
```typescript
<div className="flex gap-8">
  <div className="flex-1">
    <TechTreeHierarchy />
  </div>
  <div className="w-[400px] space-y-6">
    <DeploymentTracking />
    <TechnologyEffects />
  </div>
</div>
```

---

## Phase 6F: Crisis & Detection Dashboard Integration
**Agent:** 4 | **Duration:** 1 day | **Dependencies:** 6A-6C complete

**Tasks:**
- Create `src/app/dashboard/crises/page.tsx`
- Wire together: CrisisCascadeVisualization (network graph) + DetectionSystems + FamineMortality
- Crisis network as main view
- Detection and mortality as bottom row
- Loading states, error boundary

**Layout:**
```typescript
<div className="space-y-8">
  <CrisisCascadeVisualization />
  <div className="grid grid-cols-2 gap-8">
    <DetectionSystems />
    <FamineMortality />
  </div>
</div>
```

---

## Phase 7F: Welfare & Economics Dashboard Integration
**Agent:** 4 | **Duration:** 1 day | **Dependencies:** 7A-7C complete

**Tasks:**
- Create `src/app/dashboard/welfare/page.tsx`
- Wire together: AIWelfareTracking + UBISafetyNets + EconomicSystems
- Vertical stack or 2-column layout
- Loading states, error boundary

**Layout:**
```typescript
<div className="space-y-8">
  <AIWelfareTracking />
  <div className="grid grid-cols-2 gap-8">
    <UBISafetyNets />
    <EconomicSystems />
  </div>
</div>
```

---

## Phase 8F: Timeline & Analysis Dashboard Integration
**Agent:** 4 | **Duration:** 1 day | **Dependencies:** 8A-8C complete

**Tasks:**
- Create `src/app/dashboard/timeline/page.tsx` AND `src/app/dashboard/analysis/page.tsx` (separate pages)
- **Timeline page:** EventTimeline (full width, filterable)
- **Analysis page:** MonteCarloResults + HistoricalPatterns (2-column)
- Loading states, error boundary

**Timeline Layout:**
```typescript
<div className="space-y-8">
  <EventTimeline />
</div>
```

**Analysis Layout:**
```typescript
<div className="grid grid-cols-2 gap-8">
  <MonteCarloResults />
  <HistoricalPatterns />
</div>
```

---

## Integration Agent Responsibilities

For each phase integration subplan, the agent:

1. **Creates the page route file** (`src/app/dashboard/[name]/page.tsx`)
2. **Imports all components** from that phase
3. **Assembles layout** (grid, flex, stack)
4. **Adds loading states** (spinner while fetching)
5. **Adds error boundary** (catches component crashes)
6. **Wires up navigation** (links from sidebar, breadcrumbs)
7. **Ensures responsive** (mobile breakpoints)
8. **Verifies no errors** (TypeScript, console, runtime)

---

## Acceptance Criteria (All Phases)

✅ Page loads without errors
✅ All components render with data
✅ Layout looks correct (no overlap, proper spacing)
✅ Navigation works (sidebar, breadcrumbs, internal links)
✅ Loading states show spinner
✅ Error boundary catches crashes
✅ Responsive on mobile
✅ No TypeScript errors
✅ No console errors

---

## Total Integration Effort

**7 integration subplans × 1 day each = 7 days (1.4 weeks)**

Can be parallelized if agents work on different pages simultaneously (no file conflicts).

**Phases 2-8 integration can complete in 2-3 days** with 3-4 agents working in parallel (each agent takes 2 phases).

---

**Last Updated:** October 22, 2025
