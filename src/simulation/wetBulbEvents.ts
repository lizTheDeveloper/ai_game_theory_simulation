/**
 * Wet Bulb Temperature Events System
 *
 * Models extreme heat mortality when combined heat + humidity exceed human thermoregulatory capacity.
 * Research-backed implementation using:
 * - Raymond et al. (2020): 35°C TW = death in 6 hours (TRL 9 - observational data)
 * - Vecellio et al. (2022): Revised thresholds 30.6-31.2°C TW (TRL 8 - controlled experiments)
 * - Mora et al. (2017): Exponential frequency increase with warming (TRL 8 - climate projections)
 * - Stull (2011): Wet bulb temperature calculation formula (accurate within 0.3°C)
 */

import { GameState } from '@/types/game';
import {
  WetBulbTemperatureSystem,
  WetBulbEvent,
  RegionalClimate,
  WetBulbThreshold,
  WET_BULB_CONSTANTS,
  HIGH_RISK_REGIONS,
  MODERATE_RISK_REGIONS,
  LOW_RISK_REGIONS
} from '@/types/wetBulbTemperature';

/**
 * Initialize wet bulb temperature system with 2025 baseline
 *
 * Regional climate data based on:
 * - NOAA Climate Data (2024): Summer temperature/humidity averages
 * - World Bank Population Data (2024): Regional populations
 * - Raymond et al. (2020): Observed wet bulb events in Persian Gulf/South Asia
 */
export function initializeWetBulbTemperatureSystem(): WetBulbTemperatureSystem {
  const regionalClimates: RegionalClimate[] = [
    // HIGH RISK REGIONS (tropical, high humidity, high baseline temperatures)
    {
      region: 'south-asia',
      baselineTemperature: 35,      // °C summer average (India, Pakistan, Bangladesh)
      baselineHumidity: 75,          // % summer humidity
      population: 1900,              // Millions (1.9B people)
      vulnerabilityMultiplier: 1.3,  // High poverty, outdoor labor, limited AC

      // Demographics
      elderlyFraction: 0.08,         // 8% over 65 (younger population)
      povertyFraction: 0.22,         // 22% below poverty line
      outdoorWorkerFraction: 0.42,   // 42% agriculture/construction

      // Adaptation
      airConditioningAccess: 0.12,   // 12% have AC
      coolingCenterAccess: 0.05,     // 5% have cooling center access
      healthcareCapacity: 0.30,      // Limited emergency response
    },
    {
      region: 'middle-east',
      baselineTemperature: 40,       // °C summer average (Persian Gulf, Iraq, Iran)
      baselineHumidity: 65,          // % summer humidity
      population: 400,               // Millions
      vulnerabilityMultiplier: 0.8,  // Wealthy regions have AC, but outdoor workers vulnerable

      elderlyFraction: 0.05,
      povertyFraction: 0.15,
      outdoorWorkerFraction: 0.25,

      airConditioningAccess: 0.65,   // 65% have AC (wealthy)
      coolingCenterAccess: 0.20,
      healthcareCapacity: 0.60,
    },
    {
      region: 'sub-saharan-africa',
      baselineTemperature: 33,       // °C summer average (Sahel, West Africa)
      baselineHumidity: 70,          // % summer humidity
      population: 1200,              // Millions
      vulnerabilityMultiplier: 1.5,  // Highest vulnerability (poverty, limited infrastructure)

      elderlyFraction: 0.04,
      povertyFraction: 0.45,
      outdoorWorkerFraction: 0.60,

      airConditioningAccess: 0.02,   // 2% have AC
      coolingCenterAccess: 0.01,
      healthcareCapacity: 0.15,
    },
    {
      region: 'southeast-asia',
      baselineTemperature: 32,       // °C summer average (Thailand, Vietnam, Indonesia)
      baselineHumidity: 80,          // % summer humidity
      population: 700,               // Millions
      vulnerabilityMultiplier: 1.2,

      elderlyFraction: 0.09,
      povertyFraction: 0.18,
      outdoorWorkerFraction: 0.38,

      airConditioningAccess: 0.25,
      coolingCenterAccess: 0.10,
      healthcareCapacity: 0.45,
    },

    // MODERATE RISK REGIONS
    {
      region: 'mediterranean',
      baselineTemperature: 30,       // °C summer average (Southern Europe, North Africa)
      baselineHumidity: 55,          // % summer humidity
      population: 500,               // Millions
      vulnerabilityMultiplier: 0.7,  // Wealthier, better adapted

      elderlyFraction: 0.20,         // 20% over 65 (aging population - more vulnerable)
      povertyFraction: 0.12,
      outdoorWorkerFraction: 0.15,

      airConditioningAccess: 0.50,
      coolingCenterAccess: 0.30,
      healthcareCapacity: 0.80,
    },
    {
      region: 'southern-us',
      baselineTemperature: 32,       // °C summer average (US South, Texas)
      baselineHumidity: 70,          // % summer humidity
      population: 120,               // Millions
      vulnerabilityMultiplier: 0.6,  // Wealthy, good AC access

      elderlyFraction: 0.17,
      povertyFraction: 0.14,
      outdoorWorkerFraction: 0.10,

      airConditioningAccess: 0.90,   // 90% have AC
      coolingCenterAccess: 0.50,
      healthcareCapacity: 0.90,
    },
    {
      region: 'australia',
      baselineTemperature: 31,       // °C summer average (Northern Australia)
      baselineHumidity: 60,          // % summer humidity
      population: 25,                // Millions
      vulnerabilityMultiplier: 0.5,  // Wealthy, sparse population

      elderlyFraction: 0.16,
      povertyFraction: 0.08,
      outdoorWorkerFraction: 0.08,

      airConditioningAccess: 0.85,
      coolingCenterAccess: 0.40,
      healthcareCapacity: 0.85,
    },

    // LOW RISK REGIONS (cooler climates, lower wet bulb risk)
    {
      region: 'northern-europe',
      baselineTemperature: 22,       // °C summer average (rare heatwaves)
      baselineHumidity: 65,          // % summer humidity
      population: 100,               // Millions
      vulnerabilityMultiplier: 0.3,  // Low risk, but NOT ZERO (2003 heatwave killed 70K)

      elderlyFraction: 0.22,         // High elderly fraction
      povertyFraction: 0.10,
      outdoorWorkerFraction: 0.05,

      airConditioningAccess: 0.40,   // Lower AC penetration (rarely needed)
      coolingCenterAccess: 0.20,
      healthcareCapacity: 0.95,
    },
  ];

  return {
    regionalClimates,
    eventsThisMonth: [],
    totalEventsThisYear: 0,
    totalDeathsThisYear: 0,
    eventHistory: [],
    globalWarmingEffect: 1.0,          // Baseline (no warming yet)
    eventFrequencyMultiplier: 1.0,     // Baseline frequency
    deadlyHeatCrisisActive: false,
    crisisTriggeredAt: null,
    cumulativeDeaths: 0,
    regionsUninhabitable: [],
  };
}

