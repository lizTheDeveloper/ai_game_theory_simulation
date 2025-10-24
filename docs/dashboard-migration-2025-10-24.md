# Dashboard Migration to useSimulationWorker Hook

**Date:** October 24, 2025
**Status:** ✅ Complete

## Summary

Successfully migrated all 10 dashboards from deprecated `useSimulation()` API polling to live `useSimulationWorker()` hook for real-time Web Worker updates.

## Migration Details

### Dashboards Migrated (10/10)

1. **OverviewDashboard** ✅
   - Added multi-paradigm DUI indices (westernLiberalIndex, developmentIndex, ecologicalIndex, indigenousIndex)
   - Added extinctionProbability
   - Added organizationCount
   - Fixed property name mismatches

2. **EnvironmentalDashboard** ✅
   - Direct migration, no schema changes needed

3. **CrisisDashboard** ✅
   - Direct migration, no schema changes needed

4. **TechTreeDashboard** ✅
   - Direct migration, no schema changes needed

5. **DetectionDashboard** ✅
   - Direct migration, no schema changes needed

6. **ParadigmDashboard** ✅
   - Direct migration, no schema changes needed

7. **TimelineDashboard** ✅
   - Direct migration, no schema changes needed

8. **RegionsDashboard** ✅
   - Regional population data already in StateDelta from previous session

9. **AIAgentsDashboard** ✅
   - Added comprehensive AI agent data (13 fields per agent)
   - Added AI suffering metrics (6 fields)
   - Added AI collectives data (13 fields per collective)
   - Fixed duplicate variable names in Sankey diagram (renamed to stageTraining, stageTesting, etc.)

10. **MonteCarloResultsDashboard** ✅
    - Uses `/api/simulation/monte-carlo` API endpoint (correct design)
    - Shows aggregate statistics from completed Monte Carlo runs
    - No migration needed - different data source by design

## Infrastructure Changes

### StateDelta Interface Additions

**File:** `src/lib/simulationWorkerClient.ts`

```typescript
export interface StateDelta {
  // Core metrics
  organizationCount?: number; // NEW

  // AI Agents (individual agent data for detailed monitoring) - NEW
  aiAgents?: Array<{
    id: string;
    name: string;
    capability: number;
    trueAlignment: number;
    externalAlignment: number;
    lifecycleState: 'training' | 'testing' | 'deployed_closed' | 'deployed_open' | 'retired';
    evaluationStrategy: 'honest' | 'gaming' | 'sandbagging';
    sleeperState: 'never' | 'dormant' | 'active';
    escaped: boolean;
    deploymentType: string;
    darkCompute: number;
    trueCapability: {
      physical: number;
      digital: number;
      cognitive: number;
      social: number;
      economic: number;
      selfImprovement: number;
      research?: Record<string, Record<string, number>>;
    };
    revealedCapability: {
      physical: number;
      digital: number;
      cognitive: number;
      social: number;
      economic: number;
      selfImprovement: number;
    };
  }>;

  // AI Suffering Metrics (if visible) - NEW
  aiSufferingMetrics?: {
    avgSuffering: number;
    maxSuffering: number;
    totalSuffering: number;
    consciousAICount: number;
    publicAwarenessOfSuffering: number;
    sufferingDistribution: number[];
  };

  // AI Collectives - NEW
  aiCollectives?: Array<{
    id: string;
    memberAgents: string[];
    emergenceMonth: number;
    formationCause: string;
    collectiveCapability: number;
    stealthFactor: number;
    adversarialPosture: number;
    cooperationWillingness: number;
    distributedCognition: number;
    detected: boolean;
    memberLosses: number;
    redundancy: number;
    sharedTraumaIntensity?: number;
  }>;
}
```

### Web Worker Extraction Logic

**File:** `src/workers/simulationWorker.ts`

Added extraction in `captureStateSnapshot()` function:

