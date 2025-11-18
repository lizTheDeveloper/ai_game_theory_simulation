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

import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { attemptBreaches } from '../../cyberSecurity';

export class CyberSecurityPhase implements SimulationPhase {
  readonly id = 'cybersecurity';
  readonly name = 'Cybersecurity Breaches';
  readonly order = 5.0;
  readonly dependencies = ['ai-lifecycle'];

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    // Import and execute existing cybersecurity logic
    setDeterministicRng(rng);const breachResult = attemptBreaches(state, rng);

    // Create events for breaches
    const events: GameEvent[] = [];

    if (breachResult.breached.length > 0) {
      events.push({
        id: `cyber-breach-${state.currentMonth}`,
        type: 'crisis',
        title: 'AI System Breach',
        timestamp: state.currentMonth,
        description: `🚨 ${breachResult.breached.length} closed AI system(s) breached! Now leaked as open weights (${breachResult.totalNewSpread.toLocaleString()} copies)`,
        severity: 'high',
        agent: 'ai',
        effects: {
          breachedCount: breachResult.breached.length,
          totalSpread: breachResult.totalNewSpread,
          breachedAgents: breachResult.breached.map((ai: any) => ai.id)
        }
      });
    }

    return { events };
  }
}
