# Monte Carlo Parameter Sweep UI Integration Plan

**Date:** October 28, 2025
**Status:** Ready for Implementation
**Complexity:** 2-3 hours (frontend integration only)
**Agent:** far-future-ux-designer

---

## Problem Statement

The Monte Carlo parameter sweep UI is **visually complete but non-functional**. All backend infrastructure exists, but the UI components don't communicate with each other.

**Current State:**
- ✅ MonteCarloManager.ts (1,304 lines) - Worker pool, parameter sweeps, IndexedDB
- ✅ MonteCarloContext.tsx (295 lines) - State management, event wiring
- ✅ EnhancedParameterConfig.tsx (675 lines) - Comprehensive parameter UI
- ✅ BatchProgressTracker.tsx - Progress display component
- ❌ **Components are isolated** - No data flows between them

**User Pain:**
When user clicks "Start Parameter Sweep", they see an alert saying "Would start sweep with N simulations" instead of actually running the sweep.

---

## Architecture Overview

### Existing Infrastructure

```
MonteCarloManager (Backend)
  ├─ createParameterSweep(config: ParameterSweepConfig) → batchId
  ├─ startParameterSweep(batchId) → void
  ├─ Event: 'batchProgress' → MonteCarloBatchProgress
  └─ Event: 'batchCompleted' → batchId

MonteCarloContext (State Layer)
  ├─ manager: MonteCarloManager
  ├─ sweepConfig: MonteCarloSweepConfig
  ├─ progress: MonteCarloBatchProgress | null
  ├─ aggregateStats: MonteCarloAggregateStats | null
  └─ startSweep() → Promise<void>

EnhancedParameterConfig (UI Component)
  ├─ config: EnhancedSweepConfig  ← DIFFERENT TYPE
  ├─ onChange: (config) => void
  └─ onStartSweep?: () => void  ← Currently shows alert
```

### Type Mismatch Problem

**EnhancedSweepConfig** (from UI):
```typescript
{
  startSeed: number;
  seedCount: number;
  parameters: {
    [parameterId: string]: {
      enabled: boolean;
      values: (string | number | boolean)[]
    }
  }
}
```

**MonteCarloSweepConfig** (from Context):
```typescript
{
  startSeed: number;
  seedCount: number;
  sweepThresholdScenarios: boolean;
  selectedThresholdScenarios: Array<'doom' | 'cautious' | ...>;
  sweepScenarioModes: boolean;
  selectedScenarioModes: ScenarioMode[];
  // ... etc
}
```

**These are fundamentally different** - need adapter layer.

---

## Implementation Plan

### Phase 1: Adapter Layer (30 minutes)

**File:** `src/lib/adapters/monteCarloConfigAdapter.ts`

Create bidirectional adapter between UI and Context types:

```typescript
export function convertEnhancedToContextConfig(
  enhanced: EnhancedSweepConfig
): MonteCarloSweepConfig {
  // Map enhanced.parameters to context's sweep flags
  // Example: enhanced.parameters['thresholdScenario'] → sweepThresholdScenarios
}

export function convertContextToEnhancedConfig(
  context: MonteCarloSweepConfig
): EnhancedSweepConfig {
  // Reverse mapping for bi-directional sync
}
```

**Key Mappings:**
- `parameters.scenarioMode` → `sweepScenarioModes` + `selectedScenarioModes`
- `parameters.thresholdScenario` → `sweepThresholdScenarios` + `selectedThresholdScenarios`
- `parameters.maxMonths` → `sweepMaxMonths` + `selectedMaxMonths`
- `parameters.nestedMC` → `sweepNestedMC`

**Handle generic parameters:**
For parameters NOT in the basic set (governmentActionFrequency, etc.), extend ParameterSweepConfig to support arbitrary numeric/discrete sweeps.

---

### Phase 2: Wire UI to Context (45 minutes)

**File:** `src/app/monte-carlo/page.tsx`

Replace stub with real integration:

```typescript
function MonteCarloPageContent() {
  const {
    sweepConfig,
    setSweepConfig,
    startSweep,
    isRunning,
    progress,
    aggregateStats
  } = useMonteCarlo();

  const [enhancedConfig, setEnhancedConfig] = useState<EnhancedSweepConfig>(() =>
    convertContextToEnhancedConfig(sweepConfig)
  );

  // Sync enhanced config changes to context
  const handleEnhancedConfigChange = (newConfig: EnhancedSweepConfig) => {
    setEnhancedConfig(newConfig);
    const contextConfig = convertEnhancedToContextConfig(newConfig);
    setSweepConfig(contextConfig);
  };

  // Wire start button to context
  const handleEnhancedSweep = async () => {
    await startSweep();
  };

  return (
    <EnhancedParameterConfig
      config={enhancedConfig}
      onChange={handleEnhancedConfigChange}
      onStartSweep={handleEnhancedSweep}
      isRunning={isRunning}
    />
  );
}
```

---

### Phase 3: Progress Tracking (30 minutes)

**File:** `src/components/monte-carlo/BatchProgressTracker.tsx` (update)

Wire to actual progress data:

```typescript
export function BatchProgressTracker() {
  const { progress, currentBatchId, isRunning } = useMonteCarlo();

  if (!progress || !currentBatchId) {
    return <EmptyState />;
  }

  return (
    <Panel title="Sweep Progress" glow="cyan">
      <ProgressBar
        current={progress.completedRuns}
        total={progress.totalRuns}
      />
      <RunStatusGrid>
        {progress.sweepGroups?.map(group => (
          <SweepGroupCard key={group.parameterName} group={group} />
        ))}
      </RunStatusGrid>
    </Panel>
  );
}
```

---

### Phase 4: Results Display (45 minutes)

**File:** `src/components/monte-carlo/SweepResultsPanel.tsx` (new)

Create results visualization:

```typescript
export function SweepResultsPanel() {
  const { aggregateStats, currentBatchId, manager } = useMonteCarlo();

  if (!aggregateStats) return null;

  return (
    <Panel title="Sweep Results" glow="green">
      {/* Outcome Distribution Chart */}
      <OutcomeDistributionChart stats={aggregateStats} />

      {/* Timeline Analysis */}
      <TimelineStatistics timeline={aggregateStats.timeline} />

      {/* Parameter Sensitivity (if sweep) */}
      {currentBatchId?.startsWith('sweep-') && (
        <ParameterSensitivityChart batchId={currentBatchId} />
      )}

      {/* Export Button */}
      <Button onClick={() => exportResults(aggregateStats)}>
        Export Results
      </Button>
    </Panel>
  );
}
```

---

### Phase 5: Extended Parameter Support (OPTIONAL - 1 hour)

**Problem:** EnhancedParameterConfig has 20+ parameters (governmentActionFrequency, socialAdaptationRate, etc.) but MonteCarloManager only supports 5 basic sweeps.

**Solution:** Extend ParameterSweepConfig to support arbitrary parameters:

```typescript
// In MonteCarloManager.ts
export interface ParameterSweepConfig {
  seeds: { start: number; count: number };
  sweepParameters: {
    // Existing
    thresholdScenarios?: Array<...>;
    scenarioModes?: ScenarioMode[];
    maxMonths?: number[];
    nestedMC?: boolean[];

    // NEW: Generic parameter sweeps
    customParameters?: {
      [paramName: string]: (string | number | boolean)[]
    };
  };
  fixedParameters: {
    scenario?: ScenarioMode;
    maxMonths?: number;

    // NEW: Generic fixed parameters
    customFixed?: {
      [paramName: string]: string | number | boolean
    };
  };
}
```

Then update `generateSweepConfigurations()` to include custom parameters in the cartesian product.

---

## Testing Strategy

### Test 1: Simple 2-Parameter Sweep (5 minutes)

```
Seeds: 42000-42002 (3 seeds)
Parameters:
  - thresholdScenario: ['doom', 'baseline'] (2 values)
Total: 3 × 2 = 6 simulations
Expected time: ~30 seconds (30s/sim, 5 concurrent)
```

**Validation:**
1. ✓ UI shows "6 total simulations"
2. ✓ Click "Start Parameter Sweep"
3. ✓ Progress tracker shows 0/6 → 3/6 → 6/6
4. ✓ Results panel appears with outcome distribution
5. ✓ No console errors

