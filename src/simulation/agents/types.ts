/**
 * Types for agent actions in the simulation
 */

import { GameState, GameEvent, PhaseContext } from '@/types/game';
import { deterministicRandom } from '@/simulation/utils/deterministicRng';

/**
 * Result of executing an action
 */
export interface ActionResult {
  success: boolean;
  newState?: GameState; // Optional - state is now mutated directly
  effects: Record<string, number>;
  events: GameEvent[];
  message: string;
}

/**
 * Base game action interface
 */
export interface GameAction {
  id: string;
  name: string;
  description: string;
  agentType: 'ai' | 'government' | 'society';
  energyCost: number;
  cooldown?: number;

  // Check if action can be taken
  // context added for H-1 (Nov 25, 2025): Optional PhaseContext for O(1) indices access
  canExecute: (state: GameState, agentId?: string, context?: PhaseContext) => boolean;

  // Execute action - returns new state
  // random is REQUIRED for deterministic simulation (never use deterministicRandom()!)
  // context added for H-1 (Nov 25, 2025): Optional PhaseContext for O(1) indices access
  execute: (state: GameState, random: () => number, agentId?: string, context?: PhaseContext) => ActionResult;
}

/**
 * Action frequency configuration
 */
export interface ActionFrequency {
  aiActionsPerMonth: number; // Default: 4 (weekly)
  societyActionsPerMonth: number; // Default: 2 (bi-weekly)
  governmentActionsPerMonth: number; // Configurable, default: 1
}

