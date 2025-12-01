/**
 * Physical Constraints Validation Utilities
 *
 * Validates simulation state stays within physically plausible bounds.
 * Complements assertion utilities with domain-specific physical constraints.
 *
 * Philosophy: Physically impossible values indicate bugs. Fail loudly with context.
 * This is a research simulation - we don't mask bugs, we fix them.
 *
 * Research backing:
 * - Climate: IPCC AR6 (2021-2023), paleoclimate records
 * - Population: UN WPP 2024, carrying capacity literature
 * - Energy: IEA 2024, theoretical solar maximum
 * - Food: FAO 2024, vertical farming limits
 *
 * @see plans/proposed_physical_constraints_validation_20251201.md
 */

import { assertInRange, assertDefined } from './assertions';
import type { GameState } from '@/types/game';

/**
 * Context for physical constraint assertions
 */
interface PhysicalConstraintContext {
  location: string;
  month: number;
  additionalInfo?: Record<string, unknown>;
}

/**
 * Validates climate state stays within physically plausible bounds.
 *
 * Bounds based on:
 * - CO2: Paleoclimate minimum (280 ppm) to runaway greenhouse (1000 ppm)
 * - Temperature: Last ice age (-2°C) to Venus scenario (+8°C)
 * - Ocean pH: Extreme acidification (7.0) to pre-industrial (8.5)
 *
 * Research: IPCC AR6, Steffen et al. (2018) Hothouse Earth pathways
 */
export function assertPhysicalClimate(state: GameState, context: PhysicalConstraintContext): void {
  const co2System = assertDefined(state.resourceEconomy?.co2, {
    location: context.location,
    valueName: 'resourceEconomy.co2',
    month: context.month
  });

  // CO2: Pre-industrial minimum to extinction threshold
  assertInRange(co2System.atmosphericCO2, 280, 1000, {
    location: context.location,
    valueName: 'atmosphericCO2',
    month: context.month,
    additionalInfo: {
      unit: 'ppm',
      bounds: 'Paleoclimate minimum (280 ppm) to runaway greenhouse (1000 ppm)',
      ...context.additionalInfo
    }
  });

  // Temperature: Last ice age to Venus scenario
  assertInRange(co2System.temperatureAnomaly, -2.0, 8.0, {
    location: context.location,
    valueName: 'temperatureAnomaly',
    month: context.month,
    additionalInfo: {
      unit: '°C',
      bounds: 'Ice age (-2°C) to Venus scenario (+8°C)',
      ...context.additionalInfo
    }
  });

  // Ocean pH (from ocean acidification system)
  if (state.oceanAcidificationSystem?.pH !== undefined) {
    assertInRange(state.oceanAcidificationSystem.pH, 7.0, 8.5, {
      location: context.location,
      valueName: 'oceanAcidificationSystem.pH',
      month: context.month,
      additionalInfo: {
        bounds: 'Extreme acidification (7.0) to pre-industrial (8.2)',
        ...context.additionalInfo
      }
    });
  }
}

/**
 * Validates population dynamics stay within biological/physical bounds.
 *
 * Bounds based on:
 * - Population: Extinction (0) to Earth carrying capacity (20B)
 * - Birth rate: Collapse (0) to historical maximum (60/1000)
 * - Death rate: Utopia (0) to total mortality (100/1000)
 *
 * Research: UN WPP 2024, Cohen (1995) carrying capacity estimates
 */
export function assertPhysicalPopulation(state: GameState, context: PhysicalConstraintContext): void {
  const popSystem = assertDefined(state.humanPopulationSystem, {
    location: context.location,
    valueName: 'humanPopulationSystem',
    month: context.month
  });

  // Population: Non-negative to Earth carrying capacity
  assertInRange(popSystem.population, 0, 20, {
    location: context.location,
    valueName: 'population',
    month: context.month,
    additionalInfo: {
      unit: 'billion',
      bounds: 'Extinction (0) to maximum carrying capacity (20B)',
      ...context.additionalInfo
    }
  });

  // Birth rate: Biological minimum to crisis maximum
  if (popSystem.adjustedBirthRate !== undefined) {
    assertInRange(popSystem.adjustedBirthRate, 0, 0.060, {
      location: context.location,
      valueName: 'adjustedBirthRate',
      month: context.month,
      additionalInfo: {
        unit: 'per capita per year',
        bounds: 'Collapse (0) to historical maximum (0.060)',
        ...context.additionalInfo
      }
    });
  }

  // Death rate: Biological minimum to total mortality
  if (popSystem.adjustedDeathRate !== undefined) {
    assertInRange(popSystem.adjustedDeathRate, 0, 0.100, {
      location: context.location,
      valueName: 'adjustedDeathRate',
      month: context.month,
      additionalInfo: {
        unit: 'per capita per year',
        bounds: 'Utopia (0) to total mortality (0.100)',
        ...context.additionalInfo
      }
    });
  }
}

/**
 * Validates energy system physics (conservation laws, deployment limits).
 *
 * Bounds based on:
 * - Total production: Collapse (0) to theoretical solar maximum (3M TWh/year)
 * - Renewable percentage: 0-100% (conservation constraint)
 *
 * Research: IEA World Energy Outlook 2024, Smil (2017) Energy and Civilization
 */
export function assertPhysicalEnergy(state: GameState, context: PhysicalConstraintContext): void {
  if (!state.resourceEconomy?.energy) {
    return; // Energy system optional in some scenarios
  }

  const energy = state.resourceEconomy.energy;

  // Global energy: Non-negative to theoretical maximum
  // Current: ~180,000 TWh/year, theoretical solar maximum: ~3 million TWh/year
  if (energy.totalProduction !== undefined) {
    assertInRange(energy.totalProduction, 0, 3_000_000, {
      location: context.location,
      valueName: 'energy.totalProduction',
      month: context.month,
      additionalInfo: {
        unit: 'TWh/year',
        bounds: 'Collapse (0) to theoretical solar maximum (3M TWh)',
        ...context.additionalInfo
      }
    });
  }

  // Renewable percentage: Cannot exceed 100%
  if (energy.renewablePercentage !== undefined) {
    assertInRange(energy.renewablePercentage, 0, 100, {
      location: context.location,
      valueName: 'energy.renewablePercentage',
      month: context.month,
      additionalInfo: {
        unit: '%',
        bounds: 'Physical constraint (0-100%)',
        ...context.additionalInfo
      }
    });
  }
}

/**
 * Validates food production within agricultural constraints.
 *
 * Currently minimal - food system validation can be expanded when
 * globalFoodProductionIndex and regional food security systems are added.
 *
 * Research: FAO State of Food Security 2024, vertical farming projections
 */
export function assertPhysicalFood(state: GameState, context: PhysicalConstraintContext): void {
  // Food system validation placeholder
  // Can be expanded when food production tracking is added to GameState
  // Expected fields: globalFoodProductionIndex [0, 200], regional food security [0, 1]
}

/**
 * Master validation function - checks all physical constraints.
 *
 * Call at end of each simulation step (development mode) or in Monte Carlo validation.
 * Fails loudly if any physical constraint is violated.
 *
 * @param state - Current simulation state
 * @param month - Current simulation month (for error context)
 * @throws AssertionError if any physical constraint is violated
 */
export function validatePhysicalConstraints(state: GameState, month: number): void {
  const context: PhysicalConstraintContext = {
    location: 'validatePhysicalConstraints',
    month
  };

  assertPhysicalClimate(state, context);
  assertPhysicalPopulation(state, context);
  assertPhysicalEnergy(state, context);
  assertPhysicalFood(state, context);
}
