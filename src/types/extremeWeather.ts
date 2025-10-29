/**
 * Extreme Weather Events System Types
 *
 * Models storm intensity-frequency relationships under climate change.
 *
 * Research backing:
 * - Knutson et al. (2020, 2023): Tropical cyclone projections - intensity +2-11%, frequency -6 to -34%
 * - Emanuel (2021): Rapid intensification trends - nearly doubled 1982-2009
 * - Mendelsohn et al. (2012): Economic impacts and mortality scaling
 * - NOAA GFDL (2024): Hurricane-warming relationships
 *
 * Key insight: FEWER storms total, but HIGHER proportion of Cat 4-5
 *
 * @see research/climate-mortality-biosphere-multiparadigm-framework_20251028.md (Section 1.2)
 */

/**
 * Single storm event with mortality impact
 *
 * MDF Framework (Magnitude-Duration-Frequency):
 * - M (Magnitude): Deaths per event
 * - D (Duration): Length of exposure
 * - F (Frequency): Events per year
 */
export interface StormEvent {
  category: 1 | 2 | 3 | 4 | 5;
  durationDays: number;
  region: string;
  population: number;                   // Population exposed
  infrastructureVulnerability: number;  // [0, 1] 0=perfect infra, 1=no infra
  baseMortality: number;                // Deaths without multipliers
  totalMortality: number;               // After all multipliers applied
  month: number;                        // Month of occurrence
}

/**
 * Regional storm vulnerability factors
 *
 * Infrastructure mismatch is PRIMARY mortality driver (Section 1.3 of research)
 */
export interface RegionalStormVulnerability {
  region: string;
  coastalPopulation: number;            // Millions exposed to storm surge
  infrastructureCapacity: number;       // [0, 1] seawalls, drainage, early warning
  baselineStormFrequency: number;       // Annual events (1980-2010 baseline)
  vulnerabilityMultiplier: number;      // Poverty, density, building quality
}

/**
 * Complete extreme weather system state
 *
 * Tracks storms globally with climate-driven category distribution shift
 */
export interface ExtremeWeatherSystem {
  annualStormCount: number;                                     // Total storms per year
  categoryDistribution: [number, number, number, number, number];  // Cat 1-5 counts
  regionalVulnerability: RegionalStormVulnerability[];
  stormEvents: StormEvent[];                                    // Events this year
  totalAnnualMortality: number;                                 // Deaths this year
}

/**
 * Storm constants from research
 *
 * Research sources:
 * - Knutson et al. (2023): Category distribution shifts
 * - Emanuel (2021): Intensity scaling
 * - NOAA/EPA (2024): Baseline storm counts
 */
export const STORM_CONSTANTS = {
  // === INTENSITY MULTIPLIERS ===
  // Research: Mendelsohn et al. (2012) - exponential damage/mortality with category
  // Cat 1: baseline (1x), Cat 5: 16× baseline
  INTENSITY_MULTIPLIERS: [1, 2, 4, 8, 16] as const,

  // === FREQUENCY SCALING PER 1°C WARMING ===
  // Research: Knutson et al. (2020) - global projections
  // Key finding: FEWER Cat 1-2, STABLE Cat 3, MORE Cat 4-5
  CAT_1_2_FREQUENCY_CHANGE: -0.05,     // -5% per degree (decreasing)
  CAT_3_FREQUENCY_CHANGE: 0.0,         // 0% per degree (stable)
  CAT_4_5_FREQUENCY_CHANGE: 0.10,      // +10% per degree (increasing)

  // === PRECIPITATION INCREASE ===
  // Research: Knutson et al. (2020) - near-storm rainfall
  // 10-15% increase in precipitation with warming
  PRECIPITATION_SCALING: 0.10,         // +10% per degree

  // === INFRASTRUCTURE MISMATCH ===
  // Research: Section 1.3 - infrastructure gap is primary driver
  // Up to 3× mortality with complete infrastructure absence
  INFRASTRUCTURE_MULTIPLIER_MAX: 3.0,

  // === BASELINE STORM COUNT ===
  // Research: NOAA/EPA (2024) - historical averages
  // Approximately 90 tropical cyclones/year globally (1980-2010)
  BASELINE_ANNUAL_STORMS: 90,

  // === BASELINE CATEGORY DISTRIBUTION (1980-2010) ===
  // Research: NOAA historical data
  // Cat 1: 40%, Cat 2: 25%, Cat 3: 20%, Cat 4: 10%, Cat 5: 5%
  BASELINE_CATEGORY_PROPORTIONS: [0.40, 0.25, 0.20, 0.10, 0.05] as const,

  // === RAPID INTENSIFICATION ===
  // Research: Emanuel (2021) - nearly doubled 1982-2009
  // Probability that a storm rapidly intensifies to next category
  RAPID_INTENSIFICATION_BASE: 0.10,    // 10% baseline
  RAPID_INTENSIFICATION_SCALING: 0.05, // +5% per degree warming

  // === DURATION ===
  // Research: NOAA storm duration averages
  // Most storms: 3-7 days, rare events: 10+ days
  MIN_DURATION_DAYS: 3,
  MAX_DURATION_DAYS: 10,
  AVG_DURATION_DAYS: 5,
} as const;

