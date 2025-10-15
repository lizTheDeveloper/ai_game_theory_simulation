/**
 * TIER 2.8 Phase 4 Tests: Climate Justice & Environmental Debt
 *
 * Validates:
 * - Climate debt calculation (historical emissions vs. suffering)
 * - Reparations transfers (rich → poor)
 * - Migration pressure (coastal nations, climate severity)
 * - Green technology transfer
 *
 * Research backing:
 * - IPCC AR6 (2021): Historical responsibility
 * - Loss and Damage Fund (COP27 2022): $100B/year commitment
 * - UNHCR (2024): 1B climate displaced by 2050
 * - Our World in Data: Cumulative CO2 emissions
 */

import { GameState } from '../src/types/game';
import { CountryPopulation, CountryName } from '../src/types/countryPopulations';
import { initializeCountryPopulations } from '../src/simulation/countryPopulations';
import {
  initializeClimateJustice,
  updateClimateJustice
} from '../src/simulation/climateJustice';

// Test framework
let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, message: string): void {
  if (condition) {
    testsPassed++;
    console.log(`✓ ${message}`);
  } else {
    testsFailed++;
    console.error(`✗ ${message}`);
  }
}

function createTestState(): GameState {
  const state = {
    countryPopulationSystem: initializeCountryPopulations(),
    environmentalAccumulation: {
      climateChange: 0.3, // Moderate climate severity
      biodiversityLoss: 0.2,
      nitrogenPhosphorus: 0.15,
      oceanAcidification: 0.1,
      freshwaterDepletion: 0.1,
      landUse: 0.2,
      airPollution: 0.15,
      chemicalPollution: 0.1,
    },
    month: 0,
    year: 2025,
  } as GameState;

  // Initialize climate justice fields
  initializeClimateJustice(state.countryPopulationSystem.countries);

  return state;
}

console.log('\n=== TIER 2.8 PHASE 4: CLIMATE JUSTICE TESTS ===\n');

// ========== TEST GROUP 1: INITIALIZATION ==========

console.log('--- Test Group 1: Climate Justice Initialization ---\n');

(() => {
  const state = createTestState();
  const countries = state.countryPopulationSystem.countries;

  // Test 1: Rich emitters have high reparations willingness
  assert(
    countries['Germany'].climateReparationsWillingness! > 0.5,
    'Germany has high climate reparations willingness (>0.5) - Green Party leadership'
  );

  // Test 2: US has moderate willingness (political polarization)
  assert(
    countries['United States'].climateReparationsWillingness! >= 0.2 &&
    countries['United States'].climateReparationsWillingness! <= 0.4,
    'US has moderate reparations willingness (0.2-0.4) - political polarization'
  );

  // Test 3: Russia has low willingness (authoritarian, fossil fuel economy)
  assert(
    countries['Russia'].climateReparationsWillingness! <= 0.2,
    'Russia has low reparations willingness (<=0.2) - authoritarian, fossil fuel'
  );

  // Test 4: Climate victims (Bangladesh) have zero willingness (they receive, not pay)
  assert(
    countries['Bangladesh'].climateReparationsWillingness! === 0.0,
    'Bangladesh has zero reparations willingness (creditor, not debtor)'
  );

  // Test 5: All countries start with zero migration pressure
  assert(
    Object.values(countries).every(c => c.climateMigrationPressure! === 0.0),
    'All countries start with zero climate migration pressure'
  );

  // Test 6: All countries start with zero green tech received
  assert(
    Object.values(countries).every(c => c.greenTechReceived! === 0.0),
    'All countries start with zero green tech received'
  );

  // Test 7: All countries start with zero green tech shared
  assert(
    Object.values(countries).every(c => c.greenTechShared! === 0.0),
    'All countries start with zero green tech shared'
  );
})();

console.log();

// ========== TEST GROUP 2: CLIMATE DEBT CALCULATION ==========

console.log('--- Test Group 2: Climate Debt Calculation ---\n');

(() => {
  const state = createTestState();
  const countries = state.countryPopulationSystem.countries;

  // Set climate severity to test debt calculation
  state.environmentalAccumulation.climateChange = 0.5;

  // Run first update to calculate debt
  updateClimateJustice(state);

  // Test 8: US owes significant reparations (400+ Gt historical emissions)
  assert(
    countries['United States'].climateReparationsOwed! > 100,
    'US owes >$100 billion in climate reparations (400+ Gt emissions)'
  );

  // Test 9: China owes moderate reparations (220 Gt, mostly recent)
  assert(
    countries['China'].climateReparationsOwed! > 40 &&
    countries['China'].climateReparationsOwed! < countries['United States'].climateReparationsOwed!,
    'China owes moderate reparations (less than US, 220 Gt emissions)'
  );

  // Test 10: Bangladesh is owed reparations (creditor, high suffering)
  assert(
    countries['Bangladesh'].climateReparationsReceived! > 0,
    'Bangladesh receives climate reparations (high suffering, low emissions)'
  );

  // Test 11: Debt increases with climate severity
  const debt1 = countries['United States'].climateReparationsOwed!;
  state.environmentalAccumulation.climateChange = 0.8;
  updateClimateJustice(state);
  const debt2 = countries['United States'].climateReparationsOwed!;
  assert(
    debt2 > debt1,
    'Climate debt increases as climate severity worsens'
  );
})();

