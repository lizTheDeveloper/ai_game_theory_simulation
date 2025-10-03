# Simulation Architecture Refactoring Plan

**Status:** Phase 2 Complete ✅ | Phase 3: UI Integration Pending

## Problem Statement

The current game architecture has simulation logic tightly coupled to the UI layer (Zustand store, React components). This makes it difficult to:
- Run Monte Carlo simulations independently of the UI ✅ **SOLVED**
- Test economic models and scenarios programmatically ✅ **SOLVED**
- Validate balancing assumptions from the economic-system-balancing-plan ✅ **SOLVED**
- Run parameter sweeps and sensitivity analyses ✅ **SOLVED**

## Architecture Goals

### 1. **Separation of Concerns**
```
┌─────────────────────────────────────────────┐
│            UI Layer (React)                 │
│  - Components                               │
│  - Visualization                            │
│  - User interaction                         │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│      State Management (Zustand)             │
│  - UI state synchronization                 │
│  - Event subscriptions                      │
│  - Thin wrapper around core engine          │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│     Core Simulation Engine (Pure)           │
│  - Game state transitions                   │
│  - Agent decision making                    │
│  - Economic calculations                    │
│  - Event processing                         │
│  - All game mechanics                       │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│       Simulation Runner (Headless)          │
│  - Monte Carlo simulation                   │
│  - Parameter sweeps                         │
│  - Batch execution                          │
│  - Results aggregation                      │
└─────────────────────────────────────────────┘
```

### 2. **Pure Functional Core**

The simulation engine should be:
- **Deterministic** (same inputs → same outputs)
- **Framework-agnostic** (no Zustand, no React)
- **Immutable** (no mutation, returns new state)
- **Composable** (small functions that combine)
- **Testable** (easy to unit test)

## File Structure

```
src/
├── simulation/                    # NEW: Core simulation engine
│   ├── engine.ts                  # Main simulation engine
│   ├── calculations.ts            # Pure calculation functions
│   ├── transitions.ts             # State transition logic
│   ├── agents/
│   │   ├── aiAgent.ts            # AI agent decision logic
│   │   ├── governmentAgent.ts    # Government logic
│   │   └── societyAgent.ts       # Society logic
│   ├── economics.ts               # Economic model calculations
│   ├── crisis.ts                  # Crisis detection and events
│   └── outcomes.ts                # Outcome probability calculations
│
├── simulation-runner/             # NEW: Headless simulation tools
│   ├── monteCarlo.ts             # Monte Carlo runner
│   ├── parameterSweep.ts         # Parameter sweep utilities
│   ├── analysis.ts               # Statistical analysis tools
│   └── export.ts                 # Data export utilities
│
├── lib/                           # MODIFIED: Thin wrappers
│   ├── gameStore.ts              # Zustand wrapper around engine
│   ├── actionSystem.ts           # Moved to simulation/agents
│   └── eventSystem.ts            # Moved to simulation/
│
└── scripts/                       # NEW: Analysis scripts
    ├── runSimulation.ts          # CLI simulation runner
    ├── testScenarios.ts          # Test economic scenarios
    └── generateReports.ts        # Generate analysis reports
```

## Implementation Steps

### Phase 1: Extract Core Simulation Engine ✅ **COMPLETE**

#### 1.1 Create Pure Calculation Functions ✅
Extracted from `gameStore.ts` and `actionSystem.ts` into `src/simulation/calculations.ts`:
- ✅ `calculateQualityOfLife(state): number`
- ✅ `calculateEffectiveControl(state): number`
- ✅ `calculateOutcomeProbabilities(state): OutcomeMetrics`
- ✅ `calculateUnemploymentStabilityImpact(unemployment, stage, wealth): number`
- ✅ `calculateUnemployment(state): number` (from balancing plan)
- ✅ `calculateAICapabilityGrowthRate()` - recursive self-improvement
- ✅ `calculateAlignmentDrift()` - Goodhart's Law
- ✅ `calculateAlignmentResearchEffect()` - research interventions
- ✅ `calculateCumulativeRegulationEffect()` - stacking regulations
- ✅ `calculateComputeGovernanceEffect()` - compute limits
- ✅ `calculateRacingDynamicsPressure()` - competitive dynamics
- ✅ `determineActualOutcome()` - definitive outcome determination

#### 1.2 Create State Transition Functions ✅
Implemented in `src/simulation/engine.ts`:
- ✅ `SimulationEngine.step()` - advances simulation by one time unit
- ✅ `SimulationEngine.run()` - runs full simulation with stop conditions
- ✅ Pure state transitions using `SeededRandom` for reproducibility
- ✅ Economic model in `src/simulation/economics.ts` with stage transitions
- ✅ Crisis detection and event generation
- ✅ Outcome determination (probability vs actual)

