/**
 * Physical Constraints Validation Tests
 *
 * Tests for physically plausible bounds validation utilities.
 * Ensures simulation cannot produce values that violate conservation laws or physical limits.
 */

import { describe, it, expect } from 'vitest';
import {
  assertPhysicalClimate,
  assertPhysicalPopulation,
  assertPhysicalEnergy,
  assertPhysicalFood,
  validatePhysicalConstraints
} from '../../../src/simulation/utils/physicalConstraints';
import type { GameState } from '../../../src/types/game';

// Minimal valid state fixture
function createMinimalState(): GameState {
  return {
    resourceEconomy: {
      co2: {
        atmosphericCO2: 420,
        temperatureAnomaly: 1.2,
        annualEmissions: 40,
        cumulativeEmissions: 2000,
        oceanAbsorption: 10,
        landAbsorption: 10,
        sinkSaturation: 0.3,
        climateSensitivity: 3.0,
        arcticIceLoss: 0.2,
        permafrostThaw: 0.1,
        amazonDieback: 0.05
      },
      energy: {
        totalProduction: 180000,
        renewablePercentage: 30,
        carbonIntensity: 0.5,
        gridEfficiency: 0.85,
        storageCapacity: 100,
        renewableCapacity: 50000,
        capacityBySource: {
          coal: 10000,
          oil: 5000,
          naturalGas: 8000,
          nuclear: 3000,
          solar: 15000,
          wind: 20000,
          hydro: 12000,
          fusion: 0
        }
      }
    },
    humanPopulationSystem: {
      population: 8.0,
      baselinePopulation: 8.0,
      peakPopulation: 8.0,
      peakPopulationMonth: 0,
      baselineBirthRate: 0.018,
      baselineDeathRate: 0.008,
      adjustedBirthRate: 0.018,
      adjustedDeathRate: 0.008,
      netGrowthRate: 0.010,
      carryingCapacity: 12.0,
      baselineCarryingCapacity: 12.0,
      capacityModifier: 1.0,
      populationPressure: 0.67,
      fertilityRate: 2.3,
      dependencyRatio: 0.5,
      medianAge: 30,
      monthlyExcessDeaths: 0,
      cumulativeCrisisDeaths: 0,
      geneticBottleneckActive: false,
      monthlyDeathsApplied: 0,
      deathsByCategory: {
        war: 0,
        famine: 0,
        disasters: 0,
        disease: 0,
        ecosystem: 0,
        pollution: 0,
        ai: 0,
        cascade: 0,
        other: 0
      },
      deathsByRootCause: {
        climate: 0,
        resource: 0,
        pollution: 0,
        ecosystem: 0,
        inequality: 0,
        demographic: 0,
        social: 0,
        governance: 0,
        technology: 0
      }
    },
    oceanAcidificationSystem: {
      pH: 8.1,
      aragoniteSaturation: 3.0,
      pHLevel: 0.8,
      co2AbsorptionCapacity: 0.7,
      coralReefHealth: 0.6
    },
    currentMonth: 0
  } as GameState;
}

describe('Physical Constraints - Climate', () => {
  it('validates valid CO2 concentration (420 ppm)', () => {
    const state = createMinimalState();
    expect(() => assertPhysicalClimate(state, { location: 'test', month: 0 })).not.toThrow();
  });

  it('rejects CO2 below paleoclimate minimum (< 280 ppm)', () => {
    const state = createMinimalState();
    state.resourceEconomy.co2.atmosphericCO2 = 250;
    expect(() => assertPhysicalClimate(state, { location: 'test', month: 0 })).toThrow('atmosphericCO2');
  });

  it('rejects CO2 above runaway greenhouse (> 1000 ppm)', () => {
    const state = createMinimalState();
    state.resourceEconomy.co2.atmosphericCO2 = 1100;
    expect(() => assertPhysicalClimate(state, { location: 'test', month: 0 })).toThrow('atmosphericCO2');
  });

  it('validates valid temperature anomaly (1.2°C)', () => {
    const state = createMinimalState();
    expect(() => assertPhysicalClimate(state, { location: 'test', month: 0 })).not.toThrow();
  });

  it('rejects temperature below ice age (< -2°C)', () => {
    const state = createMinimalState();
    state.resourceEconomy.co2.temperatureAnomaly = -3.0;
    expect(() => assertPhysicalClimate(state, { location: 'test', month: 0 })).toThrow('temperatureAnomaly');
  });

  it('rejects temperature above Venus scenario (> 8°C)', () => {
    const state = createMinimalState();
    state.resourceEconomy.co2.temperatureAnomaly = 9.0;
    expect(() => assertPhysicalClimate(state, { location: 'test', month: 0 })).toThrow('temperatureAnomaly');
  });

  it('validates valid ocean pH (8.1)', () => {
    const state = createMinimalState();
    expect(() => assertPhysicalClimate(state, { location: 'test', month: 0 })).not.toThrow();
  });

  it('rejects ocean pH below extreme acidification (< 7.0)', () => {
    const state = createMinimalState();
    state.oceanAcidificationSystem.pH = 6.8;
    expect(() => assertPhysicalClimate(state, { location: 'test', month: 0 })).toThrow('pH');
  });

  it('rejects ocean pH above pre-industrial maximum (> 8.5)', () => {
    const state = createMinimalState();
    state.oceanAcidificationSystem.pH = 8.7;
    expect(() => assertPhysicalClimate(state, { location: 'test', month: 0 })).toThrow('pH');
  });
});

