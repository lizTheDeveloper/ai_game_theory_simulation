/**
 * Information Ecology Phase
 *
 * Models epistemic degradation and its impact on coordination capacity:
 * - Misinformation spread (SIS model with contested parameters)
 * - Trust erosion (baseline + event shocks)
 * - AI-driven polarization (bounded effects)
 * - Shared reality decay
 * - Coordination capacity modulation
 *
 * **Phase Order:** 18.0 (after AI actions, before crisis response)
 * **Feeds Into:** Government effectiveness modifiers
 *
 * **Research Foundation:**
 * - Vosoughi et al. (2018): Misinformation spreading dynamics
 * - Pennycook et al. (2024): Fact-checking decay
 * - Lorenz-Spreen et al. (2023): AI polarization effects
 * - Donovan & Boyd (2021): Information disorders → coordination failures
 *
 * **CRITICAL UNCERTAINTIES (Grade B- from research skeptic):**
 * - Epidemiological model contested (Springer 2025 critique)
 * - Coordination threshold from single case study (Ukraine EA Forum)
 * - Parameter ranges reflect genuine scientific uncertainty
 *
 * **State Fields Updated:**
 * - state.informationEcology.* (all fields)
 * - state.governmentAgent.state.coordinationCapacity (modified by epistemic health)
 *
 * @module simulation/engine/phases/InformationEcologyPhase
 */

import type { GameState, RNGFunction } from '@/types/game';
import type { SimulationPhase, PhaseContext, PhaseResult } from '../PhaseOrchestrator';
import {
  updateInformationEcology,
  calculateCoordinationModifier,
  applyEpistemicShock,
} from '@/simulation/informationEcology';
import { assertStateProperty, assertFinite } from '@/simulation/utils/assertions';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

/**
 * Information Ecology Phase
 *
 * Updates epistemic health and modulates government coordination capacity.
 *
 * **DEPENDENCIES:**
 * - Runs at order 18.0, BEFORE ExogenousShockPhase (27.5) and GeopoliticalConflictPhase (28.0)
 * - Modifies society.coordinationCapacity which affects:
 *   - ExogenousShockPhase (27.5) - Coordination affects shock resilience
 *   - GeopoliticalConflictPhase (28.0) - Coordination reduces conflict escalation
 * - Sequential ordering ensures no stale-state reads
 * - If reordering, verify all coordinationCapacity consumers are downstream
 */
export class InformationEcologyPhase implements SimulationPhase {
  readonly id = 'information_ecology';
  readonly name = 'Information Ecology';
  readonly order = 18.0;

  // DEPENDENCIES: Requires AI agents (for polarization effects), government state (for coordination)
  readonly dependencies = [
    'ai-agent-actions', // Order 7.0 - AI social capabilities affect polarization
    'government-actions', // Order 9.0 - Government state modified by coordination capacity
  ] as const;

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    setDeterministicRng(rng);

    const infoEcology = state.informationEcology;
    if (!infoEcology) {
      throw new Error('❌ informationEcology not initialized');
    }

    // Calculate days elapsed
    const daysElapsed = state.daysInCurrentMonth || 30;

    // Update information ecology dynamics
    updateInformationEcology(infoEcology, state, rng, daysElapsed);

    // Detect epistemic shocks (nuclear events, major AI deceptions)
    this.detectAndApplyShocks(state, infoEcology, rng);

    // Calculate coordination modifier
    const coordinationModifier = calculateCoordinationModifier(infoEcology, rng);

    // Apply to society coordination capacity
    const society = state.society;
    if (!society) {
      throw new Error('❌ society not initialized');
    }

    const baseCoordination = assertStateProperty(society, 'coordinationCapacity', {
      location: 'InformationEcologyPhase.execute',
      month: state.currentMonth,
    });

    // Modulate coordination capacity (soft constraint, not hard cutoff)
    society.coordinationCapacity = assertFinite(baseCoordination * coordinationModifier, {
      location: 'InformationEcologyPhase.execute',
      valueName: 'coordinationCapacity after epistemic modifier',
      month: state.currentMonth,
    });

    // Log significant changes
    if (coordinationModifier < 0.8) {
      console.log(
        `⚠️ Epistemic degradation reducing coordination capacity: ${(coordinationModifier * 100).toFixed(1)}%`
      );
      console.log(
        `  📊 Trust: ${(infoEcology.socialTrust * 100).toFixed(1)}%, Shared reality: ${(infoEcology.sharedReality * 100).toFixed(1)}%`
      );
    }

    if (infoEcology.epistemicHealth < 0.4) {
      console.log(
        `🚨 EPISTEMIC CRISIS: Information environment severely degraded (${(infoEcology.epistemicHealth * 100).toFixed(1)}%)`
      );
    }

    return {
      events: [],
    };
  }

  /**
   * Detect and apply epistemic shocks
   *
   * Nuclear events, major AI deceptions, etc. cause stepwise trust drops.
   */
  private detectAndApplyShocks(
    state: GameState,
    infoEcology: import('@/simulation/informationEcology').InformationEcologyState,
    rng: RNGFunction
  ): void {
    // Single-pass event detection (O(n) instead of 3×O(n))
    let nuclearCount = 0;
    let deceptionCount = 0;
    let catastropheCount = 0;

    const cutoffMonth = state.currentMonth - 1;

    for (const event of state.eventLog) {
      if (event.timestamp < cutoffMonth) continue;

      const descLower = event.description.toLowerCase();

      // Nuclear events
      if (event.type === 'catastrophe' && descLower.includes('nuclear')) {
        nuclearCount++;
      }

      // AI deception events
      if (
        event.type === 'crisis' &&
        (descLower.includes('deception') || descLower.includes('sleeper'))
      ) {
        deceptionCount++;
      }

      // Extinction-tier catastrophes
      if (
        event.type === 'catastrophe' &&
        (descLower.includes('extinction') || descLower.includes('collapse'))
      ) {
        catastropheCount++;
      }
    }

    // Apply shocks based on detected events
    if (nuclearCount > 0) {
      const severity = Math.min(1.0, nuclearCount * 0.3); // 30% per detonation
      applyEpistemicShock(infoEcology, severity, rng);
      console.log(
        `☢️ Nuclear detonation(s) caused epistemic shock (severity ${(severity * 100).toFixed(0)}%)`
      );
    }

    if (deceptionCount > 0) {
      const severity = Math.min(1.0, deceptionCount * 0.2); // 20% per event
      applyEpistemicShock(infoEcology, severity, rng);
      console.log(
        `🎭 AI deception event(s) caused epistemic shock (severity ${(severity * 100).toFixed(0)}%)`
      );
    }

    if (catastropheCount > 0) {
      const severity = 0.8; // Major shock
      applyEpistemicShock(infoEcology, severity, rng);
      console.log(`💥 Catastrophic event caused major epistemic shock`);
    }
  }
}
