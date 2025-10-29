/**
 * Test Climate Impact Cascade Phase fix for negative food security bug
 *
 * Bug: Food security went negative (-0.0009) when multiple climate impacts stacked
 * Fix: Added MIN_FOOD_SECURITY floor (0.001) before assertion
 *
 * This script validates:
 * 1. Food security never goes below MIN_FLOOR (0.001)
 * 2. Multiple stacked impacts are handled correctly
 * 3. Assertion now passes with proper context
 */

import { createDefaultInitialState } from '@/simulation/initialization';
import { ClimateImpactCascadePhase } from '@/simulation/engine/phases/ClimateImpactCascadePhase';
import type { GameState, PhaseContext } from '@/types/game';

// Deterministic RNG for reproducibility
function createSeededRNG(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function main() {
  console.log('\n=== Testing Climate Impact Cascade Phase Fix ===\n');

  const state = createDefaultInitialState();
  const phase = new ClimateImpactCascadePhase();
  const rng = createSeededRNG(12345);

  // Simulate 120 months to hit the bug scenario (occurred at month 115)
  let errorCount = 0;
  let minFoodSecurity = 1.0;
  let maxNegativeAttempt = 0;

  for (let month = 1; month <= 120; month++) {
    state.currentMonth = month;

    // Create severe climate conditions to trigger impacts
    state.environmentalAccumulation.climateStability = 0.3; // Severe degradation

    // Set biosphere integrity to trigger ecosystem collapse
    if (state.planetaryBoundariesSystem?.boundaries?.biosphere_integrity) {
      state.planetaryBoundariesSystem.boundaries.biosphere_integrity.currentValue = 1.5;
    }

    // Set low starting food security to maximize impact stacking
    state.qualityOfLifeSystems.survivalFundamentals.foodSecurity = 0.15;

    const context: PhaseContext = {
      month,
      data: new Map(),
      flags: new Set()
    };

    try {
      phase.execute(state, rng, context);

      // Track minimum food security achieved
      const currentFoodSec = state.qualityOfLifeSystems.survivalFundamentals.foodSecurity;
      if (currentFoodSec < minFoodSecurity) {
        minFoodSecurity = currentFoodSec;
      }

      // Success - no error thrown
      if (month % 20 === 0) {
        console.log(`✅ Month ${month}: Food security ${currentFoodSec.toFixed(4)} (in range)`);
      }
    } catch (error) {
      errorCount++;
      console.log(`❌ Month ${month}: ${error instanceof Error ? error.message : String(error)}`);

      // Try to extract the attempted negative value from error message
      const match = (error instanceof Error ? error.message : '').match(/foodSecurity = ([-\d.]+)/);
      if (match) {
        const attemptedValue = parseFloat(match[1]);
        if (attemptedValue < maxNegativeAttempt) {
          maxNegativeAttempt = attemptedValue;
        }
      }
    }
  }

  console.log('\n=== Test Results ===');
  console.log(`Total months simulated: 120`);
  console.log(`Errors encountered: ${errorCount}`);
  console.log(`Minimum food security achieved: ${minFoodSecurity.toFixed(6)}`);

  if (errorCount === 0 && minFoodSecurity >= 0.001) {
    console.log('\n✅ SUCCESS: Fix validated - food security stays >= MIN_FLOOR (0.001)');
    process.exit(0);
  } else if (errorCount > 0) {
    console.log(`\n❌ FAILURE: ${errorCount} assertion errors detected`);
    console.log(`Most negative attempted value: ${maxNegativeAttempt}`);
    process.exit(1);
  } else {
    console.log('\n⚠️ WARNING: No errors but min food security suspicious');
    process.exit(1);
  }
}

main();
