/**
 * God Mode Controller Stub
 *
 * Stub implementation for God Mode functionality.
 * Currently disabled - returns no overrides.
 */

import { GameState } from '@/types/game';

export interface GodModeController {
  isEnabled(): boolean;
  getGovernmentActionOverride(): any | null;
  applyOverrides(state: GameState): void;
  shouldPausePhase(phaseName: string): boolean;
}

class GodModeControllerImpl implements GodModeController {
  isEnabled(): boolean {
    return false;
  }

  getGovernmentActionOverride(): any | null {
    return null;
  }

  applyOverrides(state: GameState): void {
    // Stub - no overrides applied
  }

  shouldPausePhase(phaseName: string): boolean {
    return false;
  }
}

export const godMode = new GodModeControllerImpl();
