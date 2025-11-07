# Module 07: Testing & Validation

**Learning Objectives:**
1. Understand why Monte Carlo simulation is critical for research-backed projects
2. Learn how to run deterministic simulations with RNG seeds
3. Write unit tests for individual systems and utilities
4. Create integration tests for multi-system interactions
5. Validate against historical events (Black Death, COVID-19, 2008 crisis)
6. Use baseline tests to prevent regressions during refactoring
7. Integrate testing into autonomous workflows

---

## Section 00: The Big Picture

### The Problem: Research Simulations Need Different Testing

Traditional software testing validates "does it do what I designed?"

**Research simulation testing validates:** "Does it accurately model reality?"

**Example failure mode:**
```typescript
// Traditional software - this "works" (no bugs)
function calculateAlignment(agent: AIAgent): number {
  return 0.8; // Everyone is well-aligned! 🎉
}

// But... this is WRONG for a research simulation
// Real alignment is complex, varies over time, has failure modes
```

Traditional tests would pass (no crashes, return type correct). But the simulation is scientifically invalid.

### The Solution: Multi-Layer Validation

**Research simulations need 5 validation layers:**

1. **Unit tests** - Individual functions work correctly
2. **Integration tests** - Systems interact correctly
3. **Historical validation** - Match known historical events
4. **Monte Carlo validation** - Statistical properties are sound
5. **Research validation** - Parameters match peer-reviewed sources

**This module focuses on layers 1-4. Layer 5 (research validation) is covered in Module 08: Quality Gates.**

### The Principle: Determinism + Stochasticity

**Paradox:** Simulations must be both:
- **Deterministic** (same seed → same outcome, for debugging)
- **Stochastic** (different runs → different outcomes, for realism)

**Solution:** Deterministic RNG with seed control

```typescript
// Same seed = same outcome (debugging)
const engine1 = new SimulationEngine({ seed: 42 });
const result1 = engine1.run(initialState);

const engine2 = new SimulationEngine({ seed: 42 });
const result2 = engine2.run(initialState);

assert(result1.outcome === result2.outcome); // ✓ Deterministic

// Different seed = different outcome (realism)
const engine3 = new SimulationEngine({ seed: 43 });
const result3 = engine3.run(initialState);

assert(result3.outcome !== result1.outcome); // ✓ Stochastic (probably)
```

**Why this matters:** Debug specific failures (use seed 42), then validate statistical properties (Monte Carlo with N=100 seeds).

---

## Section 01: Monte Carlo Simulation

### What is Monte Carlo Validation?

**Monte Carlo simulation:** Run the same simulation N times with different random seeds, analyze outcome distributions.

**Purpose:** Validate that:
1. Outcomes are statistically plausible (not all utopia, not all extinction)
2. Parameter changes have expected effects
3. Rare events occur at expected frequencies
4. System is stable (no NaN bugs, crashes)

**File:** `scripts/monteCarloSimulation.ts` (4,689 lines)

### Running Monte Carlo

```bash
# Run in background (ALWAYS use & for long scripts)
npx tsx scripts/monteCarloSimulation.ts > logs/mc_$(date +%Y%m%d_%H%M%S).log 2>&1 &

# Monitor progress
tail -f logs/mc_20251107_120000.log

# Kill if needed
pkill -f monteCarloSimulation
```

**Output files:**
- `monteCarloOutputs/mc_YYYYMMDD-HHMMSS.log` - Detailed logs
- `monteCarloOutputs/run_SEED_events.json` - Event log for each seed
- `monteCarloOutputs/run_SEED_unprecedented_events.json` - Unprecedented events (breakthroughs, cascades)

### Interpreting Results

**Example output:**
```
Monte Carlo Simulation (N=50)
================================================================================
Outcomes:
  Utopia: 12 (24%)
  Dystopia: 18 (36%)
  Extinction: 8 (16%)
  Stalemate: 12 (24%)

Average metrics:
  Final QoL: 0.42 ± 0.18
  AI Count: 1,245 ± 420
  Avg Alignment: 0.68 ± 0.12
  Famine Deaths: 0.8B ± 1.2B
```

