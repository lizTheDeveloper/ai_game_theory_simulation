/**
 * Universal Basic Income (UBI) + Purpose Infrastructure Phase (TIER 2.1)
 */

import { GameState } from '@/types/game';
import { SimulationPhase, PhaseCategory } from '../types';
import { updateUBISystem } from '../../enhancedUBI';

import { PhaseResult, RNGFunction } from '../PhaseOrchestrator';

export class UBIPhase implements SimulationPhase {
  readonly name = 'Enhanced UBI Update';
  readonly id = 'ubi-system';
  readonly order = 15.5; // After social cohesion, before defensive AI
  
  execute(state: GameState, rng: RNGFunction): PhaseResult {
    updateUBISystem(state);
    return { events: [] };
  }
}

