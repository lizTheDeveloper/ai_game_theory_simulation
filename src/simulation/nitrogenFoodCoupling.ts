/**
 * Nitrogen-Food Production Coupling System (TIER 2 HIGH - Nov 15, 2025)
 *
 * Models the constraint that reducing nitrogen fertilizer affects crop yields,
 * with critical regional differentiation.
 *
 * Research backing:
 * - Science Advances (2024): 55% of South Asian rice farmers overuse nitrogen (zero penalty zone)
 * - Zhang et al. (2021): 30-70% N reduction possible with yield INCREASES of 10-30%
 * - Science Advances (2024): 3% yield loss at 15% N reduction (NOT catastrophic)
 * - Sub-Saharan Africa: 10% UNDERUSE (penalties start immediately)
 *
 * Key insight: NOT "physically impossible" (research-skeptic correction),
 * but "requires unprecedented coordination across heterogeneous agricultural systems"
 *
 * Penalty function (regional):
 * - Overuse zones (55% South Asia rice): Zero penalty until excess removed
 * - Optimal use: Nonlinear penalty curve (3% at 15%, accelerating beyond 30%)
 * - Underuse zones (Sub-Saharan Africa): Immediate penalties (need MORE nitrogen)
 *
 * Expected impact: Realistic nitrogen-food coupling, not artificial "impossibility"
 *
 * @see research/nitrogen_food_coupling_20251115.md
 * @see reviews/nitrogen_food_coupling_critique_20251115.md (Grade B, CONDITIONAL PASS)
 */

import type { GameState } from '@/types/game';
import type { RegionalNitrogenManagement } from '@/types/planetaryBoundaries';
import { assertFinite, assertInRange, assertProbability } from '@/simulation/utils/assertions';
import { hasTech } from '@/simulation/utils/simulationIndices';

/**
 * Regional overuse baselines from research
 *
 * Research sources:
 * - Science Advances (2024): 55% overuse in South Asian rice farming
 * - Regional agricultural efficiency studies
 * - FAO fertilizer use statistics (2024)
 */
const REGIONAL_OVERUSE: Record<string, number> = {
  southAsia: 0.55,      // 55% overuse (rice farming inefficiency)
  eastAsia: 0.35,       // 35% overuse (intensive agriculture)
  northAmerica: 0.20,   // 20% overuse (corn belt excess)
  europe: 0.15,         // 15% overuse (CAP subsidies drive overuse)
  latinAmerica: 0.10,   // 10% overuse (expanding agriculture)
  subSaharanAfrica: -0.10,  // 10% UNDERUSE (fertilizer poverty trap)
};

/**
 * Calculate nitrogen reduction yield penalty for a specific region
 *
 * Three-zone penalty function (research-backed):
 * 1. OVERUSE ZONE (reduction < regionalOveruse): NO PENALTY
 *    - Example: South Asia 55% overuse → can reduce 55% with NO yield loss
 *    - Research: Zhang et al. (2021) - overuse reduction often INCREASES yields
 *
 * 2. MODERATE REDUCTION (reduction 0-30%): GENTLE PENALTY
 *    - Science Advances (2024): 3% yield loss at 15% reduction
 *    - Nonlinear curve: penalty = (reduction - overuse) × 0.20
 *
 * 3. SEVERE REDUCTION (reduction > 60%): STEEP PENALTY
 *    - Rapid escalation as you approach biological minimums
 *    - Requires major technology deployment (vertical farming, nitroplasts, etc.)
 *
 * @param nitrogenReduction - [0, 1] Fraction of nitrogen inputs reduced
 * @param region - Region identifier (determines overuse baseline)
 * @returns Yield penalty [0, 1] where 0 = no loss, 1 = total crop failure
 */
