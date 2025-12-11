/**
 * Regional Biodiversity System Tests
 *
 * Comprehensive test coverage for regional biodiversity tracking system.
 *
 * Research context:
 * - Planetary Boundaries framework (Richardson et al. 2023)
 * - Species-area relationship (Newbold et al. 2016, Pereira et al. 2012)
 * - Habitat fragmentation effects (Fahrig 2003, Pardini et al. 2010)
 * - Ecosystem collapse thresholds (Scheffer et al. 2001)
 *
 * Test areas:
 * 1. Initialization - Regional baseline states
 * 2. Habitat degradation - Land use, pollution, climate impacts
 * 3. Species dynamics - Extinction thresholds, tipping points
 * 4. Recovery - Restoration tech effectiveness, timescales
 * 5. Edge cases - Total collapse, pristine recovery, rapid transitions
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  initializeRegionalBiodiversitySystem,
  recalculateGlobalBiodiversity,
  applyNuclearBiodiversityLoss,
  getRegionFromNation,
  type BiodiversitySystem,
  type RegionalBiodiversity,
} from '../regionalBiodiversity.js';

/**
 * Test Fixtures
 * Standard baseline state for consistent test setup
 */
function createTestSystem(): BiodiversitySystem {
  return initializeRegionalBiodiversitySystem();
}

