// Event & Action Types

export interface GameEvent {
  id: string;
  timestamp: number; // month
  type: 'breakthrough' | 'crisis' | 'action' | 'milestone';
  severity: 'info' | 'warning' | 'destructive';
  agent: string; // Which agent caused this event
  title: string;
  description: string;
  effects: Record<string, number>; // State changes caused
}

// Action types for game events
export type GameAction =
  | { type: 'ADVANCE_DAY' }
  | { type: 'ADVANCE_MONTH' }
  | { type: 'SET_SPEED'; payload: 'paused' | 'slow' | 'normal' | 'fast' | 'max' }
  | { type: 'UPDATE_CONFIG'; payload: Partial<import('./config').ConfigurationSettings> }
  | { type: 'AI_ACTION'; payload: { agentId: string; action: string } }
  | { type: 'GOVERNMENT_ACTION'; payload: { action: string } }
  | { type: 'SOCIETY_ACTION'; payload: { action: string } }
  | { type: 'TECHNOLOGY_BREAKTHROUGH'; payload: { technologyId: string } }
  | { type: 'RANDOM_EVENT'; payload: GameEvent }
  | { type: 'RESET_GAME' }
  | { type: 'LOAD_PRESET'; payload: string };

// Utility types for the game
export type AgentType = 'ai' | 'government' | 'society';
