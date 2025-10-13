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
import { addAcuteCrisisDeaths } from './populationDynamics';

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
    console.log(`\n⚠️  ADDITIONAL NUCLEAR EXCHANGE during existing nuclear winter`);
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
  
  if (warScale <= 100) {
    return warScale * 0.05;  // 5 Tg per 100 warheads
  } else if (warScale <= 1000) {
    return 5 + (warScale - 100) * 0.05;  // Linear scaling
  } else {
    // Saturation: diminishing returns above 1000 warheads
    return 50 + Math.min(100, (warScale - 1000) * 0.1);
  }
}

/**
 * Calculate temperature anomaly from soot level
 * 
 * Research (Robock & Toon 2012):
 * - 5 Tg soot → -1.25°C
 * - 50 Tg soot → -7°C
 * - 150 Tg soot → -15 to -20°C
 * 
 * @param soot - Soot in stratosphere (Tg)
 * @returns Temperature anomaly (negative °C)
 */
function calculateTemperatureAnomaly(soot: number): number {
  if (soot <= 5) {
    return -soot * 0.25;  // Linear: 5 Tg → -1.25°C
  } else if (soot <= 50) {
    return -1.25 - ((soot - 5) * 0.13);  // 50 Tg → -7°C
  } else {
    // Saturation: 150 Tg → -15 to -20°C
    return -7 - Math.min(13, (soot - 50) * 0.13);
  }
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
  // Each degree drop reduces yield by 7% (conservative mid-range)
  const yieldLoss = Math.abs(tempAnomaly) * 0.07;
  return Math.max(0.05, 1.0 - yieldLoss);  // Minimum 5% yield (some crops survive)
}

/**
 * Calculate monthly starvation rate
 * 
 * Research (Robock & Toon 2012):
 * - Peak starvation: Months 6-24 after war
 * - 5% monthly mortality during peak
 * - Gradual decline as crops partially recover
 * 
 * @param cropYield - Crop yield multiplier [0,1]
 * @param monthsSinceWar - Months since nuclear war
 * @returns Monthly starvation rate [0,1]
 */
function calculateStarvationRate(cropYield: number, monthsSinceWar: number): number {
  // Food shortage severity (1 - crop yield)
  const shortage = 1 - cropYield;
  
  // Starvation ramps up over first 6 months (takes time for food stocks to run out)
  let rampMultiplier = 1.0;
  if (monthsSinceWar < 6) {
    rampMultiplier = monthsSinceWar / 6;  // Linear ramp: 0 → 1.0 over 6 months
  }
  
  // Peak starvation: months 6-24
  // After month 24, gradual decline as agriculture partially recovers
  let recoveryMultiplier = 1.0;
  if (monthsSinceWar > 24) {
    // Exponential decay: 50% reduction every 24 months
    recoveryMultiplier = Math.pow(0.5, (monthsSinceWar - 24) / 24);
  }
  
  // Base starvation rate scales with shortage severity
  // Research: 90% crop failure → 5% monthly mortality
  const baseRate = shortage * 0.055;  // 90% shortage → 5% monthly
  
  return baseRate * rampMultiplier * recoveryMultiplier;
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
  winter.currentSoot = winter.currentSoot * (1 - winter.sootDecayRate);
  
  // 2. Update temperature (recovers as soot clears)
  winter.temperatureAnomaly = calculateTemperatureAnomaly(winter.currentSoot);
  
  // 3. Update crop yields (improve as temperature recovers)
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
      addAcuteCrisisDeaths(state, starvationDeaths, 'famine');
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
    addAcuteCrisisDeaths(state, totalRadiationDeaths, 'war');  // Radiation deaths counted as war casualties
    winter.totalRadiationDeaths += totalRadiationDeaths;
  }
  
  // Remove zones with negligible radiation (<1%)
  winter.radiationZones = winter.radiationZones.filter(z => z.currentLevel > 0.01);
}

