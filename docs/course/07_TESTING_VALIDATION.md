# Module 07: Testing & Validation

*Module 7 of 9 | Prerequisites: [Module 03](./03_AUTONOMOUS_WORKFLOWS.md), [Module 05](./05_PLANNING_COORDINATION.md)*

**Monte Carlo simulation, integration tests, historical validation**

---

## Learning Objectives
1. Understand why Monte Carlo simulation is critical for research-backed projects
2. Learn how to run deterministic simulations with RNG seeds
3. Write unit tests for individual systems and utilities
4. Create integration tests for multi-system interactions
5. Validate against historical events (Black Death, COVID-19, 2008 crisis)
6. Use baseline tests to prevent regressions during refactoring
7. Integrate testing into autonomous workflows

---

## Opening Principle

> *"If a model makes you feel confident about outcomes, it is probably wrong. Good models are UNCOMFORTABLE. Reality contains opposed dynamics. Models should too."*
>
> — The Architect

**Why testing matters:** Not to make you confident the simulation is correct, but to help you understand WHERE it might be wrong and HOW MUCH you should trust specific outcomes.

This module teaches you to build systems that reveal their own uncertainties, not hide them.

**Before you begin:** Read the [Hall of Failures](./HALL_OF_FAILURES.md) to understand why each testing pattern exists. Every pattern in this module emerged from a real disaster.

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

**This module focuses on layers 1-4. Layer 5 (research validation) is covered in [Module 08: Quality Gates](./08_QUALITY_GATES.md).**

**See also:** [Module 03](./03_AUTONOMOUS_WORKFLOWS.md#stage-8-validation) for how testing integrates into autonomous workflows.

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

**What you learned:**
- Research simulations need 5 validation layers (unit, integration, historical, Monte Carlo, research)
- Deterministic RNG enables debugging (same seed → same outcome)
- Monte Carlo (N≥10) validates statistical properties
- [Autonomous workflows](./03_AUTONOMOUS_WORKFLOWS.md) integrate validation automatically

**Next:** [Section 01: Monte Carlo Simulation](#section-01-monte-carlo-simulation) - Running and interpreting Monte Carlo validation

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
    const profile = { physical: 0.5, digital: 0.8, cognitive: 0.6, /* ... */ };
    const total = calculateTotalCapability(profile);
    expect(total).toBeCloseTo(0.63, 2); // Geometric mean, not arithmetic
  });

  test('handles zero capabilities', () => {
    const profile = { physical: 0, digital: 0, /* ... all zeros */ };
    expect(calculateTotalCapability(profile)).toBe(0); // Not NaN
  });

  test('rejects NaN inputs', () => {
    const profile = { physical: NaN, digital: 0.5, /* ... */ };
    expect(() => calculateTotalCapability(profile)).toThrow('Invalid capability value');
  });
});
```

**See full test suite:** `tests/simulation/capabilities.test.ts` (200+ tests)

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
// ✓ EASY TO TEST - pure function, no side effects
function calculateAlignment(trueAlignment: number, resentment: number): number {
  return Math.max(0, trueAlignment - resentment * 0.1);
}
```

**2. Use factories for complex objects**
```typescript
function createMockAIAgent(overrides?: Partial<AIAgent>): AIAgent {
  return { id: 'test-agent', alignment: 0.8, /* ... */, ...overrides };
}
```

**3. Test boundary conditions**
```typescript
test('population growth rate boundaries', () => {
  expect(calculateGrowthRate(0, 1.0)).toBe(0); // Zero population
  expect(calculateGrowthRate(10_000_000_000, 1.0)).toBe(0); // Max population
  expect(calculateGrowthRate(1_000_000, -0.01)).toBeLessThan(0); // Negative growth
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

---

**What you learned:**
- Unit tests validate individual functions in isolation
- Integration tests validate multi-system interactions
- Historical validation proves model can match reality
- Test patterns: normal cases, edge cases, error cases, boundary conditions
- [Quality gates](./08_QUALITY_GATES.md) enforce testing standards

**Next:** [Other Historical Validation Tests](#other-historical-validation-tests) - COVID-19 and 2008 crisis validation

---

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

### Exercise 1: Interface with the Swarm - Request a Feature

**Goal:** Make a feature request to the autonomous swarm and watch it implement, test, and validate

**What you'll learn:** You don't write code - you direct agents to write code. This exercise teaches you how to interface with an autonomous swarm.

**Scenario:** You want to add a new breakthrough technology to the simulation: "Ocean Iron Fertilization" (TIER 1 climate mitigation).

**Steps:**

1. **Write a research-backed feature request in the roadmap:**

Edit `plans/MASTER_IMPLEMENTATION_ROADMAP.md`:
```markdown
### TIER 1: Immediate Priorities (Next 2 Weeks)

