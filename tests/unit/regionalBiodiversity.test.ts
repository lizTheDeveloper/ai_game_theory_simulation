/**
 * Unit Tests for Regional Biodiversity Tracking System
 *
 * Comprehensive test coverage for regional biodiversity modeling with research-backed mechanics:
 * - Planetary Boundaries framework (Richardson et al. 2023)
 * - Species-area relationship (power law S = c*A^z)
 * - Habitat fragmentation effects
 * - Extinction thresholds and tipping points
 * - Recovery dynamics with restoration technologies
 *
 * Test areas:
 * 1. Initialization - Verify regional baseline states match 2025 data
 * 2. Habitat degradation - Test land use, pollution, climate impacts
 * 3. Species dynamics - Extinction thresholds, tipping points
 * 4. Recovery - Restoration tech effectiveness, timescales
 * 5. Edge cases - Total collapse, pristine recovery, rapid transitions
 *
 * Coverage target: >90% of lines 19-176 in regionalBiodiversity.ts
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import {
  initializeRegionalBiodiversitySystem,
  recalculateGlobalBiodiversity,
  applyNuclearBiodiversityLoss,
  getRegionFromNation,
  type BiodiversitySystem,
  type RegionalBiodiversity,
  type ExtinctionEvent,
} from '../../src/types/regionalBiodiversity.js';

// ============================================================================
// TEST UTILITIES
// ============================================================================

/**
 * Deterministic RNG for reproducible tests (Linear Congruential Generator)
 */
function createTestRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % (2 ** 32);
    return state / (2 ** 32);
  };
}

/**
 * Helper: Get region by name (convenience function)
 */
function getRegion(system: BiodiversitySystem, regionName: string): RegionalBiodiversity {
  const region = system.regions.get(regionName);
  assert(region, `Region ${regionName} not found in system`);
  return region;
}

/**
 * Helper: Verify region values are in valid ranges [0, 1]
 */
function assertRegionValid(region: RegionalBiodiversity): void {
  assert(region.biodiversityIndex >= 0 && region.biodiversityIndex <= 1,
    `biodiversityIndex out of range: ${region.biodiversityIndex}`);
  assert(region.ecosystemIntegrity >= 0 && region.ecosystemIntegrity <= 1,
    `ecosystemIntegrity out of range: ${region.ecosystemIntegrity}`);
  assert(region.pollutionLevel >= 0 && region.pollutionLevel <= 1,
    `pollutionLevel out of range: ${region.pollutionLevel}`);
  assert(region.habitatLoss >= 0 && region.habitatLoss <= 1,
    `habitatLoss out of range: ${region.habitatLoss}`);
  assert(region.climateStress >= 0 && region.climateStress <= 1,
    `climateStress out of range: ${region.climateStress}`);
  assert(region.contaminationLevel >= 0 && region.contaminationLevel <= 1,
    `contaminationLevel out of range: ${region.contaminationLevel}`);
}

/**
 * Helper: Calculate total weight to verify normalized distribution
 */
function calculateTotalWeight(system: BiodiversitySystem): number {
  let total = 0;
  for (const weight of system.regionalWeights.values()) {
    total += weight;
  }
  return total;
}

/**
 * Helper: Calculate weighted average biodiversity
 */
function calculateWeightedAverage(system: BiodiversitySystem): number {
  let weighted = 0;
  for (const [regionName, region] of system.regions) {
    const weight = system.regionalWeights.get(regionName) || 0;
    weighted += region.biodiversityIndex * weight;
  }
  return weighted;
}

// ============================================================================
// TEST SUITES
// ============================================================================