### Test 2: 3-Parameter Sweep (10 minutes)

```
Seeds: 42000-42004 (5 seeds)
Parameters:
  - thresholdScenario: ['doom', 'baseline', 'utopia'] (3 values)
  - maxMonths: [60, 120] (2 values)
Total: 5 × 3 × 2 = 30 simulations
Expected time: ~2 minutes
```

**Validation:**
1. ✓ Sweep groups shown (3 for thresholdScenario, 2 for maxMonths)
2. ✓ Real-time progress updates every second
3. ✓ Results show parameter sensitivity analysis
4. ✓ Export button works

### Test 3: Extended Parameter Sweep (OPTIONAL)

```
Seeds: 42000-42001 (2 seeds)
Parameters:
  - governmentActionFrequency: [1.0, 2.0, 3.5] (3 values)
  - socialAdaptationRate: [0.5, 1.0] (2 values)
Total: 2 × 3 × 2 = 12 simulations
```

Only test if Phase 5 (Extended Parameter Support) is implemented.

---

## Success Criteria

### Must Have (MVP)
- ✅ User clicks "Start Parameter Sweep" → simulations actually run
- ✅ Progress tracker shows real-time updates
- ✅ Results panel displays outcome distribution
- ✅ No console errors during sweep execution
- ✅ Test 1 (2-parameter sweep) completes successfully

### Nice to Have
- ✅ Parameter sensitivity charts (grouped by parameter value)
- ✅ Export results to JSON
- ✅ Pause/cancel sweep functionality
- ✅ Test 2 (3-parameter sweep) completes successfully

### Future Enhancement
- ⏸️ Extended parameter support (20+ simulation parameters)
- ⏸️ IndexedDB persistence (results survive page reload)
- ⏸️ Historical sweep comparison
- ⏸️ Advanced visualization (parallel coordinates, scatter matrix)

---

## Files to Modify

### New Files (3)
1. `src/lib/adapters/monteCarloConfigAdapter.ts` - Type conversion
2. `src/components/monte-carlo/SweepResultsPanel.tsx` - Results display
3. `src/components/monte-carlo/OutcomeDistributionChart.tsx` - Visualization

### Modified Files (2)
1. `src/app/monte-carlo/page.tsx` - Wire UI to context
2. `src/components/monte-carlo/BatchProgressTracker.tsx` - Connect to real data

### Optional (if Phase 5)
1. `src/lib/MonteCarloManager.ts` - Extend ParameterSweepConfig
2. `src/simulation-runner/monteCarlo.ts` - Support custom parameters

---

## Risks & Mitigations

**Risk 1:** Type adapter becomes complex with 20+ parameters
**Mitigation:** Start with 5 basic parameters (Phase 1-4), add extended support later (Phase 5)

**Risk 2:** Sweep runs crash browser (too many workers)
**Mitigation:** MonteCarloManager has built-in resource limits (5 concurrent, 10 max)

**Risk 3:** Results display is slow with large sweeps
**Mitigation:** Use virtualized lists for sweep groups, paginate results

**Risk 4:** User loses results on page refresh
**Mitigation:** IndexedDB persistence already in MonteCarloManager (currently TODO), can enable later

---

## Next Steps

1. **Route to far-future-ux-designer agent** with this plan
2. Agent implements Phase 1-4 (2-3 hours)
3. Test with simple 2-3 parameter sweep
4. If successful, optionally implement Phase 5 (extended parameters)
5. User can configure and run Monte Carlo parameter sweeps from UI

---

## Research Citations

**Worker Pool Pattern:**
- MonteCarloManager implements research-backed concurrency limits (5 concurrent normal, 8 degraded, 10 max)
- See `/research/multi_worker_orchestration_20251027.md` (18 citations)

**Parameter Sweep Methodology:**
- Standard practice in simulation validation (Saltelli et al., 2008)
- Enables sensitivity analysis and robustness testing
- MonteCarloManager generates cartesian product of all parameter values

**Progressive Degradation:**
- Frame rate monitoring for performance-aware throttling
- Resource tier system (normal → busy → degraded → at-capacity)
