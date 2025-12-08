/**
 * TIER 1.7.4: Nuclear Winter System
 *
 * Models the long-term catastrophic effects of nuclear war.
 *
 * Research backing (2024-2025 consensus):
 * - Xia et al. (2022): "Global food insecurity and famine from reduced crop... production"
 *   - Nature Food, 3, 586-596
 *   - Full-scale war: 5 billion deaths from famine
 * - Penn State (2025): "Cycles agroecosystem model simulation"
 *   - 38,572 locations modeled globally
 *   - Limited war (5 Tg): 7% corn yield reduction, 2B at risk
 *   - Full-scale war (150 Tg): 80-90% crop failure
 * - IIASA (2025): "The looming shadow of nuclear winter"
 *   - 90% calorie drop, 5B deaths (full-scale)
 * - Mills et al. (2014, reaffirmed 2024-2025): Ozone depletion effects
 * - Robock et al. (2024-2025 updates): "Climatic consequences of nuclear conflict"
 *   - Rutgers Climate Lab
 *
 * Key updates from 2025 research:
 * - Temperature drops LOWER than 1980s estimates (5 Tg → -1.5°C, 150 Tg → -9°C)
 * - Agricultural impacts remain CATASTROPHIC due to combined cooling + darkening + drying
 * - Second-order cascades: ozone depletion, precipitation reduction, marine collapse
 * - Resilient food technologies can reduce mortality 20-40% IF deployed before war
 *
 * Implementation philosophy:
 * - Nuclear war is already catastrophic (1-2B immediate deaths)
 * - Nuclear winter makes it apocalyptic (additional 4-6B starvation deaths)
 * - This is WHY nuclear war = extinction, not just the blast
 */

import { GameState } from '../types/game';
import { NuclearWinterState, RadiationZone } from '../types/nuclearWinter';
import { addMortalityRisk } from './bayesianMortality';
import { getTechDeployment } from './techTree/engine';
import {
  assertFinite,
  assertTemperatureDelta,
  assertProbability,
  assertInRange,
  assertMortalityRate
} from './utils/assertions';
import { RootCause } from '../types/population';
import {
  calculateCurrentDoseRate,
  calculateEffectiveLD50,
  calculateMortalityProbability,
  initializeFalloutComposition,
  distributePopulationIntoCohorts,
  determineMedicalCareLevel,
  calculateLifetimeExcessCancerRisk
} from './radiationModeling';

/**
 * Initialize nuclear winter state (inactive by default)
 */
export function initializeNuclearWinterState(): NuclearWinterState {
  return {
    active: false,
    triggerMonth: -1,

    // Atmospheric
    sootInStratosphere: 0,
    sootDecayRate: 0.05,  // 5% per month (research: ~3-7 year half-life)
    currentSoot: 0,

    // Climate (primary effects)
    temperatureAnomaly: 0,
    baselineTemperature: 15.0,  // °C global average (pre-war)
    sunlightBlocked: 0,          // No blockage initially

    // Agriculture (primary effects)
    cropYieldMultiplier: 1.0,   // Normal initially
    monthlyStarvationRate: 0,

    // Second-order cascades (2025 research)
    ozoneDepletion: 0,           // No ozone damage initially
    ozoneRecoveryRate: 0.007,    // ~10-15 year half-life (Mills et al. 2014)
    uvRadiationMultiplier: 1.0,  // Normal UV levels initially

    precipitationReduction: 0,   // Normal rainfall initially
    monsoonFailureProbability: 0,

    marineProductivityReduction: 0,  // Normal ocean productivity initially
    oceanDependentPopulationAtRisk: 0,

    // Radiation
    radiationZones: [],

    // Duration
    monthsSinceWar: 0,
    peakMortalityMonths: 24,    // Peak starvation lasts 2 years
    recoveryStartMonth: 24,

    // Deaths
    totalWinterDeaths: 0,
    totalRadiationDeaths: 0
  };
}

/**
 * Trigger nuclear winter when nuclear war occurs
 * 
 * @param state - Game state
 * @param warScale - Number of warheads exchanged (determines soot)
 * @param targetCountries - Countries that were hit (for radiation zones)
 */
export function triggerNuclearWinter(
  state: GameState,
  warScale: number,
  targetCountries: string[]
): void {
  const winter = state.nuclearWinterState;
  
  // Already in nuclear winter? Add to existing soot
  if (winter.active) {
    console.warn(`\n⚠️  ADDITIONAL NUCLEAR EXCHANGE during existing nuclear winter`);
    winter.sootInStratosphere += calculateSootInjection(warScale);
    winter.currentSoot = winter.sootInStratosphere;
    
    // Add new radiation zones
    addRadiationZones(winter, targetCountries, state.currentMonth);
    return;
  }
  
  // First nuclear war - activate nuclear winter
  winter.active = true;
  winter.triggerMonth = state.currentMonth;
  winter.monthsSinceWar = 0;
  
  // Calculate soot injection based on war scale
  winter.sootInStratosphere = calculateSootInjection(warScale);
  winter.currentSoot = winter.sootInStratosphere;
  
  // Calculate initial temperature drop
  winter.temperatureAnomaly = calculateTemperatureAnomaly(winter.currentSoot);

  // Calculate sunlight blocking (ARCH-4 Gap #1: Nuclear winter → solar energy integration)
  winter.sunlightBlocked = calculateSunlightBlocking(winter.currentSoot);

  // Initialize second-order cascades (2025 research)
  // Note: At month 0, ozone depletion is just beginning (ramps up over 12 months)
  winter.ozoneDepletion = calculateOzoneDepletion(winter.currentSoot, winter.monthsSinceWar);
  winter.uvRadiationMultiplier = 1.0 + winter.ozoneDepletion;

  winter.precipitationReduction = calculatePrecipitationReduction(winter.temperatureAnomaly);

  winter.marineProductivityReduction = calculateMarineProductivityReduction(
    winter.sunlightBlocked,
    winter.uvRadiationMultiplier
  );

  const globalPopulation = state.humanPopulationSystem.population;
  winter.oceanDependentPopulationAtRisk = globalPopulation * 0.20 * winter.marineProductivityReduction;

  // Calculate crop failure (Penn State 2025: temperature + darkening + precipitation)
  winter.cropYieldMultiplier = calculateCropYield(
    winter.temperatureAnomaly,
    winter.sunlightBlocked,
    winter.precipitationReduction  // Now calculated from cascades
  );

  // Calculate resilient food technology multiplier (technologies deployed BEFORE war)
  // HIGH #2 FIX (Nov 20, 2025): Cache this value at trigger time since deployed techs
  // can't change during nuclear winter. Avoids 4 sequential .find() calls every month.
  winter.cachedResilientFoodMultiplier = calculateResilientFoodMultiplier(state);

  // Calculate starvation rate (with resilient food tech reduction if deployed)
  winter.monthlyStarvationRate = calculateStarvationRate(
    winter.cropYieldMultiplier,
    winter.monthsSinceWar,
    winter.cachedResilientFoodMultiplier
  );
  
  // Add radiation zones for hit countries (ENHANCED - M-6)
  addRadiationZonesEnhanced(state, winter, targetCountries, state.currentMonth);

  console.log(`\n☢️  NUCLEAR WINTER TRIGGERED (Month ${state.currentMonth})`);
  console.log(`   Soot injected: ${winter.sootInStratosphere.toFixed(0)} Tg`);
  console.log(`   Sunlight blocked: ${(winter.sunlightBlocked * 100).toFixed(0)}% (solar capacity reduced)`);
  console.log(`   Temperature drop: ${winter.temperatureAnomaly.toFixed(1)}°C`);
  console.log(`   Crop yield: ${(winter.cropYieldMultiplier * 100).toFixed(0)}% of normal`);
  console.log(`   Starvation rate: ${(winter.monthlyStarvationRate * 100).toFixed(1)}% per month`);
  console.log(`   Radiation zones: ${winter.radiationZones.length} countries`);
  console.log(`   Expected duration: ${winter.recoveryStartMonth} months to recovery`);
}

