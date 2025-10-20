/**
 * Environmental Feedback Phase
 *
 * Creates environmental state compatibility layer for Ecological paradigm.
 * Ensures all environmental metrics are accessible in expected format.
 *
 * **Phase Order:** 33.5 (right before MultiParadigmDUIUpdatePhase at 34.1)
 * **Feeds Into:** MultiParadigmDUIUpdatePhase (34.1) via Ecological calculation
 *
 * **Purpose:**
 * - Aggregate environmental metrics from multiple systems
 * - Create `state.environmental` compatibility layer
 * - Ensure planetary boundaries, climate, resources, pollution are current
 *
 * **Research Foundation:**
 * - Rockström et al. (2009): Planetary boundaries framework
 * - IPCC AR6 (2021-2023): Climate stability metrics
 * - UNEP (2024): Pollution tracking
 * - Steffen et al. (2015): Safe operating space for humanity
 *
 * @module simulation/engine/phases/EnvironmentalFeedbackPhase
 */

import type { GameState, RNGFunction } from '@/types/game';
import type { SimulationPhase, PhaseResult, PhaseContext } from '../PhaseOrchestrator';

/**
 * Environmental Feedback Phase
 *
 * Aggregates environmental state for Ecological paradigm calculation:
 * - Planetary boundaries status
 * - Climate stability
 * - Resource depletion
 * - Pollution levels
 */
export class EnvironmentalFeedbackPhase implements SimulationPhase {
  readonly id = 'environmental_feedback';
  readonly name = 'Environmental Feedback';
  readonly order = 33.5;

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    // Create environmental compatibility layer if not present
    if (!state.environmental) {
      state.environmental = {} as any;
    }

    // Aggregate climate state
    const climateState = aggregateClimateState(state);
    state.environmental.climateState = climateState;

    // Aggregate pollution level
    const pollutionLevel = aggregatePollutionLevel(state);
    state.environmental.pollutionLevel = pollutionLevel;

    // Aggregate resource depletion
    const resourceDepletion = aggregateResourceDepletion(state);
    state.environmental.resourceDepletion = resourceDepletion;

    // Update environmental accumulation tracking
    if (!state.environmentalAccumulation) {
      state.environmentalAccumulation = {
        resourceReserves: 0.65,      // 65% remaining (baseline)
        pollutionLevel: 0.40,        // 40% pollution (baseline)
        climateStability: 0.60,      // 60% stability (baseline)
        biodiversityLoss: 0.65,      // 35% loss (baseline)
        resourceDepletion: 35,       // 35% depleted (baseline)
      };
    }

    // Sync pollution to 0-100 scale
    state.environmentalAccumulation.pollutionLevel = pollutionLevel / 100;

    // Sync resource depletion
    state.environmentalAccumulation.resourceDepletion = resourceDepletion;

    const events: string[] = [];

    // Report significant changes (only log major updates)
    if (state.currentMonth % 12 === 0) { // Annual reporting
      events.push(
        `Environmental State: ` +
        `Climate=${climateState.globalTemperatureAnomaly.toFixed(2)}°C, ` +
        `Pollution=${pollutionLevel.toFixed(1)}, ` +
        `Resources=${(100 - resourceDepletion).toFixed(1)}% remaining`
      );
    }

    return { events };
  }
}

/**
 * Aggregate climate state from multiple sources
 * Priority: 1) climateState 2) environmental 3) defaults
 */
function aggregateClimateState(state: GameState): {
  globalTemperatureAnomaly: number;
  carbonPPM: number;
  climateStability: number;
} {
  // Check if climate state exists
  if (state.climateState) {
    return {
      globalTemperatureAnomaly: state.climateState.globalTemperatureAnomaly ?? 1.0,
      carbonPPM: state.climateState.carbonPPM ?? 420,
      climateStability: state.climateState.climateStability ?? 0.6,
    };
  }

  // Fallback to environmental accumulation
  if (state.environmentalAccumulation) {
    return {
      globalTemperatureAnomaly: 1.0 + (1 - state.environmentalAccumulation.climateStability) * 2.0,
      carbonPPM: 420,
      climateStability: state.environmentalAccumulation.climateStability ?? 0.6,
    };
  }

  // Defaults (current global state as of 2024)
  return {
    globalTemperatureAnomaly: 1.1, // IPCC AR6: +1.1°C above pre-industrial
    carbonPPM: 424,                // NOAA 2024: 424 ppm
    climateStability: 0.6,         // 60% stability (arbitrary baseline)
  };
}

/**
 * Aggregate pollution level from multiple sources
 * Returns 0-100 scale (higher = worse)
 */
function aggregatePollutionLevel(state: GameState): number {
  // Priority 1: Environmental accumulation (0-1 scale → 0-100)
  if (state.environmentalAccumulation?.pollutionLevel !== undefined) {
    return state.environmentalAccumulation.pollutionLevel * 100;
  }

  // Priority 2: Novel entities system (plastic, PFAS, etc.)
  if (state.novelEntities) {
    const plastic = state.novelEntities.plasticPollution?.concentration ?? 0;
    const pfas = state.novelEntities.pfas?.concentration ?? 0;
    const heavyMetals = state.novelEntities.heavyMetals?.concentration ?? 0;

    // Average of pollution types (0-1 → 0-100)
    const avgPollution = (plastic + pfas + heavyMetals) / 3;
    return avgPollution * 100;
  }

  // Default: Moderate pollution (global baseline ~40%)
  return 40;
}

/**
 * Aggregate resource depletion
 * Returns 0-100 scale (0 = abundant, 100 = exhausted)
 */
function aggregateResourceDepletion(state: GameState): number {
  let depletion = 0;
  let count = 0;

  // Check various resource systems
  if (state.phosphorusCrisis) {
    const phosphorusDepletion = 100 - (state.phosphorusCrisis.reservesRemaining ?? 70);
    depletion += phosphorusDepletion;
    count++;
  }

  if (state.freshwaterCrisis) {
    const freshwaterDepletion = state.freshwaterCrisis.scarcityLevel ?? 30;
    depletion += freshwaterDepletion;
    count++;
  }

  if (state.environmentalAccumulation) {
    const resourceReserves = state.environmentalAccumulation.resourceReserves ?? 0.65;
    const resourceDepletion = (1 - resourceReserves) * 100;
    depletion += resourceDepletion;
    count++;
  }

  // Average across available resource metrics
  if (count > 0) {
    return depletion / count;
  }

  // Default: Moderate depletion (global baseline ~35%)
  return 35;
}
