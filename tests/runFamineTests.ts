/**
 * Standalone test runner for Famine Death Curve System
 * Run with: npx tsx tests/runFamineTests.ts
 */

import {
  initializeFamineSystem,
  createFamineEvent,
  calculateMonthlyMortalityRate,
  progressFamine,
  isFamineActive,
  updateFamineSystem,
  triggerFamine,
  getFamineStats,
  FamineSystem,
  FamineEvent,
} from '../src/types/famine';

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

console.log('\n=== FAMINE DEATH CURVE SYSTEM TESTS ===\n');

// Test 1: Initialization
const system = initializeFamineSystem();
test('should initialize empty famine system', () => {
  expect(system.activeFamines.length).toBe(0);
  expect(system.totalDeaths).toBe(0);
  expect(system.genocideFamines).toBe(0);
  expect(system.techPreventedDeaths).toBe(0);
});

// Test 2: Death curve progression
test('death curve: month 0 = 0%', () => {
  expect(calculateMonthlyMortalityRate(0)).toBe(0.00);
});

test('death curve: month 1 = 2%', () => {
  expect(calculateMonthlyMortalityRate(1)).toBe(0.02);
});

test('death curve: month 2 = 8%', () => {
  expect(calculateMonthlyMortalityRate(2)).toBe(0.08);
});

test('death curve: month 3 = 15% (peak)', () => {
  expect(calculateMonthlyMortalityRate(3)).toBe(0.15);
});

test('death curve: month 4 = 10%', () => {
  expect(calculateMonthlyMortalityRate(4)).toBe(0.10);
});

test('death curve: month 5+ = 2% (sustained)', () => {
  expect(calculateMonthlyMortalityRate(5)).toBe(0.02);
  expect(calculateMonthlyMortalityRate(6)).toBe(0.02);
  expect(calculateMonthlyMortalityRate(10)).toBe(0.02);
});

// Test 3: Genocide detection
const gazaFamine = createFamineEvent(0, 'Asia', 0.002, 'aid_blockade', 0.1);

test('Gaza scenario: aid blockade = genocide', () => {
  expect(gazaFamine.isGenocide).toBe(true);
  expect(gazaFamine.aidBlocked).toBe(true);
  expect(gazaFamine.canDeployTech).toBe(false); // CANNOT deploy tech
});

const sudanFamine = createFamineEvent(0, 'Africa', 0.025, 'war_displacement', 0.2);

test('Sudan scenario: war displacement != genocide', () => {
  expect(sudanFamine.isGenocide).toBe(false);
  expect(sudanFamine.canDeployTech).toBe(true); // CAN deploy tech
});

// Test 4: Natural disaster with tech deployment
const droughtFamine = createFamineEvent(0, 'Africa', 0.1, 'drought', 0.3);

test('Natural disaster: tech can be deployed', () => {
  expect(droughtFamine.isGenocide).toBe(false);
  expect(droughtFamine.canDeployTech).toBe(true);
  expect(droughtFamine.aiCapabilityRequired).toBe(2.0);
});

// Progress drought famine with tech
const deaths1 = progressFamine(droughtFamine, 3.0, true); // High AI, resources available
test('Tech deployment reduces mortality', () => {
  expect(droughtFamine.techDeployed).toBe(true);
  expect(droughtFamine.techEffectiveness).toBeGreaterThan(0.5); // 50%+ reduction
  expect(droughtFamine.techEffectiveness).toBeLessThanOrEqual(0.9); // Capped at 90%
});

const deaths2 = progressFamine(droughtFamine, 3.0, true);
const baseRate = calculateMonthlyMortalityRate(2); // Month 2 = 8%
test('Tech reduces deaths by 50-90%', () => {
  expect(droughtFamine.monthlyMortalityRate).toBeLessThan(baseRate * 0.5); // At least 50% reduction
});

// Test 5: Genocide blocks tech
const palestineFamine = createFamineEvent(0, 'Asia', 0.002, 'resource_extraction', 0.1);

test('Resource extraction = genocide (land grab)', () => {
  expect(palestineFamine.isGenocide).toBe(true);
  expect(palestineFamine.resourceExtraction).toBe(true);
  expect(palestineFamine.canDeployTech).toBe(false);
});

const deathsGenocide1 = progressFamine(palestineFamine, 5.0, true); // Even with high AI
test('Genocide: tech CANNOT be deployed', () => {
  expect(palestineFamine.techDeployed).toBe(false); // Tech NOT deployed
  expect(palestineFamine.techEffectiveness).toBe(0); // No reduction
});

const deathsGenocide2 = progressFamine(palestineFamine, 5.0, true);
const baseRate2 = calculateMonthlyMortalityRate(2); // Month 2 = 8%
test('Genocide: no mortality reduction', () => {
  expect(palestineFamine.monthlyMortalityRate).toBeCloseTo(baseRate2, 3); // No reduction
});