export function calculateNitrogenYieldPenalty(
  nitrogenReduction: number,
  region: string = 'global'
): number {
  // Validate inputs
  const validatedReduction = assertProbability(nitrogenReduction, {
    location: 'calculateNitrogenYieldPenalty',
    valueName: 'nitrogenReduction',
    additionalInfo: { region }
  });

  // Get regional overuse baseline (default to global average if region unknown)
  const regionalOveruse = assertFinite(
    REGIONAL_OVERUSE[region] !== undefined ? REGIONAL_OVERUSE[region] : 0.20,
    {
      location: 'calculateNitrogenYieldPenalty',
      valueName: 'regionalOveruse',
      additionalInfo: { region }
    }
  );  // Default 20% overuse for unknown regions

  // === ZONE 1: OVERUSE REDUCTION (no penalty) ===
  if (validatedReduction <= regionalOveruse) {
    // Still in overuse territory - no yield penalty
    // Research: Zhang et al. (2021) - often yields INCREASE when removing excess
    return 0;
  }

  // === ZONE 2: MODERATE REDUCTION (gentle penalty) ===
  if (validatedReduction < 0.30) {
    // Science Advances (2024): 3% yield loss at 15% reduction
    // Linear interpolation from overuse threshold to 30% reduction
    const excessReduction = validatedReduction - regionalOveruse;
    const penaltySlope = 0.20;  // Calibrated to match 3% at 15% for typical regions
    const penalty = excessReduction * penaltySlope;

    return assertProbability(penalty, {
      location: 'calculateNitrogenYieldPenalty.moderateZone',
      valueName: 'penalty',
      additionalInfo: { nitrogenReduction, region, excessReduction }
    });
  }

  // === ZONE 3: SEVERE REDUCTION (steep penalty) ===
  if (validatedReduction < 0.60) {
    // Penalty at 30% reduction (from zone 2)
    const baseline = (0.30 - regionalOveruse) * 0.20;

    // Accelerating penalty from 30% to 60%
    const excessReduction = validatedReduction - 0.30;
    const accelerationSlope = 0.40;  // Steeper than zone 2
    const additionalPenalty = excessReduction * accelerationSlope;
    const totalPenalty = baseline + additionalPenalty;

    return assertProbability(Math.min(totalPenalty, 1.0), {
      location: 'calculateNitrogenYieldPenalty.severeZone',
      valueName: 'penalty',
      additionalInfo: { nitrogenReduction, region, baseline, additionalPenalty }
    });
  }

  // === ZONE 4: EXTREME REDUCTION (>60%, requires major tech) ===
  // Beyond 60% reduction: Rapid escalation toward crop failure
  // This is the "unprecedented coordination" zone - requires:
  // - Vertical farming (60% fertilizer reduction)
  // - Nitroplast integration (40-80% reduction)
  // - Alternative proteins (80× efficiency improvement)
  // - Food waste reduction (30% demand reduction)

  const baseline = (0.60 - regionalOveruse) * 0.40;  // Penalty at 60%
  const excessReduction = validatedReduction - 0.60;
  const extremeSlope = 1.5;  // Very steep - approaching biological limits
  const additionalPenalty = excessReduction * extremeSlope;
  const totalPenalty = baseline + additionalPenalty;

  return assertProbability(Math.min(totalPenalty, 1.0), {
    location: 'calculateNitrogenYieldPenalty.extremeZone',
    valueName: 'penalty',
    additionalInfo: { nitrogenReduction, region, baseline, additionalPenalty }
  });
}

/**
 * Calculate global nitrogen reduction from deployed technologies
 *
 * Uses MULTIPLICATIVE synergy model (research-skeptic correction):
 * - Old (WRONG): total = tech1 + tech2 + tech3 (can exceed 100%)
 * - New (CORRECT): residual = (1 - tech1) × (1 - tech2) × (1 - tech3)
 *
 * Example:
 * - Precision agriculture (30%) + vertical farming (60%) + food waste (25%)
 * - Additive: 30% + 60% + 25% = 115% (impossible!)
 * - Multiplicative: 1 - (0.7 × 0.4 × 0.75) = 79% reduction (realistic)
 *
 * @param deployedTechEffectiveness - Array of [0, 1] effectiveness values
 * @returns Total nitrogen reduction [0, 1]
 */