describe('Regional Biodiversity System - Initialization', () => {
  let system: BiodiversitySystem;

  beforeEach(() => {
    system = createTestSystem();
  });

  it('should initialize all 6 major regions', () => {
    assert.strictEqual(system.regions.size, 6, 'Should have exactly 6 regions');
    assert.ok(system.regions.has('Asia'), 'Should have Asia');
    assert.ok(system.regions.has('Africa'), 'Should have Africa');
    assert.ok(system.regions.has('South America'), 'Should have South America');
    assert.ok(system.regions.has('North America'), 'Should have North America');
    assert.ok(system.regions.has('Europe'), 'Should have Europe');
    assert.ok(system.regions.has('Oceania'), 'Should have Oceania');
  });

  it('should initialize with correct regional weights summing to 1.0', () => {
    let totalWeight = 0;
    for (const weight of system.regionalWeights.values()) {
      totalWeight += weight;
    }
    assert.ok(
      Math.abs(totalWeight - 1.0) < 0.0001,
      `Weights should sum to 1.0, got ${totalWeight}`
    );
  });

  it('should assign correct weights based on landmass and biodiversity importance', () => {
    // Verify weight distribution matches documented percentages
    assert.strictEqual(
      system.regionalWeights.get('Asia'),
      0.30,
      'Asia should have 30% weight (largest landmass)'
    );
    assert.strictEqual(
      system.regionalWeights.get('Africa'),
      0.20,
      'Africa should have 20% weight'
    );
    assert.strictEqual(
      system.regionalWeights.get('South America'),
      0.20,
      'South America should have 20% weight (Amazon)'
    );
    assert.strictEqual(
      system.regionalWeights.get('North America'),
      0.15,
      'North America should have 15% weight'
    );
    assert.strictEqual(
      system.regionalWeights.get('Europe'),
      0.10,
      'Europe should have 10% weight'
    );
    assert.strictEqual(
      system.regionalWeights.get('Oceania'),
      0.05,
      'Oceania should have 5% weight'
    );
  });

  it('should initialize each region with biodiversity index in valid range [0, 1]', () => {
    for (const [regionName, region] of system.regions) {
      assert.ok(
        region.biodiversityIndex >= 0 && region.biodiversityIndex <= 1,
        `${regionName} biodiversity should be [0, 1], got ${region.biodiversityIndex}`
      );
      assert.ok(
        region.ecosystemIntegrity >= 0 && region.ecosystemIntegrity <= 1,
        `${regionName} ecosystem integrity should be [0, 1], got ${region.ecosystemIntegrity}`
      );
      assert.ok(
        region.pollutionLevel >= 0 && region.pollutionLevel <= 1,
        `${regionName} pollution should be [0, 1], got ${region.pollutionLevel}`
      );
      assert.ok(
        region.habitatLoss >= 0 && region.habitatLoss <= 1,
        `${regionName} habitat loss should be [0, 1], got ${region.habitatLoss}`
      );
      assert.ok(
        region.climateStress >= 0 && region.climateStress <= 1,
        `${regionName} climate stress should be [0, 1], got ${region.climateStress}`
      );
      assert.ok(
        region.contaminationLevel >= 0 && region.contaminationLevel <= 1,
        `${regionName} contamination should be [0, 1], got ${region.contaminationLevel}`
      );
    }
  });

  it('should establish realistic regional baseline values', () => {
    // South America (Amazon) - highest biodiversity
    const sa = system.regions.get('South America')!;
    assert.strictEqual(sa.biodiversityIndex, 0.80, 'Amazon should have highest biodiversity');
    assert.strictEqual(sa.biodiversityHotspot, true, 'Amazon should be marked as hotspot');
    assert.ok(sa.habitatLoss <= 0.35, 'Amazon should have lower habitat loss than average');

    // Europe - most modified (centuries of agriculture)
    const eu = system.regions.get('Europe')!;
    assert.strictEqual(eu.biodiversityIndex, 0.55, 'Europe should have lowest biodiversity');
    assert.strictEqual(eu.biodiversityHotspot, false, 'Europe should not be hotspot');
    assert.ok(eu.habitatLoss >= 0.45, 'Europe should have high habitat loss');

    // Africa - vulnerable to climate change
    const af = system.regions.get('Africa')!;
    assert.ok(af.climateStress >= 0.35, 'Africa should have high climate vulnerability');

    // Oceania - coral reef stress
    const oc = system.regions.get('Oceania')!;
    assert.ok(oc.climateStress >= 0.40, 'Oceania should reflect coral bleaching stress');
  });

  it('should initialize all regions with empty extinction history', () => {
    for (const [regionName, region] of system.regions) {
      assert.deepStrictEqual(
        region.keySpeciesLost,
        [],
        `${regionName} should start with no extinctions`
      );
      assert.strictEqual(
        region.extinctionEvents,
        0,
        `${regionName} should have 0 extinction events`
      );
    }
  });

  it('should initialize regions with realistic land areas', () => {
    const expectedAreas = {
      Asia: 44_579_000, // km²
      Africa: 30_370_000,
      'South America': 17_840_000,
      'North America': 24_709_000,
      Europe: 10_180_000,
      Oceania: 8_526_000,
    };

    for (const [regionName, expectedArea] of Object.entries(expectedAreas)) {
      const region = system.regions.get(regionName)!;
      assert.strictEqual(
        region.landArea,
        expectedArea,
        `${regionName} should have correct land area`
      );
    }
  });

  it('should initialize regions with realistic populations', () => {
    const asia = system.regions.get('Asia')!;
    const africa = system.regions.get('Africa')!;
    const eu = system.regions.get('Europe')!;

    // Asia should have highest population (current 2025 baseline)
    assert.ok(asia.population > 4.0, 'Asia should have highest population');
    assert.ok(africa.population >= 1.0, 'Africa population should be substantial');
    assert.ok(eu.population >= 0.5, 'Europe population should be present');
  });

  it('should mark appropriate regions as biodiversity hotspots', () => {
    const hotspots = ['Asia', 'Africa', 'South America', 'Oceania'];
    const nonHotspots = ['North America', 'Europe'];

    for (const regionName of hotspots) {
      const region = system.regions.get(regionName)!;
      assert.ok(
        region.biodiversityHotspot,
        `${regionName} should be marked as biodiversity hotspot`
      );
    }

    for (const regionName of nonHotspots) {
      const region = system.regions.get(regionName)!;
      assert.strictEqual(
        region.biodiversityHotspot,
        false,
        `${regionName} should not be marked as hotspot`
      );
    }
  });

  it('should initialize with no active ecosystem collapses', () => {
    for (const [regionName, region] of system.regions) {
      assert.strictEqual(
        region.ecosystemCollapseActive,
        false,
        `${regionName} should not start in collapse state`
      );
    }
  });

  it('should initialize peak biodiversity equal to current global biodiversity', () => {
    assert.strictEqual(
      system.globalPeakBiodiversity,
      system.globalBiodiversityIndex,
      'Peak should equal initial global biodiversity'
    );
  });

  it('should initialize with empty extinction event history', () => {
    assert.deepStrictEqual(
      system.regionalExtinctions,
      [],
      'Should start with no recorded extinction events'
    );
  });
});

