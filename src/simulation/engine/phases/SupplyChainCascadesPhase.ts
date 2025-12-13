import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
/**
 * Supply Chain Cascade Propagation Phase
 *
 * Models fast-timescale cascade failures (days-to-weeks):
 * - JIT manufacturing buffer exhaustion
 * - Geographic chokepoint disruptions
 * - Infrastructure cascades (power→water→food→healthcare)
 * - Finance-supply chain feedback loops
 *
 * Research: research/supply_chain_cascades_20251212.md
 * Critique: reviews/supply_chain_cascades_critique_20251212.md (QG1: Grade B)
 * Priority: HIGH (Session 70 finding - collapse scenarios 2-5x too slow)
 *
 * Key Parameters:
 * - Infrastructure cascade multiplier: 5× (One Earth 2024)
 * - Cascade spread probability: 74% (Nirandjan et al. 2024)
 * - Texas 2021 validation: 3-day power → 12M water → $195B damages
 * - Suez 2024 validation: 64% transit decline → 158-246% rate increase
 *
 * **INTEGRATION: Cascade → Epistemic Shock (Direction 2)**
 * Prolonged cascades (> 7 days) trigger epistemic shock events
 * Research: Texas freeze 2021 - Infrastructure failure → social trust erosion
 * (supply_chain_cascades_20251212.md, section 3)
 */

import { updateSupplyChainCascades } from '../../supplyChainCascades';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class SupplyChainCascadesPhase implements SimulationPhase {
  readonly id = 'supply_chain_cascades';
  readonly name = 'SupplyChainCascades';
  readonly order = 36.5; // After crisis management (26), before health/safety nets

  // DEPENDENCIES: Supply chain cascades interact with multiple systems
  readonly dependencies = [
    'crisis-detection',      // Crisis events trigger cascades
    'energy-budget',          // Power grid status affects infrastructure cascades
    'geopolitical-conflict',  // Conflicts can disrupt chokepoints
  ];

  execute(state: GameState, _rng: RNGFunction): PhaseResult {
    // Set deterministic RNG for phase execution
    setDeterministicRng(_rng);

    // Update supply chain cascades (function handles state initialization)
    updateSupplyChainCascades(state, _rng);

    // INTEGRATION: Detect prolonged infrastructure cascades → epistemic shock (Direction 2)
    const events: GameEvent[] = [];
    const infra = state.supplyChainCascades.infrastructure;

    if (infra.cascadeActive && infra.hoursInCascade > 168) {  // > 7 days
      // Scale shock magnitude with cascade duration
      // 7 days → minimal shock, 30 days → max 30% shock
      const shockMagnitude = Math.min(
        0.3,  // Cap at 30% trust erosion
        ((infra.hoursInCascade - 168) / 720) * 0.2  // Scale with excess duration
      );

      const durationDays = (infra.hoursInCascade / 24).toFixed(0);

      // Emit event for InformationEcologyPhase to process
      events.push({
        id: `infrastructure_cascade_shock_${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'crisis',
        severity: shockMagnitude > 0.15 ? 'high' : 'medium',
        agent: 'supply_chain_cascades',
        title: `Infrastructure Cascade Epistemic Shock`,
        description: `🚨💧 Infrastructure cascade (${durationDays} days) triggers epistemic shock`,
        effects: {
          shockMagnitude,
          cascadeDurationDays: parseFloat(durationDays),
        },
      });

      // Only log once per month to avoid spam
      if (infra.hoursInCascade % 720 === 0) {
        console.log(`\n🚨💧 PROLONGED CASCADE TRIGGERS EPISTEMIC SHOCK (Month ${state.currentMonth})`);
        console.log(`   Cascade duration: ${durationDays} days`);
        console.log(`   Shock magnitude: ${(shockMagnitude * 100).toFixed(1)}%`);
      }
    }

    return { events };
  }
}