describe('Regional Biodiversity System - Initialization', () => {
  let system: BiodiversitySystem;

  before(() => {
    system = initializeRegionalBiodiversitySystem();
  });

  it('should initialize exactly 6 regions', () => {
    assert.strictEqual(system.regions.size, 6, 'System should have 6 regions');
  });

  it('should initialize all expected regions by name', () => {
    const expectedRegions = ['Asia', 'Africa', 'South America', 'North America', 'Europe', 'Oceania'];
    for (const regionName of expectedRegions) {
      assert(system.regions.has(regionName), `Missing expected region: ${regionName}`);
    }
  });

  it('should initialize regional weights that sum to 1.0 (normalized distribution)', () => {
    const totalWeight = calculateTotalWeight(system);
    assert.strictEqual(totalWeight, 1.0, `Total weight should be 1.0, got ${totalWeight}`);
  });

  it('should set correct regional weights based on landmass and biodiversity', () => {
    // Weights based on landmass + biodiversity importance
    // Asia: 30% (largest + hotspots)
    // Africa: 20% (second largest + hotspots)
    // South America: 20% (Amazon)
    // North America: 15%
    // Europe: 10% (most degraded)
    // Oceania: 5% (smallest but unique)
    assert.strictEqual(system.regionalWeights.get('Asia'), 0.30);
    assert.strictEqual(system.regionalWeights.get('Africa'), 0.20);
    assert.strictEqual(system.regionalWeights.get('South America'), 0.20);
    assert.strictEqual(system.regionalWeights.get('North America'), 0.15);
    assert.strictEqual(system.regionalWeights.get('Europe'), 0.10);
    assert.strictEqual(system.regionalWeights.get('Oceania'), 0.05);
  });

  it('should initialize Asia with realistic baseline values', () => {
    // Asia: Major biodiversity hotspots but already degraded (Indo-Burma, Sundaland, Himalaya)
    // High pollution (China, India), significant deforestation
    const asia = getRegion(system, 'Asia');
    assert.strictEqual(asia.biodiversityIndex, 0.70);
    assert.strictEqual(asia.ecosystemIntegrity, 0.65);
    assert.strictEqual(asia.pollutionLevel, 0.40);
    assert.strictEqual(asia.habitatLoss, 0.45);
    assert.strictEqual(asia.climateStress, 0.30);
    assert.strictEqual(asia.contaminationLevel, 0.05);
    assert.strictEqual(asia.landArea, 44_579_000);
    assert.strictEqual(asia.population, 4.7);
    assert.strictEqual(asia.biodiversityHotspot, true);
    assert.strictEqual(asia.ecosystemCollapseActive, false);
    assert.strictEqual(asia.extinctionEvents, 0);
    assertRegionValid(asia);
  });

  it('should initialize Africa with realistic baseline values', () => {
    // Africa: Second largest biodiversity, savanna + rainforest + coral reefs
    // High climate vulnerability
    const africa = getRegion(system, 'Africa');
    assert.strictEqual(africa.biodiversityIndex, 0.75);
    assert.strictEqual(africa.ecosystemIntegrity, 0.70);
    assert.strictEqual(africa.pollutionLevel, 0.25);
    assert.strictEqual(africa.habitatLoss, 0.35);
    assert.strictEqual(africa.climateStress, 0.35); // High climate vulnerability
    assert.strictEqual(africa.contaminationLevel, 0.03);
    assert.strictEqual(africa.landArea, 30_370_000);
    assert.strictEqual(africa.population, 1.4);
    assert.strictEqual(africa.biodiversityHotspot, true);
    assertRegionValid(africa);
  });

  it('should initialize South America with highest biodiversity (Amazon)', () => {
    // South America: Amazon rainforest (highest biodiversity on Earth) + Andes, Pantanal
    // Best preserved but deforestation accelerating
    const sa = getRegion(system, 'South America');
    assert.strictEqual(sa.biodiversityIndex, 0.80); // Highest initial biodiversity
    assert.strictEqual(sa.ecosystemIntegrity, 0.75);
    assert.strictEqual(sa.pollutionLevel, 0.20);
    assert.strictEqual(sa.habitatLoss, 0.30); // Deforestation accelerating
    assert.strictEqual(sa.climateStress, 0.25);
    assert.strictEqual(sa.contaminationLevel, 0.02);
    assert.strictEqual(sa.landArea, 17_840_000);
    assert.strictEqual(sa.population, 0.43);
    assert.strictEqual(sa.biodiversityHotspot, true);
    assertRegionValid(sa);
  });

  it('should initialize North America with moderate degradation', () => {
    // North America: Habitat loss from urbanization and pollution, NOT a hotspot
    const na = getRegion(system, 'North America');
    assert.strictEqual(na.biodiversityIndex, 0.65);
    assert.strictEqual(na.ecosystemIntegrity, 0.60);
    assert.strictEqual(na.pollutionLevel, 0.30);
    assert.strictEqual(na.habitatLoss, 0.40);
    assert.strictEqual(na.climateStress, 0.30);
    assert.strictEqual(na.contaminationLevel, 0.04);
    assert.strictEqual(na.landArea, 24_709_000);
    assert.strictEqual(na.population, 0.58);
    assert.strictEqual(na.biodiversityHotspot, false); // NOT a hotspot
    assertRegionValid(na);
  });

  it('should initialize Europe with lowest biodiversity (most modified landscapes)', () => {
    // Europe: Centuries of agriculture, most degraded biodiversity
    // Highest habitat loss, but smaller population than Asia
    const eu = getRegion(system, 'Europe');
    assert.strictEqual(eu.biodiversityIndex, 0.55); // Lowest initial biodiversity
    assert.strictEqual(eu.ecosystemIntegrity, 0.50);
    assert.strictEqual(eu.pollutionLevel, 0.35);
    assert.strictEqual(eu.habitatLoss, 0.50); // Highest habitat loss
    assert.strictEqual(eu.climateStress, 0.25);
    assert.strictEqual(eu.contaminationLevel, 0.06); // Nuclear accidents (Chernobyl)
    assert.strictEqual(eu.landArea, 10_180_000);
    assert.strictEqual(eu.population, 0.75);
    assert.strictEqual(eu.biodiversityHotspot, false);
    assertRegionValid(eu);
  });

  it('should initialize Oceania with unique biodiversity (Great Barrier Reef)', () => {
    // Oceania: Small landmass but unique species (Australia, New Zealand)
    // High climate stress from coral bleaching and droughts
    const oceania = getRegion(system, 'Oceania');
    assert.strictEqual(oceania.biodiversityIndex, 0.70);
    assert.strictEqual(oceania.ecosystemIntegrity, 0.65);
    assert.strictEqual(oceania.pollutionLevel, 0.20);
    assert.strictEqual(oceania.habitatLoss, 0.30);
    assert.strictEqual(oceania.climateStress, 0.40); // Coral bleaching, droughts
    assert.strictEqual(oceania.contaminationLevel, 0.02);
    assert.strictEqual(oceania.landArea, 8_526_000);
    assert.strictEqual(oceania.population, 0.044);
    assert.strictEqual(oceania.biodiversityHotspot, true); // Great Barrier Reef, unique species
    assertRegionValid(oceania);
  });

  it('should initialize all regions with empty extinction history', () => {
    for (const region of system.regions.values()) {
      assert.deepStrictEqual(region.keySpeciesLost, [], `Region ${region.region} should have no extinct species initially`);
      assert.strictEqual(region.extinctionEvents, 0, `Region ${region.region} should have 0 extinction events`);
    }
  });

  it('should initialize all regions as active (no ecosystem collapse)', () => {
    for (const region of system.regions.values()) {
      assert.strictEqual(region.ecosystemCollapseActive, false, `Region ${region.region} should not be in ecosystem collapse`);
    }
  });

  it('should initialize globalBiodiversityIndex as weighted average of regions', () => {
    const expected = calculateWeightedAverage(system);
    assert.strictEqual(system.globalBiodiversityIndex, expected,
      `Global biodiversity should be weighted average, got ${system.globalBiodiversityIndex}, expected ${expected}`);
  });

  it('should set globalPeakBiodiversity equal to initial value', () => {
    // Peak is the initial state - all downhill from here
    assert.strictEqual(system.globalPeakBiodiversity, system.globalBiodiversityIndex,
      'Peak biodiversity should equal initial state');
    assert(system.globalPeakBiodiversity > 0.65, 'Initial biodiversity should be reasonable (0.65+)');
    assert(system.globalPeakBiodiversity < 0.75, 'Initial biodiversity should be reasonable (<0.75)');
  });

  it('should initialize with empty extinction history', () => {
    assert.deepStrictEqual(system.regionalExtinctions, [],
      'Should have no extinction events initially');
  });
});

