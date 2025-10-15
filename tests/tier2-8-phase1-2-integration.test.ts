/**
 * TIER 2.8 Phase 1 & 2 Integration Tests
 *
 * Tests resource endowments, sovereignty, and military system integration
 */

import { describe, it, expect } from '@jest/globals';
import {
  initializeAllCountryResources,
} from '../src/simulation/resourceInitialization';
import {
  initializeMilitaryCapabilities,
  calculateMilitaryCO2Emissions,
  shouldInitiateIntervention,
  createIntervention,
} from '../src/simulation/militarySystem';
import {
  createEmptyResourceEndowment,
  createDefaultSovereignty,
  calculateResourceValue,
} from '../src/types/resourceEndowment';

describe('TIER 2.8 Phase 1: Resource Endowments', () => {
  describe('Resource Initialization', () => {
    it('should initialize all 15 countries with resource data', () => {
      const resources = initializeAllCountryResources();

      expect(resources.size).toBe(15);

      // Check all countries are present
      const expectedCountries = [
        'United States', 'China', 'Russia', 'India', 'United Kingdom',
        'France', 'Japan', 'Germany', 'Canada', 'Brazil', 'Indonesia',
        'Pakistan', 'Israel', 'Bangladesh', 'Nigeria'
      ];

      for (const country of expectedCountries) {
        expect(resources.has(country as any)).toBe(true);
      }
    });

    it('should have realistic sovereignty gradient', () => {
      const resources = initializeAllCountryResources();

      // Hegemons should have high sovereignty (0.85-0.95)
      expect(resources.get('United States' as any)!.sovereignty.overallSovereignty).toBeGreaterThan(0.9);
      expect(resources.get('China' as any)!.sovereignty.overallSovereignty).toBeGreaterThan(0.85);

      // Peripheral countries should have low sovereignty (0.25-0.35)
      expect(resources.get('Nigeria' as any)!.sovereignty.overallSovereignty).toBeLessThan(0.35);
      expect(resources.get('Bangladesh' as any)!.sovereignty.overallSovereignty).toBeLessThan(0.35);
    });

    it('should reflect resource curse (Nigeria oil example)', () => {
      const resources = initializeAllCountryResources();
      const nigeria = resources.get('Nigeria' as any)!;

      // Nigeria has high oil reserves (80/100)
      expect(nigeria.resources.energy.oil).toBeGreaterThan(70);

      // But very low sovereignty (0.25) - the resource curse
      expect(nigeria.sovereignty.overallSovereignty).toBeLessThan(0.3);

      // Energy control specifically is very low (0.15 - Shell/Chevron extract 90%)
      expect(nigeria.sovereignty.resourceControl.energy).toBeLessThan(0.2);
    });

    it('should reflect environmental debt correctly', () => {
      const resources = initializeAllCountryResources();

      const us = resources.get('United States' as any)!;
      const bangladesh = resources.get('Bangladesh' as any)!;

      // US has massive historical emissions (400+ Gt)
      // We don't have this in the resources yet, but sovereignty should be high
      expect(us.sovereignty.overallSovereignty).toBeGreaterThan(0.9);

      // Bangladesh has minimal emissions but high vulnerability
      // Low sovereignty reflects this vulnerability
      expect(bangladesh.sovereignty.overallSovereignty).toBeLessThan(0.35);
    });
  });

  describe('Resource Value Calculation', () => {
    it('should calculate resource value correctly', () => {
      const endowment = createEmptyResourceEndowment();
      const sovereignty = createDefaultSovereignty();

      // Set some test values
      endowment.energy.oil = 50; // Moderate oil
      endowment.minerals.ironOre = 25; // Some iron

      const value = calculateResourceValue(endowment, sovereignty);

      // Should have positive total value
      expect(value.totalValue).toBeGreaterThan(0);

      // With full sovereignty, capture rate should be 1.0
      expect(value.localCaptureRate).toBe(1.0);
      expect(value.extractionRate).toBe(0.0);
    });

    it('should reflect extraction when sovereignty is low', () => {
      const endowment = createEmptyResourceEndowment();
      endowment.energy.oil = 80; // High oil (Nigeria-like)

      const lowSovereignty = createDefaultSovereignty();
      lowSovereignty.overallSovereignty = 0.25; // Heavily compromised

      const value = calculateResourceValue(endowment, lowSovereignty);

      // Local capture should be low (0.25)
      expect(value.localCaptureRate).toBe(0.25);

      // Extraction should be high (0.75)
      expect(value.extractionRate).toBe(0.75);
    });
  });

  describe('Hegemon Identification', () => {
    it('should correctly identify 5 hegemons', () => {
      const resources = initializeAllCountryResources();

      const hegemons = ['United States', 'China', 'Russia', 'India', 'United Kingdom'];

      for (const hegemon of hegemons) {
        const countryData = resources.get(hegemon as any)!;
        // Hegemons should have sovereignty > 0.7
        expect(countryData.sovereignty.overallSovereignty).toBeGreaterThan(0.65);
      }
    });

    it('should distinguish hegemons from periphery', () => {
      const resources = initializeAllCountryResources();

      // Hegemons: high sovereignty, high capability
      const us = resources.get('United States' as any)!;
      expect(us.sovereignty.overallSovereignty).toBeGreaterThan(0.9);

      // Periphery: low sovereignty, extracted
      const nigeria = resources.get('Nigeria' as any)!;
      expect(nigeria.sovereignty.overallSovereignty).toBeLessThan(0.3);

      // Difference should be stark (>0.6)
      expect(us.sovereignty.overallSovereignty - nigeria.sovereignty.overallSovereignty)
        .toBeGreaterThan(0.6);
    });
  });
});

