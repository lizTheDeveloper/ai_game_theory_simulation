/**
 * Universal Basic Income (UBI) + Purpose Infrastructure Phase (TIER 2.1)
 */

import { GameState } from '@/types/game';
import { SimulationPhase, PhaseCategory } from '../types';
import { updateUBISystem } from '../../enhancedUBI';

export const UBIPhase: SimulationPhase = {
  name: 'Enhanced UBI Update',
  id: 'ubi-system',
  category: 'social' as PhaseCategory,
  
  execute(state: GameState): void {
    updateUBISystem(state);
  },
  
  shouldRun(state: GameState): boolean {
    // Run if UBI is active, or if it should be monitored
    return state.ubiSystem.active || state.society.unemploymentLevel > 0.2;
  }
};

