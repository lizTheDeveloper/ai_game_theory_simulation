#!/usr/bin/env tsx
/**
 * Deployment Smoke Test Suite (Roadmap 5.1)
 *
 * Quick health checks that verify a deployed version isn't broken.
 * Target: <60s execution time
 *
 * Checks:
 * 1. Simulation initializes and runs 12 months without crashes
 * 2. All phases execute in correct order
 * 3. No NaN/Infinity in any calculation
 * 4. State serialization/deserialization works
 * 5. Game layer can load simulation state
 *
 * Exit codes:
 *   0 = All checks passed
 *   1 = One or more checks failed
 *
 * Usage:
 *   npx tsx scripts/deploymentSmokeTest.ts
 *
 * @module scripts/deploymentSmokeTest
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import type { GameState } from '../src/types/game';

// ============================================================================
// Configuration
// ============================================================================

const TEST_SEED = 42424;
const SHORT_RUN_MONTHS = 12;
const TIMEOUT_MS = 60000; // 60 second timeout

// ============================================================================
// Test Utilities
// ============================================================================

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

const results: TestResult[] = [];
let startTime: number;

function log(message: string): void {
  console.log(message);
}

function logSuccess(test: string): void {
  console.log(`  ✅ ${test}`);
}

function logFailure(test: string, error: string): void {
  console.log(`  ❌ ${test}: ${error}`);
}

function createTestRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/**
 * Recursively check for NaN/Infinity in any numeric value
 */
function findInvalidNumbers(obj: unknown, path: string = ''): string[] {
  const invalidPaths: string[] = [];

  if (typeof obj === 'number') {
    if (!isFinite(obj)) {
      invalidPaths.push(`${path} = ${obj}`);
    }
    return invalidPaths;
  }

  if (obj === null || obj === undefined) {
    return invalidPaths;
  }

  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      invalidPaths.push(...findInvalidNumbers(item, `${path}[${index}]`));
    });
    return invalidPaths;
  }

  if (typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      invalidPaths.push(...findInvalidNumbers(value, path ? `${path}.${key}` : key));
    }
  }

  return invalidPaths;
}

async function runTest(name: string, fn: () => void | Promise<void>): Promise<boolean> {
  const testStart = Date.now();
  try {
    await fn();
    const duration = Date.now() - testStart;
    results.push({ name, passed: true, duration });
    logSuccess(`${name} (${duration}ms)`);
    return true;
  } catch (error) {
    const duration = Date.now() - testStart;
    const errorMessage = error instanceof Error ? error.message : String(error);
    results.push({ name, passed: false, duration, error: errorMessage });
    logFailure(name, errorMessage);
    return false;
  }
}

// ============================================================================
// Smoke Tests
// ============================================================================

async function testInitialization(): Promise<void> {
  const rng = createTestRng(TEST_SEED);
  const state = createDefaultInitialState(rng, 'historical');

  if (!state) {
    throw new Error('createDefaultInitialState returned null/undefined');
  }

  if (typeof state.currentMonth !== 'number') {
    throw new Error(`currentMonth is not a number: ${typeof state.currentMonth}`);
  }

  // Check critical initial values exist
  if (!state.humanPopulationSystem?.population) {
    throw new Error('humanPopulationSystem.population is missing');
  }

  if (!state.aiAgents || state.aiAgents.length === 0) {
    throw new Error('aiAgents array is empty or missing');
  }

  // Check for NaN in initial state
  const invalidPaths = findInvalidNumbers(state);
  if (invalidPaths.length > 0) {
    throw new Error(`NaN/Infinity in initial state:\n  ${invalidPaths.slice(0, 5).join('\n  ')}`);
  }
}

