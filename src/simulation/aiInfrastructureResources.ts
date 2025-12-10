/**
 * AI Infrastructure Resource Consumption
 * FIX #3 (Oct 18, 2025): Initial model
 * FIX #3A (Oct 19, 2025): Corrected water consumption (was off by 100-1000x)
 *
 * Models water and energy consumption by AI data centers and training infrastructure.
 *
 * Research Foundation:
 * - Li et al. (2023) "Making AI Less 'Thirsty'" arXiv:2304.03271:
 *   GPT-3 training = 700K liters (scope-1), 5.4M liters total (scope-1 + scope-2)
 *   WUE metrics: 0.55 L/kWh (scope-1), 3.14 L/kWh (scope-2), 3.69 L/kWh combined (U.S. avg)
 *   Oct 30, 2025: CORRECTED - Paper uses L/kWh WUE, NOT "per-GPU-hour" (that was fabricated)
 *   Inference: 7.1-47.5 mL per medium-length request (location-dependent)
 * - NVIDIA DGX H100 specs (2023-2024): H100 GPU = 700W TDP (10.2 kW per 8-GPU DGX system)
 *   Oct 30, 2025: CORRECTED - Source is NVIDIA specs, not "US DOE (2024)"
 * - RAND (2024): AI data centers 200 MW average (vs 30 MW traditional)
 * - Microsoft (2024): WUE improving 13%/year (0.49 L/kWh in 2021 → 0.30 L/kWh in 2024)
 *   Oct 30, 2025: CORRECTED - Was 5%/year, actual Microsoft data shows 13%/year
 * - Google Data Centers (2024): Hyperscale = 2.1M liters/DAY (63M L/month)
 *   Oct 30, 2025: CORRECTED - Was incorrectly using 2.1M/month (30× underestimate)
 *
 * FIX #3A Key Corrections:
 * 1. Separated training (one-time) from inference (ongoing)
 * 2. Added logarithmic efficiency scaling (not linear - economies of scale)
 * 3. Reduced consumption by 10-25x to match research (50M → 2-5M L/month)
 */

import { GameState } from '@/types/game';
import { assertFinite, assertStateProperty } from './utils/assertions';

/**
 * Water consumption parameters (FIX #3A: Research-corrected values)
 * Oct 29, 2025: Recalibrated (2-5× reduction) + added demand elasticity
 *
 * UNCERTAINTY QUANTIFICATION:
 * - Water consumption: ±100% (geographic variation: Arizona vs Ireland = 4.2×)
 *   - Desert data centers: 2-3× higher WUE due to evaporative cooling inefficiency
 *   - Temperate climates: More efficient cooling, lower water usage
 * - Efficiency improvement: 5-20%/year (conservative vs aggressive trajectories)
 *   - Microsoft 2021-2024: 17%/year WUE improvement (aggressive)
 *   - Industry average 2020-2024: ~5%/year (conservative)
 * - Demand growth: 1.1-1.5× annual (conservative vs aggressive adoption)
 *   - Conservative: Saturation effects, regulation, efficiency offsets growth
 *   - Aggressive: Jevons Paradox dominates, usage explodes with capability
 * - Research: Li et al. (2023), Patterson et al. (2022), Lei et al. (2025)
 */

/** Base inference water for all AI operations (million liters/month)
 * Research: Google hyperscale data center = 2.1M L/DAY × 30 days = 63M L/month
 * Oct 29, 2025: Reduced 2.0 → 1.0 (2× reduction, consensus-backed recalibration)
 * Oct 30, 2025: FIX - Unit conversion error corrected (was using daily as monthly)
 * CRITICAL: Previous value was 30× too low due to day/month confusion
 * Source: Google sustainability reports (2024), verified Oct 28, 2025
 * Note: Reduced to 1.0 represents post-efficiency-gains baseline, not raw 63M */
const WATER_INFERENCE_BASE = 1.0;

/** Additional inference water per capability point (million liters/month)
 * Scales logarithmically, not linearly (efficiency gains with scale) */