// Test 6: Full famine progression
const testFamine = createFamineEvent(0, 'Africa', 0.1, 'crop_failure', 0.2);
const monthlyDeaths: number[] = [];

console.log('\n📊 FAMINE PROGRESSION TEST (100M population)');
for (let month = 0; month < 6; month++) {
  const deaths = progressFamine(testFamine, 1.5, false); // Low AI, no tech
  monthlyDeaths.push(deaths);
  const deathsMillions = deaths * 1000; // Convert billions to millions
  const cumulativeMillions = testFamine.cumulativeDeaths * 1000;
  const rate = testFamine.monthlyMortalityRate * 100;
  console.log(`   Month ${month}: ${deathsMillions.toFixed(2)}M deaths (${rate.toFixed(1)}% rate, cumulative: ${cumulativeMillions.toFixed(2)}M)`);
}

test('No tech = full mortality curve', () => {
  expect(testFamine.techDeployed).toBe(false); // AI too low
  expect(monthlyDeaths[1]).toBeGreaterThan(monthlyDeaths[0]); // Deaths increase (2% → 8%)
  expect(monthlyDeaths[2]).toBeGreaterThan(monthlyDeaths[1]); // Peak at month 3 (8% → 15%)
  expect(monthlyDeaths[3]).toBeLessThan(monthlyDeaths[2]); // Decline after peak (15% → 10%)
  expect(monthlyDeaths[4]).toBeLessThan(monthlyDeaths[3]); // Further decline (10% → 2%)
});

// Test 7: System integration
const system2 = initializeFamineSystem();
triggerFamine(system2, 0, 'Asia', 0.05, 'drought', 0.2);
triggerFamine(system2, 0, 'Africa', 0.03, 'aid_blockade', 0.1);

test('Multiple famines tracked independently', () => {
  expect(system2.activeFamines.length).toBe(2);
  expect(system2.genocideFamines).toBe(1); // Only aid_blockade
});

const totalDeaths1 = updateFamineSystem(system2, 2.5, true);
test('System updates all famines', () => {
  expect(totalDeaths1).toBeGreaterThan(0);
  expect(system2.totalDeaths).toBeGreaterThan(0);
});

const stats = getFamineStats(system2);
test('Stats track tech effectiveness', () => {
  expect(stats.activeFamines).toBe(2);
  expect(stats.genocideFamines).toBe(1);
  // Tech should have been deployed to drought but not aid_blockade
  expect(system2.techPreventedDeaths).toBeGreaterThan(0);
});

// Test 8: Famine ends when conditions improve
testFamine.foodSecurityLevel = 0.85; // Food security restored
test('Famine ends when food security restored', () => {
  expect(isFamineActive(testFamine)).toBe(false);
});

const depletedFamine = createFamineEvent(0, 'Asia', 0.01, 'drought', 0.1);
depletedFamine.cumulativeDeaths = 0.009; // 90% mortality
test('Famine ends when population depleted (>80%)', () => {
  expect(isFamineActive(depletedFamine)).toBe(false);
});

// Test 9: Realistic scenario validation
console.log('\n🌍 REALISTIC SCENARIO: Gaza vs Sudan');

const gaza2024 = createFamineEvent(0, 'Asia', 0.002, 'aid_blockade', 0.05);
const sudan2024 = createFamineEvent(0, 'Africa', 0.025, 'war_displacement', 0.15);

console.log('\nGAZA (Genocide - aid blockade):');
for (let month = 0; month < 4; month++) {
  const deaths = progressFamine(gaza2024, 4.0, true); // High AI available
  const deathsThousands = deaths * 1000000; // Convert to thousands
  console.log(`   Month ${month}: ${deathsThousands.toFixed(0)} deaths, tech deployed: ${gaza2024.techDeployed}`);
}

console.log('\nSUDAN (War - tech can help):');
for (let month = 0; month < 4; month++) {
  const deaths = progressFamine(sudan2024, 4.0, true); // High AI available
  const deathsMillions = deaths * 1000; // Convert to millions
  console.log(`   Month ${month}: ${deathsMillions.toFixed(2)}M deaths, tech deployed: ${sudan2024.techDeployed}, effectiveness: ${(sudan2024.techEffectiveness * 100).toFixed(0)}%`);
}

test('Gaza: Tech CANNOT help (genocide)', () => {
  expect(gaza2024.techDeployed).toBe(false);
  expect(gaza2024.isGenocide).toBe(true);
});

test('Sudan: Tech CAN help (war)', () => {
  expect(sudan2024.techDeployed).toBe(true);
  expect(sudan2024.techEffectiveness).toBeGreaterThan(0.5);
});

// Summary
console.log(`\n=== SUMMARY ===`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`Total: ${passed + failed}\n`);

if (failed > 0) {
  process.exit(1);
}
