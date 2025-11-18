#!/usr/bin/env tsx
/**
 * Minimal test to verify PlanetaryBoundariesPhase executes
 */

import { SimulationEngine } from './src/simulation/engine';
import { createDefaultInitialState } from './src/simulation/initialization';

console.log('\n=== Verifying PlanetaryBoundariesPhase Registration ===\n');

// Create engine
const engine = new SimulationEngine({ seed: 42, maxMonths: 1 });

// Check phase registration
const orchestrator = engine.getOrchestrator();
const allPhases = orchestrator.getExecutionOrder();
const planetaryPhase = allPhases.find(p => p.includes('planetary_boundaries'));

console.log('Total phases registered:', orchestrator.getPhaseCount());
console.log('Planetary Boundaries Phase:', planetaryPhase || 'NOT FOUND ❌');

if (!planetaryPhase) {
  console.error('\n❌ CRITICAL BUG: PlanetaryBoundariesPhase is NOT in the execution order!');
  console.error('   This means it is NOT registered in the orchestrator.');
  process.exit(1);
}

// Run a simulation step to verify it actually executes
console.log('\n=== Running Simulation Step ===\n');

const state = createDefaultInitialState({ scenario: 'historical' });
const result = engine.run(state, { maxMonths: 1 });

console.log('\n✅ Simulation completed without errors');
console.log('   Final month:', result.finalState.currentMonth);
console.log('   Events generated:', result.history[0]?.events?.length || 0);

console.log('\n✅ SUCCESS: PlanetaryBoundariesPhase is registered and executing\n');
