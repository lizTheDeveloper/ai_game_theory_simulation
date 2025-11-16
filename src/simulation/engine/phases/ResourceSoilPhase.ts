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

    // === LEGACY NUTRIENT STOCKS (TIER 2 HIGH - Nov 15, 2025) ===
    // Research: Lake Erie sediment loading, nitrogen half-life studies
    // Updates accumulated nutrient stocks with exponential decay
    // Expected impact: Addresses 10% god mode effectiveness gap (legacy stock inertia)
    if (state.planetaryBoundariesSystem.regionalNitrogenManagement) {
      const { updateLegacyNutrientStocks } = require('../../legacyNutrientStocks');

      // Calculate global nitrogen inputs from regional totals
      const regionalManagement = state.planetaryBoundariesSystem.regionalNitrogenManagement;
      const totalNitrogenInputPerYear = regionalManagement.reduce(
        (sum, region) => sum + region.currentNitrogenInput,
        0
      );

      // Convert annual to monthly: Mt N/year → Mt N/month
      const currentNitrogenInput = totalNitrogenInputPerYear / 12;

      // Phosphorus inputs: ~25 Mt P/year baseline (from research)
      // Assume similar reduction patterns as nitrogen (tied to agricultural tech)
      const BASELINE_P_INPUT = 25; // Mt P/year (2025 baseline from research)
      const BASELINE_N_INPUT = 120; // Mt N/year (2025 baseline)
      const nitrogenReductionFactor = totalNitrogenInputPerYear / BASELINE_N_INPUT;
      const currentPhosphorusInput = (BASELINE_P_INPUT * nitrogenReductionFactor) / 12; // Monthly

      // Update legacy stocks (accumulation + decay)
      updateLegacyNutrientStocks(state, currentNitrogenInput, currentPhosphorusInput);

      // === NITROGEN-FOOD COUPLING (TIER 2 HIGH - Nov 15, 2025) ===
      // Research: Regional nitrogen overuse patterns, yield penalty curves
      // Updates food production index based on nitrogen reduction penalties
      // Expected impact: Realistic nitrogen reduction constraints (not "impossible", but harder in some regions)
      const { calculateNitrogenYieldPenalty, calculateTechnologyNitrogenReduction } = require('../../nitrogenFoodCoupling');

      // Update each region's food production index based on nitrogen reductions
      for (const region of regionalManagement) {
        // Calculate nitrogen reduction from deployed technologies
        const techReduction = region.deployedTechnologies.length > 0
          ? calculateTechnologyNitrogenReduction(
              region.deployedTechnologies.map(techId => {
                // Look up technology effectiveness from tech tree
                // For now, return baseline effectiveness (will be wired when technologies added)
                // TODO: Replace with actual tech lookup when tech tree updated
                return 0; // No technologies deployed yet
              })
            )
          : 0;

        // Calculate yield penalty for this region
        const yieldPenalty = calculateNitrogenYieldPenalty(techReduction, region.region);

        // Food production index = baseline (1.0) - yield penalty
        // Research: At 15% N reduction, 3% yield loss → foodProductionIndex = 0.97
        region.foodProductionIndex = 1.0 - yieldPenalty;

        // Track yield impact (negative = penalty, positive = gain from removing overuse)
        region.yieldImpact = -yieldPenalty;

        // Log annually for monitoring
        if (state.currentMonth % 12 === 0 && yieldPenalty > 0.01) {
          console.log(`  🌾 [${region.region}] N reduction: ${(techReduction * 100).toFixed(1)}%, Yield penalty: ${(yieldPenalty * 100).toFixed(1)}%, Food production: ${(region.foodProductionIndex * 100).toFixed(1)}%`);
        }
      }
    }

    return { events: [] };
  }
}
