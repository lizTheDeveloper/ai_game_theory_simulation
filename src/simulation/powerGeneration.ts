/**
 * Power Generation & AI Energy Consumption System
 *
 * Simulates global electricity generation, data center power consumption,
 * AI efficiency improvements, cryptocurrency mining, and climate impact.
 *
 * Key Dynamics:
 * - AI inference efficiency: 200x per year (exponential with diminishing returns)
 * - Query volume: Linear growth with saturation
 * - Data center buildout: 4-year construction lag, 50% overprovisioning
 * - Crypto: Separate growth (15% per year, policy-dependent)
 * - Grid mix: Slow renewable transition (2% per year)
 * - Climate feedback: Warming increases cooling demand
 */

import { GameState } from '../types/game';
import { PowerGenerationSystem, DataCenterConstruction, TrainingEvent } from '../types/powerGeneration';

/**
 * Update power generation system for one month
 */
export function updatePowerGeneration(state: GameState): void {
  const power = state.powerGenerationSystem;
  const env = state.environmentalSystem;

  // Increment time
  power.monthsSinceStart += 1;
  const year = power.monthsSinceStart / 12;

  // 1. Update AI inference efficiency (exponential growth with diminishing returns)
  updateAIEfficiency(power, year);

  // 2. Update query volume (linear growth with saturation)
  updateQueryVolume(power, year);

  // 3. Calculate AI inference power (efficiency vs demand)
  updateAIInferencePower(power);

  // 4. Update cryptocurrency power consumption
  updateCryptoPower(power, state);

  // 5. Handle data center construction queue (4-year lag)
  updateDataCenterBuildout(power, state);

  // 6. Update AI training events (episodic spikes)
  updateAITrainingPower(power, state);

  // 7. Update traditional cloud power (residual growth)
  updateTraditionalCloudPower(power, year);

  // 8. Calculate total data center power
  power.dataCenterPower =
    power.aiInferencePower +
    power.aiTrainingPower +
    power.cryptoPower +
    power.traditionalCloudPower;

  // 9. Apply climate feedback (warming increases cooling demand)
  applyClimateFeedback(power, env);

  // 10. Update grid mix evolution (slow renewable transition)
  updateGridMix(power, state);

  // 11. Calculate emissions
  calculateEmissions(power);

  // 12. Add emissions to CO2 system (if resource economy exists)
  if (state.resourceEconomy && state.resourceEconomy.co2) {
    // Convert million tons CO2 per month to Gt CO2
    // monthlyDataCenterEmissions is in million tons
    // 1 Gt = 1000 million tons
    const monthlyGtCO2 = power.monthlyDataCenterEmissions / 1000; // Gt CO2

    // Add to cumulative emissions (this month's contribution)
    state.resourceEconomy.co2.cumulativeEmissions += monthlyGtCO2;
  }

  // 13. Track peak power
  if (power.dataCenterPower > power.peakDataCenterPower) {
    power.peakDataCenterPower = power.dataCenterPower;
  }

  // 14. Calculate energy constraints (NEW - Oct 12, 2025)
  calculateEnergyConstraints(power);
}

/**
 * Update AI inference efficiency (exponential growth with diminishing returns)
 *
 * 2024 baseline: 3,333 queries/kWh (GPT-4o: 0.3 Wh/query)
 * Post-2024: 200x per year median improvement
 * Diminishing returns as we approach physical limits
 */
function updateAIEfficiency(power: PowerGenerationSystem, year: number): void {
  const monthlyGrowthRate = Math.pow(power.inferenceEfficiencyGrowthRate, 1 / 12);

  // Diminishing returns: Efficiency gains slow as we approach limits
  // After 5 years, growth rate starts declining (approaching physical limits)
  if (year > 5) {
    const diminishingFactor = 1 / (1 + (year - 5) * 0.1); // 10% reduction per year after year 5
    power.efficiencyDiminishingFactor = diminishingFactor;
  }

  const effectiveGrowthRate = 1 + (monthlyGrowthRate - 1) * power.efficiencyDiminishingFactor;
  power.inferenceEfficiency *= effectiveGrowthRate;

  // Training efficiency also improves (but slower: ~10x per year)
  const trainingGrowthRate = Math.pow(10, 1 / 12);
  power.trainingEfficiency *= trainingGrowthRate;
}

