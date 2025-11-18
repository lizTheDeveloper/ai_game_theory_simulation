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
import { assertDefined, assertProbability } from '@/simulation/utils/assertions';
import { checkExtinctionTriggers, classifyExtinctionType } from '../../extinctions';

export class ExtinctionTriggersPhase implements SimulationPhase {
  readonly id = 'extinction-triggers';
  readonly name = 'Extinction Triggers Check';
  readonly order = 37.0;

  // DEPENDENCIES (Nov 6, 2025): Must run after all risk accumulation
  readonly dependencies = [
    'bayesian_mortality_resolution',  // Order 35.0: Population mortality resolved
    'climate_system',                 // Order 34.0: Climate collapse detection (Batch 3: consolidated from climate_impact_cascade)
    'crisis-detection',               // Order 36.0: Crisis state assessed
    // NOTE: nuclear_winter order is 252 (AFTER this phase) - not a dependency
  ] as const;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Store previous active status to detect new extinction
    setDeterministicRng(rng);
    const wasActive = assertDefined(state.extinctionState.active, {
      location: 'ExtinctionTriggersPhase.execute',
      valueName: 'extinctionState.active',
      month: state.currentMonth,
      expectedSource: 'initialization.ts'
    });

    // Only check if not already in an extinction scenario
    if (wasActive) {
      return { events: [] };
    }

    // Import and execute extinction trigger detectionconst extinctionCheck = checkExtinctionTriggers(state, rng);

    // Validate extinction check result
    assertDefined(extinctionCheck.newExtinctionState, {
      location: 'ExtinctionTriggersPhase.execute',
      valueName: 'extinctionCheck.newExtinctionState',
      month: state.currentMonth,
      expectedSource: 'extinctions.checkExtinctionTriggers'
    });

    // Update state with new extinction state
    Object.assign(state.extinctionState, extinctionCheck.newExtinctionState);

    const events = extinctionCheck.events || [];

    // If extinction just triggered, classify it based on what actually happened
    if (!wasActive && state.extinctionState.active) {
      const classification = classifyExtinctionType(state);

      // Validate classification confidence is a valid probability
      assertProbability(classification.confidence, {
        location: 'ExtinctionTriggersPhase.execute',
        valueName: 'classification.confidence',
        month: state.currentMonth,
        additionalInfo: {
          extinctionType: classification.type,
          mechanism: classification.mechanism
        }
      });

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