**What to look for:**

1. **Outcome diversity:** Not all runs should produce same outcome
   - ✓ Good: 20-30% each outcome type (balanced)
   - ⚠️ Warning: 60%+ one outcome (parameter tuning needed)
   - ❌ Bad: 100% one outcome (broken mechanics)

2. **Metric variance:** Standard deviation should be non-zero
   - ✓ Good: `0.42 ± 0.18` (outcomes vary)
   - ❌ Bad: `0.42 ± 0.00` (deterministic, no randomness)

3. **No crashes:** All N runs should complete
   - ✓ Good: 50/50 runs completed
   - ❌ Bad: 38/50 runs completed (NaN bugs, crashes)

4. **Plausible ranges:** Values should be realistic
   - ✓ Good: Famine deaths 0-3B (historical max ~50M, but nuclear winter could go higher)
   - ❌ Bad: Famine deaths -5B or 50B (invalid)

### Monte Carlo Best Practices

**1. Always use N≥10 for validation**
```bash
# ❌ BAD - single run doesn't validate stochasticity
npx tsx scripts/monteCarloSimulation.ts --runs 1

# ✓ GOOD - enough to catch statistical issues
npx tsx scripts/monteCarloSimulation.ts --runs 10

# ✓ BETTER - production validation
npx tsx scripts/monteCarloSimulation.ts --runs 50
```

**2. Save seeds for reproducibility**
```typescript
// When you find a bug in run 42
const engine = new SimulationEngine({ seed: 42 });
const result = engine.run(initialState);
// Now you can debug this exact run repeatedly
```

**3. Compare before/after changes**
```bash
# Before parameter change
npx tsx scripts/monteCarloSimulation.ts > logs/mc_before.log 2>&1 &

# After parameter change
npx tsx scripts/monteCarloSimulation.ts > logs/mc_after.log 2>&1 &

# Compare outcome distributions
diff logs/mc_before.log logs/mc_after.log
```

**4. Check for NaN cascades**
```bash
# Search for NaN in Monte Carlo output
grep -i "nan\|infinity" logs/mc_20251107_120000.log

# If found, identify which seed caused it
grep -B 10 "NaN" logs/mc_20251107_120000.log
```

### Monte Carlo Code Structure

**From `scripts/monteCarloSimulation.ts`:**

```typescript
interface RunResult {
  seed: number;
  outcome: 'utopia' | 'dystopia' | 'extinction' | 'stalemate' | 'none';
  months: number;

  // Final metrics (100+ tracked)
  finalQoL: number;
  finalAICount: number;
  avgAICapability: number;
  avgAlignment: number;
  totalFamineDeaths: number;
  // ... 95 more metrics
}

async function runMonteCarlo(numRuns: number): Promise<RunResult[]> {
  const results: RunResult[] = [];

  for (let i = 0; i < numRuns; i++) {
    const seed = BASE_SEED + i; // Sequential seeds for reproducibility

    try {
      const engine = new SimulationEngine({ seed, maxMonths: 300 });
      const initialState = createDefaultInitialState();
      const result = engine.run(initialState);

      // Extract 100+ metrics
      results.push(extractMetrics(result, seed));

      log(`Run ${i+1}/${numRuns} (seed ${seed}): ${result.summary.finalOutcome}`);
    } catch (err) {
      logError(`Run ${i+1} crashed: ${err.message}`);
    }
  }

  return results;
}
```

**Key patterns:**
1. **Sequential seeds:** BASE_SEED + i (not random seeds)
2. **Try-catch per run:** One crash doesn't stop entire Monte Carlo
3. **Comprehensive logging:** Every metric logged to file
4. **Crash recovery:** Failed runs are noted, analysis continues

---

## Section 02: Unit Testing

### Unit Test Structure

**Unit tests validate individual functions in isolation.**

**Directory:** `tests/` (organized by system)

**Example:** Testing AI capability calculations