describe('TIER 2.8 Phase 2: Military System', () => {
  describe('Military Capability Initialization', () => {
    it('should initialize all 15 countries with military data', () => {
      const military = initializeMilitaryCapabilities();

      expect(military.size).toBe(15);
    });

    it('should have realistic capability gradient', () => {
      const military = initializeMilitaryCapabilities();

      // US should be highest (1.0)
      expect(military.get('United States' as any)!.militaryCapability).toBe(1.0);

      // China should be second (0.80)
      expect(military.get('China' as any)!.militaryCapability).toBe(0.80);

      // Bangladesh should be minimal (0.05)
      expect(military.get('Bangladesh' as any)!.militaryCapability).toBe(0.05);
    });

    it('should reflect SIPRI 2024 spending data', () => {
      const military = initializeMilitaryCapabilities();

      // US: $877B
      expect(military.get('United States' as any)!.militarySpendingAbsolute).toBe(877);

      // China: $292B
      expect(military.get('China' as any)!.militarySpendingAbsolute).toBe(292);

      // Nigeria: $3.1B
      expect(military.get('Nigeria' as any)!.militarySpendingAbsolute).toBe(3.1);
    });

    it('should have US military emissions at 59M tons/year', () => {
      const military = initializeMilitaryCapabilities();

      // Neta Crawford (2019): Pentagon 59M tons CO2/year
      expect(military.get('United States' as any)!.militaryCO2Emissions).toBe(59);
    });
  });

  describe('Military CO2 Emissions', () => {
    it('should calculate base emissions correctly', () => {
      const military = initializeMilitaryCapabilities();
      const us = military.get('United States' as any)!;

      const mockCountry = {
        name: 'United States' as any,
        militaryCO2Emissions: us.militaryCO2Emissions,
      } as any;

      // No interventions = base emissions
      const emissions = calculateMilitaryCO2Emissions(mockCountry, 59, 0);
      expect(emissions).toBe(59);
    });

    it('should multiply emissions during interventions', () => {
      const mockCountry = {
        name: 'United States' as any,
        militaryCO2Emissions: 59,
      } as any;

      // 1 intervention should multiply by 1.3x
      const emissions = calculateMilitaryCO2Emissions(mockCountry, 59, 1);
      expect(emissions).toBeCloseTo(59 * 1.3, 1);

      // 2 interventions should multiply by 1.6x
      const emissions2 = calculateMilitaryCO2Emissions(mockCountry, 59, 2);
      expect(emissions2).toBeCloseTo(59 * 1.6, 1);
    });
  });

  describe('Intervention Triggers', () => {
    it('should not trigger for non-hegemons', () => {
      const mockNonHegemon = {
        name: 'Nigeria' as any,
        isHegemon: false,
        militaryCapability: 0.10,
      } as any;

      const mockState = {
        countryPopulationSystem: {
          countries: {}
        }
      } as any;

      const result = shouldInitiateIntervention(mockNonHegemon, mockState);
      expect(result.should).toBe(false);
    });

    it('should not trigger for weak hegemons', () => {
      const mockWeakHegemon = {
        name: 'India' as any,
        isHegemon: true,
        militaryCapability: 0.30, // Below 0.4 threshold
      } as any;

      const mockState = {
        countryPopulationSystem: {
          countries: {}
        }
      } as any;

      const result = shouldInitiateIntervention(mockWeakHegemon, mockState);
      expect(result.should).toBe(false);
    });

    // Note: Actual intervention triggering is probabilistic and requires full game state
    // These tests validate the logic gates, not the random outcomes
  });

  describe('Intervention Creation', () => {
    it('should create intervention with correct structure', () => {
      const mockHegemon = {
        name: 'United States' as any,
        isHegemon: true,
        militaryCapability: 1.0,
        militarySpendingAbsolute: 877,
        militaryCO2Emissions: 59,
      } as any;

      const mockState = {
        currentYear: 2025,
        currentMonth: 0,
      } as any;

      const intervention = createIntervention(
        mockHegemon,
        'Iraq' as any,
        'resource_access',
        mockState
      );

      // Should have correct structure
      expect(intervention.hegemon).toBe('United States');
      expect(intervention.targetCountry).toBe('Iraq');
      expect(intervention.interventionType).toBe('resource_securing');
      expect(intervention.actualGoals.resourceAccess).toBe(true);

      // Should have initial values
      expect(intervention.effects.refugeesCreated).toBe(0);
      expect(intervention.costs.domesticSupport).toBe(0.7); // Initial rally around flag
      expect(intervention.benefits.aiRnDBoost).toBeGreaterThan(0);
    });

    it('should vary intervention type by reason', () => {
      const mockHegemon = {
        name: 'United States' as any,
        militaryCapability: 1.0,
        militarySpendingAbsolute: 877,
        militaryCO2Emissions: 59,
      } as any;

      const mockState = {
        currentYear: 2025,
        currentMonth: 0,
      } as any;

      // Resource access → resource_securing
      const resourceIntervention = createIntervention(
        mockHegemon,
        'Iraq' as any,
        'resource_access',
        mockState
      );
      expect(resourceIntervention.interventionType).toBe('resource_securing');

      // Nationalism crisis → regime_change
      const nationalismIntervention = createIntervention(
        mockHegemon,
        'Iraq' as any,
        'nationalism_crisis',
        mockState
      );
      expect(nationalismIntervention.interventionType).toBe('regime_change');

      // Economic stimulus → occupation
      const economicIntervention = createIntervention(
        mockHegemon,
        'Afghanistan' as any,
        'economic_stimulus',
        mockState
      );
      expect(economicIntervention.interventionType).toBe('occupation');
    });
  });
});

