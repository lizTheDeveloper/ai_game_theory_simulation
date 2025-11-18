/**
 * TIER 1.7.4: Nuclear Winter System
 * 
 * Models the long-term catastrophic effects of nuclear war.
 * 
 * Research backing:
 * - Carl Sagan et al. (1983): "Nuclear Winter" original paper
 * - Robock & Toon (2012): "Local Nuclear War, Global Suffering"
 *   - 100 15-kt weapons (India-Pakistan scale) → 5 Tg soot
 *   - Temperature drops 1.25°C globally for 10 years
 *   - 2 billion people at risk of starvation
 * - Coupe et al. (2019): Full-scale US-Russia war
 *   - 150 Tg soot into stratosphere
 *   - Temperature drops 15-20°C
 *   - Crop yields drop to 10% of normal
 *   - 90% of Northern Hemisphere population dies
 *   - Recovery takes 5-10 years
 * 
 * Implementation philosophy:
 * - Nuclear war is already catastrophic (1-2B immediate deaths)
 * - Nuclear winter makes it apocalyptic (additional 4-6B starvation deaths)
 * - This is WHY nuclear war = extinction, not just the blast
 */

import { GameState } from '../types/game';
import { NuclearWinterState, RadiationZone } from '../types/nuclearWinter';
import { addMortalityRisk } from './bayesianMortality';
import {
  assertFinite,
  assertTemperatureDelta,
  assertProbability,
  assertInRange,
  assertMortalityRate
} from './utils/assertions';
import { RootCause } from '../types/population';

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

    // Climate
    temperatureAnomaly: 0,
    baselineTemperature: 15.0,  // °C global average (pre-war)
    sunlightBlocked: 0,          // No blockage initially

    // Agriculture
    cropYieldMultiplier: 1.0,   // Normal initially
    monthlyStarvationRate: 0,
    
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

  // Calculate crop failure
  winter.cropYieldMultiplier = calculateCropYield(winter.temperatureAnomaly);
  
  // Calculate starvation rate
  winter.monthlyStarvationRate = calculateStarvationRate(
    winter.cropYieldMultiplier,
    winter.monthsSinceWar
  );
  
  // Add radiation zones for hit countries
  addRadiationZones(winter, targetCountries, state.currentMonth);
  
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
 * Research (Robock et al. 2019):
 * - 5 Tg soot → -1.5°C to -3°C (midpoint: -2.25°C)
 * - 50 Tg soot → -7°C
 * - 150 Tg soot → -15 to -20°C (midpoint: -17.5°C)
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
    tempAnomaly = -validSoot * 0.45;  // Linear: 5 Tg → -2.25°C (Robock 2019 midpoint)
  } else if (validSoot <= 50) {
    // Interpolate from -2.25°C (5 Tg) to -7°C (50 Tg)
    tempAnomaly = -2.25 - ((validSoot - 5) * 0.105);  // 50 Tg → -7°C
  } else {
    // Saturation: 150 Tg → -17.5°C (midpoint of -15°C to -20°C)
    tempAnomaly = -7 - Math.min(10.5, (validSoot - 50) * 0.105);
  }

  // Validate output: Temperature anomaly must be in [-20, 0]°C (research bounds)
  return assertInRange(tempAnomaly, -20, 0, {
    location: 'calculateTemperatureAnomaly',
    valueName: 'temperatureAnomaly',
    additionalInfo: { soot: validSoot }
  });
}

/**
 * Calculate crop yield from temperature anomaly
 * 
 * Research: Each 1°C drop reduces crop yield by 5-10%
 * At -15°C, crops fail almost entirely (90% reduction)
 * 
 * @param tempAnomaly - Temperature drop (negative °C)
 * @returns Crop yield multiplier [0,1]
 */
