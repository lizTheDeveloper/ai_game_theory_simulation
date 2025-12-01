/**
 * Physical Constraints Validation Tests
 *
 * Tests assertion utilities for climate, population, energy, and food physics.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import type { GameState } from '@/types/game';
import {
  assertPhysicalClimate,
  assertPhysicalPopulation,
  assertPhysicalEnergy,
  assertPhysicalFood,
  validatePhysicalConstraints
} from '@/simulation/utils/physicalConstraints';

// Mock minimal GameState for testing
function createMockState(overrides?: Partial<GameState>): GameState {
  const defaultState: Partial<GameState> = {
    currentMonth: 0,
    resourceEconomy: {
      co2: {
        atmosphericCO2: 420, // 420 ppm CO2 (2025 baseline)
        temperatureAnomaly: 1.5,
        annualEmissions: 40,
        cumulativeEmissions: 2000,
        oceanAbsorption: 10,
        landAbsorption: 10,
        sinkSaturation: 0.5,
        climateSensitivity: 3.0
      }
    } as any,
    oceanAcidificationSystem: {
      pH: 7.9,
      aragoniteSaturation: 2.8,
      pHLevel: 0.9,
      co2AbsorptionCapacity: 0.8,
      coralReefHealth: 70,
      shellfishPopulation: 0.8,
      marineEcosystemFunction: 75,
      marineFoodWeb: 0.8
    } as any,
    humanPopulationSystem: {
      population: 8.0, // billions
      baselineBirthRate: 0.018, // 1.8% per year = 18 per 1000
      baselineDeathRate: 0.008, // 0.8% per year = 8 per 1000
      adjustedBirthRate: 0.018,
      adjustedDeathRate: 0.008,
      regionalPopulations: []
    } as any,
    powerGenerationSystem: {
      totalElectricityGeneration: 15000, // TWh per month (~180,000 TWh/year)
      renewablePercentage: 0.3,
      nuclearPercentage: 0.1,
      fossilPercentage: 0.6,
      carbonIntensity: 400
    } as any
  };

  return { ...defaultState, ...overrides } as GameState;
}

describe('Physical Constraints Validation', () => {
  const context = { location: 'test', month: 0 };

  describe('assertPhysicalClimate', () => {
    it('should accept valid climate state', () => {
      const state = createMockState();
      expect(() => assertPhysicalClimate(state, context)).not.toThrow();
    });

    it('should reject CO2 below pre-industrial minimum', () => {
      const state = createMockState({
        resourceEconomy: {
          co2: {
            atmosphericCO2: 250 * 2.12, // 250 ppm (below 280)
            temperatureAnomaly: 0,
            // methaneConcentration not in CO2System - removed test 1900
          }
        } as any
      });
      expect(() => assertPhysicalClimate(state, context)).toThrow(/CO2 concentration/);
    });

    it('should reject CO2 above runaway greenhouse threshold', () => {
      const state = createMockState({
        resourceEconomy: {
          co2: {
            atmosphericCO2: 1100 * 2.12, // 1100 ppm (above 1000)
            temperatureAnomaly: 6.0,
            // methaneConcentration not in CO2System - removed test 2000
          }
        } as any
      });
      expect(() => assertPhysicalClimate(state, context)).toThrow(/CO2 concentration/);
    });

    it('should reject temperature below ice age minimum', () => {
      const state = createMockState({
        resourceEconomy: {
          co2: {
            atmosphericCO2: 400 * 2.12,
            temperatureAnomaly: -3.0, // Below -2°C
            // methaneConcentration not in CO2System - removed test 1900
          }
        } as any
      });
      expect(() => assertPhysicalClimate(state, context)).toThrow(/Temperature anomaly/);
    });

    it('should reject temperature above Venus scenario', () => {
      const state = createMockState({
        resourceEconomy: {
          co2: {
            atmosphericCO2: 900 * 2.12,
            temperatureAnomaly: 9.0, // Above +8°C
            // methaneConcentration not in CO2System - removed test 2000
          }
        } as any
      });
      expect(() => assertPhysicalClimate(state, context)).toThrow(/Temperature anomaly/);
    });

    it('should reject methane below pre-industrial minimum', () => {
      const state = createMockState({
        resourceEconomy: {
          co2: {
            atmosphericCO2: 400 * 2.12,
            temperatureAnomaly: 1.5,
            // methaneConcentration not in CO2System - removed test 600 // Below 700 ppb
          }
        } as any
      });
      expect(() => assertPhysicalClimate(state, context)).toThrow(/Methane concentration/);
    });

    it('should reject methane above clathrate gun', () => {
      const state = createMockState({
        resourceEconomy: {
          co2: {
            atmosphericCO2: 500 * 2.12,
            temperatureAnomaly: 2.0,
            // methaneConcentration not in CO2System - removed test 5500 // Above 5000 ppb
          }
        } as any
      });
      expect(() => assertPhysicalClimate(state, context)).toThrow(/Methane concentration/);
    });

    it('should reject ocean pH below extreme acidification', () => {
      const state = createMockState({
        oceanAcidificationSystem: {
          pH: 6.8 // Below 7.0
        } as any
      });
      expect(() => assertPhysicalClimate(state, context)).toThrow(/Ocean pH/);
    });

    it('should reject ocean pH above alkalinity limit', () => {
      const state = createMockState({
        oceanAcidificationSystem: {
          pH: 8.7 // Above 8.5
        } as any
      });
      expect(() => assertPhysicalClimate(state, context)).toThrow(/Ocean pH/);
    });

    it('should accept boundary values', () => {
      const stateMin = createMockState({
        resourceEconomy: {
          co2: {
            atmosphericCO2: 280 * 2.12, // Exactly 280 ppm
            temperatureAnomaly: -2.0, // Exactly -2°C
            // methaneConcentration not in CO2System - removed test 700 // Exactly 700 ppb
          }
        } as any,
        oceanAcidificationSystem: {
          pH: 7.0 // Exactly 7.0
        } as any
      });
      expect(() => assertPhysicalClimate(stateMin, context)).not.toThrow();

      const stateMax = createMockState({
        resourceEconomy: {
          co2: {
            atmosphericCO2: 1000 * 2.12, // Exactly 1000 ppm
            temperatureAnomaly: 8.0, // Exactly +8°C
            // methaneConcentration not in CO2System - removed test 5000 // Exactly 5000 ppb
          }
        } as any,
        oceanAcidificationSystem: {
          pH: 8.5 // Exactly 8.5
        } as any
      });
      expect(() => assertPhysicalClimate(stateMax, context)).not.toThrow();
    });
  });

  describe('assertPhysicalPopulation', () => {
    it('should accept valid population state', () => {
      const state = createMockState();
      expect(() => assertPhysicalPopulation(state, context)).not.toThrow();
    });

    it('should reject negative population', () => {
      const state = createMockState({
        humanPopulationSystem: {
          population: -0.5,
          birthRate: 18,
          deathRate: 8
        } as any
      });
      expect(() => assertPhysicalPopulation(state, context)).toThrow(/Human population/);
    });

    it('should reject population above Earth carrying capacity', () => {
      const state = createMockState({
        humanPopulationSystem: {
          population: 25.0, // Above 20B
          birthRate: 20,
          deathRate: 10
        } as any
      });
      expect(() => assertPhysicalPopulation(state, context)).toThrow(/Human population/);
    });

    it('should reject negative birth rate', () => {
      const state = createMockState({
        humanPopulationSystem: {
          population: 8.0,
          birthRate: -5,
          deathRate: 10
        } as any
      });
      expect(() => assertPhysicalPopulation(state, context)).toThrow(/Birth rate/);
    });

    it('should reject birth rate above historical maximum', () => {
      const state = createMockState({
        humanPopulationSystem: {
          population: 8.0,
          birthRate: 70, // Above 60 per 1000
          deathRate: 10
        } as any
      });
      expect(() => assertPhysicalPopulation(state, context)).toThrow(/Birth rate/);
    });

    it('should reject death rate above total mortality', () => {
      const state = createMockState({
        humanPopulationSystem: {
          population: 8.0,
          birthRate: 18,
          deathRate: 110 // Above 100 per 1000
        } as any
      });
      expect(() => assertPhysicalPopulation(state, context)).toThrow(/Death rate/);
    });

    it('should accept boundary values', () => {
      const stateMin = createMockState({
        humanPopulationSystem: {
          population: 0, // Extinction
          birthRate: 0,
          deathRate: 0
        } as any
      });
      expect(() => assertPhysicalPopulation(stateMin, context)).not.toThrow();

      const stateMax = createMockState({
        humanPopulationSystem: {
          population: 20.0, // Maximum carrying capacity
          birthRate: 60,
          deathRate: 100
        } as any
      });
      expect(() => assertPhysicalPopulation(stateMax, context)).not.toThrow();
    });
  });

  describe('assertPhysicalEnergy', () => {
    it('should accept valid energy state', () => {
      const state = createMockState();
      expect(() => assertPhysicalEnergy(state, context)).not.toThrow();
    });

    it('should reject negative energy production', () => {
      const state = createMockState({
        powerGenerationSystem: {
          totalProduction: -1000,
          sources: {}
        } as any
      });
      expect(() => assertPhysicalEnergy(state, context)).toThrow(/Global energy production/);
    });

    it('should reject energy production above theoretical maximum', () => {
      const state = createMockState({
        powerGenerationSystem: {
          totalProduction: 3_500_000, // Above 3M TWh
          sources: {}
        } as any
      });
      expect(() => assertPhysicalEnergy(state, context)).toThrow(/Global energy production/);
    });

    it('should reject deployment share above 100%', () => {
      const state = createMockState({
        powerGenerationSystem: {
          totalProduction: 180000,
          sources: {
            solar: { share: 1.2 } // Above 1.0
          }
        } as any
      });
      expect(() => assertPhysicalEnergy(state, context)).toThrow(/deployment share/);
    });

    it('should reject negative deployment share', () => {
      const state = createMockState({
        powerGenerationSystem: {
          totalProduction: 180000,
          sources: {
            wind: { share: -0.1 }
          }
        } as any
      });
      expect(() => assertPhysicalEnergy(state, context)).toThrow(/deployment share/);
    });

    it('should accept boundary values', () => {
      const stateMin = createMockState({
        powerGenerationSystem: {
          totalProduction: 0, // Collapse
          sources: {
            solar: { share: 0 },
            wind: { share: 0 }
          }
        } as any
      });
      expect(() => assertPhysicalEnergy(stateMin, context)).not.toThrow();

      const stateMax = createMockState({
        powerGenerationSystem: {
          totalProduction: 3_000_000, // Theoretical maximum
          sources: {
            solar: { share: 1.0 } // 100%
          }
        } as any
      });
      expect(() => assertPhysicalEnergy(stateMax, context)).not.toThrow();
    });
  });

  describe('assertPhysicalFood', () => {
    it('should accept valid food state', () => {
      const state = createMockState();
      expect(() => assertPhysicalFood(state, context)).not.toThrow();
    });

    it('should reject negative food production index', () => {
      const state = createMockState({
        globalFoodProductionIndex: -10
      });
      expect(() => assertPhysicalFood(state, context)).toThrow(/Global food production index/);
    });

    it('should reject food production above maximum vertical farming', () => {
      const state = createMockState({
        globalFoodProductionIndex: 250 // Above 200%
      });
      expect(() => assertPhysicalFood(state, context)).toThrow(/Global food production index/);
    });

    it('should reject regional food security above 1.0', () => {
      const state = createMockState({
        humanPopulationSystem: {
          population: 8.0,
          birthRate: 18,
          deathRate: 8,
          regionalPopulations: [
            { name: 'Asia', foodSecurity: 1.5 } as any
          ]
        } as any
      });
      expect(() => assertPhysicalFood(state, context)).toThrow(/food security/);
    });

    it('should reject regional food security below 0', () => {
      const state = createMockState({
        humanPopulationSystem: {
          population: 8.0,
          birthRate: 18,
          deathRate: 8,
          regionalPopulations: [
            { name: 'Africa', foodSecurity: -0.2 } as any
          ]
        } as any
      });
      expect(() => assertPhysicalFood(state, context)).toThrow(/food security/);
    });

    it('should accept boundary values', () => {
      const stateMin = createMockState({
        globalFoodProductionIndex: 0, // Famine
        humanPopulationSystem: {
          population: 8.0,
          birthRate: 18,
          deathRate: 8,
          regionalPopulations: [
            { name: 'Asia', foodSecurity: 0 } as any
          ]
        } as any
      });
      expect(() => assertPhysicalFood(stateMin, context)).not.toThrow();

      const stateMax = createMockState({
        globalFoodProductionIndex: 200, // Maximum vertical farming
        humanPopulationSystem: {
          population: 8.0,
          birthRate: 18,
          deathRate: 8,
          regionalPopulations: [
            { name: 'Asia', foodSecurity: 1.0 } as any
          ]
        } as any
      });
      expect(() => assertPhysicalFood(stateMax, context)).not.toThrow();
    });
  });

  describe('validatePhysicalConstraints (master function)', () => {
    it('should validate all constraints in one call', () => {
      const state = createMockState();
      expect(() => validatePhysicalConstraints(state, 0)).not.toThrow();
    });

    it('should report which constraint failed', () => {
      const state = createMockState({
        resourceEconomy: {
          co2: {
            atmosphericCO2: 1200 * 2.12, // Invalid CO2
            temperatureAnomaly: 1.5,
            // methaneConcentration not in CO2System - removed test 1900
          }
        } as any
      });
      expect(() => validatePhysicalConstraints(state, 0)).toThrow(/CO2 concentration/);
    });

    it('should fail on first violation (does not continue checking)', () => {
      const state = createMockState({
        resourceEconomy: {
          co2: {
            atmosphericCO2: 1200 * 2.12, // Invalid CO2
            temperatureAnomaly: 10.0, // Invalid temp
            // methaneConcentration not in CO2System - removed test 6000 // Invalid methane
          }
        } as any
      });
      // Should throw on first violation (CO2), not accumulate all errors
      expect(() => validatePhysicalConstraints(state, 0)).toThrow(/CO2 concentration/);
    });

    it('should handle missing optional fields gracefully', () => {
      const state = createMockState({
        oceanAcidificationSystem: undefined // Missing ocean system
      });
      expect(() => validatePhysicalConstraints(state, 0)).not.toThrow();
    });
  });
});
