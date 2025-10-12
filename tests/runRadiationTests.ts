/**
 * Standalone test runner for Nuclear Radiation Health Effects System
 * Run with: npx tsx tests/runRadiationTests.ts
 */

import {
  initializeRadiationSystem,
  createRadiationExposure,
  progressRadiationExposure,
  isRadiationExposureActive,
  updateRadiationSystem,
  triggerRadiationExposure,
  getRadiationStats,
  RadiationSystem,
  RadiationExposureEvent,
} from '../src/types/radiation';

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
    toBeLessThanOrEqual(expected: number) {
      if (value > expected) {
        throw new Error(`Expected <= ${expected}, got ${value}`);
      }
    },
  };
}

console.log('\n=== NUCLEAR RADIATION HEALTH EFFECTS TESTS ===\n');

// Test 1: Initialization
const system = initializeRadiationSystem();
test('should initialize empty radiation system', () => {
  expect(system.activeExposures.length).toBe(0);
  expect(system.totalRadiationDeaths).toBe(0);
  expect(system.totalCancerDeaths).toBe(0);
  expect(system.totalBirthDefects).toBe(0);
  expect(system.contaminatedRegions.size).toBe(0);
});

// Test 2: Acute radiation syndrome
const exposure1 = createRadiationExposure(0, 'Europe', 0.05, 1.0); // 50M exposed, full dose

test('ARS: creates acute radiation deaths', () => {
  expect(exposure1.acuteRadiationDeaths).toBeGreaterThan(0);
  expect(exposure1.acuteRadiationSyndrome.mortalityRate).toBeGreaterThanOrEqual(0.5); // 50-80%
  expect(exposure1.acuteRadiationSyndrome.mortalityRate).toBeLessThanOrEqual(0.8);
});

test('ARS: affected population = exposed × exposure level', () => {
  expect(exposure1.acuteRadiationSyndrome.affectedPopulation).toBeCloseTo(0.05 * 1.0, 3);
});

test('ARS: acute deaths = affected × mortality rate', () => {
  const expected = exposure1.acuteRadiationSyndrome.affectedPopulation * exposure1.acuteRadiationSyndrome.mortalityRate;
  expect(exposure1.acuteRadiationDeaths).toBeCloseTo(expected, 3);
});

// Test 3: Cancer risk
test('Cancer: baseline rate is 40%', () => {
  expect(exposure1.cancerRisk.baselineRate).toBe(0.40);
});

test('Cancer: radiation bonus is +10-30%', () => {
  expect(exposure1.cancerRisk.radiationBonus).toBeGreaterThanOrEqual(0.10);
  // Use toBeCloseTo to handle floating point precision
  const isWithinRange = exposure1.cancerRisk.radiationBonus >= 0.09 && exposure1.cancerRisk.radiationBonus <= 0.31;
  if (!isWithinRange) {
    throw new Error(`Expected 0.10-0.30, got ${exposure1.cancerRisk.radiationBonus}`);
  }
});

test('Cancer: 5-year latency before cancers appear', () => {
  expect(exposure1.cancerRisk.latencyYears).toBe(5);
});

test('Cancer: 40-year duration', () => {
  expect(exposure1.cancerRisk.durationYears).toBe(40);
});

// Test 4: Birth defects
test('Birth defects: baseline rate is 3%', () => {
  expect(exposure1.birthDefects.baselineRate).toBe(0.03);
});

test('Birth defects: radiation multiplier is 2-5x', () => {
  expect(exposure1.birthDefects.radiationMultiplier).toBeGreaterThanOrEqual(2.0);
  expect(exposure1.birthDefects.radiationMultiplier).toBeLessThanOrEqual(5.0);
});

test('Birth defects: affects 3 generations', () => {
  expect(exposure1.birthDefects.affectedGenerations).toBe(3);
});

// Test 5: Environmental contamination
test('Contamination: starts at 100%', () => {
  expect(exposure1.contamination.currentContaminationLevel).toBe(1.0);
});

test('Contamination: agriculture impossible initially', () => {
  expect(exposure1.contamination.agricultureImpossible).toBe(true);
});

