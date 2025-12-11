# HIGH-2: Dashboard Missing Radiation Metrics

**Created:** December 9, 2025
**Priority:** HIGH
**Effort:** SMALL (2-4 hours)
**Status:** Proposed
**Origin:** Architecture Integration Review Dec 9, 2025

---

## Problem Statement

The M-6 Enhanced Radiation Modeling feature (completed Dec 8, 2025) is implemented in the simulation but completely invisible in the dashboard. The `StateDelta` interface doesn't include any radiation-related fields, so the new radiation system state changes are never propagated to the UI.

**Impact:**
- Users cannot see radiation zones, fallout activity, or cancer risk estimates
- 571 lines of radiation modeling code effectively invisible
- God mode testing blocked (can't see nuclear aftermath)
- Dashboard completeness compromised

**Root Cause:**
The Web Worker architecture requires explicit delta fields in `StateDelta` interface (`src/lib/simulationWorkerClient.ts`). When M-6 was implemented, the simulation code was added but dashboard integration was deferred.

---

## Current State

### Radiation System (Simulation)
**Location:** `src/types/radiation.ts` (355 lines)

**State Structure:**
```typescript
interface RadiationSystem {
  activeExposures: RadiationExposureEvent[];
  historicalExposures: RadiationExposureEvent[];
  totalRadiationDeaths: number;
  totalCancerDeaths: number;
  totalBirthDefects: number;
  contaminatedRegions: Set<string>;
}

interface RadiationExposureEvent {
  id: string;
  startMonth: number;
  region: string;
  exposedPopulation: number;
  exposureLevel: number; // [0, 1]
  acuteRadiationDeaths: number;
  acuteRadiationSyndrome: { ... };
  cancerRisk: { cumulativeCancerDeaths, ... };
  birthDefects: { cumulativeDefects, ... };
  contamination: {
    currentContaminationLevel: number; // [0, 1]
    agricultureImpossible: boolean;
    waterContamination: number; // [0, 1]
    timeToRecoveryYears: number;
  };
}
```

### StateDelta Interface (Dashboard)
**Location:** `src/lib/simulationWorkerClient.ts:17`

**Missing Fields:** No radiation metrics at all

**Current Fields (166 lines):**
- Core metrics (population, QoL, AI count, etc.)
- Quality of Life breakdown (17 dimensions)
- AI system metrics
- Environmental metrics (climate, biodiversity, pollution)
- Crisis indicators
- Multi-paradigm DUI
- 12-month history arrays

---

## Proposed Solution

### Phase 1: Add Radiation Metrics to StateDelta

**File:** `src/lib/simulationWorkerClient.ts`
**Location:** After `activeCrises` (line 105), before `governmentAIRegulation` (line 112)

**New Fields:**
```typescript
// Radiation & Nuclear Aftermath (M-6 Enhanced Radiation Modeling)
activeRadiationZones?: number;              // Count of active exposure events
totalRadiationDeaths?: number;              // Cumulative deaths (acute + cancer)
totalCancerDeaths?: number;                 // Cancer deaths only
totalBirthDefects?: number;                 // Birth defects across generations
contaminatedRegions?: string[];             // Regions with contamination >10%
highestContaminationLevel?: number;         // [0, 1] Worst contamination
radiationExposures?: Array<{
  region: string;
  monthsSinceExposure: number;
  contaminationLevel: number;               // [0, 1]
  agricultureImpossible: boolean;
  waterContamination: number;               // [0, 1]
}>;
```

**Rationale:**
- `activeRadiationZones` - Quick overview metric (how many zones affected?)
- `totalRadiationDeaths` - Dashboard needs cumulative death tracking
- `totalCancerDeaths` - Separate from acute deaths for clarity
- `totalBirthDefects` - Multi-generational impact visibility
- `contaminatedRegions` - Geographic awareness (which regions unsafe?)
- `highestContaminationLevel` - Severity indicator
- `radiationExposures[]` - Per-zone details for drill-down UI

### Phase 2: Populate Radiation Metrics in Worker

**File:** `src/workers/simulationWorker.ts`
**Location:** In `createStateDelta()` function (around line 150-250)

**Implementation:**
```typescript
// Extract radiation metrics from state
if (state.radiationSystem) {
  const radiationStats = getRadiationStats(state.radiationSystem);

  delta.activeRadiationZones = radiationStats.activeExposures;
  delta.totalRadiationDeaths = radiationStats.totalRadiationDeaths;
  delta.totalCancerDeaths = radiationStats.totalCancerDeaths;
  delta.totalBirthDefects = radiationStats.totalBirthDefects;
  delta.contaminatedRegions = radiationStats.contaminatedRegions;

  // Calculate highest contamination
  delta.highestContaminationLevel = state.radiationSystem.activeExposures.length > 0
    ? Math.max(...state.radiationSystem.activeExposures.map(e => e.contamination.currentContaminationLevel))
    : 0;

  // Map exposure events to UI-friendly format
  delta.radiationExposures = state.radiationSystem.activeExposures.map(exposure => {
    const monthsSinceExposure = state.currentMonth - exposure.startMonth;
    return {
      region: exposure.region,
      monthsSinceExposure,
      contaminationLevel: exposure.contamination.currentContaminationLevel,
      agricultureImpossible: exposure.contamination.agricultureImpossible,
      waterContamination: exposure.contamination.waterContamination,
    };
  });
}
```

**Dependencies:**
- Import `getRadiationStats` from `@/types/radiation`
- Ensure `state.radiationSystem` exists (initialized in `initializeGameState`)

### Phase 3: Dashboard Visualization (Optional - Future Work)

**File:** `src/components/dashboards/RadiationDashboard.tsx` (NEW)
**Priority:** MEDIUM (can defer)

**Components:**
- Radiation Overview Card (total deaths, active zones, birth defects)
- Contamination Map (show regions with contamination levels)
- Exposure Timeline (12-month sparkline of contamination decay)
- Per-Region Details (drill-down on specific zones)

**Design Language:** Far-future aesthetics (high-contrast, glowing radiation yellow/red)

---

## Testing Strategy

### Unit Tests
**File:** `tests/lib/simulationWorkerClient.test.ts` (create if doesn't exist)

**Test Cases:**
1. `StateDelta` includes radiation fields when `radiationSystem` exists
2. `StateDelta` handles empty `radiationSystem` (no radiation events)
3. `highestContaminationLevel` correctly identifies worst zone
4. `radiationExposures[]` maps exposure events correctly
5. `contaminatedRegions` filters out low-contamination regions (<10%)

### Integration Tests
**File:** `tests/integration/radiationDashboard.test.ts`

**Test Cases:**
1. Radiation metrics update when nuclear event occurs
2. Contamination decays over time (verify 30-year half-life)
3. Cancer deaths increase during latency period (years 5-40)
4. Dashboard renders radiation metrics without errors

### Manual Testing
1. Run god mode test with nuclear strike (`scripts/godModeNuclearTest.ts`)
2. Verify radiation metrics appear in dashboard
3. Check contamination decay over 100+ months
4. Validate cancer death curve (peaks at 20-30 years)

---

## Implementation Checklist

- [ ] Phase 1: Add radiation fields to `StateDelta` interface
- [ ] Phase 2: Populate radiation metrics in `simulationWorker.ts`
- [ ] Phase 3: Unit tests for delta generation
- [ ] Phase 4: Integration tests for radiation flow
- [ ] Phase 5: Manual god mode testing
- [ ] Phase 6: Update `openspec/specs/frontend/spec.md` (mark HIGH-2 complete)
- [ ] Phase 7: Optional - Create `RadiationDashboard.tsx` component

---

## Research Backing

**M-6 Enhanced Radiation Modeling** (Dec 8, 2025):
- Research file: `research/radiation_modeling_20251208.md` (842 lines)
- Sources: CDC 2024, REMM, ICRP 103, PMC11604265, BEIR VII
- Quality Gates: QG1 Grade B (Sylvia), QG2 PASSED
- Tests: 30+ unit tests, deterministic, all passing

**Dashboard Integration Pattern:**
- Existing pattern: Environmental metrics (climate, biodiversity, pollution)
- Location: `src/lib/simulationWorkerClient.ts:89-95`
- Precedent: Nuclear winter metrics in `nuclearWinter` field (line 94 in StateDelta)

---

## Risk Assessment

**LOW RISK - This is a dashboard integration task, not simulation logic change.**

**Risks:**
1. **NONE** - No simulation logic changes (pure dashboard plumbing)
2. **NONE** - Radiation system already tested and validated
3. **NONE** - Delta propagation pattern well-established

**Mitigation:**
- Follow existing `StateDelta` patterns exactly
- Test with god mode scripts before committing
- Verify no performance impact (radiation events are rare, <10 per game)

---

## Effort Estimate

**SMALL: 2-4 hours**

**Breakdown:**
- Phase 1 (StateDelta fields): 30 minutes
- Phase 2 (Worker population): 1 hour
- Phase 3 (Unit tests): 1 hour
- Phase 4 (Manual testing): 30 minutes
- Phase 5 (Documentation): 30 minutes

**Agent:** `far-future-ux-designer` (dashboard expertise)

**Blocked By:** None
**Blocks:** God mode nuclear testing, dashboard completeness milestone

---

## Success Criteria

1. ✅ `StateDelta` includes 7 radiation-related fields
2. ✅ Worker populates radiation metrics when `radiationSystem` exists
3. ✅ Worker handles empty `radiationSystem` gracefully (no crashes)
4. ✅ God mode nuclear test shows radiation metrics in console/UI
5. ✅ Unit tests pass (5+ test cases)
6. ✅ Integration tests pass (4+ test cases)
7. ✅ No performance regression (delta creation <1ms)
8. ✅ Type checking passes (`npx tsc --noEmit`)

---

## Follow-Up Work (Future)

**MEDIUM Priority:**
- Create `RadiationDashboard.tsx` component (full visualization)
- Add radiation sparklines to Environment dashboard
- Integrate with God Mode UI (manual contamination triggers)
- Add radiation to Crisis Panel (show active zones)

**LOW Priority:**
- Radiation heatmap (geographic visualization)
- Cancer mortality curve chart (Gaussian distribution)
- Birth defect generational tracking UI

---

## Related Work

**Completed:**
- M-6: Enhanced Radiation Modeling (Dec 8, 2025)
- M-4: Abrupt Sea Level Rise (Dec 5, 2025)
- HIGH-7: Conditional Climate Stability Floor (Dec 5, 2025)

**Pending:**
- HIGH-1: Radiation Integration with Regional Systems (depends on HIGH-2)
- MEDIUM-3: Dual Population Fields (legacy cleanup)
- MEDIUM-1: Silent Fallback Migration (deferred, large effort)

---

## Historical Context

**Architecture Review Finding (Dec 9, 2025):**
> "HIGH-2: Dashboard Missing Radiation Metrics - The StateDelta interface doesn't include fields for radiation zones, fallout activity, or cancer risk estimates. The new radiation system won't be visible in the dashboard."

**Research Validation (Dec 8, 2025):**
> "M-6 Enhanced Radiation Modeling: Grade B (Sylvia), 30+ tests passing, 571 lines of peer-reviewed code, but dashboard integration deferred."

**Next Session Recommendation:**
> "HIGH-2: Add radiationMetrics to StateDelta interface (small effort, high visibility impact)"

---

## Notes

- This is pure dashboard plumbing, NOT simulation logic
- Pattern already established (environmental metrics, nuclear winter)
- LOW RISK, HIGH IMPACT (makes 571 lines of code visible)
- Blocks god mode nuclear testing improvements
- Enables future radiation dashboard components