function calculateCropYield(tempAnomaly: number): number {
  // Validate input: Temperature anomaly must be in [-20, 0]°C
  const validTempAnomaly = assertInRange(tempAnomaly, -20, 0, {
    location: 'calculateCropYield',
    valueName: 'temperatureAnomaly'
  });

  // Each degree drop reduces yield by 7% (conservative mid-range)
  const yieldLoss = Math.abs(validTempAnomaly) * 0.07;
  const cropYield = Math.max(0.05, 1.0 - yieldLoss);  // Minimum 5% yield (some crops survive)

  // Validate output: Crop yield must be in [0, 1] (probability/fraction)
  return assertProbability(cropYield, {
    location: 'calculateCropYield',
    valueName: 'cropYieldMultiplier',
    additionalInfo: { temperatureAnomaly: validTempAnomaly }
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
 * @param cropYield - Crop yield multiplier [0,1]
 * @param monthsSinceWar - Months since nuclear war
 * @returns Monthly starvation rate [0,1]
 */
function calculateStarvationRate(cropYield: number, monthsSinceWar: number): number {
  // Validate inputs
  const validCropYield = assertProbability(cropYield, {
    location: 'calculateStarvationRate',
    valueName: 'cropYield'
  });

  const validMonths = assertFinite(monthsSinceWar, {
    location: 'calculateStarvationRate',
    valueName: 'monthsSinceWar'
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

  const starvationRate = baseRate * rampMultiplier * recoveryMultiplier;

  // Validate output: Mortality rate must be plausible (max 50% monthly per Black Death reference)
  return assertMortalityRate(starvationRate, {
    location: 'calculateStarvationRate',
    valueName: 'starvationRate'
  });
}

/**
 * Add radiation zones for countries hit by nuclear weapons
 */
function addRadiationZones(
  winter: NuclearWinterState,
  countries: string[],
  currentMonth: number
): void {
  countries.forEach(country => {
    // Check if country already has radiation zone (multiple hits)
    const existing = winter.radiationZones.find(z => z.country === country);
    if (existing) {
      // Increase intensity (multiple strikes)
      existing.intensity = Math.min(1.0, existing.intensity + 0.3);
      existing.currentLevel = existing.intensity;
      return;
    }
    
    // Add new radiation zone
    winter.radiationZones.push({
      country,
      hitMonth: currentMonth,
      intensity: 0.8,  // High radiation (0.8/1.0)
      decayRate: 0.05,  // 5% per month (half-life ~14 months)
      currentLevel: 0.8,
      monthlyDeathRate: 0.01  // 1% additional monthly mortality
    });
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

  // 4. Update crop yields (improve as temperature recovers)
  winter.cropYieldMultiplier = calculateCropYield(winter.temperatureAnomaly);

  // 4. Update starvation rate
  winter.monthlyStarvationRate = calculateStarvationRate(
    winter.cropYieldMultiplier,
    winter.monthsSinceWar
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
 * Update radiation zones (decay and mortality)
 */
function updateRadiationZones(state: GameState, winter: NuclearWinterState): void {
  if (winter.radiationZones.length === 0) return;
  
  let totalRadiationDeaths = 0;
  
  winter.radiationZones.forEach(zone => {
    // Decay radiation over time
    zone.currentLevel = zone.currentLevel * (1 - zone.decayRate);
    
    // Apply radiation mortality (scales with radiation level)
    const radiationMortality = zone.monthlyDeathRate * zone.currentLevel;
    
    // Apply to country if we have country tracking
    if (state.countryPopulationSystem) {
      const country = state.countryPopulationSystem.countries[zone.country];
      if (country && country.population > 0.1) {  // Only if country has >100K people
        const countryDeaths = (country.population / 1000) * radiationMortality;  // Convert to billions
        totalRadiationDeaths += countryDeaths;
        
        // Log significant radiation deaths annually
        const monthsSinceHit = state.currentMonth - zone.hitMonth;
        if (monthsSinceHit % 12 === 0 && countryDeaths > 0.001) {
          console.log(`   ☢️  Radiation deaths in ${zone.country}: ${(countryDeaths * 1000).toFixed(1)}M (level: ${(zone.currentLevel * 100).toFixed(0)}%)`);
        }
      }
    }
  });
  
  if (totalRadiationDeaths > 0) {
    // Calculate average mortality rate across exposed zones
    // NaN AUDIT (Nov 16, 2025): Protect division - if population collapsed to 0, fail loudly
    const nuclearNationsPopulation = state.humanPopulationSystem.population * 0.30;

    // If nuclear-affected population collapsed to zero, can't calculate mortality rate
    // This indicates extinction - fail loudly rather than fallback to 1
    if (nuclearNationsPopulation <= 0) {
      throw new Error(
        `❌ EXTINCTION: Nuclear nations population collapsed to 0 during nuclear winter (Month ${state.currentMonth}). ` +
        `Total radiation deaths: ${totalRadiationDeaths}. Cannot calculate mortality rate with zero denominator.`
      );
    }

    const averageRadiationMortality = assertFinite(totalRadiationDeaths / nuclearNationsPopulation, {
      location: 'updateNuclearWinter (radiation)',
      valueName: 'averageRadiationMortality',
      month: state.currentMonth,
      additionalInfo: {
        totalDeaths: totalRadiationDeaths,
        nuclearNationsPopulation,
        zones: winter.radiationZones.length
      }
    });

    addMortalityRisk(state.humanPopulationSystem, {
      type: 'war',
      baseRisk: averageRadiationMortality,
      scope: 'REGIONAL',
      exposedFraction: 0.30,
      proximate: 'war',
      root: RootCause.conflict,
        month: state.currentMonth,
      description: 'Radiation poisoning (nuclear zones)',
      confidence: 'HIGH'  // Hiroshima/Nagasaki/Chernobyl data
    });
    winter.totalRadiationDeaths += totalRadiationDeaths;
  }
  
  // Remove zones with negligible radiation (<1%)
  winter.radiationZones = winter.radiationZones.filter(z => z.currentLevel > 0.01);
}

