#!/usr/bin/env npx tsx
/**
 * Test ARCH-4 Integration: Refugee Crisis → AMR Amplification
 *
 * Validates that refugee crises correctly amplify AMR transmission rates.
 *
 * Expected behavior:
 * - No refugees → 1.0× baseline transmission
 * - 10% displaced → 1.2× transmission (20% increase)
 * - 50% displaced → 2.0× transmission (100% increase)
 * - 100% displaced → 3.0× transmission (capped at 300%)
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { calculateAMRMortalityRate } from '../src/simulation/antimicrobialResistance';

function testRefugeeAMRIntegration() {
  console.log('=== ARCH-4 Integration Test: Refugee Crisis → AMR Amplification ===\n');

  // Simple RNG for unit test (not Monte Carlo)
  const rng = () => Math.random();
  const state = createDefaultInitialState(rng, 'default');

  // Test scenarios
  const scenarios = [
    { displaced: 0, population: 8.0, expected: 1.0, description: 'No refugees (baseline)' },
    { displaced: 10, population: 8.0, expected: 1.025, description: '10M displaced (~1% of population)' },
    { displaced: 100, population: 8.0, expected: 1.25, description: '100M displaced (~12.5% of population)' },
    { displaced: 800, population: 8.0, expected: 2.2, description: '800M displaced (10% of population)' },
    { displaced: 2000, population: 8.0, expected: 2.5, description: '2B displaced (25% of population)' },
    { displaced: 4000, population: 8.0, expected: 3.0, description: '4B displaced (50%, capped at 3.0×)' },
    { displaced: 8000, population: 8.0, expected: 3.0, description: '8B displaced (100%, capped at 3.0×)' },
  ];

  for (const scenario of scenarios) {
    // Set up state
    state.humanPopulationSystem.population = scenario.population;
    state.refugeeCrisisSystem.totalDisplaced = scenario.displaced;

    // Advance time to 60 months (5 years) to see exponential growth effect
    // (Not too late where we hit WHO cap, not too early where effect is negligible)
    state.currentMonth = 60;

    // Calculate baseline AMR death rate (without refugee amplification - set displaced to 0)
    const baselineDisplaced = state.refugeeCrisisSystem.totalDisplaced;
    state.refugeeCrisisSystem.totalDisplaced = 0;
    const baselineDeathRate = calculateAMRMortalityRate(state, rng);

    // Restore displaced and calculate with amplification
    state.refugeeCrisisSystem.totalDisplaced = baselineDisplaced;
    const currentDeathRate = calculateAMRMortalityRate(state, rng);

    // Calculate amplification factor
    const amplification = currentDeathRate / baselineDeathRate;

    // Calculate refugee density
    const refugeeDensity = (scenario.displaced / (scenario.population * 1000)) * 100;

    console.log(`\n${scenario.description}`);
    console.log(`  Population: ${scenario.population}B`);
    console.log(`  Displaced: ${scenario.displaced}M (${refugeeDensity.toFixed(1)}% of population)`);
    console.log(`  Baseline AMR death rate: ${baselineDeathRate.toFixed(2)} per 100K`);
    console.log(`  Current AMR death rate: ${currentDeathRate.toFixed(2)} per 100K`);
    console.log(`  Amplification: ${amplification.toFixed(2)}× (expected ~${scenario.expected.toFixed(2)}×)`);

    // Validate within tolerance
    const tolerance = 0.2; // 20% tolerance (we're testing order of magnitude, not precision)
    const withinTolerance = Math.abs(amplification - scenario.expected) < tolerance;
    console.log(`  Status: ${withinTolerance ? '✅ PASS' : '❌ FAIL'}`);
  }

  console.log('\n=== Test Complete ===');
}

testRefugeeAMRIntegration();