/**
 * Update query volume (linear growth with saturation)
 *
 * 2024 baseline: 500B queries/month
 * Growth: 50% per year until saturation (~5T queries/month)
 */
function updateQueryVolume(power: PowerGenerationSystem, year: number): void {
  const saturationPoint = 5000; // 5 trillion queries/month
  const annualGrowthRate = 0.50; // 50% per year
  const monthlyGrowthRate = Math.pow(1 + annualGrowthRate, 1 / 12);

  // Logistic growth with saturation
  const saturationFactor = 1 - (power.queryVolume / saturationPoint);
  const effectiveGrowth = 1 + (monthlyGrowthRate - 1) * Math.max(0, saturationFactor);

  power.queryVolume *= effectiveGrowth;
}

/**
 * Calculate AI inference power (efficiency vs demand)
 *
 * Key insight: Efficiency improving faster than demand growing
 * Result: AI inference power DECLINES over time (user's "100x reduction")
 */
function updateAIInferencePower(power: PowerGenerationSystem): void {
  // Power = Query Volume / Efficiency
  const powerPerQueryKWh = 1 / power.inferenceEfficiency; // kWh per query
  const queriesPerMonth = power.queryVolume * 1e9; // Convert billions to actual number
  const powerKWh = queriesPerMonth * powerPerQueryKWh;
  const powerTWh = powerKWh / 1e9; // Convert kWh to TWh

  power.aiInferencePower = powerTWh;
}

/**
 * Update cryptocurrency power consumption
 *
 * 2024 baseline: ~100 TWh/year (8.3 TWh/month)
 * Growth: 15% per year (conservative, policy-dependent)
 * User note: "we gotta model crypto growing, because of current administration"
 */
function updateCryptoPower(power: PowerGenerationSystem, state: GameState): void {
  const monthlyGrowthRate = Math.pow(1 + power.cryptoGrowthRate, 1 / 12);

  // Policy influence: Pro-crypto policies increase growth
  let policyMultiplier = 1.0;

  // If there's a pro-crypto political environment (could check governance system)
  // For now, use base growth rate

  power.cryptoHashRate *= monthlyGrowthRate * policyMultiplier;
  power.cryptoPower = power.cryptoHashRate * power.cryptoPowerIntensity;
}

/**
 * Update data center buildout (4-year construction lag)
 *
 * Data centers take 24-72 months to build (we use 48 months average)
 * Industry overprovisisons by 50% to avoid shortages
 */
function updateDataCenterBuildout(power: PowerGenerationSystem, state: GameState): void {
  const currentMonth = state.currentMonth;

  // Check if any construction completes this month
  const completedProjects = power.constructionQueue.filter(
    project => project.completionMonth === currentMonth
  );

  // Add completed capacity (but this doesn't directly increase power - demand drives it)
  // Instead, we track construction for capacity planning

  // Remove completed projects
  power.constructionQueue = power.constructionQueue.filter(
    project => project.completionMonth > currentMonth
  );

  // Every 6 months, forecast demand and start new construction if needed
  if (currentMonth % 6 === 0) {
    // Forecast demand 4 years ahead
    const currentDemand = power.dataCenterPower;
    const annualGrowthRate = 0.20; // 20% per year (conservative estimate)
    const forecastYears = 4;
    const forecastedDemand = currentDemand * Math.pow(1 + annualGrowthRate, forecastYears);

    // Check if we have enough capacity planned
    const plannedCapacity = power.constructionQueue.reduce(
      (sum, project) => sum + project.capacity,
      0
    );

    const capacityGap = forecastedDemand * power.overprovisioningFactor - plannedCapacity;

    if (capacityGap > 0) {
      // Start new construction
      const newProject: DataCenterConstruction = {
        completionMonth: currentMonth + 48, // 4 years
        capacity: capacityGap,
        renewablePercentage: Math.min(0.5, power.renewablePercentage + 0.1), // New facilities slightly greener
      };
      power.constructionQueue.push(newProject);
    }
  }
}

