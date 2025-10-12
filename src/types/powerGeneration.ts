/**
 * Power Generation & AI Energy Consumption System (TIER 4.4)
 *
 * Models global electricity generation, data center power consumption,
 * AI efficiency improvements, cryptocurrency mining, and climate impact.
 *
 * Research-backed by:
 * - IEA Global Data Centre Energy Report 2024
 * - Stanford AI Index 2024
 * - Epoch AI: Trends in Machine Learning Hardware (2024)
 * - NVIDIA efficiency improvements (2016-2025)
 */

/**
 * Data center under construction (4-year build lag)
 */
export interface DataCenterConstruction {
  completionMonth: number;          // Month when construction completes
  capacity: number;                 // Additional TWh/month capacity
  renewablePercentage: number;      // % renewable at this facility
}

/**
 * Major AI training event (episodic power spikes)
 */
export interface TrainingEvent {
  startMonth: number;
  durationMonths: number;
  powerConsumption: number;         // TWh during training
  modelSize: number;                // Parameters (billions)
  active: boolean;
}

/**
 * Power Generation & Energy Consumption System
 */
export interface PowerGenerationSystem {
  // === GLOBAL POWER SUPPLY ===
  totalElectricityGeneration: number;      // TWh per month (global)
  renewablePercentage: number;             // [0, 1] - Solar, wind, hydro
  nuclearPercentage: number;               // [0, 1] - Nuclear power
  fossilPercentage: number;                // [0, 1] - Coal, gas, oil
  carbonIntensity: number;                 // gCO2e/kWh (weighted average)

  // === DATA CENTER POWER DEMAND ===
  dataCenterPower: number;                 // TWh per month (total data centers)
  aiInferencePower: number;                // Subset - AI inference (DOWN over time)
  aiTrainingPower: number;                 // Subset - AI training (episodic spikes)
  cryptoPower: number;                     // Cryptocurrency mining (growing)
  traditionalCloudPower: number;           // Traditional cloud services (remainder)

  // === AI EFFICIENCY TRENDS ===
  // Key insight: Efficiency improving exponentially, but usage growing too
  inferenceEfficiency: number;             // Queries per kWh (exponential growth)
  queryVolume: number;                     // Billions of queries per month
  trainingEfficiency: number;              // FLOP/Watt for training

  // Efficiency improvement rates
  inferenceEfficiencyGrowthRate: number;   // Per year (200x/year post-2024)
  efficiencyDiminishingFactor: number;     // Approaches physical limits

  // === CRYPTOCURRENCY MINING ===
  cryptoHashRate: number;                  // Network hash rate proxy
  cryptoPowerIntensity: number;            // TWh per unit hash rate
  cryptoGrowthRate: number;                // Annual growth rate

  // === DATA CENTER BUILDOUT ===
  constructionQueue: DataCenterConstruction[];  // Facilities under construction
  forecastDemand: number;                  // Projected demand (TWh/month)
  overprovisioningFactor: number;          // Typical: 1.5x (50% extra capacity)

  // === TRAINING EVENTS ===
  activeTrainingEvents: TrainingEvent[];   // Ongoing major training runs
  monthlyTrainingBudget: number;           // Planned training spend (TWh/month)

  // === GRID MIX EVOLUTION ===
  renewableTransitionRate: number;         // Annual % point increase (slow: ~2%)
  nuclearExpansionRate: number;            // Annual % point change
  fossilPhaseOutRate: number;              // Annual % point decrease

  // === CLIMATE FEEDBACKS ===
  coolingDemandMultiplier: number;         // 1.0 + (tempAnomaly × 0.05)
  heatwaveSpikeFactor: number;             // Additional load during extreme weather

  // === ENVIRONMENTAL IMPACT ===
  monthlyDataCenterEmissions: number;      // Million tons CO2 per month
  cumulativeEmissions: number;             // Total cumulative (million tons CO2)
  monthlyGridEmissions: number;            // Global grid emissions (million tons)

  // Data center carbon intensity (typically 50% higher than grid avg)
  dataCenterCarbonIntensity: number;       // gCO2e/kWh

  // === REGIONAL BREAKDOWN (Optional future enhancement) ===
  // Could track US, EU, China, etc. separately for policy modeling

  // === TRACKING & HISTORY ===
  peakDataCenterPower: number;             // Highest monthly power
  monthsSinceStart: number;                // Simulation time
}

/**
 * Initialize Power Generation System with 2024 baseline values
 */
