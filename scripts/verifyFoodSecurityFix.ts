/**
 * Verify that historical food security values are correctly applied to regions
 *
 * This script tests that the FAO-verified 1990-92 food security values are
 * properly assigned to regional populations, not falling back to defaults.
 */

import { createHistoricalInitialState } from '../src/simulation/historicalInitialization';

async function verifyFoodSecurity() {
  console.log('=== VERIFYING HISTORICAL FOOD SECURITY VALUES ===\n');

  const state = await createHistoricalInitialState({
    year: 1990,
    includeAIAgents: false,
    rng: Math.random, // OK for verification script (not actual simulation)
  });

  console.log('Global food security:', state.qualityOfLifeSystems.survivalFundamentals.foodSecurity);
  console.log('\nRegional food security:\n');

  // Expected values from FAO SOFI 1999, Table 2.3 (1990-92 average)
  // Note: Southeast Asia, Central Asia, Oceania are estimates (not in original FAO report)
  const expected: Record<string, number> = {
    'East Asia': 0.84,
    'South Asia': 0.74,
    'Sub-Saharan Africa': 0.65,
    'Europe': 0.98,
    'North America': 0.97,
    'Latin America': 0.87,
    'Middle East & North Africa': 0.92,
    'Southeast Asia': 0.84,  // Grouped with East Asia in FAO data
    'Central Asia': 0.85,    // Estimate: Post-Soviet transition
    'Oceania': 0.95,         // Estimate: Developed (Australia/NZ)
  };

  let errors = 0;

  for (const region of state.humanPopulationSystem.regionalPopulations) {
    if ('foodSecurity' in region) {
      const actual = (region as { foodSecurity: number }).foodSecurity;
      const expectedValue = expected[region.name];

      const status = actual === expectedValue ? '✅' : '❌';
      console.log(
        `  ${status} ${region.name.padEnd(30)} Actual: ${actual.toFixed(2)}, Expected: ${expectedValue.toFixed(2)}`
      );

      if (actual !== expectedValue) {
        errors++;
      }
    }
  }

  console.log(`\n=== RESULT: ${errors === 0 ? '✅ ALL CORRECT' : `❌ ${errors} ERRORS FOUND`} ===`);

  if (errors > 0) {
    process.exit(1);
  }
}

verifyFoodSecurity().catch((err) => {
  console.error('❌ VERIFICATION FAILED:', err);
  process.exit(1);
});
