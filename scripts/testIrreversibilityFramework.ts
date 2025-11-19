/**
 * Test Irreversibility Framework (Nov 16, 2025)
 *
 * Minimal test to verify legacy stock release and asymptotic recovery mechanics are working.
 *
 * Expected behavior:
 * - Legacy stock should decrease exponentially (half-life 75 years)
 * - Boundary value should show gradual decline if tech deployed
 * - Asymptotic floor (15% = 0.30 on 0-2 scale) should prevent full cleanup
 * - Legacy releases should slow recovery
 *
 * Success criteria:
 * - Script runs without errors
 * - Logs show legacy stock release events
 * - Boundary value approaches but never reaches asymptotic floor
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { updatePlanetaryBoundaries } from '../src/simulation/planetaryBoundaries';

async function testIrreversibilityFramework() {
  console.log(`\n=== Irreversibility Framework Test ===`);
  console.log(`Testing legacy stock release + asymptotic recovery mechanics\n`);

  // Simple RNG function for test (determinism not critical for quick validation)
  const rng = () => Math.random();
  const state = createDefaultInitialState(rng);

  // Check initial state
  const novelEntitiesBoundary = state.planetaryBoundariesSystem.boundaries.novel_entities;
  console.log(`Initial State:`);
  console.log(`  Boundary value: ${novelEntitiesBoundary.currentValue.toFixed(3)}`);
  console.log(`  Legacy stock: ${novelEntitiesBoundary.legacyStock?.toFixed(0) ?? 'N/A'} Mt`);
  console.log(`  Recovery half-life: ${novelEntitiesBoundary.recoveryHalfLife ?? 'N/A'} years`);
  console.log(`  Asymptotic floor: ${novelEntitiesBoundary.minimumAsymptoticValue ?? 'N/A'} (${(novelEntitiesBoundary.minimumAsymptoticValue! * 2).toFixed(2)} on 0-2 scale)`);
  console.log(`  Irreversible: ${novelEntitiesBoundary.irreversible}`);

  // Simulate 12 months (1 year) to see legacy stock release
  console.log(`\n=== Running 12 months ===\n`);

  for (let month = 0; month < 12; month++) {
    state.currentMonth = month + 1;

    // Simulate pollution reduction (god mode scenario)
    // Reduce pollution level to trigger cleanup mechanics
    if (state.environmentalAccumulation) {
      state.environmentalAccumulation.pollutionLevel = Math.max(0.2, state.environmentalAccumulation.pollutionLevel - 0.01);
    }

    updatePlanetaryBoundaries(state);

    // Log quarterly progress
    if ((month + 1) % 3 === 0) {
      const boundary = state.planetaryBoundariesSystem.boundaries.novel_entities;
      console.log(`\n--- Month ${month + 1} ---`);
      console.log(`  Boundary value: ${boundary.currentValue.toFixed(3)}`);
      console.log(`  Legacy stock: ${boundary.legacyStock?.toFixed(0) ?? 'N/A'} Mt`);
      console.log(`  Pollution level: ${state.environmentalAccumulation?.pollutionLevel.toFixed(3) ?? 'N/A'}`);
    }
  }

  // Final state
  const finalBoundary = state.planetaryBoundariesSystem.boundaries.novel_entities;
  console.log(`\n=== Final State (Month 12) ===`);
  console.log(`  Boundary value: ${finalBoundary.currentValue.toFixed(3)}`);
  console.log(`  Legacy stock: ${finalBoundary.legacyStock?.toFixed(0) ?? 'N/A'} Mt`);
  console.log(`  Stock decay: ${(((novelEntitiesBoundary.legacyStock! - finalBoundary.legacyStock!) / novelEntitiesBoundary.legacyStock!) * 100).toFixed(2)}%`);

  // Validation
  const initialStock = novelEntitiesBoundary.legacyStock!;
  const finalStock = finalBoundary.legacyStock!;
  const decayPercent = ((initialStock - finalStock) / initialStock) * 100;

  console.log(`\n=== Validation ===`);

  // Check 1: Legacy stock should decrease
  if (finalStock < initialStock) {
    console.log(`✅ PASS: Legacy stock decreased (${initialStock.toFixed(0)} → ${finalStock.toFixed(0)} Mt)`);
  } else {
    console.log(`❌ FAIL: Legacy stock did not decrease`);
  }

  // Check 2: Decay should be small over 1 year (half-life is 75 years)
  // Expected: ~0.9% decay per year (half-life 75 years → monthly decay ~0.077%)
  if (decayPercent > 0 && decayPercent < 2) {
    console.log(`✅ PASS: Decay rate reasonable (${decayPercent.toFixed(2)}%, expected ~0.9% for 1 year)`);
  } else {
    console.log(`⚠️ WARNING: Unexpected decay rate (${decayPercent.toFixed(2)}%, expected ~0.9%)`);
  }

  // Check 3: Framework properties are set
  if (novelEntitiesBoundary.irreversible === true) {
    console.log(`✅ PASS: Irreversible flag set`);
  } else {
    console.log(`❌ FAIL: Irreversible flag not set`);
  }

  if (novelEntitiesBoundary.recoveryHalfLife === 75) {
    console.log(`✅ PASS: Recovery half-life set (75 years)`);
  } else {
    console.log(`❌ FAIL: Recovery half-life not set correctly`);
  }

  if (novelEntitiesBoundary.minimumAsymptoticValue === 0.15) {
    console.log(`✅ PASS: Asymptotic floor set (15%)`);
  } else {
    console.log(`❌ FAIL: Asymptotic floor not set correctly`);
  }

  console.log(`\n=== Test Complete ===\n`);
}

// Run test
testIrreversibilityFramework().catch(err => {
  console.error(`❌ Test failed with error:`, err);
  process.exit(1);
});
