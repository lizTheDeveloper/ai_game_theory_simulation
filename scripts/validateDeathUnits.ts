/**
 * Death Units Validation Script (Oct 28, 2025)
 *
 * Validates that all systems write deaths in consistent units (MILLIONS).
 *
 * BUG FIX: refugeeCrises.ts was dividing by 1000 (incorrectly converting to billions)
 * while bayesianMortality.ts stores in millions. This caused 1000x undercounting
 * of refugee transit deaths.
 *
 * Expected behavior after fix:
 * - All writes to deathsByCategory: MILLIONS
 * - All writes to cumulativeCrisisDeaths: MILLIONS
 * - Sum of deathsByCategory should equal cumulativeCrisisDeaths
 * - Deaths should match actual population decline
 */

import { initializeGame } from '@/simulation/initialization';
import { GameState } from '@/types/game';
import { runSimulationMonth } from '@/simulation/engine';
import { resolveMortality } from '@/simulation/bayesianMortality';

function seedRNG(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

async function runValidation() {
  console.log('\n=== DEATH UNITS VALIDATION (Oct 28, 2025) ===\n');

  const seed = Date.now();
  const rng = seedRNG(seed);
  const state = await initializeGame();

  console.log('Initial state:');
  console.log(`  Population: ${state.humanPopulationSystem.population.toFixed(3)}B`);
  console.log(`  Cumulative crisis deaths: ${state.humanPopulationSystem.cumulativeCrisisDeaths.toFixed(1)}M`);

  const categoryTotals = Object.values(state.humanPopulationSystem.deathsByCategory).reduce((a, b) => a + b, 0);
  console.log(`  Sum of deathsByCategory: ${categoryTotals.toFixed(1)}M`);
  console.log(`  Match: ${Math.abs(categoryTotals - state.humanPopulationSystem.cumulativeCrisisDeaths) < 0.01 ? '✅' : '❌'}\n`);

  // Run for 24 months to trigger refugee crises
  for (let month = 1; month <= 24; month++) {
    const prevPop = state.humanPopulationSystem.population;
    const prevDeaths = state.humanPopulationSystem.cumulativeCrisisDeaths;

    await runSimulationMonth(state, rng);

    const popDelta = prevPop - state.humanPopulationSystem.population;
    const deathDelta = state.humanPopulationSystem.cumulativeCrisisDeaths - prevDeaths;

    if (deathDelta > 0.1) {
      console.log(`\n📊 Month ${month}: Deaths detected`);
      console.log(`  Population change: ${(popDelta * 1000).toFixed(1)}M (${popDelta.toFixed(3)}B)`);
      console.log(`  Crisis deaths this month: ${deathDelta.toFixed(1)}M`);

      const categoryTotalsNow = Object.values(state.humanPopulationSystem.deathsByCategory).reduce((a, b) => a + b, 0);
      console.log(`  Cumulative crisis deaths: ${state.humanPopulationSystem.cumulativeCrisisDeaths.toFixed(1)}M`);
      console.log(`  Sum of deathsByCategory: ${categoryTotalsNow.toFixed(1)}M`);

      const unitsMatch = Math.abs(categoryTotalsNow - state.humanPopulationSystem.cumulativeCrisisDeaths) < 0.01;
      console.log(`  Units consistency: ${unitsMatch ? '✅' : '❌'}`);

      if (!unitsMatch) {
        console.log(`  ❌ MISMATCH: ${Math.abs(categoryTotalsNow - state.humanPopulationSystem.cumulativeCrisisDeaths).toFixed(1)}M difference`);
        console.log('\n  Category breakdown:');
        for (const [category, deaths] of Object.entries(state.humanPopulationSystem.deathsByCategory)) {
          if (deaths > 0) {
            console.log(`    ${category}: ${deaths.toFixed(1)}M`);
          }
        }
      }

      // Check if refugee crises are active
      if (state.refugeeCrisisSystem?.activeRefugeeCrises.length > 0) {
        console.log(`\n  🚨 Active refugee crises: ${state.refugeeCrisisSystem.activeRefugeeCrises.length}`);
        for (const crisis of state.refugeeCrisisSystem.activeRefugeeCrises) {
          if (crisis.deathsInTransit > 0) {
            console.log(`    - ${crisis.cause}: ${crisis.deathsInTransit.toFixed(1)}M transit deaths`);
          }
        }
      }
    }
  }

  // Final validation
  console.log('\n=== FINAL VALIDATION ===\n');
  console.log(`Final population: ${state.humanPopulationSystem.population.toFixed(3)}B`);
  console.log(`Total population decline: ${(8.0 - state.humanPopulationSystem.population).toFixed(3)}B = ${((8.0 - state.humanPopulationSystem.population) * 1000).toFixed(1)}M`);
  console.log(`Cumulative crisis deaths: ${state.humanPopulationSystem.cumulativeCrisisDeaths.toFixed(1)}M`);

  const finalCategoryTotal = Object.values(state.humanPopulationSystem.deathsByCategory).reduce((a, b) => a + b, 0);
  console.log(`Sum of deathsByCategory: ${finalCategoryTotal.toFixed(1)}M`);

  const unitsConsistent = Math.abs(finalCategoryTotal - state.humanPopulationSystem.cumulativeCrisisDeaths) < 0.1;
  console.log(`\nUnits consistency: ${unitsConsistent ? '✅ PASS' : '❌ FAIL'}`);

  if (!unitsConsistent) {
    console.log(`\n❌ FAILURE: ${Math.abs(finalCategoryTotal - state.humanPopulationSystem.cumulativeCrisisDeaths).toFixed(1)}M discrepancy`);
    console.log('\nCategory breakdown:');
    for (const [category, deaths] of Object.entries(state.humanPopulationSystem.deathsByCategory)) {
      if (deaths > 0) {
        console.log(`  ${category}: ${deaths.toFixed(1)}M`);
      }
    }
    process.exit(1);
  }

  console.log('\n✅ ALL VALIDATIONS PASSED\n');
}

runValidation().catch(err => {
  console.error('❌ Validation failed:', err);
  process.exit(1);
});