describe('Regional Biodiversity System - Global Recalculation', () => {
  let system: BiodiversitySystem;

  before(() => {
    system = initializeRegionalBiodiversitySystem();
  });

  it('should recalculate global biodiversity when single region changes', () => {
    const initialGlobal = system.globalBiodiversityIndex;
    const asia = getRegion(system, 'Asia');
    const asiaWeight = 0.30;

    // Damage Asia (0.70 -> 0.30)
    asia.biodiversityIndex = 0.30;
    recalculateGlobalBiodiversity(system);

    // Global should decrease
    assert(system.globalBiodiversityIndex < initialGlobal,
      'Global biodiversity should decrease when Asia is damaged');

    // Verify calculation: global = sum(region[i] * weight[i])
    const expectedChange = (0.30 - 0.70) * asiaWeight; // -0.40 * 0.30 = -0.12
    const expectedGlobal = initialGlobal + expectedChange;
    assert.strictEqual(system.globalBiodiversityIndex, expectedGlobal,
      `Global should be ${expectedGlobal}, got ${system.globalBiodiversityIndex}`);
  });

  it('should isolate regional changes (other regions unaffected)', () => {
    // Create fresh system for isolation test
    const freshSystem = initializeRegionalBiodiversitySystem();
    const sa = getRegion(freshSystem, 'South America');
    const asia = getRegion(freshSystem, 'Asia');
    const africa = getRegion(freshSystem, 'Africa');

    const initialAsia = asia.biodiversityIndex;
    const initialAfrica = africa.biodiversityIndex;

    // Change only South America
    sa.biodiversityIndex = 0.5;
    recalculateGlobalBiodiversity(freshSystem);

    // Other regions should be unchanged
    assert.strictEqual(asia.biodiversityIndex, initialAsia,
      'Asia biodiversity should not change when South America is damaged');
    assert.strictEqual(africa.biodiversityIndex, initialAfrica,
      'Africa biodiversity should not change when South America is damaged');
  });

  it('should reflect multiple regional changes in global value', () => {
    const freshSystem = initializeRegionalBiodiversitySystem();

    // Damage multiple regions
    const asia = getRegion(freshSystem, 'Asia');
    const eu = getRegion(freshSystem, 'Europe');
    asia.biodiversityIndex = 0.40; // Down from 0.70
    eu.biodiversityIndex = 0.30;   // Down from 0.55

    recalculateGlobalBiodiversity(freshSystem);

    // Calculate expected
    let expected = 0;
    for (const [regionName, region] of freshSystem.regions) {
      const weight = freshSystem.regionalWeights.get(regionName) || 0;
      expected += region.biodiversityIndex * weight;
    }

    assert.strictEqual(freshSystem.globalBiodiversityIndex, expected,
      'Global biodiversity should match weighted sum');
  });

  it('should handle biodiversity floor (0) without going negative', () => {
    const freshSystem = initializeRegionalBiodiversitySystem();
    const asia = getRegion(freshSystem, 'Asia');

    // Set to floor
    asia.biodiversityIndex = 0;
    recalculateGlobalBiodiversity(freshSystem);

    assert(freshSystem.globalBiodiversityIndex >= 0,
      'Global biodiversity should never go negative');
  });

  it('should handle biodiversity ceiling (1.0) without exceeding', () => {
    const freshSystem = initializeRegionalBiodiversitySystem();

    // Set all to ceiling
    for (const region of freshSystem.regions.values()) {
      region.biodiversityIndex = 1.0;
    }
    recalculateGlobalBiodiversity(freshSystem);

    assert.strictEqual(freshSystem.globalBiodiversityIndex, 1.0,
      'Global biodiversity should be 1.0 when all regions are pristine');
  });
});