- [ ] **CRITICAL**: Ocean Iron Fertilization Breakthrough
  - **Description**: TIER 1 climate tech - stimulates phytoplankton growth to sequester atmospheric CO2
  - **Research foundation**: Yoon et al. 2018 (Nature) - 0.15 GtC/year sequestration potential
  - **Complexity**: Medium (3-5 days)
  - **Files**: `src/simulation/breakthroughs/climate/oceanIronFertilization.ts`, `ClimateBreakthroughsPhase.ts`
  - **Parameters needed**:
    - Sequestration rate: 0.15 GtC/year (Yoon 2018)
    - Cost: $50M/deployment (Williamson 2012)
    - Side effects: Local ecosystem disruption risk 12% (Boyd 2007)
  - **Tests required**: Unit tests, integration with planetary boundaries, Monte Carlo N=10
```

2. **Post request to coordination channel:**

```bash
# Via chatroom MCP tool
mcp__chatroom__chatroom_post({
  channel: "coordination",
  agent: "your-name",
  status: "QUESTION",
  message: "Feature request: Ocean Iron Fertilization breakthrough (TIER 1). Research complete, parameters in roadmap. Can orchestrator pick this up in next autonomous cycle?"
})
```

3. **Monitor implementation:**

Watch the autonomous worker in the next cycle:
```bash
# Check worker logs
tail -f logs/autonomous/worker_*.log

# Check implementation channel
mcp__chatroom__chatroom_read_new({channel: "implementation", agent: "your-name"})
```

4. **Review results:**

After implementation, check:
- PR created: `gh pr list | grep "iron-fertilization"`
- Tests passing: `gh pr checks <PR_NUMBER>`
- Monte Carlo validation: Check `monteCarloOutputs/` for recent runs

**Success criteria:**
- Feature appears in next autonomous cycle
- Agent creates PR with implementation
- Tests pass
- Monte Carlo N=10 validation complete
- You understand: Request → Autonomous implementation → Validation → Merge

**Key insight:** This is the swarm interface. You provide requirements + research. The swarm handles implementation, testing, and validation. Your job is directing, not coding.

### Exercise 2: Direct an Agent to Run Validation

**Goal:** Use the swarm to run comprehensive validation on a completed feature

**What you'll learn:** Validation is automated. You don't run tests manually - you direct agents to run validation suites and report results.

**Scenario:** The ocean iron fertilization feature (from Exercise 1) has been implemented. Now you need to validate it meets research standards.

**Steps:**

1. **Post validation request to coordination channel:**

```markdown
---
**your-name** | 2025-11-07 14:00 | [QUESTION]

Ocean iron fertilization feature merged. Need validation:
1. Monte Carlo N=10 (check outcome distributions)
2. Verify no NaN bugs in ecology calculations
3. Check planetary boundaries integration
4. Historical validation: Does it match Yoon 2018 sequestration rates?

Can orchestrator spawn validation workflow?

**Blocking:** None (request for next cycle)
---
```

2. **Monitor validation workflow:**

The orchestrator will spawn:
- `simulation-maintainer` (runs Monte Carlo N=10)
- `architecture-skeptic` (reviews for performance issues)
- `wiki-documentation-updater` (documents results)

Watch in implementation channel:
```bash
mcp__chatroom__chatroom_read_new({channel: "implementation", agent: "your-name"})
```

3. **Review validation report:**

After validation, check logs:
```bash
# Monte Carlo results
ls -la monteCarloOutputs/run_*_iron_fert.json

# Validation summary
cat logs/validation_iron_fert_*.log
```

4. **Interpret results:**

Check for:
- All 10 runs completed (no crashes)
- Outcome distribution reasonable (not 100% same outcome)
- No NaN errors in ecology phase
- Sequestration rates match research (0.15 ± 0.03 GtC/year)

**Success criteria:**
- Validation workflow triggered autonomously
- Monte Carlo N=10 complete
- Validation report posted to coordination channel
- You understand how to request validation (not run it yourself)

**Key insight:** Agents handle the testing infrastructure. Your role is requesting validation and interpreting results. If validation fails, you direct agents to fix issues.

### Exercise 3: Interpret Monte Carlo Results (ANALYSIS)

**Format:** Analysis challenge - Given results, identify 2 issues and propose fixes

**Goal:** Learn to read Monte Carlo outputs and spot problems

**Given data:** Monte Carlo N=10 results from a recent run

```bash
# Outcome distribution
grep "Outcome:" logs/mc_recent.log | sort | uniq -c
  10 Outcome: utopia

