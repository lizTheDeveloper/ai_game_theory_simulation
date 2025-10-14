/**
 * Types for agent actions in the simulation
 */

import { GameState, GameEvent } from '@/types/game';

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
  canExecute: (state: GameState, agentId?: string) => boolean;
  
  // Execute action - returns new state
  execute: (state: GameState, agentId?: string, random?: () => number) => ActionResult;
}

/**
 * Action frequency configuration
 */
export interface ActionFrequency {
  aiActionsPerMonth: number; // Default: 4 (weekly)
  societyActionsPerMonth: number; // Default: 2 (bi-weekly)
  governmentActionsPerMonth: number; // Configurable, default: 1
}