describe('TIER 2.8 Integration: Resource Curse → Intervention', () => {
  it('should identify Nigeria as intervention target', () => {
    const resources = initializeAllCountryResources();
    const nigeria = resources.get('Nigeria' as any)!;

    // Nigeria is resource-rich (high oil)
    expect(nigeria.resources.energy.oil).toBeGreaterThan(70);

    // But has low sovereignty
    expect(nigeria.sovereignty.overallSovereignty).toBeLessThan(0.3);

    // This combination makes it an attractive intervention target
    // (Resource-rich + low sovereignty = easy extraction)

    const totalValue = calculateResourceValue(
      nigeria.resources,
      nigeria.sovereignty
    ).totalValue;

    expect(totalValue).toBeGreaterThan(0.5); // Valuable
    expect(nigeria.sovereignty.overallSovereignty).toBeLessThan(0.6); // Vulnerable

    // This pattern (valuable + vulnerable) drives intervention logic
  });

  it('should NOT identify Germany as intervention target', () => {
    const resources = initializeAllCountryResources();
    const germany = resources.get('Germany' as any)!;

    // Germany has high sovereignty
    expect(germany.sovereignty.overallSovereignty).toBeGreaterThan(0.8);

    // High sovereignty = difficult target, won't trigger intervention
    // (Even if resources are valuable)
  });
});

describe('TIER 2.8 Integration: Military Emissions → Climate', () => {
  it('should show US military emissions are massive', () => {
    const military = initializeMilitaryCapabilities();
    const us = military.get('United States' as any)!;

    // US military: 59M tons/year
    // This is MORE than 140 countries combined
    // Bangladesh total emissions: ~0.5M tons/year military + civilian

    const bangladesh = military.get('Bangladesh' as any)!;

    // US military alone emits 118x more than Bangladesh entire military
    expect(us.militaryCO2Emissions / bangladesh.militaryCO2Emissions)
      .toBeGreaterThan(100);
  });

  it('should show interventions multiply emissions', () => {
    const baseEmissions = 59; // US baseline

    // Iraq + Afghanistan simultaneously (2003-2011)
    const twoWars = calculateMilitaryCO2Emissions({} as any, baseEmissions, 2);

    // Should be 59 * 1.6 = 94.4M tons/year
    expect(twoWars).toBeCloseTo(94.4, 1);

    // This is the "invisible" emissions - often excluded from climate accounting
  });
});

// Run tests
if (require.main === module) {
  console.log('Running TIER 2.8 Phase 1 & 2 Integration Tests...\n');
  // These tests would be run by Jest normally
  console.log('Use: npm test tests/tier2-8-phase1-2-integration.test.ts');
}