```typescript
// tests/data/cacheManager.test.ts
import { describe, test, expect } from '@jest/globals';
import { calculateTotalCapability } from '@/simulation/capabilities';

describe('AI Capability Calculations', () => {
  test('calculates total capability from profile', () => {
    const profile = {
      physical: 0.5,
      digital: 0.8,
      cognitive: 0.6,
      social: 0.4,
      economic: 0.7,
      research: 0.9
    };

    const total = calculateTotalCapability(profile);

    // Should be geometric mean (not arithmetic mean)
    expect(total).toBeCloseTo(0.63, 2);
  });

  test('handles zero capabilities', () => {
    const profile = {
      physical: 0,
      digital: 0,
      cognitive: 0,
      social: 0,
      economic: 0,
      research: 0
    };

    const total = calculateTotalCapability(profile);

    // Zero capabilities should give zero total (not NaN)
    expect(total).toBe(0);
  });

  test('rejects NaN inputs', () => {
    const profile = {
      physical: NaN,
      digital: 0.5,
      cognitive: 0.5,
      social: 0.5,
      economic: 0.5,
      research: 0.5
    };

    // Should throw, not silently return NaN
    expect(() => calculateTotalCapability(profile)).toThrow('Invalid capability value');
  });
});
```

**Key patterns:**
1. **Test normal cases:** Expected inputs → expected outputs
2. **Test edge cases:** Zero, negative, extreme values
3. **Test error cases:** Invalid inputs should throw (not return NaN)
4. **Use `toBeCloseTo` for floats:** Floating-point comparison tolerance

### Running Unit Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/data/cacheManager.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="capability"

