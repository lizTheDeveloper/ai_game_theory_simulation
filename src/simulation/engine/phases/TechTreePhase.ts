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

import { SimulationPhase, PhaseResult, RNGFunction, PhaseContext } from '../PhaseOrchestrator';
import { GameState, GameEvent } from '@/types/game';
import { 
  updateTechTree, 
  TechTreeState,
  initializeTechTreeState 
} from '../../techTree/engine';

export class TechTreePhase implements SimulationPhase {
  readonly id = 'tech-tree';
  readonly name = 'Technology Tree Update';
  readonly order = 12.5;

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    // Initialize tech tree state if not present
    if (!(state as any).techTreeState) {
      console.log('\n🌳 INITIALIZING TECH TREE STATE');
      (state as any).techTreeState = initializeTechTreeState();
      console.log(`   ${(state as any).techTreeState.techUnlockedCount} technologies unlocked (deployed_2025)`);
      console.log(`   Unlocked tech IDs: ${Array.from((state as any).techTreeState.unlockedTech).slice(0, 5).join(', ')}...`);
    }

    const techTreeState: TechTreeState = (state as any).techTreeState;

    // Update tech tree (checks unlocks, applies actions, updates progress)
    const unlockEvents = updateTechTree(state, techTreeState);

    // Convert tech unlock events to game events
    const events: GameEvent[] = unlockEvents.map(unlockEvent => ({
      month: state.currentMonth,
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