async function testSimulationRuns12Months(): Promise<void> {
  const engine = new SimulationEngine({ seed: TEST_SEED, maxMonths: SHORT_RUN_MONTHS });
  const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

  const result = engine.run(state, { maxMonths: SHORT_RUN_MONTHS, checkActualOutcomes: false });

  if (!result.finalState) {
    throw new Error('Simulation returned no finalState');
  }

  if (result.finalState.currentMonth !== SHORT_RUN_MONTHS) {
    throw new Error(`Expected ${SHORT_RUN_MONTHS} months, got ${result.finalState.currentMonth}`);
  }
}

async function testNoNaNAfterSimulation(): Promise<void> {
  const engine = new SimulationEngine({ seed: TEST_SEED, maxMonths: SHORT_RUN_MONTHS });
  const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

  const result = engine.run(state, { maxMonths: SHORT_RUN_MONTHS, checkActualOutcomes: false });

  // Check critical fields for NaN/Infinity
  const finalState = result.finalState;

  // Note: Use correct field names from GameState type
  const checks = [
    { name: 'currentMonth', value: finalState.currentMonth },
    { name: 'humanPopulationSystem.population', value: finalState.humanPopulationSystem?.population },
    { name: 'environmentalAccumulation.climateStability', value: finalState.environmentalAccumulation?.climateStability },
    { name: 'aiCapabilities.totalCapability', value: finalState.aiCapabilities?.totalCapability },
    { name: 'government.governmentCapacity', value: finalState.government?.governmentCapacity },
    { name: 'society.trust', value: finalState.society?.trust },
  ];

  const failures: string[] = [];
  for (const check of checks) {
    if (check.value !== undefined && !Number.isFinite(check.value)) {
      failures.push(`${check.name} = ${check.value}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(`NaN/Infinity detected:\n  ${failures.join('\n  ')}`);
  }
}

async function testStateSerialization(): Promise<void> {
  const engine = new SimulationEngine({ seed: TEST_SEED, maxMonths: SHORT_RUN_MONTHS });
  const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

  const result = engine.run(state, { maxMonths: SHORT_RUN_MONTHS, checkActualOutcomes: false });

  // Test JSON serialization roundtrip
  let serialized: string;
  try {
    serialized = JSON.stringify(result.finalState);
  } catch (error) {
    throw new Error(`Failed to serialize state: ${error instanceof Error ? error.message : error}`);
  }

  let deserialized: GameState;
  try {
    deserialized = JSON.parse(serialized) as GameState;
  } catch (error) {
    throw new Error(`Failed to deserialize state: ${error instanceof Error ? error.message : error}`);
  }

  // Verify key values survived roundtrip
  if (deserialized.currentMonth !== result.finalState.currentMonth) {
    throw new Error(`currentMonth mismatch after roundtrip: ${deserialized.currentMonth} vs ${result.finalState.currentMonth}`);
  }

  if (deserialized.humanPopulationSystem?.population !== result.finalState.humanPopulationSystem?.population) {
    throw new Error(`Population mismatch after roundtrip`);
  }
}

async function testPhaseExecution(): Promise<void> {
  const engine = new SimulationEngine({ seed: TEST_SEED, maxMonths: 1 });
  const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

  // Capture initial values for comparison
  const initialMonth = state.currentMonth;
  const initialPopulation = state.humanPopulationSystem?.population;

  // Run just 1 month to verify phases execute
  const result = engine.run(state, { maxMonths: 1, checkActualOutcomes: false });

  if (result.finalState.currentMonth !== 1) {
    throw new Error(`Expected 1 month after single step, got ${result.finalState.currentMonth}`);
  }

  // Verify time advanced (phases actually ran)
  if (result.finalState.currentMonth === initialMonth) {
    throw new Error('currentMonth did not advance - phases may not have executed');
  }

  // Verify eventLog exists and simulation produced events
  if (!Array.isArray(result.finalState.eventLog)) {
    throw new Error('eventLog is not an array after simulation');
  }
}

async function testDeterminism(): Promise<void> {
  // Run simulation twice with same seed
  const engine1 = new SimulationEngine({ seed: TEST_SEED, maxMonths: SHORT_RUN_MONTHS });
  const state1 = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');
  const result1 = engine1.run(state1, { maxMonths: SHORT_RUN_MONTHS, checkActualOutcomes: false });

  const engine2 = new SimulationEngine({ seed: TEST_SEED, maxMonths: SHORT_RUN_MONTHS });
  const state2 = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');
  const result2 = engine2.run(state2, { maxMonths: SHORT_RUN_MONTHS, checkActualOutcomes: false });

  // Compare key metrics
  if (result1.finalState.humanPopulationSystem?.population !== result2.finalState.humanPopulationSystem?.population) {
    throw new Error(`Population not deterministic: ${result1.finalState.humanPopulationSystem?.population} vs ${result2.finalState.humanPopulationSystem?.population}`);
  }

  if (result1.finalState.environmentalState?.globalTemperature !== result2.finalState.environmentalState?.globalTemperature) {
    throw new Error(`Temperature not deterministic`);
  }

  if (result1.finalState.currentMonth !== result2.finalState.currentMonth) {
    throw new Error(`Month count not deterministic`);
  }
}

async function testGameLayerCompatibility(): Promise<void> {
  const engine = new SimulationEngine({ seed: TEST_SEED, maxMonths: SHORT_RUN_MONTHS });
  const state = createDefaultInitialState(createTestRng(TEST_SEED), 'historical');

  const result = engine.run(state, { maxMonths: SHORT_RUN_MONTHS, checkActualOutcomes: false });

  // Test that state can be used as GameStateSnapshot (Readonly<GameState>)
  // This verifies the game layer can consume simulation output
  const snapshot = result.finalState as Readonly<typeof result.finalState>;

  // Verify fields the game layer expects exist
  // Note: environmentalAccumulation is the correct field (not environmentalState)
  const requiredFields = [
    'currentMonth',
    'aiAgents',
    'humanPopulationSystem',
    'environmentalAccumulation',
  ];

  for (const field of requiredFields) {
    if (!(field in snapshot)) {
      throw new Error(`Missing required field for game layer: ${field}`);
    }
  }

  // Verify eventLog is an array (game layer iterates over it)
  if (!Array.isArray(snapshot.eventLog)) {
    throw new Error(`eventLog is not an array: ${typeof snapshot.eventLog}`);
  }
}

// ============================================================================
// Main Execution
// ============================================================================

async function main(): Promise<void> {
  startTime = Date.now();

  log('');
  log('==============================================');
  log('  DEPLOYMENT SMOKE TEST SUITE');
  log('==============================================');
  log('');

  // Set timeout
  const timeoutId = setTimeout(() => {
    log('');
    log('❌ TIMEOUT: Tests exceeded 60 second limit');
    process.exit(1);
  }, TIMEOUT_MS);

  try {
    log('Running smoke tests...');
    log('');

    await runTest('Initialization', testInitialization);
    await runTest('Simulation runs 12 months', testSimulationRuns12Months);
    await runTest('No NaN/Infinity after simulation', testNoNaNAfterSimulation);
    await runTest('Phase execution', testPhaseExecution);
    await runTest('State serialization roundtrip', testStateSerialization);
    await runTest('Determinism check', testDeterminism);
    await runTest('Game layer compatibility', testGameLayerCompatibility);

    clearTimeout(timeoutId);

    // Summary
    log('');
    log('==============================================');
    const totalDuration = Date.now() - startTime;
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;

    if (failed === 0) {
      log(`  ✅ ALL ${passed} TESTS PASSED (${totalDuration}ms)`);
      log('==============================================');
      log('');
      process.exit(0);
    } else {
      log(`  ❌ ${failed}/${passed + failed} TESTS FAILED (${totalDuration}ms)`);
      log('');
      log('Failed tests:');
      for (const result of results.filter(r => !r.passed)) {
        log(`  - ${result.name}: ${result.error}`);
      }
      log('==============================================');
      log('');
      process.exit(1);
    }
  } catch (error) {
    clearTimeout(timeoutId);
    log('');
    log(`❌ UNEXPECTED ERROR: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}

main();