export function calculateTechnologyNitrogenReduction(
  deployedTechEffectiveness: number[]
): number {
  let residualNitrogen = 1.0;  // Start at 100% nitrogen use

  for (const effectiveness of deployedTechEffectiveness) {
    // Validate each tech effectiveness
    const validatedEffectiveness = assertProbability(effectiveness, {
      location: 'calculateTechnologyNitrogenReduction',
      valueName: 'effectiveness',
      additionalInfo: { deployedTechEffectiveness }
    });

    // Multiplicative reduction
    residualNitrogen *= (1 - validatedEffectiveness);
  }

  const totalReduction = 1 - residualNitrogen;

  return assertProbability(totalReduction, {
    location: 'calculateTechnologyNitrogenReduction',
    valueName: 'totalReduction',
    additionalInfo: { deployedTechEffectiveness, residualNitrogen }
  });
}

/**
 * Initialize regional nitrogen management tracking
 *
 * Creates 6 regional management objects with research-backed baselines:
 * - South Asia: High overuse (55% rice farming inefficiency)
 * - East Asia: Moderate overuse (35% intensive agriculture)
 * - North America: Low overuse (20% corn belt)
 * - Europe: Low overuse (15% CAP subsidies)
 * - Latin America: Minimal overuse (10% expanding agriculture)
 * - Sub-Saharan Africa: UNDERUSE (10% fertilizer poverty)
 *
 * Research: FAO fertilizer statistics (2024), regional agricultural efficiency studies
 */
export function initializeRegionalNitrogenManagement(): RegionalNitrogenManagement[] {
  // 2025 baseline: ~120 Mt N/year global fertilizer use
  // Regional distribution based on FAO statistics

  const regions: RegionalNitrogenManagement[] = [
    {
      region: 'southAsia',
      currentNitrogenInput: 30,      // Mt N/year (25% of global)
      optimalNitrogenInput: 19,      // Mt N/year (55% overuse)
      overusePercentage: 0.55,
      deployedTechnologies: [],
      yieldImpact: 0,
      foodProductionIndex: 1.0,
    },
    {
      region: 'eastAsia',
      currentNitrogenInput: 40,      // Mt N/year (33% of global - China dominates)
      optimalNitrogenInput: 30,      // Mt N/year (35% overuse)
      overusePercentage: 0.35,
      deployedTechnologies: [],
      yieldImpact: 0,
      foodProductionIndex: 1.0,
    },
    {
      region: 'northAmerica',
      currentNitrogenInput: 20,      // Mt N/year (17% of global)
      optimalNitrogenInput: 17,      // Mt N/year (20% overuse)
      overusePercentage: 0.20,
      deployedTechnologies: [],
      yieldImpact: 0,
      foodProductionIndex: 1.0,
    },
    {
      region: 'europe',
      currentNitrogenInput: 15,      // Mt N/year (12% of global)
      optimalNitrogenInput: 13,      // Mt N/year (15% overuse)
      overusePercentage: 0.15,
      deployedTechnologies: [],
      yieldImpact: 0,
      foodProductionIndex: 1.0,
    },
    {
      region: 'latinAmerica',
      currentNitrogenInput: 10,      // Mt N/year (8% of global)
      optimalNitrogenInput: 9,       // Mt N/year (10% overuse)
      overusePercentage: 0.10,
      deployedTechnologies: [],
      yieldImpact: 0,
      foodProductionIndex: 1.0,
    },
    {
      region: 'subSaharanAfrica',
      currentNitrogenInput: 5,       // Mt N/year (4% of global - severely under-fertilized)
      optimalNitrogenInput: 5.5,     // Mt N/year (10% UNDERUSE - need MORE)
      overusePercentage: -0.10,      // Negative = underuse
      deployedTechnologies: [],
      yieldImpact: 0,
      foodProductionIndex: 0.7,      // Lower baseline due to fertilizer poverty
    },
  ];

  return regions;
}

