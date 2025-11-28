/**
 * Historical Mode Utility (Nov 27, 2025)
 *
 * Single source of truth for historical mode checks.
 * Replaces scattered pattern: `state.config.scenarioMode === 'historical' && state.currentYear <= 2024`
 *
 * RATIONALE (Architecture Review H-1):
 * Flag proliferation anti-pattern: Same check copy-pasted across 9+ files creates maintenance burden.
 * If hindcast period changes (e.g., extend to 2030), all files must be updated manually.
 *
 * SOLUTION:
 * Extract to utility function with config-driven end year. Update once, propagates everywhere.
 */

import type { GameState } from '@/types/game';
import { assertDefined } from './assertions';

/**
 * Check if historical mode is currently active
 *
 * Historical mode dampens crisis systems during hindcast validation to prevent
 * massive errors on baseline period. Only active when:
 * 1. scenarioMode is 'historical', AND
 * 2. currentYear <= historicalModeEndYear (default: 2024)
 *
 * Research: research/historical_mode_parameters_20251127.md
 * Used in: ExogenousShock, BaselineMortality, PlanetaryBoundaries, Climate, ResourceDepletion phases
 *
 * @param state - GameState to check
 * @returns true if historical mode active, false otherwise
 */
export function isHistoricalModeActive(state: GameState): boolean {
  // Historical mode must be explicitly enabled
  if (state.config.scenarioMode !== 'historical') {
    return false;
  }

  // Get end year from config (default: 2024 if not specified)
  const endYear = state.config.historicalModeEndYear ?? 2024;

  // Active if current year <= end year
  return state.currentYear <= endYear;
}

/**
 * Check if historical emissions forcing is active
 *
 * Historical emissions mode bypasses endogenous emissions model and uses
 * empirical Global Carbon Project data for hindcast calibration.
 *
 * Research: research/climate_hindcast_data_20251126.md
 * Root cause: Endogenous model generates 18% excess CO2 vs. historical
 *
 * WARNING: This mode is ONLY for hindcast validation (1990-2010).
 * Default mode uses endogenous emissions.
 *
 * @param state - GameState to check
 * @returns true if historical emissions forcing active, false otherwise
 */
export function isHistoricalEmissionsModeActive(state: GameState): boolean {
  return state.config.historicalEmissionsMode === true;
}