test('Contamination: Cs-137 half-life is 30 years', () => {
  expect(exposure1.contamination.cesium137HalfLife).toBe(360); // 30 years in months
});

// Test 6: Radiation progression - Year 1 (no cancer yet)
const testExposure = createRadiationExposure(0, 'Asia', 0.1, 1.0); // 100M exposed

console.log('\n📊 RADIATION PROGRESSION TEST (100M exposed)');
console.log('Year 1 (Months 1-12): Acute phase');
for (let month = 1; month <= 12; month++) {
  const { deaths, birthDefects } = progressRadiationExposure(testExposure, month, 8.0);
  if (month % 6 === 0) {
    const deathsThousands = deaths * 1000000; // Convert to thousands
    const defectsThousands = birthDefects * 1000000;
    console.log(`   Month ${month}: ${deathsThousands.toFixed(0)} deaths, ${defectsThousands.toFixed(0)} birth defects, contamination: ${(testExposure.contamination.currentContaminationLevel * 100).toFixed(1)}%`);
  }
}

test('Year 1: No cancer deaths yet (5-year latency)', () => {
  expect(testExposure.cancerRisk.cumulativeCancerDeaths).toBe(0);
});

test('Year 1: Birth defects accumulate', () => {
  expect(testExposure.birthDefects.cumulativeDefects).toBeGreaterThan(0);
});

test('Year 1: Contamination decays slowly', () => {
  expect(testExposure.contamination.currentContaminationLevel).toBeGreaterThan(0.9); // Still ~95% after 1 year
});

// Test 7: Jump to Year 10 (cancer starts at year 5)
console.log('\nYear 10 (Month 120): Cancer phase begins');
const testExposure2 = createRadiationExposure(0, 'Asia', 0.1, 1.0);
for (let month = 1; month <= 120; month++) {
  progressRadiationExposure(testExposure2, month, 8.0);
}
const { deaths: deaths10, birthDefects: defects10 } = progressRadiationExposure(testExposure2, 121, 8.0);
console.log(`   Month 121: ${(deaths10 * 1000000).toFixed(0)} deaths/month, ${(defects10 * 1000000).toFixed(0)} birth defects, contamination: ${(testExposure2.contamination.currentContaminationLevel * 100).toFixed(1)}%`);

test('Year 10: Cancer deaths are occurring', () => {
  expect(testExposure2.cancerRisk.cumulativeCancerDeaths).toBeGreaterThan(0);
});

test('Year 10: Contamination decreased but still high', () => {
  expect(testExposure2.contamination.currentContaminationLevel).toBeLessThan(0.9);
  expect(testExposure2.contamination.currentContaminationLevel).toBeGreaterThan(0.5); // ~70% after 10 years
});

// Test 8: Jump to Year 30 (peak cancer incidence)
console.log('\nYear 30 (Month 360): Peak cancer incidence');
const testExposure3 = createRadiationExposure(0, 'Asia', 0.1, 1.0);
for (let month = 1; month <= 360; month++) {
  progressRadiationExposure(testExposure3, month, 8.0);
}
const { deaths: deaths30 } = progressRadiationExposure(testExposure3, 361, 8.0);
console.log(`   Month 361: ${(deaths30 * 1000000).toFixed(0)} deaths/month, contamination: ${(testExposure3.contamination.currentContaminationLevel * 100).toFixed(1)}%`);

test('Year 30: Peak cancer deaths', () => {
  expect(testExposure3.cancerRisk.cumulativeCancerDeaths).toBeGreaterThan(0);
  // Peak should have higher monthly deaths than year 10
  expect(deaths30).toBeGreaterThan(deaths10);
});

test('Year 30: Contamination ~50% (1 half-life)', () => {
  expect(testExposure3.contamination.currentContaminationLevel).toBeGreaterThanOrEqual(0.45);
  expect(testExposure3.contamination.currentContaminationLevel).toBeLessThanOrEqual(0.55);
});

