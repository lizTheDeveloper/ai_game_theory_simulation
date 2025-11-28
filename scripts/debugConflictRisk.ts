/**
 * Debug Conflict Risk Values
 *
 * Checks conflictRisk values in 1990 state.
 */

import { initializeHistoricalSimulation } from '../src/simulation/historicalInitialization';

// Create RNG
let seed = 12345;
const rng = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

// Initialize 1990 state
console.log('Initializing 1990 state...\n');
const state = initializeHistoricalSimulation(1990, rng, 'historical');

console.log('REGIONAL CONFLICT RISK VALUES:\n');
console.log('='.repeat(80));

for (const region of state.humanPopulationSystem.regionalPopulations) {
  const warMultiplier = region.conflictRisk > 0.5 ? 1.5 : 1.0;
  const shouldTrigger = region.conflictRisk > 0.5;

  console.log(`${region.name}:`);
  console.log(`  conflictRisk: ${region.conflictRisk}`);
  console.log(`  > 0.5? ${shouldTrigger}`);
  console.log(`  War multiplier: ${warMultiplier}×`);
  console.log();
}

console.log('='.repeat(80));