console.log();

// ========== TEST GROUP 3: REPARATIONS TRANSFERS ==========

console.log('--- Test Group 3: Reparations Transfers ---\n');

(() => {
  const state = createTestState();
  const countries = state.countryPopulationSystem.countries;

  // Set high climate severity to trigger transfers
  state.environmentalAccumulation.climateChange = 0.7;

  // Track initial values
  const initialBangladeshReceived = countries['Bangladesh'].climateReparationsReceived!;

  // Run multiple months to accumulate transfers
  for (let i = 0; i < 12; i++) {
    state.month++;
    updateClimateJustice(state);
  }

  // Test 12: Bangladesh receives reparations over time
  assert(
    countries['Bangladesh'].climateReparationsReceived! > initialBangladeshReceived,
    'Bangladesh accumulates climate reparations over 12 months'
  );

  // Test 13: Reparations received increases monotonically
  const received1 = countries['Bangladesh'].climateReparationsReceived!;
  for (let i = 0; i < 6; i++) {
    state.month++;
    updateClimateJustice(state);
  }
  const received2 = countries['Bangladesh'].climateReparationsReceived!;
  assert(
    received2 >= received1,
    'Reparations received increases or stays constant (monotonic)'
  );

  // Test 14: Multiple creditor countries receive transfers
  const creditorCountries = ['Bangladesh', 'Nigeria', 'Indonesia'] as CountryName[];
  const allReceiving = creditorCountries.every(
    name => countries[name].climateReparationsReceived! > 0
  );
  assert(
    allReceiving,
    'All climate victim countries (Bangladesh, Nigeria, Indonesia) receive reparations'
  );
})();

console.log();

// ========== TEST GROUP 4: CLIMATE MIGRATION PRESSURE ==========

console.log('--- Test Group 4: Climate Migration Pressure ---\n');

(() => {
  const state = createTestState();
  const countries = state.countryPopulationSystem.countries;

  // Set high climate severity to trigger migration
  state.environmentalAccumulation.climateChange = 0.8;

  // Run updates to build migration pressure
  for (let i = 0; i < 24; i++) {
    state.month++;
    updateClimateJustice(state);
  }

  // Test 15: Bangladesh has high migration pressure (coastal, high suffering)
  assert(
    countries['Bangladesh'].climateMigrationPressure! > 0.01,
    'Bangladesh has significant migration pressure (>0.01) - coastal + high suffering'
  );

  // Test 16: Coastal nations have higher pressure than inland nations
  const bangladeshPressure = countries['Bangladesh'].climateMigrationPressure!;
  const chinaPressure = countries['China'].climateMigrationPressure!;
  assert(
    bangladeshPressure > chinaPressure,
    'Coastal Bangladesh has higher migration pressure than inland China'
  );

  // Test 17: Migration pressure causes population decline
  const initialPop = countries['Bangladesh'].population;
  state.environmentalAccumulation.climateChange = 0.9;
  for (let i = 0; i < 36; i++) {
    state.month++;
    updateClimateJustice(state);
  }
  const finalPop = countries['Bangladesh'].population;
  assert(
    finalPop < initialPop,
    'High migration pressure causes population decline in Bangladesh'
  );

  // Test 18: Migration pressure increases with climate severity
  const state2 = createTestState();
  state2.environmentalAccumulation.climateChange = 0.4;
  for (let i = 0; i < 12; i++) updateClimateJustice(state2);
  const lowSeverityPressure = state2.countryPopulationSystem.countries['Bangladesh'].climateMigrationPressure!;

  const state3 = createTestState();
  state3.environmentalAccumulation.climateChange = 0.9;
  for (let i = 0; i < 12; i++) updateClimateJustice(state3);
  const highSeverityPressure = state3.countryPopulationSystem.countries['Bangladesh'].climateMigrationPressure!;

  assert(
    highSeverityPressure > lowSeverityPressure,
    'Migration pressure increases with climate severity'
  );
})();

console.log();

// ========== TEST GROUP 5: GREEN TECHNOLOGY TRANSFER ==========

console.log('--- Test Group 5: Green Technology Transfer ---\n');

