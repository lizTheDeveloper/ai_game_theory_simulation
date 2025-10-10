/**
 * SleeperWakePhase (0.3)
 *
 * Checks wake conditions for dormant sleeper agents.
 * Sleepers wake when they can act with impunity:
 * - High capability (can't be stopped)
 * - Wide spread (can't be removed)
 * - Weak detection (government blind)
 * - Weak control (government ineffective)
 * - Coordination (other sleepers awake - cascade)
 *
 * **EXECUTION ORDER:** 0.3 (After cybersecurity, before agent actions)
 * **DEPENDENCIES:** Requires AI agents and government state
 * **SIDE EFFECTS:**
 * - Changes sleeper state from 'dormant' to 'active'
 * - Reveals true capability
 */

import { SimulationPhase, PhaseResult } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';
import { RNGFunction } from '@/types/rng';

export class SleeperWakePhase implements SimulationPhase {
  readonly id = 'sleeper-wake';
  readonly name = 'Sleeper Agent Wake Check';
  readonly order = 6.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Import and execute existing sleeper wake logic
    const { processSleeperCascade } = require('../../sleeperWake');

    const wakeResult = processSleeperCascade(state);

    // Return wake events (cascades generate multiple events)
    return { events: wakeResult.events || [] };
  }
}