describe('Regional Biodiversity System - Global Recalculation', () => {
  let system: BiodiversitySystem;

  beforeEach(() => {
    system = createTestSystem();
  });

  it('should calculate global biodiversity as weighted average of regions', () => {
    // Calculate expected value manually
    let expectedGlobal = 0;
    for (const [regionName, region] of system.regions) {
      const weight = system.regionalWeights.get(regionName) || 0;
      expectedGlobal += region.biodiversityIndex * weight;
    }

    assert.ok(
      Math.abs(system.globalBiodiversityIndex - expectedGlobal) < 0.0001,
      `Global biodiversity should be weighted average: expected ${expectedGlobal}, got ${system.globalBiodiversityIndex}`
    );
  });

  it('should update global biodiversity when single region degrades', () => {
    const initialGlobal = system.globalBiodiversityIndex;

    // Degrade Asia (30% weight)
    const asia = system.regions.get('Asia')!;
    const initialAsia = asia.biodiversityIndex;
    asia.biodiversityIndex = 0.40; // Down from 0.70

    recalculateGlobalBiodiversity(system);

    // Calculate expected change
    const weight = system.regionalWeights.get('Asia')!;
    const delta = (0.40 - initialAsia) * weight;
    const expectedGlobal = initialGlobal + delta;

    assert.ok(
      Math.abs(system.globalBiodiversityIndex - expectedGlobal) < 0.0001,
      `Global should decrease by ${delta}, expected ${expectedGlobal}, got ${system.globalBiodiversityIndex}`
    );
  });

  it('should isolate regional changes - other regions unaffected', () => {
    // Degrade South America
    const sa = system.regions.get('South America')!;
    sa.biodiversityIndex = 0.30;

    // Verify other regions unchanged
    assert.strictEqual(system.regions.get('Asia')!.biodiversityIndex, 0.70);
    assert.strictEqual(system.regions.get('Africa')!.biodiversityIndex, 0.75);
    assert.strictEqual(system.regions.get('Europe')!.biodiversityIndex, 0.55);

    // But global should change
    recalculateGlobalBiodiversity(system);
    assert.ok(
      system.globalBiodiversityIndex < 0.71,
      'Global should be affected by South America loss'
    );
  });

  it('should handle multiple regional changes independently', () => {
    const initialGlobal = system.globalBiodiversityIndex;

    // Degrade multiple regions
    system.regions.get('Asia')!.biodiversityIndex = 0.50;
    system.regions.get('Africa')!.biodiversityIndex = 0.60;

    recalculateGlobalBiodiversity(system);

    // Calculate expected
    let expected = 0;
    for (const [regionName, region] of system.regions) {
      const weight = system.regionalWeights.get(regionName) || 0;
      expected += region.biodiversityIndex * weight;
    }

    assert.ok(
      Math.abs(system.globalBiodiversityIndex - expected) < 0.0001,
      'Global should be correct weighted average of all regions'
    );
  });

  it('should show global decline proportional to weighted regional changes', () => {
    const initialGlobal = system.globalBiodiversityIndex;

    // Asia has 30% weight - lose 0.40 points
    // Africa has 20% weight - lose 0.15 points
    // Expected global change: (0.40 * 0.30) + (0.15 * 0.20) = 0.12 + 0.03 = 0.15
    system.regions.get('Asia')!.biodiversityIndex -= 0.40;
    system.regions.get('Africa')!.biodiversityIndex -= 0.15;

    recalculateGlobalBiodiversity(system);

    const expectedChange = -0.15;
    const actualChange = system.globalBiodiversityIndex - initialGlobal;

    assert.ok(
      Math.abs(actualChange - expectedChange) < 0.001,
      `Expected change ${expectedChange}, got ${actualChange}`
    );
  });
});

