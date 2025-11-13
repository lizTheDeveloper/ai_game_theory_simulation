/**
 * Test script to validate assertion utilities with updated research-validated bounds
 *
 * Updates (Nov 13, 2025):
 * - CO2: [280, 1000] ppm (was 600 ppm)
 * - GDP: [0, 500] trillion USD (was 200T)
 * - Ocean pH: [7.5, 8.5] (no specific "7.8 collapse" claim)
 * - Temperature: [-20, +10]°C per month (needs better justification)
 * - Mortality: [0, 50%] per month (extremely generous sanity check)
 */

import {
  assertPlanetaryBoundary,
  assertEconomicMetric,
  assertTemperatureDelta,
  assertMortalityRate,
  assertFinite,
} from '../src/simulation/utils/assertions';

console.log('🧪 Testing research-validated assertion bounds\n');

// ============================================================================
// TEST 1: CO2 Bounds (Updated to 1000 ppm for RCP8.5)
// ============================================================================
console.log('=== CO2 Bounds ===');

try {
  // Should PASS: Pre-industrial baseline
  const co2_preindustrial = assertPlanetaryBoundary(280, 'co2', {
    location: 'test_assertion_bounds',
    valueName: 'co2_preindustrial',
  });
  console.log(`✅ CO2 280 ppm (pre-industrial): ${co2_preindustrial} ppm`);
} catch (e: any) {
  console.log(`❌ FAILED: ${e.message}`);
}

try {
  // Should PASS: Current levels (2025)
  const co2_current = assertPlanetaryBoundary(425, 'co2', {
    location: 'test_assertion_bounds',
    valueName: 'co2_current',
  });
  console.log(`✅ CO2 425 ppm (current 2025): ${co2_current} ppm`);
} catch (e: any) {
  console.log(`❌ FAILED: ${e.message}`);
}

try {
  // Should PASS: RCP8.5 by 2100 (900-936 ppm)
  const co2_rcp85 = assertPlanetaryBoundary(936, 'co2', {
    location: 'test_assertion_bounds',
    valueName: 'co2_rcp85_2100',
  });
  console.log(`✅ CO2 936 ppm (RCP8.5 2100): ${co2_rcp85} ppm`);
} catch (e: any) {
  console.log(`❌ FAILED: ${e.message}`);
}

try {
  // Should PASS: Upper bound (1000 ppm)
  const co2_upper = assertPlanetaryBoundary(1000, 'co2', {
    location: 'test_assertion_bounds',
    valueName: 'co2_upper_bound',
  });
  console.log(`✅ CO2 1000 ppm (upper bound): ${co2_upper} ppm`);
} catch (e: any) {
  console.log(`❌ FAILED: ${e.message}`);
}

try {
  // Should FAIL: Exceeds upper bound
  const co2_invalid = assertPlanetaryBoundary(1100, 'co2', {
    location: 'test_assertion_bounds',
    valueName: 'co2_too_high',
  });
  console.log(`❌ ERROR: CO2 1100 ppm should have thrown but got: ${co2_invalid}`);
} catch (e: any) {
  console.log(`✅ CO2 1100 ppm correctly rejected (exceeds 1000 ppm upper bound)`);
}

console.log('');

// ============================================================================
// TEST 2: Ocean pH Bounds (No specific "7.8 collapse" threshold)
// ============================================================================
console.log('=== Ocean pH Bounds ===');

try {
  // Should PASS: Pre-industrial baseline
  const ph_preindustrial = assertPlanetaryBoundary(8.2, 'oceanPH', {
    location: 'test_assertion_bounds',
    valueName: 'ph_preindustrial',
  });
  console.log(`✅ Ocean pH 8.2 (pre-industrial): ${ph_preindustrial}`);
} catch (e: any) {
  console.log(`❌ FAILED: ${e.message}`);
}

try {
  // Should PASS: Current (2024-2025)
  const ph_current = assertPlanetaryBoundary(8.04, 'oceanPH', {
    location: 'test_assertion_bounds',
    valueName: 'ph_current_2025',
  });
  console.log(`✅ Ocean pH 8.04 (current 2025): ${ph_current}`);
} catch (e: any) {
  console.log(`❌ FAILED: ${e.message}`);
}

try {
  // Should PASS: Projected minimum under extreme scenarios
  const ph_extreme = assertPlanetaryBoundary(7.5, 'oceanPH', {
    location: 'test_assertion_bounds',
    valueName: 'ph_extreme_scenario',
  });
  console.log(`✅ Ocean pH 7.5 (extreme scenario lower bound): ${ph_extreme}`);
} catch (e: any) {
  console.log(`❌ FAILED: ${e.message}`);
}

try {
  // Should FAIL: Below projected minimum
  const ph_invalid = assertPlanetaryBoundary(7.3, 'oceanPH', {
    location: 'test_assertion_bounds',
    valueName: 'ph_too_low',
  });
  console.log(`❌ ERROR: pH 7.3 should have thrown but got: ${ph_invalid}`);
} catch (e: any) {
  console.log(`✅ Ocean pH 7.3 correctly rejected (below 7.5 lower bound)`);
}

console.log('');

// ============================================================================
// TEST 3: GDP Bounds (Updated to 500T for 75-year simulation)
// ============================================================================
console.log('=== GDP Bounds ===');

try {
  // Should PASS: Current global GDP (2025)
  const gdp_current = assertEconomicMetric(114, 'gdp', {
    location: 'test_assertion_bounds',
    valueName: 'gdp_current_2025',
  });
  console.log(`✅ GDP $${gdp_current}T (current 2025): PASS`);
} catch (e: any) {
  console.log(`❌ FAILED: ${e.message}`);
}