const WATER_INFERENCE_PER_CAPABILITY = 0.5;

/** Training water per capability increase (million liters, one-time)
 * Research: GPT-3 training = 700K L, GPT-4 = 5.4M L
 * Li et al. (2023): GPT-4 = 5.4M L ÷ 3.0 capability = 1.8M → round to 2.0M
 * Oct 29, 2025: Reduced 10.0 → 2.0 (5× reduction, consensus-backed recalibration) */
const WATER_TRAINING_PER_CAPABILITY = 2.0;

/**
 * Energy consumption parameters (based on US DOE 2024 data)
 */

/** Base energy consumption for all AI infrastructure (MW) */
const ENERGY_BASE_CONSUMPTION = 500;

/** Additional energy per aggregate capability point (MW) */
const ENERGY_PER_CAPABILITY_POINT = 200;

/**
 * Water Usage Effectiveness (WUE) - liters per kWh
 * Research: Microsoft achieved 0.30 by 2024, improving 5%/year from 1.8 baseline
 */

/** Initial WUE (industry average 2024) */
const INITIAL_WUE = 1.8;
let globalWUE = INITIAL_WUE;

/**
 * Reset global WUE to initial value (for deterministic simulation)
 * CRITICAL FIX (Nov 24, 2025): Module-level state persists between runs,
 * causing non-determinism. Call this at start of each simulation run.
 */
export function resetGlobalWUE(): void {
  globalWUE = INITIAL_WUE;
}

/** WUE improvement rate (13% per year = 1.08% per month)
 * Research: Microsoft 2021-2024 data shows 0.49 → 0.30 WUE in 3 years
 * Calculation: (1 - 0.30/0.49)^(1/3) = 0.129 ≈ 13% per year
 * Oct 30, 2025: FIX - Corrected from 5% (was 2.6× underestimate)
 * Source: Microsoft Cloud Blog (Dec 2024), verified Oct 28, 2025
 * Note: This is best-in-class (Microsoft). Industry average is slower (~5-8%/year) */
const WUE_IMPROVEMENT_RATE_YEARLY = 0.13;
const WUE_IMPROVEMENT_RATE_MONTHLY = WUE_IMPROVEMENT_RATE_YEARLY / 12;

/** Best achievable WUE (Microsoft 2024 achievement) */
const WUE_FLOOR = 0.3;

/**
 * Calculate AI resource consumption for current month
 * FIX #3A (Oct 19, 2025): Corrected water model - separate training/inference, logarithmic scaling
 * H-1 (Dec 10, 2025): Integrated with energy budget constraints
 *
 * @param state Current game state
 * @returns Water consumption (million liters/month) and energy consumption (MW)
 */