/**
 * Calculate soot injection based on war scale
 * 
 * Research (Robock & Toon 2012, Coupe et al. 2019):
 * - Regional war (India-Pakistan, 100 warheads): 5 Tg
 * - US-Russia limited (1000 warheads): 50 Tg
 * - US-Russia full-scale (5000+ warheads): 150 Tg
 * 
 * @param warScale - Number of warheads exchanged
 * @returns Soot in Teragrams
 */
function calculateSootInjection(warScale: number): number {
  // Research-based scaling:
  // - 100 warheads → 5 Tg
  // - 1000 warheads → 50 Tg
  // - 5000+ warheads → 150 Tg (saturation)

  // Validate input
  const validWarScale = assertFinite(warScale, {
    location: 'calculateSootInjection',
    valueName: 'warScale'
  });

  let soot: number;
  if (validWarScale <= 100) {
    soot = validWarScale * 0.05;  // 5 Tg per 100 warheads
  } else if (validWarScale <= 1000) {
    soot = 5 + (validWarScale - 100) * 0.05;  // Linear scaling
  } else {
    // Saturation: diminishing returns above 1000 warheads
    soot = 50 + Math.min(100, (validWarScale - 1000) * 0.1);
  }

  // Validate output: Soot injection must be in [0, 150] Tg (research bounds)
  return assertInRange(soot, 0, 150, {
    location: 'calculateSootInjection',
    valueName: 'sootInjection',
    additionalInfo: { warScale: validWarScale }
  });
}

/**
 * Calculate temperature anomaly from soot level
 *
 * Research (2024-2025 consensus, Penn State + IIASA + Xia et al. 2022):
 * - 5 Tg soot → -1.5°C (lower than 1980s Sagan estimates of -2.25°C)
 * - 27.5 Tg soot → -4.5°C (regional war scenario)
 * - 150 Tg soot → -9°C (full-scale war, lower than 2019 estimates of -17.5°C)
 *
 * 2025 climate models show lower sensitivity than 1980s estimates, but
 * agricultural impacts remain catastrophic due to combined cooling + darkening + drying.
 *
 * @param soot - Soot in stratosphere (Tg)
 * @returns Temperature anomaly (negative °C)
 */
function calculateTemperatureAnomaly(soot: number): number {
  // Validate input: Soot must be in [0, 150] Tg (research bounds)
  const validSoot = assertInRange(soot, 0, 150, {
    location: 'calculateTemperatureAnomaly',
    valueName: 'soot'
  });

  let tempAnomaly: number;
  if (validSoot <= 5) {
    // 2025 research: 5 Tg → -1.5°C (Penn State 2025, lower than Sagan 1983)
    tempAnomaly = -validSoot * 0.30;  // Linear: 5 Tg → -1.5°C
  } else if (validSoot <= 27.5) {
    // Interpolate from -1.5°C (5 Tg) to -4.5°C (27.5 Tg regional war)
    const progress = (validSoot - 5) / (27.5 - 5);
    tempAnomaly = -1.5 - (progress * 3.0);  // -1.5°C → -4.5°C
  } else {
    // Full-scale war saturation: 150 Tg → -9°C (2025 consensus, lower than 2019)
    const progress = (validSoot - 27.5) / (150 - 27.5);
    tempAnomaly = -4.5 - (progress * 4.5);  // -4.5°C → -9°C
  }

  // Validate output: Temperature anomaly must be in [-15, 0]°C (2025 research bounds)
  return assertInRange(tempAnomaly, -15, 0, {
    location: 'calculateTemperatureAnomaly',
    valueName: 'temperatureAnomaly',
    additionalInfo: { soot: validSoot }
  });
}

/**
 * Calculate crop yield from nuclear winter effects
 *
 * Research (Penn State 2025, Xia et al. 2022):
 * - Limited war (5 Tg, -1.5°C): 7% global corn reduction
 * - Full-scale war (150 Tg, -9°C): 80-90% crop failure
 *
 * Three primary mechanisms (Penn State 2025 separates these):
 * 1. **Temperature:** Killing frosts, shortened growing season (3-4% per °C)
 * 2. **Darkening:** Reduced photosynthesis from sunlight blocking (2% per °C)
 * 3. **Precipitation:** Monsoon failures, drought (1-3% per °C)
 *
 * Combined: ~7% per °C total (matches Penn State 7% at -1.5°C = 10.5% total)
 *
 * @param tempAnomaly - Temperature drop (negative °C)
 * @param sunlightBlocked - Fraction of sunlight blocked [0,1]
 * @param precipitationReduction - Rainfall reduction [0,1] (0 = normal, 1 = total drought)
 * @returns Crop yield multiplier [0,1]
 */