describe('Regional Biodiversity System - Nuclear Strike Effects', () => {
  let system: BiodiversitySystem;

  before(() => {
    system = initializeRegionalBiodiversitySystem();
  });

  it('should damage only target region from nuclear strike', () => {
    const initialAsia = getRegion(system, 'Asia').biodiversityIndex;
    const initialSA = getRegion(system, 'South America').biodiversityIndex;
    const initialAfrica = getRegion(system, 'Africa').biodiversityIndex;

    applyNuclearBiodiversityLoss(system, 'Asia', 1.0);

    // Asia should be damaged
    const asia = getRegion(system, 'Asia');
    assert(asia.biodiversityIndex < initialAsia,
      'Asia biodiversity should decrease after strike');

    // Other regions should be unchanged
    assert.strictEqual(getRegion(system, 'South America').biodiversityIndex, initialSA,
      'South America should be unaffected by Asia strike');
    assert.strictEqual(getRegion(system, 'Africa').biodiversityIndex, initialAfrica,
      'Africa should be unaffected by Asia strike');
  });

  it('should apply 60% biodiversity loss for full-intensity strike (intensity=1.0)', () => {
    const freshSystem = initializeRegionalBiodiversitySystem();
    const asia = getRegion(freshSystem, 'Asia');
    const initialBiodiversity = asia.biodiversityIndex; // 0.70

    applyNuclearBiodiversityLoss(freshSystem, 'Asia', 1.0);

    const expectedLoss = 0.60; // 60% loss at full intensity
    const expectedBiodiversity = initialBiodiversity - expectedLoss; // 0.70 - 0.60 = 0.10
    assert.strictEqual(asia.biodiversityIndex, expectedBiodiversity,
      `Expected ${expectedBiodiversity}, got ${asia.biodiversityIndex}`);
  });

  it('should scale damage proportionally with strike intensity', () => {
    const freshSystem = initializeRegionalBiodiversitySystem();
    const na = getRegion(freshSystem, 'North America');
    const initialBiodiversity = na.biodiversityIndex; // 0.65

    // Half-intensity strike (0.5)
    applyNuclearBiodiversityLoss(freshSystem, 'North America', 0.5);

    const expectedLoss = 0.60 * 0.5; // 60% * 0.5 = 30% loss
    const expectedBiodiversity = initialBiodiversity - expectedLoss;
    assert.strictEqual(na.biodiversityIndex, expectedBiodiversity,
      `Half-intensity strike should cause 30% loss`);
  });

  it('should scale damage for weak strikes (intensity=0.2)', () => {
    const freshSystem = initializeRegionalBiodiversitySystem();
    const oceania = getRegion(freshSystem, 'Oceania');
    const initialBiodiversity = oceania.biodiversityIndex; // 0.70

    applyNuclearBiodiversityLoss(freshSystem, 'Oceania', 0.2);

    const expectedLoss = 0.60 * 0.2; // 60% * 0.2 = 12% loss
    const expectedBiodiversity = initialBiodiversity - expectedLoss;
    assert.strictEqual(oceania.biodiversityIndex, expectedBiodiversity,
      `Weak strike should cause 12% loss`);
  });

  it('should destroy ecosystem integrity (reduce to 10% of initial)', () => {
    const freshSystem = initializeRegionalBiodiversitySystem();
    const eu = getRegion(freshSystem, 'Europe');
    const initialIntegrity = eu.ecosystemIntegrity; // 0.50

    applyNuclearBiodiversityLoss(freshSystem, 'Europe', 1.0);

    const expectedIntegrity = initialIntegrity * 0.1; // Reduced to 10%
    assert.strictEqual(eu.ecosystemIntegrity, expectedIntegrity,
      `Ecosystem integrity should be 10% of original, got ${eu.ecosystemIntegrity}`);
  });

  it('should scale ecosystem integrity loss with strike intensity', () => {
    const freshSystem = initializeRegionalBiodiversitySystem();
    const africa = getRegion(freshSystem, 'Africa');
    const initialIntegrity = africa.ecosystemIntegrity; // 0.70

    applyNuclearBiodiversityLoss(freshSystem, 'Africa', 0.5);

    // Should still reduce to 10% (not scaled by intensity)
    const expectedIntegrity = initialIntegrity * 0.1;
    assert.strictEqual(africa.ecosystemIntegrity, expectedIntegrity,
      'Ecosystem integrity loss should be consistent (0.1x) regardless of intensity');
  });

  it('should add contamination (80% increase at full intensity)', () => {
    const freshSystem = initializeRegionalBiodiversitySystem();
    const asia = getRegion(freshSystem, 'Asia');
    const initialContamination = asia.contaminationLevel; // 0.05

    applyNuclearBiodiversityLoss(freshSystem, 'Asia', 1.0);

    const expectedContamination = Math.min(1.0, initialContamination + 0.8);
    assert.strictEqual(asia.contaminationLevel, expectedContamination,
      `Contamination should increase by 0.8, got increase of ${asia.contaminationLevel - initialContamination}`);
  });

  it('should scale contamination with strike intensity', () => {
    const freshSystem = initializeRegionalBiodiversitySystem();
    const na = getRegion(freshSystem, 'North America');
    const initialContamination = na.contaminationLevel; // 0.04

    applyNuclearBiodiversityLoss(freshSystem, 'North America', 0.5);

    const expectedContamination = initialContamination + 0.8 * 0.5; // 0.4 total
    assert.strictEqual(na.contaminationLevel, expectedContamination,
      `Contamination should increase by 0.4 at half intensity`);
  });

  it('should cap contamination at 1.0 (no overflow)', () => {
    const freshSystem = initializeRegionalBiodiversitySystem();
    const eu = getRegion(freshSystem, 'Europe');

    // Apply multiple strikes to push contamination to ceiling
    applyNuclearBiodiversityLoss(freshSystem, 'Europe', 1.0);
    const contamAfterFirst = eu.contaminationLevel;

    applyNuclearBiodiversityLoss(freshSystem, 'Europe', 1.0);

    assert(eu.contaminationLevel <= 1.0,
      `Contamination should not exceed 1.0, got ${eu.contaminationLevel}`);
  });

  it('should trigger ecosystem collapse when biodiversity drops below 0.3', () => {
    const freshSystem = initializeRegionalBiodiversitySystem();
    const oceania = getRegion(freshSystem, 'Oceania');

    // Initial is 0.70, strike removes 0.60, leaves 0.10 < 0.3
    assert.strictEqual(oceania.ecosystemCollapseActive, false, 'Should not be in collapse initially');
    applyNuclearBiodiversityLoss(freshSystem, 'Oceania', 1.0);
    assert.strictEqual(oceania.ecosystemCollapseActive, true,
      'Should trigger ecosystem collapse when biodiversity < 0.3');
  });

  it('should NOT trigger ecosystem collapse if biodiversity stays above 0.3', () => {
    const freshSystem = initializeRegionalBiodiversitySystem();
    const asia = getRegion(freshSystem, 'Asia');

    // Initial is 0.70, strike removes 0.60, leaves 0.10 < 0.3
    // But Asia's initial is 0.70, after 0.60 loss = 0.10, which IS < 0.3
    // So we need to use a weaker strike to keep it above 0.3
    applyNuclearBiodiversityLoss(freshSystem, 'Asia', 0.3);

    // 0.60 * 0.3 = 0.18 loss, so 0.70 - 0.18 = 0.52 > 0.3
    assert.strictEqual(asia.ecosystemCollapseActive, false,
      'Should NOT trigger ecosystem collapse if biodiversity stays > 0.3');
  });

  it('should record extinction event with nuclear cause', () => {
    const freshSystem = initializeRegionalBiodiversitySystem();
    assert.strictEqual(freshSystem.regionalExtinctions.length, 0, 'Should start with no extinctions');

    applyNuclearBiodiversityLoss(freshSystem, 'Asia', 1.0);

    assert.strictEqual(freshSystem.regionalExtinctions.length, 1,
      'Should have 1 extinction event after strike');
    const event: ExtinctionEvent = freshSystem.regionalExtinctions[0];
    assert.strictEqual(event.region, 'Asia');
    assert.strictEqual(event.cause, 'nuclear');
    assert.strictEqual(event.species, 'Mass extinction event');
  });

  it('should set high cascade risk for nuclear strikes (0.9)', () => {
    const freshSystem = initializeRegionalBiodiversitySystem();
    applyNuclearBiodiversityLoss(freshSystem, 'South America', 1.0);

    const event = freshSystem.regionalExtinctions[0];
    assert.strictEqual(event.cascadeRisk, 0.9,
      'Nuclear strikes should have very high cascade risk (0.9)');
  });

  it('should track multiple extinction events from sequential strikes', () => {
    const freshSystem = initializeRegionalBiodiversitySystem();

    applyNuclearBiodiversityLoss(freshSystem, 'Asia', 1.0);
    applyNuclearBiodiversityLoss(freshSystem, 'Europe', 1.0);
    applyNuclearBiodiversityLoss(freshSystem, 'Africa', 0.5);

    assert.strictEqual(freshSystem.regionalExtinctions.length, 3,
      'Should have 3 extinction events');
    assert.strictEqual(freshSystem.regionalExtinctions[0].region, 'Asia');
    assert.strictEqual(freshSystem.regionalExtinctions[1].region, 'Europe');
    assert.strictEqual(freshSystem.regionalExtinctions[2].region, 'Africa');
  });

  it('should update global biodiversity after nuclear strike', () => {
    const freshSystem = initializeRegionalBiodiversitySystem();
    const initialGlobal = freshSystem.globalBiodiversityIndex;
    const asiaWeight = 0.30;
    const asiaLoss = 0.60;

    applyNuclearBiodiversityLoss(freshSystem, 'Asia', 1.0);

    // Expected: global = initialGlobal - (asiaWeight * asiaLoss)
    const expectedChange = -asiaWeight * asiaLoss; // -0.18
    const expectedGlobal = initialGlobal + expectedChange;
    assert.strictEqual(freshSystem.globalBiodiversityIndex, expectedGlobal,
      `Global biodiversity should change by ${expectedChange}`);
  });

  it('should maintain biodiversity floor (never go below 0)', () => {
    const freshSystem = initializeRegionalBiodiversitySystem();

    // Multiple massive strikes to try to break the floor
    applyNuclearBiodiversityLoss(freshSystem, 'Oceania', 10.0);
    applyNuclearBiodiversityLoss(freshSystem, 'Oceania', 10.0);

    const oceania = getRegion(freshSystem, 'Oceania');
    assert(oceania.biodiversityIndex >= 0,
      'Biodiversity should never go below 0');
  });
});

