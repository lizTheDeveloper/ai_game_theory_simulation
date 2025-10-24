/**
 * Diagnose why planetary boundaries system returns 0 ecology score
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { PhaseOrchestrator } from '../src/simulation/engine/PhaseOrchestrator';

const state = createDefaultInitialState(42);
const orchestrator = new PhaseOrchestrator();

console.log('\n=== INITIAL STATE (Month 0) ===');
console.log(`planetaryBoundariesSystem exists: ${!!state.planetaryBoundariesSystem}`);
console.log(`boundaries exists: ${!!state.planetaryBoundariesSystem?.boundaries}`);
console.log(`multiParadigmDUI exists: ${!!state.multiParadigmDUI}`);
console.log(`multiParadigmDUI.ecological: ${state.multiParadigmDUI?.ecological ?? 'undefined'}`);

if (state.planetaryBoundariesSystem?.boundaries) {
  console.log('\n=== PLANETARY BOUNDARIES ===');
  for (const [name, boundary] of Object.entries(state.planetaryBoundariesSystem.boundaries)) {
    console.log(`  ${name}: status=${boundary.status}, currentValue=${boundary.currentValue}, threshold=${boundary.threshold}`);
  }
}

// Run 1 month
const rng = () => Math.random();
orchestrator.executeAll(state, rng);

console.log('\n=== AFTER 1 MONTH ===');
console.log(`multiParadigmDUI.ecological: ${state.multiParadigmDUI?.ecological ?? 'undefined'}`);
console.log(`planetaryBoundariesSystem still exists: ${!!state.planetaryBoundariesSystem}`);
console.log(`boundaries still exists: ${!!state.planetaryBoundariesSystem?.boundaries}`);

// Try to manually call the scoring function
const { calculateProgressiveEcologicalScore } = require('../src/simulation/planetaryBoundaryRecovery');
const manualScore = calculateProgressiveEcologicalScore(state);
console.log(`\nManual calculateProgressiveEcologicalScore: ${manualScore}`);

// Check environmental accumulation
console.log('\n=== ENVIRONMENTAL ACCUMULATION ===');
console.log(`resourceReserves: ${state.environmentalAccumulation?.resourceReserves ?? 'undefined'}`);
console.log(`climateStability: ${state.environmentalAccumulation?.climateStability ?? 'undefined'}`);
console.log(`pollutionLevel: ${state.environmentalAccumulation?.pollutionLevel ?? 'undefined'}`);