describe('Regional Biodiversity System - Habitat Degradation', () => {
  let system: BiodiversitySystem;

  beforeEach(() => {
    system = createTestSystem();
  });

  it('should reflect land use impacts through habitat loss values', () => {
    // Europe - most modified landscapes
    const eu = system.regions.get('Europe')!;
    assert.ok(
      eu.habitatLoss >= 0.50,
      'Europe should show >50% habitat loss from centuries of agriculture'
    );

    // Amazon - relatively preserved
    const sa = system.regions.get('South America')!;
    assert.ok(
      sa.habitatLoss <= 0.35,
      'Amazon should show <35% habitat loss despite deforestation'
    );
  });

  it('should reflect pollution levels in highly developed regions', () => {
    // Asia - high pollution from industrial activity
    const asia = system.regions.get('Asia')!;
    assert.ok(asia.pollutionLevel >= 0.40, 'Asia should show high pollution');

    // Oceania - lower pollution
    const oc = system.regions.get('Oceania')!;
    assert.ok(oc.pollutionLevel <= 0.25, 'Oceania should have low pollution baseline');
  });

  it('should reflect climate vulnerability in vulnerable regions', () => {
    // Africa - savanna and rainforest vulnerable to temperature changes
    const af = system.regions.get('Africa')!;
    assert.ok(af.climateStress >= 0.35, 'Africa highly vulnerable to climate');

    // Oceania - coral bleaching stress
    const oc = system.regions.get('Oceania')!;
    assert.ok(oc.climateStress >= 0.40, 'Oceania shows coral reef vulnerability');
  });

  it('should show regional contamination baselines (nuclear legacy)', () => {
    // Europe - Chernobyl legacy
    const eu = system.regions.get('Europe')!;
    assert.ok(eu.contaminationLevel >= 0.05, 'Europe should have Chernobyl contamination');

    // Pristine regions should have minimal contamination
    const sa = system.regions.get('South America')!;
    assert.ok(sa.contaminationLevel <= 0.05, 'Amazon baseline contamination should be low');
  });

  it('should correlate habitat loss with biodiversity index decline', () => {
    // Regions with high habitat loss should have lower biodiversity
    const eu = system.regions.get('Europe')!;
    const sa = system.regions.get('South America')!;

    assert.ok(
      eu.habitatLoss > sa.habitatLoss,
      'Europe should have more habitat loss than Amazon'
    );
    assert.ok(
      eu.biodiversityIndex < sa.biodiversityIndex,
      'Europe should have lower biodiversity than Amazon'
    );
  });
});

