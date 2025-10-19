/**
 * Workflow Adaptation Phase
 * FIX #4A (Oct 19, 2025): S-curve organizational adoption with resistance mechanics
 *
 * Updates workflow adaptation rate using research-backed logistic growth model.
 *
 * Research:
 * - McKinsey (2024): 21% of organizations have redesigned workflows for AI
 * - Rogers Innovation Diffusion: Critical mass at 15-25% triggers network effects
 * - Autor (2024): Bimodal distribution - NOT linear adoption
 * - McKinsey (2024): 88% pilot failure rate - resistance is major barrier
 */

import { SimulationPhase, PhaseResult, RNGFunction } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';
import { updateWorkflowAdaptation } from '@/simulation/workflowAdaptation';

export class WorkflowAdaptationPhase implements SimulationPhase {
  readonly id = 'workflow-adaptation';
  readonly name = 'Workflow Adaptation Update';
  readonly order = 24.0;  // After trust/social cohesion (23), before upward spirals (25)

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Update workflow adaptation using S-curve model
    updateWorkflowAdaptation(state, rng);

    return { events: [] };
  }
}