/**
 * Extract nitrogen-reducing technology deployment levels from state
 *
 * Reads tech tree state and calculates effective nitrogen reduction
 * for each deployed technology. Each tech contributes (deploymentLevel × maxEffectiveness).
 *
 * Technologies (research-backed effectiveness):
 * - Precision Agriculture: 30% reduction (5-10 year timeline)
 * - Biological N-Fixation: 25% reduction (10-15 year timeline)
 * - Nitrogen Circular Food: 20% reduction (5-10 year timeline)
 * - Ecosystem Restoration: 15% removal (10-20 year timeline)
 * - Nitrogen Monitoring: 10% efficiency gain (3-5 year timeline)
 * - Green Ammonia: 40% reduction (15-25 year timeline)
 *
 * @param state - Current game state
 * @returns Array of weighted effectiveness values [0, 1] for deployed technologies
 *
 * @see research/nitrogen_food_coupling_20251115.md for parameter justification
 */
export function getNitrogenReductionDeployment(state: GameState): number[] {
  const deployments: number[] = [];

  // Tech IDs from comprehensiveTechTree.ts
  const nitrogenTechIds = [
    { id: 'precision_agriculture', maxEffectiveness: 0.30 },
    { id: 'biological_nitrogen_fixation', maxEffectiveness: 0.25 },
    { id: 'nitrogen_circular_food', maxEffectiveness: 0.20 },
    { id: 'ecosystem_restoration_nitrogen', maxEffectiveness: 0.15 },
    { id: 'nitrogen_monitoring_networks', maxEffectiveness: 0.10 },
    { id: 'green_ammonia_production', maxEffectiveness: 0.40 },
  ];

  // Check if tech tree state exists (may not exist in older saves or tests)
  if (!state.techTreeState) {
    return deployments; // Return empty array if no tech tree
  }

  // Extract deployment levels from tech tree
  // Tech tree uses regional deployment, so we aggregate across all regions
  for (const { id, maxEffectiveness } of nitrogenTechIds) {
    // Check if tech is unlocked (O(n) fallback - no indices in this context)
    if (!hasTech(id, undefined, state.techTreeState)) {
      continue; // Skip locked tech
    }

    // Aggregate deployment across all regions
    let totalDeployment = 0;
    let regionCount = 0;

    for (const region in state.techTreeState.regionalDeployment) {
      const regionalTechs = state.techTreeState.regionalDeployment[region];
      const deployedTech = regionalTechs?.find(t => t.techId === id);

      if (deployedTech) {
        totalDeployment += deployedTech.deploymentLevel;
        regionCount++;
      }
    }

    // Calculate average deployment across regions
    if (regionCount > 0) {
      const avgDeployment = totalDeployment / regionCount;

      // Validate deployment level
      const validatedDeployment = assertProbability(avgDeployment, {
        location: 'getNitrogenReductionDeployment',
        valueName: `${id}.deploymentLevel`,
        additionalInfo: { regionCount, totalDeployment }
      });

      // Add weighted effectiveness
      deployments.push(validatedDeployment * maxEffectiveness);
    }
  }

  return deployments;
}

/**
 * Update regional nitrogen management and calculate global food production impact
 *
 * Steps:
 * 1. Collect nitrogen-reducing tech from tech tree
 * 2. Calculate global nitrogen reduction (multiplicative synergy)
 * 3. Calculate regional yield penalties (nonlinear, region-specific)
 * 4. Aggregate to global food production index
 * 5. Update regional management state (separate read/write for safety)
 *
 * @param state - Current game state
 * @returns Global food production multiplier [0, 2] where 1.0 = baseline
 */