// Test 9: Exposure levels scale effects
const lowExposure = createRadiationExposure(0, 'Oceania', 0.01, 0.3); // 10M, 30% dose
const highExposure = createRadiationExposure(0, 'Oceania', 0.01, 1.0); // 10M, 100% dose

test('Low exposure: Lower mortality rate', () => {
  expect(lowExposure.acuteRadiationSyndrome.mortalityRate).toBeLessThan(highExposure.acuteRadiationSyndrome.mortalityRate);
});

test('Low exposure: Lower cancer bonus', () => {
  expect(lowExposure.cancerRisk.radiationBonus).toBeLessThan(highExposure.cancerRisk.radiationBonus);
});

test('Low exposure: Lower birth defect multiplier', () => {
  expect(lowExposure.birthDefects.radiationMultiplier).toBeLessThan(highExposure.birthDefects.radiationMultiplier);
});

// Test 10: System integration
const system2 = initializeRadiationSystem();
triggerRadiationExposure(system2, 0, 'Europe', 0.05, 1.0);
triggerRadiationExposure(system2, 0, 'Asia', 0.10, 0.8);

test('Multiple exposures tracked independently', () => {
  expect(system2.activeExposures.length).toBe(2);
  expect(system2.contaminatedRegions.size).toBe(2);
  expect(system2.contaminatedRegions.has('Europe')).toBe(true);
  expect(system2.contaminatedRegions.has('Asia')).toBe(true);
});

test('Acute deaths counted immediately', () => {
  expect(system2.totalRadiationDeaths).toBeGreaterThan(0);
});

// Progress system
updateRadiationSystem(system2, 1, 8.0);
test('System updates all exposures', () => {
  expect(system2.totalBirthDefects).toBeGreaterThan(0);
});

const stats = getRadiationStats(system2);
test('Stats track multiple exposures', () => {
  expect(stats.activeExposures).toBe(2);
  expect(stats.contaminatedRegions.length).toBe(2);
});

// Test 11: Exposure eventually becomes inactive
const oldExposure = createRadiationExposure(0, 'Test', 0.01, 1.0);
test('New exposure is active', () => {
  expect(isRadiationExposureActive(oldExposure, 12)).toBe(true);
});

// Advance 500 years (6000 months) - way beyond all effects
for (let month = 1; month <= 6000; month++) {
  progressRadiationExposure(oldExposure, month, 8.0);
}

test('Very old exposure becomes inactive', () => {
  expect(isRadiationExposureActive(oldExposure, 6000)).toBe(false);
});

test('Contamination decays to near zero after 500 years', () => {
  expect(oldExposure.contamination.currentContaminationLevel).toBeLessThan(0.01); // < 1%
});

// Test 12: Realistic scenario - Hiroshima analogy
console.log('\n🌍 REALISTIC SCENARIO: Hiroshima-scale event');
const hiroshima = createRadiationExposure(0, 'Asia', 0.0002, 1.0); // 200k exposed
console.log(`Acute deaths: ${(hiroshima.acuteRadiationDeaths * 1000000).toFixed(0)}`);
console.log(`ARS mortality rate: ${(hiroshima.acuteRadiationSyndrome.mortalityRate * 100).toFixed(0)}%`);
console.log(`Cancer bonus: +${(hiroshima.cancerRisk.radiationBonus * 100).toFixed(0)}%`);
console.log(`Birth defect multiplier: ${hiroshima.birthDefects.radiationMultiplier.toFixed(1)}x`);

test('Hiroshima: Produces realistic acute death count', () => {
  // 200k exposed × 50-80% = 100k-160k deaths
  const expectedMin = 0.0002 * 0.5 * 1000000; // 100k
  const expectedMax = 0.0002 * 0.8 * 1000000; // 160k
  const actualThousands = hiroshima.acuteRadiationDeaths * 1000000;
  expect(actualThousands).toBeGreaterThanOrEqual(expectedMin);
  expect(actualThousands).toBeLessThanOrEqual(expectedMax);
});

// Summary
console.log(`\n=== SUMMARY ===`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`Total: ${passed + failed}\n`);

if (failed > 0) {
  process.exit(1);
}
