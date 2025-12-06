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

import { TippingPointSystem, TIPPING_ELEMENTS, TippingElementState } from '../types/tipping-points';
import { assertFinite } from './utils/assertions';

/**
 * Initialize the tipping point system state
 *
 * Creates initial state with all tipping elements untriggered.
 * Elements will be triggered during simulation based on global temperature thresholds.
 *
 * M-7 (Dec 5, 2025): Added state field for hysteresis state machine
 */
export function initializeTippingPointSystem(): TippingPointSystem {
  return {
    elements: TIPPING_ELEMENTS.map(element => ({
      ...element,
      triggered: false,
      monthsSinceTrigger: 0,
      progress: 0.0,
      state: TippingElementState.NOT_TRIGGERED  // M-7: Initialize hysteresis state
    })),
    triggeredCount: 0,
    completedCount: 0,
    totalProgress: 0.0,
    cascadeMultiplier: 1.0,
    triggers: []
  };
}