/**
 * Calculate wet bulb temperature from dry bulb temperature and relative humidity
 *
 * Uses Stull (2011) simplified formula (accurate within 0.3°C for TW 25-35°C range).
 *
 * Formula:
 * TW = T * atan[0.151977 * (RH% + 8.313659)^0.5] +
 *      atan(T + RH%) - atan(RH% - 1.676331) +
 *      0.00391838 * (RH%)^1.5 * atan(0.023101 * RH%) - 4.686035
 *
 * Research: Stull (2011) - Journal of Applied Meteorology and Climatology
 *
 * @param dryBulbTemp - Dry bulb temperature in °C
 * @param relativeHumidity - Relative humidity in % (0-100)
 * @returns Wet bulb temperature in °C
 */
export function calculateWetBulbTemperature(
  dryBulbTemp: number,
  relativeHumidity: number
): number {
  const T = dryBulbTemp;
  const RH = relativeHumidity;

  const term1 = T * Math.atan(WET_BULB_CONSTANTS.COEFF_1 * Math.sqrt(RH + WET_BULB_CONSTANTS.COEFF_2));
  const term2 = Math.atan(T + RH);
  const term3 = Math.atan(RH - WET_BULB_CONSTANTS.COEFF_3);
  const term4 = WET_BULB_CONSTANTS.COEFF_4 * Math.pow(RH, 1.5) * Math.atan(WET_BULB_CONSTANTS.COEFF_5 * RH);
  const term5 = WET_BULB_CONSTANTS.COEFF_6;

  const TW = term1 + term2 - term3 + term4 - term5;

  return TW;
}

/**
 * Get mortality threshold parameters for given wet bulb temperature
 *
 * Research-backed thresholds:
 * - 28°C: Moderate (vulnerable populations at risk)
 * - 30°C: High (outdoor work impossible, vulnerable deaths)
 * - 32°C: Severe (outdoor exposure lethal within 12 hours)
 * - 35°C: Extreme (universal human limit, death in 6 hours)
 *
 * Based on Vecellio et al. (2022) and Raymond et al. (2020)
 */