/**
 * Update AI training power (episodic spikes)
 *
 * Training happens in waves:
 * - GPT-4: ~50 GWh (0.05 TWh)
 * - Hypothetical 1T model: ~500 GWh (0.5 TWh)
 *
 * User note: "More parameters isn't more better" - uncertain scaling
 */
function updateAITrainingPower(power: PowerGenerationSystem, state: GameState): void {
  const currentMonth = state.currentMonth;

  // Update active training events
  let totalTrainingPower = 0;
  power.activeTrainingEvents = power.activeTrainingEvents.filter(event => {
    if (!event.active) return false;

    const monthsElapsed = currentMonth - event.startMonth;
    if (monthsElapsed >= event.durationMonths) {
      event.active = false;
      return false;
    }

    totalTrainingPower += event.powerConsumption / event.durationMonths;
    return true;
  });

  // Randomly trigger new training events (simplified - could be more sophisticated)
  // Major training runs happen ~1-2 times per year
  if (Math.random() < 0.08) { // 8% chance per month ≈ 1 per year
    const modelSize = 100 * Math.pow(2, Math.random() * 4); // 100B to 1.6T parameters
    const trainingMonths = 3 + Math.floor(Math.random() * 3); // 3-6 months

    // Power scales with model size, but with diminishing returns
    // (user note: "we don't know where the model ceiling is")
    const basePower = 0.05; // 50 GWh for 100B model
    const scalingFactor = Math.pow(modelSize / 100, 0.7); // Sublinear scaling
    const trainingPower = basePower * scalingFactor;

    const newEvent: TrainingEvent = {
      startMonth: currentMonth,
      durationMonths: trainingMonths,
      powerConsumption: trainingPower,
      modelSize: modelSize,
      active: true,
    };
    power.activeTrainingEvents.push(newEvent);
    totalTrainingPower += trainingPower / trainingMonths;
  }

  power.aiTrainingPower = totalTrainingPower;
}

/**
 * Update traditional cloud power (non-AI, non-crypto)
 *
 * Grows slower than AI/crypto: ~10% per year
 */
function updateTraditionalCloudPower(power: PowerGenerationSystem, year: number): void {
  const annualGrowthRate = 0.10; // 10% per year
  const monthlyGrowthRate = Math.pow(1 + annualGrowthRate, 1 / 12);

  power.traditionalCloudPower *= monthlyGrowthRate;
}

/**
 * Apply climate feedback (warming increases cooling demand)
 *
 * For every 1°C of warming, data center cooling demand increases ~5%
 */
function applyClimateFeedback(power: PowerGenerationSystem, env: any): void {
  // Handle missing environmental system gracefully
  if (!env) {
    power.coolingDemandMultiplier = 1.0;
    power.heatwaveSpikeFactor = 0;
    return;
  }

  const tempAnomaly = env.globalTemperatureAnomaly || 0;

  // Base cooling multiplier
  power.coolingDemandMultiplier = 1 + (tempAnomaly * 0.05);

  // Heatwave spikes (10% additional during extreme events)
  if (env.extremeWeatherEventActive) {
    power.heatwaveSpikeFactor = 0.10;
  } else {
    power.heatwaveSpikeFactor = 0;
  }

  const totalClimateMultiplier = power.coolingDemandMultiplier * (1 + power.heatwaveSpikeFactor);

  // Apply to data center power
  power.dataCenterPower *= totalClimateMultiplier;
}

/**
 * Update grid mix evolution (slow renewable transition)
 *
 * Reality: Grid transitions are SLOW
 * - Renewable growth: ~2% per year
 * - Nuclear: ~0.5% per year (political challenges)
 * - Fossil phase-out: ~2.5% per year
 */
