/**
 * Bayesian Mortality System Types
 *
 * Research-backed mortality model using Bayesian risk accumulation.
 * Death is NOT "X% of population dies" (frequentist).
 * Death IS "each person's probability of death increases by X%" (Bayesian).
 *
 * Multi-causal deaths compound: weak from starvation + catches cold = much higher risk.
 *
 * Research: /research/mortality_caps_historical_data_20251027.md
 * - Malnutrition × Disease = 2.63× multiplier (HIGH confidence)
 * - Monthly caps: 2.8% extreme famine, 1.7% nuclear winter
 * - Socioeconomic differentials: 2-3× normal, compress to 1.1-1.5× in extreme crises
 *
 * Date: October 27, 2025
 */

/**
 * Mortality risk factor (Bayesian!)
 * Multiple risks compound: P(death) = 1 - (1-p1)(1-p2)(1-p3)...
 */
export interface MortalityRisk {
  // Risk type (determines vulnerability multipliers)
  type: MortalityRiskType;

  // Base probability increase for "average" person (0.01 = 1% increase)
  baseRisk: number;

  // Attribution for tracking
  proximate: ProximateCause;
  root: RootCause;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';

  // Optional metadata
  description?: string;
  month: number;  // When risk was added

  // Geographic scope (for regional mortality)
  scope?: 'GLOBAL' | 'SEMI-GLOBAL' | 'REGIONAL';
  region?: string;  // If regional
  exposedFraction?: number;  // Fraction of population exposed (0-1)
}

export type MortalityRiskType =
  | 'famine'
  | 'disease'
  | 'disaster'
  | 'war'
  | 'pollution'
  | 'ecosystem';

/**
 * Proximate cause of death (what killed them - medical/physical)
 */
export type ProximateCause =
  | 'war'          // Combat, bombing, war-related violence
  | 'famine'       // Starvation, malnutrition deaths
  | 'disasters'    // Climate disasters (heat, floods, storms, wildfires)
  | 'disease'      // Pandemics, epidemics, infections
  | 'ecosystem'    // Ecosystem collapse (fisheries fail, pollinators die)
  | 'pollution'    // Toxic pollution, PFAS, microplastics
  | 'ai'           // AI-caused deaths (rogue systems, accidents)
  | 'cascade'      // Multi-crisis cascade deaths
  | 'other';       // Miscellaneous

/**
 * Root cause of death (why it happened - systemic driver)
 */
export type RootCause =
  // Environmental drivers
  | 'climate'      // Climate change
  | 'resource'     // Resource depletion (water, food, phosphorus)
  | 'pollution'    // Pollution accumulation
  | 'ecosystem'    // Ecosystem degradation

  // Social drivers
  | 'inequality'   // Economic inequality
  | 'demographic'  // Demographic collapse (aging, low birth rate)
  | 'social'       // Social cohesion breakdown

  // Technology drivers
  | 'alignment'    // AI misalignment
  | 'disruption'   // Economic/labor disruption from AI

  // External shocks
  | 'conflict'     // Wars, geopolitical conflict
  | 'pandemic';    // Natural pandemics

/**
 * Demographic segment with differential vulnerability
 *
 * Research findings (mortality_caps_historical_data_20251027.md):
 * - Normal times: 2-3× mortality difference (wealthy vs poor)
 * - Moderate crises: Differentials persist or widen
 * - Extreme crises (>10% monthly mortality): Compress to 1.1-1.5× as systems collapse
 */
export interface DemographicSegment {
  name: string;  // 'Elite', 'Professional', 'Working', 'Precariat', 'Informal'
  fraction: number;  // Fraction of population (0.05 = 5%)
  baselineDeathRate: number;  // Annual baseline death rate (e.g., 0.008 = 0.8% per year)

