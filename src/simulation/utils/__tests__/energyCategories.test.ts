import { describe, it, expect } from 'vitest';
import { mapTechToEnergyCategory, ENERGY_CATEGORIES } from '../energyCategories';

describe('mapTechToEnergyCategory', () => {
  describe('Climate technologies', () => {
    it('maps DAC variants to dac category', () => {
      expect(mapTechToEnergyCategory('dac_tier_1')).toBe('dac');
      expect(mapTechToEnergyCategory('air-capture-advanced')).toBe('dac');
      expect(mapTechToEnergyCategory('direct_air_capture')).toBe('dac');
      expect(mapTechToEnergyCategory('DAC_TIER_2')).toBe('dac'); // Case insensitive
    });

    it('maps hydrogen variants to green-hydrogen category', () => {
      expect(mapTechToEnergyCategory('hydrogen_production')).toBe('green-hydrogen');
      expect(mapTechToEnergyCategory('green-hydrogen-tier-2')).toBe('green-hydrogen');
      expect(mapTechToEnergyCategory('HYDROGEN')).toBe('green-hydrogen'); // Case insensitive
    });

    it('maps geoengineering variants to sai category', () => {
      expect(mapTechToEnergyCategory('sai_deployment')).toBe('sai');
      expect(mapTechToEnergyCategory('geoengineering_tier_1')).toBe('sai');
      expect(mapTechToEnergyCategory('SAI')).toBe('sai'); // Case insensitive
    });

    it('maps mineralization variants to carbon-mineralization category', () => {
      expect(mapTechToEnergyCategory('mineralization_enhanced')).toBe('carbon-mineralization');
      expect(mapTechToEnergyCategory('weathering_accelerated')).toBe('carbon-mineralization');
      expect(mapTechToEnergyCategory('MINERALIZATION')).toBe('carbon-mineralization'); // Case insensitive
    });
  });

  describe('AI/Compute technologies', () => {
    it('maps AI datacenter variants to ai-datacenter category', () => {
      expect(mapTechToEnergyCategory('ai-alignment')).toBe('ai-datacenter');
      expect(mapTechToEnergyCategory('ai-capability-research')).toBe('ai-datacenter');
      expect(mapTechToEnergyCategory('datacenter_expansion')).toBe('ai-datacenter');
      expect(mapTechToEnergyCategory('AI-RESEARCH')).toBe('ai-datacenter'); // Case insensitive
    });

    it('maps compute variants to advanced-compute category', () => {
      expect(mapTechToEnergyCategory('compute_quantum')).toBe('advanced-compute');
      expect(mapTechToEnergyCategory('simulation_climate')).toBe('advanced-compute');
      expect(mapTechToEnergyCategory('COMPUTE')).toBe('advanced-compute'); // Case insensitive
    });
  });

  describe('Infrastructure technologies', () => {
    it('maps industrial variants to industrial-electrification category', () => {
      expect(mapTechToEnergyCategory('industrial_heating')).toBe('industrial-electrification');
      expect(mapTechToEnergyCategory('manufacturing_electrification')).toBe('industrial-electrification');
      expect(mapTechToEnergyCategory('INDUSTRIAL')).toBe('industrial-electrification'); // Case insensitive
    });

    it('maps transport variants to transport-electrification category', () => {
      expect(mapTechToEnergyCategory('transport_ev')).toBe('transport-electrification');
      expect(mapTechToEnergyCategory('ev_infrastructure')).toBe('transport-electrification');
      expect(mapTechToEnergyCategory('clean_energy_package')).toBe('transport-electrification');
      expect(mapTechToEnergyCategory('TRANSPORT')).toBe('transport-electrification'); // Case insensitive
    });
  });

  describe('Non-energy technologies', () => {
    it('returns null for technologies without energy requirements', () => {
      expect(mapTechToEnergyCategory('social_cohesion_tech')).toBeNull();
      expect(mapTechToEnergyCategory('governance_reform')).toBeNull();
      expect(mapTechToEnergyCategory('medical_breakthrough')).toBeNull();
      expect(mapTechToEnergyCategory('agricultural_innovation')).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('returns null for empty string', () => {
      expect(mapTechToEnergyCategory('')).toBeNull();
    });

    it('returns null for whitespace-only string', () => {
      expect(mapTechToEnergyCategory('   ')).toBeNull();
    });

    it('handles non-string inputs gracefully', () => {
      // @ts-expect-error Testing runtime behavior with invalid input
      expect(mapTechToEnergyCategory(null)).toBeNull();
      // @ts-expect-error Testing runtime behavior with invalid input
      expect(mapTechToEnergyCategory(undefined)).toBeNull();
      // @ts-expect-error Testing runtime behavior with invalid input
      expect(mapTechToEnergyCategory(123)).toBeNull();
      // @ts-expect-error Testing runtime behavior with invalid input
      expect(mapTechToEnergyCategory({})).toBeNull();
    });

    it('handles special characters', () => {
      expect(mapTechToEnergyCategory('dac-tier_1@v2')).toBe('dac');
      expect(mapTechToEnergyCategory('ai-datacenter#experimental')).toBe('ai-datacenter');
    });
  });

  describe('ENERGY_CATEGORIES constant', () => {
    it('exports all category identifiers', () => {
      expect(ENERGY_CATEGORIES).toEqual([
        'dac',
        'green-hydrogen',
        'sai',
        'carbon-mineralization',
        'ai-datacenter',
        'advanced-compute',
        'industrial-electrification',
        'transport-electrification',
      ]);
    });

    it('contains only unique values', () => {
      const unique = [...new Set(ENERGY_CATEGORIES)];
      expect(unique).toEqual(ENERGY_CATEGORIES);
    });
  });

  describe('Pattern matching behavior', () => {
    it('matches substring anywhere in tech ID', () => {
      expect(mapTechToEnergyCategory('experimental_dac_prototype')).toBe('dac');
      expect(mapTechToEnergyCategory('prototype_ai-alignment_v2')).toBe('ai-datacenter');
    });

    it('prioritizes earlier patterns when multiple match', () => {
      // 'ai-datacenter' pattern comes before 'advanced-compute' in code
      expect(mapTechToEnergyCategory('ai-compute-hybrid')).toBe('ai-datacenter');
    });
  });
});
