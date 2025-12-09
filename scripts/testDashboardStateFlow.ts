#!/usr/bin/env npx tsx
/**
 * Test Dashboard State Flow
 *
 * Validates that simulation state is properly formatted for dashboard consumption.
 * Tests the same code path used by the Web Worker.
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import type { GameState } from '../src/types/game';
import { assertStateProperty, assertDefined } from '../src/simulation/utils/assertions';

console.log('=== Dashboard State Flow Test ===\n');

// Create engine with seed
const seed = 42000;
const engine = new SimulationEngine({ seed, maxMonths: Infinity, logLevel: 'summary' });
const seededRng = engine.getRNG();
const rngFunction = () => seededRng.next();

// Create initial state
const state: GameState = createDefaultInitialState(rngFunction, 'historical');

console.log('Initial state created at month:', state.currentMonth);
console.log('Population:', state.humanPopulationSystem.population, 'billion');
console.log('AI Agents:', state.aiAgents.length);

// Test paradigm indices extraction (same code as captureStateSnapshot)
const westernLiberalIndex = assertStateProperty(state, 'multiParadigmDUI.paradigmScores.western.value', {
  location: 'test',
  month: state.currentMonth
});

const developmentIndex = assertStateProperty(state, 'multiParadigmDUI.paradigmScores.development.value', {
  location: 'test',
  month: state.currentMonth
});

const ecologicalIndex = assertStateProperty(state, 'multiParadigmDUI.paradigmScores.ecological.value', {
  location: 'test',
  month: state.currentMonth
});

const indigenousIndex = assertStateProperty(state, 'multiParadigmDUI.diagnosticLenses.indigenous.value', {
  location: 'test',
  month: state.currentMonth
});

console.log('\n=== Multi-Paradigm DUI (0-100 scale) ===');
console.log('Western Liberal Index:', westernLiberalIndex);
console.log('Development Index:', developmentIndex);
console.log('Ecological Index:', ecologicalIndex);
console.log('Indigenous Index:', indigenousIndex);

// Validate expected ranges
const isInRange = (val: number, name: string) => {
  if (typeof val !== 'number' || isNaN(val)) {
    console.error(`[FAIL] ${name} is not a valid number:`, val);
    return false;
  }
  if (val < 0 || val > 100) {
    console.error(`[FAIL] ${name} is out of range [0,100]:`, val);
    return false;
  }
  console.log(`[PASS] ${name} in valid range:`, val);
  return true;
};

console.log('\n=== Validation ===');
const allValid =
  isInRange(westernLiberalIndex, 'westernLiberalIndex') &&
  isInRange(developmentIndex, 'developmentIndex') &&
  isInRange(ecologicalIndex, 'ecologicalIndex') &&
  isInRange(indigenousIndex, 'indigenousIndex');

// Test other critical metrics
console.log('\n=== Other Critical Metrics ===');
const avgAICapability = state.aiAgents.length > 0
  ? state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length
  : 0;
console.log('Avg AI Capability:', avgAICapability);

const qol = state.globalMetrics.qualityOfLife;
console.log('Quality of Life:', qol);

const population = state.humanPopulationSystem.population;
console.log('Population:', population, 'billion');

// Dashboard validation check (same as OverviewDashboard)
const hasValidData =
  typeof population === 'number' && !isNaN(population) &&
  typeof qol === 'number' && !isNaN(qol) &&
  typeof avgAICapability === 'number' && !isNaN(avgAICapability) &&
  typeof westernLiberalIndex === 'number' && !isNaN(westernLiberalIndex) &&
  typeof developmentIndex === 'number' && !isNaN(developmentIndex) &&
  typeof ecologicalIndex === 'number' && !isNaN(ecologicalIndex) &&
  typeof indigenousIndex === 'number' && !isNaN(indigenousIndex);

console.log('\n=== Dashboard Validation ===');
console.log('hasValidData:', hasValidData);

if (hasValidData && allValid) {
  console.log('\n[SUCCESS] State flow test passed - dashboard should receive valid data');
  process.exit(0);
} else {
  console.log('\n[FAILURE] State flow test failed - dashboard will show "Waiting for Data"');
  process.exit(1);
}