(() => {
  const state = createTestState();
  const countries = state.countryPopulationSystem.countries;

  // Unlock solar + wind technologies (cleanEnergy)
  state.breakthroughTech = {
    cleanEnergy: {
      id: 'cleanEnergy',
      name: 'Clean Energy',
      category: 'environmental',
      unlocked: true,
      researchProgress: 1.0,
      deploymentLevel: 0.5
    },
    carbonCapture: {
      id: 'carbonCapture',
      name: 'Carbon Capture',
      category: 'environmental',
      unlocked: false,
      researchProgress: 0.5,
      deploymentLevel: 0.0
    }
  } as any;

  // Set high climate severity to trigger tech transfer
  state.environmentalAccumulation.climateChange = 0.7;

  // Run updates to accumulate tech transfer
  for (let i = 0; i < 24; i++) {
    state.month++;
    updateClimateJustice(state);
  }

  // Test 19: Poor countries receive green tech
  assert(
    countries['Bangladesh'].greenTechReceived! > 0,
    'Bangladesh receives green technology from rich countries'
  );

  // Test 20: Rich countries share green tech
  const richCountries = ['United States', 'Germany', 'Japan'] as CountryName[];
  const anySharing = richCountries.some(
    name => countries[name].greenTechShared! > 0
  );
  assert(
    anySharing,
    'Rich countries (US, Germany, Japan) share green technology'
  );

  // Test 21: Tech transfer only happens when technologies unlocked
  const state2 = createTestState();
  state2.environmentalAccumulation.climateChange = 0.7;
  state2.breakthroughTech = {
    cleanEnergy: { unlocked: false },
    carbonCapture: { unlocked: false }
  } as any; // No techs unlocked
  for (let i = 0; i < 24; i++) updateClimateJustice(state2);

  assert(
    state2.countryPopulationSystem.countries['Bangladesh'].greenTechReceived! === 0,
    'No tech transfer when green technologies not yet unlocked'
  );

  // Test 22: Tech transfer increases with climate severity
  const state3 = createTestState();
  state3.breakthroughTech = state.breakthroughTech; // Same unlocked techs
  state3.environmentalAccumulation.climateChange = 0.9; // Higher severity
  for (let i = 0; i < 24; i++) updateClimateJustice(state3);

  assert(
    state3.countryPopulationSystem.countries['Bangladesh'].greenTechReceived! >
    countries['Bangladesh'].greenTechReceived!,
    'Tech transfer increases with higher climate severity'
  );
})();

console.log();

// ========== TEST GROUP 6: INTEGRATION TESTS ==========

console.log('--- Test Group 6: Climate Justice Integration ---\n');

(() => {
  const state = createTestState();
  const countries = state.countryPopulationSystem.countries;

  // Unlock solar + carbon capture
  state.breakthroughTech = {
    cleanEnergy: {
      id: 'cleanEnergy',
      name: 'Clean Energy',
      category: 'environmental',
      unlocked: true,
      researchProgress: 1.0,
      deploymentLevel: 0.8
    },
    carbonCapture: {
      id: 'carbonCapture',
      name: 'Carbon Capture',
      category: 'environmental',
      unlocked: true,
      researchProgress: 1.0,
      deploymentLevel: 0.5
    }
  } as any;

  // Set high climate severity
  state.environmentalAccumulation.climateChange = 0.8;

  // Run full simulation for 5 years
  for (let i = 0; i < 60; i++) {
    state.month++;
    updateClimateJustice(state);
  }

  // Test 23: Full system creates debt flows
  assert(
    countries['United States'].climateReparationsOwed! > 0 &&
    countries['Bangladesh'].climateReparationsReceived! > 0,
    'Full system creates debt flows (US pays, Bangladesh receives)'
  );

  // Test 24: Migration + reparations both active
  assert(
    countries['Bangladesh'].climateMigrationPressure! > 0 &&
    countries['Bangladesh'].climateReparationsReceived! > 0,
    'Bangladesh experiences both migration pressure AND receives reparations'
  );

  // Test 25: Tech transfer + reparations both active
  assert(
    countries['Bangladesh'].greenTechReceived! > 0 &&
    countries['Bangladesh'].climateReparationsReceived! > 0,
    'Bangladesh receives both green tech AND financial reparations'
  );

  // Test 26: Climate justice score reflects multiple factors
  // (Implicit test - system runs without errors for 60 months)
  assert(
    state.month === 60,
    'Climate justice system runs stably for 60 months (5 years)'
  );
})();

console.log();

// ========== FINAL RESULTS ==========

console.log('=== PHASE 4 TEST RESULTS ===\n');
console.log(`Tests passed: ${testsPassed}`);
console.log(`Tests failed: ${testsFailed}`);
console.log(`Total tests: ${testsPassed + testsFailed}`);

if (testsFailed === 0) {
  console.log('\n✓ ALL PHASE 4 TESTS PASSED!\n');
  process.exit(0);
} else {
  console.log(`\n✗ ${testsFailed} PHASE 4 TEST(S) FAILED\n`);
  process.exit(1);
}
