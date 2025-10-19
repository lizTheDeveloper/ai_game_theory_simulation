/**
 * Flash War Escalation Phase - Post-Recalibration Fix #5
 *
 * Phase Order: 29.0 (after ConflictResolution, before Crisis Detection)
 *
 * Models flash war escalation from AI-enhanced autonomous weapons.
 * Implements three mechanics:
 * 1. Flash war risk check (5% per conflict/month when AI > 4.0)
 * 2. AI-mediated de-escalation (aligned high-cap AI can prevent)
 * 3. Circuit breaker development (3-month delay after first flash war)
 *
 * Research: ECFR (2024), Penn CERL (2024), UN Resolution 166-3
 */

import { SimulationPhase, PhaseResult, RNGFunction } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';
import {
  checkFlashWarRisk,
  applyFlashWarEffects,
  attemptAIDeEscalation,
  updateCircuitBreakers
} from '../../flashWarEscalation';

export class FlashWarEscalationPhase implements SimulationPhase {
  readonly id = 'flash-war-escalation';
  readonly name = 'Flash War Escalation Check';
  readonly order = 29.0;  // After ConflictResolution (13.0), before Crisis Detection (~30)

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // STEP 1: Attempt AI-mediated de-escalation FIRST (prevents flash wars)
    if (state.conflictResolution.activeConflicts && state.conflictResolution.activeConflicts > 0) {
      attemptAIDeEscalation(state, rng);
      // Note: De-escalation can reduce activeConflicts inside the function
    }

    // STEP 2: Check for flash war escalation (if conflicts still active)
    if (state.conflictResolution.activeConflicts && state.conflictResolution.activeConflicts > 0) {
      const flashWarOccurs = checkFlashWarRisk(state, rng);

      if (flashWarOccurs) {
        applyFlashWarEffects(state);
      }
    }

    // STEP 3: Update circuit breaker development
    updateCircuitBreakers(state);

    return { events: [] };
  }
}