function calculateCropYield(
  tempAnomaly: number,
  sunlightBlocked: number = 0,
  precipitationReduction: number = 0
): number {
  // Validate inputs
  const validTempAnomaly = assertInRange(tempAnomaly, -15, 0, {
    location: 'calculateCropYield',
    valueName: 'temperatureAnomaly'
  });

  const validSunlight = assertProbability(sunlightBlocked, {
    location: 'calculateCropYield',
    valueName: 'sunlightBlocked'
  });

  const validPrecipitation = assertProbability(precipitationReduction, {
    location: 'calculateCropYield',
    valueName: 'precipitationReduction'
  });

  // Penn State 2025: Separate factors
  // 1. Temperature effect: 3-4% per °C (killing frosts, season shortening)
  const temperatureYieldLoss = Math.abs(validTempAnomaly) * 0.035;  // 3.5% per °C

  // 2. Darkening effect: Proportional to sunlight blocked (photosynthesis reduction)
  // At 60% blocking (5 Tg), contributes ~3% yield loss
  // At 92.5% blocking (150 Tg), contributes ~15% yield loss
  const darkeningYieldLoss = validSunlight * 0.18;  // 18% at full 92.5% blocking

  // 3. Precipitation effect: Drought amplification
  // At 6% reduction (limited war), contributes ~2% yield loss
  // At 30% reduction (full-scale), contributes ~10% yield loss
  const precipitationYieldLoss = validPrecipitation * 0.30;  // 30% at full drought

  // Combined yield multiplier
  const totalYieldLoss = temperatureYieldLoss + darkeningYieldLoss + precipitationYieldLoss;
  const cropYield = Math.max(0.05, 1.0 - totalYieldLoss);  // Minimum 5% (some crops survive)

  // Validate output: Crop yield must be in [0, 1] (probability/fraction)
  return assertProbability(cropYield, {
    location: 'calculateCropYield',
    valueName: 'cropYieldMultiplier',
    additionalInfo: {
      temperatureAnomaly: validTempAnomaly,
      sunlightBlocked: validSunlight,
      precipitationReduction: validPrecipitation,
      totalYieldLoss
    }
  });
}

/**
 * Calculate sunlight blocking from soot level
 *
 * Research (Robock et al. 2019, Coupe et al. 2019):
 * - 5 Tg soot → 50-70% sunlight blocked (midpoint: 60%)
 * - 50 Tg soot → 80-90% sunlight blocked (midpoint: 85%)
 * - 150 Tg soot → 90-95% sunlight blocked (midpoint: 92.5%)
 *
 * Sunlight blocking directly affects:
 * - Solar panel energy production (proportional to available sunlight)
 * - Agricultural yields (already modeled via temperature anomaly)
 * - Temperature (already modeled via temperature anomaly)
 *
 * @param soot - Soot in stratosphere (Tg)
 * @returns Fraction of sunlight blocked [0, 1]
 */
function calculateSunlightBlocking(soot: number): number {
  // Validate input: Soot must be in [0, 150] Tg (research bounds)
  const validSoot = assertInRange(soot, 0, 150, {
    location: 'calculateSunlightBlocking',
    valueName: 'soot'
  });

  let sunlightBlocked: number;
  if (validSoot <= 5) {
    // Linear: 5 Tg → 60% blocking (Robock 2019 midpoint)
    sunlightBlocked = validSoot * 0.12; // 5 Tg → 0.60
  } else if (validSoot <= 50) {
    // Interpolate from 60% (5 Tg) to 85% (50 Tg)
    const progress = (validSoot - 5) / (50 - 5);
    sunlightBlocked = 0.60 + (progress * 0.25); // 0.60 → 0.85
  } else {
    // Saturation: 150 Tg → 92.5% blocking (midpoint of 90-95%)
    const progress = (validSoot - 50) / (150 - 50);
    sunlightBlocked = 0.85 + (progress * 0.075); // 0.85 → 0.925
  }

  // Validate output: Sunlight blocking must be in [0, 1] (probability/fraction)
  return assertProbability(sunlightBlocked, {
    location: 'calculateSunlightBlocking',
    valueName: 'sunlightBlocked',
    additionalInfo: { soot: validSoot }
  });
}

/**
 * Calculate monthly starvation rate
 *
 * ⚠️⚠️ TIER 3 BRONZE - Modeling assumption (calibrated to Xia et al. 2022)
 * CONCEPT SUPPORT: Nuclear winter causes massive famine (Xia et al. 2022, Robock & Toon 2012)
 * QUANTIFICATION: Calibrated to Xia's 5-6B deaths, NOT from historical famine rates
 * UNCERTAINTY: ±50% (could be 5-20% monthly depending on food access, healthcare collapse)
 * PARAMETER SWEEP REQUIRED: No (this is worst-case calibration, not uncertainty range)
 *
 * CRITICAL CLARIFICATION: Holodomor vs Nuclear Winter Rates
 * - HOLODOMOR (Wolowyna et al. 2020): "140-200 per 1,000" is CUMULATIVE over 1932-1934
 *   - Annual average: 5-6.5% per year (~0.4-0.55% per month)
 *   - Context: Regional famine, agricultural confiscation, 1932-1933, Ukraine
 *   - Historical context: Comparable to Great Leap Forward (1.5%/year), Bengal 1943 (4%/year)
 * - NUCLEAR WINTER (calibrated to Xia et al. 2022): "More than 5 billion could die"
 *   - Calibration: To reach 5B deaths from 6B at risk requires ~80-90% mortality over 30 years
 *   - Implies: ~10-15% monthly mortality in worst-case scenarios
 *   - Context: Global crop failure, no external aid, collapsed institutions, climate collapse
 * - KEY DISTINCTION:
 *   - Holodomor rate (0.4-0.55% monthly) = HISTORICAL AVERAGE from regional famine
 *   - Nuclear winter rate (10-15% monthly) = WORST-CASE EXTRAPOLATION calibrated to Xia's projection
 *   - These are DIFFERENT scenarios with DIFFERENT rates
 *
 * Research (Robock & Toon 2012, Xia et al. 2022):
 * - Peak starvation: Months 6-24 after war
 * - 10-15% monthly mortality during peak (calibrated to Xia's 5-6B total)
 * - Gradual decline as crops partially recover
 *
 * NEW (Nov 20, 2025): Resilient food technologies reduce mortality 20-40% IF deployed before war
 * - Strategic grain reserves: 20% reduction (6-month buffer)
 * - Cold-tolerant crops: 15% yield recovery
 * - Emergency greenhouses: 10% yield recovery (energy-limited)
 * - Emergency food distribution AI: 10% mortality reduction (reduces panic, violence)
 * - Combined effect: 20-40% mortality reduction (IIASA 2025 optimistic case)
 * - **CRITICAL:** Technologies must be DEPLOYED BEFORE nuclear war to be effective
 *
 * @param cropYield - Crop yield multiplier [0,1]
 * @param monthsSinceWar - Months since nuclear war
 * @param resilientFoodMultiplier - Mortality reduction from resilient food tech [0.6, 1.0] (0.7 = 30% reduction)
 * @returns Monthly starvation rate [0,1]
 */