export function updateNitrogenFoodCoupling(state: GameState): number {
  // Initialize regional management if not present
  if (!state.planetaryBoundariesSystem.regionalNitrogenManagement) {
    console.log('⚠️ WARNING: regionalNitrogenManagement not initialized, creating default');
    state.planetaryBoundariesSystem.regionalNitrogenManagement = initializeRegionalNitrogenManagement();
  }

  const regions = state.planetaryBoundariesSystem.regionalNitrogenManagement;

  // STEP 1: Collect deployed nitrogen-reducing technologies
  const deployedTechEffectiveness = getNitrogenReductionDeployment(state);

  // STEP 2: Calculate global nitrogen reduction from technologies
  const globalNitrogenReduction = calculateTechnologyNitrogenReduction(deployedTechEffectiveness);

  // STEP 3 & 4: Calculate regional yield impacts and aggregate
  let globalFoodProduction = 0;
  let totalRegionalWeight = 0;

  // Regional state updates (separate calculation from mutation)
  const regionalUpdates: Array<{
    region: string;
    yieldImpact: number;
    newNitrogenInput: number;
    foodProductionIndex: number;
  }> = [];

  for (const region of regions) {
    // Calculate yield penalty for this region
    const yieldPenalty = calculateNitrogenYieldPenalty(globalNitrogenReduction, region.region);

    // Calculate new values (NOT mutating yet)
    const yieldImpact = -yieldPenalty;  // Negative = penalty
    const newNitrogenInput = region.currentNitrogenInput * (1 - globalNitrogenReduction);
    const foodProductionIndex = Math.max(0, region.foodProductionIndex * (1 - yieldPenalty));

    // Store for later mutation
    regionalUpdates.push({
      region: region.region,
      yieldImpact,
      newNitrogenInput,
      foodProductionIndex
    });

    // Weight by current nitrogen use (not the new value)
    const regionalWeight = region.currentNitrogenInput;
    globalFoodProduction += foodProductionIndex * regionalWeight;
    totalRegionalWeight += regionalWeight;
  }

  // STEP 5: Now apply all regional updates (read complete, now write)
  for (let i = 0; i < regions.length; i++) {
    const region = regions[i];
    const update = regionalUpdates[i];

    region.yieldImpact = update.yieldImpact;
    region.currentNitrogenInput = update.newNitrogenInput;
    region.foodProductionIndex = update.foodProductionIndex;

    // Update deployed tech IDs (from placeholder to actual tech)
    // Only store tech IDs that are actually contributing
    region.deployedTechnologies = getNitrogenReductionDeployment(state)
      .length > 0
      ? Object.keys(state.techTreeState.regionalDeployment['global'] || {})
          .filter(techId => ['soil_p_optimization', 'vertical_farming', 'precision_fermentation',
                             'circular_food_systems', 'drought_resistant_crops'].includes(techId))
      : [];
  }

  // Global food production index (weighted average)
  const globalFoodProductionIndex = totalRegionalWeight > 0
    ? globalFoodProduction / totalRegionalWeight
    : 1.0;

  // Validate output
  const finalIndex = assertFinite(globalFoodProductionIndex, {
    location: 'updateNitrogenFoodCoupling',
    valueName: 'globalFoodProductionIndex',
    month: state.currentMonth,
    additionalInfo: { globalNitrogenReduction, deployedTechEffectiveness }
  });

  // Logging for diagnostics
  if (state.currentMonth % 12 === 0) {
    console.log(`\n=== Nitrogen-Food Coupling (Year ${Math.floor(state.currentMonth / 12)}) ===`);
    console.log(`  🌾 Global nitrogen reduction: ${(globalNitrogenReduction * 100).toFixed(1)}%`);
    console.log(`  🌍 Global food production index: ${finalIndex.toFixed(3)}`);
    console.log(`  🔧 Deployed nitrogen-reducing tech: ${deployedTechEffectiveness.length} active`);
    for (const region of regions) {
      console.log(`  📍 ${region.region}: Production ${region.foodProductionIndex.toFixed(3)}, Yield impact ${(region.yieldImpact * 100).toFixed(1)}%`);
    }
  }

  return finalIndex;
}
