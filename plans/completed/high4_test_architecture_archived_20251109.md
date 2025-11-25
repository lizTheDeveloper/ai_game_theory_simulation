# Integration Test Architecture Guidelines
**Version:** 1.0
**Date:** November 8, 2025
**Purpose:** Establish patterns and conventions for integration testing

## Core Principles

### 1. Test Behavior, Not Implementation
```typescript
// ❌ BAD: Testing implementation details
test('should call calculateMortality with correct parameters', () => {
  // Tests internal function calls - fragile!
});

// ✅ GOOD: Testing observable behavior
test('should increase mortality when temperature exceeds wet bulb limits', () => {
  // Tests actual state changes - robust!
});
```

### 2. Fail Loudly, Never Silently
```typescript
// ❌ BAD: Silent fallback
const value = state.metric ?? 0.5; // Hides bugs!

// ✅ GOOD: Explicit assertion
const value = assertFinite(state.metric, {
  location: 'test-name',
  valueName: 'metric'
}); // Fails with clear error
```

### 3. Deterministic Execution
```typescript
// Every test MUST use deterministic RNG
function createTestRNG(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

// NEVER use Math.random() in tests
```

## Test Structure Patterns

### Pattern 1: Single Phase Validation
Use when testing a phase in isolation.

```typescript
import { describe, test } from 'node:test';
import assert from 'node:assert';
import { createTestState, createTestRNG } from '../helpers';
import { TargetPhase } from '@/simulation/engine/phases';

describe('TargetPhase: State Validation', () => {
  const TEST_SEED = 42000;

  describe('Fail-Loudly Behavior', () => {
    test('should throw on NaN input', () => {
      const state = createTestState();
      const rng = createTestRNG(TEST_SEED);
      const phase = new TargetPhase();

      // Inject invalid state
      state.someField = NaN;

      // Must throw, not silently handle
      assert.throws(
        () => phase.execute(state, rng),
        /Non-finite value/,
        'Should reject NaN input'
      );
    });

    test('should throw on missing required field', () => {
      const state = createTestState();
      const rng = createTestRNG(TEST_SEED);
      const phase = new TargetPhase();

      // Remove required field
      delete state.requiredField;

      assert.throws(
        () => phase.execute(state, rng),
        /Required field missing/
      );
    });
  });

  describe('Valid State Processing', () => {
    test('should process valid state without errors', () => {
      const state = createTestState();
      const rng = createTestRNG(TEST_SEED);
      const phase = new TargetPhase();

      const result = phase.execute(state, rng);

      // Verify outputs are finite
      assert.ok(Number.isFinite(state.outputField));
      assert.ok(state.outputField >= 0 && state.outputField <= 1);
    });
  });
});
```

### Pattern 2: Multi-Phase Cascade
Use when testing phase interactions and state propagation.

```typescript
describe('Climate → Mortality Cascade', () => {
  test('should propagate temperature through mortality calculation', () => {
    const state = createTestState();
    const rng = createTestRNG(TEST_SEED);

    // Set up cascade trigger
    state.climate.temperature = 18.5; // +3.5°C
    state.climate.wetBulbTemp = 32.0; // Above survivability

    // Execute phase sequence
    const phases = [
      new ClimatePhase(),
      new WetBulbPhase(),
      new MortalityPhase(),
      new PopulationPhase()
    ];

    const context = {
      month: state.currentMonth,
      data: new Map(),
      executedPhases: new Set<string>()
    };

    for (const phase of phases) {
      phase.execute(state, rng, context);
      context.executedPhases.add(phase.id);

      // Validate after each phase
      assertNoNaN(state, `After ${phase.name}`);
    }

    // Verify cascade completed
    assert.ok(state.population < state.initialPopulation);
    assert.ok(state.mortality.heatDeaths > 0);
  });
});
```

### Pattern 3: Regression Prevention
Use for bugs that must never recur.