function calculateStarvationRate(
  cropYield: number,
  monthsSinceWar: number,
  resilientFoodMultiplier: number = 1.0
): number {
  // Validate inputs
  const validCropYield = assertProbability(cropYield, {
    location: 'calculateStarvationRate',
    valueName: 'cropYield'
  });

  const validMonths = assertFinite(monthsSinceWar, {
    location: 'calculateStarvationRate',
    valueName: 'monthsSinceWar'
  });

  const validResilientFoodMultiplier = assertInRange(resilientFoodMultiplier, 0.6, 1.0, {
    location: 'calculateStarvationRate',
    valueName: 'resilientFoodMultiplier',
    additionalInfo: { interpretation: '0.7 = 30% mortality reduction from resilient food tech' }
  });

  // Food shortage severity (1 - crop yield)
  const shortage = 1 - validCropYield;

  // Starvation ramps up over first 6 months (takes time for food stocks to run out)
  let rampMultiplier = 1.0;
  if (validMonths < 6) {
    rampMultiplier = validMonths / 6;  // Linear ramp: 0 → 1.0 over 6 months
  }

  // Peak starvation: months 6-24
  // After month 24, gradual decline as agriculture partially recovers
  let recoveryMultiplier = 1.0;
  if (validMonths > 24) {
    // Exponential decay: 50% reduction every 24 months
    recoveryMultiplier = Math.pow(0.5, (validMonths - 24) / 24);
  }

  // Base starvation rate scales with shortage severity
  // ⚠️⚠️ CALIBRATED TO XIA ET AL. 2022, NOT HISTORICAL FAMINE RATES
  // - 90% crop failure → 12% monthly mortality (calibrated to reach 5-6B deaths)
  // - This is WORST-CASE nuclear winter scenario, NOT historical famine average
  // - Holodomor average would be ~1.4% monthly (14% annual / 12), but nuclear winter
  //   is global collapse, no external aid, collapsed institutions → much higher rate
  const NUCLEAR_WINTER_MONTHLY_BASE = 0.12;  // 12% monthly at 90% crop failure (calibrated to Xia)
  const baseRate = shortage * (NUCLEAR_WINTER_MONTHLY_BASE / 0.9);  // Scale linearly: 90% shortage → 12% monthly

  // Apply resilient food technology reduction (2025 research: 20-40% mortality reduction IF deployed before war)
  const starvationRate = baseRate * rampMultiplier * recoveryMultiplier * validResilientFoodMultiplier;

  // Validate output: Mortality rate must be plausible (max 50% monthly per Black Death reference)
  return assertMortalityRate(starvationRate, {
    location: 'calculateStarvationRate',
    valueName: 'starvationRate'
  });
}

/**
 * Calculate resilient food technology multiplier from deployed technologies
 *
 * Checks for 4 nuclear winter resilient food techs (Nov 20, 2025):
 * - Strategic grain reserves: 20% mortality reduction
 * - Cold-tolerant crops: 15% yield recovery
 * - Emergency greenhouses: 10% yield recovery
 * - Emergency food distribution AI: 10% mortality reduction
 *
 * Combined effect: 20-40% mortality reduction (IIASA 2025 optimistic case)
 * **CRITICAL:** Technologies must be DEPLOYED BEFORE nuclear war to be effective
 *
 * @param state - Game state (check deployed techs)
 * @returns Mortality multiplier [0.6, 1.0] (0.7 = 30% reduction)
 */
function calculateResilientFoodMultiplier(state: GameState): number {
  // Check if tech tree system exists (early game might not have it)
  if (!state.techTreeState) {
    return 1.0;  // No tech reduction (baseline scenario)
  }

  // HIGH PERFORMANCE FIX (Nov 20, 2025): Use O(1) lookup instead of O(n) find()
  // HIGH TYPE SAFETY FIX (Nov 20, 2025): Use getTechDeployment with proper assertions
  // (getTechDeployment imported at top of file)

  // Tech ID -> mortality reduction mapping
  const techMitigations = [
    { id: 'strategic_grain_reserves', reduction: 0.20 },
    { id: 'cold_tolerant_crops', reduction: 0.15 },
    { id: 'emergency_greenhouse_networks', reduction: 0.10 },
    { id: 'emergency_food_distribution_ai', reduction: 0.10 }
  ];

  // Calculate cumulative mortality reduction from deployed techs
  // Using O(1) lookup instead of O(n) array search
  const mortalityReduction = techMitigations.reduce((sum, tech) => {
    const deploymentLevel = getTechDeployment(state.techTreeState!, tech.id);
    // Only count if deployment level >= 80% (meaningful global coverage)
    return sum + (deploymentLevel >= 0.8 ? tech.reduction : 0);
  }, 0);

  // Cap at 40% maximum reduction (IIASA 2025 optimistic case)
  const cappedReduction = Math.min(0.40, mortalityReduction);

  // Return multiplier: 0.6 = 40% reduction, 1.0 = 0% reduction
  const multiplier = 1.0 - cappedReduction;

  // Validate output
  return assertInRange(multiplier, 0.6, 1.0, {
    location: 'calculateResilientFoodMultiplier',
    valueName: 'resilientFoodMultiplier',
    additionalInfo: {
      mortalityReduction: cappedReduction,
      deployedTechs: mortalityReduction / 0.10  // Number of techs (each ~10%)
    }
  });
}

/**
 * Add radiation zones for countries hit by nuclear weapons (ENHANCED - M-6)
 *
 * Now includes:
 * - Time-varying dose rates (7-10 decay rule)
 * - Radionuclide-specific tracking (I-131, Cs-137, Sr-90)
 * - Medical care level determination
 * - Population dose cohorts
 *
 * @param state - Game state (needed for medical care determination)
 * @param winter - Nuclear winter state
 * @param countries - Countries hit by nuclear weapons
 * @param currentMonth - Current simulation month
 */