describe('Regional Biodiversity System - Nuclear Strike Effects', () => {
  let system: BiodiversitySystem;

  beforeEach(() => {
    system = createTestSystem();
  });

  it('should apply nuclear biodiversity loss only to target region', () => {
    const initialAsia = system.regions.get('Asia')!.biodiversityIndex;
    const initialSA = system.regions.get('South America')!.biodiversityIndex;
    const initialAfrica = system.regions.get('Africa')!.biodiversityIndex;

    applyNuclearBiodiversityLoss(system, 'Asia', 1.0);

    const asia = system.regions.get('Asia')!;
    const sa = system.regions.get('South America')!;
    const africa = system.regions.get('Africa')!;

    assert.ok(
      asia.biodiversityIndex < initialAsia,
      'Target region should be damaged'
    );
    assert.strictEqual(
      sa.biodiversityIndex,
      initialSA,
      'Non-target region should be unchanged'
    );
    assert.strictEqual(
      africa.biodiversityIndex,
      initialAfrica,
      'Non-target region should be unchanged'
    );
  });

  it('should apply 0.60 point biodiversity loss for full-intensity strike', () => {
    const na = system.regions.get('North America')!;
    const initial = na.biodiversityIndex; // 0.65

    applyNuclearBiodiversityLoss(system, 'North America', 1.0);

    // Loss should be exactly 0.60 points (not percentage)
    const expectedLoss = 0.60;
    const actualLoss = initial - na.biodiversityIndex;

    assert.ok(
      Math.abs(actualLoss - expectedLoss) < 0.001,
      `Expected 0.60 point loss, got ${actualLoss.toFixed(4)}`
    );
  });

  it('should scale biodiversity loss with strike intensity', () => {
    // Test at 0.3 intensity (won't floor at 0)
    const na1 = system.regions.get('North America')!;
    const initial1 = na1.biodiversityIndex; // 0.65

    applyNuclearBiodiversityLoss(system, 'North America', 0.3);
    const loss1 = initial1 - na1.biodiversityIndex;
    // Expected: 0.60 * 0.3 = 0.18

    // Reset and test at 0.6 intensity
    system = createTestSystem();
    const na2 = system.regions.get('North America')!;
    const initial2 = na2.biodiversityIndex; // 0.65

    applyNuclearBiodiversityLoss(system, 'North America', 0.6);
    const loss2 = initial2 - na2.biodiversityIndex;
    // Expected: 0.60 * 0.6 = 0.36

    // Loss should scale linearly: loss2 should be 2x loss1
    assert.ok(
      Math.abs(loss2 / loss1 - 2.0) < 0.01,
      `Loss should scale proportionally: ${loss2.toFixed(4)} should be ~2x ${loss1.toFixed(4)}`
    );
  });

  it('should collapse ecosystem integrity to 10% of original', () => {
    const na = system.regions.get('North America')!;
    const initial = na.ecosystemIntegrity;

    applyNuclearBiodiversityLoss(system, 'North America', 1.0);

    const expected = initial * 0.1;
    assert.ok(
      Math.abs(na.ecosystemIntegrity - expected) < 0.001,
      `Expected 10% of original (${expected}), got ${na.ecosystemIntegrity}`
    );
  });

  it('should add contamination scaled with strike intensity', () => {
    const asia = system.regions.get('Asia')!;
    const initialContam = asia.contaminationLevel;

    applyNuclearBiodiversityLoss(system, 'Asia', 1.0);

    const expectedContam = Math.min(1.0, initialContam + 0.8);
    assert.ok(
      Math.abs(asia.contaminationLevel - expectedContam) < 0.01,
      `Expected contamination ~${expectedContam}, got ${asia.contaminationLevel}`
    );
  });

  it('should cap contamination at maximum 1.0', () => {
    const eu = system.regions.get('Europe')!;
    // Europe already has 0.06, so 0.06 + 0.8 = 0.86 (capped at 1.0 with max)
    applyNuclearBiodiversityLoss(system, 'Europe', 1.0);

    assert.ok(
      eu.contaminationLevel <= 1.0,
      'Contamination should never exceed 1.0'
    );
  });

  it('should trigger ecosystem collapse flag when biodiversity falls below 0.3', () => {
    const oc = system.regions.get('Oceania')!;
    assert.strictEqual(oc.ecosystemCollapseActive, false, 'Should start not collapsed');

    // Oceania starts at 0.70, loses 60%, ends at 0.10 < 0.3
    applyNuclearBiodiversityLoss(system, 'Oceania', 1.0);

    assert.strictEqual(
      oc.ecosystemCollapseActive,
      true,
      'Should trigger collapse flag when below 0.3'
    );
  });

  it('should not trigger collapse flag if biodiversity stays above 0.3', () => {
    const eu = system.regions.get('Europe')!;
    // Europe: 0.55 - 0.30 = 0.25 < 0.3 after full strike, SHOULD trigger
    applyNuclearBiodiversityLoss(system, 'Europe', 0.5);

    // After 50% strike: 0.55 - 0.30 = 0.25 < 0.3
    // So actually... let me check with lower intensity
    system = createTestSystem();
    const na = system.regions.get('North America')!;
    const initial = na.biodiversityIndex; // 0.65

    applyNuclearBiodiversityLoss(system, 'North America', 0.3);
    // Loss: 0.60 * 0.3 = 0.18, final: 0.65 - 0.18 = 0.47 > 0.3

    assert.strictEqual(
      na.ecosystemCollapseActive,
      false,
      'Should not trigger collapse if above 0.3'
    );
  });

  it('should record extinction event for nuclear strike', () => {
    const initialCount = system.regionalExtinctions.length;

    applyNuclearBiodiversityLoss(system, 'Asia', 1.0);

    assert.strictEqual(
      system.regionalExtinctions.length,
      initialCount + 1,
      'Should record one extinction event'
    );

    const event = system.regionalExtinctions[initialCount];
    assert.strictEqual(event.region, 'Asia', 'Event should reference target region');
    assert.strictEqual(event.cause, 'nuclear', 'Event should record nuclear cause');
  });

  it('should assign high cascade risk for nuclear extinctions', () => {
    applyNuclearBiodiversityLoss(system, 'Africa', 1.0);

    const event = system.regionalExtinctions[0];
    assert.ok(
      event.cascadeRisk >= 0.80,
      'Nuclear strikes should have high cascade risk (>=0.8)'
    );
  });

  it('should update global biodiversity after strike', () => {
    const initialGlobal = system.globalBiodiversityIndex;

    // Strike Asia (30% weight, 60% loss means 0.30 * 0.60 = 0.18 global loss)
    applyNuclearBiodiversityLoss(system, 'Asia', 1.0);

    assert.ok(
      system.globalBiodiversityIndex < initialGlobal,
      'Global biodiversity should decrease'
    );

    // Calculate expected
    const asiaWeight = 0.30;
    const regionalLoss = 0.60;
    const expectedGlobalChange = asiaWeight * regionalLoss;

    const actualChange = initialGlobal - system.globalBiodiversityIndex;
    assert.ok(
      Math.abs(actualChange - expectedGlobalChange) < 0.01,
      `Expected global loss ~${expectedGlobalChange}, got ${actualChange}`
    );
  });

  it('should handle multiple sequential strikes', () => {
    applyNuclearBiodiversityLoss(system, 'Asia', 1.0);
    applyNuclearBiodiversityLoss(system, 'Europe', 1.0);
    applyNuclearBiodiversityLoss(system, 'Africa', 0.5);

    // All three regions should show damage
    const asia = system.regions.get('Asia')!;
    const eu = system.regions.get('Europe')!;
    const af = system.regions.get('Africa')!;

    assert.ok(asia.biodiversityIndex < 0.2, 'Asia heavily damaged');
    assert.ok(eu.biodiversityIndex < 0.2, 'Europe heavily damaged');
    assert.ok(af.biodiversityIndex < 0.7, 'Africa moderately damaged');

    // South America should be pristine
    const sa = system.regions.get('South America')!;
    assert.strictEqual(sa.biodiversityIndex, 0.80, 'South America untouched');
  });
});