export function getWetBulbThreshold(wetBulbTemp: number): WetBulbThreshold | null {
  if (wetBulbTemp >= WET_BULB_CONSTANTS.EXTREME_THRESHOLD) {
    return {
      temperature: WET_BULB_CONSTANTS.EXTREME_THRESHOLD,
      severity: 'extreme',
      exposureFraction: 0.80,  // 80% exposed (outdoor workers, poor, homeless)
      mortalityRate: 0.15,     // 15% of exposed die (some find cooling)
      duration: 6,             // Hours to death
      description: 'EXTREME: Universal human limit exceeded - death in 6 hours even with hydration',
    };
  } else if (wetBulbTemp >= WET_BULB_CONSTANTS.SEVERE_THRESHOLD) {
    return {
      temperature: WET_BULB_CONSTANTS.SEVERE_THRESHOLD,
      severity: 'severe',
      exposureFraction: 0.50,  // 50% exposed (outdoor workers, elderly, poor)
      mortalityRate: 0.08,     // 8% of exposed die
      duration: 12,            // Hours to death
      description: 'SEVERE: Outdoor work impossible - vulnerable populations at high risk',
    };
  } else if (wetBulbTemp >= WET_BULB_CONSTANTS.HIGH_THRESHOLD) {
    return {
      temperature: WET_BULB_CONSTANTS.HIGH_THRESHOLD,
      severity: 'high',
      exposureFraction: 0.25,  // 25% exposed (elderly, outdoor workers)
      mortalityRate: 0.03,     // 3% of exposed die
      duration: 24,            // Hours to death
      description: 'HIGH: Vulnerable populations (elderly, sick, poor) at significant risk',
    };
  } else if (wetBulbTemp >= WET_BULB_CONSTANTS.MODERATE_THRESHOLD) {
    return {
      temperature: WET_BULB_CONSTANTS.MODERATE_THRESHOLD,
      severity: 'moderate',
      exposureFraction: 0.10,  // 10% exposed (very elderly, sick)
      mortalityRate: 0.01,     // 1% of exposed die
      duration: 48,            // Hours to death
      description: 'MODERATE: Heat stress - some vulnerable deaths',
    };
  }

  return null; // Below deadly threshold
}

/**
 * Calculate socioeconomic vulnerability multiplier
 *
 * Poor, elderly, and outdoor workers disproportionately affected by extreme heat.
 * Research: Mora et al. (2017), WHO heat-health guidelines (2018)
 *
 * @returns Multiplier [1.0, 2.0] for mortality rate
 */
export function calculateSocioeconomicVulnerability(
  regionalClimate: RegionalClimate
): number {
  const elderlyEffect = regionalClimate.elderlyFraction * 0.5;     // Up to +0.15 (30% of population → +15%)
  const povertyEffect = regionalClimate.povertyFraction * 0.7;     // Up to +0.35 (50% poverty → +35%)
  const workerEffect = regionalClimate.outdoorWorkerFraction * 0.4; // Up to +0.16 (40% workers → +16%)

  // Total vulnerability: 1.0 baseline + effects = 1.0 to 1.66
  const vulnerability = 1.0 + elderlyEffect + povertyEffect + workerEffect;

  // Adaptation capacity reduces vulnerability
  const adaptationReduction = (
    regionalClimate.airConditioningAccess * 0.3 +
    regionalClimate.coolingCenterAccess * 0.1 +
    regionalClimate.healthcareCapacity * 0.1
  ); // Up to -0.5

  return Math.max(1.0, vulnerability - adaptationReduction);
}

/**
 * Calculate event frequency multiplier based on global warming
 *
 * Research: Mora et al. (2017) - exponential increase in deadly heat days
 * - Base frequency: 0.2% per month per region (2025 baseline)
 * - Frequency grows 5% per 0.1°C warming
 * - Saturates at 30% per month (extreme warming scenario)
 *
 * @param temperatureAnomaly - Global temperature increase above pre-industrial (°C)
 * @returns Frequency multiplier [1.0, 15.0]
 */
export function calculateEventFrequencyMultiplier(temperatureAnomaly: number): number {
  // Exponential growth: frequency = baseline * (1 + growthRate)^warming
  // 5% growth per 0.1°C = 1.05^(warming / 0.1)
  const baseMultiplier = Math.pow(
    1 + WET_BULB_CONSTANTS.FREQUENCY_GROWTH_RATE,
    temperatureAnomaly / 0.1
  );

  // Cap at 15x baseline (30% monthly chance vs 2% baseline)
  return Math.min(15.0, baseMultiplier);
}