```typescript
describe('Regression Tests', () => {
  test('Oct 2025 NaN Bug: Should not use silent fallback', () => {
    const state = createTestState();
    const rng = createTestRNG(TEST_SEED);
    const phase = new EcologyPhase();

    // Reproduce bug conditions
    state.ecology.biodiversity = NaN;

    // Old behavior: Silent fallback to 0.005
    // New behavior: Throw immediately
    assert.throws(
      () => phase.execute(state, rng),
      /Non-finite value.*biodiversity/,
      'Must reject NaN, not fallback silently'
    );
  });

  test('CRITICAL-1: Should preserve float precision', () => {
    const state = createTestState();
    const rng = createTestRNG(TEST_SEED);

    // Set fractional capability
    state.aiAgents[0].capabilities.physical = 3.7;

    new AICapabilityPhase().execute(state, rng);

    // Must not round to integer
    assert.strictEqual(
      state.aiAgents[0].capabilities.physical,
      3.7,
      'Capability must maintain float precision'
    );
  });
});
```

### Pattern 4: Determinism Validation
Use to ensure reproducible simulations.

```typescript
describe('Determinism', () => {
  test('should produce identical results with same seed', () => {
    // Create two identical states
    const state1 = createTestState();
    const state2 = JSON.parse(JSON.stringify(state1));

    // Create RNGs with same seed
    const rng1 = createTestRNG(12345);
    const rng2 = createTestRNG(12345);

    // Run same phase sequence
    const phases = [/* ... */];

    for (const Phase of phases) {
      new Phase().execute(state1, rng1);
      new Phase().execute(state2, rng2);
    }

    // States must be identical
    assert.deepStrictEqual(state1, state2);
  });
});
```

## State Setup Helpers

### Base State Factory
```typescript
export function createTestState(scenario: TestScenario = 'default'): GameState {
  const baseState = {
    currentMonth: 0,
    population: 8.0,
    initialPopulation: 8.0,
    // ... all required fields
  };

  // Apply scenario modifications
  switch (scenario) {
    case 'climate-crisis':
      baseState.climate.temperature = 17.5;
      baseState.environmentalState.climateStability = 0.3;
      break;
    case 'ai-emergence':
      baseState.aiAgents = createHighCapabilityAgents(10);
      break;
    case 'nuclear-winter':
      baseState.nuclearWar.happened = true;
      baseState.nuclearWar.monthStarted = 0;
      break;
    default:
      // Use base state
  }

  // Validate state completeness
  validateStateSchema(baseState);

  return baseState as GameState;
}
```

### Assertion Utilities
```typescript
export function assertNoNaN(obj: any, context: string = ''): void {
  const check = (value: any, path: string) => {
    if (typeof value === 'number' && !Number.isFinite(value)) {
      throw new Error(`NaN/Infinity at ${path} ${context}`);
    }
    if (typeof value === 'object' && value !== null) {
      for (const key in value) {
        check(value[key], `${path}.${key}`);
      }
    }
  };
  check(obj, 'state');
}

export function assertInvariant(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(`Invariant violation: ${message}`);
  }
}
```

## Performance Constraints

### Test Execution Budgets
```typescript
// Individual test timeout
const TEST_TIMEOUT = 5000; // 5 seconds max per test

// Phase execution timeout
const PHASE_TIMEOUT = 100; // 100ms max per phase

// Full simulation test timeout
const SIMULATION_TIMEOUT = 30000; // 30 seconds for multi-month runs

test('should complete within performance budget', { timeout: TEST_TIMEOUT }, () => {
  // Test implementation
});
```

### Performance Monitoring
```typescript
function measurePhasePerformance(phase: Phase, state: GameState): number {
  const start = performance.now();
  phase.execute(state, createTestRNG(1));
  const duration = performance.now() - start;

  assert.ok(
    duration < PHASE_TIMEOUT,
    `Phase ${phase.name} took ${duration}ms (limit: ${PHASE_TIMEOUT}ms)`
  );

  return duration;
}
```

## Test Organization