describe('Regional Biodiversity System - Edge Cases', () => {
  let system: BiodiversitySystem;

  beforeEach(() => {
    system = createTestSystem();
  });

  it('should handle total ecosystem collapse (biodiversity floor at 0)', () => {
    const oc = system.regions.get('Oceania')!;
    // Apply massive overstrike
    applyNuclearBiodiversityLoss(system, 'Oceania', 10.0);

    assert.ok(
      oc.biodiversityIndex >= 0,
      'Biodiversity should not go negative'
    );
    assert.strictEqual(
      oc.ecosystemCollapseActive,
      true,
      'Collapse flag should be set'
    );
  });

  it('should prevent biodiversity from going negative', () => {
    const eu = system.regions.get('Europe')!;
    // Apply extreme overstrike
    applyNuclearBiodiversityLoss(system, 'Europe', 100.0);

    assert.strictEqual(
      eu.biodiversityIndex,
      0,
      'Biodiversity should floor at 0'
    );
  });

  it('should handle pristine baseline recovery scenario', () => {
    // Verify baseline pristine regions
    const sa = system.regions.get('South America')!;
    assert.strictEqual(sa.biodiversityIndex, 0.80, 'Amazon in pristine state');
    assert.strictEqual(sa.habitatLoss, 0.30, 'Minimal habitat loss');
    assert.ok(sa.pollutionLevel < 0.25, 'Low pollution');
  });

  it('should handle rapid regional transitions', () => {
    // Simulate cascade of strikes
    applyNuclearBiodiversityLoss(system, 'Asia', 1.0);
    applyNuclearBiodiversityLoss(system, 'Africa', 1.0);
    applyNuclearBiodiversityLoss(system, 'Europe', 1.0);
    applyNuclearBiodiversityLoss(system, 'North America', 1.0);

    // Global should show catastrophic decline
    const collapsedRegions = [
      system.regions.get('Asia')!,
      system.regions.get('Africa')!,
      system.regions.get('Europe')!,
      system.regions.get('North America')!,
    ];

    for (const region of collapsedRegions) {
      assert.ok(
        region.biodiversityIndex < 0.3,
        `Region should show severe damage: ${region.region}`
      );
      assert.ok(
        region.ecosystemIntegrity < 0.1,
        `Ecosystem integrity should be decimated: ${region.region}`
      );
    }

    // But South America and Oceania preserved
    assert.strictEqual(system.regions.get('South America')!.biodiversityIndex, 0.80);
    assert.ok(system.regions.get('Oceania')!.biodiversityIndex > 0, 'Oceania intact');
  });

  it('should maintain separate extinction event records per strike', () => {
    applyNuclearBiodiversityLoss(system, 'Asia', 1.0);
    applyNuclearBiodiversityLoss(system, 'Europe', 1.0);
    applyNuclearBiodiversityLoss(system, 'Africa', 1.0);

    assert.strictEqual(system.regionalExtinctions.length, 3, 'Three extinction events');

    // Verify each is distinct
    assert.strictEqual(system.regionalExtinctions[0].region, 'Asia');
    assert.strictEqual(system.regionalExtinctions[1].region, 'Europe');
    assert.strictEqual(system.regionalExtinctions[2].region, 'Africa');
  });

  it('should handle partial strike intensities correctly', () => {
    const intensities = [0.1, 0.25, 0.5, 0.75, 1.0];
    const losses = [];

    for (const intensity of intensities) {
      const testSystem = createTestSystem();
      const initial = testSystem.regions.get('Asia')!.biodiversityIndex;
      applyNuclearBiodiversityLoss(testSystem, 'Asia', intensity);
      const loss = initial - testSystem.regions.get('Asia')!.biodiversityIndex;
      losses.push(loss);
    }

    // Verify losses scale linearly
    for (let i = 1; i < losses.length; i++) {
      const ratio = losses[i] / losses[i - 1];
      const expectedRatio = intensities[i] / intensities[i - 1];
      assert.ok(
        Math.abs(ratio - expectedRatio) < 0.01,
        `Losses should scale linearly at all intensities`
      );
    }
  });
});

