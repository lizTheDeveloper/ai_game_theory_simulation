# Simulation Usage Guide

## Overview

The AI Alignment Game now has a pure simulation engine that can run independently of the UI. This enables:
- **Monte Carlo simulations** - Run thousands of games with varying parameters
- **Parameter sweeps** - Test how different settings affect outcomes
- **Headless testing** - Validate game balance programmatically
- **Reproducible research** - Seeded RNG for identical results

## Quick Start

### Run a Single Simulation

```bash
npx tsx scripts/runSimulation.ts --seed 42 --max-months 500
```

Output:
```
Starting single simulation...
Seed: 42
Max months: 500

Simulation Complete!
===================
Duration: 8ms
Months simulated: 245

Final Outcome: UTOPIA
Outcome Probability: 72.3%

Final State:
  Economic Stage: 3.45
  Quality of Life: 4.82
  Unemployment: 58.2%
  Trust in AI: 73.1%
  Social Adaptation: 65.4%
```

### Run Monte Carlo Simulation

```bash
npx tsx scripts/runSimulation.ts --monte-carlo --runs 1000
```

Output:
```
Starting Monte Carlo simulation...
Number of runs: 1000
Max months per run: 500

Progress: 0/1000 (0.0%)
Progress: 100/1000 (10.0%)
Progress: 200/1000 (20.0%)
...
Simulation complete. Analyzing results...

Completed in 8.5s
Average: 8.5ms per simulation

Monte Carlo Results Summary:
============================
Total Runs: 1000

Outcome Distribution:
  Utopia:       45.2%
  Dystopia:     32.8%
  Extinction:   18.5%
  Inconclusive: 3.5%

Average Final State:
  Quality of Life:  2.84
  Unemployment:     54.3%
  Economic Stage:   2.87
  Trust in AI:      48.6%
  Avg Months:       287
```

## Command Line Options

```bash
npx tsx scripts/runSimulation.ts [options]

Options:
  --monte-carlo       Run Monte Carlo simulation with multiple runs
  --runs N            Number of Monte Carlo runs (default: 1000)
  --seed N            Random seed for reproducibility
  --max-months N      Maximum months to simulate (default: 500)
  --export FILE       Export results to JSON file
  --help              Show help message
```

## Programmatic Usage

### Single Simulation

```typescript
import { SimulationEngine } from './src/simulation/engine';
import { createInitialState } from './scripts/runSimulation';

// Create engine with seed for reproducibility
const engine = new SimulationEngine({
  seed: 12345,
  maxMonths: 500,
  governmentActionFrequency: 0.5 // Test faster government response
});

// Run simulation
const initialState = createInitialState();
const result = engine.run(initialState, {
  maxMonths: 500,
  outcomeThreshold: 0.85 // Stop when outcome exceeds 85%
});

// Analyze results
console.log(`Final outcome: ${result.summary.finalOutcome}`);
console.log(`Confidence: ${(result.summary.finalOutcomeProbability * 100).toFixed(1)}%`);
console.log(`Economic stage reached: ${result.finalState.globalMetrics.economicTransitionStage.toFixed(2)}`);
```

### Monte Carlo Simulation

```typescript
import { runMonteCarlo } from './src/simulation-runner/monteCarlo';

const results = await runMonteCarlo(initialState, {
  numRuns: 10000,
  maxMonths: 500,
  
  // Test different parameter combinations
  parameters: {
    governmentActionFrequency: [0.08, 0.5, 1.0, 2.0],
    socialAdaptationRate: [0.5, 1.0, 1.5, 2.0]
  },
  
  // Add variation to initial conditions
  initialStateVariation: {
    aiCapability: { mean: 0.2, stdDev: 0.05 },
    aiAlignment: { mean: 0.8, stdDev: 0.1 },
    unemployment: { mean: 0.1, stdDev: 0.02 },
    trustInAI: { mean: 0.6, stdDev: 0.1 }
  }
});

// Analyze outcome distribution
console.log('Outcome probabilities:');
console.log(`  Utopia:     ${(results.outcomeDistribution.utopia * 100).toFixed(1)}%`);
console.log(`  Dystopia:   ${(results.outcomeDistribution.dystopia * 100).toFixed(1)}%`);
console.log(`  Extinction: ${(results.outcomeDistribution.extinction * 100).toFixed(1)}%`);

// Export to JSON for further analysis
exportResults(results, 'monte-carlo-results.json');
```

## Testing Scenarios

