/**
 * Test script to verify paradigm scores are fully wired up
 * Tests: calculation → state storage → worker extraction → UI display
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { SimulationEngine } from '../src/simulation/engine';

console.log('=== PARADIGM WIRING TEST ===\n');

// Step 1: Check initial state structure
console.log('STEP 1: Initial State Structure');
const state = createDefaultInitialState('historical');

console.log('  multiParadigmDUI exists:', !!state.multiParadigmDUI);
console.log('  paradigmScores exists:', !!state.multiParadigmDUI?.paradigmScores);
console.log('  western exists:', !!state.multiParadigmDUI?.paradigmScores?.western);
console.log('  development exists:', !!state.multiParadigmDUI?.paradigmScores?.development);
console.log('  ecological exists:', !!state.multiParadigmDUI?.paradigmScores?.ecological);
console.log('  diagnosticLenses exists:', !!state.multiParadigmDUI?.diagnosticLenses);
console.log('  indigenous exists:', !!state.multiParadigmDUI?.diagnosticLenses?.indigenous);

console.log('\nSTEP 2: Initial Values (before first update)');
console.log('  western.value:', state.multiParadigmDUI?.paradigmScores?.western?.value);
console.log('  development.value:', state.multiParadigmDUI?.paradigmScores?.development?.value);
console.log('  ecological.value:', state.multiParadigmDUI?.paradigmScores?.ecological?.value);
console.log('  indigenous.value:', state.multiParadigmDUI?.diagnosticLenses?.indigenous?.value);

// Step 2: Run one simulation step
console.log('\nSTEP 3: Running simulation for 1 month...');
const engine = new SimulationEngine({ seed: 42000, maxMonths: 1, logLevel: 'quiet' });
engine.step(state);

console.log('\nSTEP 4: Values After First Update (Month 0 → 1)');
console.log('  currentMonth:', state.currentMonth);
console.log('  western.value:', state.multiParadigmDUI?.paradigmScores?.western?.value);
console.log('  development.value:', state.multiParadigmDUI?.paradigmScores?.development?.value);
console.log('  ecological.value:', state.multiParadigmDUI?.paradigmScores?.ecological?.value);
console.log('  indigenous.value:', state.multiParadigmDUI?.diagnosticLenses?.indigenous?.value);

// Step 3: Check worker extraction (simulate what worker does)
console.log('\nSTEP 5: Worker Extraction (simulated)');
const westernFromState = (state.multiParadigmDUI?.paradigmScores?.western?.value || 0) / 100;
const developmentFromState = (state.multiParadigmDUI?.paradigmScores?.development?.value || 0) / 100;
const ecologicalFromState = (state.multiParadigmDUI?.paradigmScores?.ecological?.value || 0) / 100;
const indigenousFromState = (state.multiParadigmDUI?.diagnosticLenses?.indigenous?.value || 0) / 100;

console.log('  westernLiberalIndex (normalized):', westernFromState.toFixed(3));
console.log('  developmentIndex (normalized):', developmentFromState.toFixed(3));
console.log('  ecologicalIndex (normalized):', ecologicalFromState.toFixed(3));
console.log('  indigenousIndex (normalized):', indigenousFromState.toFixed(3));

// Step 4: Check underlying components
console.log('\nSTEP 6: Component Values (for debugging)');
console.log('  Democracy:', state.government?.democracy);
console.log('  Civil Liberties:', state.socialAccumulation?.socialCohesion?.civilLiberties);
console.log('  QoL:', state.globalMetrics?.qualityOfLife);
console.log('  Resource Reserves:', state.environmentalAccumulation?.resourceReserves);
console.log('  Climate Stability:', state.environmentalAccumulation?.climateStability);
console.log('  Pollution Level:', state.environmentalAccumulation?.pollutionLevel);
console.log('  Social Trust:', state.socialAccumulation?.socialCohesion?.trust);
console.log('  Community Bonds:', state.socialAccumulation?.socialCohesion?.communityBonds);

// Step 5: Verify history tracking
console.log('\nSTEP 7: History Tracking');
console.log('  history array length:', state.multiParadigmDUI?.history?.length || 0);
if (state.multiParadigmDUI?.history && state.multiParadigmDUI.history.length > 0) {
  const latest = state.multiParadigmDUI.history[state.multiParadigmDUI.history.length - 1];
  console.log('  latest history entry:');
  console.log('    month:', latest.month);
  console.log('    western:', latest.western.toFixed(1));
  console.log('    development:', latest.development.toFixed(1));
  console.log('    ecological:', latest.ecological.toFixed(1));
  console.log('    indigenous:', latest.indigenous.toFixed(1));
}

console.log('\n=== TEST COMPLETE ===');
console.log('✅ All paradigm scores are wired up correctly if values above are non-zero and reasonable');
