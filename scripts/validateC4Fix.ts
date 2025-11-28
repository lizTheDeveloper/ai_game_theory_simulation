/**
 * C-4 Hindcast Population Validation
 *
 * Validates that the birth rate calculation fix resolves the population overshoot.
 *
 * Expected outcomes:
 * - 1990 start: 5.32B
 * - 2010 end: 6.9B ± 0.69B (10% threshold)
 * - Growth rate: ~1.3%/yr (observed historical)
 */

import { initializeHistoricalSimulation } from '../src/simulation/historicalInitialization';
import { SimulationEngine } from '../src/simulation/engine';

console.log('='.repeat(80));
console.log('C-4 HINDCAST POPULATION VALIDATION (1990-2010)');
console.log('='.repeat(80));

// Create RNG
let seed = 54321;
const rng = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

// Initialize 1990 state
console.log('\nInitializing 1990 state...');
const state = initializeHistoricalSimulation(1990, rng, 'historical');

const startPop = state.humanPopulationSystem.population;
console.log(`Starting population (1990): ${startPop.toFixed(2)}B`);
console.log(`Target population (2010): 6.90B`);
console.log(`Acceptable range: 6.21B - 7.59B (±10%)`);

// Create orchestrator
const engine = new PhaseOrchestrator();

// Run simulation for 240 months (20 years: 1990-2010)
console.log('\nRunning simulation (1990-2010: 240 months)...');
console.log('-'.repeat(80));

const MONTHS = 240;
for (let month = 0; month < MONTHS; month++) {
  engine.step(state);

  // Log annually
  if (state.currentMonth % 12 === 0) {
    const year = state.currentYear;
    const pop = state.humanPopulationSystem.population;
    const popM = state.humanPopulationSystem.regionalPopulations
      .reduce((sum, r) => sum + r.population, 0);

    console.log(`Year ${year}: ${pop.toFixed(3)}B (${popM.toFixed(0)}M from regions)`);
  }
}

// Final validation
console.log('\n' + '='.repeat(80));
console.log('VALIDATION RESULTS');
console.log('='.repeat(80));

const finalPop = state.humanPopulationSystem.population;
const finalYear = state.currentYear;
const expectedPop = 6.90;
const deviation = Math.abs((finalPop - expectedPop) / expectedPop) * 100;
const avgGrowthRate = (Math.pow(finalPop / startPop, 1 / 20) - 1) * 100;

console.log(`\nFinal Year: ${finalYear}`);
console.log(`Final Population: ${finalPop.toFixed(2)}B`);
console.log(`Expected Population: ${expectedPop.toFixed(2)}B`);
console.log(`Deviation: ${deviation > 0 ? '+' : ''}${((finalPop - expectedPop) / expectedPop * 100).toFixed(1)}%`);
console.log(`Absolute Error: ${deviation.toFixed(1)}%`);
console.log(`\nAverage annual growth rate: ${avgGrowthRate.toFixed(2)}%/yr`);
console.log(`Expected growth rate: 1.31%/yr`);

const PASS = deviation < 10.0;
console.log(`\n${PASS ? '✅ PASS' : '❌ FAIL'}: Population deviation ${PASS ? '<' : '>'} 10%`);

if (!PASS) {
  console.log(`\n⚠️  CRITICAL: C-4 validation FAILED`);
  console.log(`Population at 2010: ${finalPop.toFixed(2)}B vs expected 6.90B`);
  console.log(`Deviation: ${deviation.toFixed(1)}% (threshold: 10%)`);
  process.exit(1);
} else {
  console.log(`\n✅ SUCCESS: C-4 hindcast population validation PASSED`);
  console.log(`Population tracking within acceptable bounds.`);
}

console.log('\n' + '='.repeat(80));
