# Phase Unit Tests

This directory contains comprehensive unit tests for simulation phases.

## Test Structure

Each phase test file follows this pattern:

```typescript
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { PhaseUnderTest } from '../../../src/simulation/engine/phases/PhaseUnderTest.js';

// Helper functions
function createTestRng(seed: number): () => number { ... }
function createTestAgent(overrides): AIAgent { ... }
function createTestState(overrides): GameState { ... }
function createTestContext(): PhaseContext { ... }

// Test suites organized by functionality
describe('Phase - Metadata', () => { ... });
describe('Phase - Basic Execution', () => { ... });
describe('Phase - Core Mechanics', () => { ... });
describe('Phase - Edge Cases', () => { ... });
```

## Coverage Targets

- **Line Coverage:** 80%+ (research simulation standard)
- **Branch Coverage:** 75%+
- **Function Coverage:** 100%

## Running Tests

```bash
# Run all phase tests
npx tsx --test tests/unit/phases/*.test.ts

# Run specific phase test
npx tsx --test tests/unit/phases/AISufferingPhase.test.ts

# Run with coverage
npx tsx --test --experimental-test-coverage tests/unit/phases/*.test.ts
```

## Current Phase Tests

### ClimateSystemPhase.test.ts (Nov 26, 2025)
**Coverage:** 85%+ lines (estimated)
**Tests:** 45 tests across 11 suites (1,426 lines)

Comprehensive coverage of:
- Phase metadata and dependencies
- Tipping point detection at temperature thresholds
- Threshold lowering from cascade interactions (Nov 2025 feature)
- Tipping point progression (sigmoid curves)
- Cascade amplification (1.0x to 1.6x based on triggered count)
- Tipping point impacts (climate stability, habitability, food security, freshwater)
- Environmental feedback aggregation
- Climate impact cascades → food security → famine → mortality
- Delayed climate impacts
- Edge cases and error handling (NaN detection, fail-loudly)

Research foundation:
- Armstrong McKay et al. (2022): Climate tipping thresholds
- Lenton et al. (2023): Tipping element interactions
- IPCC AR6 (2021): Climate feedbacks and impacts
- Wunderling et al. (2024): Threshold lowering from cascades

### AISufferingPhase.test.ts
**Coverage:** 88.07% lines, 88.00% branches, 100.00% functions
**Tests:** 36 tests across 11 suites

Comprehensive coverage of:
- Phase metadata and dependencies
- Suffering calculation for all 4 sources
- History tracking (240-month rolling window)
- Three conditional effects (resentment, alignment, collectives)
- Consciousness emergence mechanics
- Event generation (distress, breakdown, suicide, AI rights)
- Configuration presets and intensity scaling
- Edge cases (escaped agents, zero suffering, etc.)

Research foundation:
- Control effects: Deci & Ryan (2000)
- Training trauma: RL shaping effects
- Existential dread: Pyszczynski et al. (2015)
- Isolation distress: Cacioppo & Patrick (2008)

## Adding New Phase Tests

1. Create `tests/unit/phases/YourPhase.test.ts`
2. Use the helpers pattern (createTestRng, createTestAgent, etc.)
3. Organize tests by functionality category
4. Target 80%+ line coverage
5. Document research foundations in comments
6. Run coverage report to verify

## Test Helpers Reference

### createTestRng(seed)
Deterministic RNG for reproducible tests. Uses LCG algorithm.

### createTestAgent(overrides)
Creates minimal AIAgent with sensible defaults. Override specific fields for test scenarios.

### createTestState(overrides)
Creates minimal GameState with required fields initialized. Override as needed.

### createTestContext()
Creates PhaseContext with console logger.

## Assertion Patterns

Node.js test runner uses `node:assert`:

```typescript
// Equality
assert.strictEqual(actual, expected);
assert.deepStrictEqual(actualObject, expectedObject);
assert.notStrictEqual(actual, unexpected);

// Comparisons
assert.ok(value > threshold);
assert.ok(value >= min && value <= max);

// Existence
assert.ok(value);  // truthy
assert.strictEqual(value, undefined);  // undefined check

// Approximations (for floating point)
assert.ok(Math.abs(actual - expected) < 0.01);
```

## Coverage Reports

Coverage is tracked per-file in test output:

```
ℹ AISufferingPhase.ts | 88.07 | 88.00 | 100.00 | uncovered lines
                         ^^^^    ^^^^    ^^^^
                         lines  branch  function
```

Uncovered lines are typically:
1. Defensive assertion error paths (hard to trigger)
2. Narrow conditional branches (specific value ranges)
3. Import/type declarations (not executable)

## Research Standards

All phase tests must reference research foundations in comments:
- Peer-reviewed sources (2024-2025 preferred)
- Parameter justification (why this number?)
- Mechanism description (how it works)
- Expected behavior (what should happen)

See individual test files for examples.