#### 1.3 Create Agent Decision Modules ✅
Implemented agent logic with realistic coordination hierarchy:
- ✅ `src/simulation/agents/aiAgent.ts` - Strategic AI decision-making
  - Action selection with weighted priorities
  - Development mode switching (fast/careful)
  - Capability growth with recursive self-improvement
  - Response to regulatory pressure
- ✅ `src/simulation/agents/governmentAgent.ts` - Coordinated government response
  - Priority-based action selection (unemployment vs AI threat)
  - Alignment research investment
  - Compute governance implementation
  - Regulation with cumulative effects
- ✅ `src/simulation/agents/societyAgent.ts` - Stochastic societal reactions
  - Threshold-based protest/support
  - Demand for safety/progress
  - Economic adaptation
- ✅ `src/simulation/crisisPoints.ts` - Critical decision moments
  - Crisis choice points for agents
  - Structural consequences of choices

### Phase 2: Build Simulation Engine API ✅ **COMPLETE**

Fully implemented in `src/simulation/engine.ts`:

```typescript
export class SimulationEngine {
  private rng: SeededRandom;
  
  constructor(seed?: number) {
    this.rng = new SeededRandom(seed);
  }

  // ✅ Step function with agent actions, economic updates, crisis detection
  step(state: GameState, config: SimulationConfig): GameState
  
  // ✅ Full simulation run with hierarchical logging
  run(config: SimulationConfig): SimulationRunResult {
    // Includes:
    // - Agent action processing (AI: 4x/month, Gov: 1x/month, Society: 1x/month)
    // - Economic stage transitions
    // - Crisis point detection and choices
    // - Outcome determination (actual vs probability)
    // - Stop conditions based on outcomes or max months
    // - Hierarchical logging (full/monthly/quartile/summary)
  }
}
```

**Key Features Implemented:**
- ✅ Seedable RNG for reproducible simulations
- ✅ Hierarchical logging system (`src/simulation/logging.ts`)
- ✅ Agent coordination hierarchy (AI > Government > Society)
- ✅ Crisis choice points with structural consequences
- ✅ Actual outcome determination vs probability
- ✅ Economic stage transitions with realistic thresholds

### Phase 3: Create Monte Carlo Runner ✅ **COMPLETE**

Fully implemented in `src/simulation-runner/monteCarlo.ts`:

```typescript
// ✅ Batch simulation runner
export function runMonteCarlo(
  baseConfig: SimulationConfig,
  runs: number,
  seedOffset: number = 0
): MonteCarloResults

// ✅ Parameter sweep with multiple values
export function runParameterSweep(
  baseConfig: SimulationConfig,
  parameterSweeps: ParameterSweeps,
  runsPerConfig: number = 100
): ParameterSweepResults

// ✅ Export results with hierarchical summarization
export function exportResults(
  results: MonteCarloResults,
  filePath: string
): void
```

**Features Implemented:**
- ✅ Batch simulation execution with different seeds
- ✅ Outcome distribution analysis (utopia/dystopia/extinction)
- ✅ Parameter sweep capabilities
- ✅ Hierarchical summarization (prevents memory overflow)
- ✅ Average trajectory calculation across runs
- ✅ Quartile progression analysis
- ✅ Event frequency analysis
- ✅ JSON export for external analysis

**Scripts Created:**
- ✅ `scripts/runSimulation.ts` - CLI for single/batch simulations
- ✅ `scripts/testScenarios.ts` - Scenario comparison tool
- ✅ `scripts/testBalancedMechanics.ts` - Balance validation
- ✅ `scripts/diagnoseAgentBehavior.ts` - Agent action tracking

**Documentation:**
- ✅ `SIMULATION_USAGE.md` - Usage guide
- ✅ `HIERARCHICAL_LOGGING.md` - Logging system docs
- ✅ `PHASE_2_COMPLETE.md` - Phase 2 summary

### Phase 4: Update UI Layer ⏳ **PENDING**

**Status:** Not started - UI still uses old `gameStore.ts` directly

**Planned Changes:**
```typescript
// lib/gameStore.ts (to be simplified)
import { SimulationEngine } from '@/simulation/engine';
import { selectAIAction, executeAIAction } from '@/simulation/agents/aiAgent';
// ... etc

export const useGameStore = create<GameStore>()(
  immer((set, get) => {
    const engine = new SimulationEngine();
    
    return {
      // UI state
      ...createInitialState(),
      
      // Actions become thin wrappers around simulation engine
      dispatch: (action: GameAction) => {
        set((state) => {
          const newState = engine.step(state, defaultConfig);
          Object.assign(state, newState);
        });
      },
      
      processMonthlyUpdate: () => {
        set((state) => {
          const newState = engine.step(state, defaultConfig);
          Object.assign(state, newState);
        });
      },
      
      // Calculations delegate to pure functions
      calculateQualityOfLife: () => {
        return calculateQualityOfLife(get());
      }
    };
  })
);
```