function updateGridMix(power: PowerGenerationSystem, state: GameState): void {
  const monthlyRenewableIncrease = power.renewableTransitionRate / 12;
  const monthlyNuclearIncrease = power.nuclearExpansionRate / 12;
  const monthlyFossilDecrease = power.fossilPhaseOutRate / 12;

  // Update percentages
  power.renewablePercentage += monthlyRenewableIncrease;
  power.nuclearPercentage += monthlyNuclearIncrease;
  power.fossilPercentage -= monthlyFossilDecrease;

  // Ensure percentages sum to 1.0 and stay in bounds
  power.renewablePercentage = Math.max(0, Math.min(1, power.renewablePercentage));
  power.nuclearPercentage = Math.max(0, Math.min(1, power.nuclearPercentage));
  power.fossilPercentage = Math.max(0, Math.min(1, power.fossilPercentage));

  const total = power.renewablePercentage + power.nuclearPercentage + power.fossilPercentage;
  if (total > 0) {
    power.renewablePercentage /= total;
    power.nuclearPercentage /= total;
    power.fossilPercentage /= total;
  }

  // Update carbon intensity (weighted by fuel mix)
  const renewableCI = 50;   // gCO2e/kWh (lifecycle emissions)
  const nuclearCI = 12;     // gCO2e/kWh (very low)
  const fossilCI = 900;     // gCO2e/kWh (high - mostly coal)

  power.carbonIntensity =
    (power.renewablePercentage * renewableCI) +
    (power.nuclearPercentage * nuclearCI) +
    (power.fossilPercentage * fossilCI);

  // Data center carbon intensity (typically 50% higher due to inefficiencies)
  power.dataCenterCarbonIntensity = power.carbonIntensity * 1.5;
}

/**
 * Calculate emissions from power generation
 */
function calculateEmissions(power: PowerGenerationSystem): void {
  // Data center emissions (million tons CO2)
  const dcPowerGWh = power.dataCenterPower * 1000; // TWh to GWh
  const dcEmissionsTons = (dcPowerGWh * power.dataCenterCarbonIntensity) / 1e6; // to million tons
  power.monthlyDataCenterEmissions = dcEmissionsTons;

  // Cumulative
  power.cumulativeEmissions += dcEmissionsTons;

  // Total grid emissions (for reference)
  const gridPowerGWh = power.totalElectricityGeneration * 1000;
  const gridEmissionsTons = (gridPowerGWh * power.carbonIntensity) / 1e6;
  power.monthlyGridEmissions = gridEmissionsTons;
}

/**
 * Get human-readable power generation summary
 */
export function getPowerGenerationSummary(state: GameState): string {
  const power = state.powerGenerationSystem;
  const year = 2025 + Math.floor(power.monthsSinceStart / 12);

  let summary = `\n=== POWER & ENERGY (${year}) ===\n`;
  summary += `Data Center Power: ${power.dataCenterPower.toFixed(1)} TWh/month\n`;
  summary += `  - AI Inference: ${power.aiInferencePower.toFixed(2)} TWh (${((power.aiInferencePower / power.dataCenterPower) * 100).toFixed(1)}%)\n`;
  summary += `  - AI Training: ${power.aiTrainingPower.toFixed(2)} TWh (${((power.aiTrainingPower / power.dataCenterPower) * 100).toFixed(1)}%)\n`;
  summary += `  - Cryptocurrency: ${power.cryptoPower.toFixed(1)} TWh (${((power.cryptoPower / power.dataCenterPower) * 100).toFixed(1)}%)\n`;
  summary += `  - Traditional Cloud: ${power.traditionalCloudPower.toFixed(1)} TWh (${((power.traditionalCloudPower / power.dataCenterPower) * 100).toFixed(1)}%)\n`;

  summary += `\nAI Efficiency:\n`;
  summary += `  - Inference: ${(power.inferenceEfficiency / 1000).toFixed(1)}k queries/kWh\n`;
  summary += `  - Query Volume: ${power.queryVolume.toFixed(0)}B/month\n`;
  summary += `  - Training Efficiency: ${power.trainingEfficiency.toFixed(0)} FLOP/Watt\n`;

  summary += `\nGrid Mix:\n`;
  summary += `  - Renewable: ${(power.renewablePercentage * 100).toFixed(1)}%\n`;
  summary += `  - Nuclear: ${(power.nuclearPercentage * 100).toFixed(1)}%\n`;
  summary += `  - Fossil: ${(power.fossilPercentage * 100).toFixed(1)}%\n`;
  summary += `  - Carbon Intensity: ${power.dataCenterCarbonIntensity.toFixed(0)} gCO2e/kWh\n`;

  summary += `\nEmissions:\n`;
  summary += `  - Monthly (DC): ${power.monthlyDataCenterEmissions.toFixed(1)} Mt CO2\n`;
  summary += `  - Cumulative (DC): ${power.cumulativeEmissions.toFixed(0)} Mt CO2\n`;
  summary += `  - Climate Feedback: ${((power.coolingDemandMultiplier - 1) * 100).toFixed(1)}% increased cooling demand\n`;

  return summary;
}

