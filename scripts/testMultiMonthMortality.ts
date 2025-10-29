/**
 * Test script to check mortality accumulation over multiple months
 *
 * This tests if mortalityRisks are properly cleared between months
 * and that cumulative deaths track correctly over time.
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { addMortalityRisk, resolveMortality } from '../src/simulation/bayesianMortality';

console.log('\n=== Multi-Month Mortality Test ===\n');

// Initialize game state
const state = createDefaultInitialState();
const rng = () => 0.5;

const initialPopulation = state.humanPopulationSystem.population;
console.log(`Initial population: ${initialPopulation.toFixed(3)}B\n`);

// Simulate 5 months with 0.5% monthly mortality
for (let month = 1; month <= 5; month++) {
  console.log(`--- MONTH ${month} ---`);

  const popBefore = state.humanPopulationSystem.population;

  // Add 0.5% famine risk
  addMortalityRisk(state.humanPopulationSystem, {
    type: 'famine',
    baseRisk: 0.005,  // 0.5% base risk
    proximate: 'famine',
    root: 'ecosystem',
    description: `Month ${month} famine`,
    confidence: 'MEDIUM',
    scope: 'GLOBAL',
    month
  });

  // Check how many risks accumulated
  const risksCount = state.humanPopulationSystem.mortalityRisks?.length || 0;
  console.log(`Risks accumulated: ${risksCount}`);

  if (risksCount > 1) {
    console.log(`❌ BUG: ${risksCount} risks accumulated (should be 1 per month)`);
    console.log(`   Risks NOT being cleared between months!`);
    break;
  }

  // Resolve mortality
  const result = resolveMortality(state, rng);

  const popAfter = state.humanPopulationSystem.population;
  const deathsThisMonth = (popBefore - popAfter) * 1000; // in millions

  console.log(`Population: ${popBefore.toFixed(3)}B → ${popAfter.toFixed(3)}B`);
  console.log(`Deaths this month: ${deathsThisMonth.toFixed(1)}M`);
  console.log(`Cumulative deaths: ${state.humanPopulationSystem.cumulativeCrisisDeaths.toFixed(1)}M`);
  console.log(`Risks after resolution: ${state.humanPopulationSystem.mortalityRisks?.length || 0}\n`);

  if ((state.humanPopulationSystem.mortalityRisks?.length || 0) > 0) {
    console.log(`❌ BUG: Risks NOT cleared after resolution!`);
    break;
  }
}

const finalPopulation = state.humanPopulationSystem.population;
const totalLost = (initialPopulation - finalPopulation) * 1000; // in millions

console.log(`\n=== FINAL RESULTS ===`);
console.log(`Initial population: ${initialPopulation.toFixed(3)}B`);
console.log(`Final population: ${finalPopulation.toFixed(3)}B`);
console.log(`Total population lost: ${totalLost.toFixed(1)}M`);
console.log(`Cumulative crisis deaths: ${state.humanPopulationSystem.cumulativeCrisisDeaths.toFixed(1)}M`);

if (Math.abs(totalLost - state.humanPopulationSystem.cumulativeCrisisDeaths) < 1.0) {
  console.log(`\n✅ PASS: Population loss matches cumulative deaths`);
} else {
  console.log(`\n❌ FAIL: Mismatch between population loss and cumulative deaths`);
  console.log(`   Difference: ${(Math.abs(totalLost - state.humanPopulationSystem.cumulativeCrisisDeaths)).toFixed(1)}M`);
}