### File Structure
```
tests/
  integration/
    cascades/           # Multi-phase cascade tests
      climate-mortality.test.ts
      ai-suffering-alignment.test.ts
      nuclear-winter.test.ts
    regressions/        # Bug prevention tests
      oct-2025-nan-bug.test.ts
      critical-1-integer.test.ts
      issue-11-determinism.test.ts
    phases/             # Individual phase tests
      planetary-boundaries.test.ts
      mortality-stabilizers.test.ts
    helpers/            # Shared utilities
      state-factory.ts
      assertions.ts
      rng.ts
```

### Naming Conventions
- **Files:** `{system-name}.test.ts` or `{bug-id}.test.ts`
- **Describes:** `{PhaseName}: {TestCategory}`
- **Tests:** `should {expected behavior} when {condition}`

## CI/CD Integration

### Test Execution Strategy
```json
{
  "scripts": {
    "test:integration": "node --test tests/integration/**/*.test.ts",
    "test:integration:fast": "node --test tests/integration/regressions/*.test.ts",
    "test:integration:cascades": "node --test tests/integration/cascades/*.test.ts"
  }
}
```

### GitHub Actions Configuration
```yaml
- name: Run Integration Tests
  run: |
    npm run test:integration:fast  # Quick regression tests
    if: always()
    npm run test:integration       # Full suite
  timeout-minutes: 5
```

## Common Pitfalls to Avoid

### 1. Testing Implementation Details
```typescript
// ❌ BAD: Tests break when refactoring
test('should call internalFunction 3 times');

// ✅ GOOD: Tests survive refactoring
test('should reduce population by heat deaths');
```

### 2. Incomplete State Setup
```typescript
// ❌ BAD: Partial state that breaks phases
const state = { currentMonth: 0 };

// ✅ GOOD: Complete valid state
const state = createTestState();
```

### 3. Non-Deterministic Tests
```typescript
// ❌ BAD: Random values
const random = Math.random();

// ✅ GOOD: Deterministic values
const rng = createTestRNG(42);
```

### 4. Silent Test Failures
```typescript
// ❌ BAD: Test passes even when broken
try {
  phase.execute(state, rng);
} catch (e) {
  // Silently swallow error
}

// ✅ GOOD: Test fails loudly
assert.doesNotThrow(
  () => phase.execute(state, rng),
  'Phase should handle valid state'
);
```

## Test Maintenance

### When to Update Tests
- **Always:** When fixing a bug (add regression test)
- **Always:** When adding a phase (add integration test)
- **Always:** When changing phase interactions (update cascade tests)
- **Never:** For internal refactoring (tests should still pass)

### Test Review Checklist
- [ ] Uses deterministic RNG (no Math.random)
- [ ] Validates fail-loudly behavior
- [ ] Checks for NaN propagation
- [ ] Has clear assertion messages
- [ ] Runs in < 5 seconds
- [ ] Tests behavior, not implementation
- [ ] Includes regression test if fixing bug

## Appendix: Quick Reference

### Essential Imports
```typescript
import { describe, test } from 'node:test';
import assert from 'node:assert';
import { createTestState, createTestRNG } from '../helpers';
import { assertFinite, assertNoNaN } from '../helpers/assertions';
```

### Common Assertions
```typescript
// Numeric validations
assert.ok(Number.isFinite(value));
assert.ok(value >= 0 && value <= 1);
assert.strictEqual(value, expected);

// State validations
assertNoNaN(state);
assertInvariant(state.population > 0, 'Population must be positive');

// Error validations
assert.throws(() => fn(), /error pattern/);
assert.doesNotThrow(() => fn());

// Deep equality
assert.deepStrictEqual(actual, expected);
```

### Performance Helpers
```typescript
const start = performance.now();
// ... operation ...
const duration = performance.now() - start;
assert.ok(duration < MAX_TIME);
```

---

*These guidelines ensure consistent, maintainable, and reliable integration tests that catch real bugs while remaining fast and deterministic.*