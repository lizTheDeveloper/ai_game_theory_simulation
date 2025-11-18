/**
 * International Relations Phase
 *
 * Consolidates international conflict and nuclear dynamics:
 * 1. Conflict resolution (international conflict dynamics)
 * 2. Diplomatic AI (AI-mediated diplomacy & conflict prevention)
 * 3. MAD deterrence (nuclear deterrence & mutual destruction dynamics)
 * 4. Flash war escalation (AI-enhanced autonomous weapons escalation)
 *
 * Order: 20.5 (after nuclear command & control) - Batch 5: moved from 13.0 due to dependency
 *
 * Research Foundation:
 * - MAD theory: Nuclear deterrence dynamics
 * - Crisis stability: Early warning systems
 * - ECFR (2024), Penn CERL (2024): Flash war risks
 * - UN Resolution 166-3: Autonomous weapons governance
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertFinite, assertProbability } from '@/simulation/utils/assertions';
import {
  checkFlashWarRisk,
  applyFlashWarEffects,
  attemptAIDeEscalation,
  updateCircuitBreakers
} from '../../flashWarEscalation';
import { updateConflictResolution } from '../../conflictResolution';
import { updateDiplomaticAI } from '../../diplomaticAI';
import { updateMADDeterrence, updateBilateralTensions } from '../../nuclearStates';

export class InternationalRelationsPhase implements SimulationPhase {
  readonly id = 'international-relations';
  readonly name = 'International Relations Update';
  readonly order = 20.51;  // Batch 5: moved from 13.0 due to nuclear_command_control (20) dependency
  readonly dependencies = ['ai-agent-actions'];  // nuclear_command_control phase removed (Nov 15, 2025)

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    setDeterministicRng(rng);

    // 1. Conflict Resolution (formerly ConflictResolutionPhase, order 13.0)
    executeConflictResolution(state, rng);

    // 2. Diplomatic AI (formerly DiplomaticAIPhase, order 14.0)
    executeDiplomaticAI(state, rng);

    // 3. MAD Deterrence (formerly MADDeterrencePhase, order 16.0)
    executeMADDeterrence(state, rng);

    // 4. Flash War Escalation (formerly FlashWarEscalationPhase, order 29.0)
    // NOTE: This now runs earlier (13.0 instead of 29.0) - validate in Monte Carlo
    executeFlashWarEscalation(state, rng);

    return { events: [] };
  }
}

/**
 * Conflict Resolution
 * (formerly ConflictResolutionPhase, order 13.0)
 */
function executeConflictResolution(state: GameState, rng: RNGFunction): void {updateConflictResolution(state);
}

/**
 * Diplomatic AI
 * (formerly DiplomaticAIPhase, order 14.0)
 */
function executeDiplomaticAI(state: GameState, rng: RNGFunction): void {updateDiplomaticAI(state);
}

/**
 * MAD Deterrence
 * (formerly MADDeterrencePhase, order 16.0)
 */
function executeMADDeterrence(state: GameState, rng: RNGFunction): void {updateMADDeterrence(state);
  updateBilateralTensions(state);

  // Validate MAD deterrence calculations
  assertProbability(state.madDeterrence.madStrength, {
    location: 'InternationalRelationsPhase.executeMADDeterrence',
    valueName: 'madDeterrence.madStrength',
    month: state.currentMonth
  });
  assertProbability(state.madDeterrence.crisisStability, {
    location: 'InternationalRelationsPhase.executeMADDeterrence',
    valueName: 'madDeterrence.crisisStability',
    month: state.currentMonth
  });
  assertProbability(state.madDeterrence.earlyWarningReliability, {
    location: 'InternationalRelationsPhase.executeMADDeterrence',
    valueName: 'madDeterrence.earlyWarningReliability',
    month: state.currentMonth
  });
}

/**
 * Flash War Escalation
 * (formerly FlashWarEscalationPhase, order 29.0)
 *
 * NOTE: Execution order changed from 29.0 → 13.0
 * This may affect conflict/crisis timing - validate in Monte Carlo
 */
function executeFlashWarEscalation(state: GameState, rng: RNGFunction): void {
  // STEP 1: Attempt AI-mediated de-escalation FIRST (prevents flash wars)
  if (state.conflictResolution.activeConflicts && state.conflictResolution.activeConflicts > 0) {
    attemptAIDeEscalation(state, rng);
  }

  // STEP 2: Check for flash war escalation (if conflicts still active)
  if (state.conflictResolution.activeConflicts && state.conflictResolution.activeConflicts > 0) {
    const flashWarOccurs = checkFlashWarRisk(state, rng);

    if (flashWarOccurs) {
      applyFlashWarEffects(state);

      // Validate flash war didn't corrupt state
      assertFinite(state.humanPopulationSystem.population, {
        location: 'InternationalRelationsPhase.executeFlashWarEscalation',
        valueName: 'population after flash war',
        month: state.currentMonth
      });
    }
  }

  // STEP 3: Update circuit breaker development
  updateCircuitBreakers(state);
}
