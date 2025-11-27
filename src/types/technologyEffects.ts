/**
 * Technology Effects Accumulator (Nov 27, 2025)
 *
 * Stores technology effects that need to be applied AFTER resource economy calculations.
 *
 * Architecture:
 * - TechTreePhase (12.5): Accumulates effects here
 * - ResourceEconomyPhase (17.0): Recalculates baseline from CO2
 * - TechCoolingPhase (17.5): Applies accumulated effects
 *
 * Why: Prevents phase order bug where ResourceEconomyPhase overwrites tech cooling effects.
 */

export interface TechnologyEffectsState {
  /**
   * Cooling from geoengineering technologies (°C reduction)
   *
   * Sources:
   * - Stratospheric aerosol injection (globalCooling effect)
   * - Marine cloud brightening (regionalCooling effect)
   *
   * Applied AFTER ResourceEconomyPhase recalculates temperature from CO2.
   */
  coolingFromGeoengineering: number;
}

/**
 * Initialize technology effects state
 */
export function initializeTechnologyEffects(): TechnologyEffectsState {
  return {
    coolingFromGeoengineering: 0.0,
  };
}