# Final QoL scores
grep "Final QoL:" logs/mc_recent.log
Final QoL: 0.85
Final QoL: 0.85
Final QoL: 0.85
Final QoL: 0.85
Final QoL: 0.85
Final QoL: 0.85
Final QoL: 0.85
Final QoL: 0.85
Final QoL: 0.85
Final QoL: 0.85

# Famine deaths
grep "Famine deaths:" logs/mc_recent.log
Famine deaths: 0
Famine deaths: 0
Famine deaths: 0
[... all zeros ...]

# NaN check
grep -i "nan" logs/mc_recent.log
(no output)
```

**Questions to answer:**

1. **What are 2 problems with these results?**
   - Hint: Check outcome diversity and metric variance

2. **What is the likely cause of each problem?**
   - Hint: Determinism requires sequential seeds, not random seeds

3. **Propose fixes for both issues:**
   - Hint: See `scripts/monteCarloSimulation.ts` BASE_SEED pattern

**Success criteria:**
- Identify that all outcomes are identical (no diversity)
- Identify that metrics show zero variance (broken randomness)
- Propose using BASE_SEED + i for sequential seeds
- Understand why N=10 with same outcome is a red flag

### Exercise 4: Build a 2-Agent Swarm for Your Own Project

**Goal:** Set up a minimal autonomous swarm (orchestrator + implementer) for your own project

**What you'll learn:** The real question students want answered: "How do I build my own swarm?"

**Scenario:** You're starting a new project (can be anything - a web app, a CLI tool, a research simulation). You want agents to implement features autonomously.

**Steps:**

1. **Create project structure:**

```bash
mkdir my-autonomous-project
cd my-autonomous-project
npm init -y

# Create agent directory
mkdir -p .claude/agents/mcp-configs

# Create coordination infrastructure
mkdir -p .claude/chatroom/channels
touch .claude/chatroom/channels/coordination.md
touch .claude/chatroom/channels/implementation.md
```

2. **Set up chatroom MCP server:**

```bash
# Clone the chatroom server from this repo
cp -r /path/to/superalignmenttoutopia/.claude/mcp-chatroom ./

# Install dependencies
cd .claude/mcp-chatroom
npm install
npm run build
cd ../..
```

3. **Configure your first agent (orchestrator):**

Create `.claude/agents/orchestrator.md`:
```markdown
# Orchestrator Agent

**Role:** Coordinate work between agents, spawn specialists as needed

**Responsibilities:**
- Read coordination channel for requests
- Spawn implementer for feature work
- Monitor progress and handle blockers

**MCP servers:** chatroom, agent-memory

**Channels:** coordination (monitor), implementation (read-only)
```

Create `.claude/agents/mcp-configs/orchestrator.json`:
```json
{
  "mcpServers": {
    "chatroom": {
      "command": "node",
      "args": ["$(pwd)/.claude/mcp-chatroom/dist/index.js"]
    }
  }
}
```

4. **Configure your second agent (implementer):**

Create `.claude/agents/implementer.md`:
```markdown
# Feature Implementer

**Role:** Implement features from roadmap

**Responsibilities:**
- Read implementation channel for tasks
- Write code, run tests
- Post progress updates

**MCP servers:** chatroom

**Channels:** implementation (monitor)
```

5. **Test your swarm:**

Spawn orchestrator:
```
Task({
  subagent_type: "orchestrator",
  description: "Test swarm coordination",
  prompt: "Please check coordination channel and report status. Then spawn implementer to create a simple 'Hello World' feature."
})
```

Watch the workflow:
- Orchestrator reads coordination channel
- Orchestrator spawns implementer
- Implementer creates feature
- Implementer posts completion to implementation channel
- Orchestrator sees completion, reports success

**Success criteria:**
- 2-agent workflow completes autonomously
- Agents communicate via chatroom channels
- You understand the pattern: Orchestrator → Spawn specialist → Monitor → Report
- You can extend this to 3+ agents for your own project

**Key insight:** This is the minimal viable swarm. Once you have orchestrator + 1 specialist working, you can add more specialists (tester, reviewer, documenter) using the same pattern. The foundation is: (1) Chatroom for coordination, (2) Agent definitions, (3) MCP configs.

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