/**
 * Get AI efficiency trend summary
 */
export function getAIEfficiencyTrend(state: GameState): string {
  const power = state.powerGenerationSystem;
  const startYear = 2025;
  const currentYear = startYear + Math.floor(power.monthsSinceStart / 12);
  const years = currentYear - startYear;

  if (years === 0) return "";

  const initialEfficiency = 3333; // 2024 baseline (queries/kWh)
  const improvementFactor = power.inferenceEfficiency / initialEfficiency;

  let trend = `\n=== AI EFFICIENCY TREND ===\n`;
  trend += `Years elapsed: ${years}\n`;
  trend += `Efficiency improvement: ${improvementFactor.toFixed(0)}x (from ${initialEfficiency} to ${power.inferenceEfficiency.toFixed(0)} queries/kWh)\n`;
  trend += `Power per query: ${(1000 / power.inferenceEfficiency).toFixed(3)} Wh (down from ${(1000 / initialEfficiency).toFixed(3)} Wh)\n`;

  if (improvementFactor > 100) {
    trend += `✅ USER PREDICTION VALIDATED: >100x efficiency improvement achieved!\n`;
  }

  return trend;
}

/**
 * Calculate energy constraints on AI growth (NEW - Oct 12, 2025)
 *
 * Determines if data center power consumption is approaching limits,
 * and calculates constraint severity to slow AI capability growth.
 *
 * Reality check: Data centers already consume ~17% of global power in 2024
 * (415 TWh/year DC / 2500 TWh/year total). Constraints reflect political
 * resistance, grid stability concerns, and energy price impacts.
 *
 * Key Thresholds:
 * - <20% of global power: No constraint (current trajectory)
 * - 20-30% of global power: Warning zone (soft constraint - rising friction)
 * - >30% of global power: Hard constraint (grid stability, political pushback)
 */
