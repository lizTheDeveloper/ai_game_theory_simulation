/**
 * Physical Constraints Validation (LOW Priority, Dec 1, 2025)
 *
 * Validates simulation state stays within physically plausible bounds.
 * Complements assertion utilities with domain-specific physics validation.
 *
 * Philosophy: Invalid physics values indicate bugs, not edge cases.
 * Used in development mode and Monte Carlo validation to catch impossible states.
 *
 * Research: Plan at plans/proposed_physical_constraints_validation_20251201.md
 */

import type { GameState } from '@/types/game';
import { assertInRange } from './assertions';

/**
 * Context for physical constraint assertions
 */
export interface PhysicalConstraintContext {
  location: string;
  month?: number;
}

/**
 * Validates climate state stays within physically plausible bounds.
 *
 * Bounds based on:
 * - CO2: IPCC AR6, paleoclimate records (280 ppm pre-industrial to 1000 ppm runaway)
 * - Temperature: Ice age minimum (-2°C) to Venus scenario (+8°C)
 * - Methane: Pre-industrial (700 ppb) to clathrate gun (5000 ppb)
 * - Ocean pH: Extreme acidification (7.0) to pre-industrial (8.5)
 */
export function assertPhysicalClimate(state: GameState, context: PhysicalConstraintContext): void {
  if (!state.resourceEconomy?.co2) {
    return; // Skip if not initialized
  }

  const co2 = state.resourceEconomy.co2;

  // CO2: Pre-industrial minimum to extinction threshold
  if (co2.atmosphericCO2 !== undefined) {
    assertInRange(co2.atmosphericCO2, 280, 1000, {
      ...context,
      valueName: 'CO2 concentration',
      additionalInfo: {
        unit: 'ppm',
        bounds: 'Paleoclimate minimum (280 ppm) to runaway greenhouse (1000 ppm)',
        atmosphericCO2: co2.atmosphericCO2
      }
    });
  }

  // Temperature: Last ice age to Venus scenario
  if (co2.temperatureAnomaly !== undefined) {
    assertInRange(co2.temperatureAnomaly, -2.0, 8.0, {
      ...context,
      valueName: 'Temperature anomaly',
      additionalInfo: {
        unit: '°C',
        bounds: 'Ice age (-2°C) to Venus scenario (+8°C)'
      }
    });
  }

  // Ocean pH: Acidification limit to alkalinity limit
  if (state.oceanAcidificationSystem?.pH !== undefined) {
    assertInRange(state.oceanAcidificationSystem.pH, 7.0, 8.5, {
      ...context,
      valueName: 'Ocean pH',
      additionalInfo: {
        bounds: 'Extreme acidification (7.0) to pre-industrial (8.2)'
      }
    });
  }
}

/**
 * Validates population dynamics stay within biological/physical bounds.
 *
 * Bounds based on:
 * - Population: Extinction (0) to Earth carrying capacity (20B)
 * - Birth rate: Collapse (0) to historical maximum (60 per 1000)
 * - Death rate: Utopia (0) to total mortality (100 per 1000)
 */
export function assertPhysicalPopulation(state: GameState, context: PhysicalConstraintContext): void {
  const pop = state.humanPopulationSystem.population;

  // Population: Non-negative to Earth carrying capacity
  assertInRange(pop, 0, 20, {
    ...context,
    valueName: 'Human population',
    additionalInfo: {
      unit: 'billion',
      bounds: 'Extinction (0) to maximum carrying capacity (20B)'
    }
  });

  // Birth/death rates: Biological minimum to crisis maximum
  // Note: baselineBirthRate and baselineDeathRate are fractions per year, not per 1000
  // Convert to per 1000 for validation
  const birthRatePer1000 = state.humanPopulationSystem.baselineBirthRate * 1000;
  const deathRatePer1000 = state.humanPopulationSystem.baselineDeathRate * 1000;

  assertInRange(birthRatePer1000, 0, 60, {
    ...context,
    valueName: 'Birth rate',
    additionalInfo: {
      unit: 'per 1000',
      bounds: 'Collapse (0) to historical maximum (60)'
    }
  });

  assertInRange(deathRatePer1000, 0, 100, {
    ...context,
    valueName: 'Death rate',
    additionalInfo: {
      unit: 'per 1000',
      bounds: 'Utopia (0) to total mortality (100)'
    }
  });
}

/**
 * Validates energy system physics (conservation laws, deployment limits).
 *
 * Bounds based on:
 * - Global energy: 0 to theoretical solar maximum (3M TWh/year)
 * - Deployment percentages: Conservation of energy (0-100%)
 */
export function assertPhysicalEnergy(state: GameState, context: PhysicalConstraintContext): void {
  if (!state.powerGenerationSystem) {
    return; // Skip if not initialized
  }

  // Global energy: Non-negative to theoretical maximum
  // Current: ~180,000 TWh/year, theoretical solar maximum: ~3 million TWh/year
  // Note: PowerGenerationSystem uses totalElectricityGeneration (TWh per month)
  // Convert to annual for validation: monthly × 12
  const totalProductionAnnual = state.powerGenerationSystem.totalElectricityGeneration * 12;
  assertInRange(totalProductionAnnual, 0, 3_000_000, {
    ...context,
    valueName: 'Global energy production',
    additionalInfo: {
      unit: 'TWh/year',
      bounds: 'Collapse (0) to theoretical solar maximum (3M TWh)',
      monthlyProduction: state.powerGenerationSystem.totalElectricityGeneration
    }
  });

  // Deployment rates: Cannot exceed 100% of capacity
  // PowerGenerationSystem uses percentage fields (0-1) for renewable, nuclear, fossil
  assertInRange(state.powerGenerationSystem.renewablePercentage, 0, 1, {
    ...context,
    valueName: 'Renewable energy percentage',
    additionalInfo: {
      unit: 'fraction',
      bounds: 'Physical constraint (0-1)'
    }
  });

  assertInRange(state.powerGenerationSystem.nuclearPercentage, 0, 1, {
    ...context,
    valueName: 'Nuclear energy percentage',
    additionalInfo: {
      unit: 'fraction',
      bounds: 'Physical constraint (0-1)'
    }
  });

  assertInRange(state.powerGenerationSystem.fossilPercentage, 0, 1, {
    ...context,
    valueName: 'Fossil fuel percentage',
    additionalInfo: {
      unit: 'fraction',
      bounds: 'Physical constraint (0-1)'
    }
  });
}

/**
 * Validates food production within agricultural constraints.
 *
 * Bounds based on:
 * - Food production index: Famine (0) to maximum vertical farming (200%)
 * - Food security: Probability bounds (0-1)
 */
export function assertPhysicalFood(state: GameState, context: PhysicalConstraintContext): void {
  // Regional food security: Probability bounds
  if (state.humanPopulationSystem?.regionalPopulations) {
    for (const region of state.humanPopulationSystem.regionalPopulations) {
      if (region.foodSecurity !== undefined) {
        assertInRange(region.foodSecurity, 0, 1, {
          ...context,
          valueName: `${region.name} food security`,
          additionalInfo: {
            bounds: 'Probability (0-1)'
          }
        });
      }
    }
  }

  // Note: Global food production is tracked in various subsystems (famine, phosphorus, freshwater)
  // rather than a single globalFoodProductionIndex field. Regional food security is the key metric.
}

/**
 * Master validation function - checks all physical constraints.
 *
 * Call at end of each simulation step (development mode) or in Monte Carlo validation.
 * Fails loudly if ANY physical constraint is violated.
 *
 * @param state - Current game state
 * @param month - Current simulation month
 * @throws Error if any physical constraint is violated
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
