/**
 * Environmental Accumulation System - Phase 2
 *
 * Wraps existing environmental.ts functionality with the AccumulationSystem interface.
 * This provides a standardized way to interact with the environmental system
 * without changing any of the existing simulation logic.
 */

import { GameState } from '@/types/game';
import { EnvironmentalAccumulation } from '@/types/accumulation';
import { AccumulationSystem } from './interfaces';
import {
  initializeEnvironmentalAccumulation,
  updateEnvironmentalAccumulation,
  getEnvironmentalSustainability,
  hasEnvironmentalCrisis
} from '../environmental';

/**
 * Environmental accumulation system (wrapper for backward compatibility)
 *
 * CRITICAL FIX (Nov 7, 2025): Now requires RNG via constructor
 * Removed Math.random fallbacks (CRITICAL-3 regression fix)
 */
export class EnvironmentalSystem implements AccumulationSystem<EnvironmentalAccumulation> {
  readonly id = 'environmental';
  readonly name = 'Environmental Accumulation';
  private rng: () => number;

  constructor(rng: () => number) {
    if (!rng || typeof rng !== 'function') {
      throw new Error('❌ CRITICAL: EnvironmentalSystem requires RNG function. NEVER use Math.random.');
    }
    this.rng = rng;
  }

  initialize(): EnvironmentalAccumulation {
    return initializeEnvironmentalAccumulation(this.rng);
  }

  update(globalState: GameState): void {
    // Use deterministic RNG provided via constructor (NOT Math.random)
    updateEnvironmentalAccumulation(globalState, this.rng);
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