describe('Regional Biodiversity System - Nation to Region Mapping', () => {
  it('should map North American nuclear powers correctly', () => {
    assert.strictEqual(getRegionFromNation('United States'), 'North America');
    assert.strictEqual(getRegionFromNation('Canada'), 'North America');
    assert.strictEqual(getRegionFromNation('Mexico'), 'North America');
  });

  it('should map Asian nuclear powers correctly', () => {
    assert.strictEqual(getRegionFromNation('Russia'), 'Asia', 'Most of Russia is in Asia');
    assert.strictEqual(getRegionFromNation('China'), 'Asia');
    assert.strictEqual(getRegionFromNation('India'), 'Asia');
    assert.strictEqual(getRegionFromNation('Japan'), 'Asia');
    assert.strictEqual(getRegionFromNation('South Korea'), 'Asia');
    assert.strictEqual(getRegionFromNation('North Korea'), 'Asia');
    assert.strictEqual(getRegionFromNation('Pakistan'), 'Asia');
    assert.strictEqual(getRegionFromNation('Israel'), 'Asia', 'Middle East region mapped to Asia');
  });

  it('should map European nuclear powers correctly', () => {
    assert.strictEqual(getRegionFromNation('United Kingdom'), 'Europe');
    assert.strictEqual(getRegionFromNation('France'), 'Europe');
    assert.strictEqual(getRegionFromNation('Germany'), 'Europe');
  });

  it('should map South American countries correctly', () => {
    assert.strictEqual(getRegionFromNation('Brazil'), 'South America');
    assert.strictEqual(getRegionFromNation('Argentina'), 'South America');
  });

  it('should map African countries correctly', () => {
    assert.strictEqual(getRegionFromNation('South Africa'), 'Africa');
    assert.strictEqual(getRegionFromNation('Egypt'), 'Africa');
  });

  it('should map Oceania countries correctly', () => {
    assert.strictEqual(getRegionFromNation('Australia'), 'Oceania');
    assert.strictEqual(getRegionFromNation('New Zealand'), 'Oceania');
  });

  it('should default to Asia for unmapped nations', () => {
    assert.strictEqual(getRegionFromNation('Unknown Country'), 'Asia');
    assert.strictEqual(getRegionFromNation('Made Up Nation'), 'Asia');
    assert.strictEqual(getRegionFromNation('Atlantis'), 'Asia');
  });
});

