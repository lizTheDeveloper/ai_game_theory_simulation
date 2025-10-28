#!/usr/bin/env tsx

/**
 * Phase 3 Validation Script
 * Validates that population conversions have been removed correctly
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { PhaseOrchestrator } from '../src/simulation/engine/PhaseOrchestrator';

const state = createDefaultInitialState();
const orchestrator = new PhaseOrchestrator();

console.log('=== PHASE 3 VALIDATION: Arithmetic Operations (Remove Conversions) ===\n');

console.log('=== INITIAL STATE ===');
console.log(`Global population: ${state.humanPopulationSystem.population.toFixed(0)}`);
const regionalSum = state.humanPopulationSystem.regionalPopulations.reduce((sum, r) => sum + r.population, 0);
console.log(`Regional sum: ${regionalSum.toFixed(0)}`);
console.log(`Difference: ${Math.abs(state.humanPopulationSystem.population - regionalSum).toFixed(0)}`);
console.log('');

// Run 12 months to test birth rate drift
console.log('=== RUNNING 12 MONTHS ===');
for (let i = 0; i < 12; i++) {
  orchestrator.executeAll(state, Math.random);
  const newRegionalSum = state.humanPopulationSystem.regionalPopulations.reduce((sum, r) => sum + r.population, 0);
  const diff = Math.abs(state.humanPopulationSystem.population - newRegionalSum);
  const diffPercent = (diff / state.humanPopulationSystem.population) * 100;

  console.log(`Month ${i+1}: Pop = ${state.humanPopulationSystem.population.toFixed(0)}, Regional = ${newRegionalSum.toFixed(0)}, Diff = ${diff.toFixed(0)} (${diffPercent.toFixed(6)}%)`);

  if (diffPercent > 0.01) {
    console.error(`\n❌ ERROR: Birth rate drift detected! Difference exceeds 0.01%`);
    process.exit(1);
  }
}

console.log('\n✅ SUCCESS: All conversions removed, no drift detected!');
console.log('Phase 3 validation PASSED');