export function initializePowerGenerationSystem(): PowerGenerationSystem {
  // 2024 Global Baseline (IEA Data)
  const totalMonthlyElectricity = 2500 / 12; // 2500 TWh/year → 208 TWh/month

  // 2024 Data Center Baseline
  const annualDataCenterPower = 415; // TWh/year (IEA 2024)
  const monthlyDataCenterPower = annualDataCenterPower / 12; // 34.6 TWh/month

  // AI-specific power (30-43% of data centers in US, ~35% globally)
  const aiPowerFraction = 0.35;
  const monthlyAIPower = monthlyDataCenterPower * aiPowerFraction; // ~12 TWh/month

  // Inference vs Training split (inference now >50% of lifecycle)
  const inferenceFraction = 0.65; // 65% inference, 35% training
  const monthlyInferencePower = monthlyAIPower * inferenceFraction; // ~7.8 TWh/month
  const monthlyTrainingPower = monthlyAIPower * (1 - inferenceFraction); // ~4.2 TWh/month

  // Crypto baseline (conservative: 100 TWh/year)
  const monthlyCryptoPower = 100 / 12; // ~8.3 TWh/month

  // Traditional cloud (remainder)
  const monthlyTraditionalCloud = monthlyDataCenterPower - monthlyAIPower - monthlyCryptoPower;

  // Grid mix (2024 global: 59% fossil, 41% low-carbon)
  const globalRenewable = 0.30; // Solar, wind, hydro
  const globalNuclear = 0.11;   // Nuclear
  const globalFossil = 0.59;    // Coal, gas, oil

  // Data center grid mix (slightly better than global, but not much)
  const dcRenewable = 0.22;     // Data centers: 22% renewable
  const dcNuclear = 0.21;       // Data centers: 21% nuclear
  const dcFossil = 0.56;        // Data centers: 56% fossil

  // Carbon intensity
  const globalCarbonIntensity = 475; // gCO2e/kWh (global average)
  const dcCarbonIntensity = 548;     // gCO2e/kWh (data centers, 50% higher)

  // Monthly emissions
  const monthlyDCEmissions = (monthlyDataCenterPower * 1000 * dcCarbonIntensity) / 1e6; // Million tons CO2
  const monthlyGridEmissions = (totalMonthlyElectricity * 1000 * globalCarbonIntensity) / 1e6;

  // AI efficiency (2024 baseline)
  const inferenceEfficiency = 3333; // Queries per kWh (GPT-4o: 0.3 Wh/query)
  const queryVolume = 500; // Billion queries per month (estimated global)

  // Efficiency growth (post-2024: 200x per year median)
  const efficiencyGrowthRate = 200; // Annual multiplier

  return {
    // Global power supply
    totalElectricityGeneration: totalMonthlyElectricity,
    renewablePercentage: globalRenewable,
    nuclearPercentage: globalNuclear,
    fossilPercentage: globalFossil,
    carbonIntensity: globalCarbonIntensity,

    // Data center demand
    dataCenterPower: monthlyDataCenterPower,
    aiInferencePower: monthlyInferencePower,
    aiTrainingPower: monthlyTrainingPower,
    cryptoPower: monthlyCryptoPower,
    traditionalCloudPower: monthlyTraditionalCloud,

    // AI efficiency
    inferenceEfficiency: inferenceEfficiency,
    queryVolume: queryVolume,
    trainingEfficiency: 50, // FLOP/Watt (H100 baseline)
    inferenceEfficiencyGrowthRate: efficiencyGrowthRate,
    efficiencyDiminishingFactor: 1.0, // No diminishing yet

    // Cryptocurrency
    cryptoHashRate: 1.0, // Normalized baseline
    cryptoPowerIntensity: monthlyCryptoPower,
    cryptoGrowthRate: 0.15, // 15% annual growth (conservative, could be higher)

    // Data center buildout
    constructionQueue: [],
    forecastDemand: monthlyDataCenterPower * 1.5, // Forecast 50% growth
    overprovisioningFactor: 1.5,

    // Training events
    activeTrainingEvents: [],
    monthlyTrainingBudget: monthlyTrainingPower,

    // Grid evolution
    renewableTransitionRate: 0.02, // 2% per year (slow!)
    nuclearExpansionRate: 0.005,   // 0.5% per year (very slow)
    fossilPhaseOutRate: 0.025,     // 2.5% per year

    // Climate feedbacks
    coolingDemandMultiplier: 1.0,  // Neutral (will increase with warming)
    heatwaveSpikeFactor: 0,        // No heatwave currently

    // Environmental impact
    monthlyDataCenterEmissions: monthlyDCEmissions,
    cumulativeEmissions: 0,
    monthlyGridEmissions: monthlyGridEmissions,
    dataCenterCarbonIntensity: dcCarbonIntensity,

    // Tracking
    peakDataCenterPower: monthlyDataCenterPower,
    monthsSinceStart: 0,
  };
}
