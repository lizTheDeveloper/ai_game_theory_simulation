// Economic Types & Constants

export type EconomicStage = 0 | 1 | 2 | 3 | 4;

// Constants for the game
export const ECONOMIC_STAGE_NAMES = {
  0: 'Traditional Employment',
  1: 'AI Displacement Beginning',
  2: 'Mass Unemployment Crisis',
  3: 'UBI/Transition Policies',
  4: 'Post-Scarcity Abundance'
} as const;