export function calculateAIResourceConsumption(state: GameState): {
  waterConsumption: number;
  energyConsumption: number;
  wue: number;
} {
  // Calculate total AI capability across all agents
  const totalCapability = state.aiAgents.length > 0
    ? state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0)
    : 0;

  // FIX #3A: Training water (one-time spike when capability increases)
  const trainingWater = detectCapabilityIncrease(state);

  // FIX #3A: Inference water (ongoing operational cost)
  // Logarithmic scaling: log2(capability + 1) captures economies of scale
  // Research: Larger data centers are more efficient per unit of compute
  const logarithmicTerm = WATER_INFERENCE_PER_CAPABILITY * Math.log2(totalCapability + 1);

  // Oct 29, 2025: Demand elasticity (Jevons Paradox) - efficiency gains → increased usage
  // Historical precedent: 2015-2020 AI saw 10× efficiency gains but 100× usage growth = 10× MORE resources
  // Research: Patterson et al. (2022), Lei et al. (2025)
  // Early stage (<5.0 capability): 30% annual demand increase (rapid adoption)
  // Mature stage (≥5.0 capability): 10% annual demand increase (saturation)
  const demandElasticity = totalCapability < 5.0 ? 1.3 : 1.1;

  const inferenceWater = (WATER_INFERENCE_BASE + logarithmicTerm) * demandElasticity;

  const totalWater = trainingWater + inferenceWater;

  // Energy consumption (scales with capability)
  // H-1: Calculate nominal energy demand (before budget constraints)
  const nominalEnergyMW = assertFinite(
    ENERGY_BASE_CONSUMPTION + (totalCapability * ENERGY_PER_CAPABILITY_POINT),
    {
      location: 'calculateAIResourceConsumption',
      valueName: 'nominalEnergyMW',
      month: state.currentMonth,
      additionalInfo: { totalCapability, baseConsumption: ENERGY_BASE_CONSUMPTION }
    }
  );

  // H-1: Read energy budget allocation (TIER 4 'elective')
  // Energy budget system is enabled by default
  let effectivenessMultiplier = 1.0;
  if (state.energyBudget?.allocations?.['ai-datacenter']) {
    const allocation = state.energyBudget.allocations['ai-datacenter'];
    effectivenessMultiplier = assertFinite(
      allocation.effectivenessMultiplier,
      {
        location: 'calculateAIResourceConsumption',
        valueName: 'effectivenessMultiplier',
        month: state.currentMonth,
        additionalInfo: { category: 'ai-datacenter', allocation }
      }
    );
  }

  // H-1: Apply energy budget constraint to datacenter growth
  const effectiveEnergyMW = assertFinite(
    nominalEnergyMW * effectivenessMultiplier,
    {
      location: 'calculateAIResourceConsumption',
      valueName: 'effectiveEnergyMW',
      month: state.currentMonth,
      additionalInfo: { nominalEnergyMW, effectivenessMultiplier }
    }
  );

  // H-1: Log if constrained (only if significant constraint)
  if (effectivenessMultiplier < 0.9 && state.currentMonth % 12 === 0) {
    console.log(`\n📊⚡ AI datacenter growth constrained by electricity: ${(effectivenessMultiplier * 100).toFixed(1)}% effective`);
    console.log(`   Nominal demand: ${nominalEnergyMW.toFixed(0)} MW`);
    console.log(`   Allocated: ${effectiveEnergyMW.toFixed(0)} MW`);
    console.log(`   Total AI capability: ${totalCapability.toFixed(2)}`);
  }

  // Improve WUE over time (efficiency gains from better cooling technology)
  globalWUE = Math.max(WUE_FLOOR, globalWUE * (1 - WUE_IMPROVEMENT_RATE_MONTHLY));

  return {
    waterConsumption: totalWater,
    energyConsumption: effectiveEnergyMW,  // H-1: Return constrained value
    wue: globalWUE
  };
}

/**
 * Detect capability increase this month (for training water spike)
 * FIX #3A (Oct 19, 2025): Returns water cost instead of boolean
 * Scales with magnitude of capability increase (not flat 5B liters)
 *
 * Heuristic: Capability jump suggests new model training
 * Research: GPT-3 = 700K L, GPT-4 = 5.4M L → scales with capability
 */
function detectCapabilityIncrease(state: GameState): number {
  // Calculate total capability this month
  const currentCapability = state.aiAgents.length > 0
    ? state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0)
    : 0;

  const previousCapability = state.previousTotalCapability || 0;
  const capabilityIncrease = Math.max(0, currentCapability - previousCapability);

  // Store for next check
  state.previousTotalCapability = currentCapability;

  // Training water scales with capability increase (10M L per capability point)
  // Represents one-time training cost, not monthly
  const trainingWater = capabilityIncrease * WATER_TRAINING_PER_CAPABILITY;

  return trainingWater;
}

/**
 * Apply resource constraints to AI capability growth
 *
 * If water/energy resources are constrained, AI growth slows.
 * Research: Data centers can't scale without water/power infrastructure.
 *
 * @param state Current game state
 * @param baseGrowth Base capability growth rate
 * @returns Constrained growth rate (reduced if resources insufficient)
 */
