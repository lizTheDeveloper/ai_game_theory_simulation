/**
 * Wet Bulb Temperature System (TIER: Medium Priority - Climate Mortality Realism)
 *
 * Models extreme heat mortality when combined heat + humidity exceed human thermoregulatory capacity.
 * Critical threshold: 35°C wet bulb = death in 6 hours even for healthy individuals.
 *
 * Research backing:
 * - Raymond et al. (2020): 35°C TW = 6-hour death threshold, already observed in Persian Gulf/South Asia (TRL 9)
 * - Vecellio et al. (2022): Revised thresholds 30.6-31.2°C TW for young/elderly (TRL 8)
 * - Mora et al. (2017): Deadly heat exposure increasing exponentially, 74% population exposed by 2100 (TRL 8)
 * - Im et al. (2017): 3-7 day heatwave durations, exponential frequency increase 2030-2070
 *
 * @see /plans/wet-bulb-temperature-plan.md
 */

/**
 * Wet Bulb Temperature Event
 *
 * Represents a deadly heat event in a region where wet bulb temperature exceeds survival thresholds.
 * Mortality depends on threshold severity, duration, and population vulnerability.
 */
export interface WetBulbEvent {
  month: number;                       // When event occurred
  region: string;                      // Geographic region affected
  wetBulbTemp: number;                 // [25, 40] °C wet bulb temperature
  dryBulbTemp: number;                 // [30, 50] °C dry bulb temperature
  relativeHumidity: number;            // [0, 100] % relative humidity

  // === POPULATION IMPACT ===
  exposedPopulation: number;           // Millions of people exposed
  exposureFraction: number;            // [0, 1] Fraction of region exposed (outdoor workers, poor, homeless)
  mortalityRate: number;               // [0, 0.15] Fraction of exposed who die
  deaths: number;                      // Absolute deaths from this event

  // === EVENT CHARACTERISTICS ===
  duration: number;                    // [6, 168] Hours of exposure (6h to 7 days)
  severity: 'moderate' | 'high' | 'severe' | 'extreme'; // TW threshold category
  socioeconomicVulnerability: number;  // [1.0, 2.0] Multiplier for poor/elderly/workers
}

/**
 * Regional Climate Profile
 *
 * Baseline climate data for wet bulb calculations.
 * Regions with high baseline temperature + humidity are most vulnerable.
 */
export interface RegionalClimate {
  region: string;                      // Region identifier
  baselineTemperature: number;         // [15, 35] °C average summer temperature
  baselineHumidity: number;            // [0, 100] % average summer humidity
  population: number;                  // Millions of people
  vulnerabilityMultiplier: number;     // [0.3, 1.5] Regional adaptation/wealth factor

  // === DEMOGRAPHIC FACTORS ===
  elderlyFraction: number;             // [0, 0.3] % population 65+
  povertyFraction: number;             // [0, 0.5] % below poverty line
  outdoorWorkerFraction: number;       // [0, 0.4] % working outdoors (agriculture, construction)

  // === ADAPTATION CAPACITY ===
  airConditioningAccess: number;       // [0, 1] % with AC access
  coolingCenterAccess: number;         // [0, 1] % with cooling center access
  healthcareCapacity: number;          // [0, 1] Emergency response capability
}

/**
 * Wet Bulb Temperature System
 *
 * Top-level state tracking deadly heat events globally.
 * Frequency and severity increase with global warming (exponential 2030-2070).
 */
export interface WetBulbTemperatureSystem {
  // === REGIONAL CLIMATE DATA ===
  regionalClimates: RegionalClimate[]; // Climate profiles for vulnerable regions

  // === EVENT TRACKING ===
  eventsThisMonth: WetBulbEvent[];     // Current month's heat events
  totalEventsThisYear: number;         // Annual event count
  totalDeathsThisYear: number;         // Annual mortality from heat

  // === HISTORICAL DATA ===
  eventHistory: Array<{
    month: number;
    eventCount: number;
    totalDeaths: number;
    maxWetBulbTemp: number;
  }>;

  // === RISK FACTORS ===
  globalWarmingEffect: number;         // [1.0, 4.0] Multiplier from temperature anomaly
  eventFrequencyMultiplier: number;    // [1.0, 10.0] Exponential increase 2030-2070

  // === CRISIS TRACKING ===
  deadlyHeatCrisisActive: boolean;     // Has heat mortality exceeded thresholds?
  crisisTriggeredAt: number | null;    // Month when crisis began

  // === IMPACT METRICS ===
  cumulativeDeaths: number;            // Total deaths from wet bulb events
  regionsUninhabitable: string[];      // Regions where sustained TW > 32°C
}

/**
 * Regional Wet Bulb Thresholds (Research-Backed)
 *
 * Mortality thresholds from Vecellio et al. (2022) and Raymond et al. (2020)
 */
export interface WetBulbThreshold {
  temperature: number;                 // °C wet bulb temperature
  severity: 'moderate' | 'high' | 'severe' | 'extreme';
  exposureFraction: number;            // [0, 1] Fraction of population exposed
  mortalityRate: number;               // [0, 1] Fraction of exposed who die
  duration: number;                    // Hours to death
  description: string;                 // Human-readable description
}

/**
 * Global High-Risk Regions
 *
 * Regions with highest wet bulb temperature risk (Raymond et al. 2020)
 */
export const HIGH_RISK_REGIONS = [
  'south-asia',           // India, Pakistan, Bangladesh
  'middle-east',          // Persian Gulf, Iraq, Iran
  'sub-saharan-africa',   // Sahel, West Africa
  'southeast-asia',       // Thailand, Vietnam, Indonesia
] as const;

export const MODERATE_RISK_REGIONS = [
  'mediterranean',        // Southern Europe, North Africa
  'southern-us',          // US South, Texas
  'australia',            // Northern Australia
  'central-america',      // Mexico, Central America
] as const;

export const LOW_RISK_REGIONS = [
  'northern-europe',      // Scandinavia, UK
  'canada',               // Canada
  'russia',               // Russia, Siberia
  'southern-cone',        // Argentina, Chile
] as const;

/**
 * Wet Bulb Temperature Calculation Constants
 *
 * From Stull (2011) - Simplified approximation accurate within 0.3°C
 */
export const WET_BULB_CONSTANTS = {
  // Stull formula coefficients
  COEFF_1: 0.151977,
  COEFF_2: 8.313659,
  COEFF_3: 1.676331,
  COEFF_4: 0.00391838,
  COEFF_5: 0.023101,
  COEFF_6: 4.686035,

  // Research thresholds (°C wet bulb)
  MODERATE_THRESHOLD: 28,   // Vulnerable populations at risk
  HIGH_THRESHOLD: 30,       // Outdoor work impossible
  SEVERE_THRESHOLD: 32,     // Outdoor exposure lethal within 12 hours
  EXTREME_THRESHOLD: 35,    // Universal human limit (death in 6 hours)

  // Event frequency parameters (exponential increase)
  BASE_FREQUENCY_2025: 0.002,  // 0.2% monthly chance per region (baseline)
  FREQUENCY_GROWTH_RATE: 0.05, // 5% increase per 0.1°C warming
  MAX_FREQUENCY: 0.30,         // 30% monthly chance (saturates by 2070)
} as const;
