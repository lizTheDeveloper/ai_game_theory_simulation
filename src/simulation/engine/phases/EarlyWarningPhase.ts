/**
 * EarlyWarningPhase (26.5)
 *
 * Detects approaching tipping points using early warning indicators.
 * Runs BEFORE CrisisDetectionPhase to enable preventive interventions.
 *
 * Research backing:
 * - TipESM Project (2020-2024): Critical slowing down indicators, TRL 7
 * - IPCC AR6 WG1 (2023): Tipping point detection methodologies, TRL 8
 * - Nature Climate Change (2024): 1-5 year advance warning possible
 *
 * Key mechanics:
 * - Detection window: 6-24 months before threshold (0.8-0.95)
 * - Detection quality scales with government investment (0.3-0.9)
 * - Generates warnings used by government for emergency interventions
 * - Critical infrastructure protection reduces cascade risk 30%
 *
 * **EXECUTION ORDER:** 26.5 (Before CrisisDetectionPhase at 27.0)
 * **DEPENDENCIES:** Planetary boundaries system, government state
 * **SIDE EFFECTS:**
 * - Updates early warning system state
 * - Generates tipping point warnings
 * - May reduce cascade risk via infrastructure protection
 */

import { SimulationPhase, PhaseResult } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';
import { RNGFunction } from '@/types/rng';
import { updateEarlyWarningDetection } from '@/simulation/earlyWarningSystems';

export class EarlyWarningPhase implements SimulationPhase {
  readonly id = 'early-warning';
  readonly name = 'Early Warning Detection';
  readonly order = 26.5;

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Only run if planetary boundaries system exists
    if (!state.planetaryBoundariesSystem || !state.planetaryBoundariesSystem.earlyWarning) {
      return { events: [] };
    }

    // Update early warning detection (scans boundaries for approaching thresholds)
    updateEarlyWarningDetection(state, rng);

    // No events generated - warnings are used by government agent
    return { events: [] };
  }
}
