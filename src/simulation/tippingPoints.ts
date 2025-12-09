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
import {
  sampleTriangular,
  sampleUniform,
  sampleNormal,
  sampleLogNormal,
} from './thresholds/distributions';

/**
 * Initialize the tipping point system state
 *
 * Creates initial state with all tipping elements untriggered.
 * Elements will be triggered during simulation based on global temperature thresholds.
 *
 * M-5 (Dec 7, 2025): Samples thresholds from uncertainty distributions for probabilistic modeling
 *
 * @param rng - REQUIRED RNG function for deterministic threshold sampling (Monte Carlo reproducibility)
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
        // 🎲 Dispatcher for distribution sampling (inline from distributionSampling.ts)
        const dist = element.thresholdDistribution;
        switch (dist.type) {
          case 'triangular': {
            const { min, mode, max } = dist.params;
            if (min === undefined || mode === undefined || max === undefined) {
              throw new Error(`❌ Triangular distribution missing parameters for ${element.id}: min=${min} mode=${mode} max=${max}`);
            }
            sampledThreshold = sampleTriangular(min, mode, max, rng);
            break;
          }
          case 'uniform': {
            const { min, max } = dist.params;
            if (min === undefined || max === undefined) {
              throw new Error(`❌ Uniform distribution missing parameters for ${element.id}: min=${min} max=${max}`);
            }
            sampledThreshold = sampleUniform(min, max, rng);
            break;
          }
          case 'normal': {
            const { mean, std } = dist.params;
            if (mean === undefined || std === undefined) {
              throw new Error(`❌ Normal distribution missing parameters for ${element.id}: mean=${mean} std=${std}`);
            }
            sampledThreshold = sampleNormal(mean, std, rng);
            break;
          }
          case 'log-normal': {
            const { meanLog, stdLog } = dist.params;
            if (meanLog === undefined || stdLog === undefined) {
              throw new Error(`❌ Log-normal distribution missing parameters for ${element.id}: meanLog=${meanLog} stdLog=${stdLog}`);
            }
            sampledThreshold = sampleLogNormal(meanLog, stdLog, rng);
            break;
          }
          default:
            throw new Error(`❌ Unknown distribution type for ${element.id}: ${(dist as any).type}`);
        }

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