/**
 * Update wet bulb temperature system each month
 *
 * - Calculate regional temperatures from global warming
 * - Stochastically generate heat events
 * - Apply mortality based on thresholds
 * - Track cumulative impacts
 */
export function updateWetBulbTemperatureSystem(
  state: GameState,
  rng: () => number
): void {
  const system = state.wetBulbTemperatureSystem;
  const resources = state.resourceEconomy;

  // Get global temperature anomaly from CO2 system
  const temperatureAnomaly = resources?.co2?.temperatureAnomaly ?? 0;

  // Update global warming effect (for habitability calculations)
  system.globalWarmingEffect = 1.0 + (temperatureAnomaly / 2.0); // 1.0 → 3.0 at +4°C

  // Update event frequency multiplier (exponential with warming)
  system.eventFrequencyMultiplier = calculateEventFrequencyMultiplier(temperatureAnomaly);

  // Clear this month's events
  system.eventsThisMonth = [];

  // Stochastically generate heat events for each region
  for (const regionalClimate of system.regionalClimates) {
    // Base probability: 0.2% per month per region (2025 baseline)
    // Multiplied by frequency multiplier (exponential with warming)
    const eventProbability = WET_BULB_CONSTANTS.BASE_FREQUENCY_2025 * system.eventFrequencyMultiplier;

    // Stochastic event trigger
    if (rng() < eventProbability) {
      // Calculate regional temperature: baseline + global anomaly
      const regionalTemp = regionalClimate.baselineTemperature + temperatureAnomaly;

      // Add random variation (±3°C for heatwave intensity)
      const heatwaveIntensity = (rng() - 0.5) * 6; // -3°C to +3°C
      const dryBulbTemp = regionalTemp + heatwaveIntensity;

      // Add random variation to humidity (±10%)
      const humidityVariation = (rng() - 0.5) * 20; // -10% to +10%
      const relativeHumidity = Math.max(0, Math.min(100,
        regionalClimate.baselineHumidity + humidityVariation
      ));

      // Calculate wet bulb temperature
      const wetBulbTemp = calculateWetBulbTemperature(dryBulbTemp, relativeHumidity);

      // Get threshold parameters
      const threshold = getWetBulbThreshold(wetBulbTemp);

      if (threshold) {
        // Event duration: 3-7 days typical (Im et al. 2017)
        const durationDays = Math.floor(3 + rng() * 5); // 3-7 days
        const durationHours = durationDays * 24;

        // Calculate socioeconomic vulnerability
        const socioeconomicVulnerability = calculateSocioeconomicVulnerability(regionalClimate);

        // Apply regional vulnerability multiplier
        const adjustedMortalityRate = threshold.mortalityRate *
          regionalClimate.vulnerabilityMultiplier *
          socioeconomicVulnerability;

        // Calculate exposed population
        const exposedPopulation = regionalClimate.population * threshold.exposureFraction;

        // Calculate deaths
        const deaths = exposedPopulation * adjustedMortalityRate; // Millions

        // Create event
        const event: WetBulbEvent = {
          month: state.currentMonth,
          region: regionalClimate.region,
          wetBulbTemp,
          dryBulbTemp,
          relativeHumidity,
          exposedPopulation,
          exposureFraction: threshold.exposureFraction,
          mortalityRate: adjustedMortalityRate,
          deaths,
          duration: durationHours,
          severity: threshold.severity,
          socioeconomicVulnerability,
        };

        system.eventsThisMonth.push(event);

        // Apply mortality to population
        applyWetBulbMortality(state, event);

        // Log significant events
        if (deaths > 0.01 || threshold.severity === 'extreme') {
          console.log(`\n🌡️ DEADLY HEAT EVENT: ${regionalClimate.region} (Month ${state.currentMonth})`);
          console.log(`   Wet bulb temp: ${wetBulbTemp.toFixed(1)}°C (dry: ${dryBulbTemp.toFixed(1)}°C, humidity: ${relativeHumidity.toFixed(0)}%)`);
          console.log(`   Severity: ${threshold.severity.toUpperCase()}`);
          console.log(`   Exposed: ${exposedPopulation.toFixed(1)}M people`);
          console.log(`   Deaths: ${(deaths * 1_000_000).toFixed(0)} (${(adjustedMortalityRate * 100).toFixed(1)}% mortality)`);
          console.log(`   Duration: ${durationDays} days`);
        }
      }
    }
  }

  // Update annual totals
  system.totalEventsThisYear += system.eventsThisMonth.length;
  const monthlyDeaths = system.eventsThisMonth.reduce((sum, e) => sum + e.deaths, 0);
  system.totalDeathsThisYear += monthlyDeaths;
  system.cumulativeDeaths += monthlyDeaths;

  // Reset annual counters at year end
  if (state.currentMonth % 12 === 0 && state.currentMonth > 0) {
    // Log annual summary
    if (system.totalEventsThisYear > 0) {
      console.log(`\n🌡️ ANNUAL HEAT MORTALITY SUMMARY (Year ${Math.floor(state.currentMonth / 12)})`);
      console.log(`   Events: ${system.totalEventsThisYear}`);
      console.log(`   Deaths: ${(system.totalDeathsThisYear * 1_000_000).toFixed(0)}`);
      console.log(`   Global warming: +${temperatureAnomaly.toFixed(2)}°C`);
      console.log(`   Event frequency: ${system.eventFrequencyMultiplier.toFixed(1)}x baseline`);
    }

    // Reset counters
    system.totalEventsThisYear = 0;
    system.totalDeathsThisYear = 0;
  }

  // Track event history
  if (system.eventsThisMonth.length > 0) {
    const maxWetBulbTemp = Math.max(...system.eventsThisMonth.map(e => e.wetBulbTemp));
    system.eventHistory.push({
      month: state.currentMonth,
      eventCount: system.eventsThisMonth.length,
      totalDeaths: monthlyDeaths,
      maxWetBulbTemp,
    });
  }

  // Check for deadly heat crisis (sustained high mortality)
  if (!system.deadlyHeatCrisisActive && system.cumulativeDeaths > 10) { // 10M+ deaths
    system.deadlyHeatCrisisActive = true;
    system.crisisTriggeredAt = state.currentMonth;

    console.log(`\n⚠️ DEADLY HEAT CRISIS TRIGGERED (Month ${state.currentMonth})`);
    console.log(`   Cumulative deaths: ${(system.cumulativeDeaths * 1_000_000).toFixed(0)}`);
    console.log(`   Global warming: +${temperatureAnomaly.toFixed(2)}°C`);
    console.log(`   Event frequency: ${system.eventFrequencyMultiplier.toFixed(1)}x baseline`);

    state.eventLog.push({
      type: 'crisis',
      month: state.currentMonth,
      description: `Deadly Heat Crisis: ${(system.cumulativeDeaths * 1_000_000).toFixed(0)} deaths from extreme wet bulb events`,
      impact: `Event frequency ${system.eventFrequencyMultiplier.toFixed(1)}x baseline, warming +${temperatureAnomaly.toFixed(2)}°C`,
    });
  }

  // Check for uninhabitable regions (sustained TW > 32°C)
  for (const regionalClimate of system.regionalClimates) {
    const regionalTemp = regionalClimate.baselineTemperature + temperatureAnomaly;
    const wetBulbTemp = calculateWetBulbTemperature(regionalTemp, regionalClimate.baselineHumidity);

    if (wetBulbTemp > 32 && !system.regionsUninhabitable.includes(regionalClimate.region)) {
      system.regionsUninhabitable.push(regionalClimate.region);

      console.log(`\n🚨 REGION UNINHABITABLE: ${regionalClimate.region}`);
      console.log(`   Sustained wet bulb: ${wetBulbTemp.toFixed(1)}°C (threshold: 32°C)`);
      console.log(`   Population affected: ${regionalClimate.population.toFixed(0)}M`);
      console.log(`   Migration crisis likely`);
    }
  }
}

/**
 * Apply mortality from wet bulb event to population
 *
 * Uses population dynamics system to apply deaths.
 */
function applyWetBulbMortality(state: GameState, event: WetBulbEvent): void {
  if (event.deaths <= 0) return;

  // Convert deaths from millions to billions
  const deathsInBillions = event.deaths / 1000;

  // Apply to population
  const population = state.humanPopulationSystem;
  population.population = Math.max(0, population.population - deathsInBillions);

  // Add to monthly deaths tracking
  if (!population.monthlyDeaths) {
    population.monthlyDeaths = deathsInBillions;
  } else {
    population.monthlyDeaths += deathsInBillions;
  }

  // Add to death cause tracking
  if (!population.deathsByType) {
    population.deathsByType = {} as any;
  }
  const heatDeaths = (population.deathsByType as any).heat || 0;
  (population.deathsByType as any).heat = heatDeaths + deathsInBillions;

  // MULTI-DIMENSIONAL TRACKING (Oct 18, 2025)
  // PROXIMATE CAUSE: Heat waves/floods are "disasters"
  population.deathsByCategory.disasters += deathsInBillions;
  // ROOT CAUSE: Heat waves are climate-driven
  population.deathsByRootCause.climateChange += deathsInBillions;
}
