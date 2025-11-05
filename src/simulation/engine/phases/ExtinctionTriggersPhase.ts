/**
 * ExtinctionTriggersPhase (37.0)
 *
 * Checks for extinction scenario triggers (if not already in one).
 * Monitors various extinction pathways:
 * - Nuclear war
 * - Bioweapon release
 * - Grey goo (nanotech runaway)
 * - AI takeover
 * - Environmental collapse
 *
 * **EXECUTION ORDER:** 37.0 (After all calculations, before time advance)
 * **DEPENDENCIES:** Requires full state analysis
 * **SIDE EFFECTS:**
 * - Updates extinctionState if trigger detected
 * - Generates extinction trigger events
 */

import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class ExtinctionTriggersPhase implements SimulationPhase {
  readonly id = 'extinction-triggers';
  readonly name = 'Extinction Triggers Check';
  readonly order = 37.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Store previous active status to detect new extinction
    setDeterministicRng(rng);
    const wasActive = state.extinctionState.active;

    // Only check if not already in an extinction scenario
    if (wasActive) {
      return { events: [] };
    }

    // Import and execute extinction trigger detection
    const { checkExtinctionTriggers, classifyExtinctionType } = require('../../extinctions');

    const extinctionCheck = checkExtinctionTriggers(state, rng);

    // Update state with new extinction state
    Object.assign(state.extinctionState, extinctionCheck.newExtinctionState);

    const events = extinctionCheck.events || [];

    // If extinction just triggered, classify it based on what actually happened
    if (!wasActive && state.extinctionState.active) {
      const classification = classifyExtinctionType(state);

      // Store classification in extinction state
      state.extinctionState.classification = classification;
      state.extinctionState.type = classification.type;
      state.extinctionState.mechanism = classification.mechanism;

      // Add detailed classification event
      events.push({
        id: `extinction-classification-${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'catastrophe',
        severity: 'existential',
        agent: 'system',
        title: `Extinction Classified: ${classification.type.toUpperCase()}`,
        description: classification.reasoning,
        effects: {
          extinctionType: classification.type,
          mechanism: classification.mechanism,
          timelineMonths: classification.timelineMonths,
          confidence: classification.confidence
        }
      });

      console.log(`\n☠️  EXTINCTION DETECTED AND CLASSIFIED`);
      console.log(`Type: ${classification.type.toUpperCase()} (${classification.timelineMonths} months)`);
      console.log(`Mechanism: ${classification.mechanism}`);
      console.log(`Confidence: ${classification.confidence}`);
      console.log(`Reasoning: ${classification.reasoning}\n`);
    }

    return { events };
  }
}
