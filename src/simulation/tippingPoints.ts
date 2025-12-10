/**
 * Multi-Timescale Climate Tipping Points System
 *
 * Implements research-backed climate tipping point transitions to replace instant catastrophe.
 * This module provides initialization for the tipping point system state.
 *
 * The actual phase logic is in src/simulation/engine/phases/TippingPointPhase.ts
 *
 * Research:
 * - Armstrong McKay et al. (2022) Science - Global tipping point analysis
 * - Lenton et al. (2023) Science - Updated tipping threshold estimates
 * - IPCC AR6 WG1 (2021) - Chapter 8, tipping elements
 */

import { TippingPointSystem, TIPPING_ELEMENTS } from '../types/tipping-points';
import { assertFinite } from './utils/assertions';
import { sampleThresholdDistribution } from './utils/distributionSampling';

/**
 * Initialize the tipping point system state
 *
 * Creates initial state with all tipping elements untriggered.
 * Elements will be triggered during simulation based on global temperature thresholds.
 *
 * M-5 (Dec 7, 2025): Samples thresholds from uncertainty distributions for probabilistic modeling
 *
 * @param rng - REQUIRED RNG function for deterministic sampling (Monte Carlo reproducibility)
 */
export function initializeTippingPointSystem(rng: () => number): TippingPointSystem {
  // ❌ Fail loudly if RNG missing (CRITICAL-3 regression fix pattern)
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic tipping threshold sampling');
  }

  return {
    elements: TIPPING_ELEMENTS.map(element => {
      // 🎲 Sample threshold from distribution if defined (M-5, Dec 7, 2025)
      // If no distribution, use deterministic triggerTempC (backward compatibility)
      let sampledThreshold: number | undefined;

      if (element.thresholdDistribution) {
        sampledThreshold = sampleThresholdDistribution(
          element.thresholdDistribution,
          rng
        );

        // Validate sampled threshold
        assertFinite(sampledThreshold, {
          location: 'initializeTippingPointSystem',
          valueName: `${element.id}_sampledThreshold`,
          additionalInfo: {
            elementId: element.id,
            distribution: element.thresholdDistribution
          }
        });

        console.log(`🌡️🎲 Sampled ${element.id} threshold: ${sampledThreshold.toFixed(2)}°C (deterministic: ${element.triggerTempC}°C)`);
      }

      return {
        ...element,
        triggered: false,
        monthsSinceTrigger: 0,
        progress: 0.0,
        // Initialize MICI fields for ice sheet elements
        abruptMode: false,
        accumulatedAbruptSLR: 0.0,
        // Store sampled threshold (M-5)
        _sampledThresholdC: sampledThreshold
      };
    }),
    triggeredCount: 0,
    completedCount: 0,
    totalProgress: 0.0,
    cascadeMultiplier: 1.0,
    triggers: [],
    // Sea level rise tracking (Dec 5, 2025)
    cumulativeSeaLevelRise: 0.0,
    coastalPopulationDisplaced: 0.0,
    coastalInfrastructureDamage: 0.0,
    agriculturalLandLost: 0.0
  };
}