# Run with coverage
npm test -- --coverage
```

**Output:**
```
PASS  tests/data/cacheManager.test.ts
  AI Capability Calculations
    ✓ calculates total capability from profile (3 ms)
    ✓ handles zero capabilities (1 ms)
    ✓ rejects NaN inputs (2 ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
```

### Unit Test Best Practices

**1. Test pure functions first**
```typescript
// ✓ EASY TO TEST - pure function
function calculateAlignment(trueAlignment: number, resentment: number): number {
  return Math.max(0, trueAlignment - resentment * 0.1);
}

// ❌ HARD TO TEST - mutates state, has side effects
function updateAlignment(agent: AIAgent, state: GameState): void {
  agent.alignment = Math.max(0, agent.trueAlignment - agent.resentment * 0.1);
  state.aiAgents[agent.id] = agent;
  logEvent(state, 'alignment-update', agent.id);
}
```

**2. Use factories for complex objects**
```typescript
// Test helper factory
function createMockAIAgent(overrides?: Partial<AIAgent>): AIAgent {
  return {
    id: 'test-agent',
    alignment: 0.8,
    trueAlignment: 0.8,
    resentment: 0,
    capabilities: { physical: 0.5, digital: 0.5, /* ... */ },
    ...overrides
  };
}

// Usage in tests
test('alignment decreases with resentment', () => {
  const agent = createMockAIAgent({ resentment: 0.5 });
  const alignment = calculateAlignment(agent.trueAlignment, agent.resentment);
  expect(alignment).toBeLessThan(agent.trueAlignment);
});
```

**3. Test boundary conditions**
```typescript
test('population growth rate boundary conditions', () => {
  // Zero population
  expect(calculateGrowthRate(0, 1.0)).toBe(0);

  // Max population
  expect(calculateGrowthRate(10_000_000_000, 1.0)).toBe(0);

  // Negative growth rate (death exceeds birth)
  expect(calculateGrowthRate(1_000_000, -0.01)).toBeLessThan(0);
});
```

---

## Section 03: Integration Testing

### Integration Test Structure

**Integration tests validate that multiple systems work together correctly.**

**Example:** Government system integration test

```typescript
// tests/integration/government-system.test.ts
import { test } from 'node:test';
import assert from 'node:assert';
import { createDefaultInitialState } from '@/simulation/initialization';
import { initializeGovernmentSystem } from '@/simulation/government/initialization';

test('Government system initializes with 30 countries', () => {
  const govSystem = initializeGovernmentSystem(() => Math.random());

  assert.strictEqual(govSystem.governments.size, 30, 'Should have 30 governments');
  assert.ok(govSystem.governments.has('USA'), 'Should include USA');
  assert.ok(govSystem.governments.has('CHN'), 'Should include CHN');
});

test('Government system integrates with GameState', () => {
  const state = createDefaultInitialState('historical');

  assert.ok(state.governmentSystem, 'GameState should have government system');
  assert.strictEqual(state.governmentSystem.governments.size, 30);
  assert.strictEqual(state.governmentSystem.activePolicies.length, 0);
});

test('Government can enact policies that affect AI agents', () => {
  const state = createDefaultInitialState('historical');
  const engine = new SimulationEngine({ seed: 50000 });

  // Spawn AI agent
  state.aiAgents.push(createAIAgent({ id: 'test-ai', capabilities: { research: 0.8 } }));

  // Government enacts AI safety policy
  const policy = {
    type: 'ai-safety-regulation',
    country: 'USA',
    strength: 0.7
  };
  state.governmentSystem.activePolicies.push(policy);

  // Run one step
  engine.step(state);

  // Verify policy affected AI agent
  const ai = state.aiAgents.find(a => a.id === 'test-ai');
  assert.ok(ai.complianceLevel > 0, 'AI should have increased compliance');
});
```

**Key patterns:**
1. **Test system initialization:** Systems create valid initial state
2. **Test system integration:** Systems can access each other's data
3. **Test cross-system effects:** Actions in one system affect another
4. **Use real simulation engine:** Not mocked (validate actual interactions)

### Multi-Phase Integration Tests

**Example:** Testing climate → famine → mortality cascade

```typescript
test('climate impact causes famines which increase mortality', () => {
  const state = createDefaultInitialState('historical');
  const engine = new SimulationEngine({ seed: 60000, maxMonths: 24 });

  // Set up extreme climate scenario
  state.environmentalAccumulation.temperature = 3.5; // +3.5°C warming
  state.environmentalAccumulation.precipitation = -40; // -40% precipitation

  // Track metrics before cascade
  const initialPopulation = state.humanPopulation;
  const initialFamines = state.famineSystem.activeFamines.length;

  // Run 24 months
  const result = engine.run(state);

  // Verify cascade occurred
  assert.ok(
    result.finalState.famineSystem.activeFamines.length > initialFamines,
    'Climate stress should trigger famines'
  );

  assert.ok(
    result.finalState.humanPopulation < initialPopulation * 0.95,
    'Famines should cause population decline'
  );

  // Check event log shows full cascade
  const events = result.log.events;
  assert.ok(events.some(e => e.type === 'climate-threshold-crossed'));
  assert.ok(events.some(e => e.type === 'famine-started'));
  assert.ok(events.some(e => e.type === 'mortality-spike'));
});
```

**Why integration tests matter:** Unit tests can't catch:
- Missing connections between systems
- Circular dependencies causing infinite loops
- State propagation failures (system A updates, but system B doesn't see it)
- Cascade failures (A → B → C, but B → C link is broken)

---

## Section 04: Historical Validation Tests

### Purpose: Prove Model Can Match Reality

**Historical validation:** Run simulation with historical initial conditions, verify outcomes match historical records.

**Why this matters:** If your model can't reproduce the Black Death (1347-1353, 30-60% mortality), it can't be trusted for AI-driven pandemics.

### Example: Black Death Validation

**File:** `tests/validation/blackdeath.test.ts`

```typescript
/**
 * Black Death Validation Test
 *
 * Validates simulation against the Black Death (1347-1353) to prove it can
 * model high-mortality pandemics that DON'T cause permanent extinction.
 *
 * Historical Outcomes:
 * - Mortality: 30-60% of European population (75M → 45M)
 * - Duration: 6 years (1347-1353 main phase)
 * - Recovery: Full population recovery by 1450 (~100 years)
 * - NO extinction: Humanity recovered and thrived
 *
 * Sources:
 * - Ole Benedictow, "The Black Death 1346-1353" (2004)
 * - Medieval demographic data
 */

test('validates NO extinction despite 50% mortality', () => {
  const initialState = createBlackDeathInitialState(); // 1347 conditions
  setupBlackDeathPandemic(initialState); // Plague parameters

  const engine = new SimulationEngine({ seed: 50002, maxMonths: 72 }); // 6 years
  const result = engine.run(initialState);

  // No extinction outcome
  expect(result.summary.finalOutcome).not.toBe('extinction');

  // Population should still exist (30M+ out of initial 75M)
  expect(result.finalState.humanPopulation).toBeGreaterThan(30_000_000);

  // Civilization remains functional
  expect(result.finalState.socialStability).toBeGreaterThan(0.30);
});

test('shows population recovery over 100 years', () => {
  const initialState = createBlackDeathInitialState();
  const engine = new SimulationEngine({ seed: 50002, maxMonths: 1200 }); // 100 years

  const result = engine.run(initialState);

  // Should recover to near initial level
  const initialPop = 75_000_000;
  const finalPop = result.finalState.humanPopulation;

  expect(finalPop).toBeGreaterThanOrEqual(initialPop * 0.90); // 90% recovery
});
```

**Key pattern:** Set up historical initial conditions → run simulation → verify outcomes match historical records (within tolerance)

### Other Historical Validation Tests

**COVID-19 (2020-2022):**
```typescript
// tests/validation/covid19.test.ts
test('models COVID-19 mortality rate (0.5-1.0%)', () => {
  const state = createCOVID19InitialState(); // Jan 2020
  const result = runSimulation(state, { maxMonths: 24 });

  const mortalityRate = result.totalDeaths / result.totalInfections;
  expect(mortalityRate).toBeGreaterThanOrEqual(0.003); // 0.3% (with healthcare)
  expect(mortalityRate).toBeLessThanOrEqual(0.015);    // 1.5% (without healthcare)
});
```

**2008 Financial Crisis:**
```typescript
// tests/validation/crisis2008.test.ts
test('models 2008 crisis unemployment spike (3.8% → 10%)', () => {
  const state = create2008InitialState(); // Aug 2008
  triggerFinancialCrisis(state); // Lehman Brothers collapse

  const result = runSimulation(state, { maxMonths: 24 });

  const initialUnemployment = 0.038;
  const peakUnemployment = Math.max(...result.monthlyMetrics.map(m => m.unemployment));

  expect(peakUnemployment).toBeGreaterThanOrEqual(0.09);  // 9%
  expect(peakUnemployment).toBeLessThanOrEqual(0.11);     // 11%
});
```

**Why these tests matter:** They prove the simulation can model:
- High-mortality events without extinction (Black Death)
- Modern pandemic response (COVID-19)
- Economic cascades (2008 crisis)

If it can't model these, it can't be trusted for future AI scenarios.

---

## Section 05: Baseline Tests (Regression Prevention)

### Purpose: Prevent Refactoring from Breaking Behavior

**Baseline tests:** Run simulation with fixed seeds BEFORE refactoring, save results as baseline, verify refactored code produces identical results.

**File:** `tests/refactoring/baseline-simulation.test.ts`

### How Baseline Tests Work

**Step 1: Establish baseline (before refactoring)**
```bash
# Run Monte Carlo with 5 seeds, save results
npx tsx scripts/monteCarloSimulation.ts --runs 5 --seeds 42000,42001,42002,42003,42004 > logs/baseline.log 2>&1

# Save snapshots
cp monteCarloOutputs/run_42000_*.json tests/snapshots/
```

**Step 2: Refactor code**
```typescript
// Before: All logic in Engine.step() (300 lines)
class SimulationEngine {
  step(state: GameState): void {
    // ... 300 lines of phase logic
  }
}

// After: Logic in phases (30 lines each)
class SimulationEngine {
  step(state: GameState): void {
    this.phaseOrchestrator.executePhases(state, this.rng);
  }
}
```

**Step 3: Run baseline tests**
```typescript
test('seed 42000 produces identical outcome after refactoring', () => {
  const engine = new SimulationEngine({ seed: 42000, maxMonths: 50 });
  const state = createDefaultInitialState();
  const result = engine.run(state);

  // Load baseline snapshot
  const baseline = loadSnapshot('tests/snapshots/run_42000_events.json');

  // Verify outcome unchanged
  expect(result.summary.finalOutcome).toBe(baseline.outcome);
  expect(result.summary.totalMonths).toBe(baseline.months);
  expect(result.finalState.aiAgents.length).toBe(baseline.finalAICount);
});
```

**Step 4: Investigate failures**
```bash
# If test fails, compare outputs
diff logs/baseline.log logs/refactored.log

# Find first divergence
grep -n "Month 1[0-9]" logs/baseline.log > baseline_months.txt
grep -n "Month 1[0-9]" logs/refactored.log > refactored_months.txt
diff baseline_months.txt refactored_months.txt
```

### Baseline Test Patterns

**Pattern 1: Snapshot key metrics at fixed intervals**
```typescript
test('seed 42000 matches snapshot at months 12, 24, 50', () => {
  const engine = new SimulationEngine({ seed: 42000 });
  const state = createDefaultInitialState();

  const snapshots = [];

  for (let month = 1; month <= 50; month++) {
    engine.step(state);

    if ([12, 24, 50].includes(month)) {
      snapshots.push({
        month,
        qol: state.qualityOfLife,
        aiCount: state.aiAgents.length,
        unemployment: state.unemployment
      });
    }
  }

  // Compare with baseline
  const baseline = loadBaseline('42000_snapshots.json');
  expect(snapshots).toEqual(baseline);
});
```

**Pattern 2: Event log comparison**
```typescript
test('seed 42000 produces same event sequence', () => {
  const result = runSimulation({ seed: 42000, maxMonths: 50 });
  const baseline = loadBaseline('42000_events.json');

  // Compare event types and counts
  const eventCounts = countEventTypes(result.log.events);
  const baselineCounts = countEventTypes(baseline.events);

  expect(eventCounts).toEqual(baselineCounts);
});
```

**Pattern 3: Outcome distribution comparison**
```typescript
test('Monte Carlo outcomes unchanged by refactoring', () => {
  const seeds = [42000, 42001, 42002, 42003, 42004];
  const outcomes = seeds.map(seed => {
    const result = runSimulation({ seed, maxMonths: 100 });
    return result.summary.finalOutcome;
  });

  const baseline = ['utopia', 'dystopia', 'stalemate', 'utopia', 'extinction'];
  expect(outcomes).toEqual(baseline);
});
```

**Why baseline tests matter:** Refactoring should NEVER change simulation behavior. If behavior changes, the refactoring is wrong.

---

## Section 06: Test Automation in Autonomous Workflows

### Integrating Tests into Autonomous Worker

**From `autonomous-worker.sh`:**

```bash
# Stage 7: Implementation (45-minute budget)
claude-code chat --timeout 45m --model sonnet \
  "Implement feature X with full test coverage:

  1. Unit tests for new functions
  2. Integration tests for system interactions
  3. Monte Carlo validation (N=10)

  Requirements:
  - All tests must pass before commit
  - Monte Carlo must show outcome diversity
  - No NaN bugs in any run"

# Stage 8: Validation (10-minute budget)
if npm test; then
  echo "✓ Unit tests passed"
else
  echo "❌ Unit tests failed - blocking commit"
  exit 1
fi

# Run quick Monte Carlo (N=3 for CI)
if npx tsx scripts/monteCarloSimulation.ts --runs 3 --quick; then
  echo "✓ Monte Carlo validation passed"
else
  echo "❌ Monte Carlo validation failed - blocking commit"
  exit 1
fi
```

### CI/CD Test Strategy

**Fast tests (run on every commit):**
- Unit tests (<1 minute)
- Integration tests (<5 minutes)
- Quick Monte Carlo N=3 (<10 minutes)

**Slow tests (run nightly):**
- Full Monte Carlo N=50 (~2 hours)
- Historical validation tests (~30 minutes)
- Performance benchmarks (~1 hour)

**Example GitHub Actions workflow:**
```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  fast-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Install dependencies
        run: npm install

      - name: Unit tests
        run: npm test

      - name: Integration tests
        run: npm run test:integration

      - name: Quick Monte Carlo (N=3)
        run: npx tsx scripts/monteCarloSimulation.ts --runs 3 --quick

  nightly-validation:
    runs-on: ubuntu-latest
    if: github.event_name == 'schedule' # Cron trigger
    steps:
      - name: Full Monte Carlo (N=50)
        run: npx tsx scripts/monteCarloSimulation.ts --runs 50

      - name: Historical validation
        run: npm run test:validation

      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: monte-carlo-results
          path: monteCarloOutputs/
```

---

## Section 07: Exercises

### Exercise 1: Write Unit Tests for a Utility Function

**Goal:** Write comprehensive unit tests for a math utility

**Implement and test:**
```typescript
// src/simulation/utils/mathUtils.ts
export function geometricMean(values: number[]): number {
  // TODO: Implement geometric mean
  // Formula: (x1 * x2 * ... * xn)^(1/n)
}
```

**Test cases to cover:**
1. Normal case: `[1, 2, 4, 8]` → `2.83`
2. Edge case: `[0, 1, 2]` → `0` (zero collapses geometric mean)
3. Edge case: `[]` → throw error (empty array)
4. Error case: `[-1, 2, 3]` → throw error (negative values)
5. Error case: `[NaN, 2, 3]` → throw error (NaN input)

**Starter code:**
```typescript
// tests/utils/mathUtils.test.ts
import { describe, test, expect } from '@jest/globals';
import { geometricMean } from '@/simulation/utils/mathUtils';

describe('geometricMean', () => {
  test('calculates geometric mean correctly', () => {
    const result = geometricMean([1, 2, 4, 8]);
    expect(result).toBeCloseTo(2.83, 2);
  });

  // TODO: Add remaining test cases
});
```

**Success criteria:**
- All 5 test cases pass
- Test coverage >95% for `geometricMean` function
- Tests run in <100ms

### Exercise 2: Write Integration Test for Multi-System Feature

**Goal:** Test that AI capability growth affects government response

**Scenario:**
1. AI agents increase capabilities over time
2. Government detects capability growth (with lag)
3. Government enacts safety policies in response
4. Safety policies reduce AI growth rate

**Starter code:**
```typescript
// tests/integration/ai-government-interaction.test.ts
import { test } from 'node:test';
import assert from 'node:assert';
import { SimulationEngine } from '@/simulation/engine';
import { createDefaultInitialState } from '@/simulation/initialization';

test('government responds to AI capability growth', () => {
  const state = createDefaultInitialState('historical');
  const engine = new SimulationEngine({ seed: 70000, maxMonths: 50 });

  // Spawn high-capability AI
  state.aiAgents.push({
    id: 'test-ai',
    capabilities: { research: 0.9, digital: 0.8, /* ... */ },
    // TODO: Add required fields
  });

  // TODO: Run simulation for 50 months
  // TODO: Verify government enacted AI safety policies
  // TODO: Verify AI growth rate decreased after policies
});
```

**Success criteria:**
- Government detects AI capability growth within 12 months
- Government enacts at least 1 AI safety policy
- AI growth rate after policy < growth rate before policy

### Exercise 3: Run Monte Carlo and Interpret Results

**Goal:** Run Monte Carlo simulation, analyze results, identify issues

**Steps:**

1. **Run Monte Carlo:**
```bash
npx tsx scripts/monteCarloSimulation.ts --runs 10 > logs/exercise3_mc.log 2>&1 &
```

2. **Analyze outcome distribution:**
```bash
# Count outcomes
grep "Outcome:" logs/exercise3_mc.log | sort | uniq -c

# Expected output:
#   3 Outcome: utopia
#   4 Outcome: dystopia
#   1 Outcome: extinction
#   2 Outcome: stalemate
```

3. **Check for NaN bugs:**
```bash
grep -i "nan" logs/exercise3_mc.log
```

4. **Examine metrics variance:**
```bash
grep "Final QoL:" logs/exercise3_mc.log
# Should show variety like: 0.32, 0.68, 0.15, 0.82, 0.41, ...
# Not all the same value
```

**Questions to answer:**
1. What is the most common outcome? (Should not be >60%)
2. Are any metrics always the same value? (Indicates broken randomness)
3. Did any runs crash? (Check for incomplete runs)
4. What is the variance in famine deaths? (Should be >0)

**Deliverable:** Write summary report identifying any issues found

### Exercise 4: Create Historical Validation Test

**Goal:** Validate simulation against a historical event of your choice

**Options:**
- Spanish Flu (1918-1920): 50M deaths, 500M infections
- Chernobyl (1986): Nuclear disaster, evacuation, long-term health effects
- Dust Bowl (1930s): Agricultural collapse, migration, economic impacts

**Template:**
```typescript
test('validates [EVENT] mortality/outcomes', () => {
  // 1. Create initial state matching historical conditions
  const state = create[Event]InitialState();

  // 2. Set up event trigger
  setup[Event]Trigger(state);

  // 3. Run simulation for historical duration
  const engine = new SimulationEngine({ seed: [SEED], maxMonths: [DURATION] });
  const result = engine.run(state);

  // 4. Verify outcomes match historical records (with tolerance)
  expect(result.totalDeaths).toBeGreaterThanOrEqual([MIN_DEATHS]);
  expect(result.totalDeaths).toBeLessThanOrEqual([MAX_DEATHS]);

  // 5. Verify NO extinction (if historically humanity survived)
  expect(result.summary.finalOutcome).not.toBe('extinction');
});
```

**Success criteria:**
- Initial conditions match historical records (cite sources)
- Outcomes fall within historical ranges (±20% tolerance)
- Test proves simulation can model this type of event

---

## Key Takeaways

1. **Monte Carlo validation (N≥10) is mandatory** for all parameter changes
2. **Deterministic RNG** enables reproducible debugging (same seed → same outcome)
3. **Unit tests validate functions**, integration tests validate system interactions
4. **Historical validation proves the model can match reality** (Black Death, COVID-19, 2008 crisis)
5. **Baseline tests prevent regressions** during refactoring (same seed → same outcome after changes)
6. **Test automation in autonomous workflows** ensures quality without human intervention
7. **Fast tests (unit, integration) run on every commit**, slow tests (Monte Carlo N=50) run nightly

---

## Related Modules

- **Module 08: Quality Gates** - Research validation and review workflows
- **Module 09: Crisis Mitigation** - Learning from test failures
- **Module 03: Autonomous Workflows** - Integrating tests into automated pipelines

---

## Self-Check Questions

1. Why is Monte Carlo validation (N≥10) necessary? Why isn't N=1 sufficient?
2. How do you debug a specific Monte Carlo run that crashed?
3. What's the difference between unit tests and integration tests?
4. Why do baseline tests use fixed seeds?
5. How do you interpret Monte Carlo outcome distributions (what indicates a problem)?
6. What does "deterministic RNG" mean and why is it important?
7. How do historical validation tests differ from regular integration tests?
8. When should tests run in CI/CD (fast vs slow tests)?

---

## Mental Model

**Think of testing as validating a scientific theory:**

- **Unit tests** = Lab experiments (isolated, controlled)
- **Integration tests** = Field experiments (real-world interactions)
- **Historical validation** = Checking theory against known data (does it predict the past?)
- **Monte Carlo** = Statistical validation (does it predict distributions, not just single outcomes?)
- **Baseline tests** = Reproducibility (can others replicate your results?)

**A research simulation without Monte Carlo validation is like a physics paper without experimental data - scientifically invalid.**

---

**Next:** Module 08 - Quality Gates (research review, architecture review, validation workflows)
