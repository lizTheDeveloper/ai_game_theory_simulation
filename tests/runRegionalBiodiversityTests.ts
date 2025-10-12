/**
 * Standalone test runner for Regional Biodiversity System
 * Run with: npx tsx tests/runRegionalBiodiversityTests.ts
 */

import {
  initializeRegionalBiodiversitySystem,
  recalculateGlobalBiodiversity,
  applyNuclearBiodiversityLoss,
  getRegionFromNation,
} from '../src/types/regionalBiodiversity';

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

console.log('\n=== REGIONAL BIODIVERSITY SYSTEM TESTS ===\n');

// Test 1: Initialization
const system = initializeRegionalBiodiversitySystem();
test('should initialize 6 regions', () => {
  expect(system.regions.size).toBe(6);
});

test('regional weights sum to 1.0', () => {
  let total = 0;
  for (const weight of system.regionalWeights.values()) {
    total += weight;
  }
  expect(total).toBeCloseTo(1.0, 5);
});

test('global biodiversity = weighted average', () => {
  let expected = 0;
  for (const [regionName, region] of system.regions) {
    const weight = system.regionalWeights.get(regionName) || 0;
    expected += region.biodiversityIndex * weight;
  }
  expect(system.globalBiodiversityIndex).toBeCloseTo(expected, 5);
});

// Test 2: Regional changes
const system2 = initializeRegionalBiodiversitySystem();
const initialGlobal = system2.globalBiodiversityIndex;
const asia = system2.regions.get('Asia')!;
asia.biodiversityIndex = 0.3; // Damage Asia
recalculateGlobalBiodiversity(system2);

test('regional change updates global', () => {
  expect(system2.globalBiodiversityIndex).toBeLessThan(initialGlobal);
});

test('regional change is isolated', () => {
  const sa = system2.regions.get('South America')!;
  expect(sa.biodiversityIndex).toBe(0.80); // Unchanged
});

// Test 3: Nuclear strike
const system3 = initializeRegionalBiodiversitySystem();
const initialAsia = system3.regions.get('Asia')!.biodiversityIndex;
const initialSA = system3.regions.get('South America')!.biodiversityIndex;

applyNuclearBiodiversityLoss(system3, 'Asia', 1.0);

test('nuclear strike damages target region', () => {
  const asiaAfter = system3.regions.get('Asia')!.biodiversityIndex;
  expect(asiaAfter).toBeLessThan(initialAsia);
});

test('nuclear strike does NOT affect other regions', () => {
  const saAfter = system3.regions.get('South America')!.biodiversityIndex;
  expect(saAfter).toBe(initialSA); // UNCHANGED
});

test('nuclear strike destroys ecosystem integrity', () => {
  const asiaAfter = system3.regions.get('Asia')!;
  expect(asiaAfter.ecosystemIntegrity).toBeLessThan(0.2); // Collapsed
});

test('nuclear strike adds contamination', () => {
  const asiaAfter = system3.regions.get('Asia')!;
  expect(asiaAfter.contaminationLevel).toBeGreaterThan(0.7); // High contamination
});

test('nuclear strike triggers ecosystem collapse', () => {
  const asiaAfter = system3.regions.get('Asia')!;
  expect(asiaAfter.ecosystemCollapseActive).toBe(true);
});

test('nuclear strike records extinction event', () => {
  expect(system3.regionalExtinctions.length).toBeGreaterThan(0);
  expect(system3.regionalExtinctions[0].region).toBe('Asia');
  expect(system3.regionalExtinctions[0].cause).toBe('nuclear');
});

// Test 4: Multiple strikes
const system4 = initializeRegionalBiodiversitySystem();
applyNuclearBiodiversityLoss(system4, 'North America', 1.0);
applyNuclearBiodiversityLoss(system4, 'Europe', 1.0);
applyNuclearBiodiversityLoss(system4, 'Asia', 0.5);

test('multiple strikes damage independently', () => {
  const na = system4.regions.get('North America')!;
  const eu = system4.regions.get('Europe')!;
  const asia = system4.regions.get('Asia')!;
  const sa = system4.regions.get('South America')!;

  expect(na.biodiversityIndex).toBeLessThan(0.2); // Heavy damage
  expect(eu.biodiversityIndex).toBeLessThan(0.2); // Heavy damage
  expect(asia.biodiversityIndex).toBeGreaterThan(0.3); // Moderate damage
  expect(sa.biodiversityIndex).toBe(0.80); // UNTOUCHED
});

// Test 5: Nation mapping
test('US maps to North America', () => {
  expect(getRegionFromNation('United States')).toBe('North America');
});

test('Russia maps to Asia', () => {
  expect(getRegionFromNation('Russia')).toBe('Asia');
});

test('France maps to Europe', () => {
  expect(getRegionFromNation('France')).toBe('Europe');
});

test('Brazil maps to South America', () => {
  expect(getRegionFromNation('Brazil')).toBe('South America');
});

test('Unknown nation defaults to Asia', () => {
  expect(getRegionFromNation('Unknown')).toBe('Asia');
});

// Summary
console.log(`\n=== SUMMARY ===`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`Total: ${passed + failed}\n`);

if (failed > 0) {
  process.exit(1);
}