/**
 * Regional vulnerability baselines
 *
 * Research: World Bank, NOAA, IPCC regional vulnerability assessments
 */
export const REGIONAL_VULNERABILITIES: RegionalStormVulnerability[] = [
  // HIGH RISK: South Asia (Bay of Bengal, Arabian Sea)
  {
    region: 'south-asia',
    coastalPopulation: 250,              // 250M exposed
    infrastructureCapacity: 0.25,        // 25% adequate infrastructure
    baselineStormFrequency: 5,           // ~5 cyclones/year
    vulnerabilityMultiplier: 1.8,        // High poverty, dense coastal cities
  },

  // HIGH RISK: Southeast Asia (South China Sea, Philippines)
  {
    region: 'southeast-asia',
    coastalPopulation: 200,              // 200M exposed
    infrastructureCapacity: 0.30,        // 30% adequate infrastructure
    baselineStormFrequency: 20,          // ~20 typhoons/year (most active)
    vulnerabilityMultiplier: 1.5,        // Moderate poverty, island nations
  },

  // MODERATE RISK: Caribbean/Central America
  {
    region: 'caribbean',
    coastalPopulation: 50,               // 50M exposed
    infrastructureCapacity: 0.40,        // 40% adequate infrastructure
    baselineStormFrequency: 12,          // ~12 hurricanes/year (Atlantic)
    vulnerabilityMultiplier: 1.3,        // Tourism economy, mixed development
  },

  // MODERATE RISK: East Africa (Indian Ocean)
  {
    region: 'east-africa',
    coastalPopulation: 80,               // 80M exposed
    infrastructureCapacity: 0.20,        // 20% adequate infrastructure
    baselineStormFrequency: 8,           // ~8 cyclones/year
    vulnerabilityMultiplier: 1.7,        // Low infrastructure, high poverty
  },

  // LOWER RISK: North America (Gulf Coast, Atlantic)
  {
    region: 'north-america',
    coastalPopulation: 60,               // 60M exposed (Gulf + Atlantic)
    infrastructureCapacity: 0.70,        // 70% adequate infrastructure
    baselineStormFrequency: 6,           // ~6 hurricanes/year (land-falling)
    vulnerabilityMultiplier: 0.8,        // Strong infrastructure, early warning
  },

  // LOWER RISK: East Asia (Japan, Korea)
  {
    region: 'east-asia',
    coastalPopulation: 100,              // 100M exposed
    infrastructureCapacity: 0.80,        // 80% adequate infrastructure
    baselineStormFrequency: 12,          // ~12 typhoons/year
    vulnerabilityMultiplier: 0.6,        // Excellent infrastructure, preparation
  },

  // EMERGING RISK: Pacific Islands
  {
    region: 'pacific-islands',
    coastalPopulation: 10,               // 10M exposed
    infrastructureCapacity: 0.30,        // 30% adequate infrastructure
    baselineStormFrequency: 10,          // ~10 cyclones/year
    vulnerabilityMultiplier: 2.0,        // Extremely vulnerable, limited resources
  },

  // LOWER RISK: Australia
  {
    region: 'australia',
    coastalPopulation: 20,               // 20M exposed
    infrastructureCapacity: 0.75,        // 75% adequate infrastructure
    baselineStormFrequency: 8,           // ~8 cyclones/year
    vulnerabilityMultiplier: 0.7,        // Strong infrastructure, low density
  },

  // EMERGING RISK: Middle East (rare but increasing)
  {
    region: 'middle-east',
    coastalPopulation: 40,               // 40M exposed
    infrastructureCapacity: 0.50,        // 50% adequate infrastructure
    baselineStormFrequency: 2,           // ~2 rare cyclones/year
    vulnerabilityMultiplier: 1.2,        // Infrastructure not adapted to storms
  },
];
