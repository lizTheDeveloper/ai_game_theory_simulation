/**
 * CatastrophicScenariosPhase (40.0)
 *
 * Updates catastrophic scenario prerequisites and tracks progress.
 * Monitors multi-step pathways to catastrophic outcomes:
 * - Updates scenario prerequisite completion
 * - Generates events for newly met prerequisites
 * - Tracks scenario activation when all prerequisites met
 *
 * **EXECUTION ORDER:** 40.0 (After tech diffusion, before event collection)
 * **DEPENDENCIES:** Requires catastrophicScenarios state
 * **SIDE EFFECTS:**
 * - Updates catastrophicScenarios prerequisites
 * - Generates prerequisite met events
 * - Generates scenario activation events
 */

import { SimulationPhase, PhaseResult } from '../PhaseOrchestrator';
import { GameState, GameEvent } from '@/types/game';
import { RNGFunction } from '@/types/rng';

export class CatastrophicScenariosPhase implements SimulationPhase {
  readonly id = 'catastrophic-scenarios';
  readonly name = 'Catastrophic Scenarios';
  readonly order = 40.0;

  execute(state: GameState, _rng: RNGFunction): PhaseResult {
    // Import catastrophic scenarios module
    const { updateScenarioPrerequisites, getScenarioSummary } = require('../../catastrophicScenarios');

    // Update scenario prerequisites (mutates state)
    const newlyMetPrereqs = updateScenarioPrerequisites(state.catastrophicScenarios, state);

    const events: GameEvent[] = [];

    // Generate events for newly met prerequisites
    if (newlyMetPrereqs.length > 0) {
      for (const prereq of newlyMetPrereqs) {
        events.push({
          type: 'technology',
          month: state.currentMonth,
          description: `📋 Catastrophic scenario prerequisite met: ${prereq.scenarioName} - ${prereq.stepName}`,
          severity: 'medium'
        } as GameEvent);
      }
    }

    // Check for scenario activations (all prerequisites met)
    const summary = getScenarioSummary(state.catastrophicScenarios);
    if (summary.activeScenarios.length > 0) {
      for (const scenario of summary.activeScenarios) {
        events.push({
          type: 'crisis',
          month: state.currentMonth,
          description: `⚠️ Catastrophic scenario ACTIVE: ${scenario.name} - Outcome inevitable in ${scenario.timeToCompletion} months`,
          severity: 'high'
        } as GameEvent);
      }
    }

    return { events };
  }
}
