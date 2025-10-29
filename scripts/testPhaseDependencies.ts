/**
 * Phase Dependency System Tests
 *
 * Validates the phase dependency system prevents race conditions like
 * the BayesianMortality → CountryPopulation bug (Oct 28, 2025).
 *
 * Tests:
 * 1. Dependency declarations are validated at runtime
 * 2. Phases with dependencies must run AFTER their dependencies
 * 3. Phases cannot execute before their dependencies
 * 4. Context tracks executed phases correctly
 * 5. Assertion utilities detect ordering violations
 *
 * Usage:
 *   npx tsx scripts/testPhaseDependencies.ts
 */

import { PhaseOrchestrator, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '../src/simulation/engine/PhaseOrchestrator';
import { GameState } from '../src/types/game';
import { assertPhaseDependency, assertPhaseNotExecuted, assertStateFieldNotModified } from '../src/simulation/utils/assertions';

// Create minimal mock game state for testing
function createMockGameState(): GameState {
  return {
    currentMonth: 0,
    humanPopulationSystem: {
      population: 8.0,
      carryingCapacity: 10.0,
      growthRate: 0.01,
      adjustedBirthRate: 0.02,
      adjustedDeathRate: 0.01,
      fertilityRate: 2.1,
      medianAge: 30,
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      mortalityRisks: [],
      regionalPopulations: []
    }
  } as GameState;
}

// ============================================================================
// TEST PHASES
// ============================================================================

/**
 * Mock phase that runs first (no dependencies)
 */
class Phase1 implements SimulationPhase {
  readonly id = 'phase_1';
  readonly name = 'Phase 1 (No Dependencies)';
  readonly order = 10.0;

  execute(state: GameState, _rng: RNGFunction, context: PhaseContext): PhaseResult {
    console.log('  ✅ Phase 1 executed');
    state.currentMonth = 1; // Modify state to track execution
    return { events: [] };
  }
}

/**
 * Mock phase that depends on Phase 1
 */
class Phase2 implements SimulationPhase {
  readonly id = 'phase_2';
  readonly name = 'Phase 2 (Depends on Phase 1)';
  readonly order = 20.0;
  readonly dependencies = ['phase_1'] as const;

  execute(state: GameState, _rng: RNGFunction, context: PhaseContext): PhaseResult {
    console.log('  ✅ Phase 2 executed');
    state.currentMonth = 2; // Modify state
    return { events: [] };
  }
}

/**
 * Mock phase that has WRONG order (runs before dependency)
 */
class PhaseBadOrder implements SimulationPhase {
  readonly id = 'phase_bad_order';
  readonly name = 'Phase Bad Order (Wrong Order)';
  readonly order = 5.0; // BEFORE Phase 1, but declares dependency on it
  readonly dependencies = ['phase_1'] as const;

  execute(state: GameState, _rng: RNGFunction, context: PhaseContext): PhaseResult {
    console.log('  ❌ PhaseBadOrder should NOT execute');
    return { events: [] };
  }
}

/**
 * Mock phase that simulates BayesianMortalityResolutionPhase behavior
 */
class MortalityPhase implements SimulationPhase {
  readonly id = 'mortality_resolution';
  readonly name = 'Mortality Resolution';
  readonly order = 35.0;

  execute(state: GameState, _rng: RNGFunction, context: PhaseContext): PhaseResult {
    // Simulate mortality adjusting population
    const initialPop = state.humanPopulationSystem.population;
    state.humanPopulationSystem.population = initialPop * 0.99; // 1% mortality

    // Store authoritative value
    context.data.set('mortality_adjusted_population', state.humanPopulationSystem.population);

    console.log(`  ✅ Mortality phase: ${initialPop.toFixed(3)}B → ${state.humanPopulationSystem.population.toFixed(3)}B`);
    return { events: [] };
  }
}

/**
 * Mock phase that INCORRECTLY overwrites population (simulates the deleted CountryPopulationPhase)
 */
class PopulationOverwritePhase implements SimulationPhase {
  readonly id = 'population_overwrite';
  readonly name = 'Population Overwrite (BAD)';
  readonly order = 36.0; // After mortality

  execute(state: GameState, _rng: RNGFunction, context: PhaseContext): PhaseResult {
    const mortalityPop = context.data.get('mortality_adjusted_population') as number;
    const currentPop = state.humanPopulationSystem.population;

    // This simulates the BUG: overwriting mortality-adjusted population
    state.humanPopulationSystem.population = 8.5; // Hardcoded value (BAD!)

    console.log(`  ❌ Population overwrite: ${currentPop.toFixed(3)}B → ${state.humanPopulationSystem.population.toFixed(3)}B`);
    console.log(`     (Should have been: ${mortalityPop.toFixed(3)}B from mortality phase)`);

    return { events: [] };
  }
}

/**
 * Mock phase that validates population wasn't overwritten
 */
class PopulationValidationPhase implements SimulationPhase {
  readonly id = 'population_validation';
  readonly name = 'Population Validation';
  readonly order = 37.0;
  readonly dependencies = ['mortality_resolution'] as const;

  execute(state: GameState, _rng: RNGFunction, context: PhaseContext): PhaseResult {
    const expectedPop = context.data.get('mortality_adjusted_population') as number;
    const currentPop = state.humanPopulationSystem.population;

    // Use assertion to detect silent overwrite
    try {
      assertStateFieldNotModified(currentPop, expectedPop, {
        fieldPath: 'humanPopulationSystem.population',
        lastModifiedBy: 'mortality_resolution',
        suspectedCulprit: 'population_overwrite',
        month: state.currentMonth
      });
      console.log(`  ✅ Population validation passed: ${currentPop.toFixed(3)}B`);
    } catch (error) {
      console.log(`  ❌ Population validation FAILED: ${(error as Error).message}`);
      throw error;
    }

    return { events: [] };
  }
}

// ============================================================================
// TEST SUITE
// ============================================================================

function seedRNG(seed: number): RNGFunction {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

async function runTest(name: string, testFn: () => void | Promise<void>): Promise<boolean> {
  console.log(`\n🧪 TEST: ${name}`);
  try {
    await testFn();
    console.log(`✅ PASSED: ${name}\n`);
    return true;
  } catch (error) {
    console.log(`❌ FAILED: ${name}`);
    console.log(`   Error: ${(error as Error).message}\n`);
    return false;
  }
}

async function main() {
  console.log('\n='.repeat(80));
  console.log('PHASE DEPENDENCY SYSTEM TESTS');
  console.log('='.repeat(80));

  const results: boolean[] = [];

  // TEST 1: Basic dependency execution order
  results.push(await runTest('Basic dependency execution order', () => {
    const orchestrator = new PhaseOrchestrator();
    const state = createMockGameState();
    const rng = seedRNG(12345);

    orchestrator.registerPhase(new Phase1());
    orchestrator.registerPhase(new Phase2());

    orchestrator.executeAll(state, rng);

    if (state.currentMonth !== 2) {
      throw new Error(`Expected state.currentMonth=2, got ${state.currentMonth}`);
    }
  }));

  // TEST 2: Dependency violation detection (wrong order)
  results.push(await runTest('Dependency violation detection (wrong order)', () => {
    const orchestrator = new PhaseOrchestrator();
    const state = createMockGameState();
    const rng = seedRNG(12345);

    // Register in wrong order
    orchestrator.registerPhase(new PhaseBadOrder()); // Order 5, depends on phase_1
    orchestrator.registerPhase(new Phase1()); // Order 10

    try {
      orchestrator.executeAll(state, rng);
      throw new Error('Should have thrown dependency violation error');
    } catch (error) {
      const msg = (error as Error).message;
      if (!msg.includes('PHASE DEPENDENCY VIOLATION')) {
        throw new Error(`Wrong error type: ${msg}`);
      }
      console.log('  ✅ Correctly detected dependency violation');
    }
  }));

  // TEST 3: Context tracks executed phases
  results.push(await runTest('Context tracks executed phases', () => {
    const orchestrator = new PhaseOrchestrator();
    const state = createMockGameState();
    const rng = seedRNG(12345);

    orchestrator.registerPhase(new Phase1());
    orchestrator.registerPhase(new Phase2());

    const context: PhaseContext = {
      month: 0,
      data: new Map(),
      executedPhases: new Set()
    };

    orchestrator.executeAll(state, rng, context);

    if (!context.executedPhases.has('phase_1')) {
      throw new Error('Context should track phase_1 execution');
    }
    if (!context.executedPhases.has('phase_2')) {
      throw new Error('Context should track phase_2 execution');
    }

    console.log(`  ✅ Executed phases: ${Array.from(context.executedPhases).join(', ')}`);
  }));

  // TEST 4: assertPhaseNotExecuted utility
  results.push(await runTest('assertPhaseNotExecuted utility', () => {
    const context: PhaseContext = {
      month: 0,
      data: new Map(),
      executedPhases: new Set(['already_executed_phase'])
    };

    try {
      assertPhaseNotExecuted(context, 'already_executed_phase', {
        currentPhase: 'test_phase',
        reason: 'Testing assertion',
        month: 0
      });
      throw new Error('Should have thrown phase ordering violation');
    } catch (error) {
      const msg = (error as Error).message;
      if (!msg.includes('PHASE ORDERING VIOLATION')) {
        throw new Error(`Wrong error type: ${msg}`);
      }
      console.log('  ✅ assertPhaseNotExecuted correctly detected violation');
    }
  }));

  // TEST 5: assertPhaseDependency utility
  results.push(await runTest('assertPhaseDependency utility', () => {
    const context: PhaseContext = {
      month: 0,
      data: new Map(),
      executedPhases: new Set() // Empty - no phases executed yet
    };

    try {
      assertPhaseDependency(context, 'required_phase', {
        currentPhase: 'test_phase',
        reason: 'Testing dependency',
        month: 0
      });
      throw new Error('Should have thrown dependency violation');
    } catch (error) {
      const msg = (error as Error).message;
      if (!msg.includes('PHASE DEPENDENCY VIOLATION')) {
        throw new Error(`Wrong error type: ${msg}`);
      }
      console.log('  ✅ assertPhaseDependency correctly detected missing dependency');
    }
  }));

  // TEST 6: Mortality → Population race condition (THE BUG WE'RE PREVENTING)
  results.push(await runTest('Mortality → Population race condition detection', () => {
    const orchestrator = new PhaseOrchestrator();
    const state = createMockGameState();
    const rng = seedRNG(12345);

    orchestrator.registerPhase(new MortalityPhase()); // Order 35
    orchestrator.registerPhase(new PopulationOverwritePhase()); // Order 36 - OVERWRITES
    orchestrator.registerPhase(new PopulationValidationPhase()); // Order 37 - DETECTS

    try {
      orchestrator.executeAll(state, rng);
      throw new Error('Should have detected population overwrite');
    } catch (error) {
      const msg = (error as Error).message;
      if (!msg.includes('STATE FIELD OVERWRITE DETECTED')) {
        throw new Error(`Wrong error type: ${msg}`);
      }
      console.log('  ✅ Detected silent population overwrite (the bug we fixed!)');
    }
  }));

  // TEST 7: Successful mortality → validation (no overwrite)
  results.push(await runTest('Successful mortality → validation (no overwrite)', () => {
    const orchestrator = new PhaseOrchestrator();
    const state = createMockGameState();
    const rng = seedRNG(12345);

    orchestrator.registerPhase(new MortalityPhase()); // Order 35
    // DON'T register PopulationOverwritePhase - this is the fix!
    orchestrator.registerPhase(new PopulationValidationPhase()); // Order 37

    orchestrator.executeAll(state, rng);
    console.log('  ✅ No population overwrite - system working correctly');
  }));

  // ============================================================================
  // SUMMARY
  // ============================================================================

  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));

  const passed = results.filter(r => r).length;
  const failed = results.length - passed;

  console.log(`Total tests: ${results.length}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);

  if (failed > 0) {
    console.log('\n❌ Some tests FAILED - phase dependency system needs fixes');
    process.exit(1);
  } else {
    console.log('\n✅ All tests PASSED - phase dependency system working correctly');
    console.log('\nThe BayesianMortality → CountryPopulation race condition is now PREVENTED.');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('❌ Test suite crashed:', error);
  process.exit(1);
});
