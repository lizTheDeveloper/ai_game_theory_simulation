/**
 * Configuration Validation
 *
 * Validates all simulation configuration parameters at startup.
 * Uses fail-loudly philosophy: invalid config = immediate crash with context.
 *
 * @see src/simulation/config/centralConfig.ts
 * @see src/simulation/utils/assertions.ts
 */

import {
  assertFinite,
  assertProbability,
  assertInRange,
} from '@/simulation/utils/assertions';
import {
  THRESHOLDS,
  RATES,
  MULTIPLIERS,
  BASELINES,
  FLOORS,
  TOLERANCES,
} from './centralConfig';

/**
 * Validate all configuration parameters
 *
 * Fails loudly with detailed error messages if any parameter is invalid.
 * This is intentional - invalid config should never silently pass.
 *
 * @throws Error if any parameter fails validation
 */
export function validateSimulationConfig(): void {
  // Performance fix (Nov 20, 2025): Use performance config for verbose logging
  const { getPerformanceConfig } = require('./performanceConfig');
  const perfConfig = getPerformanceConfig();

  if (perfConfig.verboseInitialization) {
    console.log('🔍 Validating simulation configuration...');
  }

  let validationErrors: string[] = [];

  // === VALIDATE THRESHOLDS ===
  // Most thresholds are probabilities [0, 1] or specific ranges
  try {
    // Probability thresholds (must be [0, 1])
    const probabilityThresholds = [
      'AI_ALIGNMENT',
      'AI_ALIGNMENT_SAFE',
      'AI_ALIGNMENT_EXISTENTIAL_SAFE',
      'UNEMPLOYMENT_CRISIS',
      'UNEMPLOYMENT_SEVERE_CRISIS',
      'AUTOMATION_DISPLACEMENT_THRESHOLD',
      'FOOD_SECURITY_FAMINE_THRESHOLD',
      'FOOD_SECURITY_CRISIS_THRESHOLD',
      'WATER_SECURITY_CRISIS_THRESHOLD',
      'WATER_SECURITY_STRESS_THRESHOLD',
      'BIODIVERSITY_COLLAPSE_THRESHOLD',
      'BIODIVERSITY_SEVERE_THRESHOLD',
      'SOCIAL_COHESION_UNREST_THRESHOLD',
      'SOCIAL_COHESION_COLLAPSE_THRESHOLD',
      'POPULATION_COLLAPSE_FRACTION',
      'AMR_CRISIS_THRESHOLD',
      'AMR_COLLAPSE_THRESHOLD',
      'TECH_RISK_CRISIS_THRESHOLD',
      'TECH_RISK_EXISTENTIAL_THRESHOLD',
    ] as const;

    for (const key of probabilityThresholds) {
      assertProbability(THRESHOLDS[key], {
        location: 'validateSimulationConfig',
        valueName: `THRESHOLDS.${key}`,
      });
    }

    // Temperature thresholds (must be reasonable °C values)
    assertInRange(THRESHOLDS.CLIMATE_DANGEROUS_THRESHOLD, 0, 10, {
      location: 'validateSimulationConfig',
      valueName: 'THRESHOLDS.CLIMATE_DANGEROUS_THRESHOLD',
    });
    assertInRange(THRESHOLDS.CLIMATE_CATASTROPHIC_THRESHOLD, 0, 10, {
      location: 'validateSimulationConfig',
      valueName: 'THRESHOLDS.CLIMATE_CATASTROPHIC_THRESHOLD',
    });
    assertInRange(THRESHOLDS.CLIMATE_RUNAWAY_THRESHOLD, 0, 10, {
      location: 'validateSimulationConfig',
      valueName: 'THRESHOLDS.CLIMATE_RUNAWAY_THRESHOLD',
    });
    assertInRange(THRESHOLDS.WET_BULB_LETHAL_THRESHOLD, 30, 40, {
      location: 'validateSimulationConfig',
      valueName: 'THRESHOLDS.WET_BULB_LETHAL_THRESHOLD',
    });
    assertInRange(THRESHOLDS.WET_BULB_DANGEROUS_THRESHOLD, 25, 35, {
      location: 'validateSimulationConfig',
      valueName: 'THRESHOLDS.WET_BULB_DANGEROUS_THRESHOLD',
    });

    // Nuclear thresholds (must be positive integers or reasonable values)
    assertInRange(THRESHOLDS.NUCLEAR_WINTER_WARHEAD_THRESHOLD, 50, 1000, {
      location: 'validateSimulationConfig',
      valueName: 'THRESHOLDS.NUCLEAR_WINTER_WARHEAD_THRESHOLD',
    });
    assertInRange(THRESHOLDS.NUCLEAR_STRATOSPHERIC_INJECTION_THRESHOLD, 0.1, 100, {
      location: 'validateSimulationConfig',
      valueName: 'THRESHOLDS.NUCLEAR_STRATOSPHERIC_INJECTION_THRESHOLD',
    });

    // Population thresholds (must be positive)
    assertInRange(THRESHOLDS.MINIMUM_VIABLE_POPULATION, 1000000, 1000000000, {
      location: 'validateSimulationConfig',
      valueName: 'THRESHOLDS.MINIMUM_VIABLE_POPULATION',
    });

    // Planetary boundaries (must be positive integers)
    assertInRange(THRESHOLDS.PLANETARY_BOUNDARIES_CRISIS, 1, 9, {
      location: 'validateSimulationConfig',
      valueName: 'THRESHOLDS.PLANETARY_BOUNDARIES_CRISIS',
    });
    assertInRange(THRESHOLDS.PLANETARY_BOUNDARIES_CATASTROPHIC, 1, 9, {
      location: 'validateSimulationConfig',
      valueName: 'THRESHOLDS.PLANETARY_BOUNDARIES_CATASTROPHIC',
    });

    // Radiation thresholds (must be positive, reasonable Sv values)
    assertInRange(THRESHOLDS.RADIATION_LD50, 1, 10, {
      location: 'validateSimulationConfig',
      valueName: 'THRESHOLDS.RADIATION_LD50',
    });
    assertInRange(THRESHOLDS.RADIATION_SEVERE_ILLNESS, 0.1, 5, {
      location: 'validateSimulationConfig',
      valueName: 'THRESHOLDS.RADIATION_SEVERE_ILLNESS',
    });
    assertInRange(THRESHOLDS.RADIATION_ANNUAL_LIMIT, 0.0001, 0.1, {
      location: 'validateSimulationConfig',
      valueName: 'THRESHOLDS.RADIATION_ANNUAL_LIMIT',
    });

    console.log('  ✅ THRESHOLDS validated');
  } catch (error) {
    validationErrors.push(`THRESHOLDS validation failed: ${error}`);
  }

  // === VALIDATE RATES ===
  // All rates must be finite and non-negative (some can be 0)
  try {
    for (const [key, value] of Object.entries(RATES)) {
      assertFinite(value, {
        location: 'validateSimulationConfig',
        valueName: `RATES.${key}`,
      });

      if (value < 0) {
        throw new Error(
          `❌ Negative rate: RATES.${key} = ${value}\n` +
          `   All rates must be non-negative (>=0)`
        );
      }

      // Sanity check: monthly rates should generally be < 1.0
      // (100% per month is extreme but technically valid for some contexts)
      if (value > 1.0 && !key.includes('DOUBLING_TIME') && !key.includes('GROWTH_RATE')) {
        console.warn(
          `⚠️ Unusually high rate: RATES.${key} = ${value}\n` +
          `   Monthly rates >100% should be rare. Verify this is intentional.`
        );
      }
    }

    console.log('  ✅ RATES validated');
  } catch (error) {
    validationErrors.push(`RATES validation failed: ${error}`);
  }

  // === VALIDATE MULTIPLIERS ===
  // All multipliers must be finite and positive (>0)
  try {
    for (const [key, value] of Object.entries(MULTIPLIERS)) {
      assertFinite(value, {
        location: 'validateSimulationConfig',
        valueName: `MULTIPLIERS.${key}`,
      });

      if (value <= 0) {
        throw new Error(
          `❌ Non-positive multiplier: MULTIPLIERS.${key} = ${value}\n` +
          `   All multipliers must be positive (>0)`
        );
      }

      // Sanity check: multipliers >100 are suspicious
      if (value > 100) {
        console.warn(
          `⚠️ Extreme multiplier: MULTIPLIERS.${key} = ${value}\n` +
          `   Multipliers >100× should be rare. Verify this is intentional.`
        );
      }
    }

    console.log('  ✅ MULTIPLIERS validated');
  } catch (error) {
    validationErrors.push(`MULTIPLIERS validation failed: ${error}`);
  }

  // === VALIDATE BASELINES ===
  // All baselines must be finite and positive (most >0)
  try {
    for (const [key, value] of Object.entries(BASELINES)) {
      assertFinite(value, {
        location: 'validateSimulationConfig',
        valueName: `BASELINES.${key}`,
      });

      // Pre-industrial temperature is 0 by definition
      if (key === 'PREINDUSTRIAL_TEMPERATURE') {
        if (value !== 0) {
          throw new Error(
            `❌ Pre-industrial temperature must be 0: BASELINES.${key} = ${value}`
          );
        }
        continue;
      }

      // All other baselines should be positive
      if (value <= 0) {
        throw new Error(
          `❌ Non-positive baseline: BASELINES.${key} = ${value}\n` +
          `   All baselines (except PREINDUSTRIAL_TEMPERATURE) must be positive (>0)`
        );
      }
    }

    console.log('  ✅ BASELINES validated');
  } catch (error) {
    validationErrors.push(`BASELINES validation failed: ${error}`);
  }

  // === VALIDATE TOLERANCES ===
  // All tolerances must be finite, positive, and small (< 1.0)
  try {
    for (const [key, value] of Object.entries(TOLERANCES)) {
      assertFinite(value, {
        location: 'validateSimulationConfig',
        valueName: `TOLERANCES.${key}`,
      });

      if (value <= 0 || value >= 1.0) {
        throw new Error(
          `❌ Invalid tolerance: TOLERANCES.${key} = ${value}\n` +
          `   Tolerances must be in range (0, 1.0)`
        );
      }
    }

    console.log('  ✅ TOLERANCES validated');
  } catch (error) {
    validationErrors.push(`TOLERANCES validation failed: ${error}`);
  }

  // === VALIDATE LOGICAL CONSISTENCY ===
  // Check relationships between parameters
  try {
    // Climate thresholds must be ordered
    if (THRESHOLDS.CLIMATE_DANGEROUS_THRESHOLD >= THRESHOLDS.CLIMATE_CATASTROPHIC_THRESHOLD) {
      throw new Error(
        `❌ Climate threshold ordering violated:\n` +
        `   DANGEROUS (${THRESHOLDS.CLIMATE_DANGEROUS_THRESHOLD}°C) >= CATASTROPHIC (${THRESHOLDS.CLIMATE_CATASTROPHIC_THRESHOLD}°C)\n` +
        `   Expected: DANGEROUS < CATASTROPHIC < RUNAWAY`
      );
    }
    if (THRESHOLDS.CLIMATE_CATASTROPHIC_THRESHOLD >= THRESHOLDS.CLIMATE_RUNAWAY_THRESHOLD) {
      throw new Error(
        `❌ Climate threshold ordering violated:\n` +
        `   CATASTROPHIC (${THRESHOLDS.CLIMATE_CATASTROPHIC_THRESHOLD}°C) >= RUNAWAY (${THRESHOLDS.CLIMATE_RUNAWAY_THRESHOLD}°C)\n` +
        `   Expected: DANGEROUS < CATASTROPHIC < RUNAWAY`
      );
    }

    // Wet bulb thresholds must be ordered
    if (THRESHOLDS.WET_BULB_DANGEROUS_THRESHOLD >= THRESHOLDS.WET_BULB_LETHAL_THRESHOLD) {
      throw new Error(
        `❌ Wet bulb threshold ordering violated:\n` +
        `   DANGEROUS (${THRESHOLDS.WET_BULB_DANGEROUS_THRESHOLD}°C) >= LETHAL (${THRESHOLDS.WET_BULB_LETHAL_THRESHOLD}°C)\n` +
        `   Expected: DANGEROUS < LETHAL`
      );
    }

    // Unemployment thresholds must be ordered
    if (THRESHOLDS.UNEMPLOYMENT_CRISIS >= THRESHOLDS.UNEMPLOYMENT_SEVERE_CRISIS) {
      throw new Error(
        `❌ Unemployment threshold ordering violated:\n` +
        `   CRISIS (${THRESHOLDS.UNEMPLOYMENT_CRISIS}) >= SEVERE (${THRESHOLDS.UNEMPLOYMENT_SEVERE_CRISIS})\n` +
        `   Expected: CRISIS < SEVERE`
      );
    }

    // Food security thresholds must be ordered
    if (THRESHOLDS.FOOD_SECURITY_FAMINE_THRESHOLD >= THRESHOLDS.FOOD_SECURITY_CRISIS_THRESHOLD) {
      throw new Error(
        `❌ Food security threshold ordering violated:\n` +
        `   FAMINE (${THRESHOLDS.FOOD_SECURITY_FAMINE_THRESHOLD}) >= CRISIS (${THRESHOLDS.FOOD_SECURITY_CRISIS_THRESHOLD})\n` +
        `   Expected: FAMINE < CRISIS (lower food security = worse)`
      );
    }

    // Water security thresholds must be ordered
    if (THRESHOLDS.WATER_SECURITY_CRISIS_THRESHOLD >= THRESHOLDS.WATER_SECURITY_STRESS_THRESHOLD) {
      throw new Error(
        `❌ Water security threshold ordering violated:\n` +
        `   CRISIS (${THRESHOLDS.WATER_SECURITY_CRISIS_THRESHOLD}) >= STRESS (${THRESHOLDS.WATER_SECURITY_STRESS_THRESHOLD})\n` +
        `   Expected: CRISIS < STRESS (lower water security = worse)`
      );
    }

    // Biodiversity thresholds must be ordered
    if (THRESHOLDS.BIODIVERSITY_COLLAPSE_THRESHOLD >= THRESHOLDS.BIODIVERSITY_SEVERE_THRESHOLD) {
      throw new Error(
        `❌ Biodiversity threshold ordering violated:\n` +
        `   COLLAPSE (${THRESHOLDS.BIODIVERSITY_COLLAPSE_THRESHOLD}) >= SEVERE (${THRESHOLDS.BIODIVERSITY_SEVERE_THRESHOLD})\n` +
        `   Expected: COLLAPSE < SEVERE (lower biodiversity = worse)`
      );
    }

    // Social cohesion thresholds must be ordered
    if (THRESHOLDS.SOCIAL_COHESION_COLLAPSE_THRESHOLD >= THRESHOLDS.SOCIAL_COHESION_UNREST_THRESHOLD) {
      throw new Error(
        `❌ Social cohesion threshold ordering violated:\n` +
        `   COLLAPSE (${THRESHOLDS.SOCIAL_COHESION_COLLAPSE_THRESHOLD}) >= UNREST (${THRESHOLDS.SOCIAL_COHESION_UNREST_THRESHOLD})\n` +
        `   Expected: COLLAPSE < UNREST (lower cohesion = worse)`
      );
    }

    // AMR thresholds must be ordered
    if (THRESHOLDS.AMR_CRISIS_THRESHOLD >= THRESHOLDS.AMR_COLLAPSE_THRESHOLD) {
      throw new Error(
        `❌ AMR threshold ordering violated:\n` +
        `   CRISIS (${THRESHOLDS.AMR_CRISIS_THRESHOLD}) >= COLLAPSE (${THRESHOLDS.AMR_COLLAPSE_THRESHOLD})\n` +
        `   Expected: CRISIS < COLLAPSE`
      );
    }

    // AI alignment thresholds must be ordered
    if (THRESHOLDS.AI_ALIGNMENT >= THRESHOLDS.AI_ALIGNMENT_SAFE) {
      throw new Error(
        `❌ AI alignment threshold ordering violated:\n` +
        `   ALIGNMENT (${THRESHOLDS.AI_ALIGNMENT}) >= SAFE (${THRESHOLDS.AI_ALIGNMENT_SAFE})\n` +
        `   Expected: ALIGNMENT < SAFE < EXISTENTIAL_SAFE`
      );
    }
    if (THRESHOLDS.AI_ALIGNMENT_SAFE >= THRESHOLDS.AI_ALIGNMENT_EXISTENTIAL_SAFE) {
      throw new Error(
        `❌ AI alignment threshold ordering violated:\n` +
        `   SAFE (${THRESHOLDS.AI_ALIGNMENT_SAFE}) >= EXISTENTIAL_SAFE (${THRESHOLDS.AI_ALIGNMENT_EXISTENTIAL_SAFE})\n` +
        `   Expected: ALIGNMENT < SAFE < EXISTENTIAL_SAFE`
      );
    }

    // Radiation thresholds must be ordered
    if (THRESHOLDS.RADIATION_ANNUAL_LIMIT >= THRESHOLDS.RADIATION_SEVERE_ILLNESS) {
      throw new Error(
        `❌ Radiation threshold ordering violated:\n` +
        `   ANNUAL_LIMIT (${THRESHOLDS.RADIATION_ANNUAL_LIMIT} Sv) >= SEVERE_ILLNESS (${THRESHOLDS.RADIATION_SEVERE_ILLNESS} Sv)\n` +
        `   Expected: ANNUAL_LIMIT < SEVERE_ILLNESS < LD50`
      );
    }
    if (THRESHOLDS.RADIATION_SEVERE_ILLNESS >= THRESHOLDS.RADIATION_LD50) {
      throw new Error(
        `❌ Radiation threshold ordering violated:\n` +
        `   SEVERE_ILLNESS (${THRESHOLDS.RADIATION_SEVERE_ILLNESS} Sv) >= LD50 (${THRESHOLDS.RADIATION_LD50} Sv)\n` +
        `   Expected: ANNUAL_LIMIT < SEVERE_ILLNESS < LD50`
      );
    }

    // Planetary boundaries must be ordered
    if (THRESHOLDS.PLANETARY_BOUNDARIES_CRISIS > THRESHOLDS.PLANETARY_BOUNDARIES_CATASTROPHIC) {
      throw new Error(
        `❌ Planetary boundaries threshold ordering violated:\n` +
        `   CRISIS (${THRESHOLDS.PLANETARY_BOUNDARIES_CRISIS}) > CATASTROPHIC (${THRESHOLDS.PLANETARY_BOUNDARIES_CATASTROPHIC})\n` +
        `   Expected: CRISIS <= CATASTROPHIC`
      );
    }

    // Current values must be within reasonable bounds
    if (BASELINES.CURRENT_TEMPERATURE_ANOMALY < 0 || BASELINES.CURRENT_TEMPERATURE_ANOMALY > 2) {
      console.warn(
        `⚠️ Current temperature anomaly outside expected range (0-2°C): ${BASELINES.CURRENT_TEMPERATURE_ANOMALY}°C`
      );
    }

    if (BASELINES.CURRENT_CO2 < BASELINES.PREINDUSTRIAL_CO2) {
      throw new Error(
        `❌ Current CO2 (${BASELINES.CURRENT_CO2} ppm) < Pre-industrial (${BASELINES.PREINDUSTRIAL_CO2} ppm)\n` +
        `   This violates basic physics.`
      );
    }

    if (BASELINES.OCEAN_PH_CURRENT > BASELINES.OCEAN_PH_PREINDUSTRIAL) {
      throw new Error(
        `❌ Current ocean pH (${BASELINES.OCEAN_PH_CURRENT}) > Pre-industrial (${BASELINES.OCEAN_PH_PREINDUSTRIAL})\n` +
        `   Ocean acidification means pH should decrease, not increase.`
      );
    }

    console.log('  ✅ Logical consistency validated');
  } catch (error) {
    validationErrors.push(`Logical consistency validation failed: ${error}`);
  }

  // === VALIDATE FLOORS (Nov 15, 2025 - NEW CATEGORY) ===
  // Numerical stability minimums to prevent division by zero
  try {
    // Geometric mean floor must be positive and small
    assertInRange(FLOORS.GEOMETRIC_MEAN_FLOOR, 0.0001, 0.01, {
      location: 'validateSimulationConfig',
      valueName: 'FLOORS.GEOMETRIC_MEAN_FLOOR',
    });

    // Extinction rate bounds must be ordered: MIN < SAFE < MAX
    assertInRange(FLOORS.MIN_EXTINCTION_RATE, 0.1, 10, {
      location: 'validateSimulationConfig',
      valueName: 'FLOORS.MIN_EXTINCTION_RATE',
    });
    assertInRange(FLOORS.SAFE_EXTINCTION_RATE, 5, 20, {
      location: 'validateSimulationConfig',
      valueName: 'FLOORS.SAFE_EXTINCTION_RATE',
    });
    assertInRange(FLOORS.MAX_EXTINCTION_RATE, 100, 10000, {
      location: 'validateSimulationConfig',
      valueName: 'FLOORS.MAX_EXTINCTION_RATE',
    });

    // Logical consistency: MIN < SAFE < MAX
    if (FLOORS.MIN_EXTINCTION_RATE >= FLOORS.SAFE_EXTINCTION_RATE) {
      throw new Error(
        `MIN_EXTINCTION_RATE (${FLOORS.MIN_EXTINCTION_RATE}) must be < SAFE_EXTINCTION_RATE (${FLOORS.SAFE_EXTINCTION_RATE})`
      );
    }
    if (FLOORS.SAFE_EXTINCTION_RATE >= FLOORS.MAX_EXTINCTION_RATE) {
      throw new Error(
        `SAFE_EXTINCTION_RATE (${FLOORS.SAFE_EXTINCTION_RATE}) must be < MAX_EXTINCTION_RATE (${FLOORS.MAX_EXTINCTION_RATE})`
      );
    }
  } catch (error) {
    validationErrors.push(`FLOORS validation failed: ${error}`);
  }

  // === FAIL IF ANY ERRORS ===
  if (validationErrors.length > 0) {
    const errorMessage =
      `❌ CONFIGURATION VALIDATION FAILED\n\n` +
      validationErrors.join('\n\n') +
      `\n\n` +
      `Fix these issues in src/simulation/config/centralConfig.ts before proceeding.`;
    throw new Error(errorMessage);
  }

  console.log('✅ Configuration validation complete - all parameters valid\n');
}
