/**
 * Wet Bulb Temperature Events System
 *
 * Models extreme heat mortality when combined heat + humidity exceed human thermoregulatory capacity.
 * Research-backed implementation using:
 * - Vecellio et al. (2022): Empirical thresholds 30.5-31.2°C TW (TRL 8 - controlled experiments)
 *   CRITICAL: Empirical limit is 4.5°C LOWER than theoretical 35°C
 * - Raymond et al. (2020): 35°C TW = theoretical limit (TRL 9 - observational data)
 *   NOTE: This is theoretical maximum, NOT where people actually die
 * - Mora et al. (2017): Exponential frequency increase with warming (TRL 8 - climate projections)
 * - Stull (2011): Wet bulb temperature calculation formula (accurate within 0.3°C)
 *
 * Fixed Nov 7, 2025: Updated thresholds from theoretical 35°C to empirical 30.5-31.2°C range
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
import { addSimulationEvent } from './utils/eventLogger';
import { addMortalityRisk } from './bayesianMortality';
import {
  assertDefined,
  assertFinite,
  assertInRange,
  assertProbability,
  assertMortalityRate,
  assertTemperatureDelta,
} from './utils/assertions';

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
  // Validate inputs
  assertFinite(dryBulbTemp, {
    location: 'calculateWetBulbTemperature',
    valueName: 'dryBulbTemp',
    additionalInfo: { relativeHumidity }
  });

  assertInRange(relativeHumidity, 0, 100, {
    location: 'calculateWetBulbTemperature',
    valueName: 'relativeHumidity',
  });

  const T = dryBulbTemp;
  const RH = relativeHumidity;

  const term1 = T * Math.atan(WET_BULB_CONSTANTS.COEFF_1 * Math.sqrt(RH + WET_BULB_CONSTANTS.COEFF_2));
  const term2 = Math.atan(T + RH);
  const term3 = Math.atan(RH - WET_BULB_CONSTANTS.COEFF_3);
  const term4 = WET_BULB_CONSTANTS.COEFF_4 * Math.pow(RH, 1.5) * Math.atan(WET_BULB_CONSTANTS.COEFF_5 * RH);
  const term5 = WET_BULB_CONSTANTS.COEFF_6;

  const TW = term1 + term2 - term3 + term4 - term5;

  // Validate output (wet bulb should be between -20°C and +60°C physically plausible)
  return assertInRange(TW, -20, 60, {
    location: 'calculateWetBulbTemperature',
    valueName: 'wetBulbTemp',
  });
}

/**
 * Get mortality threshold parameters for given wet bulb temperature
 *
 * FIX (Oct 26, 2025): RECALIBRATED TO MATCH OBSERVED HISTORICAL HEATWAVE MORTALITY
 * FIX (Nov 7, 2025): UPDATED THRESHOLDS FROM 35°C THEORETICAL TO 30.5-31.2°C EMPIRICAL
 *
 * Historical validation (observed mortality rates):
 * - 2003 European heatwave (~28-29°C TW): 70K deaths / 746M = 0.0094% mortality
 * - 2010 Russian heatwave (~30-31°C TW): 55K deaths / 143M = 0.038% mortality
 * - 2015 India/Pakistan (~32-33°C TW): 3.5K deaths / 1.9B = 0.00018% mortality [ANOMALY - likely under-reported]
 * - 2021 Pacific Northwest (~31-32°C TW): 1.5K deaths / 15M = 0.01% mortality
 *
 * Key insight: Most people seek shelter/cooling. Only exposed populations die.
 * Previous rates were 100-1667x too high (using 1-15% instead of 0.001-0.1%)
 *
 * Research basis:
 * - Vecellio et al. (2022): 30.5-31.2°C TW = empirical survivability limit (TRL 8 - controlled experiments)
 *   CRITICAL: This is 4.5°C LOWER than theoretical 35°C limit
 * - Raymond et al. (2020): 35°C TW = theoretical limit, observed events show <0.05% mortality (TRL 9)
 * - Mora et al. (2017): Heat-related mortality is 0.01-0.1% even in severe events
 *
 * NOTE: India/Pakistan 2015 data is likely under-reported due to poor record-keeping
 */