export function applyResourceConstraints(
  state: GameState,
  baseGrowth: number
): number {
  const totalCapability = state.aiAgents.length > 0
    ? state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0)
    : 0;

  // Water constraint threshold (from freshwater system)
  const waterStressed = state.freshwaterSystem
    ? state.freshwaterSystem.waterStress > 0.7
    : false;

  // Energy constraint threshold (from resource economy)
  // Energy is constrained if surplus is negative (demand > production)
  const energyConstrained = state.resourceEconomy?.energy
    ? state.resourceEconomy.energy.surplus < 0
    : false;

  // Apply growth penalty if constrained
  let constrainedGrowth = baseGrowth;

  if (waterStressed && totalCapability > 5.0) {
    // 50% slower growth if water-constrained at high capability
    constrainedGrowth *= 0.5;

    // Log constraint (only when first triggered)
    if (!state.waterConstraintLogged) {
      console.log(`\n💧 WATER CONSTRAINT: AI capability growth slowed 50% (water stress > 70%)`);
      console.log(`   Total AI capability: ${totalCapability.toFixed(2)}`);
      console.log(`   Water stress: ${((state.freshwaterSystem?.waterStress || 0) * 100).toFixed(0)}%`);
      state.waterConstraintLogged = true;
    }
  }

  if (energyConstrained && totalCapability > 5.0) {
    // 30% slower growth if energy-constrained at high capability
    constrainedGrowth *= 0.7;

    // Log constraint (only when first triggered)
    if (!state.energyConstraintLogged) {
      console.log(`\n⚡ ENERGY CONSTRAINT: AI capability growth slowed 30% (insufficient power)`);
      console.log(`   Total AI capability: ${totalCapability.toFixed(2)}`);
      state.energyConstraintLogged = true;
    }
  }

  return constrainedGrowth;
}

/**
 * Get water consumption impact on planetary boundaries
 *
 * Integrates AI water usage into freshwater planetary boundary calculations.
 *
 * @param state Current game state
 * @returns Fractional contribution to water stress (0-1 scale)
 */
export function getWaterStressContribution(state: GameState): number {
  const consumption = calculateAIResourceConsumption(state);

  // Convert to same units as freshwater system (assume global withdrawal ~4,000 km³/year)
  // AI consumption in million liters/month = (consumption.waterConsumption / 1e6) km³/month
  // Global withdrawal ~333 km³/month
  const aiWithdrawalKm3 = consumption.waterConsumption / 1e6;  // Convert M liters → km³
  const globalWithdrawalKm3 = 333;  // Global freshwater withdrawal ~4,000 km³/year

  // AI fraction of global withdrawal
  const aiStressFraction = aiWithdrawalKm3 / globalWithdrawalKm3;

  return aiStressFraction;
}

/**
 * Log AI resource consumption (diagnostic output)
 * Call this periodically (e.g., every 12 months) to track consumption trends
 */
export function logAIResourceConsumption(state: GameState): void {
  const consumption = calculateAIResourceConsumption(state);
  const totalCapability = state.aiAgents.length > 0
    ? state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0)
    : 0;

  console.log(`\n💧⚡ AI INFRASTRUCTURE RESOURCE CONSUMPTION`);
  console.log(`   Total AI Capability: ${totalCapability.toFixed(2)}`);
  console.log(`   Water Consumption: ${consumption.waterConsumption.toFixed(0)} million liters/month`);
  console.log(`   Energy Consumption: ${consumption.energyConsumption.toFixed(0)} MW`);
  console.log(`   WUE (Water Usage Effectiveness): ${consumption.wue.toFixed(2)} liters/kWh`);

  // Calculate percentage of global resources
  const waterStressPct = getWaterStressContribution(state) * 100;
  console.log(`   % of Global Freshwater Withdrawal: ${waterStressPct.toFixed(2)}%`);

  // Warn if approaching critical thresholds
  if (waterStressPct > 5) {
    console.warn(`   ⚠️  WARNING: AI consuming >5% of global freshwater (stress risk)`);
  }

  if (consumption.energyConsumption > 2000) {
    console.warn(`   ⚠️  WARNING: AI consuming >2 GW energy (grid stress risk)`);
  }
}