**Tasks Remaining:**
- [ ] Refactor `gameStore.ts` to use `SimulationEngine`
- [ ] Remove duplicated calculation logic from UI
- [ ] Update components to work with new store
- [ ] Verify game plays identically to before
- [ ] Test all UI interactions

## Testing Strategy

### Unit Tests
- Test each pure calculation function independently
- Test state transitions with known inputs/outputs
- Test agent decision logic with various scenarios

### Integration Tests
- Test full simulation runs
- Validate economic scenarios from balancing plan
- Verify crisis triggers at correct thresholds

### Validation Tests
```typescript
// scripts/testScenarios.ts
describe('Economic Balancing Scenarios', () => {
  test('Stage 2 crisis triggers at 25% unemployment', async () => {
    const engine = new SimulationEngine(config);
    const state = engine.initialize();
    
    // Run until unemployment hits 25%
    const result = await engine.runUntil(state, 
      (s) => s.society.unemploymentLevel >= 0.25
    );
    
    expect(result.finalState.globalMetrics.economicTransitionStage)
      .toBeGreaterThanOrEqual(2.0);
    expect(result.events).toContainCrisis('Mass Displacement Crisis');
  });
  
  test('UBI pathway leads to higher utopia probability', async () => {
    const results = await runMonteCarlo({
      numRuns: 1000,
      parameters: {
        implementUBI: [true, false],
        unemploymentThreshold: [0.25]
      }
    });
    
    const withUBI = results.byParameter({ implementUBI: true });
    const withoutUBI = results.byParameter({ implementUBI: false });
    
    expect(withUBI.outcomeDistribution.utopia)
      .toBeGreaterThan(withoutUBI.outcomeDistribution.utopia);
  });
});
```

## Example: Running Headless Simulations

```typescript
// scripts/runSimulation.ts
import { SimulationEngine } from '@/simulation/engine';
import { runMonteCarlo } from '@/simulation-runner/monteCarlo';

async function main() {
  console.log('Running Monte Carlo simulation...\n');
  
  const results = await runMonteCarlo({
    numRuns: 10000,
    maxSteps: 1000,
    parallel: true,
    parameters: {
      governmentActionFrequency: [0.08, 0.5, 1.0],
      socialAdaptationRate: [0.3, 1.0, 2.0],
      initialAIAlignment: [0.5, 0.7, 0.9]
    },
    initialStateVariation: {
      aiCapability: { mean: 0.2, stdDev: 0.05 },
      unemployment: { mean: 0.1, stdDev: 0.02 }
    }
  });
  
  console.log('Results:');
  console.log(`Total runs: ${results.runs.length}`);
  console.log(`\nOutcome Distribution:`);
  console.log(`  Utopia:     ${(results.outcomeDistribution.utopia * 100).toFixed(1)}%`);
  console.log(`  Dystopia:   ${(results.outcomeDistribution.dystopia * 100).toFixed(1)}%`);
  console.log(`  Extinction: ${(results.outcomeDistribution.extinction * 100).toFixed(1)}%`);
  
  console.log(`\nParameter Sensitivity:`);
  results.parameterSensitivity.forEach(param => {
    console.log(`  ${param.name}: ${param.importance.toFixed(3)}`);
  });
  
  // Export detailed results
  await exportResults(results, 'results/monte-carlo-run-1.json');
  await generatePlots(results, 'results/plots/');
}

main();
```

## Benefits of This Architecture

### For Game Development
- ✅ Easier to test and debug game mechanics
- ✅ Faster iteration on balance changes
- ✅ Clear separation between UI and logic
- ✅ Reproducible game states (seedable RNG)

### For Modeling & Analysis
- ✅ Run simulations without spinning up UI
- ✅ Parallel execution for faster Monte Carlo
- ✅ Easy parameter sweeps and sensitivity analysis
- ✅ Export data for external analysis (Python, R, etc.)

### For Validation
- ✅ Test economic balancing plan scenarios
- ✅ Validate crisis thresholds
- ✅ Verify lock-in pathway effects
- ✅ Statistical validation of game balance

## Migration Strategy

### Phase 1: Extract (No Breaking Changes)
- Create new simulation/ directory
- Copy logic from gameStore and actionSystem
- Refactor into pure functions
- Keep old code working

### Phase 2: Test (Validate Equivalence)
- Run parallel tests: old system vs new system
- Verify identical outputs for same inputs
- Add comprehensive test coverage
- Fix any discrepancies

