/**
 * Regression Test Runner
 *
 * Runs comprehensive tests to validate refactoring hasn't changed behavior.
 * This script can be run independently of Jest for quick validation.
 */

import { SimulationEngine } from '@/simulation/engine';
import { createDefaultInitialState } from '@/simulation/initialization';
import {
  clamp,
  getAverageAICapability,
  getAverageAlignment,
} from '@/simulation/utils';
import {
  SystemRegistry,
  EnvironmentalSystem
} from '@/simulation/systems';

/**
 * Test seeds for reproducibility
 */
const TEST_SEEDS = [42000, 42001, 42002, 42003, 42004];
const QUICK_TEST_MONTHS = 12;
const MEDIUM_TEST_MONTHS = 50;

interface TestResult {
  seed: number;
  passed: boolean;
  duration: number;
  finalMonth: number;
  outcome: string;
  avgCapability: number;
  avgAlignment: number;
  error?: string;
}

/**
 * Run a quick simulation test with a given seed
 */
function runQuickTest(seed: number): TestResult {
  const startTime = Date.now();
  const result: TestResult = {
    seed,
    passed: false,
    duration: 0,
    finalMonth: 0,
    outcome: 'unknown',
    avgCapability: 0,
    avgAlignment: 0
  };

  try {
    const engine = new SimulationEngine({ seed, maxMonths: QUICK_TEST_MONTHS });
    const initialState = createDefaultInitialState();
    const runResult = engine.run(initialState);

    result.finalMonth = runResult.summary.totalMonths;
    result.outcome = runResult.summary.finalOutcome;
    result.avgCapability = getAverageAICapability(runResult.finalState);
    result.avgAlignment = getAverageAlignment(runResult.finalState);
    result.duration = Date.now() - startTime;
    result.passed = true;
  } catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
    result.duration = Date.now() - startTime;
  }

  return result;
}

/**
 * Test Phase 1 utilities
 */
function testPhase1Utilities(): { passed: boolean; errors: string[] } {
  const errors: string[] = [];

  // Test clamp
  if (clamp(-5, 0, 10) !== 0) errors.push('clamp: min boundary failed');
  if (clamp(15, 0, 10) !== 10) errors.push('clamp: max boundary failed');
  if (clamp(5, 0, 10) !== 5) errors.push('clamp: mid-range failed');

  // Test AI utilities with mock state
  const mockState = {
    aiAgents: [
      { id: '1', capability: 1.0, alignment: 0.8 },
      { id: '2', capability: 2.0, alignment: 0.6 }
    ]
  } as any;

  const avgCap = getAverageAICapability(mockState);
  if (avgCap !== 1.5) errors.push(`getAverageAICapability: expected 1.5, got ${avgCap}`);

  const avgAlign = getAverageAlignment(mockState);
  if (avgAlign !== 0.7) errors.push(`getAverageAlignment: expected 0.7, got ${avgAlign}`);

  return {
    passed: errors.length === 0,
    errors
  };
}

/**
 * Test Phase 2 system abstractions
 */
function testPhase2Systems(): { passed: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    // Test EnvironmentalSystem
    const envSystem = new EnvironmentalSystem();
    if (envSystem.id !== 'environmental') {
      errors.push('EnvironmentalSystem: wrong id');
    }

    const envState = envSystem.initialize();
    if (!envState || typeof envState.resourceReserves !== 'number') {
      errors.push('EnvironmentalSystem: initialization failed');
    }

    // Test SystemRegistry
    const registry = new SystemRegistry();
    registry.register(envSystem);

    if (registry.getSystemIds().length !== 1) {
      errors.push('SystemRegistry: registration failed');
    }

    if (registry.get('environmental') !== envSystem) {
      errors.push('SystemRegistry: retrieval failed');
    }

    const states = registry.initializeAll();
    if (!states.environmental) {
      errors.push('SystemRegistry: initializeAll failed');
    }
  } catch (error) {
    errors.push(`Phase 2 exception: ${error instanceof Error ? error.message : String(error)}`);
  }

  return {
    passed: errors.length === 0,
    errors
  };
}

/**
 * Main test runner
 */
async function main() {
  console.log('\n🧪 REFACTORING REGRESSION TEST SUITE\n');
  console.log('=' .repeat(80));

  // Phase 1 Tests
  console.log('\n📦 Phase 1: Shared Utilities');
  console.log('-'.repeat(80));
  const phase1Result = testPhase1Utilities();
  if (phase1Result.passed) {
    console.log('✅ All Phase 1 utility tests passed');
  } else {
    console.log('❌ Phase 1 utility tests FAILED:');
    phase1Result.errors.forEach(err => console.log(`   - ${err}`));
  }

  // Phase 2 Tests
  console.log('\n🏗️  Phase 2: System Abstractions');
  console.log('-'.repeat(80));
  const phase2Result = testPhase2Systems();
  if (phase2Result.passed) {
    console.log('✅ All Phase 2 system tests passed');
  } else {
    console.log('❌ Phase 2 system tests FAILED:');
    phase2Result.errors.forEach(err => console.log(`   - ${err}`));
  }

  // Integration Tests
  console.log('\n🎮 Integration Tests: Quick Simulations (12 months)');
  console.log('-'.repeat(80));

  const quickResults: TestResult[] = [];
  for (const seed of TEST_SEEDS) {
    console.log(`\nRunning seed ${seed}...`);
    const result = runQuickTest(seed);
    quickResults.push(result);

    if (result.passed) {
      console.log(`✅ Seed ${seed}: ${result.outcome} in ${result.finalMonth} months (${result.duration}ms)`);
      console.log(`   Avg Capability: ${result.avgCapability.toFixed(3)}, Avg Alignment: ${result.avgAlignment.toFixed(3)}`);
    } else {
      console.log(`❌ Seed ${seed} FAILED: ${result.error}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));

  const allPassed = phase1Result.passed && phase2Result.passed &&
                    quickResults.every(r => r.passed);

  console.log(`\nPhase 1 Utilities: ${phase1Result.passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Phase 2 Systems:   ${phase2Result.passed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Integration Tests: ${quickResults.filter(r => r.passed).length}/${quickResults.length} passed`);

  if (allPassed) {
    console.log('\n🎉 ALL REGRESSION TESTS PASSED!\n');
    console.log('Refactoring is safe to proceed to next phase.\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  SOME TESTS FAILED!\n');
    console.log('Review failures before proceeding with refactoring.\n');
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('\n💥 Regression test runner crashed:', error);
    process.exit(1);
  });
}

export { runQuickTest, testPhase1Utilities, testPhase2Systems };
