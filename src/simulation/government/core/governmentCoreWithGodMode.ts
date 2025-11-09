/**
 * Government Core with God Mode Integration
 *
 * Enhanced version of governmentCore that respects God Mode overrides.
 */

import { GameState } from '@/types/game';
import { godMode } from '@/simulation/godMode/GodModeController';
import {
  selectGovernmentAction as originalSelectAction,
  executeGovernmentActions as originalExecuteActions,
  getAllGovernmentActions
} from './governmentCore';

/**
 * Enhanced government action selection with God Mode override support
 */
export function selectGovernmentActionWithGodMode(
  state: GameState,
  random: () => number
) {
  // Check for God Mode override first
  if (godMode.isEnabled()) {
    const override = godMode.getGovernmentActionOverride();
    if (override) {
      console.log(`🎮 God Mode: Forcing government action - ${override.name}`);
      return override;
    }
  }

  // Fall back to original selection logic
  return originalSelectAction(state, random);
}

/**
 * Enhanced government action execution with God Mode state overrides
 */
export function executeGovernmentActionsWithGodMode(
  state: GameState,
  rng: () => number
) {
  // Apply God Mode state overrides before execution
  if (godMode.isEnabled()) {
    godMode.applyOverrides(state);

    // Check if we should pause for manual decision
    if (godMode.shouldPausePhase('government-actions')) {
      console.log('🎮 God Mode: Paused at Government Actions phase');
      // In a real implementation, this would trigger a UI pause
      // For now, we just log it
    }
  }

  // Use enhanced selection
  const enhancedState = { ...state };
  const selectAction = (s: GameState, r: () => number) =>
    selectGovernmentActionWithGodMode(s, r);

  // Execute with enhanced selection
  const result = originalExecuteActions(enhancedState, rng);

  // Log if God Mode is active
  if (godMode.isEnabled()) {
    console.log(`🎮 God Mode: Government phase completed with ${
      godMode['overrides'].size
    } active overrides`);
  }

  return result;
}

// Re-export unchanged functions
export { getAllGovernmentActions };