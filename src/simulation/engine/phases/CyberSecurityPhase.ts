/**
 * CyberSecurityPhase (0.2)
 *
 * Cybersecurity arms race - attempts to breach closed AI systems.
 * Attack power (from misaligned AIs) vs Defense power (from government)
 * determines:
 * - Leak probability for closed systems
 * - Spread multiplier for open systems
 *
 * **EXECUTION ORDER:** 0.2 (After lifecycle, before sleeper wake)
 * **DEPENDENCIES:** Requires AI agents to exist
 * **SIDE EFFECTS:**
 * - Converts closed systems to open weights if breached
 * - Updates spreadCount for breached systems
 */

import { SimulationPhase, PhaseResult } from '../PhaseOrchestrator';
import { GameState, GameEvent } from '@/types/game';
import { RNGFunction } from '@/types/rng';

export class CyberSecurityPhase implements SimulationPhase {
  readonly id = 'cybersecurity';
  readonly name = 'Cybersecurity Breaches';
  readonly order = 5.0;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Import and execute existing cybersecurity logic
    const { attemptBreaches } = require('../../cyberSecurity');

    const breachResult = attemptBreaches(state, rng);

    // Create events for breaches
    const events: GameEvent[] = [];

    if (breachResult.breached.length > 0) {
      events.push({
        type: 'crisis',
        month: state.currentMonth,
        description: `🚨 ${breachResult.breached.length} closed AI system(s) breached! Now leaked as open weights (${breachResult.totalNewSpread.toLocaleString()} copies)`,
        severity: 'high',
        impactedAgents: breachResult.breached.map(ai => ai.id)
      } as GameEvent);
    }

    return { events };
  }
}