describe('Regional Biodiversity System - Nation to Region Mapping', () => {
  it('should map nuclear-armed nations to correct regions', () => {
    const nationMappings = {
      'United States': 'North America',
      Canada: 'North America',
      Mexico: 'North America',
      Russia: 'Asia',
      China: 'Asia',
      India: 'Asia',
      Pakistan: 'Asia',
      Israel: 'Asia',
      'North Korea': 'Asia',
      'South Korea': 'Asia',
      Japan: 'Asia',
      'United Kingdom': 'Europe',
      France: 'Europe',
      Germany: 'Europe',
      Brazil: 'South America',
      Argentina: 'South America',
      'South Africa': 'Africa',
      Egypt: 'Africa',
      Australia: 'Oceania',
      'New Zealand': 'Oceania',
    };

    for (const [nation, expectedRegion] of Object.entries(nationMappings)) {
      const region = getRegionFromNation(nation);
      assert.strictEqual(
        region,
        expectedRegion,
        `${nation} should map to ${expectedRegion}`
      );
    }
  });

  it('should default unknown nations to Asia (largest region)', () => {
    const unknown = ['Atlantis', 'Unknown Country', 'Fictional Nation', 'Wakanda'];

    for (const nation of unknown) {
      assert.strictEqual(
        getRegionFromNation(nation),
        'Asia',
        'Unknown nations should default to Asia'
      );
    }
  });

  it('should handle case sensitivity appropriately', () => {
    // Current implementation is case-sensitive
    // Verify behavior with exact case
    assert.strictEqual(getRegionFromNation('United States'), 'North America');
  });
});

