# Simulation Architecture Refactoring Plan

## Problem Statement

The current game architecture has simulation logic tightly coupled to the UI layer (Zustand store, React components). This makes it difficult to:
- Run Monte Carlo simulations independently of the UI
- Test economic models and scenarios programmatically
- Validate balancing assumptions from the economic-system-balancing-plan
- Run parameter sweeps and sensitivity analyses

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

### Phase 1: Extract Core Simulation Engine

#### 1.1 Create Pure Calculation Functions
Extract from `gameStore.ts` and `actionSystem.ts`:
- `calculateQualityOfLife(state): number`
- `calculateEffectiveControl(state): number`
- `calculateOutcomeProbabilities(state): OutcomeMetrics`
- `calculateUnemploymentStabilityImpact(unemployment, stage, wealth): number`
- `calculateUnemployment(state): number` (NEW - from balancing plan)

#### 1.2 Create State Transition Functions
```typescript
// simulation/transitions.ts
export interface SimulationState extends GameState {
  // All state is here, no Zustand dependencies
}

export function advanceDay(state: SimulationState): SimulationState {
  // Pure function - returns new state
}

export function advanceMonth(state: SimulationState): SimulationState {
  // Combines daily updates, agent actions, calculations
}

export function processAgentActions(state: SimulationState): SimulationState {
  // All agent decision making
}
```

#### 1.3 Create Agent Decision Modules
```typescript
// simulation/agents/aiAgent.ts
export interface AIAgentDecision {
  action: GameAction;
  reasoning: string;
  expectedUtility: number;
}

export function selectAIAction(
  agent: AIAgent, 
  state: SimulationState
): AIAgentDecision {
  // Pure decision logic
}

export function executeAIAction(
  agent: AIAgent,
  action: GameAction,
  state: SimulationState
): SimulationState {
  // Pure execution - returns new state
}
```

### Phase 2: Build Simulation Engine API

```typescript
// simulation/engine.ts
export class SimulationEngine {
  constructor(
    private config: SimulationConfig,
    private rng: RandomNumberGenerator // Seedable RNG for reproducibility
  ) {}

  /**
   * Initialize a new simulation from config
   */
  initialize(): SimulationState {
    // Create initial state
  }

  /**
   * Step the simulation forward by one time unit
   */
  step(state: SimulationState): SimulationResult {
    return {
      state: this.advanceSimulation(state),
      events: [...],
      metrics: this.calculateMetrics(state)
    };
  }

  /**
   * Run simulation to completion or max steps
   */
  run(
    initialState: SimulationState,
    maxSteps: number = 1000,
    stopConditions?: StopCondition[]
  ): SimulationRun {
    let state = initialState;
    const history: SimulationState[] = [state];
    
    for (let step = 0; step < maxSteps; step++) {
      const result = this.step(state);
      state = result.state;
      history.push(state);
      
      if (this.shouldStop(state, stopConditions)) {
        break;
      }
    }
    
    return {
      finalState: state,
      history,
      metrics: this.analyzeRun(history)
    };
  }
}
```

### Phase 3: Create Monte Carlo Runner

```typescript
// simulation-runner/monteCarlo.ts
export interface MonteCarloConfig {
  numRuns: number;
  maxSteps: number;
  initialStateVariation: StateVariationConfig;
  parameters: ParameterSweep;
  parallel?: boolean;
}

export interface MonteCarloResults {
  runs: SimulationRun[];
  aggregateMetrics: AggregateStatistics;
  outcomeDistribution: {
    utopia: number;
    dystopia: number;
    extinction: number;
  };
  parameterSensitivity: ParameterSensitivityAnalysis;
}

export async function runMonteCarlo(
  config: MonteCarloConfig
): Promise<MonteCarloResults> {
  const engine = new SimulationEngine(config, createSeededRNG());
  
  const runs = await (config.parallel 
    ? runParallel(config, engine)
    : runSequential(config, engine)
  );
  
  return analyzeResults(runs);
}
```

### Phase 4: Update UI Layer

```typescript
// lib/gameStore.ts (simplified)
import { SimulationEngine } from '@/simulation/engine';

export const useGameStore = create<GameStore>()(
  immer((set, get) => {
    const engine = new SimulationEngine(defaultConfig, randomRNG());
    
    return {
      // UI state
      ...engine.initialize(),
      
      // Actions become thin wrappers
      dispatch: (action: GameAction) => {
        set((state) => {
          // Just call the engine
          const result = engine.step(state);
          Object.assign(state, result.state);
        });
      },
      
      processMonthlyUpdate: () => {
        set((state) => {
          const result = engine.step(state);
          Object.assign(state, result.state);
        });
      },
      
      // Calculations delegate to engine
      calculateQualityOfLife: () => {
        return engine.calculateQualityOfLife(get());
      }
    };
  })
);
```

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
- [ ] `src/simulation/engine.ts` - Core simulation engine
- [ ] `src/simulation/calculations.ts` - Pure calculation functions
- [ ] `src/simulation/agents/` - Agent decision logic
- [ ] `src/simulation-runner/monteCarlo.ts` - Monte Carlo runner
- [ ] `scripts/runSimulation.ts` - CLI runner script

### Documentation
- [ ] API documentation for simulation engine
- [ ] Guide for running headless simulations
- [ ] Monte Carlo configuration guide
- [ ] Analysis and visualization guide

### Tests
- [ ] Unit tests for all pure functions
- [ ] Integration tests for full simulation runs
- [ ] Validation tests for economic scenarios
- [ ] Performance benchmarks

### Analysis
- [ ] Monte Carlo results for baseline scenario
- [ ] Parameter sensitivity analysis
- [ ] Validation of economic balancing plan
- [ ] Report on optimal game parameters

## Next Steps

1. **Review and approve this plan**
2. **Start with Phase 1**: Extract core simulation logic
3. **Build test harness**: Ensure new system matches old behavior
4. **Implement Monte Carlo runner**: Enable batch simulations
5. **Run validation scenarios**: Test economic balancing predictions
6. **Iterate and refine**: Adjust based on simulation results

This refactoring will enable serious modeling and analysis while keeping the game playable and fun.

