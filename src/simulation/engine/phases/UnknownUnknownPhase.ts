/**
 * UnknownUnknownPhase (P3.2)
 *
 * Implements black swan events (unknown unknowns) that aren't in the tech tree
 * or crisis system. Adds realism and prevents overconfidence in deterministic outcomes.
 *
 * Phase placement: After crisis detection (order 27), before outcomes (order 31+)
 * Rationale: Black swans can trigger or modify ongoing crises, but shouldn't
 *            double-count when calculating outcome probabilities.
 *
 * Research consensus (Oct 30, 2025):
 * - Consensus file: `.claude/chatroom/research-consensus-20251030_food_security.txt`
 * - Base probability: 0.15% monthly (0.0015) - Ord (2020), historical 2-3 events per 20y
 * - Expected outcome: ~1 simulation-affecting event per 20-year run
 * - Impact calibration: Research-backed (COVID-19 = -0.08% mortality, 2008 = -5% GDP/2y)
 * - Minimum threshold: ≥1% GDP OR ≥0.01% mortality (filters negligible events)
 *
 * Research basis:
 * - Toby Ord, "The Precipice" (2020): Quantified low-probability catastrophic events
 * - Reinhart & Rogoff, "This Time Is Different" (2009): Economic crisis durations (24mo)
 * - Nassim Taleb, "The Black Swan" (2007): 3 characteristics:
 *   1. Rare (outlier beyond normal expectations)
 *   2. Extreme impact
 *   3. Retrospectively predictable (but not prospectively)
 * - Historical frequency: 2-3 unprecedented simulation-affecting events per 20y
 * - Examples: 2008 financial crisis (-5% GDP), COVID-19 (-0.08% mortality), Fukushima, CRISPR
 *
 * Target frequency (updated):
 * - ~1 event per 20-year run (expected value from 0.15% monthly)
 * - Monte Carlo validation (N≥100): Check for appropriate distribution
 *
 * @reads state.globalRisks, state.resourceEconomy, state.aiAgents
 * @writes state.planetaryBoundariesSystem.novelEntitiesIncrementalImpact (adds gamma-ray burst impact)
 *         state.qualityOfLifeSystems.* (various impacts from different events)
 */

import type { GameState, GameEvent, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import type { SimulationPhase } from '../PhaseOrchestrator';
import {
  checkForUnknownUnknown,
  applyUnknownUnknown,
  calculateUnknownUnknownProbability
} from '../../unknownUnknowns';
import { DEFAULT_UNKNOWN_UNKNOWN_CONFIG } from '@/types/unknownUnknown';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertProbability, assertAICapability, assertAIAggregateCapability } from '@/simulation/utils/assertions';

export class UnknownUnknownPhase implements SimulationPhase {
  readonly id = 'unknown-unknown';
  readonly name = 'Unknown Unknown Events';
  readonly order = 30.5; // After ExtinctionTriggersPhase (30), before OutcomeProbabilitiesPhase (31)
  readonly dependencies = ['crisis-points']; // Reads system state for unknown risks

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    const events: GameEvent[] = [];
    setDeterministicRng(rng);

    // === 1. CHECK FOR UNKNOWN UNKNOWN ===

    const event = checkForUnknownUnknown(state, rng, DEFAULT_UNKNOWN_UNKNOWN_CONFIG);

    if (event) {
      // === 2. APPLY EFFECTS ===
      applyUnknownUnknown(event, state);

      // === 3. LOG TO EVENT SYSTEM ===
      const severity = event.impact.magnitude === 'transformative' ? 'transformative' :
                       event.impact.magnitude === 'major' ? 'major' : 'minor';

      events.push({
        id: event.id,
        type: event.category === 'breakthrough' ? 'breakthrough' :
              event.category === 'crisis' ? 'crisis' : 'milestone',
        title: `${event.impact.positive ? '✨' : '💥'} ${event.category.toUpperCase()}: ${event.name}`,
        timestamp: state.currentMonth,
        description: event.description,
        severity: severity as any,
        agent: 'external',
        effects: {
          category: event.category,
          magnitude: event.impact.magnitude,
          domainsAffected: event.impact.domains.join(', '),
          positive: event.impact.positive
        }
      });

      // === 4. CONSOLE LOGGING ===
      const emoji = event.impact.positive ? '✨' : '💥';
      const sign = event.impact.positive ? '+' : '-';
      console.log(`\n☄️${emoji} UNKNOWN UNKNOWN EVENT (Month ${state.currentMonth})`);
      console.log(`   Category: ${event.category.toUpperCase()}`);
      console.log(`   Impact: ${sign}${event.impact.magnitude.toUpperCase()}`);
      console.log(`   Domains: ${event.impact.domains.join(', ')}`);
      console.log(`   Description: ${event.description}`);
      console.log(`   Total this run: ${state.unknownUnknownCount || 1}`);
    }

    // === 5. PERIODIC PROBABILITY LOGGING ===
    // Log every 24 months (2 years) if probability is significant
    if (state.currentMonth % 24 === 0) {
      const probability = calculateUnknownUnknownProbability(state, DEFAULT_UNKNOWN_UNKNOWN_CONFIG);

      // Validate probability is in valid range [0, 1]
      assertProbability(probability, {
        location: 'UnknownUnknownPhase.execute',
        valueName: 'calculatedProbability',
        month: state.currentMonth
      });

      if (probability > 0.002) { // > 0.2% monthly (worth noting)
        console.log(`\n☄️ UNKNOWN UNKNOWN PROBABILITY (Year ${Math.floor(state.currentMonth / 12)})`);
        console.log(`   Total: ${(probability * 100).toFixed(3)}% per month`);
        console.log(`   Base: ${(DEFAULT_UNKNOWN_UNKNOWN_CONFIG.baseProbability * 100).toFixed(3)}%`);

        const maxAICapability = state.aiAgents.length > 0
          ? Math.max(...state.aiAgents.map(ai => ai.capability))
          : 0;

        // Validate max AI capability is in valid range [0, 5]
        if (state.aiAgents.length > 0) {
          assertAIAggregateCapability(maxAICapability, {
            location: 'UnknownUnknownPhase.execute',
            valueName: 'maxAICapability'
          });
        }

        console.log(`   AI multiplier: ${(1 + Math.min(maxAICapability * 0.5, 1.0)).toFixed(2)}× (max capability: ${maxAICapability.toFixed(2)})`);

        const occurrenceCount = state.unknownUnknownCount || 0;
        if (occurrenceCount > 0) {
          console.log(`   Events this run: ${occurrenceCount}`);
        }
      }
    }

    return { events };
  }
}
