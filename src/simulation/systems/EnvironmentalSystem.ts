/**
 * Environmental Accumulation System - Phase 2
 *
 * Wraps existing environmental.ts functionality with the AccumulationSystem interface.
 * This provides a standardized way to interact with the environmental system
 * without changing any of the existing simulation logic.
 */

import { GameState } from '@/types/game';
import { AccumulationSystem } from './interfaces';
import {
  EnvironmentalAccumulation,
  initializeEnvironmentalAccumulation,
  updateEnvironmentalAccumulation,
  getEnvironmentalSustainability,
  hasEnvironmentalCrisis
} from '../environmental';

/**
 * Environmental accumulation system (wrapper for backward compatibility)
 */
export class EnvironmentalSystem implements AccumulationSystem<EnvironmentalAccumulation> {
  readonly id = 'environmental';
  readonly name = 'Environmental Accumulation';

  initialize(): EnvironmentalAccumulation {
    return initializeEnvironmentalAccumulation();
  }

  update(globalState: GameState): void {
    updateEnvironmentalAccumulation(globalState);
  }

  getSustainability(globalState: GameState): number {
    return getEnvironmentalSustainability(globalState.environmentalAccumulation);
  }

  hasCrisis(globalState: GameState): boolean {
    return hasEnvironmentalCrisis(globalState.environmentalAccumulation);
  }

  getActiveCrises(globalState: GameState): string[] {
    const crises: string[] = [];
    const env = globalState.environmentalAccumulation;

    if (env.resourceCrisisActive) {
      crises.push('Resource Crisis');
    }
    if (env.pollutionCrisisActive) {
      crises.push('Pollution Crisis');
    }
    if (env.climateCrisisActive) {
      crises.push('Climate Crisis');
    }
    if (env.ecosystemCrisisActive) {
      crises.push('Ecosystem Crisis');
    }

    return crises;
  }
}