function addRadiationZonesEnhanced(
  state: GameState,
  winter: NuclearWinterState,
  countries: string[],
  currentMonth: number
): void {
  countries.forEach(country => {
    // Check if country already has radiation zone (multiple hits)
    const existing = winter.radiationZones.find(z => z.country === country);
    if (existing) {
      // Multiple strikes: increase initial dose rate
      if (existing.initialDoseRate) {
        existing.initialDoseRate = Math.min(100, existing.initialDoseRate * 1.5);
      }
      // Legacy fields for backward compatibility
      existing.intensity = Math.min(1.0, existing.intensity + 0.3);
      existing.currentLevel = existing.intensity;
      return;
    }

    // Estimate nuclear yield (simplified: typical warhead 0.1-1 MT)
    const estimatedYieldMT = 0.5;  // Conservative mid-range estimate

    // Initialize fallout composition (radionuclide-specific)
    const falloutComp = initializeFalloutComposition(estimatedYieldMT);

    // Determine medical care level from game state
    const medicalCare = determineMedicalCareLevel(state);

    // Calculate effective LD50 (medical care + combined injury prevalence)
    // Research: 65% of nuclear casualties have combined injuries (NIAID PMC8771911)
    const hasCombinedInjury = Math.random() < 0.65;  // 65% prevalence
    const effectiveLD50 = calculateEffectiveLD50(medicalCare, hasCombinedInjury);

    // Estimate initial dose rate at t=1h (typical range: 1-10 Gy/hour for fallout zone)
    // This varies WILDLY based on distance from ground zero, wind, etc.
    // Simplified: Use 5 Gy/hour as mid-range lethal dose rate
    const initialDoseRate = 5.0;  // Gy/hour at t=1h post-detonation

    // Estimate population in radiation zone (simplified: 10% of country in fallout zone)
    // Real scenario: Extremely heterogeneous based on wind patterns, terrain
    const countryPopulation = state.humanPopulationSystem.population * 0.01;  // Rough estimate
    const radiationZonePopulation = countryPopulation * 0.10;  // 10% in fallout zone

    // Distribute population into dose cohorts (initial estimate)
    const populationCohorts = distributePopulationIntoCohorts(
      radiationZonePopulation,
      initialDoseRate,
      1  // t=1h post-detonation
    );

    // Add new enhanced radiation zone
    winter.radiationZones.push({
      country,
      hitMonth: currentMonth,

      // LEGACY FIELDS (kept for backward compatibility)
      intensity: 0.8,
      decayRate: 0.05,
      currentLevel: 0.8,
      monthlyDeathRate: 0.01,

      // NEW FIELDS (M-6 Enhanced Radiation Modeling)
      initialDoseRate,
      falloutComposition: falloutComp,
      organDoses: {
        // Initialize organ doses (will accumulate over time)
        boneMarrow: 0,
        colon: 0,
        lung: 0,
        stomach: 0,
        thyroid: 0,
        gonads: 0,
        remainderOrgans: 0
      },
      populationCohorts,
      medicalCareLevel: medicalCare,
      effectiveLD50,
      cumulativeDose: 0,  // Will accumulate over time
      lifetimeExcessCancerRisk: 0  // Will increase with cumulative dose
    });

    console.log(`   ☢️  Radiation zone created: ${country}`);
    console.log(`      Initial dose rate: ${initialDoseRate.toFixed(1)} Gy/hr`);
    console.log(`      Medical care: ${medicalCare}`);
    console.log(`      Effective LD50/60: ${effectiveLD50.toFixed(1)} Gy`);
    console.log(`      Population at risk: ${(radiationZonePopulation * 1000).toFixed(0)}M`);
  });
}

/**
 * Add radiation zones (wrapper for backward compatibility)
 */
function addRadiationZones(
  winter: NuclearWinterState,
  countries: string[],
  currentMonth: number
): void {
  // DEPRECATED: This function signature doesn't have GameState
  // For now, create zones with legacy behavior
  // TODO: Refactor callers to use addRadiationZonesEnhanced with GameState
  countries.forEach(country => {
    const existing = winter.radiationZones.find(z => z.country === country);
    if (existing) {
      existing.intensity = Math.min(1.0, existing.intensity + 0.3);
      existing.currentLevel = existing.intensity;
      return;
    }

    winter.radiationZones.push({
      country,
      hitMonth: currentMonth,
      intensity: 0.8,
      decayRate: 0.05,
      currentLevel: 0.8,
      monthlyDeathRate: 0.01
    });
  });
}

/**
 * Calculate ozone depletion from soot level and time since war
 *
 * Research (Mills et al. 2014, reaffirmed 2024-2025):
 * - Mechanism: Stratospheric heating accelerates ozone-destroying chemical reactions
 * - Peak depletion: Months 12-24 after war (20-50% ozone loss)
 * - Duration: 10-15 years persistence
 * - Impact: 50-100% UV radiation increase at surface
 *
 * @param soot - Current soot in stratosphere (Tg)
 * @param monthsSinceWar - Months elapsed since nuclear war
 * @returns Ozone depletion [0,1] (0.5 = 50% depleted)
 */
function calculateOzoneDepletion(soot: number, monthsSinceWar: number): number {
  // Validate inputs
  const validSoot = assertInRange(soot, 0, 150, {
    location: 'calculateOzoneDepletion',
    valueName: 'soot'
  });

  const validMonths = assertFinite(monthsSinceWar, {
    location: 'calculateOzoneDepletion',
    valueName: 'monthsSinceWar'
  });

  // Ozone depletion scales with soot (more soot = more stratospheric heating)
  // 5 Tg → 10% depletion, 150 Tg → 50% depletion (Mills et al. 2014)
  const sootFactor = validSoot / 150;  // Normalize to [0,1]
  const maxDepletion = 0.10 + (sootFactor * 0.40);  // 10% to 50% range

  // Temporal profile: Ramps up over 12 months, peaks 12-24 months, gradual recovery
  let timeFactor: number;
  if (validMonths < 12) {
    // Ramp up: 0 → 1.0 over 12 months
    timeFactor = validMonths / 12;
  } else if (validMonths < 24) {
    // Peak depletion: Months 12-24
    timeFactor = 1.0;
  } else {
    // Recovery: Exponential decay, 10-15 year half-life (ozoneRecoveryRate = 0.007/month)
    const monthsSincePeak = validMonths - 24;
    timeFactor = Math.exp(-0.007 * monthsSincePeak);
  }

  const ozoneDepletion = maxDepletion * timeFactor;

  // Validate output: Ozone depletion must be in [0, 1]
  return assertProbability(ozoneDepletion, {
    location: 'calculateOzoneDepletion',
    valueName: 'ozoneDepletion',
    additionalInfo: { soot: validSoot, monthsSinceWar: validMonths }
  });
}

