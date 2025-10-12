/**
 * Regional Biodiversity System Tests
 *
 * Validates that regional biodiversity tracking works correctly:
 * - Regional weights sum to 1.0
 * - Nuclear strikes affect only target region
 * - Global biodiversity = weighted average
 * - Asia strike doesn't affect South America
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  initializeRegionalBiodiversitySystem,
  recalculateGlobalBiodiversity,
  applyNuclearBiodiversityLoss,
  getRegionFromNation,
  BiodiversitySystem,
} from '../src/types/regionalBiodiversity';

describe('Regional Biodiversity System', () => {
  let system: BiodiversitySystem;

  beforeEach(() => {
    system = initializeRegionalBiodiversitySystem();
  });

  describe('Initialization', () => {
    it('should initialize 6 regions', () => {
      expect(system.regions.size).toBe(6);
      expect(system.regions.has('Asia')).toBe(true);
      expect(system.regions.has('Africa')).toBe(true);
      expect(system.regions.has('South America')).toBe(true);
      expect(system.regions.has('North America')).toBe(true);
      expect(system.regions.has('Europe')).toBe(true);
      expect(system.regions.has('Oceania')).toBe(true);
    });

    it('should have regional weights that sum to 1.0', () => {
      let totalWeight = 0;
      for (const weight of system.regionalWeights.values()) {
        totalWeight += weight;
      }
      expect(totalWeight).toBeCloseTo(1.0, 5);
    });

    it('should have correct regional weights', () => {
      expect(system.regionalWeights.get('Asia')).toBe(0.30);
      expect(system.regionalWeights.get('Africa')).toBe(0.20);
      expect(system.regionalWeights.get('South America')).toBe(0.20);
      expect(system.regionalWeights.get('North America')).toBe(0.15);
      expect(system.regionalWeights.get('Europe')).toBe(0.10);
      expect(system.regionalWeights.get('Oceania')).toBe(0.05);
    });

    it('should calculate global biodiversity as weighted average', () => {
      // Manually calculate weighted average
      let expected = 0;
      for (const [regionName, region] of system.regions) {
        const weight = system.regionalWeights.get(regionName) || 0;
        expected += region.biodiversityIndex * weight;
      }

      expect(system.globalBiodiversityIndex).toBeCloseTo(expected, 5);
    });

    it('should have realistic initial biodiversity values', () => {
      // South America (Amazon) should have highest biodiversity
      const sa = system.regions.get('South America')!;
      expect(sa.biodiversityIndex).toBe(0.80);
      expect(sa.biodiversityHotspot).toBe(true);

      // Europe should have lowest (most modified)
      const eu = system.regions.get('Europe')!;
      expect(eu.biodiversityIndex).toBe(0.55);
      expect(eu.habitatLoss).toBeGreaterThan(0.4); // High habitat loss
    });
  });

  describe('Global Biodiversity Recalculation', () => {
    it('should update global biodiversity when regional values change', () => {
      const initialGlobal = system.globalBiodiversityIndex;

      // Damage Asia biodiversity
      const asia = system.regions.get('Asia')!;
      asia.biodiversityIndex = 0.3; // Down from 0.70

      // Recalculate
      recalculateGlobalBiodiversity(system);

      // Global should decrease (Asia has 30% weight)
      expect(system.globalBiodiversityIndex).toBeLessThan(initialGlobal);

      // Calculate expected change
      const asiaWeight = system.regionalWeights.get('Asia')!;
      const expectedChange = (0.3 - 0.70) * asiaWeight; // -0.40 × 0.30 = -0.12
      expect(system.globalBiodiversityIndex).toBeCloseTo(initialGlobal + expectedChange, 5);
    });

    it('should isolate regional changes', () => {
      // Change South America, verify other regions unchanged
      const sa = system.regions.get('South America')!;
      const initialSA = sa.biodiversityIndex;
      sa.biodiversityIndex = 0.5; // Damage Amazon

      // Verify other regions unchanged
      const asia = system.regions.get('Asia')!;
      const africa = system.regions.get('Africa')!;
      expect(asia.biodiversityIndex).toBe(0.70); // Unchanged
      expect(africa.biodiversityIndex).toBe(0.75); // Unchanged

      // But global should change
      recalculateGlobalBiodiversity(system);
      const saWeight = system.regionalWeights.get('South America')!;
      const expectedChange = (0.5 - initialSA) * saWeight; // -0.30 × 0.20 = -0.06
      expect(system.globalBiodiversityIndex).toBeCloseTo(0.71 + expectedChange, 2);
    });
  });

  describe('Nuclear Strike Effects', () => {
    it('should damage only target region', () => {
      const initialAsia = system.regions.get('Asia')!.biodiversityIndex;
      const initialSA = system.regions.get('South America')!.biodiversityIndex;
      const initialAfrica = system.regions.get('Africa')!.biodiversityIndex;

      // Nuclear strike on Asia
      applyNuclearBiodiversityLoss(system, 'Asia', 1.0);

      // Asia should be damaged
      const asia = system.regions.get('Asia')!;
      expect(asia.biodiversityIndex).toBeLessThan(initialAsia);
      expect(asia.biodiversityIndex).toBeCloseTo(initialAsia - 0.60, 2); // 60% loss

      // Other regions should be UNCHANGED
      const sa = system.regions.get('South America')!;
      const africa = system.regions.get('Africa')!;
      expect(sa.biodiversityIndex).toBe(initialSA); // Unchanged
      expect(africa.biodiversityIndex).toBe(initialAfrica); // Unchanged
    });

    it('should scale damage with strike intensity', () => {
      const initialEU = system.regions.get('Europe')!.biodiversityIndex;

      // Small nuclear strike (0.3 intensity)
      applyNuclearBiodiversityLoss(system, 'Europe', 0.3);

      const eu = system.regions.get('Europe')!;
      const expectedLoss = 0.60 * 0.3; // 60% × 0.3 = 18% loss
      expect(eu.biodiversityIndex).toBeCloseTo(initialEU - expectedLoss, 2);
    });

    it('should destroy ecosystem integrity', () => {
      const eu = system.regions.get('Europe')!;
      const initialIntegrity = eu.ecosystemIntegrity;

      applyNuclearBiodiversityLoss(system, 'Europe', 1.0);

      // Ecosystem integrity should collapse (90% reduction)
      expect(eu.ecosystemIntegrity).toBeCloseTo(initialIntegrity * 0.1, 2);
    });

    it('should add contamination', () => {
      const na = system.regions.get('North America')!;
      const initialContamination = na.contaminationLevel;

      applyNuclearBiodiversityLoss(system, 'North America', 1.0);

      // Contamination should spike
      expect(na.contaminationLevel).toBeGreaterThan(initialContamination);
      expect(na.contaminationLevel).toBeCloseTo(initialContamination + 0.8, 1);
    });

    it('should trigger ecosystem collapse flag', () => {
      const oc = system.regions.get('Oceania')!;
      expect(oc.ecosystemCollapseActive).toBe(false);

      // Major strike
      applyNuclearBiodiversityLoss(system, 'Oceania', 1.0);

      // Should trigger collapse (biodiversity < 0.3)
      expect(oc.ecosystemCollapseActive).toBe(true);
    });

    it('should track extinction events', () => {
      expect(system.regionalExtinctions.length).toBe(0);

      applyNuclearBiodiversityLoss(system, 'Asia', 1.0);

      // Should record extinction event
      expect(system.regionalExtinctions.length).toBe(1);
      expect(system.regionalExtinctions[0].region).toBe('Asia');
      expect(system.regionalExtinctions[0].cause).toBe('nuclear');
      expect(system.regionalExtinctions[0].cascadeRisk).toBeGreaterThan(0.8); // High cascade risk
    });

    it('should update global biodiversity after regional strike', () => {
      const initialGlobal = system.globalBiodiversityIndex;

      // Strike Asia (30% weight, 60% loss)
      applyNuclearBiodiversityLoss(system, 'Asia', 1.0);

      // Global should decrease by Asia's contribution
      const asiaWeight = 0.30;
      const asiaLoss = 0.60;
      const expectedGlobalChange = -asiaWeight * asiaLoss; // -0.18
      expect(system.globalBiodiversityIndex).toBeCloseTo(initialGlobal + expectedGlobalChange, 2);
    });
  });

  describe('Nation to Region Mapping', () => {
    it('should map nuclear nations correctly', () => {
      expect(getRegionFromNation('United States')).toBe('North America');
      expect(getRegionFromNation('Russia')).toBe('Asia'); // Mostly in Asia
      expect(getRegionFromNation('China')).toBe('Asia');
      expect(getRegionFromNation('United Kingdom')).toBe('Europe');
      expect(getRegionFromNation('France')).toBe('Europe');
      expect(getRegionFromNation('India')).toBe('Asia');
      expect(getRegionFromNation('Pakistan')).toBe('Asia');
      expect(getRegionFromNation('Israel')).toBe('Asia'); // Middle East
      expect(getRegionFromNation('North Korea')).toBe('Asia');
    });

    it('should default to Asia for unknown nations', () => {
      expect(getRegionFromNation('Unknown Country')).toBe('Asia');
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle multiple regional strikes', () => {
      // Strike multiple regions
      applyNuclearBiodiversityLoss(system, 'North America', 1.0);
      applyNuclearBiodiversityLoss(system, 'Europe', 1.0);
      applyNuclearBiodiversityLoss(system, 'Asia', 0.5);

      // Check each region damaged independently
      const na = system.regions.get('North America')!;
      const eu = system.regions.get('Europe')!;
      const asia = system.regions.get('Asia')!;

      expect(na.biodiversityIndex).toBeLessThan(0.2); // Heavy damage
      expect(eu.biodiversityIndex).toBeLessThan(0.2); // Heavy damage
      expect(asia.biodiversityIndex).toBeGreaterThan(0.3); // Moderate damage (50% intensity)

      // South America should be untouched
      const sa = system.regions.get('South America')!;
      expect(sa.biodiversityIndex).toBe(0.80); // Unchanged

      // Global should be heavily damaged
      expect(system.globalBiodiversityIndex).toBeLessThan(0.5);
    });

    it('should maintain biodiversity floor at 0', () => {
      // Massive overstrike
      applyNuclearBiodiversityLoss(system, 'Oceania', 10.0); // Way beyond 1.0

      const oc = system.regions.get('Oceania')!;
      expect(oc.biodiversityIndex).toBeGreaterThanOrEqual(0); // Can't go negative
    });
  });
});
