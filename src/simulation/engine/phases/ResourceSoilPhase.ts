/**
 * Resource Soil Phase (TIER 1.1 + 1.5)
 *
 * Consolidated soil and chemical pollution resource management:
 * - Phosphorus depletion (TIER 1.1): reserves, geopolitical tensions, supply shocks
 * - Novel entities (TIER 1.5): synthetic chemicals, PFAS, microplastics
 *
 * Research:
 * - Cordell & White (2014): Peak phosphorus supply
 * - UNEP (2024): Novel entities pollution tracking
 * - Persson et al. (2022): Planetary boundaries for novel entities
 *
 * Order: 20.1 (during environmental resource updates, after defensive AI)
 *
 * Batch 3 Consolidation (Nov 9, 2025): Merged PhosphorusPhase + NovelEntitiesPhase
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class ResourceSoilPhase implements SimulationPhase {
  readonly id = 'resource-soil';
  readonly name = 'Resource Soil Update';
  readonly order = 20.11;
  readonly dependencies = ['defensive-ai']; // Both original phases ran after AI actions

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    setDeterministicRng(rng);

    // === PHOSPHORUS SYSTEM (TIER 1.1) ===
    // Updates phosphorus reserves, geopolitical tensions, supply shocks, tech breakthroughs
    const {
      updatePhosphorusSystem,
      checkPhosphorusTechUnlocks
    } = require('../../phosphorusDepletion');

    updatePhosphorusSystem(state);
    checkPhosphorusTechUnlocks(state);

    // === NOVEL ENTITIES SYSTEM (TIER 1.5) ===
    // Updates synthetic chemical pollution, reproductive health, chronic disease, tech breakthroughs
    const {
      updateNovelEntitiesSystem,
      checkNovelEntitiesTechUnlocks
    } = require('../../novelEntities');

    updateNovelEntitiesSystem(state);
    checkNovelEntitiesTechUnlocks(state);

<<<<<<< HEAD
    // === LEGACY NUTRIENT STOCKS (TIER 2 HIGH, Nov 15, 2025) ===
    // Updates accumulated N/P stocks in soil/sediment, calculates legacy releases
    // Research: Lake Erie sediment loading, nitrogen half-life studies
    // Expected impact: Addresses 10% god mode effectiveness gap (nutrient reduction takes decades)
    const { updateLegacyNutrientStocks } = require('../../legacyNutrientStocks');

    // Calculate current monthly N/P inputs from phosphorus system
    // Baseline (2025): ~120 Mt N/year = ~10 Mt N/month, ~25 Mt P/year = ~2.1 Mt P/month
    // Inputs scale with phosphorus pollution level and population
    const phosphorusPollution = state.phosphorusSystem?.pollutionLevel ?? 0.25;
    const baselineNInput = 10.0;  // Mt N/month at 2025 baseline
    const baselinePInput = 2.1;   // Mt P/month at 2025 baseline

    // Current inputs scale with pollution level (higher pollution = more fertilizer use)
    const currentNInput = baselineNInput * (phosphorusPollution / 0.25);
    const currentPInput = baselinePInput * (phosphorusPollution / 0.25);

    // Update legacy stocks and get effective pollution (current + legacy releases)
    updateLegacyNutrientStocks(state, currentNInput, currentPInput);
=======
    // === LEGACY NUTRIENT STOCKS (TIER 2 HIGH - Nov 15, 2025) ===
    // Updates legacy nutrient releases from accumulated soil/sediment stocks
    // Creates INERTIA effect: even with 100% input reduction, pollution stays high for decades
    const { updateLegacyNutrientStocks } = require('../../legacyNutrientStocks');

    // Calculate current monthly nitrogen/phosphorus inputs
    // Baseline: 120 Mt N/year (10 Mt/month), 25 Mt P/year (2.08 Mt/month)
    const BASELINE_N_INPUT_MONTHLY = 120 / 12;  // 10 Mt N/month (2025 baseline)
    const BASELINE_P_INPUT_MONTHLY = 25 / 12;   // 2.08 Mt P/month (2025 baseline)

    // Adjust for economic activity (more development = more fertilizer use)
    const economicMultiplier = 1.0 + (state.globalMetrics.economicTransitionStage * 0.1);

    // Adjust for deployed nitrogen-reduction technologies
    // (This will be expanded when tech tree integration is complete)
    const techReduction = 0.0; // Placeholder: will calculate from deployed techs

    const currentNitrogenInput = BASELINE_N_INPUT_MONTHLY * economicMultiplier * (1 - techReduction);
    const currentPhosphorusInput = BASELINE_P_INPUT_MONTHLY * economicMultiplier * (1 - techReduction);

    // Update legacy stocks (accumulates inputs, releases legacy pollution)
    updateLegacyNutrientStocks(state, currentNitrogenInput, currentPhosphorusInput);
>>>>>>> origin/auto/worker-20251116_150001

    return { events: [] };
  }
}