/**
 * Calculate precipitation reduction from temperature anomaly
 *
 * Research (Robock et al. 2024-2025):
 * - Mechanism: Anti-greenhouse effect reduces evaporation, disrupts circulation
 * - Limited war (5 Tg, -1.5°C): 6% global reduction
 * - Full-scale war (150 Tg, -9°C): 20-30% reduction (midpoint: 25%)
 * - Impact: Monsoon failures, drought amplification
 * - Duration: 5-10 years
 *
 * @param temperatureAnomaly - Temperature drop (negative °C)
 * @returns Precipitation reduction [0,1] (0.3 = 30% less rainfall)
 */
function calculatePrecipitationReduction(temperatureAnomaly: number): number {
  // Validate input
  const validTempAnomaly = assertInRange(temperatureAnomaly, -15, 0, {
    location: 'calculatePrecipitationReduction',
    valueName: 'temperatureAnomaly'
  });

  // Linear scaling: Each °C drop reduces precipitation
  // -1.5°C → 6% reduction, -9°C → 25% reduction
  // Slope: (0.25 - 0.06) / (9 - 1.5) = 0.0253 per °C
  const tempMagnitude = Math.abs(validTempAnomaly);
  const precipReduction = Math.min(0.30, tempMagnitude * 0.028);  // Cap at 30%

  // Validate output
  return assertProbability(precipReduction, {
    location: 'calculatePrecipitationReduction',
    valueName: 'precipitationReduction',
    additionalInfo: { temperatureAnomaly: validTempAnomaly }
  });
}

/**
 * Calculate marine productivity reduction from sunlight blocking and UV radiation
 *
 * Research (Penn State 2025, Xia et al. 2022):
 * - Mechanism: Reduced sunlight + UV damage + ocean cooling
 * - Limited war (60% sunlight blocking): 10-15% phytoplankton reduction
 * - Full-scale war (92.5% blocking): 30-40% phytoplankton reduction (midpoint: 35%)
 * - Cascade: Fish stocks collapse, 1-2B ocean-dependent populations at risk
 * - Timeline: 1-2 years onset, 5-10 years recovery
 *
 * @param sunlightBlocked - Fraction of sunlight blocked [0,1]
 * @param uvMultiplier - Surface UV radiation multiplier [1.0, 2.0]
 * @returns Marine productivity reduction [0,1] (0.35 = 35% phytoplankton die-off)
 */
function calculateMarineProductivityReduction(
  sunlightBlocked: number,
  uvMultiplier: number
): number {
  // Validate inputs
  const validSunlight = assertProbability(sunlightBlocked, {
    location: 'calculateMarineProductivityReduction',
    valueName: 'sunlightBlocked'
  });

  const validUV = assertInRange(uvMultiplier, 1.0, 2.0, {
    location: 'calculateMarineProductivityReduction',
    valueName: 'uvMultiplier'
  });

  // Sunlight effect: Direct impact on photosynthesis
  // 60% blocking → 12% reduction, 92.5% blocking → 30% reduction
  const sunlightImpact = validSunlight * 0.32;  // 32% at 92.5% blocking

  // UV effect: Additional stress (compounds sunlight blocking)
  // 50% UV increase → 5% additional reduction, 100% increase → 10% additional reduction
  const uvImpact = (validUV - 1.0) * 0.10;  // 10% at 2.0x UV

  const totalReduction = Math.min(0.40, sunlightImpact + uvImpact);  // Cap at 40%

  // Validate output
  return assertProbability(totalReduction, {
    location: 'calculateMarineProductivityReduction',
    valueName: 'marineProductivityReduction',
    additionalInfo: { sunlightBlocked: validSunlight, uvMultiplier: validUV }
  });
}

/**
 * Update nuclear winter state each month
 *
 * @param state - Game state
 */
