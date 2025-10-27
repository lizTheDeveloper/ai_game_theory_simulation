/**
 * AI Infrastructure Resource Consumption
 * FIX #3 (Oct 18, 2025): Initial model
 * FIX #3A (Oct 19, 2025): Corrected water consumption (was off by 100-1000x)
 *
 * Models water and energy consumption by AI data centers and training infrastructure.
 *
 * Research Foundation:
 * - UC Riverside + UT Austin (2024): GPT-3 training = 700K liters, GPT-4 = 5.4M liters
 * - US DOE (2024): H100 GPU = 700W (10.2 kW per 8-GPU server)
 * - RAND (2024): AI data centers 200 MW average (vs 30 MW traditional)
 * - Microsoft (2024): WUE improving 5%/year (0.49 → 0.30 in 3 years)
 * - Google Data Centers (2024): Hyperscale = 2.1M liters/day for ENTIRE facility
 * - Medium data center (15MW): 25.5M liters/year (2.1M/month, not 50M!)
 * - GPT-3 inference: 519ml per 100-word prompt (~500K liters/year for continuous operation)
 *
 * FIX #3A Key Corrections:
 * 1. Separated training (one-time) from inference (ongoing)
 * 2. Added logarithmic efficiency scaling (not linear - economies of scale)
 * 3. Reduced consumption by 10-25x to match research (50M → 2-5M L/month)
 */

import { GameState } from '@/types/game';

/**
 * Water consumption parameters (FIX #3A: Research-corrected values)
 */

/** Base inference water for all AI operations (million liters/month)
 * Research: Medium data center (15MW) = 2.1M L/month */
const WATER_INFERENCE_BASE = 2.0;

/** Additional inference water per capability point (million liters/month)
 * Scales logarithmically, not linearly (efficiency gains with scale) */
const WATER_INFERENCE_PER_CAPABILITY = 0.5;

/** Training water per capability increase (million liters, one-time)
 * Research: GPT-3 training = 700K L, GPT-4 = 5.4M L */
const WATER_TRAINING_PER_CAPABILITY = 10.0;

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
let globalWUE = 1.8;

/** WUE improvement rate (5% per year = 0.42% per month) */
const WUE_IMPROVEMENT_RATE_YEARLY = 0.05;
const WUE_IMPROVEMENT_RATE_MONTHLY = WUE_IMPROVEMENT_RATE_YEARLY / 12;

/** Best achievable WUE (Microsoft 2024 achievement) */
const WUE_FLOOR = 0.3;

/**
 * Calculate AI resource consumption for current month
 * FIX #3A (Oct 19, 2025): Corrected water model - separate training/inference, logarithmic scaling
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
  const inferenceWater = WATER_INFERENCE_BASE +
                        (WATER_INFERENCE_PER_CAPABILITY * Math.log2(totalCapability + 1));

  const totalWater = trainingWater + inferenceWater;

  // Energy consumption (scales with capability)
  const totalEnergy = ENERGY_BASE_CONSUMPTION + (totalCapability * ENERGY_PER_CAPABILITY_POINT);

  // Improve WUE over time (efficiency gains from better cooling technology)
  globalWUE = Math.max(WUE_FLOOR, globalWUE * (1 - WUE_IMPROVEMENT_RATE_MONTHLY));

  return {
    waterConsumption: totalWater,
    energyConsumption: totalEnergy,
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

  const previousCapability = (state as any).previousTotalCapability || 0;
  const capabilityIncrease = Math.max(0, currentCapability - previousCapability);

  // Store for next check
  (state as any).previousTotalCapability = currentCapability;

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
    if (!(state as any).waterConstraintLogged) {
      console.log(`\n💧 WATER CONSTRAINT: AI capability growth slowed 50% (water stress > 70%)`);
      console.log(`   Total AI capability: ${totalCapability.toFixed(2)}`);
      console.log(`   Water stress: ${((state.freshwaterSystem?.waterStress || 0) * 100).toFixed(0)}%`);
      (state as any).waterConstraintLogged = true;
    }
  }

  if (energyConstrained && totalCapability > 5.0) {
    // 30% slower growth if energy-constrained at high capability
    constrainedGrowth *= 0.7;

    // Log constraint (only when first triggered)
    if (!(state as any).energyConstraintLogged) {
      console.log(`\n⚡ ENERGY CONSTRAINT: AI capability growth slowed 30% (insufficient power)`);
      console.log(`   Total AI capability: ${totalCapability.toFixed(2)}`);
      (state as any).energyConstraintLogged = true;
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