  /**
   * Vulnerability multipliers for different risk types
   *
   * Research backing:
   * - Famine: Elite 0.2×, Precariat 2.0× (Irish famine socioeconomic data)
   * - Disease: Malnutrition increases mortality by 2.63× (2020-2025 studies)
   * - Disasters: Elite have better shelter, infrastructure (1.5-2× differential)
   *
   * IMPORTANT: In extreme crises (>10% monthly mortality), these compress to 1.1-1.5×
   */
  vulnerability: {
    famine: number;      // 0.2 for elite, 2.0 for precariat
    disease: number;     // 0.5 for elite, 1.5 for precariat (access to healthcare)
    disaster: number;    // 0.3 for elite, 1.8 for precariat (shelter quality)
    war: number;         // 0.6 for elite, 1.4 for precariat (can flee)
    pollution: number;   // 0.4 for elite, 1.6 for precariat (environmental exposure)
    ecosystem: number;   // 0.5 for elite, 1.5 for precariat (food security)
  };
}

/**
 * Result of resolving monthly mortality
 */
export interface MortalityResult {
  // Total deaths applied
  totalDeaths: number;

  // Deaths by demographic segment
  deaths: DeathSegment[];

  // Remaining population after deaths
  remainingPopulation: number;

  // Was any cap reached?
  cappedByMonthlyLimit: boolean;
  cappedByInstantLimit: boolean;

  // Summary for logging
  summary: {
    avgDeathProbability: number;  // Weighted average across demographics
    compoundedRisks: number;      // Number of risks that compounded
    peakSegmentMortality: {       // Which segment hit hardest
      segment: string;
      mortality: number;
    };
  };
}

/**
 * Deaths in a specific demographic segment
 */
export interface DeathSegment {
  demographic: string;           // Segment name
  count: number;                 // Number of deaths (in billions)
  probability: number;           // Individual death probability (0-1)

  // Multi-causal attribution (which risks contributed)
  causes: CauseAttribution[];
}

/**
 * Attribution of deaths to causes
 */
export interface CauseAttribution {
  proximate: ProximateCause;
  root: RootCause;
  contributionFraction: number;  // Fraction of deaths attributable to this cause (0-1)
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Mortality caps (research-backed limits)
 *
 * Research: mortality_caps_historical_data_20251027.md
 */
export interface MortalityCapConfig {
  // Monthly cap (gradual/sustained crises)
  // Research: Holodomor peaked at 2.8% monthly, Black Death ~2-5% monthly
  monthlyMaxMortalityRate: number;  // Default: 0.028 (2.8%)

  // Instant cap (acute catastrophes)
  // Research: Hiroshima 20% instant, modern nukes 30-50% in blast zone
  instantMaxMortalityRate: number;  // Default: 0.50 (50%)

  // Crisis compression threshold (when differentials compress)
  // Research: At >10% monthly mortality, socioeconomic differentials compress to 1.1-1.5×
  extremeCrisisThreshold: number;   // Default: 0.10 (10%)
  compressionFactor: number;         // How much to compress (0.5 = halfway to equality)
}

/**
 * Complete mortality summary for end-of-simulation reporting
 */
export interface MortalitySummary {
  // Total deaths
  totalDeaths: number;        // Total crisis deaths (billions)
  populationDecline: number;  // Peak - current (billions)
  mortalityRate: number;      // Fraction of peak population lost (0-1)

  // By proximate cause
  byProximate: Record<ProximateCause, number>;

  // By root cause
  byRoot: Record<RootCause, number>;

  // By confidence level
  byConfidence: {
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };

  // By demographic segment
  byDemographic: Array<{
    segment: string;
    totalDeaths: number;
    avgMortalityRate: number;  // Average probability of death across simulation
  }>;

  // By region (if regional tracking enabled)
  byRegion?: Record<string, number>;

  // Temporal tracking
  byMonth: Array<{
    month: number;
    deaths: number;
    avgProbability: number;
    topCauses: Array<{ proximate: ProximateCause; root: RootCause; count: number }>;
  }>;

  // Compounding events (when multiple risks present simultaneously)
  compoundingEvents: Array<{
    month: number;
    simultaneousRisks: number;
    compoundedProbability: number;
    actualMortality: number;
  }>;
}