describe('Physical Constraints - Population', () => {
  it('validates valid population (8B)', () => {
    const state = createMinimalState();
    expect(() => assertPhysicalPopulation(state, { location: 'test', month: 0 })).not.toThrow();
  });

  it('rejects negative population', () => {
    const state = createMinimalState();
    state.humanPopulationSystem.population = -1;
    expect(() => assertPhysicalPopulation(state, { location: 'test', month: 0 })).toThrow('population');
  });

  it('rejects population above carrying capacity (> 20B)', () => {
    const state = createMinimalState();
    state.humanPopulationSystem.population = 25;
    expect(() => assertPhysicalPopulation(state, { location: 'test', month: 0 })).toThrow('population');
  });

  it('validates boundary population (0B - extinction)', () => {
    const state = createMinimalState();
    state.humanPopulationSystem.population = 0;
    expect(() => assertPhysicalPopulation(state, { location: 'test', month: 0 })).not.toThrow();
  });

  it('validates boundary population (20B - maximum)', () => {
    const state = createMinimalState();
    state.humanPopulationSystem.population = 20;
    expect(() => assertPhysicalPopulation(state, { location: 'test', month: 0 })).not.toThrow();
  });

  it('validates valid birth rate (0.018)', () => {
    const state = createMinimalState();
    expect(() => assertPhysicalPopulation(state, { location: 'test', month: 0 })).not.toThrow();
  });

  it('rejects birth rate above biological maximum (> 0.060)', () => {
    const state = createMinimalState();
    state.humanPopulationSystem.adjustedBirthRate = 0.080;
    expect(() => assertPhysicalPopulation(state, { location: 'test', month: 0 })).toThrow('adjustedBirthRate');
  });

  it('validates valid death rate (0.008)', () => {
    const state = createMinimalState();
    expect(() => assertPhysicalPopulation(state, { location: 'test', month: 0 })).not.toThrow();
  });

  it('rejects death rate above total mortality (> 0.100)', () => {
    const state = createMinimalState();
    state.humanPopulationSystem.adjustedDeathRate = 0.150;
    expect(() => assertPhysicalPopulation(state, { location: 'test', month: 0 })).toThrow('adjustedDeathRate');
  });
});

describe('Physical Constraints - Energy', () => {
  it('validates valid energy production (180k TWh)', () => {
    const state = createMinimalState();
    expect(() => assertPhysicalEnergy(state, { location: 'test', month: 0 })).not.toThrow();
  });

  it('rejects negative energy production', () => {
    const state = createMinimalState();
    state.resourceEconomy.energy!.totalProduction = -1000;
    expect(() => assertPhysicalEnergy(state, { location: 'test', month: 0 })).toThrow('totalProduction');
  });

  it('rejects energy production above theoretical solar maximum (> 3M TWh)', () => {
    const state = createMinimalState();
    state.resourceEconomy.energy!.totalProduction = 3_500_000;
    expect(() => assertPhysicalEnergy(state, { location: 'test', month: 0 })).toThrow('totalProduction');
  });

  it('validates valid renewable percentage (30%)', () => {
    const state = createMinimalState();
    expect(() => assertPhysicalEnergy(state, { location: 'test', month: 0 })).not.toThrow();
  });

  it('rejects renewable percentage above 100%', () => {
    const state = createMinimalState();
    state.resourceEconomy.energy!.renewablePercentage = 105;
    expect(() => assertPhysicalEnergy(state, { location: 'test', month: 0 })).toThrow('renewablePercentage');
  });

  it('validates boundary renewable percentage (0%)', () => {
    const state = createMinimalState();
    state.resourceEconomy.energy!.renewablePercentage = 0;
    expect(() => assertPhysicalEnergy(state, { location: 'test', month: 0 })).not.toThrow();
  });

  it('validates boundary renewable percentage (100%)', () => {
    const state = createMinimalState();
    state.resourceEconomy.energy!.renewablePercentage = 100;
    expect(() => assertPhysicalEnergy(state, { location: 'test', month: 0 })).not.toThrow();
  });
});

describe('Physical Constraints - Food', () => {
  it('validates state (food system not yet implemented)', () => {
    const state = createMinimalState();
    // Food validation is currently a no-op placeholder
    // Will be expanded when globalFoodProductionIndex is added to GameState
    expect(() => assertPhysicalFood(state, { location: 'test', month: 0 })).not.toThrow();
  });
});

describe('Physical Constraints - Master Validation', () => {
  it('validates completely valid state', () => {
    const state = createMinimalState();
    expect(() => validatePhysicalConstraints(state, 0)).not.toThrow();
  });

  it('rejects state with climate violation', () => {
    const state = createMinimalState();
    state.resourceEconomy.co2.atmosphericCO2 = 1100;
    expect(() => validatePhysicalConstraints(state, 0)).toThrow();
  });

  it('rejects state with population violation', () => {
    const state = createMinimalState();
    state.humanPopulationSystem.population = -1;
    expect(() => validatePhysicalConstraints(state, 0)).toThrow();
  });

  it('rejects state with energy violation', () => {
    const state = createMinimalState();
    state.resourceEconomy.energy!.renewablePercentage = 150;
    expect(() => validatePhysicalConstraints(state, 0)).toThrow();
  });

  it('provides month in error context', () => {
    const state = createMinimalState();
    state.resourceEconomy.co2.temperatureAnomaly = 10.0;
    expect(() => validatePhysicalConstraints(state, 42)).toThrow(/month.*42/i);
  });
});