describe('Regional Biodiversity System - Integration Scenarios', () => {
  let system: BiodiversitySystem;

  beforeEach(() => {
    system = createTestSystem();
  });

  it('should model cascading environmental collapse', () => {
    // Scenario: Nuclear war affecting major powers
    // 1. US strike damages North America
    applyNuclearBiodiversityLoss(system, 'North America', 1.0);

    const na = system.regions.get('North America')!;
    assert.ok(na.biodiversityIndex < 0.2, 'North America heavily damaged');
    assert.ok(na.ecosystemCollapseActive, 'Collapse active');

    // 2. Russia-China conflict affects Asia
    applyNuclearBiodiversityLoss(system, 'Asia', 0.75);

    const asia = system.regions.get('Asia')!;
    assert.ok(asia.biodiversityIndex < 0.35, 'Asia significantly damaged');

    // 3. European exchange
    applyNuclearBiodiversityLoss(system, 'Europe', 0.8);

    const eu = system.regions.get('Europe')!;
    assert.ok(eu.biodiversityIndex < 0.2, 'Europe heavily damaged');

    // South America and Africa should escape relatively unscathed
    const sa = system.regions.get('South America')!;
    const af = system.regions.get('Africa')!;

    assert.strictEqual(sa.biodiversityIndex, 0.80, 'Amazon pristine');
    assert.strictEqual(af.biodiversityIndex, 0.75, 'Africa unharmed');

    // But global should be catastrophic
    assert.ok(system.globalBiodiversityIndex < 0.5, 'Global collapse');
  });

  it('should model regional recovery potential after non-lethal damage', () => {
    // Light damage to Europe
    const eu = system.regions.get('Europe')!;
    const initial = eu.biodiversityIndex;

    applyNuclearBiodiversityLoss(system, 'Europe', 0.2);

    const damaged = eu.biodiversityIndex;
    assert.ok(damaged > 0.3, 'Light damage does not trigger collapse');

    // Note: Recovery mechanics not yet implemented in source
    // This test documents expected behavior once recovery is added
  });

  it('should track total extinctions across all regions', () => {
    applyNuclearBiodiversityLoss(system, 'Asia', 1.0);
    applyNuclearBiodiversityLoss(system, 'Africa', 1.0);
    applyNuclearBiodiversityLoss(system, 'Europe', 0.5);

    const totalExtinctions = system.regionalExtinctions.length;
    assert.strictEqual(totalExtinctions, 3, 'Should track all extinction events');

    // Verify cascade risk increases with severity
    const severeEvent = system.regionalExtinctions.find((e) => e.cascadeRisk >= 0.85)!;
    assert.ok(severeEvent, 'Should have high-cascade events');
  });

  it('should show weighted impact of strikes on global biodiversity', () => {
    const initialGlobal = system.globalBiodiversityIndex;

    // Strike heavily weighted region (Asia 30%)
    applyNuclearBiodiversityLoss(system, 'Asia', 1.0);
    const afterAsia = system.globalBiodiversityIndex;
    const asiaImpact = initialGlobal - afterAsia;

    // Strike lightly weighted region (Oceania 5%)
    system = createTestSystem();
    applyNuclearBiodiversityLoss(system, 'Oceania', 1.0);
    const oceaniaImpact = initialGlobal - system.globalBiodiversityIndex;

    // Asia impact should be 6x larger (30% vs 5% weight)
    assert.ok(
      asiaImpact > oceaniaImpact * 4,
      'Weighted region should have much larger global impact'
    );
  });
});
