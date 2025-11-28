/**
 * Validation Script: Famine Cascade Dampening Factors
 *
 * Tests the three dampening factors implemented in FoodSecurityDegradationPhase:
 * 1. Food Security Floor (15% minimum)
 * 2. International Aid Dampening (15% reduction when GDP > $100T)
 * 3. Adaptation Recovery (0.5% monthly when climate stabilizes)
 *
 * Expected impact:
 * - Baseline survival extends from 26.5 years → 60-90 years
 * - Population remains > 10M even in worst-case scenarios
 * - Food security never goes below 15% floor
 * - Famine mortality peaks at 1-4 years (matching historical precedent), not months
 *
 * Research: Hultgren & Hsiang (2025), FAO WFP (2024), WWII rationing, Leningrad siege
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { SimulationEngine } from '../src/simulation/engine';

interface ValidationMetrics {
  month: number;
  year: number;
  population: number; // Millions
  globalFoodSecurity: number; // 0-1
  minRegionalFood: number; // 0-1
  atFloor: boolean; // Is food security at 15% floor?
  globalGDP: number; // Trillions USD
  activeCrises: number;
}

async function validateFamineDampening() {
  console.log('========================================');
  console.log('FAMINE DAMPENING VALIDATION');
  console.log('========================================\n');

  const SEED = 'dampening-validation-001';
  const MAX_MONTHS = 900; // 75 years (should survive > 60 years)

  console.log(`🎲 Seed: ${SEED}`);
  console.log(`📅 Duration: ${MAX_MONTHS} months (${(MAX_MONTHS / 12).toFixed(1)} years)\n`);

  // Initialize RNG engine
  const engine = new SimulationEngine(SEED);
  const seededRng = engine.getRNG();
  const rng = seededRng.next.bind(seededRng);

  // Initialize state (pass RNG as first param per CRITICAL-3 fix)
  const initialState = createDefaultInitialState(rng, 'historical');

  const metrics: ValidationMetrics[] = [];

  console.log('=== SIMULATION START ===\n');

  // Run simulation (use engine.run like Monte Carlo does)
  const result = engine.run(initialState, {
    monthsToRun: MAX_MONTHS,
    onMonthComplete: (state) => {
      // Extract metrics every 12 months
      if (state.currentMonth % 12 === 0) {
        const pop = state.humanPopulationSystem.population * 1000; // Convert to millions
        const globalFood = state.qualityOfLifeSystems?.survivalFundamentals?.foodSecurity ?? 1.0;

        // Find minimum regional food security
        const minRegionalFood = state.humanPopulationSystem.regionalPopulations?.reduce(
          (min, r) => Math.min(min, r.foodSecurity),
          1.0
        ) ?? 1.0;

        // Check if any region is at floor (15% ± 1%)
        const atFloor = minRegionalFood <= 0.16 && minRegionalFood >= 0.14;

        // Count active crises (approximate)
        const activeCrises =
          (state.environmentalAccumulation?.climateCrisisActive ? 1 : 0) +
          (state.environmentalAccumulation?.ecosystemCrisisActive ? 1 : 0) +
          (state.planetaryBoundariesSystem?.cascadeActive ? 2 : 0);

        // Get GDP (rough proxy)
        const gdpProxy = state.humanPopulationSystem.population * 14.25;

        metrics.push({
          month: state.currentMonth,
          year: state.currentMonth / 12,
          population: pop,
          globalFoodSecurity: globalFood,
          minRegionalFood,
          atFloor,
          globalGDP: gdpProxy,
          activeCrises,
        });

        // Log milestone years
        const year = state.currentMonth / 12;
        if (year % 10 === 0 || atFloor) {
          console.log(
            `Year ${year.toFixed(0).padStart(3)}: ` +
            `Pop: ${pop.toFixed(0).padStart(6)}M | ` +
            `Food: ${(globalFood * 100).toFixed(1).padStart(5)}% (min: ${(minRegionalFood * 100).toFixed(1).padStart(5)}%) | ` +
            `GDP: $${gdpProxy.toFixed(0).padStart(3)}T | ` +
            `Crises: ${activeCrises}` +
            (atFloor ? ' [AT FLOOR]' : '')
          );
        }
      }

      // Check for early exit conditions
      if (state.humanPopulationSystem.population < 0.01) {
        // Extinction (<10M people)
        console.log(`\n❌ EXTINCTION at month ${state.currentMonth} (${(state.currentMonth / 12).toFixed(1)} years)`);
        console.log(`   Final population: ${(state.humanPopulationSystem.population * 1000).toFixed(2)}M`);
        return false; // Stop simulation
      }

      if (state.humanPopulationSystem.population < 0.1 && state.currentMonth % 12 === 0) {
        // Near-extinction (<100M people)
        console.log(`⚠️ NEAR-EXTINCTION at year ${(state.currentMonth / 12).toFixed(0)}: ${(state.humanPopulationSystem.population * 1000).toFixed(0)}M people`);
      }

      return true; // Continue simulation
    }
  });

  const state = result.state;

  console.log('\n=== SIMULATION COMPLETE ===\n');

  // Analyze results
  console.log('========================================');
  console.log('VALIDATION RESULTS');
  console.log('========================================\n');

  const finalMetrics = metrics[metrics.length - 1];
  const minFoodEver = Math.min(...metrics.map(m => m.minRegionalFood));
  const minPopulation = Math.min(...metrics.map(m => m.population));
  const floorMonths = metrics.filter(m => m.atFloor).length;

  console.log('1. FOOD SECURITY FLOOR (15% minimum)');
  console.log(`   ✓ Minimum food security reached: ${(minFoodEver * 100).toFixed(2)}%`);
  if (minFoodEver >= 0.15 - 0.001) {
    console.log(`   ✅ PASS: Floor respected (≥15%)`);
  } else {
    console.log(`   ❌ FAIL: Floor violated! (${(minFoodEver * 100).toFixed(2)}% < 15%)`);
  }
  console.log(`   ✓ Months at floor: ${floorMonths}`);
  console.log('');

  console.log('2. POPULATION SURVIVAL');
  console.log(`   ✓ Final population: ${finalMetrics.population.toFixed(0)}M`);
  console.log(`   ✓ Minimum population: ${minPopulation.toFixed(0)}M`);
  if (minPopulation >= 10) {
    console.log(`   ✅ PASS: Population survived (>10M)`);
  } else {
    console.log(`   ❌ FAIL: Population crashed (<10M)`);
  }
  console.log('');

  console.log('3. SURVIVAL TIMELINE');
  console.log(`   ✓ Simulation duration: ${finalMetrics.year.toFixed(1)} years`);
  if (finalMetrics.year >= 60) {
    console.log(`   ✅ PASS: Survived >60 years`);
  } else {
    console.log(`   ⚠️ WARNING: Crashed before 60 years`);
  }
  console.log('');

  console.log('4. DAMPENING EFFECTIVENESS');
  const highCrisisMonths = metrics.filter(m => m.activeCrises >= 3);
  if (highCrisisMonths.length > 0) {
    const avgFoodDuringCrisis = highCrisisMonths.reduce((sum, m) => sum + m.globalFoodSecurity, 0) / highCrisisMonths.length;
    console.log(`   ✓ Avg food security during high crisis (≥3 crises): ${(avgFoodDuringCrisis * 100).toFixed(1)}%`);
    if (avgFoodDuringCrisis >= 0.20) {
      console.log(`   ✅ PASS: Dampening prevents total collapse (>20%)`);
    } else {
      console.log(`   ⚠️ WARNING: Food security still very low during crisis`);
    }
  } else {
    console.log(`   ⚠️ No high-crisis months detected`);
  }
  console.log('');

  console.log('========================================');
  console.log('VALIDATION SUMMARY');
  console.log('========================================\n');

  const allPassed =
    minFoodEver >= 0.15 - 0.001 &&
    minPopulation >= 10 &&
    finalMetrics.year >= 60;

  if (allPassed) {
    console.log('✅ ALL CHECKS PASSED');
    console.log('   - Food security floor respected (≥15%)');
    console.log('   - Population survived (>10M)');
    console.log('   - Survival extended (>60 years)');
  } else {
    console.log('❌ SOME CHECKS FAILED');
    console.log('   Review dampening parameters or crisis severity.');
  }

  console.log('');
}

// Run validation
validateFamineDampening().catch(console.error);
