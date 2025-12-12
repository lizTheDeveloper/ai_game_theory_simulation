/**
 * Supply Chain Cascade Propagation
 *
 * Models fast-timescale cascade failures (days-to-weeks) through:
 * - Just-in-time manufacturing vulnerabilities
 * - Geographic chokepoint failures
 * - Infrastructure interdependence cascades (power→water→food→healthcare)
 * - Finance-supply chain feedback loops
 *
 * Research: research/supply_chain_cascades_20251212.md
 * Critique: reviews/supply_chain_cascades_critique_20251212.md (QG1: Grade B)
 * Priority: HIGH (Session 70 identified collapse scenarios 2-5x too slow)
 *
 * Key Parameters:
 * - Infrastructure cascade multiplier: 5× (One Earth 2024)
 * - Cascade spread probability: 74% (Nirandjan et al. 2024)
 * - Texas 2021 validation: 3-day power → 12M water → $195B damages
 * - Suez 2024 validation: 64% transit decline → 158-246% rate increase
 */

import { GameState } from '../types/game';
import { assertFinite, assertStateProperty, assertProbability } from './utils/assertions';

/**
 * Supply Chain Cascades State
 *
 * Tracks four cascade types operating on fast (days-weeks) timescales.
 */
export interface SupplyChainCascadesState {
  // Just-in-time manufacturing vulnerabilities
  justInTime: {
    semiconductorBuffer_months: number;  // Buffer stock (0-12 months)
    rareEarthBuffer_months: number;     // Rare earth buffer (0-12 months)
    criticalInputsBuffer_months: number; // Generic critical inputs (0-12 months)
    disruptionActive: boolean;          // Is cascade active?
    daysUntilCascade: number;           // Days until JIT buffer exhausted (if disruption active)
  };

  // Single points of failure (geographic chokepoints)
  chokepoints: {
    suezStatus: 'open' | 'restricted' | 'closed';
    panamaStatus: 'open' | 'restricted' | 'closed';
    malaccaStatus: 'open' | 'restricted' | 'closed';
    taiwanSemiconductorCapacity: number;  // 0-1 (% of normal capacity)
  };

  // Infrastructure cascades (power→water→food→healthcare)
  infrastructure: {
    powerGridStatus: number;      // 0-1 (% operational)
    waterSystemStatus: number;    // 0-1 (% operational)
    foodSystemStatus: number;     // 0-1 (% operational)
    healthcareSystemStatus: number; // 0-1 (% operational)
    cascadeActive: boolean;       // Is cascade propagating?
    hoursInCascade: number;       // Hours since cascade started
  };

  // Finance cascades (credit→JIT→employment)
  finance: {
    creditAvailability: number;   // 0-1 (% of normal credit)
    paymentSystemStatus: number;  // 0-1 (% operational)
    cashReservesDepletion: number; // 0-1 (0=full reserves, 1=depleted)
    employmentCascadeActive: boolean;
  };
}

/**
 * Initialize supply chain cascades state
 *
 * Conservative baseline: Normal operations, no active cascades
 */
export function initializeSupplyChainCascades(): SupplyChainCascadesState {
  return {
    justInTime: {
      semiconductorBuffer_months: 2,  // Current JIT reality: days-to-weeks
      rareEarthBuffer_months: 3,
      criticalInputsBuffer_months: 2,
      disruptionActive: false,
      daysUntilCascade: 0,
    },
    chokepoints: {
      suezStatus: 'open',
      panamaStatus: 'open',
      malaccaStatus: 'open',
      taiwanSemiconductorCapacity: 1.0,
    },
    infrastructure: {
      powerGridStatus: 1.0,
      waterSystemStatus: 1.0,
      foodSystemStatus: 1.0,
      healthcareSystemStatus: 1.0,
      cascadeActive: false,
      hoursInCascade: 0,
    },
    finance: {
      creditAvailability: 1.0,
      paymentSystemStatus: 1.0,
      cashReservesDepletion: 0,
      employmentCascadeActive: false,
    },
  };
}

/**
 * Update supply chain cascades
 *
 * Main entry point for cascade propagation modeling.
 * Called once per month during simulation step.
 *
 * @param state - Game state (will be mutated)
 * @param rng - Deterministic RNG function (REQUIRED for reproducibility)
 */
export function updateSupplyChainCascades(
  state: GameState,
  rng: () => number
): void {
  // RNG is REQUIRED for deterministic Monte Carlo validation
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic supply chain cascade modeling');
  }

  // Initialize state if not present (backward compatibility)
  if (!state.supplyChainCascades) {
    (state as any).supplyChainCascades = initializeSupplyChainCascades();
  }

  // TODO: Implement cascade logic
  // Phase 1: Check for trigger conditions
  // Phase 2: Propagate cascades
  // Phase 3: Apply economic/social impacts
  // Phase 4: Model recovery
}