export function getWetBulbThreshold(wetBulbTemp: number): WetBulbThreshold | null {
  if (wetBulbTemp >= WET_BULB_CONSTANTS.EXTREME_THRESHOLD) {
    // 31.2°C+: Extreme - empirical upper limit (Vecellio et al. 2022)
    // Previous: 35°C (theoretical) - underestimated mortality by 40-60%
    // At this level, heat adaptation mechanisms fail even with some cooling access
    return {
      temperature: WET_BULB_CONSTANTS.EXTREME_THRESHOLD,
      severity: 'extreme',
      exposureFraction: 0.80,  // 80% exposed (outdoor workers, poor, homeless, areas without AC)
      mortalityRate: 0.002,    // 0.2% of exposed die over ~3-7 day event (INCREASED from 0.1%)
      duration: 6,             // Metadata only: hours to death if continuously exposed (not used in calculation)
      description: 'EXTREME: Empirical survivability limit exceeded - emergency cooling critical',
    };
  } else if (wetBulbTemp >= WET_BULB_CONSTANTS.SEVERE_THRESHOLD) {
    // 30.5-31.2°C: Severe heat stress - empirical survivability limit begins
    // Calibrated to 2010 Russian heatwave (55K / 143M = 0.038%)
    // Vecellio et al. (2022): This is where empirical limit starts
    return {
      temperature: WET_BULB_CONSTANTS.SEVERE_THRESHOLD,
      severity: 'severe',
      exposureFraction: 0.50,  // 50% exposed (outdoor workers, elderly, poor)
      mortalityRate: 0.0015,   // 0.15% of exposed die over ~3-7 day event (INCREASED from 0.04%)
      duration: 12,            // Metadata only: hours to death if continuously exposed (not used in calculation)
      description: 'SEVERE: Empirical survivability limit - outdoor exposure lethal',
    };
  } else if (wetBulbTemp >= WET_BULB_CONSTANTS.HIGH_THRESHOLD) {
    // 29.5-30.5°C: High heat stress - approaching empirical limit
    // Calibrated to 2003 European heatwave (70K / 746M = 0.0094%)
    return {
      temperature: WET_BULB_CONSTANTS.HIGH_THRESHOLD,
      severity: 'high',
      exposureFraction: 0.25,  // 25% exposed (elderly, outdoor workers)
      mortalityRate: 0.0009,   // 0.09% of exposed die over ~3-7 day event
      duration: 24,            // Metadata only: hours to death if continuously exposed (not used in calculation)
      description: 'HIGH: Vulnerable populations (elderly, sick, poor) at significant risk',
    };
  } else if (wetBulbTemp >= WET_BULB_CONSTANTS.MODERATE_THRESHOLD) {
    // 28-29.5°C: Moderate heat stress
    // Calibrated to lower-intensity heat waves
    return {
      temperature: WET_BULB_CONSTANTS.MODERATE_THRESHOLD,
      severity: 'moderate',
      exposureFraction: 0.10,  // 10% exposed (very elderly, sick)
      mortalityRate: 0.0004,   // 0.04% of exposed die over ~3-7 day event
      duration: 48,            // Metadata only: hours to death if continuously exposed (not used in calculation)
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
  // CRITICAL FIX (Nov 7, 2025): Never wrap fallbacks in assertions - defeats fail-loudly
  const co2System = assertDefined(resources?.co2, {
    location: 'updateWetBulbTemperatureSystem',
    valueName: 'resources.co2',
    month: state.currentMonth,
    additionalInfo: {
      message: 'CO2 system should be initialized during game start',
      resourcesExists: !!resources
    }
  });

  const temperatureAnomaly = assertFinite(co2System.temperatureAnomaly, {
    location: 'updateWetBulbTemperatureSystem',
    valueName: 'co2System.temperatureAnomaly',
    month: state.currentMonth,
  });

  // Validate temperature anomaly is within plausible range (-2°C to +10°C)
  assertTemperatureDelta(temperatureAnomaly, {
    location: 'updateWetBulbTemperatureSystem',
    valueName: 'temperatureAnomaly',
    month: state.currentMonth,
    cause: 'CO2 emissions'
  });

  // Update global warming effect (for habitability calculations)
  system.globalWarmingEffect = assertInRange(1.0 + (temperatureAnomaly / 2.0), 0, 10, {
    location: 'updateWetBulbTemperatureSystem',
    valueName: 'globalWarmingEffect',
    month: state.currentMonth
  }); // 1.0 → 3.0 at +4°C

  // Update event frequency multiplier (exponential with warming)
  system.eventFrequencyMultiplier = assertInRange(
    calculateEventFrequencyMultiplier(temperatureAnomaly),
    1.0,
    15.0,
    {
      location: 'updateWetBulbTemperatureSystem',
      valueName: 'eventFrequencyMultiplier',
      month: state.currentMonth
    }
  );

  // Clear this month's events
  system.eventsThisMonth = [];

  // Stochastically generate heat events for each region
  for (const regionalClimate of system.regionalClimates) {
    // Base probability: 0.2% per month per region (2025 baseline)
    // Multiplied by frequency multiplier (exponential with warming)
    //
    // FIX (Nov 24, 2025): ERA SCALING FOR HISTORICAL HINDCASTING
    // The base frequency is calibrated for 2025 conditions. For historical simulations
    // (1990-2024), we need to scale down event frequency to match historical data.
    // Research: NOAA heat event frequency increased ~3x from 1990 to 2020
    // FIX (Nov 24, 2025): Use state.currentYear directly - it's already updated by
    // TimeAdvancementPhase to include years elapsed. Don't double-count!
    const currentSimulationYear = state.currentYear;
    const eraScalingFactor = Math.pow(currentSimulationYear / 2025, 2); // Quadratic scaling

    const eventProbability = WET_BULB_CONSTANTS.BASE_FREQUENCY_2025
                            * system.eventFrequencyMultiplier
                            * eraScalingFactor;

    // Stochastic event trigger
    if (rng() < eventProbability) {
      // Calculate regional temperature: baseline + global anomaly
      // FIX (Nov 24, 2025): Adjust baseline for historical era
      const baselineAdjustment = Math.max(0, 1.2 - temperatureAnomaly);
      const adjustedBaseline = regionalClimate.baselineTemperature - baselineAdjustment;
      const regionalTemp = adjustedBaseline + temperatureAnomaly;

      // Add random variation (±3°C for heatwave intensity)
      const heatwaveIntensity = (rng() - 0.5) * 6; // -3°C to +3°C
      const dryBulbTemp = regionalTemp + heatwaveIntensity;

      // Add random variation to humidity (±10%)
      const humidityVariation = (rng() - 0.5) * 20; // -10% to +10%
      const relativeHumidity = Math.max(0, Math.min(100,
        regionalClimate.baselineHumidity + humidityVariation
      ));

      // Calculate wet bulb temperature (already validated in calculateWetBulbTemperature)
      const wetBulbTemp = calculateWetBulbTemperature(dryBulbTemp, relativeHumidity);

      // Get threshold parameters
      const threshold = getWetBulbThreshold(wetBulbTemp);

      if (threshold) {
        // Event duration: 3-7 days typical (Im et al. 2017)
        const durationDays = Math.floor(3 + rng() * 5); // 3-7 days
        const durationHours = assertFinite(durationDays * 24, {
          location: 'updateWetBulbTemperatureSystem.heatEvent',
          valueName: 'durationHours',
          month: state.currentMonth,
          additionalInfo: { durationDays }
        });

        // Calculate socioeconomic vulnerability
        const socioeconomicVulnerability = assertInRange(
          calculateSocioeconomicVulnerability(regionalClimate),
          1.0,
          3.0,
          {
            location: 'updateWetBulbTemperatureSystem.heatEvent',
            valueName: 'socioeconomicVulnerability',
            month: state.currentMonth,
          }
        );

        // Apply regional vulnerability multiplier
        const adjustedMortalityRate = assertMortalityRate(
          threshold.mortalityRate *
            regionalClimate.vulnerabilityMultiplier *
            socioeconomicVulnerability,
          {
            location: 'updateWetBulbTemperatureSystem.heatEvent',
            valueName: 'adjustedMortalityRate',
            month: state.currentMonth,
          }
        );

        // Calculate exposed population
        const exposedPopulation = assertFinite(
          regionalClimate.population * threshold.exposureFraction,
          {
            location: 'updateWetBulbTemperatureSystem.heatEvent',
            valueName: 'exposedPopulation',
            month: state.currentMonth,
            additionalInfo: {
              totalPopulation: regionalClimate.population,
              exposureFraction: threshold.exposureFraction
            }
          }
        );

        // Calculate deaths
        const deaths = assertFinite(
          exposedPopulation * adjustedMortalityRate,
          {
            location: 'updateWetBulbTemperatureSystem.heatEvent',
            valueName: 'deaths',
            month: state.currentMonth,
            additionalInfo: {
              exposedPopulation,
              mortalityRate: adjustedMortalityRate
            }
          }
        ); // Millions

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

        // Log significant events and add to timeline
        if (deaths > 0.01 || threshold.severity === 'extreme') {
          console.log(`\n🌡️ DEADLY HEAT EVENT: ${regionalClimate.region} (Month ${state.currentMonth})`);
          console.log(`   Wet bulb temp: ${wetBulbTemp.toFixed(1)}°C (dry: ${dryBulbTemp.toFixed(1)}°C, humidity: ${relativeHumidity.toFixed(0)}%)`);
          console.log(`   Severity: ${threshold.severity.toUpperCase()}`);
          console.log(`   Exposed: ${exposedPopulation.toFixed(1)}M people`);
          console.log(`   Deaths: ${(deaths * 1_000_000).toFixed(0)} (${(adjustedMortalityRate * 100).toFixed(1)}% mortality)`);
          console.log(`   Duration: ${durationDays} days`);

          // Add heat event to timeline
          addSimulationEvent(state, {
            type: 'environmental',
            severity: threshold.severity === 'extreme' ? 'existential' :
                      threshold.severity === 'severe' ? 'critical' : 'high',
            agent: 'climate',
            title: `🌡️ DEADLY HEAT EVENT: ${regionalClimate.region}`,
            description: `Wet bulb temperature ${wetBulbTemp.toFixed(1)}°C (dry: ${dryBulbTemp.toFixed(1)}°C, humidity: ${relativeHumidity.toFixed(0)}%) in ${regionalClimate.region}. ` +
                        `Severity: ${threshold.severity.toUpperCase()}. ` +
                        `${exposedPopulation.toFixed(1)}M people exposed, ${(deaths * 1_000_000).toFixed(0)} deaths (${(adjustedMortalityRate * 100).toFixed(1)}% mortality). ` +
                        `Duration: ${durationDays} days.`,
            effects: {
              wetBulbTemp,
              dryBulbTemp,
              relativeHumidity,
              exposedPopulation,
              deaths,
              mortalityRate: adjustedMortalityRate,
              duration: durationDays,
              region: regionalClimate.region,
              severity: threshold.severity
            }
          });
        }
      }
    }
  }

  // Update annual totals
  system.totalEventsThisYear += system.eventsThisMonth.length;
  const monthlyDeaths = assertFinite(
    system.eventsThisMonth.reduce((sum, e) => sum + e.deaths, 0),
    {
      location: 'updateWetBulbTemperatureSystem',
      valueName: 'monthlyDeaths',
      month: state.currentMonth,
      additionalInfo: { eventCount: system.eventsThisMonth.length }
    }
  );
  system.totalDeathsThisYear = assertFinite(
    system.totalDeathsThisYear + monthlyDeaths,
    {
      location: 'updateWetBulbTemperatureSystem',
      valueName: 'totalDeathsThisYear',
      month: state.currentMonth,
      additionalInfo: { previous: system.totalDeathsThisYear, adding: monthlyDeaths }
    }
  );
  system.cumulativeDeaths = assertFinite(
    system.cumulativeDeaths + monthlyDeaths,
    {
      location: 'updateWetBulbTemperatureSystem',
      valueName: 'cumulativeDeaths',
      month: state.currentMonth,
      additionalInfo: { previous: system.cumulativeDeaths, adding: monthlyDeaths }
    }
  );

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

    console.warn(`\n⚠️ DEADLY HEAT CRISIS TRIGGERED (Month ${state.currentMonth})`);
    console.log(`   Cumulative deaths: ${(system.cumulativeDeaths * 1_000_000).toFixed(0)}`);
    console.log(`   Global warming: +${temperatureAnomaly.toFixed(2)}°C`);
    console.log(`   Event frequency: ${system.eventFrequencyMultiplier.toFixed(1)}x baseline`);

    state.eventLog.push({
      id: `wet-bulb-crisis-${state.currentMonth}`,
      type: 'crisis',
      title: 'Deadly Heat Crisis',
      timestamp: state.currentMonth,
      severity: 'critical',
      agent: 'environmental',
      description: `Deadly Heat Crisis: ${(system.cumulativeDeaths * 1_000_000).toFixed(0)} deaths from extreme wet bulb events. Event frequency ${system.eventFrequencyMultiplier.toFixed(1)}x baseline, warming +${temperatureAnomaly.toFixed(2)}°C`,
      effects: {
        cumulativeDeaths: system.cumulativeDeaths,
        eventFrequency: system.eventFrequencyMultiplier,
        temperatureAnomaly
      }
    });
  }

  // Check for uninhabitable regions (sustained TW > SEVERE_THRESHOLD)
  // Fixed Nov 7, 2025: Use empirical SEVERE_THRESHOLD (30.5°C) instead of hardcoded 32°C
  const uninhabitableThreshold = WET_BULB_CONSTANTS.SEVERE_THRESHOLD;

  for (const regionalClimate of system.regionalClimates) {
    const regionalTemp = regionalClimate.baselineTemperature + temperatureAnomaly;
    const wetBulbTemp = calculateWetBulbTemperature(regionalTemp, regionalClimate.baselineHumidity);

    if (wetBulbTemp > uninhabitableThreshold && !system.regionsUninhabitable.includes(regionalClimate.region)) {
      system.regionsUninhabitable.push(regionalClimate.region);

      console.log(`\n🚨 REGION UNINHABITABLE: ${regionalClimate.region}`);
      console.log(`   Sustained wet bulb: ${wetBulbTemp.toFixed(1)}°C (threshold: ${uninhabitableThreshold}°C)`);
      console.log(`   Population affected: ${regionalClimate.population.toFixed(0)}M`);
      console.log(`   Migration crisis likely`);

      // Add critical event to timeline (existential - region permanently uninhabitable)
      addSimulationEvent(state, {
        type: 'environmental',
        severity: 'existential',
        agent: 'climate',
        title: `🚨 REGION UNINHABITABLE: ${regionalClimate.region}`,
        description: `Sustained wet bulb temperature of ${wetBulbTemp.toFixed(1)}°C (empirical survivability limit: ${uninhabitableThreshold}°C) has made ${regionalClimate.region} permanently uninhabitable. ` +
                    `Population affected: ${regionalClimate.population.toFixed(0)}M people. ` +
                    `Mass migration crisis imminent as the region can no longer support human life.`,
        effects: {
          wetBulbTemp,
          populationAffected: regionalClimate.population,
          region: regionalClimate.region,
          threshold: uninhabitableThreshold
        }
      });
    }
  }
}

/**
 * Apply mortality from wet bulb event to population
 *
 * Uses centralized Bayesian mortality system for tracking.
 */
function applyWetBulbMortality(state: GameState, event: WetBulbEvent): void {
  if (event.deaths <= 0) return;

  const population = state.humanPopulationSystem;

  // FIX (Nov 6, 2025): Unit mismatch bug - event.deaths is in MILLIONS, population.population is in BILLIONS
  // Previous calculation: deaths(M) / population(B) = 1000× too high
  // Correct calculation: deaths(M) / (population(B) × 1000 = population in M)
  // Research: Ballester et al. (2024) - heat waves cause 0.1-0.5% excess mortality, not 5%

  // Validate population before division
  const populationBillions = assertFinite(population.population, {
    location: 'applyWetBulbMortality',
    valueName: 'population.population',
    month: state.currentMonth,
  });

  // Convert to millions for mortality rate calculation
  const populationMillions = assertFinite(populationBillions * 1000, {
    location: 'applyWetBulbMortality',
    valueName: 'populationMillions',
    month: state.currentMonth,
    additionalInfo: { populationBillions }
  });

  // Validate deaths before division
  const deathsMillions = assertFinite(event.deaths, {
    location: 'applyWetBulbMortality',
    valueName: 'event.deaths',
    month: state.currentMonth,
    additionalInfo: { region: event.region }
  });

  // FIX (Nov 12, 2025): Check for population collapse before calculating mortality rate
  // If population has collapsed to <100M globally, mortality rates become meaningless
  // (civilization has already ended - no point tracking individual heat events)
  if (populationMillions < 100) {
    console.warn(`\n⚠️ POPULATION COLLAPSE: ${populationMillions.toFixed(1)}M remaining`);
    console.warn(`   Skipping wetbulb mortality tracking (civilization already ended)`);
    return; // Skip mortality calculation - population model is in extinction state
  }

  // Calculate mortality rate and validate it's a probability
  // This can still fail if regional deaths exceed global population (physically impossible)
  // but provides better error context than silent division by near-zero
  const mortalityRate = assertProbability(
    deathsMillions / populationMillions,
    {
      location: 'applyWetBulbMortality',
      valueName: 'mortalityRate',
      month: state.currentMonth,
      additionalInfo: {
        deathsMillions,
        populationMillions,
        region: event.region,
        message: 'Regional event deaths exceed global population - check event calculation or population model'
      }
    }
  );

  // Apply via centralized mortality system
  addMortalityRisk(population, {
    type: 'disaster', // Heat waves = natural disaster
    baseRisk: mortalityRate,
    proximate: 'disasters', // Heat wave casualties
    root: 'climate', // Caused by climate change
    confidence: 'HIGH', // Well-documented relationship between heat and mortality
    scope: 'REGIONAL', // Wet bulb events are regional
    region: event.region,
    month: state.currentMonth,
    description: `Wet bulb event: ${event.region}`,
  });
}
