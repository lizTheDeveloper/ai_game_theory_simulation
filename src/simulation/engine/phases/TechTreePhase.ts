/**
 * TechTreePhase (12.5)
 *
 * Updates technology tree: checks for new tech unlocks, applies deployment actions,
 * updates research progress, and calculates tech effects.
 *
 * **EXECUTION ORDER:** 12.5 (after upward spirals, before social/environmental)
 * **DEPENDENCIES:**
 * - Reads AI capabilities (for unlock conditions)
 * - Reads economic stage (for unlock conditions)
 * - Reads government research investments
 * - Reads organization revenues
 * - Writes tech unlock status, deployment levels, effects
 *
 * **SIDE EFFECTS:**
 * - Unlocks new technologies when prerequisites are met
 * - Applies deployment actions from AIs and nations
 * - Updates research progress toward locked tech
 * - Applies tech effects to game state (scales with deployment level)
 */

import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertProbability } from '@/simulation/utils/assertions';
import {
  updateTechTree,
  TechTreeState,
  initializeTechTreeState
} from '../../techTree/engine';

export class TechTreePhase implements SimulationPhase {
  readonly id = 'tech-tree';
  readonly name = 'Technology Tree Update';
  readonly order = 12.5;

  // DEPENDENCIES (Nov 15, 2025): Requires AI capabilities for unlock conditions
  // NOTE: Tech tree READS state.economicModel.economicStage but doesn't DEPEND on economic-system phase
  // (economic-system runs at order 31.0, AFTER tech-tree at 12.5)
  // Economic stage is initialized once and stable (no phase dependency needed)
  readonly dependencies = [
    'ai-lifecycle',           // Order 3.0: AI capabilities affect tech unlocks
  ] as const;

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    // FIX #14 (Oct 2025): techTreeState is now a required GameState property
    setDeterministicRng(rng);
    // No need for initialization check or type casting - it's always present
    const techTreeState: TechTreeState = state.techTreeState;

    // Update tech tree (checks unlocks, applies actions, updates progress)
    const unlockEvents = updateTechTree(state, techTreeState, rng);

    // ASSERTIONS (Nov 7, 2025): Validate research progress values are probabilities
    // FIX (Nov 27, 2025): Sort entries for deterministic iteration order
    const sortedProgress = Object.entries(techTreeState.researchProgress).sort((a, b) => a[0].localeCompare(b[0]));
    for (const [techId, progress] of sortedProgress) {
      assertProbability(progress, {
        location: 'TechTreePhase.execute',
        valueName: `techTreeState.researchProgress.${techId}`,
        month: state.currentMonth
      });
    }

    // Convert tech unlock events to game events
    const events: GameEvent[] = unlockEvents.map(unlockEvent => ({
      id: `breakthrough_${state.currentMonth}_${unlockEvent.techId}`,
      timestamp: state.currentMonth,
      type: 'breakthrough',
      severity: 'constructive',
      agent: 'Research Community',
      title: `${unlockEvent.techName} Unlocked`,
      description: unlockEvent.reason,
      effects: {
        tech: unlockEvent.techId,
        category: unlockEvent.unlockedBy,
      },
    }));

    // Log significant progress (every 6 months)
    if (state.currentMonth % 6 === 0 && unlockEvents.length > 0) {
      console.log(`\n📊 TECH TREE PROGRESS (Month ${state.currentMonth})`);
      console.log(`   Unlocked: ${techTreeState.techUnlockedCount} technologies`);
      console.log(`   Deployed: ${techTreeState.techDeployedCount} fully deployed`);
      console.log(`   Investment: $${(techTreeState.totalInvestment / 1000).toFixed(1)}T total`);
      
      if (unlockEvents.length > 0) {
        console.log(`   Recent breakthroughs:`);
        for (const event of unlockEvents) {
          console.log(`     - ${event.techName} (${event.unlockedBy})`);
        }
      }
    }

    return { events };
  }
}