function calculateEnergyConstraints(power: PowerGenerationSystem): void {
  // Calculate utilization rate (what % of global power is data centers using?)
  const utilizationRate = power.dataCenterPower / power.totalElectricityGeneration;

  // Soft constraint threshold (warning zone - energy prices rising, political friction)
  const softThreshold = 0.20; // 20% of global power
  const hardThreshold = power.maxDataCenterPowerFraction; // 30% by default

  // Calculate constraint severity [0, 1]
  if (utilizationRate < softThreshold) {
    // No constraint - plenty of power available
    power.energyConstraintActive = false;
    power.constraintSeverity = 0;
    power.monthsConstrained = 0;
  } else if (utilizationRate < hardThreshold) {
    // Soft constraint - warning zone (linear ramp from 0 to 0.5)
    power.energyConstraintActive = true;
    const softProgress = (utilizationRate - softThreshold) / (hardThreshold - softThreshold);
    power.constraintSeverity = softProgress * 0.5; // 0 to 0.5
    power.monthsConstrained++;

    // Log warning when first entering soft constraint
    if (power.monthsConstrained === 1) {
      console.log(`\n⚠️ ENERGY CONSTRAINT ACTIVATED (SOFT)`);
      console.log(`   Data centers using ${(utilizationRate * 100).toFixed(1)}% of global power`);
      console.log(`   Threshold: ${(hardThreshold * 100).toFixed(0)}% max`);
      console.log(`   AI growth will slow as power becomes scarce\n`);
    }
  } else {
    // Hard constraint - beyond safe limits
    power.energyConstraintActive = true;
    // Severity ramps from 0.5 to 1.0 as we go further beyond threshold
    const overshoot = (utilizationRate - hardThreshold) / hardThreshold;
    power.constraintSeverity = Math.min(1.0, 0.5 + overshoot * 2); // 0.5 to 1.0
    power.monthsConstrained++;

    // Log crisis when first hitting hard constraint
    if (power.constraintSeverity > 0.5 && power.monthsConstrained === 1) {
      console.log(`\n🚨 ENERGY CONSTRAINT CRISIS (HARD)`);
      console.log(`   Data centers using ${(utilizationRate * 100).toFixed(1)}% of global power!`);
      console.log(`   Exceeded safe threshold of ${(hardThreshold * 100).toFixed(0)}%`);
      console.log(`   AI capability growth severely constrained\n`);
    }
  }

  // Log periodic updates when constrained
  if (power.energyConstraintActive && power.monthsConstrained % 12 === 0) {
    console.log(`\n⚡ ENERGY CONSTRAINT UPDATE (Month ${power.monthsConstrained})`);
    console.log(`   Utilization: ${(utilizationRate * 100).toFixed(1)}% of global power`);
    console.log(`   Severity: ${(power.constraintSeverity * 100).toFixed(0)}%`);
    console.log(`   AI growth penalty: ${(power.constraintSeverity * 100).toFixed(0)}% slowdown\n`);
  }
}

/**
 * Get energy constraint multiplier for AI capability growth
 *
 * Returns a multiplier [0, 1] where:
 * - 1.0 = no constraint (full growth)
 * - 0.5 = moderate constraint (50% growth)
 * - 0.0 = hard constraint (no growth possible)
 *
 * Use this in AI capability calculations to apply energy bottleneck.
 */
export function getEnergyConstraintMultiplier(state: GameState): number {
  const power = state.powerGenerationSystem;

  if (!power || !power.energyConstraintActive) {
    return 1.0; // No constraint
  }

  // Return inverse of severity (higher severity = lower multiplier)
  return 1.0 - power.constraintSeverity;
}

/**
 * Check if there's sufficient energy for a new AI training run
 *
 * Returns true if energy is available, false if constrained.
 * Use this before starting major training projects.
 */
export function canAffordTraining(
  modelSize: number,
  state: GameState
): { canTrain: boolean; reason?: string } {
  const power = state.powerGenerationSystem;

  // Estimate power needed for this training run
  // Rough heuristic: larger models need more power
  const basePower = 0.05; // 50 GWh for 100B model
  const scalingFactor = Math.pow(modelSize / 100, 0.7); // Sublinear
  const estimatedPower = (basePower * scalingFactor) / 6; // Spread over 6 months, monthly cost

  // Check if adding this would exceed limits
  const newAIPower = power.aiInferencePower + power.aiTrainingPower + estimatedPower;
  const newUtilization = (newAIPower + power.cryptoPower + power.traditionalCloudPower) /
                         power.totalElectricityGeneration;

  // Hard block if it would push us significantly over threshold
  if (newUtilization > power.maxDataCenterPowerFraction * 1.2) {
    return {
      canTrain: false,
      reason: `Insufficient energy capacity (would exceed ${(power.maxDataCenterPowerFraction * 100).toFixed(0)}% threshold)`
    };
  }

  // Probabilistic block in soft constraint zone
  if (newUtilization > power.maxDataCenterPowerFraction * 0.8) {
    const blockProbability = power.constraintSeverity * 0.7; // Up to 70% chance to block
    if (Math.random() < blockProbability) {
      return {
        canTrain: false,
        reason: `Energy constraint: ${(power.constraintSeverity * 100).toFixed(0)}% chance of blocking new training`
      };
    }
  }

  return { canTrain: true };
}
