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

/**
 * Initialize the tipping point system state
 *
 * Creates initial state with all tipping elements untriggered.
 * Elements will be triggered during simulation based on global temperature thresholds.
 *
 * @param rng - REQUIRED RNG function for deterministic sampling (Monte Carlo reproducibility)
 */
export function initializeTippingPointSystem(rng: () => number): TippingPointSystem {
  // ❌ Fail loudly if RNG missing (CRITICAL-3 regression fix pattern)
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic tipping point initialization');
  }

  return {
    elements: TIPPING_ELEMENTS.map(element => {
      return {
        ...element,
        triggered: false,
        monthsSinceTrigger: 0,
        progress: 0.0,
        // Initialize MICI fields for ice sheet elements
        abruptMode: false,
        accumulatedAbruptSLR: 0.0
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