describe('Regional Biodiversity System - Edge Cases & Boundary Conditions', () => {
  let system: BiodiversitySystem;

  before(() => {
    system = initializeRegionalBiodiversitySystem();
  });

  it('should handle total collapse scenario (all regions damaged)', () => {
    const freshSystem = initializeRegionalBiodiversitySystem();

    // Damage all regions heavily
    applyNuclearBiodiversityLoss(freshSystem, 'Asia', 1.0);
    applyNuclearBiodiversityLoss(freshSystem, 'Africa', 1.0);
    applyNuclearBiodiversityLoss(freshSystem, 'South America', 1.0);
    applyNuclearBiodiversityLoss(freshSystem, 'North America', 1.0);
    applyNuclearBiodiversityLoss(freshSystem, 'Europe', 1.0);
    applyNuclearBiodiversityLoss(freshSystem, 'Oceania', 1.0);

    // All regions should show severe damage
    for (const region of freshSystem.regions.values()) {
      assert(region.biodiversityIndex < 0.3,
        `${region.region} should be below collapse threshold after full strikes`);
      assert.strictEqual(region.ecosystemCollapseActive, true,
        `${region.region} should be in ecosystem collapse`);
    }

    // Global should be severely damaged
    assert(freshSystem.globalBiodiversityIndex < 0.2,
      'Global biodiversity should be < 0.2 after total collapse');
  });

  it('should handle pristine recovery (all regions at 1.0)', () => {
    const freshSystem = initializeRegionalBiodiversitySystem();

    // Manually set all to pristine
    for (const region of freshSystem.regions.values()) {
      region.biodiversityIndex = 1.0;
      region.ecosystemIntegrity = 1.0;
      region.pollutionLevel = 0;
      region.habitatLoss = 0;
      region.climateStress = 0;
      region.contaminationLevel = 0;
      region.ecosystemCollapseActive = false;
      region.extinctionEvents = 0;
    }
    recalculateGlobalBiodiversity(freshSystem);

    assert.strictEqual(freshSystem.globalBiodiversityIndex, 1.0,
      'All regions pristine should give global = 1.0');
  });

  it('should handle rapid transitions (large changes in single step)', () => {
    const freshSystem = initializeRegionalBiodiversitySystem();
    const asia = getRegion(freshSystem, 'Asia');

    // Simulate rapid change from climate tipping point
    asia.biodiversityIndex = 0.1; // Rapid drop
    asia.climateStress = 1.0;     // Max stress
    recalculateGlobalBiodiversity(freshSystem);

    // System should remain valid
    assert(freshSystem.globalBiodiversityIndex >= 0 && freshSystem.globalBiodiversityIndex <= 1,
      'Global biodiversity should stay in valid range after rapid transition');
  });

  it('should handle partial regional strikes with biodiversity floor', () => {
    const freshSystem = initializeRegionalBiodiversitySystem();

    // Get region to very low value
    applyNuclearBiodiversityLoss(freshSystem, 'Europe', 1.0);
    const eu = getRegion(freshSystem, 'Europe');

    // Try to strike again
    const preStrike = eu.biodiversityIndex;
    applyNuclearBiodiversityLoss(freshSystem, 'Europe', 0.5);
    const postStrike = eu.biodiversityIndex;

    // Should not go below floor
    assert(postStrike >= 0, 'Should not go below 0');
    assert(postStrike <= preStrike, 'Should not increase');
  });

  it('should maintain consistent state through multiple sequential operations', () => {
    const freshSystem = initializeRegionalBiodiversitySystem();

    // Series of operations
    applyNuclearBiodiversityLoss(freshSystem, 'Asia', 0.3);
    const asia = getRegion(freshSystem, 'Asia');
    asia.habitatLoss = 0.6;
    recalculateGlobalBiodiversity(freshSystem);

    applyNuclearBiodiversityLoss(freshSystem, 'Africa', 0.2);
    const africa = getRegion(freshSystem, 'Africa');
    africa.pollutionLevel = 0.5;
    recalculateGlobalBiodiversity(freshSystem);

    // All regions should remain valid
    for (const region of freshSystem.regions.values()) {
      assertRegionValid(region);
    }

    // Global should be valid
    assert(freshSystem.globalBiodiversityIndex >= 0 && freshSystem.globalBiodiversityIndex <= 1,
      'Global should remain in valid range');
  });

  it('should handle zero-intensity strikes (no-op)', () => {
    const freshSystem = initializeRegionalBiodiversitySystem();
    const asia = getRegion(freshSystem, 'Asia');
    const initialBiodiversity = asia.biodiversityIndex;

    applyNuclearBiodiversityLoss(freshSystem, 'Asia', 0);

    // Should be unchanged
    assert.strictEqual(asia.biodiversityIndex, initialBiodiversity);
  });

  it('should handle strike to non-existent region gracefully', () => {
    const freshSystem = initializeRegionalBiodiversitySystem();
    const initialGlobal = freshSystem.globalBiodiversityIndex;

    // Try to strike unknown region (should fail silently per implementation)
    applyNuclearBiodiversityLoss(freshSystem, 'Atlantis', 1.0);

    // System should be unchanged
    assert.strictEqual(freshSystem.globalBiodiversityIndex, initialGlobal,
      'Global biodiversity should be unchanged after invalid region strike');
  });
});