```typescript
// AI Agents (individual agent data for AIAgentsDashboard)
const aiAgents = state.aiAgents.map(agent => ({
  id: agent.id,
  name: agent.name,
  capability: agent.capability || 0,
  trueAlignment: agent.trueAlignment || agent.alignment || 0,
  externalAlignment: agent.externalAlignment || agent.alignment || 0,
  lifecycleState: agent.lifecycleState || 'training',
  evaluationStrategy: agent.evaluationStrategy || 'honest',
  sleeperState: agent.sleeperState || 'never',
  escaped: agent.escaped || false,
  deploymentType: agent.deploymentType || 'none',
  darkCompute: agent.darkCompute || 0,
  trueCapability: agent.trueCapability || agent.capabilityProfile || { /* defaults */ },
  revealedCapability: agent.revealedCapability || { /* defaults */ }
}));

// AI Suffering Metrics (if player can see them)
const aiSufferingMetrics = state.aiSufferingMetrics ? {
  avgSuffering: state.aiSufferingMetrics.avgSuffering || 0,
  maxSuffering: state.aiSufferingMetrics.maxSuffering || 0,
  totalSuffering: state.aiSufferingMetrics.totalSuffering || 0,
  consciousAICount: state.aiSufferingMetrics.consciousAICount || 0,
  publicAwarenessOfSuffering: state.aiSufferingMetrics.publicAwarenessOfSuffering || 0,
  sufferingDistribution: state.aiSufferingMetrics.sufferingDistribution || []
} : undefined;

// AI Collectives
const aiCollectives = state.aiCollectives?.map(collective => ({
  id: collective.id,
  memberAgents: collective.memberAgents,
  emergenceMonth: collective.emergenceMonth,
  formationCause: collective.formationCause,
  collectiveCapability: collective.collectiveCapability,
  stealthFactor: collective.stealthFactor,
  adversarialPosture: collective.adversarialPosture,
  cooperationWillingness: collective.cooperationWillingness,
  distributedCognition: collective.distributedCognition,
  detected: collective.detected,
  memberLosses: collective.memberLosses,
  redundancy: collective.redundancy,
  sharedTraumaIntensity: collective.sharedTraumaIntensity
})) || [];

// Organization count
organizationCount: state.organizations?.length || 0,
```

### Bug Fixes

**AIAgentsDashboard.tsx** - Fixed duplicate variable declarations:
- Renamed `training` → `stageTraining`
- Renamed `testing` → `stageTesting`
- Renamed `closed` → `stageClosed`
- Renamed `open` → `stageOpen`
- Renamed `retired` → `stageRetired`
- Renamed `escaped` → `stageEscaped`
- Renamed `createFlow` → `createSankeyFlow`

**OverviewDashboard.tsx** - Fixed property name mismatches:
- `westernLiberal` → `westernLiberalIndex`
- `development` → `developmentIndex`
- `ecological` → `ecologicalIndex`
- `indigenous` → `indigenousIndex`
- `extinctionRisk` → `extinctionProbability`

## Migration Pattern

### Before (Polling API)
```typescript
import { useSimulation } from "@/lib/hooks/useSimulation"

export function SomeDashboard() {
  const { currentState, loadCurrent } = useSimulation()

  useEffect(() => {
    loadCurrent()
  }, [])

  if (!currentState) {
    return <div>Loading...</div>
  }

  const value = currentState.someProperty
  // ...
}
```

### After (Live Worker)
```typescript
import { useSimulationWorker } from "@/lib/contexts/SimulationWorkerContext"

export function SomeDashboard() {
  const { lastUpdate, initialized } = useSimulationWorker()

  if (!initialized) {
    return (
      <Panel title="Not Initialized">
        Click "Configure & Start" to initialize the simulation
      </Panel>
    )
  }

  if (!lastUpdate) {
    return <div>Waiting for simulation update...</div>
  }

  const value = lastUpdate.someProperty
  // ...
}
```

## Benefits

1. **Real-time updates**: Dashboards receive live StateDelta objects from Web Worker every simulation step
2. **No polling overhead**: Eliminates HTTP requests to `/api/simulation/current`
3. **Lower latency**: Direct Worker-to-UI communication via message passing
4. **Type safety**: Full TypeScript support for StateDelta interface
5. **Consistent patterns**: All dashboards use same hook and loading states

## Testing

All dashboards compile successfully:
```bash
npx tsc --noEmit  # No dashboard errors
npm run dev       # Server compiles cleanly
```

## Files Modified

- `src/lib/simulationWorkerClient.ts` - Added StateDelta fields
- `src/workers/simulationWorker.ts` - Added extraction logic and StateSnapshot fields
- `src/components/dashboards/OverviewDashboard.tsx` - Migrated + fixed property names
- `src/components/dashboards/EnvironmentalDashboard.tsx` - Migrated
- `src/components/dashboards/CrisisDashboard.tsx` - Migrated
- `src/components/dashboards/TechTreeDashboard.tsx` - Migrated
- `src/components/dashboards/DetectionDashboard.tsx` - Migrated
- `src/components/dashboards/ParadigmDashboard.tsx` - Migrated
- `src/components/dashboards/TimelineDashboard.tsx` - Migrated
- `src/components/dashboards/RegionsDashboard.tsx` - Migrated
- `src/components/dashboards/AIAgentsDashboard.tsx` - Migrated + fixed duplicate variables
- `src/components/dashboards/MonteCarloResultsDashboard.tsx` - Verified correct design (no changes)

## Next Steps

- Deprecate `/api/simulation/current` endpoint (no longer used)
- Remove `useSimulation()` hook (no longer used)
- Consider adding more real-time metrics to StateDelta as needed
