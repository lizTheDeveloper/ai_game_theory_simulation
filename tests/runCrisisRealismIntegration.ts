/**
 * Crisis Realism Integration Test
 *
 * Validates that all TIER 1.7 systems work together:
 * - Regional Biodiversity (nuclear strikes affect only target regions)
 * - Famine Death Curves (gradual mortality, genocide detection)
 * - Nuclear Radiation (long-term health effects)
 *
 * Scenario: Nuclear war → regional effects → long-term consequences
 *
 * Run with: npx tsx tests/runCrisisRealismIntegration.ts
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { GameState } from '../src/types/game';
import { applyNuclearBiodiversityLoss, getRegionFromNation } from '../src/types/regionalBiodiversity';
import { triggerRadiationExposure, updateRadiationSystem, getRadiationStats } from '../src/types/radiation';
import { triggerFamine, updateFamineSystem, getFamineStats } from '../src/types/famine';
import { calculateTotalAICapability } from '../src/simulation/calculations';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`❌ ${name}`);
    console.log(`   ${e}`);
    failed++;
  }
}

function expect(value: any) {
  return {
    toBe(expected: any) {
      if (value !== expected) {
        throw new Error(`Expected ${expected}, got ${value}`);
      }
    },
    toBeCloseTo(expected: number, decimals: number = 2) {
      const factor = Math.pow(10, decimals);
      if (Math.round(value * factor) !== Math.round(expected * factor)) {
        throw new Error(`Expected ${expected} (±${1/factor}), got ${value}`);
      }
    },
    toBeGreaterThan(expected: number) {
      if (value <= expected) {
        throw new Error(`Expected > ${expected}, got ${value}`);
      }
    },
    toBeLessThan(expected: number) {
      if (value >= expected) {
        throw new Error(`Expected < ${expected}, got ${value}`);
      }
    },
    toBeGreaterThanOrEqual(expected: number) {
      if (value < expected) {
        throw new Error(`Expected >= ${expected}, got ${value}`);
      }
    },
  };
}

console.log('\n=== CRISIS REALISM INTEGRATION TEST ===\n');
console.log('Scenario: Nuclear war between US and Russia');
console.log('Expected cascade: Nuclear strike → Regional biodiversity loss → Radiation exposure → Potential famine\n');

// Initialize game state
const state = createDefaultInitialState();

console.log('📊 INITIAL STATE:');
console.log(`   Global population: ${(state.humanPopulationSystem.totalPopulation * 1000).toFixed(0)}M`);
console.log(`   Global biodiversity: ${(state.biodiversitySystem.globalBiodiversityIndex * 100).toFixed(1)}%`);
console.log(`   Active radiation exposures: ${state.radiationSystem.activeExposures.length}`);
console.log(`   Active famines: ${state.famineSystem.activeFamines.length}`);

// Test 1: Initial state validation
test('Initial state: No active exposures', () => {
  expect(state.radiationSystem.activeExposures.length).toBe(0);
  expect(state.famineSystem.activeFamines.length).toBe(0);
});

test('Initial state: Healthy global biodiversity', () => {
  expect(state.biodiversitySystem.globalBiodiversityIndex).toBeGreaterThan(0.65);
});

// Test 2: Simulate nuclear war
console.log('\n☢️  NUCLEAR WAR TRIGGERED (Month 0)');
console.log('   Simulating US-Russia nuclear exchange...');

const participants = ['United States', 'Russia'];
const initialBiodiversity = state.biodiversitySystem.globalBiodiversityIndex;
const initialPopulation = state.humanPopulationSystem.totalPopulation;

// Apply nuclear strikes
for (const nation of participants) {
  const targetRegion = getRegionFromNation(nation);
  console.log(`   ☢️ Striking ${targetRegion} (${nation})`);

  // 1. Regional biodiversity loss
  applyNuclearBiodiversityLoss(state.biodiversitySystem, targetRegion, 1.0);

  // 2. Radiation exposure (15% of global population per participant)
  const exposedPopulation = state.humanPopulationSystem.totalPopulation * 0.15;
  triggerRadiationExposure(state.radiationSystem, state.currentMonth, targetRegion, exposedPopulation, 1.0);

  // 3. Trigger famine in affected region (nuclear winter effect)
  triggerFamine(state.famineSystem, state.currentMonth, targetRegion, exposedPopulation * 0.5, 'nuclear_winter', 0.2);
}

console.log('\n📊 IMMEDIATE EFFECTS (Month 0):');
console.log(`   Global biodiversity: ${(state.biodiversitySystem.globalBiodiversityIndex * 100).toFixed(1)}% (was ${(initialBiodiversity * 100).toFixed(1)}%)`);
console.log(`   Active radiation exposures: ${state.radiationSystem.activeExposures.length}`);
console.log(`   Active famines: ${state.famineSystem.activeFamines.length}`);
console.log(`   Contaminated regions: ${Array.from(state.radiationSystem.contaminatedRegions).join(', ')}`);

// Test 3: Regional isolation
const asiaRegion = state.biodiversitySystem.regions.get('Asia');
const southAmericaRegion = state.biodiversitySystem.regions.get('South America');

test('Regional isolation: Asia damaged', () => {
  expect(asiaRegion!.biodiversityIndex).toBeLessThan(0.3); // Heavy damage
});

test('Regional isolation: South America untouched', () => {
  expect(southAmericaRegion!.biodiversityIndex).toBe(0.80); // Unchanged
});

test('Regional isolation: Correct regions contaminated', () => {
  expect(state.radiationSystem.contaminatedRegions.has('Asia')).toBe(true);
  expect(state.radiationSystem.contaminatedRegions.has('North America')).toBe(true);
  expect(state.radiationSystem.contaminatedRegions.has('South America')).toBe(false);
});

// Test 4: Global biodiversity decreased
test('Global effect: Biodiversity decreased', () => {
  expect(state.biodiversitySystem.globalBiodiversityIndex).toBeLessThan(initialBiodiversity);
});

// Test 5: Radiation exposures created
test('Radiation: Exposures created for both regions', () => {
  expect(state.radiationSystem.activeExposures.length).toBe(2);
});

test('Radiation: Acute deaths calculated', () => {
  expect(state.radiationSystem.totalRadiationDeaths).toBeGreaterThan(0);
});

// Test 6: Famines triggered
test('Famine: Events created for both regions', () => {
  expect(state.famineSystem.activeFamines.length).toBe(2);
});

// Test 7: Progress simulation (6 months)
console.log('\n⏳ PROGRESSING SIMULATION (6 months)...');

for (let month = 1; month <= 6; month++) {
  state.currentMonth = month;

  // Update radiation system
  const radResults = updateRadiationSystem(state.radiationSystem, month, state.humanPopulationSystem.totalPopulation);

  // Update famine system
  const aiCapability = calculateTotalAICapability(state.aiAgents);
  const famineResults = updateFamineSystem(state.famineSystem, aiCapability, true);

  if (month === 3) {
    console.log(`\n   Month ${month}:`);
    console.log(`   - Radiation deaths: ${(radResults.deaths * 1000000).toFixed(0)}/month`);
    console.log(`   - Famine deaths: ${(famineResults * 1000000).toFixed(0)}/month`);
    console.log(`   - Birth defects: ${(radResults.birthDefects * 1000000).toFixed(0)}/month`);

    const radStats = getRadiationStats(state.radiationSystem);
    const famineStats = getFamineStats(state.famineSystem);
    console.log(`   - Total radiation deaths: ${(radStats.totalRadiationDeaths * 1000000).toFixed(0)}`);
    console.log(`   - Total famine deaths: ${(famineStats.totalDeaths * 1000000).toFixed(0)}`);
  }
}

const radStats6mo = getRadiationStats(state.radiationSystem);
const famineStats6mo = getFamineStats(state.famineSystem);

console.log(`\n📊 6-MONTH EFFECTS:`);
console.log(`   Total radiation deaths: ${(radStats6mo.totalRadiationDeaths * 1000000).toFixed(0)}`);
console.log(`   Total famine deaths: ${(famineStats6mo.totalDeaths * 1000000).toFixed(0)}`);
console.log(`   Birth defects: ${(radStats6mo.totalBirthDefects * 1000000).toFixed(0)}`);
console.log(`   Active famines: ${famineStats6mo.activeFamines}`);

test('6 months: Famine deaths accumulating', () => {
  expect(famineStats6mo.totalDeaths).toBeGreaterThan(0);
});

test('6 months: Birth defects occurring', () => {
  expect(radStats6mo.totalBirthDefects).toBeGreaterThan(0);
});

test('6 months: No cancer deaths yet (5-year latency)', () => {
  expect(radStats6mo.totalCancerDeaths).toBe(0);
});

// Test 8: Long-term progression (10 years = 120 months)
console.log('\n⏳ FAST-FORWARDING TO YEAR 10...');

for (let month = 7; month <= 120; month++) {
  state.currentMonth = month;
  updateRadiationSystem(state.radiationSystem, month, state.humanPopulationSystem.totalPopulation);

  const aiCapability = calculateTotalAICapability(state.aiAgents);
  updateFamineSystem(state.famineSystem, aiCapability, true);
}

const radStats10yr = getRadiationStats(state.radiationSystem);
const famineStats10yr = getFamineStats(state.famineSystem);

console.log(`\n📊 10-YEAR EFFECTS:`);
console.log(`   Total radiation deaths: ${(radStats10yr.totalRadiationDeaths * 1000000).toFixed(0)}`);
console.log(`   Cancer deaths: ${(radStats10yr.totalCancerDeaths * 1000000).toFixed(0)}`);
console.log(`   Total famine deaths: ${(famineStats10yr.totalDeaths * 1000000).toFixed(0)}`);
console.log(`   Birth defects: ${(radStats10yr.totalBirthDefects * 1000000).toFixed(0)}`);
console.log(`   Active famines: ${famineStats10yr.activeFamines}`);
console.log(`   Contaminated regions: ${radStats10yr.contaminatedRegions.join(', ')}`);

// Check contamination levels
const asiaExposure = state.radiationSystem.activeExposures.find(e => e.region === 'Asia');
const naExposure = state.radiationSystem.activeExposures.find(e => e.region === 'North America');

console.log(`\n☢️  CONTAMINATION LEVELS (Year 10):`);
if (asiaExposure) {
  console.log(`   Asia: ${(asiaExposure.contamination.currentContaminationLevel * 100).toFixed(1)}%`);
  console.log(`   Agriculture possible: ${!asiaExposure.contamination.agricultureImpossible}`);
}
if (naExposure) {
  console.log(`   North America: ${(naExposure.contamination.currentContaminationLevel * 100).toFixed(1)}%`);
  console.log(`   Agriculture possible: ${!naExposure.contamination.agricultureImpossible}`);
}

test('10 years: Cancer deaths occurring', () => {
  expect(radStats10yr.totalCancerDeaths).toBeGreaterThan(0);
});

test('10 years: Contamination persists', () => {
  expect(radStats10yr.contaminatedRegions.length).toBeGreaterThan(0);
});

test('10 years: Famines ended (food security restored)', () => {
  expect(famineStats10yr.activeFamines).toBe(0);
});

// Test 9: Very long term (30 years = 360 months)
console.log('\n⏳ FAST-FORWARDING TO YEAR 30 (peak cancer incidence)...');

for (let month = 121; month <= 360; month++) {
  state.currentMonth = month;
  updateRadiationSystem(state.radiationSystem, month, state.humanPopulationSystem.totalPopulation);
}

const radStats30yr = getRadiationStats(state.radiationSystem);

console.log(`\n📊 30-YEAR EFFECTS (Peak Cancer Period):`);
console.log(`   Total radiation deaths: ${(radStats30yr.totalRadiationDeaths * 1000000).toFixed(0)}`);
console.log(`   Cancer deaths: ${(radStats30yr.totalCancerDeaths * 1000000).toFixed(0)}`);
console.log(`   Birth defects (3 generations): ${(radStats30yr.totalBirthDefects * 1000000).toFixed(0)}`);

if (asiaExposure) {
  console.log(`   Asia contamination: ${(asiaExposure.contamination.currentContaminationLevel * 100).toFixed(1)}% (~50% after 1 half-life)`);
}

test('30 years: Peak cancer deaths', () => {
  expect(radStats30yr.totalCancerDeaths).toBeGreaterThan(radStats10yr.totalCancerDeaths);
});

test('30 years: Contamination at ~50% (1 half-life)', () => {
  if (asiaExposure) {
    expect(asiaExposure.contamination.currentContaminationLevel).toBeGreaterThanOrEqual(0.45);
    expect(asiaExposure.contamination.currentContaminationLevel).toBeLessThan(0.55);
  }
});

// Test 10: System independence
console.log('\n🔬 SYSTEM INDEPENDENCE TESTS:');

test('Independence: Biodiversity system maintains regional data', () => {
  // Asia should still be damaged, South America untouched
  const asiaFinal = state.biodiversitySystem.regions.get('Asia');
  const saFinal = state.biodiversitySystem.regions.get('South America');
  expect(asiaFinal!.biodiversityIndex).toBeLessThan(0.3);
  expect(saFinal!.biodiversityIndex).toBe(0.80);
});

test('Independence: Radiation system tracks long-term effects', () => {
  expect(state.radiationSystem.activeExposures.length).toBeGreaterThan(0);
  expect(radStats30yr.totalCancerDeaths).toBeGreaterThan(0);
});

test('Independence: Famine system ended naturally', () => {
  // Famines should have ended when food security restored
  expect(state.famineSystem.activeFamines.length).toBe(0);
  expect(state.famineSystem.historicalFamines.length).toBe(2);
});

// Summary
console.log(`\n=== INTEGRATION TEST SUMMARY ===`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`Total: ${passed + failed}`);

console.log(`\n📈 FINAL CUMULATIVE EFFECTS (30 years post-nuclear war):`);
console.log(`   Acute radiation deaths: ${(radStats30yr.totalRadiationDeaths * 1000000).toFixed(0)}`);
console.log(`   Long-term cancer deaths: ${(radStats30yr.totalCancerDeaths * 1000000).toFixed(0)}`);
console.log(`   Famine deaths (months 1-6): ${(famineStats10yr.totalDeaths * 1000000).toFixed(0)}`);
console.log(`   Birth defects (ongoing): ${(radStats30yr.totalBirthDefects * 1000000).toFixed(0)}`);
console.log(`   Global biodiversity loss: ${((initialBiodiversity - state.biodiversitySystem.globalBiodiversityIndex) * 100).toFixed(1)}%`);
console.log(`   Regions still contaminated: ${radStats30yr.contaminatedRegions.length}`);

console.log(`\n✅ ALL CRISIS REALISM SYSTEMS VALIDATED:`);
console.log(`   - Regional biodiversity: Localized damage, South America untouched`);
console.log(`   - Famine death curves: Gradual mortality over months, then recovery`);
console.log(`   - Nuclear radiation: Decades-long health effects, contamination persists`);
console.log(`   - System independence: Each system maintains its own state correctly\n`);

if (failed > 0) {
  process.exit(1);
}