### Test Economic Balancing Plan Predictions

```typescript
// Scenario: "Slow Government Response"
// Prediction: High extinction risk
const slowGovResults = await runMonteCarlo(initialState, {
  numRuns: 1000,
  parameters: {
    governmentActionFrequency: [0.01] // Very slow response
  }
});

console.log(`Extinction rate: ${(slowGovResults.outcomeDistribution.extinction * 100).toFixed(1)}%`);
// Expected: >40% extinction rate
```

```typescript
// Scenario: "UBI Implementation"
// Prediction: Higher utopia probability
const stateWithUBI = {
  ...initialState,
  government: {
    ...initialState.government,
    activeRegulations: ['Universal Basic Income Program']
  }
};

const ubiResults = await runMonteCarlo(stateWithUBI, { numRuns: 1000 });
const noUBIResults = await runMonteCarlo(initialState, { numRuns: 1000 });

console.log(`Utopia rate with UBI:    ${(ubiResults.outcomeDistribution.utopia * 100).toFixed(1)}%`);
console.log(`Utopia rate without UBI: ${(noUBIResults.outcomeDistribution.utopia * 100).toFixed(1)}%`);
// Expected: UBI increases utopia probability by 15-25%
```

### Parameter Sensitivity Analysis

```typescript
// Test how government response rate affects outcomes
const govFrequencies = [0.05, 0.08, 0.1, 0.5, 1.0, 2.0];
const results = [];

for (const freq of govFrequencies) {
  const result = await runMonteCarlo(initialState, {
    numRuns: 500,
    parameters: {
      governmentActionFrequency: [freq]
    }
  });
  results.push({
    frequency: freq,
    utopiaRate: result.outcomeDistribution.utopia
  });
}

// Plot results to find optimal government frequency
console.table(results);
```

## Architecture

### Core Modules

```
src/simulation/
├── calculations.ts    # Pure calculation functions
├── economics.ts       # Economic model logic
└── engine.ts          # Simulation engine

src/simulation-runner/
└── monteCarlo.ts      # Monte Carlo runner
```

All simulation code is:
- **Pure** - No side effects
- **Deterministic** - Same seed → same results
- **Framework-agnostic** - No React, no Zustand
- **Unit testable** - Each function is testable

### Key Functions

#### Calculations Module
- `calculateUnemployment()` - AI-driven unemployment formula
- `calculateQualityOfLife()` - Outcome discriminator
- `calculateEffectiveControl()` - Government control effectiveness
- `calculateOutcomeProbabilities()` - Utopia/dystopia/extinction odds
- `calculateTrustChange()` - Complex trust dynamics
- `detectCrisis()` - Crisis detection logic

#### Economics Module
- `calculateEconomicStageTransition()` - Stage progression
- `calculateWealthDistributionChange()` - Policy effects
- `calculateSocialAdaptationRate()` - Context-dependent rates

#### Engine Module
- `SimulationEngine.step()` - Single time step
- `SimulationEngine.run()` - Full simulation
- `SeededRandom` - Reproducible RNG

## Performance

| Operation | Time |
|-----------|------|
| Single simulation (500 months) | ~5-10ms |
| Monte Carlo (1,000 runs) | ~5-10s |
| Monte Carlo (10,000 runs) | ~50-100s |

*Tested on M3 MacBook Pro*

## Next Steps

### Phase 2: Add Agent Actions
Currently, agent actions are simplified. Phase 2 will add:
- AI agent decision-making logic
- Government policy selection
- Society response actions

### Phase 3: Parallel Execution
Speed up Monte Carlo with:
- Web Workers (browser)
- Worker threads (Node.js)
- Potential 10-100x speedup

### Phase 4: Advanced Analysis
- Parameter optimization
- Outcome distribution visualization
- Statistical significance testing
- Export to Python/R for analysis

## Troubleshooting

### "Module not found" errors
Make sure you're using `tsx` to run TypeScript:
```bash
npx tsx scripts/runSimulation.ts
```

### Simulations are too slow
- Reduce `--max-months` (default 500)
- Reduce `--runs` for Monte Carlo
- Use `--seed` to test specific scenarios quickly

### Results are inconsistent
- Use `--seed` to ensure reproducibility
- Make sure you're comparing same parameters
- Check that initial state is identical

## Examples

See `scripts/runSimulation.ts` for complete working examples of:
- Single simulation execution
- Monte Carlo with parameter sweeps
- Initial state variation
- Results analysis and export

