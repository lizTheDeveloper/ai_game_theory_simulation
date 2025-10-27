/**
 * Diagnostic script to track population corruption
 *
 * Tracks every change to population and peakPopulation to find
 * where the 8 trillion person corruption is coming from
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { PhaseOrchestrator } from '../src/simulation/engine/PhaseOrchestrator';
import { seedRandom } from '../src/simulation/utils/rng';

console.log('\n🔬 POPULATION CORRUPTION DIAGNOSTIC');
console.log('===================================\n');

const state = createDefaultInitialState();
const orchestrator = new PhaseOrchestrator();
const rng = seedRandom(42);

console.log(`Initial state:`);
console.log(`  population: ${state.humanPopulationSystem.population.toFixed(3)}B`);
console.log(`  peakPopulation: ${state.humanPopulationSystem.peakPopulation.toFixed(3)}B`);
console.log(`  Regional total: ${state.regionalPopulations.reduce((sum, r) => sum + r.population, 0).toFixed(0)}M\n`);

// Track population changes
let prevPopulation = state.humanPopulationSystem.population;
let prevPeak = state.humanPopulationSystem.peakPopulation;

for (let month = 1; month <= 120; month++) {
  state.currentMonth = month;

  // Run one simulation step
  const result = orchestrator.executeMonth(state, rng);

  const pop = state.humanPopulationSystem;
  const popChanged = Math.abs(pop.population - prevPopulation) > 0.001;
  const peakChanged = Math.abs(pop.peakPopulation - prevPeak) > 0.001;

  // Log if peak gets corrupted (>10B is definitely wrong)
  if (pop.peakPopulation > 10) {
    console.log(`\n🚨 CORRUPTION DETECTED AT MONTH ${month}:`);
    console.log(`  population: ${pop.population.toFixed(3)}B`);
    console.log(`  peakPopulation: ${pop.peakPopulation.toFixed(3)}B ❌ (should be ~8B)`);
    console.log(`  Previous peak: ${prevPeak.toFixed(3)}B`);
    console.log(`  Regional total: ${state.regionalPopulations.reduce((sum, r) => sum + r.population, 0).toFixed(0)}M`);
    console.log(`\n  Recent events:`);
    result.events.slice(-5).forEach(event => {
      console.log(`    - ${event.title}`);
    });

    // Stop after first corruption
    break;
  }

  // Log significant changes
  if (month % 12 === 0 && (popChanged || peakChanged)) {
    console.log(`Month ${month}:`);
    console.log(`  population: ${pop.population.toFixed(3)}B (Δ ${(pop.population - prevPopulation).toFixed(3)}B)`);
    console.log(`  peakPopulation: ${pop.peakPopulation.toFixed(3)}B (Δ ${(pop.peakPopulation - prevPeak).toFixed(3)}B)`);
    console.log(`  Regional total: ${state.regionalPopulations.reduce((sum, r) => sum + r.population, 0).toFixed(0)}M`);
  }

  prevPopulation = pop.population;
  prevPeak = pop.peakPopulation;
}

if (state.humanPopulationSystem.peakPopulation <= 10) {
  console.log(`\n✅ No corruption detected in 120 months`);
  console.log(`Final peakPopulation: ${state.humanPopulationSystem.peakPopulation.toFixed(3)}B`);
} else {
  console.log(`\n❌ Corruption found - see details above`);
}
