# Refactoring Regression Test Suite

This directory contains regression tests to validate that architectural refactoring preserves simulation behavior.

## Test Files

### Unit Tests

1. **`phase1-utilities.test.ts`** - Tests for Phase 1 shared utilities
   - Math utilities: `clamp`, `lerp`, `inverseLerp`, `mapRange`, `weightedAverage`
   - AI utilities: `getAverageAICapability`, `getAverageAlignment`, `getTotalAICapability`, etc.
   - Validates extracted utilities work identically to original implementations

2. **`phase2-systems.test.ts`** - Tests for Phase 2 system abstractions
   - System interfaces: `SimulationSystem`, `AccumulationSystem`, `SpiralSystem`, `QualitySystem`
   - `SystemRegistry` functionality
   - `EnvironmentalSystem` wrapper
   - Validates new abstractions don't change behavior

### Integration Tests

3. **`baseline-simulation.test.ts`** - Baseline simulation tests with fixed seeds
   - Documents expected behavior before high-risk refactoring
   - Uses snapshot testing to catch any behavioral changes
   - IMPORTANT: These tests should remain stable across refactoring

### Test Runners

4. **`runRegressionTests.ts`** - Main regression test runner
   - Can run independently of Jest
   - Quick validation during development
   - Useful for pre-commit checks
   - Tests Phase 1, Phase 2, and quick simulations

5. **`runPhase4Tests.ts`** - Phase 4 specific test runner
   - Validates phase registration and ordering
   - Tests individual phase implementations
   - Validates engine integration
   - Run separately for detailed Phase 4 validation

### Test Files

6. **`phase4-phases.test.ts`** - Jest-compatible Phase 4 tests (future)
   - Unit tests for individual phases
   - Integration tests for orchestrator
   - Currently not runnable (Jest not configured)

## Running Tests

### Using Jest (recommended)

```bash
# Run all refactoring tests
npm test tests/refactoring

# Run specific test file
npm test tests/refactoring/phase1-utilities.test.ts

# Run with coverage
npm test -- --coverage tests/refactoring
```

### Using Standalone Runners

```bash
# Quick regression check (Phase 1, 2, simulations)
npx tsx tests/refactoring/runRegressionTests.ts

# Phase 4 detailed tests (orchestrator, phases, ordering)
npx tsx tests/refactoring/runPhase4Tests.ts

# Run both for comprehensive validation
npx tsx tests/refactoring/runRegressionTests.ts && \
npx tsx tests/refactoring/runPhase4Tests.ts
```

## Test Strategy

### Phase 1: Shared Utilities (COMPLETED ✅)

**Validation:**
- [x] Math utilities produce correct results
- [x] AI utilities produce correct results
- [x] No duplicate code remains
- [x] All imports resolve
- [x] Monte Carlo produces same results

**How to verify:**
```bash
npx tsx tests/refactoring/runRegressionTests.ts
```

### Phase 2: System Abstractions (COMPLETED ✅)

**Validation:**
- [x] System interfaces compile
- [x] EnvironmentalSystem wraps correctly
- [x] SystemRegistry manages systems
- [x] No simulation behavior changes
- [x] Monte Carlo produces same results

**How to verify:**
```bash
npx tsx tests/refactoring/runRegressionTests.ts
```

### Phase 4: Engine Orchestration (IN PROGRESS ⏳)

**Validation checklist (before starting):**
- [x] Create baseline snapshots of engine.step() behavior
- [x] Document exact execution order of all phases
- [x] Capture state at multiple checkpoints (months 10, 25, 50)
- [x] Run 10+ seeds and capture outcomes

**Validation checklist (during Phase 4):**
- [x] Create PhaseOrchestrator infrastructure ✅
- [x] Create 21 phase implementations (Batches 1-3) ✅
- [x] Wire into engine constructor ✅
- [x] Create Phase 4 test suite ✅
- [ ] Add dual execution validation
- [ ] Convert remaining 12 phases (Batches 4-5)
- [ ] Run regression tests after each batch
- [ ] Verify Monte Carlo results match baseline
- [ ] Check performance (should be within 5% of baseline)

**Validation checklist (after Phase 4):**
- [x] Phase registration tests pass ✅
- [x] Phase ordering tests pass ✅
- [x] Engine integration tests pass ✅
- [ ] All baseline simulations pass
- [ ] Engine.step() reduced to <100 LOC
- [ ] All phases execute in correct order
- [ ] Monte Carlo produces identical results with same seeds
- [ ] Performance within 5% of baseline

**How to verify:**
```bash
# Run Phase 4 specific tests
npx tsx tests/refactoring/runPhase4Tests.ts

# Run full regression suite
npx tsx tests/refactoring/runRegressionTests.ts
```

## Test Seeds

Fixed seeds for reproducible testing:

- **42000** - Utopia trajectory path
- **42001** - Dystopia trajectory path
- **42002** - Extinction risk scenario
- **42003** - Balanced outcome probabilities
- **42004** - Quick outcome (for fast tests)

These seeds were chosen during Phase 1 development to cover different simulation paths.

## Baseline Metrics

Pre-refactoring metrics (for comparison):

| Metric | Before | Phase 1 | Phase 2 | Phase 4 Target |
|--------|--------|---------|---------|----------------|
| engine.step() LOC | 300+ | 300 | 300 | <100 |
| Duplicate utilities | 8+ | 0 | 0 | 0 |
| System abstractions | 0 | 0 | 3 files | All systems |
| Total simulation LOC | ~20,000 | ~20,000 | ~20,000 | ~18,000 |

## Adding New Tests

When adding regression tests:

1. **Unit tests** - Add to appropriate phase file
2. **Integration tests** - Add to `baseline-simulation.test.ts`
3. **New phases** - Create `phaseN-*.test.ts` file
4. **Update this README** with new test documentation

## Snapshot Testing

For baseline tests that use snapshots:

```bash
# Update snapshots after intentional changes
npm test -- -u tests/refactoring/baseline-simulation.test.ts

# Review snapshot changes carefully!
git diff tests/refactoring/__snapshots__/
```

⚠️ **WARNING**: Only update snapshots if you're certain the behavior change is intentional. Snapshots protect against accidental behavioral changes during refactoring.

## CI/CD Integration

These tests should run:

1. **On every commit** to refactoring branches
2. **Before merging** refactoring PRs
3. **As part of main CI** to prevent regressions

## Questions?

See the main refactoring roadmap: `plans/refactoring-roadmap.md`
