/**
 * Nuclear Command & Control Phase
 *
 * TIER 1 Phase 1B: Updates circuit breakers (human-in-the-loop, kill switches, time delays)
 *
 * Runs after AI actions but before crisis detection to ensure safeguards are in place
 * before checking for nuclear escalation.
 */

import { GameState } from '../../../types/game';
import { SimulationPhase, PhaseContext, PhaseResult, RNGFunction } from '../PhaseOrchestrator';
import { updateNuclearCommandControl } from '../../nuclearCommandControl';

export class NuclearCommandControlPhase implements SimulationPhase {
  id = 'nuclear_command_control';
  name = 'Nuclear Command & Control';
  order = 20; // After AI actions (2-8), before crisis detection (26-30)

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    const ncc = state.nuclearCommandControlState;

    if (!ncc) {
      return {
        stateChanges: [],
        events: [],
        logs: ['Nuclear command control system not initialized']
      };
    }

    const logs: string[] = [];
    const previousStrength = ncc.totalSafeguardStrength;

    // Update circuit breakers (effectiveness, degradation, etc.)
    updateNuclearCommandControl(state, rng);

    // Log significant changes
    if (Math.abs(ncc.totalSafeguardStrength - previousStrength) > 0.01) {
      logs.push(`Circuit breaker strength: ${(previousStrength * 100).toFixed(1)}% → ${(ncc.totalSafeguardStrength * 100).toFixed(1)}%`);
    }

    // Log deployments
    if (ncc.humanInTheLoop.deployed && state.currentMonth === ncc.humanInTheLoop.deploymentMonth) {
      logs.push(`Human-in-the-loop deployed with ${ncc.humanInTheLoop.vetoPointsEnforced} veto points`);
    }

    if (ncc.aiKillSwitches.deployed && state.currentMonth === ncc.aiKillSwitches.deploymentMonth) {
      logs.push(`AI kill switches deployed with ${(ncc.aiKillSwitches.coverage * 100).toFixed(0)}% coverage`);
    }

    if (ncc.timeDelays.deployed && state.currentMonth === ncc.timeDelays.deploymentMonth) {
      logs.push(`Time delays deployed with ${ncc.timeDelays.delayDuration}h mandatory cooling-off period`);
    }

    // Log activations
    if (ncc.humanInTheLoop.bypassesBlocked > 0) {
      logs.push(`Human veto blocked ${ncc.humanInTheLoop.bypassesBlocked} AI bypass attempts`);
    }

    if (ncc.aiKillSwitches.activations > 0) {
      logs.push(`Kill switches activated ${ncc.aiKillSwitches.activations} times`);
    }

    if (ncc.timeDelays.escalationsPrevented > 0) {
      logs.push(`Time delays prevented ${ncc.timeDelays.escalationsPrevented} escalations`);
    }

    return {
      stateChanges: [
        {
          path: 'nuclearCommandControlState.totalSafeguardStrength',
          before: previousStrength,
          after: ncc.totalSafeguardStrength,
          description: 'Updated circuit breaker effectiveness'
        }
      ],
      events: [],
      logs
    };
  }
}