### Phase 3: Integrate (Update UI)
- Update gameStore to use simulation engine
- Remove duplicated logic
- Verify game still works identically
- Monitor for regressions

### Phase 4: Extend (Add New Features)
- Build Monte Carlo runner
- Create analysis scripts
- Generate validation reports
- Run economic scenario tests

## Deliverables

### Code
- ✅ `src/simulation/engine.ts` - Core simulation engine
- ✅ `src/simulation/calculations.ts` - Pure calculation functions
- ✅ `src/simulation/economics.ts` - Economic model with stage transitions
- ✅ `src/simulation/logging.ts` - Hierarchical logging system
- ✅ `src/simulation/crisisPoints.ts` - Crisis choice point system
- ✅ `src/simulation/agents/` - Agent decision logic (AI, Government, Society)
- ✅ `src/simulation-runner/monteCarlo.ts` - Monte Carlo runner
- ✅ `scripts/runSimulation.ts` - CLI runner script
- ✅ `scripts/testScenarios.ts` - Scenario testing
- ✅ `scripts/testBalancedMechanics.ts` - Balance validation
- ✅ `scripts/diagnoseAgentBehavior.ts` - Agent diagnostics
- ⏳ `src/lib/gameStore.ts` - UI integration (pending)

### Documentation
- ✅ `SIMULATION_USAGE.md` - Guide for running headless simulations
- ✅ `HIERARCHICAL_LOGGING.md` - Logging system documentation
- ✅ `PHASE_2_COMPLETE.md` - Phase 2 completion summary
- ✅ `devlog/simulation-architecture-refactor.md` - Implementation notes
- ✅ `devlog/phase-2-agent-actions-integration.md` - Agent integration notes
- ✅ `devlog/scenario-analysis-oct-2024.md` - Balance analysis
- ✅ `devlog/realistic-balance-oct-2024.md` - Realistic balance philosophy
- ✅ `devlog/realism-over-balance.md` - Realism priority documentation
- ✅ `devlog/balance-philosophy.md` - Balance design philosophy
- ⏳ API documentation for simulation engine (partial)

### Tests & Validation
- ✅ Manual testing of pure functions via test scripts
- ✅ Integration tests via scenario comparison
- ✅ Economic scenario validation (Stage 0-4 transitions)
- ✅ Balance mechanics validation (recursive growth, alignment drift, etc.)
- ✅ Agent behavior diagnostics
- ⏳ Automated unit tests (not yet implemented)
- ⏳ Performance benchmarks (not yet implemented)

### Analysis
- ✅ Monte Carlo results for multiple scenarios
- ✅ Baseline vs intervention comparison
- ✅ Outcome distribution analysis (utopia/dystopia/extinction rates)
- ✅ Agent action frequency tracking
- ✅ Crisis event analysis
- ⏳ Parameter sensitivity analysis (basic implementation, needs refinement)
- ⏳ Optimal game parameters report (pending Phase 4)

## Current Status & Next Steps

### ✅ Completed (Phases 1-3)
1. ✅ **Phase 1**: Extracted core simulation logic into pure functions
2. ✅ **Phase 2**: Built simulation engine with agent actions
3. ✅ **Phase 3**: Implemented Monte Carlo runner with hierarchical logging
4. ✅ Validated economic model and crisis detection
5. ✅ Implemented realistic agent decision-making with coordination hierarchy
6. ✅ Created crisis choice point system
7. ✅ Distinguished outcome probability from actual outcomes
8. ✅ Reframed economic dynamics for flexible government responses

### ⏳ In Progress
- **Economic System Implementation**: Implementing the new `realistic-economic-dynamics.md` plan
  - Priority-based government responses
  - Structural consequences of intervention choices
  - Competing priorities system
  - Crisis multipliers

### 📋 Pending (Phase 4+)
1. **Phase 4**: Update UI layer to use simulation engine
   - Refactor `gameStore.ts` to be thin wrapper
   - Remove duplicated calculations from UI
   - Test game plays identically
2. **Fix Quartile Logging Bug**: Month 0 appearing in all quartile snapshots
3. **Run Large-Scale Analysis**: 1000+ simulations to map outcome space
4. **Analyze Crisis Choices**: Determine which choices lead to which outcomes
5. **Automated Testing**: Unit tests for all pure functions
6. **Performance Optimization**: Benchmark and optimize simulation speed
7. **Parameter Tuning**: Fine-tune based on large-scale results

### 🎯 Current Focus
Implementing the new economic dynamics plan with:
- Flexible, priority-driven government responses
- Structural consequences from intervention types
- Realistic crisis multipliers
- Emergent outcomes rather than predetermined paths

This refactoring has successfully enabled serious modeling and analysis. The simulation engine is now defensible to AI safety researchers, prioritizing realism over game balance.