export function updateNuclearWinter(state: GameState): void {
  const winter = state.nuclearWinterState;
  if (!winter.active) return;

  winter.monthsSinceWar++;

  // 1. Update soot levels (decay over time)
  // Validate soot before decay calculation
  const previousSoot = assertInRange(winter.currentSoot, 0, 150, {
    location: 'updateNuclearWinter',
    valueName: 'currentSoot (before decay)',
    month: state.currentMonth
  });

  winter.currentSoot = previousSoot * (1 - winter.sootDecayRate);

  // Validate soot after decay
  winter.currentSoot = assertInRange(winter.currentSoot, 0, 150, {
    location: 'updateNuclearWinter',
    valueName: 'currentSoot (after decay)',
    month: state.currentMonth,
    additionalInfo: { previousSoot, decayRate: winter.sootDecayRate }
  });

  // 2. Update temperature (recovers as soot clears)
  winter.temperatureAnomaly = calculateTemperatureAnomaly(winter.currentSoot);

  // 3. Update sunlight blocking (ARCH-4 Gap #1: Nuclear winter → solar energy integration)
  winter.sunlightBlocked = calculateSunlightBlocking(winter.currentSoot);

  // 3.1. Update second-order cascades (2025 research: Mills, Robock, Penn State)
  // Ozone depletion from stratospheric heating
  winter.ozoneDepletion = calculateOzoneDepletion(winter.currentSoot, winter.monthsSinceWar);
  winter.uvRadiationMultiplier = 1.0 + winter.ozoneDepletion;  // Linear: 50% depletion → 1.5x UV

  // Precipitation reduction from anti-greenhouse effect
  winter.precipitationReduction = calculatePrecipitationReduction(winter.temperatureAnomaly);

  // Marine ecosystem collapse from sunlight blocking + UV damage
  winter.marineProductivityReduction = calculateMarineProductivityReduction(
    winter.sunlightBlocked,
    winter.uvRadiationMultiplier
  );

  // Ocean-dependent population at risk (1-2B from fish stock collapse)
  // Scales with marine productivity reduction and global population
  const globalPopulation = state.humanPopulationSystem.population;
  winter.oceanDependentPopulationAtRisk = globalPopulation * 0.20 * winter.marineProductivityReduction;
  // 20% of population depends on ocean protein (Penn State 2025)

  // 4. Update crop yields (improve as temperature recovers)
  // Penn State 2025: Separate temperature, darkening, precipitation effects
  winter.cropYieldMultiplier = calculateCropYield(
    winter.temperatureAnomaly,
    winter.sunlightBlocked,
    winter.precipitationReduction  // Now calculated from cascades
  );

  // 5. Get resilient food technology multiplier (cached at war trigger)
  // HIGH #2 FIX (Nov 20, 2025): Use cached value instead of recalculating every month.
  // Technologies deployed AFTER war don't help (infrastructure collapsed), so we
  // locked this in at trigger time. Fallback to 1.0 (no reduction) if cache missing.
  const resilientFoodMultiplier = winter.cachedResilientFoodMultiplier ?? 1.0;

  // 6. Update starvation rate (with resilient food tech reduction)
  winter.monthlyStarvationRate = calculateStarvationRate(
    winter.cropYieldMultiplier,
    winter.monthsSinceWar,
    resilientFoodMultiplier
  );
  
  // 5. Apply starvation deaths
  if (winter.monthlyStarvationRate > 0) {
    const population = state.humanPopulationSystem.population;
    const starvationDeaths = population * winter.monthlyStarvationRate;
    
    if (starvationDeaths > 0.001) {  // Only log if > 1 million deaths
      const monthlyStarvationRate = assertFinite(winter.monthlyStarvationRate, {
        location: 'updateNuclearWinter (famine)',
        valueName: 'monthlyStarvationRate',
        month: state.currentMonth,
        additionalInfo: { soot: winter.currentSoot, cropYield: winter.cropYieldMultiplier }
      });

      addMortalityRisk(state.humanPopulationSystem, {
        type: 'famine',
        baseRisk: monthlyStarvationRate,
        scope: 'GLOBAL',
        exposedFraction: 1.00,
        proximate: 'famine',
        root: RootCause.conflict,
        month: state.currentMonth,  // Root: Nuclear war caused nuclear winter
        description: 'Nuclear winter famine - agricultural collapse (global)',
        confidence: 'HIGH'  // Robock & Toon (2012)
      });
      winter.totalWinterDeaths += starvationDeaths;
      
      // Log significant events
      if (winter.monthsSinceWar % 12 === 0 || winter.monthsSinceWar === 6) {
        console.log(`\n☢️  NUCLEAR WINTER (Month ${state.currentMonth}, ${winter.monthsSinceWar} months since war)`);
        console.log(`   Soot remaining: ${winter.currentSoot.toFixed(1)} Tg (${(winter.currentSoot / winter.sootInStratosphere * 100).toFixed(0)}% of peak)`);
        console.log(`   Temperature: ${winter.temperatureAnomaly.toFixed(1)}°C below baseline`);
        console.log(`   Crop yield: ${(winter.cropYieldMultiplier * 100).toFixed(0)}%`);
        console.log(`   Starvation: ${(starvationDeaths * 1000).toFixed(1)}M deaths this month`);
        console.log(`   Total winter deaths: ${(winter.totalWinterDeaths * 1000).toFixed(0)}M`);
      }
    }
  }
  
  // 6. Update radiation zones
  updateRadiationZones(state, winter);
  
  // 7. Check if nuclear winter is over (soot cleared, starvation negligible)
  if (winter.currentSoot < 0.5 && winter.monthlyStarvationRate < 0.001) {
    winter.active = false;
    console.log(`\n✅ NUCLEAR WINTER ENDED (Month ${state.currentMonth})`);
    console.log(`   Duration: ${winter.monthsSinceWar} months (${(winter.monthsSinceWar / 12).toFixed(1)} years)`);
    console.log(`   Total deaths: ${(winter.totalWinterDeaths * 1000).toFixed(0)}M starvation + ${(winter.totalRadiationDeaths * 1000).toFixed(0)}M radiation`);
    console.log(`   Final temperature: ${(winter.baselineTemperature + winter.temperatureAnomaly).toFixed(1)}°C (baseline: ${winter.baselineTemperature}°C)`);
  }
}

/**
 * Update radiation zones (ENHANCED - M-6: dose accumulation and mortality)
 *
 * Now includes:
 * - Time-varying dose rate decay (7-10 rule)
 * - Dose-response mortality (LD50/60 sigmoid curves)
 * - Organ dose accumulation (ICRP 103 tissue weighting)
 * - Chronic cancer risk (BEIR VII with LNT controversy)
 * - Radionuclide decay (I-131, Cs-137, Sr-90)
 */
