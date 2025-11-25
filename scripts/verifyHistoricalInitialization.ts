/**
 * Quick Verification Script: Historical Initialization (Nov 25, 2025)
 *
 * Verifies that initializeHistoricalSimulation correctly:
 * 1. Sets population to 5.32B for 1990 (not 8.1B)
 * 2. Regional populations sum to global total
 * 3. Population stays stable after first phase execution
 *
 * This script runs ONE step to verify initialization correctness.
 */

import { initializeHistoricalSimulation } from '../src/simulation/historicalInitialization';
import { SimulationEngine } from '../src/simulation/engine';
import { setDeterministicRng } from '../src/simulation/utils/deterministicRng';

function createSeededRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

async function verify(): Promise<void> {
  console.log('================================================================================');
  console.log('HISTORICAL INITIALIZATION VERIFICATION');
  console.log('================================================================================\n');

  const seed = 19900101;
  const rng = createSeededRng(seed);
  setDeterministicRng(rng);

  // Create 1990 state
  console.log('Creating 1990 historical state...');
  const state = initializeHistoricalSimulation(1990, rng);

  console.log('\n--- INITIALIZATION STATE (Month 0) ---');
  console.log(`Year: ${state.currentYear}`);
  console.log(`Month: ${state.currentMonth}`);
  console.log(`Population (global): ${state.humanPopulationSystem?.population?.toFixed(3)}B`);

  // Check regional populations
  if (state.humanPopulationSystem?.regionalPopulations) {
    const regionalTotal = state.humanPopulationSystem.regionalPopulations
      .reduce((sum, r) => sum + r.population, 0);
    console.log(`Population (regional sum): ${(regionalTotal / 1000).toFixed(3)}B`);

    console.log('\nRegional breakdown:');
    for (const region of state.humanPopulationSystem.regionalPopulations) {
      console.log(`  ${region.name}: ${region.population.toFixed(0)}M`);
    }

    const deviation = Math.abs(regionalTotal / 1000 - (state.humanPopulationSystem?.population ?? 0));
    console.log(`\nDeviation (regional vs global): ${deviation.toFixed(6)}B`);

    if (deviation > 0.001) {
      console.log('❌ CRITICAL: Regional populations do not sum to global total!');
    } else {
      console.log('✅ Regional populations sum correctly to global total');
    }
  }

  // Run ONE simulation step
  console.log('\n--- AFTER 1 SIMULATION STEP (Month 1) ---');
  const engine = new SimulationEngine({ seed, maxMonths: 1 });
  const result = engine.run(state, { maxMonths: 1 });
  const finalState = result.finalState;

  console.log(`Year: ${finalState.currentYear}`);
  console.log(`Month: ${finalState.currentMonth}`);
  console.log(`Population (global): ${finalState.humanPopulationSystem?.population?.toFixed(3)}B`);

  if (finalState.humanPopulationSystem?.regionalPopulations) {
    const regionalTotal = finalState.humanPopulationSystem.regionalPopulations
      .reduce((sum, r) => sum + r.population, 0);
    console.log(`Population (regional sum): ${(regionalTotal / 1000).toFixed(3)}B`);

    const deviation = Math.abs(regionalTotal / 1000 - (finalState.humanPopulationSystem?.population ?? 0));
    console.log(`Deviation (regional vs global): ${deviation.toFixed(6)}B`);

    if (deviation > 0.001) {
      console.log('❌ CRITICAL: Population aggregation broken after first step!');
    } else {
      console.log('✅ Population aggregation working correctly');
    }
  }

  // CRITICAL TEST: Does population stay near 5.32B or jump to 8.1B?
  const initPop = state.humanPopulationSystem?.population ?? 0;
  const finalPop = finalState.humanPopulationSystem?.population ?? 0;
  const popChange = Math.abs(finalPop - initPop);

  console.log(`\nPopulation change: ${(popChange * 1000).toFixed(1)}M`);

  if (Math.abs(finalPop - 5.32) > 1.0) {
    console.log(`❌ CRITICAL BUG: Population jumped from 5.32B to ${finalPop.toFixed(2)}B!`);
    console.log('   This indicates regional populations were not scaled correctly.');
  } else if (popChange > 0.1) {
    console.log(`⚠️ WARNING: Large population change (${(popChange * 1000).toFixed(0)}M) in first month`);
  } else {
    console.log('✅ Population remains stable near 5.32B');
  }

  console.log('\n================================================================================');
  console.log('VERDICT');
  console.log('================================================================================');

  const allTestsPass =
    Math.abs(initPop - 5.32) < 0.01 &&
    Math.abs(finalPop - 5.32) < 1.0 &&
    popChange < 0.1;

  if (allTestsPass) {
    console.log('✅ PASS: Historical initialization working correctly');
    console.log('   - Initial population: 5.32B (correct for 1990)');
    console.log('   - Regional populations scaled correctly');
    console.log('   - Population remains stable after first step');
  } else {
    console.log('❌ FAIL: Historical initialization has bugs');
    if (Math.abs(initPop - 8.1) < 0.5) {
      console.log('   - BUG: Using 2025 population instead of 1990');
    }
    if (popChange > 0.1) {
      console.log('   - BUG: Regional populations not scaled (aggregation overwrites global)');
    }
  }

  console.log('\n');
}

verify().catch(console.error);
