/**
 * P0.7 (Oct 16, 2025): Scenario Parameter Sets
 *
 * Defines two parallel parameter sets for Monte Carlo analysis:
 *
 * HISTORICAL MODE:
 * - Calibrated to worst documented crises (Black Death 1347-1353, Spanish Flu 1918-1920, WWII)
 * - Cascade mortality: 0.5% monthly (matches Black Death: 30-60% over 6 years)
 * - Cascade multiplier: 1.8x (middle of Banqiao Dam 2.69x, Haiti earthquake 1.5-3.7x)
 * - Recovery probability: 10% (all historical crises recovered: Black Death, WWII, Cambodia)
 * - Baby boom: 1.6x (matches post-WWII +50-60%, Cambodia +91%, Russia +70%)
 *
 * UNPRECEDENTED MODE:
 * - Models hyperconnected systemic failures with no historical precedent
 * - Cascade mortality: 1.5% monthly (AI + climate cascades can exceed historical bounds)
 * - Cascade multiplier: 3.5x (Helbing 2013: 2008 financial crisis showed 10-20x, using conservative estimate)
 * - Recovery probability: 1% (climate tipping points exhibit hysteresis, irreversibility)
 * - Baby boom: 1.2x (fertility crashes during existential uncertainty, Syrian refugee data)
 *
 * RESEARCH SOURCES:
 * - Super-Alignment Researcher: 25+ peer-reviewed papers, WHO reports (8/10 confidence)
 * - Research-Skeptic: Taleb & Bar-Yam 2020, Steffen et al. 2018, Lenton et al. 2019
 * - See: reviews/P1_RESEARCH_VALIDATION_REPORT.md
 * - See: reviews/P1_RESEARCH_SKEPTIC_CRITIQUE.md
 */

import { ScenarioMode, ScenarioParameters } from '../types/game';

/**
 * Get scenario parameters for the specified mode
 */
export function getScenarioParameters(mode: ScenarioMode): ScenarioParameters {
  switch (mode) {
    case 'historical':
      return {
        // Environmental mortality rates
        cascadeMortalityRate: 0.005,              // 0.5% monthly = Black Death (30-60% over 6 years)
        environmentalShockProbability: 0.02,      // 2% base + up to 15% when boundaries breached
        environmentalShockMagnitude: 2.0,         // 150-300% spikes (2003 European heatwave: 40K deaths)

        // Cascade interaction multipliers
        cascadeMultiplier: 1.8,                   // 1.5-3x historical range (Banqiao: 2.69x, Haiti: 1.5-3.7x)

        // Recovery probabilities
        recoveryProbability: 0.10,                // 10% (all historical crises recovered)
        babyBoomMultiplier: 1.6,                  // +60% fertility spike (post-WWII, Cambodia, Russia)

        // Ecosystem dynamics
        ecosystemRegenerationRate: 0.02,          // 50-year forest recovery (Black Death regrowth: 90 years)
      };

    case 'unprecedented':
      return {
        // Environmental mortality rates
        cascadeMortalityRate: 0.015,              // 1.5% monthly (3x historical worst)
        environmentalShockProbability: 0.05,      // 5% base + up to 20% when boundaries breached
        environmentalShockMagnitude: 3.5,         // 250-450% spikes (hyperconnected amplification)

        // Cascade interaction multipliers
        cascadeMultiplier: 3.5,                   // Conservative vs Helbing 2013 (10-20x in 2008 crisis)

        // Recovery probabilities
        recoveryProbability: 0.01,                // 1% (climate hysteresis, irreversible tipping)
        babyBoomMultiplier: 1.2,                  // +20% (fertility crashes during existential uncertainty)

        // Ecosystem dynamics
        ecosystemRegenerationRate: 0.005,         // 200-year recovery (Lenton: hysteresis, alternative stable states)
      };
  }
}

/**
 * Get a human-readable description of the scenario mode
 */
export function getScenarioDescription(mode: ScenarioMode): string {
  switch (mode) {
    case 'historical':
      return 'Historical Calibration: Parameters match worst documented crises (Black Death, Spanish Flu, WWII). Defensible for publication.';
    case 'unprecedented':
      return 'Unprecedented Tail Risk: Parameters model hyperconnected systemic failures with no historical precedent. Honest existential risk assessment.';
  }
}

/**
 * Validate that scenario parameters are within reasonable bounds
 */
export function validateScenarioParameters(params: ScenarioParameters): string[] {
  const errors: string[] = [];

  if (params.cascadeMortalityRate < 0 || params.cascadeMortalityRate > 0.05) {
    errors.push(`cascadeMortalityRate ${params.cascadeMortalityRate} out of bounds [0, 0.05]`);
  }

  if (params.environmentalShockProbability < 0 || params.environmentalShockProbability > 0.2) {
    errors.push(`environmentalShockProbability ${params.environmentalShockProbability} out of bounds [0, 0.2]`);
  }

  if (params.cascadeMultiplier < 1.0 || params.cascadeMultiplier > 10.0) {
    errors.push(`cascadeMultiplier ${params.cascadeMultiplier} out of bounds [1.0, 10.0]`);
  }

  if (params.recoveryProbability < 0 || params.recoveryProbability > 1.0) {
    errors.push(`recoveryProbability ${params.recoveryProbability} out of bounds [0, 1.0]`);
  }

  return errors;
}