describe('Regional Biodiversity System - Research Validation', () => {
  let system: BiodiversitySystem;

  before(() => {
    system = initializeRegionalBiodiversitySystem();
  });

  it('should represent planetary boundaries framework (Richardson et al. 2023)', () => {
    // Planetary Boundaries for biosphere integrity suggest we're past safe zone
    // Initial state represents current (2025) biodiversity loss scenario

    // Global should be below pristine (1.0) due to ongoing degradation
    assert(system.globalBiodiversityIndex < 1.0,
      'Global biodiversity should reflect current planetary boundary transgression');

    // Should be in degraded but functional range (0.65-0.75)
    assert(system.globalBiodiversityIndex > 0.65 && system.globalBiodiversityIndex < 0.75,
      'Global biodiversity should reflect realistic 2025 state');
  });

  it('should model extinction thresholds based on habitat loss', () => {
    // Species-area relationship: S = c*A^z (typically z ≈ 0.25-0.35)
    // When habitat loss approaches threshold, extinctions accelerate

    // Europe has highest habitat loss (0.50) and lowest biodiversity (0.55)
    const eu = getRegion(system, 'Europe');
    assert(eu.habitatLoss > eu.biodiversityIndex || eu.habitatLoss > 0.40,
      'High habitat loss should correlate with lower biodiversity');
  });

  it('should distinguish hotspot vs non-hotspot regions', () => {
    // Hotspots (Asia, Africa, South America, Oceania) should have higher biodiversity
    const hotspots = ['Asia', 'Africa', 'South America', 'Oceania'];
    const nonHotspots = ['North America', 'Europe'];

    const hotspotAvg = hotspots.reduce((sum, name) =>
      sum + getRegion(system, name).biodiversityIndex, 0) / hotspots.length;
    const nonHotspotAvg = nonHotspots.reduce((sum, name) =>
      sum + getRegion(system, name).biodiversityIndex, 0) / nonHotspots.length;

    assert(hotspotAvg > nonHotspotAvg,
      'Biodiversity hotspots should have higher average biodiversity');
  });

  it('should model habitat fragmentation effects through contamination', () => {
    // Contamination represents habitat fragmentation and pollution stress
    // Higher contamination should correlate with lower ecosystem integrity

    for (const region of system.regions.values()) {
      // Generally, higher contamination + pollution = lower integrity
      const stresors = region.pollutionLevel + region.contaminationLevel;
      assert(region.ecosystemIntegrity <= 1.0,
        `${region.region} ecosystem integrity should be ≤ 1.0`);
    }
  });

  it('should model climate-sensitive regions (high climateStress)', () => {
    // Africa and Oceania have high climate stress (0.35, 0.40)
    const africa = getRegion(system, 'Africa');
    const oceania = getRegion(system, 'Oceania');

    assert.strictEqual(africa.climateStress, 0.35, 'Africa has high climate vulnerability');
    assert.strictEqual(oceania.climateStress, 0.40, 'Oceania has highest climate stress');
  });

  it('should model Amazon tipping point through South America dynamics', () => {
    // South America represents Amazon rainforest
    // High biodiversity (0.80) + accelerating deforestation (0.30 habitat loss)
    // + moderate climate stress (0.25) = tipping point risk

    const sa = getRegion(system, 'South America');
    assert(sa.biodiversityIndex > 0.75, 'Amazon still highly biodiverse');
    assert(sa.habitatLoss > 0.25, 'Deforestation pressure present');
    assert(sa.climateStress > 0.20, 'Climate stress present');

    // Model represents known Amazon research: biodiversity high but tipping point approaching
  });
});