function updateRadiationZones(state: GameState, winter: NuclearWinterState): void {
  if (winter.radiationZones.length === 0) return;

  let totalAcuteRadiationDeaths = 0;
  let totalChronicCancerDeaths = 0;

  winter.radiationZones.forEach(zone => {
    // Calculate hours since detonation
    const monthsSinceHit = state.currentMonth - zone.hitMonth;
    const hoursSinceDetonation = monthsSinceHit * 730;  // ~30 days/month × 24 hours/day

    // ENHANCED MODELING (if zone has new fields)
    if (zone.initialDoseRate && zone.effectiveLD50 && zone.populationCohorts) {
      // Calculate current dose rate using 7-10 decay rule
      const currentDoseRate = calculateCurrentDoseRate(
        zone.initialDoseRate,
        hoursSinceDetonation
      );

      // Monthly dose accumulation (integrate over ~730 hours)
      // Simplified: average dose rate × time
      const monthlyDose = currentDoseRate * 730;  // Gy

      // Update cumulative dose
      zone.cumulativeDose = (zone.cumulativeDose ?? 0) + monthlyDose;

      // Calculate chronic cancer risk from cumulative dose
      // WARNING: BEIR VII LNT model - contested for low doses
      // Research: Doss (2018), Ozasa et al. (2012) challenge linear assumption
      zone.lifetimeExcessCancerRisk = calculateLifetimeExcessCancerRisk(
        zone.cumulativeDose,
        true  // Chronic exposure (applies DREF)
      );

      // Calculate acute mortality using dose-response curves
      // Apply to each dose cohort separately
      const cohorts = zone.populationCohorts;

      // Sublethal cohort: <0.7 Gy, low mortality (~0%)
      const sublethalMortality = 0;

      // Moderate cohort: 0.7-2.0 Gy, 5-20% mortality (use 10% average)
      const moderateMortality = calculateMortalityProbability(
        1.35,  // Midpoint of 0.7-2.0 Gy
        zone.effectiveLD50
      );

      // Severe cohort: 2.0-5.5 Gy, 50-95% mortality (use sigmoid)
      const severeMortality = calculateMortalityProbability(
        3.75,  // Midpoint of 2.0-5.5 Gy
        zone.effectiveLD50
      );

      // Lethal cohort: >5.5 Gy, >95% mortality
      const lethalMortality = calculateMortalityProbability(
        7.0,  // Representative lethal dose
        zone.effectiveLD50
      );

      // Calculate total acute deaths this month
      const acuteDeaths =
        cohorts.sublethal * sublethalMortality * 0.01 +  // Convert monthly rate
        cohorts.moderate * moderateMortality * 0.01 +
        cohorts.severe * severeMortality * 0.01 +
        cohorts.lethal * lethalMortality * 0.01;

      totalAcuteRadiationDeaths += acuteDeaths;

      // Calculate chronic cancer deaths (appears years later, but model as slow accumulation)
      // BEIR VII: 5% mortality increase per Sv (with DREF=2 for chronic)
      // Cancer latency: 2-10 years leukemia, 5-20 years solid tumors
      // Simplified: Start after 24 months (2 years), ramp up gradually
      if (monthsSinceHit >= 24) {
        const totalPopulation = cohorts.sublethal + cohorts.moderate + cohorts.severe + cohorts.lethal;
        const chronicDeathRate = zone.lifetimeExcessCancerRisk * 0.01;  // Monthly rate
        const chronicDeaths = totalPopulation * chronicDeathRate;
        totalChronicCancerDeaths += chronicDeaths;
      }

      // Update legacy fields for backward compatibility
      zone.currentLevel = Math.max(0, currentDoseRate / zone.initialDoseRate);
      zone.monthlyDeathRate = (acuteDeaths > 0.001) ? 0.01 : 0;

      // Log significant events (annual)
      if (monthsSinceHit % 12 === 0 && (acuteDeaths > 0.001 || totalChronicCancerDeaths > 0.001)) {
        console.log(`   ☢️  Radiation effects in ${zone.country} (Year ${monthsSinceHit / 12}):`);
        console.log(`      Dose rate: ${currentDoseRate.toFixed(4)} Gy/hr (${(zone.currentLevel * 100).toFixed(1)}% of initial)`);
        console.log(`      Cumulative dose: ${zone.cumulativeDose.toFixed(2)} Sv`);
        console.log(`      Acute deaths: ${(acuteDeaths * 1000).toFixed(1)}M`);
        if (monthsSinceHit >= 24) {
          console.log(`      Chronic cancer deaths: ${(totalChronicCancerDeaths * 1000).toFixed(1)}M`);
          console.log(`      Lifetime excess cancer risk: ${(zone.lifetimeExcessCancerRisk * 100).toFixed(1)}%`);
        }
      }
    } else {
      // LEGACY MODELING (zones created before enhancement)
      // Use old decay method for backward compatibility
      zone.currentLevel = zone.currentLevel * (1 - zone.decayRate);

      // Apply legacy radiation mortality
      const radiationMortality = zone.monthlyDeathRate * zone.currentLevel;

      // Apply to country if we have country tracking
      if (state.countryPopulationSystem) {
        const country = state.countryPopulationSystem.countries[zone.country];
        if (country && country.population > 0.1) {
          const countryDeaths = (country.population / 1000) * radiationMortality;
          totalAcuteRadiationDeaths += countryDeaths;

          if (monthsSinceHit % 12 === 0 && countryDeaths > 0.001) {
            console.log(`   ☢️  Radiation deaths in ${zone.country}: ${(countryDeaths * 1000).toFixed(1)}M (level: ${(zone.currentLevel * 100).toFixed(0)}%)`);
          }
        }
      }
    }
  });

  // Add mortality risks to population system
  if (totalAcuteRadiationDeaths > 0) {
    // Calculate average mortality rate across exposed zones
    const nuclearNationsPopulation = state.humanPopulationSystem.population * 0.30;

    // NaN AUDIT (Nov 16, 2025): Protect division - if population collapsed to 0, fail loudly
    if (nuclearNationsPopulation <= 0) {
      throw new Error(
        `❌ EXTINCTION: Nuclear nations population collapsed to 0 during nuclear winter (Month ${state.currentMonth}). ` +
        `Total radiation deaths: ${totalAcuteRadiationDeaths}. Cannot calculate mortality rate with zero denominator.`
      );
    }

    const averageAcuteMortality = assertFinite(totalAcuteRadiationDeaths / nuclearNationsPopulation, {
      location: 'updateRadiationZones',
      valueName: 'averageAcuteMortality',
      month: state.currentMonth,
      additionalInfo: {
        totalDeaths: totalAcuteRadiationDeaths,
        nuclearNationsPopulation,
        zones: winter.radiationZones.length
      }
    });

    addMortalityRisk(state.humanPopulationSystem, {
      type: 'war',
      baseRisk: averageAcuteMortality,
      scope: 'REGIONAL',
      exposedFraction: 0.30,
      proximate: 'war',
      root: RootCause.conflict,
      month: state.currentMonth,
      description: 'Acute radiation syndrome (ARS) - nuclear fallout zones',
      confidence: 'HIGH'  // CDC 2024, REMM, PMC3863169
    });
    winter.totalRadiationDeaths += totalAcuteRadiationDeaths;
  }

  if (totalChronicCancerDeaths > 0) {
    const nuclearNationsPopulation = state.humanPopulationSystem.population * 0.30;

    if (nuclearNationsPopulation <= 0) {
      throw new Error(
        `❌ EXTINCTION: Nuclear nations population collapsed to 0 during nuclear winter (Month ${state.currentMonth}). ` +
        `Total chronic cancer deaths: ${totalChronicCancerDeaths}. Cannot calculate mortality rate with zero denominator.`
      );
    }

    const averageChronicMortality = assertFinite(totalChronicCancerDeaths / nuclearNationsPopulation, {
      location: 'updateRadiationZones',
      valueName: 'averageChronicMortality',
      month: state.currentMonth,
      additionalInfo: {
        totalDeaths: totalChronicCancerDeaths,
        nuclearNationsPopulation,
        zones: winter.radiationZones.length,
        warning: 'BEIR VII LNT model - contested for low doses (<100 mSv)'
      }
    });

    addMortalityRisk(state.humanPopulationSystem, {
      type: 'disease',  // Cancer classified as disease mortality
      baseRisk: averageChronicMortality,
      scope: 'REGIONAL',
      exposedFraction: 0.30,
      proximate: 'disease',
      root: RootCause.conflict,  // Root cause: nuclear war
      month: state.currentMonth,
      description: 'Radiation-induced cancer (chronic exposure, BEIR VII model)',
      confidence: 'MEDIUM'  // LNT model contested, low-dose uncertainty
    });
    winter.totalRadiationDeaths += totalChronicCancerDeaths;
  }

  // Remove zones with negligible radiation (<1% of initial dose rate)
  // PERFORMANCE: In-place splice, backward iteration
  for (let i = winter.radiationZones.length - 1; i >= 0; i--) {
    if (winter.radiationZones[i].currentLevel <= 0.01) {
      console.log(`   ✅ Radiation zone ${winter.radiationZones[i].country} cleared (dose rate <1% of initial)`);
      winter.radiationZones.splice(i, 1);
    }
  }
}