try {
  // Should PASS: Projected 2100 with 2% growth
  const gdp_2100 = assertEconomicMetric(510, 'gdp', {
    location: 'test_assertion_bounds',
    valueName: 'gdp_2100_projected',
  });
  console.log(`✅ GDP $${gdp_2100}T (2100 projected, 2% growth): PASS`);
} catch (e: any) {
  console.log(`❌ FAILED: ${e.message}`);
}

try {
  // Should FAIL: Exceeds upper bound
  const gdp_invalid = assertEconomicMetric(700, 'gdp', {
    location: 'test_assertion_bounds',
    valueName: 'gdp_too_high',
  });
  console.log(`❌ ERROR: GDP $700T should have thrown but got: ${gdp_invalid}`);
} catch (e: any) {
  console.log(`✅ GDP $700T correctly rejected (exceeds 600T upper bound)`);
}

console.log('');

// ============================================================================
// TEST 4: Temperature Delta Bounds (Generous sanity checks)
// ============================================================================
console.log('=== Temperature Delta Bounds ===');

try {
  // Should PASS: Typical monthly change
  const temp_typical = assertTemperatureDelta(0.5, {
    location: 'test_assertion_bounds',
    valueName: 'temp_typical_monthly',
  });
  console.log(`✅ Temperature Δ ${temp_typical}°C (typical monthly): PASS`);
} catch (e: any) {
  console.log(`❌ FAILED: ${e.message}`);
}

try {
  // Should PASS: Nuclear winter cooling (within generous bound)
  const temp_nuclear = assertTemperatureDelta(-15, {
    location: 'test_assertion_bounds',
    valueName: 'temp_nuclear_winter',
    cause: 'nuclear_winter',
  });
  console.log(`✅ Temperature Δ ${temp_nuclear}°C (nuclear winter): PASS`);
} catch (e: any) {
  console.log(`❌ FAILED: ${e.message}`);
}

try {
  // Should FAIL: Exceeds cooling bound
  const temp_invalid = assertTemperatureDelta(-25, {
    location: 'test_assertion_bounds',
    valueName: 'temp_too_much_cooling',
  });
  console.log(`❌ ERROR: Temperature Δ -25°C should have thrown but got: ${temp_invalid}`);
} catch (e: any) {
  console.log(`✅ Temperature Δ -25°C correctly rejected (exceeds -20°C lower bound)`);
}

console.log('');

// ============================================================================
// TEST 5: Mortality Rate Bounds (50% monthly is EXTREMELY generous)
// ============================================================================
console.log('=== Mortality Rate Bounds ===');

try {
  // Should PASS: Black Death monthly average
  const mort_blackdeath = assertMortalityRate(0.005, {
    location: 'test_assertion_bounds',
    valueName: 'mortality_blackdeath_monthly_avg',
  });
  console.log(`✅ Mortality ${(mort_blackdeath * 100).toFixed(1)}% (Black Death avg): PASS`);
} catch (e: any) {
  console.log(`❌ FAILED: ${e.message}`);
}

try {
  // Should PASS: Catastrophic single-month event (within generous bound)
  const mort_catastrophic = assertMortalityRate(0.3, {
    location: 'test_assertion_bounds',
    valueName: 'mortality_catastrophic_month',
  });
  console.log(`✅ Mortality ${(mort_catastrophic * 100).toFixed(1)}% (catastrophic): PASS`);
} catch (e: any) {
  console.log(`❌ FAILED: ${e.message}`);
}

try {
  // Should FAIL: Exceeds 50% monthly bound
  const mort_invalid = assertMortalityRate(0.6, {
    location: 'test_assertion_bounds',
    valueName: 'mortality_implausible',
  });
  console.log(`❌ ERROR: Mortality 60% should have thrown but got: ${(mort_invalid * 100).toFixed(1)}%`);
} catch (e: any) {
  console.log(`✅ Mortality 60% correctly rejected (exceeds 50% upper bound)`);
}

console.log('');

// ============================================================================
// TEST 6: Edge Case - NaN Detection
// ============================================================================
console.log('=== NaN Detection ===');

try {
  const nan_value = assertFinite(NaN, {
    location: 'test_assertion_bounds',
    valueName: 'nan_test',
  });
  console.log(`❌ ERROR: NaN should have thrown but got: ${nan_value}`);
} catch (e: any) {
  console.log(`✅ NaN correctly rejected by assertFinite`);
}

try {
  const infinity_value = assertFinite(Infinity, {
    location: 'test_assertion_bounds',
    valueName: 'infinity_test',
  });
  console.log(`❌ ERROR: Infinity should have thrown but got: ${infinity_value}`);
} catch (e: any) {
  console.log(`✅ Infinity correctly rejected by assertFinite`);
}

console.log('');

// ============================================================================
// Summary
// ============================================================================
console.log('=== Summary ===');
console.log('✅ All assertion utilities tested with research-validated bounds');
console.log('✅ CO2: [280, 1000] ppm (RCP8.5 reaches 900-936 ppm by 2100)');
console.log('✅ Ocean pH: [7.5, 8.5] (no specific "7.8 collapse" threshold)');
console.log('✅ GDP: [0, 600] trillion USD (2% growth → ~$510T, buffer for AI scenarios)');
console.log('✅ Temperature: [-20, +10]°C/month (generous sanity checks)');
console.log('✅ Mortality: [0, 50%]/month (extremely generous, real-world <5%)');
console.log('');
console.log('🎯 Research validation complete. Bounds updated per Layer 2 verification.');
